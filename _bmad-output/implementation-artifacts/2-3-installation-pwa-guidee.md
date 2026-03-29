# Story 2.3 : Installation PWA guidée

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.3
**Story Key :** `2-3-installation-pwa-guidee`
**Status :** review
**Date :** 2026-03-29

---

## Story

As a parent,
I want installer l'app sur l'écran d'accueil de mon téléphone,
So that mon enfant puisse lancer l'app rapidement sans passer par un navigateur.

---

## Acceptance Criteria

**Scénario 1 — Instructions selon le navigateur**
**Given** la permission caméra accordée (Story 2.2) et l'onboarding en étape `'pwa'`
**When** l'écran `PwaStep` s'affiche
**Then** des instructions Add to Home Screen sont affichées selon le navigateur :
- iOS Safari : "Appuie sur Partage → Sur l'écran d'accueil"
- Android Chrome : bouton déclenche le prompt natif `BeforeInstallPromptEvent` si disponible ; sinon instructions manuelles menu → "Ajouter à l'écran d'accueil"

**Scénario 2 — Installation non bloquante**
**Given** l'écran `PwaStep` est affiché
**When** le parent appuie sur "Continuer sans installer"
**Then** le flux avance vers `/handoff` (Story 2.4) sans bloquer

**Scénario 3 — Installation Android Chrome (prompt natif)**
**Given** `BeforeInstallPromptEvent` a été capturé
**When** le parent appuie sur "Installer l'app"
**Then** `deferredPrompt.prompt()` est appelé
**And** le flux avance vers `/handoff` après la réponse de l'utilisateur (installé ou refusé)

**Scénario 4 — manifest.webmanifest valide**
**Given** l'app est servi par Vite avec `vite-plugin-pwa`
**Then** le manifest est configuré : `name: 'BrossQuest'`, `display: 'standalone'`, `orientation: 'portrait'`, icônes 192px et 512px ← **déjà en place dans `vite.config.ts`**

**Scénario 5 — App installée démarre en mode standalone**
**Given** l'app est installée sur l'écran d'accueil
**When** le parent la lance depuis l'écran d'accueil
**Then** l'app démarre sans barre de navigation navigateur (géré par `display: 'standalone'` déjà configuré)

**Scénario 6 — Navigation vers `/handoff` après l'étape PWA**
**Given** `PwaStep.onComplete()` est appelé
**When** `OnboardingPage` reçoit ce callback
**Then** l'app navigue vers `/handoff` via `router.navigate({ to: '/handoff' })`

---

## Tasks / Subtasks

- [x] T1 — Capturer `BeforeInstallPromptEvent` tôt dans le cycle de vie
  - [x] Créer `src/lib/sw/usePwaInstall.ts` — hook qui écoute `beforeinstallprompt` et stocke le `deferredPrompt` dans une ref de module
  - [x] Exposer `{ deferredPrompt, promptInstall }` depuis le hook

- [x] T2 — Créer `src/components/onboarding/PwaStep.tsx`
  - [x] Détecter iOS vs Android via `navigator.userAgent` (même pattern que `PermissionRecovery`)
  - [x] iOS : afficher les instructions manuelles (Partage → "Sur l'écran d'accueil")
  - [x] Android + deferredPrompt disponible : afficher bouton "Installer l'app" qui appelle `deferredPrompt.prompt()`
  - [x] Android sans deferredPrompt (déjà installé ou non supporté) : afficher instructions manuelles
  - [x] Toujours afficher le bouton "Continuer sans installer" → appelle `onComplete()`
  - [x] Après `promptInstall()` : appeler `onComplete()` quelle que soit la réponse (userChoice)
  - [x] Respecter `min-h-[56px]` sur les boutons, `max-w-[390px]`, design tokens onboarding parent

- [x] T3 — Créer `src/components/onboarding/PwaStep.test.tsx`
  - [x] Test : iOS → affiche les instructions iOS, pas de bouton "Installer l'app"
  - [x] Test : Android + deferredPrompt → affiche le bouton "Installer l'app"
  - [x] Test : Android sans deferredPrompt → affiche les instructions manuelles
  - [x] Test : clic "Continuer sans installer" → appelle `onComplete`
  - [x] Test : clic "Installer l'app" (Android) → `deferredPrompt.prompt()` appelé puis `onComplete`

