/* eslint-disable camelcase */
import response from '../../../utils/response.js';
import { InvariantError } from '../../../exceptions/index.js';
import WeeklySummaryRepositories from '../repositories/weekly-summary-repositories.js';
import InsightRepositories from '../../insights/repositories/insight-repositories.js';
import RecommendationRepositories from '../../recommendations/repositories/recommendation-repositories.js';
import { generateInsight } from '../../../ai/ml-client.js';

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
 * calls the ML service for an insight, then saves everything.
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

  // 4. Save weekly summary
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

  // 5. Call ML service for insight + recommendation
  const mlPayload = {
    user_id: userId,
    week_start: weekStartStr,
    week_end: weekEndStr,
    average_stress_level: avgStressLevel,
    average_sleep_hours: activityStats.average_sleep_hours,
    average_screen_time_hours: activityStats.average_screen_time_hours,
    average_study_hours: activityStats.average_study_hours,
    stress_trend: stressTrend,
  };

  const mlResult = await generateInsight(mlPayload);

  let insight = null;
  let recommendation = null;

  if (mlResult) {
    // 6. Save insight
    if (mlResult.insight_text) {
      insight = await InsightRepositories.saveInsight({
        userId,
        weeklySummaryId: summary.id,
        periodType: 'weekly',
        insightText: mlResult.insight_text,
      });
    }

    // 7. Save recommendation
    if (mlResult.recommendation_text) {
      recommendation = await RecommendationRepositories.saveRecommendation({
        userId,
        weeklySummaryId: summary.id,
        periodType: 'weekly',
        category: mlResult.category || null,
        recommendationText: mlResult.recommendation_text,
      });
    }
  }

  return response(res, 201, 'Ringkasan mingguan berhasil dibuat', {
    summary,
    insight,
    recommendation,
    mlAvailable: mlResult !== null,
  });
};
