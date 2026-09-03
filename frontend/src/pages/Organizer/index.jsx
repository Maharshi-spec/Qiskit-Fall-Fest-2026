import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Button from '../../components/Button'
import { api } from '../../services/api'

const ORGANIZER_EMAIL = 'admin@qiskitfallfest.com'
const ORGANIZER_PASSWORD = 'Admin@123'

const getOrganizerToken = () => api.getOrganizerToken()

const parseJwtPayload = (token) => {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

const isOrganizerAuthenticated = () => {
  const token = getOrganizerToken()
  if (!token) return false
  const payload = parseJwtPayload(token)
  if (!payload) return false
  return payload.role === 'ORGANIZER' || payload.role === 'ADMIN'
}

const OrganizerLayout = ({ children }) => {
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const organizerToken = getOrganizerToken()
  const organizerProfile = organizerToken ? parseJwtPayload(organizerToken) : null
  const organizerName = organizerProfile?.name || organizerProfile?.fullName || 'Organizer'
  const organizerEmail = organizerProfile?.email || ORGANIZER_EMAIL

  const handleLogout = () => {
    api.clearOrganizerToken()
    navigate('/organizer')
  }

  const navItems = [
    { label: 'Send Email', to: '/organizer/email' },
    { label: 'Attendance', to: '/organizer/attendance' },
    { label: 'Participants', to: '/organizer/participants' },
    { label: 'Rewards', to: '/organizer/rewards' },
  ]

  return (
    <div className="detail-page organizer-page">
      <div className="container organizer-page__content">
        <div className="organizer-page__shell">
          <div className="organizer-page__topbar">
            <div className="organizer-page__brand">
              <p className="page-shell__eyebrow">Organizer dashboard</p>
              <h2>Event operations</h2>
            </div>

            <div className="organizer-page__header-actions">
              <div
                ref={profileRef}
                className="organizer-page__profile-wrap"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  className="organizer-page__profile-button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <span className="organizer-page__profile-avatar">{organizerName.charAt(0).toUpperCase()}</span>
                </button>

                {profileOpen && (
                  <div className="organizer-page__profile-popover" role="dialog" aria-label="Organizer profile">
                    <div className="organizer-page__profile-summary">
                      <span className="organizer-page__profile-avatar organizer-page__profile-avatar--large">{organizerName.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{organizerName}</strong>
                        <small>Organizer</small>
                      </div>
                    </div>
                    <div className="organizer-page__profile-meta">
                      <span>Email</span>
                      <strong>{organizerEmail}</strong>
                    </div>
                    <div className="organizer-page__profile-status">
                      <span className="organizer-page__role-badge">Organizer</span>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/organizer" className="button button--secondary">Dashboard</Link>
              <button type="button" className="button button--primary" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <nav aria-label="Organizer navigation" className="organizer-page__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `button ${isActive ? 'is-active' : ''}`}
                end={item.to === '/organizer'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {children}
      </div>
    </div>
  )
}

const OrganizerLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) {
      setError('')
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await api.organizerLogin({
      email: form.email,
      password: form.password,
    })

    setIsLoading(false)

    if (result.success) {
      navigate('/organizer')
      return
    }

    setError('Invalid organizer credentials.')
  }

  return (
    <div className="detail-page">
      <div className="container detail-page__panel">
        <div className="detail-page__panel-copy">
          <p className="page-shell__eyebrow">Organizer access</p>
          <h2>Sign in to your dashboard.</h2>
          <p>This area is restricted to authorized organizers.</p>
        </div>

        <div className="detail-page__form-shell detail-page__form-shell--compact">
          <form className="detail-form" onSubmit={handleLogin}>
            {error && (
              <div style={{ padding: '0.8rem 0.9rem', borderRadius: '12px', background: 'rgba(255,79,163,0.08)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>
                {error}
              </div>
            )}

            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>

            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>

            <Button type="submit" kind="primary" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Login to Organizer Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

const OrganizerDashboardHome = () => {
  return (
    <div className="detail-page__panel">
      <div className="detail-page__panel-copy">
        <p className="page-shell__eyebrow">Overview</p>
        <h2>Organizer dashboard</h2>
        <p>Use the sections above to manage email communication, attendance, participant records, and rewards.</p>
      </div>
      <div className="detail-page__info-stack">
        <div className="detail-info-item">
          <span>Operations</span>
          <strong>4 sections</strong>
        </div>
        <div className="detail-info-item">
          <span>Access</span>
          <strong>Restricted to organizers</strong>
        </div>
      </div>
    </div>
  )
}

const OrganizerEmailPage = () => {
  const [form, setForm] = useState({ recipients: ORGANIZER_EMAIL, subject: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    const result = await api.organizerSendEmail({
      recipients: form.recipients.split(',').map((item) => item.trim()).filter(Boolean),
      subject: form.subject,
      message: form.message,
    })

    setIsLoading(false)

    if (!result.success) {
      setError(result.error?.message || 'Email sending failed.')
      return
    }

    setSuccess(`Email sent successfully to ${result.data?.sentTo?.join(', ') || 'recipients'}.`)
    setForm((prev) => ({ ...prev, subject: '', message: '' }))
  }

  return (
    <div className="detail-page__panel">
      <div className="detail-page__panel-copy">
        <p className="page-shell__eyebrow">Send Email</p>
        <h2>Email participants</h2>
        <p>Send organizer messages using the real backend email service.</p>
      </div>

      <div className="detail-page__form-shell" style={{ maxWidth: '760px' }}>
        <form className="detail-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{ padding: '0.8rem 0.9rem', borderRadius: '12px', background: 'rgba(255,79,163,0.08)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '0.8rem 0.9rem', borderRadius: '12px', background: 'rgba(42, 190, 120, 0.08)', color: '#1b8f65', border: '1px solid rgba(42, 190, 120, 0.14)' }}>
              {success}
            </div>
          )}

          <label>
            Role *
            <select name="role" value={form.role || ''} onChange={handleChange} required>
              <option value="">Select your role</option>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Professional">Professional</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Subject
            <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Email subject" required />
          </label>

          <label>
            Message
            <textarea name="message" rows="8" value={form.message} onChange={handleChange} placeholder="Write your message here..." required style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,79,163,0.18)', padding: '0.8rem 0.9rem' }} />
          </label>

          <Button type="submit" kind="primary" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send Email'}
          </Button>
        </form>
      </div>
    </div>
  )
}

const OrganizerAttendancePage = () => {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [qrToken, setQrToken] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [attendanceCount, setAttendanceCount] = useState(0)
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      const res = await api.organizerFetchEvents()
      setIsLoading(false)
      if (res.success && res.data) {
        setEvents(res.data)
      }
    }
    fetchEvents()
  }, [])

  const loadAttendanceData = async (eventId) => {
    const res = await api.organizerFetchAttendanceData(eventId)
    if (res.success && res.data) {
      setAttendanceCount(res.data.count || 0)
      setRecords(res.data.records || [])
    }
  }

  const fetchNewToken = async (eventId) => {
    const res = await api.organizerFetchQrToken(eventId)
    if (res.success && res.data?.token) {
      setQrToken(res.data.token)
      setCountdown(3)
    }
  }

  useEffect(() => {
    if (!selectedEvent) return

    loadAttendanceData(selectedEvent.eventId)
    api.organizerStartAttendanceSession(selectedEvent.eventId)
    setSessionActive(true)
    fetchNewToken(selectedEvent.eventId)

    const tokenInterval = setInterval(() => {
      fetchNewToken(selectedEvent.eventId)
    }, 3000)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 3))
    }, 1000)

    const dataPollInterval = setInterval(() => {
      loadAttendanceData(selectedEvent.eventId)
    }, 2000)

    return () => {
      clearInterval(tokenInterval)
      clearInterval(countdownInterval)
      clearInterval(dataPollInterval)
    }
  }, [selectedEvent])

  const toggleSession = async () => {
    if (!selectedEvent) return
    if (sessionActive) {
      await api.organizerStopAttendanceSession(selectedEvent.eventId)
      setSessionActive(false)
      setQrToken('')
    } else {
      await api.organizerStartAttendanceSession(selectedEvent.eventId)
      setSessionActive(true)
      fetchNewToken(selectedEvent.eventId)
    }
  }

  if (!selectedEvent) {
    return (
      <div className="detail-page__panel" style={{ display: 'grid', gap: '1.25rem' }}>
        <div className="detail-page__panel-copy">
          <p className="page-shell__eyebrow">Attendance Management</p>
          <h2>Select an Event for Attendance</h2>
          <p>Select an event below to open its Event Attendance Board and launch dynamic QR code check-in.</p>
        </div>

        {isLoading ? (
          <div className="detail-info-item"><span>Loading</span><strong>Fetching events list…</strong></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {events.map((evt) => (
              <div
                key={evt.eventId}
                className="detail-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  padding: '1.25rem',
                  border: '1px solid rgba(255,79,163,0.18)',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.85)',
                }}
              >
                <div>
                  <p className="detail-card__eyebrow" style={{ color: '#ff4fa3' }}>{evt.date}</p>
                  <h3 style={{ fontSize: '1.15rem', margin: '0.4rem 0', color: '#2d253f' }}>{evt.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#5f5773', marginBottom: '0.8rem' }}>{evt.description}</p>
                  <span style={{ fontSize: '0.82rem', color: '#88809e' }}>📍 {evt.venue}</span>
                </div>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => setSelectedEvent(evt)}
                  style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                >
                  Open Attendance Board →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="detail-page__panel" style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="page-shell__eyebrow" style={{ color: '#ff4fa3' }}>Event Attendance Board</p>
          <h2 style={{ margin: 0 }}>{selectedEvent.name}</h2>
          <p style={{ margin: '0.2rem 0 0 0', color: '#5f5773', fontSize: '0.9rem' }}>📍 {selectedEvent.venue} ({selectedEvent.date})</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`button ${sessionActive ? 'button--secondary' : 'button--primary'}`}
            onClick={toggleSession}
          >
            {sessionActive ? 'Stop Session' : 'Start Session'}
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setSelectedEvent(null)
              setQrToken('')
            }}
          >
            ← Back to Events List
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
        {/* Dynamic QR Board */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 79, 163, 0.2)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontWeight: 700, color: '#3d2f59', fontSize: '1rem', marginBottom: '0.5rem' }}>
            DYNAMIC ATTENDANCE QR
          </p>

          {sessionActive && qrToken ? (
            <>
              <div style={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '16px',
                border: '2px solid rgba(255,79,163,0.3)',
                boxShadow: '0 4px 20px rgba(255,79,163,0.12)',
              }}>
                <QRCodeSVG value={qrToken} size={210} level="M" includeMargin />
              </div>

              <div style={{ marginTop: '1rem', width: '100%' }}>
                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#6e6584',
                  marginBottom: '0.3rem',
                }}>
                  <span>Backend QR Refresh</span>
                  <span style={{ color: '#ff4fa3' }}>{countdown}s</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,79,163,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(countdown / 3) * 100}%`,
                    background: '#ff4fa3',
                    transition: 'width 1s linear',
                  }} />
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#7a7291', marginTop: '0.75rem' }}>
                🔒 Expiration enforced by backend every 3 seconds. Screenshots will be rejected.
              </p>
            </>
          ) : (
            <div style={{ padding: '3rem 1rem', color: '#7a7291' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Attendance Session Paused</p>
              <p style={{ fontSize: '0.9rem' }}>Click "Start Session" above to display the dynamic QR code.</p>
            </div>
          )}

          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '14px',
            background: 'rgba(255, 79, 163, 0.08)',
            border: '1px solid rgba(255, 79, 163, 0.2)',
            width: '100%',
          }}>
            <span style={{ fontSize: '0.85rem', color: '#6e6584', display: 'block' }}>Total Marked Present</span>
            <strong style={{ fontSize: '1.8rem', color: '#ff4fa3', fontWeight: 800 }}>{attendanceCount}</strong>
          </div>
        </div>

        {/* Live Attendance Log Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 79, 163, 0.2)',
          borderRadius: '20px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#3d2f59' }}>LIVE ATTENDANCE</h3>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '20px',
              background: sessionActive ? 'rgba(42, 190, 120, 0.12)' : 'rgba(120,120,120,0.1)',
              color: sessionActive ? '#1b8f65' : '#666',
            }}>
              {sessionActive ? '● LIVE UPDATES' : 'OFFLINE'}
            </span>
          </div>

          {records.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#7a7291', fontSize: '0.9rem' }}>
              No participants marked present for this event yet.
            </div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,79,163,0.15)', textAlign: 'left', color: '#6e6584' }}>
                    <th style={{ padding: '0.6rem' }}>Participant</th>
                    <th style={{ padding: '0.6rem' }}>Registration ID</th>
                    <th style={{ padding: '0.6rem' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id || r.registrationId + r.markedAt} style={{ borderBottom: '1px solid rgba(255,79,163,0.08)' }}>
                      <td style={{ padding: '0.6rem' }}>
                        <div style={{ fontWeight: 700, color: '#2d253f' }}>{r.fullName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#7a7291' }}>{r.email}</div>
                      </td>
                      <td style={{ padding: '0.6rem', color: '#ff4fa3', fontWeight: 600 }}>{r.registrationId}</td>
                      <td style={{ padding: '0.6rem', color: '#6e6584', fontSize: '0.8rem' }}>
                        {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : 'Just now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const OrganizerParticipantsPage = () => {
  const participantRoleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'FACULTY', label: 'Faculty' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'OTHER', label: 'Other' },
  ]
  const [participants, setParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('ALL')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      const result = await api.organizerFetchParticipants()
      setIsLoading(false)

      if (!result.success) {
        setError(result.error?.message || 'Unable to load participants.')
        return
      }

      setParticipants(Array.isArray(result.data) ? result.data : [])
    }

    load()
  }, [])

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch = !normalizedSearchTerm || `${participant.fullName || ''} ${participant.email || ''}`.toLowerCase().includes(normalizedSearchTerm)
    const matchesRole = selectedRole === 'ALL' || String(participant.role || '').toUpperCase() === selectedRole
    return matchesSearch && matchesRole
  })
  const hasFilters = Boolean(normalizedSearchTerm) || selectedRole !== 'ALL'

  return (
    <div className="detail-page__panel organizer-participants" style={{ display: 'grid' }}>
      <div className="detail-page__panel-copy">
        <p className="page-shell__eyebrow">Participants</p>
        <h2>Registered participant records</h2>
      </div>

      {isLoading ? (
        <div className="detail-info-item"><span>Loading</span><strong>Fetching participant records…</strong></div>
      ) : error ? (
        <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,79,163,0.06)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>{error}</div>
      ) : participants.length === 0 ? (
        <div className="detail-info-item"><span>Empty state</span><strong>No participants registered yet.</strong></div>
      ) : (
        <div className="organizer-participants__body">
          <div className="organizer-participants__filters">
            <label className="organizer-participants__search" htmlFor="participant-search">
              <span>Search participants</span>
              <div className="organizer-participants__search-control">
                <span aria-hidden="true">⌕</span>
                <input id="participant-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name or email..." />
                {searchTerm && <button type="button" onClick={() => setSearchTerm('')}>Clear</button>}
              </div>
            </label>
            <label className="organizer-participants__role" htmlFor="participant-role">
              <span>Role</span>
              <select id="participant-role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                <option value="ALL">All Roles</option>
                {participantRoleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </label>
          </div>

          <div className="organizer-participants__summary" aria-live="polite">
            <span>{hasFilters ? `Showing ${filteredParticipants.length} of ${participants.length} participants` : `Showing ${participants.length} participants`}</span>
            {hasFilters && <button type="button" onClick={() => { setSearchTerm(''); setSelectedRole('ALL') }}>Clear filters</button>}
          </div>

          <div className="organizer-page__table-wrap organizer-participants__table-wrap">
          <table className="organizer-page__table organizer-participants__table">
            <thead>
              <tr style={{ background: 'rgba(255,79,163,0.06)' }}>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length > 0 ? filteredParticipants.map((participant) => (
                <tr key={participant.registrationId || participant.email} style={{ borderTop: '1px solid rgba(255,79,163,0.08)' }}>
                  <td data-label="Name">{participant.fullName}</td>
                  <td data-label="Email">{participant.email}</td>
                  <td data-label="Role">{participantRoleOptions.find((role) => role.value === String(participant.role || '').toUpperCase())?.label || participant.role}</td>
                </tr>
              )) : <tr className="organizer-participants__empty-row"><td colSpan="3"><strong>No registered participants found.</strong><span>Try searching with a different name or email.</span></td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  )
}

const rewardCategories = [
  { value: 'HACKATHON_PARTICIPANT', label: 'Hackathon', heading: 'Hackathon rewards' },
  { value: 'BOOTCAMP_PARTICIPANT', label: 'Bootcamp', heading: 'Quantum Bootcamp' },
  { value: 'WEBINAR', label: 'Webinar', heading: 'Webinar' },
  { value: 'WORKSHOP_PARTICIPANT', label: 'Workshop', heading: 'Workshop' },
]

const getRewardParticipant = (participant) => participant.fullName || participant.full_name || participant.email || participant.participant_name || participant.participant_email || 'Participant'

const OrganizerRewardsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('HACKATHON_PARTICIPANT')
  const [certificates, setCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      const certificatesResult = await api.organizerFetchCertificates()
      setIsLoading(false)
      if (!certificatesResult.success) setError(certificatesResult.error?.message || 'Unable to load reward records.')
      setCertificates(Array.isArray(certificatesResult.data) ? certificatesResult.data : [])
    }
    load()
  }, [])

  const category = rewardCategories.find((item) => item.value === selectedCategory) || rewardCategories[0]
  const eligibleParticipants = certificates.filter((certificate) => certificate.certificate_type === selectedCategory)

  return (
    <div className="organizer-rewards">
      <div className="detail-page__panel-copy">
        <p className="page-shell__eyebrow">Rewards</p>
        <h2>Certificates and reward records</h2>
        <p>Choose a certificate category to review its reward workflow.</p>
      </div>

      {isLoading ? (
        <div className="detail-info-item"><span>Loading</span><strong>Loading events...</strong></div>
      ) : error ? (
        <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,79,163,0.06)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>{error}</div>
      ) : (
        <div className="organizer-rewards__content">
          <section className="organizer-rewards__selector" aria-label="Reward category selector">
            <label htmlFor="reward-category">Select event</label>
            <select id="reward-category" value={selectedCategory} onChange={(eventChange) => { setSelectedCategory(eventChange.target.value); setError('') }}>
              {rewardCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </section>

          {selectedCategory === 'HACKATHON_PARTICIPANT' ? (
            <section className="organizer-rewards__workflow">
              <div className="organizer-rewards__section-heading">
                <span className="organizer-rewards__kicker">Hackathon rewards</span>
                <h3>Select team and award</h3>
                <p>Choose an award to automatically use its certificate template.</p>
              </div>
              <label htmlFor="reward-team">Select team</label>
              <select id="reward-team" defaultValue=""><option value="">Select Team</option></select>
              <fieldset className="organizer-rewards__award-list">
                <legend>Award</legend>
                {['1st Position', '1st Runner Up', '2nd Runner Up'].map((award, index) => <label key={award}><input type="radio" name="hackathon-award" value={award} defaultChecked={index === 0} />{award}</label>)}
              </fieldset>
              <button type="button" className="button button--primary">Assign Award</button>
              <div className="organizer-rewards__mapping"><span>Team members</span><strong>No team selected</strong></div>
            </section>
          ) : (
            <section className="organizer-rewards__workflow">
              <div className="organizer-rewards__section-heading">
                <span className="organizer-rewards__kicker">{category.heading}</span>
                <h3>Eligible participants</h3>
                <p>Eligibility comes from the existing attendance records for this event.</p>
              </div>
              <div className="organizer-rewards__participants">
                {eligibleParticipants.length > 0 ? eligibleParticipants.map((participant) => (
                  <div className="organizer-rewards__participant" key={participant.registrationId || participant.email}>
                    <span aria-hidden="true">✓</span>
                    <strong>{getRewardParticipant(participant)}</strong>
                    <small>{participant.status || 'PRESENT'}</small>
                  </div>
                )) : <p className="organizer-rewards__empty">No eligible participants in the current records.</p>}
              </div>
              <button type="button" className="button button--primary" disabled={eligibleParticipants.length === 0}>Generate Certificates</button>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

const OrganizerRoutes = () => {
  const location = useLocation()

  if (!isOrganizerAuthenticated()) {
    return <Navigate to="/organizer" replace state={{ from: location }} />
  }

  return (
    <OrganizerLayout>
      <Routes>
        <Route index element={<OrganizerDashboardHome />} />
        <Route path="email" element={<OrganizerEmailPage />} />
        <Route path="attendance" element={<OrganizerAttendancePage />} />
        <Route path="participants" element={<OrganizerParticipantsPage />} />
        <Route path="rewards" element={<OrganizerRewardsPage />} />
      </Routes>
    </OrganizerLayout>
  )
}

const OrganizerPage = () => {
  const location = useLocation()

  if (!isOrganizerAuthenticated()) {
    return <OrganizerLogin />
  }

  if (location.pathname === '/organizer') {
    return (
      <OrganizerLayout>
        <OrganizerDashboardHome />
      </OrganizerLayout>
    )
  }

  return <OrganizerRoutes />
}

export default OrganizerPage
