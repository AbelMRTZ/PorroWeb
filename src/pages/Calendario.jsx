import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { CUMERS } from '../data/usersConfig'
import {
  loadDisponibilidades,
  saveDisponibilidad,
  loadEventos,
  saveEvento,
  deleteEvento,
} from '../data/calendarioStore'
import './Calendario.css'

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const DAY_HEADERS = ['L','M','X','J','V','S','D']

function formatDate(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function statusColor(status) {
  if (status === 'ocupado') return '#ef4444'
  return '#22c55e' // libre o sin marcar → verde por defecto
}

function DayCell({ year, month, day, disponibilidades, eventos, isSelected, isToday, onSelect }) {
  const dateStr = formatDate(year, month, day)
  const dayEvents = eventos.filter(e => e.fecha_inicio <= dateStr && e.fecha_fin >= dateStr)

  return (
    <button
      className={`cal-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${dayEvents.length ? ' has-event' : ''}`}
      onClick={() => onSelect(dateStr)}
      title={dateStr}
    >
      <span className="cal-day-num">{day}</span>
      <div className="cal-indicators">
        {CUMERS.map(u => {
          const s = disponibilidades[u.id]?.[dateStr]
          return (
            <div key={u.id} className="cal-user-block" title={u.nombre}>
              <div className="cal-periodo" style={{ background: statusColor(s?.manana) }} />
              <div className="cal-periodo" style={{ background: statusColor(s?.tarde) }} />
            </div>
          )
        })}
      </div>
      {dayEvents.length > 0 && (
        <div className="cal-event-strip">
          {dayEvents.slice(0, 2).map(e => (
            <div key={e.id} className="cal-event-pip" style={{ background: e.color }} />
          ))}
          {dayEvents.length > 2 && <div className="cal-event-pip cal-event-pip--more">+{dayEvents.length - 2}</div>}
        </div>
      )}
    </button>
  )
}

function MonthGrid({ year, month, disponibilidades, eventos, selectedDate, onSelectDate }) {
  const cells = getMonthDays(year, month)
  const todayStr = formatDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

  return (
    <div className="cal-month">
      <h3 className="cal-month-title">{MONTH_NAMES[month - 1]}</h3>
      <div className="cal-grid">
        {DAY_HEADERS.map(d => <div key={d} className="cal-day-header">{d}</div>)}
        {cells.map((day, i) =>
          day === null
            ? <div key={`e-${i}`} className="cal-day-empty" />
            : <DayCell
                key={day}
                year={year}
                month={month}
                day={day}
                disponibilidades={disponibilidades}
                eventos={eventos}
                isSelected={selectedDate === formatDate(year, month, day)}
                isToday={formatDate(year, month, day) === todayStr}
                onSelectDate={onSelectDate}
                onSelect={onSelectDate}
              />
        )}
      </div>
    </div>
  )
}

function StatusToggle({ label, value, onChange, disabled }) {
  // null = libre por defecto
  const isOcupado = value === 'ocupado'

  return (
    <div className="status-toggle">
      <span className="status-toggle-label">{label}</span>
      <div className="status-toggle-btns">
        <button
          className={`status-btn libre${!isOcupado ? ' active' : ''}`}
          onClick={() => onChange(null)}
          disabled={disabled || !isOcupado}
        >
          <i className="fa-solid fa-check" /> Libre
        </button>
        <button
          className={`status-btn ocupado${isOcupado ? ' active' : ''}`}
          onClick={() => onChange(isOcupado ? null : 'ocupado')}
          disabled={disabled}
        >
          <i className="fa-solid fa-xmark" /> Ocupado
        </button>
      </div>
    </div>
  )
}

function EventoForm({ selectedDate, userId, onSave, onCancel }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaInicio, setFechaInicio] = useState(selectedDate)
  const [fechaFin, setFechaFin] = useState(selectedDate)
  const [color, setColor] = useState('#7c3aed')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!titulo.trim()) return setError('El título es obligatorio.')
    if (fechaFin < fechaInicio) return setError('La fecha de fin debe ser igual o posterior al inicio.')
    setSaving(true)
    try {
      const ev = await saveEvento({ userId, titulo: titulo.trim(), descripcion: descripcion.trim(), fechaInicio, fechaFin, color })
      onSave(ev)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form className="evento-form" onSubmit={handleSubmit}>
      <h4 className="evento-form-title">Nuevo evento</h4>
      <div className="form-field">
        <label>Título</label>
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Ej: Viaje a Barcelona"
          maxLength={80}
          autoFocus
        />
      </div>
      <div className="form-field">
        <label>Descripción <span className="optional">(opcional)</span></label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Detalles del evento..."
        />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Desde</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Hasta</label>
          <input type="date" value={fechaFin} min={fechaInicio} onChange={e => setFechaFin(e.target.value)} />
        </div>
      </div>
      <div className="form-field form-field--color">
        <label>Color</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <span className="color-preview" style={{ background: color }} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar evento'}
        </button>
      </div>
    </form>
  )
}

