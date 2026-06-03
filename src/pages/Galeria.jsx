import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { galeriaData } from '../data/galeriaData'
import { useAuth } from '../context/AuthContext'
import './Galeria.css'

const STORAGE_KEY = 'porro_gallery'

function loadGallery() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function saveGallery(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError') throw new Error('storage_full')
    throw e
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (ev) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const MAX = 1400
        let { width, height } = img
        if (width > MAX || height > MAX) {
          const r = Math.min(MAX / width, MAX / height)
          width = Math.round(width * r)
          height = Math.round(height * r)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function Galeria() {
  const { tripSlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [gallery, setGallery] = useState(loadGallery)
  const [lightbox, setLightbox] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const currentTrip = galeriaData.find(t => t.slug === tripSlug) ?? galeriaData[0]
  const tripPhotos = gallery[currentTrip.slug] ?? []

  useEffect(() => {
    if (!tripSlug) navigate(`/galeria/${galeriaData[0].slug}`, { replace: true })
  }, [tripSlug, navigate])

  const navigateLightbox = useCallback((dir) => {
    if (!lightbox || tripPhotos.length < 2) return
    const idx = tripPhotos.findIndex(p => p.id === lightbox.id)
    setLightbox(tripPhotos[(idx + dir + tripPhotos.length) % tripPhotos.length])
  }, [lightbox, tripPhotos])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')      setLightbox(null)
      if (e.key === 'ArrowRight')  navigateLightbox(1)
      if (e.key === 'ArrowLeft')   navigateLightbox(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigateLightbox])

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    setUploadError('')

    const newPhotos = []
    for (const file of files) {
      try {
        const dataUrl = await compressImage(file)
        newPhotos.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          dataUrl,
          name: file.name,
          uploadedBy: user?.nombre ?? 'Anónimo',
          uploadedAt: new Date().toISOString(),
        })
      } catch { /* skip individual failures */ }
    }

    try {
      setGallery(prev => {
        const updated = {
          ...prev,
          [currentTrip.slug]: [...(prev[currentTrip.slug] ?? []), ...newPhotos],
        }
        saveGallery(updated)
        return updated
      })
    } catch (err) {
      setUploadError(
        err.message === 'storage_full'
          ? 'Almacenamiento lleno. Elimina algunas fotos para liberar espacio.'
          : 'Error al guardar las fotos. Inténtalo de nuevo.'
      )
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function deletePhoto(photoId) {
    setGallery(prev => {
      const updated = {
        ...prev,
        [currentTrip.slug]: (prev[currentTrip.slug] ?? []).filter(p => p.id !== photoId),
      }
      saveGallery(updated)
      return updated
    })
    if (lightbox?.id === photoId) setLightbox(null)
  }

  const photoCount = (slug) => (gallery[slug] ?? []).length

  return (
    <div className="galeria-page">

      {/* ── Sidebar ── */}
      <aside className="galeria-sidebar">
        <h2 className="sidebar-title">Galería</h2>
        <nav className="sidebar-nav">
          {galeriaData.map(trip => (
            <Link
              key={trip.slug}
              to={`/galeria/${trip.slug}`}
              className={`sidebar-item${currentTrip.slug === trip.slug ? ' active' : ''}`}
            >
              <i className="fa-solid fa-location-dot sidebar-icon" aria-hidden="true" />
              <div className="sidebar-info">
                <span className="sidebar-name">{trip.nombre}</span>
                <span className="sidebar-year">
                  {trip.año} · {photoCount(trip.slug)} fotos
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <main className="galeria-main">
        <div className="galeria-main-header">
          <div className="galeria-header-left">
            <h1 className="galeria-trip-title">{currentTrip.nombre}</h1>
            <p className="galeria-trip-meta muted">
              {currentTrip.año} · {tripPhotos.length} {tripPhotos.length === 1 ? 'foto' : 'fotos'}
            </p>
            {currentTrip.descripcion && (
              <p className="galeria-trip-desc muted">{currentTrip.descripcion}</p>
            )}
          </div>

          <div className="galeria-header-right">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Subiendo…</>
                : <><i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Subir fotos</>}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="upload-error">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
            {uploadError}
          </div>
        )}

        {tripPhotos.length === 0 ? (
          <div className="galeria-empty">
            <i className="fa-solid fa-camera" aria-hidden="true" />
            <h3>Nadie ha subido ninguna foto todavía</h3>
            <p>¡Sé el primero en añadir recuerdos de <strong>{currentTrip.nombre}</strong>!</p>
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Subir fotos
            </button>
          </div>
        ) : (
          <div className="fotos-grid">
            {tripPhotos.map(foto => (
              <div key={foto.id} className="foto-thumb-wrap">
                <button
                  className="foto-thumb"
                  onClick={() => setLightbox(foto)}
                  aria-label={foto.name}
                >
                  <img src={foto.dataUrl} alt={foto.name} className="foto-img" />
                  <span className="foto-overlay">
                    <i className="fa-solid fa-magnifying-glass foto-icon" aria-hidden="true" />
                  </span>
                </button>
                <button
                  className="foto-delete"
                  onClick={() => deletePhoto(foto.id)}
                  aria-label="Eliminar foto"
                  title={`Subida por ${foto.uploadedBy}`}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>

          {tripPhotos.length > 1 && (
            <button
              className="lb-nav lb-prev"
              onClick={e => { e.stopPropagation(); navigateLightbox(-1) }}
              aria-label="Anterior"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
          )}

          <div className="lb-photo-wrap" onClick={e => e.stopPropagation()}>
            <img src={lightbox.dataUrl} alt={lightbox.name} className="lb-img" />
          </div>

          {tripPhotos.length > 1 && (
            <button
              className="lb-nav lb-next"
              onClick={e => { e.stopPropagation(); navigateLightbox(1) }}
              aria-label="Siguiente"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          )}

          <div className="lb-caption">
            {currentTrip.nombre} · Subida por {lightbox.uploadedBy}
          </div>
        </div>
      )}
    </div>
  )
}
