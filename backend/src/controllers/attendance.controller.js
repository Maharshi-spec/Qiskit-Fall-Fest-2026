const attendanceService = require('../services/attendance.service')

const getEventsList = async (req, res, next) => {
  try {
    const events = attendanceService.getEventsList()
    return res.status(200).json({
      success: true,
      data: events,
    })
  } catch (error) {
    return next(error)
  }
}

const startSession = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const organizerId = req.user?.userId || 'organizer'
    const session = attendanceService.startAttendanceSession(eventId, organizerId)
    return res.status(200).json({
      success: true,
      data: session,
    })
  } catch (error) {
    return next(error)
  }
}

const stopSession = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const session = attendanceService.stopAttendanceSession(eventId)
    return res.status(200).json({
      success: true,
      data: session,
    })
  } catch (error) {
    return next(error)
  }
}

const getLiveQrToken = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const tokenData = attendanceService.generateLiveQrToken(eventId)
    return res.status(200).json({
      success: true,
      data: tokenData,
    })
  } catch (error) {
    return next(error)
  }
}

const getAttendanceData = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const records = await attendanceService.getAttendanceRecords(eventId)
    return res.status(200).json({
      success: true,
      data: {
        eventId,
        count: records.length,
        records,
      },
    })
  } catch (error) {
    return next(error)
  }
}

const getLiveStream = async (req, res, next) => {
  try {
    const { eventId } = req.params
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders && res.flushHeaders()

    attendanceService.addSseClient(eventId, res)

    const records = await attendanceService.getAttendanceRecords(eventId)
    res.write(`data: ${JSON.stringify({ type: 'INIT', count: records.length, records })}\n\n`)

    req.on('close', () => {
      attendanceService.removeSseClient(eventId, res)
    })
  } catch (error) {
    return next(error)
  }
}

const markAttendance = async (req, res, next) => {
  try {
    const attendanceToken = req.body?.attendance_token || req.body?.token
    const participantUser = req.user
    const result = await attendanceService.markAttendance(participantUser, attendanceToken)
    return res.status(200).json(result)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getEventsList,
  startSession,
  stopSession,
  getLiveQrToken,
  getAttendanceData,
  getLiveStream,
  markAttendance,
}
