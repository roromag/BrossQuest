import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { rootRoute } from './__root'
import { getActiveProfile, saveProfile } from '../lib/db/queries'
import { useProfileStore } from '../stores/useProfileStore'
import { EmojiPicker } from '../components/onboarding/EmojiPicker'
import type { Profile } from '../types/profile.types'

export function HandoffPage() {
  const [profile, setLocalProfile] = useState<Profile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const navigate = useNavigate()
  const setProfileInStore = useProfileStore((s) => s.setProfile)

  useEffect(() => {
    let cancelled = false
    getActiveProfile().then((p) => {
      if (!cancelled) setLocalProfile(p ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleEmojiSelect = async (emoji: string) => {
    if (!profile || isSaving) return
    setIsSaving(true)
    try {
      const updated: Profile = { ...profile, emoji, onboardingComplete: true }
      await saveProfile(updated)
      setProfileInStore(updated)
      navigate({ to: '/home' })
    } catch {
      // saveProfile failure: l'utilisateur reste sur la page, aucune navigation
    } finally {
      setIsSaving(false)
    }
  }

  if (!profile) return null // guard garantit que le profil existe en DB

  if (!showPicker) {
    return (
      <div className="min-h-screen bg-bg-session flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[390px] flex flex-col items-center gap-10">
          <p className="text-white text-2xl font-semibold text-center">
            Quel emoji pour accueillir {profile.firstName} ?
          </p>
          <button
            type="button"
            onClick={() => { navigator.vibrate?.(10); setShowPicker(true) }}
            className="
              w-full py-4 px-6
              bg-accent-cyan text-bg-session
              font-semibold text-lg
              rounded-2xl
              min-h-[56px]
              active:scale-95 transition-transform
            "
          >
            Choisir mon emoji
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-session flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <EmojiPicker onSelect={handleEmojiSelect} animated />
      </div>
    </div>
  )
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
