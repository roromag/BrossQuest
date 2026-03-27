import 'fake-indexeddb/auto'
import { getCompletedSessionForCurrentPeriod, getCurrentPeriod } from './SessionPeriodGuard'
import type { SessionPeriod } from '../types/session.types'

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
  beforeEach(() => {
    indexedDB.deleteDatabase('brossquest')
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
    const db = await openTestDb()
    const yesterday = new Date('2026-03-26T08:00:00').getTime()
    await addSession(db, { id: '1', period: 'morning', status: 'completed', date: yesterday })
    db.close()
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })

  it('retourne null si session d\'aujourd\'hui mais période différente', async () => {
    const db = await openTestDb()
    const todayMorning = new Date('2026-03-27T08:00:00').getTime()
    await addSession(db, { id: '1', period: 'evening', status: 'completed', date: todayMorning })
    db.close()
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })

  it('retourne {period} si session complétée aujourd\'hui pour la période courante', async () => {
    const db = await openTestDb()
    const todayMorning = new Date('2026-03-27T08:00:00').getTime()
    await addSession(db, { id: '1', period: 'morning' as SessionPeriod, status: 'completed', date: todayMorning })
    db.close()
    const result = await getCompletedSessionForCurrentPeriod()
    expect(result).toEqual({ period: 'morning' })
  })

  it('retourne null si session d\'aujourd\'hui mais status interrompu', async () => {
    const db = await openTestDb()
    const todayMorning = new Date('2026-03-27T08:00:00').getTime()
    await addSession(db, { id: '1', period: 'morning', status: 'interrupted', date: todayMorning })
    db.close()
    expect(await getCompletedSessionForCurrentPeriod()).toBeNull()
  })
})

async function openTestDb(): Promise<IDBDatabase> {
  return new Promise((resolve) => {
    const req = indexedDB.open('brossquest', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('sessionHistory', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
  })
}

async function addSession(db: IDBDatabase, session: Record<string, unknown>) {
  return new Promise<void>((resolve) => {
    const tx = db.transaction('sessionHistory', 'readwrite')
    tx.objectStore('sessionHistory').add(session)
    tx.oncomplete = () => resolve()
  })
}
