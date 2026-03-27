export async function checkOnboardingComplete(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open('brossquest')
    request.onupgradeneeded = () => {
      // DB n'existe pas encore → pas onboardé
      request.result.close()
      resolve(false)
    }
    request.onerror = () => resolve(false)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('profiles')) {
        db.close()
        resolve(false)
        return
      }
      const tx = db.transaction('profiles', 'readonly')
      const getAllReq = tx.objectStore('profiles').getAll()
      getAllReq.onsuccess = () => {
        db.close()
        const profiles = getAllReq.result as Array<{ onboardingComplete?: boolean }>
        resolve(profiles.some(p => p.onboardingComplete === true))
      }
      getAllReq.onerror = () => { db.close(); resolve(false) }
    }
  })
}
