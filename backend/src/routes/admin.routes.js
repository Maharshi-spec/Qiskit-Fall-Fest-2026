const express = require('express')
const { requireAdmin } = require('../middleware/validation.middleware')
const registrationService = require('../services/registration.service')

const router = express.Router()

router.get('/admin/registrations', requireAdmin, async (req, res, next) => {
  try {
    const result = await registrationService.getAdminRegistrations()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
})

router.get('/admin/participants', requireAdmin, async (req, res, next) => {
  try {
    const result = await registrationService.getAdminParticipants()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
})

router.get('/admin/attendance', requireAdmin, async (req, res, next) => {
  try {
    const result = await registrationService.getAttendanceSummary()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
})

router.patch('/admin/attendance/:registrationId', requireAdmin, async (req, res, next) => {
  try {
    const result = await registrationService.updateAttendanceStatus(req.params.registrationId, req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
})

router.post('/admin/email/send', requireAdmin, async (req, res, next) => {
  try {
    const result = await registrationService.sendOrganizerEmail(req.body)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
})

router.get('/admin/email/logs', requireAdmin, async (req, res, next) => {
  try {
    const result = await registrationService.getAdminEmailLogs()
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
