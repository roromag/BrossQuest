import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const { mockUseCameraStore, mockLaunchSessionFromHomeTap, cameraGetState } = vi.hoisted(() => ({
  mockUseCameraStore: vi.fn(),
  mockLaunchSessionFromHomeTap: vi.fn(),
  cameraGetState: vi.fn(),
}))
const mockUseEpisodeStore = vi.fn()

vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: Object.assign(
    (selector: (s: {
      detectionState: 'absent' | 'pause' | 'brushing-active'
      isMediaPipeLoading: boolean
      setPermissionState: (state: 'granted' | 'denied' | 'prompt') => void
      setMediaPipeLoading: (loading: boolean) => void
      setSessionStream: (stream: MediaStream | null) => void
    }) => unknown) => selector(mockUseCameraStore()),
    { getState: () => cameraGetState() },
  ),
}))

vi.mock('./home.launch-session', () => ({
  launchSessionFromHomeTap: mockLaunchSessionFromHomeTap,
}))

vi.mock('../stores/useEpisodeStore', () => ({
  useEpisodeStore: (selector: (s: { currentEpisode: { id: string } | null }) => unknown) =>
    selector(mockUseEpisodeStore()),
}))

import { HomePage } from './home.route'

describe('HomePage', () => {
  beforeEach(() => {
    mockLaunchSessionFromHomeTap.mockReset()
    cameraGetState.mockImplementation(() => mockUseCameraStore())
    mockUseCameraStore.mockReturnValue({
      detectionState: 'absent',
      isMediaPipeLoading: false,
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
    })
    mockUseEpisodeStore.mockReturnValue({ currentEpisode: { id: 'ep-001' } })
  })

  it("affiche l'ecran home avec carte narrative, episode et action principale", () => {
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    expect(screen.getByLabelText(/carte narrative/i)).toBeInTheDocument()
    expect(screen.getByText(/épisode ep-001/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lancer la session/i })).toBeInTheDocument()
  })

  it('passe en etat presence-detected quand une presence est detectee', () => {
    mockUseCameraStore.mockReturnValue({
      detectionState: 'pause',
      isMediaPipeLoading: false,
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
    })
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    const button = screen.getByRole('button', { name: /lancer la session/i })
    expect(button.className).toContain('animate-pulse')
  })

  it('desactive le PulseButton pendant le chargement MediaPipe sans spinner', () => {
    mockUseCameraStore.mockReturnValue({
      detectionState: 'absent',
      isMediaPipeLoading: true,
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
    })
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    const button = screen.getByRole('button', { name: /lancer la session/i })
    expect(button).toBeDisabled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('affiche ParentAccessIcon visible mais discret', () => {
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    const parentButton = screen.getByRole('button', { name: /accès parent/i })
    expect(parentButton).toBeInTheDocument()
    expect(parentButton.className).toContain('opacity-40')
    expect(parentButton.className).toContain('min-w-[44px]')
    expect(parentButton.className).toContain('min-h-[44px]')
  })

  it('appelle launchSessionFromHomeTap au tap quand le chargement est inactif', () => {
    mockUseCameraStore.mockReturnValue({
      detectionState: 'pause',
      isMediaPipeLoading: false,
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
    })
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    fireEvent.click(screen.getByRole('button', { name: /lancer la session/i }))
    expect(mockLaunchSessionFromHomeTap).toHaveBeenCalledTimes(1)
  })

  it('ne relance pas si getState indique chargement actif (evite double tap avant re-render)', () => {
    const snapshot = {
      detectionState: 'pause' as const,
      isMediaPipeLoading: false,
      setPermissionState: vi.fn(),
      setMediaPipeLoading: vi.fn(),
      setSessionStream: vi.fn(),
    }
    mockUseCameraStore.mockReturnValue(snapshot)
    cameraGetState.mockImplementation(() => ({ ...snapshot, isMediaPipeLoading: true }))
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    fireEvent.click(screen.getByRole('button', { name: /lancer la session/i }))
    expect(mockLaunchSessionFromHomeTap).not.toHaveBeenCalled()
  })
})
