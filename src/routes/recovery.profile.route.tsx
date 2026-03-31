import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { rootRoute } from './__root'
import { getActiveProfile, saveProfile } from '../lib/db/queries'
import { useProfileStore } from '../stores/useProfileStore'
import { EmojiPicker } from '../components/onboarding/EmojiPicker'
import type { Profile } from '../types/profile.types'

type RecoveryStep = 'name' | 'emoji'

export function RecoveryProfilePage() {
  const [step, setStep] = useState<RecoveryStep>('name')
  const [firstName, setFirstName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const navigate = useNavigate()
  const setProfileInStore = useProfileStore(s => s.setProfile)

  const handleNameSubmit = (name: string) => {
    setFirstName(name.trim())
    setStep('emoji')
  }

  const handleEmojiSelect = async (emoji: string) => {
    if (saving) return
    setSaving(true)
    setSaveError(false)
    const profile: Profile = {
      id: crypto.randomUUID(),
      firstName,
      emoji,
      createdAt: Date.now(),
      onboardingComplete: true,
    }
    try {
      await saveProfile(profile)
      setProfileInStore(profile)
      navigate({ to: '/home' })
    } catch {
      setSaving(false)
      setSaveError(true)
    }
  }

  if (step === 'emoji') {
    return (
      <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[390px] flex flex-col gap-10">
          <p className="text-lg font-semibold text-[#EDF2F7]">
            Choisis ton emoji, {firstName} !
          </p>
          <EmojiPicker onSelect={handleEmojiSelect} />
          {saveError && (
            <p className="text-sm text-center text-[#A0AEC0]">
              Une erreur est survenue. Essaie encore.
            </p>
          )}
        </div>
      </div>
    )
  }

  return <RecoveryNameStep onComplete={handleNameSubmit} />
}

interface RecoveryNameStepProps {
  onComplete: (name: string) => void
}

function RecoveryNameStep({ onComplete }: RecoveryNameStepProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onComplete(value.trim())
  }

  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#EDF2F7] mb-3">
            On repart de zéro !
          </h1>
          <p className="text-sm text-[#A0AEC0]">
            L&apos;app a perdu ses données. Pas d&apos;inquiétude — ça prend moins d&apos;une minute pour retrouver votre espace.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Prénom de l'enfant"
            maxLength={30}
            autoFocus
            className="
              w-full rounded-2xl px-4 py-3
              bg-[#3D4F63] text-[#EDF2F7]
              placeholder-[#718096]
              text-base outline-none
              focus:ring-2 focus:ring-accent-cyan
            "
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="
              w-full rounded-3xl py-4
              bg-accent-cyan text-[#1E2A3A] font-semibold
              min-h-[56px] text-base
              disabled:opacity-40 transition-opacity
            "
          >
            Continuer
          </button>
        </form>
      </div>
    </div>
  )
}

export const recoveryProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/profile',
  beforeLoad: async () => {
    const profile = await getActiveProfile()
    if (profile?.onboardingComplete) throw redirect({ to: '/home' })
    if (profile && !profile.onboardingComplete) throw redirect({ to: '/onboarding' })
    // Pas de profil → autoriser le flux de récupération
  },
  component: RecoveryProfilePage,
})
