import { create } from 'zustand'
import type { DetectionQuality, DetectionState } from '../lib/mediapipe/types'

type PermissionState = 'granted' | 'denied' | 'prompt'

interface CameraStore {
  permissionState: PermissionState
  detectionQuality: DetectionQuality
  detectionState: DetectionState
  isMediaPipeLoading: boolean
  setPermissionState: (state: PermissionState) => void
  setDetectionQuality: (quality: DetectionQuality) => void
  setDetectionState: (state: DetectionState) => void
  setMediaPipeLoading: (loading: boolean) => void
}

export const useCameraStore = create<CameraStore>()((set) => ({
  permissionState: 'prompt',
  detectionQuality: 'absent',
  detectionState: 'absent',
  isMediaPipeLoading: false,
  setPermissionState: (permissionState) => set({ permissionState }),
  setDetectionQuality: (detectionQuality) => set({ detectionQuality }),
  setDetectionState: (detectionState) => set({ detectionState }),
  setMediaPipeLoading: (isMediaPipeLoading) => set({ isMediaPipeLoading }),
}))
