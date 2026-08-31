const requestCounts = new Map()

export function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const maxRequests = 100

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, [])
  }

  const timestamps = requestCounts.get(ip)
  const recentRequests = timestamps.filter(time => now - time < windowMs)

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later'
      }
    })
  }

  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)

  next()
}

export default rateLimitMiddleware
