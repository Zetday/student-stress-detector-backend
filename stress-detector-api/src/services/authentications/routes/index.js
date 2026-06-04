import { Router } from 'express';
import {
  login,
  loginWithGoogle,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from '../controller/authentication-controller.js';
import { validate } from '../../../middlewares/validate.js';
import {
  postAuthenticationPayloadSchema,
  postGoogleAuthenticationPayloadSchema,
  putAuthenticationPayloadSchema,
  deleteAuthenticationPayloadSchema,
  forgotPasswordPayloadSchema,
  resetPasswordPayloadSchema,
} from '../validator/schema.js';

const router = Router();

router.post(
  '/',
  validate(postAuthenticationPayloadSchema),
  login
);
router.post(
  '/google',
  validate(postGoogleAuthenticationPayloadSchema),
  loginWithGoogle
);
router.put(
  '/',
  validate(putAuthenticationPayloadSchema),
  refreshToken
);
router.delete(
  '/',
  validate(deleteAuthenticationPayloadSchema),
  logout
);
router.post(
  '/forgot-password',
  validate(forgotPasswordPayloadSchema),
  forgotPassword
);
router.post(
  '/reset-password',
  validate(resetPasswordPayloadSchema),
  resetPassword
);

export default router;
