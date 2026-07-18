import { useState } from 'react'
import { Radar, Bell, BellOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useJobs, useSavedJobs } from '../hooks/useJobs.jsx'
import JobCard from '../components/JobCard'
import FilterBar from '../components/FilterBar'

export default function Jobs() {
  const { user, profile }                  = useAuth()
  const [filters, setFilters]              = useState({})
  const [notifEnabled, setNotifEnabled]    = useState(false)
  const { jobs, loading, total }           = useJobs(filters)
  const { savedIds, toggleSave, markApplied } = useSavedJobs(user?.id)

  // Split new vs older (seen in last 24h = "new")
  const now     = Date.now()
  const newJobs = jobs.filter(j => now - new Date(j.first_seen).getTime() < 86400000)

  async function requestNotifications() {
    if (!('Notification' in window)) return alert('Notifications not supported')
    const permission = await Notification.requestPermission()
    setNotifEnabled(permission === 'granted')
    if (permission === 'granted') new Notification('Job Radar', {
      body: "You'll be notified when new jobs are posted",
      icon: '/pwa-192x192.png'
    })
  }

  return (
    <div className="min-h-screen bg-radar-bg pb-24">
      {/* Header */}
      <div className="bg-radar-dark text-white px-4 pt-12 pb-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radar size={20} className="text-radar-green" />
            <span className="font-semibold">Job Radar</span>
            {profile?.full_name && (
              <span className="text-gray-400 text-sm">
                · Hi {profile.full_name.split(' ')[0]}
              </span>
            )}
          </div>
          <button onClick={requestNotifications}
                  className={`p-2 rounded-xl transition-colors ${
                    notifEnabled ? 'text-radar-green' : 'text-gray-400 hover:text-white'}`}>
            {notifEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>
        </div>
        {/* Stats row */}
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-radar-green font-bold text-lg">{newJobs.length}</span>
            <span className="text-gray-400 ml-1">new today</span>
          </div>
          <div className="text-gray-600">·</div>
          <div>
            <span className="text-white font-bold text-lg">{total}</span>
            <span className="text-gray-400 ml-1">total</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-radar-border p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="flex gap-2 mt-2">
                      <div className="h-5 bg-gray-100 rounded-full w-20" />
                      <div className="h-5 bg-gray-100 rounded-full w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New jobs section */}
        {!loading && newJobs.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-radar-muted uppercase tracking-widest mb-3">
              ✦ New Today
            </h2>
            <div className="space-y-3">
              {newJobs.map(job => (
                <JobCard key={job.id} job={job} isNew
                         savedStatus={savedIds instanceof Map ? savedIds.get(job.id) : null}
                         onSave={toggleSave} onApply={markApplied} />
              ))}
            </div>
          </div>
        )}

        {/* All jobs */}
        {!loading && (
          <div>
            {newJobs.length > 0 && (
              <h2 className="text-xs font-semibold text-radar-muted uppercase tracking-widest mb-3 mt-4">
                All Openings
              </h2>
            )}
            <div className="space-y-3">
              {jobs.filter(j => !newJobs.find(n => n.id === j.id)).map(job => (
                <JobCard key={job.id} job={job}
                         savedStatus={savedIds instanceof Map ? savedIds.get(job.id) : null}
                         onSave={toggleSave} onApply={markApplied} />
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="text-center py-16">
                <Radar size={40} className="mx-auto text-radar-muted mb-3" />
                <p className="text-gray-900 font-semibold">No jobs found</p>
                <p className="text-radar-muted text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
