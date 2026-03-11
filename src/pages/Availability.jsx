import { useApp }    from "../context/AppContext"
import { useColors } from "../context/ThemeContext"
import { Card, Badge, Table, TR, TD } from "../components/UI"
import { fmtCurrency } from "../lib/constants"
import { Map } from "lucide-react"

export default function Availability() {
  const { properties, rooms, beds } = useApp()
  const C = useColors()
  const areas = [...new Set(properties.map(p=>p.area).filter(Boolean))]
  const areaData = areas.map(area=>{
    const aProps=properties.filter(p=>p.area===area)
    const aRooms=rooms.filter(r=>aProps.map(p=>p.id).includes(r.property_id))
    const aBeds=beds.filter(b=>aRooms.map(r=>r.id).includes(b.room_id))
    const propDetail=aProps.map(p=>{
      const pRooms=rooms.filter(r=>r.property_id===p.id)
      const pBeds=beds.filter(b=>pRooms.map(r=>r.id).includes(b.room_id))
      const vacant=pBeds.filter(b=>b.status==='vacant').length
      const rents=pRooms.filter(r=>r.status==='vacant').map(r=>r.rent_per_bed).filter(Boolean)
      return { ...p, vacantBeds:vacant, totalBeds:pBeds.length, minRent:rents.length>0?Math.min(...rents):0 }
    })
    return { area, total:aBeds.length, vacant:aBeds.filter(b=>b.status==='vacant').length, properties:propDetail }
  }).sort((a,b)=>b.vacant-a.vacant)

  if (areaData.length===0) return (
    <div style={{ padding:22, textAlign:'center', marginTop:60 }}>
      <div style={{ width:72, height:72, borderRadius:20, background:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}><Map size={32} color={C.text3}/></div>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>No availability data yet</div>
      <div style={{ fontSize:13, color:C.text3 }}>Add properties and rooms to see the availability map</div>
    </div>
  )

  return (
    <div style={{ padding:22 }}>
      <div style={{ fontWeight:700, fontSize:15, color:C.text, marginBottom:16 }}>Area Availability Heatmap</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:12, marginBottom:28 }}>
        {areaData.map(a=>{
          const pct=a.total>0?a.vacant/a.total:0
          const color=pct>0.6?C.success:pct>0.3?C.warning:C.danger
          const label=pct>0.6?'High':pct>0.3?'Medium':'Low'
          return (
            <Card key={a.area} style={{ textAlign:'center', borderTop:`3px solid ${color}` }} hover>
              <div style={{ fontSize:32, fontWeight:900, color, letterSpacing:'-0.03em' }}>{a.vacant}</div>
              <div style={{ fontSize:11, color:C.text3, marginBottom:5 }}>of {a.total} beds</div>
              <div style={{ fontWeight:700, fontSize:13, color:C.text, marginBottom:4 }}>{a.area}</div>
              <Badge color={color}>{label} Availability</Badge>
            </Card>
          )
        })}
      </div>
      {areaData.map(a=>(
        <div key={a.area} style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{a.area}</div>
            <Badge color={C.success} bg={C.successSoft}>{a.vacant} vacant beds</Badge>
          </div>
          <Card padding={0}>
            <Table headers={["Property","Vacant Beds","Total Beds","Min Rent / Bed","Gender Policy"]}>
              {a.properties.map(p=>(
                <TR key={p.id}>
                  <TD><span style={{ fontWeight:600 }}>{p.name}</span></TD>
                  <TD><span style={{ fontWeight:800, fontSize:16, color:p.vacantBeds>0?C.success:C.danger }}>{p.vacantBeds}</span></TD>
                  <TD>{p.totalBeds}</TD>
                  <TD><span style={{ fontWeight:600 }}>{p.minRent>0?fmtCurrency(p.minRent):'—'}</span></TD>
                  <TD><Badge color={C.info} bg={C.infoSoft}>{p.gender_allowed==='any'?'Co-living':p.gender_allowed==='male'?'Boys Only':'Girls Only'}</Badge></TD>
                </TR>
              ))}
            </Table>
          </Card>
        </div>
      ))}
    </div>
  )
}