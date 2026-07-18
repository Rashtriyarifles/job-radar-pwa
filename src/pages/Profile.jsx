import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronRight, Edit2 } from 'lucide-react'

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(profile?.full_name || '')
  const [role, setRole]       = useState(profile?.current_role || '')
  const [saving, setSaving]   = useState(false)
  const navigate              = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  async function handleSave() {
    setSaving(true)
    await updateProfile({ full_name: name, current_role: role })
    setSaving(false)
    setEditing(false)
  }

  const stats = [
    { label: 'Domains', value: profile?.domains?.length || 0 },
    { label: 'Locations', value: profile?.locations?.length || 0 },
  ]

  return (
    <div className="min-h-screen bg-radar-bg pb-24">
      <div className="bg-radar-dark text-white px-4 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <User size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">{profile?.full_name || 'Your Profile'}</h1>
              <p className="text-gray-400 text-sm">{profile?.current_role || 'Add your current role'}</p>
              <p className="text-gray-500 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="p-2 text-gray-400 hover:text-white">
            <Edit2 size={18} />
          </button>
        </div>

        <div className="flex gap-6 mt-5">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-gray-400 text-xs">{s.label}</div>
            </div>
          ))}
          <div>
            <div className={`text-xl font-bold ${profile?.onboarding_complete ? 'text-radar-green' : 'text-amber-400'}`}>
              {profile?.onboarding_complete ? '✓' : '!'}
            </div>
            <div className="text-gray-400 text-xs">Profile</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-2xl border border-radar-border p-4 space-y-3">
            <h2 className="font-semibold text-sm">Edit Profile</h2>
            <input value={name} onChange={e => setName(e.target.value)}
                   placeholder="Full name"
                   className="w-full px-3 py-2.5 border border-radar-border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
            <input value={role} onChange={e => setRole(e.target.value)}
                   placeholder="Current role"
                   className="w-full px-3 py-2.5 border border-radar-border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                      className="flex-1 bg-radar-dark text-white py-2.5 rounded-xl text-sm font-medium
                                 hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                      className="px-4 py-2.5 border border-radar-border rounded-xl text-sm text-radar-muted">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Domains */}
        {profile?.domains?.length > 0 && (
          <div className="bg-white rounded-2xl border border-radar-border p-4">
            <h2 className="font-semibold text-sm mb-3">Your Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profile.domains.map(d => (
                <span key={d} className="text-xs px-3 py-1.5 bg-radar-bg border border-radar-border rounded-full">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred locations */}
        {profile?.locations?.length > 0 && (
          <div className="bg-white rounded-2xl border border-radar-border p-4">
            <h2 className="font-semibold text-sm mb-3">Preferred Locations</h2>
            <div className="flex flex-wrap gap-2">
              {profile.locations.map(l => (
                <span key={l} className="text-xs px-3 py-1.5 bg-radar-bg border border-radar-border rounded-full">
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-radar-border divide-y divide-radar-border">
          <button onClick={() => navigate('/onboarding')}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm">
            <span>Update preferences</span>
            <ChevronRight size={16} className="text-radar-muted" />
          </button>
          <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3.5 text-sm text-red-600">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
