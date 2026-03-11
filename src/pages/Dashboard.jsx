import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, StatCard, ProgressBar, Badge } from '../components/UI'
import { STAGES, SOURCES, stageInfo, sourceInfo, fmtCurrency, timeAgo } from '../lib/constants'
import { Users, Calendar, BookOpen, TrendingUp, DollarSign, BedDouble, Plus, ArrowRight, Zap, Target, Award } from 'lucide-react'

export default function Dashboard({ setPage, setOpenLead }) {
  const { leads, agents, visits, bookings, beds, stats } = useApp()
  const C = useColors()

  // --- KEEPING YOUR EXACT LOGIC ---
  const stageData = useMemo(() => STAGES.map(s => ({ ...s, count: leads.filter(l => l.status === s.id).length })), [leads])
  const sourceData = useMemo(() => SOURCES.map(s => ({ ...s, count: leads.filter(l => l.source === s.id).length })).filter(s => s.count > 0), [leads])
  const maxStage = Math.max(...stageData.map(s => s.count), 1)
  const maxSource = Math.max(...sourceData.map(s => s.count), 1)

  const needsAttention = leads.filter(l => {
    const hrs = (Date.now() - new Date(l.updated_at || l.created_at).getTime()) / 3600000
    return hrs > 24 && !['booked', 'lost'].includes(l.status)
  }).slice(0, 5)

  const hotLeads = leads.filter(l => (l.score || 0) >= 70 && !['booked', 'lost'].includes(l.status))
    .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5)

  const agentStats = agents.map(a => ({
    ...a,
    total: leads.filter(l => l.agent_id === a.id).length,
    booked: leads.filter(l => l.agent_id === a.id && l.status === 'booked').length,
  })).sort((a, b) => b.booked - a.booked)

  const todayLeads = leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length
  // --- END LOGIC ---

  return (
    <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1600, margin: '0 auto' }}>

      {/* Modern Glass Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: 20, padding: '24px 32px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.4)'
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.05em' }}>
            today’s focus
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}><b>{stats.newLeads}</b> incoming</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}><b>{stats.scheduledVisits}</b> visits</span>
            </div>
          </div>
        </div>
        <button onClick={() => setPage('leads')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
          borderRadius: 12, background: '#fff', color: '#6366f1', border: 'none',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: '0.2s'
        }}>
          <Plus size={16} strokeWidth={3} /> Add New Lead
        </button>
      </div>

      {/* Refined KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Total Leads" value={stats.totalLeads} icon={Users} color="#6366f1" onClick={() => setPage('leads')} />
        <StatCard label="Scheduled" value={stats.scheduledVisits} icon={Calendar} color="#0ea5e9" onClick={() => setPage('visits')} />
        <StatCard label="Conversion" value={stats.conversionRate + '%'} icon={TrendingUp} color="#22c55e" />
        <StatCard label="Revenue" value={fmtCurrency(stats.totalRevenue)} icon={DollarSign} color="#10b981" />
        <StatCard label="Vacant Beds" value={stats.vacantBeds} icon={BedDouble} color="#f59e0b" sub={`${stats.totalBeds} total`} />
        <StatCard label="Today's Input" value={todayLeads} icon={Zap} color="#ef4444" />
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

        <Card style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>Pipeline Distribution</h3>
            <span style={{ fontSize: 12, color: C.primary, fontWeight: 700, cursor: 'pointer' }} onClick={() => setPage('pipeline')}>Full Board →</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, paddingBottom: 10 }}>
            {stageData.map(s => {
              const barH = Math.max(s.count > 0 ? (s.count / maxStage) * 140 : 0, s.count > 0 ? 10 : 4)
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: '100%', background: s.count > 0 ? s.color : C.border, borderRadius: '6px 6px 2px 2px', height: barH, opacity: 0.8, transition: '0.4s' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.text2 }}>{s.count || '0'}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: C.text3, textTransform: 'uppercase' }}>{s.label.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 20 }}>Acquisition Channels</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sourceData.map(s => (
              <div key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{s.count}</span>
                </div>
                <div style={{ height: 6, background: C.border + '44', borderRadius: 10 }}>
                  <div style={{ width: `${(s.count / maxSource) * 100}%`, height: '100%', background: s.color, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Intelligence Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* Alerts */}
        <Card style={{ borderRadius: 20, borderTop: `4px solid ${C.danger}` }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} color={C.danger} /> Attention Required
          </div>
          {needsAttention.length === 0 ? <p style={{ fontSize: 13, color: C.text3 }}>All clear.</p> : needsAttention.map(l => (
            <div key={l.id} onClick={() => setOpenLead?.(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{l.name}</div>
                <div style={{ fontSize: 11, color: C.danger, fontWeight: 600 }}>Stale for {timeAgo(l.updated_at)}</div>
              </div>
              <Badge color={stageInfo(l.status).color} bg={stageInfo(l.status).bg}>{stageInfo(l.status).label}</Badge>
            </div>
          ))}
        </Card>

        {/* Scoring */}
        <Card style={{ borderRadius: 20, borderTop: `4px solid #f59e0b` }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#f59e0b" fill="#f59e0b" /> Hot Opportunities
          </div>
          {hotLeads.map(l => (
            <div key={l.id} onClick={() => setOpenLead?.(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{l.name}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{l.location || 'Unknown Area'}</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#f59e0b' }}>{l.score}</div>
            </div>
          ))}
        </Card>

        {/* Team */}
        <Card style={{ borderRadius: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={16} color={C.primary} /> Performance
          </div>
          {agentStats.slice(0, 4).map((a, i) => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === 3 ? 'none' : `1px solid ${C.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primary + '15', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{a.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.name}</div>
                <div style={{ fontSize: 11, color: C.text3 }}>{a.booked} bookings / {a.total} leads</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{a.total ? Math.round((a.booked / a.total) * 100) : 0}%</div>
            </div>
          ))}
        </Card>

      </div>
    </div>
  )
}