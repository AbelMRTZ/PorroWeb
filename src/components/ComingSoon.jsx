import './ComingSoon.css'

export default function ComingSoon({ title, description, icon = 'hourglass-half', author }) {
  return (
    <div className="cs-wrapper">
      <div className="cs-glow" />
      <div className="cs-content">
        <div className="cs-icon">
          <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
        </div>
        <div className="badge badge-purple cs-badge">Próximamente</div>
        <h1 className="cs-title">{title}</h1>
        <p className="cs-desc">
          {description || 'Esta sección está siendo desarrollada. ¡Vuelve pronto!'}
        </p>
        {author && (
          <p className="cs-author">Sección a cargo de <strong>{author}</strong></p>
        )}
        <div className="cs-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}
