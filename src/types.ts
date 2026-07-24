export type Tag = 'acoustic' | 'electronic' | 'cover' | 'original'

export const ALL_TAGS: Tag[] = ['acoustic', 'electronic', 'cover', 'original']

export interface Song {
  id: string
  title: string
  /** duration in whole seconds */
  duration: number
  /** musical key, free text, e.g. "G", "Am", "F#m" */
  key: string
  /** beats per minute; null when unknown */
  bpm: number | null
  /** stage notes, e.g. "capo 2", "Oliver starts" */
  notes: string
  tags: Tag[]
}

export interface Setlist {
  id: string
  name: string
  /** ordered references into the song library */
  songIds: string[]
  /** target slot length in seconds; null = no target set */
  targetSeconds: number | null
  /** banter / changeover gap between songs, in seconds */
  gapSeconds: number
}

export interface AppState {
  version: number
  songs: Song[]
  setlists: Setlist[]
  activeSetlistId: string | null
}

/** self-contained payload used for share links (does not need the recipient's library) */
export interface SharePayload {
  v: number
  name: string
  gapSeconds: number
  targetSeconds: number | null
  songs: Omit<Song, 'id'>[]
}
