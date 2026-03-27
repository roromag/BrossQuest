import { getCompletedSessionForPeriod } from '../lib/db/queries'
import type { SessionPeriod } from '../types/session.types'

export function getCurrentPeriod(): SessionPeriod {
  return new Date().getHours() >= 17 ? 'evening' : 'morning'
}

export async function getCompletedSessionForCurrentPeriod(): Promise<{ period: SessionPeriod } | null> {
  const period = getCurrentPeriod()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const session = await getCompletedSessionForPeriod(period, todayStart)
  return session ? { period } : null
}
