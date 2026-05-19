import ProfileRepositories from '../repositories/profile-repositories.js';
import response from '../../../utils/response.js';
import {
  InvariantError,
  AuthenticationError,
  NotFoundError,
} from '../../../exceptions/index.js';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import path from 'path';
import {
  deleteUploadedFile,
  UPLOAD_FOLDER,
  buildFilename,
} from '../../uploads/storage/storage-config.js';
import UserRepositories from '../../users/repositories/user-repositories.js';

export const getProfile = async (req, res, next) => {
  const { id } = req.user;

  const { data: user } = await UserRepositories.getUserById(id);

  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }

  // eslint-disable-next-line no-unused-vars
  const { password, ...profile } = user;

  return response(res, 200, 'Profile berhasil ditampilkan', profile);
};

export const updateInfo = async (req, res, next) => {
  const { id } = req.user;
  const { fullname, email } = req.validated;

  const isEmailExist = await ProfileRepositories.verifyNewEmail(email, id);

  if (isEmailExist) {
    return next(
      new InvariantError('Gagal memperbarui profil. Email sudah digunakan.'),
    );
  }

  const updatedUser = await ProfileRepositories.updateUserInfo(id, {
    fullname,
    email,
  });

  if (!updatedUser) {
    return next(new InvariantError('Profil gagal diperbarui'));
  }

  return response(res, 200, 'Profil berhasil diperbarui', updatedUser);
};

export const updatePassword = async (req, res, next) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.validated;

  const isMatch = await ProfileRepositories.verifyUserPasswordById(
    id,
    oldPassword,
  );

  if (!isMatch) {
    return next(new AuthenticationError('Password lama tidak sesuai'));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await ProfileRepositories.updateUserPassword(
    id,
    hashedPassword,
  );

  if (!updatedUser) {
    return next(new InvariantError('Password gagal diperbarui'));
  }

  return response(res, 200, 'Password berhasil diperbarui', {
    id: updatedUser.id,
  });
};

export const uploadProfilePicture = async (req, res, next) => {
  // multer already ran; if no file was attached, reject early
  if (!req.file) {
    return next(new InvariantError('File gambar wajib diunggah'));
  }

  const { id } = req.user;
  const newFilename = buildFilename(req.file.mimetype);
  const filePath = path.join(UPLOAD_FOLDER, newFilename);

  try {
    // Process image with sharp: resize, webp format, remove metadata
    await sharp(req.file.buffer)
      .resize(500, 500, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);
  } catch (err) {
    console.error('[Sharp Error Detail]:', err);
    return next(new InvariantError('Gagal memproses gambar'));
  }

  try {
    // 1. Fetch the currently stored filename so we can delete it afterwards
    const oldFilename = await ProfileRepositories.getProfilePictureById(id);

    // 2. Persist the new filename to the database
    const updatedUser = await ProfileRepositories.updateProfilePicture(
      id,
      newFilename,
    );

    if (!updatedUser) {
      // DB update failed — clean up the file we just saved
      await deleteUploadedFile(newFilename);
      return next(new InvariantError('Foto profil gagal diperbarui'));
    }

    // 3. Remove the previous file from disk (fire-and-forget)
    if (oldFilename) {
      await deleteUploadedFile(oldFilename);
    }

    const baseUrl =
      process.env.BASE_URL ||
      `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`;
    const fileUrl = `${baseUrl}/uploads/images/${encodeURIComponent(newFilename)}`;

    return response(res, 200, 'Foto profil berhasil diunggah', {
      id: updatedUser.id,
      profileImageUrl: fileUrl,
    });
  } catch (err) {
    // Something unexpected happened — delete the orphaned upload
    await deleteUploadedFile(newFilename);
    return next(err);
  }
};
