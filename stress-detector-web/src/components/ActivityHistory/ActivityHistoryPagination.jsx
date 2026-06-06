import PropTypes from "prop-types";

function ActivityHistoryPagination({ currentPage, totalPages, from, to, total, onPageChange, t }) {
  return (
    <div className="theme-muted flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
      <p>
        {t.ActivityHistoryShowing} <span className="theme-text">{from}</span> - <span className="theme-text">{to}</span> {t.ActivityHistoryOf} <span className="theme-text">{total}</span> {t.ActivityHistoryActivity}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="theme-card-muted rounded-full border px-3 py-2 text-sm font-semibold transition hover:border-blue-400"
          disabled={currentPage === 1}
        >
          {t.ActivityHistoryPrevious}
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
              currentPage === page
                ? "border-blue-400 bg-blue-500/10 text-blue-600 dark:text-blue-200"
                : "theme-card-muted theme-muted hover:border-blue-400 hover:text-(--text)"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="theme-card-muted rounded-full border px-3 py-2 text-sm font-semibold transition hover:border-blue-400"
          disabled={currentPage === totalPages}
        >
          {t.ActivityHistoryNext}
        </button>
      </div>
    </div>
  );
}

ActivityHistoryPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  t: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ActivityHistoryPagination;