- [x] T4 — Mettre à jour `src/routes/onboarding.route.tsx`
  - [x] Remplacer `<div>Étape PWA — Story 2.3</div>` par `<PwaStep onComplete={...} />`
  - [x] Dans `OnboardingPage`, quand `PwaStep.onComplete()` → `router.navigate({ to: '/handoff' })` (utiliser `useNavigate` de TanStack Router)
  - [x] Ajouter les tests `PwaStep` dans `onboarding.route.test.tsx` : placeholder PWA remplacé par le vrai composant

- [x] T5 — Corriger le guard de `src/routes/handoff.route.tsx`
  - [x] Remplacer `checkOnboardingComplete()` par une logique qui autorise l'accès si un profil existe avec `onboardingComplete === false` (post-stories 2.1–2.3, pré-story 2.4)
  - [x] Si aucun profil → redirect `/onboarding`
  - [x] Si profil existe et `onboardingComplete === true` → redirect `/home` (déjà complété)
  - [x] Si profil existe et `onboardingComplete === false` → autoriser (c'est l'étape handoff)
  - [x] Utiliser directement `getActiveProfile()` dans la route

- [x] T6 — Vérification
  - [x] `npm test` vert (tous les tests existants + nouveaux)
  - [x] `npm run build` sans erreur TypeScript strict

---

## Dev Notes

### Architecture des fichiers à modifier / créer

```
src/
├── components/
│   └── onboarding/
│       ├── PwaStep.tsx                 ← CRÉER
│       └── PwaStep.test.tsx            ← CRÉER
├── lib/
│   └── sw/
│       └── usePwaInstall.ts            ← CRÉER
└── routes/
    ├── onboarding.route.tsx            ← MODIFIER (remplacer placeholder + navigate)
    ├── onboarding.route.test.tsx       ← MODIFIER (ajouter tests PwaStep)
    └── handoff.route.tsx               ← MODIFIER (corriger guard)
```

**Aucun autre fichier à modifier** — `vite.config.ts` manifest déjà correct, `ProfileGuard.tsx` à étendre ou à lire dans la route directement.

---

### Manifest PWA — déjà configuré ✅

Le manifest dans `vite.config.ts` est déjà conforme aux critères d'acceptance :

```typescript
// vite.config.ts — VitePWA manifest déjà en place
manifest: {
  name: 'BrossQuest',
  short_name: 'BrossQuest',
  description: 'La quête du brossage pour les enfants',
  theme_color: '#1E2A3A',
  background_color: '#1E2A3A',
  display: 'standalone',       // ← écran d'accueil sans barre navigateur
  orientation: 'portrait',     // ← portrait uniquement
  start_url: '/BrossQuest/',
  scope: '/BrossQuest/',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
}
```

**Ne pas créer `public/manifest.webmanifest`** — il est généré par `vite-plugin-pwa` depuis `vite.config.ts`. Vite 7.3.1 + vite-plugin-pwa@1.2.0 (Vite 8 incompatible).

---

### Capture `BeforeInstallPromptEvent` — contrainte timing

L'événement `beforeinstallprompt` se déclenche tôt (souvent avant que `PwaStep` monte). Il faut l'intercepter au niveau module/app :

```typescript
// src/lib/sw/usePwaInstall.ts
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

// Listener global capturé une seule fois
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })
}

export function usePwaInstall() {
  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    return outcome
  }

  return {
    isPromptAvailable: deferredPrompt !== null,
    promptInstall,
  }
}
```

**Important :** `isPromptAvailable` est calculé au moment du render — pas réactif. Utiliser un `useState` si la réactivité est requise (voir implémentation ci-dessous).

---

### Implémentation `PwaStep.tsx`

```typescript
// src/components/onboarding/PwaStep.tsx
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
    await promptInstall() // accepted ou dismissed — les deux avancent
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
      {['Appuie sur le bouton Partage (⬆️) en bas de Safari', 'Descends et appuie sur "Sur l\'écran d\'accueil"', 'Appuie sur "Ajouter"'].map((step, i) => (
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
      {['Appuie sur le menu ⋮ en haut à droite de Chrome', 'Appuie sur "Ajouter à l\'écran d\'accueil"', 'Appuie sur "Ajouter"'].map((step, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className="text-accent-cyan font-bold min-w-[1.5rem]">{i + 1}.</span>
          <span className="text-sm text-[#EDF2F7]">{step}</span>
        </li>
      ))}
    </ol>
  )
}
```

---

### Mise à jour `OnboardingPage` — navigation vers `/handoff`

