import * as registrationService from '../services/registration.service.js'

export async function createRegistration(req, res, next) {
  try {
    const registration = await registrationService.createRegistration(req.body)
    res.status(201).json({
      success: true,
      data: registration
    })
  } catch (error) {
    next(error)
  }
}

export async function getRegistration(req, res, next) {
  try {
    const registration = await registrationService.getRegistration(req.params.id)
    res.json({
      success: true,
      data: registration
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllRegistrations(req, res, next) {
  try {
    const registrations = await registrationService.getAllRegistrations()
    res.json({
      success: true,
      data: registrations
    })
  } catch (error) {
    next(error)
  }
}

export async function updateRegistration(req, res, next) {
  try {
    const registration = await registrationService.updateRegistration(req.params.id, req.body)
    res.json({
      success: true,
      data: registration
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteRegistration(req, res, next) {
  try {
    await registrationService.deleteRegistration(req.params.id)
    res.json({
      success: true,
      message: 'Registration deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
