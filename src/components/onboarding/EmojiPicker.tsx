const EMOJIS = ['🦁', '🐻', '🐼', '🐨', '🦊', '🐯', '🐸', '🐶']

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  animated?: boolean
}

export function EmojiPicker({ onSelect, animated = false }: EmojiPickerProps) {
  const handleClick = (emoji: string) => {
    navigator.vibrate?.(10)
    onSelect(emoji)
  }

  return (
    <div className="grid grid-cols-4 gap-4" aria-label="Choisis ton emoji">
      {EMOJIS.map((emoji, index) => (
        <button
          key={emoji}
          type="button"
          aria-label={emoji}
          onClick={() => handleClick(emoji)}
          className={`
            flex items-center justify-center
            min-w-[56px] min-h-[56px]
            text-6xl
            rounded-2xl
            active:scale-95 transition-transform
            ${animated ? 'emoji-appear' : ''}
          `}
          style={animated ? { animationDelay: `${index * 50}ms` } : undefined}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
