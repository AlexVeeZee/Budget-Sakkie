const requests = new Map();

export const rateLimiter = (req, res, next) => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
  
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  for (const [id, data] of requests.entries()) {
    if (now - data.windowStart > windowMs) {
      requests.delete(id);
    }
  }
  
  // Get or create client data
  let clientData = requests.get(clientId);
  if (!clientData || now - clientData.windowStart > windowMs) {
    clientData = {
      count: 0,
      windowStart: now
    };
    requests.set(clientId, clientData);
  }
  
  // Check rate limit
  if (clientData.count >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
      retryAfter: Math.ceil((windowMs - (now - clientData.windowStart)) / 1000),
      timestamp: new Date().toISOString()
    });
  }
  
  // Increment counter
  clientData.count++;
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests,
    'X-RateLimit-Remaining': Math.max(0, maxRequests - clientData.count),
    'X-RateLimit-Reset': new Date(clientData.windowStart + windowMs).toISOString()
  });
  
  next();
};