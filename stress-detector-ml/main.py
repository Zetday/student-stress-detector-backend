import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' # Menyembunyikan warning TensorFlow di terminal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

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

app = FastAPI(title="CekTenang Deep Learning API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model, Scaler, dan Label Encoder
try:
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    with open('label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
        
    model = keras.models.load_model(
        'stress_classifier.keras',
        custom_objects={
            'ResidualBlock': ResidualBlock,
            'FocalLoss': FocalLoss
        }
    )
    # Fitur harus urut persis seperti saat training (13 fitur)
    FEATURE_COLS = [
        'sleep_hours', 'study_hours', 'screen_time_hours', 'social_media_hours',
        'physical_activity_minutes', 'caffeine_intake_mg', 'mood_score',
        'fatigue_level', 'assignment_load', 'deadline_pressure',
        'social_interaction_score', 'financial_worry_score', 'health_condition_score'
    ]
    print("✅ Model, Scaler, dan Encoder berhasil dimuat!")
except Exception as e:
    print(f"❌ Error loading artifacts: {e}")
    model, scaler, label_encoder = None, None, None


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

@app.post("/predict")
def predict_stress(data: UserInput):
    if not all([model, scaler, label_encoder]):
        raise HTTPException(status_code=500, detail="Server model belum siap.")

    try:
        # Konversi input ke dict lalu ke DataFrame
        input_dict = data.model_dump() if hasattr(data, 'model_dump') else data.dict()
        input_df = pd.DataFrame([input_dict])[FEATURE_COLS]
        
        # Standarisasi data (Scaler)
        input_scaled = scaler.transform(input_df).astype(np.float32)
        
        # Prediksi (Model mengembalikan Logits, kita ubah ke Softmax untuk dapet persentase)
        logits = model(input_scaled, training=False)
        probs = tf.nn.softmax(logits).numpy()[0]
        
        # Decode Output (High/Medium/Low)
        pred_idx = int(np.argmax(probs))
        pred_label = label_encoder.inverse_transform([pred_idx])[0]
        confidence = float(probs[pred_idx])

        # Bentuk dict peluang untuk tiap kelas (opsional, bagus untuk animasi di frontend)
        prob_dict = {cls: float(p) for cls, p in zip(label_encoder.classes_, probs)}

        return {
            "status": "success",
            "prediction": {
                "stress_level_label": pred_label,
                "confidence_score": round(confidence * 100, 2), # Diubah jadi persen
                "probabilities": prob_dict
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error saat memproses prediksi: {str(e)}")

@app.get("/")
def root():
    return {"message": "CekTenang Deep Learning API Active. POST to /predict"}