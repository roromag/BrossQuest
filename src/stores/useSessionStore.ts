import { create } from 'zustand'
import type { SessionPhase, SessionPeriod } from '../types/session.types'

interface SessionStore {
  phase: SessionPhase | null
  activeZone: number          // 1–8
  zoneProgress: Record<number, number>
  period: SessionPeriod | null
  setPhase: (phase: SessionPhase) => void
  setActiveZone: (zone: number) => void
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
  updateZoneProgress: (zone, seconds) => set((s) => ({
    zoneProgress: { ...s.zoneProgress, [zone]: seconds },
  })),
  setPeriod: (period) => set({ period }),
  reset: () => set({ phase: null, activeZone: 1, zoneProgress: {}, period: null }),
}))
