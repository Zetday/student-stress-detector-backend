import { Pool } from 'pg';
import fs from 'fs';
import 'dotenv/config';

const pool = new Pool();

const runSeed = async () => {
  try {
    const sql = fs.readFileSync('./seed.sql', 'utf8');
    console.log('Menjalankan seed.sql ke database...');
    await pool.query(sql);
    console.log('✅ Seeding database berhasil!');
  } catch (error) {
    console.error('❌ Gagal menjalankan seed:', error.message);
  } finally {
    await pool.end();
  }
};

runSeed();
