import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Modal, Btn, Input, Select, Badge, EmptyState } from '../components/UI'
import { AMENITIES } from '../lib/constants'
import { Building2, Plus, MapPin, UserCheck, BedDouble, Trash2 } from 'lucide-react'

export default function Properties() {
  const { properties, owners, rooms, beds, createProperty, updateProperty, deleteProperty, showToast } = useApp()
  const C = useColors()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', owner_id:'', area:'', city:'Bangalore', address:'', gender_allowed:'any', amenities:[] })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const toggleAmenity = a => setForm(f=>({ ...f, amenities:f.amenities.includes(a)?f.amenities.filter(x=>x!==a):[...f.amenities,a] }))

  const addProperty = async () => {
    if (!form.name.trim()) { showToast('Property name is required','error'); return }
    if (!form.owner_id) { showToast('Please select an owner','error'); return }
    setSaving(true); await createProperty(form); setSaving(false); setShowModal(false)
    setForm({ name:'', owner_id:'', area:'', city:'Bangalore', address:'', gender_allowed:'any', amenities:[] })
  }

  const filtered = properties.filter(p => !search||p.name?.toLowerCase().includes(search.toLowerCase())||p.area?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center' }}>
        <Btn onClick={()=>setShowModal(true)} icon={Plus}>Add Property</Btn>
        <input placeholder="Search properties…" value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:'8px 12px', border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, background:C.inputBg, color:C.text, outline:'none', fontFamily:'Poppins,sans-serif', width:240 }}/>
        <span style={{ fontSize:12, color:C.text3 }}>{filtered.length} properties</span>
      </div>
      {filtered.length===0
        ? <EmptyState icon={Building2} title="No properties yet" message="Add your first PG property." action={<Btn onClick={()=>setShowModal(true)} icon={Plus}>Add Property</Btn>}/>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px,1fr))', gap:14 }}>
            {filtered.map(p=>{
              const owner=owners.find(o=>o.id===p.owner_id)||p.owner
              const pRooms=rooms.filter(r=>r.property_id===p.id)
              const pBeds=beds.filter(b=>pRooms.map(r=>r.id).includes(b.room_id))
              const vacantBeds=pBeds.filter(b=>b.status==='vacant').length
              const gLabel={ male:'Boys Only', female:'Girls Only', any:'Co-living' }
              return (
                <Card key={p.id} hover style={{ borderTop:`3px solid ${p.is_active?C.primary:C.border}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:C.text, flex:1, marginRight:8 }}>{p.name}</div>
                    <Badge color={p.is_active?C.success:'#9ca3af'} bg={p.is_active?C.successSoft:C.surface2}>{p.is_active?'Active':'Inactive'}</Badge>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
                    <div style={{ display:'flex', gap:6, fontSize:12.5, color:C.text3 }}><MapPin size={12}/>{[p.area,p.city].filter(Boolean).join(', ')||'—'}</div>
                    <div style={{ display:'flex', gap:6, fontSize:12.5, color:C.text3 }}><UserCheck size={12}/>{owner?.name||'—'}{owner?.company?` (${owner.company})`:''}</div>
                    <div style={{ display:'flex', gap:6, fontSize:12.5, color:C.text3 }}><BedDouble size={12}/>{pRooms.length} rooms · <span style={{ color:vacantBeds>0?C.success:C.danger, fontWeight:600 }}>{vacantBeds} vacant beds</span></div>
                    <div style={{ fontSize:12.5, color:C.text3 }}>Gender: {gLabel[p.gender_allowed]||p.gender_allowed}</div>
                  </div>
                  {p.amenities?.length>0&&(
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:13 }}>
                      {p.amenities.slice(0,5).map(a=><Badge key={a} color={C.info} bg={C.infoSoft}>{a}</Badge>)}
                      {p.amenities.length>5&&<Badge color={C.text3}>+{p.amenities.length-5} more</Badge>}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:7 }}>
                    <button onClick={()=>updateProperty(p.id,{is_active:!p.is_active})} style={{ flex:1, padding:'7px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface2, color:C.text2, fontSize:12, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600 }}>{p.is_active?'Deactivate':'Reactivate'}</button>
                    <button onClick={()=>{if(window.confirm(`Delete ${p.name}?`))deleteProperty(p.id)}} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${C.danger}33`, background:C.dangerSoft, color:C.danger, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={14}/></button>
                  </div>
                </Card>
              )
            })}
          </div>
      }
      {showModal&&(
        <Modal title="Add Property" icon={Building2} onClose={()=>setShowModal(false)} maxWidth={600}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
            <Input label="Property Name" required placeholder="Gharpayy Villa Koramangala" value={form.name} onChange={e=>set('name',e.target.value)}/>
            <Select label="Owner" required value={form.owner_id} onChange={e=>set('owner_id',e.target.value)}>
              <option value="">Select owner…</option>
              {owners.map(o=><option key={o.id} value={o.id}>{o.name}{o.company?` — ${o.company}`:''}</option>)}
            </Select>
            <Input label="Area / Locality" placeholder="Koramangala" value={form.area} onChange={e=>set('area',e.target.value)} icon={MapPin}/>
            <Input label="City" placeholder="Bangalore" value={form.city} onChange={e=>set('city',e.target.value)}/>
            <Input label="Full Address" placeholder="123 Main Road…" value={form.address} onChange={e=>set('address',e.target.value)} containerStyle={{ gridColumn:'span 2' }}/>
            <Select label="Who can stay?" value={form.gender_allowed} onChange={e=>set('gender_allowed',e.target.value)}>
              <option value="any">Anyone (Co-living)</option>
              <option value="male">Boys Only</option>
              <option value="female">Girls Only</option>
            </Select>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text2, marginBottom:9 }}>Amenities (select all that apply)</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {AMENITIES.map(a=>(
                <button key={a} onClick={()=>toggleAmenity(a)} style={{ padding:'5px 13px', borderRadius:99, border:`1px solid ${form.amenities.includes(a)?C.primary:C.border}`, background:form.amenities.includes(a)?C.primarySoft:C.surface2, color:form.amenities.includes(a)?C.primary:C.text2, fontSize:12, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600, transition:'all 0.12s' }}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:20 }}>
            <Btn variant="secondary" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
            <Btn onClick={addProperty} loading={saving} icon={Plus} style={{ flex:1 }}>Add Property</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}