export const NOX_COMMENTS = {
  lobby: [
    "La meute se rassemble.",
    "Intéressant.",
    "Ça commence à devenir sérieux.",
  ],
  gameStart: [
    "Voyons ce que vous cachez vraiment.",
    "Ça commence.",
    "Je vous observe.",
    "Les révélations approchent.",
  ],
  reveal_consensus: [
    "Vous pensez pareil.",
    "La meute est unie.",
    "Sans surprise.",
  ],
  reveal_divided: [
    "Personne n'est d'accord.",
    "Cette question a fait des dégâts.",
    "Intéressant.",
    "Je ne l'avais pas vu venir.",
  ],
  reveal_surprising: [
    "Incroyable.",
    "Je ne m'y attendais pas.",
    "Voilà qui est révélateur.",
    "Vous êtes imprévisibles.",
  ],
  podium: [
    "La meute a parlé.",
    "Bien joué.",
    "Les vérités ont été révélées.",
  ],
  doubleBonus: [
    "Ce moment change tout.",
    "La question qui fait mal.",
    "Attention.",
  ],
}

export function getNoxComment(category: keyof typeof NOX_COMMENTS): string {
  const pool = NOX_COMMENTS[category]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRevealComment(yesPercent: number): string {
  if (yesPercent >= 80 || yesPercent <= 20) return getNoxComment('reveal_consensus')
  if (yesPercent >= 60 || yesPercent <= 40) return getNoxComment('reveal_divided')
  return getNoxComment('reveal_surprising')
}
