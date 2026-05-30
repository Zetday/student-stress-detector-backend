import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class WeeklySummaryRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async saveSummary({
    userId,
    weekStart,
    weekEnd,
    averageStressLevel,
    averageSleepHours,
    averageScreenTimeHours,
    averageStudyHours,
    stressTrend = null,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: `INSERT INTO weekly_summaries
               (id, user_id, week_start, week_end,
                average_stress_level, average_sleep_hours,
                average_screen_time_hours, average_study_hours,
                stress_trend, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
      values: [
        id, userId, weekStart, weekEnd,
        averageStressLevel, averageSleepHours,
        averageScreenTimeHours, averageStudyHours,
        stressTrend, createdAt,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getSummariesByUser(userId, { limit = 10, offset = 0 } = {}) {
    const query = {
      text: `SELECT * FROM weekly_summaries
             WHERE user_id = $1
             ORDER BY week_start DESC
             LIMIT $2 OFFSET $3`,
      values: [userId, limit, offset],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getLatestSummary(userId) {
    const query = {
      text: `SELECT * FROM weekly_summaries
             WHERE user_id = $1
             ORDER BY week_start DESC
             LIMIT 1`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  /**
   * Aggregate this week's daily_activities for the given user.
   * Returns averages needed to build the weekly summary payload.
   */
  async aggregateWeekActivities(userId, weekStart, weekEnd) {
    const query = {
      text: `SELECT
               COUNT(*)::int                         AS total_days,
               AVG(sleep_hours)::float               AS average_sleep_hours,
               AVG(screen_time_hours)::float         AS average_screen_time_hours,
               AVG(study_hours)::float               AS average_study_hours,
               AVG(mood_score)::float                AS average_mood_score,
               AVG(fatigue_level)::float             AS average_fatigue_level,
               AVG(physical_activity_minutes)::float AS average_physical_activity,
               AVG(financial_worry_score)::float     AS average_financial_worry,
               AVG(health_condition_score)::float    AS average_health_condition,
               AVG(caffeine_intake_mg)::float        AS average_caffeine_intake
             FROM daily_activities
             WHERE user_id = $1
               AND activity_date BETWEEN $2 AND $3`,
      values: [userId, weekStart, weekEnd],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  /**
   * Average stress score and details from predictions for the week.
   */
  async aggregateWeekPredictions(userId, weekStart, weekEnd) {
    const query = {
      text: `SELECT
               AVG(stress_score)::float AS average_stress_level,
               (
                 SELECT id FROM stress_predictions
                 WHERE user_id = $1 AND prediction_date BETWEEN $2 AND $3
                 ORDER BY prediction_date DESC, created_at DESC
                 LIMIT 1
               ) AS latest_prediction_id,
               ARRAY(
                 SELECT stress_level FROM stress_predictions
                 WHERE user_id = $1 AND prediction_date BETWEEN $2 AND $3
                 ORDER BY prediction_date ASC, created_at ASC
               ) AS daily_stress_levels
             FROM stress_predictions
             WHERE user_id = $1
               AND prediction_date BETWEEN $2 AND $3`,
      values: [userId, weekStart, weekEnd],
    };
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  /**
   * Derive stress trend by comparing this week avg to previous week avg.
   * Returns 'improving' | 'worsening' | 'stable'
   */
  async deriveStressTrend(userId, weekStart) {
    const query = {
      text: `SELECT average_stress_level FROM weekly_summaries
             WHERE user_id = $1 AND week_end < $2
             ORDER BY week_end DESC LIMIT 1`,
      values: [userId, weekStart],
    };
    const prevResult = await this.pool.query(query);
    const prev = prevResult.rows[0];

    const currQuery = {
      text: `SELECT AVG(stress_score)::float AS avg FROM stress_predictions
             WHERE user_id = $1 AND prediction_date >= $2`,
      values: [userId, weekStart],
    };
    const currResult = await this.pool.query(currQuery);
    const curr = currResult.rows[0]?.avg;

    if (!prev || curr === null) return 'stable';
    const diff = curr - prev.average_stress_level;
    if (diff <= -0.5) return 'improving';
    if (diff >= 0.5) return 'worsening';
    return 'stable';
  }
}

export default new WeeklySummaryRepositories();
