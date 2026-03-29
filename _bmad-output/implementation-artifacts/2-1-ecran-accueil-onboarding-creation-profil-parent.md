# Story 2.1 : Écran d'accueil onboarding & création de profil parent

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.1
**Story Key :** `2-1-ecran-accueil-onboarding-creation-profil-parent`
**Status :** review
**Date :** 2026-03-29

---

## Story

As a parent,
I want créer le profil de mon enfant en saisissant son prénom,
So that personnaliser l'expérience avant de passer la main à mon enfant.

---

## Acceptance Criteria

**Scénario 1 — Accueil onboarding au premier lancement**
**Given** un utilisateur ouvre l'app pour la première fois (IndexedDB vide)
**When** `ProfileGuard` détecte `onboardingComplete = false` (ou profil absent)
**Then** l'app redirige vers `/onboarding`
**And** l'écran affiche un champ de saisie pour le prénom avec un label fixe
**And** le fond est `#2D3748` (bg-parent), max-width 390px centré, une seule action principale

**Scénario 2 — Validation et sauvegarde du prénom**
**Given** le parent est sur l'écran de saisie du prénom
**When** le parent saisit un prénom valide et valide (bouton "Continuer")
**Then** un profil est créé dans IndexedDB (`profiles` table) avec `onboardingComplete = false` et `emoji = ''`
**And** `useProfileStore.setProfile(profile)` est appelé
**And** le flux avance vers l'étape 2 (permission caméra — placeholder pour story 2.2)

**Scénario 3 — Validation formulaire**
**Given** le champ prénom est vide
**When** le parent tente de valider (blur + submit)
**Then** le bouton "Continuer" est désactivé tant que le prénom est vide ou uniquement des espaces
**And** une erreur s'affiche après blur si le champ est vide

**Scénario 4 — Design tokens Tailwind v4 actifs**
**Given** le projet utilise Tailwind CSS v4 (`@tailwindcss/vite`)
**When** `npm run build` est exécuté
**Then** les tokens `@theme` dans `src/index.css` sont décommentés et actifs
**And** les classes utilitaires `bg-bg-parent`, `bg-bg-session`, `text-accent-cyan`, etc. sont disponibles

---

## Tasks / Subtasks

- [x] T1 — Activer les design tokens Tailwind v4
  - [x] Dans `src/index.css` : décommenter le bloc `@theme { ... }` (retirer le commentaire `/* ... */`)
  - [x] Vérifier que les classes `bg-bg-parent`, `text-accent-cyan` etc. compilent avec `npm run build`

- [x] T2 — Implémenter l'écran de saisie du prénom dans `src/routes/onboarding.route.tsx`
  - [x] Définir type `OnboardingStep = 'name' | 'camera' | 'pwa'` (structure multi-étapes pour stories 2.1–2.3)
  - [x] Implémenter `NameStep` : champ texte + label fixe + validation + bouton "Continuer"
  - [x] Implémenter `handleNameSubmit` : créer Profile, `saveProfile()`, `setProfile()`, passer à step 'camera'
  - [x] Implémenter `CameraStep` : placeholder `<div>Étape caméra — Story 2.2</div>` pour l'instant

- [x] T3 — Tests co-localisés `src/routes/onboarding.route.test.tsx`
  - [x] Test : rendu du champ prénom
  - [x] Test : bouton désactivé si prénom vide
  - [x] Test : appel `saveProfile` + `setProfile` + transition step au submit valide (mock queries)

- [x] T4 — Vérification
  - [x] `npm test` vert
  - [x] `npm run build` sans erreur TypeScript strict

### Review Follow-ups (AI)

- [x] [AI-Review][High] P1 — `saveProfile` avale les erreurs : rethrow dans `queries.ts` + try/catch dans `handleSubmit`
- [x] [AI-Review][High] P2 — `isSubmitting` jamais remis à `false` : ajouter `try/finally` dans `handleSubmit`
- [x] [AI-Review][High] P3 — Test manquant : asserter `mockSetProfile` appelé avec le bon profil
- [x] [AI-Review][Medium] P4 — Test manquant : transition `NameStep → CameraStep` dans `OnboardingPage`
- [x] [AI-Review][Low] P5 — Remplacer `fireEvent.click` par `userEvent.click` dans le test de soumission
- [x] [AI-Review][Low] P6 — Test manquant : soumission via Enter avec prénom tout-espaces

---

## Dev Notes

### ⚠️ CRITIQUE — Tokens Tailwind v4 dans `src/index.css`

Le fichier `src/index.css` contient un bloc `@theme` **commenté** avec ce commentaire : `/* Placeholder pour la structure — ne pas modifier avant Story 2.1 */`. Story 2.1 est le moment de l'activer.

**Action requise :** retirer le bloc `/* ... */` pour que le bloc devienne :

