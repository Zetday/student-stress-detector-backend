import PropTypes from "prop-types";
import getStressIndex from "./getStressIndex";

function getStressCategory(score, t) {
  if (score <= 20) {
    return { 
      label: t.LowText, 
      color: "text-emerald-400",
      bgcolor: "to-emerald-950/60",
      tag: "text-emerald-300",
      bgcolorTag: "bg-emerald-500/25" 
    };
  }

  if (score <= 45) {
    return { 
      label: t.MediumText, 
      color: "text-blue-400",
      bgcolor: "to-blue-950/60",
      tag: "text-blue-300",
      bgcolorTag: "bg-blue-500/25" 
    };
  }

  return { 
    label: 
    t.HighText, 
    color: "text-red-400" ,
    bgcolor: "to-red-950/60",
    tag: "text-red-300",
    bgcolorTag: "bg-red-500/25" 
  };
}

function ActivityAnalysisPanel({ form, t, visible = true, onClose }) {
  if (!visible) {
    return null;
  }

  const stressIndex = getStressIndex(form);
  const stressCategory = getStressCategory(stressIndex, t);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-theme-card p-6 shadow-2xl transition duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
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
            <div className="flex items-start justify-center gap-2">
              <span className={`text-7xl font-extrabold ${stressCategory.color}`}>
                {stressIndex}
              </span>
              <span className="theme-muted mt-4 text-xl font-bold">%</span>
            </div>
            <p className={`mt-2 text-xl font-bold ${stressCategory.color}`}>
              {stressCategory.label}
            </p>
            <p className="theme-muted mx-auto mt-4 max-w-xs text-sm leading-relaxed">
              {t.ActivityStressSummary}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

ActivityAnalysisPanel.propTypes = {
  form: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  t: PropTypes.objectOf(PropTypes.string).isRequired,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ActivityAnalysisPanel;
