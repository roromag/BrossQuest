// src/lib/mediapipe/detector.ts
// ⚠️ SEUL fichier autorisé à importer @mediapipe/tasks-vision dans tout le projet

import type { HandLandmarker as HandLandmarkerType } from '@mediapipe/tasks-vision'
import type { DetectionResult, DetectionState, DetectionQuality, VelocityData } from './types'

// ── Config ajustable à chaud ──────────────────────────────────────────────────
export interface DetectorConfig {
  /** Vélocité minimale pour déclarer un brossage actif (landmarks normalisés 0–1) */
  detectionThreshold: number
  /** Nombre minimum de changements de direction pour confirmer une oscillation */
  oscillationMinReversals: number
  /** Fenêtre de temps pour l'analyse d'oscillation (ms) */
  oscillationWindowMs: number
  /** Taille du buffer de vélocité pour le lissage */
  velocityBufferSize: number
  /** Seuil de confiance MediaPipe en dessous duquel la qualité est 'degraded' */
  confidenceThreshold: number
}

const config: DetectorConfig = {
  detectionThreshold: 0.003,
  oscillationMinReversals: 2,
  oscillationWindowMs: 800,
  velocityBufferSize: 8,
  confidenceThreshold: 0.6,
}

export function getDetectorConfig(): Readonly<DetectorConfig> {
  return { ...config }
}

export function setDetectorConfig(partial: Partial<DetectorConfig>): void {
  Object.assign(config, partial)
}

// ── Singleton ─────────────────────────────────────────────────────────────────
let handLandmarker: HandLandmarkerType | null = null
let isLoading = false

// Buffer de positions wrist pour calcul vélocité
interface WristSample {
  x: number
  y: number
  ts: number
  direction: number | null  // +1 = droite/bas, -1 = gauche/haut, 0 = stable
}

const wristHistory: WristSample[] = []
const velocityBuffer: number[] = []

// ── Chargement différé ─────────────────────────────────────────────────────────
/**
 * Charge MediaPipe WASM en différé.
 * À appeler UNIQUEMENT dans l'event handler du tap utilisateur (contrainte iOS Safari).
 * Met à jour `useCameraStore.isMediaPipeLoading` via le callback.
 */
export async function loadDetector(
  onLoadingChange?: (loading: boolean) => void
): Promise<void> {
  if (handLandmarker || isLoading) return

  isLoading = true
  onLoadingChange?.(true)

  try {
    // Import dynamique — NE PAS importer au niveau module (chargement différé)
    const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

    const vision = await FilesetResolver.forVisionTasks(
      '/BrossQuest/mediapipe/wasm'  // self-hosted, zéro CDN
    )

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/BrossQuest/mediapipe/hand_landmarker.task',
        delegate: 'GPU',  // Fallback CPU automatique si GPU non disponible
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
  } catch (e) {
    console.error('[MediaPipe] Échec chargement WASM', e)
    // Ne pas relancer — laisser la qualité 'absent' signaler le problème
  } finally {
    isLoading = false
    onLoadingChange?.(false)
  }
}

export function isDetectorReady(): boolean {
  return handLandmarker !== null
}

// ── Pipeline de détection par frame ───────────────────────────────────────────
/**
 * À appeler dans requestAnimationFrame avec l'élément <video>.
 * Retourne null si le détecteur n'est pas prêt.
 */
export function detectFrame(
  videoElement: HTMLVideoElement,
  timestamp: number
): DetectionResult | null {
  if (!handLandmarker) return null

  const results = handLandmarker.detectForVideo(videoElement, timestamp)
  return processResults(results, timestamp)
}

// ── Traitement des résultats ───────────────────────────────────────────────────
function processResults(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any,
  timestamp: number
): DetectionResult {
  const landmarks = results.landmarks?.[0]
  const handedness = results.handednesss?.[0] ?? results.handedness?.[0]
  const confidence = handedness?.[0]?.score ?? null

  if (!landmarks || landmarks.length === 0) {
    clearBuffers()
    return {
      state: 'absent',
      quality: 'absent',
      velocity: null,
      handConfidence: null,
      timestamp,
    }
  }

  const quality: DetectionQuality =
    confidence !== null && confidence < config.confidenceThreshold ? 'degraded' : 'good'

  // Wrist = landmark index 0
  const wrist = landmarks[0]
  const velocity = computeVelocity(wrist.x, wrist.y, timestamp)
  const state = classifyState(velocity)

  return {
    state,
    quality,
    velocity,
    handConfidence: confidence,
    timestamp,
  }
}

function computeVelocity(x: number, y: number, ts: number): VelocityData {
  const prev = wristHistory[wristHistory.length - 1]
  let instantaneous = 0
  let direction: number | null = null

  if (prev) {
    const dx = x - prev.x
    const dy = y - prev.y
    instantaneous = Math.sqrt(dx * dx + dy * dy)
    // Axe principal : X (mouvement de brossage gauche/droite)
    direction = Math.abs(dx) > 0.002 ? Math.sign(dx) : 0
  }

  wristHistory.push({ x, y, ts, direction })
  // Garder seulement les N dernières ms
  const cutoff = ts - config.oscillationWindowMs
  while (wristHistory.length > 0 && wristHistory[0].ts < cutoff) {
    wristHistory.shift()
  }

  // Lissage vélocité
  velocityBuffer.push(instantaneous)
  if (velocityBuffer.length > config.velocityBufferSize) velocityBuffer.shift()
  const smoothed = velocityBuffer.reduce((a, b) => a + b, 0) / velocityBuffer.length

  // Compter les changements de direction dans la fenêtre
  let reversals = 0
  for (let i = 1; i < wristHistory.length; i++) {
    const prevSample = wristHistory[i - 1].direction
    const curr = wristHistory[i].direction
    if (prevSample !== null && curr !== null && prevSample !== 0 && curr !== 0 && prevSample !== curr) {
      reversals++
    }
  }

  return { instantaneous, smoothed, directionReversals: reversals }
}

function classifyState(velocity: VelocityData): DetectionState {
  const isMoving = velocity.smoothed > config.detectionThreshold
  const isOscillating = velocity.directionReversals >= config.oscillationMinReversals
  return isMoving && isOscillating ? 'brushing-active' : 'pause'
}

function clearBuffers(): void {
  wristHistory.length = 0
  velocityBuffer.length = 0
}

/** Nettoyage — à appeler quand la session se termine */
export function disposeDetector(): void {
  handLandmarker?.close?.()
  handLandmarker = null
  clearBuffers()
}
