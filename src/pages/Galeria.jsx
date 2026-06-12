// src/pages/Galeria.jsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadTrips } from '../data/tripsStore'
import { loadPhotosForTrip, uploadPhoto, deletePhoto, getPhotoUrl, loadAllPhotoCounts } from '../data/galleryStore'
import { useAuth } from '../context/AuthContext'
import './Galeria.css'

function fechaYear(fecha) {
  return fecha ? String(fecha).slice(0, 4) : ''
}

export default function Galeria() {
  const { tripSlug } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const fileInputRef = useRef(null)

  const [trips, setTrips] = useState([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [photos, setPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(false)
  const [photoCounts, setPhotoCounts] = useState({})
  const [lightbox, setLightbox] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    Promise.all([loadTrips(), loadAllPhotoCounts()])
      .then(([tripsData, countsData]) => {
        setTrips(tripsData)
        setPhotoCounts(countsData)
      })
      .finally(() => setTripsLoading(false))
  }, [])

  useEffect(() => {
    if (!tripsLoading && !tripSlug && trips.length > 0) {
      navigate(`/galeria/${trips[0].slug}`, { replace: true })
    }
  }, [tripSlug, trips, tripsLoading, navigate])

  const currentTrip = trips.find(t => t.slug === tripSlug) ?? trips[0]

  useEffect(() => {
    if (!currentTrip) return
    setPhotosLoading(true)
    setPhotos([])
    loadPhotosForTrip(currentTrip.slug)
      .then(setPhotos)
      .finally(() => setPhotosLoading(false))
  }, [currentTrip?.slug])

  const navigateLightbox = useCallback((dir) => {
    if (!lightbox || photos.length < 2) return
    const idx = photos.findIndex(p => p.id === lightbox.id)
    setLightbox(photos[(idx + dir + photos.length) % photos.length])
  }, [lightbox, photos])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     setLightbox(null)
      if (e.key === 'ArrowRight') navigateLightbox(1)
      if (e.key === 'ArrowLeft')  navigateLightbox(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigateLightbox])

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !currentTrip) return

    setUploading(true)
    setUploadError('')

    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      setUploadError('Se han bloqueado algunos archivos. Solo se permiten subir imágenes o fotos.')
    }

    for (const file of validFiles) {
      try {
        const photo = await uploadPhoto(currentTrip.id, currentTrip.slug, file, user?.nombre ?? 'Anónimo')
        setPhotos(prev => [...prev, photo])
        
        setPhotoCounts(prev => ({
          ...prev,
          [currentTrip.slug]: (prev[currentTrip.slug] || 0) + 1
        }))
      } catch (err) {
        setUploadError(
          err.message?.includes('storage')
            ? 'Error al subir la foto. Inténtalo de nuevo.'
            : 'Error al guardar la foto. Inténtalo de nuevo.'
        )
      }
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDeletePhoto(photo) {
    try {
      await deletePhoto(photo)
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      
      setPhotoCounts(prev => ({
        ...prev,
        [currentTrip.slug]: Math.max(0, (prev[currentTrip.slug] || 1) - 1)
      }))

      if (lightbox?.id === photo.id) setLightbox(null)
    } catch { /* ignore */ }
  }

  const photoCount = (trip) => {
    if (trip.slug === currentTrip?.slug) return photos.length
    return photoCounts[trip.slug] || 0
  }

  if (tripsLoading) return null

  if (trips.length === 0) {
    return (
      <div className="galeria-empty-page">
        <div className="galeria-empty">
          <i className="fa-solid fa-images" aria-hidden="true" />
          <h3>No hay viajes publicados</h3>
          {isAdmin
            ? <p>Crea el primer viaje desde el <Link to="/admin">panel de administración</Link>.</p>
            : <p>Aún no se han publicado viajes. ¡Pronto habrá recuerdos aquí!</p>
          }
        </div>
      </div>
    )
  }

  return (
    <div className="galeria-page">

      <aside className="galeria-sidebar">
        <h2 className="sidebar-title">Galería</h2>
        <nav className="sidebar-nav">
          {trips.map(trip => (
            <Link
              key={trip.slug}
              to={`/galeria/${trip.slug}`}
              className={`sidebar-item${currentTrip?.slug === trip.slug ? ' active' : ''}`}
            >
              <i className="fa-solid fa-location-dot sidebar-icon" aria-hidden="true" />
              <div className="sidebar-info">
                <span className="sidebar-name">{trip.nombre}</span>
                <span className="sidebar-year">
                  {fechaYear(trip.fecha)} · {photoCount(trip)} fotos
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="galeria-main">
        <div className="galeria-main-header">
          <div className="galeria-header-left">
            <h1 className="galeria-trip-title">{currentTrip?.nombre}</h1>
            <p className="galeria-trip-meta muted">
              {fechaYear(currentTrip?.fecha)} · {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
            </p>
            {currentTrip?.descripcion && (
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

        {photosLoading ? (
          <div className="galeria-empty">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
            <h3>Cargando fotos…</h3>
          </div>
        ) : photos.length === 0 ? (
          <div className="galeria-empty">
            <i className="fa-solid fa-camera" aria-hidden="true" />
            <h3>Nadie ha subido ninguna foto todavía</h3>
            <p>¡Sé el primero en añadir recuerdos de <strong>{currentTrip?.nombre}</strong>!</p>
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
            {photos.map(foto => {
              // 🚀 COMPROBACIÓN DE PERMISOS: Solo el dueño o los admins (Sergio y Abel) pueden borrar
              const puedeBorrar = isAdmin || foto.uploaded_by === user?.nombre;

              return (
                <div key={foto.id} className="foto-thumb-wrap">
                  <button
                    className="foto-thumb"
                    onClick={() => setLightbox(foto)}
                    aria-label={foto.name}
                  >
                    <img src={getPhotoUrl(foto.storage_path)} alt={foto.name} className="foto-img" />
                    <span className="foto-overlay">
                      <i className="fa-solid fa-magnifying-glass foto-icon" aria-hidden="true" />
                    </span>
                  </button>
                  
                  {/* El botón de borrar solo se dibuja si cumple la condición */}
                  {puedeBorrar && (
                    <button
                      className="foto-delete"
                      onClick={() => handleDeletePhoto(foto)}
                      aria-label="Eliminar foto"
                      title={`Subida por ${foto.uploaded_by}`}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)} aria-label="Cerrar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <button
              className="lb-nav lb-prev"
              onClick={e => { e.stopPropagation(); navigateLightbox(-1) }}
              aria-label="Anterior"
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
          )}

          <div className="lb-photo-wrap" onClick={e => e.stopPropagation()}>
            <img src={getPhotoUrl(lightbox.storage_path)} alt={lightbox.name} className="lb-img" />
          </div>

          {photos.length > 1 && (
            <button
              className="lb-nav lb-next"
              onClick={e => { e.stopPropagation(); navigateLightbox(1) }}
              aria-label="Siguiente"
            >
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          )}

          <div className="lb-caption">
            {currentTrip?.nombre} · Subida por {lightbox.uploaded_by}
          </div>
        </div>
      )}
    </div>
  )
}