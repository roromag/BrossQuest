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

import { HandoffPageContent, handoffRoute } from '../routes/handoff.route'

describe('HandoffPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetActiveProfile.mockResolvedValue(mockProfile)
    mockSaveProfile.mockResolvedValue(undefined)
  })

  // ── Écran de bascule ──────────────────────────────────────────────────────

  it('affiche le texte "Quel emoji pour accueillir" avec le prénom du profil', () => {
    render(<HandoffPageContent profile={mockProfile} />)
    expect(screen.getByText(/Quel emoji pour accueillir Lucas/)).toBeInTheDocument()
  })

  it('EmojiPicker n\'est PAS rendu avant le clic sur le bouton', () => {
    render(<HandoffPageContent profile={mockProfile} />)
    expect(screen.getByRole('button', { name: /Choisir mon emoji/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Choisis ton emoji')).toBeNull()
  })

  it('clic sur "Choisir mon emoji" → EmojiPicker est rendu (8 boutons emoji)', async () => {
    render(<HandoffPageContent profile={mockProfile} />)
    const basculeBtn = await screen.findByRole('button', { name: /Choisir mon emoji/i })
    await userEvent.click(basculeBtn)
    const emojiButtons = screen.getAllByRole('button')
    expect(emojiButtons).toHaveLength(8)
  })

  // ── Comportement Story 2.4 conservé ──────────────────────────────────────

  it('sélection emoji → saveProfile appelé avec emoji + onboardingComplete: true', async () => {
    render(<HandoffPageContent profile={mockProfile} />)
    await userEvent.click(await screen.findByRole('button', { name: /Choisir mon emoji/i }))
    await userEvent.click(screen.getByRole('button', { name: '🦁' }))
    await waitFor(() => expect(mockSaveProfile).toHaveBeenCalledOnce())
    expect(mockSaveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ emoji: '🦁', onboardingComplete: true })
    )
  })

  it('après sélection → navigation vers /home', async () => {
    render(<HandoffPageContent profile={mockProfile} />)
    await userEvent.click(await screen.findByRole('button', { name: /Choisir mon emoji/i }))
    await userEvent.click(screen.getByRole('button', { name: '🐻' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' }))
  })

  it('après sélection → useProfileStore mis à jour avec le profil final', async () => {
    render(<HandoffPageContent profile={mockProfile} />)
    await userEvent.click(await screen.findByRole('button', { name: /Choisir mon emoji/i }))
    await userEvent.click(screen.getByRole('button', { name: '🐼' }))
    await waitFor(() => expect(mockSetProfile).toHaveBeenCalledOnce())
    expect(mockSetProfile).toHaveBeenCalledWith(
      expect.objectContaining({ emoji: '🐼', onboardingComplete: true })
    )
  })

  it('saveProfile rejette → navigate non appelé et store non mis à jour', async () => {
    mockSaveProfile.mockRejectedValue(new Error('DB error'))
    render(<HandoffPageContent profile={mockProfile} />)
    await userEvent.click(await screen.findByRole('button', { name: /Choisir mon emoji/i }))
    await userEvent.click(screen.getByRole('button', { name: '🦊' }))
    await waitFor(() => expect(mockSaveProfile).toHaveBeenCalledOnce())
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockSetProfile).not.toHaveBeenCalled()
  })
})

describe('handoffRoute.loader', () => {
  const loader = (handoffRoute as unknown as { options: { loader: () => Promise<unknown> } }).options.loader

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetActiveProfile.mockResolvedValue(mockProfile)
    mockSaveProfile.mockResolvedValue(undefined)
  })

  it('retourne le profil si onboarding incomplet', async () => {
    await expect(loader()).resolves.toEqual({ profile: mockProfile })
    expect(mockGetActiveProfile).toHaveBeenCalledOnce()
  })

  it('redirige vers /onboarding si aucun profil', async () => {
    mockGetActiveProfile.mockResolvedValue(undefined)
    let thrown: unknown
    try {
      await loader()
    } catch (e) {
      thrown = e
    }
    expect((thrown as { options: { to: string } }).options.to).toBe('/onboarding')
  })

  it('redirige vers /home si onboarding déjà complété', async () => {
    mockGetActiveProfile.mockResolvedValue({ ...mockProfile, onboardingComplete: true })
    let thrown: unknown
    try {
      await loader()
    } catch (e) {
      thrown = e
    }
    expect((thrown as { options: { to: string } }).options.to).toBe('/home')
  })
})
