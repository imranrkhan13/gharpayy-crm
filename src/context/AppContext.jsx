import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  supabase, leadsAPI, agentsAPI, ownersAPI, propertiesAPI,
  roomsAPI, bedsAPI, visitsAPI, bookingsAPI, notificationsAPI,
} from '../lib/supabase'

const Ctx = createContext()

export function AppProvider({ children }) {
  const [leads,         setLeads]         = useState([])
  const [agents,        setAgents]        = useState([])
  const [owners,        setOwners]        = useState([])
  const [properties,    setProperties]    = useState([])
  const [rooms,         setRooms]         = useState([])
  const [beds,          setBeds]          = useState([])
  const [visits,        setVisits]        = useState([])
  const [bookings,      setBookings]      = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [toast,         setToast]         = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [lr, ar, or_, pr, rr, br, vr, bkr, nr] = await Promise.all([
        leadsAPI.getAll(), agentsAPI.getAll(), ownersAPI.getAll(), propertiesAPI.getAll(),
        roomsAPI.getAll(), bedsAPI.getAll(), visitsAPI.getAll(), bookingsAPI.getAll(),
        notificationsAPI.getAll(),
      ])
      if (lr.error)  { setError(lr.error.message); setLoading(false); return }
      if (lr.data)   setLeads(lr.data)
      if (ar.data)   setAgents(ar.data)
      if (or_.data)  setOwners(or_.data)
      if (pr.data)   setProperties(pr.data)
      if (rr.data)   setRooms(rr.data)
      if (br.data)   setBeds(br.data)
      if (vr.data)   setVisits(vr.data)
      if (bkr.data)  setBookings(bkr.data)
      if (nr.data)   setNotifications(nr.data)
    } catch (e) {
      setError('Cannot connect. Please run SUPABASE_SETUP.sql first.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── LEADS ─────────────────────────────────────────────────────
  const createLead = useCallback(async (data) => {
    const payload = { score: 50, status: 'new', ...data }
    const { data: d, error: e } = await leadsAPI.create(payload)
    if (e) { showToast('Could not create lead: ' + e.message, 'error'); return null }
    setLeads(p => [d, ...p]); showToast('Lead created successfully!'); return d
  }, [showToast])

  const updateLead = useCallback(async (id, data) => {
    const { data: d, error: e } = await leadsAPI.update(id, data)

    if (e) {
      showToast('Update failed: ' + e.message, 'error')
      return null
    }

    if (d) {
      setLeads(prev =>
        prev.map(l =>
          l.id === id ? { ...l, ...d } : l
        )
      )
    }

    return d
  }, [showToast])

  const deleteLead = useCallback(async (id) => {
    const { error: e } = await leadsAPI.delete(id)
    if (e) { showToast('Delete failed: ' + e.message, 'error'); return false }
    setLeads(p => p.filter(l => l.id !== id)); showToast('Lead deleted'); return true
  }, [showToast])

  // ── AGENTS ────────────────────────────────────────────────────
  const createAgent = useCallback(async (data) => {
    const { data: d, error: e } = await agentsAPI.create(data)
    if (e) { showToast('Failed: ' + e.message, 'error'); return null }
    setAgents(p => [...p, d]); showToast('Team member added!'); return d
  }, [showToast])

  const updateAgent = useCallback(async (id, data) => {
    const { data: d, error: e } = await agentsAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setAgents(p => p.map(a => a.id === id ? { ...a, ...d } : a)); return d
  }, [showToast])

  const deleteAgent = useCallback(async (id) => {
    const { error: e } = await agentsAPI.delete(id)
    if (e) { showToast('Failed', 'error'); return false }
    setAgents(p => p.filter(a => a.id !== id)); showToast('Member removed'); return true
  }, [showToast])

  // ── OWNERS ────────────────────────────────────────────────────
  const createOwner = useCallback(async (data) => {
    const { data: d, error: e } = await ownersAPI.create(data)
    if (e) { showToast('Failed: ' + e.message, 'error'); return null }
    setOwners(p => [...p, d]); showToast('Owner added!'); return d
  }, [showToast])

  const updateOwner = useCallback(async (id, data) => {
    const { data: d, error: e } = await ownersAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setOwners(p => p.map(o => o.id === id ? { ...o, ...d } : o)); return d
  }, [showToast])

  const deleteOwner = useCallback(async (id) => {
    const { error: e } = await ownersAPI.delete(id)
    if (e) { showToast('Failed', 'error'); return false }
    setOwners(p => p.filter(o => o.id !== id)); showToast('Owner deleted'); return true
  }, [showToast])

  // ── PROPERTIES ───────────────────────────────────────────────
  const createProperty = useCallback(async (data) => {
    const { data: d, error: e } = await propertiesAPI.create(data)
    if (e) { showToast('Failed: ' + e.message, 'error'); return null }
    setProperties(p => [...p, d]); showToast('Property added!'); return d
  }, [showToast])

  const updateProperty = useCallback(async (id, data) => {
    const { data: d, error: e } = await propertiesAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setProperties(p => p.map(x => x.id === id ? { ...x, ...d } : x)); return d
  }, [showToast])

  const deleteProperty = useCallback(async (id) => {
    const { error: e } = await propertiesAPI.delete(id)
    if (e) { showToast('Failed', 'error'); return false }
    setProperties(p => p.filter(x => x.id !== id)); showToast('Property deleted'); return true
  }, [showToast])

  // ── ROOMS ─────────────────────────────────────────────────────
  const createRoom = useCallback(async (roomData, numBeds) => {
    const { data: newRoom, error: e } = await roomsAPI.create(roomData)
    if (e) { showToast('Failed: ' + e.message, 'error'); return null }
    const count = Math.max(1, parseInt(numBeds) || 1)
    const bedRows = Array.from({ length: count }, (_, i) => ({
      room_id: newRoom.id,
      label: String.fromCharCode(65 + i),
      status: 'vacant',
    }))
    const { data: newBeds } = await supabase.from('beds').insert(bedRows).select()
    if (newBeds) setBeds(p => [...p, ...newBeds])
    setRooms(p => [...p, newRoom])
    setProperties(p => p.map(x => x.id === roomData.property_id ? { ...x, total_rooms: (x.total_rooms || 0) + 1 } : x))
    showToast(`Room added with ${count} beds!`); return newRoom
  }, [showToast])

  const updateRoom = useCallback(async (id, data) => {
    const { data: d, error: e } = await roomsAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setRooms(p => p.map(r => r.id === id ? { ...r, ...d } : r)); return d
  }, [showToast])

  const deleteRoom = useCallback(async (id) => {
    const { error: e } = await roomsAPI.delete(id)
    if (e) { showToast('Failed', 'error'); return false }
    setRooms(p => p.filter(r => r.id !== id))
    setBeds(p => p.filter(b => b.room_id !== id))
    showToast('Room deleted'); return true
  }, [showToast])

  const updateBed = useCallback(async (id, data) => {
    const { data: d, error: e } = await bedsAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setBeds(p => p.map(b => b.id === id ? { ...b, ...d } : b)); return d
  }, [showToast])

  // ── VISITS ────────────────────────────────────────────────────
  const createVisit = useCallback(async (data) => {
    const { data: d, error: e } = await visitsAPI.create(data)
    if (e) { showToast('Failed: ' + e.message, 'error'); return null }
    await leadsAPI.update(data.lead_id, { status: 'visit_scheduled' })
    setLeads(p => p.map(l => l.id === data.lead_id ? { ...l, status: 'visit_scheduled' } : l))
    setVisits(p => [d, ...p]); showToast('Visit scheduled!'); return d
  }, [showToast])

  const updateVisit = useCallback(async (id, data) => {
    const { data: d, error: e } = await visitsAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setVisits(p => p.map(v => v.id === id ? { ...v, ...d } : v))
    if (data.outcome) {
      const visit = visits.find(v => v.id === id)
      if (visit?.lead_id) {
        const map = { booked: 'booked', considering: 'visit_completed', not_interested: 'lost' }
        const ns = map[data.outcome]
        if (ns) {
          await leadsAPI.update(visit.lead_id, { status: ns })
          setLeads(p => p.map(l => l.id === visit.lead_id ? { ...l, status: ns } : l))
        }
      }
    }
    showToast('Visit updated!'); return d
  }, [showToast, visits])

  // ── BOOKINGS ──────────────────────────────────────────────────
  const createBooking = useCallback(async (data) => {
    const { data: d, error: e } = await bookingsAPI.create(data)
    if (e) { showToast('Failed: ' + e.message, 'error'); return null }
    setBookings(p => [d, ...p])
    if (data.lead_id) {
      await leadsAPI.update(data.lead_id, { status: 'booked' })
      setLeads(p => p.map(l => l.id === data.lead_id ? { ...l, status: 'booked' } : l))
    }
    if (data.bed_id) {
      await bedsAPI.update(data.bed_id, { status: 'booked', tenant_name: data.tenant_name, move_in_date: data.move_in_date })
      setBeds(p => p.map(b => b.id === data.bed_id ? { ...b, status: 'booked', tenant_name: data.tenant_name } : b))
    }
    if (data.room_id) {
      await roomsAPI.update(data.room_id, { status: 'occupied' })
      setRooms(p => p.map(r => r.id === data.room_id ? { ...r, status: 'occupied' } : r))
    }
    showToast('Booking confirmed!'); return d
  }, [showToast])

  const updateBooking = useCallback(async (id, data) => {
    const { data: d, error: e } = await bookingsAPI.update(id, data)
    if (e) { showToast('Failed', 'error'); return null }
    setBookings(p => p.map(b => b.id === id ? { ...b, ...d } : b))
    showToast('Booking updated!'); return d
  }, [showToast])

  const stats = {
    totalLeads:      leads.length,
    newLeads:        leads.filter(l => l.status === 'new').length,
    bookedLeads:     leads.filter(l => l.status === 'booked').length,
    scheduledVisits: visits.filter(v => v.status === 'scheduled').length,
    conversionRate:  leads.length ? ((leads.filter(l => l.status === 'booked').length / leads.length) * 100).toFixed(1) : '0.0',
    totalRevenue:    bookings.reduce((s, b) => s + (Number(b.rent) || 0), 0),
    vacantBeds:      beds.filter(b => b.status === 'vacant').length,
    totalBeds:       beds.length,
    unreadNotifs:    notifications.filter(n => !n.is_read).length,
    lostLeads:       leads.filter(l => l.status === 'lost').length,
  }

  return (
    <Ctx.Provider value={{
      leads, agents, owners, properties, rooms, beds, visits, bookings, notifications,
      loading, error, toast, stats, loadAll, showToast, setNotifications,
      createLead, updateLead, deleteLead,
      createAgent, updateAgent, deleteAgent,
      createOwner, updateOwner, deleteOwner,
      createProperty, updateProperty, deleteProperty,
      createRoom, updateRoom, deleteRoom, updateBed,
      createVisit, updateVisit,
      createBooking, updateBooking,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
