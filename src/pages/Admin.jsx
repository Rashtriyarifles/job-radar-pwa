import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import {
  RefreshCw, Users, Briefcase, Activity,
  CheckCircle, XCircle, Clock, Lock, Check, X,
  Search, UserX, UserCheck, Shield, FlaskConical,
  ChevronDown, ChevronUp, Trash2, RotateCcw, Eye
} from 'lucide-react'

const ADMIN_EMAILS = [
  'abhijeetsinghtomer@gmail.com',
  'abhijeet.monotype@gmail.com',
  'abhijeet.tomar@monotype.com',
]

// Feature flags available for testing control
const FEATURE_FLAGS = [
  { key: 'job_detail_panel',    label: 'Job Detail Panel',     desc: 'Split-pane job detail view' },
  { key: 'push_notifications',  label: 'Push Notifications',   desc: 'Web Push alerts for new jobs' },
  { key: 'company_logos',       label: 'Company Logos',        desc: 'Clearbit/Logo.dev logos on cards' },
  { key: 'countdown_timer',     label: 'Countdown Timer',      desc: 'Next scan timer on jobs page' },
  { key: 'source_tabs',         label: 'Source Tabs',          desc: 'Company / Portal / LinkedIn tabs' },
  { key: 'application_tracker', label: 'App Tracker',          desc: 'FastAPI application status tracker' },
]

