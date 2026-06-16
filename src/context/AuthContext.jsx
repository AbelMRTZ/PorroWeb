import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { USERS } from '../data/usersConfig'
import { upsertGuest, loadMyPermissions } from '../data/guestPermissionsStore'

const AuthContext = createContext(null)

function emailFor(userId) {
  return `${userId}@porro.app`
}

function resolveUser(session) {
  if (!session) return null
  const meta = session.user.user_metadata ?? {}
  if (meta.role === 'guest') {
    return {
      id: meta.user_id,
      nombre: meta.nombre,
      role: 'guest',
      color: 'linear-gradient(135deg, #374151 0%, #6b7280 45%, #9ca3af 100%)',
    }
  }
  return USERS.find(u => u.id === meta.user_id) ?? null
}

function guestEmail(nombre) {
  const slug = nombre.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 24)
  return `guest_${slug}@porro.app`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [guestPermissions, setGuestPermissions] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(resolveUser(session))
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(resolveUser(session))
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = user?.role === 'admin'
  const isGuest = user?.role === 'guest'

  useEffect(() => {
    if (!user || user.role !== 'guest') {
      setGuestPermissions(null)
      return
    }
    loadMyPermissions(user.id)
      .then(perms => setGuestPermissions(perms ?? {}))
      .catch(() => setGuestPermissions({}))
  }, [user?.id])

  const hasPassword = useCallback(async (userId) => {
    const { data } = await supabase
      .from('user_registrations')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    return !!data
  }, [])

  const setupPassword = useCallback(async (userId, password) => {
    const userDef = USERS.find(u => u.id === userId)
    if (!userDef) return { ok: false, error: 'Usuario no encontrado.' }

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: emailFor(userId),
      password,
      options: {
        data: {
          user_id: userId,
          nombre: userDef.nombre,
          role: userDef.role ?? null,
        },
      },
    })

    if (signUpErr) {
      // "User already registered" → try signing in
      if (signUpErr.message?.toLowerCase().includes('already registered') || signUpErr.status === 400) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: emailFor(userId),
          password,
        })
        if (signInErr) return { ok: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' }
      } else {
        // Any other signup error (e.g. password too short) — surface it directly
        return { ok: false, error: signUpErr.message }
      }
    } else if (!data.session) {
      // signUp succeeded but no session: email confirmations are still ON in Supabase.
      // Delete the unconfirmed user so the next attempt works cleanly.
      return {
        ok: false,
        error: 'Debes desactivar "Email Confirmations" en Supabase → Authentication → Settings antes de poder usar la app.',
      }
    }

    // Upsert so a missing registration row is always recovered
    await supabase.from('user_registrations').upsert({ user_id: userId })
    return { ok: true }
  }, [])

  const login = useCallback(async (userId, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailFor(userId),
      password,
    })
    if (error) return { ok: false, error: 'Contraseña incorrecta.' }
    return { ok: true }
  }, [])

  const changePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }, [])

  const loginOrRegisterGuest = useCallback(async (nombre, password, isNew) => {
    const email = guestEmail(nombre)
    const guestId = email.replace('@porro.app', '')
    const meta = { user_id: guestId, nombre: nombre.trim(), role: 'guest' }

    if (isNew) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: meta } })
      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return { ok: false, error: 'Ese nombre de invitado ya tiene cuenta. Desmarca "Primera vez" e introduce tu contraseña.' }
        }
        return { ok: false, error: error.message }
      }
      if (!data.session) return { ok: false, error: 'No se pudo crear la sesión. Desactiva "Email Confirmations" en Supabase.' }
      await upsertGuest(guestId, nombre.trim()).catch(() => {})
      return { ok: true }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { ok: false, error: 'Nombre o contraseña incorrectos. Si eres nuevo, marca "Primera vez".' }
      await upsertGuest(guestId, nombre.trim()).catch(() => {})
      return { ok: true }
    }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{
      user, isAdmin, isGuest, authLoading,
      guestPermissions,
      hasPassword, setupPassword, login, changePassword, logout,
      loginOrRegisterGuest,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
