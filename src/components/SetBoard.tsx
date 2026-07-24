import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useApp } from '../store/AppContext'
import type { Song } from '../types'
import { resolveSongs } from '../lib/time'
import {
  SETLIST_DROPPABLE,
  indexFromRowId,
  isLibDrag,
  songIdFromLibDrag,
} from '../lib/dnd'
import { formatDuration } from '../lib/time'
import { SongLibrary } from './SongLibrary'
import { SetlistBuilder } from './SetlistBuilder'
import { SetAnalysis } from './SetAnalysis'

export function SetBoard() {
  const { state, dispatch, activeSetlist } = useApp()
  const [activeSong, setActiveSong] = useState<Song | null>(null)

  const songs = useMemo(
    () => (activeSetlist ? resolveSongs(activeSetlist, state.songs) : []),
    [activeSetlist, state.songs]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function findSong(id: string): Song | null {
    if (isLibDrag(id)) {
      return state.songs.find((s) => s.id === songIdFromLibDrag(id)) ?? null
    }
    // setlist row: "row::<songId>::<index>"
    const songId = id.split('::')[1]
    return state.songs.find((s) => s.id === songId) ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveSong(findSong(String(event.active.id)))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveSong(null)
    const { active, over } = event
    if (!over || !activeSetlist) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const ids = activeSetlist.songIds

    // dropped where the target resolves to an index in the set
    const overIndex =
      overId === SETLIST_DROPPABLE ? ids.length : indexFromRowId(overId)

    // 1) dragging a song out of the library into the set
    if (isLibDrag(activeId)) {
      // only act when dropped onto the setlist area
      if (overId !== SETLIST_DROPPABLE && !overId.startsWith('row::')) return
      dispatch({
        type: 'INSERT_SONG_INTO_SETLIST',
        setlistId: activeSetlist.id,
        songId: songIdFromLibDrag(activeId),
        index: overIndex,
      })
      return
    }

    // 2) reordering within the set
    if (activeId.startsWith('row::')) {
      const from = indexFromRowId(activeId)
      const to = Math.min(overIndex, ids.length - 1)
      if (from === to || Number.isNaN(from) || Number.isNaN(to)) return
      dispatch({
        type: 'REORDER_SETLIST',
        setlistId: activeSetlist.id,
        songIds: arrayMove(ids, from, to),
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveSong(null)}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-4 lg:max-h-[calc(100vh-12rem)]">
          <SongLibrary />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-5 lg:max-h-[calc(100vh-12rem)]">
          <SetlistBuilder />
        </div>
        <div className="order-3 lg:col-span-3">
          <SetAnalysis songs={songs} />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSong ? (
          <div className="pointer-events-none w-64 rounded-lg border border-accent/40 bg-white px-3 py-2 shadow-xl">
            <p className="truncate text-sm font-medium">{activeSong.title}</p>
            <p className="tnum mt-0.5 text-xs text-ink-50">
              {formatDuration(activeSong.duration)}
              {activeSong.key && <> · {activeSong.key}</>}
              {activeSong.bpm != null && <> · {activeSong.bpm} bpm</>}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
