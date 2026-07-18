import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.jsx'
import JobCard from '../components/JobCard'

export default function Saved() {
  const { user }          = useAuth()
  const [saved, setSaved] = useState([])
  const [tab, setTab]     = useState('saved')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase.from('saved_jobs')
      .select('status, jobs(*)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setSaved(data || [])
        setLoading(false)
      })
  }, [user])

  const filtered = saved.filter(s => s.status === tab)

  async function handleSave(jobId) {
    await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId)
    setSaved(prev => prev.filter(s => s.jobs.id !== jobId))
  }

  async function handleApply(jobId) {
    await supabase.from('saved_jobs').update({ status: 'applied' }).eq('user_id', user.id).eq('job_id', jobId)
    setSaved(prev => prev.map(s => s.jobs.id === jobId ? { ...s, status: 'applied' } : s))
  }

  return (
    <div className="min-h-screen bg-radar-bg pb-24">
      <div className="bg-radar-dark text-white px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Saved & Applied</h1>
        <p className="text-gray-400 text-sm mt-0.5">Track your job hunt progress</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-radar-border">
        {['saved', 'applied'].map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium capitalize transition-colors
                    ${tab === t ? 'text-radar-dark border-b-2 border-radar-dark' : 'text-radar-muted'}`}>
            {t} ({saved.filter(s => s.status === t).length})
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading && <p className="text-center text-radar-muted py-8">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Bookmark size={40} className="mx-auto text-radar-muted mb-3" />
            <p className="text-gray-900 font-semibold">
              {tab === 'saved' ? 'No saved jobs yet' : 'No applications yet'}
            </p>
            <p className="text-radar-muted text-sm mt-1">
              {tab === 'saved' ? 'Bookmark jobs from the feed' : 'Mark jobs as applied to track them'}
            </p>
          </div>
        )}
        {filtered.map(({ jobs: job, status }) => (
          <JobCard key={job.id} job={job} savedStatus={status}
                   onSave={handleSave} onApply={handleApply} />
        ))}
      </div>
    </div>
  )
}
