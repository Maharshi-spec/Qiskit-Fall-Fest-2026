const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const path = require('path')
const { AppError } = require('../middleware/error.middleware')
const { pool } = require('../config/database')
const { supabase } = require('../config/supabase')

const VALID_ROLES = new Set(['STUDENT', 'FACULTY', 'PROFESSIONAL', 'OTHER'])
const BOOLEAN_FIELDS = new Set(['knowsPython', 'aicteQuantumCourse', 'knowsQuantumBasics', 'usedQiskitBefore'])

const uploadIdCardToSupabase = async (file) => {
  const ext = path.extname(file.originalname || '') || (file.mimetype === 'application/pdf' ? '.pdf' : '.jpg')
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
  const filePathInBucket = `id cards/${uniqueName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ID Cards')
    .upload(filePathInBucket, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    })

  if (uploadError) {
    console.error('[SUPABASE STORAGE ERROR]', uploadError)
    throw new AppError(500, 'FILE_UPLOAD_FAILED', `Failed to upload ID card to cloud storage: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabase.storage
    .from('ID Cards')
    .getPublicUrl(filePathInBucket)

  return publicUrlData.publicUrl
}

const registrationRepository = {
  notificationLog: [],

  async findByEmail(email) {
    const normalizedEmail = normalizeEmail(email)

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('registration_id')
        .eq('email', normalizedEmail)
        .limit(1)

      if (!error && data && data.length > 0) {
        return { registrationId: data[0].registration_id }
      }
    } catch (err) {
      console.warn('[SUPABASE DB WARN] findByEmail error, falling back:', err.message)
    }

    try {
      const result = await pool.query(
        'SELECT registration_id AS "registrationId" FROM registrations WHERE email = $1 LIMIT 1',
        [normalizedEmail],
      )
      return result.rows[0] || null
    } catch (err) {
      return null
    }
  },

  async createRegistration(record, idCardUrl) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert({
          registration_id: record.registrationId,
          full_name: record.fullName,
          email: record.email,
          mobile_number: record.mobileNumber,
          role: record.role,
          institute_name: record.instituteName,
          department: record.department,
          knows_python: record.knowsPython,
          aicte_quantum_course: record.aicteQuantumCourse,
          knows_quantum_basics: record.knowsQuantumBasics,
          used_qiskit_before: record.usedQiskitBefore,
          id_card_url: idCardUrl,
          status: record.status,
        })
        .select('registration_id, status')
        .single()

      if (error) {
        console.error('[SUPABASE DB INSERT ERROR]', error)
        if (error.code === '23505' || (error.message && error.message.includes('unique constraint'))) {
          throw new AppError(400, 'EMAIL_ALREADY_REGISTERED', 'This email is already registered.')
        }
        throw new AppError(500, 'DATABASE_ERROR', error.message || 'Failed to save registration.')
      }

      return { registrationId: data.registration_id, status: data.status }
    } catch (err) {
      if (err instanceof AppError) throw err
      console.error('[SUPABASE DB EXCEPTION]', err)
      throw new AppError(503, 'DATABASE_UNAVAILABLE', 'Registration could not be saved. Please try again.')
    }
  },

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        return data.map((item) => ({
          registrationId: item.registration_id,
          status: item.status,
          fullName: item.full_name,
          email: item.email,
          mobileNumber: item.mobile_number,
          role: item.role,
          instituteName: item.institute_name,
          department: item.department,
          knowsPython: item.knows_python,
          aicteQuantumCourse: item.aicte_quantum_course,
          knowsQuantumBasics: item.knows_quantum_basics,
          usedQiskitBefore: item.used_qiskit_before,
          idCardUrl: item.id_card_url,
          createdAt: item.created_at,
        }))
      }
    } catch (err) {
      console.warn('[SUPABASE DB WARN] findAll falling back to pg pool:', err.message)
    }

    const result = await pool.query(
      `SELECT registration_id AS "registrationId", status, full_name AS "fullName",
        email, mobile_number AS "mobileNumber", role, institute_name AS "instituteName",
        department, knows_python AS "knowsPython", aicte_quantum_course AS "aicteQuantumCourse",
        knows_quantum_basics AS "knowsQuantumBasics", used_qiskit_before AS "usedQiskitBefore",
        id_card_url AS "idCardUrl", created_at AS "createdAt"
      FROM registrations ORDER BY created_at DESC`,
    )
    return result.rows
  },

  logNotification(notification) {
    const existing = this.notificationLog.find(
      (item) => item.registrationId === notification.registrationId && item.eventDay === notification.eventDay && item.emailType === notification.emailType,
    )

    if (!existing) {
      this.notificationLog.push({
        ...notification,
        status: 'SENT',
        sentAt: new Date().toISOString(),
      })
    }

    return existing || notification
  },
}

