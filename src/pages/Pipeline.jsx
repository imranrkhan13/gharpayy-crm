import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import LeadPanel from '../components/LeadPanel'
import { Btn } from '../components/UI'
import { STAGES, sourceInfo, timeAgo } from '../lib/constants'
import { Plus } from 'lucide-react'

export default function Pipeline() {
  const { leads, agents, updateLead } = useApp()
  const C = useColors()
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [openLead, setOpenLead] = useState(null)
  const [isNew,    setIsNew]    = useState(false)

  const drop = async (stageId) => {
    setDragOver(null)
    if (!dragging || dragging.status === stageId) { setDragging(null); return }
    await updateLead(dragging.id, { status: stageId })
    setDragging(null)
  }

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 22px 6px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <p style={{ fontSize:13, color:C.text3 }}>Drag and drop cards to move leads between stages</p>
          <Btn onClick={()=>{setIsNew(true);setOpenLead(null)}} icon={Plus}>Add Lead</Btn>
        </div>
        <div style={{ flex:1, display:'flex', gap:12, overflowX:'auto', padding:'8px 22px 22px' }}>
          {STAGES.map(stage=>{
            const stageLeads=leads.filter(l=>l.status===stage.id)
            const isDragTarget=dragOver===stage.id
            return (
              <div key={stage.id} style={{ minWidth:220, flexShrink:0, display:'flex', flexDirection:'column' }}
                onDragOver={e=>{e.preventDefault();setDragOver(stage.id)}}
                onDragLeave={()=>setDragOver(null)}
                onDrop={()=>drop(stage.id)}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, padding:'0 2px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:stage.color }}/>
                    <span style={{ fontSize:12.5, fontWeight:700, color:C.text }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:99, background:stage.color+'18', color:stage.color }}>{stageLeads.length}</span>
                </div>
                <div style={{ flex:1, minHeight:80, borderRadius:12, border:isDragTarget?`2px dashed ${stage.color}`:'2px solid transparent', background:isDragTarget?stage.color+'06':'transparent', transition:'all 0.15s', padding:4 }}>
                  {stageLeads.map(lead=><KanbanCard key={lead.id} lead={lead} agents={agents} C={C} onDragStart={()=>setDragging(lead)} onDragEnd={()=>setDragging(null)} onClick={()=>{setOpenLead(lead);setIsNew(false)}}/>)}
                  {stageLeads.length===0&&!isDragTarget&&(
                    <div style={{ border:`1.5px dashed`,borderRadius:10,padding:20,textAlign:'center',color:C.text3,fontSize:12 }}>Drop here</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {(openLead||isNew)&&<LeadPanel lead={openLead} isNew={isNew} onClose={()=>{setOpenLead(null);setIsNew(false)}} onCreate={nl=>{setIsNew(false);setOpenLead(nl)}}/>}
    </div>
  )
}

function KanbanCard({ lead, agents, C, onDragStart, onDragEnd, onClick }) {
  const agent=agents.find(a=>a.id===lead.agent_id)||lead.agent
  const src=sourceInfo(lead.source)
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      style={{ background:C.surface, borderRadius:11, padding:13, border:`1px solid ${C.border}`, cursor:'grab', marginBottom:8, boxShadow:C.shadow, transition:'transform 0.12s, box-shadow 0.12s', userSelect:'none' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadowMd}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=C.shadow}}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <div style={{ fontWeight:700, fontSize:13.5, color:C.text, flex:1 }}>{lead.name}</div>
        <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:99, background:src.color+'18', color:src.color, marginLeft:6, flexShrink:0 }}>{src.label}</span>
      </div>
      <div style={{ fontSize:12, color:C.text3, marginBottom:2 }}>{lead.phone}</div>
      {lead.location&&<div style={{ fontSize:12, color:C.text3, marginBottom:2 }}>{lead.location}</div>}
      {(lead.budget_min||lead.budget_max)&&<div style={{ fontSize:12, color:C.text3, marginBottom:6 }}>₹{(lead.budget_min||0).toLocaleString('en-IN')}–{(lead.budget_max||0).toLocaleString('en-IN')}/mo</div>}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:18, height:18, borderRadius:'50%', background:C.primary+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:C.primary }}>{agent?.name?.[0]||'?'}</div>
          <span style={{ fontSize:11, color:C.text3 }}>{agent?.name?.split(' ')[0]||'Unassigned'}</span>
        </div>
        {lead.score&&<span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>{lead.score} pts</span>}
      </div>
    </div>
  )
}