import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import qiskitBadge from '../../assets/qiskit/badge-pink.png.png'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Register', to: '/register' },
  { label: 'Attendance', to: '/attendance' },
  { label: 'Hackathon', to: '/hackathon' },
  { label: 'Workshops', to: '/workshops' },
  { label: 'Day 1', to: '/day-1' },
  { label: 'Day 2', to: '/day-2' },
  { label: 'Day 3', to: '/day-3' },
  { label: 'Certificates', to: '/certificates' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isLoggedIn, userRegistration, openLoginModal, logout } = useAuth()

  const authActions = (
    <div className="topbar__actions">
      <button
        type="button"
        className="topbar__action topbar__action--login"
        onClick={isLoggedIn ? logout : openLoginModal}
      >
        {isLoggedIn ? 'Logout' : 'Login'}
      </button>
      <NavLink to="/register" className="topbar__action topbar__action--register">
        Register
      </NavLink>
    </div>
  )

  const navContent = (
    <motion.nav
      className={`nav nav--menu ${isOpen ? 'nav--open' : ''}`}
      aria-label="Main navigation"
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {navItems.map((item) => (
        <motion.div
          key={item.to}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <NavLink
            to={item.to}
            className={({ isActive }) => `nav__menu-link ${isActive ? 'nav__menu-link--active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            {item.label}
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  )

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__left">
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

          <NavLink to="/" className="brand" aria-label="Qiskit Fall Fest home">
            <img src={qiskitBadge} alt="Qiskit Fall Fest 2026 badge" className="brand__logo" />
            <span className="brand__text">Qiskit Fall Fest 2026</span>
          </NavLink>
        </div>

        <div className="topbar__right">
          {authActions}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <div className="nav-panel-wrap">
            {navContent}
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
