export interface Room {
  id: string
  code: string
  name: string
  image_url: string | null
  status: 'waiting' | 'playing' | 'finished'
  created_by: string
  template_id: string | null
  points_enabled: boolean
  created_at: string
  current_question_index: number
  question_phase: 'answering' | 'revealing'
  question_started_at: string | null
}

export interface Question {
  id: string
  room_id: string
  text: string
  type: 'yes_no' | 'multiple_choice' | 'vote_player' | 'rating' | 'text_answer'
  points: number
  order_index: number
}

export interface Player {
  id: string
  room_id: string
  nickname: string
  is_host: boolean
  created_at: string
  avatar_url?: string | null
}

export interface Answer {
  id: string
  player_id: string
  question_id: string
  value: boolean | null
  text_value: string | null
  created_at: string
}

export interface Score {
  id: string
  player_id: string
  room_id: string
  points: number
}

export interface QuestionResult {
  question: Question
  yesCount: number
  noCount: number
  total: number
  yesPercent: number
}

export interface PlayerScore {
  player: Player
  points: number
  rank: number
}

export interface GameTemplate {
  id: string
  slug: string
  name: string
  emoji: string
  description: string
  category: string
  color_from: string
  color_to: string
  question_count: number
  is_premium?: boolean
  questions?: string[]
}

export interface Badge {
  emoji: string
  label: string
  description: string
}

export type GroupLevel = 'sage' | 'curieux' | 'aventurier' | 'chaotique'
