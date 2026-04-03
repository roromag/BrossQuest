// src/routes/spike.route.tsx
// ⚠️ Route DEV uniquement — pas de guard, pas de lien depuis l'app

import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useRef, useState, useCallback, useEffect } from 'react'
import { loadDetector, detectFrame, isDetectorReady, disposeDetector, getDetectorConfig, setDetectorConfig } from '../lib/mediapipe/detector'
import type { DetectorConfig } from '../lib/mediapipe/detector'
import type { DetectionResult } from '../lib/mediapipe/types'

interface ConfigRowProps {
  label: string
  description: string
  value: number
  step: number
  min: number
  max: number
  onChange: (v: number) => void
}

function ConfigRow({ label, description, value, step, min, max, onChange }: ConfigRowProps) {
  return (
    <tr style={{ borderBottom: '1px solid #4A5568' }}>
      <td style={{ padding: '0.4rem 0.5rem', color: '#F6E05E', whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ padding: '0.4rem 0.5rem', color: '#A0AEC0', fontSize: '0.85rem' }}>{description}</td>
      <td style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            width: '90px',
            background: '#1A202C',
            color: '#fff',
            border: '1px solid #4A5568',
            borderRadius: '4px',
            padding: '0.2rem 0.4rem',
            fontFamily: 'monospace',
          }}
        />
      </td>
    </tr>
  )
}

function SpikeDetectionPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const animRef = useRef<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null)
  const [fps, setFps] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fpsCountRef = useRef({ count: 0, lastTs: 0 })
  const [detectorConfig, setDetectorConfigState] = useState<DetectorConfig>(getDetectorConfig())

  const updateConfig = useCallback((key: keyof DetectorConfig, value: number) => {
    const next = { ...detectorConfig, [key]: value }
    setDetectorConfig(next)
    setDetectorConfigState(next)
  }, [detectorConfig])

  const startSpike = useCallback(async () => {
    setErrorMsg(null)
    setIsLoading(true)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia indisponible — accès caméra requiert HTTPS (pas HTTP). Lance le serveur avec HTTPS ou utilise un tunnel.')
      }
      // getUserMedia DOIT être appelé dans le même event handler que le tap (iOS Safari)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // video.play() peut rejeter avec null sur iOS Safari (bug WebKit) — on l'ignore
        await videoRef.current.play().catch(() => {})
      }

      await loadDetector((loading) => setIsLoading(loading))
      setIsRunning(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : `Erreur inconnue: ${String(e)}`
      console.error('[Spike] Erreur démarrage', e)
      setErrorMsg(msg)
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
          style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: isLoading ? 'wait' : 'pointer', touchAction: 'manipulation' }}
        >
          {isLoading ? '⏳ Chargement WASM...' : '▶ Démarrer la détection'}
        </button>
      )}

      {errorMsg && (
        <div style={{ marginTop: '1rem', background: '#742A2A', padding: '1rem', borderRadius: '8px', color: '#FED7D7' }}>
          ❌ {errorMsg}
        </div>
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
            color:
              lastResult.state === 'BRUSHING'
                ? '#48BB78'
                : lastResult.state === 'DEBOUNCING'
                  ? '#F6AD55'
                  : lastResult.state === 'PAUSED'
                    ? '#ED8936'
                    : '#FC8181'
          }}>
            État : <strong>{lastResult.state}</strong>
          </div>
          <div>Qualité : {lastResult.quality}</div>
          <div>Confiance main : {lastResult.handConfidence?.toFixed(2) ?? 'N/A'}</div>
          {lastResult.velocity && (
            <>
              <div>Vélocité inst. : {lastResult.velocity.instantaneous.toFixed(4)}</div>
              <div>Vélocité lissée : <strong>{lastResult.velocity.smoothed.toFixed(4)}</strong> (seuil : {detectorConfig.detectionThreshold.toFixed(3)})</div>
              <div>Changements direction : {lastResult.velocity.directionReversals} (min : {detectorConfig.oscillationMinReversals})</div>
            </>
          )}
          <div>FPS : {fps}</div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', background: '#2D3748', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#90CDF4' }}>⚙️ Paramètres détection (live)</h3>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <ConfigRow
              label="detectionThreshold"
              description="Vélocité min. brossage actif"
              value={detectorConfig.detectionThreshold}
              step={0.001}
              min={0}
              max={0.05}
              onChange={v => updateConfig('detectionThreshold', v)}
            />
            <ConfigRow
              label="oscillationMinReversals"
              description="Nb. inversions direction min."
              value={detectorConfig.oscillationMinReversals}
              step={1}
              min={1}
              max={10}
              onChange={v => updateConfig('oscillationMinReversals', v)}
            />
            <ConfigRow
              label="oscillationWindowMs"
              description="Fenêtre oscillation (ms)"
              value={detectorConfig.oscillationWindowMs}
              step={50}
              min={200}
              max={2000}
              onChange={v => updateConfig('oscillationWindowMs', v)}
            />
            <ConfigRow
              label="velocityBufferSize"
              description="Taille buffer lissage"
              value={detectorConfig.velocityBufferSize}
              step={1}
              min={1}
              max={30}
              onChange={v => updateConfig('velocityBufferSize', v)}
            />
            <ConfigRow
              label="confidenceThreshold"
              description="Confiance min. main (qualité)"
              value={detectorConfig.confidenceThreshold}
              step={0.05}
              min={0}
              max={1}
              onChange={v => updateConfig('confidenceThreshold', v)}
            />
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const spikeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/spike',
  component: SpikeDetectionPage,
})
