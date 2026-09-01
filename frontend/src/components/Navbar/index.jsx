import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import qiskitBadge from '../../assets/qiskit/badge-pink.png.png'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Register', to: '/register' },
  { label: 'Hackathon', to: '/hackathon' },
  { label: 'Workshops', to: '/workshops' },
  { label: 'Day 1', to: '/day-1' },
  { label: 'Day 2', to: '/day-2' },
  { label: 'Day 3', to: '/day-3' },
  { label: 'Certificates', to: '/certificates' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isLoggedIn, userRegistration, openLoginModal, logout } = useAuth()

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth <= 860)

    updateMobileState()
    window.addEventListener('resize', updateMobileState)

    return () => window.removeEventListener('resize', updateMobileState)
  }, [])

  const authActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      {isLoggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 79, 163, 0.12)',
              color: '#ff4fa3',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {userRegistration?.registrationId || 'Registered'}
          </span>
          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid rgba(139, 132, 156, 0.3)',
              borderRadius: '20px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#5e5670',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openLoginModal}
          style={{
            backgroundColor: '#ff4fa3',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '0.4rem 0.9rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 79, 163, 0.25)',
          }}
        >
          Login
        </button>
      )}
    </div>
  )

  const navContent = (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
          onClick={() => setIsOpen(false)}
        >
          {item.label}
        </NavLink>
      ))}
      {authActions}
    </>
  )

  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <NavLink to="/" className="brand" aria-label="Qiskit Fall Fest home">
          <img src={qiskitBadge} alt="Qiskit Fall Fest 2026 badge" className="brand__logo" />
          <span className="brand__text">Qiskit Fall Fest 2026</span>
        </NavLink>

        <button
          type="button"
          className="nav-toggle"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        {isMobile ? (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.nav
                className="nav nav--open"
                aria-label="Main navigation"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {navContent}
              </motion.nav>
            )}
          </AnimatePresence>
        ) : (
          <nav className="nav" aria-label="Main navigation">
            {navContent}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Navbar
