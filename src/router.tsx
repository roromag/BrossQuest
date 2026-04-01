import { createRouter, createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { onboardingRoute } from './routes/onboarding.route'
import { handoffRoute } from './routes/handoff.route'
import { homeRoute } from './routes/home.route'
import { sessionRoute } from './routes/session.route'
import { parentRoute } from './routes/parent.route'
import { recoveryCameraRoute } from './routes/recovery.camera.route'
import { recoveryProfileRoute } from './routes/recovery.profile.route'
import { spikeRoute } from './routes/spike.route'

// Routes protégées par ProfileGuard (onboarding requis) → home, session, handoff, parent
// Routes protégées par CameraGuard (permission caméra) → home, session
// NB: les guards sont définis dans beforeLoad de chaque route (voir fichiers .route.tsx)

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/onboarding' }) },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  handoffRoute,
  homeRoute,
  sessionRoute,
  parentRoute,
  recoveryCameraRoute,
  recoveryProfileRoute,
  spikeRoute,
])

export const router = createRouter({
  routeTree,
  basepath: '/BrossQuest',   // ⚠️ même valeur que vite.config.ts `base`
  defaultPendingComponent: () => (
    <div className="flex min-h-[100dvh] items-center justify-center bg-bg-session px-4 text-white/70">
      Chargement…
    </div>
  ),
})

// Enregistrement TypeScript global — nécessaire pour les hooks typés
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
