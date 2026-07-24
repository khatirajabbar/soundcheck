import { useState } from 'react'
import type { SharePayload, Song } from '../types'
import { formatDuration, formatSignedDuration, setlistRuntime } from '../lib/time'
import { toPlainText } from '../lib/plaintext'
import { SetAnalysis } from './SetAnalysis'
import { StageMode } from './StageMode'
import { PrintSheet } from './PrintSheet'
import { Footer } from './Footer'
import { Button } from './ui/Button'
import { TagPill } from './ui/TagPill'

interface Props {
  payload: SharePayload
}

export function ShareView({ payload }: Props) {
  const [stage, setStage] = useState(false)
  const [copied, setCopied] = useState(false)

  // give the shared songs synthetic ids so shared components can key off them
  const songs: Song[] = payload.songs.map((s, i) => ({ ...s, id: `shared_${i}` }))
  const total = setlistRuntime(songs, payload.gapSeconds)
  const remaining = payload.targetSeconds != null ? payload.targetSeconds - total : null
  const over = remaining != null && remaining < 0

  async function copyText() {
    await navigator.clipboard.writeText(
      toPlainText({
        name: payload.name,
        songs,
        gapSeconds: payload.gapSeconds,
        targetSeconds: payload.targetSeconds,
      })
    )
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="mx-auto min-h-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="no-print">
        <p className="mb-1 text-xs lowercase tracking-widest text-accent">
          shared setlist · read-only
        </p>
        <h1 className="text-2xl font-bold lowercase tracking-tight sm:text-3xl">
          {payload.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <p className="label mb-0">total</p>
            <p className="tnum text-2xl font-semibold">{formatDuration(total)}</p>
          </div>
          {remaining != null && (
            <div>
              <p className="label mb-0">{over ? 'over slot' : 'remaining'}</p>
              <p className={`tnum text-2xl font-semibold ${over ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatSignedDuration(remaining)}
              </p>
            </div>
          )}
          <span className="tnum text-sm text-ink-30">{songs.length} songs</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setStage(true)} disabled={!songs.length}>
            stage mode
          </Button>
          <Button variant="outline" onClick={copyText}>
            {copied ? 'copied ✓' : 'copy text'}
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            print / pdf
          </Button>
          <Button variant="ghost" onClick={() => (window.location.href = window.location.pathname)}>
            open soundcheck →
          </Button>
        </div>

        <ol className="card mt-6 divide-y divide-line">
          {songs.map((s, i) => (
            <li key={i} className="flex items-baseline gap-3 px-4 py-3">
              <span className="tnum w-6 shrink-0 text-right text-sm text-ink-30">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="tnum mt-0.5 text-xs text-ink-50">
                  {formatDuration(s.duration)}
                  {s.key && <> · {s.key}</>}
                  {s.bpm != null && <> · {s.bpm} bpm</>}
                  {s.notes && <span className="text-ink-30"> · {s.notes}</span>}
                </p>
                {s.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {s.tags.map((t) => (
                      <TagPill key={t} tag={t} size="xs" />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <SetAnalysis songs={songs} gapSeconds={payload.gapSeconds} />
        </div>

        <Footer />
      </div>

      <PrintSheet name={payload.name} songs={songs} gapSeconds={payload.gapSeconds} />

      {stage && <StageMode name={payload.name} songs={songs} onClose={() => setStage(false)} />}
    </div>
  )
}