const userRepository = {
  users: [
    {
      id: 'admin-001',
      fullName: 'Admin User',
      email: 'admin@qiskitfallfest.com',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
  ],

  findByEmail(email) {
    const normalizedEmail = normalizeEmail(email)
    return this.users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null
  },

  create(user) {
    this.users.push(user)
    return user
  },
}

const eventRepository = {
  events: [
    {
      eventId: 'qff-2026',
      name: 'Qiskit Fall Fest 2026',
      description: 'Three-day quantum learning festival',
      location: 'CUTM-AP Campus + Virtual',
      startDate: '2026-09-05',
      endDate: '2026-09-07',
      status: 'ACTIVE',
    },
  ],
  eventDays: [
    {
      eventId: 'qff-2026',
      dayId: 'day-1',
      dayNumber: 1,
      name: 'Day 1',
      date: '2026-09-05',
      startTime: '09:00',
      endTime: '17:00',
      venue: 'CUTM-AP Campus',
      importantInfo: 'Check-in opens at 08:30',
    },
    {
      eventId: 'qff-2026',
      dayId: 'day-2',
      dayNumber: 2,
      name: 'Day 2',
      date: '2026-09-06',
      startTime: '09:00',
      endTime: '17:00',
      venue: 'CUTM-AP Campus',
      importantInfo: 'Bring your laptop for lab sessions',
    },
    {
      eventId: 'qff-2026',
      dayId: 'day-3',
      dayNumber: 3,
      name: 'Day 3',
      date: '2026-09-07',
      startTime: '09:00',
      endTime: '15:00',
      venue: 'CUTM-AP Campus + Virtual',
      importantInfo: 'Final day wrap-up and closing remarks',
    },
  ],
  schedules: [
    {
      scheduleId: 'sched-1',
      eventId: 'qff-2026',
      dayId: 'day-1',
      title: 'Opening Keynote',
      speaker: 'Quantum Community',
      startTime: '09:30',
      endTime: '10:30',
      venue: 'Auditorium',
    },
  ],

  findAllEvents() {
    return this.events
  },

  findEventById(eventId) {
    return this.events.find((event) => event.eventId === eventId) || null
  },

  createEvent(event) {
    this.events.push(event)
    return event
  },

  updateEvent(eventId, updates) {
    const index = this.events.findIndex((event) => event.eventId === eventId)
    if (index === -1) return null
    this.events[index] = { ...this.events[index], ...updates }
    return this.events[index]
  },

  deleteEvent(eventId) {
    const index = this.events.findIndex((event) => event.eventId === eventId)
    if (index === -1) return false
    this.events.splice(index, 1)
    return true
  },

  findDaysByEvent(eventId) {
    return this.eventDays.filter((day) => day.eventId === eventId)
  },

  findDayById(eventId, dayId) {
    return this.eventDays.find((day) => day.eventId === eventId && day.dayId === dayId) || null
  },

  createDay(day) {
    this.eventDays.push(day)
    return day
  },

  updateDay(eventId, dayId, updates) {
    const index = this.eventDays.findIndex((day) => day.eventId === eventId && day.dayId === dayId)
    if (index === -1) return null
    this.eventDays[index] = { ...this.eventDays[index], ...updates }
    return this.eventDays[index]
  },

  deleteDay(eventId, dayId) {
    const index = this.eventDays.findIndex((day) => day.eventId === eventId && day.dayId === dayId)
    if (index === -1) return false
    this.eventDays.splice(index, 1)
    return true
  },

  findScheduleByEventDay(eventId, dayId) {
    return this.schedules.filter((schedule) => schedule.eventId === eventId && schedule.dayId === dayId)
  },

  findScheduleById(scheduleId) {
    return this.schedules.find((schedule) => schedule.scheduleId === scheduleId) || null
  },

  createSchedule(schedule) {
    this.schedules.push(schedule)
    return schedule
  },

  updateSchedule(scheduleId, updates) {
    const index = this.schedules.findIndex((schedule) => schedule.scheduleId === scheduleId)
    if (index === -1) return null
    this.schedules[index] = { ...this.schedules[index], ...updates }
    return this.schedules[index]
  },

  deleteSchedule(scheduleId) {
    const index = this.schedules.findIndex((schedule) => schedule.scheduleId === scheduleId)
    if (index === -1) return false
    this.schedules.splice(index, 1)
    return true
  },
}

const notificationRepository = {
  notifications: [],

  findExisting(payload) {
    return this.notifications.find(
      (item) => item.registrationId === payload.registrationId && item.eventDay === payload.eventDay && item.emailType === payload.emailType,
    ) || null
  },

  create(payload) {
    this.notifications.push(payload)
    return payload
  },

  markSent(payload) {
    const record = this.notifications.find(
      (item) => item.registrationId === payload.registrationId && item.eventDay === payload.eventDay && item.emailType === payload.emailType,
    )
    if (record) {
      record.status = 'SENT'
      record.sentAt = new Date().toISOString()
      return record
    }
    return this.create({ ...payload, status: 'SENT', sentAt: new Date().toISOString() })
  },

  markFailed(payload, errorMessage) {
    const record = this.notifications.find(
      (item) => item.registrationId === payload.registrationId && item.eventDay === payload.eventDay && item.emailType === payload.emailType,
    )
    if (record) {
      record.status = 'FAILED'
      record.errorMessage = errorMessage
      record.sentAt = new Date().toISOString()
      return record
    }
    return this.create({ ...payload, status: 'FAILED', errorMessage, sentAt: new Date().toISOString() })
  },

  findPending() {
    return this.notifications.filter((notification) => notification.status === 'PENDING')
  },
}

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())

