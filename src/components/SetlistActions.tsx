import { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { Song } from '../types'
import { buildShareUrl } from '../lib/share'
import { toPlainText } from '../lib/plaintext'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface Props {
  songs: Song[]
  onEnterStage: () => void
}

export function SetlistActions({ songs, onEnterStage }: Props) {
  const { state, activeSetlist } = useApp()
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState<'url' | 'text' | null>(null)

  if (!activeSetlist) return null

  const disabled = songs.length === 0
  const shareUrl = buildShareUrl(activeSetlist, state.songs)

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
    </>
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
