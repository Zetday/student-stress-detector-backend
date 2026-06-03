// Sistem
import PropTypes from "prop-types";
import { useState } from "react";

// Asset
import eye from "../assets/icons/eye.png"
import hidden from "../assets/icons/hidden.png"

function InputPassword({ value, onChange, children, placeholder, autoComplete, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <label className="theme-muted text-xs font-semibold tracking-wide">{children}</label>

      <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="
          w-full mt-1 px-4 py-3 rounded-xl 
          theme-input border
          
          text-sm
          placeholder:text-sm
          
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
      />

      <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="theme-muted absolute right-4 top-1/2 -translate-y-1/2 hover:text-[var(--text)]"
      aria-label="Toggle password visibility">
        <img src={showPassword ? eye : hidden } alt="toggle password" className="w-5 h-5 object-contain"/>
      </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

InputPassword.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  error: PropTypes.string,
};

export default InputPassword;
