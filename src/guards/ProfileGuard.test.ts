import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../lib/db/schema'
import { checkOnboardingComplete, checkProfileStatus } from './ProfileGuard'
import type { Profile } from '../types/profile.types'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('checkOnboardingComplete', () => {
  it('retourne false si DB vide', async () => {
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne false si onboardingComplete = false', async () => {
    const p: Profile = { id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: false }
    await db.profiles.put(p)
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne true si onboardingComplete = true', async () => {
    const p: Profile = { id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: true }
    await db.profiles.put(p)
    expect(await checkOnboardingComplete()).toBe(true)
  })
})

describe('checkProfileStatus', () => {
  it('retourne "recovery" si DB vide', async () => {
    expect(await checkProfileStatus()).toBe('recovery')
  })

  it('retourne "mid-onboarding" si profil avec onboardingComplete = false', async () => {
    const p: Profile = { id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: false }
    await db.profiles.put(p)
    expect(await checkProfileStatus()).toBe('mid-onboarding')
  })

  it('retourne "ok" si profil avec onboardingComplete = true', async () => {
    const p: Profile = { id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: true }
    await db.profiles.put(p)
    expect(await checkProfileStatus()).toBe('ok')
  })
})
