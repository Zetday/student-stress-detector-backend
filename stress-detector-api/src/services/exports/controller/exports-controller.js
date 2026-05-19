import response from '../../../utils/response.js';
import { NotFoundError } from '../../../exceptions/index.js';
import UserRepositories from '../../users/repositories/user-repositories.js';
import ProducerService from '../repositories/producer-service.js';

export const exportDailyPrediction = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    // Resolve email
    const userResult = await UserRepositories.getUserById(userId);
    const user = userResult.data;
    if (!user) {
      return next(new NotFoundError('User tidak ditemukan'));
    }

    const targetEmail = req.validated.targetEmail || user.email;

    const payload = {
      userId,
      targetEmail,
      type: 'daily',
    };

    await ProducerService.sendMessage('export:stress-results', payload);

    return response(
      res,
      201,
      'Permintaan ekspor prediksi harian berhasil masuk antrean. Silakan periksa email Anda beberapa saat lagi.',
    );
  } catch (error) {
    next(error);
  }
};

export const exportWeeklySummary = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    // Resolve email
    const userResult = await UserRepositories.getUserById(userId);
    const user = userResult.data;
    if (!user) {
      return next(new NotFoundError('User tidak ditemukan'));
    }

    const targetEmail = req.validated.targetEmail || user.email;

    const payload = {
      userId,
      targetEmail,
      type: 'weekly',
    };

    await ProducerService.sendMessage('export:stress-results', payload);

    return response(
      res,
      201,
      'Permintaan ekspor ringkasan mingguan berhasil masuk antrean. Silakan periksa email Anda beberapa saat lagi.',
    );
  } catch (error) {
    next(error);
  }
};
