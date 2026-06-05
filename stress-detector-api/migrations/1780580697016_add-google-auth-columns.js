/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * Add google_id column and make password nullable to support Google OAuth login.
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  // Make password nullable (Google users don't have a password)
  pgm.alterColumn('users', 'password', {
    type: 'TEXT',
    notNull: false,
  });

  // Add google_id column
  pgm.addColumn('users', {
    google_id: {
      type: 'VARCHAR(100)',
      unique: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropColumn('users', 'google_id');

  pgm.alterColumn('users', 'password', {
    type: 'TEXT',
    notNull: true,
  });
};
