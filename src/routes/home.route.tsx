import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'
import { getCompletedSessionForCurrentPeriod } from '../guards/SessionPeriodGuard'

function HomePage() {
  const { isRestMode, period } = homeRoute.useLoaderData()
  if (isRestMode) {
    const msg = period === 'morning' ? 'À ce soir ✨' : 'À demain ✨'
    return <div>Mode repos — {msg} — placeholder Story 3.1</div>
  }
  return <div>Accueil — placeholder Story 3.1</div>
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: async () => {
    const onboarded = await checkOnboardingComplete()
    if (!onboarded) throw redirect({ to: '/onboarding' })
    const camPerm = await checkCameraPermission()
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  loader: async () => {
    const restSession = await getCompletedSessionForCurrentPeriod()
    return {
      isRestMode: restSession !== null,
      period: restSession?.period ?? 'morning',
    }
  },
  component: HomePage,
})
