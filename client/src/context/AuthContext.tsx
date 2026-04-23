import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, type User } from "../services/api";

interface AuthContextValue {
    user: User | null
    token: string | null
    loading: boolean
    isAdmin: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, username: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // On mount, verify if the stored token is still valid
    useEffect(() => {
        if(!token) {
            setLoading(false)
            return
        }
        authApi
            .me()
            .then(({ user }) => setUser(user))
            .catch(() => {
                localStorage.removeItem('token')
                setToken(null)
            })
            .finally(() => setLoading(false))
    }, [token])

    const login = async (email: string, password: string) => {
        const { token: newToken, user: newUser } = await authApi.login(email, password)
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(newUser)
    }

    const register = async (email: string, username: string, password: string) => {
        const { token: newToken, user: newUser} = await authApi.register(email, username, password)
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(newUser)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value = {{ user, token, loading, isAdmin: user?.role === 'ADMIN', login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}