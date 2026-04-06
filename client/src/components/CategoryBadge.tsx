interface Props {
    category: string
}

const categoryColors: Record<string, { bg: string; color: string }> = {
    JavaScript:     { bg: '#faeeda', color: '#854F0B' },
    React:          { bg: '#e1f5ee', color: '#085041' },
    TypeScript:     { bg: '#e6f1fb', color: '#0C447C' },
    CSS:            { bg: '#fbeaf0', color: '#72243E' },
    Performance:    { bg: '#eaf3de', color: '#27500A' },
    Architecture:   { bg: '#eeedfe', color: '#3C3489' },
}

export default function CategoryBadge({ category }: Props) {
    const style = categoryColors[category] ?? { bg: '#f3f3f0', color: '#5f5e5a' }
    return (
        <span
            style={{
                background: style.bg,
                color: style.color,
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block'
            }}
        >
            {category}
        </span>
    )
}