import { useMemo, useState } from 'react'
import type { Song } from '../types'
import { suggestSet, type SuggestGoal } from '../lib/suggest'
import { formatDuration } from '../lib/time'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
  library: Song[]
  targetSeconds: number
  gapSeconds: number
  /** how many songs are already in the set being replaced */
  currentCount: number
  onUse: (songIds: string[]) => void
}

const GOALS: { id: SuggestGoal; label: string; blurb: string }[] = [
  { id: 'originals', label: 'maximise originals', blurb: 'fit as many of your own songs as possible' },
  { id: 'closest', label: 'closest fit', blurb: 'pack the slot as tightly as possible' },
  { id: 'balanced', label: 'balanced tempo', blurb: 'open & close up-tempo, avoid slow runs' },
]

export function SuggestModal({
  open,
  onClose,
  library,
  targetSeconds,
  gapSeconds,
  currentCount,
  onUse,
}: Props) {
  const [goal, setGoal] = useState<SuggestGoal>('closest')
  const [attempt, setAttempt] = useState(0)

  const suggestion = useMemo(
    () => suggestSet(library, targetSeconds, gapSeconds, goal, attempt),
    [library, targetSeconds, gapSeconds, goal, attempt]
  )

  const activeGoal = GOALS.find((g) => g.id === goal)!
  const canUse = suggestion.songs.length > 0

  const reasoning = suggestion.noneFit
    ? ''
    : [
        `${suggestion.songs.length} songs`,
        formatDuration(suggestion.totalSeconds),
        `${formatDuration(suggestion.spareSeconds)} to spare`,
        `${suggestion.originals} originals`,
        suggestion.slowRunLength
          ? `${suggestion.slowRunLength} slow in a row${
              suggestion.tempoRelaxed ? ' (unavoidable)' : ''
            }`
          : 'no slow runs',
      ].join(' · ')

  return (
    <Modal open={open} onClose={onClose} title="suggest a set">
      {/* goal picker */}
      <div className="mb-4 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGoal(g.id)
              setAttempt(0)
            }}
            className={`rounded-lg border px-3 py-2 text-left transition ${
              goal === g.id
                ? 'border-accent bg-accent/[0.06] text-accent-ink'
                : 'border-line text-ink-70 hover:border-ink/30'
            }`}
          >
            <span className="block text-xs font-medium lowercase">{g.label}</span>
          </button>
        ))}
      </div>
      <p className="mb-4 text-xs text-ink-30">
        goal: {activeGoal.blurb}. aims to land just under {formatDuration(targetSeconds)},
        never over.
      </p>

      {suggestion.noneFit ? (
        <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-ink-50">
          none of your songs fit a {formatDuration(targetSeconds)} slot — they’re all
          longer than that.
          <span className="mt-1 block text-xs text-ink-30">
            add a shorter song, or lengthen the target slot.
          </span>
        </div>
      ) : (
        <>
          {/* reasoning line */}
          <p className="tnum mb-3 text-sm font-medium text-ink-70">{reasoning}</p>

          {suggestion.libraryTooSmall && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              this is your whole library and it still doesn’t fill the slot — add more
              songs to fill this slot.
            </p>
          )}

          {/* the suggested, ordered set */}
          <ol className="mb-4 max-h-64 divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {suggestion.songs.map((s, i) => (
              <li key={`${s.id}-${i}`} className="flex items-baseline gap-3 px-3 py-2.5">
                <span className="tnum w-5 shrink-0 text-right text-xs text-ink-30">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="tnum mt-0.5 text-xs text-ink-50">
                    {formatDuration(s.duration)}
                    {s.key && <> · {s.key}</>}
                    {s.bpm != null && <> · {s.bpm} bpm</>}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {currentCount > 0 && canUse && (
        <p className="mb-3 text-xs text-ink-30">
          “use this set” replaces your current {currentCount}-song set. you can reorder it
          afterwards.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
        <Button variant="ghost" onClick={onClose}>
          cancel
        </Button>
        <Button
          variant="outline"
          disabled={suggestion.noneFit}
          onClick={() => setAttempt((a) => a + 1)}
        >
          suggest another
        </Button>
        <Button
          variant="primary"
          disabled={!canUse}
          onClick={() => onUse(suggestion.songs.map((s) => s.id))}
        >
          use this set
        </Button>
      </div>
    </Modal>
  )
}
