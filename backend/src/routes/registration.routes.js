import express from 'express'
import * as registrationController from '../controllers/registration.controller.js'
import { validationMiddleware } from '../middleware/validation.middleware.js'

const router = express.Router()

// Registration routes
router.post('/register', validationMiddleware, registrationController.createRegistration)
router.get('/:id', registrationController.getRegistration)
router.put('/:id', validationMiddleware, registrationController.updateRegistration)
router.delete('/:id', registrationController.deleteRegistration)
router.get('/', registrationController.getAllRegistrations)

export default router
