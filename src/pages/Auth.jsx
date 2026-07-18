import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { Radar, Eye, EyeOff } from 'lucide-react'

export default function Auth() {
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { signIn, signUp }      = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/jobs')
      } else {
        await signUp(email, password, name)
        navigate('/onboarding')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-radar-bg flex flex-col">
      {/* Hero */}
      <div className="bg-radar-dark text-white px-6 pt-16 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <Radar size={28} className="text-radar-green" />
          <span className="text-lg font-semibold">India Job Radar</span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {mode === 'signin'
            ? 'Sign in to see your personalised job feed'
            : 'Join to access curated jobs from 200+ companies'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                     placeholder="Abhijeet Singh Tomar"
                     className="mt-1 w-full px-4 py-3 bg-white border border-radar-border rounded-xl
                                text-sm focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                   placeholder="you@gmail.com"
                   className="mt-1 w-full px-4 py-3 bg-white border border-radar-border rounded-xl
                              text-sm focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
          </div>

          <div>
            <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">Password</label>
            <div className="relative mt-1">
              <input type={showPw ? 'text' : 'password'} required value={password}
                     onChange={e => setPassword(e.target.value)}
                     placeholder="Min. 8 characters"
                     className="w-full px-4 py-3 bg-white border border-radar-border rounded-xl
                                text-sm focus:outline-none focus:ring-2 focus:ring-radar-dark/20 pr-11" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-radar-muted">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
                  className="w-full bg-radar-dark text-white py-3 rounded-xl font-semibold
                             text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-radar-muted">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
                    className="text-radar-dark font-semibold hover:underline">
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
