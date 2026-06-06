/* eslint-disable camelcase */
import response from '../../../utils/response.js';
import {
  AuthorizationError,
  InvariantError,
  NotFoundError,
} from '../../../exceptions/index.js';
import ActivityRepositories from '../repositories/activity-repositories.js';
import PredictionRepositories from '../../predictions/repositories/prediction-repositories.js';
import WeeklySummaryRepositories from '../../summaries/repositories/summary-repositories.js';
import { predictStress } from '../../../ai/ml-client.js';

export const createActivity = async (req, res, next) => {
  const {
    activityDate,
    sleepHours,
    studyHours,
    screenTimeHours,
    socialMediaHours,
    physicalActivityMinutes,
    moodScore,
    fatigueLevel,
    assignmentLoad,
    deadlinePressure,
    activityStatus = 'submitted',
    note,
  } = req.validated;

  // Fixed: was req.user.userId (always undefined). JWT payload uses { id }.
  const { id: userId } = req.user;

  // Check if activity on the same date already exists for this user
  const existingActivity = await ActivityRepositories.getActivityByDate(userId, activityDate);
  if (existingActivity) {
    return next(new InvariantError('Aktivitas pada tanggal tersebut sudah ada'));
  }

  // 1. Save activity to DB
  const activity = await ActivityRepositories.createActivity({
    userId,
    activityDate,
    sleepHours,
    studyHours,
    screenTimeHours,
    socialMediaHours,
    physicalActivityMinutes,
    moodScore,
    fatigueLevel,
    assignmentLoad,
    deadlinePressure,
    activityStatus,
    note,
  });

  if (!activity) {
    return next(new InvariantError('Gagal menambahkan aktivitas'));
  }

  if (activityStatus === 'draft') {
    return response(res, 201, 'Draft aktivitas berhasil disimpan', {
      activity,
      prediction: null,
      mlAvailable: null,
    });
  }

  // 2. Call ML service for stress prediction (non-blocking — failure is tolerated)
  const mlPayload = {
    sleep_hours: sleepHours,
    physical_activity_minutes: physicalActivityMinutes,
    study_hours: studyHours,
    screen_time_hours: screenTimeHours,
    social_media_hours: socialMediaHours,
    assignment_load: assignmentLoad,
    deadline_pressure: deadlinePressure,
    fatigue_level: fatigueLevel,
    mood_score: moodScore,
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

  // 4. Automatically generate weekly summary if 7 days of activities are completed
  if (activityStatus === 'submitted') {
    try {
      const summaryResult = await WeeklySummaryRepositories.generateWeeklySummaryInternal(userId, activityDate);
      if (summaryResult.success) {
        console.log(`[Info] Weekly summary automatically generated for user ${userId} for date ${activityDate}`);
      }
    } catch (err) {
      console.error(`[Warning] Failed to automatically generate weekly summary: ${err.message}`);
    }
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

export const updateActivity = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  const {
    activityDate,
    sleepHours,
    studyHours,
    screenTimeHours,
    socialMediaHours,
    physicalActivityMinutes,
    moodScore,
    fatigueLevel,
    assignmentLoad,
    deadlinePressure,
    activityStatus = 'submitted',
    note,
  } = req.validated;

  // 1. Verify owner of the activity
  const isOwner = await ActivityRepositories.verifyActivityOwner(id, userId);

  if (!isOwner) {
    return next(
      new AuthorizationError('Anda tidak berhak memperbarui aktivitas ini'),
    );
  }

  // Check if activity on the same date already exists for this user (excluding the current activity being updated)
  const existingActivity = await ActivityRepositories.getActivityByDate(userId, activityDate);
  if (existingActivity && existingActivity.id !== id) {
    return next(new InvariantError('Aktivitas pada tanggal tersebut sudah ada'));
  }

  // 2. Update activity in DB
  const activity = await ActivityRepositories.updateActivity(id, {
    activityDate,
    sleepHours,
    studyHours,
    screenTimeHours,
    socialMediaHours,
    physicalActivityMinutes,
    moodScore,
    fatigueLevel,
    assignmentLoad,
    deadlinePressure,
    activityStatus,
    note,
  });

  if (!activity) {
    return next(new NotFoundError('Aktivitas tidak ditemukan'));
  }

  if (activityStatus === 'draft') {
    return response(res, 200, 'Draft aktivitas berhasil diperbarui', {
      activity,
      prediction: null,
      mlAvailable: null,
    });
  }

  // 3. Call ML service for stress prediction (non-blocking)
  const mlPayload = {
    sleep_hours: sleepHours,
    physical_activity_minutes: physicalActivityMinutes,
    study_hours: studyHours,
    screen_time_hours: screenTimeHours,
    social_media_hours: socialMediaHours,
    assignment_load: assignmentLoad,
    deadline_pressure: deadlinePressure,
    fatigue_level: fatigueLevel,
    mood_score: moodScore,
  };

  const mlResult = await predictStress(mlPayload);

  // 4. Save or update prediction if ML returned a result
  let prediction = null;
  if (mlResult && mlResult.stress_level && mlResult.stress_score !== undefined) {
    const existingPred = await PredictionRepositories.getPredictionByActivityId(id);
    if (existingPred) {
      prediction = await PredictionRepositories.updatePrediction({
        activityId: id,
        predictionDate: activityDate,
        stressLevel: mlResult.stress_level,
        stressScore: mlResult.stress_score,
        confidenceScore: mlResult.confidence_score || null,
        modelVersion: mlResult.model_version || null,
      });
    } else {
      prediction = await PredictionRepositories.savePrediction({
        userId,
        activityId: id,
        predictionDate: activityDate,
        stressLevel: mlResult.stress_level,
        stressScore: mlResult.stress_score,
        confidenceScore: mlResult.confidence_score || null,
        modelVersion: mlResult.model_version || null,
      });
    }
  }

  // 5. Automatically generate weekly summary if 7 days of activities are completed
  if (activityStatus === 'submitted') {
    try {
      const summaryResult = await WeeklySummaryRepositories.generateWeeklySummaryInternal(userId, activityDate);
      if (summaryResult.success) {
        console.log(`[Info] Weekly summary automatically generated for user ${userId} for date ${activityDate}`);
      }
    } catch (err) {
      console.error(`[Warning] Failed to automatically generate weekly summary: ${err.message}`);
    }
  }

  return response(res, 200, 'Aktivitas berhasil diperbarui', {
    activity,
    prediction,
    mlAvailable: mlResult !== null,
  });
};
