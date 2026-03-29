import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPromptInstall = vi.fn()
let mockIsPromptAvailable = false

vi.mock('../../lib/sw/usePwaInstall', () => ({
  usePwaInstall: () => ({
    isPromptAvailable: mockIsPromptAvailable,
    promptInstall: mockPromptInstall,
  }),
}))

import { PwaStep } from './PwaStep'

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  })
}

describe('PwaStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsPromptAvailable = false
    mockPromptInstall.mockResolvedValue('unavailable')
  })

  it('iOS — affiche les instructions iOS, pas de bouton "Installer l\'app"', () => {
    setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15')
    render(<PwaStep onComplete={vi.fn()} />)
    expect(screen.getByText(/bouton Partage/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /installer l'app/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuer sans installer/i })).toBeInTheDocument()
  })

  it('Android + deferredPrompt disponible — affiche le bouton "Installer l\'app"', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36')
    mockIsPromptAvailable = true
    render(<PwaStep onComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /installer l'app/i })).toBeInTheDocument()
    expect(screen.queryByText(/menu ⋮/i)).not.toBeInTheDocument()
  })

  it('Android sans deferredPrompt — affiche les instructions manuelles', () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36')
    mockIsPromptAvailable = false
    render(<PwaStep onComplete={vi.fn()} />)
    expect(screen.getByText(/menu ⋮/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /installer l'app/i })).not.toBeInTheDocument()
  })

  it('clic "Continuer sans installer" → appelle onComplete', async () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36')
    const onComplete = vi.fn()
    render(<PwaStep onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /continuer sans installer/i }))
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('clic "Installer l\'app" (Android) → deferredPrompt.prompt() appelé puis onComplete', async () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36')
    mockIsPromptAvailable = true
    mockPromptInstall.mockResolvedValue('accepted')
    const onComplete = vi.fn()
    render(<PwaStep onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /installer l'app/i }))
    expect(mockPromptInstall).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('clic "Installer l\'app" suivi d\'un refus → onComplete quand même appelé', async () => {
    setUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36')
    mockIsPromptAvailable = true
    mockPromptInstall.mockResolvedValue('dismissed')
    const onComplete = vi.fn()
    render(<PwaStep onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('button', { name: /installer l'app/i }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
