import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PermissionRecovery } from './PermissionRecovery'

describe('PermissionRecovery', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche les instructions iOS si userAgent iOS Safari', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true,
    })
    render(<PermissionRecovery onRetry={vi.fn()} />)
    expect(screen.getByText(/Réglages/i)).toBeInTheDocument()
    expect(screen.getByText(/Safari/i)).toBeInTheDocument()
  })

  it('affiche les instructions Android si userAgent Android', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/112',
      configurable: true,
    })
    render(<PermissionRecovery onRetry={vi.fn()} />)
    expect(screen.getByText(/cadenas/i)).toBeInTheDocument()
    expect(screen.getByText(/Autorisations/i)).toBeInTheDocument()
  })

  it("appelle onRetry au clic sur \"J'ai autorisé\"", async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0)',
      configurable: true,
    })
    const onRetry = vi.fn()
    render(<PermissionRecovery onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /j'ai autorisé/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
