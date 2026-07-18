import { ExternalLink, Bookmark, BookmarkCheck, CheckCircle, MapPin, Building2, Clock } from 'lucide-react'

const PAY_STYLES = {
  'Very High': 'bg-purple-50 text-purple-700',
  'High':      'bg-emerald-50 text-emerald-700',
  'Mid-High':  'bg-blue-50 text-blue-700',
  'Mid':       'bg-gray-100 text-gray-600',
}

const CAT_STYLES = {
  consulting:  'bg-amber-50 text-amber-700',
  finance:     'bg-blue-50 text-blue-700',
  mnc:         'bg-violet-50 text-violet-700',
  startup:     'bg-emerald-50 text-emerald-700',
  vc_fund:     'bg-rose-50 text-rose-700',
  accelerator: 'bg-orange-50 text-orange-700',
  staffing:    'bg-gray-100 text-gray-600',
  fmcg:        'bg-teal-50 text-teal-700',
}

const CAT_LABELS = {
  consulting: 'Consulting', finance: 'Finance & PE', mnc: 'MNC / Big Tech',
  startup: 'Startup', vc_fund: 'VC Fund', accelerator: 'Accelerator',
  staffing: 'Staffing', fmcg: 'FMCG',
}

const SOURCE_LABELS = {
  greenhouse: 'Greenhouse', lever: 'Lever', workday: 'Workday',
  career_page: 'Career Page', linkedin: 'LinkedIn', wellfound: 'Wellfound',
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function JobCard({ job, savedStatus, onSave, onApply, isNew }) {
  const isSaved   = savedStatus === 'saved'
  const isApplied = savedStatus === 'applied'

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md
      ${isNew ? 'border-l-4 border-l-radar-green border-radar-border' : 'border-radar-border'}
      ${isApplied ? 'opacity-75' : ''}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Company avatar */}
          <div className="w-10 h-10 rounded-xl bg-radar-bg border border-radar-border flex items-center
                          justify-content-center text-xs font-semibold text-radar-muted flex-shrink-0
                          flex items-center justify-center">
            {initials(job.company)}
          </div>

          {/* Job info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] text-gray-900 leading-snug truncate pr-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-radar-muted">
                <Building2 size={11} />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1 text-xs text-radar-muted">
                  <span>·</span>
                  <MapPin size={11} />
                  {job.location}
                </span>
              )}
              {job.posted_pretty && (
                <span className="flex items-center gap-1 text-xs text-radar-muted">
                  <span>·</span>
                  <Clock size={11} />
                  {job.posted_pretty}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.category && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CAT_STYLES[job.category] || 'bg-gray-100 text-gray-600'}`}>
                  {CAT_LABELS[job.category] || job.category}
                </span>
              )}
              {job.pay_level && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PAY_STYLES[job.pay_level] || 'bg-gray-100 text-gray-600'}`}>
                  {job.pay_level} Pay
                </span>
              )}
              {job.ats && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {SOURCE_LABELS[job.ats] || job.ats}
                </span>
              )}
              {job.is_iim && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  IIM Recruiter
                </span>
              )}
              {isNew && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  New
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-radar-border">
          <a href={job.url} target="_blank" rel="noopener noreferrer"
             className="flex-1 flex items-center justify-center gap-1.5 bg-radar-dark text-white
                        text-sm font-medium py-2 rounded-xl hover:opacity-90 transition-opacity">
            Apply <ExternalLink size={13} />
          </a>

          <button onClick={() => onSave(job.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isSaved ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'border-radar-border text-radar-muted hover:bg-gray-50'}`}>
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          {!isApplied ? (
            <button onClick={() => onApply(job.id)}
                    className="p-2 rounded-xl border border-radar-border text-radar-muted hover:bg-gray-50 transition-colors">
              <CheckCircle size={18} />
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <CheckCircle size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
