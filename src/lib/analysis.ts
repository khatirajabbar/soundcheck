import type { Song } from '../types'

/** a song at or below this BPM is considered "slow" for the back-to-back warning */
export const SLOW_BPM = 90

/** how many slow songs in a row triggers the warning */
export const SLOW_RUN_LIMIT = 3

export interface SetAnalysis {
  count: number
  originals: number
  covers: number
  /** songs that carry a bpm, in order */
  tempoPoints: { title: string; bpm: number }[]
  minBpm: number | null
  maxBpm: number | null
  /** indices (into the resolved song list) of the longest run of slow songs, if it hits the limit */
  slowRun: number[] | null
}

export function analyzeSet(songs: Song[]): SetAnalysis {
  const originals = songs.filter((s) => s.tags.includes('original')).length
  const covers = songs.filter((s) => s.tags.includes('cover')).length

  const tempoPoints = songs
    .filter((s): s is Song & { bpm: number } => s.bpm != null)
    .map((s) => ({ title: s.title, bpm: s.bpm }))

  const bpms = tempoPoints.map((p) => p.bpm)
  const minBpm = bpms.length ? Math.min(...bpms) : null
  const maxBpm = bpms.length ? Math.max(...bpms) : null

  return {
    count: songs.length,
    originals,
    covers,
    tempoPoints,
    minBpm,
    maxBpm,
    slowRun: findSlowRun(songs),
  }
}

/** returns the indices of the first run of >= SLOW_RUN_LIMIT consecutive slow songs, else null */
function findSlowRun(songs: Song[]): number[] | null {
  let run: number[] = []
  let longest: number[] = []
  songs.forEach((song, i) => {
    const isSlow = song.bpm != null && song.bpm <= SLOW_BPM
    if (isSlow) {
      run.push(i)
      if (run.length > longest.length) longest = [...run]
    } else {
      run = []
    }
  })
  return longest.length >= SLOW_RUN_LIMIT ? longest : null
}
