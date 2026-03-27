# Story 1.2 : Architecture routing, guards & structure dossiers

**Epic :** 1 — Fondation technique & Spike MediaPipe
**Story ID :** 1.2
**Story Key :** `1-2-architecture-routing-guards-structure-dossiers`
**Status :** review
**Date :** 2026-03-27

---

## Story

As a développeur,
I want mettre en place la structure de routing TanStack Router avec les guards de navigation,
So that avoir les frontières parent/enfant et les routes de récupération en place avant tout développement fonctionnel.

---

## Acceptance Criteria

**Scénario 1 — 7 routes enregistrées**
**Given** le projet initialisé (Story 1.1)
**When** l'app est lancée
**Then** les 7 routes sont enregistrées : `/onboarding`, `/handoff`, `/home`, `/session`, `/parent`, `/recovery/camera`, `/recovery/profile`

**Scénario 2 — ProfileGuard**
**Given** l'app démarre et IndexedDB est vide (ou `Profile.onboardingComplete = false`)
**When** l'utilisateur accède à `/home`, `/session`, `/handoff`, ou `/parent`
**Then** `ProfileGuard` redirige vers `/onboarding`

**Scénario 3 — CameraGuard**
**Given** la permission caméra est absente ou révoquée
**When** l'utilisateur accède à `/home` ou `/session`
**Then** `CameraGuard` redirige vers `/recovery/camera`

**Scénario 4 — SessionPeriodGuard**
**Given** une session complète existe pour la période courante dans IndexedDB
**When** l'utilisateur accède à `/home`
**Then** la route retourne `{ isRestMode: true, period }` via son loader (composant placeholder affichera "repos" ou "actif")

**Scénario 5 — Structure dossiers complète**
**Given** le projet
**When** on inspecte `src/`
**Then** `src/routes/`, `src/guards/`, `src/components/`, `src/stores/`, `src/lib/`, `src/constants/`, `src/types/` existent et les fichiers de cette story y sont créés conformément à l'architecture

---

## Tasks / Subtasks

