import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'

export const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session',
  beforeLoad: async () => {
    const onboarded = await checkOnboardingComplete()
    if (!onboarded) throw redirect({ to: '/onboarding' })
    const camPerm = await checkCameraPermission()
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  component: () => <div>Session — placeholder Story 3.2</div>,
})
