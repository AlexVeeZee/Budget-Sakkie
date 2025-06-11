const cache = new Map();
const cacheTimeout = (parseInt(process.env.CACHE_TTL_MINUTES) || 30) * 60 * 1000;

export const cache = (req, res, next) => {
  const cacheKey = `${req.originalUrl}`;
  
  // Check if we have a cached response
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp < cacheTimeout) {
      console.log(`📦 Cache hit for: ${cacheKey}`);
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Age', Math.floor((Date.now() - cached.timestamp) / 1000));
      return res.json(cached.data);
    } else {
      // Remove expired cache entry
      cache.delete(cacheKey);
    }
  }
  
  // Store original res.json to intercept response
  const originalJson = res.json;
  res.json = function(data) {
    // Cache the response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    res.set('X-Cache', 'MISS');
    console.log(`💾 Cached response for: ${cacheKey}`);
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};