-- Hapus data lama untuk reset state (menghindari error duplicate key)
DELETE FROM recommendations;
DELETE FROM insights;
DELETE FROM summaries;
DELETE FROM stress_predictions;
DELETE FROM daily_activities;
DELETE FROM authentications;
DELETE FROM users;

-- ==========================================
-- SEED DATA: USERS
-- ==========================================
-- Password user-test-001: yanda123_ (hash bcrypt)
-- Password user-test-002: student123 (hash bcrypt)
INSERT INTO users (
    id,
    fullname,
    email,
    password,
    role,
    created_at,
    updated_at
)
VALUES 
(
    'user-test-001',
    'Yanda Testing',
    'yanda@test.com',
    '$2b$10$DSSL4jR3TbvDAyAIq6Rhr.weKz7L6YvnBrJJwk3NgUIpDQGgrmOly',
    'student',
    NOW(),
    NOW()
),
(
    'user-test-002',
    'Saras Student',
    'student@test.com',
    '$2b$10$EWbpEH/JzxDZx3pUJUqNsePPTAB4R7GDw6NEixVGF/tikYAFsB4b6',
    'student',
    NOW(),
    NOW()
);


-- ==========================================
-- SEED DATA: DAILY ACTIVITIES
-- ==========================================
INSERT INTO daily_activities (
    id,
    user_id,
    activity_date,
    activity_status,
    sleep_hours,
    study_hours,
    screen_time_hours,
    social_media_hours,
    physical_activity_minutes,
    mood_score,
    fatigue_level,
    assignment_load,
    deadline_pressure,
    note,
    created_at,
    updated_at
)
VALUES
-- Kegiatan untuk Yanda Testing (user-test-001)
('act-001','user-test-001','2026-05-25','submitted',7.5,4,6,2,30,8,3,4,3,'Hari cukup baik',NOW(),NOW()),
('act-002','user-test-001','2026-05-26','submitted',6.5,5,7,3,20,7,4,5,4,'Banyak tugas',NOW(),NOW()),
('act-003','user-test-001','2026-05-27','submitted',5.5,6,8,4,15,6,6,7,6,'Mulai stres',NOW(),NOW()),
('act-004','user-test-001','2026-05-28','submitted',5,7,9,5,10,5,7,8,7,'Deadline mendekat',NOW(),NOW()),
('act-005','user-test-001','2026-05-29','submitted',6,6,8,4,20,6,6,7,6,'Masih banyak tugas',NOW(),NOW()),
('act-006','user-test-001','2026-05-30','submitted',7,4,6,3,40,8,3,4,3,'Mulai lebih santai',NOW(),NOW()),
('act-007','user-test-001','2026-05-31','submitted',8,3,5,2,45,9,2,2,2,'Akhir minggu tenang',NOW(),NOW()),

-- Kegiatan untuk Saras Student (user-test-002)
('act-008','user-test-002','2026-05-25','submitted',8.0,3,4,1.5,45,9,2,2,1,'Hari pertama kuliah lancar',NOW(),NOW()),
('act-009','user-test-002','2026-05-26','submitted',7.0,4,5,2.0,30,8,3,3,2,'Tugas kelompok dimulai',NOW(),NOW()),
('act-010','user-test-002','2026-05-27','submitted',6.0,6,6,3.0,15,7,5,4,4,'Belajar untuk kuis',NOW(),NOW()),
('act-011','user-test-002','2026-05-28','submitted',5.0,8,8,4.0,0,5,7,6,6,'Kuis hari ini melelahkan',NOW(),NOW()),
('act-012','user-test-002','2026-05-29','submitted',6.5,5,5,2.5,20,7,4,4,3,'Tugas selesai tepat waktu',NOW(),NOW()),
('act-013','user-test-002','2026-05-30','submitted',8.0,2,4,3.0,60,9,2,1,1,'Hangout dengan teman',NOW(),NOW()),
('act-014','user-test-002','2026-05-31','submitted',8.5,1,3,2.0,50,9,1,1,1,'Istirahat penuh hari Minggu',NOW(),NOW());


-- ==========================================
-- SEED DATA: STRESS PREDICTIONS
-- ==========================================
INSERT INTO stress_predictions (
    id,
    user_id,
    activity_id,
    prediction_date,
    stress_level,
    stress_score,
    confidence_score,
    model_version,
    created_at
)
VALUES
-- Prediksi untuk Yanda Testing (user-test-001)
('pred-001','user-test-001','act-001','2026-05-25','low',25.2,0.95,'v1.0',NOW()),
('pred-002','user-test-001','act-002','2026-05-26','low',35.8,0.94,'v1.0',NOW()),
('pred-003','user-test-001','act-003','2026-05-27','moderate',58.4,0.92,'v1.0',NOW()),
('pred-004','user-test-001','act-004','2026-05-28','high',81.3,0.96,'v1.0',NOW()),
('pred-005','user-test-001','act-005','2026-05-29','moderate',67.9,0.93,'v1.0',NOW()),
('pred-006','user-test-001','act-006','2026-05-30','low',32.4,0.95,'v1.0',NOW()),
('pred-007','user-test-001','act-007','2026-05-31','low',20.1,0.97,'v1.0',NOW()),