- [x] T1 — Types TypeScript partiels (AC: #5)
  - [x] Créer `src/types/profile.types.ts` — interface `Profile`
  - [x] Créer `src/types/session.types.ts` — types `SessionPhase`, `SessionStatus`, `SessionPeriod`, interface `SessionHistoryEntry`

- [x] T2 — Helpers guards IndexedDB bruts (AC: #2, #3, #4)
  - [x] Créer `src/guards/ProfileGuard.tsx` — fn `checkOnboardingComplete(): Promise<boolean>` via raw `indexedDB` API
  - [x] Créer `src/guards/CameraGuard.tsx` — fn `checkCameraPermission(): Promise<PermissionState>` via `navigator.permissions`
  - [x] Créer `src/guards/SessionPeriodGuard.tsx` — fn `getCompletedSessionForCurrentPeriod(): Promise<{period: SessionPeriod} | null>` via raw `indexedDB`

- [x] T3 — Composants routes placeholder (AC: #1)
  - [x] `src/routes/__root.tsx` — layout racine + Error Boundary global
  - [x] `src/routes/onboarding.route.tsx` — placeholder `<div>Onboarding</div>`
  - [x] `src/routes/handoff.route.tsx` — placeholder
  - [x] `src/routes/home.route.tsx` — placeholder (lire `isRestMode` du loader)
  - [x] `src/routes/session.route.tsx` — placeholder
  - [x] `src/routes/parent.route.tsx` — placeholder
  - [x] `src/routes/recovery.camera.route.tsx` — placeholder
  - [x] `src/routes/recovery.profile.route.tsx` — placeholder

- [x] T4 — Router principal (AC: #1, #2, #3, #4)
  - [x] Créer `src/router.ts` — `createRouter` + arbre de routes + `declare module` TypeScript
  - [x] Modifier `src/main.tsx` — remplacer `<App />` par `<RouterProvider router={router} />`
  - [x] Supprimer ou vider `src/App.tsx` (renommer optionnel, mais enlever le composant obsolète)

- [x] T5 — Tests (AC: #2, #3, #4)
  - [x] `src/guards/ProfileGuard.test.ts` — tester `checkOnboardingComplete` avec `fake-indexeddb`
  - [x] `src/guards/CameraGuard.test.ts` — tester `checkCameraPermission` avec mock `navigator.permissions`
  - [x] `src/guards/SessionPeriodGuard.test.ts` — tester `getCompletedSessionForCurrentPeriod` avec `fake-indexeddb`

- [x] T6 — Vérification build + tests (AC: tous)
  - [x] `npm run build` sans erreur TypeScript strict
  - [x] `npm test` vert (nouveaux tests + smoke test existant)

---

## Dev Notes

### Stack installée (Story 1.1 — NE PAS réinstaller)

| Package | Version | Usage |
|---|---|---|
| `@tanstack/react-router` | 1.168.3 | Routing code-based |
| `dexie` | 4.3.0 | **Pas encore utilisé — Story 1.3** |
| `zustand` | 5.0.12 | **Pas encore utilisé — Story 1.3** |
| `vite` | 7.3.1 | Bundler |

### TanStack Router — Approche code-based (PAS file-based)

**Ne pas installer `@tanstack/router-plugin/vite`** — on utilise le routing code-based, pas le générateur de fichiers.

La base de `vite.config.ts` reste inchangée (pas de plugin TanStack à ajouter).

### Structure des fichiers de routes

Les fichiers `.route.tsx` exportent le composant de page et la définition de route :

```typescript
// src/routes/onboarding.route.tsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

function OnboardingPage() {
  return <div>Onboarding — placeholder Story 2.1</div>
}

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
})
```

### `__root.tsx` — Layout + Error Boundary global

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Component, ErrorInfo, ReactNode } from 'react'

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[GlobalErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) {
      // Redirige vers /recovery/profile — jamais d'erreur technique brute
      window.location.replace('/BrossQuest/recovery/profile')
      return null
    }
    return this.props.children
  }
}

function RootLayout() {
  return (
    <GlobalErrorBoundary>
      <Outlet />
    </GlobalErrorBoundary>
  )
}

export const rootRoute = createRootRoute({
  component: RootLayout,
})
```

**⚠️ `window.location.replace` dans le Error Boundary** : on ne peut pas utiliser `throw redirect()` dans un Error Boundary React classique. Pour Story 1.2, ce comportement est acceptable. Story 3 ou 5 pourra migrer vers `router.navigate`.

### Guards — Implémentation raw IndexedDB (TEMPORAIRE Story 1.2)

**⚠️ IMPORTANT :** ces fonctions utilisent l'API `indexedDB` brute car Dexie n'est pas encore configuré (Story 1.3). Story 1.3 créera `src/lib/db/queries.ts` et ces guards seront mis à jour pour appeler `getActiveProfile()` et `getCompletedSessionForPeriod()`.

#### ProfileGuard.tsx

```typescript
// src/guards/ProfileGuard.tsx
export async function checkOnboardingComplete(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open('brossquest')
    request.onupgradeneeded = () => {
      // DB n'existe pas encore → pas onboardé
      request.result.close()
      resolve(false)
    }
    request.onerror = () => resolve(false)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('profiles')) {
        db.close()
        resolve(false)
        return
      }
      const tx = db.transaction('profiles', 'readonly')
      const getAllReq = tx.objectStore('profiles').getAll()
      getAllReq.onsuccess = () => {
        db.close()
        const profiles = getAllReq.result as Array<{ onboardingComplete?: boolean }>
        resolve(profiles.some(p => p.onboardingComplete === true))
      }
      getAllReq.onerror = () => { db.close(); resolve(false) }
    }
  })
}
```

#### CameraGuard.tsx

```typescript
// src/guards/CameraGuard.tsx
export async function checkCameraPermission(): Promise<PermissionState> {
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return result.state
  } catch {
    // navigator.permissions non supporté ou 'camera' non reconnu
    // → on laisse passer (getUserMedia validera au moment du tap)
    return 'prompt'
  }
}
```

**Comportement attendu :**
- `'granted'` → continuer
- `'denied'` → `throw redirect({ to: '/recovery/camera' })`
- `'prompt'` → continuer (la demande sera faite au tap session en Story 3.2)

#### SessionPeriodGuard.tsx

```typescript
// src/guards/SessionPeriodGuard.tsx
import type { SessionPeriod } from '../types/session.types'

export function getCurrentPeriod(): SessionPeriod {
  return new Date().getHours() >= 17 ? 'evening' : 'morning'
}

