# soundcheck

a setlist and gig planner for musicians. build a set, check it fits the slot,
read it on stage, and share it with the band — all in the browser, no account,
no backend.

musicians usually plan sets in a notes app or on paper. that doesn't tell you
whether the set fits a 45-minute festival slot, keeps the key/tempo info handy on
stage, or lets you hand a clean list to the sound engineer. soundcheck does all of
that.

## features

- **song library** — title, duration (mm:ss), key, bpm, notes ("capo 2", "Oliver
  starts") and tags (acoustic / electronic / cover / original). search and filter.
- **setlist builder** — multiple named setlists, drag songs in from the library,
  reorder by drag-and-drop (works on touch too), remove them.
- **runtime calculator** — live total at the top, a target slot length, and
  remaining/over time in green/red, plus a configurable banter gap between songs
  (default 30s) that counts toward the total.
- **set analysis** — tempo flow chart, originals vs covers, and a warning when
  three or more slow songs (≤ 90 bpm) land back to back.
- **share link** — encodes the whole setlist into the URL (base64 of the JSON), so
  opening the link shows a clean read-only view. no backend, no accounts.
- **stage mode** — a large-text, dark, distraction-free fullscreen view for reading
  on a phone on stage. current song highlighted, tap left/right (or arrow keys) to
  move, and it keeps the screen awake where the browser supports it.
- **export** — print-friendly PDF (big type for taping to the stage floor, via your
  browser's print dialog) and a plain-text copy button for the sound engineer.
- **your data stays yours** — everything is saved in `localStorage`. export/import
  a JSON backup any time so you never lose a set.

the app ships with a few example songs so it isn't empty on first run.

## stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [@dnd-kit](https://dndkit.com/) for accessible, touch-friendly drag-and-drop

no other runtime dependencies. the tempo chart, share encoding, and PDF export are
all hand-rolled.

## running it locally

requires Node 18+.

```bash
npm install
npm run dev      # start the dev server (prints a local URL)
npm run build    # type-check and build for production into dist/
npm run preview  # preview the production build
```

## deploying

it's a static site, so it deploys to [Vercel](https://vercel.com/) with zero config:
import the repo and Vercel auto-detects Vite (build `npm run build`, output `dist`).
any static host (Netlify, GitHub Pages, Cloudflare Pages) works the same way.

## project structure

```
src/
  components/        UI — library, builder, runtime bar, analysis, stage mode, share view
    ui/              small primitives (Button, Modal, TagPill)
  lib/               pure logic — time math, analysis, share encoding, storage, plain-text
  store/             app state (useReducer + context) persisted to localStorage
  types.ts           shared types
```

## notes on data & privacy

there's no server. setlists and songs live only in your browser's `localStorage`.
share links carry the setlist inside the URL itself, so sharing a link doesn't send
your data anywhere central — it's all in the link you paste.

---

if you have any suggestions or problems with the site, feel free to reach me — the
contact email is on the site footer.
