import { useMemo, useState } from 'react'
import { AppProvider, useApp } from './store/AppContext'
import { readShareFromUrl } from './lib/share'
import { resolveSongs } from './lib/time'
import { Header } from './components/Header'
import { SetBoard } from './components/SetBoard'
import { RuntimeBar } from './components/RuntimeBar'
import { SetlistActions } from './components/SetlistActions'
import { StageMode } from './components/StageMode'
import { PrintSheet } from './components/PrintSheet'
import { ShareView } from './components/ShareView'
import { Footer } from './components/Footer'

export default function App() {
  // a share link short-circuits the whole app into a clean read-only view
  const shared = useMemo(() => readShareFromUrl(), [])
  if (shared) return <ShareView payload={shared} />

  return (
    <AppProvider>
      <Workspace />
    </AppProvider>
  )
}

function Workspace() {
  const { state, activeSetlist } = useApp()
  const [stage, setStage] = useState(false)

  const songs = useMemo(
    () => (activeSetlist ? resolveSongs(activeSetlist, state.songs) : []),
    [activeSetlist, state.songs]
  )

  return (
    <div className="flex min-h-full flex-col">
      <div className="no-print sticky top-0 z-30">
        <Header />
      </div>

      <main className="no-print mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">
        {activeSetlist && (
          <div className="card mb-4 px-4 py-4 sm:px-5">
            <RuntimeBar setlist={activeSetlist} songs={songs} />
            <div className="mt-4 border-t border-line pt-4">
              <SetlistActions songs={songs} onEnterStage={() => setStage(true)} />
            </div>
          </div>
        )}

        <SetBoard />

        <Footer />
      </main>

      {activeSetlist && (
        <PrintSheet
          name={activeSetlist.name}
          songs={songs}
          gapSeconds={activeSetlist.gapSeconds}
        />
      )}

      {stage && activeSetlist && (
        <StageMode
          name={activeSetlist.name}
          songs={songs}
          onClose={() => setStage(false)}
        />
      )}
    </div>
  )
}
