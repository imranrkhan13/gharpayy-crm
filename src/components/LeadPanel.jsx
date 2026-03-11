import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { activityAPI, conversationsAPI, tasksAPI } from '../lib/supabase'
import { Btn, Input, Select, Textarea, Divider, Avatar, FormRow, Badge } from './UI'
import { STAGES, SOURCES, stageInfo, sourceInfo, timeAgo } from '../lib/constants'
import {
  X, Phone, MessageSquare, User, MapPin, DollarSign, Briefcase,
  StickyNote, Send, Edit3, Trash2, Save, Clock, Star
} from 'lucide-react'

export default function LeadPanel({ lead, onClose, isNew = false, onCreate }) {
  const C = useColors()
  const { agents, createLead, updateLead, deleteLead, showToast } = useApp()
  const [tab, setTab]           = useState('info')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [activity, setActivity] = useState([])
  const [messages, setMessages] = useState([])
  const [note, setNote]         = useState('')
  const [msgText, setMsgText]   = useState('')
  const [tasks, setTasks] = useState([])
  const [taskText, setTaskText] = useState('')

  const blank = { name: '', phone: '', email: '', source: 'whatsapp', status: 'new', agent_id: '', location: '', budget_min: '', budget_max: '', pg_type: 'Any', notes: '', score: 50 }
  const [form, setForm] = useState(lead ? { ...blank, ...lead } : blank)
  useEffect(() => {
    if (lead) {
      setForm({ ...blank, ...lead })
    } else {
      setForm(blank)
    }
  }, [lead])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!lead?.id) return
    activityAPI.getByLead(lead.id).then(({ data }) => { if (data) setActivity(data) })
    conversationsAPI.getByLead(lead.id).then(({ data }) => { if (data) setMessages(data) })
  }, [lead?.id])
  useEffect(() => {
    if (!lead?.id) return

    tasksAPI.getByLead(lead.id).then(({ data }) => {
      if (data) setTasks(data)
    })

  }, [lead?.id])

  const save = async () => {
    if (!form.name?.trim()) { showToast('Name is required', 'error'); return }
    if (!form.phone?.trim()) { showToast('Phone number is required', 'error'); return }
    setSaving(true)
    try {
      if (isNew) {
        const nl = await createLead(form)
        if (nl && onCreate) onCreate(nl)
        if (nl) onClose()
      } else {
        await updateLead(lead.id, form)
        showToast('Lead updated!')
        onClose()
      }
    } finally { setSaving(false) }
  }

  const addNote = async () => {
    if (!note.trim() || !lead?.id) return
    const { data } = await activityAPI.create({ lead_id: lead.id, action: 'note', description: note })
    if (data) setActivity(p => [data, ...p])
    await updateLead(lead.id, { last_activity_at: new Date().toISOString() })
    setNote('')
    showToast('Note saved')
  }

  const sendMsg = async () => {
    if (!msgText.trim() || !lead?.id) return
    const { data } = await conversationsAPI.send({ lead_id: lead.id, message: msgText, sender: 'agent' })
    if (data) setMessages(p => [...p, data])
    setMsgText('')
  }

  const handleDelete = async () => {
    setDeleting(true)
    await deleteLead(lead.id)
    setDeleting(false)
    onClose()
  }
  const addTask = async () => {
    if (!taskText.trim() || !lead?.id) return

    const { data } = await tasksAPI.create({
      lead_id: lead.id,
      agent_id: form.agent_id,
      title: taskText
    })

    if (data) setTasks(p => [...p, data])
    setTaskText('')
  }

  const toggleTask = async (task) => {
    const { data } = await tasksAPI.update(task.id, {
      completed: !task.completed
    })

    if (data) {
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      )
    }
  }

  const stage = stageInfo(form.status)
  const src   = sourceInfo(form.source)

  const TABS = [
    { id: 'info', label: 'Details' },
    { id: 'activity', label: `Notes (${activity.length})` },
    { id: 'messages', label: `Chat (${messages.length})` },
    { id: 'tasks', label: 'Tasks' },
  ]

  return (
    <div
      className="slide-enter"
      style={{ width: 400, minWidth: 380, height: '100%', background: C.surface, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: isNew ? 0 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar name={form.name || '?'} size={40} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{form.name || 'New Lead'}</div>
              {!isNew && <div style={{ fontSize: 12, color: C.text3, marginTop: 1 }}>{form.phone}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 8, background: C.surface2, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.surface3 }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface2 }}
          >
            <X size={13} />
          </button>
        </div>

        {!isNew && (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <Badge color={stage.color} bg={stage.bg}>{stage.label}</Badge>
              <Badge color={src.color}>{src.label}</Badge>
              {form.score && <Badge color='#f59e0b'><Star size={9} style={{ marginRight: 3 }} />{form.score}</Badge>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <a href={`tel:${form.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, color: C.info, background: C.surface2, textDecoration: 'none', fontWeight: 600, transition: 'all 0.12s' }}>
                <Phone size={12} /> Call Now
              </a>
              <a href={`https://wa.me/91${(form.phone || '').replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 8, border: '1px solid #22c55e33', fontSize: 12, color: '#22c55e', background: '#f0fdf4', textDecoration: 'none', fontWeight: 600, transition: 'all 0.12s' }}>
                <MessageSquare size={12} /> WhatsApp
              </a>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      {!isNew && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.surface2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '10px 4px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? C.primary : 'transparent'}`, color: tab === t.id ? C.primary : C.text3, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {!isNew && tab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Input Section */}
          <div style={{
            display: 'flex',
            gap: 10,
            background: C.surface2,
            padding: '8px 8px 8px 16px',
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            margin: '10px'
          }}>
            <input
              placeholder="What's the next step?..."
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: C.text,
                fontSize: 14,
                fontFamily: 'inherit'
              }}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <Btn
              onClick={addTask}
              style={{ borderRadius: 10, padding: '8px 16px', fontSize: 13 }}
            >
              Add Task
            </Btn>
          </div>

          {/* Task List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: C.text3, fontSize: 13 }}>
                No pending tasks for this lead.
              </div>
            ) : (
              tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t)} // Make the whole row clickable
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: t.completed ? 'transparent' : C.surface,
                    borderRadius: 12,
                    border: `1px solid ${t.completed ? 'transparent' : C.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: t.completed ? 0.5 : 1
                  }}
                >
                  {/* Custom Checkbox Replacement */}
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${t.completed ? C.success : C.text3}`,
                    background: t.completed ? C.success : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.2s'
                  }}>
                    {t.completed && <div style={{ width: 6, height: 10, border: 'solid white', borderWidth: '0 2px 2px 0', transform: 'rotate(45deg)', marginBottom: 2 }} />}
                  </div>

                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: t.completed ? C.text3 : C.text,
                    textDecoration: t.completed ? 'line-through' : 'none',
                    transition: '0.2s'
                  }}>
                    {t.title}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {/* INFO / FORM */}
        {(isNew || tab === 'info') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FormRow>
              <Input label="Full Name" required placeholder="Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} icon={User} />
              <Input label="Phone Number" required placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} icon={Phone} />
            </FormRow>
            <Input label="Email Address" placeholder="rahul@gmail.com" value={form.email || ''} onChange={e => set('email', e.target.value)} type="email" />
            <FormRow>
              <Select label="Lead Source" value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
              <Select label="Looking For" value={form.pg_type || 'Any'} onChange={e => set('pg_type', e.target.value)}>
                <option value="Boys">Boys PG</option>
                <option value="Girls">Girls PG</option>
                <option value="Any">Any / Co-living</option>
              </Select>
            </FormRow>
            <Input label="Preferred Area" placeholder="Koramangala, HSR Layout…" value={form.location || ''} onChange={e => set('location', e.target.value)} icon={MapPin} />
            <FormRow>
              <Input label="Min Budget (₹/month)" type="number" placeholder="8000" value={form.budget_min || ''} onChange={e => set('budget_min', e.target.value)} icon={DollarSign} />
              <Input label="Max Budget (₹/month)" type="number" placeholder="15000" value={form.budget_max || ''} onChange={e => set('budget_max', e.target.value)} icon={DollarSign} />
            </FormRow>
            {!isNew && (
              <Select label="Pipeline Stage" value={form.status} onChange={e => set('status', e.target.value)}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
            )}
            <Select label="Assigned Agent" value={form.agent_id || ''} onChange={e => set('agent_id', e.target.value)}>
              <option value="">Unassigned</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Input label="Lead Score (0–100)" type="number" min="0" max="100" placeholder="50" value={form.score || ''} onChange={e => set('score', e.target.value)} icon={Star} hint="Higher score = hotter lead. Affects leaderboard." />
            <Textarea label="Notes" placeholder="Any additional context…" value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
            <Divider />
            <div style={{ display: 'flex', gap: 8 }}>
              {!isNew && <Btn variant="danger" onClick={() => setConfirmDel(true)} icon={Trash2}>Delete</Btn>}
              <Btn onClick={save} loading={saving} icon={isNew ? undefined : Save} style={{ flex: 1 }}>
                {isNew ? 'Create Lead' : 'Save Changes'}
              </Btn>
            </div>
          </div>
        )}

        {/* ACTIVITY / NOTES */}
        {!isNew && tab === 'activity' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                placeholder="Add a note or call summary…"
                value={note}
                onChange={e => setNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addNote()}
                style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, background: C.inputBg, color: C.text, outline: 'none', fontFamily: "'Poppins', sans-serif" }}
              />
              <Btn size="sm" onClick={addNote} icon={Edit3}>Save</Btn>
            </div>
            {activity.length === 0
              ? <div style={{ textAlign: 'center', color: C.text3, fontSize: 13, padding: 32 }}>No notes yet — add the first one!</div>
              : activity.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: C.primarySoft, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: 1 }}>
                    {a.action === 'note' ? <StickyNote size={11} color={C.primary} /> : <Clock size={11} color={C.text3} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{a.description}</div>
                    <div style={{ fontSize: 10.5, color: C.text3, marginTop: 3 }}>{timeAgo(a.created_at)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* MESSAGES */}
        {!isNew && tab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 300 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
              {messages.length === 0
                ? <div style={{ textAlign: 'center', color: C.text3, fontSize: 13, padding: 32 }}>No messages yet. Start the conversation!</div>
                : messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'agent' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '9px 13px', borderRadius: 12, background: m.sender === 'agent' ? C.primary : C.surface2, color: m.sender === 'agent' ? '#fff' : C.text, fontSize: 13, lineHeight: 1.5 }}>
                      {m.message}
                      <div style={{ fontSize: 9.5, opacity: 0.55, marginTop: 3, textAlign: 'right' }}>{timeAgo(m.created_at)}</div>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Type and press Enter…"
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                style={{ flex: 1, padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 13, background: C.inputBg, color: C.text, outline: 'none', fontFamily: "'Poppins', sans-serif" }}
              />
              <Btn size="sm" onClick={sendMsg} icon={Send}>Send</Btn>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Overlay */}
      {confirmDel && (
        <div style={{ position: 'absolute', inset: 0, background: C.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 10, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 290, border: `1px solid ${C.border}`, boxShadow: C.shadowLg }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.dangerSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Trash2 size={20} color={C.danger} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 8 }}>Delete Lead?</div>
            <div style={{ fontSize: 13, color: C.text2, marginBottom: 20, lineHeight: 1.6 }}>
              This will permanently delete <strong>{form.name}</strong> and all their data. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 9 }}>
              <Btn variant="secondary" onClick={() => setConfirmDel(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} loading={deleting} icon={Trash2} style={{ flex: 1 }}>Delete</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