export default function Admin() {
  const { user }                  = useAuth()
  const navigate                  = useNavigate()
  const [tab, setTab]             = useState('requests')
  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [actioning, setActioning] = useState(null)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedUser, setExpandedUser] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

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
      ...(status === 'approved' ? { approved_at: new Date().toISOString() } : {}),
      ...(status === 'removed'  ? { removed_at:  new Date().toISOString() } : {}),
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
    }
    setActioning(null)
    setConfirmRemove(null)
  }

  async function toggleFeatureFlag(userId, flagKey, currentFlags) {
    setActioning(userId + flagKey)
    const flags = currentFlags || {}
    const updated = { ...flags, [flagKey]: !flags[flagKey] }
    const { error } = await supabase
      .from('profiles')
      .update({ feature_flags: updated })
      .eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, feature_flags: updated } : u
      ))
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
  const removed  = users.filter(u => u.status === 'removed')

  // Filtered user list for Users tab
  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.current_role?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchStatus
  })

  function StatusBadge({ status }) {
    const map = {
      pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: Clock,        label: 'Pending' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle,  label: 'Approved' },
      denied:   { bg: 'bg-red-50',     text: 'text-red-700',     icon: XCircle,      label: 'Denied' },
      removed:  { bg: 'bg-gray-100',   text: 'text-gray-500',    icon: UserX,        label: 'Removed' },
    }
    const s = map[status] || map.pending
    const Icon = s.icon
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
        <Icon size={11} /> {s.label}
      </span>
    )
  }

  function RoleBadge({ email }) {
    const isAdminUser = ADMIN_EMAILS.includes(email?.toLowerCase())
    if (!isAdminUser) return null
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
        <Shield size={11} /> Admin
      </span>
    )
  }

  // Full user row — used in Users tab with expand/collapse for feature flags
  function FullUserRow({ u }) {
    const isExpanded = expandedUser === u.id
    const isRemoved  = u.status === 'removed'
    const flags      = u.feature_flags || {}
    const flagCount  = FEATURE_FLAGS.filter(f => flags[f.key]).length

    return (
      <div className={`border rounded-xl overflow-hidden transition-all
        ${isRemoved
          ? 'border-gray-200 bg-gray-50 opacity-70'
          : 'border-radar-border bg-white'}`}>

        {/* Main row */}
        <div className="p-3">
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
              ${isRemoved ? 'bg-gray-200 text-gray-400' : 'bg-radar-dark text-white'}`}>
              {(u.full_name || u.email || '?')[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold truncate">{u.full_name || 'No name'}</p>
                <RoleBadge email={u.email} />
              </div>
              <p className="text-xs text-radar-muted truncate">{u.email}</p>
              {u.current_role && (
                <p className="text-xs text-radar-muted truncate">{u.current_role}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge status={u.status} />
                <span className="text-xs text-radar-muted">
                  Joined {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </span>
                {flagCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    <FlaskConical size={10} /> {flagCount} flag{flagCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Approve / Restore */}
              {(u.status === 'denied' || u.status === 'removed' || u.status === 'pending') && (
                <button
                  onClick={() => updateStatus(u.id, 'approved')}
                  disabled={actioning === u.id}
                  title="Approve / Restore"
                  className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center
                             hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  {u.status === 'removed' ? <RotateCcw size={13} /> : <Check size={15} />}
                </button>
              )}

              {/* Deny */}
              {u.status === 'pending' && (
                <button
                  onClick={() => updateStatus(u.id, 'denied')}
                  disabled={actioning === u.id}
                  title="Deny"
                  className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center
                             hover:bg-red-600 transition-colors disabled:opacity-50">
                  <X size={15} />
                </button>
              )}

              {/* Remove (approved users) */}
              {u.status === 'approved' && !ADMIN_EMAILS.includes(u.email?.toLowerCase()) && (
                <button
                  onClick={() => setConfirmRemove(u.id)}
                  disabled={actioning === u.id}
                  title="Remove user"
                  className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center
                             hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50">
                  <UserX size={14} />
                </button>
              )}

              {/* Expand toggle */}
              <button
                onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                className="w-8 h-8 rounded-lg bg-radar-bg border border-radar-border text-radar-muted
                           flex items-center justify-center hover:bg-gray-100 transition-colors">
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Remove confirmation */}
        {confirmRemove === u.id && (
          <div className="mx-3 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs font-medium text-red-700 mb-2">
              Remove <strong>{u.full_name || u.email}</strong>? They won't be able to log in.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(u.id, 'removed')}
                disabled={actioning === u.id}
                className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium
                           hover:bg-red-700 disabled:opacity-50">
                {actioning === u.id ? 'Removing...' : 'Yes, remove'}
              </button>
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expanded: profile details + feature flags */}
        {isExpanded && (
          <div className="border-t border-radar-border bg-gray-50/50 px-3 py-3 space-y-3">

            {/* Profile details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {u.domains?.length > 0 && (
                <div>
                  <p className="text-radar-muted mb-1 font-medium">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {u.domains.map(d => (
                      <span key={d} className="px-2 py-0.5 bg-white border border-radar-border rounded-full text-[10px]">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {u.locations?.length > 0 && (
                <div>
                  <p className="text-radar-muted mb-1 font-medium">Locations</p>
                  <div className="flex flex-wrap gap-1">
                    {u.locations.map(l => (
                      <span key={l} className="px-2 py-0.5 bg-white border border-radar-border rounded-full text-[10px]">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Feature flags */}
            {!isRemoved && (
              <div>
                <p className="text-xs font-semibold text-radar-muted mb-2 flex items-center gap-1.5">
                  <FlaskConical size={12} /> Feature Access
                </p>
                <div className="space-y-1.5">
                  {FEATURE_FLAGS.map(flag => {
                    const enabled = !!flags[flag.key]
                    const isToggling = actioning === u.id + flag.key
                    return (
                      <div key={flag.key}
                           className="flex items-center justify-between bg-white border border-radar-border
                                      rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-medium">{flag.label}</p>
                          <p className="text-[10px] text-radar-muted">{flag.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleFeatureFlag(u.id, flag.key, flags)}
                          disabled={isToggling}
                          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0
                            ${enabled ? 'bg-radar-green' : 'bg-gray-200'}
                            ${isToggling ? 'opacity-50' : ''}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm
                            transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Compact row — used in Requests tab
  function RequestRow({ u }) {
    return (
      <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{u.full_name || 'No name'}</p>
            <p className="text-xs text-radar-muted truncate">{u.email}</p>
            {u.current_role && <p className="text-xs text-radar-muted">{u.current_role}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={u.status} />
              <span className="text-xs text-radar-muted">
                {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </span>
              {u.onboarding_complete && (
                <span className="text-xs text-emerald-600">· Profile complete</span>
              )}
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => updateStatus(u.id, 'approved')}
              disabled={actioning === u.id}
              className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center
                         hover:bg-emerald-600 transition-colors disabled:opacity-50">
              <Check size={15} />
            </button>
            <button
              onClick={() => updateStatus(u.id, 'denied')}
              disabled={actioning === u.id}
              className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center
                         hover:bg-red-600 transition-colors disabled:opacity-50">
              <X size={15} />
            </button>
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
            <p className="text-gray-400 text-sm">Manage users · control access · feature flags</p>
          </div>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-2 px-4 py-3">
        {[
          { label: 'Jobs',     value: stats?.jobCount ?? '…', color: 'text-blue-600' },
          { label: 'Pending',  value: pending.length,          color: 'text-amber-600' },
          { label: 'Active',   value: approved.length,         color: 'text-emerald-600' },
          { label: 'Denied',   value: denied.length,           color: 'text-red-500' },
          { label: 'Removed',  value: removed.length,          color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-radar-border p-2 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-radar-muted leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-radar-border mx-4 rounded-xl overflow-hidden mb-4">
        {[
          { key: 'requests', label: `Requests${pending.length ? ` (${pending.length})` : ''}` },
          { key: 'users',    label: `Users (${users.length})` },
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

        {/* ── REQUESTS TAB ── */}
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
                {pending.map(u => <RequestRow key={u.id} u={u} />)}
              </>
            )}
          </>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <>
            {/* Search + filter bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, role…"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-radar-border rounded-xl
                             bg-white focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-radar-border rounded-xl px-3 py-2 bg-white
                           focus:outline-none focus:ring-2 focus:ring-radar-dark/20 text-radar-muted">
                <option value="all">All</option>
                <option value="approved">Active</option>
                <option value="pending">Pending</option>
                <option value="denied">Denied</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 text-[10px] text-radar-muted">
              <span className="flex items-center gap-1"><UserCheck size={10} className="text-emerald-600" /> Approve/Restore</span>
              <span className="flex items-center gap-1"><UserX size={10} className="text-gray-400" /> Remove user</span>
              <span className="flex items-center gap-1"><FlaskConical size={10} className="text-blue-600" /> Feature flags via expand ↓</span>
            </div>

            {/* User list */}
            {filteredUsers.length === 0 ? (
              <p className="text-center text-radar-muted py-8 text-sm">
                {search || statusFilter !== 'all' ? 'No users match your filter' : 'No users yet'}
              </p>
            ) : (
              filteredUsers.map(u => <FullUserRow key={u.id} u={u} />)
            )}
          </>
        )}

        {/* ── SYSTEM TAB ── */}
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
                {[
                  { name: 'job_radar.py',       schedule: '6AM · 10AM · 4PM · 12AM' },
                  { name: 'career_scraper.py',  schedule: '5:30AM · 9:30AM · 3:30PM · 11:30PM' },
                  { name: 'beacon/scraper.py',  schedule: '8:30AM · 5:30PM · 11:30PM' },
                ].map(s => (
                  <div key={s.name} className="flex justify-between items-center">
                    <span className="text-radar-muted font-mono text-xs">{s.name}</span>
                    <span className="text-xs text-radar-muted">{s.schedule}</span>
                  </div>
                ))}
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
              <p className="text-3xl font-bold text-radar-dark">{stats?.jobCount ?? '…'}</p>
              <p className="text-xs text-radar-muted mt-1">Across all companies and sources</p>
            </div>

            {/* User breakdown */}
            <div className="bg-white rounded-2xl border border-radar-border p-4">
              <h2 className="font-semibold text-sm mb-3">User Breakdown</h2>
              <div className="space-y-2">
                {[
                  { label: 'Active users',   count: approved.length, color: 'bg-emerald-500' },
                  { label: 'Pending approval', count: pending.length, color: 'bg-amber-500' },
                  { label: 'Denied',         count: denied.length,   color: 'bg-red-400' },
                  { label: 'Removed',        count: removed.length,  color: 'bg-gray-300' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.color}`} />
                    <span className="text-xs text-radar-muted flex-1">{r.label}</span>
                    <span className="text-sm font-semibold">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
