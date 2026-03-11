import { useState } from 'react'
import { useColors } from '../context/ThemeContext'

/* ── Button ──────────────────────────────────────────────────────────────── */
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style = {}, icon: Icon, type = 'button', loading }) {
  const C = useColors()
  const [pressed, setPressed] = useState(false)

  const sizes = {
    sm: { padding: '6px 12px', fontSize: 11, height: 30 },
    md: { padding: '9px 18px', fontSize: 13, height: 38 },
    lg: { padding: '11px 24px', fontSize: 14, height: 44 },
  }
  const sz = sizes[size] || sizes.md

  const vars = {
    primary:  { bg: C.accent,       color: C.accentFg,  border: C.accent,       hover: C.text2 },
    secondary:{ bg: C.surface2,     color: C.text,      border: C.border,       hover: C.surface3 },
    danger:   { bg: C.dangerSoft,   color: C.danger,    border: C.danger+'33',  hover: C.dangerSoft },
    ghost:    { bg: 'transparent',  color: C.text2,     border: 'transparent',  hover: C.surface2 },
    success:  { bg: C.successSoft,  color: C.success,   border: C.success+'33', hover: C.successSoft },
    primary_color: { bg: C.primary, color: C.primaryFg, border: C.primary,      hover: C.primary },
  }
  const v = vars[variant] || vars.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        padding: sz.padding, height: sz.height, borderRadius: 10, border: `1px solid ${v.border}`,
        background: v.bg, color: v.color, fontSize: sz.fontSize, fontWeight: 600,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.55 : 1,
        fontFamily: "'Poppins', sans-serif",
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 0.12s cubic-bezier(.22,1,.36,1)',
        whiteSpace: 'nowrap', flexShrink: 0,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hover }}
      onMouseLeave={e => { setPressed(false); if (!disabled && !loading) e.currentTarget.style.background = v.bg }}
    >
      {loading
        ? <span style={{ width: 14, height: 14, border: `2px solid currentColor`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
        : Icon && <Icon size={sz.fontSize + 2} />
      }
      {children}
    </button>
  )
}

/* ── Input ───────────────────────────────────────────────────────────────── */
export function Input({ label, error, hint, style = {}, containerStyle = {}, icon: Icon, required, ...props }) {
  const C = useColors()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'flex', alignItems: 'center', gap: 3 }}>
          {label}{required && <span style={{ color: C.danger }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: focused ? C.primary : C.text3, pointerEvents: 'none', transition: 'color 0.15s' }} />}
        <input
          {...props}
          required={required}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); props.onBlur?.(e) }}
          style={{
            width: '100%', padding: `9px 12px 9px ${Icon ? 32 : 12}px`,
            border: `1.5px solid ${error ? C.danger : focused ? C.primary : C.border}`,
            borderRadius: 10, fontSize: 13, background: C.inputBg, color: C.text,
            outline: 'none', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: focused ? `0 0 0 3px ${error ? C.danger : C.primary}22` : 'none',
            ...style,
          }}
        />
      </div>
      {error && <span style={{ fontSize: 11, color: C.danger, display: 'flex', alignItems: 'center', gap: 3 }}>• {error}</span>}
      {hint && !error && <span style={{ fontSize: 11, color: C.text3 }}>{hint}</span>}
    </div>
  )
}

/* ── Select ──────────────────────────────────────────────────────────────── */
export function Select({ label, error, children, style = {}, containerStyle = {}, required, ...props }) {
  const C = useColors()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.text2, display: 'flex', alignItems: 'center', gap: 3 }}>
          {label}{required && <span style={{ color: C.danger }}>*</span>}
        </label>
      )}
      <select
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          width: '100%', padding: '9px 32px 9px 12px',
          border: `1.5px solid ${error ? C.danger : focused ? C.primary : C.border}`,
          borderRadius: 10, fontSize: 13, background: C.inputBg, color: C.text,
          outline: 'none', fontFamily: "'Poppins', sans-serif", cursor: 'pointer',
          boxSizing: 'border-box', appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: focused ? `0 0 0 3px ${error ? C.danger : C.primary}22` : 'none',
          ...style,
        }}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: 11, color: C.danger }}>• {error}</span>}
    </div>
  )
}

/* ── Textarea ────────────────────────────────────────────────────────────── */
export function Textarea({ label, hint, style = {}, containerStyle = {}, ...props }) {
  const C = useColors()
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>{label}</label>}
      <textarea
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          width: '100%', padding: '9px 12px',
          border: `1.5px solid ${focused ? C.primary : C.border}`,
          borderRadius: 10, fontSize: 13, background: C.inputBg, color: C.text,
          outline: 'none', fontFamily: "'Poppins', sans-serif", resize: 'vertical', minHeight: 88,
          boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: focused ? `0 0 0 3px ${C.primary}22` : 'none',
          ...style,
        }}
      />
      {hint && <span style={{ fontSize: 11, color: C.text3 }}>{hint}</span>}
    </div>
  )
}

