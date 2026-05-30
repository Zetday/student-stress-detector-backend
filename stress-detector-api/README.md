# 🧠 CekTenang — Stress Detector API

> RESTful backend service untuk aplikasi **CekTenang**, platform deteksi & manajemen stres mahasiswa berbasis Machine Learning.

---

## 📋 Deskripsi

**Stress Detector API** adalah backend service yang mengelola seluruh alur data aplikasi CekTenang — mulai dari registrasi pengguna, input aktivitas harian, prediksi stres menggunakan model ML, hingga menghasilkan insight & rekomendasi personal berbasis AI. API ini juga menyediakan dashboard agregasi data dan fitur export laporan via email.

---

## 🏗️ Arsitektur & Tech Stack

| Layer | Teknologi |
|---|---|
| **Runtime** | Node.js (ES Module) |
| **Framework** | Express.js v5 |
| **Database** | PostgreSQL 14 |
| **Caching** | Redis 7 |
| **Message Queue** | RabbitMQ (AMQP) |
| **Authentication** | JWT (Access + Refresh Token) |
| **Validation** | Joi |
| **Migration** | node-pg-migrate |
| **API Documentation** | Swagger UI (OpenAPI 3.0) |
| **Email** | Nodemailer (SMTP) |
| **File Upload** | Multer + Sharp |
| **Containerization** | Docker Compose |

---

## 📁 Struktur Proyek

```
stress-detector-api/
├── src/
│   ├── server.js              # Entry point aplikasi
│   ├── server/                # Express app configuration
│   ├── routes/                # Route definitions
│   ├── services/              # Business logic per domain
│   │   ├── users/             # Registrasi & pencarian user
│   │   ├── authentications/   # Login, logout, refresh token, reset password
│   │   ├── profiles/          # Manajemen profil & upload foto
│   │   ├── activities/        # Input & riwayat aktivitas harian
│   │   ├── predictions/       # Hasil prediksi stres dari ML
│   │   ├── weekly-summaries/  # Ringkasan mingguan + generate AI insight
│   │   ├── insights/          # AI-generated insight
│   │   ├── recommendations/   # AI-generated rekomendasi personal
│   │   ├── dashboard/         # Agregasi data untuk dashboard
│   │   ├── exports/           # Export laporan via email (RabbitMQ consumer)
│   │   └── uploads/           # File management (profile pictures)
│   ├── ai/                    # ML service client
│   ├── cache/                 # Redis caching service
│   ├── security/              # JWT token manager
│   ├── middlewares/           # Auth, error handler, validation
│   ├── exceptions/            # Custom error classes
│   └── utils/                 # Utility helpers
├── migrations/                # Database migration files
├── postman/                   # Postman collection untuk testing
├── docker-compose.yml         # PostgreSQL, Redis, RabbitMQ containers
├── swagger.yaml               # OpenAPI 3.0 specification
├── .env.example               # Template environment variables
└── package.json
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** ≥ 18
- **Docker** & **Docker Compose** (untuk PostgreSQL, Redis, RabbitMQ)
- **npm** ≥ 9

### 1. Clone & Install Dependencies

```bash
cd stress-detector-api
npm install
```

### 2. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:

```bash
cp .env.example .env
```

Konfigurasi yang perlu disesuaikan:

| Variable | Keterangan |
|---|---|
| `HOST`, `PORT` | Host & port server (default: `localhost:3000`) |
| `FRONTEND_URL` | URL frontend (default: `http://localhost:5173`) |
| `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT` | Kredensial PostgreSQL |
| `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY` | Secret key untuk JWT |
| `ACCESS_TOKEN_AGE` | Masa berlaku access token (dalam menit) |
| `REDIS_HOST` | Host Redis (default: `localhost`) |
| `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD` | Konfigurasi RabbitMQ |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` | Konfigurasi SMTP email |
| `UPLOAD_DIR` | Direktori upload profile picture |
| `ML_SERVICE_URL` | URL Machine Learning service (default: `http://localhost:8000`) |

### 3. Jalankan Infrastruktur (Docker)

```bash
docker-compose up -d
```

Ini akan menjalankan:
- **PostgreSQL** di port `5432`
- **Redis** di port `6379`
- **RabbitMQ** di port `5672` (management UI di `15672`)

### 4. Jalankan Database Migration

```bash
npm run migrate up
```

### 5. Jalankan Server

**Development** (dengan hot-reload):
```bash
npm run start:dev
```

**Production**:
```bash
npm run start:prod
```

Server akan berjalan di `http://localhost:3000`.

---

## 📖 API Documentation

Setelah server berjalan, dokumentasi Swagger UI tersedia di:

```
http://localhost:3000/api-docs
```

### Endpoint Overview

