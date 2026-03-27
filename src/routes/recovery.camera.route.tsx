import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function RecoveryCameraPage() {
  return <div>Récupération caméra — placeholder Story 2.2</div>
}

export const recoveryCameraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/camera',
  component: RecoveryCameraPage,
})
