import { create } from 'zustand'
import type { DetectionQuality, DetectionState } from '../lib/mediapipe/types'

type PermissionState = 'granted' | 'denied' | 'prompt'

interface CameraStore {
  permissionState: PermissionState
  detectionQuality: DetectionQuality
  detectionState: DetectionState
  /** Vélocité lissée (landmarks normalisés) — alimentée par MediaPipe en 3.5 */
  brushVelocitySmoothed: number
  isMediaPipeLoading: boolean
  sessionStream: MediaStream | null
  setPermissionState: (state: PermissionState) => void
  setDetectionQuality: (quality: DetectionQuality) => void
  setDetectionState: (state: DetectionState) => void
  setBrushVelocitySmoothed: (v: number) => void
  setMediaPipeLoading: (loading: boolean) => void
  setSessionStream: (stream: MediaStream | null) => void
  resetSessionRuntime: () => void
}

export const useCameraStore = create<CameraStore>()((set) => ({
  permissionState: 'prompt',
  detectionQuality: 'absent',
  detectionState: 'HAND_LOST',
  brushVelocitySmoothed: 0,
  isMediaPipeLoading: false,
  sessionStream: null,
  setPermissionState: (permissionState) => set({ permissionState }),
  setDetectionQuality: (detectionQuality) => set({ detectionQuality }),
  setDetectionState: (detectionState) => set({ detectionState }),
  setBrushVelocitySmoothed: (brushVelocitySmoothed) => set({ brushVelocitySmoothed }),
  setMediaPipeLoading: (isMediaPipeLoading) => set({ isMediaPipeLoading }),
  setSessionStream: (sessionStream) => set({ sessionStream }),
  resetSessionRuntime: () =>
    set({
      isMediaPipeLoading: false,
      sessionStream: null,
    }),
}))