const isValidMobileNumber = (value) => /^\+?[0-9\s()-]{7,20}$/.test(String(value || '').trim())
const sanitizeSmtpPassword = (value) => String(value ?? '').replace(/\s+/g, '').trim()

const getMailConfiguration = () => {
  const environment = process.env.NODE_ENV || 'development'
  const requiredFields = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASSWORD', 'MAIL_FROM']

  const config = {
    host: String(process.env.MAIL_HOST || (environment === 'production' ? '' : 'localhost')).trim(),
    port: String(process.env.MAIL_PORT || (environment === 'production' ? '' : '1025')).trim(),
    user: String(process.env.MAIL_USER || '').trim(),
    password: sanitizeSmtpPassword(process.env.MAIL_PASSWORD),
    from: String(process.env.MAIL_FROM || (environment === 'production' ? '' : 'noreply@qiskitfallfest.com')).trim(),
    fromName: String(process.env.MAIL_FROM_NAME || 'Qiskit Fall Fest 2026').trim(),
  }

  const missingFields = requiredFields.filter((fieldName) => {
    const fieldValue = process.env[fieldName]
    return !fieldValue || String(fieldValue).trim() === ''
  })

  const summary = {
    MAIL_HOST: Boolean(config.host),
    MAIL_PORT: Boolean(config.port),
    MAIL_USER: Boolean(config.user),
    MAIL_PASSWORD: Boolean(config.password),
    MAIL_FROM: Boolean(config.from),
    MAIL_FROM_NAME: Boolean(config.fromName),
  }

  return {
    config,
    summary,
    missingFields,
    isProduction: environment === 'production',
  }
}

const isBooleanLikeText = (value) => {
  if (typeof value === 'boolean') return true
  const normalized = String(value || '').trim().toLowerCase()
  return normalized === 'true' || normalized === 'false'
}

const normalizeBooleanField = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return false
}

