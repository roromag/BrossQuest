import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './schema'
import {
  getActiveProfile,
  saveProfile,
  getActiveSession,
  saveSessionState,
  clearSessionState,
  saveSessionHistory,
  getCompletedSessionForPeriod,
} from './queries'
import type { Profile } from '../../types/profile.types'
import type { SessionState, SessionHistoryEntry } from '../../types/session.types'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('getActiveProfile', () => {
  it('retourne undefined si DB vide', async () => {
    expect(await getActiveProfile()).toBeUndefined()
  })

  it('retourne le profil onboardé', async () => {
    const profile: Profile = {
      id: '1', firstName: 'Lena', emoji: '🦊',
      createdAt: Date.now(), onboardingComplete: true,
    }
    await saveProfile(profile)
    const result = await getActiveProfile()
    expect(result?.id).toBe('1')
  })

  it('retourne le premier profil si aucun n\'est onboardé', async () => {
    const profile: Profile = {
      id: '2', firstName: 'Tom', emoji: '🐯',
      createdAt: Date.now(), onboardingComplete: false,
    }
    await saveProfile(profile)
    const result = await getActiveProfile()
    expect(result?.id).toBe('2')
  })
})

describe('saveProfile', () => {
  it('enregistre un profil et le retrouve', async () => {
    const profile: Profile = {
      id: 'abc', firstName: 'Nina', emoji: '🐰',
      createdAt: 100, onboardingComplete: true,
    }
    await saveProfile(profile)
    const result = await db.profiles.get('abc')
    expect(result?.firstName).toBe('Nina')
  })

  it('écrase un profil existant (upsert)', async () => {
    const profile: Profile = {
      id: 'abc', firstName: 'Nina', emoji: '🐰',
      createdAt: 100, onboardingComplete: false,
    }
    await saveProfile(profile)
    await saveProfile({ ...profile, onboardingComplete: true })
    const result = await db.profiles.get('abc')
    expect(result?.onboardingComplete).toBe(true)
  })
})

describe('getActiveSession / saveSessionState / clearSessionState', () => {
  const state: SessionState = {
    episodeId: 'ep-001',
    activeZone: 3,
    zoneProgress: { 1: 30, 2: 45, 3: 10 },
    status: 'in_progress',
    startedAt: 1000,
    period: 'morning',
  }

  it('retourne undefined si aucune session en cours', async () => {
    expect(await getActiveSession()).toBeUndefined()
  })

  it('sauvegarde et récupère la session en cours', async () => {
    await saveSessionState(state)
    const result = await getActiveSession()
    expect(result?.episodeId).toBe('ep-001')
    expect(result?.activeZone).toBe(3)
    // _id ne doit pas être dans le résultat
    expect((result as unknown as Record<string, unknown>)._id).toBeUndefined()
  })

  it('efface la session en cours', async () => {
    await saveSessionState(state)
    await clearSessionState()
    expect(await getActiveSession()).toBeUndefined()
  })

  it('upsert — saveSessionState deux fois garde 1 seul enregistrement', async () => {
    await saveSessionState(state)
    await saveSessionState({ ...state, activeZone: 5 })
    const all = await db.sessionState.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].activeZone).toBe(5)
  })
})

describe('getCompletedSessionForPeriod', () => {
  it('retourne undefined si aucune session complète aujourd\'hui', async () => {
    const todayStart = new Date().setHours(0, 0, 0, 0)
    expect(await getCompletedSessionForPeriod('morning', todayStart)).toBeUndefined()
  })

  it('retourne la session si complète pour la bonne période aujourd\'hui', async () => {
    const todayStart = new Date('2026-03-27').setHours(0, 0, 0, 0)
    const entry: SessionHistoryEntry = {
      id: 's1', episodeId: 'ep-001',
      date: new Date('2026-03-27T08:00:00').getTime(),
      period: 'morning', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await saveSessionHistory(entry)
    const result = await getCompletedSessionForPeriod('morning', todayStart)
    expect(result?.id).toBe('s1')
  })

  it('ignore une session d\'une autre période', async () => {
    const todayStart = new Date('2026-03-27').setHours(0, 0, 0, 0)
    const entry: SessionHistoryEntry = {
      id: 's2', episodeId: 'ep-001',
      date: new Date('2026-03-27T17:30:00').getTime(),
      period: 'evening', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await saveSessionHistory(entry)
    const result = await getCompletedSessionForPeriod('morning', todayStart)
    expect(result).toBeUndefined()
  })

  it('ignore une session d\'hier', async () => {
    const todayStart = new Date('2026-03-27').setHours(0, 0, 0, 0)
    const entry: SessionHistoryEntry = {
      id: 's3', episodeId: 'ep-001',
      date: new Date('2026-03-26T08:00:00').getTime(),
      period: 'morning', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await saveSessionHistory(entry)
    const result = await getCompletedSessionForPeriod('morning', todayStart)
    expect(result).toBeUndefined()
  })

  it('ignore une session interrompue', async () => {
    const todayStart = new Date('2026-03-27').setHours(0, 0, 0, 0)
    const entry: SessionHistoryEntry = {
      id: 's4', episodeId: 'ep-001',
      date: new Date('2026-03-27T08:00:00').getTime(),
      period: 'morning', totalDuration: 300, totalPauseTime: 0,
      zonesCompleted: 4, status: 'interrupted',
    }
    await saveSessionHistory(entry)
    const result = await getCompletedSessionForPeriod('morning', todayStart)
    expect(result).toBeUndefined()
  })
})
