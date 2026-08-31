import { NavLink } from 'react-router-dom'
import { useState } from 'react'
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

        <nav className={`nav ${isOpen ? 'nav--open' : ''}`} aria-label="Main navigation">
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
        </nav>
      </div>
    </header>
  )
}

export default Navbar
