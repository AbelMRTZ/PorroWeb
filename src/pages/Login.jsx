// src/pages/Login.jsx

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { USERS } from '../data/usersConfig'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const STEP = { SELECT: 'select', NEW: 'new', ENTER: 'enter' }

// Base de datos local de códigos de activación secretos
const CODIGOS_ACTIVACION = {
  'abel': 'biciplaneazul',
  'adri': 'cochetrennegro',          // Corregido (antes adrian)
  'albas': 'sillapapelnubes',        // Corregido (antes alba)
  'andrea': 'osoleontigre',
  'clara': 'llavepuertablanca',
  'cristina': 'lapizbiciverde',
  'isabel': 'ventanasuelorojo',
  'jorge': 'libromesaazul',
  'jose': 'solplayaverde',           // Corregido (antes joseantonio, porque en users es "Jose")
  'juanfran': 'mototrenazul',
  'laurab': 'librocasagato',         // Corregido (antes laurabanon)
  'laural': 'playazulperro',         // Corregido (antes lauralorenzo)
  'mariaju': 'mesasillablanca',
  'paulam': 'aviontigrenegro',       // Corregido (antes paulamoris)
  'paulaedurne': 'nubesolmonte',     // Corregido (antes paularomero)
  'raquelg': 'cochegatoverde',       // Corregido (antes raquel)
  'sergio': 'perrogatocasa',
  'silvia': 'papelpuertaazul'
}

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
  const [activationCode, setActivationCode] = useState('') // 🚀 NUEVO
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  async function pickUser(u) {
    setSelectedUser(u)
    setPassword(''); setConfirm(''); setActivationCode(''); setError('')
    setLoading(true)
    const has = await hasPassword(u.id)
    setLoading(false)
    setStep(has ? STEP.ENTER : STEP.NEW)
  }

  function back() {
    setStep(STEP.SELECT)
    setSelectedUser(null)
    setPassword(''); setConfirm(''); setActivationCode(''); setError('')
  }

  async function handleNew(e) {
    e.preventDefault()

    // Lógica para normalizar el nombre y verificar su código secreto
    const claveNormalizada = selectedUser.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "")

    const codigoCorrecto = CODIGOS_ACTIVACION[claveNormalizada]

    if (activationCode.trim().toLowerCase() !== codigoCorrecto) {
      setError('El código de activación por WhatsApp no es correcto.')
      return
    }

    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    
    setLoading(true)
    const result = await setupPassword(selectedUser.id, password)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
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
              Primera vez que entras. Introduce tu código de activación.
            </p>

            <form className="login-form" onSubmit={handleNew} noValidate>
              
              {/* 🚀 NUEVO CAMPO: Código de WhatsApp */}
              <div className="field">
                <label className="field-label" htmlFor="activation-code">
                  <i className="fa-solid fa-key" aria-hidden="true" /> Código de WhatsApp
                </label>
                <input
                  id="activation-code"
                  className="field-input"
                  type="text"
                  value={activationCode}
                  onChange={e => { setActivationCode(e.target.value); setError('') }}
                  placeholder="Introduce las 3 palabras juntas"
                  autoFocus
                />
              </div>

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
                  placeholder="Mínimo 6 caracteres"
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
                  : <><i className="fa-solid fa-check" aria-hidden="true" /> Registrarse y Entrar</>}
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