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
  pgm.createTable('weekly_summaries', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    week_start: {
      type: 'DATE',
      notNull: true,
    },
    week_end: {
      type: 'DATE',
      notNull: true,
    },
    average_stress_level: {
      type: 'FLOAT',
      notNull: true,
    },
    average_sleep_hours: {
      type: 'FLOAT',
      notNull: true,
    },
    average_screen_time_hours: {
      type: 'FLOAT',
      notNull: true,
    },
    average_study_hours: {
      type: 'FLOAT',
      notNull: true,
    },
    stress_trend: {
      type: 'VARCHAR(20)',
      notNull: false,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'weekly_summaries',
    'fk_weekly_summaries.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('weekly_summaries');
};
