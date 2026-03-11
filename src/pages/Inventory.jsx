import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Modal, Btn, Input, Select, Badge, EmptyState, StatCard } from '../components/UI'
import { ROOM_TYPES, fmtCurrency } from '../lib/constants'
import { BedDouble, Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const ROOM_STATUS_COLORS = { vacant:'#22c55e', occupied:'#ef4444', vacating:'#f59e0b', blocked:'#9ca3af' }
const BED_STATUS_COLORS  = { vacant:'#22c55e', occupied:'#ef4444', reserved:'#f59e0b', booked:'#3b82f6' }

export default function Inventory() {
  const { rooms, beds, properties, createRoom, updateRoom, deleteRoom, updateBed, showToast } = useApp()
  const C = useColors()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterProp, setFilterProp] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState({})
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ property_id:'', name:'', room_type:'2 Sharing', total_beds:2, rent_per_bed:'', status:'vacant', floor_number:1 })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const addRoom = async () => {
    if (!form.property_id) { showToast('Please select a property','error'); return }
    if (!form.name.trim()) { showToast('Room name is required','error'); return }
    setSaving(true)
    await createRoom({ ...form, total_beds:parseInt(form.total_beds)||1, rent_per_bed:parseInt(form.rent_per_bed)||0 }, parseInt(form.total_beds)||1)
    setSaving(false); setShowModal(false)
    setForm({ property_id:'', name:'', room_type:'2 Sharing', total_beds:2, rent_per_bed:'', status:'vacant', floor_number:1 })
  }

  const filtered = rooms.filter(r=>{
    const prop=properties.find(p=>p.id===r.property_id)||r.property
    const q=search.toLowerCase()
    return (filterStatus==='all'||r.status===filterStatus)&&(filterProp==='all'||r.property_id===filterProp)&&(!q||r.name?.toLowerCase().includes(q)||prop?.name?.toLowerCase().includes(q))
  })
  const st = { total:rooms.length, vacant:rooms.filter(r=>r.status==='vacant').length, occupied:rooms.filter(r=>r.status==='occupied').length, vacating:rooms.filter(r=>r.status==='vacating').length, vacantBeds:beds.filter(b=>b.status==='vacant').length }

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Total Rooms"  value={st.total}      icon={BedDouble}/>
        <StatCard label="Vacant"       value={st.vacant}     icon={BedDouble} color={C.success}/>
        <StatCard label="Vacating"     value={st.vacating}   icon={BedDouble} color={C.warning}/>
        <StatCard label="Occupied"     value={st.occupied}   icon={BedDouble} color={C.danger}/>
        <StatCard label="Vacant Beds"  value={st.vacantBeds} icon={BedDouble} color={C.success}/>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <Btn onClick={()=>setShowModal(true)} icon={Plus}>Add Room</Btn>
        <input placeholder="Search rooms or properties…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:200, padding:'8px 12px', border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, background:C.inputBg, color:C.text, outline:'none', fontFamily:'Poppins,sans-serif' }}/>
        <Select value={filterProp} onChange={e=>setFilterProp(e.target.value)} style={{ width:200 }}>
          <option value="all">All Properties</option>
          {properties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width:140 }}>
          <option value="all">All Status</option>
          <option value="vacant">Vacant</option><option value="vacating">Vacating</option><option value="occupied">Occupied</option><option value="blocked">Blocked</option>
        </Select>
        <span style={{ fontSize:12, color:C.text3 }}>{filtered.length} rooms</span>
      </div>
      {filtered.length===0
        ? <EmptyState icon={BedDouble} title="No rooms found" message="Add rooms to your properties to start tracking inventory." action={<Btn onClick={()=>setShowModal(true)} icon={Plus}>Add Room</Btn>}/>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:14 }}>
            {filtered.map(room=>{
              const prop=properties.find(p=>p.id===room.property_id)||room.property
              const roomBeds=beds.filter(b=>b.room_id===room.id)
              const sc=ROOM_STATUS_COLORS[room.status]||'#9ca3af'
              const isOpen=expanded[room.id]
              return (
                <Card key={room.id} style={{ borderLeft:`3px solid ${sc}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{room.name}</div>
                      <div style={{ fontSize:11.5, color:C.text3 }}>{prop?.name}</div>
                    </div>
                    <Badge color={sc}>{room.status}</Badge>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginBottom:12, fontSize:12.5, color:C.text2 }}>
                    <div>Beds: <strong>{room.total_beds}</strong></div>
                    <div>Type: <strong>{room.room_type}</strong></div>
                    <div>Floor: <strong>{room.floor_number}</strong></div>
                    <div>Rent: <strong style={{ color:C.success }}>{fmtCurrency(room.rent_per_bed)}/bed</strong></div>
                  </div>
                  {isOpen&&(
                    <div style={{ background:C.surface2, borderRadius:9, padding:'10px 12px', marginBottom:10 }}>
                      <div style={{ fontSize:10.5, fontWeight:700, color:C.text3, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.07em' }}>Beds</div>
                      {roomBeds.length===0?<div style={{ fontSize:12, color:C.text3 }}>No beds found</div>
                        : roomBeds.map(bed=>(
                          <div key={bed.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                            <div>
                              <div style={{ fontSize:12.5, fontWeight:600, color:C.text }}>Bed {bed.label}</div>
                              {bed.tenant_name&&<div style={{ fontSize:11, color:C.text3 }}>{bed.tenant_name}</div>}
                            </div>
                            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                              <Badge color={BED_STATUS_COLORS[bed.status]||'#9ca3af'}>{bed.status}</Badge>
                              <select value={bed.status} onChange={e=>updateBed(bed.id,{status:e.target.value})} style={{ fontSize:10, padding:'3px 5px', border:'1px solid', borderRadius:5, background:C.inputBg, color:C.text, cursor:'pointer' }}>
                                <option value="vacant">vacant</option><option value="occupied">occupied</option><option value="reserved">reserved</option><option value="booked">booked</option>
                              </select>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>setExpanded(e=>({...e,[room.id]:!e[room.id]}))} style={{ flex:1, padding:'6px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface2, color:C.text2, fontSize:11, cursor:'pointer', fontFamily:'Poppins,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      {isOpen?<ChevronUp size={12}/>:<ChevronDown size={12}/>} Beds ({roomBeds.length})
                    </button>
                    <select value={room.status} onChange={e=>updateRoom(room.id,{status:e.target.value})} style={{ flex:1, padding:'6px', borderRadius:8, border:`1px solid ${C.border}`, background:C.inputBg, color:C.text, fontSize:11, cursor:'pointer' }}>
                      <option value="vacant">vacant</option><option value="vacating">vacating</option><option value="occupied">occupied</option><option value="blocked">blocked</option>
                    </select>
                    <button onClick={()=>{if(window.confirm('Delete this room and all its beds?'))deleteRoom(room.id)}} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${C.danger}33`, background:C.dangerSoft, color:C.danger, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={13}/></button>
                  </div>
                </Card>
              )
            })}
          </div>
      }
      {showModal&&(
        <Modal title="Add Room" icon={BedDouble} onClose={()=>setShowModal(false)} maxWidth={560}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
            <Select label="Property" required value={form.property_id} onChange={e=>set('property_id',e.target.value)}>
              <option value="">Select property…</option>
              {properties.map(p=><option key={p.id} value={p.id}>{p.name} — {p.area}</option>)}
            </Select>
            <Input label="Room Name" required placeholder="R101 or Ground Floor Room 1" value={form.name} onChange={e=>set('name',e.target.value)}/>
            <Select label="Room Type" value={form.room_type} onChange={e=>set('room_type',e.target.value)}>
              {ROOM_TYPES.map(t=><option key={t}>{t}</option>)}
            </Select>
            <Input label="Number of Beds" type="number" min="1" max="12" value={form.total_beds} onChange={e=>set('total_beds',e.target.value)}/>
            <Input label="Rent per Bed (₹/month)" type="number" placeholder="12000" value={form.rent_per_bed} onChange={e=>set('rent_per_bed',e.target.value)}/>
            <Input label="Floor Number" type="number" min="0" value={form.floor_number} onChange={e=>set('floor_number',e.target.value)}/>
          </div>
          <div style={{ background:C.primarySoft, border:`1px solid ${C.primary}22`, borderRadius:10, padding:'10px 14px', margin:'14px 0', fontSize:12.5, color:C.primary }}>
            {form.total_beds} beds will be auto-created: Bed A, Bed B, Bed C… (all set to vacant)
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Btn variant="secondary" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
            <Btn onClick={addRoom} loading={saving} icon={Plus} style={{ flex:1 }}>Add Room + Beds</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}