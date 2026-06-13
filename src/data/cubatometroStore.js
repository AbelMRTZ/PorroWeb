import { supabase } from '../lib/supabase'

export async function loadAllDrinks() {
  const { data, error } = await supabase
    .from('cubatometro_drinks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function loadUserDrinks(userId) {
  const { data, error } = await supabase
    .from('cubatometro_drinks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addDrink(userId, drinkType, points) {
  const { data, error } = await supabase
    .from('cubatometro_drinks')
    .insert({ user_id: userId, drink_type: drinkType, points })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDrink(id) {
  const { error } = await supabase
    .from('cubatometro_drinks')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export function subscribeToChanges(callback) {
  return supabase
    .channel('cubatometro_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cubatometro_drinks' }, callback)
    .subscribe()
}
