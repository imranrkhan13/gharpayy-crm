import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Modal, Btn, Input, FormRow, Badge, EmptyState } from '../components/UI'
import { UserCheck, Plus, Phone, Mail, MapPin, Building2, Trash2 } from 'lucide-react'

export default function Owners() {
  const { owners, properties, createOwner, updateOwner, deleteOwner, showToast } = useApp()
  const C = useColors()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', company:'', phone:'', email:'', address:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const addOwner = async () => {
    if (!form.name.trim()) { showToast('Name is required','error'); return }
    setSaving(true); await createOwner(form); setSaving(false); setShowModal(false)
    setForm({ name:'', company:'', phone:'', email:'', address:'' })
  }

  const filtered = owners.filter(o => !search||o.name?.toLowerCase().includes(search.toLowerCase())||o.company?.toLowerCase().includes(search.toLowerCase())||o.phone?.includes(search))

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'flex', gap:10, marginBottom:18, alignItems:'center' }}>
        <Btn onClick={()=>setShowModal(true)} icon={Plus}>Add Owner</Btn>
        <input placeholder="Search owners…" value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:'8px 12px', border:`1.5px solid ${C.border}`, borderRadius:10, fontSize:13, background:C.inputBg, color:C.text, outline:'none', fontFamily:'Poppins,sans-serif', width:240 }}/>
        <span style={{ fontSize:12, color:C.text3 }}>{filtered.length} owners</span>
      </div>
      {filtered.length===0
        ? <EmptyState icon={UserCheck} title="No owners yet" message="Add your property owners to get started." action={<Btn onClick={()=>setShowModal(true)} icon={Plus}>Add Owner</Btn>}/>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:14 }}>
            {filtered.map(o=>{
              const propCount=properties.filter(p=>p.owner_id===o.id).length
              return (
                <Card key={o.id} hover>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{o.name}</div>
                      {o.company&&<div style={{ fontSize:12, color:C.text3, marginTop:1, fontStyle:'italic' }}>{o.company}</div>}
                    </div>
                    <Badge color={o.is_active?C.success:'#9ca3af'} bg={o.is_active?C.successSoft:C.surface2}>{o.is_active?'Active':'Inactive'}</Badge>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                    {o.phone&&<div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:C.text2 }}><Phone size={12} color={C.text3}/>{o.phone}</div>}
                    {o.email&&<div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:C.text2 }}><Mail size={12} color={C.text3}/>{o.email}</div>}
                    {o.address&&<div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:C.text2 }}><MapPin size={12} color={C.text3}/>{o.address}</div>}
                    <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:C.text2 }}><Building2 size={12} color={C.text3}/>{propCount} {propCount===1?'property':'properties'}</div>
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    <button onClick={()=>updateOwner(o.id,{is_active:!o.is_active})} style={{ flex:1, padding:'7px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface2, color:C.text2, fontSize:12, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600 }}>{o.is_active?'Deactivate':'Reactivate'}</button>
                    <button onClick={()=>{if(window.confirm(`Delete ${o.name}?`))deleteOwner(o.id)}} style={{ width:34, height:34, borderRadius:8, border:`1px solid ${C.danger}33`, background:C.dangerSoft, color:C.danger, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={14}/></button>
                  </div>
                </Card>
              )
            })}
          </div>
      }
      {showModal&&(
        <Modal title="Add Owner" icon={UserCheck} onClose={()=>setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <FormRow>
              <Input label="Full Name" required placeholder="Rajesh Kumar" value={form.name} onChange={e=>set('name',e.target.value)} icon={UserCheck}/>
              <Input label="Company / Brand" placeholder="Kumar Properties" value={form.company} onChange={e=>set('company',e.target.value)} icon={Building2}/>
            </FormRow>
            <FormRow>
              <Input label="Phone" placeholder="9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)} icon={Phone}/>
              <Input label="Email" placeholder="owner@gmail.com" value={form.email} onChange={e=>set('email',e.target.value)} icon={Mail} type="email"/>
            </FormRow>
            <Input label="Address" placeholder="Full address…" value={form.address} onChange={e=>set('address',e.target.value)} icon={MapPin}/>
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="secondary" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
              <Btn onClick={addOwner} loading={saving} icon={Plus} style={{ flex:1 }}>Add Owner</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}