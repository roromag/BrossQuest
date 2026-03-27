import { create } from 'zustand'

type PermissionState = 'granted' | 'denied' | 'prompt'
type DetectionQuality = 'good' | 'degraded' | 'absent'

interface CameraStore {
  permissionState: PermissionState
  detectionQuality: DetectionQuality
  isMediaPipeLoading: boolean
  setPermissionState: (state: PermissionState) => void
  setDetectionQuality: (quality: DetectionQuality) => void
  setMediaPipeLoading: (loading: boolean) => void
}

export const useCameraStore = create<CameraStore>()((set) => ({
  permissionState: 'prompt',
  detectionQuality: 'absent',
  isMediaPipeLoading: false,
  setPermissionState: (permissionState) => set({ permissionState }),
  setDetectionQuality: (detectionQuality) => set({ detectionQuality }),
  setMediaPipeLoading: (isMediaPipeLoading) => set({ isMediaPipeLoading }),
}))
