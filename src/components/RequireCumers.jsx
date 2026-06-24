import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireCumers({ children }) {
  const { user, isCumer } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isCumer) return <Navigate to="/" replace />
  return children
}
