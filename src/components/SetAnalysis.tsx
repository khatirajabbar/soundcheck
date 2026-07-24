import type { Song } from '../types'
import { analyzeSet, SLOW_BPM, SLOW_RUN_LIMIT } from '../lib/analysis'
import { TempoChart } from './TempoChart'

interface Props {
  songs: Song[]
}

export function SetAnalysis({ songs }: Props) {
  const a = analyzeSet(songs)

  if (a.count === 0) {
    return (
      <section className="card px-4 py-5">
        <h2 className="mb-1 text-sm font-semibold lowercase tracking-wide">analysis</h2>
        <p className="text-xs text-ink-30">an empty set has nothing to analyse yet.</p>
      </section>
    )
  }

  return (
    <section className="card space-y-4 px-4 py-4">
      <h2 className="text-sm font-semibold lowercase tracking-wide">analysis</h2>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="songs" value={a.count} />
        <Stat label="originals" value={a.originals} />
        <Stat label="covers" value={a.covers} />
      </div>

      <div>
        <p className="label">tempo flow</p>
        <TempoChart points={a.tempoPoints} min={a.minBpm ?? 0} max={a.maxBpm ?? 0} />
      </div>

      {a.slowRun && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden>
            <path
              d="M8 1.5l6.5 11.5H1.5L8 1.5z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M8 6.5v3M8 11.2v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>
            {a.slowRun.length} slow songs (≤ {SLOW_BPM} bpm) back to back at positions{' '}
            {a.slowRun.map((i) => i + 1).join(', ')}. that’s {SLOW_RUN_LIMIT}+ in a row —
            consider breaking it up so the set doesn’t sag.
          </span>
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line py-2">
      <p className="tnum text-xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[10px] lowercase tracking-wide text-ink-30">{label}</p>
    </div>
  )
}
