// Sistem
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";
import { resetPassword } from "../services/authService";

// Asset
import logo from "../assets/img/logo.png";

// Component
import InputPassword from "../components/InputPassword";
import ButtonSubmit from "../components/ButtonSubmit";

// layouts
import LeftPanel from "../../layouts/LeftPanel";

function NewPassword() {
  const [password, onPasswordChange] = useInput("");
  const [confirmPassword, onConfirmPasswordChange] = useInput("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  function validatePassword(value) {
    if (value.length < 8) {
      return "Password minimal harus 8 karakter.";
    }

    if (!/\d/.test(value)) {
      return "Password harus memiliki minimal 1 angka.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(value)) {
      return "Password harus memiliki minimal 1 karakter khusus.";
    }

    return "";
  }

  function handlePasswordChange(e) {
    onPasswordChange(e);
    setPasswordError("");
    setConfirmPasswordError("");
    setApiError("");
    setApiMessage("");
  }

  function handleConfirmPasswordChange(e) {
    onConfirmPasswordChange(e);
    setConfirmPasswordError("");
    setApiError("");
    setApiMessage("");
  }

  async function onSubmitHandler(e) {
    e.preventDefault();
    setApiError("");
    setApiMessage("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!token) {
      setApiError("Tautan pemulihan tidak valid. Silakan minta tautan baru.");
      return;
    }

    const validationMessage = validatePassword(password);

    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Password dan konfirmasi password tidak cocok!");
      return;
    }

    setIsSubmitting(true);
    const { error, message } = await resetPassword({ token, password });
    setIsSubmitting(false);

    if (error) {
      setApiError(message || "Gagal memperbarui kata sandi.");
      return;
    }

    setApiMessage(message || "Kata sandi berhasil diubah.");
    setTimeout(() => navigate("/login"), 1200);
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
      <div
        className="
          w-full max-w-6xl
          min-h-[720px]
          rounded-3xl
          overflow-hidden
          theme-card
          border
          shadow-2xl
          grid grid-cols-1 lg:grid-cols-2
        "
      >
        <div className="hidden md:block">
          <LeftPanel />
        </div>

        <div
          className="
            flex items-center justify-center
            px-8 md:px-16 py-12
            theme-card-muted
          "
        >
          <div className="w-full max-w-md">
            <img src={logo} alt="logo cek tenang" className="w-36 mb-10" />

            <h2 className="theme-text text-4xl font-bold mb-4">
              {t.HeadingNewPassword}
            </h2>

            <p className="theme-muted text-lg mb-14">
              {t.DeskripsiNewPassword}
            </p>

            {!token && (
              <div className="mb-10 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-sm text-red-500">
                  Tautan pemulihan tidak valid atau token tidak ditemukan.
                </p>
                <Link
                  to="/resetpassword"
                  className="mt-2 inline-block text-sm font-medium text-[#9BB3FF] hover:text-[var(--text)]"
                >
                  Minta tautan pemulihan baru
                </Link>
              </div>
            )}

            <form onSubmit={onSubmitHandler} className="space-y-8">
                <InputPassword
                  value={password}
                  autoComplete="new-password"
                  onChange={handlePasswordChange}
                  error={passwordError}
                  placeholder="******">
                  {t.LabelNewPassword} 
                </InputPassword>

                <InputPassword
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={handleConfirmPasswordChange}
                  error={confirmPasswordError}
                  placeholder="******">
                  {t.LabelConfirmNewPassword}
                </InputPassword>

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

              <ButtonSubmit type="submit" disabled={isSubmitting || !token}>
                {isSubmitting ? "Memperbarui..." : t.ButtonNewPassword}
              </ButtonSubmit>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewPassword;
