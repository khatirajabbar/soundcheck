import type { AppState, Setlist, Song } from '../types'
import { uid } from './id'

/** Example songs so the app isn't empty on first load. */
export function seedState(): AppState {
  const songs: Song[] = [
    {
      id: uid('sng_'),
      title: 'coastline',
      duration: 225, // 3:45
      key: 'G',
      bpm: 122,
      notes: 'capo 2 · big finish',
      tags: ['original', 'electronic'],
    },
    {
      id: uid('sng_'),
      title: 'slow tide',
      duration: 258, // 4:18
      key: 'Am',
      bpm: 74,
      notes: 'Oliver starts · keep it quiet',
      tags: ['original', 'acoustic'],
    },
    {
      id: uid('sng_'),
      title: 'valerie',
      duration: 232, // 3:52
      key: 'E',
      bpm: 108,
      notes: 'cover · crowd sings the bridge',
      tags: ['cover'],
    },
  ]

  const setlist: Setlist = {
    id: uid('set_'),
    name: 'baku club gig — august',
    songIds: songs.map((s) => s.id),
    targetSeconds: 45 * 60,
    gapSeconds: 30,
  }

  return {
    version: 1,
    songs,
    setlists: [setlist],
    activeSetlistId: setlist.id,
  }
}
