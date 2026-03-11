import { useState } from 'react'
import { ThemeProvider, useColors } from './context/ThemeContext'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar, { Toast } from './components/Topbar'
import { Spinner } from './components/UI'

import Dashboard   from './pages/Dashboard'
import Leads       from './pages/Leads'
import Pipeline    from './pages/Pipeline'
import Visits      from './pages/Visits'
import Messages    from './pages/Messages'
import Bookings    from './pages/Bookings'
import Analytics   from './pages/Analytics'
import Historical  from './pages/Historical'
import Owners      from './pages/Owners'
import Properties  from './pages/Properties'
import Inventory   from './pages/Inventory'
import Availability from './pages/Availability'
import Effort      from './pages/Effort'
import Matching    from './pages/Matching'
import Settings    from './pages/Settings'

const PAGES = {
  dashboard: Dashboard, leads: Leads, pipeline: Pipeline, visits: Visits,
  messages: Messages, bookings: Bookings, analytics: Analytics, historical: Historical,
  owners: Owners, properties: Properties, inventory: Inventory, availability: Availability,
  effort: Effort, matching: Matching, settings: Settings,
}

function Shell() {
  const { loading, error, toast, loadAll } = useApp()
  const C = useColors()
  const [page,      setPage]      = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [openLead,  setOpenLead]  = useState(null)

  if (loading) return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:C.bg, gap:18, fontFamily:"'Poppins',sans-serif" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:4 }}>🏠</div>
      <Spinner size={28} />
      <div style={{ fontSize:14, fontWeight:600, color:C.text2 }}>Loading Gharpayy CRM…</div>
    </div>
  )

  if (error) return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:C.bg, padding:24, textAlign:'center', fontFamily:"'Poppins',sans-serif" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:18 }}>🏠</div>
      <div style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:10, letterSpacing:'-0.02em' }}>Setup Required</div>
      <div style={{ fontSize:14, color:C.text2, maxWidth:500, lineHeight:1.7, marginBottom:24 }}>
        The Supabase database needs to be configured first. Run the SQL setup file, then click Retry.
      </div>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 24px', fontFamily:'monospace', fontSize:13, color:C.text2, marginBottom:22, textAlign:'left', maxWidth:520, lineHeight:2 }}>
        <div>1. Go to <strong>supabase.com/dashboard</strong></div>
        <div>2. Open your project → <strong>SQL Editor</strong></div>
        <div>3. Click <strong>New Query</strong></div>
        <div>4. Paste contents of <strong>SUPABASE_SETUP.sql</strong></div>
        <div>5. Click <strong>Run</strong> → then come back and Retry</div>
      </div>
      <div style={{ fontSize:12, color:C.danger, marginBottom:18, maxWidth:460 }}>{error}</div>
      <button onClick={loadAll} style={{ padding:'11px 28px', borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Poppins',sans-serif", boxShadow:'0 4px 14px rgba(99,102,241,0.4)', transition:'all 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Retry Connection
      </button>
    </div>
  )

  const PageComponent = PAGES[page] || Dashboard

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.bg }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Topbar page={page} />
        <main style={{ flex:1, overflow:'auto' }} className="page-enter" key={page}>
          <PageComponent setPage={setPage} setOpenLead={setOpenLead} openLead={openLead} />
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ThemeProvider>
  )
}
