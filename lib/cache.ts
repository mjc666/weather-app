import NodeCache from 'node-cache';
import { Redis } from '@upstash/redis';

const CACHE_PREFIX = 'weather-app:';

// Initialize Redis client if environment variables are available
const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;

  try {
    let url = process.env.REDIS_URL;
    let token = process.env.REDIS_TOKEN || '';

    // Handle redis:// protocol: convert to https and extract password if present
    if (url.startsWith('redis://')) {
      const parsed = new URL(url);
      token = parsed.password || token;
      // Upstash REST API expects https://host:port
      url = `https://${parsed.hostname}:${parsed.port}`;
    } else if (url.startsWith('rediss://')) {
      const parsed = new URL(url);
      token = parsed.password || token;
      // Upstash REST API expects https://host:port
      url = `https://${parsed.hostname}:${parsed.port}`;
    }

    return new Redis({
      url,
      token,
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
