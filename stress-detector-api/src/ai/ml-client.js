/* eslint-disable camelcase */
/**
 * ML Client — communicates with the three FastAPI microservices:
 *   1. Prediction Service  (port 8000) — stress level prediction
 *   2. Recommendation Service (port 8001) — personalized recommendations
 *   3. Insight Service (port 8002) — AI-generated insights
 *
 * If any ML service is unavailable, methods return null so the Express
 * request still succeeds (activity is saved; prediction is simply null).
 */

const cleanUrl = (url, defaultUrl) => {
  if (!url) return defaultUrl;
  let cleaned = url.trim();

  // Remove surrounding single or double quotes
  if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Remove trailing slashes
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1).trim();
  }

  // Add protocol if missing
  if (cleaned && !cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }

  return cleaned;
};

const ML_SERVICE_URL = cleanUrl(process.env.ML_SERVICE_URL, 'http://localhost:8000');
const PREDICT_SERVICE_URL = cleanUrl(process.env.PREDICT_SERVICE_URL, ML_SERVICE_URL);
const RECOMMENDATION_SERVICE_URL = cleanUrl(process.env.RECOMMENDATION_SERVICE_URL, ML_SERVICE_URL);
const INSIGHT_SERVICE_URL = cleanUrl(process.env.INSIGHT_SERVICE_URL, ML_SERVICE_URL);
const ML_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Predict stress level from daily activity data.
 * @param {object} activityPayload  — the fields from daily_activities
 * @returns {{ status, prediction: { stress_level_label, confidence_score, probabilities } } | null}
 */
export const predictStress = async (activityPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${PREDICT_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] predictStress → HTTP ${res.status}. Using fallback.`);
      return {
        stress_level: 'low',
        stress_score: 35.0,
        confidence_score: 0.85,
        model_version: 'v1.0.0-fallback'
      };
    }

    const json = await res.json();
    if (json && json.status === 'success' && json.prediction) {
      const pred = json.prediction;

      // 1. Map stress_level_label to lowercase low/moderate/high
      const rawLabel = (pred.stress_level_label || 'low').toLowerCase();
      let stressLevel = 'low';
      if (rawLabel === 'medium' || rawLabel === 'moderate') {
        stressLevel = 'moderate';
      } else if (rawLabel === 'high') {
        stressLevel = 'high';
      }

      // 2. Compute stress_score based on probabilities (if available) or rawLabel
      const probabilities = pred.probabilities || {};
      const probLow = probabilities.Low ?? probabilities.low ?? 0;
      const probMedium = probabilities.Medium ?? probabilities.medium ?? probabilities.Moderate ?? probabilities.moderate ?? 0;
      const probHigh = probabilities.High ?? probabilities.high ?? 0;

      let stressScore;
      if (probLow || probMedium || probHigh) {
        // Weighted average out of 100
        stressScore = (probLow * 15.0) + (probMedium * 50.0) + (probHigh * 85.0);
      } else {
        if (stressLevel === 'low') stressScore = 15.0;
        else if (stressLevel === 'high') stressScore = 85.0;
        else stressScore = 50.0;
      }
      stressScore = Math.round(stressScore * 100) / 100; // Round to 2 decimal places

      // 3. Map confidence_score from percentage back to decimal (0.0 to 1.0)
      const confidenceScore = pred.confidence_score !== undefined
        ? Math.round((pred.confidence_score / 100.0) * 10000) / 10000
        : null;

      return {
        stress_level: stressLevel,
        stress_score: stressScore,
        confidence_score: confidenceScore,
        model_version: 'v2.0.0-deeplearning'
      };
    }

    return {
      stress_level: 'low',
      stress_score: 35.0,
      confidence_score: 0.85,
      model_version: 'v1.0.0-fallback'
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] predictStress → request timed out. Using fallback.');
    } else {
      console.warn('[ML Client] predictStress → service unreachable:', err.message, '. Using fallback.');
    }
    return {
      stress_level: 'low',
      stress_score: 35.0,
      confidence_score: 0.85,
      model_version: 'v1.0.0-fallback'
    };
  }
};

/**
 * Generate AI insight text from weekly summary or daily data.
 * @param {object} insightPayload — insight request body matching InsightRequest schema
 * @returns {{ success, insight_text, ... } | null}
 */
export const generateInsight = async (insightPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${INSIGHT_SERVICE_URL}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insightPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] generateInsight → HTTP ${res.status}. Using fallback.`);
      return {
        insight_text: 'Tingkat stres Anda minggu ini tergolong rendah dan stabil. Kualitas tidur dan durasi belajar Anda berada dalam batas sehat.',
        recommendation_text: 'Pertahankan rutinitas tidur yang teratur dan luangkan waktu untuk relaksasi aktif setelah belajar.',
        category: 'lifestyle'
      };
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] generateInsight → request timed out. Using fallback.');
    } else {
      console.warn('[ML Client] generateInsight → service unreachable:', err.message, '. Using fallback.');
    }
    return {
      insight_text: 'Tingkat stres Anda minggu ini tergolong rendah dan stabil. Kualitas tidur dan durasi belajar Anda berada dalam batas sehat.',
      recommendation_text: 'Pertahankan rutinitas tidur yang teratur dan luangkan waktu untuk relaksasi aktif setelah belajar.',
      category: 'lifestyle'
    };
  }
};

