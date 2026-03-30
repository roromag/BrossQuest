import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Profile } from '../types/profile.types'

const mockProfile: Profile = {
  id: 'test-id',
  firstName: 'Lucas',
  emoji: '',
  createdAt: 1234567890,
  onboardingComplete: false,
}

const mockGetActiveProfile = vi.fn()
const mockSaveProfile = vi.fn()

vi.mock('../lib/db/queries', () => ({
  getActiveProfile: () => mockGetActiveProfile(),
  saveProfile: (...args: unknown[]) => mockSaveProfile(...args),
}))

const mockSetProfile = vi.fn()
vi.mock('../stores/useProfileStore', () => ({
  useProfileStore: vi.fn((selector: (s: { setProfile: typeof mockSetProfile }) => unknown) =>
    selector({ setProfile: mockSetProfile })
  ),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { HandoffPage } from '../routes/handoff.route'

describe('HandoffPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetActiveProfile.mockResolvedValue(mockProfile)
    mockSaveProfile.mockResolvedValue(undefined)
  })

  it('rend EmojiPicker une fois le profil chargé', async () => {
    render(<HandoffPage />)
    expect(await screen.findAllByRole('button')).toHaveLength(8)
  })

  it('sélection emoji → saveProfile appelé avec emoji + onboardingComplete: true', async () => {
    render(<HandoffPage />)
    await screen.findAllByRole('button')
    await userEvent.click(screen.getByRole('button', { name: '🦁' }))
    await waitFor(() => expect(mockSaveProfile).toHaveBeenCalledOnce())
    expect(mockSaveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ emoji: '🦁', onboardingComplete: true })
    )
  })

  it('après sélection → navigation vers /home', async () => {
    render(<HandoffPage />)
    await screen.findAllByRole('button')
    await userEvent.click(screen.getByRole('button', { name: '🐻' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' }))
  })

  it('après sélection → useProfileStore mis à jour avec le profil final', async () => {
    render(<HandoffPage />)
    await screen.findAllByRole('button')
    await userEvent.click(screen.getByRole('button', { name: '🐼' }))
    await waitFor(() => expect(mockSetProfile).toHaveBeenCalledOnce())
    expect(mockSetProfile).toHaveBeenCalledWith(
      expect.objectContaining({ emoji: '🐼', onboardingComplete: true })
    )
  })

  it('getActiveProfile retourne undefined → aucun bouton rendu (null)', async () => {
    mockGetActiveProfile.mockResolvedValue(undefined)
    const { container } = render(<HandoffPage />)
    // Attendre la résolution de l'useEffect
    await waitFor(() => expect(mockGetActiveProfile).toHaveBeenCalled())
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(container.firstChild).toBeNull()
  })

  it('saveProfile rejette → navigate non appelé et store non mis à jour', async () => {
    mockSaveProfile.mockRejectedValue(new Error('DB error'))
    render(<HandoffPage />)
    await screen.findAllByRole('button')
    await userEvent.click(screen.getByRole('button', { name: '🦊' }))
    await waitFor(() => expect(mockSaveProfile).toHaveBeenCalledOnce())
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockSetProfile).not.toHaveBeenCalled()
  })
})
