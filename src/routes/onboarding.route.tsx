import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function OnboardingPage() {
  return <div>Onboarding — placeholder Story 2.1</div>
}

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})
