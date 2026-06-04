// Sistem
import { useState } from "react";
import { Link } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";
import { requestPasswordReset } from "../services/authService";

// Asset
import logo from "../assets/img/logo.png";

// Komponent
import ButtonSubmit from "../components/ButtonSubmit";
import InputEmail from "../components/InputEmail";

// layouts
import LeftPanel from "../../layouts/LeftPanel";

function ResetPassword() {
  const [email, onEmailChange] = useInput("");
  const [emailError, setEmailError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useLanguage();

  function handleEmailChange(e) {
    onEmailChange(e);
    setEmailError("");
    setApiError("");
    setApiMessage("");
  }

  async function onSubmitHandler(e) {
    e.preventDefault();
    setEmailError("");
    setApiError("");
    setApiMessage("");

    if (!email.trim()) {
      setEmailError("Email wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const { error, message } = await requestPasswordReset({ email });
    setIsSubmitting(false);

    if (error) {
      setApiError(message || "Gagal mengirim tautan pemulihan.");
      return;
    }

    setApiMessage(message || "Tautan pemulihan telah dikirim ke email Anda.");
  }

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
              {t.HeadingResetPassword}
            </h2>

            <p className="theme-muted text-sm mb-10">
              {t.DeskripsiResetPassword}
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

              {apiError && (
                <p className="text-sm text-red-500">
                  {apiError}
                </p>
              )}

              {apiMessage && (
                <p className="text-sm text-green-500">
                  {apiMessage}
                </p>
              )}

              {/* Submit */}
              <ButtonSubmit type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Mengirim..." : t.ButtonResetPassword}
              </ButtonSubmit>

              {/* Switch */}
              <p className="theme-muted text-sm text-center pt-2">
                <Link
                  to="/login"
                  className="
                    text-[#9BB3FF]
                    hover:text-[var(--text)]
                    transition
                    font-medium
                  "
                >
                  {t.BackToLogin}
                </Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
