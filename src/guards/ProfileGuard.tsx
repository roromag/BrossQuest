import { getActiveProfile } from '../lib/db/queries'

export async function checkOnboardingComplete(): Promise<boolean> {
  const profile = await getActiveProfile()
  return profile?.onboardingComplete === true
}

export type ProfileStatus = 'ok' | 'recovery' | 'mid-onboarding'

export async function checkProfileStatus(): Promise<ProfileStatus> {
  const profile = await getActiveProfile()
  if (!profile) return 'recovery'
  if (!profile.onboardingComplete) return 'mid-onboarding'
  return 'ok'
}
