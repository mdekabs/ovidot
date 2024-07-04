import redisClient from '../redis.js';

/**
 * Middleware to check cache for existing responses.
 */
export const checkCache = async (req, res, next) => {
  const key = req.originalUrl;

  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      res.send(JSON.parse(cachedData));
    } else {
      next();
    }
  } catch (error) {
    console.error("Cache check failed:", error);
    next();
  }
};

/**
 * Middleware to cache responses.
 */
export const cacheResponse = (duration) => (req, res, next) => {
  const key = req.originalUrl;
  const sendResponse = res.send.bind(res);

  res.send = (body) => {
    redisClient.set(key, JSON.stringify(body), duration);
    sendResponse(body);
  };

  next();
};
