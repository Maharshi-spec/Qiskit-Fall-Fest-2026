const express = require('express')
const multer = require('multer')
const {
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
} = require('../controllers/registration.controller')
const { requireAuth, requireAdmin } = require('../middleware/validation.middleware')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])

    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Invalid ID card file type. Allowed types: JPEG, PNG, PDF.')
      error.code = 'INVALID_FILE_TYPE'
      return cb(error)
    }

    cb(null, true)
  },
})

router.post('/registrations', upload.single('idCard'), registerUser)
router.post('/auth/register', registerAuthUser)
router.post('/auth/login', loginUser)
router.post('/auth/refresh', requireAuth, refreshAuthToken)
router.post('/auth/logout', requireAuth, logoutUser)

router.get('/events', getEvents)
router.get('/events/:eventId', getEventById)
router.post('/events', requireAdmin, createEvent)
router.put('/events/:eventId', requireAdmin, updateEvent)
router.delete('/events/:eventId', requireAdmin, deleteEvent)

router.get('/events/:eventId/days', getEventDays)
router.get('/events/:eventId/days/:dayId', getEventDayById)
router.post('/events/:eventId/days', requireAdmin, createEventDay)
router.put('/events/:eventId/days/:dayId', requireAdmin, updateEventDay)
router.delete('/events/:eventId/days/:dayId', requireAdmin, deleteEventDay)

router.get('/events/:eventId/days/:dayId/schedule', getSchedule)
router.post('/events/:eventId/days/:dayId/schedule', requireAdmin, createSchedule)
router.put('/schedule/:scheduleId', requireAdmin, updateSchedule)
router.delete('/schedule/:scheduleId', requireAdmin, deleteSchedule)

router.get('/participants/:participantId', requireAuth, getParticipantById)
router.put('/participants/:participantId', requireAuth, updateParticipantById)

router.get('/admin/registrations', requireAdmin, getAdminRegistrations)
router.get('/admin/participants', requireAdmin, getAdminParticipants)
router.get('/admin/email-logs', requireAdmin, getAdminEmailLogs)

module.exports = router
