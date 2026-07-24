import type { AppState } from '../types'
import { seedState } from './seed'

const STORAGE_KEY = 'soundcheck.v1'

/** basic shape check so a corrupt / hand-edited blob doesn't crash the app */
function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<AppState>
  return (
    typeof v.version === 'number' &&
    Array.isArray(v.songs) &&
    Array.isArray(v.setlists)
  )
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw)
    if (!isValidState(parsed)) return seedState()
    return parsed
  } catch {
    return seedState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — nothing useful to do, keep running in memory
  }
}

/** serialize the whole library + setlists for the export button */
export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

/** parse an imported file back into state, or throw with a friendly message */
export function deserializeState(raw: string): AppState {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('that file isn’t valid JSON.')
  }
  if (!isValidState(parsed)) {
    throw new Error('that file doesn’t look like a soundcheck backup.')
  }
  return parsed
}
