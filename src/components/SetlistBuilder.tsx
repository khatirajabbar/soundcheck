import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useApp } from '../store/AppContext'
import { resolveSongs } from '../lib/time'
import { analyzeSet } from '../lib/analysis'
import { SETLIST_DROPPABLE, setRowId } from '../lib/dnd'
import { SetlistItem } from './SetlistItem'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

export function SetlistBuilder() {
  const { state, dispatch, activeSetlist } = useApp()
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  // the whole list region is a drop zone so songs can be dragged in from the
  // library — including onto an empty set
  const { setNodeRef, isOver } = useDroppable({ id: SETLIST_DROPPABLE })

  if (!activeSetlist) {
    return (
      <section className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-sm text-ink-50">no setlist yet.</p>
        <Button
          variant="primary"
          onClick={() => dispatch({ type: 'ADD_SETLIST', name: 'new set' })}
        >
          create a setlist
        </Button>
      </section>
    )
  }

  const songs = resolveSongs(activeSetlist, state.songs)
  const analysis = analyzeSet(songs)
  const slowSet = new Set(analysis.slowRun ?? [])
  const rowIds = activeSetlist.songIds.map((id, i) => setRowId(id, i))

  return (
    <section className="card flex min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <select
          className="field h-9 max-w-[60%] flex-1 cursor-pointer font-medium"
          value={activeSetlist.id}
          onChange={(e) => dispatch({ type: 'SET_ACTIVE_SETLIST', id: e.target.value })}
        >
          {state.setlists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setNameDraft(activeSetlist.name)
              setRenaming(true)
            }}
          >
            rename
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: 'ADD_SETLIST', name: 'new set' })}
            aria-label="new setlist"
          >
            + new
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={state.setlists.length <= 1}
            onClick={() => {
              if (confirm(`delete "${activeSetlist.name}"? this can't be undone.`)) {
                dispatch({ type: 'DELETE_SETLIST', id: activeSetlist.id })
              }
            }}
          >
            delete
          </Button>
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={`min-h-0 flex-1 overflow-y-auto p-2 transition-colors ${
          isOver ? 'bg-accent/[0.04]' : ''
        }`}
      >
        {songs.length === 0 ? (
          <p
            className={`m-1 rounded-lg border border-dashed px-4 py-16 text-center text-sm transition-colors ${
              isOver ? 'border-accent/50 text-accent' : 'border-line text-ink-30'
            }`}
          >
            empty set — drag songs here
            <span className="mt-1 block text-xs">
              (or tap “set” on any song in the library)
            </span>
          </p>
        ) : (
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-line">
              {songs.map((song, i) => (
                <SetlistItem
                  key={rowIds[i]}
                  id={rowIds[i]}
                  index={i}
                  song={song}
                  isSlow={slowSet.has(i)}
                  onRemove={() =>
                    dispatch({
                      type: 'REMOVE_SONG_FROM_SETLIST',
                      setlistId: activeSetlist.id,
                      index: i,
                    })
                  }
                />
              ))}
            </ul>
          </SortableContext>
        )}
      </div>

      <Modal open={renaming} onClose={() => setRenaming(false)} title="rename setlist">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({
              type: 'RENAME_SETLIST',
              id: activeSetlist.id,
              name: nameDraft,
            })
            setRenaming(false)
          }}
          className="space-y-4"
        >
          <input
            className="field"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            autoFocus
            placeholder="baku club gig — august"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRenaming(false)}>
              cancel
            </Button>
            <Button type="submit" variant="primary">
              save
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
