import express from 'express'
import * as hackathonController from '../controllers/hackathon.controller.js'

const router = express.Router()

// Hackathon routes
router.get('/', hackathonController.getHackathonInfo)
router.post('/team/create', hackathonController.createTeam)
router.get('/teams', hackathonController.getAllTeams)
router.get('/team/:teamId', hackathonController.getTeam)
router.put('/team/:teamId', hackathonController.updateTeam)
router.post('/team/:teamId/join', hackathonController.joinTeam)
router.post('/team/:teamId/leave', hackathonController.leaveTeam)

export default router