```css
@import "tailwindcss";

@theme {
  --color-bg-session: #1E2A3A;
  --color-bg-parent: #2D3748;
  --color-bg-surface: #3D4F63;
  --color-accent-cyan: #76E4F7;
  --color-accent-ambre: #F6AD55;
  --color-accent-erreur: #FC8181;
  --color-anim-avant: #48BB78;
  --color-anim-arriere: #2D6A4F;
  --color-anim-micro: #F6AD55;
}
```

**Classes Tailwind v4 résultantes :**

| Token CSS | Classes utilitaires disponibles |
|---|---|
| `--color-bg-parent` | `bg-bg-parent`, `text-bg-parent`, `border-bg-parent` |
| `--color-bg-session` | `bg-bg-session` |
| `--color-bg-surface` | `bg-bg-surface` |
| `--color-accent-cyan` | `bg-accent-cyan`, `text-accent-cyan`, `border-accent-cyan`, `ring-accent-cyan`, `focus:ring-accent-cyan` |
| `--color-accent-ambre` | `bg-accent-ambre`, `text-accent-ambre` |
| `--color-accent-erreur` | `text-accent-erreur` (usage parent uniquement — jamais côté enfant) |

---

### Structure multi-étapes de `/onboarding`

L'Epic 2 utilise **une seule route `/onboarding`** pour les stories 2.1, 2.2, et 2.3. L'état interne de la route gère la progression entre les étapes.

**Définir dès maintenant la structure de step pour éviter une refonte en 2.2 et 2.3 :**

```typescript
type OnboardingStep = 'name' | 'camera' | 'pwa'
```

- **Story 2.1 :** implémente `step === 'name'` (complètement) et `step === 'camera'` (placeholder)
- **Story 2.2 :** remplace le placeholder `'camera'` par l'implémentation réelle
- **Story 2.3 :** implémente `step === 'pwa'`

Ne pas aller plus loin que le placeholder camera dans cette story.

---

### Implémentation `src/routes/onboarding.route.tsx`

```typescript
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useState } from 'react'
import { saveProfile } from '../lib/db/queries'
import { useProfileStore } from '../stores/useProfileStore'
import type { Profile } from '../types/profile.types'

type OnboardingStep = 'name' | 'camera' | 'pwa'

function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('name')
  const setProfile = useProfileStore(s => s.setProfile)

  if (step === 'name') {
    return <NameStep onComplete={(profile) => { setProfile(profile); setStep('camera') }} />
  }

  if (step === 'camera') {
    return <div>Étape caméra — Story 2.2</div>
  }

  return null
}

interface NameStepProps {
  onComplete: (profile: Profile) => void
}

function NameStep({ onComplete }: NameStepProps) {
  const [firstName, setFirstName] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trimmed = firstName.trim()
  const isValid = trimmed.length > 0
  const showError = touched && !isValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    const profile: Profile = {
      id: crypto.randomUUID(),
      firstName: trimmed,
      emoji: '',                  // emoji défini en story 2.4 (handoff)
      createdAt: Date.now(),
      onboardingComplete: false,  // devient true en story 2.4 après sélection emoji
    }
    await saveProfile(profile)
    onComplete(profile)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <h1 className="text-2xl font-bold text-[#EDF2F7]">
          Créer le profil de ton aventurier
        </h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm font-medium text-[#A0AEC0]">
            Prénom de l'enfant
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={30}
            autoComplete="off"
            autoFocus
            className="
              w-full rounded-2xl px-4 py-3
              bg-bg-surface text-[#EDF2F7]
              border border-[#4A5568]
              focus:outline-none focus:ring-2 focus:ring-accent-cyan
              text-base min-h-[44px]
            "
          />
          {showError && (
            <p className="text-sm text-accent-erreur">
              Le prénom est requis
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="
            w-full rounded-3xl py-4
            bg-accent-cyan text-[#1E2A3A] font-semibold
            min-h-[56px] text-base
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-opacity
          "
        >
          Continuer
        </button>
      </div>
    </form>
  )
}

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})
```

**Points critiques :**
- `emoji: ''` à la création — rempli en story 2.4 via la route `/handoff`
- `onboardingComplete: false` — reste false jusqu'à la fin du handoff (story 2.4)
- `setProfile` appel **après** `saveProfile` (source de vérité = IndexedDB)
- `isSubmitting` évite le double-submit
- Sélecteur Zustand fin : `useProfileStore(s => s.setProfile)` — jamais `useProfileStore()`

---

### Tests `src/routes/onboarding.route.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock saveProfile pour éviter IndexedDB réel dans les tests unitaires
vi.mock('../lib/db/queries', () => ({
  saveProfile: vi.fn().mockResolvedValue(undefined),
}))