const generateRegistrationId = async () => {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })

    const nextNumber = (count || 0) + 1
    return {
      id: Date.now(),
      registrationId: `QFF26-R-${String(nextNumber).padStart(5, '0')}`,
    }
  } catch (err) {
    const fallbackId = Date.now()
    return {
      id: fallbackId,
      registrationId: `QFF26-R-${String(fallbackId).slice(-5)}`,
    }
  }
}

const createJwtToken = (user) => jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '24h' })

const sendMail = async ({ to, subject, text, html }) => {
  const { config, missingFields, isProduction } = getMailConfiguration()

  if (isProduction && missingFields.length > 0) {
    throw new AppError(
      503,
      'EMAIL_CONFIGURATION_INCOMPLETE',
      'Email delivery is disabled until SMTP configuration is complete.',
    )
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port || 587),
    secure: Number(config.port || 587) === 465,
    tls: { rejectUnauthorized: true },
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
  })

  if (process.env.NODE_ENV === 'test') {
    return { messageId: `mock-${Date.now()}`, accepted: [to] }
  }

  await transport.verify().catch((error) => {
    const safeMessage = error && error.message ? error.message.replace(/(pass|password|token|secret)\s*[:=]?\s*[^\s,;]+/gi, '[REDACTED]') : 'SMTP verification failed.'
    throw new AppError(503, 'SMTP_VERIFICATION_FAILED', safeMessage)
  })

  const senderAddress = config.fromName
    ? `${config.fromName} <${config.from}>`
    : config.from

  try {
    return await transport.sendMail({
      from: senderAddress,
      to,
      subject,
      text,
      html,
    })
  } catch (error) {
    throw new AppError(503, 'SMTP_DELIVERY_FAILED', 'Email delivery failed. SMTP authentication or transport could not complete.')
  }
}

const buildRegistrationConfirmationEmailContent = (registration) => {
  const participantName = String(registration.fullName || 'Participant').trim() || 'Participant'
  const registrationId = String(registration.registrationId || 'N/A').trim()
  const status = String(registration.status || 'CONFIRMED').trim().toUpperCase()
  const participantEmail = String(registration.email || '').trim()

  const text = [
    `Hi ${participantName},`,
    '',
    'Your registration for Qiskit Fall Fest 2026 has been successfully received and confirmed.',
    '',
    `Registration ID: ${registrationId}`,
    `Status: ${status}`,
    `Participant: ${participantName}`,
    `Email: ${participantEmail}`,
    '',
    'Thank you for registering for Qiskit Fall Fest 2026. We are looking forward to having you join us for a hands-on experience around quantum computing, learning, workshops, community, and experimentation.',
    '',
    "What's next?",
    '- Keep your registration ID safe for future communication and check-in.',
    '- Watch your registered email for event updates and follow-up instructions.',
    '- Follow official event communication for schedule and participation guidance.',
    '- Contact the organizers if you need assistance.',
    '',
    'Thank you for being part of the Qiskit Fall Fest 2026 community.',
  ].join('\n')

  const html = `
    <div style="margin:0;padding:0;background:#f5f3f8;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f3f8;padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#ffffff;border:1px solid #f3d8e6;border-radius:14px;overflow:hidden;">
              <tr>
                <td style="padding:30px 28px 10px 28px;background:#ffffff;">
                  <div style="font-size:12px;letter-spacing:1.5px;color:#d14b9b;font-weight:700;text-transform:uppercase;">Qiskit Fall Fest 2026</div>
                  <h1 style="margin:14px 0 10px 0;font-size:28px;line-height:1.3;color:#1f1f1f;">Registration confirmed</h1>
                  <p style="margin:0;color:#4a4a4a;font-size:16px;line-height:1.6;">Hi ${participantName},</p>
                  <p style="margin:16px 0 0 0;color:#4a4a4a;font-size:16px;line-height:1.7;">Your registration for Qiskit Fall Fest 2026 has been successfully received and confirmed.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff8fc;border:1px solid #f3d8e6;border-radius:10px;">
                    <tr>
                      <td style="padding:18px 20px;">
                        <div style="font-size:11px;letter-spacing:1.3px;color:#d14b9b;text-transform:uppercase;font-weight:700;">Registration ID</div>
                        <div style="margin-top:8px;font-size:26px;font-weight:700;color:#1f1f1f;letter-spacing:0.5px;">${registrationId}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 16px 28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:15px;color:#303030;line-height:1.7;">
                    <tr>
                      <td style="padding:6px 0;width:120px;font-weight:700;color:#1f1f1f;">Status</td>
                      <td style="padding:6px 0;color:#4a4a4a;">${status}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;width:120px;font-weight:700;color:#1f1f1f;">Participant</td>
                      <td style="padding:6px 0;color:#4a4a4a;">${participantName}</td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;width:120px;font-weight:700;color:#1f1f1f;">Email</td>
                      <td style="padding:6px 0;color:#4a4a4a;">${participantEmail}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 8px 28px;">
                  <p style="margin:0;color:#4a4a4a;font-size:15px;line-height:1.7;">Thank you for registering for Qiskit Fall Fest 2026. We are looking forward to having you join us for a hands-on experience around quantum computing, learning, workshops, community, and experimentation.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 28px 8px 28px;">
                  <h2 style="margin:0 0 10px 0;font-size:20px;color:#1f1f1f;">What’s next?</h2>
                  <ul style="margin:0;padding-left:20px;color:#4a4a4a;font-size:15px;line-height:1.8;">
                    <li>Keep your registration ID safe for future communication and check-in.</li>
                    <li>Watch your registered email for event updates and follow-up instructions.</li>
                    <li>Follow official event communication for schedule and participation guidance.</li>
                    <li>Contact the organizers if you need assistance.</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 28px 30px 28px;">
                  <div style="border-top:1px solid #f0e0eb;padding-top:16px;color:#4a4a4a;font-size:14px;line-height:1.7;">
                    Thank you for being part of the Qiskit Fall Fest 2026 community.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `

  return { text, html }
}

