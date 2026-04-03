import type { RefObject, TransitionEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { stopSessionCamera } from '../../lib/camera/sessionCamera'
import { NebulaCanvas } from './NebulaCanvas'

/** Durée d’affichage caméra plein écran avant le fondu (calibration). */
export const CAMERA_VISIBLE_MS = 3000

/** Durée du fondu CSS caméra → nébuleuse. */
export const FADE_DURATION_MS = 3000

export interface CameraFadeProps {
  stream: MediaStream
  videoRef: RefObject<HTMLVideoElement | null>
  onFadeComplete: () => void
}

export function CameraFade({ stream, videoRef, onFadeComplete }: CameraFadeProps) {
  const [fadeStarted, setFadeStarted] = useState(false)
  const completedRef = useRef(false)

  useEffect(() => {
    const id = globalThis.setTimeout(() => setFadeStarted(true), CAMERA_VISIBLE_MS)
    return () => globalThis.clearTimeout(id)
  }, [])

  const handleTransitionEnd = (e: TransitionEvent<HTMLVideoElement>) => {
    if (e.propertyName !== 'opacity') return
    if (!fadeStarted || completedRef.current) return
    completedRef.current = true
    stopSessionCamera(stream)
    const video = videoRef.current
    if (video) {
      video.srcObject = null
    }
    onFadeComplete()
  }

  return (
    <div className="relative h-full w-full">
      <NebulaCanvas className="z-0" />
      <video
        ref={videoRef}
        aria-label="Flux caméra session"
        className="absolute inset-0 z-10 h-full w-full object-cover"
        playsInline
        autoPlay
        muted
        style={{
          opacity: fadeStarted ? 0 : 1,
          transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
        }}
        onTransitionEnd={handleTransitionEnd}
      />
    </div>
  )
}
