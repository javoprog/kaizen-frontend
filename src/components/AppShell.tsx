import { Button } from '@heroui/react'
import {
  BarChart3,
  BrainCircuit,
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Plus,
  Repeat2,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'
import { Brand } from './Brand'

const mainNav = [
  { to: '/', label: 'Today', icon: LayoutDashboard },
  { to: '/goals', label: 'Goals', icon: Compass },
  { to: '/habits', label: 'Habits', icon: Repeat2 },
  { to: '/coach', label: 'Coach', icon: BrainCircuit },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand />
          <Button
            variant="primary"
            fullWidth
            onPress={() => navigate('/goals/new')}
            className="new-goal-button"
          >
            <Plus size={17} /> New goal
          </Button>
          <nav className="nav-list" aria-label="Primary navigation">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                <ChevronRight className="nav-chevron" size={15} />
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="coming-next">
            <BarChart3 size={16} />
            <div>
              <strong>Next in Kaizen</strong>
              <span>Reviews · Analytics</span>
            </div>
          </div>
          <div className="profile-strip">
            <span className="profile-avatar">
              {(user?.displayName || user?.username || 'K').charAt(0).toUpperCase()}
            </span>
            <div className="profile-copy">
              <strong>{user?.displayName || user?.username}</strong>
              <span>Level {user?.level ?? 1}</span>
            </div>
            <Button
              isIconOnly
              variant="ghost"
              aria-label="Log out"
              onPress={() => void logout()}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>

      <header className="mobile-header">
        <Brand />
        <Button isIconOnly variant="ghost" aria-label="New goal" onPress={() => navigate('/goals/new')}>
          <Plus size={20} />
        </Button>
      </header>

      <main className="app-content" key={location.pathname}>
        <Outlet />
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
