/**
 * Rate Limiting Middleware
 * Limits PDF generation requests to prevent abuse
 */

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map();

/**
 * Rate limiter for PDF generation
 * Limits to 20 requests per minute per user
 */
const pdfRateLimiter = (req, res, next) => {
  const userId = req.user?.userId || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20;

  // Get or create user's request history
  if (!requestCounts.has(userId)) {
    requestCounts.set(userId, []);
  }

  const userRequests = requestCounts.get(userId);

  // Remove requests outside the time window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
  requestCounts.set(userId, recentRequests);

  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${maxRequests} PDF requests per minute allowed.`,
      retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
    });
  }

  // Add current request
  recentRequests.push(now);
  requestCounts.set(userId, recentRequests);

  next();
};

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  
  for (const [userId, requests] of requestCounts.entries()) {
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
    if (recentRequests.length === 0) {
      requestCounts.delete(userId);
    } else {
      requestCounts.set(userId, recentRequests);
    }
  }
}, 5 * 60 * 1000);

module.exports = { pdfRateLimiter };
