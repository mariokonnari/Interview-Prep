export interface Question {
    id: number
    category: string
    text: string
    hint: string
}

export interface Feedback {
    score: number
    feedback: string
}

export interface SessionResult {
    questionId: number
    answer: string
    score: number
    feedback: string
}