import { createClient } from 'redis';

class CacheService {
  constructor() {
    const redisUrl = process.env.REDIS_URL || process.env.REDISURL;
    this._client = redisUrl
      ? createClient({ url: redisUrl })
      : createClient({
        password: process.env.REDIS_PASSWORD || process.env.REDISPASSWORD,
        socket: {
          host: process.env.REDIS_HOST || process.env.REDISHOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || process.env.REDISPORT || '6379'),
        },
      });

    this._client.on('error', (error) => {
      console.error('[Redis Error]', error.message || error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 3600) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) throw new Error('Cache tidak ditemukan');

    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

export default CacheService;
