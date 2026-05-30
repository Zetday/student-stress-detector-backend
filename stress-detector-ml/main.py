import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' # Hide TensorFlow warnings in terminal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import pickle
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib

# ============================================================
# Custom TensorFlow Model Layers & Loss Classes
# ============================================================
class ResidualBlock(keras.layers.Layer):
    def __init__(self, units, dropout_rate=0.3, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.dropout_rate = dropout_rate

        self.dense1  = layers.Dense(units)
        self.bn1     = layers.BatchNormalization()
        self.act1    = layers.Activation('relu')
        self.drop1   = layers.Dropout(dropout_rate)

        self.dense2  = layers.Dense(units)
        self.bn2     = layers.BatchNormalization()
        self.act2    = layers.Activation('relu')

        self.shortcut_dense = None
        self.shortcut_bn    = None

    def build(self, input_shape):
        if input_shape[-1] != self.units:
            self.shortcut_dense = layers.Dense(self.units, use_bias=False)
            self.shortcut_bn    = layers.BatchNormalization()
        super().build(input_shape)

    def call(self, x, training=False):
        h = self.dense1(x)
        h = self.bn1(h, training=training)
        h = self.act1(h)
        h = self.drop1(h, training=training)
        h = self.dense2(h)
        h = self.bn2(h, training=training)

        if self.shortcut_dense is not None:
            x = self.shortcut_dense(x)
            x = self.shortcut_bn(x, training=training)

        return self.act2(h + x)

    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units, 'dropout_rate': self.dropout_rate})
        return config

class FocalLoss(keras.losses.Loss):
    def __init__(self, gamma=2.0, alpha=None, num_classes=3, name='focal_loss', **kwargs):
        super().__init__(name=name, **kwargs)
        self.gamma = gamma
        self.num_classes = num_classes
        if alpha is None:
            self.alpha = tf.ones([num_classes], dtype=tf.float32)
        else:
            self.alpha = tf.constant(alpha, dtype=tf.float32)

    def call(self, y_true, y_pred):
        y_true = tf.cast(tf.reshape(y_true, [-1]), tf.int32)
        y_true_oh = tf.one_hot(y_true, self.num_classes)
        probs   = tf.nn.softmax(y_pred, axis=-1)
        probs   = tf.clip_by_value(probs, 1e-7, 1.0 - 1e-7)
        log_p   = tf.math.log(probs)
        focal_w = tf.pow(1.0 - probs, self.gamma)
        alpha_t = tf.reduce_sum(y_true_oh * self.alpha, axis=-1, keepdims=True)
        loss    = -alpha_t * focal_w * y_true_oh * log_p
        return tf.reduce_mean(tf.reduce_sum(loss, axis=-1))

    def get_config(self):
        config = super().get_config()
        config.update({
            'gamma': self.gamma,
            'num_classes': self.num_classes,
            'alpha': self.alpha.numpy().tolist()
        })
        return config


# ============================================================
# FastAPI Application Configuration
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
ARTIFACT_DIR = os.path.join(BASE_DIR, 'artifacts')

app = FastAPI(
    title="CekTenang ML Service",
    description="Unified Machine Learning API for CekTenang (Prediction, Recommendations, Insights)",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Load ML Models and Knowledge Artifacts
# ============================================================
model, scaler, label_encoder = None, None, None
rec_kb, rec_version = None, None
insight_daily_tmpl, insight_weekly_tmpl, insight_version = None, None, None

# 1. Load Prediction Model & Scaler
try:
    with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'rb') as f:
        scaler = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'label_encoder.pkl'), 'rb') as f:
        label_encoder = pickle.load(f)
        
    model = keras.models.load_model(
        os.path.join(MODEL_DIR, 'stress_classifier.keras'),
        custom_objects={
            'ResidualBlock': ResidualBlock,
            'FocalLoss': FocalLoss
        }
    )
    # Features must be in this exact order
    FEATURE_COLS = [
        'sleep_hours', 'study_hours', 'screen_time_hours', 'social_media_hours',
        'physical_activity_minutes', 'caffeine_intake_mg', 'mood_score',
        'fatigue_level', 'assignment_load', 'deadline_pressure',
        'social_interaction_score', 'financial_worry_score', 'health_condition_score'
    ]
    print("[Predictor] Model loaded successfully!")
except Exception as e:
    print(f"[Predictor] Error loading: {e}")

# 2. Load Recommendation KB
try:
    rec_artifact = joblib.load(os.path.join(ARTIFACT_DIR, "recommendation_engine.joblib"))
    rec_kb = rec_artifact["knowledge_base"]
    rec_version = rec_artifact.get("version", "1.0.0")
    print("[Recommendation] Knowledge base loaded successfully!")
except Exception as e:
    print(f"[Recommendation] Error loading KB: {e}")

# 3. Load Insight Templates
try:
    insight_artifact = joblib.load(os.path.join(ARTIFACT_DIR, "insight_engine.joblib"))
    insight_daily_tmpl = insight_artifact["daily_templates"]
    insight_weekly_tmpl = insight_artifact["weekly_templates"]
    insight_version = insight_artifact.get("version", "1.0.0")
    print("[Insight] Templates loaded successfully!")
