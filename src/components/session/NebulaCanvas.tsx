import { useEffect, useRef } from 'react'
import { BRUSHING_CONFIG } from '../../lib/mediapipe/brushingConfig'
import type { DetectionState } from '../../lib/mediapipe/types'
import { useCameraStore } from '../../stores/useCameraStore'
import { useSessionStore } from '../../stores/useSessionStore'

const ZONE_DRIFT_MS = 3000
const PARTICLE_COUNT = 96
const FRONT_COLOR = '#48BB78'
const BACK_COLOR = '#2D6A4F'
const VELOCITY_GAIN = 12

/** Centres normalisés (0–1) pour les zones 1–8 : avant impairs, arrière pairs */
const ZONE_CENTERS: ReadonlyArray<{ nx: number; ny: number }> = [
  { nx: 0.24, ny: 0.3 },
  { nx: 0.14, ny: 0.36 },
  { nx: 0.76, ny: 0.3 },
  { nx: 0.86, ny: 0.36 },
  { nx: 0.24, ny: 0.7 },
  { nx: 0.14, ny: 0.64 },
  { nx: 0.76, ny: 0.7 },
  { nx: 0.86, ny: 0.64 },
]

function isFrontZone(zone: number): boolean {
  return zone % 2 === 1
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.slice(1)
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function clampZone(z: number): number {
  if (z < 1) return 1
  if (z > 8) return 8
  return z
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

type Blend = {
  from: number
  to: number
  startMs: number
  durationMs: number
}

export function NebulaCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastTsRef = useRef<number | null>(null)

  const simRef = useRef({
    cx: ZONE_CENTERS[0].nx,
    cy: ZONE_CENTERS[0].ny,
    zoneFrom: { nx: ZONE_CENTERS[0].nx, ny: ZONE_CENTERS[0].ny },
    zoneTo: { nx: ZONE_CENTERS[0].nx, ny: ZONE_CENTERS[0].ny },
    zoneBlendStartMs: 0,
    zoneBlendDurationMs: ZONE_DRIFT_MS,
    lastZone: 1 as number,
    motionBoost: 1,
    cycleT: 0,
    prevDetection: 'BRUSHING' as DetectionState,
    motionBlend: null as Blend | null,
    angles: new Float32Array(PARTICLE_COUNT),
    radii: new Float32Array(PARTICLE_COUNT),
    phases: new Float32Array(PARTICLE_COUNT),
    sizes: new Float32Array(PARTICLE_COUNT),
    initialized: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const frontRgb = hexToRgb(FRONT_COLOR)
    const backRgb = hexToRgb(BACK_COLOR)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const s = simRef.current
      s.angles[i] = Math.random() * Math.PI * 2
      s.radii[i] = 0.15 + Math.random() * 0.35
      s.phases[i] = Math.random() * Math.PI * 2
      s.sizes[i] = 1.2 + Math.random() * 2.2
    }

    const resize = () => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2.5)
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)

    const startMotionBlend = (from: number, to: number, durationMs: number) => {
      simRef.current.motionBlend = {
        from,
        to,
        startMs: performance.now(),
        durationMs,
      }
    }

    const tick = (ts: number) => {
      const last = lastTsRef.current
      lastTsRef.current = ts
      const dt = last != null ? Math.min(0.05, (ts - last) / 1000) : 0

      const session = useSessionStore.getState()
      const camera = useCameraStore.getState()
      const zone = clampZone(session.activeZone)
      const detection = camera.detectionState
      const velocity = camera.brushVelocitySmoothed

      const s = simRef.current
      const w = canvas.clientWidth || 1
      const h = canvas.clientHeight || 1

      if (!s.initialized) {
        s.initialized = true
        s.lastZone = zone
        const t = ZONE_CENTERS[zone - 1]
        s.cx = t.nx
        s.cy = t.ny
        s.zoneFrom = { ...t }
        s.zoneTo = { ...t }
        s.prevDetection = detection
        s.motionBoost = detection === 'BRUSHING' ? 1 : 0
        s.cycleT = 0
      }

      const frozen = detection === 'HAND_LOST'
      const prevDet = s.prevDetection

      if (frozen) {
        if (prevDet !== 'HAND_LOST') {
          s.motionBlend = null
        }
      } else {
        if (zone !== s.lastZone) {
          s.lastZone = zone
          s.zoneFrom = { nx: s.cx, ny: s.cy }
          s.zoneTo = { ...ZONE_CENTERS[zone - 1] }
          s.zoneBlendStartMs = ts
        }

        const zt = Math.min(1, (ts - s.zoneBlendStartMs) / s.zoneBlendDurationMs)
        const ze = easeOutCubic(zt)
        s.cx = s.zoneFrom.nx + (s.zoneTo.nx - s.zoneFrom.nx) * ze
        s.cy = s.zoneFrom.ny + (s.zoneTo.ny - s.zoneFrom.ny) * ze

        if (detection !== prevDet) {
          const wasBrushing = prevDet === 'BRUSHING'
          const isBrushing = detection === 'BRUSHING'
          const nowSlow = detection === 'DEBOUNCING' || detection === 'PAUSED'
          const wasSlow = prevDet === 'DEBOUNCING' || prevDet === 'PAUSED'

          if (wasBrushing && nowSlow) {
            startMotionBlend(s.motionBoost, 0, BRUSHING_CONFIG.pauseAnimationDurationMs)
          } else if (isBrushing && (wasSlow || prevDet === 'HAND_LOST')) {
            s.cycleT = 0
            startMotionBlend(0, 1, BRUSHING_CONFIG.resumeAnimationDurationMs)
          } else if (isBrushing && !s.motionBlend) {
            s.motionBoost = 1
          }
        }

        if (s.motionBlend) {
          const { from, to, startMs, durationMs } = s.motionBlend
          const p = Math.min(1, (ts - startMs) / durationMs)
          s.motionBoost = from + (to - from) * easeOutCubic(p)
          if (p >= 1) s.motionBlend = null
        } else if (detection === 'BRUSHING') {
          s.motionBoost = 1
        } else if (detection === 'DEBOUNCING' || detection === 'PAUSED') {
          s.motionBoost = 0
        }

        const speedMul = isFrontZone(zone) ? 1.35 : 0.72
        const vel = 1 + VELOCITY_GAIN * velocity
        s.cycleT += dt * s.motionBoost * speedMul * vel * 1.2
      }

      s.prevDetection = detection

      const front = isFrontZone(s.lastZone)
      const spreadN = front ? 0.14 : 0.09
      const rgb = front ? frontRgb : backRgb
      const centerX = s.cx * w
      const centerY = s.cy * h
      const spreadPx = spreadN * Math.min(w, h)

      ctx.fillStyle = '#0a1810'
      ctx.fillRect(0, 0, w, h)

      const baseAlpha = front ? 0.22 : 0.32
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ang = s.angles[i] + s.cycleT * (front ? 1.1 : 0.55) + s.phases[i] * 0.02
        const wob = Math.sin(s.cycleT * 2.2 + s.phases[i]) * 0.08 * s.motionBoost
        const r = spreadPx * (s.radii[i] + wob)
        const x = centerX + Math.cos(ang) * r
        const y = centerY + Math.sin(ang) * r
        const sz = s.sizes[i] * (front ? 1.1 : 0.95)
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${baseAlpha})`
        ctx.beginPath()
        ctx.arc(x, y, sz, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      role="presentation"
      aria-hidden={true}
      className={`absolute inset-0 h-full w-full touch-none ${className}`.trim()}
    />
  )
}
