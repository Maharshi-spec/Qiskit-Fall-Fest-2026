const express = require('express')
const {
  generateCertificate,
  getCertificates,
  getCertificateById,
  downloadCertificate,
} = require('../controllers/certificate.controller')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Certificate endpoint ready' })
})

router.post('/certificates/generate', generateCertificate)
router.get('/certificates', getCertificates)
router.get('/certificates/:certificateId', getCertificateById)
router.get('/certificates/:certificateId/download', downloadCertificate)

module.exports = router
