import { useState, useEffect } from "react";
import { createActivity, updateActivity, getActivityById } from "../../services/activityService";
import { initialActivityForm } from "./activityFormConstants";
import buildActivityPayload from "./buildActivityPayload";

const DRAFT_KEY = "activityDraft";

function useActivityForm(t, initialData = null, activityId = null) {
  const [form, setForm] = useState(() => {
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

  useEffect(() => {
    if (activityId && !initialData) {
      const fetchActivity = async () => {
        const result = await getActivityById(activityId);
        if (!result.error && result.data) {
          const act = result.data;
          setForm({
            ...initialActivityForm,
            activityDate: act.activity_date ? String(act.activity_date).slice(0, 10) : "",
            sleepHours: act.sleep_hours || "",
            studyHours: act.study_hours || "",
            screenTimeHours: act.screen_time_hours || "",
            socialMediaHours: act.social_media_hours || "",
            physicalActivityMinutes: act.physical_activity_minutes || "",
            dailyNote: act.note || "",
            moodScore: act.mood_score?.toString() || "0",
            fatigueLevel: act.fatigue_level?.toString() || "0",
            assignmentLoad: act.assignment_load?.toString() || "0",
            deadlinePressure: act.deadline_pressure?.toString() || "0",
          });
        }
      };
      fetchActivity();
    }
  }, [activityId, initialData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setError("");
    setMessage("");
    setShowAnalysis(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = buildActivityPayload(form, "submitted");
      const result = activityId
        ? await updateActivity(activityId, payload)
        : await createActivity(payload);

      if (result.error) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      setMessage(result.message || t.ActivitySuccessMessage);
      setShowAnalysis(true);
      setForm((currentForm) => ({
        ...initialActivityForm,
        activityDate: currentForm.activityDate,
      }));
    } catch (error) {
      setError(error.message || t.ActivitySubmitErrorMessage || "Terjadi kesalahan saat mengirim data.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft(event) {
    event.preventDefault();

    setIsSubmitting(true);

    const payload = buildActivityPayload(form, "draft");
    const result = activityId
      ? await updateActivity(activityId, payload)
      : await createActivity(payload);

    if (result.error) {
      setError(result.message);
    } else {
      setMessage("Draft berhasil disimpan");
    }

    setIsSubmitting(false);
  }

  function handleCloseAnalysis() {
    setShowAnalysis(false);
  }

  return {
    error,
    form,
    handleChange,
    handleSubmit,
    handleSaveDraft,
    handleCloseAnalysis,
    isSubmitting,
    message,
    showAnalysis,
  };
}

export default useActivityForm;
