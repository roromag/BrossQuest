import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../lib/db/queries', () => ({
  saveProfile: vi.fn().mockResolvedValue(undefined),
  getActiveProfile: vi.fn().mockResolvedValue(null),
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

import { RecoveryProfilePage, recoveryProfileRoute } from '../routes/recovery.profile.route'

describe('RecoveryProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("affiche l'étape 'name' en premier", () => {
    render(<RecoveryProfilePage />)
    expect(screen.getByRole('heading', { name: /on repart de zéro/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/prénom de l'enfant/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument()
  })

  it('bouton continuer désactivé si prénom vide', () => {
    render(<RecoveryProfilePage />)
    expect(screen.getByRole('button', { name: /continuer/i })).toBeDisabled()
  })

  it("passage à l'étape emoji après soumission du prénom", async () => {
    render(<RecoveryProfilePage />)
    await userEvent.type(screen.getByPlaceholderText(/prénom de l'enfant/i), 'Léo')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))
    expect(await screen.findByText(/choisis ton emoji/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/choisis ton emoji/i)).toBeInTheDocument()
  })

  it('saveProfile appelé avec onboardingComplete: true après sélection emoji', async () => {
    const { saveProfile } = await import('../lib/db/queries')
    render(<RecoveryProfilePage />)

    await userEvent.type(screen.getByPlaceholderText(/prénom de l'enfant/i), 'Léo')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))

    await userEvent.click(await screen.findByRole('button', { name: '🦁' }))

    await waitFor(() => expect(saveProfile).toHaveBeenCalledOnce())
    const savedProfile = (saveProfile as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedProfile.firstName).toBe('Léo')
    expect(savedProfile.emoji).toBe('🦁')
    expect(savedProfile.onboardingComplete).toBe(true)
    expect(typeof savedProfile.id).toBe('string')
    expect(savedProfile.id).not.toBe('')
  })

  it('navigation vers /home après sélection emoji', async () => {
    render(<RecoveryProfilePage />)

    await userEvent.type(screen.getByPlaceholderText(/prénom de l'enfant/i), 'Léo')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))

    await userEvent.click(await screen.findByRole('button', { name: '🦁' }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' }))
  })

  it('useProfileStore mis à jour après sélection emoji', async () => {
    render(<RecoveryProfilePage />)

    await userEvent.type(screen.getByPlaceholderText(/prénom de l'enfant/i), 'Léo')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))

    await userEvent.click(await screen.findByRole('button', { name: '🦁' }))

    await waitFor(() => expect(mockSetProfile).toHaveBeenCalledOnce())
    expect(mockSetProfile).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'Léo',
      emoji: '🦁',
      onboardingComplete: true,
    }))
  })

  it("erreur saveProfile : message affiché, pas de navigation", async () => {
    const { saveProfile } = await import('../lib/db/queries')
    vi.mocked(saveProfile).mockRejectedValueOnce(new Error('quota exceeded'))

    render(<RecoveryProfilePage />)

    await userEvent.type(screen.getByPlaceholderText(/prénom de l'enfant/i), 'Léo')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))
    await userEvent.click(await screen.findByRole('button', { name: '🦁' }))

    await waitFor(() =>
      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('double-tap emoji : saveProfile appelé une seule fois', async () => {
    const { saveProfile } = await import('../lib/db/queries')
    let resolveFirst!: () => void
    vi.mocked(saveProfile).mockImplementationOnce(
      () => new Promise<void>(resolve => { resolveFirst = resolve })
    )

    render(<RecoveryProfilePage />)
    await userEvent.type(screen.getByPlaceholderText(/prénom de l'enfant/i), 'Léo')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))

    const lionBtn = await screen.findByRole('button', { name: '🦁' })
    await userEvent.click(lionBtn)
    await userEvent.click(lionBtn)

    resolveFirst()

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledOnce())
    expect(saveProfile).toHaveBeenCalledOnce()
  })
})

describe('recoveryProfileRoute.beforeLoad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirige vers /home si profil complet', async () => {
    const { getActiveProfile } = await import('../lib/db/queries')
    vi.mocked(getActiveProfile).mockResolvedValueOnce({
      id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: true,
    })

    const beforeLoad = (recoveryProfileRoute as unknown as { options: { beforeLoad: () => Promise<void> } }).options.beforeLoad
    let thrown: unknown
    try {
      await beforeLoad()
    } catch (e) {
      thrown = e
    }

    expect((thrown as { options: { to: string } }).options.to).toBe('/home')
  })

  it("pas de redirect si pas de profil", async () => {
    const { getActiveProfile } = await import('../lib/db/queries')
    vi.mocked(getActiveProfile).mockResolvedValueOnce(undefined)

    const beforeLoad = (recoveryProfileRoute as unknown as { options: { beforeLoad: () => Promise<void> } }).options.beforeLoad
    await expect(beforeLoad()).resolves.toBeUndefined()
  })

  it('redirige vers /onboarding si profil mid-onboarding', async () => {
    const { getActiveProfile } = await import('../lib/db/queries')
    vi.mocked(getActiveProfile).mockResolvedValueOnce({
      id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: false,
    })

    const beforeLoad = (recoveryProfileRoute as unknown as { options: { beforeLoad: () => Promise<void> } }).options.beforeLoad
    let thrown: unknown
    try {
      await beforeLoad()
    } catch (e) {
      thrown = e
    }

    expect((thrown as { options: { to: string } }).options.to).toBe('/onboarding')
  })
})
