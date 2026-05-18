import UserRepositories from '../repositories/user-repositories.js';
import response from '../../../utils/response.js';
import { InvariantError, NotFoundError } from '../../../exceptions/index.js';

export const createUser = async (req, res, next) => {
  const { email, password, fullname } = req.validated;

  const isEmailExist = await UserRepositories.verifyNewEmail(email);

  if (isEmailExist) {
    return next(
      new InvariantError('Gagal menambahkan user. Email sudah digunakan.'),
    );
  }

  const user = await UserRepositories.createUser({
    email,
    password,
    fullname,
  });

  if (!user) {
    return next(new InvariantError('User gagal ditambahkan'));
  }

  return response(res, 201, 'User berhasil ditambahkan', user);
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  const { data: user, fromCache } = await UserRepositories.getUserById(id);

  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }

  if (fromCache) {
    res.setHeader('X-Data-Source', 'cache');
  } else {
    res.setHeader('X-Data-Source', 'database');
  }

  return response(res, 200, 'User berhasil ditampilkan', user);
};

export const getUsersByEmail = async (req, res, next) => {
  const email = req.query.email;
  const user = await UserRepositories.getUsersByEmail(email);
  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }
  return response(res, 200, 'User berhasil ditampilkan', { users: user });
};
