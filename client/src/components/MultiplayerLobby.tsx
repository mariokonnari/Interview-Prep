import { useState } from "react";
import { roomsApi, type Room } from "../services/api";

interface Props {
    onRoomJoined: (room: Room) => void
    onBack: () => void
}

export default function MultiplayerLobby({ onRoomJoined, onBack }: Props) {
    const [mode, setMode] = useState<'choose' | 'join'>('choose')
    const [joinCode, setJoinCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        setLoading(true)
        setError(null)
        try {
            const { room } = await roomsApi.create()
            onRoomJoined(room)
        } catch (err) {
            setError(err instanceof Error ? err.message: 'Failed to create room')
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async () => {
        if (!joinCode.trim()) return
        setLoading(true)
        setError(null)
        try {
            const { room } = await roomsApi.join(joinCode.trim())
            onRoomJoined(room)
        } catch (err) {
            setError(err instanceof Error ? err.message: 'Failed to join room')
        } finally {
            setLoading(false)
        }
    }

    const card: React.CSSProperties = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1rem'
    }

    const btn: React.CSSProperties = {
        padding: '8px 18px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-strong)',
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
    }

    const btnPrimary: React.CSSProperties = {
        ...btn,
        background: 'var(--color-accent)',
        color: '#fff',
        border: '1px solid var(--color-accent-hover)',
        fontWeight: 500,
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
                    Multiplayer
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Challenge a friend to a live interview session.
                </p>
            </div>

            {error && (
                <p style={{
                    fontSize: '13px',
                    color: 'var(--color-danger-text)',
                    background: 'var(--color-danger-bg)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                }}>
                    {error}
                </p>
            )}

            {mode === 'choose' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={card}>
                        <p style={{ fontWeight: 500, marginBottom: '6px' }}>
                            Create a room
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Start a session and share the code with a friend.
                        </p>
                        <button style={btnPrimary} onClick={handleCreate} disabled={loading}>
                            {loading ? 'Creating...' : 'Create room'}
                        </button>
                    </div>

                    <div style={card}>
                        <p style={{ fontWeight: 500, marginBottom: '6px' }}>
                            Join a room
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Enter a 6-character code to join a friend's session.
                        </p>
                        <button style={btn} onClick={() => setMode('join')}>
                            Enter code →
                        </button>
                    </div>

                    <button style={{ ...btn, alignSelf: 'flex-start' }} onClick={onBack}>
                        ← Back to practice
                    </button>
                </div>
            )}

            {mode === 'join' && (
                <div style={card}>
                    <p style={{ fontWeight: 500, marginBottom: '12px' }}>Enter room code</p>
                    <input
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleJoin() }}
                        placeholder="e.g. A3X9K2"
                        maxLength={6}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid var(--color-border-strong)',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '20px',
                            letterSpacing: '0.15em',
                            textAlign: 'center',
                            color: 'var(--color-text-primary)',
                            background: 'var(--color-surrface)',
                            outline: 'none',
                            marginBottom: '12px',
                            display: 'block',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            style={{ ...btnPrimary, opacity: joinCode.length < 6 ? 0.5 : 1 }}
                            onClick={handleJoin}
                            disabled={loading || joinCode.length < 6}
                        >
                            {loading ? 'Joining...' : 'Join room'}
                        </button>
                        <button style={btn} onClick={() => setMode('choose')}>
                            Back
                        </button>
                    </div>    
                </div>
            )}
        </div>
    )
}