import { describe, it, expect, beforeEach } from 'vitest'
import { useEpisodeStore } from './useEpisodeStore'
import type { Episode } from '../types/episode.types'

describe('useEpisodeStore', () => {
  beforeEach(() => {
    useEpisodeStore.setState({ currentEpisode: null, episodeList: [], period: null })
  })

  it('état initial correct', () => {
    const s = useEpisodeStore.getState()
    expect(s.currentEpisode).toBeNull()
    expect(s.episodeList).toEqual([])
    expect(s.period).toBeNull()
  })

  it('setCurrentEpisode met à jour currentEpisode', () => {
    const ep: Episode = {
      id: 'ep-001', type: 'original', status: 'current',
      playedAt: null, narrativeScript: 'Il était une fois...',
    }
    useEpisodeStore.getState().setCurrentEpisode(ep)
    expect(useEpisodeStore.getState().currentEpisode?.id).toBe('ep-001')
  })

  it('setCurrentEpisode accepte null', () => {
    useEpisodeStore.getState().setCurrentEpisode(null)
    expect(useEpisodeStore.getState().currentEpisode).toBeNull()
  })

  it('setEpisodeList met à jour la liste', () => {
    const list: Episode[] = [
      { id: 'ep-001', type: 'original', status: 'available', playedAt: null, narrativeScript: 'A' },
      { id: 'ep-002', type: 'flashback', status: 'played', playedAt: 1000, narrativeScript: 'B' },
    ]
    useEpisodeStore.getState().setEpisodeList(list)
    expect(useEpisodeStore.getState().episodeList).toHaveLength(2)
  })

  it('setPeriod met à jour period', () => {
    useEpisodeStore.getState().setPeriod('morning')
    expect(useEpisodeStore.getState().period).toBe('morning')
  })
})
