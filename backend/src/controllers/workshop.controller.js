import * as workshopService from '../services/workshop.service.js'

export async function getAllWorkshops(req, res, next) {
  try {
    const workshops = await workshopService.getAllWorkshops()
    res.json({
      success: true,
      data: workshops
    })
  } catch (error) {
    next(error)
  }
}

export async function getWorkshop(req, res, next) {
  try {
    const workshop = await workshopService.getWorkshop(req.params.id)
    res.json({
      success: true,
      data: workshop
    })
  } catch (error) {
    next(error)
  }
}

export async function registerWorkshop(req, res, next) {
  try {
    const result = await workshopService.registerAttendee(req.params.workshopId, req.body)
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export async function unregisterWorkshop(req, res, next) {
  try {
    await workshopService.unregisterAttendee(req.params.workshopId, req.body)
    res.json({
      success: true,
      message: 'Unregistered from workshop'
    })
  } catch (error) {
    next(error)
  }
}

export async function getWorkshopAttendees(req, res, next) {
  try {
    const attendees = await workshopService.getWorkshopAttendees(req.params.workshopId)
    res.json({
      success: true,
      data: attendees
    })
  } catch (error) {
    next(error)
  }
}
