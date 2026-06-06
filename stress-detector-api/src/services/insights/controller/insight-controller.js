import response from '../../../utils/response.js';
import InsightRepositories from '../repositories/insight-repositories.js';
import WeeklySummaryRepositories from '../../summaries/repositories/summary-repositories.js';

export const getInsights = async (req, res) => {
  const { id: userId } = req.user;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const insights = await InsightRepositories.getInsightsByUser(userId, { limit, offset });

  return response(res, 200, 'Insight berhasil ditampilkan', {
    insights,
    pagination: { limit, offset },
  });
};

export const getLatestInsight = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    await WeeklySummaryRepositories.generateWeeklySummaryInternal(userId, todayStr);
  } catch (err) {
    console.error(`[Warning] Auto-generation on GET latest insight failed: ${err.message}`);
  }

  const insight = await InsightRepositories.getLatestInsight(userId);

  return response(res, 200, 'Insight terbaru berhasil ditampilkan', { insight });
};
