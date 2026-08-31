import express from 'express'
import * as workshopController from '../controllers/workshop.controller.js'

const router = express.Router()

// Workshop routes
router.get('/', workshopController.getAllWorkshops)
router.get('/:id', workshopController.getWorkshop)
router.post('/:workshopId/register', workshopController.registerWorkshop)
router.post('/:workshopId/unregister', workshopController.unregisterWorkshop)
router.get('/:workshopId/attendees', workshopController.getWorkshopAttendees)

export default router
