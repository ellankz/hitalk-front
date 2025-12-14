export interface Question {
  id: string
  text: string
  options: string[]
  correctOptionIndex: number
  imageUrl?: string
}

export interface Player {
  socketId: string
  nickname: string
  score: number
  isHost: boolean
}

export interface PlayerScore {
  nickname: string
  score: number
}

export interface CreateGamePayload {
  title: string
  questions: Question[]
}

export interface JoinGamePayload {
  roomCode: string
  nickname: string
}

export interface SubmitAnswerPayload {
  gameId: string
  optionIndex: number
}

export interface GameCreatedResponse {
  gameId: string
  roomCode: string
}

export interface PlayerJoinedResponse {
  players: Player[]
}

export interface GameStartedResponse {
  currentQuestion: Question
  questionNumber: number
}

export interface QuestionStartedResponse {
  question: Question
  questionNumber: number
  totalQuestions: number
}

export interface AnswerSubmittedResponse {
  playerId: string
}

export interface QuestionResultsResponse {
  correctAnswer: number
  correctCount: number
  incorrectCount: number
  leaderboard: PlayerScore[]
}

export interface GameFinishedResponse {
  finalScores: PlayerScore[]
}

export interface ErrorResponse {
  message: string
}
