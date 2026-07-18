import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'finance', label: 'Finance & PE' },
  { value: 'mnc', label: 'MNC / Big Tech' },
  { value: 'startup', label: 'Startup' },
  { value: 'vc_fund', label: 'VC Fund' },
  { value: 'accelerator', label: 'Accelerator' },
]

const PAY_LEVELS = [
  { value: '', label: 'Any Pay' },
  { value: 'Very High', label: 'Very High' },
  { value: 'High', label: 'High' },
  { value: 'Mid-High', label: 'Mid-High' },
]

const LOCATIONS = [
  { value: '', label: 'All Cities' },
  { value: 'Delhi', label: 'Delhi/NCR' },
  { value: 'Bengaluru', label: 'Bengaluru' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Remote', label: 'Remote' },
]

export default function FilterBar({ filters, onChange }) {
  const [showFilters, setShowFilters] = useState(false)
  const hasActiveFilters = filters.category || filters.pay || filters.location

  return (
    <div className="space-y-3">
      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-muted" />
          <input
            type="text"
            placeholder="Search roles or companies..."
            value={filters.search || ''}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-radar-border
                       rounded-xl focus:outline-none focus:ring-2 focus:ring-radar-dark/20"
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search: '' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-radar-muted">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2.5 rounded-xl border text-sm flex items-center gap-1.5 transition-colors
                  ${showFilters || hasActiveFilters
                    ? 'bg-radar-dark text-white border-radar-dark'
                    : 'bg-white text-radar-muted border-radar-border hover:bg-gray-50'}`}>
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-radar-green" />}
        </button>
      </div>

      {/* Category pills — always visible */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat.value}
                  onClick={() => onChange({ ...filters, category: cat.value })}
                  className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
                    ${filters.category === cat.value
                      ? 'bg-radar-dark text-white border-radar-dark'
                      : 'bg-white text-radar-muted border-radar-border hover:bg-gray-50'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-radar-border rounded-2xl p-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-radar-muted mb-2 uppercase tracking-wide">Location</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(loc => (
                <button key={loc.value}
                        onClick={() => onChange({ ...filters, location: loc.value })}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                          ${filters.location === loc.value
                            ? 'bg-radar-dark text-white border-radar-dark'
                            : 'bg-radar-bg text-radar-muted border-radar-border hover:bg-gray-100'}`}>
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-radar-muted mb-2 uppercase tracking-wide">Pay Level</p>
            <div className="flex flex-wrap gap-2">
              {PAY_LEVELS.map(pay => (
                <button key={pay.value}
                        onClick={() => onChange({ ...filters, pay: pay.value })}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                          ${filters.pay === pay.value
                            ? 'bg-radar-dark text-white border-radar-dark'
                            : 'bg-radar-bg text-radar-muted border-radar-border hover:bg-gray-100'}`}>
                  {pay.label}
                </button>
              ))}
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={() => onChange({ search: filters.search || '' })}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
