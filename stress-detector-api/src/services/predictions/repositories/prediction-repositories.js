import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class PredictionRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async savePrediction({
    userId,
    activityId,
    predictionDate,
    stressLevel,
    stressScore,
    confidenceScore = null,
    modelVersion = null,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO stress_predictions
               (id, user_id, activity_id, prediction_date,
                stress_level, stress_score, confidence_score, model_version, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
      values: [
        id, userId, activityId, predictionDate,
        stressLevel, stressScore, confidenceScore, modelVersion, createdAt,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getPredictionsByUser(userId, { limit = 20, offset = 0 } = {}) {
    const query = {
      text: `SELECT * FROM stress_predictions
             WHERE user_id = $1
             ORDER BY prediction_date DESC, created_at DESC
             LIMIT $2 OFFSET $3`,
      values: [userId, limit, offset],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getLatestPrediction(userId) {
    const query = {
      text: `SELECT * FROM stress_predictions
             WHERE user_id = $1
             ORDER BY prediction_date DESC, created_at DESC
             LIMIT 1`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async getPredictionByActivityId(activityId) {
    const query = {
      text: 'SELECT * FROM stress_predictions WHERE activity_id = $1',
      values: [activityId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async updatePrediction({
    activityId,
    predictionDate,
    stressLevel,
    stressScore,
    confidenceScore = null,
    modelVersion = null,
  }) {
    const query = {
      text: `UPDATE stress_predictions SET
               prediction_date = $2,
               stress_level = $3,
               stress_score = $4,
               confidence_score = $5,
               model_version = $6
             WHERE activity_id = $1
             RETURNING *`,
      values: [
        activityId,
        predictionDate,
        stressLevel,
        stressScore,
        confidenceScore,
        modelVersion,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async getStressTrend(userId, days = 30) {
    const query = {
      text: `SELECT prediction_date, stress_score, stress_level
             FROM stress_predictions
             WHERE user_id = $1
               AND prediction_date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
             ORDER BY prediction_date ASC`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default new PredictionRepositories();
