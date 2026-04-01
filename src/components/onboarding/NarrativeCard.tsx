import type { ReactNode } from 'react'

interface NarrativeCardProps {
  episodeTitle: string
  children: ReactNode
}

export function NarrativeCard({ episodeTitle, children }: NarrativeCardProps) {
  return (
    <section
      aria-label="Carte narrative"
      className="atmospheric-stars relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-bg-session px-6 text-white"
    >
      <h1 className="mb-8 text-center text-2xl font-semibold">{episodeTitle}</h1>
      {children}
    </section>
  )
}
