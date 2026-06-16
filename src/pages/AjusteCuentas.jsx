import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { USERS } from '../data/usersConfig'
import {
  loadSessions, createSession, deleteSession,
  loadItems, addItem, updateItem, deleteItem,
  loadShared, addShared, deleteShared,
  subscribeToSession, subscribeToSessions,
} from '../data/ajusteCuentasStore'
import './AjusteCuentas.css'

const getUserById = id => USERS.find(u => u.id === id)

function fmt(n) {
  return parseFloat(n).toFixed(2) + '€'
}

function computeTotals(items, shared) {
  const totals = {}
  for (const item of items) {
    if (!totals[item.user_id]) totals[item.user_id] = { individual: [], sharedItems: [], total: 0 }
    totals[item.user_id].individual.push(item)
    totals[item.user_id].total += parseFloat(item.price)
  }
  for (const s of shared) {
    const perPerson = parseFloat(s.price) / s.participants.length
    for (const uid of s.participants) {
      if (!totals[uid]) totals[uid] = { individual: [], sharedItems: [], total: 0 }
      totals[uid].sharedItems.push({ ...s, perPerson })
      totals[uid].total += perPerson
    }
  }
  return totals
}

export default function AjusteCuentas() {
  const { user, isAdmin } = useAuth()
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [items, setItems] = useState([])
  const [shared, setShared] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumen')

  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [addingItem, setAddingItem] = useState(false)

  const [sharedDesc, setSharedDesc] = useState('')
  const [sharedPrice, setSharedPrice] = useState('')
  const [sharedParticipants, setSharedParticipants] = useState(() => user?.id ? [user.id] : [])
  const [addingShared, setAddingShared] = useState(false)

  const [editingItemId, setEditingItemId] = useState(null)
  const [editingPrice, setEditingPrice] = useState('')

  const [showNewSession, setShowNewSession] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [creatingSess, setCreatingSess] = useState(false)

  const [toast, setToast] = useState(null)
  const sessionChannelRef = useRef(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    loadSessions()
      .then(list => {
        setSessions(list)
        if (list.length > 0) {
          const saved = localStorage.getItem('cuentas_session_id')
          const found = saved && list.find(s => s.id === saved)
          setCurrentSessionId(found ? saved : list[0].id)
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))

    const ch = subscribeToSessions(async () => {
      const list = await loadSessions()
      setSessions(list)
    })
    return () => ch.unsubscribe()
  }, [])

  useEffect(() => {
    if (!currentSessionId) return
    localStorage.setItem('cuentas_session_id', currentSessionId)

    const load = async () => {
      const [its, sh] = await Promise.all([loadItems(currentSessionId), loadShared(currentSessionId)])
      setItems(its)
      setShared(sh)
    }
    load()

    if (sessionChannelRef.current) sessionChannelRef.current.unsubscribe()
    sessionChannelRef.current = subscribeToSession(currentSessionId, load)

    return () => { if (sessionChannelRef.current) sessionChannelRef.current.unsubscribe() }
  }, [currentSessionId])

  async function handleCreateSession() {
    if (!newSessionName.trim() || creatingSess) return
    setCreatingSess(true)
    try {
      const sess = await createSession(newSessionName.trim(), user.id)
      setNewSessionName('')
      setShowNewSession(false)
      setCurrentSessionId(sess.id)
      showToast('Sesión creada')
    } catch {
      showToast('Error al crear sesión', 'error')
    } finally {
      setCreatingSess(false)
    }
  }

  async function handleDeleteSession() {
    if (!currentSessionId) return
    if (!window.confirm('¿Eliminar esta sesión y todos sus datos?')) return
    try {
      await deleteSession(currentSessionId)
      showToast('Sesión eliminada', 'info')
      const remaining = sessions.filter(s => s.id !== currentSessionId)
      setCurrentSessionId(remaining[0]?.id ?? null)
    } catch {
      showToast('Error al eliminar sesión', 'error')
    }
  }

  async function handleAddItem(e) {
    e.preventDefault()
    if (!newDesc.trim() || !newPrice || addingItem || !currentSessionId) return
    const price = parseFloat(newPrice)
    if (isNaN(price) || price <= 0) return
    setAddingItem(true)
    try {
      await addItem(currentSessionId, user.id, newDesc.trim(), price)
      setNewDesc('')
      setNewPrice('')
      showToast('Plato añadido')
    } catch {
      showToast('Error al añadir', 'error')
    } finally {
      setAddingItem(false)
    }
  }

  async function handleUpdateItem() {
    if (!editingItemId) return
    const price = parseFloat(editingPrice)
    if (isNaN(price) || price <= 0) return
    try {
      await updateItem(editingItemId, price)
      setEditingItemId(null)
      showToast('Precio actualizado')
    } catch {
      showToast('Error al actualizar', 'error')
    }
  }

  async function handleDeleteItem(id) {
    try {
      await deleteItem(id)
      showToast('Eliminado', 'info')
    } catch {
      showToast('Error al eliminar', 'error')
    }
  }

  async function handleAddShared(e) {
    e.preventDefault()
    if (!sharedDesc.trim() || !sharedPrice || sharedParticipants.length < 2 || addingShared || !currentSessionId) return
    const price = parseFloat(sharedPrice)
    if (isNaN(price) || price <= 0) return
    setAddingShared(true)
    try {
      await addShared(currentSessionId, sharedDesc.trim(), price, sharedParticipants, user.id)
      setSharedDesc('')
      setSharedPrice('')
      setSharedParticipants(user?.id ? [user.id] : [])
      showToast('Plato compartido añadido')
    } catch {
      showToast('Error al añadir', 'error')
    } finally {
      setAddingShared(false)
    }
  }

  async function handleDeleteShared(sh) {
    if (sh.created_by !== user?.id && !isAdmin) return
    try {
      await deleteShared(sh.id)
      showToast('Eliminado', 'info')
    } catch {
      showToast('Error al eliminar', 'error')
    }
  }

  function toggleParticipant(uid) {
    setSharedParticipants(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    )
  }

  const myItems = items.filter(i => i.user_id === user?.id)
  const myTotal = myItems.reduce((s, i) => s + parseFloat(i.price), 0)
  const mySharedItems = shared.filter(s => s.participants.includes(user?.id))
  const mySharedTotal = mySharedItems.reduce((s, sh) => s + parseFloat(sh.price) / sh.participants.length, 0)
  const myGrandTotal = myTotal + mySharedTotal

  const totals = computeTotals(items, shared)
  const grandTotal = Object.values(totals).reduce((s, t) => s + t.total, 0)
  const activeUsers = USERS.filter(u => totals[u.id])
    .sort((a, b) => totals[b.id].total - totals[a.id].total)

  if (loading) {
    return <div className="page"><div className="cuentas-loading">Cargando Ajuste de cuentas...</div></div>
  }

  return (
    <div className="page">
      {toast && <div className={`cuentas-toast toast-${toast.type}`}>{toast.msg}</div>}

      <div className="cuentas-container">
        <header className="cuentas-header">
          <h1>Ajuste de cuentas</h1>
          <p className="cuentas-subtitle">Quién paga qué y cuánto debe cada uno</p>
        </header>

        {/* ── Session bar ── */}
        <div className="cuentas-session-bar">
          {sessions.length > 0 ? (
            <div className="session-top-row">
              <div className="session-selector-wrap">
                <i className="fa-solid fa-receipt session-icon" />
                <select
                  className="session-select"
                  value={currentSessionId ?? ''}
                  onChange={e => setCurrentSessionId(e.target.value)}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="session-actions">
                <button className="btn-nueva-sesion" onClick={() => setShowNewSession(v => !v)}>
                  <i className="fa-solid fa-plus" /> Nueva sesión
                </button>
                {isAdmin && (
                  <button className="session-delete-btn" onClick={handleDeleteSession} title="Eliminar sesión">
                    <i className="fa-solid fa-trash" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="no-sessions-msg">
              <i className="fa-solid fa-receipt" /> Crea la primera sesión para empezar
            </div>
          )}

          {(showNewSession || sessions.length === 0) && (
            <div className="new-session-form">
              <input
                className="new-session-input"
                placeholder="Nombre de la sesión (ej: Restaurante La Taberna)"
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateSession()}
                autoFocus
              />
              <div className="new-session-btns">
                <button
                  className="btn-create-session"
                  onClick={handleCreateSession}
                  disabled={!newSessionName.trim() || creatingSess}
                >
                  {creatingSess ? 'Creando...' : 'Crear sesión'}
                </button>
                {showNewSession && (
                  <button className="btn-cancel-session" onClick={() => { setShowNewSession(false); setNewSessionName('') }}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {currentSessionId && (
          <>
            {grandTotal > 0 && (
              <div className="grand-total-badge">
                <div>
                  <div className="grand-total-label">Total de la cuenta</div>
                  <div className="grand-total-people">{activeUsers.length} personas</div>
                </div>
                <div className="grand-total-amount">{fmt(grandTotal)}</div>
              </div>
            )}

            <div className="cuentas-tabs">
              {[
                { id: 'resumen',     label: '📋 Resumen' },
                { id: 'mi-cuenta',   label: '🍽️ Mi Cuenta' },
                { id: 'compartidos', label: '🤝 Compartidos' },
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

            {/* ── RESUMEN TAB ── */}
            {activeTab === 'resumen' && (
              <div className="resumen-tab">
                {activeUsers.length === 0 ? (
                  <div className="cuentas-empty">
                    Todavía no hay platos en esta sesión.<br />
                    Ve a "Mi Cuenta" para añadir los tuyos.
                  </div>
                ) : (
                  <div className="resumen-grid">
                    {activeUsers.map(u => {
                      const data = totals[u.id]
                      const isMe = u.id === user?.id
                      return (
                        <div key={u.id} className={`user-cuenta-card ${isMe ? 'user-card-me' : ''}`}>
                          <div className="user-card-header">
                            <div className="user-card-avatar" style={{ background: u.color }}>
                              {u.nombre.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div className="user-card-name">
                              {u.nombre}
                              {isMe && <span className="card-yo"> (tú)</span>}
                            </div>
                            <div className="user-card-total">{fmt(data.total)}</div>
                          </div>
                          <div className="user-card-items">
                            {data.individual.map(item => (
                              <div key={item.id} className="user-card-item">
                                <span className="item-desc">{item.description}</span>
                                <span className="item-price">{fmt(item.price)}</span>
                              </div>
                            ))}
                            {data.sharedItems.map(sh => (
                              <div key={sh.id} className="user-card-item user-card-item-shared">
                                <span className="item-desc">
                                  <i className="fa-solid fa-users" style={{ fontSize: '0.6em', opacity: 0.55, marginRight: '4px' }} />
                                  {sh.description} ÷{sh.participants.length}
                                </span>
                                <span className="item-price shared-price">{fmt(sh.perPerson)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── MI CUENTA TAB ── */}
            {activeTab === 'mi-cuenta' && (
              <div className="mi-cuenta-tab">
                <div className="my-total-banner">
                  <div>
                    <div className="my-total-label">Tu total</div>
                    <div className="my-total-breakdown">
                      {myTotal > 0 && <span>{fmt(myTotal)} propios</span>}
                      {mySharedTotal > 0 && <span>+ {fmt(mySharedTotal)} compartidos</span>}
                    </div>
                  </div>
                  <div className="my-total-amount">{fmt(myGrandTotal)}</div>
                </div>

                <div className="my-items-section">
                  <h3 className="section-title">Mis platos y bebidas</h3>
                  {myItems.length === 0 ? (
                    <div className="cuentas-empty-small">Aún no has añadido nada</div>
                  ) : (
                    <div className="my-items-list">
                      {myItems.map(item => {
                        const isEditing = editingItemId === item.id
                        return (
                          <div key={item.id} className="my-item-row">
                            <span className="my-item-desc">{item.description}</span>
                            {isEditing ? (
                              <>
                                <div className="item-edit-price-wrap">
                                  <input
                                    className="item-price-input"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editingPrice}
                                    onChange={e => setEditingPrice(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleUpdateItem()
                                      if (e.key === 'Escape') setEditingItemId(null)
                                    }}
                                    autoFocus
                                  />
                                  <span className="price-euro">€</span>
                                </div>
                                <button className="item-save-btn" onClick={handleUpdateItem} title="Guardar">
                                  <i className="fa-solid fa-check" />
                                </button>
                                <button className="item-delete-btn" onClick={() => setEditingItemId(null)} title="Cancelar">×</button>
                              </>
                            ) : (
                              <>
                                <span className="my-item-price">{fmt(item.price)}</span>
                                <button
                                  className="item-edit-btn"
                                  onClick={() => { setEditingItemId(item.id); setEditingPrice(String(item.price)) }}
                                  title="Editar precio"
                                >
                                  <i className="fa-solid fa-pencil" />
                                </button>
                                <button className="item-delete-btn" onClick={() => handleDeleteItem(item.id)} title="Eliminar">×</button>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="add-item-section">
                  <h3 className="section-title">Añadir plato o bebida</h3>
                  <form className="add-item-form" onSubmit={handleAddItem}>
                    <input
                      className="add-item-input"
                      placeholder="Nombre del plato o bebida"
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      maxLength={60}
                    />
                    <div className="add-item-bottom-row">
                      <div className="price-input-wrap">
                        <input
                          className="add-price-input"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={newPrice}
                          onChange={e => setNewPrice(e.target.value)}
                        />
                        <span className="price-euro">€</span>
                      </div>
                      <button
                        className="btn-add-item"
                        type="submit"
                        disabled={!newDesc.trim() || !newPrice || addingItem}
                      >
                        <i className="fa-solid fa-plus" /> Añadir
                      </button>
                    </div>
                  </form>
                </div>

                {mySharedItems.length > 0 && (
                  <div className="my-shared-section">
                    <h3 className="section-title">Tus platos compartidos</h3>
                    <div className="my-items-list">
                      {mySharedItems.map(sh => (
                        <div key={sh.id} className="my-item-row my-item-row-shared">
                          <div className="shared-info-col">
                            <span className="my-item-desc">{sh.description}</span>
                            <span className="shared-people-hint">{sh.participants.length} personas</span>
                          </div>
                          <div className="shared-prices-col">
                            <span className="shared-original-price">{fmt(sh.price)} total</span>
                            <span className="my-item-price">{fmt(parseFloat(sh.price) / sh.participants.length)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── COMPARTIDOS TAB ── */}
            {activeTab === 'compartidos' && (
              <div className="compartidos-tab">
                {shared.length > 0 && (
                  <div className="shared-list">
                    {shared.map(sh => {
                      const perPerson = parseFloat(sh.price) / sh.participants.length
                      const canDelete = sh.created_by === user?.id || isAdmin
                      return (
                        <div key={sh.id} className="shared-item-card">
                          <div className="shared-item-main">
                            <div className="shared-item-name">{sh.description}</div>
                            <div className="shared-price-info">
                              <span className="shared-total-price">{fmt(sh.price)}</span>
                              <span className="shared-divider">÷{sh.participants.length}</span>
                              <span className="shared-per-person">{fmt(perPerson)}</span>
                            </div>
                            {canDelete && (
                              <button className="shared-delete-btn" onClick={() => handleDeleteShared(sh)}>
                                <i className="fa-solid fa-trash" />
                              </button>
                            )}
                          </div>
                          <div className="shared-item-who">
                            {sh.participants.map(uid => {
                              const u = getUserById(uid)
                              return u ? (
                                <div key={uid} className="participant-chip">
                                  <span className="participant-dot" style={{ background: u.color }} />
                                  {u.nombre}
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="add-shared-section">
                  <h3 className="section-title">Añadir plato compartido</h3>
                  <form className="add-shared-form" onSubmit={handleAddShared}>
                    <input
                      className="add-item-input"
                      placeholder="Nombre del plato compartido"
                      value={sharedDesc}
                      onChange={e => setSharedDesc(e.target.value)}
                      maxLength={60}
                    />
                    <div className="price-input-wrap">
                      <input
                        className="add-price-input"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={sharedPrice}
                        onChange={e => setSharedPrice(e.target.value)}
                      />
                      <span className="price-euro">€</span>
                    </div>

                    <div className="participants-picker">
                      <p className="participants-label">
                        ¿Quién lo comparte?
                        {sharedParticipants.length > 0 && (
                          <span className="participants-count"> — {sharedParticipants.length} seleccionados</span>
                        )}
                      </p>
                      <div className="participants-grid">
                        {USERS.map(u => {
                          const selected = sharedParticipants.includes(u.id)
                          return (
                            <button
                              key={u.id}
                              type="button"
                              className={`participant-btn ${selected ? 'selected' : ''}`}
                              onClick={() => toggleParticipant(u.id)}
                            >
                              <span className="participant-avatar" style={{ background: u.color }}>
                                {u.nombre.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </span>
                              <span className="participant-name">{u.nombre}</span>
                              {selected && <i className="fa-solid fa-check participant-check" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {sharedParticipants.length >= 2 && sharedPrice && parseFloat(sharedPrice) > 0 && (
                      <div className="shared-preview">
                        <i className="fa-solid fa-calculator" />
                        {fmt(parseFloat(sharedPrice) / sharedParticipants.length)} por persona
                        ({sharedParticipants.length} personas)
                      </div>
                    )}

                    <button
                      className="btn-add-shared"
                      type="submit"
                      disabled={!sharedDesc.trim() || !sharedPrice || sharedParticipants.length < 2 || addingShared}
                    >
                      <i className="fa-solid fa-plus" /> Añadir plato compartido
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
