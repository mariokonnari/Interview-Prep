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
    const [participantAnswers, setParticipantAnswers] = useState<Map<string, ParticipantAnswer>>(new Map<string, ParticipantAnswer>())

    const currentRoom = room ?? initialRoom
    const isHost = currentRoom.hostId === user?.id
    const currentQuestion = questions[currentRoom.currentQ]
    const participants = currentRoom.participants ?? []
    const bothSubmitted = 
        participantAnswers.size === participants.length &&
        Array.from(participantAnswers.values()).every((p: ParticipantAnswer) => p.score !== null)

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
            setParticipantAnswers((prev: Map<string, ParticipantAnswer>) => {
                const next = new Map<string, ParticipantAnswer>(prev)
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
                {Array.from(participantAnswers.values()).map((p: ParticipantAnswer) => (
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
                <div style={card}>
                    <div style={{ marginBottom: '10px'}}>
                        <CategoryBadge category={currentQuestion.category} />
                    </div>
                    <p style={{ fontSize: '16px', lineHeight: 1.65, marginBottom: '8px' }}>
                        {currentQuestion.text}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Hint: {currentQuestion.hint}
                    </p>
                </div>
            )}

            {/* Answer input */}
            {!submitted && (
                <>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '12px 14px',
                            border: '1px solid var(--color-border-strong)',
                            borderRadius: 'var(--radius-md)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            color: 'var(--color-text-primary)',
                            background: 'var(--color-surface)',
                            resize: 'vertical',
                            outline: 'none',
                            lineHeight: 1.65,
                            marginBottom: '10px'
                        }}
                    />
                    <button
                        style={{ ...btnPrimary, opacity: answer.trim().length < 10 || evaluating ? 0.5 : 1 }}
                        onClick={handleSubmit}
                        disabled={answer.trim().length < 10 || evaluating}
                    >
                        {evaluating ? 'Evaluating...' : 'Submit answer'}
                    </button>
                </>
            )}

            {/* My result */}
            {myResult && (
                <div style={{ ...card, marginTop: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <ScoreCircle score={myResult.score as number} />
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: 1.7 }}>{myResult.feedback}</p>
                </div>
            )}

            {/* Waiting for other players */}
            {submitted && !bothSubmitted && (
                <div style={{ ...card, marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '14px'}}>
                    Waiting for other players to submit...
                </div>
            )}

            {/* Both submitted - show all results */}
            {bothSubmitted && (
                <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: 500, marginBottom: '1rem', fontSize: '15px' }}>
                        Both answers submitted
                    </p>
                    {Array.from(participantAnswers.values()).map((p: ParticipantAnswer) => (
                        <div key={p.username} style={{ ...card, marginBottom: '8px' }}>
                            <p style={{ fontWeight: 500, marginBottom: '8px', fontSize: '14px'}}>
                                @{p.username}
                            </p>
                            {p.score !== null && <ScoreCircle score={p.score} />}
                            {p.feedback && (
                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
                                    {p.feedback}
                                </p>
                            )}
                        </div>
                    ))}
                    {isHost && (
                        <button style={btnPrimary} onClick={handleAdvance}>
                            {currentRoom.currentQ < questions.length -1 ? 'Next question →' : 'Finish session →'}
                        </button>
                    )}
                    {!isHost && (
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            Waiting for host to advance...
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}