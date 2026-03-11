export const STAGES = [
  { id: 'new',                   label: 'New Lead',           color: '#6366f1', bg: '#eef2ff' },
  { id: 'contacted',             label: 'Contacted',          color: '#f59e0b', bg: '#fffbeb' },
  { id: 'requirement_collected', label: 'Requirement Done',   color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'property_suggested',    label: 'Property Shown',     color: '#06b6d4', bg: '#ecfeff' },
  { id: 'visit_scheduled',       label: 'Visit Scheduled',    color: '#14b8a6', bg: '#f0fdfa' },
  { id: 'visit_completed',       label: 'Visit Done',         color: '#0ea5e9', bg: '#f0f9ff' },
  { id: 'booked',                label: 'Booked',             color: '#22c55e', bg: '#f0fdf4' },
  { id: 'lost',                  label: 'Lost',               color: '#ef4444', bg: '#fef2f2' },
]

export const SOURCES = [
  { id: 'whatsapp',     label: 'WhatsApp',      color: '#22c55e' },
  { id: 'phone',        label: 'Phone Call',    color: '#f59e0b' },
  { id: 'website',      label: 'Website',       color: '#3b82f6' },
  { id: 'instagram',    label: 'Instagram',     color: '#ec4899' },
  { id: 'facebook',     label: 'Facebook',      color: '#6366f1' },
  { id: 'landing_page', label: 'Landing Page',  color: '#06b6d4' },
  { id: 'referral',     label: 'Referral',      color: '#f97316' },
  { id: 'other',        label: 'Other',         color: '#9ca3af' },
]

export const ROOM_TYPES = ['Private', '2 Sharing', '3 Sharing', '4 Sharing', 'Dorm']
export const AMENITIES  = ['WiFi', 'Food Included', 'Laundry', 'AC', 'Parking', 'Gym', '24/7 Security', 'TV', 'Attached Bathroom', 'Water Purifier', 'CCTV', 'Power Backup']

export const stageInfo  = (s) => STAGES.find(x => x.id === s)  || { label: s || 'Unknown', color: '#9ca3af', bg: '#f3f4f6' }
export const sourceInfo = (s) => SOURCES.find(x => x.id === s) || { label: s || 'Unknown', color: '#9ca3af' }

export const scoreColor = (n) => {
  if (!n) return '#9ca3af'
  if (n >= 70) return '#22c55e'
  if (n >= 40) return '#f59e0b'
  return '#ef4444'
}

export function timeAgo(ts) {
  if (!ts) return '—'
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000)    return 'just now'
  if (d < 3600000)  return Math.floor(d / 60000)   + 'm ago'
  if (d < 86400000) return Math.floor(d / 3600000) + 'h ago'
  if (d < 604800000) return Math.floor(d / 86400000) + 'd ago'
  return Math.floor(d / 604800000) + 'w ago'
}
export function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function fmtDateTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
export function fmtCurrency(n) {
  if (n === null || n === undefined || n === '') return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}
export function fmtK(n) {
  if (!n) return '0'
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L'
  if (n >= 1000)   return (n / 1000).toFixed(1) + 'K'
  return String(n)
}
