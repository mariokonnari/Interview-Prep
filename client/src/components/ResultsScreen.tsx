import type { Question, SessionResult } from "../types"
import CategoryBadge from "./CategoryBadge"

interface Props {
    questions: Question[]
    results: Map<number, SessionResult>
    onRestart: () => void
}

function getScoreStyle(score: number) {
    if (score >= 8) return { bg: '#e1f5ee', color: '#085041' }
    if (score >= 5) return { bg: '#faeeda', color: '#854F0B' }
    return { bg: '#fcebeb', color: '#a32d2d'}
}

export default function ResultsScreen({ questions, results, onRestart }: Props) {
    const answered = Array.from(results.values())
    const avg = 
        answered.length > 0
            ? (answered.reduce((sum, r) => sum + r.score, 0) / answered.length).toFixed(1)
            : '-'
    const strong = answered.filter((r) => r.score >= 8).length
    const weak = answered.filter((r) => r.score < 5).length

    const card: React.CSSProperties = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--rradius-lg)',
        padding: '1.25rem',
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
                    Session complete
                </h2>
                <p style={{ color: 'var(--color-text-secondary', fontSize: '14px' }}>
                    You answered {answered.length} of {questions.length} questions.
                </p>
            </div>

            {/* Summary Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '8px',
                    marginBottom: '1.5rem',
                }}
            >
                {[
                    { value: avg, label: 'Avg score' },
                    { value: String(strong), label: 'Strong (8+)', color: '#085041', bg: '#e1f5ee' },
                    { value: String(weak), label: 'Needs work', color: '#a32d2d', bg: '#fcebeb' },
                    { value: String(answered.length), label: 'Answered' }
                ].map(({ value, label, color, bg }) => (
                    <div
                        key={label}
                        style={{
                            background: bg ?? 'var(--color-surface-secondary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '22px',
                                fontWeight: 500,
                                color: color ?? 'var(--color-text-primary)',
                            }}
                        >
                            {value}
                        </p>
                        <p
                            style={{
                                fontSize: '11px',
                                color: color ?? 'var(--color-text-muted)',
                                marginTop: '2px',
                            }}
                        >
                            {label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Per-question breakdown */}
            <div style={card}>
                {questions.map((q) => {
                    const result = results.get(q.id)
                    if (!result) return null
                    const style = getScoreStyle(result.score)
                    return (
                        <div
                            key={q.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px 0',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            <span
                                style={{
                                    background: style.bg,
                                    color: style.color,
                                    borderRadius: '4px',
                                    padding: '2px 7px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    minWidth: '42px',
                                    textAlign: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {result.score}/10
                            </span>
                            <span style={{ fontSize: '13px', flex: 1, lineHeight: 1.5 }}>
                                {q.text.length > 70 ? q.text.slice(0, 70) + '...' : q.text}
                            </span>
                            <span style={{ flexShrink: 0}}>
                                <CategoryBadge category={q.category} />
                            </span>
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <button style={btnPrimary} onClick={onRestart}>
                    Practice again
                </button>
            </div>
        </div>
    )
}