export async function getCompletedSessionForCurrentPeriod(): Promise<{ period: SessionPeriod } | null> {
  const period = getCurrentPeriod()
  const todayStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  ).getTime()

  return new Promise((resolve) => {
    const request = indexedDB.open('brossquest')
    request.onupgradeneeded = () => { request.result.close(); resolve(null) }
    request.onerror = () => resolve(null)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('sessionHistory')) {
        db.close()
        resolve(null)
        return
      }
      const tx = db.transaction('sessionHistory', 'readonly')
      const getAllReq = tx.objectStore('sessionHistory').getAll()
      getAllReq.onsuccess = () => {
        db.close()
        const sessions = getAllReq.result as Array<{
          period?: string; date?: number; status?: string
        }>
        const found = sessions.some(s =>
          s.period === period &&
          s.status === 'completed' &&
          typeof s.date === 'number' &&
          s.date >= todayStart
        )
        resolve(found ? { period } : null)
      }
      getAllReq.onerror = () => { db.close(); resolve(null) }
    }
  })
}
```

### router.ts — Arbre de routes complet

```typescript
// src/router.ts
import { createRouter, redirect } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { onboardingRoute } from './routes/onboarding.route'
import { handoffRoute } from './routes/handoff.route'
import { homeRoute } from './routes/home.route'
import { sessionRoute } from './routes/session.route'
import { parentRoute } from './routes/parent.route'
import { recoveryCameraRoute } from './routes/recovery.camera.route'
import { recoveryProfileRoute } from './routes/recovery.profile.route'

// Routes protégées par ProfileGuard (onboarding requis)
// → home, session, handoff, parent
// Routes protégées par CameraGuard (permission caméra)
// → home, session
// NB: les guards sont définis dans beforeLoad de chaque route (voir fichiers .route.tsx)

const routeTree = rootRoute.addChildren([
  onboardingRoute,
  handoffRoute,
  homeRoute,
  sessionRoute,
  parentRoute,
  recoveryCameraRoute,
  recoveryProfileRoute,
])

export const router = createRouter({
  routeTree,
  basepath: '/BrossQuest',   // ⚠️ même valeur que vite.config.ts `base`
})

// Enregistrement TypeScript global — nécessaire pour les hooks typés
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

**⚠️ `basepath: '/BrossQuest'`** : doit correspondre exactement à `base: '/BrossQuest/'` dans `vite.config.ts`. Casse identique.

### home.route.tsx — Loader pour SessionPeriodGuard

```typescript
// src/routes/home.route.tsx
import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { checkOnboardingComplete } from '../guards/ProfileGuard'
import { checkCameraPermission } from '../guards/CameraGuard'
import { getCompletedSessionForCurrentPeriod } from '../guards/SessionPeriodGuard'

function HomePage() {
  const { isRestMode, period } = homeRoute.useLoaderData()
  if (isRestMode) {
    const msg = period === 'morning' ? 'À ce soir ✨' : 'À demain ✨'
    return <div>Mode repos — {msg} — placeholder Story 3.1</div>
  }
  return <div>Accueil — placeholder Story 3.1</div>
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: async () => {
    const onboarded = await checkOnboardingComplete()
    if (!onboarded) throw redirect({ to: '/onboarding' })
    const camPerm = await checkCameraPermission()
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  loader: async () => {
    const restSession = await getCompletedSessionForCurrentPeriod()
    return {
      isRestMode: restSession !== null,
      period: restSession?.period ?? 'morning',
    }
  },
  component: HomePage,
})
```

### session.route.tsx — Guards ProfileGuard + CameraGuard

```typescript
// src/routes/session.route.tsx
export const sessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session',
  beforeLoad: async () => {
    const onboarded = await checkOnboardingComplete()
    if (!onboarded) throw redirect({ to: '/onboarding' })
    const camPerm = await checkCameraPermission()
    if (camPerm === 'denied') throw redirect({ to: '/recovery/camera' })
  },
  component: () => <div>Session — placeholder Story 3.2</div>,
})
```

### main.tsx — Remplacer App par RouterProvider

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

`src/App.tsx` peut être supprimé ou vidé (le smoke test `App.test.tsx` devra être mis à jour).

### Types TypeScript à créer

```typescript
// src/types/profile.types.ts
export interface Profile {
  id: string           // crypto.randomUUID()
  firstName: string
  emoji: string
  createdAt: number    // Date.now()
  onboardingComplete: boolean
}
```

