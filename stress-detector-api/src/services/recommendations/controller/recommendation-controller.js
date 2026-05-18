import response from '../../../utils/response.js';
import { NotFoundError } from '../../../exceptions/index.js';
import RecommendationRepositories from '../repositories/recommendation-repositories.js';

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
