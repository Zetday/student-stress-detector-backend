import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' # Hide TensorFlow warnings in terminal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
import pickle
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
from dotenv import load_dotenv
from groq import Groq
from rag_engine import RAGEngine

# Load environment variables from the script's directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("[Groq] Client initialized successfully!")
    except Exception as e:
        print(f"[Groq] Error initializing client: {e}")
else:
    print("[Groq] WARNING: GROQ_API_KEY not found in environment variables. RAG endpoint will be disabled.")

# Initialize RAG engine (set to None; loaded at startup)
rag_engine = None

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
    label_encoder.classes_ = np.array(['Low', 'Medium', 'High'])
        
    model = keras.models.load_model(
        os.path.join(MODEL_DIR, 'stress_classifier.keras'),
        custom_objects={
            'ResidualBlock': ResidualBlock,
            'FocalLoss': FocalLoss
        }
    )
    # Features must be in this exact order
    FEATURE_COLS = [
        'sleep_hours', 'physical_activity_minutes', 'study_hours', 'screen_time_hours',
        'assignment_load', 'deadline_pressure', 'fatigue_level', 'mood_score',
        'social_media_ratio', 'study_screen_balance', 'academic_pressure_index',
        'recovery_index', 'digital_pressure_index'
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
    physical_activity_minutes: int
    study_hours: float
    screen_time_hours: float
    social_media_hours: float
    assignment_load: int
    deadline_pressure: int
    fatigue_level: int
    mood_score: int

# Recommendation / Insight Shared Schemas
class InputFeatures(BaseModel):
    sleep_hours: Optional[float] = None
    physical_activity_minutes: Optional[float] = None
    study_hours: Optional[float] = None
    screen_time_hours: Optional[float] = None
    assignment_load: Optional[float] = None
    deadline_pressure: Optional[float] = None
    fatigue_level: Optional[float] = None
    mood_score: Optional[float] = None
    social_media_ratio: Optional[float] = None
    study_screen_balance: Optional[float] = None
    academic_pressure_index: Optional[float] = None
    recovery_index: Optional[float] = None
    digital_pressure_index: Optional[float] = None
    financial_worry_score: Optional[float] = None
    health_condition_score: Optional[float] = None
    caffeine_intake_mg: Optional[float] = None

# Recommendation Schemas
class RecommendationRequest(BaseModel):
    user_id: Union[str, int]
    stress_prediction_id: Union[str, int]
    stress_level: str                   # "low" | "medium" | "high"
    input_features: InputFeatures
    period_type: str = "daily"          # "daily" | "weekly"
    weekly_summary_id: Optional[Union[str, int]] = None
    max_recommendations: int = 3

class RecommendationItem(BaseModel):
    user_id: Union[str, int]
    stress_prediction_id: Union[str, int]
    weekly_summary_id: Optional[Union[str, int]]
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
    user_id: Union[str, int]
    stress_prediction_id: Union[str, int]
    stress_level: str                       # "low" | "medium" | "high"
    input_features: InputFeatures
    period_type: str = "daily"             # "daily" | "weekly"
    weekly_summary_id: Optional[Union[str, int]] = None
    weekly_stress_levels: Optional[List[str]] = None  # Required if period_type is "weekly"

class InsightResponse(BaseModel):
    success: bool
    user_id: Union[str, int]
    stress_prediction_id: Union[str, int]
    weekly_summary_id: Optional[Union[str, int]]
    period_type: str
    insight_text: str
    created_at: str

# RAG Schemas
class DailyHistoryItem(BaseModel):
    activity_date: Optional[str] = None
    sleep_hours: Optional[float] = None
    physical_activity_minutes: Optional[float] = None
    study_hours: Optional[float] = None
    screen_time_hours: Optional[float] = None
    social_media_hours: Optional[float] = None
    caffeine_intake_mg: Optional[float] = None
    mood_score: Optional[float] = None
    fatigue_level: Optional[float] = None
    assignment_load: Optional[float] = None
    deadline_pressure: Optional[float] = None
    social_interaction_score: Optional[float] = None
    financial_worry_score: Optional[float] = None
    health_condition_score: Optional[float] = None
    social_media_ratio: Optional[float] = None
    study_screen_balance: Optional[float] = None
    academic_pressure_index: Optional[float] = None
    recovery_index: Optional[float] = None
    digital_pressure_index: Optional[float] = None
    stress_level: Optional[str] = None

class WeeklyRAGRequest(BaseModel):
    user_id: Union[str, int]
    weekly_stress_prediction: str
    history: List[DailyHistoryItem]

class RAGTextItem(BaseModel):
    category: str
    priority_level: str
    title: str
    text: str

class WeeklyRAGResponse(BaseModel):
    success: bool
    user_id: Union[str, int]
    insight: str
    recommendations: List[RAGTextItem]

# ============================================================
# Helper Functions
# ============================================================
def detect_categories(feats: dict, stress_level: str, period_type: str) -> list:
    relevant = []
    sl = stress_level.lower()

    if period_type == "weekly":
        relevant.append("weekly_target")
        return relevant

    if sl == "low":
        return ["maintenance"]

    # 1. Workload
    study_hours = feats.get("study_hours")
    academic_pressure = feats.get("academic_pressure_index")
    if (study_hours is not None and study_hours > 7) or (academic_pressure is not None and academic_pressure >= 0.6) or sl == "high":
        relevant.append("workload")

    # 2. Recovery
    fatigue = feats.get("fatigue_level")
    recovery = feats.get("recovery_index")
    if (fatigue is not None and fatigue >= 7) or (recovery is not None and recovery < 0.5):
        relevant.append("recovery")

    # 3. Mood regulation
    mood = feats.get("mood_score")
    if mood is not None and mood < 5:
        relevant.append("mood_regulation")

    # 4. Sleep
    sleep = feats.get("sleep_hours")
    if sleep is not None and sleep < 7:
        relevant.append("sleep")

    # 5. Physical activity
    phys = feats.get("physical_activity_minutes")
    if phys is not None and phys < 20:
        relevant.append("physical_activity")

    # 6. Digital habit
    screen = feats.get("screen_time_hours")
    digital_pres = feats.get("digital_pressure_index")
    sm_ratio = feats.get("social_media_ratio")
    if (screen is not None and screen > 4) or (digital_pres is not None and digital_pres >= 0.6) or (sm_ratio is not None and sm_ratio > 0.4):
        relevant.append("digital_habit")

    # 7. Financial habit (legacy field)
    fin = feats.get("financial_worry_score")
    if fin is not None and fin >= 6:
        relevant.append("financial_habit")

    # 8. Health (legacy field)
    health = feats.get("health_condition_score")
    if health is not None and health < 4:
        relevant.append("health")

    # 9. Caffeine (legacy field)
    caf = feats.get("caffeine_intake_mg")
    if caf is not None and caf >= 3:
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

    study_hours = feats.get("study_hours")
    academic_pressure = feats.get("academic_pressure_index")
    if study_hours is not None or academic_pressure is not None:
        val_study = study_hours - 7 if study_hours is not None else 0
        val_acad = academic_pressure * 10 - 6 if academic_pressure is not None else 0
        if val_study > 0 or val_acad > 0:
            scores["Academic Pressure"] = max(val_study, val_acad)

    sleep = feats.get("sleep_hours")
    if sleep is not None and sleep < 7:
        scores["Sleep Deficit"] = 7 - sleep

    mood = feats.get("mood_score")
    if mood is not None and mood < 5:
        scores["Low Mood"] = 5 - mood

    fatigue = feats.get("fatigue_level")
    recovery = feats.get("recovery_index")
    if fatigue is not None or recovery is not None:
        val_fatigue = fatigue - 6 if fatigue is not None else 0
        val_rec = (0.5 - recovery) * 10 if recovery is not None else 0
        if val_fatigue > 0 or val_rec > 0:
            scores["High Fatigue"] = max(val_fatigue, val_rec)

    screen = feats.get("screen_time_hours")
    digital_pres = feats.get("digital_pressure_index")
    if screen is not None or digital_pres is not None:
        val_screen = screen - 4 if screen is not None else 0
        val_dig = digital_pres * 10 - 6 if digital_pres is not None else 0
        if val_screen > 0 or val_dig > 0:
            scores["High Screen Time"] = max(val_screen, val_dig)

    phys = feats.get("physical_activity_minutes")
    if phys is not None and phys < 20:
        scores["Low Physical Activity"] = (20 - phys) / 20

    fin = feats.get("financial_worry_score")
    if fin is not None and fin >= 6:
        scores["Financial Worry"] = fin - 5

    health = feats.get("health_condition_score")
    if health is not None and health < 4:
        scores["Health Issue"] = 4 - health

    caf = feats.get("caffeine_intake_mg")
    if caf is not None and caf >= 3:
        scores["High Caffeine Intake"] = caf - 2
    
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
@app.on_event("startup")
def startup_rag():
    """Lazy-load RAG engine at startup. If it fails, other endpoints keep working."""
    global rag_engine
    try:
        rag_engine = RAGEngine()
        print("[RAG] Engine initialized successfully!")
    except Exception as e:
        print(f"[RAG] WARNING: RAG disabled — {e}")

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
        
        # Calculate derived features using the new formulas
        screen_time = input_dict['screen_time_hours']
        social_media = input_dict['social_media_hours']
        
        input_dict['social_media_ratio'] = (social_media / screen_time) if screen_time > 0 else 0.0
        input_dict['study_screen_balance'] = input_dict['study_hours'] / (screen_time + 1.0)
        input_dict['academic_pressure_index'] = (input_dict['assignment_load'] + input_dict['deadline_pressure']) / 2.0
        input_dict['recovery_index'] = (input_dict['sleep_hours'] * input_dict['mood_score']) / (input_dict['fatigue_level'] + 1.0)
        input_dict['digital_pressure_index'] = screen_time + social_media
        
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

@app.post("/weekly-rag", response_model=WeeklyRAGResponse)
def generate_weekly_rag(req: WeeklyRAGRequest):
    import json
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API client is not configured. Please set GROQ_API_KEY.")

    # 1. Structure RAG context
    history_summary = []
    for idx, day in enumerate(req.history):
        day_info = f"Day {idx+1} ({day.activity_date or 'N/A'}): "
        metrics = []
        if day.sleep_hours is not None:
            metrics.append(f"Sleep: {day.sleep_hours} hrs")
        if day.study_hours is not None:
            metrics.append(f"Study: {day.study_hours} hrs")
        if day.screen_time_hours is not None:
            metrics.append(f"Screen Time: {day.screen_time_hours} hrs")
        if day.physical_activity_minutes is not None:
            metrics.append(f"Exercise: {day.physical_activity_minutes} mins")
        if day.mood_score is not None:
            metrics.append(f"Mood: {day.mood_score}/10")
        if day.fatigue_level is not None:
            metrics.append(f"Fatigue: {day.fatigue_level}/10")
        if day.academic_pressure_index is not None:
            metrics.append(f"Academic Pressure Index: {day.academic_pressure_index:.2f}")
        if day.recovery_index is not None:
            metrics.append(f"Recovery Index: {day.recovery_index:.2f}")
        if day.digital_pressure_index is not None:
            metrics.append(f"Digital Pressure Index: {day.digital_pressure_index:.2f}")
        if day.stress_level is not None:
            metrics.append(f"Predicted Stress: {day.stress_level}")
        
        day_info += ", ".join(metrics)
        history_summary.append(day_info)
        
    history_context = "\n".join(history_summary)

# 2. RAG: Retrieve scientific evidence from journal papers
    rag_context = ""
    if rag_engine is not None:
        try:
            history_dicts = [
                day.model_dump() if hasattr(day, 'model_dump') else day.dict()
                for day in req.history
            ]
            query = rag_engine.build_rag_query(history_dicts, req.weekly_stress_prediction)
            rag_context = rag_engine.retrieve_context(query, top_k=3)
            print(f"[RAG] Retrieved context for user {req.user_id} ({len(rag_context)} chars)")
            print(f"[RAG] Query: {query[:200]}...")
        except Exception as e:
            print(f"[RAG] Retrieval failed, proceeding without evidence: {e}")
            rag_context = ""
    else:
        print("[RAG] Engine not available, proceeding without scientific evidence.")


   # 3. System instruction (rules only)
    system_instruction = (
        "Anda adalah asisten AI psikolog dan coach gaya hidup mahasiswa yang empati, profesional, dan solutif.\n"
        "Tugas Anda adalah menganalisis data aktivitas mingguan mahasiswa untuk mendeteksi tren stres, kesehatan, dan produktivitas mereka.\n\n"
        "ATURAN OUTPUT:\n"
        "1. Output WAJIB berupa objek JSON valid dengan struktur persis seperti berikut:\n"
        "{\n"
        "  \"insight\": \"1 kalimat analisis mendalam tentang tren stres dan faktor dominan mahasiswa selama seminggu ini.\",\n"
        "  \"recommendations\": [\n"
        "    {\n"
        "      \"category\": \"kategori rekomendasi (pilih salah satu dari: academic, health, lifestyle, sleep, social, mindfulness)\",\n"
        "      \"priority_level\": \"tingkat prioritas (pilih salah satu dari: low, medium, high, urgent)\",\n"
        "      \"title\": \"Judul Rekomendasi 1 (Singkat, Tindakan)\",\n"
        "      \"text\": \"Tindakan konkret, praktis, dan personal untuk dilakukan.\"\n"
        "    },\n"
        "    {\n"
        "      \"category\": \"kategori rekomendasi (pilih salah satu dari: academic, health, lifestyle, sleep, social, mindfulness)\",\n"
        "      \"priority_level\": \"tingkat prioritas (pilih salah satu dari: low, medium, high, urgent)\",\n"
        "      \"title\": \"Judul Rekomendasi 2 (Singkat, Tindakan)\",\n"
        "      \"text\": \"Tindakan konkret lainnya yang berbeda dari rekomendasi 1.\"\n"
        "    },\n"
        "    {\n"
        "      \"category\": \"kategori rekomendasi (pilih salah satu dari: academic, health, lifestyle, sleep, social, mindfulness)\",\n"
        "      \"priority_level\": \"tingkat prioritas (pilih salah satu dari: low, medium, high, urgent)\",\n"
        "      \"title\": \"Judul Rekomendasi 3 (Singkat, Tindakan)\",\n"
        "      \"text\": \"Tindakan konkret lainnya yang berbeda dari rekomendasi 1 & 2.\"\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "2. Jumlah INSIGHT harus TEPAT 1.\n"
        "3. Jumlah REKOMENDASI harus TEPAT 3.\n"
        "4. Gunakan Bahasa Indonesia yang ramah, memotivasi, dan tidak kaku (gunakan sebutan 'kamu').\n"
        "5. HINDARI REDUNDANSI/PENGULANGAN antara isi insight dengan ketiga rekomendasi. Setiap rekomendasi harus membahas aspek yang berbeda.\n"
        "6. JANGAN berikan penjelasan teks tambahan di luar JSON tersebut."
    )

    # 4. User prompt (student data + scientific evidence + instructions)
    evidence_section = ""
    if rag_context:
        evidence_section = (
            f"\n\nSCIENTIFIC EVIDENCE:\n"
            f"{rag_context}\n\n"
            "INSTRUKSI PENGGUNAAN EVIDENCE:\n"
            "- Gunakan evidence ilmiah yang diberikan sebagai dasar utama insight dan rekomendasi.\n"
            "- Jika evidence kurang lengkap, berikan rekomendasi konservatif yang tidak bertentangan dengan evidence tersebut.\n"
            "- Jangan membuat klaim ilmiah baru yang tidak didukung konteks.\n"
            "- Sebutkan temuan ilmiah secara natural dalam teks (tanpa format sitasi formal)."
        )
        
    user_prompt = (
        f"Analisis data historis seminggu berikut untuk User ID: {req.user_id}.\n\n"
        f"Prediksi Tingkat Stres Mingguan: {req.weekly_stress_prediction}\n\n"
        f"Data Historis Harian:\n"
        f"{history_context}\n\n"
        "Ingat, kembalikan respon dalam format JSON sesuai spesifikasi di instruksi sistem."
    )

    # 3. Call Groq API
    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1000
        )
        
        raw_content = response.choices[0].message.content
        result_json = json.loads(raw_content)
        
        if "insight" not in result_json or "recommendations" not in result_json:
            raise ValueError("Response JSON missing required keys.")
            
        insight_raw = result_json["insight"]
        if isinstance(insight_raw, dict):
            insight_text = insight_raw.get("text", insight_raw.get("title", str(insight_raw)))
        else:
            insight_text = str(insight_raw)
            
        recommendations_data = result_json["recommendations"]
        
        recommendations_items = []
        valid_categories = {"academic", "health", "lifestyle", "sleep", "social", "mindfulness"}
        valid_priorities = {"low", "medium", "high", "urgent"}
        
        for item in recommendations_data[:3]:
            cat = str(item.get("category", "lifestyle")).lower().strip()
            if cat not in valid_categories:
                cat = "lifestyle"
                
            priority = str(item.get("priority_level", "medium")).lower().strip()
            if priority not in valid_priorities:
                priority = "medium"

            recommendations_items.append(RAGTextItem(
                category=cat,
                priority_level=priority,
                title=item.get("title", "Rekomendasi Tindakan"),
                text=item.get("text", "Lakukan aktivitas yang seimbang.")
            ))
            
        while len(recommendations_items) < 3:
            recommendations_items.append(RAGTextItem(
                category="lifestyle",
                priority_level="medium",
                title="Jaga Keseimbangan",
                text="Luangkan waktu 15 menit untuk relaksasi atau aktivitas tanpa layar."
            ))
            
        return WeeklyRAGResponse(
            success=True,
            user_id=req.user_id,
            insight=insight_text,
            recommendations=recommendations_items
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghasilkan RAG AI insight/rekomendasi: {str(e)}"
        )