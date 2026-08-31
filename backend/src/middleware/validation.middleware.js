export function validationMiddleware(req, res, next) {
  // Basic validation - extend as needed
  const { body } = req

  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Request body is required'
      }
    })
  }

  next()
}

export default validationMiddleware
