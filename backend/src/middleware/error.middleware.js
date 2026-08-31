const errorMiddleware = (err, req, res, next) => {
  console.error(err)

  return res.status(500).json({
    message: 'Internal Server Error',
    error: err.message || 'Unknown error',
  })
}

module.exports = {
  errorMiddleware,
}
