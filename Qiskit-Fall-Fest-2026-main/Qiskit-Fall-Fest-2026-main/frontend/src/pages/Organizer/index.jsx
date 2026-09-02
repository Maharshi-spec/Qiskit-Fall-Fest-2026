import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
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

const getOrganizerProfileData = () => {
  const token = getOrganizerToken()
  if (!token) return null

  const payload = parseJwtPayload(token)
  if (!payload) return null

  const profile = {}

  const name = payload.name || payload.fullName || payload.organizerName || payload.displayName
  if (name) profile.name = name

  const email = payload.email || payload.organizerEmail || payload.username || payload.sub
  if (email) profile.email = email

  const organizerId = payload.organizerId || payload.id || payload.userId || payload.sub
  if (organizerId) profile.organizerId = organizerId

  return Object.keys(profile).length > 0 ? profile : null
}

const getProfileInitials = (profile) => {
  const source = profile?.name || profile?.email || 'O'
  const initials = source
    .split(/[@\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  return initials || 'O'
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
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const organizerProfile = getOrganizerProfileData()

  const handleLogout = () => {
    api.clearOrganizerToken()
    setIsProfileOpen(false)
    navigate('/organizer')
  }

  const navItems = [
    { label: 'Send Email', to: '/organizer/email' },
    { label: 'Attendance', to: '/organizer/attendance' },
    { label: 'Participants', to: '/organizer/participants' },
    { label: 'Rewards/Awards', to: '/organizer/rewards' },
  ]

  return (
    <div className="detail-page" style={{ paddingTop: '0' }}>
      <div className="container" style={{ display: 'grid', gap: '1.25rem' }}>
        {/* Small header navbar at top */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '0.9rem 1rem',
            borderBottom: '1px solid rgba(255, 79, 163, 0.12)',
            marginTop: '1rem',
            marginBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#655f7b', letterSpacing: '0.05em' }}>ORGANIZER DASHBOARD</span>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1f1f2b' }}>Event operations</h2>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/organizer"
              style={{
                background: 'none',
                border: '1px solid rgba(255, 79, 163, 0.28)',
                borderRadius: '999px',
                padding: '0.52rem 0.9rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1f1f2b',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #ff5aab 0%, #ff4fa3 100%)',
                border: 'none',
                borderRadius: '999px',
                padding: '0.52rem 1rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 6px 14px rgba(255, 79, 163, 0.18)',
              }}
            >
              Logout
            </button>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((current) => !current)}
                aria-expanded={isProfileOpen}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingInline: '0.9rem',
                  background: 'none',
                  border: '1px solid rgba(255, 79, 163, 0.28)',
                  borderRadius: '999px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#1f1f2b',
                  cursor: 'pointer',
                  padding: '0.52rem 0.9rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.4rem',
                    height: '1.4rem',
                    borderRadius: '999px',
                    background: 'rgba(255,79,163,0.12)',
                    color: '#8c1a5d',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {getProfileInitials(organizerProfile)}
                </span>
                Profile
              </button>

              {isProfileOpen && organizerProfile && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.45rem)',
                    right: 0,
                    width: '240px',
                    background: '#fff',
                    border: '1px solid rgba(255,79,163,0.18)',
                    borderRadius: '14px',
                    boxShadow: '0 18px 36px rgba(50, 30, 60, 0.12)',
                    padding: '0.9rem',
                    display: 'grid',
                    gap: '0.5rem',
                    zIndex: 10,
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1d1830' }}>{organizerProfile.name || 'Organizer'}</div>
                  {organizerProfile.email && (
                    <div style={{ color: '#655f7b', fontSize: '0.9rem', wordBreak: 'break-word' }}>{organizerProfile.email}</div>
                  )}
                  {organizerProfile.organizerId && (
                    <div style={{ color: '#655f7b', fontSize: '0.8rem' }}>ID: {organizerProfile.organizerId}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organizer nav items */}
        <nav
          aria-label="Organizer navigation"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            marginBottom: '0.5rem',
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/organizer'}
              className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

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
    <div
      className="detail-page"
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      <div className="container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          className="detail-page__panel"
          style={{
            width: '100%',
            maxWidth: '960px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            alignItems: 'center',
            gap: '1.5rem',
            margin: '0 auto',
          }}
        >
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
            Recipients
            <input type="text" name="recipients" value={form.recipients} onChange={handleChange} placeholder="email1@example.com, email2@example.com" required />
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
  const [allParticipants, setAllParticipants] = useState([])
  const [filteredParticipants, setFilteredParticipants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setIsLoading(true)
    setError('')
    const result = await api.organizerFetchAttendance()
    setIsLoading(false)

    if (!result.success) {
      setError(result.error?.message || 'Unable to load attendance.')
      return
    }

    const data = Array.isArray(result.data) ? result.data : []
    setAllParticipants(data)
    setFilteredParticipants(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    const filtered = allParticipants.filter((p) => p.fullName?.toLowerCase().includes(query.toLowerCase()) || p.email?.toLowerCase().includes(query.toLowerCase()))
    setFilteredParticipants(filtered)
  }

  const updateStatus = async (registrationId, status) => {
    const result = await api.organizerUpdateAttendance(registrationId, status)
    if (!result.success) {
      setError(result.error?.message || 'Failed to update attendance.')
      return
    }

    await load()
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 'calc(100vh - 250px)', gap: '1rem' }}>
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#655f7b', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>ATTENDANCE</p>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1f1f2b', marginBottom: '0.5rem' }}>Mark attendee presence</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,79,163,0.18)',
              fontSize: '0.95rem',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div>
            <strong style={{ color: '#1f1f2b' }}>Fetching attendance status…</strong>
          </div>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,79,163,0.06)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>{error}</div>
      ) : filteredParticipants.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <strong style={{ color: '#655f7b' }}>{searchQuery ? 'No participants match your search.' : 'No participants registered yet.'}</strong>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,79,163,0.14)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.9)' }}>
            <thead>
              <tr style={{ background: 'rgba(255,79,163,0.08)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Participant</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Mark</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.registrationId} style={{ borderTop: '1px solid rgba(255,79,163,0.08)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#1f1f2b' }}>{participant.fullName}</div>
                    <div style={{ color: '#655f7b', fontSize: '0.9rem' }}>{participant.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#1f1f2b', fontWeight: 600 }}>{participant.role || 'N/A'}</td>
                  <td style={{ padding: '1rem', color: '#1f1f2b', fontWeight: 600 }}>{participant.attendanceStatus || 'NOT_MARKED'}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['PRESENT', 'ABSENT', 'NOT_MARKED'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateStatus(participant.registrationId, status)}
                          style={{
                            padding: '0.55rem 0.8rem',
                            fontSize: '0.82rem',
                            borderRadius: '999px',
                            background: participant.attendanceStatus === status ? 'linear-gradient(135deg, #ff5aab 0%, #ff4fa3 100%)' : 'rgba(255, 79, 163, 0.08)',
                            border: participant.attendanceStatus === status ? 'none' : '1px solid rgba(255, 79, 163, 0.18)',
                            color: participant.attendanceStatus === status ? '#fff' : '#1f1f2b',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const OrganizerParticipantsPage = () => {
  const [allParticipants, setAllParticipants] = useState([])
  const [filteredParticipants, setFilteredParticipants] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

      const data = Array.isArray(result.data) ? result.data : []
      setAllParticipants(data)
      setFilteredParticipants(data)
    }

    load()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    const filtered = allParticipants.filter((p) => p.fullName?.toLowerCase().includes(query.toLowerCase()) || p.email?.toLowerCase().includes(query.toLowerCase()))
    setFilteredParticipants(filtered)
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: 'calc(100vh - 250px)', gap: '1rem' }}>
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#655f7b', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>PARTICIPANTS</p>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1f1f2b', marginBottom: '0.5rem' }}>Registered participant records</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,79,163,0.18)',
              fontSize: '0.95rem',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div>
            <strong style={{ color: '#1f1f2b' }}>Fetching participant records…</strong>
          </div>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,79,163,0.06)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>{error}</div>
      ) : filteredParticipants.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <strong style={{ color: '#655f7b' }}>{searchQuery ? 'No participants match your search.' : 'No participants registered yet.'}</strong>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,79,163,0.14)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.9)' }}>
            <thead>
              <tr style={{ background: 'rgba(255,79,163,0.08)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: '#1f1f2b', fontSize: '0.95rem' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.registrationId || participant.email} style={{ borderTop: '1px solid rgba(255,79,163,0.08)' }}>
                  <td style={{ padding: '1rem', color: '#1f1f2b', fontWeight: 600 }}>{participant.fullName}</td>
                  <td style={{ padding: '1rem', color: '#1f1f2b' }}>{participant.email}</td>
                  <td style={{ padding: '1rem', color: '#1f1f2b', fontWeight: 600 }}>{participant.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const OrganizerRewardsPage = () => {
  const [certificates, setCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      const result = await api.organizerFetchCertificates()
      setIsLoading(false)

      if (!result.success) {
        setError(result.error?.message || 'Unable to load reward records.')
        return
      }

      setCertificates(Array.isArray(result.data) ? result.data : [])
    }

    load()
  }, [])

  return (
    <div className="detail-page__panel" style={{ display: 'grid' }}>
      <div className="detail-page__panel-copy">
        <p className="page-shell__eyebrow">Rewards</p>
        <h2>Certificates and reward records</h2>
      </div>

      {isLoading ? (
        <div className="detail-info-item"><span>Loading</span><strong>Checking reward data…</strong></div>
      ) : error ? (
        <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,79,163,0.06)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>{error}</div>
      ) : certificates.length === 0 ? (
        <div className="detail-info-item"><span>Empty state</span><strong>No certificates or reward records found.</strong></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,79,163,0.14)' }}>
            <thead>
              <tr style={{ background: 'rgba(255,79,163,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Participant</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate.id || certificate.certificate_number} style={{ borderTop: '1px solid rgba(255,79,163,0.08)' }}>
                  <td style={{ padding: '0.9rem' }}>{certificate.certificate_type || 'Certificate'}</td>
                  <td style={{ padding: '0.9rem' }}>{certificate.participant_name || certificate.participant_email || 'Participant'}</td>
                  <td style={{ padding: '0.9rem' }}>{certificate.status || 'issued'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
