import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RobotSpline } from '../components/RobotSpline'
import './Home.css'

const TABS = ['Inicio', 'Actualidad', 'Accesos Rápidos']
const ROBOT_SCENE = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode'

export default function Home() {
  const [activeTab, setActiveTab] = useState('Inicio')

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        <div className="hero-robot-wrap" aria-hidden="true">
          <RobotSpline scene={ROBOT_SCENE} />
        </div>
        <div className="hero-content">
          <i className="fa-solid fa-smoking hero-icon" aria-hidden="true" />
          <h1 className="hero-title">La Revolución del Porro</h1>
          <p className="hero-subtitle">Todo en un lugar. Todos en una web.</p>
        </div>
      </section>

      <section className="home-body container">
        <div className="tabs-bar">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-panel">
          {activeTab === 'Inicio' && <TabInicio />}
          {activeTab === 'Actualidad' && <TabActualidad />}
          {activeTab === 'Accesos Rápidos' && <TabAccesos />}
        </div>
      </section>
    </div>
  )
}

function TabInicio() {
  return (
    <div className="widgets-grid">
      <div className="widget widget-wide widget-welcome">
        <i className="fa-solid fa-bolt widget-icon-large" aria-hidden="true" />
        <div>
          <h3>Bienvenido al Portal</h3>
          <p>
            Este es el espacio digital de La Revolución del Porro. Aquí encontrarás todo lo
            relacionado con el grupo: los Premios Porro, las Porrolimpiadas, el Fantasy, la galería de recuerdos y más...
          </p>
        </div>
      </div>

      <div className="widget">
        <div className="widget-header">
          <i className="fa-solid fa-calendar-days widget-header-icon" aria-hidden="true" />
          <h3>Próximos Eventos</h3>
        </div>
        <ul className="event-list">
          <li className="event-item">
            <span className="event-dot" />
            <div>
              <span className="event-name">Porrolimpiadas 2026</span>
              <span className="event-date">19 de Julio (9:30)</span>
            </div>
          </li>
          <li className="event-item">
            <span className="event-dot" />
            <div>
              <span className="event-name">Premios Porro 2026</span>
              <span className="event-date">31 de Diciembre</span>
            </div>
          </li>
          <li className="event-item">
            <span className="event-dot event-dot-dim" />
            <div>
              <span className="event-name">Fantasy — Nueva Temporada</span>
              <span className="event-date">Próximamente</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="widget">
        <div className="widget-header">
          <i className="fa-solid fa-chart-bar widget-header-icon" aria-hidden="true" />
          <h3>En Números</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number gold">4</span>
            <span className="stat-label">Ediciones de Premios</span>
          </div>
          <div className="stat-item">
            <span className="stat-number purple">18</span>
            <span className="stat-label">Miembros</span>
          </div>
          <div className="stat-item">
            <span className="stat-number gold">0</span>
            <span className="stat-label">Viajes en Galería</span>
          </div>
          <div className="stat-item">
            <span className="stat-number purple">∞</span>
            <span className="stat-label">Buenos Momentos</span>
          </div>
        </div>
      </div>

      <div className="widget">
        <div className="widget-header">
          <i className="fa-solid fa-bullhorn widget-header-icon" aria-hidden="true" />
          <h3>Último Anuncio</h3>
        </div>
        <p className="announce-text">
          La web acaba de ser creada. ¡Bienvenidos al portal oficial de La Revolución del Porro!
        </p>
        <span className="announce-date muted">Junio 2025</span>
      </div>
    </div>
  )
}

function TabActualidad() {
  const noticias = [
    {
      id: 1,
      titulo: 'Noticia 1',
      resumen: 'Descripción breve de la noticia 1. Aquí irá el contenido relevante para el grupo.',
      fecha: 'Junio 2025',
      tag: 'General',
    },
    {
      id: 2,
      titulo: 'Noticia 2',
      resumen: 'Descripción breve de la noticia 2. Aquí irá el contenido relevante para el grupo.',
      fecha: 'Mayo 2025',
      tag: 'Premios',
    },
    {
      id: 3,
      titulo: 'Noticia 3',
      resumen: 'Descripción breve de la noticia 3. Aquí irá el contenido relevante para el grupo.',
      fecha: 'Abril 2025',
      tag: 'Fantasy',
    },
  ]

  return (
    <div className="news-grid">
      {noticias.map(item => (
        <article key={item.id} className="news-card">
          <div className="news-card-top">
            <span className="badge badge-purple">{item.tag}</span>
            <span className="news-date muted">{item.fecha}</span>
          </div>
          <h3 className="news-title">{item.titulo}</h3>
          <p className="news-text muted">{item.resumen}</p>
        </article>
      ))}
    </div>
  )
}

function TabAccesos() {
  const accesos = [
    {
      to: '/premios-porro',
      icon: 'trophy',
      titulo: 'Premios Porro',
      desc: '4 ediciones de premios al estilo Oscar. Consulta los ganadores de cada categoría.',
      badge: '4 ediciones',
    },
    {
      to: '/porrolimpiadas',
      icon: 'medal',
      titulo: 'Porrolimpiadas',
      desc: 'Las olimpiadas del grupo. Próximamente con todas sus subsecciones.',
      badge: 'Próximamente',
    },
    {
      to: '/fantasy',
      icon: 'futbol',
      titulo: 'Fantasy',
      desc: 'El juego de Fantasy del grupo. Próximamente con toda la información.',
      badge: 'Próximamente',
    },
    {
      to: '/galeria',
      icon: 'camera',
      titulo: 'Galería',
      desc: 'Fotos de todos los viajes y momentos del grupo. 5 álbumes disponibles.',
      badge: '0 álbumes',
    },
  ]

  return (
    <div className="accesos-grid">
      {accesos.map(item => (
        <Link to={item.to} key={item.to} className="acceso-card">
          <div className="acceso-top">
            <i className={`fa-solid fa-${item.icon} acceso-icon`} aria-hidden="true" />
            <span className="badge badge-gold acceso-badge">{item.badge}</span>
          </div>
          <h3 className="acceso-title">{item.titulo}</h3>
          <p className="acceso-desc muted">{item.desc}</p>
          <span className="acceso-arrow">
            Ver sección <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}
