import { describe, it, expect, beforeEach } from 'vitest'
import { useCameraStore } from './useCameraStore'

describe('useCameraStore', () => {
  beforeEach(() => {
    useCameraStore.setState({
      permissionState: 'prompt',
      detectionQuality: 'absent',
      isMediaPipeLoading: false,
    })
  })

  it('état initial correct', () => {
    const s = useCameraStore.getState()
    expect(s.permissionState).toBe('prompt')
    expect(s.detectionQuality).toBe('absent')
    expect(s.isMediaPipeLoading).toBe(false)
  })

  it('setPermissionState met à jour permissionState', () => {
    useCameraStore.getState().setPermissionState('granted')
    expect(useCameraStore.getState().permissionState).toBe('granted')
  })

  it('setDetectionQuality met à jour detectionQuality', () => {
    useCameraStore.getState().setDetectionQuality('good')
    expect(useCameraStore.getState().detectionQuality).toBe('good')
  })

  it('setMediaPipeLoading met à jour isMediaPipeLoading', () => {
    useCameraStore.getState().setMediaPipeLoading(true)
    expect(useCameraStore.getState().isMediaPipeLoading).toBe(true)
  })
})
