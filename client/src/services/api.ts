const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

function getToken(): string | null {
    return localStorage.getItem('token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken()

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error ?? `Request failed: ${res.status}`)
    }

    return data as T
}

// Auth

export const authApi = {
    register: (email: string, username: string, password: string) =>
        request<{ token: string; user: User }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, username, password })
        }),
    
    login: (email: string, password: string) =>
        request<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    me: () => request<{ user: User }>('/auth/me'),
}

// Sessions

export const sessionsApi = {
    save: (results: SessionResultInput[], totalQuestions: number) =>
        request<{ session: Session }>('/sessions', {
            method: 'POST',
            body: JSON.stringify({ results, totalQuestions }),
        }),

    getAll: () => request<{ sessions: Session[] }>('/sessions'),

    getOne: (id: string) => request<{ session: Session }>(`/sessions/${id}`),
}

// Leaderboard

export const leaderboardApi = {
    getLeaderboard: () =>
        request<{ leaderboard: LeaderboardEntry[] }>('/leaderboard'),

    getMyStats: () => request<{ stats: UserStats }>('/leaderboard/my-stats'),
}

// Questions

export const questionsApi = {
    getAll: () => request<{ questions: Question[] }>('/questions'),
}

// Types

export interface User {
    id: string
    email: string
    username: string
    role: string
    createdAt: string
}

export interface SessionResultInput {
    questionId: number
    category: string
    questionText: string
    answer: string
    score: number
    feedback: string
}

export interface SessionResult extends SessionResultInput {
    id: string
    sessionId: string
}

export interface Session {
    id: string
    userId: string
    totalScore: number
    avgScore: number
    answeredCount: number
    totalQuestions: number
    completedAt: string
    results: SessionResult[]
}

export interface LeaderboardEntry {
    rank: number
    username: string
    avgScore: number
    answeredCount: number
    totalQuestions: number
    completedAt: string
}

export interface UserStats {
    totalSessions: number
    bestAvgScore: number
    overallAvgScore: number
    totalQuestionsAnswered: number
    categoryBreakdown?: {
        category: string
        avgScore: number
        questionsAnswered: number
    }[]
}

export interface Question {
    id: number
    category: string
    text: string
    hint: string
}