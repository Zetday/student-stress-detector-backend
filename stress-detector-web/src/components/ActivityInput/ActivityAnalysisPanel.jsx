import PropTypes from "prop-types";
import ContributorBar from "./ContributorBar";
import getNumericValue from "./getNumericValue";
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

function ActivityAnalysisPanel({ form, t, visible = true }) {
  if (!visible) {
    return null;
  }

  const stressIndex = getStressIndex(form);
  const stressCategory = getStressCategory(stressIndex, t);

  return (
    <aside className="space-y-6">
      <section className={`theme-card rounded-2xl border bg-gradient-to-br ${stressCategory.bgcolor} p-6 md:p-7`}>
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

          <div className="mt-10">
            <h3 className="theme-muted mb-5 text-[11px] font-bold uppercase tracking-widest">
              {t.ActivityMainContributorTitle}
            </h3>
            <div className="space-y-4">
              <ContributorBar
                label={t.DeadlinePressureTitle}
                value={32}
                width={`${Math.max(24, getNumericValue(form.deadlinePressure) * 10)}%`}
              />
              <ContributorBar
                label={t.ActivitySleepQualityContributor}
                value={15}
                width={`${Math.max(24, Math.max(0, 10 - getNumericValue(form.sleepHours)) * 10)}%`}
              />
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

ActivityAnalysisPanel.propTypes = {
  form: PropTypes.objectOf(PropTypes.string).isRequired,
  t: PropTypes.objectOf(PropTypes.string).isRequired,
  visible: PropTypes.bool,
};

export default ActivityAnalysisPanel;