| Kategori | Endpoint | Method | Deskripsi |
|---|---|---|---|
| **Users** | `/users` | `POST` | Registrasi akun baru |
| | `/users` | `GET` | Cari user berdasarkan email |
| | `/users/:id` | `GET` | Detail user berdasarkan ID |
| **Auth** | `/authentications` | `POST` | Login (mendapat access & refresh token) |
| | `/authentications` | `PUT` | Refresh access token |
| | `/authentications` | `DELETE` | Logout (invalidate refresh token) |
| | `/authentications/forgot-password` | `POST` | Kirim link reset password |
| | `/authentications/reset-password` | `POST` | Reset password via token |
| **Profiles** | `/profiles/me` | `GET` | Lihat profil sendiri |
| | `/profiles/info` | `PUT` | Update nama |
| | `/profiles/password` | `PUT` | Ganti password |
| | `/profiles/picture` | `PUT` | Upload foto profil |
| **Activities** | `/activities` | `POST` | Submit aktivitas harian (auto-trigger ML prediction) |
| | `/activities` | `GET` | Riwayat aktivitas (paginated) |
| | `/activities/:id` | `GET` | Detail aktivitas |
| | `/activities/:id` | `DELETE` | Hapus aktivitas |
| **Predictions** | `/predictions` | `GET` | Riwayat prediksi stres (paginated) |
| | `/predictions/latest` | `GET` | Prediksi stres terbaru |
| **Weekly Summaries** | `/weekly-summaries` | `GET` | Daftar ringkasan mingguan |
| | `/weekly-summaries/latest` | `GET` | Ringkasan mingguan terbaru |
| | `/weekly-summaries/generate` | `POST` | Generate ringkasan + AI insight + rekomendasi |
| **Insights** | `/insights` | `GET` | Daftar insight AI (paginated) |
| | `/insights/latest` | `GET` | Insight terbaru |
| **Recommendations** | `/recommendations` | `GET` | Daftar rekomendasi AI (paginated) |
| | `/recommendations/latest` | `GET` | Rekomendasi terbaru |
| | `/recommendations/:id/read` | `PATCH` | Tandai rekomendasi sudah dibaca |
| **Dashboard** | `/dashboard` | `GET` | Data agregasi dashboard |
| | `/dashboard/trend` | `GET` | Tren skor stres untuk chart |
| **Exports** | `/exports/daily-prediction` | `POST` | Kirim analisis harian via email |
| | `/exports/weekly-summary` | `POST` | Kirim ringkasan mingguan via email |

### Autentikasi

Semua endpoint yang terproteksi memerlukan header:

```
Authorization: Bearer <accessToken>
```

### Alur Penggunaan

```
1. POST /users                        → Registrasi
2. POST /authentications              → Login, dapatkan accessToken
3. POST /activities                   → Input aktivitas harian (otomatis trigger prediksi ML)
4. GET  /predictions/latest           → Lihat level stres hari ini
5. POST /weekly-summaries/generate    → Generate ringkasan mingguan + AI insight
6. GET  /dashboard                    → Lihat agregasi data untuk dashboard
```

---

## 🗃️ Database Schema

Aplikasi menggunakan **9 migration files** yang membuat tabel-tabel berikut:

| Tabel | Deskripsi |
|---|---|
| `users` | Data akun pengguna (fullname, email, password hash) |
| `authentications` | Penyimpanan refresh token |
| `daily_activities` | Input aktivitas harian (tidur, belajar, screen time, dll.) |
| `stress_predictions` | Hasil prediksi ML (level, skor, confidence) |
| `weekly_summaries` | Ringkasan rata-rata metrik per minggu |
| `insights` | Insight yang dihasilkan oleh AI |
| `recommendations` | Rekomendasi personal dari AI |
| + Performance indexes | Indeks untuk optimasi query |
| + Reset password columns | Kolom tambahan untuk fitur reset password |

---

## 🔧 Scripts

| Script | Perintah | Deskripsi |
|---|---|---|
| Development | `npm run start:dev` | Jalankan dengan nodemon (hot-reload) |
| Production | `npm run start:prod` | Jalankan langsung dengan Node.js |
| Migration | `npm run migrate up` | Jalankan database migration |
| Lint | `npm run lint` | Cek kode dengan ESLint |

---

## 🧪 Testing

API testing menggunakan **Postman** + **Newman**:

```bash
npx newman run postman/<collection-file>.json
```

Postman collection tersedia di folder `postman/`.

---

## 🔗 Integrasi dengan Layanan Lain

| Layanan | URL Default | Deskripsi |
|---|---|---|
| **ML Service** | `http://localhost:8000` | FastAPI service untuk prediksi stres, insight, & rekomendasi |
| **Frontend Web** | `http://localhost:5173` | React + Vite web application |

---

## 📄 Lisensi

ISC
