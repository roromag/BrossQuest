import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'
import { useCameraStore } from '../stores/useCameraStore'

export function SessionPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sessionStream = useCameraStore((s) => s.sessionStream)

  useEffect(() => {
    if (!sessionStream) {
      void navigate({ to: '/recovery/camera' })
      return
    }

    const video = videoRef.current
    if (!video) return
    video.srcObject = sessionStream
  }, [navigate, sessionStream])

  return (
    <main className="relative h-[100dvh] w-screen bg-black [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]">
      <video
        ref={videoRef}
        aria-label="Flux caméra session"
        className="h-full w-full object-cover"
        playsInline
        autoPlay
        muted
      />
    </main>
  )
}

export const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session',
  beforeLoad: async () => {
    const [onboarded, camPerm] = await Promise.all([
      checkOnboardingComplete(),
      checkCameraPermission(),
    ])
    if (!onboarded) throw redirect({ to: '/onboarding' })
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  component: SessionPage,
})
