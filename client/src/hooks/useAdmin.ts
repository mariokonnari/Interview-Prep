import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

function getToken(): string | null {
    return localStorage.getItem('token')
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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
    if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`)
    return data as T
}

export interface AdminQuestion {
    id: number
    category: string
    text: string
    hint: string
    active: boolean
    createdBy: string
    createdAt: string
}

export interface AdminUser {
    id: string
    email: string
    username: string
    role: string
    createdAt: string
    _count: { sessions: number }
}

export function useAdmin() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    //Questions

    const getQuestions = async (): Promise<AdminQuestion[]> => {
        setLoading(true)
        try {
            const data = await adminRequest<{ questions: AdminQuestion[] }>('/admin/questions')
            return data.questions
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch questions")
            return []
        } finally {
            setLoading(false)
        }
    }

    const createQuestion = async (category: string, text: string, hint: string): Promise<boolean> => {
        setLoading(true)
        try {
            await adminRequest("/admin/questions", {
                method: 'POST',
                body: JSON.stringify({ category, text, hint }),
            })
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message: "Failed to create question")
            return false
        } finally {
            setLoading(false)
        }
    }

    const updateQuestion = async (id: number, data: Partial<AdminQuestion>): Promise<boolean> => {
        setLoading(true)
        try {
            await adminRequest(`/admin/questions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message: "Failed to update question")
            return false
        } finally {
            setLoading(false)
        }
    }

    const deleteQuestion = async (id: number): Promise<boolean> => {
        setLoading(true)
        try {
            await adminRequest(`/admin/questions/${id}`, { method: 'DELETE' })
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message: "Failed to delete questions")
            return false
        } finally {
            setLoading(false)
        }
    }

    //Users

    const getUsers = async (): Promise<AdminUser[]> => {
        setLoading(true)
        try {
            const data = await adminRequest<{ users: AdminUser[] }>('/admin/users')
            return data.users
        } catch (err) {
            setError(err instanceof Error ? err.message: "Failed to fetch users")
            return []
        } finally {
            setLoading(false)
        }
    }

    const updateUserRole = async (id: string, role: string): Promise<boolean> => {
        setLoading(true)
        try {
            await adminRequest(`/admin/users/${id}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role }),
            })
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message: "Failed to update role")
            return false
        } finally {
            setLoading(false)
        }
    }

    const deleteUser = async (id: string): Promise<boolean> => {
        setLoading(true)
        try {
            await adminRequest(`/admin/users/${id}`, { method: 'DELETE' })
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message: "Failed to delete user")
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        getQuestions,
        createQuestion,
        updateQuestion,
        deleteQuestion,
        getUsers,
        updateUserRole,
        deleteUser,
    }

}