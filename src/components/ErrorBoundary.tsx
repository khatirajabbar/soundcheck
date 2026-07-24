import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Catches any render error so an unexpected bug shows a friendly recovery screen
 * instead of a blank page. The user's songs and setlists live in localStorage, so
 * nothing is lost — a reload brings everything back.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-2 text-xs lowercase tracking-widest text-accent">soundcheck</p>
        <h1 className="text-lg font-semibold lowercase">something went wrong</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-50">
          an unexpected error interrupted the app. your songs and setlists are saved in
          this browser and are safe — reloading should bring everything back.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 h-10 rounded-lg bg-ink px-4 text-sm font-medium lowercase tracking-wide text-white transition hover:bg-ink/90"
        >
          reload soundcheck
        </button>
      </div>
    )
  }
}
