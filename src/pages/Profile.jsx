import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function initials(nombre) {
  return nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Profile() {
  const { user, changePassword } = useAuth()

  const [current, setCurrent] = useState('')
  const [newPwd,  setNewPwd]  = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setCurrent(''); setNewPwd(''); setConfirm('')
    setError(''); setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(false)
    if (!current)              { setError('Escribe tu contraseña actual.'); return }
    if (newPwd.length < 4)     { setError('La nueva contraseña debe tener al menos 4 caracteres.'); return }
    if (newPwd === current)    { setError('La nueva contraseña debe ser diferente a la actual.'); return }
    if (newPwd !== confirm)    { setError('Las contraseñas nuevas no coinciden.'); return }

    setLoading(true)
    const result = await changePassword(user.id, current, newPwd)
    setLoading(false)

    if (result.ok) {
      setSuccess(true)
      setCurrent(''); setNewPwd(''); setConfirm('')
    } else {
      setError(result.error)
      setCurrent('')
    }
  }

  return (
    <div className="page">
      <div className="container profile-page">

        {/* ── User card ── */}
        <div className="profile-card">
          <div className="profile-avatar-wrap" style={{ background: user.color }}>
            <div className="profile-avatar metal-avatar" style={{ background: user.color }}>
              <span>{initials(user.nombre)}</span>
            </div>
          </div>
          <h1 className="profile-name">{user.nombre}</h1>
          <span className="badge badge-gold profile-badge">Miembro del grupo</span>

          <div className="profile-info">
            <div className="profile-info-row">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              <span>Contraseña almacenada en este dispositivo</span>
            </div>
            <div className="profile-info-row">
              <i className="fa-solid fa-circle-info" aria-hidden="true" />
              <span>Si cambias de dispositivo tendrás que configurar tu contraseña de nuevo</span>
            </div>
          </div>
        </div>

        {/* ── Settings ── */}
        <div className="profile-settings">

          <section className="settings-card">
            <div className="settings-card-header">
              <i className="fa-solid fa-key" aria-hidden="true" />
              <h2>Cambiar contraseña</h2>
            </div>

            <form onSubmit={handleSubmit} className="settings-form" noValidate>
              <PwdField
                id="f-current"
                label="Contraseña actual"
                icon="lock"
                value={current}
                onChange={e => { setCurrent(e.target.value); setError(''); setSuccess(false) }}
                show={showPwd}
                onToggle={() => setShowPwd(v => !v)}
                placeholder="Tu contraseña actual"
                autoComplete="current-password"
              />

              <PwdField
                id="f-new"
                label="Nueva contraseña"
                icon="lock-open"
                value={newPwd}
                onChange={e => { setNewPwd(e.target.value); setError(''); setSuccess(false) }}
                show={showPwd}
                onToggle={() => setShowPwd(v => !v)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
              />

              <PwdField
                id="f-confirm"
                label="Confirmar nueva contraseña"
                icon="check-double"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); setSuccess(false) }}
                show={showPwd}
                onToggle={() => setShowPwd(v => !v)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />

              {error && (
                <div className="form-feedback form-error" role="alert">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
                  {error}
                </div>
              )}

              {success && (
                <div className="form-feedback form-success" role="status">
                  <i className="fa-solid fa-circle-check" aria-hidden="true" />
                  Contraseña cambiada correctamente.
                </div>
              )}

              <div className="settings-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Guardando…</>
                    : <><i className="fa-solid fa-floppy-disk" aria-hidden="true" /> Guardar cambios</>}
                </button>
              </div>
            </form>
          </section>

        </div>
      </div>
    </div>
  )
}

function PwdField({ id, label, icon, value, onChange, show, onToggle, placeholder, autoComplete }) {
  return (
    <div className="pf-field">
      <label className="pf-label" htmlFor={id}>
        <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
        {label}
      </label>
      <div className="pf-input-wrap">
        <input
          id={id}
          className="pf-input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="pf-toggle"
          onClick={onToggle}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          <i className={`fa-solid fa-eye${show ? '-slash' : ''}`} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