const sendRegistrationConfirmationEmail = async (registration) => {
  const emailContent = buildRegistrationConfirmationEmailContent(registration)
  const emailPayload = {
    to: registration.email,
    subject: 'Registration Confirmed — Qiskit Fall Fest 2026',
    text: emailContent.text,
    html: emailContent.html,
  }

  try {
    await sendMail(emailPayload)
    return emailPayload
  } catch (error) {
    console.warn('[EMAIL WARN] Registration confirmation email could not be sent.')
    return null
  }
}

const sendEventDayReminder = async (dayId, registration) => {
  const reminderKey = `${registration.registrationId}:${dayId}`
  const payload = {
    registrationId: registration.registrationId,
    eventDay: dayId,
    emailType: 'EVENT_DAY_REMINDER',
    recipient: registration.email,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }

  const existingNotification = notificationRepository.findExisting(payload)
  if (existingNotification) {
    return { skipped: true, reason: 'already_sent', reminderKey }
  }

  const emailPayload = {
    to: registration.email,
    subject: `Qiskit Fall Fest 2026 - Day ${dayId} Reminder`,
    text: `Hello ${registration.fullName},\n\nThis is a reminder for Day ${dayId} of Qiskit Fall Fest 2026.\nPlease check the final schedule and venue details shared by the organizers.`,
  }

  try {
    await sendMail(emailPayload)
    notificationRepository.markSent(payload)
    return { skipped: false, reminderKey }
  } catch (error) {
    notificationRepository.markFailed(payload, 'SMTP delivery failed')
    console.warn(`[EMAIL WARN] Failed to send reminder for day ${dayId}.`)
    return { skipped: true, reason: 'failed', reminderKey }
  }
}

const scheduleEventDayReminders = async (registration) => {
  const relevantDays = ['1', '2', '3']

  for (const dayId of relevantDays) {
    try {
      await sendEventDayReminder(dayId, registration)
    } catch (error) {
      console.warn(`[EMAIL WARN] Failed to schedule reminder for day ${dayId}:`, error.message)
    }
  }

  return true
}