-- Prediksi untuk Saras Student (user-test-002)
('pred-008','user-test-002','act-008','2026-05-25','low',18.5,0.97,'v1.0',NOW()),
('pred-009','user-test-002','act-009','2026-05-26','low',28.4,0.96,'v1.0',NOW()),
('pred-010','user-test-002','act-010','2026-05-27','moderate',42.1,0.94,'v1.0',NOW()),
('pred-011','user-test-002','act-011','2026-05-28','moderate',59.7,0.93,'v1.0',NOW()),
('pred-012','user-test-002','act-012','2026-05-29','low',35.2,0.95,'v1.0',NOW()),
('pred-013','user-test-002','act-013','2026-05-30','low',15.0,0.98,'v1.0',NOW()),
('pred-014','user-test-002','act-014','2026-05-31','low',10.2,0.99,'v1.0',NOW());


-- ==========================================
-- SEED DATA: WEEKLY SUMMARIES
-- ==========================================
INSERT INTO summaries (
    id,
    user_id,
    period_start,
    period_end,
    days_count,
    avg_sleep_hours,
    avg_study_hours,
    avg_screen_time_hours,
    avg_social_media_hours,
    avg_physical_activity,
    total_physical_activity_minutes,
    avg_mood_score,
    avg_fatigue_level,
    avg_assignment_load,
    avg_deadline_pressure,
    avg_stress_score,
    dominant_stress_level,
    high_stress_days,
    max_stress_score,
    stress_trend,
    summary_status,
    created_at,
    updated_at
)
VALUES 
(
    'summary-001',
    'user-test-001',
    '2026-05-25',
    '2026-05-31',
    7,
    6.5,
    5.0,
    7.0,
    3.3,
    25.7,
    180,
    7.0,
    4.4,
    5.3,
    4.4,
    45.9,
    'moderate',
    1,
    81.3,
    'decreasing',
    'pending',
    NOW(),
    NOW()
),
(
    'summary-002',
    'user-test-002',
    '2026-05-25',
    '2026-05-31',
    7,
    7.0,
    4.0,
    5.2,
    2.4,
    31.4,
    220,
    7.7,
    3.5,
    3.2,
    2.8,
    29.9,
    'low',
    0,
    59.7,
    'decreasing',
    'pending',
    NOW(),
    NOW()
);


-- ==========================================
-- SEED DATA: INSIGHTS
-- ==========================================
INSERT INTO insights (
    id,
    user_id,
    summary_id,
    insight_text,
    created_at
)
VALUES
(
    'insight-001',
    'user-test-001',
    'summary-001',
    'Tingkat stres Anda memuncak pada pertengahan minggu seiring berkurangnya durasi tidur dan meningkatnya tekanan tugas akademik, namun membaik di akhir pekan.',
    NOW()
),
(
    'insight-002',
    'user-test-002',
    'summary-002',
    'Pola hidup Saras relatif seimbang minggu ini dengan durasi tidur rata-rata 7 jam dan aktivitas olahraga teratur yang menjaga tingkat stres tetap rendah.',
    NOW()
);


-- ==========================================
-- SEED DATA: RECOMMENDATIONS
-- ==========================================
INSERT INTO recommendations (
    id,
    user_id,
    summary_id,
    category,
    priority_level,
    title,
    recommendation_text,
    is_read,
    created_at
)
VALUES
-- Rekomendasi untuk Yanda Testing (user-test-001)
(
    'rec-001',
    'user-test-001',
    'summary-001',
    'sleep',
    'high',
    'Perbaiki Pola Tidur',
    'Usahakan tidur minimal 7 jam setiap malam untuk membantu menurunkan tingkat stres.',
    false,
    NOW()
),
(
    'rec-002',
    'user-test-001',
    'summary-001',
    'stress',
    'medium',
    'Kelola Deadline',
    'Buat daftar prioritas tugas agar tekanan deadline dapat berkurang.',
    false,
    NOW()
),
(
    'rec-003',
    'user-test-001',
    'summary-001',
    'physical_activity',
    'low',
    'Tetap Aktif',
    'Pertahankan aktivitas fisik minimal 30 menit setiap hari.',
    false,
    NOW()
),

-- Rekomendasi untuk Saras Student (user-test-002)
(
    'rec-004',
    'user-test-002',
    'summary-002',
    'study',
    'medium',
    'Jadwal Belajar Fleksibel',
    'Bagus sekali! Pertahankan manajemen waktu belajar 4 jam sehari agar tidak terjadi beban SKS mendadak.',
    false,
    NOW()
),
(
    'rec-005',
    'user-test-002',
    'summary-002',
    'screen_time',
    'low',
    'Batasi Screen Time',
    'Meskipun tingkat stres Anda rendah, cobalah mengurangi screen time di malam hari sebelum tidur.',
    false,
    NOW()
);
