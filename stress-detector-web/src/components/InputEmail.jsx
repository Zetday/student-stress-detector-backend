import PropTypes from "prop-types";

function InputEmail({ value, onChange, children, placeholder, error }) {
  return (
    <div>
      <label className="text-xs font-semibold tracking-wide text-gray-500">{children}</label>
      <input
        type="email"
        autoComplete="email"
        placeholder={placeholder}
         className="
          w-full mt-1 px-4 py-3 rounded-xl 
          bg-gray-200 border border-gray-200 
          
          text-sm text-black
          placeholder:text-sm placeholder:text-gray-400
          
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
      />

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

InputEmail.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  error: PropTypes.string,
};

export default InputEmail;
