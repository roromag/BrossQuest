import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmojiPicker } from './EmojiPicker'

describe('EmojiPicker', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche 8 emojis dans la grille', () => {
    render(<EmojiPicker onSelect={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(8)
  })

  it('clic sur un emoji → onSelect appelé avec la bonne valeur', async () => {
    const onSelect = vi.fn()
    render(<EmojiPicker onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '🦁' }))
    expect(onSelect).toHaveBeenCalledWith('🦁')
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('clic sur un autre emoji → onSelect appelé avec la nouvelle valeur', async () => {
    const onSelect = vi.fn()
    render(<EmojiPicker onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '🐶' }))
    expect(onSelect).toHaveBeenCalledWith('🐶')
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('clic sur un emoji → navigator.vibrate(10) appelé', async () => {
    render(<EmojiPicker onSelect={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: '🐻' }))
    expect(navigator.vibrate).toHaveBeenCalledWith(10)
  })

  // ── prop animated ─────────────────────────────────────────────────────────

  it('prop animated={true} → chaque bouton a animationDelay dans son style', () => {
    render(<EmojiPicker onSelect={vi.fn()} animated />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(8)
    buttons.forEach((btn, index) => {
      expect(btn).toHaveStyle({ animationDelay: `${index * 50}ms` })
    })
  })

  it('prop animated={true} → chaque bouton a la classe emoji-appear', () => {
    render(<EmojiPicker onSelect={vi.fn()} animated />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn.className).toContain('emoji-appear')
    })
  })

  it('sans prop animated → aucun bouton n\'a animationDelay dans son style', () => {
    render(<EmojiPicker onSelect={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).not.toHaveStyle({ animationDelay: '0ms' })
      expect(btn.className).not.toContain('emoji-appear')
    })
  })
})
