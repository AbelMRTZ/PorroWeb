import { supabase } from '../lib/supabase'

export async function loadTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('fecha', { ascending: false }) // 🚀 CAMBIO: false para mostrar lo más reciente primero
  if (error) throw error
  return data ?? []
}

export async function createTrip({ slug, nombre, fecha, descripcion, createdBy }) {
  const { data, error } = await supabase
    .from('trips')
    .insert({ slug, nombre, fecha, descripcion: descripcion || null, created_by: createdBy })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTrip(tripId, { nombre, fecha, descripcion }) {
  const { data, error } = await supabase
    .from('trips')
    .update({ nombre, fecha, descripcion: descripcion || null })
    .eq('id', tripId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTrip(tripId) {
  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('trip_id', tripId)

  if (photos?.length) {
    await supabase.storage.from('gallery').remove(photos.map(p => p.storage_path))
  }

  const { error } = await supabase.from('trips').delete().eq('id', tripId)
  if (error) throw error
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}