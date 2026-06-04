import { supabase } from '../lib/supabase'

export async function loadPhotosForTrip(tripSlug) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('trip_slug', tripSlug)
    .order('uploaded_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function uploadPhoto(tripId, tripSlug, file, userName) {
  const blob = await compressToBlob(file)
  const storagePath = `${tripSlug}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error: storageErr } = await supabase.storage
    .from('gallery')
    .upload(storagePath, blob, { contentType: 'image/jpeg' })
  if (storageErr) throw storageErr

  const { data, error } = await supabase
    .from('photos')
    .insert({
      trip_id: tripId,
      trip_slug: tripSlug,
      storage_path: storagePath,
      name: file.name,
      uploaded_by: userName,
    })
    .select()
    .single()
  if (error) {
    await supabase.storage.from('gallery').remove([storagePath])
    throw error
  }
  return data
}

export async function deletePhoto(photo) {
  await supabase.storage.from('gallery').remove([photo.storage_path])
  const { error } = await supabase.from('photos').delete().eq('id', photo.id)
  if (error) throw error
}

export function getPhotoUrl(storagePath) {
  return supabase.storage.from('gallery').getPublicUrl(storagePath).data.publicUrl
}

export function compressToBlob(file) {
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
        canvas.toBlob(resolve, 'image/jpeg', 0.82)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}
