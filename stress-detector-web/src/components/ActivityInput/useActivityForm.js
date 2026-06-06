import { useState, useEffect } from "react";
import { createActivity, updateActivity, getActivityById, getActivityHistory } from "../../services/activityService";
import { activityNumberFields, createInitialActivityForm, getLocalDateString } from "./activityFormConstants";
import buildActivityPayload, { activityHasInput } from "./buildActivityPayload";

const DRAFT_KEY = "activityDraft";
const AI_POLL_DELAY_MS = 900;
const AI_POLL_MAX_ATTEMPTS = 6;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getWholeNonNegativeValue(value, fallbackValue = "") {
  if (value === null || value === undefined || value === "") {
    return fallbackValue;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallbackValue;
  }

  return String(Math.max(0, Math.trunc(numericValue)));
}

function sanitizeIntegerInputValue(value) {
  return String(value).replace(/\D/g, "");
}

async function waitForPrediction(activityId) {
  if (!activityId) {
    return null;
  }

  for (let attempt = 0; attempt < AI_POLL_MAX_ATTEMPTS; attempt += 1) {
    const historyResult = await getActivityHistory();

    if (!historyResult.error) {
      const matched = historyResult.data.find(
        (item) => String(item.id) === String(activityId) && item.prediction,
      );

      if (matched?.prediction) {
        return matched.prediction;
      }
    }

    if (attempt < AI_POLL_MAX_ATTEMPTS - 1) {
      await wait(AI_POLL_DELAY_MS);
    }
  }

  return null;
}

function useActivityForm(t, initialData = null, activityId = null, options = {}) {
  const [form, setForm] = useState(() => {
    const initialActivityForm = createInitialActivityForm();

    if (initialData) {
      return { ...initialActivityForm, ...initialData };
    }
    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) {
      return initialActivityForm;
    }

    try {
      return {
        ...initialActivityForm,
        ...JSON.parse(draft),
      };
    } catch {
      localStorage.removeItem(DRAFT_KEY);
      return initialActivityForm;
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisPrediction, setAnalysisPrediction] = useState(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);

  useEffect(() => {
    if (activityId && !initialData) {
      const fetchActivity = async () => {
        const result = await getActivityById(activityId);
        if (!result.error && result.data) {
          const act = result.data;
          setForm({
            ...createInitialActivityForm(),
            activityDate: act.activity_date ? getLocalDateString(new Date(act.activity_date)) : "",
            sleepHours: getWholeNonNegativeValue(act.sleep_hours),
            studyHours: getWholeNonNegativeValue(act.study_hours),
            screenTimeHours: getWholeNonNegativeValue(act.screen_time_hours),
            socialMediaHours: getWholeNonNegativeValue(act.social_media_hours),
            physicalActivityMinutes: getWholeNonNegativeValue(act.physical_activity_minutes),
            dailyNote: act.note || "",
            moodScore: getWholeNonNegativeValue(act.mood_score, "0"),
            fatigueLevel: getWholeNonNegativeValue(act.fatigue_level, "0"),
            assignmentLoad: getWholeNonNegativeValue(act.assignment_load, "0"),
            deadlinePressure: getWholeNonNegativeValue(act.deadline_pressure, "0"),
          });
        }
      };
      fetchActivity();
    }
  }, [activityId, initialData]);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue = activityNumberFields.includes(name)
      ? sanitizeIntegerInputValue(value)
      : value;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: nextValue,
    }));
    setError("");
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.activityDate) {
      setError(t.ActivityDateRequiredError);
      return;
    }

    if (!activityHasInput(form)) {
      setError(t.ActivityMinimumInputError);
      return;
    }

    setShowSubmitConfirmation(true);
  }

  async function handleConfirmSubmit() {
    setIsSubmitting(true);
    setError("");
    setMessage("");
    setShowSubmitConfirmation(false);

    try {
      const payload = buildActivityPayload(form, "submitted");
      setAnalysisPrediction(null);
      setShowAnalysis(true);
      setIsAnalysisLoading(true);

      const result = activityId
        ? await updateActivity(activityId, payload)
        : await createActivity(payload);

      if (result.error) {
        setError(result.message);
        setShowAnalysis(false);
        setIsAnalysisLoading(false);
        setIsSubmitting(false);
        return;
      }

      const resultActivityId = result.data?.activity?.id || activityId;
      const prediction = result.data?.prediction || await waitForPrediction(resultActivityId);

      setAnalysisPrediction(prediction);
      setMessage(result.message || t.ActivitySuccessMessage);
      options.onSubmitted?.(payload.activityDate);
      setForm(createInitialActivityForm());
    } catch (error) {
      setError(error.message || t.ActivitySubmitErrorMessage || "Terjadi kesalahan saat mengirim data.");
      setShowAnalysis(false);
    } finally {
      setIsSubmitting(false);
      setIsAnalysisLoading(false);
    }
  }

  async function handleSaveDraft(event) {
    event.preventDefault();
    setError("");

    if (!form.activityDate) {
      setError(t.ActivityDateRequiredError);
      return;
    }

    setIsSubmitting(true);

    const payload = buildActivityPayload(form, "draft");
    const result = activityId
      ? await updateActivity(activityId, payload)
      : await createActivity(payload);

    if (result.error) {
      setError(result.message);
    } else {
      setMessage(t.ActivityDraftSavedMessage);
    }

    setIsSubmitting(false);
  }

  function handleCloseAnalysis() {
    setShowAnalysis(false);
  }

  function handleCancelSubmit() {
    setShowSubmitConfirmation(false);
  }

  return {
    error,
    form,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleSaveDraft,
    handleCloseAnalysis,
    isSubmitting,
    isAnalysisLoading,
    message,
    analysisPrediction,
    showAnalysis,
    showSubmitConfirmation,
  };
}

export default useActivityForm;
