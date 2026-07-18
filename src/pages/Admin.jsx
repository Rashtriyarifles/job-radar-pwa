import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.jsx'
import { RefreshCw, Users, Briefcase, Activity, CheckCircle, XCircle } from 'lucide-react'

export default function Admin() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [triggerLog, setTriggerLog] = useState('')

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)
    const [{ count: jobCount }, { count: userCount }, { data: recentJobs }] = await Promise.all([
      supabase.from('jobs').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('jobs').select('company, category, first_seen').order('first_seen', { ascending: false }).limit(5),
    ])
    setStats({ jobCount, userCount, recentJobs })

    const { data: profiles } = await supabase.from('profiles')
      .select('full_name, email, current_role, onboarding_complete, created_at')
      .order('created_at', { ascending: false })
    setUsers(profiles || [])
    setLoading(false)
  }

  // Category breakdown
  const catBreakdown = stats?.recentJobs?.reduce((acc, j) => {
    acc[j.category] = (acc[j.category] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-radar-bg pb-24">
      <div className="bg-radar-dark text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin</h1>
            <p className="text-gray-400 text-sm">System overview & controls</p>
          </div>
          <button onClick={fetchStats} className="p-2 text-gray-400 hover:text-white">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Jobs', value: stats?.jobCount || 0, icon: Briefcase, color: 'text-blue-600' },
            { label: 'Users', value: stats?.userCount || 0, icon: Users, color: 'text-emerald-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-radar-border p-4">
              <Icon size={20} className={`${color} mb-2`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-radar-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Scraper status */}
        <div className="bg-white rounded-2xl border border-radar-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Activity size={16} className="text-radar-green" />
              Scraper Status
            </h2>
            <span className="text-xs text-radar-green font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-radar-green" />
              Active
            </span>
          </div>
          <div className="space-y-2 text-sm text-radar-muted">
            <div className="flex justify-between">
              <span>job_radar.py</span>
              <span className="text-radar-green flex items-center gap-1"><CheckCircle size={13}/> Running</span>
            </div>
            <div className="flex justify-between">
              <span>career_scraper.py</span>
              <span className="text-radar-green flex items-center gap-1"><CheckCircle size={13}/> Running</span>
            </div>
            <div className="flex justify-between">
              <span>Schedule</span>
              <span>8:00 AM + 6:00 PM IST</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-radar-border">
            <p className="text-xs text-radar-muted">
              To trigger a manual scan: go to GitHub Actions → Run workflow
            </p>
          </div>
        </div>

        {/* Recent jobs */}
        {stats?.recentJobs?.length > 0 && (
          <div className="bg-white rounded-2xl border border-radar-border p-4">
            <h2 className="font-semibold text-sm mb-3">Latest Jobs Added</h2>
            <div className="space-y-2">
              {stats.recentJobs.map((j, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{j.company}</span>
                  <span className="text-xs text-radar-muted capitalize">{j.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        <div className="bg-white rounded-2xl border border-radar-border p-4">
          <h2 className="font-semibold text-sm mb-3">Registered Users ({users.length})</h2>
          {users.length === 0 && <p className="text-radar-muted text-sm">No users yet</p>}
          <div className="space-y-3">
            {users.map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-radar-muted">{u.email}</p>
                  {u.current_role && <p className="text-xs text-radar-muted">{u.current_role}</p>}
                </div>
                <div className="text-right">
                  {u.onboarding_complete
                    ? <CheckCircle size={16} className="text-radar-green ml-auto" />
                    : <XCircle size={16} className="text-amber-500 ml-auto" />}
                  <p className="text-xs text-radar-muted mt-1">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
