import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireMember({ children, section }) {
  const { user, authLoading, isGuest, guestPermissions } = useAuth()
  const location = useLocation()

  if (authLoading) return null
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (isGuest) {
    // Permissions still loading
    if (guestPermissions === null) return null

    // Check section-specific permission
    if (section && guestPermissions[section]) {
      return children
    }

    return (
      <div className="page">
        <div style={{
          maxWidth: '480px',
          margin: '60px auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(107,114,128,0.15)',
            border: '1px solid rgba(107,114,128,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#6b7280',
          }}>
            <i className="fa-solid fa-lock" />
          </div>
          <h2 style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            Área para miembros
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Esta sección es exclusiva para los miembros del grupo.<br />
            Como invitado, tu acceso está limitado.
          </p>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            <i className="fa-solid fa-arrow-left" /> Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return children
}
