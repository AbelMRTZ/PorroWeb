import { supabase } from '../lib/supabase'

export async function loadDisponibilidades(year) {
  const { data, error } = await supabase
    .from('calendario_disponibilidad')
    .select('*')
    .gte('fecha', `${year}-01-01`)
    .lte('fecha', `${year}-12-31`)

  if (error || !data) return {}

  const result = {}
  for (const row of data) {
    if (!result[row.user_id]) result[row.user_id] = {}
    result[row.user_id][row.fecha] = { manana: row.manana, tarde: row.tarde }
  }
  return result
}

export async function saveDisponibilidad(userId, fecha, manana, tarde) {
  const { error } = await supabase
    .from('calendario_disponibilidad')
    .upsert(
      { user_id: userId, fecha, manana: manana ?? null, tarde: tarde ?? null },
      { onConflict: 'user_id,fecha' }
    )
  if (error) throw error
}

export async function loadEventos(year) {
  const { data, error } = await supabase
    .from('calendario_eventos')
    .select('*')
    .lte('fecha_inicio', `${year}-12-31`)
    .gte('fecha_fin', `${year}-01-01`)
    .order('fecha_inicio', { ascending: true })

  if (error || !data) return []
  return data
}

export async function saveEvento({ userId, titulo, descripcion, fechaInicio, fechaFin, color }) {
  const { data, error } = await supabase
    .from('calendario_eventos')
    .insert({
      user_id: userId,
      titulo,
      descripcion: descripcion || null,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      color: color || '#7c3aed',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEvento(id) {
  const { error } = await supabase
    .from('calendario_eventos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