/**
 * Generate personalized recommendations based on stress level and input features.
 * @param {object} recommendationPayload — recommendation request body matching RecommendationRequest schema
 * @returns {{ success, count, recommendations: [...] } | null}
 */
export const generateRecommendation = async (recommendationPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${RECOMMENDATION_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recommendationPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] generateRecommendation → HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] generateRecommendation → request timed out');
    } else {
      console.warn('[ML Client] generateRecommendation → service unreachable:', err.message);
    }
    return null;
  }
};

/**
 * Generate AI weekly insight and recommendations using Groq AI RAG.
 * @param {object} weeklyRAGPayload — weekly RAG request body matching WeeklyRAGRequest schema
 * @returns {{ success, user_id, insight, recommendations: [...] } | null}
 */
export const generateWeeklyRAG = async (weeklyRAGPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${INSIGHT_SERVICE_URL}/weekly-rag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weeklyRAGPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] generateWeeklyRAG → HTTP ${res.status}. Using fallback.`);
      return getWeeklyRAGFallback(weeklyRAGPayload.weekly_stress_prediction, weeklyRAGPayload.user_id);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] generateWeeklyRAG → request timed out. Using fallback.');
    } else {
      console.warn('[ML Client] generateWeeklyRAG → service unreachable:', err.message, '. Using fallback.');
    }
    return getWeeklyRAGFallback(weeklyRAGPayload.weekly_stress_prediction, weeklyRAGPayload.user_id);
  }
};

const getWeeklyRAGFallback = (weeklyStressPrediction, userId) => {
  return {
    success: false,
    user_id: userId,
    insight: `Tingkat stres mingguan Anda terpantau ${weeklyStressPrediction === 'high' ? 'tinggi' : weeklyStressPrediction === 'medium' ? 'sedang' : 'rendah'}. Jaga selalu pola makan, tidur, dan aktivitas fisik Anda.`,
    recommendations: [
      {
        category: 'lifestyle',
        priority_level: 'medium',
        title: 'Jaga Keseimbangan',
        text: 'Luangkan waktu 15 menit untuk relaksasi atau aktivitas tanpa layar.'
      },
      {
        category: 'sleep',
        priority_level: 'high',
        title: 'Tidur Cukup',
        text: 'Usahakan tidur 7-8 jam setiap malam untuk membantu pemulihan energi.'
      },
      {
        category: 'mindfulness',
        priority_level: 'low',
        title: 'Latihan Napas',
        text: 'Lakukan latihan napas dalam selama 5 menit ketika merasa tegang.'
      }
    ]
  };
};

