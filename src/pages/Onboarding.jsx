import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const DOMAINS = [
  'Market Intelligence', 'Business Analytics', 'Strategy & Consulting',
  'Product Management', 'Financial Analysis', 'Data Science',
  'Growth & Marketing', 'Investment Analysis', 'Operations',
]
const LOCATIONS = ['Delhi/NCR', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Remote']
const EXPERIENCE = ['0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years']

const ADMIN_EMAILS = [
  'abhijeetsinghtomer@gmail.com',
  'abhijeet.monotype@gmail.com',
  'abhijeet.tomar@monotype.com',
]

export default function Onboarding() {
  const [step, setStep]               = useState(0)
  const [fullName, setFullName]         = useState('')
  const [currentRole, setCurrentRole] = useState('')
  const [experience, setExperience]   = useState('')
  const [domains, setDomains]         = useState([])
  const [locations, setLocations]     = useState([])
  const [linkedin, setLinkedin]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const { user, profile, updateProfile } = useAuth()
  const navigate                      = useNavigate()

  const isAdmin = ADMIN_EMAILS.includes(user?.email?.toLowerCase())
  const steps   = ['About You', 'Expertise', 'Preferences', 'Done']

  function toggleItem(list, setList, item) {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      await updateProfile({
        full_name:           fullName.trim() || null,
        current_role:        currentRole || null,
        experience_years:    experience  || null,
        domains:             domains.length  ? domains   : null,
        locations:           locations.length ? locations : null,
        linkedin_url:        linkedin || null,
        onboarding_complete: true,
      })
      // Admin goes straight to jobs; others go to pending
      if (isAdmin || profile?.status === 'approved') {
        navigate('/jobs')
      } else {
        navigate('/pending')
      }
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-radar-bg flex flex-col">
      <div className="bg-radar-dark px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${i < step ? 'bg-radar-green text-white'
                  : i === step ? 'bg-white text-radar-dark'
                  : 'bg-white/20 text-white/50'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 ${i < step ? 'bg-radar-green' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
        <h1 className="text-white text-xl font-bold">{steps[step]}</h1>
        <p className="text-gray-400 text-sm mt-1">Step {step + 1} of {steps.length}</p>
      </div>

      <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                     placeholder="e.g. Rahul Kumar"
                     className="mt-1 w-full px-4 py-3 bg-white border border-radar-border rounded-xl
                                text-sm focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">Current Role</label>
              <input type="text" value={currentRole} onChange={e => setCurrentRole(e.target.value)}
                     placeholder="e.g. Business Analyst, MBA Student"
                     className="mt-1 w-full px-4 py-3 bg-white border border-radar-border rounded-xl
                                text-sm focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">Experience</label>
              <div className="mt-2 space-y-2">
                {EXPERIENCE.map(exp => (
                  <button key={exp} onClick={() => setExperience(exp)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors
                            ${experience === exp
                              ? 'bg-radar-dark text-white border-radar-dark'
                              : 'bg-white border-radar-border text-gray-700 hover:bg-gray-50'}`}>
                    {exp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm text-radar-muted mb-4">Select your areas of expertise</p>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(d => (
                <button key={d} onClick={() => toggleItem(domains, setDomains, d)}
                        className={`text-sm px-3 py-2 rounded-xl border transition-colors
                          ${domains.includes(d)
                            ? 'bg-radar-dark text-white border-radar-dark'
                            : 'bg-white border-radar-border text-gray-700 hover:bg-gray-50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-medium text-radar-muted uppercase tracking-wide mb-2">Preferred Locations</p>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => (
                  <button key={loc} onClick={() => toggleItem(locations, setLocations, loc)}
                          className={`text-sm px-3 py-2 rounded-xl border transition-colors
                            ${locations.includes(loc)
                              ? 'bg-radar-dark text-white border-radar-dark'
                              : 'bg-white border-radar-border text-gray-700 hover:bg-gray-50'}`}>
                    {loc}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-radar-muted uppercase tracking-wide">LinkedIn (optional)</label>
              <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)}
                     placeholder="https://linkedin.com/in/yourname"
                     className="mt-1 w-full px-4 py-3 bg-white border border-radar-border rounded-xl
                                text-sm focus:outline-none focus:ring-2 focus:ring-radar-dark/20" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-radar-green rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Profile complete!</h2>
            <p className="text-radar-muted text-sm mt-2">
              {isAdmin || profile?.status === 'approved'
                ? "You'll now see jobs matched to your preferences."
                : "Your profile is ready. Waiting for admin approval to access jobs."}
            </p>
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-8 flex gap-3 max-w-sm mx-auto w-full">
        {step > 0 && step < 3 && (
          <button onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl border border-radar-border
                             text-sm text-radar-muted hover:bg-gray-50">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < 2 && (
          <button
            onClick={() => {
              if (step === 0 && !fullName.trim()) {
                alert('Please enter your full name to continue.')
                return
              }
              setStep(step + 1)
            }}
            className="flex-1 flex items-center justify-center gap-1 bg-radar-dark text-white
                       py-3 rounded-xl font-semibold text-sm hover:opacity-90">
            Continue <ChevronRight size={16} />
          </button>
        )}
        {step === 2 && (
          <button onClick={() => setStep(3)}
                  className="flex-1 bg-radar-dark text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90">
            Finish Profile
          </button>
        )}
        {step === 3 && (
          <button onClick={finish} disabled={saving}
                  className="flex-1 bg-radar-green text-white py-3 rounded-xl font-semibold
                             text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving...' : isAdmin || profile?.status === 'approved' ? 'View My Jobs →' : 'Submit Request →'}
          </button>
        )}
      </div>
    </div>
  )
}
