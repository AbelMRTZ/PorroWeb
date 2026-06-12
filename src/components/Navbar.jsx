import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/porra', label: 'Porra Mundial' },
  { to: '/porrolimpiadas', label: 'Porrolimpiadas' },
  { to: '/premios-porro', label: 'Premios Porro' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAdmin, logout } = useAuth()

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const initials = user?.nombre.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '?'

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="logo-text">La Revolución del Porro</span>
        </NavLink>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            </li>
          ))}
          {isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link nav-link-admin${isActive ? ' active' : ''}`}
              >
                <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        {/* User avatar */}
        <div className="navbar-user">
          <button
            className="user-avatar-btn metal-avatar"
            style={{ background: user?.color }}
            onClick={() => setUserMenuOpen(v => !v)}
            aria-label="Menú de usuario"
          >
            <span className="nav-initials">{initials}</span>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-name">
                <i className="fa-solid fa-circle-user" aria-hidden="true" />
                {user?.nombre}
              </div>
              <Link to="/perfil" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <i className="fa-solid fa-user-pen" aria-hidden="true" />
                Mi perfil
              </Link>
              <button className="user-dropdown-logout" onClick={logout}>
                <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
