import { useState } from "react"
import { useApp } from "../context/AppContext"
import { useColors } from "../context/ThemeContext"
import { Card, Btn, Input, Select, Badge } from "../components/UI"
import {
  Users, Database, Info, Plus, Trash2, Eye, EyeOff,
  Copy, CheckCircle2, ShieldCheck, Zap, Globe, Github,
  Mail, MessageSquare, LifeBuoy, Terminal, Package, Lock, Unlock
} from "lucide-react"

export default function Settings() {
  const { agents, createAgent, updateAgent, deleteAgent, showToast } = useApp()
  const C = useColors()

  // --- UI & Security States ---
  const [tab, setTab] = useState("team")
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passInput, setPassInput] = useState("")
  const [showPassField, setShowPassField] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  // --- Form State ---
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "agent" })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // --- Logic Functions (Defined before use) ---
  const addAgent = async () => {
    if (!form.name.trim()) {
      showToast("Name is required", "error")
      return
    }
    setSaving(true)
    try {
      await createAgent(form)
      setForm({ name: "", email: "", phone: "", role: "agent" })
      showToast("Agent added successfully", "success")
    } catch (err) {
      showToast("Failed to add agent", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUnlock = () => {
    if (passInput === "imran.k_12") {
      setIsUnlocked(true)
      setShowSecrets(true)
      setShowPassField(false)
      setPassInput("")
      showToast("Vault unlocked", "success")
    } else {
      showToast("Incorrect master password", "error")
    }
  }

  const handleRevealClick = () => {
    if (showSecrets) {
      setShowSecrets(false)
      return
    }
    if (isUnlocked) {
      setShowSecrets(true)
    } else {
      setShowPassField(true)
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
    setShowSecrets(false)
    showToast("Credentials locked", "info")
  }

  const handleCopy = (text, id) => {
    if (!showSecrets) {
      showToast("Unlock credentials to copy", "error")
      return
    }
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const mask = (str) => "•".repeat(str?.length > 12 ? 12 : str?.length || 8)

  // --- Data Objects ---
  const TABS = [
    { id: "team", label: "Team", Icon: Users },
    { id: "system", label: "Database", Icon: Database },
    { id: "about", label: "About", Icon: Info },
  ]

  const ROLE_COLOR = { admin: "#ef4444", manager: "#f59e0b", agent: "#6366f1" }

  const DB_CONFIG = [
    { label: "Project ID", value: "dzhlruadslxfymzzjsml", id: 'pid' },
    { label: "Region", value: "ap-south-1 (Mumbai)", id: 'reg' },
    { label: "Base URL", value: "https://dzhlruadslxfymzzjsml.supabase.co", id: 'url' },
    { label: "Plan", value: "Free Tier", id: 'tier' }
  ]

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: 6, background: C.surface2, borderRadius: 14, padding: 5, width: "fit-content", marginBottom: 32, border: `1px solid ${C.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            background: tab === t.id ? C.surface : "transparent",
            color: tab === t.id ? C.text : C.text3,
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            fontFamily: "'Poppins', sans-serif",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            <t.Icon size={14} strokeWidth={tab === t.id ? 2.5 : 2} />
            {t.label}
          </button>
        ))}
      </div>

      {/* --- TEAM TAB --- */}
      {tab === "team" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <Card style={{ marginBottom: 24, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} color={C.primary} /> Add New Team Member
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
              <Input label="Full Name" placeholder="Anita Desai" value={form.name} onChange={e => set("name", e.target.value)} />
              <Input label="Email Address" placeholder="anita@gharpayy.com" value={form.email} onChange={e => set("email", e.target.value)} type="email" />
              <Input label="Phone Number" placeholder="+91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
              <Select label="Access Level" value={form.role} onChange={e => set("role", e.target.value)}>
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <Btn onClick={addAgent} loading={saving} icon={Plus}>Confirm & Add Member</Btn>
          </Card>

          <Card padding={0} style={{ border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.02)", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 14, color: C.text, display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={16} color={C.primary} /> Team Registry
              </div>
              <Badge color={C.text3} bg={C.surface2}>{agents?.length || 0} Total</Badge>
            </div>
            {agents?.length > 0 ? agents.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < agents.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${C.primary}, #8b5cf6)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff", flexShrink: 0 }}>{a.name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>{a.email || "No email"}</div>
                </div>
                <Badge color={ROLE_COLOR[a.role] || "#9ca3af"} bg={`${ROLE_COLOR[a.role]}12`}>{a.role}</Badge>
                <button onClick={() => { if (window.confirm(`Remove ${a.name}?`)) deleteAgent(a.id) }} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.danger}22`, background: C.dangerSoft, color: C.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            )) : (
              <div style={{ padding: 40, textAlign: 'center', color: C.text3, fontSize: 13 }}>No team members found.</div>
            )}
          </Card>
        </div>
      )}

      {/* --- SYSTEM TAB --- */}
      {tab === "system" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 0.3s ease" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3ecf8e, #2ea36f)', display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Database size={20} color="#fff" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Supabase Infrastructure</div>
                  <div style={{ fontSize: 11, color: C.text3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={12} /> {isUnlocked ? "Unlocked Mode" : "Locked Mode"}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {isUnlocked && (
                  <button onClick={handleLock} style={{ background: C.dangerSoft, border: `1px solid ${C.danger}33`, padding: '7px 14px', borderRadius: 10, color: C.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <Lock size={14} /> Lock Vault
                  </button>
                )}
                <button onClick={handleRevealClick} style={{ background: C.surface2, border: `1px solid ${C.border}`, padding: '7px 14px', borderRadius: 10, color: C.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                  {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showSecrets ? "Hide" : "Reveal"}
                </button>
              </div>
            </div>

            {showPassField && (
              <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: `1px dashed ${C.primary}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Lock size={18} color={C.primary} />
                <input
                  type="password"
                  placeholder="Enter master password..."
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  autoFocus
                  style={{ background: 'transparent', border: 'none', color: C.text, flex: 1, outline: 'none', fontSize: 14 }}
                />
                <button onClick={handleUnlock} style={{ background: C.primary, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Verify</button>
              </div>
            )}

            <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: 14, padding: "18px", border: `1px solid ${C.border}`, marginBottom: 18 }}>
              {DB_CONFIG.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: item.id !== 'tier' ? `1px solid rgba(255,255,255,0.03)` : 'none' }}>
                  <span style={{ fontSize: 12, color: C.text3 }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <code style={{ fontFamily: "monospace", fontSize: 13, color: showSecrets ? C.text : C.text3 }}>
                      {showSecrets ? item.value : mask(item.value)}
                    </code>
                    <button onClick={() => handleCopy(item.value, item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedKey === item.id ? '#3ecf8e' : C.text3 }}>
                      {copiedKey === item.id ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* --- ABOUT TAB --- */}
      {tab === "about" && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={32} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, color: C.text }}>Gharpayy Flow</div>
                <div style={{ fontSize: 14, color: C.text3 }}>Enterprise Booking OS • v3.4.0</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {[
                { label: "Stack", value: "React 18 + Supabase", Icon: Terminal },
                { label: "Support", value: "team@gharpayy.com", Icon: Mail },
                { label: "WhatsApp", value: "+91 84312 43397", Icon: MessageSquare },
                { label: "GitHub", value: "gharpayy-flow-private", Icon: Github },
              ].map((item, idx) => (
                <div key={idx} style={{ background: C.surface2, borderRadius: 12, padding: "14px 18px", display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ color: C.primary }}><item.Icon size={18} /></div>
                  <div>
                    <div style={{ fontSize: 11, color: C.text3, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}