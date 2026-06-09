# 🧠 CekTenang — Machine Learning Service

> Unified Machine Learning API untuk platform **CekTenang**, berbasis FastAPI yang menangani deteksi tingkat stres mahasiswa, pembuatan insight mingguan, dan rekomendasi manajemen stres personal.

---

## 📋 Deskripsi

**Machine Learning Service** adalah microservice yang mengekspos model Deep Learning (TensorFlow/Keras) dan Knowledge Base (rules & templates) untuk diintegrasikan dengan Express.js backend. Service ini bertugas menerima data aktivitas harian mahasiswa untuk mengklasifikasikan tingkat stres, serta menghasilkan evaluasi berkala berupa insight teks dan rekomendasi tindakan penanganan stres.

---

## 🏗️ Fitur Utama & Tech Stack

### Fitur
- **Deteksi Tingkat Stres (`/predict`)**: Mengklasifikasikan stres menjadi `Low`, `Medium`, atau `High` lengkap dengan skor tingkat stres dan skor tingkat kepercayaan (confidence score).
- **Rekomendasi Personal (`/recommendations`)**: Menghasilkan daftar anjuran kesehatan mental berdasarkan pola aktivitas (seperti durasi tidur kurang, screen time berlebih, atau beban tugas).
- **Insight Evaluasi (`/insights`)**: Menghasilkan teks ringkasan analisis tentang faktor pemicu stres harian maupun mingguan berdasarkan tren pergerakan skor stres.

### Tech Stack
- **Web Framework**: FastAPI & Uvicorn
- **Deep Learning**: TensorFlow & Keras (Custom Residual Block & Focal Loss)
- **Data Science**: Scikit-Learn (StandardScaler & LabelEncoder), Pandas, NumPy
- **Persistence & Engines**: Joblib (untuk Recommendation Engine & Insight Engine)

---

## 🚀 Cara Menjalankan

### Prasyarat
- Python ≥ 3.10 (Disarankan Python 3.10 - 3.13)
- Pip

### 1. Masuk ke Direktori & Siapkan Virtual Environment
```bash
cd stress-detector-ai
python -m venv .venv
```

### 2. Aktifkan Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **macOS / Linux**:
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Jalankan Service
```bash
uvicorn main:app --host localhost --port 8000
```
Server akan berjalan di `http://localhost:8000`. Dokumentasi interaktif Swagger UI otomatis tersedia di `http://localhost:8000/docs`.

---

## 📖 Ringkasan API Endpoints

### 1. Root & Health Check
- **`GET /`**: Mengecek status ketersediaan service.
- **`GET /health`**: Mendiagnosis status pemuatan model prediksi, knowledge base rekomendasi, dan template insight.

### 2. Prediksi Stres
- **`POST /predict`**:
  Menerima 13 metrik aktivitas mahasiswa (seperti jam tidur, waktu belajar, konsumsi kafein, dll.) dan mengembalikan label klasifikasi stres serta probabilitas detail.
  
  **Payload Contoh**:
  ```json
  {
    "sleep_hours": 6.5,
    "study_hours": 8.0,
    "screen_time_hours": 5.0,
    "social_media_hours": 2.0,
    "physical_activity_minutes": 15,
    "caffeine_intake_mg": 150,
    "mood_score": 4,
    "fatigue_level": 7,
    "assignment_load": 4,
    "deadline_pressure": 8,
    "social_interaction_score": 3,
    "financial_worry_score": 5,
    "health_condition_score": 6
  }
  ```

### 3. Rekomendasi Personal
- **`POST /recommendations`**:
  Menghasilkan daftar rekomendasi berdasarkan kategori kebiasaan yang menyimpang dari batas sehat.
  
  **Payload Contoh**:
  ```json
  {
    "user_id": "rDNYBya4mFtj2SSc",
    "stress_prediction_id": "xkNB8EsqFwTwrWoC",
    "stress_level": "medium",
    "input_features": {
      "sleep_hours": 6.5,
      "study_hours": 8.0,
      "screen_time": 5.0,
      "fatigue_score": 7.0
    },
    "period_type": "daily",
    "max_recommendations": 3
  }
  ```

### 4. Evaluasi & Insight
- **`POST /insights`**:
  Menyusun teks insight harian maupun mingguan berdasarkan tren tingkat stres.
  
  **Payload Contoh**:
  ```json
  {
    "user_id": "rDNYBya4mFtj2SSc",
    "stress_prediction_id": "xkNB8EsqFwTwrWoC",
    "stress_level": "medium",
    "input_features": {
      "sleep_hours": 6.5,
      "study_hours": 8.0,
      "screen_time": 5.0
    },
    "period_type": "weekly",
    "weekly_summary_id": "wS-yWnBWpA70nSPg",
    "weekly_stress_levels": ["low", "medium", "medium", "high", "medium"]
  }
  ```

---

## 🧪 Pengujian Mandiri Lokal
Untuk memastikan model dapat termuat dengan benar di environment lokal Anda tanpa menyalakan server HTTP, Anda dapat menjalankan script testing lokal:
```bash
python test_local.py
```
Script tersebut akan menyimulasikan parsing payload input, memproses scaling fitur, memanggil model TensorFlow, dan mencetak hasil log output prediksi di terminal.
