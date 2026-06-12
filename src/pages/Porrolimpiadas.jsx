// src/pages/Porrolimpiadas.jsx

import { Link } from 'react-router-dom'
import { USERS } from '../data/usersConfig'
import './Porrolimpiadas.css'

const getUserId = (nombre) => {
  if (nombre === 'Adri') return 'adri'
  if (nombre === 'José Antonio') return 'jose'
  if (nombre === 'Paula Romero') return 'paula-edurne'
  if (nombre === 'Alba') return 'alba-s'
  const match = USERS.find(u => u.nombre.includes(nombre) || nombre.includes(u.nombre))
  return match ? match.id : null
}

export default function Porrolimpiadas() {
  return (
    <div className="page">
      <div className="olim-container">
        
        <header className="olim-header">
          <img src="/porrolimpiadas/logo-transparente.png" alt="Logo Porrolimpiadas 2026" className="olim-logo" />
          <h1>Porrolimpiadas 2026</h1>
          <p>El evento más épico de la historia del grupo</p>
        </header>

        <div className="olim-info-grid">
          <div className="olim-info-card">
            <i className="fa-solid fa-calendar-day"></i>
            <span className="olim-info-title">Fecha Oficial</span>
            <span className="olim-info-text">Domingo, 19 de Julio de 2026</span>
          </div>
          <div className="olim-info-card">
            <i className="fa-solid fa-clock"></i>
            <span className="olim-info-title">Horario</span>
            <span className="olim-info-text">9:30h - 20:00h</span>
          </div>
          <div className="olim-info-card">
            <i className="fa-solid fa-location-dot"></i>
            <span className="olim-info-title">Ubicación</span>
            <span className="olim-info-text">Campo de Sergio, Yecla</span>
          </div>
          
          <div className="olim-info-card" style={{ gridColumn: '1 / -1' }}>
            <i className="fa-solid fa-users"></i>
            {/* 🚀 CAMBIAMOS A 24 EN TOTAL */}
            <span className="olim-info-title">Participantes (24 en total)</span>
            <div className="participants-wrap">
              {[
                "Abel", "Adri", "Alba", "Clara", "Cristina", "Isabel", "Jorge", 
                "José Antonio", "Juanfran", "Laura Bañón", "Mariaju", "Paula Morís", 
                "Paula Romero", "Raquel", "Silvia", "Lucía", "Gema", "Cristian", "Javi", "Mario"
                // 🚀 AQUÍ HEMOS QUITADO A "Laura" y "Paula" (las externas)
              ].map((nombre, i) => {
                const uId = getUserId(nombre)
                return uId ? (
                  <Link to="/perfiles" state={{ userId: uId }} key={i} style={{ textDecoration: 'none' }}>
                    <span className="participant-badge" style={{ cursor: 'pointer', background: 'rgba(255,215,0,0.1)', color: 'var(--gold)' }}>{nombre}</span>
                  </Link>
                ) : (
                  <span key={i} className="participant-badge">{nombre}</span>
                )
              })}
              
              {/* Espacios misteriosos */}
              {["¿?", "¿?", "¿?", "¿?"].map((misterio, i) => (
                <span key={`mist-${i}`} className="participant-badge mystery">{misterio}</span>
              ))}
            </div>
          </div>
        </div>

        <h2 className="olim-section-title"><i className="fa-solid fa-bullhorn" style={{ color: 'var(--gold)' }}></i> Anuncios Oficiales</h2>
        
        <div className="olim-videos-grid">
          {/* Anuncio 1 */}
          <div className="olim-video-card">
            <div className="olim-video-wrapper vertical">
              <iframe src="https://www.youtube.com/embed/_0KULuDE08k" title="Anuncio 1" frameBorder="0" allowFullScreen></iframe>
            </div>
            <div className="olim-video-content">
              <h3>Anuncio #1 - El Origen</h3>
              <p>Conexión desde el Bernabeu. Revelación de la fecha coincidente con la final del Mundial, presentación del logo oficial y primeros 15 participantes confirmados.</p>
            </div>
          </div>

          {/* Anuncio 2 */}
            <div className="olim-video-card">
            <div className="olim-video-wrapper vertical">
              <iframe src="https://www.youtube.com/embed/pkJs8gfxjBk" title="Anuncio 2" frameBorder="0" allowFullScreen></iframe>
            </div>
            <div className="olim-video-content">
              <h3>Anuncio #2 - Los Juegos</h3>
              <p>Nuevos fichajes: Lucía, Paula, Laura, Cristian y Gema. Confirmación de ubicación (Campo de Sergio) y estructura: 12 juegos (5 grupales, 7 de enfrentamiento).</p>
            </div>
          </div>

          {/* Anuncio 3 */}
          <div className="olim-video-card">
            <div className="olim-video-wrapper vertical">
              <iframe src="https://www.youtube.com/embed/3V_W9I5ynk0" title="Anuncio 3" frameBorder="0" allowFullScreen></iframe>
            </div>
            <div className="olim-video-content">
              <h3>Anuncio #3 - Horarios y Premios</h3>
              <p>Nuevos fichajes: Mario y Javi. Llegada límite a las 9:45h. Habrá 5 premios en total, medallas para todos los asistentes y 4 tipos de trofeos distintos.</p>
            </div>
          </div>

          {/* Anuncio 4 */}
          <div className="olim-video-card">
            <div className="olim-video-wrapper">
              <div className="olim-video-locked">
                <i className="fa-solid fa-lock"></i>
                <span>Disponible el 19 de Junio</span>
              </div>
            </div>
            <div className="olim-video-content">
              <h3>Anuncio #4 - El Final</h3>
              <p>Último anuncio oficial antes del gran evento. Se revelarán los 4 participantes misteriosos y los últimos detalles cruciales.</p>
            </div>
          </div>
        </div>

        <h2 className="olim-section-title"><i className="fa-solid fa-music" style={{ color: 'var(--purple-light)' }}></i> Himno Oficial</h2>
        
        <div className="olim-himno-container">
          <div className="olim-himno-media">
            <h4><i className="fa-solid fa-headphones"></i> Reproductor de Audio</h4>
            <audio controls className="olim-audio-player">
              <source src="/porrolimpiadas/himno.MP3" type="audio/mpeg" />
              Tu navegador no soporta el audio.
            </audio>
            
            <h4 style={{ marginTop: '15px' }}><i className="fa-solid fa-video"></i> Vídeo con Letra</h4>
            <div className="olim-video-wrapper vertical" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <iframe src="https://www.youtube.com/embed/kOph4jPO6mE" title="Himno Oficial" frameBorder="0" allowFullScreen></iframe>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '5px' }}>
              <strong>Cantantes oficiales:</strong> Adri, Juanfran, José Antonio, Cristina, Raquel, Sergio, Jorge, Clara, Silvia, Alba, Isabel, Abel, Mariaju y Paula Romero.
            </p>
          </div>

          <div className="olim-lyrics">
            <strong>LETRA OFICIAL</strong><br/><br/>
            Es diecinueve ya<br/>Bajo el sol de Yecla<br/>La revolución, externos también, son nuestra familia<br/><br/>
            Puntos en la tabla<br/>Buscan las victorias<br/>Juntos peleando por las medallas que hoy vamos a ganar<br/><br/>
            Porros porros porros porros porros<br/>Hemos venido aquí a drogarnos<br/>Lo que ganemos nos da igual<br/><br/>
            Porrolimpiadas  lolo-lolo-looo     lolo-lolo lolo-lolo-loooo<br/>Porrolimpiadas  lolo-lolo-looo     lolo-lolo lo lo looooo<br/><br/>
            Gran banquete con la paella<br/>Juntos la vamos a disfrutar<br/>Es el chef Jorge quien cocinará y la gente ya cantará<br/><br/>
            Porros porros porros porros porros<br/>Hemos venido aquí a drogarnos<br/>Lo que ganemos nos da igual  <br/><br/>
            La gente se motiva<br/>La risa nos alegra<br/>La magia se presenta<br/>Juegos y diversiones<br/>Ellos valen millones<br/>La historia ya se crea<br/>Porrolimpiadas 2026<br/><br/>
            La noche llega ya<br/>Es hora de cenar<br/>Noche de Mundial, viendo la copa, toda nuestra banda.<br/><br/>
            Listos pa celebrar<br/>Saca la bebida<br/>Grita con el gol, todos a cantar, vamos a disfrutar<br/><br/>
            Porros porros porros porros porros<br/>Hemos venido aquí a drogarnos<br/>Lo que ganemos nos da igual<br/><br/>
            Porros porros porros porros porros<br/>Hemos venido aquí a drogarnos<br/>Lo que ganemos nos da igual (x3)
          </div>
        </div>

      </div>
    </div>
  )
}