function DayPanel({ date, disponibilidades, eventos, userId, onClose, onToggle, onAddEvento, onDeleteEvento, saving }) {
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { setShowForm(false) }, [date])

  if (!date) return null

  const [y, m, d] = date.split('-').map(Number)
  const jsDate = new Date(y, m - 1, d)
  const weekday = jsDate.toLocaleDateString('es-ES', { weekday: 'long' })
  const fullDate = jsDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

  const dayEvents = eventos.filter(e => e.fecha_inicio <= date && e.fecha_fin >= date)
  const myStatus = disponibilidades[userId]?.[date] ?? {}

  return (
    <div className="day-panel">
      <div className="day-panel-header">
        <div className="day-panel-date-info">
          <span className="day-panel-weekday">{weekday.charAt(0).toUpperCase() + weekday.slice(1)}</span>
          <span className="day-panel-date">{fullDate}</span>
        </div>
        <button className="day-panel-close" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="day-panel-section">
        <h4>Mi disponibilidad</h4>
        <StatusToggle label="Mañana" value={myStatus.manana ?? null} onChange={v => onToggle('manana', v)} disabled={saving} />
        <StatusToggle label="Tarde"  value={myStatus.tarde  ?? null} onChange={v => onToggle('tarde',  v)} disabled={saving} />
      </div>

      <div className="day-panel-section">
        <h4>Todos los cumers</h4>
        <div className="cumers-grid">
          {CUMERS.map(u => {
            const s = disponibilidades[u.id]?.[date] ?? {}
            return (
              <div key={u.id} className="cumer-row">
                <div className="cumer-avatar" style={{ background: u.color }}>
                  {u.nombre[0]}
                </div>
                <span className="cumer-name">{u.nombre}</span>
                <div className="cumer-badges">
                  <span className={`period-badge period-badge--${s.manana ?? 'libre'}`}>
                    M
                  </span>
                  <span className={`period-badge period-badge--${s.tarde ?? 'libre'}`}>
                    T
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="day-panel-section">
        <div className="section-header-row">
          <h4>Eventos</h4>
          {!showForm && (
            <button className="btn-add-event" onClick={() => setShowForm(true)}>
              <i className="fa-solid fa-plus" /> Añadir
            </button>
          )}
        </div>

        {showForm && (
          <EventoForm
            selectedDate={date}
            userId={userId}
            onSave={ev => { onAddEvento(ev); setShowForm(false) }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {dayEvents.length === 0 && !showForm && (
          <p className="no-events-msg">Sin eventos este día.</p>
        )}

        <div className="events-list">
          {dayEvents.map(e => (
            <div key={e.id} className="event-item">
              <div className="event-color-bar" style={{ background: e.color }} />
              <div className="event-body">
                <span className="event-title">{e.titulo}</span>
                {e.fecha_inicio !== e.fecha_fin && (
                  <span className="event-range">
                    {e.fecha_inicio} → {e.fecha_fin}
                  </span>
                )}
                {e.descripcion && <span className="event-desc">{e.descripcion}</span>}
              </div>
              {e.user_id === userId && (
                <button className="event-delete-btn" onClick={() => onDeleteEvento(e.id)} title="Eliminar evento">
                  <i className="fa-solid fa-trash" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Calendario() {
  const { user } = useAuth()
  const [year, setYear] = useState(new Date().getFullYear())
  const [disponibilidades, setDisponibilidades] = useState({})
  const [eventos, setEventos] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      loadDisponibilidades(year),
      loadEventos(year),
    ]).then(([disps, evts]) => {
      setDisponibilidades(disps)
      setEventos(evts)
    }).finally(() => setLoading(false))
  }, [year])

  function handleSelectDate(date) {
    setSelectedDate(prev => prev === date ? null : date)
  }

  async function handleToggle(periodo, newStatus) {
    if (!selectedDate || saving) return
    setSaving(true)
    try {
      const current = disponibilidades[user.id]?.[selectedDate] ?? {}
      const manana = periodo === 'manana' ? newStatus : (current.manana ?? null)
      const tarde  = periodo === 'tarde'  ? newStatus : (current.tarde  ?? null)
      await saveDisponibilidad(user.id, selectedDate, manana, tarde)
      setDisponibilidades(prev => ({
        ...prev,
        [user.id]: {
          ...(prev[user.id] ?? {}),
          [selectedDate]: { manana, tarde },
        },
      }))
    } finally {
      setSaving(false)
    }
  }

  function handleAddEvento(ev) {
    setEventos(prev => [...prev, ev])
  }

  async function handleDeleteEvento(id) {
    try {
      await deleteEvento(id)
      setEventos(prev => prev.filter(e => e.id !== id))
    } catch { /* noop */ }
  }

  return (
    <div className="calendario-page">
      <div className="calendario-topbar">
        <h1 className="calendario-title">
          <i className="fa-solid fa-calendar-days" />
          Calendario
        </h1>
        <div className="year-nav">
          <button className="year-nav-btn" onClick={() => setYear(y => y - 1)}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <span className="year-display">{year}</span>
          <button className="year-nav-btn" onClick={() => setYear(y => y + 1)}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="calendario-legend">
        {CUMERS.map((u, i) => (
          <div key={u.id} className="legend-user">
            <div className="legend-user-avatar" style={{ background: u.color }}>{u.nombre[0]}</div>
            <span className="legend-user-name">{u.nombre}</span>
            <div className="legend-user-indicators">
              <div className="legend-pip" style={{ background: '#22c55e' }} title="Mañana libre" />
              <div className="legend-pip" style={{ background: '#ef4444' }} title="Tarde ocupado" />
            </div>
          </div>
        ))}
        <div className="legend-status">
          <div className="legend-pip" style={{ background: '#22c55e' }} /><span>Libre</span>
          <div className="legend-pip" style={{ background: '#ef4444' }} /><span>Ocupado</span>
        </div>
      </div>

      <div className={`calendario-content${selectedDate ? ' panel-open' : ''}`}>
        {loading ? (
          <div className="calendario-loading">
            <i className="fa-solid fa-spinner fa-spin" /> Cargando…
          </div>
        ) : (
          <div className="months-grid">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <MonthGrid
                key={month}
                year={year}
                month={month}
                disponibilidades={disponibilidades}
                eventos={eventos}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            ))}
          </div>
        )}

        {selectedDate && (
          <DayPanel
            date={selectedDate}
            disponibilidades={disponibilidades}
            eventos={eventos}
            userId={user.id}
            onClose={() => setSelectedDate(null)}
            onToggle={handleToggle}
            onAddEvento={handleAddEvento}
            onDeleteEvento={handleDeleteEvento}
            saving={saving}
          />
        )}
      </div>
    </div>
  )
}
