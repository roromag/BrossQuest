import { create } from 'zustand'
import { ZONE_COUNT } from '../lib/session/zones'
import type { SessionPhase, SessionPeriod } from '../types/session.types'

interface SessionStore {
  phase: SessionPhase | null
  activeZone: number          // 1–8
  zoneProgress: Record<number, number>
  period: SessionPeriod | null
  setPhase: (phase: SessionPhase) => void
  setActiveZone: (zone: number) => void
  /** Zone suivante (8 → 1). Story 3.5 : piloter via zoneProgress + détection, pas seulement le timer session. */
  advanceZone: () => void
  updateZoneProgress: (zone: number, seconds: number) => void
  setPeriod: (period: SessionPeriod) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>()((set) => ({
  phase: null,
  activeZone: 1,
  zoneProgress: {},
  period: null,
  setPhase: (phase) => set({ phase }),
  setActiveZone: (activeZone) => set({ activeZone }),
  advanceZone: () =>
    set((s) => ({
      activeZone: s.activeZone >= ZONE_COUNT ? 1 : s.activeZone + 1,
    })),
  updateZoneProgress: (zone, seconds) => set((s) => ({
    zoneProgress: { ...s.zoneProgress, [zone]: seconds },
  })),
  setPeriod: (period) => set({ period }),
  reset: () => set({ phase: null, activeZone: 1, zoneProgress: {}, period: null }),
}))
