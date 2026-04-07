import { useState } from "react";
import type { Question, Feedback } from "../types";
import CategoryBadge from "./CategoryBadge";
import ScoreCircle from "./ScoreCircle";

interface Props {
    question: Question
    index: number
    total: number
    savedAnswer?: string
    savedFeedback?: Feedback
    onSubmit: (answer: string) => void
    onNext: () => void
    onPrev: () => void
    onSkip: () => void
    loading: boolean
    error: string | null
    isLast: boolean
    onFinish: () => void
}

export default function QuestionCard({
    question, index, total, savedAnswer = '', savedFeedback, onSubmit, onNext, onPrev, onSkip, loading, error, isLast, onFinish,
}: Props) {
    const [answer, setAnswer] = useState(savedAnswer)
    const hasFeedback = !!savedFeedback
    const canSubmit = !hasFeedback && !loading

    const handleSubmit = () => {
        if (answer.trim().length < 10) return
        onSubmit(answer.trim())
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
        transition: 'background 0.12s',
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
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {[ `Question ${index + 1} / ${total}`, question.category].map((label) => (
                    <span
                        key={label}
                        style={{
                            background: 'var(--color-surface-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '5px 12px',
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        {label}
                    </span>
                ))}
            </div>

            {/* Questions */}
            <div style={card}>
                <div style={{ marginBottom: '10px' }}>
                    <CategoryBadge category={question.category} />
                </div>
                <p style={{ fontSize: '16px', lineHeight: 1.65, marginBottom: '10px' }}>
                    {question.text}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    Hint: {question.hint}
                </p>
            </div>

            {/* Text area */}
            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                readOnly={!canSubmit}
                placeholder="Type your answer here..."
                style={{
                    width: '100%',
                    minHeight: '130px',
                    padding: '12px 14px',
                    border: '1px solid var(--color-border-strong',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    background: canSubmit ? 'var(--color-surface)' : 'var(--color-surface-secondary)',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: 1.65,
                    transition: 'border-color 0.15s'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
            />

            {/* Action buttons */}
            {canSubmit && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button
                        style={{ ...btnPrimary, opacity: answer.trim().length < 10 ? 0.5 : 1 }}
                        onClick={handleSubmit}
                        disabled={answer.trim().length < 10}
                    >
                        Evaluate my answer
                    </button>
                    {index > 0 && (
                        <button style={btn} onClick={onPrev}>
                            ← Back
                        </button>
                    )}
                    <button style={{ ...btn, color: 'var(--color-text-muted)' }} onClick={onSkip}>
                        Skip →
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div
                    style={{
                        ...card,
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '14px',
                    }}
                >
                    <LoadingDots />
                    Evaluating your answer...
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div
                    style={{
                        ...card,
                        marginTop: '1rem',
                        background: 'var(--color-danger-bg)',
                        border: '1px solid #f7c1c1',
                        color: 'var(--color-danger-text)',
                        fontSize: '14px',
                    }}
                >
                    {error}
                </div>
            )}

            {/* Feedback */}
            {hasFeedback && savedFeedback && (
                <div style={{ ...card, marginTop: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <ScoreCircle score={savedFeedback.score} />
                    </div>
                    <div>
                        <p
                            style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--color-text-muted)',
                                marginBottom: '6px',
                            }}
                        >
                            Feedback
                        </p>
                        <p style={{ fontSize: '14px', lineHeight: 1.7 }}>{savedFeedback.feedback}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem' }}>
                        {isLast ? (
                            <button style={btnPrimary} onClick={onFinish}>
                                See results →
                            </button>
                        ) : (
                            <button style={btnPrimary} onClick={onNext}>
                                Next question →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function LoadingDots() {
    return (
        <span style ={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--color-accent)',
                        animation: `blink 1.2s ${i * 0.2}s infinite`,
                        display: 'inline-block',
                    }}
                />
            ))}
            <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }`}</style>
        </span>
    )
}