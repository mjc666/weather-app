import NodeCache from 'node-cache';
import { createClient } from '@vercel/kv';

// Initialize KV client if environment variables are available
const kv = process.env.KV_REST_API_URL ? createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
}) : null;

// Local fallback cache
const localCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export const getCache = async (key: string) => {
  if (kv) {
    return await kv.get(key);
  }
  return localCache.get(key);
};

export const setCache = async (key: string, value: any, ttl?: number) => {
  if (kv) {
    if (ttl) {
      await kv.set(key, value, { ex: ttl });
    } else {
      await kv.set(key, value);
    }
  } else {
    if (ttl) {
      localCache.set(key, value, ttl);
    } else {
      localCache.set(key, value);
    }
  }
};
