import { useState, useEffect } from "react";
import { useRoom } from "../hooks/useRoom";
import { useGroq } from "../hooks/useGroq";
import { useAuth } from "../context/AuthContext";
import { type Room, type Question } from "../services/api";
import ScoreCircle from "./ScoreCircle";
import CategoryBadge from "./CategoryBadge";

interface Props {
    initialRoom: Room
    questions: Question[]
    onLeave: () => void
}

interface ParticipantAnswer {
    username: string
    answer: string
    score: number | null
    feedback: string | null
    submittedAt: Date | null
}

export default function MultiplayerSession({ initialRoom, questions, onLeave }: Props) {
    const { user } = useAuth()
    const { room, advance, finish } = useRoom(initialRoom.code)
    const { evaluate, loading: evaluating } = useGroq()
    const [answer, setAnswer] = useState('')
    const [myResult, setMyResult] = useState<{ score: Number; feedback: string } | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [participantAnswers, setParticipantAnswers] = useState
        Map<stringify, ParticipantAnswer>
    >(new Map())

    const currentRoom = room ?? initialRoom
    const isHost = currentRoom.hostId === user?.id
    const currentQuestion = questions[currentRoom.currentQ]
    const participants = currentRoom.participants ?? []
    const bothSubmitted = 
        participantAnswers.size === participants.length &&
        Array.from(participantAnswers.values()).every((p) => p.score !== null)

    // Reset answer state when question changes
    useEffect(() => {
        setAnswer('')
        setMyResult(null)
        setSubmitted(false)
    }, [currentRoom.currentQ])

    const handleSubmit = async () => {
        if (!answer.trim() || submitted || !currentQuestion) return
        setSubmitted(true)

        const feedback = await evaluate(currentQuestion.text, answer.trim())
        if (feedback && user) {
            setMyResult(feedback)
            setParticipantAnswers((prev) => {
                const next = new Map(prev)
                next.set(user.id, {
                    username: user.username,
                    answer: answer.trim(),
                    score: feedback.score,
                    feedback: feedback.feedback,
                    submittedAt: new Date(),
                })
                return next
            })
        }
    }

    const handleAdvance = async () => {
        if (currentRoom.currentQ < questions.length -1) {
            await advance()
        } else {
            await finish()
        }
    }

    const card: React.CSSProperties = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1rem',
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

    //waiting for guest to join
    if (currentRoom.status === 'waiting') {
        return (
            <div>
                <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                        Share this code with your friend
                    </p>
                    <p style={{
                        fontSize: '42px',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                        letterSpacing: '0.2em',
                        color: 'var(--color-accent)',
                        marginBottom: '12px',
                    }}>
                        {currentRoom.code}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Waiting for opponent to join...
                    </p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                            {[0, 1, 2].map((i) => (
                                <span key={i} style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--color-accent)',
                                    display: 'inline-block',
                                    animation: `blink 1.2s ${i * 0.2}s infinite`,
                                }}/>
                            ))}
                        </div>
                        <style>{`@keyframes blink {0%,80%,100%{opacity:0.2} 40%{opacity:1} }`}</style>
                    </div>
                </div>
                <button style={btn} onClick={onLeave}>Cancel</button>
            </div>
        )
    }

    //session finished
    if (currentRoom.status === 'finished') {
        return (
            <div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 500, paddingBottom: '4px' }}>
                        Session finished
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                        Good game! Here are the final results.
                    </p>
                </div>
                {Array.from(participantAnswers.values()).map((p) => (
                    <div key={p.username} style={card}>
                        <p style={{ fontWeight: 500, marginBottom: '8px' }}>@{p.username}</p>
                        {p.score !== null && <ScoreCircle score={p.score} />}
                    </div>
                ))}
                <button style={btnPrimary} onClick={onLeave}>
                    Back to practice
                </button>
            </div>
        )
    }

    //active session
    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {participants.map((p) => (
                        <span key={p.id} style={{
                            fontSize: '13px',
                            background: 'var(--color-surface-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '4px 12px',
                            color: participantAnswers.has(p.user.id) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        }}>
                            @{p.user.username} {participantAnswers.has(p.user.id) ? '✓' : '...'}
                        </span>
                    ))}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Q{currentRoom.currentQ + 1} / {questions.length}
                </span>
            </div>

            {/* Question */}
            {currentQuestion && (
                <div></div>
            )}
        </div>
    )
}