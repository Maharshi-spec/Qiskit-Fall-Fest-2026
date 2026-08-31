const registrationService = require('../services/registration.service')

const createRegistration = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID card is required.',
        },
      })
    }

    const result = await registrationService.registerUser(req.body, req.file)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createRegistration,
}
