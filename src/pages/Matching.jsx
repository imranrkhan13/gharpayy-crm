import { useState } from "react"
import { useApp }    from "../context/AppContext"
import { useColors } from "../context/ThemeContext"
import { Card, Btn, Select, Badge, ProgressBar } from "../components/UI"
import { fmtCurrency } from "../lib/constants"
import { Target, Zap } from "lucide-react"

export default function Matching() {
  const { leads, rooms, beds, properties } = useApp()
  const C = useColors()
  const [leadId, setLeadId] = useState("")
  const [matches, setMatches] = useState([])
  const [ran,     setRan]     = useState(false)

  const findMatches = () => {
    const lead=leads.find(l=>l.id===leadId)
    if (!lead) return
    setRan(true)
    const scored=rooms.filter(r=>r.status==='vacant').map(r=>{
      const prop=properties.find(p=>p.id===r.property_id)||r.property
      const vacantBeds=beds.filter(b=>b.room_id===r.id&&b.status==='vacant').length
      if (vacantBeds===0) return null
      let score=0
      if (lead.location&&prop?.area) {
        if (prop.area.toLowerCase().includes(lead.location.toLowerCase())||lead.location.toLowerCase().includes(prop.area.toLowerCase())) score+=40
      }
      const rent=r.rent_per_bed||0
      if (lead.budget_min&&lead.budget_max&&rent>=lead.budget_min&&rent<=lead.budget_max) score+=35
      else if (lead.budget_max&&rent<=lead.budget_max) score+=18
      else if (lead.budget_min&&rent>=lead.budget_min) score+=10
      const ga=prop?.gender_allowed
      if (!lead.pg_type||lead.pg_type==='Any') score+=10
      else if (lead.pg_type==='Boys'&&(ga==='male'||ga==='any')) score+=15
      else if (lead.pg_type==='Girls'&&(ga==='female'||ga==='any')) score+=15
      score+=Math.min(vacantBeds*2,10)
      return { room:r, property:prop, score, vacantBeds }
    }).filter(Boolean).sort((a,b)=>b.score-a.score)
    setMatches(scored)
  }

  const lead=leads.find(l=>l.id===leadId)

  return (
    <div style={{ padding:22 }}>
      <Card style={{ marginBottom:22 }}>
        <div style={{ fontWeight:700, fontSize:14, color:C.text, marginBottom:14 }}>Find the best matching rooms for a lead</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <Select value={leadId} onChange={e=>{setLeadId(e.target.value);setRan(false);setMatches([])}} containerStyle={{ flex:1, minWidth:280 }}>
            <option value="">Choose a lead…</option>
            {leads.filter(l=>!['booked','lost'].includes(l.status)).map(l=>(
              <option key={l.id} value={l.id}>{l.name} — {l.location||'any area'} — ₹{(l.budget_min||0).toLocaleString('en-IN')}–{(l.budget_max||0).toLocaleString('en-IN')}</option>
            ))}
          </Select>
          <Btn onClick={findMatches} disabled={!leadId} icon={Zap}>Find Matches</Btn>
        </div>
        {lead&&(
          <div style={{ display:'flex', gap:7, marginTop:13, flexWrap:'wrap' }}>
            <Badge color={C.info} bg={C.infoSoft}>{lead.location||'Any area'}</Badge>
            <Badge color={C.success} bg={C.successSoft}>₹{(lead.budget_min||0).toLocaleString('en-IN')}–{(lead.budget_max||0).toLocaleString('en-IN')}</Badge>
            <Badge color={C.warning} bg={C.warningSoft}>{lead.pg_type||'Any'}</Badge>
            {lead.score&&<Badge color="#f59e0b" bg="#fffbeb">Score: {lead.score}</Badge>}
          </div>
        )}
      </Card>
      {ran&&matches.length===0&&(
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>No matching rooms found</div>
          <div style={{ fontSize:13, color:C.text3 }}>Try adding more vacant rooms in Inventory, or check if the lead requirements are too narrow</div>
        </div>
      )}
      {matches.length>0&&(
        <>
          <div style={{ fontSize:13, color:C.text3, marginBottom:16 }}>Found <strong style={{ color:C.text }}>{matches.length} rooms</strong> — sorted by best match score</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:14 }}>
            {matches.map(({ room, property, score, vacantBeds })=>{
              const color=score>=70?C.success:score>=40?C.warning:C.text3
              return (
                <Card key={room.id} style={{ borderLeft:`3px solid ${color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{property?.name}</div>
                    <div style={{ fontWeight:900, fontSize:22, color, letterSpacing:'-0.02em' }}>{score}%</div>
                  </div>
                  <div style={{ fontSize:12.5, color:C.text3, marginBottom:3 }}>{property?.area}, {property?.city}</div>
                  <div style={{ fontSize:13, color:C.text2, marginBottom:3 }}>{room.name} — {room.room_type}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.success, marginBottom:3 }}>{fmtCurrency(room.rent_per_bed)}/month per bed</div>
                  <div style={{ fontSize:12, color:C.text3, marginBottom:12 }}>{vacantBeds} beds available</div>
                  <ProgressBar value={score} max={100} color={color} height={6}/>
                  <div style={{ fontSize:11, color:C.text3, marginTop:10 }}>{property?.gender_allowed==='male'?'Boys only':property?.gender_allowed==='female'?'Girls only':'Anyone welcome'}{property?.amenities?.length>0?' · '+property.amenities.slice(0,3).join(', '):''}</div>
                </Card>
              )
            })}
          </div>
        </>
      )}
      {!ran&&!leadId&&(
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ width:72, height:72, borderRadius:20, background:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}><Target size={32} color={C.text3}/></div>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>Smart Lead Matching</div>
          <div style={{ fontSize:13, color:C.text3, maxWidth:380, margin:'0 auto' }}>Select a lead above and we will automatically score every vacant room based on their preferred location, budget range, and gender requirement</div>
        </div>
      )}
    </div>
  )
}