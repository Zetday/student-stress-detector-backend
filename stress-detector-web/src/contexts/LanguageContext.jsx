import { useState, createContext, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  id: {
    // General Translate
    Senin: "Sen",
    Selasa: "Sel",
    Rabu: "Rab",
    Kamis: "Kam",
    Jumat: "Jum",
    Sabtu: "Sab",
    Minggu: "Ming",



    // LeftPanel
    Heading1: "Analisis Tingkat Stres Berbasis AI",
    Heading2: "Untuk Kesehatan Mental Anda.",
    Deskripsi: "Pantau kondisi mental Anda melalui evaluasi aktivitas dan kebiasaan harian menggunakan teknologi Artificial Intelligence secara real-time.",
    Subheading1: "Cek Stress Harian",
    Subdeskripsi1: "AI menganalisis jawaban questionnaire harian untuk memperkirakan tingkat stres secara cepat dan akurat.",
    Subheading2: "Laporan & Insight Personal",
    Subdeskripsi2: "Dapatkan ringkasan kondisi stres serta rekomendasi harian untuk membantu menjaga kesehatan mental Anda",

    // Register Pages
    Create: "Buat Akun",
    Form: "Silakan lengkapi formulir di bawah ini.",
    LabelName: "Nama Lengkap",
    InputName: "Masukan Nama Anda",
    InputEmail: "Masukan Email Anda",
    LabelPassword: "Kata Sandi",
    LabelConfirmPassword: "Konfirmasi Kata Sandi",
    SubmitRegister: "Daftar Sekarang",
    LabelLogin: "Sudah Punya Akun?",
    LinkLogin: "Masuk Di sini",
    Google: "Lanjut Dengan Google",

    // Login Pages
    Login: "Masuk",
    LabelRegister: "Belum punya akun?",
    LinkRegister: "Daftar",
    SubmitLogin: "Masuk Sekarang",
    ResetPassword: "Lupa Password",

    // Reset Password Pages
    HeadingResetPassword: "Lupa Kata Sandi?",
    DeskripsiResetPassword: "Masukkan email yang terdaftar untuk menerima instruksi reset kata sandi.",
    ButtonResetPassword: "Kirim Tautan Pemulih",
    BackToLogin: "Kembali ke Login",

    // New Password Pages
    HeadingNewPassword: "Buat Kata Sandi Baru",
    DeskripsiNewPassword: "Silakan masukkan kata sandi baru untuk akun Anda.",
    ButtonNewPassword: "Perbarui Kata Sandi",
    LabelNewPassword: "Kata Sandi Baru",
    LabelConfirmNewPassword: "Konfirmasi Kata Sandi Baru" ,

    // Sidebar
    ActSdbr: "Catatan Aktivitas",
    CekStresSdbr: "Cek Stres",
    ReqomendationSdbr: "Rekomendasi",
    ProfileSdbr: "Profile Saya",
    LogoutSdbr: "Keluar",

    // Catat Aktivitas Pages
    HeadlineCatatanAktivitas: "Catat aktivitas harian",
    DeskripsiCatatanAktivitas: "Data akurat membantu algoritma kami memberikan prediksi stres yang lebih presisi untuk hari ini.",
    JamTidurTitle: "Jam Tidur",
    JamPlaceholder: "Jam",
    ScreenTimeTitle: "Waktu Penggunaan Gadget",
    JamKerjaTitle: "Jam Kerja",
    AsupanKafeinTitle: "Asupan Kafein",
    KafeinPlaceholder: "Cangkir",
    OlahragaTitle: "Olahraga",
    KelelahanTitle: "Kelelahan",
    SuasanaHatiTitle: "Suasana Hati",
    BtnSimpanPrediksi: "Simpan & Prediksi Stres",
    PreviewPrediksiTitle: "Pratinjau Prediksi",
    StatusHariIniTitle: "Status Hari Ini",
    StressTinggiText: "Stres Tinggi",
    PrediksiDesk: "Prediksi berdasarkan tren aktivitas 24 jam terakhir Anda.",
    FaktorPendorongTitle: "Faktor Pendorong",
    JamKerjaBerlebihText: "Jam kerja berlebih",
    KurangTidurText: "Kurang tidur",
    AsupanKafeinText: "Asupan kafein",
    KurangOlahragaText: "Kurang olahraga",
    TipsCepatTitle: "Tips Cepat",
    TipsCepatDesk: "Kurangi screen time 30 menit sebelum tidur untuk menurunkan skor stres besok.",

    // Dashboard Pages
    DashboardGreeting: "Selamat pagi, ",
    DashboardDateLocale: "id-ID",
    LastJournalSummaryTitle: "Ringkasan Jurnal Terakhir",
    MoodScoreTitle: "Skor Suasana Hati",
    PositiveText: "Positif",
    MediumText: "Sedang",
    HighText: "Tinggi",
    FatigueLevelTitle: "Tingkat Kelelahan",
    SocialMediaTitle: "Media Sosial",
    HourText: "jam",
    StressScoreTitle: "Skor Stres",
    StressTrendTitle: "Tren stres 7 hari",
    AverageText: "Rata-rata",
    AcademicConditionTitle: "Kondisi Akademik",
    StudyTimeTitle: "Waktu Belajar",
    TaskLoadTitle: "Beban Tugas",
    DeadlinePressureTitle: "Tekanan Deadline",
    PhysicalActivityTitle: "Aktivitas Fisik",
    LastNightSleepTitle: "Tidur (Semalam)",
    TaskLoadHighText: "Tinggi",
    MinuteText: "Mnt",
    PersonalAIRecommendationTitle: "Rekomendasi AI Personal",
    RecommendationDesc: "Berdasarkan analisis terbaru, peningkatan stres Anda sebesar 12% berkorelasi kuat dengan tekanan deadline yang mencapai 90% dan beban tugas yang tinggi. Meskipun mood score Anda tetap positif (8.4), level kelelahan mulai meningkat karena kurang tidur (5.5 jam).",
    StudySuggestionTitle: "Saran Belajar",
    StudySuggestionDesc: "Gunakan teknik Pomodoro untuk 3 jam ke depan guna mengurangi beban kognitif tugas.",
    PhysicalSuggestionTitle: "Saran Fisik",
    PhysicalSuggestionDesc: "Lakukan peregangan 10 menit sekarang untuk menurunkan level kortisol akibat screen time.",
    RestSuggestionTitle: "Saran Istirahat",
    RestSuggestionDesc: "Matikan layar 1 jam sebelum tidur pukul 22:00 untuk memulihkan energi esok hari.",
    LatestInsightTitle: "Insight Terbaru",
    TaskAnalysisTitle: "Analisis Beban Tugas",
    TaskAnalysisDesc: "Peningkatan tekanan deadline minggu ini menyebabkan durasi belajar meningkat 2 jam, namun efisiensi menurun karena kelelahan.",
    EmotionalResilienceTitle: "Ketahanan Emosional",
    EmotionalResilienceDesc: "Mood score Anda stabil di 8.4 berkat aktivitas fisik rutin (45 mnt). Ini adalah kunci Anda tetap tenang menghadapi ujian.",

  },


  en: {
     // General Translate
    Senin: "Mon",
    Selasa: "Tue",
    Rabu: "Wed",
    Kamis: "Thu",
    Jumat: "Fri",
    Sabtu: "Sat",
    Minggu: "Sun",


    // LeftPanel
    Heading1: "AI-Based Stress Level Analysis",
    Heading2: "For Your Mental Health.",
    Deskripsi: "Monitor your mental state through real-time evaluation of daily activities and habits using Artificial Intelligence technology.",
    Subheading1: "Daily Stress Check",
    Subdeskripsi1: "AI analyzes daily questionnaire responses to quickly and accurately estimate stress levels.",
    Subheading2: "Personal Reports & Insights",
    Subdeskripsi2: "Get a summary of stress conditions and daily recommendations to help maintain your mental health.",

    //Register Pages
    Create: "Create Account",
    Form: "Please complete the form below.",
    LabelName: "Full Name",
    InputName: "Enter Your Name",
    InputEmail: "Enter Your Email",
    LabelPassword: "Password",
    LabelConfirmPassword: "Confirm Password",
    SubmitRegister: "Register Now",
    LabelLogin: "Already Have an Account?",
    LinkLogin: "Login here",
    Google: "Continue With Google",

    // Login Pages
    Login: "Login",
    LabelRegister: "Don't have an account?",
    LinkRegister: "Register",
    SubmitLogin: "Login Now",
    ResetPassword: "Forgot Password",

    // Reset Password Pages
    HeadingResetPassword: "Forgot Password?",
    DeskripsiResetPassword: "Enter your registered email to receive password reset instructions.",
    ButtonResetPassword: "Send Recovery Link",
    BackToLogin: "Return to Login",

    // New Password Pages
    HeadingNewPassword: "Create New Password",
    DeskripsiNewPassword: "Please enter a new password for your account.",
    ButtonNewPassword: "Update Password",
    LabelNewPassword: "New Password",
    LabelConfirmNewPassword: "Confirm New Password",

    // Sidebar
    ActSdbr: "Activity Log",
    CekStresSdbr: "Stress Check",
    ReqomendationSdbr: "Recommendation",
    ProfileSdbr: "My Profile",
    LogoutSdbr: "Logout",

    // Catat Aktivitas Pages
    HeadlineActivityLog: "Track Your Daily Activities",
    DeskripsiActivityLog: "Accurate data helps our algorithm provide more precise stress predictions for today.",
    SleepHoursTitle: "Sleep Hours",
    HoursPlaceholder: "Hours",
    ScreenTimeTitle: "Screen Time",
    WorkHoursTitle: "Work Hours",
    CaffeineIntakeTitle: "Caffeine Intake",
    CaffeinePlaceholder: "Cups",
    ExerciseTitle: "Exercise",
    FatigueTitle: "Fatigue",
    MoodTitle: "Mood",
    BtnSavePredict: "Save & Predict Stress",
    PredictionPreviewTitle: "Prediction Preview",
    TodayStatusTitle: "Today's Status",
    HighStressText: "High Stress",
    PredictionDesk: "Prediction based on your last 24 hours of activity trends.",
    DrivingFactorsTitle: "Driving Factors",
    ExcessiveWorkHoursText: "Excessive work hours",
    LackOfSleepText: "Lack of sleep",
    CaffeineIntakeText: "Caffeine intake",
    LackOfExerciseText: "Lack of exercise",
    QuickTipsTitle: "Quick Tips",
    QuickTipsDesk: "Reduce screen time by 30 minutes before bed to lower tomorrow's stress score.",

    // Dashboard Page
    DashboardGreeting: "Good Morning, ",
    DashboardDateLocale: "en-US",
    LastJournalSummaryTitle: "Latest Journal Summary",
    MoodScoreTitle: "Mood Score",
    PositiveText: "Positive",
    FatigueLevelTitle: "Fatigue Level",
    MediumText: "Medium",
    SocialMediaTitle: "Social Media",
    HourText: "hours",
    StressScoreTitle: "Stress Score",
    HighText: "High",
    StressTrendTitle: "7-Day Stress Trend",
    AverageText: "Average",
    AcademicConditionTitle: "Academic Condition",
    StudyTimeTitle: "Study Time",
    TaskLoadTitle: "Task Load",
    DeadlinePressureTitle: "Deadline Pressure",
    PhysicalActivityTitle: "Physical Activity",
    LastNightSleepTitle: "Sleep (Last Night)",
    TaskLoadHighText: "High",
    MinuteText: "Min",
    PersonalAIRecommendationTitle: "Personal AI Recommendation",
    RecommendationDesc: "Based on the latest analysis, your stress level has increased by 12%, strongly correlated with deadline pressure reaching 90% and a high task workload. Although your mood score remains positive (8.4), fatigue levels are starting to rise due to insufficient sleep (5.5 hours).",
    StudySuggestionTitle: "Study Recommendation",
    StudySuggestionDesc: "Use the Pomodoro technique for the next 3 hours to reduce cognitive workload.",
    PhysicalSuggestionTitle: "Physical Recommendation",
    PhysicalSuggestionDesc: "Take a 10-minute stretching break now to lower cortisol levels caused by screen time.",
    RestSuggestionTitle: "Rest Recommendation",
    RestSuggestionDesc: "Turn off screens 1 hour before your 10:00 PM bedtime to restore energy for tomorrow.",
    LatestInsightTitle: "Latest Insights",
    TaskAnalysisTitle: "Task Load Analysis",
    TaskAnalysisDesc: "The increase in deadline pressure this week has extended your study duration by 2 hours, but efficiency has decreased due to fatigue.",
    EmotionalResilienceTitle: "Emotional Resilience",
    EmotionalResilienceDesc: "Your mood score remains stable at 8.4 thanks to regular physical activity (45 min). This is a key factor in helping you stay calm during exams.",
  },
};

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'id';
  });

  function toggleLanguage() {
    setLanguage((prev) => {
      const next = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('language', next);
      return next;
    });
  }

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

function useLanguage() {
  return useContext(LanguageContext);
}

// eslint-disable-next-line react-refresh/only-export-components
export { LanguageContext, LanguageProvider, useLanguage };
