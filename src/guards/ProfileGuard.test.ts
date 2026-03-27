import 'fake-indexeddb/auto'  // ← remplace globalement indexedDB par fake
import { checkOnboardingComplete } from './ProfileGuard'

describe('checkOnboardingComplete', () => {
  beforeEach(() => {
    // Reset DB entre tests
    indexedDB.deleteDatabase('brossquest')
  })

  it('retourne false si la DB est vide', async () => {
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne false si profile.onboardingComplete = false', async () => {
    const db = await openTestDb()
    await addProfile(db, { id: '1', onboardingComplete: false })
    db.close()
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne true si profile.onboardingComplete = true', async () => {
    const db = await openTestDb()
    await addProfile(db, { id: '1', onboardingComplete: true })
    db.close()
    expect(await checkOnboardingComplete()).toBe(true)
  })
})

async function openTestDb(): Promise<IDBDatabase> {
  return new Promise((resolve) => {
    const req = indexedDB.open('brossquest', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('profiles', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
  })
}

async function addProfile(db: IDBDatabase, profile: Record<string, unknown>) {
  return new Promise<void>((resolve) => {
    const tx = db.transaction('profiles', 'readwrite')
    tx.objectStore('profiles').add(profile)
    tx.oncomplete = () => resolve()
  })
}
