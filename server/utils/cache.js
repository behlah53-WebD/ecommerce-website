const Redis = require('ioredis');

let redis = null;

const getRedisClient = () => {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.warn('Redis connection error:', err.message);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }
  return redis;
};

const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    const client = getRedisClient();
    
    if (!client) {
      return next();
    }

    try {
      await client.connect();
      
      const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;
      const cached = await client.get(cacheKey);
      
      if (cached) {
        console.log(`Cache hit: ${cacheKey}`);
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200 && data?.success) {
          client.setex(cacheKey, ttlSeconds, JSON.stringify(data))
            .catch(err => console.warn('Cache set error:', err.message));
        }
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.warn('Cache middleware error:', err.message);
      next();
    }
  };
};

const invalidateCache = async (pattern) => {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.connect();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    console.warn('Cache invalidation error:', err.message);
  }
};

module.exports = {
  getRedisClient,
  cacheMiddleware,
  invalidateCache,
};