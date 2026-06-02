import type { QuestionResult, GroupLevel, Badge, PlayerScore, Player, Answer, Question } from './types'

export function getGroupLevel(results: QuestionResult[]): GroupLevel {
  if (!results.length) return 'curieux'
  const avgYes = results.reduce((acc, r) => acc + r.yesPercent, 0) / results.length
  if (avgYes >= 75) return 'chaotique'
  if (avgYes >= 55) return 'aventurier'
  if (avgYes >= 35) return 'curieux'
  return 'sage'
}

export const GROUP_LEVEL_INFO: Record<GroupLevel, { label: string; emoji: string; description: string; colorFrom: string; colorTo: string }> = {
  chaotique: { label: 'Chaotique', emoji: '😈', description: 'Ce groupe vit sans règles et on adore ça', colorFrom: '#ef4444', colorTo: '#f97316' },
  aventurier: { label: 'Aventurier', emoji: '🔥', description: "Toujours partant pour l'imprévu", colorFrom: '#f97316', colorTo: '#f59e0b' },
  curieux: { label: 'Curieux', emoji: '🧐', description: 'Entre sagesse et folie… impossible à cerner', colorFrom: '#8b5cf6', colorTo: '#3b82f6' },
  sage: { label: 'Sage', emoji: '😇', description: 'Les gens bien du groupe. Peut-être trop bien.', colorFrom: '#10b981', colorTo: '#06b6d4' },
}

export function getGroupSummary(results: QuestionResult[]): string {
  const level = getGroupLevel(results)
  const map: Record<GroupLevel, string[]> = {
    chaotique: ['Ce groupe est clairement un peu chaotique 😈', 'Aucune règle, aucun regret. Magnifique. 🔥', "La définition de \"ça dépend de l'humeur\" 😂"],
    aventurier: ['Ce groupe ose. Respect. 🙌', "Toujours prêts pour l'imprévu 🎲", "On ne s'ennuie clairement pas avec vous 👀"],
    curieux: ['Ni trop sages, ni trop fous… suspects 🧐', "Plutôt positifs dans l'ensemble… mais on vous surveille 👁️", 'Un groupe qui se la joue mystérieux. On valide. 🎭'],
    sage: ['Ce groupe est définitivement trop sage 😇', 'Des anges. Ou des gens qui cachent bien leur jeu. 🤔', 'Les parents rêveraient d\'amis comme vous 💼'],
  }
  const arr = map[level]
  return arr[Math.floor(Math.random() * arr.length)]
}

export const BADGES: Badge[] = [
  { emoji: '🔥', label: 'Le plus audacieux', description: 'A répondu Oui le plus souvent' },
  { emoji: '👑', label: 'MVP du groupe', description: 'Le meilleur score de la partie' },
  { emoji: '😇', label: 'Le plus sage', description: 'A répondu Non le plus souvent' },
  { emoji: '🎯', label: 'Le plus précis', description: 'Toujours dans la majorité' },
  { emoji: '🕵️', label: 'Détective du groupe', description: 'A deviné les réponses des autres' },
  { emoji: '😂', label: 'Le plus drôle', description: 'Ses réponses ont surpris tout le monde' },
]

export function getControversialQuestion(results: QuestionResult[]): QuestionResult | null {
  if (!results.length) return null
  return results.reduce((a, b) => Math.abs(b.yesPercent - 50) < Math.abs(a.yesPercent - 50) ? b : a)
}

export function getConsensusQuestion(results: QuestionResult[]): QuestionResult | null {
  if (!results.length) return null
  return results.reduce((a, b) => Math.abs(b.yesPercent - 50) > Math.abs(a.yesPercent - 50) ? b : a)
}

export function calculateScores(
  players: Player[],
  questions: Question[],
  answers: Answer[],
  pointsEnabled: boolean
): PlayerScore[] {
  if (!pointsEnabled) return players.map((p, i) => ({ player: p, points: 0, rank: i + 1 }))

  const playerPoints: Record<string, number> = {}
  players.forEach(p => { playerPoints[p.id] = 0 })

  // +1 point per answer (participation)
  answers.forEach(a => {
    if (playerPoints[a.player_id] !== undefined) {
      playerPoints[a.player_id] += 1
    }
  })

  // Bonus: +5 if answered like the majority on each question
  questions.forEach(q => {
    const qAnswers = answers.filter(a => a.question_id === q.id)
    const yesCount = qAnswers.filter(a => a.value === true).length
    const noCount = qAnswers.length - yesCount
    const majorityValue = yesCount >= noCount ? true : false
    qAnswers.forEach(a => {
      if (a.value === majorityValue && playerPoints[a.player_id] !== undefined) {
        playerPoints[a.player_id] += 5
      }
    })
  })

  const scored = players.map(p => ({ player: p, points: playerPoints[p.id] ?? 0, rank: 0 }))
  scored.sort((a, b) => b.points - a.points)
  scored.forEach((s, i) => { s.rank = i + 1 })
  return scored
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
