import { useApp } from '../store/AppContext'
import type { Setlist, Song } from '../types'
import {
  formatDuration,
  formatSignedDuration,
  parseDuration,
  setlistRuntime,
} from '../lib/time'

interface Props {
  setlist: Setlist
  songs: Song[]
}

export function RuntimeBar({ setlist, songs }: Props) {
  const { dispatch } = useApp()
  const total = setlistRuntime(songs, setlist.gapSeconds)
  const target = setlist.targetSeconds
  const remaining = target != null ? target - total : null
  const over = remaining != null && remaining < 0

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div>
        <p className="label mb-0.5">total runtime</p>
        <p className="tnum text-3xl font-semibold leading-none">
          {formatDuration(total)}
        </p>
      </div>

      {remaining != null && (
        <div>
          <p className="label mb-0.5">{over ? 'over slot' : 'remaining'}</p>
          <p
            className={`tnum text-3xl font-semibold leading-none ${
              over ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatSignedDuration(remaining)}
          </p>
        </div>
      )}

      <div className="ml-auto flex items-end gap-4">
        <label className="block">
          <span className="label">target slot</span>
          <input
            className="field tnum w-24"
            defaultValue={target != null ? formatDuration(target) : ''}
            placeholder="45:00"
            inputMode="numeric"
            key={setlist.id + String(target)}
            onBlur={(e) => {
              const value = e.target.value.trim()
              dispatch({
                type: 'SET_TARGET',
                setlistId: setlist.id,
                targetSeconds: value ? parseDuration(value) : null,
              })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
          />
        </label>

        <label className="block">
          <span className="label">gap between</span>
          <div className="flex items-center gap-1.5">
            <input
              className="field tnum w-16"
              type="number"
              min={0}
              max={600}
              value={setlist.gapSeconds}
              onChange={(e) =>
                dispatch({
                  type: 'SET_GAP',
                  setlistId: setlist.id,
                  gapSeconds: Number(e.target.value) || 0,
                })
              }
            />
            <span className="text-xs text-ink-30">sec</span>
          </div>
        </label>
      </div>

      {target != null && (
        <div className="w-full">
          <ProgressBar total={total} target={target} />
        </div>
      )}
    </div>
  )
}

function ProgressBar({ total, target }: { total: number; target: number }) {
  const pct = target > 0 ? Math.min(100, (total / target) * 100) : 0
  const over = total > target
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          over ? 'bg-red-500' : 'bg-accent'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
