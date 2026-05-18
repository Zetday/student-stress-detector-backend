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
  pgm.createTable('stress_predictions', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    activity_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    prediction_date: {
      type: 'DATE',
      notNull: true,
    },
    stress_level: {
      type: 'VARCHAR(20)',
      notNull: true,
    },
    stress_score: {
      type: 'FLOAT',
      notNull: true,
    },
    confidence_score: {
      type: 'FLOAT',
      notNull: false,
    },
    model_version: {
      type: 'VARCHAR(20)',
      notNull: false,
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
    },
  });

  pgm.addConstraint(
    'stress_predictions',
    'chk_stress_predictions.stress_level',
    "CHECK (stress_level IN ('low', 'moderate', 'high'))",
  );

  pgm.createIndex('stress_predictions', ['user_id', 'prediction_date']);

  pgm.addConstraint(
    'stress_predictions',
    'fk_stress_predictions.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );

  pgm.addConstraint(
    'stress_predictions',
    'fk_stress_predictions.activity_id_daily_activities.id',
    'FOREIGN KEY(activity_id) REFERENCES daily_activities(id) ON DELETE CASCADE',
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('stress_predictions');
};
