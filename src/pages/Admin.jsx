import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { loadTrips, createTrip, updateTrip, deleteTrip, slugify } from '../data/tripsStore'
import { uploadPhoto, compressToBlob } from '../data/galleryStore'
import './Admin.css'

function formatFecha(fecha) {
  if (!fecha) return ''
  const [y, m, d] = String(fecha).slice(0, 10).split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}

export default function Admin() {
  const { user } = useAuth()

  const [trips, setTrips] = useState([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [form, setForm] = useState({ nombre: '', fecha: '', descripcion: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef(null)

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ nombre: '', fecha: '', descripcion: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    loadTrips()
      .then(data => setTrips(data.slice().reverse()))
      .finally(() => setTripsLoading(false))
  }, [])

  async function handlePhotoSelect(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploadingPhotos(true)
    const compressed = []
    for (const file of files) {
      try {
        const blob = await compressToBlob(file)
        const previewUrl = URL.createObjectURL(blob)
        compressed.push({ blob, previewUrl, name: file.name, originalFile: file })
      } catch { /* skip */ }
    }
    setPendingPhotos(prev => [...prev, ...compressed])
    setUploadingPhotos(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePendingPhoto(idx) {
    setPendingPhotos(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  async function handleCreate(e) {
    e.preventDefault()
    const nombre = form.nombre.trim()
    const fecha  = form.fecha
    if (!nombre) { setFormError('El nombre es obligatorio.'); return }
    if (!fecha)  { setFormError('La fecha es obligatoria.'); return }

    setFormError('')
    setSaving(true)

    try {
      const base = slugify(nombre) || 'viaje'
      const slug = `${base}-${Date.now().toString(36)}`

      const newTrip = await createTrip({
        slug,
        nombre,
        fecha,
        descripcion: form.descripcion.trim(),
        createdBy: user?.nombre ?? '',
      })

      for (const p of pendingPhotos) {
        try {
          await uploadPhoto(newTrip.id, newTrip.slug, p.originalFile, user?.nombre ?? 'Admin')
        } catch { /* skip individual photo failures */ }
      }

      pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl))
      setTrips(prev => [newTrip, ...prev])
      setForm({ nombre: '', fecha: '', descripcion: '' })
      setPendingPhotos([])
    } catch (err) {
      setFormError(err.message ?? 'Error al crear el viaje.')
    }

    setSaving(false)
  }

  function startEdit(trip) {
    setEditingId(trip.id)
    setEditForm({
      nombre: trip.nombre,
      fecha: String(trip.fecha).slice(0, 10),
      descripcion: trip.descripcion ?? '',
    })
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    const nombre = editForm.nombre.trim()
    const fecha  = editForm.fecha
    if (!nombre) { setEditError('El nombre es obligatorio.'); return }
    if (!fecha)  { setEditError('La fecha es obligatoria.'); return }

    setEditSaving(true)
    setEditError('')
    try {
      const updated = await updateTrip(editingId, {
        nombre,
        fecha,
        descripcion: editForm.descripcion.trim(),
      })
      setTrips(prev => prev.map(t => t.id === editingId ? updated : t))
      setEditingId(null)
    } catch (err) {
      setEditError(err.message ?? 'Error al guardar.')
    }
    setEditSaving(false)
  }

  async function handleDelete(trip) {
    if (!confirm(`¿Eliminar "${trip.nombre}"? Se borrarán también todas sus fotos.`)) return
    try {
      await deleteTrip(trip.id)
      setTrips(prev => prev.filter(t => t.id !== trip.id))
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  return (
    <div className="admin-page container">

      <div className="admin-header">
        <h1 className="admin-title">
          <i className="fa-solid fa-shield-halved" aria-hidden="true" />
          Panel de Administración
        </h1>
        <p className="admin-subtitle muted">Gestión de viajes de la Galería</p>
      </div>

      {/* ── Crear viaje ── */}
      <section className="admin-section">
        <h2 className="admin-section-title">Nuevo viaje</h2>

        <form className="admin-form" onSubmit={handleCreate}>
          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="trip-nombre">
                Nombre <span className="required">*</span>
              </label>
              <input
                id="trip-nombre"
                type="text"
                placeholder="Ej: Viaje a Lisboa"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                maxLength={80}
              />
            </div>
            <div className="admin-field admin-field-date">
              <label htmlFor="trip-fecha">
                Fecha <span className="required">*</span>
              </label>
              <input
                id="trip-fecha"
                type="date"
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="trip-desc">
              Descripción <span className="optional">(opcional)</span>
            </label>
            <textarea
              id="trip-desc"
              placeholder="Breve descripción del viaje…"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              maxLength={400}
            />
          </div>

          <div className="admin-field">
            <label>
              Fotos iniciales <span className="optional">(opcional)</span>
            </label>
            <div className="admin-file-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                className="admin-file-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhotos}
              >
                {uploadingPhotos
                  ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Procesando…</>
                  : <><i className="fa-solid fa-cloud-arrow-up" aria-hidden="true" /> Seleccionar fotos</>}
              </button>
              {pendingPhotos.length > 0 && (
                <span className="admin-file-count">
                  {pendingPhotos.length} foto{pendingPhotos.length !== 1 ? 's' : ''} seleccionada{pendingPhotos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {pendingPhotos.length > 0 && (
              <div className="admin-photo-preview">
                {pendingPhotos.map((p, i) => (
                  <div key={i} className="admin-preview-thumb">
                    <img src={p.previewUrl} alt={p.name} />
                    <button
                      type="button"
                      className="admin-preview-remove"
                      onClick={() => removePendingPhoto(i)}
                      aria-label="Quitar foto"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <div className="admin-error">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {formError}
            </div>
          )}

          <button type="submit" className="admin-submit-btn" disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Creando…</>
              : <><i className="fa-solid fa-plus" aria-hidden="true" /> Crear y publicar viaje</>}
          </button>
        </form>
      </section>

      {/* ── Lista de viajes ── */}
      <section className="admin-section">
        <h2 className="admin-section-title">
          Viajes publicados
          <span className="admin-count">{trips.length}</span>
        </h2>

        {tripsLoading ? (
          <p className="admin-empty-text muted">
            <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Cargando…
          </p>
        ) : trips.length === 0 ? (
          <p className="admin-empty-text muted">No hay viajes publicados todavía.</p>
        ) : (
          <div className="admin-trips-list">
            {trips.map(trip => (
              <div key={trip.id} className={`admin-trip-item${editingId === trip.id ? ' admin-trip-editing' : ''}`}>
                {editingId === trip.id ? (
                  <form className="admin-edit-form" onSubmit={handleSaveEdit}>
                    <div className="admin-edit-row">
                      <div className="admin-field">
                        <label>Nombre <span className="required">*</span></label>
                        <input
                          type="text"
                          value={editForm.nombre}
                          onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                          maxLength={80}
                          autoFocus
                        />
                      </div>
                      <div className="admin-field admin-field-date">
                        <label>Fecha <span className="required">*</span></label>
                        <input
                          type="date"
                          value={editForm.fecha}
                          onChange={e => setEditForm(f => ({ ...f, fecha: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="admin-field">
                      <label>Descripción <span className="optional">(opcional)</span></label>
                      <textarea
                        value={editForm.descripcion}
                        onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                        rows={2}
                        maxLength={400}
                      />
                    </div>
                    {editError && (
                      <div className="admin-error">
                        <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {editError}
                      </div>
                    )}
                    <div className="admin-edit-actions">
                      <button type="submit" className="admin-save-btn" disabled={editSaving}>
                        {editSaving
                          ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Guardando…</>
                          : <><i className="fa-solid fa-check" aria-hidden="true" /> Guardar</>}
                      </button>
                      <button type="button" className="admin-cancel-btn" onClick={cancelEdit} disabled={editSaving}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-trip-info">
                      <span className="admin-trip-nombre">{trip.nombre}</span>
                      <span className="admin-trip-meta muted">
                        <i className="fa-regular fa-calendar" aria-hidden="true" />
                        {formatFecha(trip.fecha)}
                        <span className="admin-trip-by"> · Creado por {trip.created_by}</span>
                      </span>
                      {trip.descripcion && (
                        <span className="admin-trip-desc muted">{trip.descripcion}</span>
                      )}
                    </div>
                    <div className="admin-trip-actions">
                      <button
                        className="admin-edit-btn"
                        onClick={() => startEdit(trip)}
                        aria-label={`Editar ${trip.nombre}`}
                        title="Editar viaje"
                      >
                        <i className="fa-solid fa-pen" aria-hidden="true" />
                      </button>
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(trip)}
                        aria-label={`Eliminar ${trip.nombre}`}
                        title="Eliminar viaje"
                      >
                        <i className="fa-solid fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
