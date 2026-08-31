const registrationService = require('../services/registration.service')

const registerUser = async (req, res, next) => {
  try {
    const result = await registrationService.registerUser(req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  registerUser,
}
