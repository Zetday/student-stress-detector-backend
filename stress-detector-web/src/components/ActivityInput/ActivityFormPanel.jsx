import PropTypes from "prop-types";
import ActivityInput from "./ActivityInput";
import getInputFields from "./getInputFields";
import getRangeFields from "./getRangeFields";

function getBadgeByValue(value, fieldName, t) {
  const score = Number(value) || 0;

  if (fieldName === "moodScore") {
    if (score <= 3) {
      return {
        label: t.ActivityBadLabel || "Buruk",
        badgeClass: "bg-red-500/20 text-red-400",
      };
    }
    if (score <= 6) {
      return {
        label: t.ActivityBadgeMedium || "Sedang",
        badgeClass: "bg-yellow-500/20 text-yellow-400",
      };
    }
    if (score <= 8) {
      return {
        label: t.ActivityBadgeGood || "Baik",
        badgeClass: "bg-green-500/20 text-green-400",
      };
    }
    return {
      label: t.ActivityBadgeVeryGood || "Sangat Baik",
      badgeClass: "bg-cyan-500/20 text-cyan-400",
    };
  }

  if (fieldName === "fatigueLevel") {
    if (score <= 3) {
      return {
        label: t.ActivityFreshLabel || "Segar",
        badgeClass: "bg-green-500/20 text-green-400",
      };
    }
    if (score <= 6) {
      return {
        label: t.ActivityBadgeMedium || "Sedang",
        badgeClass: "bg-yellow-500/20 text-yellow-400",
      };
    }
    if (score <= 8) {
      return {
        label: t.ActivityBadgeQuiteHigh || "Cukup Tinggi",
        badgeClass: "bg-orange-500/20 text-orange-400",
      };
    }
    return {
      label: t.ActivityExhaustedLabel || "Kelelahan Total",
      badgeClass: "bg-red-500/20 text-red-400",
    };
  }

  if (fieldName === "deadlinePressure") {
    if (score <= 3) {
      return {
        label: t.ActivityRelaxedLabel || "Santai",
        badgeClass: "bg-green-500/20 text-green-400",
      };
    }
    if (score <= 6) {
      return {
        label: t.ActivityBadgeMedium || "Sedang",
        badgeClass: "bg-yellow-500/20 text-yellow-400",
      };
    }
    if (score <= 8) {
      return {
        label: t.ActivityBadgeQuiteHigh || "Cukup Tinggi",
        badgeClass: "bg-orange-500/20 text-orange-400",
      };
    }
    return {
      label: t.ActivityUrgentLabel || "Mendesak",
      badgeClass: "bg-red-500/20 text-red-400",
    };
  }

  if (fieldName === "assignmentLoad") {
    if (score <= 3) {
      return {
        label: t.ActivityBadgeLow || "Rendah",
        badgeClass: "bg-green-500/20 text-green-400",
      };
    }
    if (score <= 6) {
      return {
        label: t.ActivityBadgeMedium || "Sedang",
        badgeClass: "bg-yellow-500/20 text-yellow-400",
      };
    }
    if (score <= 8) {
      return {
        label: t.ActivityBadgeQuiteHigh || "Cukup Tinggi",
        badgeClass: "bg-orange-500/20 text-orange-400",
      };
    }
    return {
      label: t.ActivityExtremeLabel || "Ekstrem",
      badgeClass: "bg-red-500/20 text-red-400",
    };
  }

  if (score <= 3) {
    return {
      label: t.ActivityBadgeLow,
      badgeClass: "bg-green-500/20 text-green-400",
    };
  }

  if (score <= 6) {
    return {
      label: t.ActivityBadgeMedium,
      badgeClass: "bg-yellow-500/20 text-yellow-400",
    };
  }

  if (score <= 8) {
    return {
      label: t.ActivityBadgeQuiteHigh,
      badgeClass: "bg-orange-500/20 text-orange-400",
    };
  }

  return {
    label: t.ActivityBadgeVeryHigh,
    badgeClass: "bg-red-500/20 text-red-400",
  };
}

