import { describe, expect, it, vi } from 'vitest'
import { launchSessionFromHomeTap } from './home.launch-session'

describe('launchSessionFromHomeTap', () => {
  it('appelle la camera immédiatement et navigue vers /session au succès', async () => {
    const calls: string[] = []
    const fakeStream = { id: 'media-1' } as unknown as MediaStream
    const startCamera = vi.fn(() => {
      calls.push('startCamera')
      return Promise.resolve({ ok: true as const, stream: fakeStream })
    })
    const deps = {
      setPermissionState: vi.fn(() => calls.push('setPermissionState')),
      setMediaPipeLoading: vi.fn(() => calls.push('setMediaPipeLoading')),
      setSessionStream: vi.fn(() => calls.push('setSessionStream')),
      onSessionCameraReady: vi.fn(() => calls.push('onSessionCameraReady')),
      navigateTo: vi.fn(() => calls.push('navigateTo')),
      startCamera,
      onError: vi.fn(),
    }

    launchSessionFromHomeTap(deps)
    expect(startCamera).toHaveBeenCalledTimes(1)
    expect(calls[0]).toBe('setMediaPipeLoading')
    expect(calls[1]).toBe('startCamera')

    await Promise.resolve()
    await Promise.resolve()

    expect(deps.setSessionStream).toHaveBeenCalledWith(fakeStream)
    expect(deps.setPermissionState).toHaveBeenCalledWith('granted')
    expect(deps.onSessionCameraReady).toHaveBeenCalledTimes(1)
    expect(deps.navigateTo).toHaveBeenCalledWith('/session')
    expect(calls).toContain('onSessionCameraReady')
    const idxStream = calls.indexOf('setSessionStream')
    const idxReady = calls.indexOf('onSessionCameraReady')
    const idxNav = calls.indexOf('navigateTo')
    expect(idxStream).toBeLessThan(idxReady)
    expect(idxReady).toBeLessThan(idxNav)
  })

  it('redirige vers /recovery/camera en cas de refus permission', async () => {
    const deps = {
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
      navigateTo: vi.fn(),
      startCamera: vi.fn(() => Promise.resolve({ ok: false as const, reason: 'permission-denied' as const })),
      onError: vi.fn(),
    }

    launchSessionFromHomeTap(deps)
    await Promise.resolve()
    await Promise.resolve()

    expect(deps.setSessionStream).toHaveBeenCalledWith(null)
    expect(deps.setPermissionState).toHaveBeenCalledWith('denied')
    expect(deps.navigateTo).toHaveBeenCalledWith('/recovery/camera')
  })

  it('redirige vers /recovery/camera avec permission prompt si camera indisponible', async () => {
    const deps = {
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
      navigateTo: vi.fn(),
      startCamera: vi.fn(() => Promise.resolve({ ok: false as const, reason: 'unavailable' as const })),
      onError: vi.fn(),
    }

    launchSessionFromHomeTap(deps)
    await Promise.resolve()
    await Promise.resolve()

    expect(deps.setSessionStream).toHaveBeenCalledWith(null)
    expect(deps.setPermissionState).toHaveBeenCalledWith('prompt')
    expect(deps.navigateTo).toHaveBeenCalledWith('/recovery/camera')
  })

  it('redirige vers /recovery/camera avec permission prompt si echec inconnu', async () => {
    const deps = {
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
      navigateTo: vi.fn(),
      startCamera: vi.fn(() => Promise.resolve({ ok: false as const, reason: 'unknown' as const })),
      onError: vi.fn(),
    }

    launchSessionFromHomeTap(deps)
    await Promise.resolve()
    await Promise.resolve()

    expect(deps.setSessionStream).toHaveBeenCalledWith(null)
    expect(deps.setPermissionState).toHaveBeenCalledWith('prompt')
    expect(deps.navigateTo).toHaveBeenCalledWith('/recovery/camera')
  })

  it('redirige vers /recovery/camera et notifie onError si startCamera rejette', async () => {
    const boom = new Error('getUserMedia failed')
    const deps = {
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
      navigateTo: vi.fn(),
      startCamera: vi.fn(() => Promise.reject(boom)),
      onError: vi.fn(),
    }

    launchSessionFromHomeTap(deps)
    await Promise.resolve()
    await Promise.resolve()

    expect(deps.setSessionStream).toHaveBeenCalledWith(null)
    expect(deps.setPermissionState).toHaveBeenCalledWith('prompt')
    expect(deps.navigateTo).toHaveBeenCalledWith('/recovery/camera')
    expect(deps.onError).toHaveBeenCalledWith(boom)
  })
})
