import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { USERS } from '../data/usersConfig'
import { loadAllDrinks, loadUserDrinks, addDrink, deleteDrink, subscribeToChanges } from '../data/cubatometroStore'
import './Cubatometro.css'

const DRINKS = {
  cubata:   { label: 'Cubata',        emoji: '🥃', points: 5, color: '#f59e0b' },
  chupito:  { label: 'Chupito',       emoji: '🔥', points: 3, color: '#ef4444' },
  cerveza:  { label: 'Cerveza',       emoji: '🍺', points: 1, color: '#d97706' },
  refresco: { label: 'Refresco Alc.', emoji: '🥤', points: 1, color: '#10b981' },
}

const NIVELES = [
  { min: 0,  max: 0,        emoji: '🌵', label: 'En seco',    color: '#4a5568' },
  { min: 1,  max: 5,        emoji: '😌', label: 'Arrancando', color: '#10b981' },
  { min: 6,  max: 15,       emoji: '😄', label: 'Achispado',  color: '#84cc16' },
  { min: 16, max: 30,       emoji: '😜', label: 'Pedo',       color: '#f59e0b' },
  { min: 31, max: 50,       emoji: '🥴', label: 'Borracho',   color: '#f97316' },
  { min: 51, max: Infinity, emoji: '💀', label: 'Destruido',  color: '#ef4444' },
]

