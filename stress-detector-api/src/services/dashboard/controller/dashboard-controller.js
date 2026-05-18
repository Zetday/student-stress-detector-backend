import response from '../../../utils/response.js';
import PredictionRepositories from '../../predictions/repositories/prediction-repositories.js';
import WeeklySummaryRepositories from '../../weekly-summaries/repositories/weekly-summary-repositories.js';
import InsightRepositories from '../../insights/repositories/insight-repositories.js';
import RecommendationRepositories from '../../recommendations/repositories/recommendation-repositories.js';

/**
 * GET /dashboard
 * Returns a single aggregated payload:
 * - Latest stress prediction
 * - Latest weekly summary
 * - Latest insight
 * - Latest recommendation
 * - Unread recommendation count
 */
export const getDashboard = async (req, res) => {
  const { id: userId } = req.user;

  const [prediction, weeklySummary, insight, recommendation, unreadCount] = await Promise.all([
    PredictionRepositories.getLatestPrediction(userId),
    WeeklySummaryRepositories.getLatestSummary(userId),
    InsightRepositories.getLatestInsight(userId),
    RecommendationRepositories.getLatestRecommendation(userId),
    RecommendationRepositories.getUnreadCount(userId),
  ]);

  return response(res, 200, 'Dashboard berhasil ditampilkan', {
    latestPrediction: prediction,
    latestWeeklySummary: weeklySummary,
    latestInsight: insight,
    latestRecommendation: recommendation,
    unreadRecommendations: unreadCount,
  });
};

/**
 * GET /dashboard/trend?days=30
 * Returns time-series stress scores for chart visualization.
 */
export const getStressTrend = async (req, res) => {
  const { id: userId } = req.user;
  const days = parseInt(req.query.days) || 30;

  const trend = await PredictionRepositories.getStressTrend(userId, days);

  return response(res, 200, 'Tren stres berhasil ditampilkan', { trend, days });
};
