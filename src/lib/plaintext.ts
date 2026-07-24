import type { Song } from '../types'
import { formatDuration, formatSignedDuration, setlistRuntime } from './time'

interface Options {
  name: string
  songs: Song[]
  gapSeconds: number
  targetSeconds: number | null
}

/** a clean, monospace-friendly setlist for pasting to the sound engineer */
export function toPlainText({ name, songs, gapSeconds, targetSeconds }: Options): string {
  const lines: string[] = []
  lines.push(name)
  lines.push('='.repeat(Math.max(name.length, 8)))
  lines.push('')

  const width = String(songs.length).length
  songs.forEach((s, i) => {
    const num = String(i + 1).padStart(width, ' ')
    const meta = [
      formatDuration(s.duration),
      s.key,
      s.bpm != null ? `${s.bpm}bpm` : '',
      s.notes,
    ]
      .filter(Boolean)
      .join(' · ')
    lines.push(`${num}. ${s.title}${meta ? `  (${meta})` : ''}`)
  })

  const total = setlistRuntime(songs, gapSeconds)
  lines.push('')
  lines.push(`total: ${formatDuration(total)} (incl. ${gapSeconds}s gaps)`)
  if (targetSeconds != null) {
    const remaining = targetSeconds - total
    lines.push(
      `target: ${formatDuration(targetSeconds)} · ${
        remaining < 0 ? 'over by' : 'room for'
      } ${formatSignedDuration(remaining).replace(/^[+-]/, '')}`
    )
  }
  return lines.join('\n')
}
