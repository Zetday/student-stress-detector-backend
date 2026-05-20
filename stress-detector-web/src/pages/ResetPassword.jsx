// Sistem
import { Link } from "react-router-dom";
import useInput from "../../hooks/useInput";
import { useLanguage } from "../contexts/LanguageContext";

// Asset
import logo from "../assets/img/logo.png";

// Komponent
import ButtonSubmit from "../components/ButtonSubmit";
import InputEmail from "../components/InputEmail";

// layouts
import LeftPanel from "../../layouts/LeftPanel";

function ResetPassword() {
  const [email, onEmailChange] = useInput("");

  const { t } = useLanguage();

  function onSubmitHandler(e) {
    e.preventDefault();

    console.log({
      email,
    });
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
              {t.HeadingResetPassword}
            </h2>

            <p className="text-sm text-gray-400 mb-10">
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
                onChange={onEmailChange}
                placeholder={t.InputEmail}
                children="Email"
              />

              {/* Submit */}
              <ButtonSubmit type="submit">
                {t.ButtonResetPassword}
              </ButtonSubmit>

              {/* Switch */}
              <p className="text-sm text-center text-gray-500 pt-2">
                <Link
                  to="/login"
                  className="
                    text-[#9BB3FF]
                    hover:text-white
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
