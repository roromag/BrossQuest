let sessionAudioContext: AudioContext | null = null
let visibilityHandlerAttached = false

function getAudioContextCtor(): typeof AudioContext | null {
  const windowWithWebkit = window as Window & { webkitAudioContext?: typeof AudioContext }
  return window.AudioContext ?? windowWithWebkit.webkitAudioContext ?? null
}

export function ensureSessionAudioReady(): void {
  const AudioContextCtor = getAudioContextCtor()
  if (!AudioContextCtor) return

  if (!sessionAudioContext) {
    sessionAudioContext = new AudioContextCtor()
  }

  if (sessionAudioContext.state === 'suspended') {
    void sessionAudioContext.resume()
  }
}

export function setupSessionAudioVisibilityResume(): void {
  if (visibilityHandlerAttached) return

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    if (!sessionAudioContext) return
    if (sessionAudioContext.state === 'suspended') {
      void sessionAudioContext.resume()
    }
  })

  visibilityHandlerAttached = true
}

export function __resetSessionAudioForTests(): void {
  sessionAudioContext = null
  visibilityHandlerAttached = false
}
