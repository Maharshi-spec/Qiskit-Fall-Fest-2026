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

const isOrganizerAuthenticated = () => {
  const token = getOrganizerToken()
  if (!token) return false
  const payload = parseJwtPayload(token)
  if (!payload) return false
  return payload.role === 'ORGANIZER' || payload.role === 'ADMIN'
}

const OrganizerLayout = ({ children }) => {
  const navigate = useNavigate()

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
    <div className="detail-page" style={{ paddingTop: '1.5rem' }}>
      <div className="container" style={{ display: 'grid', gap: '1.25rem' }}>
        <div className="detail-page__panel" style={{ gridTemplateColumns: '1fr auto' }}>
          <div className="detail-page__panel-copy">
            <p className="page-shell__eyebrow">Organizer dashboard</p>
            <h2>Event operations</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link to="/organizer" className="button button--secondary">Dashboard</Link>
            <button type="button" className="button button--primary" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <nav aria-label="Organizer navigation" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          border: '1px solid rgba(255,79,163,0.14)',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.82)',
        }}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `button ${isActive ? 'button--primary' : 'button--secondary'}`}
              end={item.to === '/organizer'}
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
  const [participants, setParticipants] = useState([])
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

    setParticipants(Array.isArray(result.data) ? result.data : [])
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (registrationId, status) => {
    const result = await api.organizerUpdateAttendance(registrationId, status)
    if (!result.success) {
      setError(result.error?.message || 'Failed to update attendance.')
      return
    }

    await load()
  }

  return (
    <div className="detail-page__panel" style={{ display: 'grid' }}>
      <div className="detail-page__panel-copy">
        <p className="page-shell__eyebrow">Attendance</p>
        <h2>Mark attendee presence</h2>
      </div>

      {isLoading ? (
        <div className="detail-info-item"><span>Loading</span><strong>Fetching attendance status…</strong></div>
      ) : error ? (
        <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'rgba(255,79,163,0.06)', color: '#c2348a', border: '1px solid rgba(255,79,163,0.14)' }}>{error}</div>
      ) : participants.length === 0 ? (
        <div className="detail-info-item"><span>Empty state</span><strong>No participants registered yet.</strong></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,79,163,0.14)', borderRadius: '16px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'rgba(255,79,163,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Participant</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Mark</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.registrationId} style={{ borderTop: '1px solid rgba(255,79,163,0.08)' }}>
                  <td style={{ padding: '0.9rem' }}>
                    <div style={{ fontWeight: 700 }}>{participant.fullName}</div>
                    <div style={{ color: '#655f7b', fontSize: '0.9rem' }}>{participant.email}</div>
                  </td>
                  <td style={{ padding: '0.9rem' }}>{participant.role || 'N/A'}</td>
                  <td style={{ padding: '0.9rem' }}>{participant.attendanceStatus || 'NOT_MARKED'}</td>
                  <td style={{ padding: '0.9rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['PRESENT', 'ABSENT', 'NOT_MARKED'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className="button button--secondary"
                          onClick={() => updateStatus(participant.registrationId, status)}
                          style={{ padding: '0.55rem 0.8rem', fontSize: '0.82rem' }}
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
  const [participants, setParticipants] = useState([])
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

      setParticipants(Array.isArray(result.data) ? result.data : [])
    }

    load()
  }, [])

  return (
    <div className="detail-page__panel" style={{ display: 'grid' }}>
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,79,163,0.14)' }}>
            <thead>
              <tr style={{ background: 'rgba(255,79,163,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '0.9rem' }}>Institute</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr key={participant.registrationId || participant.email} style={{ borderTop: '1px solid rgba(255,79,163,0.08)' }}>
                  <td style={{ padding: '0.9rem' }}>{participant.fullName}</td>
                  <td style={{ padding: '0.9rem' }}>{participant.email}</td>
                  <td style={{ padding: '0.9rem' }}>{participant.role}</td>
                  <td style={{ padding: '0.9rem' }}>{participant.instituteName || 'N/A'}</td>
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
