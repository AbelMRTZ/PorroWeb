// src/context/AuthContext.jsx

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { USERS, loadUserAvatars } from '../data/usersConfig'
import { upsertGuest, loadMyPermissions } from '../data/guestPermissionsStore'
import { notifyGuestRegistered } from '../lib/notifyGuest'

const AuthContext = createContext(null)

function emailFor(userId) {
  return `${userId}@porro.app`
}

async function resolveUser(session) {
  if (!session) return null
  const meta = session.user.user_metadata ?? {}
  const userId = meta.user_id

  if (meta.role === 'guest') {
    return {
      id: userId,
      nombre: meta.nombre,
      role: 'guest',
      color: 'linear-gradient(135deg, #374151 0%, #6b7280 45%, #9ca3af 100%)',
    }
  }

  const baseUser = USERS.find(u => u.id === userId) ?? null
  
  if (baseUser) {
    const { data } = await supabase
      .from('user_registrations')
      .select('avatar_url')
      .eq('user_id', userId)
      .maybeSingle()
      
    if (data?.avatar_url) {
      return { ...baseUser, avatar_url: data.avatar_url }
    }
  }
  return baseUser
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
  const [avatarsMap, setAvatarsMap] = useState({})

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(await resolveUser(session))
      // 🚀 ARREGLO: Cargar avatares si hay sesión activa
      if (session) {
        loadUserAvatars().then(map => setAvatarsMap(map))
      }
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(await resolveUser(session))
      // 🚀 ARREGLO: Recargar los avatares cada vez que alguien inicie sesión
      if (session) {
        loadUserAvatars().then(map => setAvatarsMap(map))
      } else {
        setAvatarsMap({})
      }
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
      if (signUpErr.message?.toLowerCase().includes('already registered') || signUpErr.status === 400) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: emailFor(userId),
          password,
        })
        if (signInErr) return { ok: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' }
      } else {
        return { ok: false, error: signUpErr.message }
      }
    } else if (!data.session) {
      return {
        ok: false,
        error: 'Debes desactivar "Email Confirmations" en Supabase → Authentication → Settings antes de poder usar la app.',
      }
    }

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
  
  const updateLocalAvatar = useCallback((newUrl) => {
    setUser(prev => prev ? { ...prev, avatar_url: newUrl } : null)
    setAvatarsMap(prev => ({ ...prev, [user?.id]: newUrl }))
  }, [user])

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
      notifyGuestRegistered(nombre.trim()).catch(() => {})
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
      user, isAdmin, isGuest, authLoading, avatarsMap, guestPermissions,
      hasPassword, setupPassword, login, changePassword, logout, updateLocalAvatar, loginOrRegisterGuest
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