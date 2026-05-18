import response from '../../../utils/response.js';
import InsightRepositories from '../repositories/insight-repositories.js';

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

  const insight = await InsightRepositories.getLatestInsight(userId);

  return response(res, 200, 'Insight terbaru berhasil ditampilkan', { insight });
};
