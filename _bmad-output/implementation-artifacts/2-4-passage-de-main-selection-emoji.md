# Story 2.4 : Passage de main — sélection emoji par l'enfant

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.4
**Story Key :** `2-4-passage-de-main-selection-emoji`
**Status :** review
**Date :** 2026-03-30

---

## Story

As a enfant,
I want choisir mon emoji parmi une sélection,
So that m'approprier l'app avant même le premier brossage.

---

## Acceptance Criteria

**Scénario 1 — EmojiPicker affiché sur /handoff**
**Given** l'onboarding parent complété (Stories 2.1–2.3) et la route `/handoff` affichée
**When** l'enfant voit l'écran
**Then** `EmojiPicker` affiche une grille 4×2 d'emojis, taille emoji 64px, zéro texte, cellules ≥ 56×56px

**Scénario 2 — Sélection emoji unique**
**Given** l'écran `/handoff` affiché avec `EmojiPicker`
**When** l'enfant appuie sur un emoji
**Then** la sélection est confirmée par un retour haptique si disponible (`navigator.vibrate(10)`)

**Scénario 3 — Sauvegarde et navigation**
**Given** l'enfant a sélectionné un emoji
**When** la sélection est confirmée
**Then** l'emoji est sauvegardé dans `profiles` (table Dexie) via `saveProfile`
**And** `Profile.onboardingComplete` est mis à `true` dans le même appel `saveProfile`
**And** le store Zustand `useProfileStore` est mis à jour via `setProfile`
**And** l'app redirige vers `/home` via `useNavigate` TanStack Router

**Scénario 4 — ProfileGuard ne bloque plus après ce point**
**Given** `Profile.onboardingComplete === true` (après Story 2.4)
**When** l'utilisateur accède à `/home`
**Then** `checkOnboardingComplete()` dans `ProfileGuard` retourne `true` → accès autorisé
**And** le guard de `/handoff` redirige vers `/home` (profile existe + onboardingComplete === true)

---

## Tasks / Subtasks

- [x] T1 — Créer `src/components/onboarding/EmojiPicker.tsx`
  - [x] Grille CSS 4×2 (4 colonnes × 2 lignes), aucune dépendance externe
  - [x] 8 emojis prédéfinis : `['🦁', '🐻', '🐼', '🐨', '🦊', '🐯', '🐸', '🐶']`
  - [x] Chaque cellule : `min-w-[56px] min-h-[56px]`, emoji `text-[64px]` ou `text-6xl`
  - [x] Zéro texte dans le composant — pictogrammes uniquement
  - [x] Au clic : `navigator.vibrate?.(10)` puis `onSelect(emoji)`
  - [x] Named export : `export function EmojiPicker`
  - [x] Props : `{ onSelect: (emoji: string) => void }`

- [x] T2 — Créer `src/components/onboarding/EmojiPicker.test.tsx`
  - [x] Test : 8 emojis rendus dans la grille
  - [x] Test : clic sur un emoji → `onSelect` appelé avec la bonne valeur
  - [x] Test : clic sur un autre emoji → `onSelect` appelé avec la nouvelle valeur

- [x] T3 — Mettre à jour `src/routes/handoff.route.tsx`
  - [x] Supprimer `<div>Passage de main — placeholder Story 2.4</div>`
  - [x] `HandoffPage` charge le profil depuis la DB via `useEffect` + `getActiveProfile()`
  - [x] Au `onSelect` : appeler `saveProfile({ ...profile, emoji, onboardingComplete: true })`
  - [x] Mettre à jour `useProfileStore` via `setProfile` après save
  - [x] Naviguer vers `/home` via `useNavigate` de TanStack Router
  - [x] Si profil non chargé encore (chargement async) → `return null` (guard garantit existence)

- [x] T4 — Créer `src/routes/handoff.route.test.tsx`
  - [x] Test : `HandoffPage` rend `EmojiPicker`
  - [x] Test : sélection emoji → `saveProfile` appelé avec `{ emoji, onboardingComplete: true }`
  - [x] Test : après sélection → navigation vers `/home`
  - [x] Test : `useProfileStore` mis à jour avec le profil final

