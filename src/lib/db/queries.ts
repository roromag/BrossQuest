import { db } from './schema'
import type { Profile } from '../../types/profile.types'
import type { SessionState, SessionHistoryEntry, SessionPeriod } from '../../types/session.types'

const SESSION_STATE_KEY = 'current'

// ── Profil ──────────────────────────────────────────────────────────────────

export async function getActiveProfile(): Promise<Profile | undefined> {
  try {
    const profiles = await db.profiles.toArray()
    return profiles.find(p => p.onboardingComplete) ?? profiles[0]
  } catch (e) {
    console.error('[DB] getActiveProfile', e)
    return undefined
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await db.profiles.put(profile)
  } catch (e) {
    console.error('[DB] saveProfile', e)
  }
}

// ── Session en cours ─────────────────────────────────────────────────────────

export async function getActiveSession(): Promise<SessionState | undefined> {
  try {
    const record = await db.sessionState.get(SESSION_STATE_KEY)
    if (!record) return undefined
    const { _id: _, ...state } = record
    return state as SessionState
  } catch (e) {
    console.error('[DB] getActiveSession', e)
    return undefined
  }
}

export async function saveSessionState(state: SessionState): Promise<void> {
  try {
    await db.sessionState.put({ ...state, _id: SESSION_STATE_KEY })
  } catch (e) {
    console.error('[DB] saveSessionState', e)
  }
}

export async function clearSessionState(): Promise<void> {
  try {
    await db.sessionState.delete(SESSION_STATE_KEY)
  } catch (e) {
    console.error('[DB] clearSessionState', e)
  }
}

// ── Historique sessions ──────────────────────────────────────────────────────

export async function saveSessionHistory(entry: SessionHistoryEntry): Promise<void> {
  try {
    await db.sessionHistory.put(entry)
  } catch (e) {
    console.error('[DB] saveSessionHistory', e)
  }
}

export async function getCompletedSessionForPeriod(
  period: SessionPeriod,
  todayStart: number
): Promise<SessionHistoryEntry | undefined> {
  try {
    const session = await db.sessionHistory
      .where('period').equals(period)
      .filter(s => s.status === 'completed' && s.date >= todayStart)
      .first()
    return session
  } catch (e) {
    console.error('[DB] getCompletedSessionForPeriod', e)
    return undefined
  }
}
