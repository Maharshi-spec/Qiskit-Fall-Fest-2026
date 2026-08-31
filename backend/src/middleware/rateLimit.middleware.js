const rateLimit = (req, res, next) => {
  next()
}

module.exports = {
  rateLimit,
}
