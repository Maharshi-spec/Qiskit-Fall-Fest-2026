export function errorMiddleware(err, req, res, next) {
  console.error('Error:', err.message)

  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({
    success: false,
    error: {
      status,
      message
    }
  })
}

export default errorMiddleware
