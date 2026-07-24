import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Song } from '../types'
import { formatDuration } from '../lib/time'

interface Props {
  id: string
  index: number
  song: Song
  isSlow?: boolean
  onRemove: () => void
}

export function SetlistItem({ id, index, song, isSlow, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-white px-2 py-2.5 ${
        isDragging ? 'relative z-10 rounded-lg shadow-lg ring-1 ring-accent/40' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`reorder ${song.title}`}
        className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-ink-30 transition hover:text-ink-50 active:cursor-grabbing"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
          <circle cx="3.5" cy="2" r="1.1" />
          <circle cx="8.5" cy="2" r="1.1" />
          <circle cx="3.5" cy="6" r="1.1" />
          <circle cx="8.5" cy="6" r="1.1" />
          <circle cx="3.5" cy="10" r="1.1" />
          <circle cx="8.5" cy="10" r="1.1" />
        </svg>
      </button>

      <span className="tnum w-6 shrink-0 text-right text-xs text-ink-30">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{song.title}</p>
        <p className="tnum mt-0.5 text-xs text-ink-50">
          {formatDuration(song.duration)}
          {song.key && <> · {song.key}</>}
          {song.bpm != null && (
            <>
              {' '}
              ·{' '}
              <span className={isSlow ? 'font-semibold text-amber-600' : ''}>
                {song.bpm} bpm
              </span>
            </>
          )}
          {song.notes && <span className="text-ink-30"> · {song.notes}</span>}
        </p>
      </div>

      <button
        onClick={onRemove}
        aria-label={`remove ${song.title}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-30 transition hover:bg-red-50 hover:text-red-600"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  )
}
