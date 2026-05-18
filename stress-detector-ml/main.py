from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import warnings

warnings.filterwarnings("ignore")

app = FastAPI(
    title="CekTenang ML API",
    description="API untuk memprediksi tingkat stres mahasiswa menggunakan model LightGBM",
    version="1.0.0"
)

# 2. Atur CORS (Cross-Origin Resource Sharing)
# Mengizinkan frontend (Next.js) menembak API ini tanpa terblokir sistem keamanan browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Load Model Machine Learning & Label Encoder
try:
    model = joblib.load('model_cektenang_lgbm.pkl')
    label_encoder = joblib.load('label_encoder.pkl')
    print("Berhasil memuat model LightGBM dan Label Encoder.")
except Exception as e:
    print(f"Error loading model/encoder: {e}")
    model = None
    label_encoder = None

# 4. Definisikan Skema Input Data (Sesuai dengan dataset X_train)
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

# 5. Endpoint Prediksi
@app.post("/predict")
def predict_stress(data: UserInput):
    if model is None or label_encoder is None:
        raise HTTPException(status_code=500, detail="Model atau Encoder gagal dimuat di server.")

    try:
        # Ubah input dari JSON (Pydantic) menjadi format dictionary
        # Pydantic v2 merekomendasikan model_dump(). Jika menggunakan versi lama, gunakan dict()
        input_dict = data.model_dump() if hasattr(data, 'model_dump') else data.dict()
        
        # Ubah dictionary menjadi Pandas DataFrame (karena LightGBM dilatih dengan format DataFrame)
        input_df = pd.DataFrame([input_dict])
        
        # Lakukan prediksi (Outputnya berupa angka kategori: misal 0, 1, atau 2)
        prediction = model.predict(input_df)
        pred_value = int(prediction[0])
        
        # Kembalikan angka kategori ke teks aslinya (misal: "Low", "Medium", "High")
        pred_label = label_encoder.inverse_transform([pred_value])[0]

        # Kembalikan response JSON ke frontend Next.js
        return {
            "status": "success",
            "prediction": {
                "stress_level_value": pred_value,
                "stress_level_label": pred_label
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Terjadi kesalahan saat memproses data: {str(e)}")

# 6. Endpoint Health Check 
@app.get("/")
def read_root():
    return {
        "status": "active",
        "message": "Welcome to CekTenang API! Gunakan endpoint POST /predict untuk memulai prediksi."
    }
