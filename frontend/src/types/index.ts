export interface User {
  id: string
  email: string
}

export interface Training {
  id: string
  title: string
  description: string
}

export interface TrainingDocument {
  id: string
  training_id: string
  filename: string
  status: string
}

export interface Progress {
  id: string
  user_id: string
  training_id: string
  percentage: number
}

export interface Quiz {
  id: string
  training_id: string
  title: string
}

export interface ChunkSource {
  chunk_id: string
  chunk_text: string
  chunk_index: number
}

export interface AskResponse {
  answer: string
  sources: ChunkSource[]
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
}
