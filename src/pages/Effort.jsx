import { useApp }    from "../context/AppContext"
import { useColors } from "../context/ThemeContext"
import { Card } from "../components/UI"
import { TrendingUp } from "lucide-react"

export default function Effort() {
  const { properties, owners, rooms, beds, visits, bookings } = useApp()
  const C = useColors()
  if (properties.length===0) return (
    <div style={{ padding:22, textAlign:'center', marginTop:60 }}>
      <div style={{ width:72, height:72, borderRadius:20, background:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}><TrendingUp size={32} color={C.text3}/></div>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>No data yet</div>
      <div style={{ fontSize:13, color:C.text3 }}>Add properties and log visits to see effort metrics</div>
    </div>
  )
  return (
    <div style={{ padding:22 }}>
      <p style={{ fontSize:13, color:C.text3, marginBottom:20, lineHeight:1.6 }}>See how much effort your team is putting into each property — visits, outcomes, and bookings generated.</p>
      {properties.map(p=>{
        const owner=owners.find(o=>o.id===p.owner_id)||p.owner
        const pRooms=rooms.filter(r=>r.property_id===p.id)
        const pVisits=visits.filter(v=>v.property_id===p.id)
        const pBookings=bookings.filter(b=>b.property_id===p.id)
        const vacant=pRooms.filter(r=>r.status==='vacant').length
        const METRICS=[
          { label:'Total Rooms',       val:pRooms.length,                                             color:C.primary },
          { label:'Vacant Rooms',      val:vacant,                                                    color:C.success },
          { label:'Visits Completed',  val:pVisits.filter(v=>v.status==='completed').length,          color:C.info    },
          { label:'Bookings',          val:pBookings.length,                                          color:C.success },
          { label:'Considering',       val:pVisits.filter(v=>v.outcome==='considering').length,       color:C.warning },
          { label:'Not Interested',    val:pVisits.filter(v=>v.outcome==='not_interested').length,    color:C.danger  },
        ]
        return (
          <Card key={p.id} style={{ marginBottom:16 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:16, color:C.text }}>{p.name}</div>
              <div style={{ fontSize:12.5, color:C.text3, marginTop:3 }}>{[p.area,p.city].filter(Boolean).join(', ')}{owner?` · Owner: ${owner.name}`:''}</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px,1fr))', gap:10 }}>
              {METRICS.map(m=>(
                <div key={m.label} style={{ textAlign:'center', background:C.surface2, borderRadius:11, padding:'12px 8px' }}>
                  <div style={{ fontSize:26, fontWeight:800, color:m.color, lineHeight:1 }}>{m.val}</div>
                  <div style={{ fontSize:10.5, color:C.text3, marginTop:5, lineHeight:1.3 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}