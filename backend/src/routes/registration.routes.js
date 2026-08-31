const express = require('express')
const { createRegistration } = require('../controllers/registration.controller')
const { upload } = require('../middleware/upload.middleware')

const router = express.Router()

router.post('/registrations', upload.single('idCard'), createRegistration)

module.exports = router
