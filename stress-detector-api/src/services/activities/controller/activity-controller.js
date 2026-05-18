/* eslint-disable camelcase */
import response from '../../../utils/response.js';
import {
  AuthorizationError,
  InvariantError,
  NotFoundError,
} from '../../../exceptions/index.js';
import ActivityRepositories from '../repositories/activity-repositories.js';
import PredictionRepositories from '../../predictions/repositories/prediction-repositories.js';
import { predictStress } from '../../../ai/ml-client.js';

export const createActivity = async (req, res, next) => {
  const {
    activityDate,
    sleepHours,
    studyHours,
    screenTimeHours,
    socialMediaHours,
    physicalActivityMinutes,
    caffeineIntakeMg,
    moodScore,
    fatigueLevel,
    assignmentLoad,
    deadlinePressure,
    socialInteractionScore,
    financialWorryScore,
    healthConditionScore,
  } = req.validated;

  // Fixed: was req.user.userId (always undefined). JWT payload uses { id }.
  const { id: userId } = req.user;

  // 1. Save activity to DB
  const activity = await ActivityRepositories.createActivity({
    userId,
    activityDate,
    sleepHours,
    studyHours,
    screenTimeHours,
    socialMediaHours,
    physicalActivityMinutes,
    caffeineIntakeMg,
    moodScore,
    fatigueLevel,
    assignmentLoad,
    deadlinePressure,
    socialInteractionScore,
    financialWorryScore,
    healthConditionScore,
  });

  if (!activity) {
    return next(new InvariantError('Gagal menambahkan aktivitas'));
  }

  // 2. Call ML service for stress prediction (non-blocking — failure is tolerated)
  const mlPayload = {
    sleep_hours: sleepHours,
    study_hours: studyHours,
    screen_time_hours: screenTimeHours,
    social_media_hours: socialMediaHours,
    physical_activity_minutes: physicalActivityMinutes,
    caffeine_intake_mg: caffeineIntakeMg,
    mood_score: moodScore,
    fatigue_level: fatigueLevel,
    assignment_load: assignmentLoad,
    deadline_pressure: deadlinePressure,
    social_interaction_score: socialInteractionScore,
    financial_worry_score: financialWorryScore,
    health_condition_score: healthConditionScore,
  };

  const mlResult = await predictStress(mlPayload);

  // 3. Save prediction if ML returned a result
  let prediction = null;
  if (mlResult && mlResult.stress_level && mlResult.stress_score !== undefined) {
    prediction = await PredictionRepositories.savePrediction({
      userId,
      activityId: activity.id,
      predictionDate: activityDate,
      stressLevel: mlResult.stress_level,
      stressScore: mlResult.stress_score,
      confidenceScore: mlResult.confidence_score || null,
      modelVersion: mlResult.model_version || null,
    });
  }

  return response(res, 201, 'Aktivitas berhasil ditambahkan', {
    activity,
    prediction,
    mlAvailable: mlResult !== null,
  });
};

export const getActivities = async (req, res) => {
  const { id: userId } = req.user;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const activities = await ActivityRepositories.getActivitiesByUser(userId, {
    limit,
    offset,
  });

  return response(res, 200, 'Aktivitas berhasil ditampilkan', {
    activities,
    pagination: { limit, offset },
  });
};

export const getActivityById = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  const activity = await ActivityRepositories.getActivityById(id);

  if (!activity) {
    return next(new NotFoundError('Aktivitas tidak ditemukan'));
  }

  const isOwner = await ActivityRepositories.verifyActivityOwner(id, userId);

  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak mengakses resource ini'),
    );
  }

  return response(res, 200, 'Aktivitas berhasil ditampilkan', { activity });
};

export const deleteActivity = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  const isOwner = await ActivityRepositories.verifyActivityOwner(id, userId);

  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak menghapus aktivitas ini'),
    );
  }

  const deletedActivity = await ActivityRepositories.deleteActivity(id);

  if (!deletedActivity) {
    return next(new NotFoundError('Aktivitas tidak ditemukan'));
  }

  return response(res, 200, 'Aktivitas berhasil dihapus', { deletedActivity });
};