- [x] T5 — Vérification
  - [x] `npm test` vert (tous les tests existants + nouveaux)
  - [x] `npm run build` sans erreur TypeScript strict

---

## Dev Notes

### Architecture des fichiers à modifier / créer

```
src/
├── components/
│   └── onboarding/
│       ├── EmojiPicker.tsx               ← CRÉER
│       └── EmojiPicker.test.tsx          ← CRÉER
└── routes/
    ├── handoff.route.tsx                 ← MODIFIER (remplacer placeholder + logique save)
    └── handoff.route.test.tsx            ← CRÉER
```

**Aucun autre fichier à modifier** — le guard `beforeLoad` dans `handoff.route.tsx` est déjà correct, `ProfileGuard.tsx` n'est pas à toucher.

---

### Implémentation `EmojiPicker.tsx`

```typescript
// src/components/onboarding/EmojiPicker.tsx

const EMOJIS = ['🦁', '🐻', '🐼', '🐨', '🦊', '🐯', '🐸', '🐶']

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const handleClick = (emoji: string) => {
    navigator.vibrate?.(10)
    onSelect(emoji)
  }

  return (
    <div
      className="grid grid-cols-4 gap-4"
      role="listbox"
      aria-label="Choisis ton emoji"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="option"
          aria-selected={false}
          onClick={() => handleClick(emoji)}
          className="
            flex items-center justify-center
            min-w-[56px] min-h-[56px]
            text-6xl
            rounded-2xl
            active:scale-95 transition-transform
          "
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
```

**Règles strictes :**
- `text-6xl` = 3.75rem ≈ 60px — proche des 64px requis, valeur Tailwind disponible
- Zéro texte dans le composant — uniquement des emojis
- `navigator.vibrate?.(10)` — opérateur optionnel (non supporté sur iOS Safari → silencieux)
- Named export (`export function EmojiPicker`) — pattern établi dans le projet (PwaStep, PermissionRecovery, etc.)
- `role="listbox"` + `role="option"` — accessibilité fonctionnelle (UX-DR11)

---

### Implémentation `HandoffPage` dans `handoff.route.tsx`

```typescript
// src/routes/handoff.route.tsx
import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { rootRoute } from './__root'
import { getActiveProfile, saveProfile } from '../lib/db/queries'
import { useProfileStore } from '../stores/useProfileStore'
import { EmojiPicker } from '../components/onboarding/EmojiPicker'
import type { Profile } from '../types/profile.types'

function HandoffPage() {
  const [profile, setLocalProfile] = useState<Profile | null>(null)
  const navigate = useNavigate()
  const setProfileInStore = useProfileStore(s => s.setProfile)

  useEffect(() => {
    getActiveProfile().then(p => setLocalProfile(p ?? null))
  }, [])

  const handleEmojiSelect = async (emoji: string) => {
    if (!profile) return
    const updated: Profile = { ...profile, emoji, onboardingComplete: true }
    await saveProfile(updated)
    setProfileInStore(updated)
    navigate({ to: '/home' })
  }

  if (!profile) return null // guard garantit que le profil existe en DB

  return (
    <div className="min-h-screen bg-bg-session flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <EmojiPicker onSelect={handleEmojiSelect} />
      </div>
    </div>
  )
}

export const handoffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/handoff',
  beforeLoad: async () => {
    const profile = await getActiveProfile()
    if (!profile) throw redirect({ to: '/onboarding' })
    if (profile.onboardingComplete) throw redirect({ to: '/home' })
    // profile existe + onboardingComplete === false → autoriser (étape handoff)
  },
  component: HandoffPage,
})
```

