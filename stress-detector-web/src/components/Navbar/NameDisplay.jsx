import PropTypes from "prop-types";

function NameDisplay({ name, role }) {
  return (
    <div className="text-right">
      <p className="theme-text text-base font-bold leading-none">
        {name}
      </p>
      <p className="theme-muted mt-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
        {role}
      </p>
    </div>
  );
}

NameDisplay.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
};

export default NameDisplay;
