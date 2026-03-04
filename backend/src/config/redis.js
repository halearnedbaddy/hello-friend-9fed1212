// ═══════════════════════════════════════════════════════════════════════════
// Redis Cache Configuration
// ═══════════════════════════════════════════════════════════════════════════

const redis = require('redis');

let redisClient;

const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis retry time exhausted');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await new Promise((resolve, reject) => {
      redisClient.ping((err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });

    return redisClient;
  } catch (error) {
    console.warn('⚠️  Redis not available, continuing without cache');
    return null;
  }
};

const getRedis = () => redisClient;

const cacheSet = async (key, value, ttl = 3600) => {
  try {
    if (!redisClient) return;
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

const cacheGet = async (key) => {
  try {
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const cacheDel = async (key) => {
  try {
    if (!redisClient) return;
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

module.exports = {
  initializeRedis,
  getRedis,
  cacheSet,
  cacheGet,
  cacheDel
};
