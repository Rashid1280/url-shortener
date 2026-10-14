function createRateLimiter({ windowMs, limit }) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (now > entry.resetAt) {
        hits.delete(ip);
      }
    }
  }, windowMs);

  return function (req, res, next) {
    const timeNow = Date.now();
    const ip = req.ip;
    const entry = hits.get(ip);

    if (!entry || timeNow >= entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: timeNow + windowMs });
      return next();
    }
    if (entry.count >= limit) {
      const secondsLeft = Math.ceil((entry.resetAt - timeNow) / 1000);
      res.set("Retry-After", secondsLeft);
      return res
        .status(429)
        .json({ error: "Too many requests, try again later" });
    }
    entry.count++;
    return next();
  };
}

module.exports = createRateLimiter;
