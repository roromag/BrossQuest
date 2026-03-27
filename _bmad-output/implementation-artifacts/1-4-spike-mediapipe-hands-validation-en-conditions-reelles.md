# Story 1.4 : Spike MediaPipe Hands — validation en conditions réelles

**Epic :** 1 — Fondation technique & Spike MediaPipe
**Story ID :** 1.4
**Story Key :** `1-4-spike-mediapipe-hands-validation-en-conditions-reelles`
**Status :** ready-for-dev
**Date :** 2026-03-27

---

## Story

As a développeur,
I want valider que MediaPipe Hands WASM détecte correctement le mouvement de brossage en conditions réelles,
So that confirmer le prérequis bloquant avant tout développement fonctionnel sur la session.

---

## Acceptance Criteria

**Scénario 1 — Prototype isolé sur route `/spike`**
**Given** la route `/spike` existe dans TanStack Router (sans guards)
**When** un développeur navigue vers `/BrossQuest/spike`
**Then** un bouton permet de déclencher `getUserMedia` + chargement WASM MediaPipe
**And** le flux caméra s'affiche via `<video playsinline autoplay muted>`
**And** l'état de détection courant est affiché en overlay lisible

**Scénario 2 — Détection `brushing-active` en ≤ 1 seconde**
**Given** l'utilisateur est devant la caméra à 40–70cm avec éclairage standard
**When** il effectue un mouvement oscillatoire de la main (simulation brossage)
**Then** `DetectionState` passe à `brushing-active` en ≤ 1 seconde (NFR-P3)
**And** l'overlay affiche `brushing-active` en temps réel

**Scénario 3 — Détection de pause correcte**
**Given** la détection active
**When** l'utilisateur immobilise sa main
**Then** `DetectionState` passe à `pause` dans ≤ 500ms

**Scénario 4 — Chargement WASM différé**
**Given** l'app est lancée
**When** l'utilisateur arrive sur `/home` (ou toute autre route)
**Then** le module WASM MediaPipe N'EST PAS chargé — `isMediaPipeLoading = false` et aucun fetch WASM
**And** le WASM ne se charge qu'au tap sur le bouton de lancement de spike

**Scénario 5 — Types définis dans `src/lib/mediapipe/types.ts`**
**Given** le projet compile
**When** on inspecte `src/lib/mediapipe/types.ts`
**Then** `DetectionResult`, `DetectionState`, `DetectionQuality`, `VelocityData` sont exportés
**And** aucun import de `@mediapipe/tasks-vision` n'existe hors de `src/lib/mediapipe/`

**Scénario 6 — iOS Safari sans crash mémoire**
**Given** un iPhone physique (cible minimale : iPhone SE 2nd gen, iOS ≥ 15.4)
**When** la détection tourne en continu 2 minutes
**Then** aucun crash mémoire, pas de dégradation visible des fps

**Scénario 7 — Résultats spike documentés**
**Given** les tests en conditions réelles effectués
**When** le développeur complète la story
**Then** la section "Résultats du spike" dans ce fichier est remplie avec : fonctionne/ne fonctionne pas, conditions testées, appareil(s) utilisé(s), valeurs empiriques `DETECTION_THRESHOLD` et `OSCILLATION_MIN_REVERSALS`

---

## Tasks / Subtasks