// Mock useProfileStore
const mockSetProfile = vi.fn()
vi.mock('../stores/useProfileStore', () => ({
  useProfileStore: vi.fn((selector: (s: { setProfile: typeof mockSetProfile }) => unknown) =>
    selector({ setProfile: mockSetProfile })
  ),
}))

// NOTE : importer le composant après les mocks
import { NameStep } from '../routes/onboarding.route' // voir note ci-dessous

describe('NameStep', () => {
  it('affiche le champ prénom', () => {
    render(<NameStep onComplete={vi.fn()} />)
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
  })

  it('bouton désactivé si prénom vide', () => {
    render(<NameStep onComplete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continuer/i })).toBeDisabled()
  })

  it('affiche l\'erreur après blur sans saisie', async () => {
    render(<NameStep onComplete={vi.fn()} />)
    const input = screen.getByLabelText(/prénom/i)
    fireEvent.blur(input)
    expect(await screen.findByText(/prénom est requis/i)).toBeInTheDocument()
  })

  it('appelle saveProfile + onComplete avec le profil correct', async () => {
    const { saveProfile } = await import('../lib/db/queries')
    const onComplete = vi.fn()
    render(<NameStep onComplete={onComplete} />)

    await userEvent.type(screen.getByLabelText(/prénom/i), 'Lucas')
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }))

    await waitFor(() => expect(saveProfile).toHaveBeenCalledOnce())

    const savedProfile = (saveProfile as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedProfile.firstName).toBe('Lucas')
    expect(savedProfile.emoji).toBe('')
    expect(savedProfile.onboardingComplete).toBe(false)
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
```

**⚠️ Note sur l'export `NameStep` :** Pour faciliter les tests unitaires, exporter `NameStep` en export nommé depuis le fichier route. La fonction `OnboardingPage` reste le composant par défaut de la route.

---

### ⚠️ `ProfileGuard` — vérification de l'état existant

Le guard `src/guards/ProfileGuard.tsx` expose `checkOnboardingComplete()` qui lit IndexedDB. Cette fonction est **déjà implémentée et opérationnelle** — ne pas la modifier.

Les routes qui appliquent ce guard (voir `src/routes/home.route.tsx`, `handoff.route.tsx`) sont en place depuis stories 1.2. Après la story 2.1, un utilisateur qui a complété le prénom (mais pas encore l'emoji) reste redirigé vers `/onboarding` par ce guard — comportement correct.

---

### Fichiers à modifier / créer

```
src/
├── index.css                           ← MODIFIER : décommenter @theme block
└── routes/
    ├── onboarding.route.tsx            ← MODIFIER : remplacer placeholder par implémentation
    └── onboarding.route.test.tsx       ← CRÉER : tests co-localisés (nouveau fichier)
