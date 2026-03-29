// src/lib/mediapipe/types.ts

/** 3 états de détection du mouvement de brossage */
export type DetectionState = 'brushing-active' | 'pause' | 'absent'

/** Qualité de la détection caméra/landmarks */
export type DetectionQuality = 'good' | 'degraded' | 'absent'

/** Données de vélocité calculées depuis les landmarks */
export interface VelocityData {
  /** Vélocité instantanée (distance wrist entre 2 frames consécutives, en px normalisés) */
  instantaneous: number
  /** Moyennée sur les N dernières frames */
  smoothed: number
  /** Nombre de changements de direction détectés dans la fenêtre d'analyse */
  directionReversals: number
}

/** Résultat complet d'une frame de détection */
export interface DetectionResult {
  state: DetectionState
  quality: DetectionQuality
  velocity: VelocityData | null
  /** Score de confiance MediaPipe pour la main détectée (0–1) */
  handConfidence: number | null
  timestamp: number
}
