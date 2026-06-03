import PropTypes from "prop-types";

function InputName({ value, onChange, children, placeholder }) {
 return (
    <div>
      <label className="theme-muted text-xs font-semibold tracking-wide">{children}</label>
      <input
        type="text"
        autoComplete="email"
        placeholder={placeholder}
         className="
          w-full mt-1 px-4 py-3 rounded-xl 
          theme-input border
          
          text-sm
          placeholder:text-sm
          
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

InputName.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  placeholder: PropTypes.string,
};

export default InputName;
