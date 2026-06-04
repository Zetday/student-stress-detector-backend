import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const statusBadge = {
  Selesai: "bg-emerald-500/15 text-emerald-300",
  Draft: "bg-amber-500/15 text-amber-300",
  Terlambat: "bg-red-500/15 text-red-300",
};

const scoreColor = (score) => {
  if (score >= 70) {
    return "text-red-300";
  }
  if (score >= 40) {
    return "text-sky-300";
  }
  return "text-emerald-300";
};

function formatDate(date) {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function ActivityHistoryList({ errorMessage = "", isLoading = false, items }) {
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
        <div>Tanggal & Waktu</div>
        <div>Skor Stres</div>
        <div>Status</div>
        <div>Aksi</div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {isLoading && (
          <div className="px-5 py-10 text-center theme-muted">
            Memuat riwayat aktivitas...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="px-5 py-10 text-center text-red-400">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && items.length === 0 && (
          <div className="px-5 py-10 text-center theme-muted">
            Belum ada riwayat aktivitas.
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.3fr_2.4fr_1fr_1fr_0.9fr] md:items-center">
            <div>
              <p className="theme-text text-sm font-semibold">{formatDate(item.datetime)}</p>
              <p className="theme-muted text-xs mt-1">{formatTime(item.datetime)} WIB</p>
            </div>

            <div>
              <p className={`font-semibold ${scoreColor(item.stressScore)}`}>{item.stressScore}/100</p>
              <span className="theme-card-muted mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                {item.scoreLabel}
              </span>
            </div>

            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[item.status]}`}>
                {item.status}
              </span>
            </div>

            <div>
              <button
                onClick={() => handleActionClick(item)}
                className="theme-card-muted rounded-full border px-4 py-2 text-sm font-semibold text-blue-400 transition hover:border-blue-400 hover:text-[var(--text)]"
              >
                {item.status === "Draft" ? "Lanjutkan Menulis" : "Lihat Detail"}
              </button>
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
      stressScore: PropTypes.number,
      scoreLabel: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
};

export default ActivityHistoryList;