```

**Aucun autre fichier à modifier** — stores, queries, types, guards, router.ts : tout est en place depuis l'Epic 1.

---

### Design — Référence visuelle

**Écran de saisie du prénom :**
- Fond : `bg-bg-parent` (#2D3748)
- Largeur max : `max-w-[390px]`, centré horizontalement + verticalement
- Padding horizontal : `px-6` (24px)
- Titre : `text-2xl font-bold text-[#EDF2F7]`
- Label : `text-sm font-medium text-[#A0AEC0]` (text-secondary)
- Input : `bg-bg-surface` (#3D4F63), bord subtil, `focus:ring-accent-cyan`, `min-h-[44px]`
- Erreur : `text-accent-erreur` (#FC8181) — acceptable ici car écran parent uniquement
- Bouton : `bg-accent-cyan text-[#1E2A3A]`, `min-h-[56px]`, `rounded-3xl`
- Une seule action principale par écran (bouton "Continuer")

**Police :** Inter variable (déjà chargée si ajoutée en Epic 1, sinon ajouter via Google Fonts CSS `@import` dans `index.css` ou `index.html`)

---

### Intelligence des stories précédentes

**De l'Epic 1 :**
- Le routing est en place avec `basepath: '/BrossQuest/'` dans `router.ts` — ne pas le modifier
- `ProfileGuard` → `checkOnboardingComplete()` → `getActiveProfile()` depuis queries.ts — opérationnel
- `useProfileStore` a `setProfile` et `setDbReady` — utiliser `setProfile` uniquement (pas `setDbReady` dans cette story)
- `saveProfile` dans queries.ts utilise `db.profiles.put(profile)` — `put()` fait insert-or-update par `id`
- TypeScript strict est activé — pas de `any`, pas de `!` non null assertion non justifiée
- Tests co-localisés avec Vitest + Testing Library + jsdom (configurés depuis story 1.1)

**Pièges évités :**
- ❌ Ne pas importer `db` directement dans le composant route — toujours passer par `queries.ts`
- ❌ Ne pas utiliser `localStorage` pour le profil — Dexie uniquement (règle absolue #6)
- ❌ Ne pas mettre `onboardingComplete: true` dans cette story — ce flag est mis à `true` dans story 2.4 seulement
- ❌ Ne pas implémenter la permission caméra ici — c'est story 2.2
- ❌ Ne pas utiliser `useProfileStore()` sans sélecteur — toujours `useProfileStore(s => s.x)`

---

## Définition of Done

- [x] `npm test` vert (tous les tests existants + nouveaux tests onboarding.route.test.tsx)
- [x] `npm run build` sans erreur TypeScript strict
- [x] Design tokens Tailwind v4 actifs dans `src/index.css`
- [x] L'écran de saisie du prénom s'affiche sur `/onboarding` avec le bon design
- [x] Le profil est sauvegardé en IndexedDB avec `onboardingComplete: false` et `emoji: ''`
- [x] Le flux avance vers un placeholder caméra après validation du prénom
- [x] Aucun import direct de Dexie dans le composant route
- [x] Sélecteurs Zustand fins dans tous les usages de stores

---

## Senior Developer Review (AI)

**Outcome :** Changes Requested
**Date :** 2026-03-29
**Action Items :** 6 total — 3 High, 1 Medium, 2 Low

- [x] [High] P1 — `saveProfile` avale les erreurs silencieusement : `onComplete` appelé même si la DB échoue
- [x] [High] P2 — `isSubmitting` jamais remis à `false` : bouton bloqué si erreur
- [x] [High] P3 — Test manquant : `mockSetProfile` jamais asserté (AC Scénario 2 non couvert)
- [x] [Medium] P4 — Test manquant : transition `NameStep → CameraStep` dans `OnboardingPage`
- [x] [Low] P5 — `fireEvent.click` au lieu de `userEvent.click` dans le test de soumission
- [x] [Low] P6 — Submit via Enter avec tout-espaces non testé

---

## Dev Agent Record

### Implementation Plan

1. Activation des tokens Tailwind v4 dans `src/index.css` (décommentage du bloc `@theme`)
2. Remplacement du placeholder `onboarding.route.tsx` par l'implémentation complète : `OnboardingPage` (multi-step), `NameStep` (export nommé pour tests), `CameraStep` (placeholder story 2.2)
3. Création des tests co-localisés `onboarding.route.test.tsx` avec mocks de `saveProfile` et `useProfileStore`

### Debug Log

Aucun blocage rencontré. Tous les fichiers nécessaires (queries, store, types, guards, router) étaient déjà en place depuis l'Epic 1.

### Completion Notes

- `src/index.css` : bloc `@theme` activé avec les 9 tokens design BrossQuest
- `src/routes/onboarding.route.tsx` : `NameStep` exporté en named export pour faciliter les tests unitaires ; `OnboardingPage` reste le composant route
- `src/routes/onboarding.route.test.tsx` : 5 tests couvrant rendu, validation, erreur blur, bouton actif, et soumission complète avec profil correct
- 61 tests passent (aucune régression), `npm run build` propre en TypeScript strict
- `emoji: ''` et `onboardingComplete: false` respectés — profil incomplet intentionnel jusqu'à story 2.4

**Correctifs review (2026-03-29) :**
- ✅ Résolu [High] P1 : `saveProfile` (queries.ts) relaie maintenant l'erreur (`throw e`) ; `handleSubmit` wrappé en `try/catch/finally` avec état `saveError`
- ✅ Résolu [High] P2 : `isSubmitting` remis à `false` dans le bloc `finally` — bouton récupérable après erreur
- ✅ Résolu [High] P3 : `mockSetProfile` asserté dans le test `OnboardingPage` (AC Scénario 2 couvert)
- ✅ Résolu [Medium] P4 : test `OnboardingPage` ajouté — vérifie transition vers l'étape caméra
- ✅ Résolu [Low] P5 : `fireEvent.click` → `userEvent.click` dans le test de soumission
- ✅ Résolu [Low] P6 : test "Enter avec tout-espaces" ajouté
- 64 tests passent (aucune régression)

---

## File List

- `src/index.css` (modifié)
- `src/routes/onboarding.route.tsx` (modifié)
- `src/routes/onboarding.route.test.tsx` (modifié)
- `src/lib/db/queries.ts` (modifié — rethrow saveProfile)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)
- `_bmad-output/implementation-artifacts/2-1-ecran-accueil-onboarding-creation-profil-parent.md` (modifié)

---

## Change Log

- 2026-03-29 : Implémentation story 2.1 — tokens Tailwind v4, écran onboarding prénom, tests (Dev Agent)
- 2026-03-29 : Adressé 6 findings de code review — gestion erreur DB, isSubmitting/finally, tests setProfile + transition + Enter (Dev Agent)