- [ ] T1 — Installation package et WASM (AC: #4, #5)
  - [ ] `npm install @mediapipe/tasks-vision`
  - [ ] Télécharger `hand_landmarker.task` → `public/mediapipe/hand_landmarker.task`
  - [ ] Copier les fichiers WASM dans `public/mediapipe/wasm/` (voir section Dev Notes)
  - [ ] Vérifier que `vite.config.ts` cache `**/*.wasm` via Workbox (déjà configuré)

- [ ] T2 — Types MediaPipe (AC: #5)
  - [ ] Créer `src/lib/mediapipe/types.ts` avec `DetectionState`, `DetectionQuality`, `DetectionResult`, `VelocityData`
  - [ ] Mettre à jour `src/stores/useCameraStore.ts` pour importer `DetectionQuality` et `DetectionState` depuis `src/lib/mediapipe/types.ts` (migration depuis type local)
  - [ ] Ajouter `detectionState: DetectionState` dans `useCameraStore`

- [ ] T3 — Détecteur MediaPipe (AC: #2, #3, #4)
  - [ ] Créer `src/lib/mediapipe/detector.ts` — lazy loader + pipeline détection
  - [ ] Implémenter algorithme détection mouvement oscillatoire
  - [ ] Créer `src/lib/mediapipe/detector.test.ts` — tests logique détection (sans WASM réel)

- [ ] T4 — Route spike (AC: #1)
  - [ ] Créer `src/routes/spike.route.tsx` — composant `SpikeDetectionPage`
  - [ ] Enregistrer la route dans `src/router.ts` (sans guard)
  - [ ] Afficher : état detection, qualité, fps approximatif, log des dernières valeurs velocity

- [ ] T5 — Validation conditions réelles (AC: #2, #3, #6)
  - [ ] Tester sur iPhone physique (iOS Safari) — salle de bain, éclairage standard
  - [ ] Valider les seuils empiriques `DETECTION_THRESHOLD` et `OSCILLATION_MIN_REVERSALS`
  - [ ] Documenter dans la section "Résultats du spike" ci-dessous

- [ ] T6 — Vérification build + tests (AC: #5)
  - [ ] `npm test` vert (logique détection + stores mis à jour)
  - [ ] `npm run build` sans erreur TypeScript strict
  - [ ] Vérifier qu'aucun import `@mediapipe/tasks-vision` n'existe hors `src/lib/mediapipe/`

---

## Dev Notes

### Installation : @mediapipe/tasks-vision + WASM

```bash
npm install @mediapipe/tasks-vision
```

**Fichiers WASM à servir en local (zéro CDN — règle absolue) :**

Le package installe les fichiers WASM dans `node_modules/@mediapipe/tasks-vision/wasm/`. Il faut les rendre accessibles depuis `public/` :

```bash
# Copie manuelle (une seule fois lors du setup) :
cp -r node_modules/@mediapipe/tasks-vision/wasm public/mediapipe/

# Vérifier les fichiers présents :
ls public/mediapipe/wasm/
# → vision_wasm_internal.js, vision_wasm_internal.wasm, etc.
```

**⚠️ Alternative Vite — copie automatique au build :**

Ajouter dans `vite.config.ts` si on veut automatiser :

```typescript
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Dans plugins[] :
viteStaticCopy({
  targets: [{
    src: 'node_modules/@mediapipe/tasks-vision/wasm/**',
    dest: 'mediapipe/wasm',
  }]
})
```
Mais pour le spike, la copie manuelle suffit.

**Modèle `hand_landmarker.task` (~8 Mo) :**
- Source officielle (à télécharger UNE SEULE FOIS) :
  `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
- Destination locale : `public/mediapipe/hand_landmarker.task`
- Ce fichier EST dans `.gitignore` si trop lourd — à ajouter au CI/CD plus tard (Epic 5)

```bash
curl -L "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task" \
  -o public/mediapipe/hand_landmarker.task
```

---

### Types — src/lib/mediapipe/types.ts

```typescript
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
```

**Migration `useCameraStore.ts` — CRITIQUE :**

Dans `src/stores/useCameraStore.ts`, le type `DetectionQuality` est actuellement défini localement :
```typescript
// ❌ Avant (local) — À SUPPRIMER
type DetectionQuality = 'good' | 'degraded' | 'absent'
```

→ Remplacer par l'import depuis `src/lib/mediapipe/types.ts` et ajouter `detectionState` :

```typescript
// ✅ Après — importer depuis le module mediapipe
import type { DetectionQuality, DetectionState } from '../lib/mediapipe/types'

interface CameraStore {
  permissionState: 'granted' | 'denied' | 'prompt'
  detectionQuality: DetectionQuality
  detectionState: DetectionState            // ← NOUVEAU
  isMediaPipeLoading: boolean
  setPermissionState: (state: 'granted' | 'denied' | 'prompt') => void
  setDetectionQuality: (quality: DetectionQuality) => void
  setDetectionState: (state: DetectionState) => void   // ← NOUVEAU
  setMediaPipeLoading: (loading: boolean) => void
}

export const useCameraStore = create<CameraStore>()((set) => ({
  permissionState: 'prompt',
  detectionQuality: 'absent',
  detectionState: 'absent',               // ← NOUVEAU
  isMediaPipeLoading: false,
  setPermissionState: (permissionState) => set({ permissionState }),
  setDetectionQuality: (detectionQuality) => set({ detectionQuality }),
  setDetectionState: (detectionState) => set({ detectionState }),   // ← NOUVEAU
  setMediaPipeLoading: (isMediaPipeLoading) => set({ isMediaPipeLoading }),
}))
```

**⚠️ Mettre à jour `useCameraStore.test.ts`** pour couvrir `detectionState` initial (`'absent'`) et `setDetectionState`.

---

### Détecteur — src/lib/mediapipe/detector.ts

```typescript
// src/lib/mediapipe/detector.ts
// ⚠️ SEUL fichier autorisé à importer @mediapipe/tasks-vision dans tout le projet

import type { HandLandmarker as HandLandmarkerType } from '@mediapipe/tasks-vision'
import type { DetectionResult, DetectionState, DetectionQuality, VelocityData } from './types'

// ── Constantes (ajuster après validation empirique) ──────────────────────────
/** Vélocité minimale pour déclarer un brossage actif (landmarks normalisés 0–1) */
export const DETECTION_THRESHOLD = 0.012   // valeur initiale — à calibrer en conditions réelles

/** Nombre minimum de changements de direction pour confirmer une oscillation */
export const OSCILLATION_MIN_REVERSALS = 2

/** Fenêtre de temps pour l'analyse d'oscillation (ms) */
const OSCILLATION_WINDOW_MS = 800

/** Taille du buffer de vélocité pour le lissage */
const VELOCITY_BUFFER_SIZE = 8

/** Seuil de confiance MediaPipe en dessous duquel la qualité est 'degraded' */
const CONFIDENCE_THRESHOLD = 0.6

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
    confidence !== null && confidence < CONFIDENCE_THRESHOLD ? 'degraded' : 'good'

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
  const cutoff = ts - OSCILLATION_WINDOW_MS
  while (wristHistory.length > 0 && wristHistory[0].ts < cutoff) {
    wristHistory.shift()
  }

  // Lissage vélocité
  velocityBuffer.push(instantaneous)
  if (velocityBuffer.length > VELOCITY_BUFFER_SIZE) velocityBuffer.shift()
  const smoothed = velocityBuffer.reduce((a, b) => a + b, 0) / velocityBuffer.length

  // Compter les changements de direction dans la fenêtre
  let reversals = 0
  for (let i = 1; i < wristHistory.length; i++) {
    const prev = wristHistory[i - 1].direction
    const curr = wristHistory[i].direction
    if (prev !== null && curr !== null && prev !== 0 && curr !== 0 && prev !== curr) {
      reversals++
    }
  }

  return { instantaneous, smoothed, directionReversals: reversals }
}

function classifyState(velocity: VelocityData): DetectionState {
  const isMoving = velocity.smoothed > DETECTION_THRESHOLD
  const isOscillating = velocity.directionReversals >= OSCILLATION_MIN_REVERSALS
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
```

---

### Tests — src/lib/mediapipe/detector.test.ts

**Stratégie :** les tests couvrent la **logique pure** (classification, calcul vélocité) sans charger le WASM réel. Le chargement WASM est testé manuellement sur appareil réel.

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DETECTION_THRESHOLD,
  OSCILLATION_MIN_REVERSALS,
} from './detector'
import type { DetectionState } from './types'

// ── Tests logique classification (sans WASM) ──────────────────────────────────

describe('classification de détection', () => {
  // Test de la logique pure via les constantes exportées
  it('DETECTION_THRESHOLD est une valeur positive réaliste', () => {
    expect(DETECTION_THRESHOLD).toBeGreaterThan(0)
    expect(DETECTION_THRESHOLD).toBeLessThan(0.1)
  })

  it('OSCILLATION_MIN_REVERSALS est ≥ 2', () => {
    expect(OSCILLATION_MIN_REVERSALS).toBeGreaterThanOrEqual(2)
  })
})

// ── Tests types (validation statique) ────────────────────────────────────────

describe('DetectionState', () => {
  it('les valeurs attendues sont correctement typées', () => {
    const states: DetectionState[] = ['brushing-active', 'pause', 'absent']
    expect(states).toHaveLength(3)
  })
})

// ── Tests mocks (si intégration partielle voulue) ─────────────────────────────

describe('isDetectorReady', () => {
  it('retourne false avant tout chargement', async () => {
    const { isDetectorReady } = await import('./detector')
    // État initial : handLandmarker = null
    expect(isDetectorReady()).toBe(false)
  })
})
```

**Note :** Les tests d'intégration complets (chargement WASM réel, détection sur video) sont des tests manuels en conditions réelles — voir T5.

---

### Route spike — src/routes/spike.route.tsx

```typescript
// src/routes/spike.route.tsx
// ⚠️ Route DEV uniquement — pas de guard, pas de lien depuis l'app

import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useRef, useState, useCallback, useEffect } from 'react'
import { loadDetector, detectFrame, isDetectorReady, disposeDetector } from '../lib/mediapipe/detector'
import type { DetectionResult } from '../lib/mediapipe/types'

function SpikeDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const animRef = useRef<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null)
  const [fps, setFps] = useState(0)
  const fpsCountRef = useRef({ count: 0, lastTs: 0 })

  const startSpike = useCallback(async () => {
    setIsLoading(true)
    try {
      // getUserMedia DOIT être appelé dans le même event handler que le tap (iOS Safari)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      await loadDetector((loading) => setIsLoading(loading))
      setIsRunning(true)
    } catch (e) {
      console.error('[Spike] Erreur démarrage', e)
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const loop = (ts: number) => {
      if (!videoRef.current || !isDetectorReady()) {
        animRef.current = requestAnimationFrame(loop)
        return
      }

      const result = detectFrame(videoRef.current, ts)
      if (result) setLastResult(result)

      // FPS counter
      fpsCountRef.current.count++
      if (ts - fpsCountRef.current.lastTs >= 1000) {
        setFps(fpsCountRef.current.count)
        fpsCountRef.current = { count: 0, lastTs: ts }
      }

      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning])

  useEffect(() => {
    return () => {
      disposeDetector()
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{ fontFamily: 'monospace', padding: '1rem', background: '#1E2A3A', color: '#fff', minHeight: '100vh' }}>
      <h1>🔬 Spike MediaPipe Hands</h1>
      <p style={{ opacity: 0.6 }}>Route dev — hors production</p>

      {!isRunning && (
        <button
          onClick={startSpike}
          disabled={isLoading}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: isLoading ? 'wait' : 'pointer' }}
        >
          {isLoading ? '⏳ Chargement WASM...' : '▶ Démarrer la détection'}
        </button>
      )}

      <video
        ref={videoRef}
        playsInline
        muted
        style={{ display: isRunning ? 'block' : 'none', width: '100%', maxWidth: '400px', marginTop: '1rem' }}
      />

      {lastResult && (
        <div style={{ marginTop: '1rem', background: '#2D3748', padding: '1rem', borderRadius: '8px' }}>
          <div style={{
            fontSize: '1.5rem',
            color: lastResult.state === 'brushing-active' ? '#48BB78' : lastResult.state === 'pause' ? '#F6AD55' : '#FC8181'
          }}>
            État : <strong>{lastResult.state}</strong>
          </div>
          <div>Qualité : {lastResult.quality}</div>
          <div>Confiance main : {lastResult.handConfidence?.toFixed(2) ?? 'N/A'}</div>
          {lastResult.velocity && (
            <>
              <div>Vélocité inst. : {lastResult.velocity.instantaneous.toFixed(4)}</div>
              <div>Vélocité lissée : {lastResult.velocity.smoothed.toFixed(4)}</div>
              <div>Changements direction : {lastResult.velocity.directionReversals}</div>
            </>
          )}
          <div>FPS : {fps}</div>
        </div>
      )}
    </div>
  )
}

export const spikeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/spike',
  component: SpikeDetectionPage,
})
```

**Enregistrement dans `src/router.ts` :**

```typescript
import { spikeRoute } from './routes/spike.route'

// Ajouter spikeRoute dans routeTree.addChildren([...])
const routeTree = rootRoute.addChildren([
  onboardingRoute,
  handoffRoute,
  homeRoute,
  sessionRoute,
  parentRoute,
  recoveryCameraRoute,
  recoveryProfileRoute,
  spikeRoute,   // ← AJOUTER
])
```

---

### Règles absolues à respecter

1. **Zéro import `@mediapipe/tasks-vision`** hors de `src/lib/mediapipe/` — grep le projet entier avant de valider.
2. **Chargement WASM toujours différé** — jamais au niveau module, toujours via `loadDetector()` déclenchée par geste utilisateur.
3. **getUserMedia dans le même event handler que le tap** — iOS Safari refuse si async intercalé.
4. **`useCameraStore` → importer `DetectionQuality` et `DetectionState` depuis `src/lib/mediapipe/types.ts`** — migrer le type local.
5. **Zéro CDN** — tous les assets WASM précachés dans `public/mediapipe/`.
6. **Tests co-localisés** — `detector.test.ts` à côté de `detector.ts`.

---

### Pièges spécifiques

#### ❌ `basepath` Vite — inclure `/BrossQuest/` dans les paths WASM

```typescript
// ❌ Path incorrect (ignore le basepath Vite)
FilesetResolver.forVisionTasks('/mediapipe/wasm')

// ✅ Inclure le basepath configuré dans vite.config.ts
FilesetResolver.forVisionTasks('/BrossQuest/mediapipe/wasm')
```

Idem pour le modèle :
```typescript
// ✅
modelAssetPath: '/BrossQuest/mediapipe/hand_landmarker.task'
```

#### ❌ Import statique de `@mediapipe/tasks-vision`

```typescript
// ❌ Import statique — charge WASM au démarrage de l'app (viole NFR-P2)
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// ✅ Import dynamique dans loadDetector()
const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
```

#### ❌ Appel `detectForVideo` sans vérifier la readiness

```typescript
// ❌ Peut crasher si WASM pas encore prêt
handLandmarker.detectForVideo(video, timestamp)

// ✅ Vérification systématique
if (!handLandmarker) return null
```

#### ⚠️ `runningMode: 'VIDEO'` obligatoire pour `detectForVideo`

Si `runningMode: 'IMAGE'`, il faut appeler `detect()` au lieu de `detectForVideo()`. Pour le traitement temps réel sur flux vidéo, toujours utiliser `'VIDEO'`.

#### ⚠️ GPU delegate non disponible sur certains appareils

MediaPipe tente d'abord GPU, fallback CPU automatique. Ne pas forcer `delegate: 'CPU'` sauf si test spécifique nécessaire.

#### ⚠️ `handedness` vs `handednesss` — typo dans certaines versions

Certaines versions de `@mediapipe/tasks-vision` exposent `handednesss` (avec triple `s`) au lieu de `handedness`. Le code dans `processResults` gère les deux :
```typescript
const handedness = results.handednesss?.[0] ?? results.handedness?.[0]
```

#### ⚠️ Calibration des seuils

Les valeurs initiales `DETECTION_THRESHOLD = 0.012` et `OSCILLATION_MIN_REVERSALS = 2` sont des estimations. L'AC#7 demande de les calibrer en conditions réelles et de documenter les valeurs retenues dans "Résultats du spike".

---

### Structure de fichiers attendue après cette story

```
src/
├── lib/
│   └── mediapipe/
│       ├── types.ts           ← nouveau (DetectionState, DetectionQuality, VelocityData, DetectionResult)
│       ├── detector.ts        ← nouveau (lazy loader + pipeline détection)
│       └── detector.test.ts   ← nouveau (tests logique pure)
├── stores/
│   ├── useCameraStore.ts      ← mis à jour (import types depuis mediapipe/types, + detectionState)
│   └── useCameraStore.test.ts ← mis à jour (+ tests detectionState)
└── routes/
    └── spike.route.tsx        ← nouveau (prototype isolé)

public/
└── mediapipe/
    ├── hand_landmarker.task   ← téléchargé manuellement (~8 Mo)
    └── wasm/                  ← copié depuis node_modules
        ├── vision_wasm_internal.js
        ├── vision_wasm_internal.wasm
        └── ...
```

---

## Résultats du Spike

> **À remplir après les tests en conditions réelles (T5)**

**Date des tests :** _____
**Appareil(s) utilisé(s) :** _____
**OS / navigateur :** _____
**Conditions :** _____

### Verdict

- [ ] ✅ Fonctionne — Epic 3 peut démarrer
- [ ] ❌ Ne fonctionne pas — voir blockers ci-dessous

### Valeurs empiriques validées

| Constante | Valeur initiale | Valeur retenue | Notes |
|-----------|----------------|----------------|-------|
| `DETECTION_THRESHOLD` | 0.012 | _____ | _____ |
| `OSCILLATION_MIN_REVERSALS` | 2 | _____ | _____ |

### Observations

_Latence réelle détection `brushing-active` : _____ ms_
_FPS moyen sur iPhone SE 2nd gen : _____fps_
_Consommation mémoire après 2 min : _____Mo_

### Blockers éventuels

_Aucun / détailler ici_

---

## Définition of Done

- [ ] `npm run build` sans erreur TypeScript strict
- [ ] `npm test` vert — logique détection + useCameraStore mis à jour
- [ ] Aucun import `@mediapipe/tasks-vision` hors `src/lib/mediapipe/` (`grep -r "@mediapipe/tasks-vision" src/ --include="*.ts" --include="*.tsx"` → seuls les fichiers dans `src/lib/mediapipe/` apparaissent)
- [ ] Route `/spike` accessible et fonctionnelle (detection live sur écran)
- [ ] WASM chargé en différé (pas de fetch WASM sur `/home` ou autre route)
- [ ] Tests en conditions réelles effectués (iPhone physique, iOS Safari)
- [ ] Section "Résultats du spike" remplie avec valeurs empiriques
- [ ] `useCameraStore.ts` migré vers imports types de `src/lib/mediapipe/types.ts`

---

## Dépendances

- **Prérequis :** Story 1.3 complète (✅ status: done) — useCameraStore, structure `src/lib/`
- **Ce spike est prérequis bloquant pour :** Epic 3 complet (stories 3.1–3.8)
- **Prochaine story après validation :** Story 2.1 (Onboarding — Epic 3 conditionnel au résultat du spike)

---

## Dev Agent Record

### Agent Model Used

_À remplir_

### Debug Log References

_Aucun blocage rencontré._

### Completion Notes List

_À remplir_

### File List

_À remplir_
