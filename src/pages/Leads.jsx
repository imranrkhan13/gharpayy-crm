import { useState, useMemo } from 'react'
import { useApp }    from '../context/AppContext'
import { useColors } from '../context/ThemeContext'
import { Card, Table, TR, TD, Btn, Select, Input, EmptyState, Badge, Avatar } from '../components/UI'
import LeadPanel from '../components/LeadPanel'
import { STAGES, SOURCES, stageInfo, sourceInfo, scoreColor, timeAgo } from '../lib/constants'
import { Plus, Search, Phone, MessageSquare, Users } from 'lucide-react'

export default function Leads() {
  const { leads, agents, updateLead } = useApp()
  const C = useColors()
  const [search, setSearch]             = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterStage,  setFilterStage]  = useState('all')
  const [sort,         setSort]         = useState('newest')
  const [openLead,     setOpenLead]     = useState(null)
  const [isNew,        setIsNew]        = useState(false)
  

  const filtered = useMemo(() => {
    let ls = leads.filter(l => {
      const q = search.toLowerCase()
      return (!q || l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.location?.toLowerCase().includes(q))
        && (filterSource === 'all' || l.source === filterSource)
        && (filterStage  === 'all' || l.status === filterStage)
    })
    if (sort === 'newest') ls = [...ls].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
    if (sort === 'score')  ls = [...ls].sort((a,b)=>(b.score||0)-(a.score||0))
    if (sort === 'name')   ls = [...ls].sort((a,b)=>(a.name||'').localeCompare(b.name||''))
    return ls
  }, [leads, search, filterSource, filterStage, sort])
  

  const close = () => { setOpenLead(null); setIsNew(false) }
  

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      <div style={{ flex:1, overflow:'auto', padding:22 }}>
        <div style={{ display:'flex', gap:9, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
          <Btn onClick={() => { setIsNew(true); setOpenLead(null) }} icon={Plus}>Add Lead</Btn>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#a8a29e', pointerEvents:'none' }} />
            <input placeholder="Search name, phone, area..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:'100%', padding:'8px 12px 8px 32px', border:`1.5px solid`, borderRadius:10, fontSize:13, background:'var(--ib)', color:'inherit', outline:'none', fontFamily:'Poppins,sans-serif', boxSizing:'border-box' }} />
          </div>
          <Select value={filterSource} onChange={e=>setFilterSource(e.target.value)} style={{ width:150 }}>
            <option value="all">All Sources</option>
            {SOURCES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <Select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{ width:170 }}>
            <option value="all">All Stages</option>
            {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <Select value={sort} onChange={e=>setSort(e.target.value)} style={{ width:140 }}>
            <option value="newest">Newest First</option>
            <option value="score">Highest Score</option>
            <option value="name">Name A–Z</option>
          </Select>
          <span style={{ fontSize:12 }}>{filtered.length} results</span>
        </div>
        <Card padding={0}>
          {filtered.length === 0
            ? <EmptyState icon={Users} title="No leads found"
                message={leads.length===0?"Add your first lead to get started.":"Try changing your search or filters."}
                action={leads.length===0?<Btn onClick={()=>{setIsNew(true);setOpenLead(null)}} icon={Plus}>Add Your First Lead</Btn>:null}
              />
            : <Table headers={["","Name","Phone","Source","Stage","Score","Agent","Area","Added","Actions"]}>
                {filtered.map(lead=>{
                  const agent = agents.find(a => a.id === lead.agent_id)
                  const stage=stageInfo(lead.status)
                  const src=sourceInfo(lead.source)
                  return (
                    <TR key={lead.id} onClick={()=>{setOpenLead(lead);setIsNew(false)}}>
                      <TD style={{width:14}}><div style={{width:7,height:7,borderRadius:'50%',background:stage.color}}/></TD>
                      <TD>
                        <div style={{display:'flex',alignItems:'center',gap:9}}>
                          <Avatar name={lead.name} size={28}/>
                          <span style={{fontWeight:600}}>{lead.name}</span>
                        </div>
                      </TD>
                      <TD>{lead.phone}</TD>
                      <TD><Badge color={src.color}>{src.label}</Badge></TD>
                      <TD>
                        <div style={{display:'flex',alignItems:'center',gap:6}} onClick={e=>e.stopPropagation()}>
                          <Badge color={stage.color} bg={stage.bg}>{stage.label}</Badge>
                          <select value={lead.status} onChange={async e=>{e.stopPropagation();await updateLead(lead.id,{status:e.target.value})}}
                            style={{fontSize:10,padding:'2px 5px',border:'1px solid',borderRadius:6,background:'inherit',color:'inherit',cursor:'pointer'}}>
                            {STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                      </TD>
                      <TD><span style={{fontWeight:700,color:scoreColor(lead.score)}}>{lead.score||'—'}</span></TD>
                      <TD>{agent ? agent.name.split(' ')[0] : '—'}</TD>
                      <TD>{lead.location||'—'}</TD>
                      <TD style={{fontSize:12}}>{timeAgo(lead.created_at)}</TD>
                      <TD>
                        <div style={{display:'flex',gap:5}} onClick={e=>e.stopPropagation()}>
                          <a href={`tel:${lead.phone}`} style={{width:28,height:28,borderRadius:7,border:'1px solid',fontSize:11,color:'#2563eb',background:'#eff6ff',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}><Phone size={12}/></a>
                          <a href={`https://wa.me/91${(lead.phone||'').replace(/\D/g,'').slice(-10)}`} target="_blank" rel="noreferrer" style={{width:28,height:28,borderRadius:7,border:'1px solid #22c55e33',fontSize:11,color:'#22c55e',background:'#f0fdf4',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center'}}><MessageSquare size={12}/></a>
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </Table>
          }
        </Card>
      </div>
      {(openLead||isNew)&&<LeadPanel lead={openLead} isNew={isNew} onClose={close} onCreate={nl=>{setIsNew(false);setOpenLead(nl)}}/>}
    </div>
  )
}