```typescript
// src/types/session.types.ts
export type SessionPhase = 'before' | 'during' | 'after'
export type SessionStatus = 'in_progress' | 'completed' | 'interrupted'
export type SessionPeriod = 'morning' | 'evening'

export interface SessionHistoryEntry {
  id: string
  episodeId: string
  date: number          // Date.now()
  period: SessionPeriod
  totalDuration: number  // secondes
  totalPauseTime: number // secondes
  zonesCompleted: number
  status: SessionStatus
}
```

**⚠️ Ces types seront utilisés par Dexie en Story 1.3** — ne pas les modifier lors de Story 1.3, juste les importer.

### Tests — Dépendance fake-indexeddb à installer

```bash
npm install -D fake-indexeddb
```

Pattern de test pour les guards :

```typescript
// src/guards/ProfileGuard.test.ts
import 'fake-indexeddb/auto'  // ← remplace globalement indexedDB par fake
import { checkOnboardingComplete } from './ProfileGuard'

describe('checkOnboardingComplete', () => {
  beforeEach(() => {
    // Reset DB entre tests
    indexedDB.deleteDatabase('brossquest')
  })

  it('retourne false si la DB est vide', async () => {
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne false si profile.onboardingComplete = false', async () => {
    // Créer manuellement un profil non complété
    const db = await openTestDb()
    await addProfile(db, { id: '1', onboardingComplete: false })
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne true si profile.onboardingComplete = true', async () => {
    const db = await openTestDb()
    await addProfile(db, { id: '1', onboardingComplete: true })
    expect(await checkOnboardingComplete()).toBe(true)
  })
})

// Helpers locaux pour créer la structure DB dans les tests
async function openTestDb(): Promise<IDBDatabase> {
  return new Promise((resolve) => {
    const req = indexedDB.open('brossquest', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('profiles', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
  })
}

async function addProfile(db: IDBDatabase, profile: Record<string, unknown>) {
  return new Promise<void>((resolve) => {
    const tx = db.transaction('profiles', 'readwrite')
    tx.objectStore('profiles').add(profile)
    tx.oncomplete = () => resolve()
  })
}
```

Pour `CameraGuard.test.ts`, mocker `navigator.permissions` :

```typescript
// src/guards/CameraGuard.test.ts
import { checkCameraPermission } from './CameraGuard'

describe('checkCameraPermission', () => {
  const mockQuery = vi.fn()

  beforeEach(() => {
    Object.defineProperty(navigator, 'permissions', {
      value: { query: mockQuery },
      configurable: true,
    })
  })

  it('retourne "granted" si la permission est accordée', async () => {
    mockQuery.mockResolvedValue({ state: 'granted' })
    expect(await checkCameraPermission()).toBe('granted')
  })

  it('retourne "denied" si la permission est refusée', async () => {
    mockQuery.mockResolvedValue({ state: 'denied' })
    expect(await checkCameraPermission()).toBe('denied')
  })

  it('retourne "prompt" si navigator.permissions n\'est pas supporté', async () => {
    mockQuery.mockRejectedValue(new Error('not supported'))
    expect(await checkCameraPermission()).toBe('prompt')
  })
})
```

### Mise à jour App.test.tsx

`src/App.test.tsx` référence `App` qui sera supprimé. Le remplacer :

```typescript
// src/App.test.tsx
import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'

describe('Router', () => {
  it('crée le routeur sans erreur', () => {
    const router = createRouter({
      routeTree: rootRoute.addChildren([]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    expect(router).toBeDefined()
  })
})
```

### Règles absolues à respecter

1. **Pas de Dexie dans cette story** — `dexie` est installé mais pas importé. Story 1.3 s'en charge.
2. **Pas de Zustand dans cette story** — même raison.
3. **Pas de `@mediapipe/tasks-vision`** — jamais hors `src/lib/mediapipe/`.
4. **`basepath` du router == `base` de vite.config.ts** — `/BrossQuest` (sans slash final dans router.ts).
5. **Guards dans `beforeLoad`** — jamais de rendu partiel avant vérification.
6. **`loader` pour les données de page** — `SessionPeriodGuard` passe via `loader`, pas `beforeLoad`.
7. **Tests co-localisés** — `ProfileGuard.test.ts` à côté de `ProfileGuard.tsx` dans `src/guards/`.
8. **Sélecteurs Zustand fins** — pas d'utilisation de Zustand ici, mais à retenir pour Story 1.3+.

### Pièges spécifiques à cette story

#### ❌ Ne pas utiliser `createMemoryHistory` en production
`createMemoryHistory` est réservé aux tests — ne pas l'utiliser dans `router.ts`.