const validateRegistrationPayload = (payload) => {
  const requiredFields = [
    'fullName',
    'email',
    'mobileNumber',
    'role',
    'instituteName',
    'department',
    'knowsPython',
    'aicteQuantumCourse',
    'knowsQuantumBasics',
    'usedQiskitBefore',
  ]

  for (const fieldName of requiredFields) {
    if (payload[fieldName] === undefined || payload[fieldName] === null || String(payload[fieldName]).trim() === '') {
      throw new AppError(400, 'VALIDATION_ERROR', `Missing required field: ${fieldName}`)
    }
  }

  if (typeof payload.fullName !== 'string' || payload.fullName.trim().length < 2) {
    throw new AppError(400, 'VALIDATION_ERROR', 'fullName must be at least 2 characters long.')
  }

  if (!isValidEmail(payload.email)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid email format.')
  }

  if (!isValidMobileNumber(payload.mobileNumber)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'mobileNumber is invalid.')
  }

  if (!VALID_ROLES.has(String(payload.role).trim().toUpperCase())) {
    throw new AppError(400, 'VALIDATION_ERROR', 'role must be one of STUDENT, FACULTY, PROFESSIONAL, OTHER.')
  }

  for (const fieldName of BOOLEAN_FIELDS) {
    if (!isBooleanLikeText(payload[fieldName])) {
      throw new AppError(400, 'VALIDATION_ERROR', `${fieldName} must be either "true" or "false".`)
    }
  }

  if (!payload.idCard && !payload.file) {
    throw new AppError(400, 'VALIDATION_ERROR', 'idCard is required.')
  }
}

const registerUser = async (payload = {}, file) => {
  const requestPayload = {
    ...payload,
    ...(file ? { idCard: file } : {}),
  }

  validateRegistrationPayload(requestPayload)

  const email = normalizeEmail(requestPayload.email)
  const existingRegistration = await registrationRepository.findByEmail(email)

  if (existingRegistration) {
    throw new AppError(400, 'EMAIL_ALREADY_REGISTERED', 'This email is already registered.')
  }

  if (!file) {
    throw new AppError(400, 'VALIDATION_ERROR', 'idCard is required.')
  }

  if ((!file.buffer && !file.path) || file.size <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'idCard file is missing or empty.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new AppError(400, 'INVALID_FILE_SIZE', 'idCard file exceeds the allowed size limit.')
  }

  const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new AppError(400, 'INVALID_FILE_TYPE', 'Invalid ID card file type. Allowed types: JPEG, PNG, PDF.')
  }

  const idCardUrl = await uploadIdCardToSupabase(file)
  const generatedId = await generateRegistrationId()

  const registration = {
    id: generatedId.id,
    registrationId: generatedId.registrationId,
    status: 'CONFIRMED',
    fullName: String(requestPayload.fullName).trim(),
    email,
    mobileNumber: String(requestPayload.mobileNumber).trim(),
    role: String(requestPayload.role).trim().toUpperCase(),
    instituteName: String(requestPayload.instituteName).trim(),
    department: String(requestPayload.department).trim(),
    knowsPython: normalizeBooleanField(requestPayload.knowsPython),
    aicteQuantumCourse: normalizeBooleanField(requestPayload.aicteQuantumCourse),
    knowsQuantumBasics: normalizeBooleanField(requestPayload.knowsQuantumBasics),
    usedQiskitBefore: normalizeBooleanField(requestPayload.usedQiskitBefore),
    idCardUrl,
    createdAt: new Date().toISOString(),
  }

  await registrationRepository.createRegistration(registration, idCardUrl)

  try {
    await sendRegistrationConfirmationEmail(registration)
  } catch (error) {
    console.warn('[EMAIL WARN] registration confirmation failed', error)
  }

  try {
    await scheduleEventDayReminders(registration)
  } catch (error) {
    console.warn('[EMAIL WARN] scheduled reminder process failed', error)
  }

  return {
    success: true,
    data: {
      registrationId: registration.registrationId,
      status: registration.status,
      idCardUrl,
    },
  }
}

