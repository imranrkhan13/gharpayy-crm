import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Modal, Btn, Select, Input, FormRow, Table, TR, TD, EmptyState, Badge } from '../components/UI'
import { fmtDateTime } from '../lib/constants'
import { Calendar, CheckCircle, XCircle, ThumbsUp } from 'lucide-react'

export default function Visits() {
  const { visits, leads, properties, agents, createVisit, updateVisit, showToast } = useApp()
  const C = useColors()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ lead_id:'', property_id:'', agent_id:'', scheduled_at:'', notes:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const upcoming  = visits.filter(v=>v.status==='scheduled').sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))
  const completed = visits.filter(v=>v.status!=='scheduled').sort((a,b)=>new Date(b.scheduled_at)-new Date(a.scheduled_at))

  const scheduleVisit = async () => {
    if (!form.lead_id) { showToast('Please select a lead','error'); return }
    if (!form.scheduled_at) { showToast('Please pick a date and time','error'); return }
    setSaving(true); await createVisit(form); setSaving(false); setShowModal(false)
    setForm({ lead_id:'', property_id:'', agent_id:'', scheduled_at:'', notes:'' })
  }

  const setOutcome = async (visitId, outcome) => { await updateVisit(visitId, { outcome, status:'completed' }) }
  const OUTCOMES = [
    { value:'booked',         label:'Booked',         color:'#22c55e', Icon:CheckCircle },
    { value:'considering',    label:'Considering',    color:'#f59e0b', Icon:ThumbsUp },
    { value:'not_interested', label:'Not Interested', color:'#ef4444', Icon:XCircle },
  ]
  const OUTCOME_COLOR = { booked:'#22c55e', considering:'#f59e0b', not_interested:'#ef4444' }
  const getLead  = id => leads.find(l=>l.id===id)
  const getProp  = id => properties.find(p=>p.id===id)
  const getAgent = id => agents.find(a=>a.id===id)

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
        <Btn onClick={()=>setShowModal(true)} icon={Calendar}>Schedule Visit</Btn>
      </div>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>Upcoming Visits</div>
          <Badge color={C.info} bg={C.infoSoft}>{upcoming.length} scheduled</Badge>
        </div>
        {upcoming.length===0
          ? <EmptyState icon={Calendar} title="No upcoming visits" message="Schedule your first visit above!"/>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:14 }}>
              {upcoming.map(v=>{
                const lead=getLead(v.lead_id)||v.lead
                const prop=getProp(v.property_id)||v.property
                const agent=getAgent(v.agent_id)||v.agent
                return (
                  <Card key={v.id} style={{ borderLeft:`3px solid ${C.primary}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{lead?.name||'—'}</div>
                      <Badge color={C.success} bg={C.successSoft}>Confirmed</Badge>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:4, fontSize:13, color:C.text2, marginBottom:14 }}>
                      <div>Property: {prop?.name||'TBD'}</div>
                      <div>Location: {prop?.area||'—'}</div>
                      <div>Phone: {lead?.phone||'—'}</div>
                      <div>Time: <strong>{fmtDateTime(v.scheduled_at)}</strong></div>
                      <div>Agent: {agent?.name||'Unassigned'}</div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      {OUTCOMES.map(o=>(
                        <button key={o.value} onClick={()=>setOutcome(v.id,o.value)} style={{ flex:1, padding:'7px 4px', borderRadius:9, border:`1px solid ${o.color}33`, background:o.color+'12', color:o.color, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Poppins,sans-serif', transition:'all 0.12s', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                          <o.Icon size={11}/>{o.label}
                        </button>
                      ))}
                    </div>
                    {v.notes&&<div style={{ fontSize:12, color:C.text3, marginTop:10, fontStyle:'italic' }}>{v.notes}</div>}
                  </Card>
                )
              })}
            </div>
        }
      </div>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:14 }}>Completed Visits ({completed.length})</div>
        <Card padding={0}>
          {completed.length===0
            ? <EmptyState icon={Calendar} title="No completed visits yet"/>
            : <Table headers={["Lead","Phone","Property","When","Agent","Outcome"]}>
                {completed.map(v=>{
                  const lead=getLead(v.lead_id)||v.lead
                  const prop=getProp(v.property_id)||v.property
                  const agent=getAgent(v.agent_id)||v.agent
                  return (
                    <TR key={v.id}>
                      <TD><span style={{ fontWeight:600 }}>{lead?.name||'—'}</span></TD>
                      <TD>{lead?.phone||'—'}</TD>
                      <TD>{prop?.name||'—'}</TD>
                      <TD>{fmtDateTime(v.scheduled_at)}</TD>
                      <TD>{agent?.name||'—'}</TD>
                      <TD>{v.outcome?<Badge color={OUTCOME_COLOR[v.outcome]||'#9ca3af'}>{v.outcome.replace('_',' ')}</Badge>:<span style={{ color:C.text3 }}>—</span>}</TD>
                    </TR>
                  )
                })}
              </Table>
          }
        </Card>
      </div>
      {showModal&&(
        <Modal title="Schedule a Visit" icon={Calendar} onClose={()=>setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <Select label="Lead (Customer)" required value={form.lead_id} onChange={e=>set('lead_id',e.target.value)}>
              <option value="">Select a lead…</option>
              {leads.filter(l=>!['booked','lost'].includes(l.status)).map(l=><option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
            </Select>
            <Select label="Property to Visit" value={form.property_id} onChange={e=>set('property_id',e.target.value)}>
              <option value="">Select property (optional)</option>
              {properties.map(p=><option key={p.id} value={p.id}>{p.name} — {p.area}</option>)}
            </Select>
            <FormRow>
              <Select label="Assign Agent" value={form.agent_id} onChange={e=>set('agent_id',e.target.value)}>
                <option value="">Any available agent</option>
                {agents.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
              <Input label="Date & Time" required type="datetime-local" value={form.scheduled_at} onChange={e=>set('scheduled_at',e.target.value)}/>
            </FormRow>
            <Input label="Notes (optional)" placeholder="E.g. customer wants ground floor only" value={form.notes} onChange={e=>set('notes',e.target.value)}/>
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="secondary" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
              <Btn onClick={scheduleVisit} loading={saving} icon={Calendar} style={{ flex:1 }}>Schedule Visit</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}