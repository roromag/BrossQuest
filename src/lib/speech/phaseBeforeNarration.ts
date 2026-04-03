/**
 * Narration placeholder phase Avant (Web Speech API, sans script éditorial final).
 * Dégradation silencieuse si `speechSynthesis` est indisponible ou en erreur.
 */
export function speakPhaseBeforeNarration(firstName?: string | null): void {
  if (typeof globalThis === 'undefined') return
  const synth = globalThis.speechSynthesis
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return

  try {
    const trimmed = firstName?.trim()
    const text = trimmed
      ? `Allons-y, ${trimmed}, on se prépare à brosser.`
      : 'Allons-y, on se prépare à brosser.'
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    synth.speak(utterance)
  } catch {
    // pas de message technique pour l’enfant
  }
}
