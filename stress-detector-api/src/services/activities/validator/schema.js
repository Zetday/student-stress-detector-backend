import Joi from 'joi';

export const createActivitySchema = Joi.object({
  activityDate: Joi.date().required(),
  sleepHours: Joi.number().min(0).max(24).required(),
  studyHours: Joi.number().min(0).max(24).required(),
  screenTimeHours: Joi.number().min(0).max(24).required(),
  socialMediaHours: Joi.number().min(0).max(24).required(),
  physicalActivityMinutes: Joi.number().integer().min(0).required(),
  moodScore: Joi.number().integer().min(1).max(10).required(),
  fatigueLevel: Joi.number().integer().min(1).max(10).required(),
  assignmentLoad: Joi.number().integer().min(0).required(),
  deadlinePressure: Joi.number().integer().min(1).max(10).required(),
  note: Joi.string().max(500).allow('', null).optional(),
  activityStatus: Joi.string().valid('draft', 'submitted').default('submitted').optional(),
});

