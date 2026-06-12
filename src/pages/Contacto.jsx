// src/pages/Contacto.jsx

import { Link } from 'react-router-dom'
import './Contacto.css'

export default function Contacto() {
  return (
    <div className="page">
      <div className="contact-container">
        
        <header className="contact-header">
          <h1>Desarrollo y Soporte</h1>
          <p>Los ingenieros detrás de la página del porro</p>
        </header>

        <div className="dev-cards">
          {/* Tarjeta de Sergio */}
          <div className="dev-card">
            <div className="dev-avatar">
              <img src="/contacto/sergio.jpg" alt="Foto de Sergio" />
            </div>
            <Link to="/perfiles" state={{ userId: 'sergio' }} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Sergio</h2>
            </Link>
            <span className="dev-role">Ingeniero informático</span>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=sergiogimenez060705@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <i className="fa-solid fa-envelope"></i> Enviar correo
            </a>
          </div>

          {/* Tarjeta de Abel */}
          <div className="dev-card">
            <div className="dev-avatar">
              <img src="/contacto/abel.jpg" alt="Foto de Abel" />
            </div>
            <Link to="/perfiles" state={{ userId: 'abel' }} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ cursor: 'pointer' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>Abel</h2>
            </Link>
            <span className="dev-role">Ingeniero multimedia</span>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=abelmartinezmolina5@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <i className="fa-solid fa-envelope"></i> Enviar correo
            </a>
          </div>
        </div>

        <div className="contact-extra">
          <h3><i className="fa-solid fa-lightbulb"></i> ¿Se te ocurre una idea?</h3>
          <p>La PorroWeb está en constante evolución. Si quieres proponer una nueva sección, subir fotos a la galería o has encontrado algún fallo en la página, no dudes en escribir a cualquiera de los dos desarrolladores. ¡Hacemos magia!</p>
        </div>

      </div>
    </div>
  )
}