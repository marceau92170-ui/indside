export type ThemeId = 'tropical' | 'citrus'

export interface Theme {
  id: ThemeId
  name: string
  emoji: string
  from: string
  mid: string
  to: string
  glowFrom: string
  glowTo: string
}

export const THEMES: Theme[] = [
  {
    id: 'tropical',
    name: 'Tropical nuit',
    emoji: '🌺',
    from: '#FF006E',
    mid: '#FB5607',
    to: '#FFBE0B',
    glowFrom: 'rgba(255,0,110,0.22)',
    glowTo: 'rgba(255,190,11,0.16)',
  },
  {
    id: 'citrus',
    name: 'Citrus',
    emoji: '🍋',
    from: '#FFD60A',
    mid: '#FF9F1C',
    to: '#FF4365',
    glowFrom: 'rgba(255,214,10,0.20)',
    glowTo: 'rgba(255,67,101,0.16)',
  },
]

export function getThemeId(): ThemeId {
  if (typeof window === 'undefined') return 'tropical'
  return (localStorage.getItem('flower_theme') as ThemeId) || 'tropical'
}

export function getTheme(): Theme {
  const id = getThemeId()
  return THEMES.find(t => t.id === id) || THEMES[0]
}

export function setTheme(id: ThemeId): void {
  localStorage.setItem('flower_theme', id)
}

export function gradient(theme: Theme): string {
  return `linear-gradient(135deg, ${theme.from}, ${theme.mid}, ${theme.to})`
}

export function gradientShadow(theme: Theme): string {
  return `0 12px 40px ${theme.from}55`
}