/* ── Card ────────────────────────────────────────────────────────────────── */
export function Card({ children, style = {}, onClick, hover, padding = 18 }) {
  const C = useColors()
  return (
    <div
      onClick={onClick}
      className={hover ? 'hover-lift' : ''}
      style={{
        background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
        padding, boxShadow: C.shadow, cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onMouseEnter={hover ? e => e.currentTarget.style.boxShadow = C.shadowMd : undefined}
      onMouseLeave={hover ? e => e.currentTarget.style.boxShadow = C.shadow    : undefined}
    >
      {children}
    </div>
  )
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, maxWidth, icon: Icon }) {
  const C = useColors()
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: C.overlay, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="modal-enter"
        style={{
          background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`,
          width: '100%', maxWidth: maxWidth || 520, maxHeight: '90vh', overflowY: 'auto',
          boxShadow: C.shadowLg,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.surface, zIndex: 1, borderRadius: '18px 18px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {Icon && <div style={{ width: 32, height: 32, borderRadius: 9, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={16} color={C.primary} /></div>}
            <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: C.surface2, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.text3, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.surface3; e.currentTarget.style.color = C.text }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.text3 }}
          >✕</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
export function Badge({ color, bg, children, size = 'sm' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: size === 'lg' ? '4px 12px' : '3px 9px',
      borderRadius: 99, fontSize: size === 'lg' ? 12 : 11, fontWeight: 600,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
      color, background: bg || (color + '18'),
    }}>
      {children}
    </span>
  )
}

/* ── StatCard ────────────────────────────────────────────────────────────── */
export function StatCard({ label, value, sub, color, icon: Icon, trend, onClick }) {
  const C = useColors()
  return (
    <Card hover={!!onClick} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: color || C.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{value ?? '—'}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginTop: 6 }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{sub}</div>}
          {trend !== undefined && (
            <div style={{ fontSize: 11, color: trend >= 0 ? C.success : C.danger, marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </div>
          )}
        </div>
        {Icon && (
          <div style={{ width: 40, height: 40, borderRadius: 12, background: (color || C.primary) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color={color || C.primary} />
          </div>
        )}
      </div>
    </Card>
  )
}

/* ── ProgressBar ─────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max, color, height = 4 }) {
  const C = useColors()
  const pct = max ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ height, background: C.surface3, borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color || C.primary, borderRadius: 99, transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
    </div>
  )
}

/* ── EmptyState ──────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, message, action }) {
  const C = useColors()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      {Icon && (
        <div style={{ width: 72, height: 72, borderRadius: 20, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Icon size={32} color={C.text3} />
        </div>
      )}
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
      {message && <div style={{ fontSize: 13, color: C.text3, marginBottom: 22, maxWidth: 340, lineHeight: 1.6 }}>{message}</div>}
      {action}
    </div>
  )
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
export function Spinner({ size = 24, color }) {
  const C = useColors()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `2.5px solid ${C.border}`, borderTopColor: color || C.primary, animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
  )
}

/* ── Table ───────────────────────────────────────────────────────────────── */
export function Table({ headers, children }) {
  const C = useColors()
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: C.surface2 }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '10px 16px', fontSize: 10.5, fontWeight: 700, color: C.text3, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TR({ children, onClick, highlight }) {
  const C = useColors()
  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: `1px solid ${C.border}`, cursor: onClick ? 'pointer' : 'default', background: highlight ? C.primarySoft : 'transparent', transition: 'background 0.1s' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = C.surface2 }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.background = highlight ? C.primarySoft : 'transparent' }}
    >
      {children}
    </tr>
  )
}

export function TD({ children, style = {} }) {
  const C = useColors()
  return <td style={{ padding: '12px 16px', fontSize: 13, color: C.text, verticalAlign: 'middle', ...style }}>{children}</td>
}

/* ── PageHeader ──────────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, actions }) {
  const C = useColors()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12.5, color: C.text3, margin: '3px 0 0', lineHeight: 1.5 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>
    </div>
  )
}

/* ── Divider ─────────────────────────────────────────────────────────────── */
export function Divider({ label }) {
  const C = useColors()
  if (label) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 11, color: C.text3, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  )
  return <div style={{ height: 1, background: C.border, margin: '14px 0' }} />
}

/* ── FormRow ─────────────────────────────────────────────────────────────── */
export function FormRow({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>
  )
}

/* ── Avatar ──────────────────────────────────────────────────────────────── */
export function Avatar({ name, size = 32, color }) {
  const C = useColors()
  const colors = ['#6366f1', '#f59e0b', '#14b8a6', '#ef4444', '#22c55e', '#ec4899', '#f97316']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  const bg = color || colors[idx]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg + '22', border: `2px solid ${bg}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color: bg, flexShrink: 0 }}>
      {name ? name[0].toUpperCase() : '?'}
    </div>
  )
}

/* ── SectionTitle ────────────────────────────────────────────────────────── */
export function SectionTitle({ children, action }) {
  const C = useColors()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{children}</div>
      {action}
    </div>
  )
}

/* ── InfoRow ─────────────────────────────────────────────────────────────── */
export function InfoRow({ icon: Icon, label, value }) {
  const C = useColors()
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
      {Icon && <Icon size={14} color={C.text3} style={{ flexShrink: 0 }} />}
      <span style={{ fontSize: 12, color: C.text3, minWidth: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.text, fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  )
}
