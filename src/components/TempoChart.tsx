import { SLOW_BPM } from '../lib/analysis'

interface Props {
  points: { title: string; bpm: number }[]
  min: number
  max: number
}

/** simple, dependency-free BPM-over-the-set bar chart */
export function TempoChart({ points, min, max }: Props) {
  if (points.length === 0) {
    return <p className="text-xs text-ink-30">add bpm to songs to see tempo flow.</p>
  }

  // pad the scale a little so bars never touch the extremes
  const lo = Math.min(min, SLOW_BPM) - 8
  const hi = max + 8
  const range = Math.max(1, hi - lo)

  const barW = 14
  const gap = 6
  const height = 76
  const width = points.length * (barW + gap) - gap
  const slowY = height - ((SLOW_BPM - lo) / range) * height

  return (
    <div className="scroll-x overflow-x-auto pb-1">
      <svg
        width={Math.max(width, 40)}
        height={height + 16}
        role="img"
        aria-label="tempo across the set, in bpm"
        className="block"
      >
        {/* slow threshold marker */}
        <line
          x1={0}
          x2={Math.max(width, 40)}
          y1={slowY}
          y2={slowY}
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        {points.map((p, i) => {
          const h = Math.max(3, ((p.bpm - lo) / range) * height)
          const x = i * (barW + gap)
          const y = height - h
          const isSlow = p.bpm <= SLOW_BPM
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={isSlow ? '#f59e0b' : '#2350e6'}
                opacity={isSlow ? 0.85 : 0.9}
              >
                <title>
                  {p.title} — {p.bpm} bpm
                </title>
              </rect>
              <text
                x={x + barW / 2}
                y={height + 12}
                textAnchor="middle"
                className="fill-ink-30"
                style={{ fontSize: 8, fontFamily: 'Space Mono, monospace' }}
              >
                {p.bpm}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
