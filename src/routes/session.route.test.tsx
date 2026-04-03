import { render, screen, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { DetectionState } from '../lib/mediapipe/types'
import { SessionPage } from './session.route'

const mockNavigate = vi.fn()
const mockSpeak = vi.fn()

const sessionFixture = vi.hoisted(() => ({
  phase: 'before' as 'before' | 'during' | 'after' | null,
  activeZone: 1,
  setPhase: vi.fn((p: 'before' | 'during' | 'after') => {
    sessionFixture.phase = p
  }),
}))

const cameraFixture = vi.hoisted(() => ({
  sessionStream: null as MediaStream | null,
  detectionState: 'BRUSHING' as DetectionState,
  brushVelocitySmoothed: 0,
  setSessionStream: vi.fn((stream: MediaStream | null) => {
    cameraFixture.sessionStream = stream
  }),
  setDetectionState: vi.fn((state: DetectionState) => {
    cameraFixture.detectionState = state
  }),
  setBrushVelocitySmoothed: vi.fn((v: number) => {
    cameraFixture.brushVelocitySmoothed = v
  }),
}))

const profileFixture = vi.hoisted(() => ({
  profile: null as { firstName: string } | null,
}))

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: Object.assign(
    (selector: (s: typeof cameraFixture) => unknown) => selector(cameraFixture),
    { getState: () => cameraFixture },
  ),
}))

vi.mock('../stores/useSessionStore', () => ({
  useSessionStore: Object.assign(
    (selector: (s: typeof sessionFixture) => unknown) => selector(sessionFixture),
    { getState: () => sessionFixture },
  ),
}))

vi.mock('../stores/useProfileStore', () => ({
  useProfileStore: Object.assign(
    () => ({}),
    { getState: () => ({ profile: profileFixture.profile }) },
  ),
}))

vi.mock('../lib/speech/phaseBeforeNarration', () => ({
  speakPhaseBeforeNarration: (...args: unknown[]) => mockSpeak(...args),
}))

function fakeStream() {
  return {
    getTracks: () => [{ stop: vi.fn() }],
  } as unknown as MediaStream
}

describe('SessionPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSpeak.mockClear()
    sessionFixture.phase = 'before'
    sessionFixture.setPhase.mockClear()
    cameraFixture.setDetectionState.mockClear()
    cameraFixture.setBrushVelocitySmoothed.mockClear()
    cameraFixture.detectionState = 'BRUSHING'
    cameraFixture.brushVelocitySmoothed = 0
    cameraFixture.sessionStream = fakeStream()
    cameraFixture.setSessionStream.mockImplementation((stream: MediaStream | null) => {
      cameraFixture.sessionStream = stream
    })
    profileFixture.profile = null
  })

  it('affiche la vidéo de phase Avant lorsque le flux est actif', () => {
    render(<SessionPage />)
    const video = screen.getByLabelText(/flux caméra session/i)
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveProperty('playsInline', true)
  })

  it('redirige vers recovery si aucun stream et phase hors session active', async () => {
    cameraFixture.sessionStream = null
    sessionFixture.phase = null
    render(<SessionPage />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/recovery/camera' })
  })

  it('ne redirige pas si le flux a été libéré après transition (phase during)', async () => {
    cameraFixture.sessionStream = null
    sessionFixture.phase = 'during'
    render(<SessionPage />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('déclenche la narration placeholder une fois par flux présent', async () => {
    render(<SessionPage />)
    await act(async () => {
      await Promise.resolve()
    })
    expect(mockSpeak).toHaveBeenCalledTimes(1)
  })

  it('passe en phase during et vide le stream à la fin du fondu', async () => {
    vi.useFakeTimers()
    const stream = fakeStream()
    cameraFixture.sessionStream = stream
    const setSessionStream = vi.fn((v: MediaStream | null) => {
      cameraFixture.sessionStream = v
    })
    cameraFixture.setSessionStream = setSessionStream

    render(<SessionPage />)
    const video = screen.getByLabelText(/flux caméra session/i)

    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    await act(async () => {
      const ev = new Event('transitionend', { bubbles: true })
      Object.assign(ev, { propertyName: 'opacity' })
      video.dispatchEvent(ev)
    })

    expect(setSessionStream).toHaveBeenCalledWith(null)
    expect(cameraFixture.setDetectionState).toHaveBeenCalledWith('BRUSHING')
    expect(cameraFixture.setBrushVelocitySmoothed).toHaveBeenCalledWith(0)
    expect(sessionFixture.setPhase).toHaveBeenCalledWith('during')

    vi.useRealTimers()
  })
})