#### ❌ Ne pas oublier basepath dans router.ts
```typescript
// ❌ Sans basepath → URLs cassées sur GitHub Pages
createRouter({ routeTree })

// ✅ Avec basepath
createRouter({ routeTree, basepath: '/BrossQuest' })
```

#### ❌ Ne pas importer rootRoute depuis router.ts dans les .route.tsx
Cela crée des imports circulaires. Toujours importer depuis `./__root` :
```typescript
// ❌ Circulaire
import { rootRoute } from '../router'

// ✅ Direct
import { rootRoute } from './__root'
```

#### ❌ Ne pas rediriger vers /home par défaut
Il n'y a pas de redirect root `/` → `/home` demandé dans cette story. Laisser la route `/` non définie pour l'instant (NotFound par défaut). Story 2 ou 3 ajoutera la logique.

---

## Définition of Done

- [x] `npm run build` sans erreur TypeScript strict
- [x] `npm test` vert — tous les nouveaux tests passent
- [x] Les 7 routes sont accessibles en naviguant manuellement via l'URL (ex: `localhost:5173/BrossQuest/onboarding`)
- [x] ProfileGuard redirige vers `/onboarding` quand IndexedDB est vide (vérifiable manuellement ou via test)
- [x] CameraGuard redirige vers `/recovery/camera` quand permission `'denied'` (vérifiable via test)
- [x] `src/types/profile.types.ts` et `src/types/session.types.ts` créés et compilent sans erreur
- [x] `fake-indexeddb` installé en devDependencies
- [x] `src/App.tsx` supprimé ou adapté (le composant `App` obsolète est retiré)

---

## Dépendances

- **Prérequis :** Story 1.1 complète (✅ status: review)
- **Installe le terrain pour :** Story 1.3 (Dexie schema — remplacera les raw indexedDB par des queries Dexie dans les guards)
- **Installe le terrain pour :** Story 1.4 (Spike MediaPipe — route `/spike` peut être ajoutée séparément)

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `vi.useFakeTimers()` bloquait les Promises internes de `fake-indexeddb` → résolu en utilisant `vi.useFakeTimers({ toFake: ['Date'] })` pour ne faker que le constructeur Date

### Completion Notes List

- T1 : Types `Profile`, `SessionHistoryEntry`, `SessionPhase`, `SessionStatus`, `SessionPeriod` créés
- T2 : 3 guards IndexedDB bruts (ProfileGuard, CameraGuard, SessionPeriodGuard) implémentés
- T3 : 8 fichiers de routes créés (`__root.tsx` + 7 routes placeholder) avec guards `beforeLoad`
- T4 : `router.ts` avec `basepath: '/BrossQuest'`, `main.tsx` mis à jour, `App.tsx` supprimé, `App.test.tsx` migré vers smoke test router
- T5 : 11 tests unitaires (3 fichiers) — tous verts — couvrant les 3 guards
- T6 : `npm run build` clean TypeScript strict, `npm test` 14/14 vert

### File List

- src/types/profile.types.ts (créé)
- src/types/session.types.ts (créé)
- src/guards/ProfileGuard.tsx (créé)
- src/guards/CameraGuard.tsx (créé)
- src/guards/SessionPeriodGuard.tsx (créé)
- src/guards/ProfileGuard.test.ts (créé)
- src/guards/CameraGuard.test.ts (créé)
- src/guards/SessionPeriodGuard.test.ts (créé)
- src/routes/__root.tsx (créé)
- src/routes/onboarding.route.tsx (créé)
- src/routes/handoff.route.tsx (créé)
- src/routes/home.route.tsx (créé)
- src/routes/session.route.tsx (créé)
- src/routes/parent.route.tsx (créé)
- src/routes/recovery.camera.route.tsx (créé)
- src/routes/recovery.profile.route.tsx (créé)
- src/router.ts (créé)
- src/main.tsx (modifié)
- src/App.test.tsx (modifié)
- src/App.tsx (supprimé)
- package.json (modifié — fake-indexeddb ajouté)
- package-lock.json (modifié)

## Change Log

- 2026-03-27 : Implémentation Story 1.2 — routing TanStack Router code-based (7 routes), guards IndexedDB bruts (ProfileGuard, CameraGuard, SessionPeriodGuard), types TypeScript (Profile, SessionHistoryEntry), 14 tests unitaires verts, build strict TypeScript clean
