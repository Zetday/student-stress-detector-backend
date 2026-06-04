import api from "./api";

export const createActivity = async (payload) => {
  try {
    const response = await api.post("/activities", payload);

    return {
      error: false,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan",
    };
  }
};

export const updateActivity = async (id, payload) => {
  try {
    const response = await api.put(`/activities/${id}`, payload);

    return {
      error: false,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      error: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan",
    };
  }
};

export const getActivityById = async (id) => {
  try {
    const response = await api.get(`/activities/${id}`);

    return {
      error: false,
      data: response.data.data.activity,
    };
  } catch (error) {
    return {
      error: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Gagal memuat aktivitas",
    };
  }
};

function normalizeScore(score) {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value <= 1 ? value * 100 : value);
}

function getScoreLabel(level, score) {
  const normalizedLevel = String(level || "").toLowerCase();

  if (normalizedLevel === "high") {
    return "Tinggi";
  }

  if (normalizedLevel === "moderate" || normalizedLevel === "medium") {
    return "Sedang";
  }

  if (normalizedLevel === "low") {
    return "Rendah";
  }

  if (score >= 70) {
    return "Tinggi";
  }

  if (score >= 40) {
    return "Sedang";
  }

  return "Rendah";
}

export const getActivityHistory = async () => {
  try {
    const [activitiesResponse, predictionsResponse] = await Promise.all([
      api.get("/activities", { params: { limit: 1000, offset: 0 } }),
      api.get("/predictions", { params: { limit: 1000, offset: 0 } }),
    ]);

    const activities = activitiesResponse.data.data?.activities || [];
    const predictions = predictionsResponse.data.data?.predictions || [];
    const predictionsByActivityId = new Map(
      predictions.map((prediction) => [prediction.activity_id, prediction]),
    );

    const history = activities.map((activity) => {
      const prediction = predictionsByActivityId.get(activity.id);
      const stressScore = normalizeScore(prediction?.stress_score);
      const datetime = new Date(activity.created_at || activity.activity_date);
      const isDraft = activity.activity_status === "draft";

      return {
        id: activity.id,
        datetime,
        stressScore,
        scoreLabel: !isDraft && prediction
          ? getScoreLabel(prediction.stress_level, stressScore)
          : "Belum selesai",
        status: isDraft ? "Draft" : "Selesai",
        activity,
        prediction,
      };
    });

    return {
      error: false,
      data: history,
    };
  } catch (error) {
    return {
      error: true,
      message:
        error.response?.data?.message ||
        error.message ||
        "Gagal memuat riwayat aktivitas.",
    };
  }
};
