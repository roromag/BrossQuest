import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function RecoveryProfilePage() {
  return <div>Récupération profil — placeholder Story 2.5</div>
}

export const recoveryProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/profile',
  component: RecoveryProfilePage,
})
