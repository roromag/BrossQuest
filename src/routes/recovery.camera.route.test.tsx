import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockSetPermissionState = vi.fn()
vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: vi.fn((selector: (s: { setPermissionState: typeof mockSetPermissionState }) => unknown) =>
    selector({ setPermissionState: mockSetPermissionState })
  ),
}))

import { RecoveryCameraPage } from '../routes/recovery.camera.route'

describe('RecoveryCameraPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    })
  })

  it('affiche PermissionRecovery', () => {
    render(<RecoveryCameraPage />)
    expect(screen.getByRole('button', { name: /j'ai autorisé/i })).toBeInTheDocument()
  })

  it('navigue vers /home et met à jour le store après getUserMedia success', async () => {
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(mockStream as unknown as MediaStream)
    render(<RecoveryCameraPage />)
    await userEvent.click(screen.getByRole('button', { name: /j'ai autorisé/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' }))
    expect(mockSetPermissionState).toHaveBeenCalledWith('granted')
  })

  it('reste sur la page sans naviguer si getUserMedia échoue (NotAllowedError)', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError')
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(error)
    render(<RecoveryCameraPage />)
    await userEvent.click(screen.getByRole('button', { name: /j'ai autorisé/i }))
    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled())
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockSetPermissionState).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /j'ai autorisé/i })).toBeInTheDocument()
  })

  it('reste sur la page sans naviguer si getUserMedia échoue (autre erreur)', async () => {
    const error = new DOMException('No camera found', 'NotFoundError')
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(error)
    render(<RecoveryCameraPage />)
    await userEvent.click(screen.getByRole('button', { name: /j'ai autorisé/i }))
    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled())
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /j'ai autorisé/i })).toBeInTheDocument()
  })

  it('ne crash pas si navigator.mediaDevices est absent', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    })
    render(<RecoveryCameraPage />)
    await userEvent.click(screen.getByRole('button', { name: /j'ai autorisé/i }))
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
