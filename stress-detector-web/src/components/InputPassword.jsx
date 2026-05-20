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
      <label className="text-xs font-semibold tracking-wide text-gray-500">{children}</label>

      <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="
          w-full mt-1 px-4 py-3 rounded-xl 
          bg-gray-200 border border-gray-200 
          
          text-sm text-black
          placeholder:text-sm placeholder:text-gray-400
          
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
      />

      <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
