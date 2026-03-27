import 'fake-indexeddb/auto'
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { db } from '../lib/db/schema'
import { getCompletedSessionForCurrentPeriod, getCurrentPeriod } from './SessionPeriodGuard'
import type { SessionHistoryEntry } from '../types/session.types'

describe('getCurrentPeriod', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }) })
  afterEach(() => { vi.useRealTimers() })

  it('retourne "evening" à 17h ou après', () => {
    vi.setSystemTime(new Date('2026-03-27T17:00:00'))
    expect(getCurrentPeriod()).toBe('evening')
  })

  it('retourne "morning" avant 17h', () => {
    vi.setSystemTime(new Date('2026-03-27T09:00:00'))
    expect(getCurrentPeriod()).toBe('morning')
  })
})

describe('getCompletedSessionForCurrentPeriod', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-27T09:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retourne null si la DB est vide', async () => {
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })

  it('retourne null si aucune session complétée aujourd\'hui', async () => {
    const yesterday = new Date('2026-03-26T08:00:00').getTime()
    const entry: SessionHistoryEntry = {
      id: '1', episodeId: 'ep-001', date: yesterday,
      period: 'morning', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await db.sessionHistory.put(entry)
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })

  it('retourne null si session d\'aujourd\'hui mais période différente', async () => {
    const todayMorning = new Date('2026-03-27T08:00:00').getTime()
    const entry: SessionHistoryEntry = {
      id: '1', episodeId: 'ep-001', date: todayMorning,
      period: 'evening', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await db.sessionHistory.put(entry)
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })

  it('retourne {period} si session matinale complétée aujourd\'hui', async () => {
    const todayMorning = new Date('2026-03-27T08:00:00').getTime()
    const entry: SessionHistoryEntry = {
      id: '1', episodeId: 'ep-001', date: todayMorning,
      period: 'morning', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await db.sessionHistory.put(entry)
    const result = await getCompletedSessionForCurrentPeriod()
    expect(result).toEqual({ period: 'morning' })
  })

  it('retourne {period} si session du soir complétée pour la période "evening"', async () => {
    vi.setSystemTime(new Date('2026-03-27T18:00:00'))
    const todayEvening = new Date('2026-03-27T17:30:00').getTime()
    const entry: SessionHistoryEntry = {
      id: '1', episodeId: 'ep-001', date: todayEvening,
      period: 'evening', totalDuration: 600, totalPauseTime: 0,
      zonesCompleted: 8, status: 'completed',
    }
    await db.sessionHistory.put(entry)
    const result = await getCompletedSessionForCurrentPeriod()
    expect(result).toEqual({ period: 'evening' })
  })

  it('retourne null si session d\'aujourd\'hui mais status interrompu', async () => {
    const todayMorning = new Date('2026-03-27T08:00:00').getTime()
    const entry: SessionHistoryEntry = {
      id: '1', episodeId: 'ep-001', date: todayMorning,
      period: 'morning', totalDuration: 300, totalPauseTime: 0,
      zonesCompleted: 4, status: 'interrupted',
    }
    await db.sessionHistory.put(entry)
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })
})
