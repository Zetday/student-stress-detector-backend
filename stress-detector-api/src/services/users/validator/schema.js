import Joi from 'joi';

export const userPayloadSchema = Joi.object({
  fullname: Joi.string().max(100).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .max(254)
    .required(),
  password: Joi.string().min(6).required(),
});
