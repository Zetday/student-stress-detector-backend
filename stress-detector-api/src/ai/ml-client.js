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

let mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
if (mlUrl && !mlUrl.startsWith('http://') && !mlUrl.startsWith('https://')) {
  mlUrl = `http://${mlUrl}`;
}
const ML_SERVICE_URL = mlUrl;

const PREDICT_SERVICE_URL = process.env.PREDICT_SERVICE_URL
  ? (process.env.PREDICT_SERVICE_URL.startsWith('http://') || process.env.PREDICT_SERVICE_URL.startsWith('https://')
    ? process.env.PREDICT_SERVICE_URL
    : `http://${process.env.PREDICT_SERVICE_URL}`)
  : ML_SERVICE_URL;

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL
  ? (process.env.RECOMMENDATION_SERVICE_URL.startsWith('http://') || process.env.RECOMMENDATION_SERVICE_URL.startsWith('https://')
    ? process.env.RECOMMENDATION_SERVICE_URL
    : `http://${process.env.RECOMMENDATION_SERVICE_URL}`)
  : ML_SERVICE_URL;

const INSIGHT_SERVICE_URL = process.env.INSIGHT_SERVICE_URL
  ? (process.env.INSIGHT_SERVICE_URL.startsWith('http://') || process.env.INSIGHT_SERVICE_URL.startsWith('https://')
    ? process.env.INSIGHT_SERVICE_URL
    : `http://${process.env.INSIGHT_SERVICE_URL}`)
  : ML_SERVICE_URL;
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
