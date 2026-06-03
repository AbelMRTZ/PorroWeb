import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { USERS } from '../data/usersConfig'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const STEP = { SELECT: 'select', NEW: 'new', ENTER: 'enter' }

function initials(nombre) {
  return nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Login() {
  const { hasPassword, setupPassword, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [step, setStep]               = useState(STEP.SELECT)
  const [selectedUser, setSelectedUser] = useState(null)
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  function pickUser(u) {
    setSelectedUser(u)
    setPassword(''); setConfirm(''); setError('')
    setStep(hasPassword(u.id) ? STEP.ENTER : STEP.NEW)
  }

  function back() {
    setStep(STEP.SELECT)
    setSelectedUser(null)
    setPassword(''); setConfirm(''); setError('')
  }

  async function handleNew(e) {
    e.preventDefault()
    if (password.length < 4) { setError('La contraseña debe tener al menos 4 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    await setupPassword(selectedUser.id, password)
    setLoading(false)
    navigate(from, { replace: true })
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!password) { setError('Escribe tu contraseña.'); return }
    setLoading(true)
    const result = await login(selectedUser.id, password)
    setLoading(false)
    if (result.ok) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
      setPassword('')
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow-l" />
      <div className="login-glow login-glow-r" />

      <div className={`login-card${step !== STEP.SELECT ? ' login-card-narrow' : ''}`}>
        <div className="login-logo">
          <i className="fa-solid fa-bolt" aria-hidden="true" />
        </div>
        <h1 className="login-title">La Revolución del Porro</h1>

        {/* ── STEP 1: user selection ── */}
        {step === STEP.SELECT && (
          <div className="login-section">
            <p className="login-subtitle">¿Quién eres?</p>
            <div className="user-grid">
              {USERS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  className="user-btn"
                  onClick={() => pickUser(u)}
                >
                  <span
                    className="user-avatar metal-avatar"
                    style={{ background: u.color }}
                  >
                    <span>{initials(u.nombre)}</span>
                  </span>
                  <span className="user-name">{u.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2a: set password (first time) ── */}
        {step === STEP.NEW && (
          <div className="login-section">
            <div className="step-user-badge">
              <span
                className="step-avatar metal-avatar"
                style={{ background: selectedUser.color }}
              >
                <span>{initials(selectedUser.nombre)}</span>
              </span>
              <span>{selectedUser.nombre}</span>
            </div>
            <p className="login-subtitle">
              Primera vez que entras. Elige tu contraseña.
            </p>

            <form className="login-form" onSubmit={handleNew} noValidate>
              <div className="field">
                <label className="field-label" htmlFor="pwd-new">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Nueva contraseña
                </label>
                <PasswordInput
                  id="pwd-new"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  show={showPwd}
                  onToggle={() => setShowPwd(v => !v)}
                  placeholder="Mínimo 4 caracteres"
                  autoFocus
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="pwd-confirm">
                  <i className="fa-solid fa-lock-open" aria-hidden="true" /> Confirmar contraseña
                </label>
                <PasswordInput
                  id="pwd-confirm"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError('') }}
                  show={showPwd}
                  onToggle={() => setShowPwd(v => !v)}
                  placeholder="Repite la contraseña"
                />
              </div>

              {error && <ErrorMsg text={error} />}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Guardando…</>
                  : <><i className="fa-solid fa-check" aria-hidden="true" /> Guardar y entrar</>}
              </button>
            </form>

            <button className="back-btn" type="button" onClick={back}>
              <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Cambiar usuario
            </button>
          </div>
        )}

        {/* ── STEP 2b: enter password (returning) ── */}
        {step === STEP.ENTER && (
          <div className="login-section">
            <div className="step-user-badge">
              <span
                className="step-avatar metal-avatar"
                style={{ background: selectedUser.color }}
              >
                <span>{initials(selectedUser.nombre)}</span>
              </span>
              <span>{selectedUser.nombre}</span>
            </div>
            <p className="login-subtitle">Escribe tu contraseña para entrar.</p>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              <div className="field">
                <label className="field-label" htmlFor="pwd-login">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Contraseña
                </label>
                <PasswordInput
                  id="pwd-login"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  show={showPwd}
                  onToggle={() => setShowPwd(v => !v)}
                  placeholder="Tu contraseña"
                  autoFocus
                />
              </div>

              {error && <ErrorMsg text={error} />}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Verificando…</>
                  : <><i className="fa-solid fa-arrow-right-to-bracket" aria-hidden="true" /> Entrar</>}
              </button>
            </form>

            <button className="back-btn" type="button" onClick={back}>
              <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Cambiar usuario
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PasswordInput({ id, value, onChange, show, onToggle, placeholder, autoFocus }) {
  return (
    <div className="password-wrap">
      <input
        id={id}
        className="field-input"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="current-password"
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={onToggle}
        aria-label={show ? 'Ocultar' : 'Mostrar'}
        tabIndex={-1}
      >
        <i className={`fa-solid fa-eye${show ? '-slash' : ''}`} aria-hidden="true" />
      </button>
    </div>
  )
}

function ErrorMsg({ text }) {
  return (
    <div className="login-error" role="alert">
      <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
      {text}
    </div>
  )
}
