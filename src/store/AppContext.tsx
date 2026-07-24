import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppState, Setlist, Song } from '../types'
import { uid } from '../lib/id'
import { loadState, saveState } from '../lib/storage'

type Action =
  | { type: 'REPLACE_STATE'; state: AppState }
  | { type: 'ADD_SONG'; song: Omit<Song, 'id'> }
  | { type: 'UPDATE_SONG'; id: string; patch: Partial<Omit<Song, 'id'>> }
  | { type: 'DELETE_SONG'; id: string }
  | { type: 'ADD_SETLIST'; name: string }
  | { type: 'RENAME_SETLIST'; id: string; name: string }
  | { type: 'DELETE_SETLIST'; id: string }
  | { type: 'SET_ACTIVE_SETLIST'; id: string }
  | { type: 'ADD_SONG_TO_SETLIST'; setlistId: string; songId: string }
  | { type: 'INSERT_SONG_INTO_SETLIST'; setlistId: string; songId: string; index: number }
  | { type: 'REMOVE_SONG_FROM_SETLIST'; setlistId: string; index: number }
  | { type: 'REORDER_SETLIST'; setlistId: string; songIds: string[] }
  | { type: 'SET_TARGET'; setlistId: string; targetSeconds: number | null }
  | { type: 'SET_GAP'; setlistId: string; gapSeconds: number }

function mapSetlist(
  state: AppState,
  id: string,
  fn: (s: Setlist) => Setlist
): Setlist[] {
  return state.setlists.map((s) => (s.id === id ? fn(s) : s))
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REPLACE_STATE':
      return action.state

    case 'ADD_SONG':
      return { ...state, songs: [{ ...action.song, id: uid('sng_') }, ...state.songs] }

    case 'UPDATE_SONG':
      return {
        ...state,
        songs: state.songs.map((s) =>
          s.id === action.id ? { ...s, ...action.patch } : s
        ),
      }

    case 'DELETE_SONG':
      return {
        ...state,
        songs: state.songs.filter((s) => s.id !== action.id),
        // also drop it from every setlist that referenced it
        setlists: state.setlists.map((s) => ({
          ...s,
          songIds: s.songIds.filter((sid) => sid !== action.id),
        })),
      }

    case 'ADD_SETLIST': {
      const setlist: Setlist = {
        id: uid('set_'),
        name: action.name.trim() || 'untitled set',
        songIds: [],
        targetSeconds: null,
        gapSeconds: 30,
      }
      return {
        ...state,
        setlists: [...state.setlists, setlist],
        activeSetlistId: setlist.id,
      }
    }

    case 'RENAME_SETLIST':
      return {
        ...state,
        setlists: mapSetlist(state, action.id, (s) => ({
          ...s,
          name: action.name.trim() || s.name,
        })),
      }

    case 'DELETE_SETLIST': {
      const setlists = state.setlists.filter((s) => s.id !== action.id)
      const activeSetlistId =
        state.activeSetlistId === action.id
          ? setlists[0]?.id ?? null
          : state.activeSetlistId
      return { ...state, setlists, activeSetlistId }
    }

    case 'SET_ACTIVE_SETLIST':
      return { ...state, activeSetlistId: action.id }

    case 'ADD_SONG_TO_SETLIST':
      return {
        ...state,
        setlists: mapSetlist(state, action.setlistId, (s) => ({
          ...s,
          songIds: [...s.songIds, action.songId],
        })),
      }

    case 'INSERT_SONG_INTO_SETLIST':
      return {
        ...state,
        setlists: mapSetlist(state, action.setlistId, (s) => {
          const ids = [...s.songIds]
          const at = Math.max(0, Math.min(action.index, ids.length))
          ids.splice(at, 0, action.songId)
          return { ...s, songIds: ids }
        }),
      }

    case 'REMOVE_SONG_FROM_SETLIST':
      return {
        ...state,
        setlists: mapSetlist(state, action.setlistId, (s) => ({
          ...s,
          songIds: s.songIds.filter((_, i) => i !== action.index),
        })),
      }

    case 'REORDER_SETLIST':
      return {
        ...state,
        setlists: mapSetlist(state, action.setlistId, (s) => ({
          ...s,
          songIds: action.songIds,
        })),
      }

    case 'SET_TARGET':
      return {
        ...state,
        setlists: mapSetlist(state, action.setlistId, (s) => ({
          ...s,
          targetSeconds: action.targetSeconds,
        })),
      }

    case 'SET_GAP':
      return {
        ...state,
        setlists: mapSetlist(state, action.setlistId, (s) => ({
          ...s,
          gapSeconds: Math.max(0, action.gapSeconds),
        })),
      }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  activeSetlist: Setlist | null
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const activeSetlist = useMemo(
    () => state.setlists.find((s) => s.id === state.activeSetlistId) ?? null,
    [state.setlists, state.activeSetlistId]
  )

  const value = useMemo(
    () => ({ state, dispatch, activeSetlist }),
    [state, activeSetlist]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
