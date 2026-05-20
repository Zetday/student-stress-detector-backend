import { useState, createContext, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  id: {
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
    

  },
  en: {
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
