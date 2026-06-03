import { createContext, useContext, useState, useCallback } from 'react'
import { USERS, hashPassword, verifyPassword } from '../data/usersConfig'

const PASSWORDS_KEY = 'porro_passwords'
const SESSION_KEY   = 'porro_user'

const AuthContext = createContext(null)

function getStoredPasswords() {
  try { return JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}') }
  catch { return {} }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY)
      if (!s) return null
      const { id } = JSON.parse(s)
      return USERS.find(u => u.id === id) ?? null
    } catch { return null }
  })

  const hasPassword = useCallback((userId) => !!getStoredPasswords()[userId], [])

  const setupPassword = useCallback(async (userId, password) => {
    const hash = await hashPassword(password)
    const passwords = getStoredPasswords()
    passwords[userId] = hash
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords))
    const found = USERS.find(u => u.id === userId)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: found.id }))
    setUser(found)
    return { ok: true }
  }, [])

  const login = useCallback(async (userId, password) => {
    const hash = getStoredPasswords()[userId]
    if (!hash) return { ok: false, error: 'Este usuario no tiene contraseña configurada.' }
    if (!(await verifyPassword(password, hash)))
      return { ok: false, error: 'Contraseña incorrecta.' }
    const found = USERS.find(u => u.id === userId)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: found.id }))
    setUser(found)
    return { ok: true }
  }, [])

  const changePassword = useCallback(async (userId, currentPassword, newPassword) => {
    const hash = getStoredPasswords()[userId]
    if (!hash) return { ok: false, error: 'No tienes contraseña configurada.' }
    if (!(await verifyPassword(currentPassword, hash)))
      return { ok: false, error: 'La contraseña actual es incorrecta.' }
    const newHash = await hashPassword(newPassword)
    const passwords = getStoredPasswords()
    passwords[userId] = newHash
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, hasPassword, setupPassword, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
