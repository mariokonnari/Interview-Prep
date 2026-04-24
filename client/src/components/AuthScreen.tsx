import { useState } from "react";
import { useAuth } from "../context/AuthContext";

type AuthMode = 'login' | 'register'

export default function AuthScreen() {
    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { login, register } = useAuth()

    const handleSubmit = async () => {
        setError(null)
        setLoading(true)
        try {
            if (mode === 'login') {
                await login(email, password)
            } else {
                await register(email, username, password)
            }
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const layout: React.CSSProperties = {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '2rem 1.25rem',
    }

    const card: React.CSSProperties = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
    }

    const input: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--color-border-strong)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        background: 'var(--color-surface)',
        outline: 'none',
        marginBottom: '12px',
        display: 'block',
    }

    const btnPrimary: React.CSSProperties = { 
        width: '100%',
        padding: '10px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-accent-hover)',
        background: 'var(--color-accent)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        marginTop: '4px',
    }

    return (
        <div style={layout}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
                    Frontend interview prep
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {mode === 'login' ? 'Sign in to track your progress' : 'Create an account to get started' }
                </p>
            </header>

            <div style={card}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                    {(['login', 'register'] as AuthMode[]).map((m) =>(
                        <button
                            key={m}
                            onClick={() => { setMode(m); setError(null) }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border-strong)',
                                background: mode === m ? 'var(--color-accent)' : 'var(--color-surface)',
                                color: mode === m ? '#fff' : 'var(--color-text-secondary)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: mode === m ? 500 : 400,
                            }}
                        >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={input}
                />

                {mode === 'register' && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={input}
                    />
                )}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                    style={input}
                />

                {error && (
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--color-danger-text)',
                        background: 'var(--color-danger-bg)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '12px',
                    }}>
                        {error}
                    </p>
                )}

                <button
                    style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </button>
            </div>
        </div>
    )
}