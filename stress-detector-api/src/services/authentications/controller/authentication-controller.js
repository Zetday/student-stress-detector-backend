import { nanoid } from 'nanoid';
import AuthenticationRepositories from '../repositories/authentication-repositories.js';
import UserRepositories from '../../users/repositories/user-repositories.js';
import TokenManager from '../../../security/token-manager.js';
import response from '../../../utils/response.js';
import { AuthenticationError } from '../../../exceptions/index.js';

export const login = async (req, res, next) => {
  const { email, password } = req.validated;
  const userId = await UserRepositories.verifyUserCredential(email, password);

  if (!userId) {
    return next(new AuthenticationError('Kredensial yang Anda berikan salah'));
  }

  const accessToken = TokenManager.generateAccessToken({ id: userId });
  const refreshToken = TokenManager.generateRefreshToken({ id: userId });

  const id = `auth-${nanoid(16)}`;
  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  const createdAt = new Date().toISOString();

  const expiresAtDate = new Date();
  expiresAtDate.setDate(expiresAtDate.getDate() + 7);
  const expiresAt = expiresAtDate.toISOString();

  await AuthenticationRepositories.addRefreshToken(
    id,
    userId,
    refreshToken,
    deviceInfo,
    expiresAt,
    createdAt,
  );

  return response(res, 200, 'Login Berhasil', {
    accessToken,
    refreshToken,
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken: oldRefreshToken } = req.validated;

  const result =
    await AuthenticationRepositories.verifyRefreshToken(oldRefreshToken);

  if (!result) {
    return next(
      new AuthenticationError('Refresh token tidak valid di database'),
    );
  }

  const { id: userId } = TokenManager.verifyRefreshToken(oldRefreshToken);

  const newAccessToken = TokenManager.generateAccessToken({ id: userId });
  const newRefreshToken = TokenManager.generateRefreshToken({ id: userId });

  const id = `auth-${nanoid(16)}`;
  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
  const createdAt = new Date().toISOString();
  const expiresAtDate = new Date();
  expiresAtDate.setDate(expiresAtDate.getDate() + 7);
  const expiresAt = expiresAtDate.toISOString();

  await AuthenticationRepositories.deleteRefreshToken(oldRefreshToken);

  await AuthenticationRepositories.addRefreshToken(
    id,
    userId,
    newRefreshToken,
    deviceInfo,
    expiresAt,
    createdAt,
  );

  return response(res, 200, 'Access Token berhasil diperbarui', {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

export const logout = async (req, res, next) => {
  const { refreshToken } = req.validated;

  const result =
    await AuthenticationRepositories.verifyRefreshToken(refreshToken);

  if (!result) {
    return next(new AuthenticationError('Refresh token tidak valid'));
  }

  await AuthenticationRepositories.deleteRefreshToken(refreshToken);

  return response(res, 200, 'Refresh token berhasil dihapus');
};