```typescript
// src/routes/onboarding.route.tsx — changes nécessaires

import { useNavigate } from '@tanstack/react-router'
import { PwaStep } from '../components/onboarding/PwaStep'

export function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('name')
  const navigate = useNavigate()
  const setProfile = useProfileStore(s => s.setProfile)

  // ... name et camera steps inchangés ...

  if (step === 'pwa') {
    return (
      <PwaStep onComplete={() => navigate({ to: '/handoff' })} />
    )
  }

  return null
}
```

**Supprimer** `return <div>Étape PWA — Story 2.3</div>` — remplacer par `<PwaStep onComplete={() => navigate({ to: '/handoff' })} />`.

---

### Correction guard `handoff.route.tsx` — ⚠️ CRITIQUE

Le guard actuel est un placeholder incorrect qui bloque toujours la navigation après l'étape PWA :

```typescript
// ❌ ACTUEL — bloque si onboardingComplete === false (ce qui est le cas à ce stade)
beforeLoad: async () => {
  const onboarded = await checkOnboardingComplete()
  if (!onboarded) throw redirect({ to: '/onboarding' })
}
```

**Logique correcte pour Story 2.3 :**

```typescript
// ✅ CORRECT — autoriser l'accès si profil existe mais onboarding pas encore terminé
import { getActiveProfile } from '../lib/db/queries'

beforeLoad: async () => {
  const profile = await getActiveProfile()
  if (!profile) throw redirect({ to: '/onboarding' })
  if (profile.onboardingComplete) throw redirect({ to: '/home' })
  // profile existe + onboardingComplete === false → autoriser (étape handoff normale)
}
```

**Pourquoi :** À ce stade (après Stories 2.1–2.3), un profil existe en base avec `onboardingComplete: false`. `onboardingComplete` sera mis à `true` par Story 2.4 après la sélection d'emoji. Le guard doit distinguer "aucun profil" (→ onboarding) de "profil incomplet" (→ handoff normal).

---

### Design tokens — Règle couleurs PwaStep

| Usage | Token | Valeur |
|---|---|---|
| Fond | `bg-bg-parent` | #2D3748 |
| Titre | `text-[#EDF2F7]` | blanc doux |
| Sous-titre / instructions | `text-[#A0AEC0]` | gris clair |
| Numéros étapes | `text-accent-cyan` | #76E4F7 |
| Bouton primaire (installer) | `bg-accent-cyan text-[#1E2A3A]` | — |
| Bouton secondaire (passer) | `border border-[#4A5568] text-[#A0AEC0]` | — |
| Bouton min height | `min-h-[56px]` | — |
| Conteneur max width | `max-w-[390px]` | — |

