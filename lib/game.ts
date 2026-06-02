import type { QuestionResult, GroupLevel, Badge } from './types'

export function getGroupLevel(results: QuestionResult[]): GroupLevel {
  if (!results.length) return 'curieux'
  const avgYes = results.reduce((acc, r) => acc + r.yesPercent, 0) / results.length
  if (avgYes >= 75) return 'chaotique'
  if (avgYes >= 55) return 'aventurier'
  if (avgYes >= 35) return 'curieux'
  return 'sage'
}

export const GROUP_LEVEL_INFO: Record<GroupLevel, { label: string; emoji: string; description: string; color: string }> = {
  chaotique: { label: 'Chaotique', emoji: '😈', description: 'Ce groupe vit sans règles et on adore ça', color: 'rgba(239,68,68,0.25)' },
  aventurier: { label: 'Aventurier', emoji: '🔥', description: "Toujours partant pour l'imprévu", color: 'rgba(249,115,22,0.25)' },
  curieux: { label: 'Curieux', emoji: '🧐', description: 'Entre sagesse et folie... impossible à cerner', color: 'rgba(139,92,246,0.25)' },
  sage: { label: 'Sage', emoji: '😇', description: 'Les gens bien du groupe. Peut-être trop bien.', color: 'rgba(16,185,129,0.25)' },
}

export function getGroupSummary(results: QuestionResult[]): string {
  const level = getGroupLevel(results)
  const summaries: Record<GroupLevel, string[]> = {
    chaotique: [
      'Ce groupe est clairement un peu chaotique 😈',
      'Aucune règle, aucun regret. Magnifique. 🔥',
      "La définition de \"ça dépend de l'humeur\" 😂",
    ],
    aventurier: [
      'Ce groupe ose. Respect. 🙌',
      "Toujours prêts pour l'imprévu, jamais prévisibles 🎲",
      'On ne s\'ennuie clairement pas avec vous 👀',
    ],
    curieux: [
      'Ni trop sages, ni trop fous... suspects 🧐',
      'Plutôt positifs dans l\'ensemble... mais on vous surveille 👁️',
      'Un groupe qui se la joue mystérieux. On valide. 🎭',
    ],
    sage: [
      'Ce groupe est définitivement trop sage 😇',
      'Des anges. Ou des gens qui cachent bien leur jeu. 🤔',
      'Les parents rêveraient d\'amis comme vous 💼',
    ],
  }
  const arr = summaries[level]
  return arr[Math.floor(Math.random() * arr.length)]
}

export const BADGES: Badge[] = [
  { emoji: '🔥', label: 'Le plus aventurier', description: 'A répondu Oui le plus souvent' },
  { emoji: '👑', label: 'Le plus imprévisible', description: 'Ses réponses surprennent toujours' },
  { emoji: '😇', label: 'Le plus sage', description: 'A répondu Non le plus souvent' },
  { emoji: '🎭', label: 'Le plus mystérieux', description: 'Difficile à cerner' },
]

export function getControversialQuestion(results: QuestionResult[]): QuestionResult | null {
  if (!results.length) return null
  return results.reduce((most, r) => {
    return Math.abs(r.yesPercent - 50) < Math.abs(most.yesPercent - 50) ? r : most
  })
}

export function getConsensusQuestion(results: QuestionResult[]): QuestionResult | null {
  if (!results.length) return null
  return results.reduce((most, r) => {
    return Math.abs(r.yesPercent - 50) > Math.abs(most.yesPercent - 50) ? r : most
  })
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
export { generateCode }
