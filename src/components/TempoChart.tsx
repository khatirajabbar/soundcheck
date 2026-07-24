import { SLOW_BPM } from '../lib/analysis'

interface Props {
  points: { title: string; bpm: number }[]
  min: number
  max: number
  /** banter gap between songs, in seconds */
  gapSeconds?: number
  /** when true (and gapSeconds > 0), draw a marker between bars for the gap */
  showGaps?: boolean
}

const BAR_W = 16
const BASE_GAP = 6
const GAP_REGION = 22 // horizontal room reserved for a gap marker
const HEIGHT = 76

/** simple, dependency-free BPM-over-the-set bar chart */
export function TempoChart({ points, min, max, gapSeconds = 0, showGaps = false }: Props) {
  if (points.length === 0) {
    return <p className="text-xs text-ink-30">add bpm to songs to see tempo flow.</p>
  }

  const withGaps = showGaps && gapSeconds > 0 && points.length > 1

  // pad the scale a little so bars never touch the extremes
  const lo = Math.min(min, SLOW_BPM) - 8
  const hi = max + 8
  const range = Math.max(1, hi - lo)
  const slowY = HEIGHT - ((SLOW_BPM - lo) / range) * HEIGHT

  // lay bars (and, between them, gap markers) out left to right
  const bars: { x: number; title: string; bpm: number }[] = []
  const gapCenters: number[] = []
  let x = 0
  points.forEach((p, i) => {
    bars.push({ x, ...p })
    x += BAR_W
    if (i < points.length - 1) {
      if (withGaps) {
        gapCenters.push(x + GAP_REGION / 2)
        x += GAP_REGION
      } else {
        x += BASE_GAP
      }
    }
  })
  const width = Math.max(x, 40)

  return (
    <div className="scroll-x overflow-x-auto pb-1">
      <svg
        width={width}
        height={HEIGHT + 18}
        role="img"
        aria-label={`tempo across the set in bpm${withGaps ? `, with ${gapSeconds}s gaps between songs` : ''}`}
        className="block"
      >
        {/* slow threshold marker */}
        <line
          x1={0}
          x2={width}
          y1={slowY}
          y2={slowY}
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.6}
        />

        {/* gap markers between songs */}
        {gapCenters.map((cx, i) => (
          <g key={`gap-${i}`}>
            <line
              x1={cx}
              x2={cx}
              y1={HEIGHT * 0.4}
              y2={HEIGHT}
              stroke="#9ca3af"
              strokeWidth={1}
              strokeDasharray="2 2"
            >
              <title>{gapSeconds}s gap</title>
            </line>
            <text
              x={cx}
              y={HEIGHT + 14}
              textAnchor="middle"
              className="fill-ink-30"
              style={{ fontSize: 7.5, fontFamily: 'Space Mono, monospace' }}
            >
              {gapSeconds}s
            </text>
          </g>
        ))}

        {/* song bars */}
        {bars.map((b, i) => {
          const h = Math.max(3, ((b.bpm - lo) / range) * HEIGHT)
          const y = HEIGHT - h
          const isSlow = b.bpm <= SLOW_BPM
          return (
            <g key={i}>
              <rect
                x={b.x}
                y={y}
                width={BAR_W}
                height={h}
                rx={3}
                fill={isSlow ? '#f59e0b' : '#2350e6'}
                opacity={isSlow ? 0.85 : 0.9}
              >
                <title>
                  {b.title} — {b.bpm} bpm
                </title>
              </rect>
              <text
                x={b.x + BAR_W / 2}
                y={HEIGHT + 14}
                textAnchor="middle"
                className="fill-ink-30"
                style={{ fontSize: 8, fontFamily: 'Space Mono, monospace' }}
              >
                {b.bpm}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
