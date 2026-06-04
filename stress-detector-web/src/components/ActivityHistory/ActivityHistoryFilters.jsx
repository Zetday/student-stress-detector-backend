import PropTypes from "prop-types";
import calender from "../../assets/icons/calendar.svg"

const statusOptions = [
  { value: "all", label: "Semua" },
  { value: "selesai", label: "Selesai" },
  { value: "draft", label: "Draft" },
  { value: "terlambat", label: "Terlambat" },
];

const dateOptions = [
  { value: "all", label: "Semua data" },
  { value: "7-day", label: "7 hari terakhir" },
  { value: "this-month", label: "Bulan ini" },
  { value: "last-month", label: "Bulan lalu" },
  { value: "3-month", label: "3 Bulan terakhir" },
];

const sortOptions = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "highest-score", label: "Skor tertinggi" },
  { value: "lowest-score", label: "Skor terendah" },
];

function ActivityHistoryFilters({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  sortOption,
  setSortOption,
}) {
  return (
    <div className="space-y-4 text-sm">
      <div className="theme-card inline-flex w-full max-w-[620px] items-center gap-1 rounded-2xl border p-1">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setStatusFilter(option.value)}
            className={`flex-1 rounded-xl px-6 py-4 text-sm font-semibold transition-all duration-200 ${
              statusFilter === option.value
                ? "bg-blue-400 text-slate-900 shadow-sm"
                : "bg-transparent theme-muted hover:text-[var(--text)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 md:ml-auto">
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="theme-input h-11 min-w-(140px) rounded-xl border px-4 text-sm outline-none transition focus:border-blue-400"
          >
            <img src={calender} alt="" />
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="theme-input mt-2 w-30 rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-blue-400"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
      </div>
    </div>
  );
}

ActivityHistoryFilters.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  dateFilter: PropTypes.string.isRequired,
  setDateFilter: PropTypes.func.isRequired,
  sortOption: PropTypes.string.isRequired,
  setSortOption: PropTypes.func.isRequired,
};

export default ActivityHistoryFilters;
