export interface Room {
  id: string
  code: string
  name: string
  image_url: string | null
  created_at: string
}

export interface Question {
  id: string
  room_id: string
  text: string
}

export interface User {
  id: string
  room_id: string
  nickname: string
  created_at: string
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  value: boolean
}
