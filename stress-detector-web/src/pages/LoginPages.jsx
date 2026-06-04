// Sistem
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";
import { login, loginWithGoogle} from "../services/authService";
import { useUser } from "../contexts/UserContext";

// Asset
import logo from "../assets/img/logo.png";

// Komponent
import ButtonSubmit from "../components/ButtonSubmit";
import InputEmail from "../components/InputEmail";
import InputPassword from "../components/InputPassword";

// layouts
import LeftPanel from "../../layouts/LeftPanel";

function LoginPage() {
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const googleButtonRef = useRef(null);
  const { t } = useLanguage();
  const { refreshUser } = useUser();
  const navigate = useNavigate();

  function handleEmailChange(e) {
    onEmailChange(e);
    setApiError("");
    setEmailError("");
  }

  function handlePasswordChange(e) {
    onPasswordChange(e);
    setApiError("");
    setPasswordError("");
  }

  async function onSubmitHandler(e) {
    e.preventDefault();
    setApiError("");
    setEmailError("");
    setPasswordError("");

    const { error, data, message } = await login({ email, password });

    if (error) {
      const lowerMessage = String(message || "").toLowerCase();
      if (lowerMessage.includes("password")) {
        setPasswordError("Password salah");
      } else if (lowerMessage.includes("email")) {
        setEmailError("Email tidak ada");
      } else if (lowerMessage.includes("kredensial")) {
        setPasswordError("Email atau password salah.");
      } else {
        setApiError(message);
      }

      return;
    }

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    await refreshUser();
    setShowSuccessPopup(true);
  }
  
  const handleGoogleResponse = useCallback(async (response) => {
    try {
      if (!response?.credential) {
        setGoogleError("Gagal menerima kredensial Google.");
        return;
      }

      setGoogleError("");

      const { error, data, message } = await loginWithGoogle({
        credential: response.credential
      });

      if (error) {
        setGoogleError(message || "Login Google gagal.");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      await refreshUser();

      setShowSuccessPopup(true);
    } catch (error) {
      console.error(error);
      setGoogleError("Login Google gagal.");
    }
  }, [refreshUser]);

useEffect(() => {
  const intervalId = setInterval(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });

    if (googleButtonRef.current) {
      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
        }
      );
    }

    clearInterval(intervalId);
  }, 500);

  return () => clearInterval(intervalId);
}, [handleGoogleResponse]);

  return (
    <section
      className="
        min-h-screen
        theme-auth-shell
        flex justify-center
        px-4 py-10
      "
    >
      {/* Main Card */}
      <div
        className="
          w-full max-w-6xl
          h-auto
          rounded-3xl
          overflow-hidden
          theme-card
          border
          shadow-2xl
          grid grid-cols-1 lg:grid-cols-2
        "
      >
        {/* LEFT */}
        <div className="hidden md:block">
          <LeftPanel />
        </div>
        
        {/* RIGHT */}
        <div
          className="
            flex items-center justify-center
            px-8 md:px-16 py-12
            theme-card-muted">

          <div className="w-full max-w-md">

            {/* Logo */}
            <img src={logo} alt="logo cek tenang" className="w-36 mb-6"/>

            {/* Heading */}
            <h2 className="theme-text text-4xl font-bold mb-2">
              {t.Login}
            </h2>

            <p className="theme-muted text-sm mb-10">
              {t.Form}
            </p>

            {/* Form */}
            <form
              onSubmit={onSubmitHandler}
              className="space-y-6"
            >

              {/* Email */}
             <InputEmail
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                placeholder={t.InputEmail}
                children="Email"
              />

              {/* Password Grid */}
              <div className="grid gap-4 mb-4">
                <InputPassword
                  value={password}
                  autoComplete="current-password"
                  onChange={handlePasswordChange}
                  error={passwordError}
                  placeholder="******"> {t.LabelPassword} 
                </InputPassword>

              <span className="text-red-600 text-right mb-2"><Link to="/resetpassword">{t.ResetPassword}</Link></span>
              </div>

              {apiError && (
                <p className="text-sm text-red-500">
                  {apiError}
                </p>
              )}

              {/* Submit */}
              <ButtonSubmit type="submit">
                {t.SubmitLogin}
              </ButtonSubmit>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="theme-divider flex-1 h-px"></div>

                <span className="theme-subtle text-xs tracking-[0.25em]">
                 {t?.or || "Atau"}
                </span>

                <div className="theme-divider flex-1 h-px"></div>
              </div>

            {/* Google */}
            <div className="flex flex-col gap-2">
              <div ref={googleButtonRef}></div>

              {googleError && (
                <p className="text-sm text-red-500">
                  {googleError}
                </p>
              )}
            </div>

              {/* Switch */}
              <p className="theme-muted text-sm text-center pt-2">
                {t.LabelRegister}{" "}

                <Link
                  to="/register"
                  className="
                    text-[#9BB3FF]
                    hover:text-[var(--text)]
                    transition
                    font-medium
                  "
                >
                  {t.LinkRegister}
                </Link>
              </p>
            </form>

          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div
          onClick={() => navigate("/dashboard")}
          className="
            fixed inset-0
            bg-black/60
            flex items-center justify-center
            z-50
            cursor-pointer
          "
        >
          <div
            className="
              theme-card
              border
              rounded-2xl
              p-8
              max-w-sm
              text-center
              shadow-2xl
              animate-fade-in
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon/Checkmark */}
            <div className="mb-6 flex justify-center">
              <div
                className="
                  w-16 h-16
                  rounded-full
                  bg-green-500/20
                  border border-green-500/50
                  flex items-center justify-center
                "
              >
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3 className="theme-text text-2xl font-bold mb-3">
              Login Berhasil!
            </h3>

            {/* Message */}
            <p className="theme-muted mb-2">
              Selamat datang kembali.
            </p>

            {/* Click instruction */}
            <p className="theme-subtle text-sm mt-6">
              Tap mana saja untuk pindah ke halaman dashboard
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default LoginPage;
