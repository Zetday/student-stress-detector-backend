const { Pool } = require('pg');
const fs = require('fs');

const envPath = fs.existsSync('./.env') ? './.env' : './.env.example';
require('dotenv').config({ path: envPath });

const pool = new Pool();

async function inspect() {
  try {
    const migrations = await pool.query('select * from pgmigrations order by id');
    console.log('MIGRATIONS');
    console.log(JSON.stringify(migrations.rows, null, 2));
  } catch (err) {
    console.error('MIGRATIONS_ERR', err.message);
  }

  try {
    const cols = await pool.query("select column_name, data_type from information_schema.columns where table_name='daily_activities' order by ordinal_position");
    console.log('COLUMNS');
    console.log(JSON.stringify(cols.rows, null, 2));
  } catch (err) {
    console.error('COLUMNS_ERR', err.message);
  }

  try {
    const tables = await pool.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
    console.log('TABLES');
    console.log(JSON.stringify(tables.rows.map(r => r.table_name), null, 2));
  } catch (err) {
    console.error('TABLES_ERR', err.message);
  }

  await pool.end();
}

inspect();
