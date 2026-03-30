import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners: Array<(available: boolean) => void> = []

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    listeners.forEach((cb) => cb(true))
  })
}

export function usePwaInstall() {
  const [isPromptAvailable, setIsPromptAvailable] = useState(deferredPrompt !== null)

  useEffect(() => {
    const cb = (available: boolean) => setIsPromptAvailable(available)
    listeners.push(cb)
    return () => {
      const idx = listeners.indexOf(cb)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  }, [])

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      return outcome
    } finally {
      deferredPrompt = null
      listeners.forEach((cb) => cb(false))
    }
  }

  return {
    isPromptAvailable,
    promptInstall,
  }
}

export function _resetDeferredPromptForTests(value: BeforeInstallPromptEvent | null = null) {
  deferredPrompt = value
  listeners.forEach((cb) => cb(value !== null))
}
