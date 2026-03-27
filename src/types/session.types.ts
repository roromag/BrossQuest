export type SessionPhase = 'before' | 'during' | 'after'
export type SessionStatus = 'in_progress' | 'completed' | 'interrupted'
export type SessionPeriod = 'morning' | 'evening'

export interface SessionHistoryEntry {
  id: string
  episodeId: string
  date: number          // Date.now()
  period: SessionPeriod
  totalDuration: number  // secondes
  totalPauseTime: number // secondes
  zonesCompleted: number
  status: SessionStatus
}