const registerAuthUser = async (payload = {}) => {
  const { fullName, email, password } = payload

  if (!fullName || !email || !password) {
    throw new AppError(400, 'VALIDATION_ERROR', 'fullName, email, and password are required.')
  }

  if (!isValidEmail(email)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid email format.')
  }

  if (userRepository.findByEmail(email)) {
    throw new AppError(409, 'EMAIL_ALREADY_REGISTERED', 'This email is already registered.')
  }

  const user = {
    id: `user-${Date.now()}`,
    fullName: String(fullName).trim(),
    email: normalizeEmail(email),
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: 'PARTICIPANT',
    createdAt: new Date().toISOString(),
  }

  userRepository.create(user)

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token: createJwtToken(user),
    },
  }
}

const loginUser = async (payload = {}) => {
  const { email, password } = payload

  if (!email || !password) {
    throw new AppError(400, 'VALIDATION_ERROR', 'email and password are required.')
  }

  const user = userRepository.findByEmail(email)
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
  }

  const isValidPassword = bcrypt.compareSync(String(password), user.passwordHash)
  if (!isValidPassword) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.')
  }

  return {
    success: true,
    data: {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token: createJwtToken(user),
    },
  }
}

const refreshAuthToken = async (user) => ({
  success: true,
  data: {
    token: createJwtToken({ id: user.userId, email: user.email, role: user.role }),
  },
})

const logoutUser = async () => ({
  success: true,
  data: {
    message: 'Logged out successfully.',
  },
})

const getEvents = async () => ({
  success: true,
  data: eventRepository.findAllEvents(),
})

const getEventById = async (eventId) => {
  const event = eventRepository.findEventById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.')
  }

  return {
    success: true,
    data: event,
  }
}

const createEvent = async (payload = {}) => {
  const { eventId, name, description, location, startDate, endDate } = payload

  if (!eventId || !name || !location || !startDate || !endDate) {
    throw new AppError(400, 'VALIDATION_ERROR', 'eventId, name, location, startDate, and endDate are required.')
  }

  const event = {
    eventId: String(eventId),
    name: String(name).trim(),
    description: description || '',
    location: String(location).trim(),
    startDate: String(startDate),
    endDate: String(endDate),
    status: 'ACTIVE',
  }

  eventRepository.createEvent(event)
  return { success: true, data: event }
}

const updateEvent = async (eventId, payload = {}) => {
  const event = eventRepository.findEventById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.')
  }

  const updated = eventRepository.updateEvent(eventId, payload)
  return { success: true, data: updated }
}

const deleteEvent = async (eventId) => {
  const event = eventRepository.findEventById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.')
  }

  eventRepository.deleteEvent(eventId)
  return { success: true, data: { eventId, deleted: true } }
}

const getEventDays = async (eventId) => {
  const event = eventRepository.findEventById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.')
  }

  return { success: true, data: eventRepository.findDaysByEvent(eventId) }
}

const getEventDayById = async (eventId, dayId) => {
  const day = eventRepository.findDayById(eventId, dayId)
  if (!day) {
    throw new AppError(404, 'EVENT_DAY_NOT_FOUND', 'Event day not found.')
  }

  return { success: true, data: day }
}

const createEventDay = async (eventId, payload = {}) => {
  const event = eventRepository.findEventById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.')
  }

  const { dayId, dayNumber, name, date, startTime, endTime, venue, importantInfo } = payload
  if (!dayId || !dayNumber || !name || !date || !startTime || !endTime || !venue) {
    throw new AppError(400, 'VALIDATION_ERROR', 'dayId, dayNumber, name, date, startTime, endTime, and venue are required.')
  }

  const day = {
    eventId,
    dayId: String(dayId),
    dayNumber: Number(dayNumber),
    name: String(name).trim(),
    date: String(date),
    startTime: String(startTime),
    endTime: String(endTime),
    venue: String(venue).trim(),
    importantInfo: importantInfo || '',
  }

  eventRepository.createDay(day)
  return { success: true, data: day }
}

const updateEventDay = async (eventId, dayId, payload = {}) => {
  const day = eventRepository.findDayById(eventId, dayId)
  if (!day) {
    throw new AppError(404, 'EVENT_DAY_NOT_FOUND', 'Event day not found.')
  }

  const updated = eventRepository.updateDay(eventId, dayId, payload)
  return { success: true, data: updated }
}

