# CekTenang Deep Learning API

FastAPI service untuk prediksi tingkat stres mahasiswa menggunakan **Deep Learning (TensorFlow/Keras)**.

## Architecture

Model menggunakan:
- **Keras Functional API** dengan Custom Layers (ResidualBlock)
- **Custom Loss Function**: Focal Loss untuk mengatasi imbalanced data
- **Input Normalization**: StandardScaler
- **Output**: 3 stress levels (Low, Medium, High)

## Setup

### 1. Download Model Files

Simpan ketiga file model di folder ini:
- `stress_classifier.keras` - Model Deep Learning yang sudah dilatih (format SavedModel)
- `scaler.pkl` - StandardScaler untuk normalisasi input data
- `label_encoder.pkl` - Label encoder untuk konversi output

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Jalankan Server

```bash
python -m uvicorn main:app --reload
```

Server akan berjalan di `http://127.0.0.1:8000`

## API Testing

### 1. Swagger UI (Recommended)

Buka browser: http://127.0.0.1:8000/docs

### 2. cURL Example

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "sleep_hours": 7.5,
    "study_hours": 4.0,
    "screen_time_hours": 6.0,
    "social_media_hours": 2.0,
    "physical_activity_minutes": 30,
    "caffeine_intake_mg": 200,
    "mood_score": 6,
    "fatigue_level": 5,
    "assignment_load": 7,
    "deadline_pressure": 6,
    "social_interaction_score": 7,
    "financial_worry_score": 4,
    "health_condition_score": 7
  }'
```

## Endpoints

### GET /
Health check endpoint

### POST /predict
Memprediksi tingkat stres mahasiswa berdasarkan input data

**Request Body:**
```json
{
  "sleep_hours": float,
  "study_hours": float,
  "screen_time_hours": float,
  "social_media_hours": float,
  "physical_activity_minutes": int,
  "caffeine_intake_mg": int,
  "mood_score": int,
  "fatigue_level": int,
  "assignment_load": int,
  "deadline_pressure": int,
  "social_interaction_score": int,
  "financial_worry_score": int,
  "health_condition_score": int
}
```

**Response (Success):**
```json
{
  "status": "success",
  "prediction": {
    "stress_level_label": "Medium",
    "confidence_score": 85.42,
    "probabilities": {
      "Low": 0.05,
      "Medium": 0.8542,
      "High": 0.0958
    }
  }
}
```

**Response (Error):**
```json
{
  "detail": "Server model belum siap."
}
```

## Custom Components

Model menggunakan komponen custom untuk performa optimal:

### 1. ResidualBlock (Custom Layer)
- Implements residual connections untuk deep neural network
- Mengatasi vanishing gradient problem dengan skip connections

### 2. FocalLoss (Custom Loss Function)
- Focal Loss untuk handle imbalanced classes
- Fokus pada hard negative examples
- Parameter gamma=2.0 untuk mengurangi easy examples

## Production Deployment

Sebelum deploy ke production:
1. Update `allow_origins` di CORS middleware dengan URL domain frontend yang sebenarnya
2. Gunakan environment variables untuk konfigurasi
3. Setup error logging yang proper
4. Use GPU jika tersedia: `tensorflow-gpu` instead of `tensorflow-cpu`

## Technologies Used

- **Framework**: FastAPI + Uvicorn
- **ML Framework**: TensorFlow/Keras 2.21.0
- **Data Processing**: Pandas, NumPy, scikit-learn
- **Model Format**: .keras (SavedModel)
