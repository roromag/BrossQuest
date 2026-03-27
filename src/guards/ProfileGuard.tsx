import { getActiveProfile } from '../lib/db/queries'

export async function checkOnboardingComplete(): Promise<boolean> {
  const profile = await getActiveProfile()
  return profile?.onboardingComplete === true
}
