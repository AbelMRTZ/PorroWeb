// src/components/Navbar.jsx

import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

// 🚀 Lista completa de todos los apartados de la web con sus iconos
const apartadosLinks = [
  { to: '/perfiles', label: 'Buscador de Perfiles', icon: 'id-card' },
  { to: '/porra', label: 'Porra Mundial', icon: 'earth-americas' },
  { to: '/premios-porro', label: 'Premios Porro', icon: 'trophy' },
  { to: '/porrolimpiadas', label: 'Porrolimpiadas', icon: 'medal' },
  { to: '/fantasy', label: 'Fantasy', icon: 'futbol' },
  { to: '/galeria', label: 'Galería', icon: 'camera' },
  { to: '/miembros', label: 'Nuestra Gente', icon: 'users' },
  { to: '/cubatometro', label: 'Cubatómetro', icon: 'beer-mug-empty' },
  { to: '/contacto', label: 'Soporte y Contacto', icon: 'address-book' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false) // 🚀 Estado para el desplegable
  
  const location = useLocation()
  const { user, isAdmin, logout } = useAuth()

  useEffect(() => { 
    setMenuOpen(false); 
    setUserMenuOpen(false);
    setDropdownOpen(false); // Cierra el desplegable al cambiar de página
  }, [location])

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
          {/* Link individual de Home */}
          <li>
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Home
            </NavLink>
          </li>

          {/* 🚀 MENÚ DESPLEGABLE: Apartados Webs */}
          <li 
            className="nav-dropdown-container"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button 
              className={`nav-link dropdown-toggle ${dropdownOpen ? 'active' : ''}`}
              onClick={() => setDropdownOpen(v => !v)}
            >
              Apartados Webs <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.8em', marginLeft: '6px' }}></i>
            </button>

            <div className={`nav-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              {apartadosLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-dropdown-item${isActive ? ' active' : ''}`}
                >
                  <i className={`fa-solid fa-${icon}`} aria-hidden="true"></i>
                  {label}
                </NavLink>
              ))}
            </div>
          </li>

          {/* Link individual de Admin (Intacto) */}
          {isAdmin && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link nav-link-admin${isActive ? ' active' : ''}`}
              >
                <i className="fa-solid fa-shield-halved" aria-hidden="true" style={{ marginRight: '6px' }} />
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        {/* User avatar (Intacto) */}
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