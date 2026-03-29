import { describe, it, expect, beforeEach } from 'vitest'
import { useCameraStore } from './useCameraStore'

describe('useCameraStore', () => {
  beforeEach(() => {
    useCameraStore.setState({
      permissionState: 'prompt',
      detectionQuality: 'absent',
      detectionState: 'absent',
      isMediaPipeLoading: false,
    })
  })

  it('état initial correct', () => {
    const s = useCameraStore.getState()
    expect(s.permissionState).toBe('prompt')
    expect(s.detectionQuality).toBe('absent')
    expect(s.detectionState).toBe('absent')
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

  it('setDetectionState met à jour detectionState', () => {
    useCameraStore.getState().setDetectionState('brushing-active')
    expect(useCameraStore.getState().detectionState).toBe('brushing-active')
  })

  it('setMediaPipeLoading met à jour isMediaPipeLoading', () => {
    useCameraStore.getState().setMediaPipeLoading(true)
    expect(useCameraStore.getState().isMediaPipeLoading).toBe(true)
  })
})
