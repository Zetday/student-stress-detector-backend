import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const statusBadge = {
  Selesai: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Draft: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Terlambat: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300",
};

const statusTranslationKey = {
  Selesai: "ActivityHistoryStatusCompleted",
  Draft: "ActivityHistoryStatusDraft",
  Terlambat: "ActivityHistoryStatusLate",
};

const scoreLabelTranslationKey = {
  Tinggi: "HighText",
  Sedang: "MediumText",
  Rendah: "LowText",
  "Belum selesai": "ActivityHistoryScoreIncomplete",
};

const scoreColor = (score) => {
  if (score >= 70) {
    return "text-red-600 dark:text-red-300";
  }
  if (score >= 40) {
    return "text-sky-600 dark:text-sky-300";
  }
  return "text-emerald-600 dark:text-emerald-300";
};

function formatDate(date, locale) {
  return date.toLocaleDateString(locale || "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parsePredictionDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  const stringValue = String(dateValue);

  if (stringValue.includes("T")) {
    const date = new Date(stringValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [year, month, day] = stringValue.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getDisplayDate(item) {
  return parsePredictionDate(item.predictionDate) || item.datetime;
}

function translateValue(value, translationMap, t) {
  const translationKey = translationMap[value];
  return translationKey ? t[translationKey] : value;
}

function ActivityHistoryList({ errorMessage = "", isLoading = false, items, t }) {
  const navigate = useNavigate();

  const handleActionClick = (item) => {
    if (item.status === "Draft") {
      navigate(`/LogActivity/${item.id}`);
    } else {
      navigate(`/dashboard/${item.id}`); // Navigasi ke dashboard dengan ID aktivitas
    }
  };

  return (
    <div className="theme-card overflow-hidden rounded-3xl border text-sm">
      <div className="theme-subtle theme-border hidden grid-cols-[1.3fr_2.4fr_1fr_1fr_0.9fr] gap-4 border-b px-5 py-4 text-left text-xs uppercase tracking-[0.24em] md:grid">
        <div>{t.ActivityHistoryTableDate}</div>
        <div>{t.ActivityHistoryTableStressScore}</div>
        <div>{t.ActivityHistoryTableStatus}</div>
        <div>{t.ActivityHistoryTableAction}</div>
      </div>

      <div className="divide-y divide-(--border)">
        {isLoading && (
          <div className="px-5 py-10 text-center theme-muted">
            {t.ActivityHistoryLoading}
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="px-5 py-10 text-center text-red-400">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && items.length === 0 && (
          <div className="px-5 py-10 text-center theme-muted">
            {t.ActivityHistoryEmpty}
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.3fr_2.4fr_1fr_1fr_0.9fr] md:items-center">
            <div>
              <p className="theme-text text-sm font-semibold">{formatDate(getDisplayDate(item), t.DashboardDateLocale)}</p>
            </div>

            <div>
              {item.status === "Terlambat" ? (
                <p className="theme-muted font-semibold">-</p>
              ) : (
                <>
                  <p className={`font-semibold ${scoreColor(item.stressScore)}`}>{item.stressScore}/100</p>
                  <span className="theme-card-muted mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                    {translateValue(item.scoreLabel, scoreLabelTranslationKey, t)}
                  </span>
                </>
              )}
            </div>

            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[item.status]}`}>
                {translateValue(item.status, statusTranslationKey, t)}
              </span>
            </div>

            <div>
              {item.status === "Terlambat" ? (
                <span className="theme-muted text-sm font-semibold">-</span>
              ) : (
                <button
                  onClick={() => handleActionClick(item)}
                  className="theme-card-muted rounded-full border px-4 py-2 text-sm font-semibold text-blue-400 transition hover:border-blue-400 hover:text-(--text)"
                >
                  {item.status === "Draft" ? t.ActivityHistoryContinueWriting : t.ActivityHistoryViewDetail}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ActivityHistoryList.propTypes = {
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      datetime: PropTypes.instanceOf(Date),
      predictionDate: PropTypes.string,
      stressScore: PropTypes.number,
      scoreLabel: PropTypes.string,
      status: PropTypes.string,
      isVirtualLate: PropTypes.bool,
    })
  ).isRequired,
  t: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ActivityHistoryList;
