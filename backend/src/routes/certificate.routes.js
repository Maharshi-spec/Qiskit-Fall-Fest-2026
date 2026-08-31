import express from 'express'
import * as certificateController from '../controllers/certificate.controller.js'

const router = express.Router()

// Certificate routes
router.get('/:registrationId', certificateController.generateCertificate)
router.post('/:registrationId/download', certificateController.downloadCertificate)
router.get('/verify/:certId', certificateController.verifyCertificate)

export default router
