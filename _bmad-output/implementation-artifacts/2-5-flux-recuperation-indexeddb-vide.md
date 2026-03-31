# Story 2.5 : Flux de récupération IndexedDB vide

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.5
**Story Key :** `2-5-flux-recuperation-indexeddb-vide`
**Status :** review
**Date :** 2026-03-30

---

## Story

As a parent,
I want retrouver rapidement le profil de mon enfant si l'app a perdu ses données locales,
So that mon enfant ne voie jamais une expérience brisée.

---

## Acceptance Criteria

**Scénario 1 — Redirection automatique vers /recovery/profile**
**Given** iOS a vidé silencieusement IndexedDB (ou l'utilisateur a vidé le cache navigateur)
**When** l'app est lancée et `/home` est accédé avec IndexedDB vide (aucun profil en DB)
**Then** `checkProfileStatus()` retourne `'recovery'`
**And** la route `/home` redirige vers `/recovery/profile` (pas vers `/onboarding`)
**And** aucun écran d'erreur brut n'est exposé

**Scénario 2 — Flow de récupération rapide (< 1 minute)**
**Given** `/recovery/profile` est affiché
**When** le parent voit l'écran
**Then** un message bienveillant explique la situation (sans jargon technique)
**And** le parent peut re-saisir le prénom de l'enfant (champ texte simple)
**And** l'enfant peut choisir un emoji (réutilise `EmojiPicker` de Story 2.4)
**And** l'ensemble du flux prend < 1 minute

**Scénario 3 — Sauvegarde et reprise normale**
**Given** le parent a re-saisi le prénom et l'emoji sélectionné
**When** la sélection emoji est confirmée
**Then** `Profile.onboardingComplete = true` est sauvegardé via `saveProfile`
**And** `useProfileStore` est mis à jour via `setProfile`
**And** l'app redirige vers `/home` via `useNavigate`
**And** `checkProfileStatus()` retourne `'ok'` — l'app reprend normalement

**Scénario 4 — Distinction recovery vs onboarding en cours**
**Given** un profil existe avec `onboardingComplete = false` (parent interrompu en cours d'onboarding initial)
**When** `/home` est accédé
**Then** `checkProfileStatus()` retourne `'mid-onboarding'`
**And** la route `/home` redirige vers `/onboarding` (pas vers `/recovery/profile`)

**Scénario 5 — Guard /recovery/profile**
**Given** un profil complet existe (`onboardingComplete = true`)
**When** l'utilisateur navigue vers `/recovery/profile`
**Then** la route redirige vers `/home` (recovery inutile si profil intact)

---

## Tasks / Subtasks

- [x] T1 — Ajouter `checkProfileStatus()` dans `src/guards/ProfileGuard.tsx`
  - [x] Nouvelle fonction exportée : `checkProfileStatus(): Promise<ProfileStatus>`
  - [x] Nouveau type exporté : `export type ProfileStatus = 'ok' | 'recovery' | 'mid-onboarding'`
  - [x] Logique : pas de profil → `'recovery'` ; profil + `onboardingComplete=false` → `'mid-onboarding'` ; sinon → `'ok'`
  - [x] **Ne pas modifier** `checkOnboardingComplete()` existant — conserver pour rétrocompatibilité

- [x] T2 — Mettre à jour `src/guards/ProfileGuard.test.ts`
  - [x] Test : DB vide → `checkProfileStatus()` retourne `'recovery'`
  - [x] Test : profil + `onboardingComplete=false` → `'mid-onboarding'`
  - [x] Test : profil + `onboardingComplete=true` → `'ok'`
  - [x] **Ne pas toucher** aux tests `checkOnboardingComplete` existants

- [x] T3 — Mettre à jour `src/routes/home.route.tsx`
  - [x] Remplacer `checkOnboardingComplete()` par `checkProfileStatus()`
  - [x] Si `'recovery'` → `throw redirect({ to: '/recovery/profile' })`
  - [x] Si `'mid-onboarding'` → `throw redirect({ to: '/onboarding' })`
  - [x] Si `'ok'` → continuer (puis vérifier `CameraGuard`)

- [x] T4 — Implémenter `src/routes/recovery.profile.route.tsx`
  - [x] Guard `beforeLoad` : profil complet (`onboardingComplete=true`) → `throw redirect({ to: '/home' })`
  - [x] `RecoveryProfilePage` — state machine : `'name' | 'emoji'`
  - [x] Étape `'name'` : message bienveillant + champ prénom
  - [x] Étape `'emoji'` : `<EmojiPicker onSelect={handleEmojiSelect} />` (réutiliser Story 2.4)
  - [x] `handleEmojiSelect` : créer nouveau `Profile` (nouveau UUID, `onboardingComplete: true`) → `saveProfile` → `setProfileInStore` → `navigate({ to: '/home' })`
  - [x] Style : fond `bg-bg-parent` (parcours parent), pas `bg-bg-session`

- [x] T5 — Créer `src/routes/recovery.profile.route.test.tsx`
  - [x] Test : RecoveryProfilePage affiche l'étape 'name' en premier
  - [x] Test : soumission du prénom → passage à l'étape 'emoji'
  - [x] Test : sélection emoji → `saveProfile` appelé avec `onboardingComplete: true`
  - [x] Test : après emoji → navigation vers `/home`
  - [x] Test : `useProfileStore` mis à jour

- [x] T6 — Vérification
  - [x] `npm test` vert (tous les tests existants + nouveaux)
  - [x] `npm run build` sans erreur TypeScript strict

### Review Follow-ups (AI)

- [x] [AI-Review-F1] Guard `beforeLoad` de `/recovery/profile` : profil `mid-onboarding` → redirect `/onboarding`
  - Si `profile && !profile.onboardingComplete` → `throw redirect({ to: '/onboarding' })`
  - Test : profil `mid-onboarding` → redirect `/onboarding`
- [x] [AI-Review-F2+F3] Gestion erreur `saveProfile` + protection double-tap
  - Ajouter `saving` state (boolean) dans `RecoveryProfilePage`
  - Ajouter `saveError` state (boolean) dans `RecoveryProfilePage`
  - `handleEmojiSelect` : `if (saving) return` en tête, `setSaving(true)` avant l'`await`, try/catch autour du bloc save/navigate, `catch` → `setSaving(false)` + `setSaveError(true)`
  - Afficher message bienveillant si `saveError` (étape emoji)
  - Tests : erreur `saveProfile` → message affiché + pas de navigation ; double-tap → `saveProfile` appelé une seule fois
- [x] [AI-Review-F4] Tests pour le guard `beforeLoad` de `/recovery/profile` (Scénario 5)
  - Ajouter `describe('recoveryProfileRoute.beforeLoad', ...)` dans `recovery.profile.route.test.tsx`
  - Test : profil complet (`onboardingComplete: true`) → throw redirect vers `/home`
  - Test : pas de profil → résout sans redirect

---

## Dev Notes

### Architecture des fichiers à modifier / créer

```
src/
├── guards/
│   ├── ProfileGuard.tsx               ← MODIFIER (ajouter checkProfileStatus + ProfileStatus)
│   └── ProfileGuard.test.ts           ← MODIFIER (ajouter tests checkProfileStatus)
└── routes/
    ├── home.route.tsx                 ← MODIFIER (checkOnboardingComplete → checkProfileStatus)
    ├── recovery.profile.route.tsx     ← MODIFIER (remplacer placeholder + guard + UI)
    └── recovery.profile.route.test.tsx ← CRÉER
```

**`EmojiPicker` déjà créé par Story 2.4** — à importer depuis `src/components/onboarding/EmojiPicker.tsx`. Ne pas recréer.

---

### Ajout dans `ProfileGuard.tsx`

```typescript
// src/guards/ProfileGuard.tsx — AJOUTER à la fin du fichier existant

import { getActiveProfile } from '../lib/db/queries'  // déjà importé

export type ProfileStatus = 'ok' | 'recovery' | 'mid-onboarding'

export async function checkProfileStatus(): Promise<ProfileStatus> {
  const profile = await getActiveProfile()
  if (!profile) return 'recovery'
  if (!profile.onboardingComplete) return 'mid-onboarding'
  return 'ok'
}
```

**Important :** `checkOnboardingComplete()` existant reste inchangé — `home.route.tsx` est le seul appelant, et on le migre vers `checkProfileStatus()`. Les autres routes éventuelles qui utiliseraient `checkOnboardingComplete()` continuent de fonctionner.

---

### Mise à jour `home.route.tsx` — remplacement du guard

```typescript
// Remplacer :
import { checkOnboardingComplete } from '../guards/ProfileGuard'
// ...
const [onboarded, camPerm] = await Promise.all([checkOnboardingComplete(), checkCameraPermission()])
if (!onboarded) throw redirect({ to: '/onboarding' })

// Par :
import { checkProfileStatus } from '../guards/ProfileGuard'
// ...
const [profileStatus, camPerm] = await Promise.all([checkProfileStatus(), checkCameraPermission()])
if (profileStatus === 'recovery') throw redirect({ to: '/recovery/profile' })
if (profileStatus === 'mid-onboarding') throw redirect({ to: '/onboarding' })
```

**Changement minimal** — le reste de `home.route.tsx` (loader SessionPeriodGuard, CameraGuard) est inchangé.

---

### Implémentation `recovery.profile.route.tsx`

```typescript
// src/routes/recovery.profile.route.tsx
import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { rootRoute } from './__root'
import { getActiveProfile, saveProfile } from '../lib/db/queries'
import { useProfileStore } from '../stores/useProfileStore'
import { EmojiPicker } from '../components/onboarding/EmojiPicker'
import type { Profile } from '../types/profile.types'

type RecoveryStep = 'name' | 'emoji'

function RecoveryProfilePage() {
  const [step, setStep] = useState<RecoveryStep>('name')
  const [firstName, setFirstName] = useState('')
  const navigate = useNavigate()
  const setProfileInStore = useProfileStore(s => s.setProfile)

  const handleNameSubmit = (name: string) => {
    setFirstName(name.trim())
    setStep('emoji')
  }

  const handleEmojiSelect = async (emoji: string) => {
    const profile: Profile = {
      id: crypto.randomUUID(),
      firstName,
      emoji,
      createdAt: Date.now(),
      onboardingComplete: true,
    }
    await saveProfile(profile)
    setProfileInStore(profile)
    navigate({ to: '/home' })
  }

  if (step === 'emoji') {
    return (
      <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[390px] flex flex-col gap-10">
          <p className="text-lg font-semibold text-[#EDF2F7]">
            Choisis ton emoji, {firstName} !
          </p>
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      </div>
    )
  }

  return <RecoveryNameStep onComplete={handleNameSubmit} />
}

interface RecoveryNameStepProps {
  onComplete: (name: string) => void
}

function RecoveryNameStep({ onComplete }: RecoveryNameStepProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) onComplete(value.trim())
  }

  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#EDF2F7] mb-3">
            On repart de zéro !
          </h1>
          <p className="text-sm text-[#A0AEC0]">
            L&apos;app a perdu ses données. Pas d&apos;inquiétude — ça prend moins d&apos;une minute pour retrouver votre espace.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Prénom de l'enfant"
            maxLength={30}
            autoFocus
            className="
              w-full rounded-2xl px-4 py-3
              bg-[#3D4F63] text-[#EDF2F7]
              placeholder-[#718096]
              text-base outline-none
              focus:ring-2 focus:ring-accent-cyan
            "
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="
              w-full rounded-3xl py-4
              bg-accent-cyan text-[#1E2A3A] font-semibold
              min-h-[56px] text-base
              disabled:opacity-40 transition-opacity
            "
          >
            Continuer
          </button>
        </form>
      </div>
    </div>
  )
}

export const recoveryProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/profile',
  beforeLoad: async () => {
    const profile = await getActiveProfile()
    if (profile?.onboardingComplete) throw redirect({ to: '/home' })
    // Pas de profil ou profil incomplet → autoriser le flux de récupération
  },
  component: RecoveryProfilePage,
})
```

---

### Design tokens — RecoveryProfilePage

| Usage | Token | Valeur |
|---|---|---|
| Fond | `bg-bg-parent` | #2D3748 (parcours parent) |
| Titre | `text-[#EDF2F7]` | blanc doux |
| Texte explicatif | `text-[#A0AEC0]` | gris clair |
| Input fond | `bg-[#3D4F63]` | surface |
| Input focus ring | `focus:ring-accent-cyan` | #76E4F7 |
| Bouton primaire | `bg-accent-cyan text-[#1E2A3A]` | — |
| Bouton min height | `min-h-[56px]` | — |
| Conteneur max width | `max-w-[390px]` | — |

**Jamais de rouge** (`text-accent-erreur` #FC8181) — la perte de données n'est pas une faute de l'utilisateur.

---

### Pièges à éviter absolument

- ❌ **Ne pas modifier `checkOnboardingComplete()`** — fonction et tests existants doivent rester intacts
- ❌ **Ne pas recréer `EmojiPicker`** — l'importer depuis `src/components/onboarding/EmojiPicker` (créé en Story 2.4)
- ❌ **Ne pas utiliser `crypto.randomUUID()` sans vérification** — disponible dans tous les navigateurs modernes cibles (iOS Safari ≥ 15.4, Chrome ≥ 100), pas de polyfill nécessaire
- ❌ **Ne pas afficher de message d'erreur technique** — FR36 : message bienveillant, jamais de jargon (pas "IndexedDB vidée", pas "données corrompues")
- ❌ **Ne pas naviguer vers `/handoff`** après recovery — créer le profil directement avec `onboardingComplete: true`, naviguer vers `/home` (la permission caméra et la PWA sont déjà en place)
- ❌ **Ne pas omettre le guard `beforeLoad` sur `/recovery/profile`** — un utilisateur avec profil complet qui navigue directement → redirect `/home`
- ❌ **Ne pas oublier `setProfileInStore`** après `saveProfile` — le store doit être à jour avant la navigation
- ❌ **Ne pas modifier le loader ou le reste de `home.route.tsx`** — uniquement remplacer le guard `checkOnboardingComplete` par `checkProfileStatus`
- ❌ **Ne pas toucher `/onboarding` ou ses composants** — cette story ne modifie pas le flux d'onboarding initial

---

### Intelligence des stories précédentes

**De la Story 2.4 (EmojiPicker) :**
- `EmojiPicker` est prêt — import depuis `src/components/onboarding/EmojiPicker`
- Même pattern onSelect, même haptic feedback inclus

**De la Story 2.3 (PwaStep) :**
- Pattern `useNavigate` TanStack Router — `navigate({ to: '/home' })` sans basepath
- `useProfileStore(s => s.setProfile)` — sélecteur fin

**De la Story 2.1 (NameStep) :**
- `saveProfile` de `src/lib/db/queries` — même fonction pour persister
- Pattern formulaire : `e.preventDefault()`, `value.trim()`, `disabled={!value.trim()}`
- Style input : `bg-[#3D4F63]`, `text-[#EDF2F7]`, `placeholder-[#718096]`

**De l'Epic 1 :**
- TypeScript strict : typer explicitement `RecoveryStep`, `RecoveryNameStepProps`
- Tests co-localisés : `recovery.profile.route.test.tsx` dans `src/routes/`

---

### Contexte cross-story

- **Story 3.1** accèdera à `/home` — la correction du guard dans `home.route.tsx` ne casse pas Story 3.1 (la logique OK reste identique)
- **Story 5.1** étend le Service Worker — aucun impact sur cette story
- **`/recovery/camera`** (`recovery.camera.route.tsx`) suit un pattern similaire mais pour la permission caméra — ne pas confondre ou mélanger les deux flows

---

## Définition of Done

- [ ] `npm test` vert (tous les tests existants + nouveaux)
- [ ] `npm run build` sans erreur TypeScript strict
- [ ] `checkProfileStatus()` ajouté dans `ProfileGuard.tsx`, testé
- [ ] `checkOnboardingComplete()` toujours présent et tests inchangés
- [ ] `home.route.tsx` utilise `checkProfileStatus()` — redirect `/recovery/profile` si `'recovery'`
- [ ] `RecoveryProfilePage` : message bienveillant → name → emoji → save → `/home`
- [ ] `EmojiPicker` réutilisé (pas recréé)
- [ ] Nouveau profil créé avec `onboardingComplete: true`, UUID frais
- [ ] Guard `/recovery/profile` : profil complet → redirect `/home`
- [ ] Tests `recovery.profile.route.test.tsx` couvrant le flux complet

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Test `getByRole('grid')` échoué : `EmojiPicker` utilise un `div` avec `aria-label` sans rôle ARIA explicite → corrigé en `getByLabelText`.

### Completion Notes List

- `checkProfileStatus()` + `ProfileStatus` ajoutés dans `ProfileGuard.tsx` sans toucher `checkOnboardingComplete()`
- `home.route.tsx` migré vers `checkProfileStatus()` : 3 chemins (`recovery`, `mid-onboarding`, `ok`)
- `RecoveryProfilePage` implémentée : state machine `name → emoji`, `EmojiPicker` réutilisé, profil créé avec `onboardingComplete: true`, store mis à jour avant navigation vers `/home`
- Guard `beforeLoad` sur `/recovery/profile` : profil complet → redirect `/home`
- 5 nouveaux tests dans `recovery.profile.route.test.tsx` + 3 dans `ProfileGuard.test.ts`
- 108 tests passent, build TypeScript strict sans erreur
- ✅ Résolu review finding [CRITICAL/HIGH] F2+F3 : `saving` state + try/catch dans `handleEmojiSelect` — protection double-tap et gestion silencieuse des erreurs DB
- ✅ Résolu review finding [HIGH] F4 : tests `recoveryProfileRoute.beforeLoad` (Scénario 5 AC)
- 112 tests passent après corrections review

### File List

- `src/guards/ProfileGuard.tsx` (modifier)
- `src/guards/ProfileGuard.test.ts` (modifier)
- `src/routes/home.route.tsx` (modifier)
- `src/routes/recovery.profile.route.tsx` (modifier)
- `src/routes/recovery.profile.route.test.tsx` (créer)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (mettre à jour)
- `_bmad-output/implementation-artifacts/2-5-flux-recuperation-indexeddb-vide.md` (ce fichier)

---

## Change Log

- 2026-03-30 : Création story 2.5 — flux de récupération IndexedDB vide (SM Agent)
- 2026-03-30 : Implémentation story 2.5 — checkProfileStatus, RecoveryProfilePage, guard beforeLoad, 8 nouveaux tests (Dev Agent)
- 2026-03-31 : Corrections review — guard mid-onboarding, gestion erreur saveProfile, protection double-tap, tests guard beforeLoad — 4 findings résolus (Dev Agent)
