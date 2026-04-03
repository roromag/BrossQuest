/**
 * Config brossage partagée (sans MediaPipe) — NebulaCanvas, futur timer 3.5.
 */
export const BRUSHING_CONFIG = {
  /** Timer DEBOUNCING → PAUSED (Story 3.5) */
  pauseThresholdMs: 3000,
  /** Ralentissement puis arrêt animation sur DEBOUNCING / PAUSED */
  pauseAnimationDurationMs: 2000,
  /** Reprise cycle animation BRUSHING après pause */
  resumeAnimationDurationMs: 500,
} as const

export type BrushingConfig = typeof BRUSHING_CONFIG
