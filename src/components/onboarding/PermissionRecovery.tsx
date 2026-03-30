interface PermissionRecoveryProps {
  onRetry: () => void
}

function detectOS(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

const INSTRUCTIONS = {
  ios: [
    'Ouvre "Réglages" sur ton iPhone',
    'Descends jusqu\'à Safari',
    'Appuie sur "Caméra" → sélectionne "Autoriser"',
    'Reviens sur cette page',
  ],
  android: [
    'Appuie sur l\'icône cadenas dans la barre d\'adresse',
    'Appuie sur "Autorisations"',
    'Active "Caméra"',
    'Recharge la page',
  ],
  other: [
    'Autorise la caméra dans les paramètres de ton navigateur',
    'Reviens sur cette page',
  ],
}

export function PermissionRecovery({ onRetry }: PermissionRecoveryProps) {
  const os = detectOS()
  const steps = INSTRUCTIONS[os]

  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#EDF2F7] mb-2">
            Accès à la caméra nécessaire
          </h1>
          <p className="text-sm text-accent-ambre">
            La caméra est requise pour détecter le brossage de ton enfant.
          </p>
        </div>

        <ol
          aria-label="Étapes pour autoriser l'accès à la caméra"
          className="list-none flex flex-col gap-3"
        >
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3 items-start">
              <span aria-hidden="true" className="text-accent-cyan font-bold min-w-[1.5rem]">{i + 1}.</span>
              <span className="text-sm text-[#EDF2F7]">{step}</span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onRetry}
          className="
            w-full rounded-3xl py-4
            bg-accent-cyan text-[#1E2A3A] font-semibold
            min-h-[56px] text-base
            hover:opacity-80 active:opacity-70
            transition-opacity
          "
        >
          J'ai autorisé
        </button>
      </div>
    </div>
  )
}
