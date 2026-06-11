// src/pages/Fantasy.jsx

import { useState } from 'react'
import { classification2526, fantasy2425, macroStats2526, players2526 } from '../data/fantasyData'
import './PremiosPorro.css' // Reutilizamos estilos de pestañas de año
import './Fantasy.css'

export default function Fantasy() {
  const [selectedSeason, setSelectedSeason] = useState('2025-2026')
  const [subSelected, setSubSelected] = useState('clasificacion')

  return (
    <div className="page">
      <div className="fantasy-container">
        
        <div className="fantasy-header">
          <i className="fa-solid fa-futbol premios-trophy" aria-hidden="true" style={{ color: '#007AFF' }}></i>
          <h1>Datos de la Liga</h1>
          <p>Estadísticas Oficiales Fantasy</p>
        </div>

        {/* Pestañas de Temporadas Principales */}
        <div className="year-tabs">
          <button 
            className={`year-btn ${selectedSeason === '2025-2026' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSeason('2025-2026')
              setSubSelected('clasificacion') // Resetea al cambiar de año
            }}
            style={selectedSeason === '2025-2026' ? { borderColor: '#007AFF', color: '#007AFF', background: 'rgba(0,122,255,0.08)', boxShadow: '0 0 16px rgba(0,122,255,0.15)' } : {}}
          >
            25/26
          </button>
          <button 
            className={`year-btn ${selectedSeason === '2024-2025' ? 'active' : ''}`}
            onClick={() => setSelectedSeason('2024-2025')}
            style={selectedSeason === '2024-2025' ? { borderColor: '#007AFF', color: '#007AFF', background: 'rgba(0,122,255,0.08)', boxShadow: '0 0 16px rgba(0,122,255,0.15)' } : {}}
          >
            24/25
          </button>
        </div>

        {/* Subapartados exclusivos para la temporada 2025-2026 */}
        {selectedSeason === '2025-2026' && (
          <div className="sub-tabs">
            <button 
              className={`sub-btn ${subSelected === 'clasificacion' ? 'active' : ''}`}
              onClick={() => setSubSelected('clasificacion')}
            >
              Clasificación
            </button>
            <button 
              className={`sub-btn ${subSelected === 'estadisticas' ? 'active' : ''}`}
              onClick={() => setSubSelected('estadisticas')}
            >
              Estadísticas Avanzadas
            </button>
          </div>
        )}

        {/* CONTROL DE RENDERIZADO */}
        
        {/* CASO 1: Temporada 25/26 - Subpestaña Clasificación */}
        {selectedSeason === '2025-2026' && subSelected === 'clasificacion' && (
          <>
            <div className="edition-heading">
              <h2>Clasificación Final <span style={{ color: '#007AFF' }}>25/26</span></h2>
            </div>
            <div className="legacy-list">
              {classification2526.map(player => (
                <div key={player.id} className={`legacy-item ${player.estado}`}>
                  <div className="legacy-pos">{player.pos}</div>
                  <div className="legacy-name">{player.nombre}</div>
                  <div className="legacy-points">{player.puntos} pts</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CASO 2: Temporada 25/26 - Subpestaña Estadísticas Adaptadas */}
        {selectedSeason === '2025-2026' && subSelected === 'estadisticas' && (
          <>
            <h2 className="section-title">🌍 El Pulso Global</h2>
            <div className="macro-grid">
              {macroStats2526.map(stat => (
                <div key={stat.id} className={`macro-card ${stat.color} ${stat.full ? 'full-width' : ''}`}>
                  <div>
                    <div className="mc-icon">{stat.icon}</div>
                    <div className="mc-title">{stat.title}</div>
                    <div className="mc-val">{stat.val}</div>
                  </div>
                  <div className="mc-desc" dangerouslySetInnerHTML={{ __html: stat.desc }}></div>
                </div>
              ))}
            </div>

            <h2 className="section-title">👤 Radiografías (1x1)</h2>
            {players2526.map(player => (
              <div key={player.id} className="player-card">
                <div className={`player-header ${player.rank}`}>
                  <div className="player-name">{player.name}</div>
                  <div className="player-tag">{player.tag}</div>
                </div>
                <div className="player-body">
                  <div className="p-stats-grid">
                    {player.stats.map((stat, idx) => (
                      <div key={idx} className="p-stat-item">
                        <span>{stat.label}</span>
                        <strong>{stat.val}</strong>
                      </div>
                    ))}
                  </div>
                  <ul className="key-points">
                    {player.bullets.map((bullet, idx) => (
                      <li key={idx} dangerouslySetInnerHTML={{ __html: bullet.text }}></li>
                    ))}
                  </ul>
                  <div className={`financial-box ${player.finance.type}`}>
                    <span>{player.finance.label}:</span>
                    <span className="fin-amount">{player.finance.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* CASO 3: Temporada 24/25 - Estilo Unificado */}
        {selectedSeason === '2024-2025' && (
          <>
            <div className="edition-heading">
              <h2>Clasificación Final <span style={{ color: '#007AFF' }}>24/25</span></h2>
            </div>
            <div className="legacy-list">
              {fantasy2425.map(player => (
                <div key={player.id} className={`legacy-item ${player.estado}`}>
                  <div className="legacy-pos">{player.pos}</div>
                  <div className="legacy-name">{player.nombre}</div>
                  <div className="legacy-points">
                    {player.puntos} {player.estado === 'activo' && 'pts'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}