import { render, screen, act } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { stopSessionCamera } from '../../lib/camera/sessionCamera'
import { CameraFade, CAMERA_VISIBLE_MS, FADE_DURATION_MS } from './CameraFade'

vi.mock('../../lib/camera/sessionCamera', () => ({
  stopSessionCamera: vi.fn(),
}))

function createFakeStream() {
  const stop = vi.fn()
  const track = { stop }
  return {
    getTracks: () => [track],
    _stopSpy: stop,
  } as unknown as MediaStream & { _stopSpy: ReturnType<typeof vi.fn> }
}

describe('CameraFade', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('expose les constantes de durée attendues', () => {
    expect(CAMERA_VISIBLE_MS).toBe(3000)
    expect(FADE_DURATION_MS).toBe(3000)
  })

  it('après délai visible + transitionend, arrête le flux et appelle onFadeComplete', async () => {
    const stream = createFakeStream()
    const onFadeComplete = vi.fn()
    const videoRef = createRef<HTMLVideoElement>()

    render(<CameraFade stream={stream} videoRef={videoRef} onFadeComplete={onFadeComplete} />)

    const video = screen.getByLabelText(/flux caméra session/i)
    expect(video).toHaveProperty('playsInline', true)
    expect(video).toHaveProperty('muted', true)

    await act(async () => {
      vi.advanceTimersByTime(CAMERA_VISIBLE_MS)
    })

    expect(video.style.opacity).toBe('0')
    expect(video.style.transition).toMatch(/3000ms/)
    expect(video.style.transition).toContain('ease-in-out')

    await act(async () => {
      const ev = new Event('transitionend', { bubbles: true })
      Object.assign(ev, { propertyName: 'opacity' })
      video.dispatchEvent(ev)
    })

    expect(stopSessionCamera).toHaveBeenCalledWith(stream)
    expect(videoRef.current?.srcObject).toBeNull()
    expect(onFadeComplete).toHaveBeenCalledTimes(1)
  })

  it('ignore transitionend si la propriété n’est pas opacity', async () => {
    const stream = createFakeStream()
    const onFadeComplete = vi.fn()
    const videoRef = createRef<HTMLVideoElement>()

    render(<CameraFade stream={stream} videoRef={videoRef} onFadeComplete={onFadeComplete} />)

    await act(async () => {
      vi.advanceTimersByTime(CAMERA_VISIBLE_MS)
    })

    const video = screen.getByLabelText(/flux caméra session/i)
    await act(async () => {
      const ev = new Event('transitionend', { bubbles: true })
      Object.assign(ev, { propertyName: 'transform' })
      video.dispatchEvent(ev)
    })

    expect(onFadeComplete).not.toHaveBeenCalled()
  })
})
