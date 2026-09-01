import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const updateMobileState = () => setIsMobile(window.innerWidth <= 860)

    updateMobileState()
    window.addEventListener('resize', updateMobileState)

    return () => window.removeEventListener('resize', updateMobileState)
  }, [])

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
