import { beforeEach, describe, expect, it, vi } from 'vitest'
import { startSessionCamera, stopSessionCamera } from './sessionCamera'

describe('sessionCamera', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    })
  })

  it('retourne un succès avec stream quand getUserMedia réussit', async () => {
    const fakeStream = { id: 'stream-1' } as unknown as MediaStream
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(fakeStream)
    const result = await startSessionCamera()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.stream).toBe(fakeStream)
    }
  })

  it('mappe NotAllowedError en permission-denied', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(new DOMException('denied', 'NotAllowedError'))
    const result = await startSessionCamera()
    expect(result).toMatchObject({ ok: false, reason: 'permission-denied' })
  })

  it('stoppe proprement les tracks du stream', () => {
    const stop = vi.fn()
    const stream = { getTracks: () => [{ stop }, { stop }] } as unknown as MediaStream
    stopSessionCamera(stream)
    expect(stop).toHaveBeenCalledTimes(2)
  })
})
