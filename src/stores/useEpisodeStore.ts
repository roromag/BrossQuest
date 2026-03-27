import { create } from 'zustand'
import type { Episode } from '../types/episode.types'
import type { SessionPeriod } from '../types/session.types'

interface EpisodeStore {
  currentEpisode: Episode | null
  episodeList: Episode[]
  period: SessionPeriod | null
  setCurrentEpisode: (episode: Episode | null) => void
  setEpisodeList: (list: Episode[]) => void
  setPeriod: (period: SessionPeriod) => void
}

export const useEpisodeStore = create<EpisodeStore>()((set) => ({
  currentEpisode: null,
  episodeList: [],
  period: null,
  setCurrentEpisode: (currentEpisode) => set({ currentEpisode }),
  setEpisodeList: (episodeList) => set({ episodeList }),
  setPeriod: (period) => set({ period }),
}))
