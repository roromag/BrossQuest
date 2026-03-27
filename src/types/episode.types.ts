export type EpisodeType = 'original' | 'flashback'
export type EpisodeStatus = 'available' | 'played' | 'current'

export interface Episode {
  id: string              // ex: "ep-001"
  type: EpisodeType
  status: EpisodeStatus
  playedAt: number | null // Date.now() ou null
  narrativeScript: string // script pour Web Speech API (Story 4.2)
}
