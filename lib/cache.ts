import NodeCache from 'node-cache';
import { createClient } from '@vercel/kv';

const CACHE_PREFIX = 'weather-app:';

// Initialize KV client if environment variables are available
const kv = process.env.KV_REST_API_URL ? createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
}) : null;

// Local fallback cache
const localCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const getCache = async (key: string) => {
  const prefixedKey = CACHE_PREFIX + key;
  if (kv) {
    return await kv.get(prefixedKey);
  }
  return localCache.get(prefixedKey);
};

export const setCache = async (key: string, value: any, ttl?: number) => {
  const prefixedKey = CACHE_PREFIX + key;
  if (kv) {
    if (ttl) {
      await kv.set(prefixedKey, value, { ex: ttl });
    } else {
      await kv.set(prefixedKey, value);
    }
  } else {
    if (ttl) {
      localCache.set(prefixedKey, value, ttl);
    } else {
      localCache.set(prefixedKey, value);
    }
  }
};
