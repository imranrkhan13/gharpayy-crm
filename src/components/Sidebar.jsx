import { useColors, useTheme } from '../context/ThemeContext'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard, Users, GitBranch, Calendar, MessageSquare, BookOpen,
  BarChart2, Clock, UserCheck, Building2, BedDouble, Map, TrendingUp,
  Target, Settings, Moon, Sun, ChevronLeft, ChevronRight, Home
} from 'lucide-react'

const NAV = [
  {
    group: 'Sales Pipeline',
    items: [
      { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { id: 'leads', label: 'All Leads', Icon: Users },
      { id: 'pipeline', label: 'Pipeline', Icon: GitBranch },
      { id: 'visits', label: 'Visits', Icon: Calendar },
      { id: 'messages', label: 'Messages', Icon: MessageSquare },
      { id: 'bookings', label: 'Bookings', Icon: BookOpen },
      { id: 'analytics', label: 'Analytics', Icon: BarChart2 },
      { id: 'historical', label: 'Historical', Icon: Clock },
    ],
  },
  {
    group: 'Inventory',
    items: [
      { id: 'owners', label: 'Owners', Icon: UserCheck },
      { id: 'properties', label: 'Properties', Icon: Building2 },
      { id: 'inventory', label: 'Rooms & Beds', Icon: BedDouble },
      { id: 'availability', label: 'Availability', Icon: Map },
      { id: 'effort', label: 'Effort Tracker', Icon: TrendingUp },
      { id: 'matching', label: 'Lead Matching', Icon: Target },
    ],
  },
]

export default function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const C = useColors()
  const { theme, toggle } = useTheme()
  const { stats } = useApp()

  const isLight = theme === 'light'
  const sidebarBg = isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(10, 10, 12, 0.65)'
  const accent = '#6366f1'
  const hoverBg = isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)'

  const BADGES = {
    leads: stats.newLeads > 0 ? stats.newLeads : null,
    visits: stats.scheduledVisits > 0 ? stats.scheduledVisits : null,
  }

  return (
    <aside style={{
      width: collapsed ? 64 : 220,
      margin: '16px 8px 16px 16px',
      height: 'calc(100vh - 32px)',
      background: sidebarBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      border: `1px solid ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'}`,
      boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.03)' : '0 10px 40px rgba(0,0,0,0.2)',
      flexShrink: 0,
      position: 'relative'
    }}>

      {/* Ghost Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', right: -12, top: 40,
          width: 24, height: 24, borderRadius: '50%',
          background: isLight ? '#fff' : '#1a1a1c',
          color: accent, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${isLight ? '#eee' : '#333'}`,
          zIndex: 60
        }}
      >
        {collapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
      </button>

      {/* Header */}
      <div style={{ padding: '24px 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '10px',
          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: `0 4px 12px ${accent}44`
        }}>
          <Home size={16} color="#fff" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.text, letterSpacing: '-0.02em' }}>Gharpayy</div>
          </div>
        )}
      </div>

      {/* Nav Content - Full List Restored */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }} className="no-scroll">
        {NAV.map((sec) => (
          <div key={sec.group} style={{ marginBottom: 16 }}>
            {!collapsed && (
              <div style={{
                fontSize: '9px', fontWeight: 800, color: C.text3,
                opacity: 0.4, padding: '0 12px 6px', textTransform: 'uppercase', letterSpacing: '0.1em'
              }}>
                {sec.group}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sec.items.map(item => {
                const active = page === item.id
                const badge = BADGES[item.id]
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '8px 12px', borderRadius: '12px', border: 'none',
                      cursor: 'pointer', width: '100%',
                      background: active ? hoverBg : 'transparent',
                      color: active ? accent : C.text2,
                      transition: '0.15s ease',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      position: 'relative'
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <item.Icon size={17} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <span style={{
                        fontSize: '12.5px', fontWeight: active ? 700 : 500,
                        whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease'
                      }}>
                        {item.label}
                      </span>
                    )}
                    {badge && (
                      <span style={{
                        marginLeft: 'auto', background: '#ef4444', color: '#fff',
                        fontSize: '9px', fontWeight: 900, padding: '1px 5px', borderRadius: '6px'
                      }}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Restored with Settings */}
      <div style={{ padding: '12px 8px', marginTop: 'auto', borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'}` }}>
        <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: 4 }}>
          <button onClick={toggle} style={{ flex: 1, height: 32, borderRadius: 10, border: 'none', background: 'transparent', color: C.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button onClick={() => setPage('settings')} style={{
            flex: 1, height: 32, borderRadius: 10, border: 'none',
            background: page === 'settings' ? hoverBg : 'transparent',
            color: page === 'settings' ? accent : C.text3,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Settings size={15} />
          </button>
        </div>
      </div>

      <style>{`
        .no-scroll::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </aside>
  )
}