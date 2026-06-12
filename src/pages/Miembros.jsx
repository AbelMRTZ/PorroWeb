// src/pages/Miembros.jsx

import { Link } from 'react-router-dom'
import { USERS } from '../data/usersConfig'
import './Miembros.css'
import fotoGrupo from '../assets/imagenes/foto_grupo.jpg'

const miembrosPorro = [
  'Abel', 'Adrián', 'Alba', 'Andrea', 'Clara', 'Cristina', 'Isabel', 'Jorge',
  'José Antonio', 'Juanfran', 'Laura Bañón', 'Laura Lorenzo', 'Mariaju',
  'Paula Morís', 'Paula Romero', 'Raquel', 'Sergio', 'Silvia'
]

// Función inteligente para sacar el ID desde el nombre
const getUserId = (nombre) => {
  if (nombre === 'Adrián') return 'adri'
  if (nombre === 'Alba') return 'alba-s'
  if (nombre === 'José Antonio') return 'jose'
  if (nombre === 'Paula Romero') return 'paula-edurne'
  if (nombre === 'Raquel') return 'raquel-g'
  const match = USERS.find(u => u.nombre.includes(nombre) || nombre.includes(u.nombre))
  return match ? match.id : null
}

export default function Miembros() {
  return (
    <div className="page">
      <div className="miembros-container">
        
        <header className="miembros-header">
          <h1>Nuestra Gente</h1>
          <p>Los 18 integrantes de La Revolución del Porro</p>
        </header>

        <div className="grupo-banner">
          <img src={fotoGrupo} alt="La Revolución del Porro" />
        </div>

        <div className="miembros-grid">
          {miembrosPorro.map((nombre, index) => {
            const uId = getUserId(nombre)
            return (
              <Link 
                to="/perfiles" 
                state={{ userId: uId }} 
                key={index} 
                className="miembro-card" 
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
              >
                <h3 style={{ textDecoration: 'underline transparent', transition: '0.2s' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>
                  {nombre}
                </h3>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}