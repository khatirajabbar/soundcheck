import type { Song } from '../types'
import { formatDuration, setlistRuntime } from '../lib/time'

interface Props {
  name: string
  songs: Song[]
  gapSeconds: number
}

/**
 * Hidden on screen, shown only when printing. Deliberately large type so a
 * printed page can be taped to the stage floor and read at a glance.
 */
export function PrintSheet({ name, songs, gapSeconds }: Props) {
  const total = setlistRuntime(songs, gapSeconds)
  return (
    <div className="print-only text-black">
      <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 4 }}>{name}</h1>
      <p style={{ fontSize: 14, marginBottom: 20, color: '#444' }}>
        {songs.length} songs · {formatDuration(total)}
      </p>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {songs.map((s, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              padding: '10px 0',
              borderBottom: '2px solid #111',
              breakInside: 'avoid',
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700, width: 40 }}>{i + 1}</span>
            <span style={{ fontSize: 28, fontWeight: 700, flex: 1 }}>{s.title}</span>
            <span style={{ fontSize: 18, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {[s.key, s.bpm != null ? `${s.bpm}bpm` : '', formatDuration(s.duration)]
                .filter(Boolean)
                .join('  ')}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
