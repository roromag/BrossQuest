import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './useSessionStore'

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().reset()
  })

  it('état initial correct', () => {
    const s = useSessionStore.getState()
    expect(s.phase).toBeNull()
    expect(s.activeZone).toBe(1)
    expect(s.zoneProgress).toEqual({})
    expect(s.period).toBeNull()
  })

  it('setPhase met à jour phase', () => {
    useSessionStore.getState().setPhase('before')
    expect(useSessionStore.getState().phase).toBe('before')
  })

  it('setActiveZone met à jour activeZone', () => {
    useSessionStore.getState().setActiveZone(5)
    expect(useSessionStore.getState().activeZone).toBe(5)
  })

  it('updateZoneProgress accumule les secondes', () => {
    useSessionStore.getState().updateZoneProgress(2, 30)
    useSessionStore.getState().updateZoneProgress(3, 45)
    const { zoneProgress } = useSessionStore.getState()
    expect(zoneProgress[2]).toBe(30)
    expect(zoneProgress[3]).toBe(45)
  })

  it('updateZoneProgress écrase la valeur précédente', () => {
    useSessionStore.getState().updateZoneProgress(1, 10)
    useSessionStore.getState().updateZoneProgress(1, 20)
    expect(useSessionStore.getState().zoneProgress[1]).toBe(20)
  })

  it('setPeriod met à jour period', () => {
    useSessionStore.getState().setPeriod('evening')
    expect(useSessionStore.getState().period).toBe('evening')
  })

  it('reset remet l\'état initial', () => {
    useSessionStore.getState().setPhase('during')
    useSessionStore.getState().setActiveZone(7)
    useSessionStore.getState().setPeriod('morning')
    useSessionStore.getState().reset()
    const s = useSessionStore.getState()
    expect(s.phase).toBeNull()
    expect(s.activeZone).toBe(1)
    expect(s.zoneProgress).toEqual({})
    expect(s.period).toBeNull()
  })
})