function getNivel(pts) {
  return NIVELES.find(n => pts >= n.min && pts <= n.max) ?? NIVELES[0]
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora mismo'
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)}d`
}

function buildRanking(allDrinks) {
  const map = {}
  for (const d of allDrinks) {
    if (!map[d.user_id]) {
      map[d.user_id] = { totalPoints: 0, cubata: 0, chupito: 0, cerveza: 0, refresco: 0 }
    }
    map[d.user_id].totalPoints += d.points
    map[d.user_id][d.drink_type] = (map[d.user_id][d.drink_type] || 0) + 1
  }
  return USERS.map(u => ({
    ...u,
    totalPoints: map[u.id]?.totalPoints ?? 0,
    cubata:      map[u.id]?.cubata      ?? 0,
    chupito:     map[u.id]?.chupito     ?? 0,
    cerveza:     map[u.id]?.cerveza     ?? 0,
    refresco:    map[u.id]?.refresco    ?? 0,
  })).sort((a, b) => b.totalPoints - a.totalPoints)
}

export default function Cubatometro() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('ranking')
  const [allDrinks, setAllDrinks] = useState([])
  const [myDrinks, setMyDrinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [all, mine] = await Promise.all([
          loadAllDrinks(),
          user ? loadUserDrinks(user.id) : Promise.resolve([]),
        ])
        setAllDrinks(all)
        setMyDrinks(mine)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  useEffect(() => {
    const channel = subscribeToChanges(async () => {
      const [all, mine] = await Promise.all([
        loadAllDrinks(),
        user ? loadUserDrinks(user.id) : Promise.resolve([]),
      ])
      setAllDrinks(all)
      setMyDrinks(mine)
    })
    return () => { channel.unsubscribe() }
  }, [user])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  async function handleAddDrink(drinkType) {
    if (!user || adding) return
    setAdding(true)
    try {
      const drink = DRINKS[drinkType]
      await addDrink(user.id, drinkType, drink.points)
      showToast(`${drink.emoji} ¡${drink.label} añadido! +${drink.points} pts`)
    } catch {
      showToast('Error al añadir bebida', 'error')
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteDrink(id) {
    try {
      await deleteDrink(id)
      showToast('Bebida eliminada', 'info')
    } catch {
      showToast('Error al eliminar', 'error')
    }
  }

  const ranking = buildRanking(allDrinks)
  const showPodio = allDrinks.length > 0
  const podioUsers = ranking.slice(0, 3)
  const listUsers = showPodio ? ranking.slice(3) : ranking
  const maxPoints = ranking[0]?.totalPoints || 1
  const groupTotal = allDrinks.reduce((s, d) => s + d.points, 0)
  const myTotal = myDrinks.reduce((s, d) => s + d.points, 0)
  const myNivel = getNivel(myTotal)
  const myRankPos = ranking.findIndex(u => u.id === user?.id) + 1

  if (loading) {
    return (
      <div className="page">
        <div className="cubatometro-loading">Cargando el Cubatómetro...</div>
      </div>
    )
  }

  return (
    <div className="page">
      {toast && (
        <div className={`cubatometro-toast toast-${toast.type}`}>{toast.msg}</div>
      )}

      <div className="cubatometro-container">
        <header className="cubatometro-header">
          <h1>Cubatómetro</h1>
          <p className="cubatometro-subtitle">Clasificación etílica del grupo</p>
          <div className="group-total-badge">
            <span className="group-total-number">{groupTotal}</span>
            <span className="group-total-label">puntos en total</span>
          </div>
        </header>

        <div className="cubatometro-tabs">
          {[
            { id: 'ranking',   label: '🏆 Ranking' },
            { id: 'mis-copas', label: '🍻 Mis Copas' },
            { id: 'stats',     label: '📊 Stats' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── RANKING TAB ── */}
        {activeTab === 'ranking' && (
          <div className="ranking-tab">
            {showPodio && (
              <div className="podio-container">
                {/* 2º puesto */}
                {podioUsers[1] && (
                  <div className="podio-slot">
                    <div className="podio-user-info">
                      <div className="podio-avatar" style={{ background: podioUsers[1].color }}>
                        {podioUsers[1].nombre.slice(0, 2)}
                      </div>
                      <div className="podio-nombre">{podioUsers[1].nombre}</div>
                      <div className="podio-nivel-emoji">{getNivel(podioUsers[1].totalPoints).emoji}</div>
                    </div>
                    <div className="podio-block podio-block-2">
                      <span className="podio-pos">2º</span>
                      <span className="podio-pts">{podioUsers[1].totalPoints} pts</span>
                    </div>
                  </div>
                )}
                {/* 1er puesto */}
                {podioUsers[0] && (
                  <div className="podio-slot">
                    <div className="podio-crown">👑</div>
                    <div className="podio-user-info">
                      <div className="podio-avatar podio-avatar-1" style={{ background: podioUsers[0].color }}>
                        {podioUsers[0].nombre.slice(0, 2)}
                      </div>
                      <div className="podio-nombre">{podioUsers[0].nombre}</div>
                      <div className="podio-nivel-emoji">{getNivel(podioUsers[0].totalPoints).emoji}</div>
                    </div>
                    <div className="podio-block podio-block-1">
                      <span className="podio-pos">1º</span>
                      <span className="podio-pts">{podioUsers[0].totalPoints} pts</span>
                    </div>
                  </div>
                )}
                {/* 3er puesto */}
                {podioUsers[2] && (
                  <div className="podio-slot">
                    <div className="podio-user-info">
                      <div className="podio-avatar" style={{ background: podioUsers[2].color }}>
                        {podioUsers[2].nombre.slice(0, 2)}
                      </div>
                      <div className="podio-nombre">{podioUsers[2].nombre}</div>
                      <div className="podio-nivel-emoji">{getNivel(podioUsers[2].totalPoints).emoji}</div>
                    </div>
                    <div className="podio-block podio-block-3">
                      <span className="podio-pos">3º</span>
                      <span className="podio-pts">{podioUsers[2].totalPoints} pts</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="ranking-list">
              {listUsers.map((entry, i) => {
                const nivel = getNivel(entry.totalPoints)
                const barWidth = maxPoints > 0 ? (entry.totalPoints / maxPoints) * 100 : 0
                const isMe = entry.id === user?.id
                const pos = showPodio ? i + 4 : i + 1
                return (
                  <div key={entry.id} className={`ranking-row ${isMe ? 'ranking-row-me' : ''}`}>
                    <span className="rank-pos-num">{pos}</span>
                    <div className="rank-info">
                      <div className="rank-top">
                        <span className="rank-nombre">{entry.nombre}{isMe && <span className="rank-yo"> (tú)</span>}</span>
                        <div className="rank-right">
                          <div className="rank-drinks-mini">
                            {entry.cubata   > 0 && <span className="drink-chip chip-cubata">🥃 {entry.cubata}</span>}
                            {entry.chupito  > 0 && <span className="drink-chip chip-chupito">🔥 {entry.chupito}</span>}
                            {entry.cerveza  > 0 && <span className="drink-chip chip-cerveza">🍺 {entry.cerveza}</span>}
                            {entry.refresco > 0 && <span className="drink-chip chip-refresco">🥤 {entry.refresco}</span>}
                          </div>
                          <span className="rank-pts">{entry.totalPoints} pts</span>
                        </div>
                      </div>
                      <div className="rank-bar-wrapper">
                        <div
                          className="rank-bar-fill"
                          style={{
                            width: `${barWidth}%`,
                            background: nivel.color,
                            opacity: entry.totalPoints === 0 ? 0.15 : 0.75,
                          }}
                        />
                      </div>
                      <span className="rank-nivel-label" style={{ color: nivel.color }}>
                        {nivel.emoji} {nivel.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── MIS COPAS TAB ── */}
        {activeTab === 'mis-copas' && (
          <div className="mis-copas-tab">
            <div className="my-status-card" style={{ borderColor: myNivel.color }}>
              <div className="my-status-nivel">
                <span className="my-nivel-emoji">{myNivel.emoji}</span>
                <div>
                  <div className="my-nivel-label" style={{ color: myNivel.color }}>{myNivel.label}</div>
                  <div className="my-rank-info">Puesto {myRankPos} de {ranking.length}</div>
                </div>
              </div>
              <div className="my-total-pts">
                {myTotal}
                <span> pts</span>
              </div>
            </div>

            <div>
              <h3 className="section-title">Añadir bebida</h3>
              <div className="add-drinks-grid">
                {Object.entries(DRINKS).map(([type, drink]) => (
                  <button
                    key={type}
                    className="drink-add-btn"
                    style={{ '--drink-color': drink.color }}
                    onClick={() => handleAddDrink(type)}
                    disabled={adding}
                  >
                    <span className="drink-add-emoji">{drink.emoji}</span>
                    <span className="drink-add-label">{drink.label}</span>
                    <span className="drink-add-pts">+{drink.points} pts</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="section-title">Mi historial</h3>
              {myDrinks.length === 0 ? (
                <div className="history-empty">Aún no has añadido nada 🌵</div>
              ) : (
                <div className="history-list">
                  {myDrinks.map(d => {
                    const drink = DRINKS[d.drink_type]
                    return (
                      <div key={d.id} className="history-item">
                        <span className="history-emoji">{drink?.emoji}</span>
                        <div className="history-info">
                          <span className="history-label">{drink?.label}</span>
                          <span className="history-time">{timeAgo(d.created_at)}</span>
                        </div>
                        <span className="history-pts">+{d.points} pts</span>
                        <button
                          className="history-delete"
                          onClick={() => handleDeleteDrink(d.id)}
                          title="Deshacer"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div className="stats-tab">
            <div className="stats-drinks-breakdown">
              {Object.entries(DRINKS).map(([type, drink]) => {
                const total = allDrinks.filter(d => d.drink_type === type).length
                return (
                  <div key={type} className="stat-drink-card" style={{ '--drink-color': drink.color }}>
                    <span className="stat-drink-emoji">{drink.emoji}</span>
                    <span className="stat-drink-count">{total}</span>
                    <span className="stat-drink-name">{drink.label}s</span>
                  </div>
                )
              })}
            </div>

            <div>
              <h3 className="section-title">Hall of Fame</h3>
              <div className="stats-mvps">
                {Object.entries(DRINKS).map(([type, drink]) => {
                  const top = [...ranking].sort((a, b) => b[type] - a[type])[0]
                  if (!top || top[type] === 0) return (
                    <div key={type} className="mvp-card" style={{ '--drink-color': drink.color }}>
                      <div className="mvp-icon">{drink.emoji}</div>
                      <div className="mvp-title">Rey del {drink.label}</div>
                      <div className="mvp-empty">Sin datos aún</div>
                    </div>
                  )
                  return (
                    <div key={type} className="mvp-card" style={{ '--drink-color': drink.color }}>
                      <div className="mvp-icon">{drink.emoji}</div>
                      <div className="mvp-title">Rey del {drink.label}</div>
                      <div className="mvp-name" style={{ background: top.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {top.nombre}
                      </div>
                      <div className="mvp-count">{top[type]} {drink.label.toLowerCase()}{top[type] !== 1 ? 's' : ''}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="section-title">Resumen del grupo</h3>
              <div className="stats-totals-grid">
                <div className="stats-total-item">
                  <span className="stats-total-num">{allDrinks.length}</span>
                  <span className="stats-total-label">bebidas totales</span>
                </div>
                <div className="stats-total-item">
                  <span className="stats-total-num">{groupTotal}</span>
                  <span className="stats-total-label">puntos en total</span>
                </div>
                <div className="stats-total-item">
                  <span className="stats-total-num">{ranking.filter(u => u.totalPoints > 0).length}</span>
                  <span className="stats-total-label">miembros activos</span>
                </div>
              </div>
            </div>

            {ranking.filter(u => u.totalPoints > 0).length > 0 && (
              <div>
                <h3 className="section-title">Nivel del grupo</h3>
                <div className="stats-niveles">
                  {NIVELES.slice(1).map(nivel => {
                    const count = ranking.filter(u => getNivel(u.totalPoints).label === nivel.label).length
                    if (count === 0) return null
                    return (
                      <div key={nivel.label} className="nivel-stat-row">
                        <span className="nivel-stat-emoji">{nivel.emoji}</span>
                        <span className="nivel-stat-label" style={{ color: nivel.color }}>{nivel.label}</span>
                        <div className="nivel-stat-bar-wrap">
                          <div
                            className="nivel-stat-bar"
                            style={{ width: `${(count / ranking.length) * 100}%`, background: nivel.color }}
                          />
                        </div>
                        <span className="nivel-stat-count">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