const deleteEventDay = async (eventId, dayId) => {
  const day = eventRepository.findDayById(eventId, dayId)
  if (!day) {
    throw new AppError(404, 'EVENT_DAY_NOT_FOUND', 'Event day not found.')
  }

  eventRepository.deleteDay(eventId, dayId)
  return { success: true, data: { eventId, dayId, deleted: true } }
}

const getSchedule = async (eventId, dayId) => {
  const event = eventRepository.findEventById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found.')
  }

  return { success: true, data: eventRepository.findScheduleByEventDay(eventId, dayId) }
}

const createSchedule = async (eventId, dayId, payload = {}) => {
  const day = eventRepository.findDayById(eventId, dayId)
  if (!day) {
    throw new AppError(404, 'EVENT_DAY_NOT_FOUND', 'Event day not found.')
  }

  const { scheduleId, title, speaker, startTime, endTime, venue } = payload
  if (!scheduleId || !title || !speaker || !startTime || !endTime || !venue) {
    throw new AppError(400, 'VALIDATION_ERROR', 'scheduleId, title, speaker, startTime, endTime, and venue are required.')
  }

  const schedule = {
    scheduleId: String(scheduleId),
    eventId,
    dayId,
    title: String(title).trim(),
    speaker: String(speaker).trim(),
    startTime: String(startTime),
    endTime: String(endTime),
    venue: String(venue).trim(),
  }

  eventRepository.createSchedule(schedule)
  return { success: true, data: schedule }
}

const updateSchedule = async (scheduleId, payload = {}) => {
  const schedule = eventRepository.findScheduleById(scheduleId)
  if (!schedule) {
    throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Schedule not found.')
  }

  const updated = eventRepository.updateSchedule(scheduleId, payload)
  return { success: true, data: updated }
}

const deleteSchedule = async (scheduleId) => {
  const schedule = eventRepository.findScheduleById(scheduleId)
  if (!schedule) {
    throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Schedule not found.')
  }

  eventRepository.deleteSchedule(scheduleId)
  return { success: true, data: { scheduleId, deleted: true } }
}

const getParticipantById = async (participantId, user) => {
  const participant = userRepository.users.find((item) => item.id === participantId)
  if (!participant) {
    throw new AppError(404, 'PARTICIPANT_NOT_FOUND', 'Participant not found.')
  }

  if (user.role !== 'ADMIN' && user.userId !== participantId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have access to this participant record.')
  }

  return {
    success: true,
    data: {
      id: participant.id,
      fullName: participant.fullName,
      email: participant.email,
      role: participant.role,
    },
  }
}

const updateParticipantById = async (participantId, payload = {}, user) => {
  const participantIndex = userRepository.users.findIndex((item) => item.id === participantId)
  if (participantIndex === -1) {
    throw new AppError(404, 'PARTICIPANT_NOT_FOUND', 'Participant not found.')
  }

  if (user.role !== 'ADMIN' && user.userId !== participantId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have access to update this participant record.')
  }

  const participant = userRepository.users[participantIndex]
  const nextParticipant = {
    ...participant,
    ...(payload.fullName ? { fullName: String(payload.fullName).trim() } : {}),
  }

  userRepository.users[participantIndex] = nextParticipant

  return {
    success: true,
    data: {
      id: nextParticipant.id,
      fullName: nextParticipant.fullName,
      email: nextParticipant.email,
      role: nextParticipant.role,
    },
  }
}

const getAdminRegistrations = async () => ({
  success: true,
  data: await registrationRepository.findAll(),
})

const getAdminParticipants = async () => ({
  success: true,
  data: userRepository.users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  })),
})

const getAdminEmailLogs = async () => ({
  success: true,
  data: notificationRepository.notifications,
})

module.exports = {
  registerUser,
  registerAuthUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventDays,
  getEventDayById,
  createEventDay,
  updateEventDay,
  deleteEventDay,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getParticipantById,
  updateParticipantById,
  getAdminRegistrations,
  getAdminParticipants,
  getAdminEmailLogs,
  registrationRepository,
  userRepository,
  eventRepository,
  notificationRepository,
  sendEventDayReminder,
  sendRegistrationConfirmationEmail,
  buildRegistrationConfirmationEmailContent,
  normalizeEmail,
}
