import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Component, ErrorInfo, ReactNode } from 'react'

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      // Redirige vers /recovery/profile — jamais d'erreur technique brute
      window.location.replace('/BrossQuest/recovery/profile')
      return null
    }
    return this.props.children
  }
}

function RootLayout() {
  return (
    <GlobalErrorBoundary>
      <Outlet />
    </GlobalErrorBoundary>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