function ActivityFormPanel({ error, form, isSubmitting, message, onChange, onSaveDraft, t }) {
  const inputFields = getInputFields(t);
  const rangeFields = getRangeFields(t, form);

  const mainFields = inputFields.filter((field) =>
    ["sleepHours", "studyHours", "physicalActivityMinutes"].includes(field.name),
  );
  const digitalFields = inputFields.filter((field) =>
    ["screenTimeHours", "socialMediaHours"].includes(field.name),
  );

  return (
    <section className="theme-card w-full space-y-6 rounded-2xl p-5 md:p-7">
      <div className="space-y-4">
        <div>
          <h2 className="theme-text text-2xl font-semibold">{t.ActivityDailySectionTitle}</h2>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            {t.ActivityDailySectionDescription}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mainFields.map((field) => (
            <div
              key={field.name}
              className="theme-card-muted rounded-2xl border p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="theme-muted text-xs font-semibold uppercase tracking-[0.3em]">
                    {field.label}
                  </p>
                  <p className="theme-subtle mt-2 text-sm">{field.description}</p>
                </div>
                <div className="theme-accent-bg flex h-10 w-10 items-center justify-center rounded-2xl text-lg">
                  {field.icon}
                </div>
              </div>

              <div className="mt-6">
                <ActivityInput
                  field={field}
                  value={form[field.name]}
                  onChange={onChange}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="theme-text text-2xl font-semibold">{t.ActivityDigitalSectionTitle}</h2>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            {t.ActivityDigitalSectionDescription}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {digitalFields.map((field) => (
            <div
              key={field.name}
              className="theme-card-muted rounded-2xl border p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="theme-muted text-xs font-semibold uppercase tracking-[0.3em]">
                    {field.label}
                  </p>
                  <p className="theme-subtle mt-2 text-sm">{field.description}</p>
                </div>
                <div className="theme-accent-bg flex h-10 w-10 items-center justify-center rounded-2xl text-lg">
                  {field.icon}
                </div>
              </div>

              <div className="mt-6">
                <ActivityInput
                  field={field}
                  value={form[field.name]}
                  onChange={onChange}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="theme-card-muted rounded-2xl border p-6 md:p-8">
        <div className="mb-6">
          <p className="theme-muted text-sm font-semibold uppercase tracking-[0.25em]">
            {t.ActivityConditionSectionTitle}
          </p>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            {t.ActivityConditionSectionDescription}
          </p>
        </div>

        <div className="space-y-6">
          {rangeFields.map((field) => {
            const { label, badgeClass } = getBadgeByValue(form[field.name], field.name, t);

            return (
              <div key={field.name} className="theme-card space-y-4 rounded-2xl p-5">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] items-start">
                  <div>
                    <p className="theme-text text-sm font-semibold">{field.label}</p>
                    <p className="theme-muted mt-1 text-xs">{field.description}</p>
                  </div>

                  <div className="flex items-center gap-3 justify-start sm:justify-end">
                    <span className="theme-text text-sm font-bold">{form[field.name]}/10</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {label}
                    </span>
                  </div>
                </div>

                <input
                  name={field.name}
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.name]}
                  onChange={onChange}
                  className="h-1 w-full cursor-pointer accent-blue-300"
                />

                <div className="theme-subtle flex justify-between text-[11px] uppercase tracking-widest">
                  <span>{field.minLabel}</span>
                  <span>{field.maxLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="theme-card-muted rounded-2xl border p-5">
        <div className="mb-4">
          <p className="theme-text text-lg font-semibold">{t.ActivityDailyNoteTitle}</p>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            {t.ActivityDailyNoteDescription}
          </p>
        </div>

        <textarea
          name="dailyNote"
          value={form.dailyNote}
          onChange={onChange}
          placeholder={t.ActivityDailyNotePlaceholder}
          className="theme-input min-h-45 w-full resize-none rounded-2xl border p-4 text-sm outline-none focus:border-blue-300"
          maxLength={1000}
        />

        <div className="theme-subtle mt-3 text-right text-xs">
          {form.dailyNote.length}/1000
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onSaveDraft}
            className="theme-card-muted h-14 flex-1 rounded-2xl border px-5 text-sm font-semibold transition theme-hover sm:flex-none"
          >
            {t.ActivitySaveDraftButton}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-14 flex-1 rounded-2xl bg-linear-to-r from-blue-300 to-blue-500 px-5 text-sm font-bold text-[#0b2846] transition hover:from-blue-200 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {isSubmitting ? t.ActivitySubmittingButton : t.ActivitySubmitButton}
          </button>
        </div>
      </div>
    </section>
  );
}

ActivityFormPanel.propTypes = {
  error: PropTypes.string.isRequired,
  form: PropTypes.objectOf(PropTypes.string).isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSaveDraft: PropTypes.func.isRequired,
  t: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ActivityFormPanel;
