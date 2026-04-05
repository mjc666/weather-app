import NodeCache from 'node-cache';
import { Redis } from '@upstash/redis';

const CACHE_PREFIX = 'weather-app:';

// Initialize Redis client if environment variables are available
const getRedisClient = () => {
  // Prefer the Upstash SDK-compatible variables first
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  // Fallback to REDIS_URL/TOKEN (common in Vercel Redis integrations)
  if (process.env.REDIS_URL) {
    try {
      const url = new URL(process.env.REDIS_URL);
      // If it's a standard Upstash REST URL, use it directly
      if (url.protocol === 'https:') {
        return new Redis({
          url: process.env.REDIS_URL,
          token: process.env.REDIS_TOKEN || url.password || '',
        });
      }
      // If it's a raw redis:// URL, the Upstash SDK cannot use it for REST calls.
      // We log a warning if we detect a raw protocol.
      console.warn('REDIS_URL is a raw redis:// connection string. This is not compatible with the Upstash REST SDK.');
      return null;
    } catch (e) {
      return null;
    }
  }

  return null;
};

const redis = getRedisClient();

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
