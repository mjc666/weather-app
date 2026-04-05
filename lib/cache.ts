import NodeCache from 'node-cache';
import Redis from 'ioredis';

const CACHE_PREFIX = 'weather-app:';

// Initialize Redis client if environment variables are available
const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;

  try {
    // ioredis internally handles connection string parsing using standard URL logic
    // We pass the string directly to ensure we stay within modern standards
    return new Redis(process.env.REDIS_URL, {
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
      const data = await redis.getBuffer(prefixedKey);
      if (!data) return null;

      // Try to treat as JSON
      try {
        const str = data.toString('utf8');
        return JSON.parse(str);
      } catch {
        // If not JSON, return as Buffer (for images)
        return data;
      }
    } catch (e) {
      console.error('Redis get error', e);
      return null;
    }
  }
  return localCache.get(prefixedKey);
};

export const setCache = async (key: string, value: any, ttl?: number) => {
  const prefixedKey = CACHE_PREFIX + key;

  if (redis) {
    try {
      // Determine if the value is a Buffer (image) or a JSON object
      const valToStore = Buffer.isBuffer(value) 
        ? value 
        : Buffer.from(JSON.stringify(value), 'utf8');
      
      if (ttl) {
        await redis.set(prefixedKey, valToStore, 'EX', ttl);
      } else {
        await redis.set(prefixedKey, valToStore);
      }
    } catch (e) {
      console.error('Redis set error', e);
    }
  } else {
    // Local cache stores original object directly
    if (ttl) {
      localCache.set(prefixedKey, value, ttl);
    } else {
      localCache.set(prefixedKey, value);
    }
  }
};
