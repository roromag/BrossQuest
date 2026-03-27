import { create } from 'zustand'
import type { Profile } from '../types/profile.types'

interface ProfileStore {
  profile: Profile | null
  isDbReady: boolean
  setProfile: (profile: Profile | null) => void
  setDbReady: (ready: boolean) => void
}

export const useProfileStore = create<ProfileStore>()((set) => ({
  profile: null,
  isDbReady: false,
  setProfile: (profile) => set({ profile }),
  setDbReady: (ready) => set({ isDbReady: ready }),
}))
