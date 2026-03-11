import { useState } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Btn, Badge } from '../components/UI'
import { stageInfo, sourceInfo, fmtDate } from '../lib/constants'
import { Zap, Upload, Search } from 'lucide-react'

export default function Historical() {
  const { leads, createLead, showToast } = useApp()
  const C = useColors()
  const [smartText, setSmartText] = useState('')
  const [parsed,    setParsed]    = useState(null)
  const [search,    setSearch]    = useState('')

  const parseText = () => {
    const phone   = smartText.match(/\d{10}/)?.[0]
    const email   = smartText.match(/[\w.+-]+@[\w.]+\.\w+/)?.[0]
    const name    = smartText.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/)?.[1]
    const budgets = smartText.match(/(\d{2,3})[kK]?\s*[-–to]+\s*(\d{2,3})[kK]?/)
    const isK     = /\d{2,3}[kK]/.test(smartText)
    const locM    = smartText.match(/(koramangala|indiranagar|hsr|btm|whitefield|marathahalli|jp\s*nagar|yelahanka|bellandur|electronic\s*city|hebbal)/i)
    if (!phone&&!name) { showToast('Could not find a phone or name in the text','warning'); return }
    setParsed({ name:name||'Unknown', phone:phone?'+91 '+phone:'', email:email||'', source:'whatsapp', location:locM?.[0]||'', budget_min:budgets?parseInt(budgets[1])*(isK?1000:1):'', budget_max:budgets?parseInt(budgets[2])*(isK?1000:1):'', notes:smartText.slice(0,500) })
  }

  const createFromParsed = async () => {
    if (!parsed?.phone) { showToast('Phone number is required','error'); return }
    await createLead(parsed); setParsed(null); setSmartText('')
  }

  const filtered = leads.filter(l => {
    const q=search.toLowerCase()
    return !q||l.name?.toLowerCase().includes(q)||l.phone?.includes(q)||l.location?.toLowerCase().includes(q)
  })

  return (
    <div style={{ padding:22 }}>
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20, alignItems:'start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.primarySoft, display:'flex', alignItems:'center', justifyContent:'center' }}><Zap size={15} color={C.primary}/></div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>Smart Lead Parser</div>
            </div>
            <div style={{ fontSize:12.5, color:C.text3, marginBottom:12, lineHeight:1.6 }}>Paste any WhatsApp message or email. We will automatically extract the name, phone number, budget and area.</div>
            <textarea
              value={smartText}
              onChange={(e) => setSmartText(e.target.value)}
              placeholder={`Paste message here...

Example:
Hi, Rahul Sharma here 9876543210
looking for PG in Koramangala
budget 12k-18k per month`}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `2px dashed ${C.border}`,
                borderRadius: 11,
                fontSize: 13,
                background: C.inputBg,
                color: C.text,
                resize: "none",
                height: 130,
                fontFamily: "Poppins, sans-serif",
                outline: "none",
                boxSizing: "border-box",
                lineHeight: 1.6
              }}
              onFocus={(e) => (e.target.style.borderColor = C.primary)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
            {parsed&&(
              <div style={{ background:C.successSoft, border:`1px solid ${C.success}33`, borderRadius:10, padding:'10px 13px', margin:'10px 0', fontSize:12 }}>
                <div style={{ fontWeight:700, color:C.success, marginBottom:6, fontSize:11 }}>PARSED SUCCESSFULLY</div>
                {Object.entries(parsed).filter(([k,v])=>k!=='notes'&&v).map(([k,v])=>(
                  <div key={k} style={{ marginBottom:3 }}><span style={{ color:C.text3 }}>{k.replace('_',' ')}: </span><span style={{ fontWeight:600, color:C.text }}>{String(v)}</span></div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              {!parsed
                ? <Btn onClick={parseText} disabled={!smartText.trim()} icon={Search} style={{ flex:1 }}>Parse Text</Btn>
                : <><Btn onClick={createFromParsed} style={{ flex:1 }}>Create Lead</Btn><Btn variant="secondary" onClick={()=>{setParsed(null);setSmartText('')}}>Clear</Btn></>
              }
            </div>
          </Card>
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.warningSoft, display:'flex', alignItems:'center', justifyContent:'center' }}><Upload size={15} color={C.warning}/></div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>CSV Import</div>
            </div>
            <div style={{ border:`2px dashed ${C.border}`, borderRadius:10, padding:24, textAlign:'center', marginBottom:10 }}>
              <Upload size={24} color={C.text3} style={{ marginBottom:10 }}/>
              <div style={{ fontSize:12.5, color:C.text3, marginBottom:10 }}>Upload a CSV file with your lead data</div>
              <Btn variant="secondary" size="sm" onClick={()=>showToast('CSV import coming soon!','info')}>Choose File</Btn>
            </div>
            <div style={{ fontSize:11, color:C.text3, lineHeight:1.6 }}>Required columns: name, phone<br/>Optional: email, source, location, budget_min, budget_max</div>
          </Card>
        </div>
        <Card padding={0}>
          <div style={{ padding:'13px 17px', borderBottom:`1px solid`, display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.text, flex:1 }}>All Leads ({filtered.length})</div>
            <input placeholder="Search leads…" value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:'7px 11px', border:`1.5px solid`, borderRadius:9, fontSize:12, background:C.inputBg, color:C.text, outline:'none', fontFamily:'Poppins,sans-serif', width:200 }}/>
          </div>
          {filtered.length===0
            ? <div style={{ padding:'40px 20px', textAlign:'center', color:C.text3, fontSize:13 }}>No leads found</div>
            : <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>
                  {['Name','Phone','Source','Stage','Area','Date Added'].map(h=>(
                    <th key={h} style={{ padding:'9px 16px', fontSize:10.5, fontWeight:700, color:C.text3, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.map(l=>(
                    <tr key={l.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:'11px 16px', fontWeight:600, color:C.text }}>{l.name}</td>
                      <td style={{ padding:'11px 16px', color:C.text2, fontSize:13 }}>{l.phone}</td>
                      <td style={{ padding:'11px 16px' }}><Badge color={sourceInfo(l.source).color}>{sourceInfo(l.source).label}</Badge></td>
                      <td style={{ padding:'11px 16px' }}><Badge color={stageInfo(l.status).color} bg={stageInfo(l.status).bg}>{stageInfo(l.status).label}</Badge></td>
                      <td style={{ padding:'11px 16px', color:C.text2, fontSize:13 }}>{l.location||'—'}</td>
                      <td style={{ padding:'11px 16px', color:C.text3, fontSize:12 }}>{fmtDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      </div>
    </div>
  )
}