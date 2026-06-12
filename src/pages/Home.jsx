// src/pages/Home.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RobotSpline } from '../components/RobotSpline'
import { loadEvents } from '../data/eventsStore'
import './Home.css'

const TABS = ['Inicio', 'Apartados Webs', 'Actualidad']
// 🚀 Recuperamos el enlace de tu escena 3D de Spline
const ROBOT_SCENE = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode'

export default function Home() {
  const [activeTab, setActiveTab] = useState('Inicio')

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />
        
        {/* 🚀 El robot vuelve a su sitio como fondo interactivo */}
        <div className="hero-robot-wrap" aria-hidden="true">
          <RobotSpline scene={ROBOT_SCENE} />
        </div>

        <div className="hero-content">
          <img 
            src="/favicon.png?v=3" 
            alt="Logo PorroWeb" 
            className="hero-logo-img"
          />
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
          {activeTab === 'Apartados Webs' && <TabApartados />}
          {activeTab === 'Actualidad' && <TabActualidad />}
        </div>
      </section>
    </div>
  )
}

function TabInicio() {
  const [eventos, setEventos] = useState([])
  const [eventosLoading, setEventosLoading] = useState(true)

  useEffect(() => {
    loadEvents()
      .then(setEventos)
      .catch(() => setEventos([]))
      .finally(() => setEventosLoading(false))
  }, [])

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
        {eventosLoading ? (
          <p className="muted" style={{ fontSize: '0.88rem' }}>
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Cargando…
          </p>
        ) : eventos.length === 0 ? (
          <p className="muted" style={{ fontSize: '0.88rem' }}>Sin eventos próximos.</p>
        ) : (
          <ul className="event-list">
            {eventos.map(evt => (
              <li key={evt.id} className="event-item">
                <span className={`event-dot${evt.dim ? ' event-dot-dim' : ''}`} />
                <div>
                  <span className="event-name">{evt.nombre}</span>
                  <span className="event-date">{evt.fecha}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="widget">
        <div className="widget-header">
          <i className="fa-solid fa-chart-bar widget-header-icon" aria-hidden="true" />
          <h3>En Números</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number gold">4</span>
            <span className="stat-label">Premios Porro</span>
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
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface2)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
      <i className="fa-solid fa-newspaper" style={{ fontSize: '3rem', color: 'var(--text-dim)', marginBottom: '15px' }}></i>
      <h2 style={{ marginBottom: '10px', color: 'var(--text)', fontSize: '1.5rem' }}>El tablón está vacío</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
        Próximamente iremos publicando aquí las últimas novedades, anuncios y avisos importantes sobre La Revolución del Porro. ¡Mantente atento!
      </p>
    </div>
  )
}

function TabApartados() {
  const apartados = [
    {
      to: '/perfiles',
      icon: 'id-card',
      titulo: 'Buscador de Perfiles',
      desc: 'Explora las fichas individuales de cada miembro. Consulta sus estadísticas del Fantasy, roles y palmarés.',
      badge: '¡NUEVO!',
    },
    {
      to: '/porra',
      icon: 'earth-americas',
      titulo: 'Porra Mundial',
      desc: 'Pronostica los resultados del Mundial 2026, consulta la clasificación grupal y compite por el liderato.',
      badge: 'Mundial',
    },
    {
      to: '/premios-porro',
      icon: 'trophy',
      titulo: 'Premios Porro',
      desc: '4 ediciones de los galardones oficiales del grupo. Consulta las nominaciones e históricos de ganadores.',
      badge: 'Premios',
    },
    {
      to: '/porrolimpiadas',
      icon: 'medal',
      titulo: 'Porrolimpiadas',
      desc: 'Las olimpiadas del grupo. Marcadores, disciplinas y registros de las competiciones en directo.',
      badge: 'Competición',
    },
    {
      to: '/fantasy',
      icon: 'futbol',
      titulo: 'Fantasy',
      desc: 'El rincón del mánager. Clasificaciones históricas, jornadas y puntos de la liga interna.',
      badge: 'Liga',
    },
    {
      to: '/galeria',
      icon: 'camera',
      titulo: 'Galería',
      desc: 'El baúl de los recuerdos. Álbumes fotográficos de todos nuestros viajes, fiestas y eventos.',
      badge: 'Recuerdos',
    },
    {
      to: '/miembros',
      icon: 'users',
      titulo: 'Nuestra Gente',
      desc: 'La lista completa y ordenada por orden alfabético de los 18 integrantes oficiales del grupo.',
      badge: 'Grupo',
    },
    {
      to: '/contacto',
      icon: 'address-book',
      titulo: 'Soporte y Contacto',
      desc: '¿Tienes sugerencias o reportes de fallos? Envía un correo directo a los desarrolladores de la web.',
      badge: 'Soporte',
    },
  ]

  return (
    <div className="accesos-grid">
      {apartados.map(item => (
        <Link to={item.to} key={item.to} className="acceso-card">
          <div className="acceso-top">
            <i className={`fa-solid fa-${item.icon} acceso-icon`} aria-hidden="true" />
            <span className="badge badge-gold acceso-badge">{item.badge}</span>
          </div>
          <h3 className="acceso-title">{item.titulo}</h3>
          <p className="acceso-desc muted">{item.desc}</p>
          <span className="acceso-arrow">
            Entrar a sección <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}