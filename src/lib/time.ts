import type { Setlist, Song } from '../types'

/** format whole seconds as m:ss (or h:mm:ss past an hour) */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

/** format a signed delta as +m:ss / -m:ss */
export function formatSignedDuration(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : '+'
  return sign + formatDuration(Math.abs(totalSeconds))
}

/**
 * Parse a "mm:ss" (or "m:ss", or plain seconds) string into whole seconds.
 * Returns null when the input can't be understood.
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':')
    if (parts.length > 3) return null
    const nums = parts.map((p) => Number(p))
    if (nums.some((n) => Number.isNaN(n) || n < 0)) return null
    // seconds/minutes shouldn't exceed 59 when a larger unit is present
    const [a, b, c] = nums
    if (parts.length === 2) {
      if (b > 59) return null
      return a * 60 + b
    }
    // h:mm:ss
    if (b > 59 || c > 59) return null
    return a * 3600 + b * 60 + c
  }

  // bare number = seconds
  const n = Number(trimmed)
  if (Number.isNaN(n) || n < 0) return null
  return Math.round(n)
}

/** number of banter gaps in a set = one fewer than the song count */
export function gapCount(songCount: number): number {
  return Math.max(0, songCount - 1)
}

/** live total runtime for a set of songs incl. gaps between them */
export function setlistRuntime(songs: Song[], gapSeconds: number): number {
  const songTotal = songs.reduce((sum, s) => sum + s.duration, 0)
  return songTotal + gapCount(songs.length) * gapSeconds
}

/** resolve a setlist's song ids into full Song objects, dropping any that no longer exist */
export function resolveSongs(setlist: Setlist, library: Song[]): Song[] {
  const byId = new Map(library.map((s) => [s.id, s]))
  return setlist.songIds
    .map((id) => byId.get(id))
    .filter((s): s is Song => Boolean(s))
}
