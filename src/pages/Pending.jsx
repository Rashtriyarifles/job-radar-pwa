import { useAuth } from '../hooks/useAuth.jsx'
import { Clock, Mail, LogOut } from 'lucide-react'

export default function Pending({ denied }) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center px-6 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
        ${denied ? 'bg-red-100' : 'bg-amber-100'}`}>
        {denied
          ? <Mail size={36} className="text-red-500" />
          : <Clock size={36} className="text-amber-500" />}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        {denied ? 'Access Denied' : 'Access Pending'}
      </h1>

      <p className="text-radar-muted text-sm max-w-xs leading-relaxed">
        {denied
          ? "Your access request was not approved. Please contact the admin if you think this is a mistake."
          : "Your account is awaiting admin approval. You'll be notified once access is granted."}
      </p>

      <div className="mt-8 bg-white border border-radar-border rounded-2xl p-4 w-full max-w-xs text-left">
        <p className="text-xs text-radar-muted uppercase tracking-wide font-medium mb-2">Signed in as</p>
        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
      </div>

      {!denied && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full max-w-xs">
          <p className="text-xs text-amber-700 leading-relaxed">
            This is an invite-only platform. The admin will review your request shortly.
          </p>
        </div>
      )}

      <button onClick={signOut}
              className="mt-8 flex items-center gap-2 text-sm text-radar-muted hover:text-gray-900 transition-colors">
        <LogOut size={15} />
        Sign out
      </button>
    </div>
  )
}
