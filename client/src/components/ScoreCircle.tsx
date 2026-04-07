interface Props {
    score: number
}

function getScoreStyle (score: number): { bg: string, color: string, label: string } {
    if (score >= 8) return { bg: '#e1f5ee', color: '#085041', label: 'Strong answer' }
    if (score >= 5) return { bg: '#faeeda', color: '854F0B', label: 'Good start' }
    return { bg: '#fcebeb', color: '#a32d2d', label: 'Needs work' }
}

export default function ScoreCircle({ score }: Props) {
    const style = getScoreStyle(score)

    return(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
                style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: style.bg,
                    color: style.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                    fontWeight: 600,
                    flexShrink: 0,
                }}
            >
                {score}/10
            </div>
            <div>
                <p style={{ fontWeight: 500, fontSize: '15px' }}>{style.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>AI evaluation</p>
            </div>
        </div>
    )
}