/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // daily_activities: queries sorted by date per user
  pgm.createIndex('daily_activities', ['user_id', 'activity_date']);

  // weekly_summaries: queries sorted by week per user
  pgm.createIndex('weekly_summaries', ['user_id', 'week_start']);

  // authentications: token lookup on every refresh/logout
  pgm.createIndex('authentications', ['token']);

  // recommendations: latest recommendations per user
  pgm.createIndex('recommendations', ['user_id', 'created_at']);

  // insights: latest insights per user
  pgm.createIndex('insights', ['user_id', 'created_at']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropIndex('daily_activities', ['user_id', 'activity_date']);
  pgm.dropIndex('weekly_summaries', ['user_id', 'week_start']);
  pgm.dropIndex('authentications', ['token']);
  pgm.dropIndex('recommendations', ['user_id', 'created_at']);
  pgm.dropIndex('insights', ['user_id', 'created_at']);
};
