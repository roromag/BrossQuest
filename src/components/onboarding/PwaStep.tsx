import { useState } from 'react'
import { usePwaInstall } from '../../lib/sw/usePwaInstall'

interface PwaStepProps {
  onComplete: () => void
}

function detectOS(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

export function PwaStep({ onComplete }: PwaStepProps) {
  const { isPromptAvailable, promptInstall } = usePwaInstall()
  const [installing, setInstalling] = useState(false)
  const os = detectOS()

  const handleInstall = async () => {
    setInstalling(true)
    await promptInstall()
    setInstalling(false)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <h1 className="text-2xl font-bold text-[#EDF2F7]">
          Installer l&apos;app
        </h1>
        <p className="text-sm text-[#A0AEC0]">
          Installe BrossQuest sur l&apos;écran d&apos;accueil pour que ton enfant puisse la lancer facilement.
        </p>

        {os === 'ios' && <IosInstructions />}
        {os !== 'ios' && !isPromptAvailable && <AndroidManualInstructions />}

        {os !== 'ios' && isPromptAvailable && (
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            className="
              w-full rounded-3xl py-4
              bg-accent-cyan text-[#1E2A3A] font-semibold
              min-h-[56px] text-base
              disabled:opacity-40
              transition-opacity
            "
          >
            Installer l&apos;app
          </button>
        )}

        <button
          type="button"
          onClick={onComplete}
          className="
            w-full rounded-3xl py-4
            border border-[#4A5568] text-[#A0AEC0] font-semibold
            min-h-[56px] text-base
            transition-opacity
          "
        >
          Continuer sans installer
        </button>
      </div>
    </div>
  )
}

function IosInstructions() {
  return (
    <ol className="flex flex-col gap-3">
      {[
        'Appuie sur le bouton Partage (⬆️) en bas de Safari',
        'Descends et appuie sur "Sur l\'écran d\'accueil"',
        'Appuie sur "Ajouter"',
      ].map((step, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="text-accent-cyan font-bold min-w-[1.5rem]">{i + 1}.</span>
          <span className="text-sm text-[#EDF2F7]">{step}</span>
        </li>
      ))}
    </ol>
  )
}

function AndroidManualInstructions() {
  return (
    <ol className="flex flex-col gap-3">
      {[
        'Appuie sur le menu ⋮ en haut à droite de Chrome',
        'Appuie sur "Ajouter à l\'écran d\'accueil"',
        'Appuie sur "Ajouter"',
      ].map((step, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="text-accent-cyan font-bold min-w-[1.5rem]">{i + 1}.</span>
          <span className="text-sm text-[#EDF2F7]">{step}</span>
        </li>
      ))}
    </ol>
  )
}
