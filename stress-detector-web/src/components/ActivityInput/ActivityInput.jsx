import PropTypes from "prop-types";

function ActivityInput({ field, value, onChange }) {
  if (field.type === "range") {
    return (
      <label className={`block ${field.className || ""}`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="theme-muted text-[11px] font-bold uppercase tracking-widest">
            {field.label}
          </span>
          <span className={`text-sm font-semibold ${field.statusColor}`}>
            {field.status}
          </span>
        </div>

        <input
          name={field.name}
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={onChange}
          className="h-1 w-full cursor-pointer accent-blue-300"
        />

        <div className="theme-subtle mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide">
          <span>{field.minLabel}</span>
          <span>{field.maxLabel}</span>
        </div>
      </label>
    );
  }

  return (
    <label className={`grid gap-2 ${field.className || ""}`}>
      <span className="theme-muted text-[11px] font-bold uppercase tracking-widest">
        {field.label}
      </span>
      <div className="relative">
        <input
          name={field.name}
          type={field.type || "number"}
          min={field.min}
          max={field.max}
          step={field.step || "1"}
          value={value}
          onChange={onChange}
          placeholder={field.placeholder}
          required={field.required ?? true}
          className={`theme-input h-14 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-blue-300 ${field.suffix ? "pr-16" : ""}`}
        />
        {field.suffix && (
          <span className="theme-muted pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold">
            {field.suffix}
          </span>
        )}
      </div>
    </label>
  );
}

ActivityInput.propTypes = {
  field: PropTypes.shape({
    className: PropTypes.string,
    label: PropTypes.string.isRequired,
    max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxLabel: PropTypes.string,
    min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    minLabel: PropTypes.string,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    status: PropTypes.string,
    statusColor: PropTypes.string,
    step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ActivityInput;
