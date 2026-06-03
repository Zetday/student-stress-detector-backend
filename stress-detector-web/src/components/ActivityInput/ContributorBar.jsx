import PropTypes from "prop-types";

function ContributorBar({ label, value, width }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold">
        <span className="theme-muted">{label}</span>
        <span className="text-red-400">+{value}%</span>
      </div>
      <div className="theme-card-muted h-1 rounded-full">
        <div className="h-full rounded-full bg-red-400" style={{ width }} />
      </div>
    </div>
  );
}

ContributorBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  width: PropTypes.string.isRequired,
};

export default ContributorBar;
