import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class InsightRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async saveInsight({ userId, weeklySummaryId = null, periodType = 'weekly', insightText }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO insights
               (id, user_id, weekly_summary_id, period_type, insight_text, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
      values: [id, userId, weeklySummaryId, periodType, insightText, createdAt],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getInsightsByUser(userId, { limit = 10, offset = 0 } = {}) {
    const query = {
      text: `SELECT * FROM insights
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
      values: [userId, limit, offset],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getLatestInsight(userId) {
    const query = {
      text: `SELECT * FROM insights
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }
}

export default new InsightRepositories();
