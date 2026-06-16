import { supabase } from '../lib/supabase'

export async function upsertGuest(guestId, guestName) {
  const { error } = await supabase
    .from('guest_permissions')
    .upsert(
      { guest_id: guestId, guest_name: guestName },
      { onConflict: 'guest_id', ignoreDuplicates: true }
    )
  if (error) throw error
}

export async function loadMyPermissions(guestId) {
  const { data, error } = await supabase
    .from('guest_permissions')
    .select('*')
    .eq('guest_id', guestId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function loadAllGuests() {
  const { data, error } = await supabase
    .from('guest_permissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function setGuestPermission(guestId, field, value) {
  const { error } = await supabase
    .from('guest_permissions')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('guest_id', guestId)
  if (error) throw error
}
