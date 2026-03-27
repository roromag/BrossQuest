import Dexie, { type Table } from 'dexie'
import type { Profile } from '../../types/profile.types'
import type { Episode } from '../../types/episode.types'
import type { SessionState, SessionHistoryEntry } from '../../types/session.types'

class BrossQuestDB extends Dexie {
  profiles!: Table<Profile, string>
  episodes!: Table<Episode, string>
  sessionState!: Table<SessionState & { _id: string }, string>
  sessionHistory!: Table<SessionHistoryEntry, string>

  constructor() {
    super('brossquest')
    this.version(1).stores({
      profiles: 'id, onboardingComplete',
      episodes: 'id, status',
      sessionState: '_id, status',
      sessionHistory: 'id, period, date, status',
    })
  }
}

export const db = new BrossQuestDB()