except Exception as e:
    print(f"[Insight] Error loading KB: {e}")


# ============================================================
# Pydantic Schemas
# ============================================================
# Predict Schemas
class UserInput(BaseModel):
    sleep_hours: float
    study_hours: float
    screen_time_hours: float
    social_media_hours: float
    physical_activity_minutes: int
    caffeine_intake_mg: int
    mood_score: int
    fatigue_level: int
    assignment_load: int
    deadline_pressure: int
    social_interaction_score: int
    financial_worry_score: int
    health_condition_score: int

# Recommendation / Insight Shared Schemas
class InputFeatures(BaseModel):
    sleep_hours: Optional[float] = None
    mood_score: Optional[float] = None
    physical_activity: Optional[float] = None
    screen_time: Optional[float] = None
    study_hours: Optional[float] = None
    fatigue_score: Optional[float] = None
    financial_stress: Optional[float] = None
    health_score: Optional[float] = None
    caffeine_intake: Optional[float] = None

# Recommendation Schemas
class RecommendationRequest(BaseModel):
    user_id: int
    stress_prediction_id: int
    stress_level: str                   # "low" | "medium" | "high"
    input_features: InputFeatures
    period_type: str = "daily"          # "daily" | "weekly"
    weekly_summary_id: Optional[int] = None
    max_recommendations: int = 3

class RecommendationItem(BaseModel):
    user_id: int
    stress_prediction_id: int
    weekly_summary_id: Optional[int]
    period_type: str
    category: str
    title: str
    recommendation_text: str
    priority_level: str
    created_at: str

class RecommendationResponse(BaseModel):
    success: bool
    count: int
    recommendations: List[RecommendationItem]

# Insight Schemas
class InsightRequest(BaseModel):
    user_id: int
    stress_prediction_id: int
    stress_level: str                       # "low" | "medium" | "high"
    input_features: InputFeatures
    period_type: str = "daily"             # "daily" | "weekly"
    weekly_summary_id: Optional[int] = None
    weekly_stress_levels: Optional[List[str]] = None  # Required if period_type is "weekly"

class InsightResponse(BaseModel):
    success: bool
    user_id: int
    stress_prediction_id: int
    weekly_summary_id: Optional[int]
    period_type: str
    insight_text: str
    created_at: str


# ============================================================
# Helper Functions
# ============================================================
def detect_categories(feats: dict, stress_level: str, period_type: str) -> list:
    relevant = []
    sl = stress_level.lower()

    if period_type == "weekly":
        if sl in ("medium", "high"):
            relevant.append("weekly_target")
        return relevant

    if sl == "low":
        return ["maintenance"]

    if feats.get("study_hours", 0) > 7 or sl == "high":
        relevant.append("workload")
    if feats.get("fatigue_score", 0) >= 7:
        relevant.append("recovery")
    if feats.get("mood_score") is not None and feats["mood_score"] < 5:
        relevant.append("mood_regulation")
    if feats.get("sleep_hours") is not None and feats["sleep_hours"] < 7:
        relevant.append("sleep")
    if feats.get("physical_activity") is not None and feats["physical_activity"] < 20:
        relevant.append("physical_activity")
    if feats.get("screen_time", 0) > 4:
        relevant.append("digital_habit")
    if feats.get("financial_stress", 0) >= 6:
        relevant.append("financial_habit")
    if feats.get("health_score") is not None and feats["health_score"] < 4:
        relevant.append("health")
    if feats.get("caffeine_intake", 0) >= 3:
        relevant.append("caffeine")

    if not relevant:
        relevant = ["workload", "mood_regulation"]

    seen, unique = set(), []
    for c in relevant:
        if c not in seen:
            seen.add(c)
            unique.append(c)
    return unique

def detect_factors(feats: dict, sl: str) -> List[str]:
    if sl == "low":
        return ["Stable Routine"]
    scores = {}
    if feats.get("study_hours", 0) > 7:
        scores["Academic Pressure"] = feats["study_hours"] - 7
    if feats.get("sleep_hours") is not None and feats["sleep_hours"] < 7:
        scores["Sleep Deficit"] = 7 - feats["sleep_hours"]
    if feats.get("mood_score") is not None and feats["mood_score"] < 5:
        scores["Low Mood"] = 5 - feats["mood_score"]
    if feats.get("fatigue_score", 0) >= 7:
        scores["High Fatigue"] = feats["fatigue_score"] - 6
    if feats.get("screen_time", 0) > 4:
        scores["High Screen Time"] = feats["screen_time"] - 4
    if feats.get("physical_activity") is not None and feats["physical_activity"] < 20:
        scores["Low Physical Activity"] = (20 - feats["physical_activity"]) / 20
    if feats.get("financial_stress", 0) >= 6:
        scores["Financial Worry"] = feats["financial_stress"] - 5
    if feats.get("health_score") is not None and feats["health_score"] < 4:
        scores["Health Issue"] = 4 - feats["health_score"]
    if feats.get("caffeine_intake", 0) >= 3:
        scores["High Caffeine Intake"] = feats["caffeine_intake"] - 2
    
    detected = sorted(scores, key=scores.get, reverse=True)[:2]
    return detected if detected else (["Academic Pressure"] if sl == "high" else ["Low Mood"])

