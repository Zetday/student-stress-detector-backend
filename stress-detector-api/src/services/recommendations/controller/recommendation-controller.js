import response from '../../../utils/response.js';
import { NotFoundError } from '../../../exceptions/index.js';
import RecommendationRepositories from '../repositories/recommendation-repositories.js';
import WeeklySummaryRepositories from '../../summaries/repositories/summary-repositories.js';

export const getRecommendations = async (req, res) => {
  const { id: userId } = req.user;
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const recommendations = await RecommendationRepositories.getRecommendationsByUser(userId, {
    limit,
    offset,
  });

  return response(res, 200, 'Rekomendasi berhasil ditampilkan', {
    recommendations,
    pagination: { limit, offset },
  });
};

export const getLatestRecommendation = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    await WeeklySummaryRepositories.generateWeeklySummaryInternal(userId, todayStr);
  } catch (err) {
    console.error(`[Warning] Auto-generation on GET latest recommendation failed: ${err.message}`);
  }

  const recommendation = await RecommendationRepositories.getLatestRecommendation(userId);

  return response(res, 200, 'Rekomendasi terbaru berhasil ditampilkan', { recommendation });
};

export const markRecommendationRead = async (req, res, next) => {
  const { id: recommendationId } = req.params;
  const { id: userId } = req.user;

  const updated = await RecommendationRepositories.markAsRead(recommendationId, userId);

  if (!updated) {
    return next(new NotFoundError('Rekomendasi tidak ditemukan'));
  }

  return response(res, 200, 'Rekomendasi ditandai sebagai sudah dibaca', {
    recommendation: updated,
  });
};