**Jamais de rouge** (`text-accent-erreur` #FC8181) — le skip PWA n'est pas une erreur.

---

### Pièges à éviter absolument

- ❌ **Ne pas créer `public/manifest.webmanifest`** — généré automatiquement par `vite-plugin-pwa` depuis `vite.config.ts`
- ❌ **Ne pas modifier `vite.config.ts`** — le manifest est déjà correct (display: standalone, orientation: portrait, icônes 192/512)
- ❌ **Ne pas oublier de corriger le guard de `handoff.route.tsx`** — sans ça, `navigate({ to: '/handoff' })` redirige en boucle vers `/onboarding`
- ❌ **Ne pas appeler `promptInstall()` sans vérifier `isPromptAvailable`** — l'événement `beforeinstallprompt` n'est pas dispo sur iOS Safari (jamais) ni si déjà installé
- ❌ **Ne pas bloquer le flux si l'utilisateur refuse l'installation** — l'installation est toujours optionnelle (bouton "Continuer sans installer" obligatoire)
- ❌ **Ne pas utiliser `useNavigate` sans l'importer** — TanStack Router : `import { useNavigate } from '@tanstack/react-router'`
- ❌ **Ne pas placer le listener `beforeinstallprompt` dans le composant** — il doit être capturé au niveau module (avant le rendu de `PwaStep`) pour ne pas manquer l'événement
- ❌ **Ne pas implémenter le contenu de `HandoffPage`** — c'est un placeholder Story 2.4, ne modifier que le guard `beforeLoad`

---

### Intelligence des stories précédentes

**De la Story 2.2 :**
- Pattern `PermissionRecovery` → `PwaStep` : même structure de détection OS via `navigator.userAgent`
- `detectOS()` est déjà dans `PermissionRecovery.tsx` — copier/adapter le même pattern
- Design tokens identiques : `bg-bg-parent`, `text-[#EDF2F7]`, `text-accent-cyan`, `bg-accent-cyan text-[#1E2A3A]`, `min-h-[56px]`, `max-w-[390px]`
- Named export obligatoire (pattern `CameraStep`, `NameStep`, `PermissionRecovery`)
- Tests co-localisés dans `onboarding.route.test.tsx` — ajouter les tests `PwaStep` dans ce fichier existant
- `useCameraStore(s => s.x)` pattern — appliquer de même à tout store utilisé ici

**De la Story 2.1 :**
- `useNavigate` de TanStack Router utilisé dans les guards — même import ici
- `basepath: '/BrossQuest/'` dans `router.ts` — `navigate({ to: '/handoff' })` sans inclure le basepath

**De l'Epic 1 :**
- `lib/sw/` dossier créé mais vide — `usePwaInstall.ts` y va (`src/lib/sw/`)
- TypeScript strict actif — typer `BeforeInstallPromptEvent` manuellement (pas dans lib.dom.d.ts)
- `vite-plugin-pwa@1.2.0` + Vite 7.3.1 (ne pas upgrader Vite vers v8 — incompatible)

---

### Contexte cross-story

- **Story 2.4** implémentera `HandoffPage` à `/handoff` (EmojiPicker) — ne toucher que le guard `beforeLoad`
- **Story 5.1** approfondira le Service Worker offline-first — `src/lib/sw/` sera enrichi dans cet epic
- **`PermissionRecovery`** et `PwaStep` partagent le même pattern OS detection — unifier si besoin en Story 5 (pas maintenant)

---

## Définition of Done

- [ ] `npm test` vert (tous les tests existants + nouveaux PwaStep)
- [ ] `npm run build` sans erreur TypeScript strict
- [ ] `PwaStep` remplace le placeholder dans `onboarding.route.tsx`
- [ ] `PwaStep` exporté en named export (pattern `NameStep`, `CameraStep`)
- [ ] `usePwaInstall.ts` créé dans `src/lib/sw/`
- [ ] Instructions iOS affichées sur iOS Safari
- [ ] Instructions ou bouton natif Android selon disponibilité de `beforeinstallprompt`
- [ ] Bouton "Continuer sans installer" toujours visible → avance vers `/handoff`
- [ ] `handoff.route.tsx` guard corrigé : profile existe + `onboardingComplete === false` → autoriser
- [ ] Navigation vers `/handoff` après `PwaStep.onComplete()`
- [ ] `BeforeInstallPromptEvent` typé manuellement (non présent dans lib.dom.d.ts)
- [ ] Aucune couleur `text-accent-erreur` dans `PwaStep`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_Aucun blocage rencontré._

### Completion Notes List

- `src/lib/sw/usePwaInstall.ts` créé avec listener module-level `beforeinstallprompt` + helper `_resetDeferredPromptForTests` pour l'isolation des tests
- `src/components/onboarding/PwaStep.tsx` créé : détection OS, instructions iOS/Android manuelles, bouton natif Android si `isPromptAvailable`, bouton "Continuer sans installer" toujours visible
- `src/components/onboarding/PwaStep.test.tsx` créé : 6 tests couvrant iOS, Android+prompt, Android sans prompt, skip, install+accept, install+dismiss
- `src/routes/onboarding.route.tsx` mis à jour : placeholder remplacé par `<PwaStep>`, `useNavigate` ajouté, 2 nouveaux tests dans `onboarding.route.test.tsx`
- `src/routes/handoff.route.tsx` guard corrigé : `checkOnboardingComplete` → `getActiveProfile` avec logique aucun profil/profil incomplet/profil complet
- 79/79 tests verts, build TypeScript strict sans erreur

### File List

- `src/lib/sw/usePwaInstall.ts` (créé)
- `src/components/onboarding/PwaStep.tsx` (créé)
- `src/components/onboarding/PwaStep.test.tsx` (créé)
- `src/routes/onboarding.route.tsx` (modifié)
- `src/routes/onboarding.route.test.tsx` (modifié)
- `src/routes/handoff.route.tsx` (modifié)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)
- `_bmad-output/implementation-artifacts/2-3-installation-pwa-guidee.md` (modifié)

---

## Change Log

- 2026-03-29 : Création story 2.3 — installation PWA guidée (SM Agent)
- 2026-03-29 : Implémentation complète — usePwaInstall, PwaStep, guard handoff corrigé, 79 tests verts (Dev Agent)
