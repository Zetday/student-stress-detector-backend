import Joi from 'joi';

export const postAuthenticationPayloadSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const putAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const deleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordPayloadSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(254)
    .required(),
});

export const resetPasswordPayloadSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const googleLoginPayloadSchema = Joi.object({
  credential: Joi.string().required(),
});

