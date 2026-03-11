import { createContext, useContext, useState, useEffect } from 'react'

const Ctx = createContext()

export const LIGHT = {
  bg:          '#f8f7f4',
  surface:     '#ffffff',
  surface2:    '#f3f2ef',
  surface3:    '#eae9e5',
  border:      '#e5e4e0',
  border2:     '#d4d3cf',
  text:        '#1a1917',
  text2:       '#57534e',
  text3:       '#a8a29e',
  accent:      '#1a1917',
  accentFg:    '#ffffff',
  accentSoft:  '#f3f2ef',
  primary:     '#6366f1',
  primaryFg:   '#ffffff',
  primarySoft: '#eef2ff',
  success:     '#16a34a',
  successSoft: '#f0fdf4',
  danger:      '#dc2626',
  dangerSoft:  '#fef2f2',
  warning:     '#d97706',
  warningSoft: '#fffbeb',
  info:        '#2563eb',
  infoSoft:    '#eff6ff',
  shadow:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowMd:    '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg:    '0 12px 40px rgba(0,0,0,0.12)',
  overlay:     'rgba(0,0,0,0.4)',
  navBg:       '#1a1917',
  navText:     'rgba(255,255,255,0.45)',
  navActive:   '#2a2825',
  navActiveText: '#ffffff',
  inputBg:     '#ffffff',
  inputFocus:  '#6366f1',
  skBase:      '#f0efeb',
  skShine:     '#e4e3df',
}

export const DARK = {
  bg:          '#0f0e0c',
  surface:     '#1a1917',
  surface2:    '#211f1d',
  surface3:    '#2a2825',
  border:      '#2e2c28',
  border2:     '#3d3b36',
  text:        '#f0ede8',
  text2:       '#a8a29e',
  text3:       '#57534e',
  accent:      '#f0ede8',
  accentFg:    '#1a1917',
  accentSoft:  '#2a2825',
  primary:     '#818cf8',
  primaryFg:   '#1e1b4b',
  primarySoft: '#1e1b4b',
  success:     '#4ade80',
  successSoft: '#052e16',
  danger:      '#f87171',
  dangerSoft:  '#450a0a',
  warning:     '#fbbf24',
  warningSoft: '#451a03',
  info:        '#60a5fa',
  infoSoft:    '#172554',
  shadow:      '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  shadowMd:    '0 4px 12px rgba(0,0,0,0.4)',
  shadowLg:    '0 12px 40px rgba(0,0,0,0.5)',
  overlay:     'rgba(0,0,0,0.65)',
  navBg:       '#0d0c0a',
  navText:     'rgba(255,255,255,0.35)',
  navActive:   '#1a1917',
  navActiveText: '#f0ede8',
  inputBg:     '#1a1917',
  inputFocus:  '#818cf8',
  skBase:      '#211f1d',
  skShine:     '#2a2825',
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('gp_theme') || 'light')
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  useEffect(() => {
    localStorage.setItem('gp_theme', theme)
    document.documentElement.style.setProperty('--sk-base', theme === 'light' ? LIGHT.skBase : DARK.skBase)
    document.documentElement.style.setProperty('--sk-shine', theme === 'light' ? LIGHT.skShine : DARK.skShine)
  }, [theme])
  return <Ctx.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>{children}</Ctx.Provider>
}

export const useTheme  = () => useContext(Ctx)
export const useColors = () => {
  const { isDark } = useTheme()
  return isDark ? DARK : LIGHT
}
