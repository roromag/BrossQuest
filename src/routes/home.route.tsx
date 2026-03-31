import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkProfileStatus } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'
import { getCompletedSessionForCurrentPeriod, getCurrentPeriod } from '../guards/SessionPeriodGuard'

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
    const [profileStatus, camPerm] = await Promise.all([
      checkProfileStatus(),
      checkCameraPermission(),
    ])
    if (profileStatus === 'recovery') throw redirect({ to: '/recovery/profile' })
    if (profileStatus === 'mid-onboarding') throw redirect({ to: '/onboarding' })
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  loader: async () => {
    const restSession = await getCompletedSessionForCurrentPeriod()
    return {
      isRestMode: restSession !== null,
      period: restSession?.period ?? getCurrentPeriod(),
    }
  },
  component: HomePage,
})
