import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useState, useEffect } from 'react'
import { saveProfile } from '../lib/db/queries'
import { useProfileStore } from '../stores/useProfileStore'
import { useCameraStore } from '../stores/useCameraStore'
import { checkCameraPermission } from '../guards/CameraGuard'
import { PermissionRecovery } from '../components/onboarding/PermissionRecovery'
import type { Profile } from '../types/profile.types'

type OnboardingStep = 'name' | 'camera' | 'pwa'

export function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('name')
  const setProfile = useProfileStore(s => s.setProfile)

  if (step === 'name') {
    return (
      <NameStep
        onComplete={(profile) => {
          setProfile(profile)
          setStep('camera')
        }}
      />
    )
  }

  if (step === 'camera') {
    return <CameraStep onComplete={() => setStep('pwa')} />
  }

  if (step === 'pwa') {
    return <div>Étape PWA — Story 2.3</div>
  }

  return null
}

interface CameraStepProps {
  onComplete: () => void
}

export function CameraStep({ onComplete }: CameraStepProps) {
  const [status, setStatus] = useState<'checking' | 'explain' | 'denied'>('checking')
  const setPermissionState = useCameraStore(s => s.setPermissionState)

  useEffect(() => {
    checkCameraPermission().then((perm) => {
      if (perm === 'granted') {
        onComplete()
      } else if (perm === 'denied') {
        setPermissionState('denied')
        setStatus('denied')
      } else {
        setStatus('explain')
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      setPermissionState('granted')
      onComplete()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionState('denied')
        setStatus('denied')
      }
    }
  }

  if (status === 'checking') return null

  if (status === 'denied') {
    return <PermissionRecovery onRetry={handleRequest} />
  }

  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <h1 className="text-2xl font-bold text-[#EDF2F7]">
          Autoriser la caméra
        </h1>
        <p className="text-sm text-[#A0AEC0]">
          La caméra analyse le mouvement localement. Rien n'est envoyé.
        </p>
        <button
          type="button"
          onClick={handleRequest}
          className="
            w-full rounded-3xl py-4
            bg-accent-cyan text-[#1E2A3A] font-semibold
            min-h-[56px] text-base
            transition-opacity
          "
        >
          Autoriser la caméra
        </button>
      </div>
    </div>
  )
}

interface NameStepProps {
  onComplete: (profile: Profile) => void
}

export function NameStep({ onComplete }: NameStepProps) {
  const [firstName, setFirstName] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const trimmed = firstName.trim()
  const isValid = trimmed.length > 0
  const showError = touched && !isValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setSaveError(false)
    const profile: Profile = {
      id: crypto.randomUUID(),
      firstName: trimmed,
      emoji: '',
      createdAt: Date.now(),
      onboardingComplete: false,
    }
    try {
      await saveProfile(profile)
      onComplete(profile)
    } catch {
      setSaveError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <h1 className="text-2xl font-bold text-[#EDF2F7]">
          Créer le profil de ton aventurier
        </h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm font-medium text-[#A0AEC0]">
            Prénom de l&apos;enfant
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={30}
            autoComplete="off"
            autoFocus
            className="
              w-full rounded-2xl px-4 py-3
              bg-bg-surface text-[#EDF2F7]
              border border-[#4A5568]
              focus:outline-none focus:ring-2 focus:ring-accent-cyan
              text-base min-h-[44px]
            "
          />
          {showError && (
            <p className="text-sm text-accent-erreur">
              Le prénom est requis
            </p>
          )}
        </div>

        {saveError && (
          <p className="text-sm text-accent-erreur">
            Une erreur est survenue. Réessaie.
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="
            w-full rounded-3xl py-4
            bg-accent-cyan text-[#1E2A3A] font-semibold
            min-h-[56px] text-base
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-opacity
          "
        >
          Continuer
        </button>
      </div>
    </form>
  )
}

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})
