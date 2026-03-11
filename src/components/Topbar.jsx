  import { useColors, useTheme } from '../context/ThemeContext'
  import { useApp } from '../context/AppContext'
  import { notificationsAPI } from '../lib/supabase'
  import { Bell, RefreshCw, CheckCircle, AlertCircle, AlertTriangle, Info, Sparkles, Command } from 'lucide-react'

  const TITLES = {
    dashboard: { title: 'Dashboard', tag: 'OVERVIEW' },
    leads: { title: 'All Leads', tag: 'ENQUIRIES' },
    pipeline: { title: 'Pipeline', tag: 'SALES FLOW' },
    visits: { title: 'Visits', tag: 'SCHEDULING' },
    messages: { title: 'Messages', tag: 'COMMUNICATIONS' },
    bookings: { title: 'Bookings', tag: 'RESERVATIONS' },
    analytics: { title: 'Analytics', tag: 'INSIGHTS' },
    historical: { title: 'Historical Leads', tag: 'ARCHIVE' },
    owners: { title: 'Property Owners', tag: 'PARTNERS' },
    properties: { title: 'Properties', tag: 'REAL ESTATE' },
    inventory: { title: 'Rooms & Beds', tag: 'STOCK' },
    availability: { title: 'Availability Map', tag: 'LIVE MAP' },
    effort: { title: 'Effort Tracker', tag: 'PRODUCTIVITY' },
    matching: { title: 'Lead Matching', tag: 'AI MATCH' },
    settings: { title: 'Settings', tag: 'SYSTEM' },
  }

  export default function Topbar({ page }) {
    const C = useColors()
    const { theme } = useTheme()
    const { stats, loadAll, setNotifications } = useApp()

    const info = TITLES[page] || { title: page, tag: 'APP' }
    const isLight = theme === 'light'

    const markAllRead = async () => {
      await notificationsAPI.markAllRead()
      setNotifications(p => p.map(n => ({ ...n, is_read: true })))
    }

    return (
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 70,
        margin: '16px 16px 0 8px',
        background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(10, 10, 15, 0.3)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '24px',
        border: `1px solid ${isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: isLight
          ? '0 4px 24px -1px rgba(0,0,0,0.03), inset 0 0 20px rgba(255,255,255,0.2)'
          : '0 10px 40px -10px rgba(0,0,0,0.5)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        flexShrink: 0
      }}>

        {/* Left Segment: Dynamic Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            paddingLeft: 12,
            borderLeft: `3px solid #6366f1`
          }}>
            <span style={{
              fontSize: 10,
              fontWeight: 900,
              color: '#6366f1',
              letterSpacing: '0.15em',
              marginBottom: 2
            }}>
              {info.tag}
            </span>
            <h1 style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.text,
              margin: 0,
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {info.title}
              {page === 'dashboard' && <Sparkles size={16} color="#fbbf24" fill="#fbbf24" style={{ opacity: 0.8 }} />}
            </h1>
          </div>
        </div>

        {/* Right Segment: Action Console */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* Status Pills */}
          {!isLight && (
            <div style={{
              display: 'flex', gap: 8, paddingRight: 12, borderRight: `1px solid rgba(255,255,255,0.1)`
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ade80' }} /> SYSTEM LIVE
              </div>
            </div>
          )}

          {/* Control Group */}
          <div style={{
            display: 'flex',
            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
            padding: '5px',
            borderRadius: '16px',
            gap: 4
          }}>
            <button
              onClick={loadAll}
              className="action-btn"
              style={{
                width: 38, height: 38, borderRadius: 12, border: 'none',
                cursor: 'pointer', color: C.text, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'transparent', transition: '0.3s'
              }}
            >
              <RefreshCw size={16} />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={markAllRead}
                style={{
                  width: 38, height: 38, borderRadius: 12, border: 'none',
                  cursor: 'pointer', color: C.text, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'transparent'
                }}
              >
                <Bell size={18} />
                {stats.unreadNotifs > 0 && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8, width: 8, height: 8,
                    background: '#ef4444', borderRadius: '50%',
                    boxShadow: '0 0 10px #ef4444',
                    border: `2px solid ${isLight ? '#fff' : '#111'}`
                  }} />
                )}
              </button>
            </div>
          </div>

          {/* User Module */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '5px 14px 5px 5px',
            background: isLight ? '#fff' : 'rgba(255,255,255,0.05)',
            borderRadius: 16,
            boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fff', fontSize: 13
            }}>A</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>Admin</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: C.text3, opacity: 0.6 }}>SUPERUSER</span>
            </div>
          </div>
        </div>

        <style>{`
          .action-btn:hover {
            background: ${isLight ? '#fff' : 'rgba(255,255,255,0.1)'} !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </nav>
    )
  }

  /* ── World-Class Toast ─────────────────────────────────────────────────── */
  export function Toast({ toast }) {
    if (!toast) return null

    const configs = {
      success: { color: '#4ade80', label: 'Success' },
      error: { color: '#f87171', label: 'Error' },
      warning: { color: '#fbbf24', label: 'Alert' },
      info: { color: '#60a5fa', label: 'Update' },
    }

    const cfg = configs[toast.type] || configs.success

    return (
      <div style={{
        position: 'fixed', bottom: 30, right: 30, zIndex: 10000,
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(12px)',
        color: '#fff', padding: '6px 6px 6px 16px',
        borderRadius: '20px', fontSize: '14px', fontWeight: 600,
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', gap: 16,
        border: `1px solid rgba(255,255,255,0.1)`,
        animation: 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
          <span>{toast.msg}</span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '8px 12px',
          borderRadius: '14px',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: '0.05em',
          color: cfg.color
        }}>
          {cfg.label.toUpperCase()}
        </div>
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    )
  }