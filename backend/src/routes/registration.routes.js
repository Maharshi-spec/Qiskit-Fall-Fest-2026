const express = require('express')
const {
  createRegistration,
  loginParticipant,
  getCurrentParticipant,
} = require('../controllers/registration.controller')
const { upload } = require('../middleware/upload.middleware')

const router = express.Router()

router.post('/registrations', upload.single('idCard'), createRegistration)
router.post('/registrations/login', loginParticipant)
router.get('/registrations/me', getCurrentParticipant)

module.exports = router
