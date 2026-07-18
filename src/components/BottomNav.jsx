import { NavLink } from 'react-router-dom'
import { Radar, Bookmark, User, LayoutDashboard } from 'lucide-react'

const links = [
  { to: '/jobs',     icon: Radar,           label: 'Jobs' },
  { to: '/saved',    icon: Bookmark,        label: 'Saved' },
  { to: '/profile',  icon: User,            label: 'Profile' },
  { to: '/admin',    icon: LayoutDashboard, label: 'Admin' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-radar-border
                    safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
                   className={({ isActive }) =>
                     `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors
                      ${isActive ? 'text-radar-dark' : 'text-radar-muted hover:text-gray-600'}`}>
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-radar-dark' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
