import { useCallback, useEffect, useRef, useState } from 'react'
import type { Song } from '../types'
import { formatDuration } from '../lib/time'

interface Props {
  name: string
  songs: Song[]
  onClose: () => void
}

export function StageMode({ name, songs, onClose }: Props) {
  const [current, setCurrent] = useState(0)
  const wakeLock = useRef<WakeLockSentinel | null>(null)

  const go = useCallback(
    (dir: -1 | 1) => {
      setCurrent((c) => Math.min(songs.length - 1, Math.max(0, c + dir)))
    },
    [songs.length]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // keep the phone screen awake on stage where supported
  useEffect(() => {
    let cancelled = false
    const request = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen')
          if (cancelled) lock.release()
          else wakeLock.current = lock
        }
      } catch {
        /* not critical */
      }
    }
    request()
    const onVisible = () => {
      if (document.visibilityState === 'visible') request()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      wakeLock.current?.release().catch(() => {})
      wakeLock.current = null
    }
  }, [])

  if (songs.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black text-white">
        <p className="text-white/60">this set is empty.</p>
        <button onClick={onClose} className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm">
          exit stage mode
        </button>
      </div>
    )
  }

  const song = songs[current]
  const next = songs[current + 1]
  const atStart = current === 0
  const atEnd = current === songs.length - 1

  return (
    <div className="fixed inset-0 z-[60] select-none bg-black text-white">
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
        <div className="py-4">
          <p className="truncate text-xs lowercase tracking-widest text-white/40">{name}</p>
        </div>
        <button
          onClick={onClose}
          className="my-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs lowercase tracking-wide text-white/70 transition hover:bg-white/10"
        >
          exit
        </button>
      </div>

      {/* tap zones (prev | next) sit behind the content */}
      <button
        aria-label="previous song"
        onClick={() => go(-1)}
        disabled={atStart}
        className="absolute inset-y-0 left-0 z-0 w-1/2 disabled:opacity-100"
      />
      <button
        aria-label="next song"
        onClick={() => go(1)}
        className="absolute inset-y-0 right-0 z-0 w-1/2"
      />

      {/* current song */}
      <div className="pointer-events-none relative z-0 flex h-[calc(100%-8rem)] flex-col items-center justify-center px-6 text-center">
        <p className="tnum mb-4 text-sm tracking-widest text-white/30">
          {current + 1} / {songs.length}
        </p>
        <h1 className="text-balance text-5xl font-bold leading-tight sm:text-7xl">
          {song.title}
        </h1>
        <div className="tnum mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-2xl text-accent sm:text-3xl">
          {song.key && <span>{song.key}</span>}
          {song.bpm != null && <span className="text-white/50">{song.bpm} bpm</span>}
          <span className="text-white/30">{formatDuration(song.duration)}</span>
        </div>
        {song.notes && (
          <p className="mt-6 max-w-lg text-lg text-white/60 sm:text-2xl">{song.notes}</p>
        )}
      </div>

      {/* bottom: next song + hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 text-sm">
          <span className="text-white/30">{atStart ? '' : '‹ tap left'}</span>
          <span className="min-w-0 flex-1 truncate text-center text-white/50">
            {next ? (
              <>
                next: <span className="text-white/80">{next.title}</span>
              </>
            ) : (
              <span className="text-white/40">last song</span>
            )}
          </span>
          <span className="text-white/30">{atEnd ? '' : 'tap right ›'}</span>
        </div>
      </div>
    </div>
  )
}
