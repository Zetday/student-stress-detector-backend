// Sistem
import { useState } from "react";
import { Link } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";

// Asset
import logo from "../assets/img/logo.png";
import google from "../assets/img/google-color-svgrepo-com.svg"

// Komponent
import ButtonSubmit from "../components/ButtonSubmit";
import InputEmail from "../components/InputEmail";
import InputPassword from "../components/InputPassword";
import { login } from "../services/authService";

// layouts
import LeftPanel from "../../layouts/LeftPanel";

function LoginPage() {
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const { t } = useLanguage();

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
      if (message.toLowerCase().includes("kredensial")) {
        setPasswordError("Email atau password salah.");
      } else if (message.toLowerCase().includes("email")) {
        setEmailError(message);
      } else {
        setApiError(message);
      }

      return;
    }

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
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
      {/* Main Card */}
      <div
        className="
          w-full max-w-6xl
          h-auto
          rounded-3xl
          overflow-hidden
          bg-[#111111]
          border border-white/5
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
            bg-[#171717]">

          <div className="w-full max-w-md">

            {/* Logo */}
            <img src={logo} alt="logo cek tenang" className="w-36 mb-6"/>

            {/* Heading */}
            <h2 className="text-4xl font-bold text-white mb-2">
              {t.Login}
            </h2>

            <p className="text-sm text-gray-400 mb-10">
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
                <div className="flex-1 h-px bg-white/10"></div>

                <span className="text-xs tracking-[0.25em] text-gray-500">
                 {t?.or || "Atau"}
                </span>

                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Google */}
              <button
                type="button"
                className="
                  w-full
                  h-12
                  rounded-xl
                  border border-white/10
                  bg-[#141414]
                  text-white
                  text-sm
                  font-medium
                  hover:bg-[#1B1B1B]
                  transition

                  flex items-center justify-center gap-3
                "
              >
                <span>{t.Google}</span>
                <img
                  src={google}
                  alt="Google"
                  className="w-5 h-5 object-contain"
                />
              </button>

              {/* Switch */}
              <p className="text-sm text-center text-gray-500 pt-2">
                {t.LabelRegister}{" "}

                <Link
                  to="/register"
                  className="
                    text-[#9BB3FF]
                    hover:text-white
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
    </section>
  );
}

export default LoginPage;
