import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { USERS } from '../data/usersConfig'

const AuthContext = createContext(null)

function emailFor(userId) {
  return `${userId}@porro.app`
}

function resolveUser(session) {
  if (!session) return null
  const userId = session.user.user_metadata?.user_id
  return USERS.find(u => u.id === userId) ?? null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

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

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{
      user, isAdmin, authLoading,
      hasPassword, setupPassword, login, changePassword, logout,
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
