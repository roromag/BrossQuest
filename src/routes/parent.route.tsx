import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'

function ParentPage() {
  return <div>Espace parent — placeholder Story 5.2</div>
}

export const parentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/parent',
  beforeLoad: async () => {
    const onboarded = await checkOnboardingComplete()
    if (!onboarded) throw redirect({ to: '/onboarding' })
  },
  component: ParentPage,
})
