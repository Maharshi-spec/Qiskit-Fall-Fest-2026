import * as hackathonService from '../services/hackathon.service.js'

export async function getHackathonInfo(req, res, next) {
  try {
    const info = await hackathonService.getHackathonInfo()
    res.json({
      success: true,
      data: info
    })
  } catch (error) {
    next(error)
  }
}

export async function createTeam(req, res, next) {
  try {
    const team = await hackathonService.createTeam(req.body)
    res.status(201).json({
      success: true,
      data: team
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllTeams(req, res, next) {
  try {
    const teams = await hackathonService.getAllTeams()
    res.json({
      success: true,
      data: teams
    })
  } catch (error) {
    next(error)
  }
}

export async function getTeam(req, res, next) {
  try {
    const team = await hackathonService.getTeam(req.params.teamId)
    res.json({
      success: true,
      data: team
    })
  } catch (error) {
    next(error)
  }
}

export async function updateTeam(req, res, next) {
  try {
    const team = await hackathonService.updateTeam(req.params.teamId, req.body)
    res.json({
      success: true,
      data: team
    })
  } catch (error) {
    next(error)
  }
}

export async function joinTeam(req, res, next) {
  try {
    const team = await hackathonService.addMember(req.params.teamId, req.body)
    res.json({
      success: true,
      data: team
    })
  } catch (error) {
    next(error)
  }
}

export async function leaveTeam(req, res, next) {
  try {
    const team = await hackathonService.removeMember(req.params.teamId, req.body)
    res.json({
      success: true,
      data: team
    })
  } catch (error) {
    next(error)
  }
}
