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

const mapEventRow = (row) => {
  const dateStr = row.event_date
    ? typeof row.event_date === 'string'
      ? row.event_date.slice(0, 10)
      : row.event_date instanceof Date
      ? row.event_date.toISOString().slice(0, 10)
      : String(row.event_date)
    : ''
  return {
    eventId: row.event_id,
    event_id: row.event_id,
    name: row.event_name,
    event_name: row.event_name,
    description: row.description || '',
    venue: row.location || '',
    location: row.location || '',
    date: dateStr,
    event_date: dateStr,
    startTime: row.start_time || null,
    start_time: row.start_time || null,
    endTime: row.end_time || null,
    end_time: row.end_time || null,
    status: row.status || 'active',
    eventType: row.event_type || 'GENERAL',
    event_type: row.event_type || 'GENERAL',
    createdAt: row.created_at || null,
    created_at: row.created_at || null,
  }
}

const getEventsList = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(mapEventRow)
    }
  } catch (err) {
    console.warn('[SUPABASE DB WARN] getEventsList fallback:', err.message)
  }

  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM events ORDER BY event_date ASC, created_at ASC;')
      if (result.rows && result.rows.length > 0) {
        return result.rows.map(mapEventRow)
      }
    } catch (err) {
      console.warn('[POSTGRES DB WARN] getEventsList fallback:', err.message)
    }
  }

  return EVENTS
}

const getEventById = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()

    if (!error && data) {
      return mapEventRow(data)
    }
  } catch (err) {
    console.warn('[SUPABASE DB WARN] getEventById fallback:', err.message)
  }

  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM events WHERE event_id = $1 LIMIT 1;', [eventId])
      if (result.rows && result.rows.length > 0) {
        return mapEventRow(result.rows[0])
      }
    } catch (err) {
      console.warn('[POSTGRES DB WARN] getEventById fallback:', err.message)
    }
  }

  return EVENTS.find((e) => e.eventId === eventId) || null
}

const createEvent = async (payload = {}) => {
  const name = (payload.event_name || payload.name || '').trim()
  const description = (payload.description || '').trim()
  const date = (payload.event_date || payload.date || '').trim()
  const startTime = payload.start_time || payload.startTime || null
  const endTime = payload.end_time || payload.endTime || null
  const location = (payload.location || payload.venue || '').trim()
  const status = payload.status || 'active'
  const eventType = payload.event_type || payload.eventType || 'GENERAL'

  if (!name) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Event name is required.')
  }
  if (!date) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Event date is required.')
  }

  let eventId = (payload.event_id || payload.eventId || '').trim()
  if (!eventId) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 30)
    eventId = `${slug || 'event'}-${Date.now().toString(36)}`
  }

  let createdRow = null

  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        event_id: eventId,
        event_name: name,
        description,
        event_date: date,
        start_time: startTime,
        end_time: endTime,
        location,
        status,
        event_type: eventType,
      })
      .select('*')
      .single()

    if (!error && data) {
      createdRow = data
    }
  } catch (err) {
    console.warn('[SUPABASE DB WARN] createEvent fallback:', err.message)
  }

  if (!createdRow && pool) {
    try {
      const result = await pool.query(
        `INSERT INTO events (event_id, event_name, description, event_date, start_time, end_time, location, status, event_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *;`,
        [eventId, name, description, date, startTime, endTime, location, status, eventType]
      )
      createdRow = result.rows[0]
    } catch (err) {
      if (err.code === '23505') {
        throw new AppError(409, 'CONFLICT', 'An event with this ID already exists.')
      }
      throw new AppError(500, 'DATABASE_ERROR', `Failed to create event: ${err.message}`)
    }
  }

  if (!createdRow) {
    const memoryEvent = {
      event_id: eventId,
      event_name: name,
      description,
      event_date: date,
      start_time: startTime,
      end_time: endTime,
      location,
      status,
      event_type: eventType,
    }
    const mapped = mapEventRow(memoryEvent)
    EVENTS.push(mapped)
    return mapped
  }

  return mapEventRow(createdRow)
}

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
  createEvent,
  startAttendanceSession,
  stopAttendanceSession,
  generateLiveQrToken,
  getAttendanceRecords,
  addSseClient,
  removeSseClient,
  markAttendance,
}
