import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDetectorConfig,
  isDetectorReady,
  disposeDetector,
} from './detector'
import type { DetectionState } from './types'

// ── Tests logique classification (sans WASM) ──────────────────────────────────

describe('classification de détection', () => {
  it('detectionThreshold est une valeur positive réaliste', () => {
    const { detectionThreshold } = getDetectorConfig()
    expect(detectionThreshold).toBeGreaterThan(0)
    expect(detectionThreshold).toBeLessThan(0.1)
  })

  it('oscillationMinReversals est ≥ 2', () => {
    expect(getDetectorConfig().oscillationMinReversals).toBeGreaterThanOrEqual(2)
  })
})

// ── Tests types (validation statique) ────────────────────────────────────────

describe('DetectionState', () => {
  it('les valeurs attendues sont correctement typées', () => {
    const states: DetectionState[] = ['BRUSHING', 'DEBOUNCING', 'PAUSED', 'HAND_LOST']
    expect(states).toHaveLength(4)
  })
})

// ── Tests isDetectorReady ─────────────────────────────────────────────────────

describe('isDetectorReady', () => {
  beforeEach(() => {
    // S'assurer que le détecteur est dans son état initial (non chargé)
    disposeDetector()
  })

  it('retourne false avant tout chargement', () => {
    expect(isDetectorReady()).toBe(false)
  })

  it('retourne false après disposeDetector()', () => {
    disposeDetector()
    expect(isDetectorReady()).toBe(false)
  })
})
