// src/pages/PremiosPorro.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { USERS } from '../data/usersConfig'
import { premiosData, computeGlobalStats, computeWinsByYear, computeTotalNominations } from '../data/premiosData'
import './PremiosPorro.css'

const YEAR_OPTIONS = [...premiosData.map(e => e.año), 'GLOBAL']

const getUserId = (nombre) => {
  if (nombre === 'Adri') return 'adri'
  if (nombre === 'Jose' || nombre === 'José Antonio') return 'jose'
  const match = USERS.find(u => u.nombre === nombre || u.nombre.includes(nombre) || nombre.includes(u.nombre))
  return match ? match.id : null
}

export default function PremiosPorro() {
  const [selected, setSelected] = useState(premiosData[0].año)
  const isGlobal = selected === 'GLOBAL'
  const edicion = !isGlobal ? premiosData.find(e => e.año === selected) : null

  return (
    <div className="page">
      <div className="container">
        <header className="page-header premios-header">
          <i className="fa-solid fa-trophy premios-trophy" aria-hidden="true" />
          <h1 className="gold">Premios Porro</h1>
          <p>Celebrando la excelencia del grupo · 4 ediciones</p>
        </header>

        <div className="year-tabs">
          {YEAR_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`year-btn${selected === opt ? ' active' : ''}${opt === 'GLOBAL' ? ' year-btn-global' : ''}`}
              onClick={() => setSelected(opt)}
            >
              {opt === 'GLOBAL' ? <><i className="fa-solid fa-chart-bar" aria-hidden="true" /> GLOBAL</> : opt}
            </button>
          ))}
        </div>

        {isGlobal ? (
          <GlobalStats />
        ) : (
          <>
            <div className="edition-heading">
              <h2>Edición <span className="gold">{selected}</span></h2>
              <span className="badge badge-gold">{edicion.categorias.length} categorías</span>
            </div>
            <div className="categorias-grid">
              {edicion.categorias.map((cat, i) => (
                <CategoriaCard key={i} categoria={cat} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function isWinner(cat, nom) {
  if (cat.ganadoresLista) return cat.ganadoresLista.includes(nom)
  return nom === cat.ganador
}

function CategoriaCard({ categoria }) {
  const multiWinner = categoria.ganadorStats && categoria.ganadorStats.length > 1
  const maxPct = categoria.porcentajes ? Math.max(...categoria.porcentajes) : 0

  const renderGanadores = () => {
    if (categoria.ganadorStats && categoria.ganadorStats.length > 0) {
      return categoria.ganadorStats.map((name, idx) => {
        const uId = getUserId(name)
        return (
          <span key={idx}>
            {uId ? <Link to="/perfiles" state={{ userId: uId }} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>{name}</Link> : name}
            {idx < categoria.ganadorStats.length - 1 ? ' y ' : ''}
          </span>
        )
      })
    }
    const uId = getUserId(categoria.ganador)
    return uId ? <Link to="/perfiles" state={{ userId: uId }} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>{categoria.ganador}</Link> : categoria.ganador
  }

  return (
    <div className="categoria-card">
      <div className="categoria-header">
        <h3 className="categoria-nombre">{categoria.nombre}</h3>
        {categoria.votos && <span className="categoria-votos">{categoria.votos} votos</span>}
      </div>

      <div className="categoria-winner">
        <i className="fa-solid fa-trophy winner-trophy" aria-hidden="true" />
        <div className="winner-info">
          <span className="winner-label">{multiWinner ? 'Ganadores' : 'Ganador'}</span>
          <span className="winner-name gold">{renderGanadores()}</span>
        </div>
      </div>

      <div className="categoria-nominados">
        <span className="nominados-label">Nominados</span>
        <ul className="nominados-list">
          {categoria.nominados.map((nom, idx) => {
            const won = isWinner(categoria, nom)
            const pct = categoria.porcentajes?.[idx]
            const uId = getUserId(nom)
            return (
              <li key={`${nom}-${idx}`} className={`nominado${won ? ' nominado-winner' : ''}`}>
                <div className="nominado-row">
                  <span className="nominado-left">
                    {won && <i className="fa-solid fa-star nom-star" aria-hidden="true" />}
                    <span className="nominado-text">
                      {uId ? <Link to="/perfiles" state={{ userId: uId }} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>{nom}</Link> : nom}
                    </span>
                  </span>
                  {pct !== undefined && <span className="nominado-pct">{pct > 0 ? `${pct}%` : '—'}</span>}
                </div>
                {pct !== undefined && pct > 0 && (
                  <div className="nominado-bar-wrap">
                    <div className="nominado-bar" style={{ width: `${(pct / maxPct) * 100}%` }} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function GlobalStats() {
  const globalWins = computeGlobalStats()
  const globalNoms = computeTotalNominations()
  const winsByYear = computeWinsByYear()
  const maxWins = globalWins[0]?.victorias || 1
  const maxNoms = globalNoms[0]?.nominaciones || 1

  return (
    <div className="global-stats">
      <div className="stats-panels">
        
        <div className="stats-panel">
          <h3 className="stats-panel-title"><i className="fa-solid fa-trophy" aria-hidden="true" /> Ranking de Premiados</h3>
          <div className="leaderboard">
            {globalWins.map((item, i) => {
              const uId = getUserId(item.miembro)
              return (
                <div key={item.miembro} className={`lb-row${i === 0 ? ' lb-first' : ''}`}>
                  <span className="lb-pos">{i + 1}</span>
                  <span className="lb-name">
                    {uId ? <Link to="/perfiles" state={{ userId: uId }} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>{item.miembro}</Link> : item.miembro}
                  </span>
                  <div className="lb-bar-wrap"><div className="lb-bar" style={{ width: `${(item.victorias / maxWins) * 100}%` }} /></div>
                  <span className="lb-count">{item.victorias}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="stats-panel">
          <h3 className="stats-panel-title"><i className="fa-solid fa-star" aria-hidden="true" /> Ranking de Nominaciones</h3>
          <div className="leaderboard">
            {globalNoms.map((item, i) => {
              const uId = getUserId(item.miembro)
              return (
                <div key={item.miembro} className={`lb-row${i === 0 ? ' lb-first lb-first-purple' : ''}`}>
                  <span className="lb-pos">{i + 1}</span>
                  <span className="lb-name">
                    {uId ? <Link to="/perfiles" state={{ userId: uId }} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = 'var(--purple-light)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>{item.miembro}</Link> : item.miembro}
                  </span>
                  <div className="lb-bar-wrap"><div className="lb-bar lb-bar-purple" style={{ width: `${(item.nominaciones / maxNoms) * 100}%` }} /></div>
                  <span className="lb-count">{item.nominaciones}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="stats-panel stats-panel-champion">
          <h3 className="stats-panel-title"><i className="fa-solid fa-crown" aria-hidden="true" /> Campeón por Edición</h3>
          <div className="champions-list">
            {winsByYear.map(w => {
              const uId = getUserId(w.champion)
              return (
                <div key={w.año} className="champion-row">
                  <span className="champion-year">{w.año}</span>
                  <i className="fa-solid fa-trophy champion-trophy" aria-hidden="true" />
                  <span className="champion-name">
                    {uId ? <Link to="/perfiles" state={{ userId: uId }} style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = 'var(--gold)'} onMouseOut={(e) => e.target.style.color = 'inherit'}>{w.champion}</Link> : w.champion}
                  </span>
                  <span className="champion-wins badge badge-gold">{w.maxVictorias} premios</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}