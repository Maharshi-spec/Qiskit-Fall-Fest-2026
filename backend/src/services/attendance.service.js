const jwt = require('jsonwebtoken')
const { supabase } = require('../config/supabase')
const { pool } = require('../config/database')
const { AppError } = require('../middleware/error.middleware')
const registrationService = require('./registration.service')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const EVENTS = [
  {
    eventId: 'qff-2026',
    name: 'Qiskit Fall Fest 2026 (Main Festival)',
    description: 'Three-day quantum learning festival and community workshops',
    venue: 'CUTM-AP Campus + Virtual',
    date: '2026-09-05 to 2026-09-07',
  },
  {
    eventId: 'day-1',
    name: 'Day 1: Quantum Foundations & Qiskit Workshop',
    description: 'Introduction to quantum computing, Qiskit SDK, and basic gates',
    venue: 'CUTM-AP Campus Auditorium',
    date: '2026-09-05',
  },
  {
    eventId: 'day-2',
    name: 'Day 2: Quantum Algorithms & Lab Sessions',
    description: 'Hands-on lab sessions, VQE, and Grover search algorithm',
    venue: 'CUTM-AP Campus Computer Labs',
    date: '2026-09-06',
  },
  {
    eventId: 'day-3',
    name: 'Day 3: Quantum Hackathon & Presentations',
    description: 'Group project building, hackathon demos, and certificate ceremony',
    venue: 'CUTM-AP Main Hall + Virtual',
    date: '2026-09-07',
  },
]

const activeSessions = new Map()

const getEventsList = () => EVENTS

const getEventById = (eventId) => EVENTS.find((e) => e.eventId === eventId) || null

const getSession = (eventId) => {
  if (!activeSessions.has(eventId)) {
    activeSessions.set(eventId, {
      eventId,
      status: 'CLOSED',
      organizerId: null,
      currentToken: null,
      tokenExpiresAt: 0,
      sseClients: new Set(),
    })
  }
  return activeSessions.get(eventId)
}

const startAttendanceSession = (eventId, organizerId) => {
  const session = getSession(eventId)
  session.status = 'ACTIVE'
  session.organizerId = organizerId
  return session
}

const stopAttendanceSession = (eventId) => {
  const session = getSession(eventId)
  session.status = 'CLOSED'
  session.currentToken = null
  session.tokenExpiresAt = 0
  return session
}

const generateLiveQrToken = (eventId) => {
  const session = getSession(eventId)
  if (session.status !== 'ACTIVE') {
    startAttendanceSession(eventId, 'organizer')
  }

  const now = Date.now()
  const expiresAt = now + 3500
  const nonce = Math.random().toString(36).substring(2, 10)

  const token = jwt.sign(
    {
      eventId,
      nonce,
      iss: 'qff-attendance',
    },
    JWT_SECRET,
    { expiresIn: '5s' },
  )

  session.currentToken = token
  session.tokenExpiresAt = expiresAt

  return {
    token,
    expiresAt,
    eventId,
  }
}

const getAttendanceRecords = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('event_id', eventId)
      .order('marked_at', { ascending: false })

    if (!error && data) {
      return data.map((row) => ({
        id: row.id,
        eventId: row.event_id,
        registrationId: row.registration_id,
        fullName: row.full_name,
        email: row.email,
        status: row.status,
        markedAt: row.marked_at,
      }))
    }
  } catch (err) {
    console.warn('[SUPABASE DB WARN] getAttendanceRecords fallback:', err.message)
  }

  try {
    const result = await pool.query(
      `SELECT id, event_id AS "eventId", registration_id AS "registrationId", full_name AS "fullName",
        email, status, marked_at AS "markedAt"
       FROM attendance WHERE event_id = $1 ORDER BY marked_at DESC`,
      [eventId],
    )
    return result.rows
  } catch (err) {
    return []
  }
}

const notifySseClients = (eventId, payload) => {
  const session = getSession(eventId)
  for (const clientRes of session.sseClients) {
    try {
      clientRes.write(`data: ${JSON.stringify(payload)}\n\n`)
    } catch (e) {
      session.sseClients.delete(clientRes)
    }
  }
}

