import Joi from 'joi';

export const exportStressReportSchema = Joi.object({
  targetEmail: Joi.string().email().optional(),
});
