import NodeCache from 'node-cache';
import Redis from 'ioredis';

const CACHE_PREFIX = 'weather-app:';

// Initialize Redis client if environment variables are available
const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;

  try {
    return new Redis(process.env.REDIS_URL, {
      // Avoid hanging the server if Redis is unreachable
      connectTimeout: 5000,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  } catch (e) {
    console.error('Failed to initialize Redis client', e);
    return null;
  }
};

const redis = getRedisClient();

// Local fallback cache
const localCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const getCache = async (key: string) => {
  const prefixedKey = CACHE_PREFIX + key;
  if (redis) {
    try {
      return await redis.get(prefixedKey);
    } catch (e) {
      console.error('Redis get error', e);
      return null;
    }
  }
  return localCache.get(prefixedKey);
};

export const setCache = async (key: string, value: any, ttl?: number) => {
  const prefixedKey = CACHE_PREFIX + key;
  
  // Serialize complex objects/Buffers for Redis (as it stores strings/buffers)
  const serializedValue = JSON.stringify(value);

  if (redis) {
    try {
      if (ttl) {
        await redis.set(prefixedKey, serializedValue, 'EX', ttl);
      } else {
        await redis.set(prefixedKey, serializedValue);
      }
    } catch (e) {
      console.error('Redis set error', e);
    }
  } else {
    if (ttl) {
      localCache.set(prefixedKey, value, ttl);
    } else {
      localCache.set(prefixedKey, value);
    }
  }
};
