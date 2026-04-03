import { afterEach, describe, expect, it, vi } from 'vitest'
import { speakPhaseBeforeNarration } from './phaseBeforeNarration'

describe('speakPhaseBeforeNarration', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('ne lève pas si speechSynthesis est absent', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(() => speakPhaseBeforeNarration('Léa')).not.toThrow()
  })

  it('appelle speak avec un utterance français et le prénom si fourni', () => {
    const speak = vi.fn()
    const utterances: SpeechSynthesisUtterance[] = []
    vi.stubGlobal('speechSynthesis', { speak } as Partial<SpeechSynthesis>)
    const Original = globalThis.SpeechSynthesisUtterance
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class MockUtterance {
        text = ''
        lang = ''
        constructor(text: string) {
          this.text = text
          utterances.push(this as unknown as SpeechSynthesisUtterance)
        }
      } as unknown as typeof SpeechSynthesisUtterance,
    )

    speakPhaseBeforeNarration('Léa')
    expect(speak).toHaveBeenCalledTimes(1)
    const u = utterances[0]!
    expect(u.text).toContain('Léa')
    expect(u.lang).toBe('fr-FR')

    vi.stubGlobal('SpeechSynthesisUtterance', Original)
  })

  it('utilise une phrase générique sans prénom', () => {
    const speak = vi.fn()
    const utterances: SpeechSynthesisUtterance[] = []
    vi.stubGlobal('speechSynthesis', { speak } as Partial<SpeechSynthesis>)
    const Original = globalThis.SpeechSynthesisUtterance
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class MockUtterance {
        text = ''
        lang = ''
        constructor(text: string) {
          this.text = text
          utterances.push(this as unknown as SpeechSynthesisUtterance)
        }
      } as unknown as typeof SpeechSynthesisUtterance,
    )

    speakPhaseBeforeNarration(null)
    expect(utterances[0]!.text).toMatch(/on se prépare à brosser/i)
    expect(utterances[0]!.text).not.toMatch(/,\s*,/)

    vi.stubGlobal('SpeechSynthesisUtterance', Original)
  })
})
