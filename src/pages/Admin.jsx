import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import {
  RefreshCw, Users, Briefcase, Activity,
  CheckCircle, XCircle, Clock, Lock, Check, X
} from 'lucide-react'

const ADMIN_EMAILS = [
  'abhijeetsinghtomer@gmail.com',
  'abhijeet.tomar@monotype.com',
]

export default function Admin() {
  const { user }              = useAuth()
  const navigate              = useNavigate()
  const [tab, setTab]         = useState('requests')
  const [stats, setStats]     = useState(null)
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(null)

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase())

  useEffect(() => {
    if (isAdmin) fetchData()
  }, [isAdmin])

  async function fetchData() {
    setLoading(true)
    const [
      { count: jobCount },
      { count: userCount },
      { data: recentJobs },
      { data: profiles }
    ] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('company, category, first_seen').order('first_seen', { ascending: false }).limit(5),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ])
    setStats({ jobCount, userCount, recentJobs })
    setUsers(profiles || [])
    setLoading(false)
  }

  async function updateStatus(userId, status) {
    setActioning(userId)
    const updates = {
      status,
      ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {})
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
    }
    setActioning(null)
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock size={28} className="text-radar-muted" />
        </div>
        <h2 className="text-lg font-bold">Admin Access Only</h2>
        <p className="text-radar-muted text-sm mt-2">This section is restricted to administrators.</p>
        <button onClick={() => navigate('/jobs')}
                className="mt-6 px-6 py-3 bg-radar-dark text-white rounded-xl text-sm font-medium">
          Back to Jobs
        </button>
      </div>
    )
  }

  const pending  = users.filter(u => u.status === 'pending')
  const approved = users.filter(u => u.status === 'approved')
  const denied   = users.filter(u => u.status === 'denied')

  function StatusBadge({ status }) {
    const map = {
      pending:  { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: Clock,        label: 'Pending' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, label: 'Approved' },
      denied:   { bg: 'bg-red-50',    text: 'text-red-700',    icon: XCircle,      label: 'Denied' },
    }
    const s = map[status] || map.pending
    const Icon = s.icon
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
        <Icon size={11} /> {s.label}
      </span>
    )
  }

  function UserRow({ u }) {
    const isPending = u.status === 'pending'
    return (
      <div className={`border rounded-xl p-3 ${isPending ? 'border-amber-200 bg-amber-50/30' : 'border-radar-border bg-white'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{u.full_name || 'No name'}</p>
            <p className="text-xs text-radar-muted truncate">{u.email}</p>
            {u.current_role && <p className="text-xs text-radar-muted">{u.current_role}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={u.status} />
              <span className="text-xs text-radar-muted">
                {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
              </span>
              {u.onboarding_complete && (
                <span className="text-xs text-emerald-600">· Profile complete</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            {u.status !== 'approved' && (
              <button
                onClick={() => updateStatus(u.id, 'approved')}
                disabled={actioning === u.id}
                className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center
                           hover:bg-emerald-600 transition-colors disabled:opacity-50">
                <Check size={15} />
              </button>
            )}
            {u.status !== 'denied' && (
              <button
                onClick={() => updateStatus(u.id, 'denied')}
                disabled={actioning === u.id}
                className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center
                           hover:bg-red-600 transition-colors disabled:opacity-50">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-radar-bg pb-24">
      {/* Header */}
      <div className="bg-radar-dark text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Console</h1>
            <p className="text-gray-400 text-sm">Manage users & monitor system</p>
          </div>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        {[
          { label: 'Jobs',     value: stats?.jobCount ?? '...', color: 'text-blue-600' },
          { label: 'Pending',  value: pending.length,           color: 'text-amber-600' },
          { label: 'Approved', value: approved.length,          color: 'text-emerald-600' },
          { label: 'Denied',   value: denied.length,            color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-radar-border p-2.5 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-radar-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-radar-border mx-4 rounded-xl overflow-hidden mb-4">
        {[
          { key: 'requests', label: `Requests (${pending.length})` },
          { key: 'users',    label: `All Users (${users.length})` },
          { key: 'system',   label: 'System' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors
                    ${tab === t.key
                      ? 'bg-radar-dark text-white'
                      : 'text-radar-muted hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">

        {/* Requests tab */}
        {tab === 'requests' && (
          <>
            {pending.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle size={32} className="mx-auto text-radar-green mb-3" />
                <p className="text-sm font-medium text-gray-900">All caught up!</p>
                <p className="text-xs text-radar-muted mt-1">No pending access requests</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-amber-600 font-medium">
                  {pending.length} user{pending.length > 1 ? 's' : ''} waiting for approval
                </p>
                {pending.map(u => <UserRow key={u.id} u={u} />)}
              </>
            )}
          </>
        )}

        {/* All users tab */}
        {tab === 'users' && (
          <>
            {users.length === 0
              ? <p className="text-center text-radar-muted py-8 text-sm">No users yet</p>
              : users.map(u => <UserRow key={u.id} u={u} />)
            }
          </>
        )}

        {/* System tab */}
        {tab === 'system' && (
          <>
            <div className="bg-white rounded-2xl border border-radar-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Activity size={16} className="text-radar-green" />
                  Scraper Status
                </h2>
                <span className="text-xs text-radar-green font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-radar-green inline-block" />
                  Active
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {['job_radar.py', 'career_scraper.py'].map(s => (
                  <div key={s} className="flex justify-between">
                    <span className="text-radar-muted">{s}</span>
                    <span className="text-radar-green flex items-center gap-1">
                      <CheckCircle size={13} /> Running
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-radar-muted">Schedule</span>
                  <span className="text-sm">8 AM + 6 PM IST</span>
                </div>
              </div>
            </div>

            {stats?.recentJobs?.length > 0 && (
              <div className="bg-white rounded-2xl border border-radar-border p-4">
                <h2 className="font-semibold text-sm mb-3">Latest Jobs Added</h2>
                <div className="space-y-2">
                  {stats.recentJobs.map((j, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium">{j.company}</span>
                      <span className="text-xs text-radar-muted capitalize">{j.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-radar-border p-4">
              <h2 className="font-semibold text-sm mb-2">Total Jobs in DB</h2>
              <p className="text-3xl font-bold text-radar-dark">{stats?.jobCount ?? '...'}</p>
              <p className="text-xs text-radar-muted mt-1">Across all companies and sources</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
