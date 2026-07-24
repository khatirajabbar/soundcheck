/**
 * Shared drag-and-drop id scheme so the library (drag source) and the setlist
 * (sortable drop target) can live in one DndContext without clashing.
 *
 *  - library rows:  "lib::<songId>"
 *  - setlist rows:  "row::<songId>::<index>"      (index keeps duplicates distinct)
 *  - the setlist drop zone itself: "setlist"
 */
export const SETLIST_DROPPABLE = 'setlist'

export function libDragId(songId: string): string {
  return `lib::${songId}`
}

export function setRowId(songId: string, index: number): string {
  return `row::${songId}::${index}`
}

export function isLibDrag(id: string): boolean {
  return id.startsWith('lib::')
}

export function songIdFromLibDrag(id: string): string {
  return id.slice('lib::'.length)
}

/** trailing index encoded in a setlist row id */
export function indexFromRowId(id: string): number {
  const last = id.split('::').pop()
  return Number(last)
}
