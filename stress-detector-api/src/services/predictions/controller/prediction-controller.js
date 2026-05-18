import response from '../../../utils/response.js';
import PredictionRepositories from '../repositories/prediction-repositories.js';

export const getPredictions = async (req, res) => {
  const { id: userId } = req.user;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const predictions = await PredictionRepositories.getPredictionsByUser(userId, { limit, offset });

  return response(res, 200, 'Riwayat prediksi berhasil ditampilkan', {
    predictions,
    pagination: { limit, offset },
  });
};

export const getLatestPrediction = async (req, res) => {
  const { id: userId } = req.user;

  const prediction = await PredictionRepositories.getLatestPrediction(userId);

  return response(res, 200, 'Prediksi terbaru berhasil ditampilkan', { prediction });
};
