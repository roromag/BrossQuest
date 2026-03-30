import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { PermissionRecovery } from '../components/onboarding/PermissionRecovery'
import { useCameraStore } from '../stores/useCameraStore'

export function RecoveryCameraPage() {
  const navigate = useNavigate()
  const setPermissionState = useCameraStore(s => s.setPermissionState)

  const handleRetry = async () => {
    if (!navigator.mediaDevices) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      setPermissionState('granted')
      navigate({ to: '/home' })
    } catch {
      // Permission refusée ou erreur matérielle — PermissionRecovery reste affiché
    }
  }

  return <PermissionRecovery onRetry={handleRetry} />
}

export const recoveryCameraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/camera',
  component: RecoveryCameraPage,
})
