import { describe, it, expect, beforeEach } from 'vitest'
import { useProfileStore } from './useProfileStore'
import type { Profile } from '../types/profile.types'

describe('useProfileStore', () => {
  beforeEach(() => {
    useProfileStore.setState({ profile: null, isDbReady: false })
  })

  it('état initial correct', () => {
    const { profile, isDbReady } = useProfileStore.getState()
    expect(profile).toBeNull()
    expect(isDbReady).toBe(false)
  })

  it('setProfile met à jour le profil', () => {
    const p: Profile = { id: '1', firstName: 'Lena', emoji: '🦊', createdAt: 0, onboardingComplete: true }
    useProfileStore.getState().setProfile(p)
    expect(useProfileStore.getState().profile?.id).toBe('1')
  })

  it('setProfile accepte null', () => {
    useProfileStore.getState().setProfile(null)
    expect(useProfileStore.getState().profile).toBeNull()
  })

  it('setDbReady met à jour isDbReady', () => {
    useProfileStore.getState().setDbReady(true)
    expect(useProfileStore.getState().isDbReady).toBe(true)
  })
})
