import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUseCameraStore = vi.fn()
const mockUseEpisodeStore = vi.fn()

vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: (selector: (s: { detectionState: 'absent' | 'pause' | 'brushing-active'; isMediaPipeLoading: boolean }) => unknown) =>
    selector(mockUseCameraStore()),
}))

vi.mock('../stores/useEpisodeStore', () => ({
  useEpisodeStore: (selector: (s: { currentEpisode: { id: string } | null }) => unknown) =>
    selector(mockUseEpisodeStore()),
}))

import { HomePage } from './home.route'

describe('HomePage', () => {
  beforeEach(() => {
    mockUseCameraStore.mockReturnValue({ detectionState: 'absent', isMediaPipeLoading: false })
    mockUseEpisodeStore.mockReturnValue({ currentEpisode: { id: 'ep-001' } })
  })

  it("affiche l'ecran home avec carte narrative, episode et action principale", () => {
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    expect(screen.getByLabelText(/carte narrative/i)).toBeInTheDocument()
    expect(screen.getByText(/épisode ep-001/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lancer la session/i })).toBeInTheDocument()
  })

  it('passe en etat presence-detected quand une presence est detectee', () => {
    mockUseCameraStore.mockReturnValue({ detectionState: 'pause', isMediaPipeLoading: false })
    render(<HomePage loaderData={{ isRestMode: false, period: 'morning' }} />)
    const button = screen.getByRole('button', { name: /lancer la session/i })
    expect(button.className).toContain('animate-pulse')
  })

  it('desactive le PulseButton pendant le chargement MediaPipe sans spinner', () => {
    mockUseCameraStore.mockReturnValue({ detectionState: 'absent', isMediaPipeLoading: true })
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
})
