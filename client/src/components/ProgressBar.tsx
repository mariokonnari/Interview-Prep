interface Props {
    current: number
    total: number
}

export default function ProgressBar({ current, total }: Props) {
    const pct = Math.round((current / total) * 100)

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            <div
                style={{
                    background: 'var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    height: '6px',
                    overflow: 'hidden',
                    marginBottom: '6px',
                }}
            >
                <div
                    style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--color-accent)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                    }}
                />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {current} of {total} answered
            </p>
        </div>
    )
}