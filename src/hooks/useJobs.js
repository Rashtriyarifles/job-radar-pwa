import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useJobs(filters = {}) {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [total, setTotal]     = useState(0)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('jobs').select('*', { count: 'exact' })

      if (filters.category)  query = query.eq('category', filters.category)
      if (filters.location)  query = query.ilike('location', `%${filters.location}%`)
      if (filters.pay)       query = query.eq('pay_level', filters.pay)
      if (filters.search)    query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
      if (filters.source)    query = query.eq('source', filters.source)

      query = query.order('first_seen', { ascending: false }).limit(filters.limit || 50)

      const { data, error: err, count } = await query
      if (err) throw err
      setJobs(data || [])
      setTotal(count || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  return { jobs, loading, error, total, refetch: fetchJobs }
}

export function useSavedJobs(userId) {
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    if (!userId) return
    supabase.from('saved_jobs').select('job_id, status').eq('user_id', userId)
      .then(({ data }) => {
        if (data) setSavedIds(new Map(data.map(s => [s.job_id, s.status])))
      })
  }, [userId])

  async function toggleSave(jobId) {
    const exists = savedIds.has(jobId)
    if (exists) {
      await supabase.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
      setSavedIds(prev => { const n = new Map(prev); n.delete(jobId); return n })
    } else {
      await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId, status: 'saved' })
      setSavedIds(prev => new Map(prev).set(jobId, 'saved'))
    }
  }

  async function markApplied(jobId) {
    await supabase.from('saved_jobs').upsert({ user_id: userId, job_id: jobId, status: 'applied' })
    setSavedIds(prev => new Map(prev).set(jobId, 'applied'))
  }

  return { savedIds, toggleSave, markApplied }
}
