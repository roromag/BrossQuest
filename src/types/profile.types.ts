export interface Profile {
  id: string           // crypto.randomUUID()
  firstName: string
  emoji: string
  createdAt: number    // Date.now()
  onboardingComplete: boolean
}
