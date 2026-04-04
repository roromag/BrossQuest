import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'
import { CameraFade } from '../components/session/CameraFade'
import { NebulaCanvas } from '../components/session/NebulaCanvas'
import { speakPhaseBeforeNarration } from '../lib/speech/phaseBeforeNarration'
import { useCameraStore } from '../stores/useCameraStore'
import { useProfileStore } from '../stores/useProfileStore'
import { ZONE_DURATION_MS } from '../lib/session/zones'
import { useSessionStore } from '../stores/useSessionStore'

export function SessionPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const narratedRef = useRef(false)

  const sessionStream = useCameraStore((s) => s.sessionStream)
  const setSessionStream = useCameraStore((s) => s.setSessionStream)
  const setDetectionState = useCameraStore((s) => s.setDetectionState)
  const setBrushVelocitySmoothed = useCameraStore((s) => s.setBrushVelocitySmoothed)
  const phase = useSessionStore((s) => s.phase)
  const setPhase = useSessionStore((s) => s.setPhase)

  const showBeforeCamera =
    sessionStream != null && phase !== 'during' && phase !== 'after'

  useLayoutEffect(() => {
    if (!sessionStream) return
    if (useSessionStore.getState().phase === null) {
      setPhase('before')
    }
  }, [sessionStream, setPhase])

  useEffect(() => {
    if (sessionStream) return
    const p = useSessionStore.getState().phase
    if (p === 'during' || p === 'after') return
    void navigate({ to: '/recovery/camera' })
  }, [navigate, sessionStream])

  useEffect(() => {
    if (!sessionStream) return
    const p = useSessionStore.getState().phase
    if (p === 'during' || p === 'after') return
    if (narratedRef.current) return
    narratedRef.current = true
    const firstName = useProfileStore.getState().profile?.firstName
    speakPhaseBeforeNarration(firstName)
  }, [sessionStream])

  /** Placeholder Story 3.4 : sans ça `activeZone` ne change jamais et la nébuleuse ne dérive pas entre les 8 cibles. Remplacer en 3.5 par progression réelle. */
  useEffect(() => {
    if (phase !== 'during') return
    const id = globalThis.setInterval(() => {
      useSessionStore.getState().advanceZone()
    }, ZONE_DURATION_MS)
    return () => globalThis.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (!sessionStream) return
    if (!showBeforeCamera) return
    const video = videoRef.current
    if (!video) return
    video.srcObject = sessionStream
  }, [sessionStream, showBeforeCamera])

  const handleFadeComplete = () => {
    setSessionStream(null)
    setDetectionState('BRUSHING')
    setBrushVelocitySmoothed(0)
    setPhase('during')
  }

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-black [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]">
      {showBeforeCamera && sessionStream ? (
        <div className="absolute inset-0">
          <CameraFade
            stream={sessionStream}
            videoRef={videoRef}
            onFadeComplete={handleFadeComplete}
          />
        </div>
      ) : null}
      {phase === 'during' ? (
        <div className="absolute inset-0">
          <NebulaCanvas />
        </div>
      ) : null}
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
