import { useState } from 'react'

// email is assembled at runtime from parts so it isn't sitting in the markup
// as plain text for scrapers to grab.
const USER = ['khatirajabbar', 'gmail', 'com']

export function Footer() {
  const [revealed, setRevealed] = useState(false)
  const address = `${USER[0]}@${USER[1]}.${USER[2]}`

  return (
    <footer className="no-print mt-10 border-t border-line py-8 text-center text-xs text-ink-30">
      <p>
        if you have any suggestions or problems with the site, feel free to reach me —{' '}
        {revealed ? (
          <a
            href={`mailto:${address}`}
            className="text-accent underline underline-offset-2"
          >
            {address}
          </a>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-accent underline underline-offset-2"
          >
            reveal email
          </button>
        )}
      </p>
      <p className="mt-2 text-ink-30/70">soundcheck · built for musicians</p>
    </footer>
  )
}
