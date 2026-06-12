// src/components/Footer.jsx

import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
             La Revolución del Porro
          </span>
          <p className="footer-tagline">El portal oficial del grupo.</p>
        </div>

        <nav className="footer-nav">
          <Link to="/miembros" className="nav-link">
            <i className="fa-solid fa-users"></i> Miembros
          </Link>
          <Link to="/contacto" className="nav-link">
            <i className="fa-solid fa-address-book"></i> Contacto
          </Link>
        </nav>

        <p className="footer-copy">© {new Date().getFullYear()} La Revolución del Porro</p>
      </div>
    </footer>
  )
}