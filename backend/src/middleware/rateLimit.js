const buckets = new Map();

export function rateLimit({ windowMs = 60_000, maxRequests = 120 } = {}) {
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, start: now };

    if (now - bucket.start > windowMs) {
      bucket.count = 0;
      bucket.start = now;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > maxRequests) {
      return res.status(429).json({ message: 'Too many requests. Please retry shortly.' });
    }

    return next();
  };
}
