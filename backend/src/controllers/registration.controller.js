const registrationService = require('../services/registration.service')

const registerUser = async (req, res, next) => {
  try {
    const result = await registrationService.registerUser(req.body, req.file)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

const registerAuthUser = async (req, res, next) => {
  try {
    const result = await registrationService.registerAuthUser(req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const result = await registrationService.loginUser(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const refreshAuthToken = async (req, res, next) => {
  try {
    const result = await registrationService.refreshAuthToken(req.user)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const logoutUser = async (req, res, next) => {
  try {
    const result = await registrationService.logoutUser(req.user)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getEvents = async (req, res, next) => {
  try {
    const result = await registrationService.getEvents()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getEventById = async (req, res, next) => {
  try {
    const result = await registrationService.getEventById(req.params.eventId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const createEvent = async (req, res, next) => {
  try {
    const result = await registrationService.createEvent(req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

const updateEvent = async (req, res, next) => {
  try {
    const result = await registrationService.updateEvent(req.params.eventId, req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const deleteEvent = async (req, res, next) => {
  try {
    const result = await registrationService.deleteEvent(req.params.eventId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getEventDays = async (req, res, next) => {
  try {
    const result = await registrationService.getEventDays(req.params.eventId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getEventDayById = async (req, res, next) => {
  try {
    const result = await registrationService.getEventDayById(req.params.eventId, req.params.dayId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const createEventDay = async (req, res, next) => {
  try {
    const result = await registrationService.createEventDay(req.params.eventId, req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

const updateEventDay = async (req, res, next) => {
  try {
    const result = await registrationService.updateEventDay(req.params.eventId, req.params.dayId, req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const deleteEventDay = async (req, res, next) => {
  try {
    const result = await registrationService.deleteEventDay(req.params.eventId, req.params.dayId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getSchedule = async (req, res, next) => {
  try {
    const result = await registrationService.getSchedule(req.params.eventId, req.params.dayId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const createSchedule = async (req, res, next) => {
  try {
    const result = await registrationService.createSchedule(req.params.eventId, req.params.dayId, req.body)
    return res.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

const updateSchedule = async (req, res, next) => {
  try {
    const result = await registrationService.updateSchedule(req.params.scheduleId, req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const deleteSchedule = async (req, res, next) => {
  try {
    const result = await registrationService.deleteSchedule(req.params.scheduleId)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getParticipantById = async (req, res, next) => {
  try {
    const result = await registrationService.getParticipantById(req.params.participantId, req.user)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const updateParticipantById = async (req, res, next) => {
  try {
    const result = await registrationService.updateParticipantById(req.params.participantId, req.body, req.user)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getAdminRegistrations = async (req, res, next) => {
  try {
    const result = await registrationService.getAdminRegistrations()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getAdminParticipants = async (req, res, next) => {
  try {
    const result = await registrationService.getAdminParticipants()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

const getAdminEmailLogs = async (req, res, next) => {
  try {
    const result = await registrationService.getAdminEmailLogs()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  registerUser,
  registerAuthUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventDays,
  getEventDayById,
  createEventDay,
  updateEventDay,
  deleteEventDay,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getParticipantById,
  updateParticipantById,
  getAdminRegistrations,
  getAdminParticipants,
  getAdminEmailLogs,
}
