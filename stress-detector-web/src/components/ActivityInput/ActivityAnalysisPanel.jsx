import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function getStressLabel(stressLevel, t) {
  const normalizedLevel = String(stressLevel || "").toLowerCase();

  if (normalizedLevel === "low") {
    return t.LowText;
  }

  if (normalizedLevel === "medium" || normalizedLevel === "moderate") {
    return t.MediumText;
  }

  if (normalizedLevel === "high") {
    return t.HighText;
  }

  return stressLevel || "-";
}

function getStressCategory(score, stressLevel, t) {
  if (score <= 20) {
    return { 
      label: getStressLabel(stressLevel, t),
      color: "text-emerald-400",
      bgcolor: "to-emerald-950/60",
      tag: "text-emerald-300",
      bgcolorTag: "bg-emerald-500/25" 
    };
  }

  if (score <= 45) {
    return { 
      label: getStressLabel(stressLevel, t),
      color: "text-blue-400",
      bgcolor: "to-blue-950/60",
      tag: "text-blue-300",
      bgcolorTag: "bg-blue-500/25" 
    };
  }

  return { 
    label: getStressLabel(stressLevel, t),
    color: "text-red-400" ,
    bgcolor: "to-red-950/60",
    tag: "text-red-300",
    bgcolorTag: "bg-red-500/25" 
  };
}

function normalizeStressScore(score) {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.round(value <= 1 ? value * 100 : value);
}

function ActivityAnalysisPanel({ isLoading = false, prediction = null, t, visible = true, onClose }) {
  const navigate = useNavigate();

  if (!visible) {
    return null;
  }

  const stressScore = normalizeStressScore(prediction?.stress_score);
  const stressCategory = getStressCategory(stressScore ?? 0, prediction?.stress_level, t);
  const hasPrediction = stressScore !== null;
  const predictionSummary =
    prediction?.summary ||
    prediction?.insight_text ||
    prediction?.recommendation_text ||
    prediction?.description ||
    "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div
        className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-theme-card p-6 shadow-2xl transition duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="theme-card-muted theme-text absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) shadow-sm transition hover:border-blue-400 hover:text-blue-400"
          aria-label={t.CloseButton || "Tutup"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <section className={`theme-card rounded-3xl border-0 bg-linear-to-br ${stressCategory.bgcolor} p-6 md:p-7`}>
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="theme-muted text-[11px] font-bold uppercase tracking-widest">
                {t.ActivityReviewLabel}
              </p>
              <h2 className="theme-text mt-2 text-2xl font-bold">
                {t.ActivityTodayStatusTitle}
              </h2>
            </div>
            <span className={`rounded-full ${stressCategory.bgcolorTag} px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${stressCategory.tag}`}>
              {t.ActivityAnalysisTag}
            </span>
          </div>

          <div className="text-center">
            {isLoading || !hasPrediction ? (
              <div className="py-8">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-300/20 border-t-blue-300" />
                <p className="theme-text mt-5 text-lg font-bold">
                  {t.ActivityAnalysisLoadingTitle}
                </p>
                <p className="theme-muted mx-auto mt-3 max-w-xs text-sm leading-relaxed">
                  {t.ActivityAnalysisLoadingDescription}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-center gap-2">
                  <span className={`text-7xl font-extrabold ${stressCategory.color}`}>
                    {stressScore}
                  </span>
                  <span className="theme-muted mt-4 text-xl font-bold">%</span>
                </div>
                <p className={`mt-2 text-xl font-bold ${stressCategory.color}`}>
                  {stressCategory.label}
                </p>
                {predictionSummary && (
                  <p className="theme-muted mx-auto mt-4 max-w-xs text-sm leading-relaxed">
                    {predictionSummary}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition text-sm font-semibold cursor-pointer"
                  >
                    {t.ActivityCloseButton || "Tutup"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/summary");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-white/90 transition text-sm font-bold shadow-md cursor-pointer"
                  >
                    {t.ActivityGoToSummaryButton || "Ke Halaman Ringkasan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

ActivityAnalysisPanel.propTypes = {
  isLoading: PropTypes.bool,
  prediction: PropTypes.shape({
    stress_level: PropTypes.string,
    stress_score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    summary: PropTypes.string,
    insight_text: PropTypes.string,
    recommendation_text: PropTypes.string,
    description: PropTypes.string,
  }),
  t: PropTypes.objectOf(PropTypes.string).isRequired,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ActivityAnalysisPanel;