**Points clés :**
- `useNavigate` importé de `@tanstack/react-router` (jamais de `window.location`)
- `navigate({ to: '/home' })` sans basepath — TanStack Router ajoute `/BrossQuest/` automatiquement
- `setLocalProfile` (variable locale) ≠ `setProfileInStore` (Zustand) — ne pas confondre
- `bg-bg-session` (#1E2A3A) pour la route enfant `/handoff` — fond session (première action enfant)
- `if (!profile) return null` — le guard garantit l'existence, `null` = chargement async en cours

---

### Design tokens — HandoffPage

| Usage | Token | Valeur |
|---|---|---|
| Fond écran enfant | `bg-bg-session` | #1E2A3A |
| Conteneur max width | `max-w-[390px]` | — |
| Cellules emoji min size | `min-w-[56px] min-h-[56px]` | — |
| Taille emoji | `text-6xl` | ~60px |
| Transition tap | `active:scale-95 transition-transform` | retour tactile visuel |

**Règle couleur :** `/handoff` = espace enfant → fond `bg-bg-session` (#1E2A3A), pas `bg-bg-parent` (#2D3748)

---

### Logique de sauvegarde — Séquence obligatoire

```
1. saveProfile({ ...profile, emoji, onboardingComplete: true })  ← DB d'abord
2. setProfileInStore(updated)                                     ← store ensuite
3. navigate({ to: '/home' })                                      ← navigation en dernier
```

**Pourquoi cet ordre :** si la navigation précède le save DB, un rechargement de page perdrait les données. Le store Zustand est en mémoire — toujours persister en DB avant de naviguer.

---

### Pièges à éviter absolument

- ❌ **Ne pas oublier `setProfileInStore`** — après saveProfile DB, le store doit être à jour pour que `checkOnboardingComplete()` dans ProfileGuard le trouve
- ❌ **Ne pas naviguer avant `saveProfile` complet** — attendre la résolution de la Promise (`await saveProfile(...)`)
- ❌ **Ne pas utiliser `bg-bg-parent` sur HandoffPage** — c'est l'espace enfant, fond `bg-bg-session`
- ❌ **Ne pas ajouter de texte dans EmojiPicker** — `zéro texte` est une exigence UX-DR4 stricte
- ❌ **Ne pas utiliser `navigator.vibrate(10)` sans l'opérateur optionnel `?.`** — iOS Safari ne supporte pas `vibrate` → crash sans `?.`
- ❌ **Ne pas créer de state "emoji sélectionné" dans EmojiPicker** — sélection immédiate → navigation, pas besoin d'état de sélection
- ❌ **Ne pas modifier le guard `beforeLoad` existant** — il est déjà correct depuis Story 2.3
- ❌ **Ne pas implémenter le contenu de HandoffPage au-delà de l'EmojiPicker** — pas de titre/sous-titre non spécifié, pas de décoration, strictement le composant EmojiPicker
- ❌ **Ne pas utiliser `localStorage` pour stocker l'emoji** — Dexie uniquement (règle absolue architecture)
- ❌ **Ne pas importer directement depuis `@mediapipe/tasks-vision`** — aucune dépendance ML dans cette story

---

### Intelligence des stories précédentes

**De la Story 2.3 (PwaStep) :**
- Pattern export nommé : `export function EmojiPicker` (jamais `export default`)
- Tests co-localisés : `EmojiPicker.test.tsx` à côté de `EmojiPicker.tsx`
- `useNavigate` de TanStack Router — même import ici
- `navigate({ to: '/home' })` — sans basepath, TanStack Router gère `/BrossQuest/`
- `useProfileStore(s => s.x)` — sélecteurs fins, jamais `useProfileStore()`

**De la Story 2.2 (CameraStep) :**
- Pattern `navigator.permissions.query` similaire à `navigator.vibrate?.()` — APIs optionnelles toujours avec `?.`

**De la Story 2.1 (NameStep) :**
- `saveProfile` persiste en DB Dexie — même fonction à réutiliser ici (ne pas recréer)
- `setProfile` dans `useProfileStore` — mettre à jour après chaque write DB
- Profil créé avec `onboardingComplete: false` en Story 2.1 — Story 2.4 le passe à `true`

**De l'Epic 1 :**
- TypeScript strict actif — typer `Profile` avec l'interface existante de `src/types/profile.types.ts`
- Import de `getActiveProfile` et `saveProfile` depuis `src/lib/db/queries.ts` (ne pas recréer)

---

### Contexte cross-story

- **Story 2.5** implémentera le flux de récupération IndexedDB vide (`/recovery/profile`) — ne pas anticiper
- **Story 3.1** utilisera `/home` avec `NarrativeCard` + `PulseButton` — `HandoffPage` ne doit rien implémenter de `/home`
- **ProfileGuard** (`src/guards/ProfileGuard.tsx`) vérifie `onboardingComplete === true` via `checkOnboardingComplete()` — après Story 2.4, ce guard laisse passer l'accès à `/home`

---

## Définition of Done

- [x] `npm test` vert (tous les tests existants + nouveaux EmojiPicker + HandoffPage)
- [x] `npm run build` sans erreur TypeScript strict
- [x] `EmojiPicker` créé dans `src/components/onboarding/` avec named export
- [x] 8 emojis affichés en grille 4×2, cellules ≥ 56×56px, aucun texte
- [x] Retour haptique via `navigator.vibrate?.(10)` au clic (silencieux sur iOS)
- [x] Sélection emoji → `saveProfile` avec `emoji` + `onboardingComplete: true`
- [x] `useProfileStore.setProfile` mis à jour après saveProfile
- [x] Navigation vers `/home` après sélection
- [x] `handoff.route.tsx` : placeholder supprimé, `HandoffPage` fonctionnel
- [x] `handoff.route.test.tsx` créé avec tests couvrant le flux complet

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage rencontré. Implémentation directe conforme aux specs de la story.

### Completion Notes List

- `EmojiPicker.tsx` créé avec grille 4×2, 8 emojis, `navigator.vibrate?.(10)`, named export, zéro texte
- `EmojiPicker.test.tsx` créé : 3 tests (rendu des 8 emojis, clic sur emoji 1, clic sur emoji 2)
- `handoff.route.tsx` mis à jour : placeholder supprimé, `HandoffPage` fonctionnel avec `useEffect` + `getActiveProfile()`, `saveProfile`, `setProfileInStore`, `navigate({ to: '/home' })`
- `handoff.route.test.tsx` créé : 4 tests couvrant le flux complet (rendu EmojiPicker, saveProfile, navigation, store)
- `HandoffPage` exportée nommément pour les tests
- 96 tests verts, build TypeScript propre

**Corrections post-review (2026-03-30) :**
- B1 — ARIA : supprimé `role="listbox"` / `role="option"` / `aria-selected={false}` ; boutons avec `aria-label={emoji}` (sémantique native `<button>`)
- P1 — `handleEmojiSelect` : ajout `try/catch` — saveProfile rejection silencieusement absorbée, navigation et store non appelés
- P2 — Double-clic : ajout state `isSaving`, guard `if (!profile || isSaving) return` avant save
- P3 — `useEffect` : ajout flag `cancelled` pour éviter setState sur composant démonté
- P4 — Test ajouté : `getActiveProfile()` retourne undefined → rendu null (aucun bouton)
- P5 — Test ajouté : `saveProfile()` rejette → `navigate` non appelé, store non mis à jour
- P6 — Test ajouté : `navigator.vibrate(10)` appelé au clic
- 99 tests verts, build TypeScript propre

### File List

- `src/components/onboarding/EmojiPicker.tsx` (créé)
- `src/components/onboarding/EmojiPicker.test.tsx` (créé)
- `src/routes/handoff.route.tsx` (modifié)
- `src/routes/handoff.route.test.tsx` (créé)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (mis à jour)
- `_bmad-output/implementation-artifacts/2-4-passage-de-main-selection-emoji.md` (ce fichier)

---

## Change Log

- 2026-03-30 : Création story 2.4 — passage de main, sélection emoji (SM Agent)
- 2026-03-30 : Implémentation story 2.4 — EmojiPicker + HandoffPage + tests (Dev Agent)
- 2026-03-30 : Corrections post-review — B1 ARIA, P1 try/catch, P2 isSaving, P3 useEffect cleanup, P4-P6 tests manquants (Dev Agent)
