import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class RecommendationRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async saveRecommendation({
    userId,
    weeklySummaryId = null,
    periodType = 'weekly',
    category = null,
    recommendationText,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO recommendations
               (id, user_id, weekly_summary_id, period_type,
                category, recommendation_text, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7)
             RETURNING *`,
      values: [id, userId, weeklySummaryId, periodType, category, recommendationText, createdAt],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getRecommendationsByUser(userId, { limit = 10, offset = 0 } = {}) {
    const query = {
      text: `SELECT * FROM recommendations
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
      values: [userId, limit, offset],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getLatestRecommendation(userId) {
    const query = {
      text: `SELECT * FROM recommendations
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async markAsRead(id, userId) {
    const query = {
      text: `UPDATE recommendations
             SET is_read = TRUE
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
      values: [id, userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async getUnreadCount(userId) {
    const query = {
      text: `SELECT COUNT(*)::int AS unread_count
             FROM recommendations
             WHERE user_id = $1 AND is_read = FALSE`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0]?.unread_count || 0;
  }
}

export default new RecommendationRepositories();
