interface PulseButtonProps {
  state: 'idle' | 'presence-detected'
  disabled?: boolean
  onClick?: () => void
}

export function PulseButton({ state, disabled = false, onClick }: PulseButtonProps) {
  const pulseClass = state === 'presence-detected' ? 'animate-pulse' : 'animate-[pulse_2.4s_ease-in-out_infinite]'

  return (
    <button
      type="button"
      aria-label="Lancer la session"
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex items-center justify-center rounded-full',
        'min-w-[120px] min-h-[120px] w-[140px] h-[140px]',
        'bg-accent-cyan text-bg-session font-bold text-lg shadow-lg',
        'transition-transform duration-200 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        pulseClass,
      ].join(' ')}
    >
      Go
    </button>
  )
}
