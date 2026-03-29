import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { getActiveProfile } from '../lib/db/queries'

function HandoffPage() {
  return <div>Passage de main — placeholder Story 2.4</div>
}

export const handoffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/handoff',
  beforeLoad: async () => {
    const profile = await getActiveProfile()
    if (!profile) throw redirect({ to: '/onboarding' })
    if (profile.onboardingComplete) throw redirect({ to: '/home' })
    // profile existe + onboardingComplete === false → autoriser (étape handoff normale)
  },
  component: HandoffPage,
})
