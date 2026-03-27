import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'

function HandoffPage() {
  return <div>Passage de main — placeholder Story 2.4</div>
}

export const handoffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/handoff',
  beforeLoad: async () => {
    const onboarded = await checkOnboardingComplete()
    if (!onboarded) throw redirect({ to: '/onboarding' })
  },
  component: HandoffPage,
})
