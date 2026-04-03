import { describe, it, expect, beforeEach } from 'vitest'
import { useCameraStore } from './useCameraStore'

describe('useCameraStore', () => {
  beforeEach(() => {
    useCameraStore.setState({
      permissionState: 'prompt',
      detectionQuality: 'absent',
      detectionState: 'HAND_LOST',
      brushVelocitySmoothed: 0,
      isMediaPipeLoading: false,
      sessionStream: null,
    })
  })

  it('état initial correct', () => {
    const s = useCameraStore.getState()
    expect(s.permissionState).toBe('prompt')
    expect(s.detectionQuality).toBe('absent')
    expect(s.detectionState).toBe('HAND_LOST')
    expect(s.brushVelocitySmoothed).toBe(0)
    expect(s.isMediaPipeLoading).toBe(false)
    expect(s.sessionStream).toBeNull()
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
    useCameraStore.getState().setDetectionState('BRUSHING')
    expect(useCameraStore.getState().detectionState).toBe('BRUSHING')
  })

  it('setBrushVelocitySmoothed met à jour la vélocité lissée', () => {
    useCameraStore.getState().setBrushVelocitySmoothed(0.04)
    expect(useCameraStore.getState().brushVelocitySmoothed).toBe(0.04)
  })

  it('setMediaPipeLoading met à jour isMediaPipeLoading', () => {
    useCameraStore.getState().setMediaPipeLoading(true)
    expect(useCameraStore.getState().isMediaPipeLoading).toBe(true)
  })

  it('setSessionStream met à jour le flux de session', () => {
    const fakeStream = { id: 'stream-1' } as unknown as MediaStream
    useCameraStore.getState().setSessionStream(fakeStream)
    expect(useCameraStore.getState().sessionStream).toBe(fakeStream)
  })

  it('resetSessionRuntime nettoie le runtime de session', () => {
    const fakeStream = { id: 'stream-2' } as unknown as MediaStream
    useCameraStore.setState({ isMediaPipeLoading: true, sessionStream: fakeStream })
    useCameraStore.getState().resetSessionRuntime()
    expect(useCameraStore.getState().isMediaPipeLoading).toBe(false)
    expect(useCameraStore.getState().sessionStream).toBeNull()
  })
})
