import { useState, useEffect, useRef } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { conversationsAPI } from '../lib/supabase'
import { timeAgo } from '../lib/constants'
import { Send, Phone, MessageSquare } from 'lucide-react'

export default function Messages() {
  const { leads } = useApp()
  const C = useColors()
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgText,  setMsgText]  = useState('')
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    conversationsAPI.getByLead(selected.id).then(({ data }) => {
      if (data) setMessages(data)
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView(), 80)
    })
  }, [selected?.id])

  const send = async () => {
    if (!msgText.trim() || !selected) return
    const { data } = await conversationsAPI.send({ lead_id:selected.id, message:msgText, sender:'agent' })
    if (data) setMessages(p=>[...p, data])
    setMsgText('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
  }

  const filtered = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search))

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      <div style={{ width:264, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:10, borderBottom:`1px solid ${C.border}` }}>
          <input placeholder="Search leads…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%', padding:'8px 11px', border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:13, background:C.inputBg, color:C.text, outline:'none', fontFamily:'Poppins,sans-serif', boxSizing:'border-box' }}/>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length===0&&<div style={{ padding:20, textAlign:'center', color:C.text3, fontSize:13 }}>No leads found</div>}
          {filtered.map(lead=>(
            <div key={lead.id} onClick={()=>setSelected(lead)} style={{ display:'flex', gap:10, padding:'11px 13px', cursor:'pointer', background:selected?.id===lead.id?C.primarySoft:'transparent', borderBottom:`1px solid ${C.border}`, transition:'background 0.1s' }}
              onMouseEnter={e=>{ if(selected?.id!==lead.id) e.currentTarget.style.background=C.surface2 }}
              onMouseLeave={e=>{ if(selected?.id!==lead.id) e.currentTarget.style.background='transparent' }}
            >
              <div style={{ width:34, height:34, borderRadius:'50%', background:C.primary+'22', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:C.primary, flexShrink:0 }}>{lead.name?.[0]||'?'}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lead.name}</div>
                <div style={{ fontSize:11, color:C.text3 }}>{lead.phone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {!selected
          ? <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:C.text3 }}>
              <div style={{ width:64, height:64, borderRadius:18, background:C.surface2, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <MessageSquare size={28} color={C.text3}/>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>Select a conversation</div>
              <div style={{ fontSize:13 }}>Choose a lead from the left to start messaging</div>
            </div>
          : <>
              <div style={{ padding:'12px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, background:C.surface, flexShrink:0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:C.primary+'22', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:C.primary }}>{selected.name?.[0]||'?'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{selected.name}</div>
                  <div style={{ fontSize:12, color:C.text3 }}>{selected.phone} · {selected.location||'No area specified'}</div>
                </div>
                <a href={`tel:${selected.phone}`} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 13px', borderRadius:9, border:`1px solid ${C.border}`, fontSize:12, color:C.info, background:C.surface2, textDecoration:'none', fontWeight:600 }}><Phone size={12}/>Call</a>
                <a href={`https://wa.me/91${(selected.phone||'').replace(/\D/g,'').slice(-10)}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 13px', borderRadius:9, border:'1px solid #22c55e33', fontSize:12, color:'#22c55e', background:'#f0fdf4', textDecoration:'none', fontWeight:600 }}><MessageSquare size={12}/>WhatsApp</a>
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
                {loading&&<div style={{ textAlign:'center', color:C.text3, fontSize:13 }}>Loading messages…</div>}
                {!loading&&messages.length===0&&<div style={{ textAlign:'center', color:C.text3, fontSize:13, margin:'auto' }}>No messages yet. Start the conversation!</div>}
                {messages.map(m=>(
                  <div key={m.id} style={{ display:'flex', justifyContent:m.sender==='agent'?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'72%', padding:'10px 14px', borderRadius:13, background:m.sender==='agent'?C.primary:C.surface2, color:m.sender==='agent'?'#fff':C.text, fontSize:13, lineHeight:1.5 }}>
                      {m.message}
                      <div style={{ fontSize:9.5, opacity:0.55, marginTop:3, textAlign:'right' }}>{timeAgo(m.created_at)}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>
              <div style={{ padding:'11px 14px', borderTop:`1px solid ${C.border}`, display:'flex', gap:9, background:C.surface, flexShrink:0 }}>
                <input placeholder="Type a message and press Enter…" value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                  style={{ flex:1, padding:'10px 14px', border:`1.5px solid ${C.border}`, borderRadius:11, fontSize:13, background:C.inputBg, color:C.text, outline:'none', fontFamily:'Poppins,sans-serif' }}/>
                <button onClick={send} style={{ width:42, height:42, borderRadius:11, background:C.primary, color:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Send size={16}/>
                </button>
              </div>
            </>
        }
      </div>
    </div>
  )
}