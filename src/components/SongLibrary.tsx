import { useMemo, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useApp } from '../store/AppContext'
import { ALL_TAGS, type Song, type Tag } from '../types'
import { formatDuration } from '../lib/time'
import { libDragId } from '../lib/dnd'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { TagPill } from './ui/TagPill'
import { SongForm } from './SongForm'

export function SongLibrary() {
  const { state, dispatch, activeSetlist } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Tag | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Song | null>(null)

  const songs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.songs.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q)
      const matchesTag = !filter || s.tags.includes(filter)
      return matchesQuery && matchesTag
    })
  }, [state.songs, query, filter])

  function addToSetlist(songId: string) {
    if (!activeSetlist) return
    dispatch({ type: 'ADD_SONG_TO_SETLIST', setlistId: activeSetlist.id, songId })
  }

  return (
    <section className="card flex min-h-0 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold lowercase tracking-wide">library</h2>
          <span className="tnum text-xs text-ink-30">{state.songs.length}</span>
        </div>
        <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
          <PlusIcon /> add song
        </Button>
      </header>

      <div className="space-y-2.5 border-b border-line px-4 py-3">
        <input
          className="field"
          placeholder="search songs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              active={filter === tag}
              onClick={() => setFilter(filter === tag ? null : tag)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {songs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-30">
            {state.songs.length === 0
              ? 'no songs yet — add your first one.'
              : 'no songs match that.'}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {songs.map((song) => (
              <LibraryRow
                key={song.id}
                song={song}
                canAdd={Boolean(activeSetlist)}
                onAdd={() => addToSetlist(song.id)}
                onEdit={() => setEditing(song)}
              />
            ))}
          </ul>
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="new song">
        <SongForm
          onCancel={() => setAdding(false)}
          onSubmit={(data) => {
            dispatch({ type: 'ADD_SONG', song: data })
            setAdding(false)
          }}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="edit song">
        {editing && (
          <SongForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={(data) => {
              dispatch({ type: 'UPDATE_SONG', id: editing.id, patch: data })
              setEditing(null)
            }}
          />
        )}
        {editing && (
          <div className="mt-4 flex justify-between border-t border-line pt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                dispatch({ type: 'DELETE_SONG', id: editing.id })
                setEditing(null)
              }}
            >
              delete song
            </Button>
          </div>
        )}
      </Modal>
    </section>
  )
}

interface RowProps {
  song: Song
  canAdd: boolean
  onAdd: () => void
  onEdit: () => void
}

function LibraryRow({ song, canAdd, onAdd, onEdit }: RowProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: libDragId(song.id),
  })

  return (
    <li
      ref={setNodeRef}
      className={`group flex items-start gap-1 px-2 py-3 sm:px-3 ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`drag ${song.title} into a setlist`}
        title="drag into the setlist"
        className="mt-0.5 grid h-8 w-5 shrink-0 cursor-grab touch-none place-items-center text-ink-30 transition hover:text-ink-50 active:cursor-grabbing"
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

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{song.title}</p>
        <p className="tnum mt-0.5 text-xs text-ink-50">
          {formatDuration(song.duration)}
          {song.key && <> · {song.key}</>}
          {song.bpm != null && <> · {song.bpm} bpm</>}
        </p>
        {song.notes && (
          <p className="mt-0.5 truncate text-xs text-ink-30">{song.notes}</p>
        )}
        {song.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {song.tags.map((t) => (
              <TagPill key={t} tag={t} size="xs" />
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onEdit}
          aria-label={`edit ${song.title}`}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-30 transition hover:bg-ink/5 hover:text-ink-70"
        >
          <EditIcon />
        </button>
        <Button
          size="sm"
          variant="outline"
          disabled={!canAdd}
          onClick={onAdd}
          aria-label={`add ${song.title} to setlist`}
          title={canAdd ? 'add to current set' : 'create a set first'}
        >
          <PlusIcon /> set
        </Button>
      </div>
    </li>
  )
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.5 2.5l2 2L6 12l-2.5.5L4 10l7.5-7.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
