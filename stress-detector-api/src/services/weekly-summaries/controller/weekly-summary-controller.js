/* eslint-disable camelcase */
import response from '../../../utils/response.js';
import { InvariantError } from '../../../exceptions/index.js';
import WeeklySummaryRepositories from '../repositories/weekly-summary-repositories.js';
import InsightRepositories from '../../insights/repositories/insight-repositories.js';
import RecommendationRepositories from '../../recommendations/repositories/recommendation-repositories.js';
import { generateInsight, generateRecommendation } from '../../../ai/ml-client.js';

export const getWeeklySummaries = async (req, res) => {
  const { id: userId } = req.user;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const summaries = await WeeklySummaryRepositories.getSummariesByUser(userId, { limit, offset });

  return response(res, 200, 'Ringkasan mingguan berhasil ditampilkan', {
    summaries,
    pagination: { limit, offset },
  });
};

export const getLatestWeeklySummary = async (req, res) => {
  const { id: userId } = req.user;

  const summary = await WeeklySummaryRepositories.getLatestSummary(userId);

  return response(res, 200, 'Ringkasan mingguan terbaru berhasil ditampilkan', { summary });
};

/**
 * POST /weekly-summaries/generate
 * Aggregates this week's activity + prediction data,
 * calls the Insight and Recommendation microservices separately,
 * then saves everything.
 *
 * Best for capstone: manual trigger that can also be called
 * after every week of submissions (no external cron needed).
 */
export const generateWeeklySummary = async (req, res, next) => {
  const { id: userId } = req.user;

  // Default to current ISO week (Mon–Sun)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // shift to Monday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  // 1. Aggregate daily_activities
  const activityStats = await WeeklySummaryRepositories.aggregateWeekActivities(
    userId, weekStartStr, weekEndStr,
  );

  if (!activityStats || activityStats.total_days === 0) {
    return next(new InvariantError('Tidak ada data aktivitas minggu ini untuk dirangkum'));
  }

  // 2. Aggregate stress_predictions
  const predictionStats = await WeeklySummaryRepositories.aggregateWeekPredictions(
    userId, weekStartStr, weekEndStr,
  );

  const avgStressLevel = predictionStats?.average_stress_level ?? 0;

  // 3. Derive stress trend vs. previous week
  const stressTrend = await WeeklySummaryRepositories.deriveStressTrend(userId, weekStartStr);

  // 4. Collect daily stress levels for the week (for insight weekly_stress_levels)
  const dailyPredictions = predictionStats?.daily_stress_levels ?? [];

  // Determine dominant stress level label for the week
  const stressLevelLabel = avgStressLevel >= 2.5 ? 'high'
    : avgStressLevel >= 1.5 ? 'medium' : 'low';

  // 5. Save weekly summary
  const summary = await WeeklySummaryRepositories.saveSummary({
    userId,
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    averageStressLevel: avgStressLevel,
    averageSleepHours: activityStats.average_sleep_hours ?? 0,
    averageScreenTimeHours: activityStats.average_screen_time_hours ?? 0,
    averageStudyHours: activityStats.average_study_hours ?? 0,
    stressTrend,
  });

  // 6. Build payloads for Insight and Recommendation microservices
  const sharedFeatures = {
    sleep_hours: activityStats.average_sleep_hours ?? null,
    mood_score: activityStats.average_mood_score ?? null,
    study_hours: activityStats.average_study_hours ?? null,
    physical_activity: activityStats.average_physical_activity ?? null,
    screen_time: activityStats.average_screen_time_hours ?? null,
    fatigue_score: activityStats.average_fatigue_level ?? null,
    financial_stress: activityStats.average_financial_worry ?? null,
    health_score: activityStats.average_health_condition ?? null,
    caffeine_intake: activityStats.average_caffeine_intake ?? null,
  };

  const insightPayload = {
    user_id: userId,
    stress_prediction_id: predictionStats?.latest_prediction_id ?? 0,
    stress_level: stressLevelLabel,
    input_features: sharedFeatures,
    period_type: 'weekly',
    weekly_summary_id: summary.id,
    weekly_stress_levels: dailyPredictions,
  };

  const recommendationPayload = {
    user_id: userId,
    stress_prediction_id: predictionStats?.latest_prediction_id ?? 0,
    stress_level: stressLevelLabel,
    input_features: sharedFeatures,
    period_type: 'weekly',
    weekly_summary_id: summary.id,
    max_recommendations: 3,
  };

  // 7. Call Insight and Recommendation services in parallel
  const [insightResult, recommendationResult] = await Promise.allSettled([
    generateInsight(insightPayload),
    generateRecommendation(recommendationPayload),
  ]);

  const mlInsight = insightResult.status === 'fulfilled' ? insightResult.value : null;
  const mlRecommendation = recommendationResult.status === 'fulfilled' ? recommendationResult.value : null;

  let insight = null;
  let recommendation = null;

  // 8. Save insight if available
  if (mlInsight?.insight_text) {
    insight = await InsightRepositories.saveInsight({
      userId,
      weeklySummaryId: summary.id,
      periodType: 'weekly',
      insightText: mlInsight.insight_text,
    });
  }

  // 9. Save recommendation(s) if available
  if (mlRecommendation?.recommendations?.length > 0) {
    const firstRec = mlRecommendation.recommendations[0];
    recommendation = await RecommendationRepositories.saveRecommendation({
      userId,
      weeklySummaryId: summary.id,
      periodType: 'weekly',
      category: firstRec.category || null,
      recommendationText: firstRec.recommendation_text,
    });
  }

  return response(res, 201, 'Ringkasan mingguan berhasil dibuat', {
    summary,
    insight,
    recommendation,
    mlAvailable: mlInsight !== null || mlRecommendation !== null,
  });
};
