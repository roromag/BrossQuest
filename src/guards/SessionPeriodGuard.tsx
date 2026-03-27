import type { SessionPeriod } from '../types/session.types'

export function getCurrentPeriod(): SessionPeriod {
  return new Date().getHours() >= 17 ? 'evening' : 'morning'
}

export async function getCompletedSessionForCurrentPeriod(): Promise<{ period: SessionPeriod } | null> {
  const period = getCurrentPeriod()
  const todayStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  ).getTime()

  return new Promise((resolve) => {
    const request = indexedDB.open('brossquest')
    request.onupgradeneeded = () => { request.result.close(); resolve(null) }
    request.onerror = () => resolve(null)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('sessionHistory')) {
        db.close()
        resolve(null)
        return
      }
      const tx = db.transaction('sessionHistory', 'readonly')
      const getAllReq = tx.objectStore('sessionHistory').getAll()
      getAllReq.onsuccess = () => {
        db.close()
        const sessions = getAllReq.result as Array<{
          period?: string; date?: number; status?: string
        }>
        const found = sessions.some(s =>
          s.period === period &&
          s.status === 'completed' &&
          typeof s.date === 'number' &&
          s.date >= todayStart
        )
        resolve(found ? { period } : null)
      }
      getAllReq.onerror = () => { db.close(); resolve(null) }
    }
  })
}
