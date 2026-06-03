import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <i className="fa-solid fa-bolt" aria-hidden="true" /> La Revolución del Porro
          </span>
          <p className="footer-tagline">El portal oficial del grupo.</p>
        </div>

        <nav className="footer-nav">
          <Link to="/">Home</Link>
          <Link to="/porrolimpiadas">Porrolimpiadas</Link>
          <Link to="/premios-porro">Premios Porro</Link>
          <Link to="/fantasy">Fantasy</Link>
          <Link to="/galeria">Galería</Link>
        </nav>

        <p className="footer-copy">© {new Date().getFullYear()} La Revolución del Porro</p>
      </div>
    </footer>
  )
}
