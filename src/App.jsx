import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.jsx'
import BottomNav from './components/BottomNav.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Jobs from './pages/Jobs.jsx'
import Saved from './pages/Saved.jsx'
import Profile from './pages/Profile.jsx'
import Admin from './pages/Admin.jsx'
import Pending from './pages/Pending.jsx'

const ADMIN_EMAILS = [
  'abhijeetsingtomer@gmail.com',
  'abhijeet.tomar@monotype.com',
]

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-2 border-radar-dark border-t-transparent rounded-full animate-spin" />
      <p className="text-radar-muted text-sm">Loading Job Radar...</p>
    </div>
  )
}

function ProtectedRoute({ children, requireApproved = true }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />

  // Admin always has full access
  if (ADMIN_EMAILS.includes(user.email?.toLowerCase())) return children

  // For non-admins, check approval status
  if (requireApproved) {
    const status = profile?.status
    if (status === 'denied')  return <Pending denied />
    if (status !== 'approved') return <Pending />
  }

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

  if (loading) return <LoadingScreen />

  // Determine where to redirect after login
  function getHomeRoute() {
    if (!user) return '/'
    if (ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
      return profile?.onboarding_complete ? '/jobs' : '/onboarding'
    }
    const status = profile?.status
    if (status === 'denied')  return '/pending'
    if (status !== 'approved') return '/pending'
    return profile?.onboarding_complete ? '/jobs' : '/onboarding'
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={
        user ? <Navigate to={getHomeRoute()} replace /> : <Auth />
      } />

      {/* Pending/denied — auth required, no approval check */}
      <Route path="/pending" element={
        user ? (
          profile?.status === 'denied' ? <Pending denied /> : <Pending />
        ) : <Navigate to="/" replace />
      } />

      {/* Onboarding — auth required, no approval check */}
      <Route path="/onboarding" element={
        <ProtectedRoute requireApproved={false}>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* Main app — auth + approval required */}
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

      {/* Admin — auth required, handled internally */}
      <Route path="/admin" element={
        <ProtectedRoute requireApproved={false}>
          <AppLayout><Admin /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
