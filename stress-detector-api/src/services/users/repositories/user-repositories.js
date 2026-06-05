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

  async saveResetToken(email, token, expiresAt) {
    const query = {
      text: `UPDATE users 
             SET reset_token = $1, reset_token_expires_at = $2, updated_at = $3
             WHERE email = $4
             RETURNING id`,
      values: [token, expiresAt, new Date().toISOString(), email],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async verifyResetToken(token) {
    const query = {
      text: `SELECT id, email, reset_token_expires_at FROM users 
             WHERE reset_token = $1`,
      values: [token],
    };
    const result = await this.pool.query(query);
    if (result.rows.length === 0) {
      return null;
    }
    const user = result.rows[0];
    const expiresAt = new Date(user.reset_token_expires_at);
    if (expiresAt < new Date()) {
      return null; // Expired
    }
    return user;
  }

  async updatePassword(id, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedAt = new Date().toISOString();
    const query = {
      text: `UPDATE users 
             SET password = $1, reset_token = NULL, reset_token_expires_at = NULL, updated_at = $2
             WHERE id = $3`,
      values: [hashedPassword, updatedAt, id],
    };
    await this.pool.query(query);
    await this.deleteUserCache(id);
  }

  async getUserByGoogleId(googleId) {
    const query = {
      text: 'SELECT id FROM users WHERE google_id = $1',
      values: [googleId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  /**
   * Find or create a user for Google OAuth.
   * Priority: google_id match → email match (link account) → create new user
   * @param {{ googleId: string, email: string, fullname: string, picture?: string }} param
   * @returns {string} userId
   */
  async findOrCreateGoogleUser({ googleId, email, fullname, picture }) {
    // 1. Try to find by google_id
    const byGoogleId = await this.getUserByGoogleId(googleId);
    if (byGoogleId) {
      return byGoogleId.id;
    }

    // 2. Try to find by email (link existing account)
    const byEmail = await this.pool.query({
      text: 'SELECT id FROM users WHERE email = $1',
      values: [email],
    });

    if (byEmail.rows.length > 0) {
      const existingId = byEmail.rows[0].id;
      const updatedAt = new Date().toISOString();
      // Link google_id to existing account
      await this.pool.query({
        text: 'UPDATE users SET google_id = $1, updated_at = $2 WHERE id = $3',
        values: [googleId, updatedAt, existingId],
      });
      await this.deleteUserCache(existingId);
      return existingId;
    }

    // 3. Create new user (no password)
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    await this.pool.query({
      text: `INSERT INTO users
               (id, fullname, email, password, role, profile_image, google_id, created_at, updated_at)
             VALUES ($1, $2, $3, NULL, 'student', $4, $5, $6, $6)`,
      values: [id, fullname, email, picture || null, googleId, createdAt],
    });
    return id;
  }
}

export default new UserRepositories();
