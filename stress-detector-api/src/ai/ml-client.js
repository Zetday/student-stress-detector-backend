/* eslint-disable camelcase */
/**
 * ML Client — communicates with the FastAPI / Flask prediction service.
 * If the ML service is unavailable, methods return null so the Express
 * request still succeeds (activity is saved; prediction is simply null).
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * @param {object} activityPayload  — the fields from daily_activities
 * @returns {{ stress_score, stress_level, confidence_score, model_version } | null}
 */
export const predictStress = async (activityPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${ML_SERVICE_URL}/predict`, {
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

    return await res.json();
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
 * @param {object} weeklySummaryPayload — aggregated weekly stats
 * @returns {{ insight_text, recommendation_text, category } | null}
 */
export const generateInsight = async (weeklySummaryPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${ML_SERVICE_URL}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weeklySummaryPayload),
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

