import type { Song } from '../types'
import { SLOW_BPM } from './analysis'
import { setlistRuntime } from './time'

export type SuggestGoal = 'originals' | 'closest' | 'balanced'

export interface Suggestion {
  /** the suggested songs, already ordered */
  songs: Song[]
  totalSeconds: number
  /** target - total, never negative (we always stay under) */
  spareSeconds: number
  originals: number
  /** length of the longest slow run, only when it's >= 3, else 0 */
  slowRunLength: number
  /** true when the balanced goal couldn't avoid a slow run and had to relax */
  tempoRelaxed: boolean
  /** the whole library fits under the target — can't fill it any fuller */
  libraryTooSmall: boolean
  /** no single song is short enough to fit the slot at all */
  noneFit: boolean
}

const isSlow = (s: Song) => s.bpm != null && s.bpm <= SLOW_BPM
const isFast = (s: Song) => s.bpm != null && s.bpm > SLOW_BPM
const isOriginal = (s: Song) => s.tags.includes('original')

// --- tiny seeded PRNG so "suggest another" varies but stays deterministic ---
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** greedily add songs (in the given order) while the running total stays under target */
function greedyFit(ordered: Song[], target: number, gap: number): Song[] {
  const selected: Song[] = []
  let sumDur = 0
  for (const s of ordered) {
    const gaps = selected.length // gaps after adding = current count
    if (sumDur + s.duration + gap * gaps <= target) {
      selected.push(s)
      sumDur += s.duration
    }
  }
  return selected
}

/** top up any spare time with the largest remaining songs that still fit */
function fillPass(selected: Song[], rest: Song[], target: number, gap: number): void {
  let sumDur = selected.reduce((n, s) => n + s.duration, 0)
  const pool = [...rest].sort((a, b) => b.duration - a.duration)
  let added = true
  while (added) {
    added = false
    for (let i = 0; i < pool.length; i++) {
      const s = pool[i]
      const gaps = selected.length
      if (sumDur + s.duration + gap * gaps <= target) {
        selected.push(s)
        sumDur += s.duration
        pool.splice(i, 1)
        added = true
        break
      }
    }
  }
}

function selectByGoal(
  candidates: Song[],
  goal: SuggestGoal,
  target: number,
  gap: number,
  rand: () => number,
  jitterAmt: number
): Song[] {
  const pool = [...candidates]

  // a small per-song jitter on the sort key reshuffles which similar-length songs
  // get picked between attempts, while staying tight. attempt 0 uses no jitter so
  // the first suggestion is the deterministic best fit.
  const jitter = new Map(pool.map((c) => [c.id, (rand() - 0.5) * jitterAmt]))
  const dkey = (s: Song) => s.duration + (jitter.get(s.id) ?? 0)

  if (goal === 'originals') {
    // originals first, shorter ones first so we fit as many as possible
    pool.sort((a, b) => {
      const oa = isOriginal(a) ? 0 : 1
      const ob = isOriginal(b) ? 0 : 1
      if (oa !== ob) return oa - ob
      return dkey(a) - dkey(b)
    })
  } else if (goal === 'balanced') {
    // up-tempo songs first (so the arranger has material to bookend with)
    const score = (s: Song) => (isFast(s) ? 2 : s.bpm == null ? 1 : 0)
    pool.sort((a, b) => score(b) - score(a) || dkey(b) - dkey(a))
  } else {
    // closest fit: biggest first for a tight pack
    pool.sort((a, b) => dkey(b) - dkey(a))
  }

  const selected = greedyFit(pool, target, gap)
  const chosen = new Set(selected)
  fillPass(selected, candidates.filter((s) => !chosen.has(s)), target, gap)
  return selected
}

/** count of consecutive slow songs at the tail of `order` */
function trailingSlow(order: Song[]): number {
  let n = 0
  for (let i = order.length - 1; i >= 0; i--) {
    if (isSlow(order[i])) n++
    else break
  }
  return n
}

function longestSlowRun(order: Song[]): number {
  let run = 0
  let max = 0
  for (const s of order) {
    if (isSlow(s)) {
      run++
      max = Math.max(max, run)
    } else {
      run = 0
    }
  }
  return max
}

/**
 * Order the chosen songs sensibly: open and close on something up-tempo, and
 * spread slow songs so no three land in a row. Ordering never changes runtime.
 */
function arrange(selected: Song[]): Song[] {
  const fast = selected.filter(isFast).sort((a, b) => (b.bpm ?? 0) - (a.bpm ?? 0))
  const unknown = selected.filter((s) => s.bpm == null)
  const slow = selected.filter(isSlow).sort((a, b) => (a.bpm ?? 0) - (b.bpm ?? 0))
  const nonSlow = [...fast, ...unknown] // fast preferred for the ends

  const order: Song[] = []
  let closer: Song | null = null

  // opener: fastest available
  if (nonSlow.length > 0 && selected.length > 1) order.push(nonSlow.shift()!)
  // reserve a closer (also up-tempo) when there's room for a distinct one
  if (nonSlow.length > 0 && selected.length > 2) closer = nonSlow.shift()!

  const slowQ = [...slow]
  const nonQ = [...nonSlow]
  while (slowQ.length || nonQ.length) {
    if (trailingSlow(order) >= 2 && nonQ.length) {
      order.push(nonQ.shift()!) // break the run
    } else if (slowQ.length && (slowQ.length >= nonQ.length || nonQ.length === 0)) {
      order.push(slowQ.shift()!)
    } else {
      order.push(nonQ.shift()!)
    }
  }
  if (closer) order.push(closer)
  return order
}

export function suggestSet(
  library: Song[],
  target: number,
  gap: number,
  goal: SuggestGoal,
  attempt: number
): Suggestion {
  const empty: Suggestion = {
    songs: [],
    totalSeconds: 0,
    spareSeconds: Math.max(0, target),
    originals: 0,
    slowRunLength: 0,
    tempoRelaxed: false,
    libraryTooSmall: false,
    noneFit: false,
  }

  // a song longer than the whole slot can never be included
  const candidates = library.filter((s) => s.duration <= target && target > 0)
  if (candidates.length === 0) return { ...empty, noneFit: true }

  // if every fitting song together still fits, that's the fullest possible set
  const libraryTooSmall = setlistRuntime(candidates, gap) <= target

  let selected: Song[]
  if (libraryTooSmall) {
    selected = [...candidates]
  } else {
    const seed = ((attempt + 1) * 0x9e3779b1) ^ (library.length * 0x85ebca77)
    const jitterAmt = attempt === 0 ? 0 : 70
    selected = selectByGoal(candidates, goal, target, gap, mulberry32(seed >>> 0), jitterAmt)
  }

  const ordered = arrange(selected)
  const total = setlistRuntime(ordered, gap)
  const runLen = longestSlowRun(ordered)

  return {
    songs: ordered,
    totalSeconds: total,
    spareSeconds: Math.max(0, target - total),
    originals: ordered.filter(isOriginal).length,
    slowRunLength: runLen >= 3 ? runLen : 0,
    tempoRelaxed: goal === 'balanced' && runLen >= 3,
    libraryTooSmall,
    noneFit: false,
  }
}
