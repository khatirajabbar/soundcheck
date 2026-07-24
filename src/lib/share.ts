import type { Setlist, SharePayload, Song } from '../types'
import { resolveSongs } from './time'

const SHARE_PARAM = 's'

/** unicode-safe base64 (btoa only handles latin1) */
function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  // url-safe variant so it survives being pasted into an address bar
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function buildSharePayload(setlist: Setlist, library: Song[]): SharePayload {
  const songs = resolveSongs(setlist, library).map(({ id: _id, ...rest }) => rest)
  return {
    v: 1,
    name: setlist.name,
    gapSeconds: setlist.gapSeconds,
    targetSeconds: setlist.targetSeconds,
    songs,
  }
}

export function buildShareUrl(setlist: Setlist, library: Song[]): string {
  const payload = buildSharePayload(setlist, library)
  const encoded = encodeBase64(JSON.stringify(payload))
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?${SHARE_PARAM}=${encoded}`
}

/** read a share payload from the current URL, or null if there isn't one / it's invalid */
export function readShareFromUrl(): SharePayload | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(SHARE_PARAM)
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeBase64(raw)) as SharePayload
    if (!parsed || !Array.isArray(parsed.songs)) return null
    return parsed
  } catch {
    return null
  }
}
