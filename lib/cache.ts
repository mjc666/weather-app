import NodeCache from 'node-cache';
import { Redis } from '@upstash/redis';

const CACHE_PREFIX = 'weather-app:';

// Initialize Redis client if environment variables are available
const redis = process.env.REDIS_URL ? new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN || '',
}) : null;

// Local fallback cache
const localCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const getCache = async (key: string) => {
  const prefixedKey = CACHE_PREFIX + key;
  if (redis) {
    return await redis.get(prefixedKey);
  }
  return localCache.get(prefixedKey);
};

export const setCache = async (key: string, value: any, ttl?: number) => {
  const prefixedKey = CACHE_PREFIX + key;
  if (redis) {
    if (ttl) {
      await redis.set(prefixedKey, value, { ex: ttl });
    } else {
      await redis.set(prefixedKey, value);
    }
  } else {
    if (ttl) {
      localCache.set(prefixedKey, value, ttl);
    } else {
      localCache.set(prefixedKey, value);
    }
  }
};
