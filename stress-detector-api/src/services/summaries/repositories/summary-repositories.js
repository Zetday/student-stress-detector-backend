/* eslint-disable camelcase */
import { Pool } from 'pg';
import { nanoid } from 'nanoid';
import InsightRepositories from '../../insights/repositories/insight-repositories.js';
import RecommendationRepositories from '../../recommendations/repositories/recommendation-repositories.js';
import { generateWeeklyRAG } from '../../../ai/ml-client.js';
import UserRepositories from '../../users/repositories/user-repositories.js';
import ProducerService from '../../exports/repositories/producer-service.js';

class WeeklySummaryRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async saveSummary({
    userId,
    periodStart,
    periodEnd,
    daysCount,
    avgSleepHours,
    avgStudyHours,
    avgScreenTimeHours,
    avgSocialMediaHours,
    avgPhysicalActivity,
    totalPhysicalActivityMinutes,
    avgMoodScore,
    avgFatigueLevel,
    avgAssignmentLoad,
    avgDeadlinePressure,
    avgStressScore,
    dominantStressLevel,
    highStressDays,
    maxStressScore = 0,
    stressTrend,
    summaryStatus = 'generated',
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: `INSERT INTO summaries (
               id, user_id, period_start, period_end, days_count,
               avg_sleep_hours, avg_study_hours, avg_screen_time_hours, avg_social_media_hours,
               avg_physical_activity, total_physical_activity_minutes,
               avg_mood_score, avg_fatigue_level, avg_assignment_load, avg_deadline_pressure,
               avg_stress_score, dominant_stress_level, high_stress_days, max_stress_score,
               stress_trend, summary_status,
               created_at, updated_at
             ) VALUES (
               $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
             ) RETURNING *`,
      values: [
        id,
        userId,
        periodStart,
        periodEnd,
        daysCount,
        avgSleepHours,
        avgStudyHours,
        avgScreenTimeHours,
        avgSocialMediaHours,
        avgPhysicalActivity,
        totalPhysicalActivityMinutes,
        avgMoodScore,
        avgFatigueLevel,
        avgAssignmentLoad,
        avgDeadlinePressure,
        avgStressScore,
        dominantStressLevel,
        highStressDays,
        maxStressScore,
        stressTrend,
        summaryStatus,
        createdAt,
        updatedAt,
      ],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getSummariesByUser(userId, { limit = 10, offset = 0 } = {}) {
    const query = {
      text: `SELECT * FROM summaries
             WHERE user_id = $1
             ORDER BY period_start DESC
             LIMIT $2 OFFSET $3`,
      values: [userId, limit, offset],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async getLatestSummary(userId) {
    const query = {
      text: `SELECT * FROM summaries
             WHERE user_id = $1
             ORDER BY period_start DESC
             LIMIT 1`,
      values: [userId],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async getSummaryByPeriod(userId, periodStart, periodEnd) {
    const query = {
      text: `SELECT * FROM summaries
             WHERE user_id = $1 AND period_start = $2 AND period_end = $3`,
      values: [userId, periodStart, periodEnd],
    };
    const result = await this.pool.query(query);
    return result.rows[0] || null;
  }

  async deleteSummaryByPeriod(userId, periodStart, periodEnd) {
    const summary = await this.getSummaryByPeriod(userId, periodStart, periodEnd);
    if (!summary) return;

    await this.pool.query({
      text: 'DELETE FROM insights WHERE summary_id = $1',
      values: [summary.id],
    });
    await this.pool.query({
      text: 'DELETE FROM recommendations WHERE summary_id = $1',
      values: [summary.id],
    });
    await this.pool.query({
      text: 'DELETE FROM summaries WHERE id = $1',
      values: [summary.id],
    });
  }

  async generateWeeklySummaryInternal(userId, referenceDate) {
    const now = new Date(referenceDate);
    if (isNaN(now.getTime())) {
      throw new Error('Format tanggal tidak valid');
    }

    const dayOfWeek = now.getDay(); // 0=Sun
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // shift to Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // 1. Aggregate daily_activities
    const activityStats = await this.aggregateWeekActivities(
      userId, weekStartStr, weekEndStr,
    );

    if (!activityStats || activityStats.total_days < 7) {
      return {
        success: false,
        code: 'INSUFFICIENT_DAYS',
        message: 'Dibutuhkan data aktivitas lengkap selama 7 hari (1 minggu) untuk membuat ringkasan mingguan',
      };
    }

    // Delete existing weekly summary for this week to avoid duplication
    await this.deleteSummaryByPeriod(userId, weekStartStr, weekEndStr);

    // 2. Aggregate stress_predictions
    const predictionStats = await this.aggregateWeekPredictions(
      userId, weekStartStr, weekEndStr,
    );

    const avgStressLevel = predictionStats?.average_stress_level ?? 0;

    // 3. Derive stress trend vs. previous week
    const stressTrend = await this.deriveStressTrend(userId, weekStartStr);

    // 4. Collect daily stress levels for the week (for insight weekly_stress_levels)
    const dailyPredictions = predictionStats?.daily_stress_levels ?? [];

    // Determine dominant stress level label for the week
    const counts = { low: 0, moderate: 0, high: 0 };
    dailyPredictions.forEach((level) => {
      const l = (level || '').toLowerCase();
      const normalized = l === 'medium' ? 'moderate' : l;
      if (counts[normalized] !== undefined) {
        counts[normalized]++;
      }
    });

    let dominantStressLevel = 'low';
    let maxCount = counts.low;
    if (counts.moderate > maxCount) {
      dominantStressLevel = 'moderate';
      maxCount = counts.moderate;
    }
    if (counts.high > maxCount) {
      dominantStressLevel = 'high';
    }

    // Map moderate back to medium for ML service
    const stressLevelLabel = dominantStressLevel === 'moderate' ? 'medium' : dominantStressLevel;

    const highStressDays = dailyPredictions.filter(
      (level) => (level || '').toLowerCase() === 'high',
    ).length;

    // 5. Save weekly summary
    const summary = await this.saveSummary({
      userId,
      periodStart: weekStartStr,
      periodEnd: weekEndStr,
      daysCount: activityStats.total_days,
      avgSleepHours: activityStats.average_sleep_hours ?? 0,
      avgStudyHours: activityStats.average_study_hours ?? 0,
      avgScreenTimeHours: activityStats.average_screen_time_hours ?? 0,
      avgSocialMediaHours: activityStats.average_social_media_hours ?? 0,
      avgPhysicalActivity: activityStats.average_physical_activity ?? 0,
      totalPhysicalActivityMinutes: activityStats.total_physical_activity_minutes ?? 0,
      avgMoodScore: activityStats.average_mood_score ?? 0,
      avgFatigueLevel: activityStats.average_fatigue_level ?? 0,
      avgAssignmentLoad: activityStats.average_assignment_load ?? 0,
      avgDeadlinePressure: activityStats.average_deadline_pressure ?? 0,
      avgStressScore: avgStressLevel,
      dominantStressLevel,
      highStressDays,
      maxStressScore: predictionStats?.max_stress_score ?? 0,
      stressTrend,
      summaryStatus: 'generated',
    });

    // 6. Fetch daily history for Weekly RAG payload
    const dailyHistoryRows = await this.getWeeklyHistory(userId, weekStartStr, weekEndStr);
    const history = dailyHistoryRows.map((row) => {
      const sleep = parseFloat(row.sleep_hours) || null;
      const study = parseFloat(row.study_hours) || null;
      const screen = parseFloat(row.screen_time_hours) || null;
      const socialMedia = parseFloat(row.social_media_hours) || null;
      const physical = parseInt(row.physical_activity_minutes) || null;
      const mood = parseInt(row.mood_score) || null;
      const fatigue = parseInt(row.fatigue_level) || null;
      const assignment = parseInt(row.assignment_load) || null;
      const deadline = parseInt(row.deadline_pressure) || null;

      // Calculate derived indices
      const socialMediaRatio = (screen && screen > 0) ? (socialMedia / screen) : 0;
      const studyScreenBalance = (study !== null && screen !== null) ? study / (screen + 1.0) : null;
      const academicPressure = (assignment !== null && deadline !== null) ? (assignment + deadline) / 2.0 : null;
      const recovery = (sleep !== null && mood !== null && fatigue !== null) ? (sleep * mood) / (fatigue + 1.0) : null;
      const digitalPressure = (screen !== null && socialMedia !== null) ? screen + socialMedia : null;

      return {
        activity_date: row.activity_date ? new Date(row.activity_date).toISOString().split('T')[0] : null,
        sleep_hours: sleep,
        physical_activity_minutes: physical,
        study_hours: study,
        screen_time_hours: screen,
        social_media_hours: socialMedia,
        mood_score: mood,
        fatigue_level: fatigue,
        assignment_load: assignment,
        deadline_pressure: deadline,
        social_media_ratio: socialMediaRatio,
        study_screen_balance: studyScreenBalance,
        academic_pressure_index: academicPressure,
        recovery_index: recovery,
        digital_pressure_index: digitalPressure,
        stress_level: row.stress_level || null,
      };
    });

    const weeklyRAGPayload = {
      user_id: userId,
      weekly_stress_prediction: stressLevelLabel,
      history,
    };

    // 7. Call Weekly RAG service
    const weeklyRAGResult = await generateWeeklyRAG(weeklyRAGPayload);

    let insight = null;
    const savedRecommendations = [];

    // 8. Save insight if available
    if (weeklyRAGResult?.insight) {
      insight = await InsightRepositories.saveInsight({
        userId,
        summaryId: summary.id,
        insightText: weeklyRAGResult.insight,
      });
    }

    // 9. Save all recommendations if available
    if (weeklyRAGResult?.recommendations?.length > 0) {
      for (const rec of weeklyRAGResult.recommendations) {
        const savedRec = await RecommendationRepositories.saveRecommendation({
          userId,
          summaryId: summary.id,
          category: rec.category,
          priorityLevel: rec.priority_level,
          title: rec.title,
          recommendationText: rec.text,
        });
        savedRecommendations.push(savedRec);
      }
    }

    // 10. Automatically queue weekly summary report email export
    try {
      const userResult = await UserRepositories.getUserById(userId);
      const user = userResult?.data;
      if (user && user.email) {
        const payload = {
          userId,
          targetEmail: user.email,
          type: 'weekly',
        };
        await ProducerService.sendMessage('export:stress-results', payload);
        console.log(`[Info] Weekly summary report email queued for user: ${user.email}`);
      }
    } catch (err) {
      console.error(`[Warning] Failed to queue email export for weekly summary: ${err.message}`);
    }

    return {
      success: true,
      summary,
      insight,
      recommendation: savedRecommendations[0] || null, // for backward compatibility
      recommendations: savedRecommendations,
      mlAvailable: weeklyRAGResult !== null && weeklyRAGResult.success !== false,
    };
  }

  /**
   * Aggregate this week's daily_activities for the given user.
   * Returns averages needed to build the weekly summary payload.
   */
  async aggregateWeekActivities(userId, weekStart, weekEnd) {
    const query = {
      text: `SELECT * FROM daily_activities
             WHERE user_id = $1
               AND activity_date BETWEEN $2 AND $3`,
      values: [userId, weekStart, weekEnd],
    };
    const result = await this.pool.query(query);
    const rows = result.rows;

    if (rows.length === 0) {
      return {
        total_days: 0,
        average_sleep_hours: 0,
        average_screen_time_hours: 0,
        average_study_hours: 0,
        average_social_media_hours: 0,
        average_mood_score: 0,
        average_fatigue_level: 0,
        average_physical_activity: 0,
        total_physical_activity_minutes: 0,
        average_assignment_load: 0,
        average_deadline_pressure: 0,
        average_social_media_ratio: 0,
        average_study_screen_balance: 0,
        average_academic_pressure_index: 0,
        average_recovery_index: 0,
        average_digital_pressure_index: 0,
      };
    }

    const totalDays = rows.length;
    let sumSleep = 0, sumScreen = 0, sumStudy = 0, sumSocialMedia = 0, sumMood = 0, sumFatigue = 0;
    let sumPhysical = 0, totalPhysical = 0, sumAssignment = 0, sumDeadline = 0;
    let sumSocialMediaRatio = 0, sumStudyScreenBalance = 0, sumAcademicPressure = 0, sumRecovery = 0, sumDigitalPressure = 0;

    rows.forEach((row) => {
      const sleep = parseFloat(row.sleep_hours) || 0;
      const study = parseFloat(row.study_hours) || 0;
      const screen = parseFloat(row.screen_time_hours) || 0;
      const socialMedia = parseFloat(row.social_media_hours) || 0;
      const physical = parseInt(row.physical_activity_minutes) || 0;
      const mood = parseInt(row.mood_score) || 0;
      const fatigue = parseInt(row.fatigue_level) || 0;
      const assignment = parseInt(row.assignment_load) || 0;
      const deadline = parseInt(row.deadline_pressure) || 0;

      sumSleep += sleep;
      sumStudy += study;
      sumScreen += screen;
      sumSocialMedia += socialMedia;
      sumPhysical += physical;
      totalPhysical += physical;
      sumMood += mood;
      sumFatigue += fatigue;
      sumAssignment += assignment;
      sumDeadline += deadline;

      // Calculate indices per day
      const socialMediaRatio = screen > 0 ? (socialMedia / screen) : 0;
      const studyScreenBalance = study / (screen + 1.0);
      const academicPressure = (assignment + deadline) / 2.0;
      const recovery = (sleep * mood) / (fatigue + 1.0);
      const digitalPressure = screen + socialMedia;

      sumSocialMediaRatio += socialMediaRatio;
      sumStudyScreenBalance += studyScreenBalance;
      sumAcademicPressure += academicPressure;
      sumRecovery += recovery;
      sumDigitalPressure += digitalPressure;
    });

    return {
      total_days: totalDays,
      average_sleep_hours: sumSleep / totalDays,
      average_screen_time_hours: sumScreen / totalDays,
      average_study_hours: sumStudy / totalDays,
      average_social_media_hours: sumSocialMedia / totalDays,
      average_mood_score: sumMood / totalDays,
      average_fatigue_level: sumFatigue / totalDays,
      average_physical_activity: sumPhysical / totalDays,
      total_physical_activity_minutes: totalPhysical,
      average_assignment_load: sumAssignment / totalDays,
      average_deadline_pressure: sumDeadline / totalDays,
      average_social_media_ratio: sumSocialMediaRatio / totalDays,
      average_study_screen_balance: sumStudyScreenBalance / totalDays,
      average_academic_pressure_index: sumAcademicPressure / totalDays,
      average_recovery_index: sumRecovery / totalDays,
      average_digital_pressure_index: sumDigitalPressure / totalDays,
    };
  }

  /**
   * Average stress score and details from predictions for the week.
   */
  async aggregateWeekPredictions(userId, weekStart, weekEnd) {
    const query = {
      text: `SELECT
               AVG(stress_score)::float AS average_stress_level,
               MAX(stress_score)::float AS max_stress_score,
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
      text: `SELECT avg_stress_score FROM summaries
             WHERE user_id = $1 AND period_end < $2
             ORDER BY period_end DESC LIMIT 1`,
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
    const diff = curr - parseFloat(prev.avg_stress_score);
    if (diff <= -0.5) return 'improving';
    if (diff >= 0.5) return 'worsening';
    return 'stable';
  }

  /**
   * Retrieve joined daily activities and stress predictions for a given user in a week.
   */
  async getWeeklyHistory(userId, weekStart, weekEnd) {
    const query = {
      text: `SELECT
               da.activity_date,
               da.sleep_hours,
               da.physical_activity_minutes,
               da.study_hours,
               da.screen_time_hours,
               da.social_media_hours,
               da.mood_score,
               da.fatigue_level,
               da.assignment_load,
               da.deadline_pressure,
               sp.stress_level,
               sp.stress_score
             FROM daily_activities da
             LEFT JOIN stress_predictions sp ON da.id = sp.activity_id
             WHERE da.user_id = $1
               AND da.activity_date BETWEEN $2 AND $3
             ORDER BY da.activity_date ASC`,
      values: [userId, weekStart, weekEnd],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }
}

export default new WeeklySummaryRepositories();
