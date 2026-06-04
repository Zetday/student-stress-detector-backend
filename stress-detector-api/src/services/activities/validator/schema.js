import Joi from 'joi';

const activityStatusSchema = Joi.string().valid('draft', 'submitted').default('submitted');

const requiredWhenSubmitted = (schema) => schema.when('activityStatus', {
  is: 'submitted',
  then: schema.required(),
  otherwise: schema.optional().allow(null),
});

export const createActivitySchema = Joi.object({
  activityDate: Joi.date().required(),
  activityStatus: activityStatusSchema,
  sleepHours: requiredWhenSubmitted(Joi.number().min(0).max(24)),
  studyHours: requiredWhenSubmitted(Joi.number().min(0).max(24)),
  screenTimeHours: requiredWhenSubmitted(Joi.number().min(0).max(24)),
  socialMediaHours: requiredWhenSubmitted(Joi.number().min(0).max(24)),
  physicalActivityMinutes: requiredWhenSubmitted(Joi.number().integer().min(0)),
  moodScore: requiredWhenSubmitted(Joi.number().integer().min(0).max(10)),
  fatigueLevel: requiredWhenSubmitted(Joi.number().integer().min(0).max(10)),
  assignmentLoad: requiredWhenSubmitted(Joi.number().integer().min(0)),
  deadlinePressure: requiredWhenSubmitted(Joi.number().integer().min(0).max(10)),
  note: Joi.string().max(500).allow('', null).optional(),
});