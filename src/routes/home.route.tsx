import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkProfileStatus } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'
import { getCompletedSessionForCurrentPeriod, getCurrentPeriod } from '../guards/SessionPeriodGuard'
import { NarrativeCard } from '../components/onboarding/NarrativeCard'
import { ParentAccessIcon } from '../components/parent/ParentAccessIcon'
import { PulseButton } from '../components/session/PulseButton'
import { useCameraStore } from '../stores/useCameraStore'
import { useEpisodeStore } from '../stores/useEpisodeStore'
import { useSessionStore } from '../stores/useSessionStore'
import { launchSessionFromHomeTap } from './home.launch-session'

interface HomePageProps {
  loaderData?: { isRestMode: boolean; period: 'morning' | 'evening' }
}

function HomePending() {
  return (
    <main className="flex h-[100dvh] w-screen items-center justify-center bg-bg-session text-white/70 [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]">
      <p className="text-lg">Chargement…</p>
    </main>
  )
}

export function HomePage({ loaderData }: HomePageProps = {}) {
  const resolvedLoaderData = loaderData ?? homeRoute.useLoaderData() ?? { isRestMode: false, period: 'morning' as const }
  const { isRestMode, period } = resolvedLoaderData
  const navigate = useNavigate()
  const isMediaPipeLoading = useCameraStore((s) => s.isMediaPipeLoading)
  const detectionState = useCameraStore((s) => s.detectionState)
  const setPermissionState = useCameraStore((s) => s.setPermissionState)
  const setMediaPipeLoading = useCameraStore((s) => s.setMediaPipeLoading)
  const setSessionStream = useCameraStore((s) => s.setSessionStream)
  const currentEpisodeId = useEpisodeStore((s) => s.currentEpisode?.id)

  const pulseState = detectionState === 'HAND_LOST' ? 'idle' : 'presence-detected'
  const episodeTitle = currentEpisodeId ? `Épisode ${currentEpisodeId}` : 'Épisode du jour'
  const handleLaunchSession = () => {
    if (useCameraStore.getState().isMediaPipeLoading) return
    launchSessionFromHomeTap({
      setPermissionState,
      setMediaPipeLoading,
      setSessionStream,
      onSessionCameraReady: () => {
        useSessionStore.getState().setPhase('before')
      },
      navigateTo: (path) => navigate({ to: path }),
      onError: (error) => {
        console.error('[home] camera launch failed', error)
      },
    })
  }

  if (isRestMode) {
    const msg = period === 'morning' ? 'À ce soir ✨' : 'À demain ✨'
    return (
      <div className="flex min-h-[100dvh] w-screen items-center justify-center bg-bg-session text-white [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]">
        Mode repos — {msg}
      </div>
    )
  }

  return (
    <main className="h-[100dvh] w-screen bg-bg-session [padding:env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)]">
      <NarrativeCard episodeTitle={episodeTitle}>
        <PulseButton state={pulseState} disabled={isMediaPipeLoading} onClick={handleLaunchSession} />
        <ParentAccessIcon />
      </NarrativeCard>
    </main>
  )
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: async () => {
    const [profileStatus, camPerm] = await Promise.all([
      checkProfileStatus(),
      checkCameraPermission(),
    ])
    if (profileStatus === 'recovery') throw redirect({ to: '/recovery/profile' })
    if (profileStatus === 'mid-onboarding') throw redirect({ to: '/onboarding' })
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  loader: async () => {
    const restSession = await getCompletedSessionForCurrentPeriod()
    return {
      isRestMode: restSession !== null,
      period: restSession?.period ?? getCurrentPeriod(),
    }
  },
  pendingComponent: HomePending,
  component: HomePage,
})
