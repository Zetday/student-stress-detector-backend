// Sistem
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";

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

  const { t } = useLanguage();
  const navigate = useNavigate();
  const targetEmail = "user@example.com";

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
  }

  function handleConfirmPasswordChange(e) {
    onConfirmPasswordChange(e);
    setConfirmPasswordError("");
  }

  function onSubmitHandler(e) {
    e.preventDefault();

    const validationMessage = validatePassword(password);

    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Password dan konfirmasi password tidak cocok!");
      return;
    }

    navigate("/login");
  }

  return (
    <section
      className="
        min-h-screen
        bg-[#0B0B0B]
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
          bg-[#111111]
          border border-white/5
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
            bg-[#171717]
          "
        >
          <div className="w-full max-w-md">
            <img src={logo} alt="logo cek tenang" className="w-36 mb-10" />

            <h2 className="text-4xl font-bold text-white mb-4">
              {t.HeadingNewPassword}
            </h2>

            <p className="text-lg text-gray-300 mb-14">
              {t.DeskripsiNewPassword}
            </p>

            <div className="flex items-center gap-4 mb-14">
              <span className="text-2xl font-semibold text-blue-500">@</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  Target Email
                </p>
                <p className="mt-1 text-lg text-white">
                  {targetEmail}
                </p>
              </div>
            </div>

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

              <ButtonSubmit type="submit">
                {t.ButtonNewPassword}
              </ButtonSubmit>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewPassword;
