import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Home from './pages/Home'
import Porrolimpiadas from './pages/Porrolimpiadas'
import PremiosPorro from './pages/PremiosPorro'
import Fantasy from './pages/Fantasy'
import Galeria from './pages/Galeria'
import Admin from './pages/Admin'
import RequireAdmin from './components/RequireAdmin'

function App() {
  const { user, authLoading } = useAuth()

  if (authLoading) return null

  return (
    <div className="app">
      {user && <Navbar />}
      <main className={user ? 'main-content' : 'main-content-login'}>
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login />
          } />

          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/porrolimpiadas" element={<RequireAuth><Porrolimpiadas /></RequireAuth>} />
          <Route path="/premios-porro" element={<RequireAuth><PremiosPorro /></RequireAuth>} />
          <Route path="/fantasy" element={<RequireAuth><Fantasy /></RequireAuth>} />
          <Route path="/galeria" element={<RequireAuth><Galeria /></RequireAuth>} />
          <Route path="/galeria/:tripSlug" element={<RequireAuth><Galeria /></RequireAuth>} />

          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  )
}

export default App
