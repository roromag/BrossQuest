import type { CameraStartResult } from '../lib/camera/sessionCamera'
import { startSessionCamera } from '../lib/camera/sessionCamera'
import { ensureSessionAudioReady, setupSessionAudioVisibilityResume } from '../lib/audio/sessionAudio'

interface LaunchSessionDeps {
  setPermissionState: (value: 'granted' | 'denied' | 'prompt') => void
  setMediaPipeLoading: (value: boolean) => void
  setSessionStream: (stream: MediaStream | null) => void
  navigateTo: (path: '/session' | '/recovery/camera') => void
  startCamera?: () => Promise<CameraStartResult>
  onError?: (error: unknown) => void
}

export function launchSessionFromHomeTap(deps: LaunchSessionDeps): void {
  deps.setMediaPipeLoading(true)
  ensureSessionAudioReady()
  setupSessionAudioVisibilityResume()

  const startCamera = deps.startCamera ?? startSessionCamera
  void startCamera()
    .then((result) => {
      if (result.ok) {
        deps.setSessionStream(result.stream)
        deps.setPermissionState('granted')
        deps.navigateTo('/session')
        return
      }

      deps.setSessionStream(null)
      deps.setPermissionState(result.reason === 'permission-denied' ? 'denied' : 'prompt')
      deps.navigateTo('/recovery/camera')
    })
    .catch((error) => {
      deps.setSessionStream(null)
      deps.setPermissionState('prompt')
      deps.navigateTo('/recovery/camera')
      deps.onError?.(error)
    })
    .finally(() => {
      deps.setMediaPipeLoading(false)
    })
}
