export interface Room {
  id: string
  code: string
  name: string
  image_url: string | null
  status: 'waiting' | 'playing' | 'finished'
  created_by: string
  created_at: string
}

export interface Question {
  id: string
  room_id: string
  text: string
  type: 'yes_no'
  order_index: number
}

export interface Player {
  id: string
  room_id: string
  nickname: string
  is_host: boolean
  created_at: string
}

export interface Answer {
  id: string
  player_id: string
  question_id: string
  value: boolean
  created_at: string
}

export interface QuestionResult {
  question: Question
  yesCount: number
  noCount: number
  total: number
  yesPercent: number
}

export interface Badge {
  emoji: string
  label: string
  description: string
}

export type GroupLevel = 'sage' | 'curieux' | 'aventurier' | 'chaotique'
