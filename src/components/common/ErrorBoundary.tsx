import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from './primitives'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render-time errors so one broken screen doesn't blank the whole portal. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-[20px] font-semibold text-navy-900">Something went wrong</h1>
        <p className="max-w-md text-[13px] text-grey-600">{this.state.error.message}</p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    )
  }
}
