import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Modal, Btn, Select, Input, FormRow, Table, TR, TD, EmptyState, Badge, StatCard } from '../components/UI'
import { fmtCurrency, fmtDate } from '../lib/constants'
import { BookOpen, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function Bookings() {
  const { bookings, leads, properties, rooms, beds, agents, createBooking, updateBooking, showToast } = useApp()
  const C = useColors()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ lead_id:'', property_id:'', room_id:'', bed_id:'', rent:'', deposit:'', move_in_date:'', status:'confirmed', payment_status:'pending', notes:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleRoomChange = rid => {
    set('room_id', rid); set('bed_id', '')
    const room=rooms.find(r=>r.id===rid)
    if (room?.rent_per_bed) set('rent', room.rent_per_bed)
  }
  const availableRooms = rooms.filter(r=>r.property_id===form.property_id)
  const availableBeds  = beds.filter(b=>b.room_id===form.room_id&&b.status==='vacant')

  const createBk = async () => {
    if (!form.lead_id||!form.property_id) { showToast('Lead and property are required','error'); return }
    if (!form.rent) { showToast('Rent amount is required','error'); return }
    setSaving(true)
    const lead=leads.find(l=>l.id===form.lead_id)
    await createBooking({ ...form, rent:Number(form.rent), deposit:Number(form.deposit||0), tenant_name:lead?.name, tenant_phone:lead?.phone })
    setSaving(false); setShowModal(false)
    setForm({ lead_id:'', property_id:'', room_id:'', bed_id:'', rent:'', deposit:'', move_in_date:'', status:'confirmed', payment_status:'pending', notes:'' })
  }

  const filtered = bookings.filter(b=>filter==='all'||b.status===filter)
  const totalRev = bookings.filter(b=>b.status!=='cancelled').reduce((s,b)=>s+(Number(b.rent)||0),0)
  const STATUS_COLORS  = { confirmed:'#22c55e', pending:'#f59e0b', active:'#3b82f6', checked_out:'#9ca3af', cancelled:'#ef4444' }
  const PAYMENT_COLORS = { paid:'#22c55e', partial:'#f59e0b', pending:'#9ca3af', overdue:'#ef4444' }

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:12, marginBottom:20 }}>
        <StatCard label="Total Bookings" value={bookings.length} icon={BookOpen}/>
        <StatCard label="Pending"  value={bookings.filter(b=>b.status==='pending').length}   icon={Clock}         color={C.warning}/>
        <StatCard label="Confirmed" value={bookings.filter(b=>b.status==='confirmed').length} icon={CheckCircle}  color={C.success}/>
        <StatCard label="Active"   value={bookings.filter(b=>b.status==='active').length}    icon={AlertCircle}   color={C.info}/>
        <StatCard label="Revenue"  value={fmtCurrency(totalRev)}                             icon={DollarSign}    color={C.success}/>
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <Btn onClick={()=>setShowModal(true)} icon={BookOpen}>New Booking</Btn>
        <Select value={filter} onChange={e=>setFilter(e.target.value)} style={{ width:170 }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <span style={{ fontSize:12, color:C.text3 }}>{filtered.length} bookings</span>
      </div>
      <Card padding={0}>
        {filtered.length===0
          ? <EmptyState icon={BookOpen} title="No bookings yet" message="Create your first booking." action={<Btn onClick={()=>setShowModal(true)}>New Booking</Btn>}/>
          : <Table headers={["Tenant","Phone","Property","Room","Rent","Move-in","Status","Payment","Update"]}>
              {filtered.map(b=>{
                const lead=leads.find(l=>l.id===b.lead_id)||b.lead
                const prop=properties.find(p=>p.id===b.property_id)||b.property
                const room=rooms.find(r=>r.id===b.room_id)||b.room
                return (
                  <TR key={b.id}>
                    <TD><span style={{ fontWeight:600 }}>{b.tenant_name||lead?.name||'—'}</span></TD>
                    <TD>{b.tenant_phone||lead?.phone||'—'}</TD>
                    <TD><div style={{ fontWeight:500 }}>{prop?.name||'—'}</div><div style={{ fontSize:11, color:C.text3 }}>{prop?.area}</div></TD>
                    <TD>{room?.name||'—'}</TD>
                    <TD><span style={{ fontWeight:700, color:C.success }}>{fmtCurrency(b.rent)}</span></TD>
                    <TD style={{ fontSize:12 }}>{fmtDate(b.move_in_date)}</TD>
                    <TD><Badge color={STATUS_COLORS[b.status]||'#9ca3af'}>{b.status||'pending'}</Badge></TD>
                    <TD><Badge color={PAYMENT_COLORS[b.payment_status]||'#9ca3af'}>{b.payment_status||'pending'}</Badge></TD>
                    <TD>
                      <div style={{ display:'flex', gap:5 }}>
                        <select value={b.status||'pending'} onChange={e=>updateBooking(b.id,{status:e.target.value})} style={{ fontSize:11, padding:'4px 6px', border:'1px solid', borderRadius:7, background:'inherit', color:'inherit', cursor:'pointer' }}>
                          <option value="pending">pending</option><option value="confirmed">confirmed</option><option value="active">active</option><option value="checked_out">checked_out</option><option value="cancelled">cancelled</option>
                        </select>
                        <select value={b.payment_status||'pending'} onChange={e=>updateBooking(b.id,{payment_status:e.target.value})} style={{ fontSize:11, padding:'4px 6px', border:'1px solid', borderRadius:7, background:'inherit', color:'inherit', cursor:'pointer' }}>
                          <option value="pending">pending</option><option value="partial">partial</option><option value="paid">paid</option><option value="overdue">overdue</option>
                        </select>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </Table>
        }
      </Card>
      {showModal&&(
        <Modal title="New Booking" icon={BookOpen} onClose={()=>setShowModal(false)} maxWidth={620}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
            <Select label="Lead (Tenant)" required value={form.lead_id} onChange={e=>set('lead_id',e.target.value)}>
              <option value="">Select lead…</option>
              {leads.map(l=><option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
            </Select>
            <Select label="Property" required value={form.property_id} onChange={e=>{set('property_id',e.target.value);set('room_id','');set('bed_id','');set('rent','')}}>
              <option value="">Select property…</option>
              {properties.map(p=><option key={p.id} value={p.id}>{p.name} — {p.area}</option>)}
            </Select>
            <Select label="Room" value={form.room_id} onChange={e=>handleRoomChange(e.target.value)}>
              <option value="">Select room…</option>
              {availableRooms.map(r=><option key={r.id} value={r.id}>{r.name} — ₹{(r.rent_per_bed||0).toLocaleString('en-IN')}/bed</option>)}
            </Select>
            <Select label="Bed" value={form.bed_id} onChange={e=>set('bed_id',e.target.value)}>
              <option value="">Select bed…</option>
              {availableBeds.map(b=><option key={b.id} value={b.id}>Bed {b.label} (vacant)</option>)}
            </Select>
            <Input label="Monthly Rent (₹)" required type="number" placeholder="12000" value={form.rent} onChange={e=>set('rent',e.target.value)} icon={DollarSign}/>
            <Input label="Security Deposit (₹)" type="number" placeholder="24000" value={form.deposit} onChange={e=>set('deposit',e.target.value)} icon={DollarSign}/>
            <Input label="Move-in Date" type="date" value={form.move_in_date} onChange={e=>set('move_in_date',e.target.value)}/>
            <Select label="Payment Status" value={form.payment_status} onChange={e=>set('payment_status',e.target.value)}>
              <option value="pending">Pending</option><option value="paid">Paid</option><option value="partial">Partial</option>
            </Select>
          </div>
          <div style={{ marginTop:13 }}><Input label="Notes" placeholder="Any extra info…" value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <Btn variant="secondary" onClick={()=>setShowModal(false)} style={{ flex:1 }}>Cancel</Btn>
            <Btn onClick={createBk} loading={saving} icon={CheckCircle} style={{ flex:1 }}>Confirm Booking</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}