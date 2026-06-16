import { supabase } from '../lib/supabase'

export async function loadSessions() {
  const { data, error } = await supabase
    .from('cuentas_sessions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createSession(nombre, createdBy) {
  const { data, error } = await supabase
    .from('cuentas_sessions')
    .insert({ nombre, created_by: createdBy })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSession(id) {
  const { error } = await supabase
    .from('cuentas_sessions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function loadItems(sessionId) {
  const { data, error } = await supabase
    .from('cuentas_items')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addItem(sessionId, userId, description, price) {
  const { data, error } = await supabase
    .from('cuentas_items')
    .insert({ session_id: sessionId, user_id: userId, description, price: parseFloat(price) })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateItem(id, price) {
  const { error } = await supabase
    .from('cuentas_items')
    .update({ price: parseFloat(price) })
    .eq('id', id)
  if (error) throw error
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from('cuentas_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function loadShared(sessionId) {
  const { data, error } = await supabase
    .from('cuentas_shared')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addShared(sessionId, description, price, participants, createdBy) {
  const { data, error } = await supabase
    .from('cuentas_shared')
    .insert({ session_id: sessionId, description, price: parseFloat(price), participants, created_by: createdBy })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteShared(id) {
  const { error } = await supabase
    .from('cuentas_shared')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export function subscribeToSession(sessionId, callback) {
  return supabase
    .channel(`cuentas_session_${sessionId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cuentas_items' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cuentas_shared' }, callback)
    .subscribe()
}

export function subscribeToSessions(callback) {
  return supabase
    .channel('cuentas_sessions_list')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cuentas_sessions' }, callback)
    .subscribe()
}
