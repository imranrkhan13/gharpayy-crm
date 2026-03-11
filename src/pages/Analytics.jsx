import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, ProgressBar, Badge } from '../components/UI'
import { STAGES, SOURCES } from '../lib/constants'

export default function Analytics() {
  const { leads, agents, bookings } = useApp()
  const C = useColors()
  const stageData  = STAGES.map(s=>({ ...s, count:leads.filter(l=>l.status===s.id).length }))
  const maxStage   = Math.max(...stageData.map(s=>s.count),1)
  const sourceData = SOURCES.map(s=>({ ...s, leads:leads.filter(l=>l.source===s.id).length, booked:leads.filter(l=>l.source===s.id&&l.status==='booked').length })).filter(s=>s.leads>0)
  const agentStats = agents.map(a=>({ ...a, total:leads.filter(l=>l.agent_id===a.id).length, booked:leads.filter(l=>l.agent_id===a.id&&l.status==='booked').length })).sort((a,b)=>b.booked-a.booked)
  const weekDays   = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const ds=d.toISOString().split('T')[0]
    return { label:d.toLocaleDateString('en-IN',{weekday:'short'}), count:leads.filter(l=>l.created_at?.startsWith(ds)).length }
  })
  const maxDay = Math.max(...weekDays.map(d=>d.count),1)

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:18 }}>Sales Funnel</div>
          {stageData.map((s,i)=>{
            const prev=i>0?stageData[i-1].count:null
            const drop=prev&&prev>0?Math.round(((prev-s.count)/prev)*100):null
            return (
              <div key={s.id} style={{ marginBottom:11 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12.5, color:C.text, fontWeight:500 }}>{s.label}</span>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{s.count}</span>
                    {drop!==null&&drop>0&&<span style={{ fontSize:10, color:C.danger, fontWeight:600 }}>↘ {drop}%</span>}
                  </div>
                </div>
                <div style={{ height:20, background:C.surface2, borderRadius:5, overflow:'hidden' }}>
                  <div style={{ width:((s.count/maxStage)*100)+'%', height:'100%', background:s.color, opacity:0.75, transition:'width 0.6s' }}/>
                </div>
              </div>
            )
          })}
        </Card>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:18 }}>Source Performance</div>
          {sourceData.length===0?<div style={{ fontSize:13, color:C.text3 }}>No data yet</div>
            : sourceData.map(s=>(
              <div key={s.id} style={{ marginBottom:13 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12.5, color:C.text, fontWeight:500 }}>{s.label}</span>
                  <span style={{ fontSize:12, color:C.text3 }}>{s.leads} leads · <span style={{ color:C.success, fontWeight:700 }}>{s.booked} booked</span></span>
                </div>
                <ProgressBar value={s.booked} max={Math.max(s.leads,1)} color={s.color} height={7}/>
              </div>
            ))
          }
        </Card>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:18 }}>Agent Leaderboard</div>
          {agentStats.length===0?<div style={{ fontSize:13, color:C.text3 }}>Add agents in Settings to see leaderboard</div>
            : agentStats.map((a,i)=>{
              const conv=a.total?Math.round((a.booked/a.total)*100):0
              return (
                <div key={a.id} style={{ display:'flex', gap:10, alignItems:'center', padding:'9px 0', borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:20, textAlign:'center', fontWeight:800, fontSize:13, color:i===0?'#f59e0b':C.text3 }}>#{i+1}</div>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:C.primary+'22', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:C.primary }}>{a.name[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.name}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{a.total} leads · {a.booked} booked</div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:15, color:conv>=20?C.success:C.text3 }}>{conv}%</div>
                </div>
              )
            })
          }
        </Card>
        <Card>
          <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:18 }}>Weekly Lead Trend</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:110 }}>
            {weekDays.map(d=>(
              <div key={d.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:11, color:C.text3 }}>{d.count||''}</span>
                <div style={{ width:'100%', background:d.count>0?C.primary:C.surface3, borderRadius:'4px 4px 0 0', height:Math.max((d.count/maxDay)*85,d.count>0?6:2)+'px', opacity:0.8, transition:'height 0.5s' }}/>
                <span style={{ fontSize:10, color:C.text3 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}