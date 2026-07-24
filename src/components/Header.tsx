import { useRef, useState } from 'react'
import { useApp } from '../store/AppContext'
import { deserializeState, serializeState } from '../lib/storage'
import { Button } from './ui/Button'

export function Header() {
  const { state, dispatch } = useApp()
  const fileInput = useRef<HTMLInputElement>(null)
  const [flash, setFlash] = useState<string | null>(null)

  function note(msg: string) {
    setFlash(msg)
    window.setTimeout(() => setFlash(null), 2200)
  }

  function exportJson() {
    const blob = new Blob([serializeState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soundcheck-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    note('exported backup')
  }

  function importJson(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = deserializeState(String(reader.result))
        if (
          confirm(
            'importing will replace your current library and setlists. continue?'
          )
        ) {
          dispatch({ type: 'REPLACE_STATE', state: next })
          note('imported')
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'could not import that file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/80 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2.5">
        <Logo />
        <div className="leading-none">
          <h1 className="text-base font-bold lowercase tracking-tight">soundcheck</h1>
          <p className="mt-0.5 text-[11px] lowercase text-ink-30">setlist &amp; gig planner</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {flash && (
          <span className="animate-fade-in text-xs text-emerald-600">{flash}</span>
        )}
        <Button size="sm" variant="ghost" onClick={exportJson}>
          export data
        </Button>
        <Button size="sm" variant="ghost" onClick={() => fileInput.current?.click()}>
          import data
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importJson(file)
            e.target.value = ''
          }}
        />
      </div>
    </header>
  )
}

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="7" className="fill-ink" />
      <g className="fill-accent">
        <rect x="7" y="14" width="3" height="4" rx="1.5" />
        <rect x="12.5" y="9" width="3" height="14" rx="1.5" />
        <rect x="18" y="6" width="3" height="20" rx="1.5" />
        <rect x="23.5" y="12" width="3" height="8" rx="1.5" />
      </g>
    </svg>
  )
}
