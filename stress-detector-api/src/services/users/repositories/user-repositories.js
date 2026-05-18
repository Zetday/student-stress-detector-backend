import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import CacheService from '../../../cache/redis-service.js';

class UserRepositories {
  constructor() {
    this.pool = new Pool();
    this.cacheService = new CacheService();
  }

  async createUser({ fullname, email, password }) {
    const id = nanoid(16);
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO users (id, fullname, email, password, role, created_at, updated_at)
             VALUES ($1, $2, $3, $4, 'student', $5, $6)
             RETURNING id`,
      values: [id, fullname, email, hashedPassword, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async verifyNewEmail(email) {
    const query = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };

    const result = await this.pool.query(query);

    return result.rows.length > 0;
  }

  async getUserById(id) {
    const cacheKey = `users:${id}`;

    try {
      const user = await this.cacheService.get(cacheKey);
      return { data: JSON.parse(user), fromCache: true };
    } catch {
      const query = {
        text: 'SELECT * FROM users WHERE id = $1',
        values: [id],
      };

      const result = await this.pool.query(query);
      const user = result.rows[0];

      if (user) {
        await this.cacheService.set(cacheKey, JSON.stringify(user));
      }

      return { data: user, fromCache: false };
    }
  }

  async deleteUserCache(id) {
    await this.cacheService.delete(`users:${id}`);
  }

  async verifyUserCredential(email, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE email = $1',
      values: [email],
    };

    const user = await this.pool.query(query);
    if (user.rows.length === 0) {
      return null;
    }

    const { id, password: hashedPassword } = user.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatch) {
      return null;
    }
    return id;
  }

  async getUsersByEmail(email) {
    const query = {
      text: 'SELECT id, email, fullname FROM users WHERE email LIKE $1',
      values: [`%${email}%`],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default new UserRepositories();
