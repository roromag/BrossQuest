import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SessionPage } from './session.route'

const mockNavigate = vi.fn()
const mockUseCameraStore = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: (selector: (s: { sessionStream: MediaStream | null }) => unknown) =>
    selector(mockUseCameraStore()),
}))

describe('SessionPage', () => {
  it('rend une vidéo inline camera-ready', () => {
    mockUseCameraStore.mockReturnValue({ sessionStream: { id: 'stream-1' } })
    render(<SessionPage />)
    const video = screen.getByLabelText(/flux caméra session/i)
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveProperty('playsInline', true)
  })

  it('redirige vers recovery si aucun stream actif', async () => {
    mockUseCameraStore.mockReturnValue({ sessionStream: null })
    render(<SessionPage />)
    await Promise.resolve()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/recovery/camera' })
  })
})
