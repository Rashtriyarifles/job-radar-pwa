import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'
import BottomNav from './components/BottomNav'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Jobs from './pages/Jobs'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-radar-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-radar-dark border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-radar-dark border-t-transparent rounded-full animate-spin" />
      <p className="text-radar-muted text-sm">Loading Job Radar...</p>
    </div>
  )

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={
        user
          ? <Navigate to={profile?.onboarding_complete ? '/jobs' : '/onboarding'} replace />
          : <Auth />
      } />

      {/* Onboarding — auth required but no onboarding check */}
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />

      {/* Main app — auth + bottom nav */}
      <Route path="/jobs" element={
        <ProtectedRoute>
          <AppLayout><Jobs /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/saved" element={
        <ProtectedRoute>
          <AppLayout><Saved /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><Profile /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AppLayout><Admin /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