def render_insight(sl: str, factors: List[str]) -> str:
    if not insight_daily_tmpl:
        return "Tingkat stres Anda terpantau stabil."
    template = insight_daily_tmpl.get(sl, insight_daily_tmpl["medium"])
    if "{factors}" in template:
        return template.format(factors=" + ".join(factors))
    return template

def weekly_trend(levels: List[str]) -> str:
    sm = {"low": 1, "medium": 2, "high": 3}
    s = [sm.get(x.lower(), 2) for x in levels]
    if s.count(3) >= 3:
        return "high_days"
    mid = len(s) // 2
    diff = sum(s[mid:]) / len(s[mid:]) - sum(s[:mid]) / len(s[:mid])
    if diff > 0.3: return "worsening"
    if diff < -0.3: return "improving"
    return "stable"


# ============================================================
# Endpoints
# ============================================================
@app.get("/")
def root():
    return {
        "service": "CekTenang Unified ML Service",
        "status": "running",
        "endpoints": ["/predict", "/recommendations", "/insights", "/health"]
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "services": {
            "prediction": model is not None,
            "recommendation": rec_kb is not None,
            "insight": insight_daily_tmpl is not None
        },
        "versions": {
            "recommendation_kb": rec_version,
            "insight_kb": insight_version
        }
    }

@app.post("/predict")
def predict_stress(data: UserInput):
    if not all([model, scaler, label_encoder]):
        raise HTTPException(status_code=500, detail="Server model prediksi belum siap.")

    try:
        input_dict = data.model_dump() if hasattr(data, 'model_dump') else data.dict()
        input_df = pd.DataFrame([input_dict])[FEATURE_COLS]
        
        # Standardize input features
        input_scaled = scaler.transform(input_df).astype(np.float32)
        
        # Predict logits and calculate softmax probabilities
        logits = model(input_scaled, training=False)
        probs = tf.nn.softmax(logits).numpy()[0]
        
        # Decode predicted label
        pred_idx = int(np.argmax(probs))
        pred_label = label_encoder.inverse_transform([pred_idx])[0]
        confidence = float(probs[pred_idx])

        # Map classes to their probabilities
        prob_dict = {cls: float(p) for cls, p in zip(label_encoder.classes_, probs)}

        return {
            "status": "success",
            "prediction": {
                "stress_level_label": pred_label,
                "confidence_score": round(confidence * 100, 2),
                "probabilities": prob_dict
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal memproses prediksi: {str(e)}")

@app.post("/recommendations", response_model=RecommendationResponse)
def create_recommendations(req: RecommendationRequest):
    if not rec_kb:
        raise HTTPException(status_code=500, detail="Knowledge base rekomendasi belum siap.")

    sl = req.stress_level.lower()
    if sl not in ("low", "medium", "high"):
        raise HTTPException(422, "stress_level harus low / medium / high")

    feats = req.input_features.model_dump() if hasattr(req.input_features, 'model_dump') else req.input_features.dict()
    cats = detect_categories(feats, sl, req.period_type)
    if req.period_type == "daily":
        cats = cats[:req.max_recommendations]

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    pref_map = {"high": "High", "medium": "Medium", "low": "Low"}
    items = []

    for cat in cats:
        entries = rec_kb.get(cat, [])
        if not entries: 
            continue
        pref = [e for e in entries if e["priority"] == pref_map.get(sl, "Medium")]
        e = pref[0] if pref else entries[0]
        items.append(RecommendationItem(
            user_id=req.user_id,
            stress_prediction_id=req.stress_prediction_id,
            weekly_summary_id=req.weekly_summary_id,
            period_type=req.period_type,
            category=cat,
            title=e["title"],
            recommendation_text=e["text"],
            priority_level=e["priority"],
            created_at=now,
        ))

    return RecommendationResponse(success=True, count=len(items), recommendations=items)

@app.post("/insights", response_model=InsightResponse)
def create_insight(req: InsightRequest):
    if not insight_weekly_tmpl or not insight_daily_tmpl:
        raise HTTPException(status_code=500, detail="Knowledge base insight belum siap.")

    sl = req.stress_level.lower()
    if sl not in ("low", "medium", "high"):
        raise HTTPException(422, "stress_level harus low / medium / high")

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    feats = req.input_features.model_dump() if hasattr(req.input_features, 'model_dump') else req.input_features.dict()

    if req.period_type == "weekly":
        if not req.weekly_stress_levels:
            raise HTTPException(422, "weekly_stress_levels wajib diisi untuk period_type weekly")
        trend = weekly_trend(req.weekly_stress_levels)
        text = insight_weekly_tmpl[trend]
    else:
        factors = detect_factors(feats, sl)
        text = render_insight(sl, factors)

    return InsightResponse(
        success=True,
        user_id=req.user_id,
        stress_prediction_id=req.stress_prediction_id,
        weekly_summary_id=req.weekly_summary_id,
        period_type=req.period_type,
        insight_text=text,
        created_at=now,
    )
