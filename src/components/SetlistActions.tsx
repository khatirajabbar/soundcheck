import { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { Song } from '../types'
import { buildShareUrl } from '../lib/share'
import { toPlainText } from '../lib/plaintext'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { SuggestModal } from './SuggestModal'

interface Props {
  songs: Song[]
  onEnterStage: () => void
}

export function SetlistActions({ songs, onEnterStage }: Props) {
  const { state, dispatch, activeSetlist } = useApp()
  const [shareOpen, setShareOpen] = useState(false)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [copied, setCopied] = useState<'url' | 'text' | null>(null)

  if (!activeSetlist) return null

  const disabled = songs.length === 0
  const shareUrl = buildShareUrl(activeSetlist, state.songs)

  // suggest depends on the LIBRARY + a target, not on the current set being non-empty
  const canSuggest = state.songs.length > 0 && activeSetlist.targetSeconds != null
  const suggestTitle =
    state.songs.length === 0
      ? 'add songs to your library first'
      : activeSetlist.targetSeconds == null
        ? 'set a target slot to get a suggestion'
        : 'suggest a set that fits your slot'

  async function copy(value: string, which: 'url' | 'text') {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // fallback for insecure contexts
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(which)
    window.setTimeout(() => setCopied(null), 1600)
  }

  function copyText() {
    if (!activeSetlist) return
    copy(
      toPlainText({
        name: activeSetlist.name,
        songs,
        gapSeconds: activeSetlist.gapSeconds,
        targetSeconds: activeSetlist.targetSeconds,
      }),
      'text'
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="border-accent/50 text-accent-ink hover:border-accent hover:bg-accent/[0.04]"
          onClick={() => setSuggestOpen(true)}
          disabled={!canSuggest}
          title={suggestTitle}
        >
          <SparkIcon /> suggest a set
        </Button>
        <Button variant="primary" onClick={onEnterStage} disabled={disabled}>
          <StageIcon /> stage mode
        </Button>
        <Button variant="outline" onClick={() => setShareOpen(true)} disabled={disabled}>
          share
        </Button>
        <Button variant="outline" onClick={copyText} disabled={disabled}>
          {copied === 'text' ? 'copied ✓' : 'copy text'}
        </Button>
        <Button variant="outline" onClick={() => window.print()} disabled={disabled}>
          print / pdf
        </Button>
      </div>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="share this set">
        <p className="mb-3 text-sm text-ink-50">
          this link contains the whole setlist (no account needed). anyone who opens it
          sees a clean, read-only view.
        </p>
        <div className="flex gap-2">
          <input readOnly value={shareUrl} className="field flex-1 text-xs" onFocus={(e) => e.target.select()} />
          <Button variant="primary" onClick={() => copy(shareUrl, 'url')}>
            {copied === 'url' ? 'copied ✓' : 'copy'}
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-30">
          tip: open it in a new tab to preview what the band will see.
        </p>
      </Modal>

      {activeSetlist.targetSeconds != null && (
        <SuggestModal
          open={suggestOpen}
          onClose={() => setSuggestOpen(false)}
          library={state.songs}
          targetSeconds={activeSetlist.targetSeconds}
          gapSeconds={activeSetlist.gapSeconds}
          currentCount={songs.length}
          onUse={(songIds) => {
            dispatch({
              type: 'REPLACE_SETLIST_SONGS',
              setlistId: activeSetlist.id,
              songIds,
            })
            setSuggestOpen(false)
          }}
        />
      )}
    </>
  )
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5l1.4 3.9 3.9 1.4-3.9 1.4L8 12.1 6.6 8.2 2.7 6.8l3.9-1.4L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="8.5" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 14h5M8 11.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
