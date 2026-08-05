import { useAuth } from '../hooks/useAuth.jsx'
import { Clock, Mail, LogOut, UserX } from 'lucide-react'

export default function Pending({ denied, removed }) {
  const { user, signOut } = useAuth()

  const config = removed ? {
    iconBg: 'bg-gray-100',
    icon: <UserX size={36} className="text-gray-500" />,
    title: 'Account Removed',
    message: 'Your access to this platform has been removed. Please contact the admin if you think this is a mistake.',
    noteBg: null,
    noteText: null,
  } : denied ? {
    iconBg: 'bg-red-100',
    icon: <Mail size={36} className="text-red-500" />,
    title: 'Access Denied',
    message: 'Your access request was not approved. Please contact the admin if you think this is a mistake.',
    noteBg: null,
    noteText: null,
  } : {
    iconBg: 'bg-amber-100',
    icon: <Clock size={36} className="text-amber-500" />,
    title: 'Access Pending',
    message: "Your account is awaiting admin approval. You'll be notified once access is granted.",
    noteBg: 'bg-amber-50 border-amber-200',
    noteText: 'text-amber-700',
    noteContent: 'This is an invite-only platform. The admin will review your request shortly.',
  }

  return (
    <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center px-6 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${config.iconBg}`}>
        {config.icon}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">{config.title}</h1>

      <p className="text-radar-muted text-sm max-w-xs leading-relaxed">{config.message}</p>

      <div className="mt-8 bg-white border border-radar-border rounded-2xl p-4 w-full max-w-xs text-left">
        <p className="text-xs text-radar-muted uppercase tracking-wide font-medium mb-2">Signed in as</p>
        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
      </div>

      {config.noteBg && (
        <div className={`mt-4 border rounded-2xl p-4 w-full max-w-xs ${config.noteBg}`}>
          <p className={`text-xs leading-relaxed ${config.noteText}`}>{config.noteContent}</p>
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