const addSseClient = (eventId, res) => {
  const session = getSession(eventId)
  session.sseClients.add(res)
}

const removeSseClient = (eventId, res) => {
  const session = getSession(eventId)
  session.sseClients.delete(res)
}

const markAttendance = async (participantUser, attendanceToken) => {
  if (!participantUser || (!participantUser.email && !participantUser.registrationId)) {
    throw new AppError(401, 'UNAUTHORIZED', 'Participant authentication required.')
  }

  if (!attendanceToken) {
    throw new AppError(400, 'INVALID_TOKEN', 'Attendance QR token is missing.')
  }

  let decoded
  try {
    decoded = jwt.verify(attendanceToken, JWT_SECRET)
  } catch (err) {
    throw new AppError(400, 'QR_EXPIRED', 'This attendance QR code has expired. Please scan the current QR code.')
  }

  if (!decoded || !decoded.eventId) {
    throw new AppError(400, 'INVALID_TOKEN', 'Invalid attendance QR code.')
  }

  const eventId = decoded.eventId
  const session = getSession(eventId)

  if (session.status === 'CLOSED') {
    throw new AppError(400, 'SESSION_CLOSED', 'Attendance for this event is currently closed.')
  }

  let participant = null
  if (participantUser.registrationId) {
    participant = await registrationService.registrationRepository.findByRegistrationId(participantUser.registrationId)
  }
  if (!participant && participantUser.email) {
    participant = await registrationService.registrationRepository.findByEmail(participantUser.email)
  }

  if (!participant) {
    throw new AppError(400, 'NOT_REGISTERED', 'You are not registered for this event.')
  }

  const existingRecords = await getAttendanceRecords(eventId)
  const alreadyMarked = existingRecords.some((r) => r.registrationId === participant.registrationId || r.email === participant.email)

  if (alreadyMarked) {
    return {
      success: true,
      alreadyMarked: true,
      message: 'You have already been successfully marked present for this event.',
      registrationId: participant.registrationId,
      eventId,
    }
  }

  let savedRecord = null

  try {
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        event_id: eventId,
        registration_id: participant.registrationId,
        full_name: participant.fullName,
        email: participant.email,
        status: 'PRESENT',
        marked_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (!error && data) {
      savedRecord = {
        id: data.id,
        eventId: data.event_id,
        registrationId: data.registration_id,
        fullName: data.full_name,
        email: data.email,
        status: data.status,
        markedAt: data.marked_at,
      }
    } else if (error && (error.code === '23505' || (error.message && error.message.includes('unique')))) {
      return {
        success: true,
        alreadyMarked: true,
        message: 'You have already been successfully marked present for this event.',
        registrationId: participant.registrationId,
        eventId,
      }
    }
  } catch (err) {
    console.warn('[SUPABASE DB WARN] markAttendance insert fallback:', err.message)
  }

  if (!savedRecord) {
    try {
      const result = await pool.query(
        `INSERT INTO attendance (event_id, registration_id, full_name, email, status, marked_at)
         VALUES ($1, $2, $3, $4, 'PRESENT', NOW())
         RETURNING id, event_id AS "eventId", registration_id AS "registrationId", full_name AS "fullName", email, status, marked_at AS "markedAt"`,
        [eventId, participant.registrationId, participant.fullName, participant.email],
      )
      savedRecord = result.rows[0]
    } catch (err) {
      if (err.code === '23505' || err.message.includes('unique')) {
        return {
          success: true,
          alreadyMarked: true,
          message: 'You have already been successfully marked present for this event.',
          registrationId: participant.registrationId,
          eventId,
        }
      }
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to mark attendance. Please try again.')
    }
  }

  notifySseClients(eventId, {
    type: 'ATTENDANCE_MARKED',
    participant: savedRecord,
  })

  return {
    success: true,
    alreadyMarked: false,
    message: 'You have been successfully marked present for this event.',
    participant: savedRecord,
  }
}

module.exports = {
  getEventsList,
  getEventById,
  startAttendanceSession,
  stopAttendanceSession,
  generateLiveQrToken,
  getAttendanceRecords,
  addSseClient,
  removeSseClient,
  markAttendance,
}
