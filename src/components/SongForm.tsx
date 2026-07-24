import { useState } from 'react'
import { ALL_TAGS, type Song, type Tag } from '../types'
import { formatDuration, parseDuration } from '../lib/time'
import { Button } from './ui/Button'
import { TagPill } from './ui/TagPill'

interface Props {
  initial?: Song
  /** prefill the title when adding a new song (e.g. from the library search) */
  initialTitle?: string
  onSubmit: (data: Omit<Song, 'id'>) => void
  onCancel: () => void
}

export function SongForm({ initial, initialTitle, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? initialTitle ?? '')
  const [durationText, setDurationText] = useState(
    initial ? formatDuration(initial.duration) : ''
  )
  const [key, setKey] = useState(initial?.key ?? '')
  const [bpmText, setBpmText] = useState(
    initial?.bpm != null ? String(initial.bpm) : ''
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [tags, setTags] = useState<Tag[]>(initial?.tags ?? [])
  const [error, setError] = useState<string | null>(null)

  function toggleTag(tag: Tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('a song needs a title.')
      return
    }
    const duration = parseDuration(durationText)
    if (duration == null) {
      setError('duration should look like 3:45.')
      return
    }
    let bpm: number | null = null
    if (bpmText.trim()) {
      const n = Number(bpmText)
      if (Number.isNaN(n) || n <= 0 || n > 400) {
        setError('bpm should be a number between 1 and 400.')
        return
      }
      bpm = Math.round(n)
    }
    onSubmit({
      title: title.trim(),
      duration,
      key: key.trim(),
      bpm,
      notes: notes.trim(),
      tags,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="song-title">
          title
        </label>
        <input
          id="song-title"
          className="field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="coastline"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor="song-duration">
            duration
          </label>
          <input
            id="song-duration"
            className="field tnum"
            value={durationText}
            onChange={(e) => setDurationText(e.target.value)}
            placeholder="3:45"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="label" htmlFor="song-key">
            key
          </label>
          <input
            id="song-key"
            className="field"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Am"
          />
        </div>
        <div>
          <label className="label" htmlFor="song-bpm">
            bpm
          </label>
          <input
            id="song-bpm"
            className="field tnum"
            value={bpmText}
            onChange={(e) => setBpmText(e.target.value)}
            placeholder="120"
            inputMode="numeric"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="song-notes">
          notes
        </label>
        <input
          id="song-notes"
          className="field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="capo 2 · Oliver starts"
        />
      </div>

      <div>
        <span className="label">tags</span>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              active={tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          cancel
        </Button>
        <Button type="submit" variant="primary">
          {initial ? 'save changes' : 'add song'}
        </Button>
      </div>
    </form>
  )
}
