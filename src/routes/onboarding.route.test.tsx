import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('../lib/db/queries', () => ({
  saveProfile: vi.fn().mockResolvedValue(undefined),
}))

const mockSetProfile = vi.fn()
vi.mock('../stores/useProfileStore', () => ({
  useProfileStore: vi.fn((selector: (s: { setProfile: typeof mockSetProfile }) => unknown) =>
    selector({ setProfile: mockSetProfile })
  ),
}))

vi.mock('../guards/CameraGuard', () => ({
  checkCameraPermission: vi.fn().mockResolvedValue('prompt'),
}))

const mockSetPermissionState = vi.fn()
vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: vi.fn((selector: (s: { setPermissionState: typeof mockSetPermissionState }) => unknown) =>
    selector({ setPermissionState: mockSetPermissionState })
  ),
}))

import { NameStep, CameraStep, OnboardingPage } from '../routes/onboarding.route'

describe('NameStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le champ prénom', () => {
    render(<NameStep onComplete={vi.fn()} />)
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
  })

  it('bouton désactivé si prénom vide', () => {
    render(<NameStep onComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continuer/i })).toBeDisabled()
  })

  it("affiche l'erreur après blur sans saisie", async () => {
    render(<NameStep onComplete={vi.fn()} />)
    const input = screen.getByLabelText(/prénom/i)
    fireEvent.blur(input)
    expect(await screen.findByText(/prénom est requis/i)).toBeInTheDocument()
  })

  it("bouton actif après saisie d'un prénom valide", async () => {
    render(<NameStep onComplete={vi.fn()} />)
    await userEvent.type(screen.getByLabelText(/prénom/i), 'Lucas')
    expect(screen.getByRole('button', { name: /continuer/i })).not.toBeDisabled()
  })

  // P5 — userEvent.click au lieu de fireEvent.click
  it('appelle saveProfile + onComplete avec le profil correct', async () => {
    const { saveProfile } = await import('../lib/db/queries')
    const onComplete = vi.fn()
    render(<NameStep onComplete={onComplete} />)

    await userEvent.type(screen.getByLabelText(/prénom/i), 'Lucas')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))

    await waitFor(() => expect(saveProfile).toHaveBeenCalledOnce())

    const savedProfile = (saveProfile as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedProfile.firstName).toBe('Lucas')
    expect(savedProfile.emoji).toBe('')
    expect(savedProfile.onboardingComplete).toBe(false)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('ignore les espaces seuls (prénom invalide)', async () => {
    const { saveProfile } = await import('../lib/db/queries')
    const onComplete = vi.fn()
    render(<NameStep onComplete={onComplete} />)

    await userEvent.type(screen.getByLabelText(/prénom/i), '   ')
    expect(screen.getByRole('button', { name: /continuer/i })).toBeDisabled()
    expect(saveProfile).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  // P6 — soumission via Enter avec prénom tout-espaces
  it('bloque la soumission via Enter si le prénom est tout-espaces', async () => {
    const { saveProfile } = await import('../lib/db/queries')
    const onComplete = vi.fn()
    render(<NameStep onComplete={onComplete} />)

    await userEvent.type(screen.getByLabelText(/prénom/i), '   ')
    await userEvent.keyboard('{Enter}')

    expect(saveProfile).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('CameraStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    })
  })

  it('appelle onComplete immédiatement si permission déjà accordée', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('granted')
    const onComplete = vi.fn()
    render(<CameraStep onComplete={onComplete} />)
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())
  })

  it('affiche le bouton autoriser si permission en attente', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    render(<CameraStep onComplete={vi.fn()} />)
    expect(await screen.findByRole('button', { name: /autoriser la caméra/i })).toBeInTheDocument()
    expect(screen.getByText(/localement/i)).toBeInTheDocument()
  })

  it('appelle onComplete après getUserMedia success', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(mockStream as unknown as MediaStream)
    const onComplete = vi.fn()
    render(<CameraStep onComplete={onComplete} />)
    await userEvent.click(await screen.findByRole('button', { name: /autoriser la caméra/i }))
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())
    expect(mockSetPermissionState).toHaveBeenCalledWith('granted')
  })

  it('affiche PermissionRecovery si getUserMedia échoue', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    const error = new DOMException('Permission denied', 'NotAllowedError')
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(error)
    render(<CameraStep onComplete={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /autoriser la caméra/i }))
    expect(await screen.findByRole('button', { name: /j'ai autorisé/i })).toBeInTheDocument()
    expect(mockSetPermissionState).toHaveBeenCalledWith('denied')
  })
})

// P4 — transition NameStep → CameraStep → PWA dans OnboardingPage
describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    })
  })

  it('affiche le champ prénom au premier rendu', () => {
    render(<OnboardingPage />)
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
  })

  // P3 — asserter setProfile (AC Scénario 2) + transition vers caméra
  it("appelle setProfile et passe à l'étape caméra après soumission valide", async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    const { saveProfile } = await import('../lib/db/queries')
    render(<OnboardingPage />)

    await userEvent.type(screen.getByLabelText(/prénom/i), 'Lucas')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))

    await waitFor(() => expect(saveProfile).toHaveBeenCalledOnce())
    expect(mockSetProfile).toHaveBeenCalledOnce()
    expect(mockSetProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Lucas' }))
    expect(await screen.findByRole('button', { name: /autoriser la caméra/i })).toBeInTheDocument()
  })

  it('affiche le placeholder PWA après CameraStep accordé', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(mockStream as unknown as MediaStream)
    const { saveProfile } = await import('../lib/db/queries')
    render(<OnboardingPage />)

    await userEvent.type(screen.getByLabelText(/prénom/i), 'Lucas')
    await userEvent.click(screen.getByRole('button', { name: /continuer/i }))
    await waitFor(() => expect(saveProfile).toHaveBeenCalledOnce())

    await userEvent.click(await screen.findByRole('button', { name: /autoriser la caméra/i }))
    expect(await screen.findByText(/PWA/i)).toBeInTheDocument()
  })
})
