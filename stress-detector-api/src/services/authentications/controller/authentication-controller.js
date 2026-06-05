import { nanoid } from 'nanoid';
import AuthenticationRepositories from '../repositories/authentication-repositories.js';
import UserRepositories from '../../users/repositories/user-repositories.js';
import TokenManager from '../../../security/token-manager.js';
import response from '../../../utils/response.js';
import { AuthenticationError, NotFoundError, InvariantError } from '../../../exceptions/index.js';
import { sendPasswordResetEmail } from '../../../utils/mail-sender.js';

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

export const forgotPassword = async (req, res, next) => {
  const { email } = req.validated;

  const isEmailRegistered = await UserRepositories.verifyNewEmail(email);
  if (!isEmailRegistered) {
    return next(new NotFoundError('Email tidak terdaftar'));
  }

  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

  await UserRepositories.saveResetToken(email, token, expiresAt.toISOString());

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
    return response(res, 200, 'Tautan pemulihan kata sandi telah dikirim ke email Anda');
  } catch (error) {
    return next(new InvariantError(`Gagal mengirim email: ${error.message}`));
  }
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.validated;

  const user = await UserRepositories.verifyResetToken(token);
  if (!user) {
    return next(new InvariantError('Tautan pemulihan tidak valid atau telah kedaluwarsa'));
  }

  await UserRepositories.updatePassword(user.id, password);

  return response(res, 200, 'Kata sandi berhasil diubah, silakan masuk kembali');
};

export const loginWithGoogle = async (req, res, next) => {
  const { credential } = req.validated;

  // Verify Google ID token via Google's tokeninfo endpoint (no extra library needed)
  let googlePayload;
  try {
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
    );
    if (!verifyRes.ok) {
      return next(new AuthenticationError('Token Google tidak valid'));
    }
    googlePayload = await verifyRes.json();
  } catch {
    return next(new AuthenticationError('Gagal memverifikasi token Google'));
  }

  // Validate that the token was issued for our app
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && googlePayload.aud !== clientId) {
    return next(new AuthenticationError('Token Google tidak valid untuk aplikasi ini'));
  }

  const { sub: googleId, email, name: fullname, picture } = googlePayload;

  if (!googleId || !email) {
    return next(new AuthenticationError('Data akun Google tidak lengkap'));
  }

  // Find or create user
  const userId = await UserRepositories.findOrCreateGoogleUser({
    googleId,
    email,
    fullname: fullname || email.split('@')[0],
    picture: picture || null,
  });

  // Generate tokens
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

  return response(res, 200, 'Login dengan Google berhasil', {
    accessToken,
    refreshToken,
  });
};

