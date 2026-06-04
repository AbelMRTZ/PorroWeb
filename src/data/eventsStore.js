import { supabase } from '../lib/supabase'

export async function loadEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('orden', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createEvent({ nombre, fecha, dim }) {
  const { data: existing } = await supabase
    .from('events')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
  const nextOrden = (existing?.[0]?.orden ?? -1) + 1

  const { data, error } = await supabase
    .from('events')
    .insert({ nombre, fecha: fecha.trim(), dim: !!dim, orden: nextOrden })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEventsOrder(events) {
  await Promise.all(
    events.map((e, i) => supabase.from('events').update({ orden: i }).eq('id', e.id))
  )
}

export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}
