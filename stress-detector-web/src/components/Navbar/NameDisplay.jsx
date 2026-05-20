import PropTypes from "prop-types";

function NameDisplay({ name, role }) {
  return (
    <div className="text-right">
      <p className="text-base font-bold leading-none text-white">
        {name}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
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
