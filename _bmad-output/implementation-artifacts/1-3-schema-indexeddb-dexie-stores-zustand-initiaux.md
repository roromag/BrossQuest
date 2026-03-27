# Story 1.3 : Schéma IndexedDB Dexie & stores Zustand initiaux

**Epic :** 1 — Fondation technique & Spike MediaPipe
**Story ID :** 1.3
**Story Key :** `1-3-schema-indexeddb-dexie-stores-zustand-initiaux`
**Status :** done
**Date :** 2026-03-27

---

## Story

As a développeur,
I want initialiser le schéma Dexie avec les 4 tables et les stores Zustand de base,
So that la couche de persistance soit opérationnelle avant les features qui en dépendent.

---

## Acceptance Criteria

**Scénario 1 — Dexie crée la DB avec 4 tables**
**Given** l'app est lancée pour la première fois
**When** `db` est importé depuis `src/lib/db/schema.ts`
**Then** IndexedDB `brossquest` est créé avec les tables : `profiles`, `episodes`, `sessionState`, `sessionHistory`
**And** la version du schéma est 1

**Scénario 2 — Types TypeScript pour chaque table**
**Given** le projet compile
**When** on inspecte `src/types/`
**Then** `Episode` et `SessionState` sont définis (en complément de `Profile` et `SessionHistoryEntry` déjà présents depuis Story 1.2)

**Scénario 3 — Queries Dexie de base**
**Given** la DB initialisée
**When** on appelle les queries
**Then** `getActiveProfile()`, `saveProfile()`, `getCompletedSessionForPeriod()`, `getActiveSession()`, `saveSessionState()`, `saveSessionHistory()`, `clearSessionState()` sont implémentées dans `src/lib/db/queries.ts` et testées

**Scénario 4 — Stores Zustand créés**
**Given** l'app démarre
**When** les stores sont importés
**Then** `useProfileStore`, `useSessionStore`, `useCameraStore`, `useEpisodeStore` existent dans `src/stores/` avec leurs états initiaux typés

**Scénario 5 — Guards migrés vers Dexie**
**Given** les guards `ProfileGuard.tsx` et `SessionPeriodGuard.tsx` utilisaient raw IndexedDB
**When** Story 1.3 est complète
**Then** `ProfileGuard.tsx` appelle `getActiveProfile()` et `SessionPeriodGuard.tsx` appelle `getCompletedSessionForPeriod()` depuis `src/lib/db/queries.ts`
**And** les tests des guards sont mis à jour pour utiliser la DB Dexie (via `fake-indexeddb`)

**Scénario 6 — Tests unitaires verts**
**Given** tous les fichiers créés
**When** `npm test` est exécuté
**Then** tous les tests passent (queries + stores + guards mis à jour)
**And** `npm run build` sans erreur TypeScript strict

---

## Tasks / Subtasks

- [x] T1 — Nouveaux types TypeScript (AC: #2)
  - [x] Ajouter `Episode` dans `src/types/episode.types.ts`
  - [x] Ajouter `SessionState` dans `src/types/session.types.ts` (compléter le fichier existant)

- [x] T2 — Schéma Dexie (AC: #1)
  - [x] Créer `src/lib/db/schema.ts` — classe `BrossQuestDB extends Dexie` avec 4 tables

- [x] T3 — Queries Dexie (AC: #3)
  - [x] Créer `src/lib/db/queries.ts` — 7 fonctions CRUD
  - [x] Créer `src/lib/db/queries.test.ts` — tests avec `fake-indexeddb`

- [x] T4 — Stores Zustand (AC: #4)
  - [x] Créer `src/stores/useProfileStore.ts` + `useProfileStore.test.ts`
  - [x] Créer `src/stores/useSessionStore.ts` + `useSessionStore.test.ts`
  - [x] Créer `src/stores/useCameraStore.ts` + `useCameraStore.test.ts`
  - [x] Créer `src/stores/useEpisodeStore.ts` + `useEpisodeStore.test.ts`

- [x] T5 — Migration guards vers Dexie (AC: #5)
  - [x] Mettre à jour `src/guards/ProfileGuard.tsx` — remplacer raw IndexedDB par `getActiveProfile()`
  - [x] Mettre à jour `src/guards/SessionPeriodGuard.tsx` — remplacer raw IndexedDB par `getCompletedSessionForPeriod()`
  - [x] Mettre à jour `src/guards/ProfileGuard.test.ts` — tests via Dexie + fake-indexeddb
  - [x] Mettre à jour `src/guards/SessionPeriodGuard.test.ts` — tests via Dexie + fake-indexeddb

- [x] T6 — Vérification build + tests (AC: #6)
  - [x] `npm run build` sans erreur TypeScript strict
  - [x] `npm test` vert (tous les tests)

---

## Dev Notes

### Stack installée (NE PAS réinstaller)

| Package | Version | Usage dans cette story |
|---|---|---|
| `dexie` | 4.3.0 | ORM IndexedDB — premier usage |
| `zustand` | 5.0.12 | State management — premier usage |
| `fake-indexeddb` | installé en devDeps (Story 1.2) | Tests Dexie |

### Types TypeScript existants (Story 1.2 — NE PAS modifier)

Ces types sont dans `src/types/session.types.ts` et `src/types/profile.types.ts` — les **importer** uniquement :

```typescript
// src/types/profile.types.ts  (déjà créé)
export interface Profile {
  id: string           // crypto.randomUUID()
  firstName: string
  emoji: string
  createdAt: number    // Date.now()
  onboardingComplete: boolean
}

// src/types/session.types.ts  (déjà créé — compléter avec SessionState)
export type SessionPhase = 'before' | 'during' | 'after'
export type SessionStatus = 'in_progress' | 'completed' | 'interrupted'
export type SessionPeriod = 'morning' | 'evening'

export interface SessionHistoryEntry {
  id: string
  episodeId: string
  date: number
  period: SessionPeriod
  totalDuration: number
  totalPauseTime: number
  zonesCompleted: number
  status: SessionStatus
}
```

### Nouveaux types à créer

```typescript
// src/types/episode.types.ts  (nouveau)
export type EpisodeType = 'original' | 'flashback'
export type EpisodeStatus = 'available' | 'played' | 'current'

export interface Episode {
  id: string              // ex: "ep-001"
  type: EpisodeType
  status: EpisodeStatus
  playedAt: number | null // Date.now() ou null
  narrativeScript: string // script pour Web Speech API (Story 4.2)
}
```

```typescript
// Ajouter dans src/types/session.types.ts  (fichier existant — ajouter à la fin)
export interface SessionState {
  episodeId: string
  activeZone: number          // 1–8
  zoneProgress: Record<number, number>  // { zoneId: secondesCumulées }
  status: SessionStatus
  startedAt: number           // Date.now()
  period: SessionPeriod
}
```

### Schéma Dexie — src/lib/db/schema.ts

```typescript
import Dexie, { type Table } from 'dexie'
import type { Profile } from '../../types/profile.types'
import type { Episode } from '../../types/episode.types'
import type { SessionState, SessionHistoryEntry } from '../../types/session.types'

class BrossQuestDB extends Dexie {
  profiles!: Table<Profile, string>
  episodes!: Table<Episode, string>
  sessionState!: Table<SessionState & { _id: string }, string>
  sessionHistory!: Table<SessionHistoryEntry, string>

  constructor() {
    super('brossquest')
    this.version(1).stores({
      profiles: 'id, onboardingComplete',
      episodes: 'id, status',
      sessionState: '_id, status',
      sessionHistory: 'id, period, date, status',
    })
  }
}

export const db = new BrossQuestDB()
```

**Notes schéma :**
- `sessionState` a une clé synthétique `_id` (toujours `'current'`) car il n'y a qu'1 enregistrement actif max. Le type est `SessionState & { _id: string }`.
- Les champs en second position dans `stores()` sont des **index secondaires** pour les queries.
- `profiles: 'id'` → keyPath = id (string UUID).
- **Ne jamais importer** depuis `dexie` dans les composants React ou les guards directement — toujours passer par `src/lib/db/queries.ts`.

### Queries Dexie — src/lib/db/queries.ts

```typescript
import { db } from './schema'
import type { Profile } from '../../types/profile.types'
import type { SessionState, SessionHistoryEntry, SessionPeriod } from '../../types/session.types'

const SESSION_STATE_KEY = 'current'

// ── Profil ──────────────────────────────────────────────────────────────────

export async function getActiveProfile(): Promise<Profile | undefined> {
  try {
    const profiles = await db.profiles.toArray()
    return profiles.find(p => p.onboardingComplete) ?? profiles[0]
  } catch (e) {
    console.error('[DB] getActiveProfile', e)
    return undefined
  }
}

export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await db.profiles.put(profile)
  } catch (e) {
    console.error('[DB] saveProfile', e)
  }
}

// ── Session en cours ─────────────────────────────────────────────────────────

export async function getActiveSession(): Promise<SessionState | undefined> {
  try {
    const record = await db.sessionState.get(SESSION_STATE_KEY)
    if (!record) return undefined
    const { _id: _, ...state } = record
    return state as SessionState
  } catch (e) {
    console.error('[DB] getActiveSession', e)
    return undefined
  }
}

export async function saveSessionState(state: SessionState): Promise<void> {
  try {
    await db.sessionState.put({ ...state, _id: SESSION_STATE_KEY })
  } catch (e) {
    console.error('[DB] saveSessionState', e)
  }
}

export async function clearSessionState(): Promise<void> {
  try {
    await db.sessionState.delete(SESSION_STATE_KEY)
  } catch (e) {
    console.error('[DB] clearSessionState', e)
  }
}

// ── Historique sessions ──────────────────────────────────────────────────────

export async function saveSessionHistory(entry: SessionHistoryEntry): Promise<void> {
  try {
    await db.sessionHistory.put(entry)
  } catch (e) {
    console.error('[DB] saveSessionHistory', e)
  }
}

export async function getCompletedSessionForPeriod(
  period: SessionPeriod,
  todayStart: number
): Promise<SessionHistoryEntry | undefined> {
  try {
    const sessions = await db.sessionHistory
      .where('period').equals(period)
      .filter(s => s.status === 'completed' && s.date >= todayStart)
      .first()
    return sessions
  } catch (e) {
    console.error('[DB] getCompletedSessionForPeriod', e)
    return undefined
  }
}
```

### Tests queries — src/lib/db/queries.test.ts

Pattern avec `fake-indexeddb` (déjà installé en devDeps) :

```typescript
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './schema'
import { getActiveProfile, saveProfile, getCompletedSessionForPeriod, saveSessionHistory } from './queries'
import type { Profile } from '../../types/profile.types'

beforeEach(async () => {
  // Reset DB entre tests — Dexie 4 : delete + recréer
  await db.delete()
  await db.open()
})

describe('getActiveProfile', () => {
  it('retourne undefined si DB vide', async () => {
    expect(await getActiveProfile()).toBeUndefined()
  })

  it('retourne le profil onboardé', async () => {
    const profile: Profile = {
      id: '1', firstName: 'Lena', emoji: '🦊',
      createdAt: Date.now(), onboardingComplete: true,
    }
    await saveProfile(profile)
    const result = await getActiveProfile()
    expect(result?.id).toBe('1')
  })
})

describe('getCompletedSessionForPeriod', () => {
  it('retourne undefined si aucune session complète aujourd\'hui', async () => {
    const todayStart = new Date().setHours(0, 0, 0, 0)
    expect(await getCompletedSessionForPeriod('morning', todayStart)).toBeUndefined()
  })
})
```

**⚠️ Piège fake-indexeddb + Dexie 4 :** `db.delete()` + `db.open()` dans `beforeEach` est le pattern fiable pour reset entre tests. Ne pas utiliser `indexedDB.deleteDatabase()` directement quand Dexie gère la connexion.

### Migration guards vers Dexie

**ProfileGuard.tsx — remplacement complet :**

```typescript
// src/guards/ProfileGuard.tsx
import { getActiveProfile } from '../lib/db/queries'

export async function checkOnboardingComplete(): Promise<boolean> {
  const profile = await getActiveProfile()
  return profile?.onboardingComplete === true
}
```

**SessionPeriodGuard.tsx — remplacement `getCompletedSessionForCurrentPeriod` :**

```typescript
// src/guards/SessionPeriodGuard.tsx
import { getCompletedSessionForPeriod } from '../lib/db/queries'
import type { SessionPeriod } from '../types/session.types'

export function getCurrentPeriod(): SessionPeriod {
  return new Date().getHours() >= 17 ? 'evening' : 'morning'
}

export async function getCompletedSessionForCurrentPeriod(): Promise<{ period: SessionPeriod } | null> {
  const period = getCurrentPeriod()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const session = await getCompletedSessionForPeriod(period, todayStart)
  return session ? { period } : null
}
```

**⚠️ La signature publique de `checkOnboardingComplete()` et `getCompletedSessionForCurrentPeriod()` ne change pas** — les routes `home.route.tsx` et `session.route.tsx` n'ont pas besoin d'être modifiées.

### Tests guards mis à jour

Les tests des guards doivent maintenant peupler la DB via Dexie (pas raw IndexedDB) :

```typescript
// src/guards/ProfileGuard.test.ts (mis à jour)
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../lib/db/schema'
import { checkOnboardingComplete } from './ProfileGuard'
import type { Profile } from '../types/profile.types'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('checkOnboardingComplete', () => {
  it('retourne false si DB vide', async () => {
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne false si onboardingComplete = false', async () => {
    const p: Profile = { id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: false }
    await db.profiles.put(p)
    expect(await checkOnboardingComplete()).toBe(false)
  })

  it('retourne true si onboardingComplete = true', async () => {
    const p: Profile = { id: '1', firstName: 'A', emoji: '🐱', createdAt: 0, onboardingComplete: true }
    await db.profiles.put(p)
    expect(await checkOnboardingComplete()).toBe(true)
  })
})
```

### Stores Zustand — Patterns

**Dexie uniquement pour la persistance** — les stores Zustand sont de la mémoire volatile (in-memory). Ils lisent depuis Dexie au démarrage et écrivent via queries.ts. **Les stores ne font jamais de requêtes Dexie directes** — ils passent toujours par `src/lib/db/queries.ts`.

```typescript
// src/stores/useProfileStore.ts
import { create } from 'zustand'
import type { Profile } from '../types/profile.types'

interface ProfileStore {
  profile: Profile | null
  isDbReady: boolean
  setProfile: (profile: Profile | null) => void
  setDbReady: (ready: boolean) => void
}

export const useProfileStore = create<ProfileStore>()((set) => ({
  profile: null,
  isDbReady: false,
  setProfile: (profile) => set({ profile }),
  setDbReady: (ready) => set({ isDbReady: ready }),
}))
```

```typescript
// src/stores/useSessionStore.ts
import { create } from 'zustand'
import type { SessionPhase, SessionState, SessionPeriod } from '../types/session.types'

interface SessionStore {
  phase: SessionPhase | null
  activeZone: number          // 1–8
  zoneProgress: Record<number, number>
  period: SessionPeriod | null
  setPhase: (phase: SessionPhase) => void
  setActiveZone: (zone: number) => void
  updateZoneProgress: (zone: number, seconds: number) => void
  setPeriod: (period: SessionPeriod) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>()((set) => ({
  phase: null,
  activeZone: 1,
  zoneProgress: {},
  period: null,
  setPhase: (phase) => set({ phase }),
  setActiveZone: (activeZone) => set({ activeZone }),
  updateZoneProgress: (zone, seconds) => set((s) => ({
    zoneProgress: { ...s.zoneProgress, [zone]: seconds },
  })),
  setPeriod: (period) => set({ period }),
  reset: () => set({ phase: null, activeZone: 1, zoneProgress: {}, period: null }),
}))
```

```typescript
// src/stores/useCameraStore.ts
import { create } from 'zustand'

type PermissionState = 'granted' | 'denied' | 'prompt'
type DetectionQuality = 'good' | 'degraded' | 'absent'

interface CameraStore {
  permissionState: PermissionState
  detectionQuality: DetectionQuality
  isMediaPipeLoading: boolean
  setPermissionState: (state: PermissionState) => void
  setDetectionQuality: (quality: DetectionQuality) => void
  setMediaPipeLoading: (loading: boolean) => void
}

export const useCameraStore = create<CameraStore>()((set) => ({
  permissionState: 'prompt',
  detectionQuality: 'absent',
  isMediaPipeLoading: false,
  setPermissionState: (permissionState) => set({ permissionState }),
  setDetectionQuality: (detectionQuality) => set({ detectionQuality }),
  setMediaPipeLoading: (isMediaPipeLoading) => set({ isMediaPipeLoading }),
}))
```

```typescript
// src/stores/useEpisodeStore.ts
import { create } from 'zustand'
import type { Episode } from '../types/episode.types'
import type { SessionPeriod } from '../types/session.types'

interface EpisodeStore {
  currentEpisode: Episode | null
  episodeList: Episode[]
  period: SessionPeriod | null
  setCurrentEpisode: (episode: Episode | null) => void
  setEpisodeList: (list: Episode[]) => void
  setPeriod: (period: SessionPeriod) => void
}

export const useEpisodeStore = create<EpisodeStore>()((set) => ({
  currentEpisode: null,
  episodeList: [],
  period: null,
  setCurrentEpisode: (currentEpisode) => set({ currentEpisode }),
  setEpisodeList: (episodeList) => set({ episodeList }),
  setPeriod: (period) => set({ period }),
}))
```

### Tests stores Zustand

```typescript
// src/stores/useProfileStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useProfileStore } from './useProfileStore'

describe('useProfileStore', () => {
  beforeEach(() => {
    useProfileStore.setState({ profile: null, isDbReady: false })
  })

  it('état initial correct', () => {
    const { profile, isDbReady } = useProfileStore.getState()
    expect(profile).toBeNull()
    expect(isDbReady).toBe(false)
  })

  it('setProfile met à jour le profil', () => {
    const p = { id: '1', firstName: 'Lena', emoji: '🦊', createdAt: 0, onboardingComplete: true }
    useProfileStore.getState().setProfile(p)
    expect(useProfileStore.getState().profile?.id).toBe('1')
  })
})
```

### Règles absolues à respecter

1. **Dexie uniquement pour la persistance** — pas de `localStorage` direct, pas de raw `indexedDB`.
2. **Sélecteurs Zustand fins** — `useProfileStore(s => s.profile)` jamais `useProfileStore()` entier.
3. **Jamais d'import direct de Dexie dans les composants React** — toujours via `src/lib/db/queries.ts`.
4. **Jamais de requête Dexie directe dans les stores** — les stores appellent queries.ts.
5. **Tests co-localisés** — `schema.ts` n'a pas de test direct (testé via queries.test.ts).
6. **`fake-indexeddb/auto`** en import haut de fichier dans chaque test qui touche Dexie.
7. **Guards : signature publique inchangée** — `checkOnboardingComplete()` et `getCompletedSessionForCurrentPeriod()` gardent exactement la même signature pour ne pas casser les routes.

### Pièges spécifiques

#### ❌ Zustand 5 — ne pas utiliser l'ancienne syntaxe v4
```typescript
// ❌ Ancienne syntaxe Zustand v4 (ne pas utiliser)
const useStore = create<State>((set) => ({ ... }))

// ✅ Zustand v5 — double appel de fonction
const useStore = create<State>()((set) => ({ ... }))
```

#### ❌ Dexie 4 — ne pas mélanger `version().stores()` et `upgrade()`
Le schéma V1 n'a pas de données à migrer, donc pas de `.upgrade()`. Ne l'ajouter que si une v2 est nécessaire.

#### ❌ Ne pas utiliser `indexedDB.deleteDatabase()` dans les tests Dexie
Quand Dexie gère la connexion, utiliser `db.delete()` + `db.open()` :
```typescript
// ❌ Raw — interfère avec la connexion Dexie
indexedDB.deleteDatabase('brossquest')

// ✅ Via Dexie
await db.delete()
await db.open()
```

#### ❌ `sessionState` — ne stocker qu'1 enregistrement
La clé `_id: 'current'` est le pattern. `db.sessionState.put({ ...state, _id: 'current' })` pour upsert. Ne jamais `add()` (crée des doublons).

#### ❌ Ne pas modifier les fichiers de Story 1.2 hors des guards
`home.route.tsx`, `session.route.tsx`, les types `Profile`, `SessionHistoryEntry`, `SessionPhase`, `SessionStatus`, `SessionPeriod` — ne pas modifier. Seuls `ProfileGuard.tsx`, `SessionPeriodGuard.tsx` et leurs tests sont mis à jour.

#### ⚠️ vi.useFakeTimers (leçon Story 1.2)
Si des tests ont besoin de contrôler `new Date()`, utiliser `vi.useFakeTimers({ toFake: ['Date'] })` et non `vi.useFakeTimers()` global — ce dernier bloque les Promises internes de fake-indexeddb.

### Structure de fichiers attendue après cette story

```
src/
├── types/
│   ├── profile.types.ts        ← inchangé (Story 1.2)
│   ├── episode.types.ts        ← nouveau
│   └── session.types.ts        ← complété (+ SessionState)
├── lib/
│   └── db/
│       ├── schema.ts           ← nouveau
│       ├── queries.ts          ← nouveau
│       └── queries.test.ts     ← nouveau
├── stores/
│   ├── useProfileStore.ts      ← nouveau
│   ├── useProfileStore.test.ts ← nouveau
│   ├── useSessionStore.ts      ← nouveau
│   ├── useSessionStore.test.ts ← nouveau
│   ├── useCameraStore.ts       ← nouveau
│   ├── useCameraStore.test.ts  ← nouveau
│   ├── useEpisodeStore.ts      ← nouveau
│   └── useEpisodeStore.test.ts ← nouveau
└── guards/
    ├── ProfileGuard.tsx        ← mis à jour (Dexie)
    ├── ProfileGuard.test.ts    ← mis à jour (Dexie)
    ├── SessionPeriodGuard.tsx  ← mis à jour (Dexie)
    └── SessionPeriodGuard.test.ts ← mis à jour (Dexie)
```

---

## Définition of Done

- [x] `npm run build` sans erreur TypeScript strict
- [x] `npm test` vert — tous les tests (nouveaux + guards mis à jour)
- [x] `src/lib/db/schema.ts` crée la DB `brossquest` avec 4 tables au premier import
- [x] `src/lib/db/queries.ts` expose les 7 fonctions CRUD
- [x] `src/stores/` contient les 4 stores Zustand avec états initiaux typés
- [x] `ProfileGuard.tsx` et `SessionPeriodGuard.tsx` n'utilisent plus raw `indexedDB`
- [x] `src/types/episode.types.ts` créé, `SessionState` ajouté dans `session.types.ts`

---

## Dépendances

- **Prérequis :** Story 1.2 complète (✅ status: done) — routing, guards raw IndexedDB, types Profile + SessionHistoryEntry
- **Installe le terrain pour :** Story 1.4 (Spike MediaPipe — structure `src/lib/mediapipe/` adjacente à `src/lib/db/`)
- **Installe le terrain pour :** Story 2.1 (Onboarding — écrit le profil via `saveProfile()`)
- **Installe le terrain pour :** Story 3.1+ (Session — lit/écrit `sessionState` et `sessionHistory`)

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_Aucun blocage rencontré._

### Completion Notes List

- T1 : `src/types/episode.types.ts` créé (Episode, EpisodeType, EpisodeStatus). `SessionState` ajouté dans `session.types.ts`.
- T2 : `BrossQuestDB extends Dexie` — 4 tables (profiles, episodes, sessionState, sessionHistory), version 1. `sessionState` utilise la clé synthétique `_id: 'current'`.
- T3 : 7 fonctions CRUD dans `queries.ts`. 13 tests dans `queries.test.ts` — pattern `db.delete()` + `db.open()` entre chaque test.
- T4 : 4 stores Zustand v5 créés avec double appel `create<T>()((set) => ...)`. 16 tests unitaires au total.
- T5 : Guards migrés — raw IndexedDB remplacé par appels à `queries.ts`. Signatures publiques inchangées (`checkOnboardingComplete`, `getCompletedSessionForCurrentPeriod`). Tests guards mis à jour avec Dexie + fake-indexeddb.
- T6 : 49/49 tests verts. `npm run build` sans erreur TypeScript strict.

### File List

- `src/types/episode.types.ts` — nouveau
- `src/types/session.types.ts` — complété (+ SessionState)
- `src/lib/db/schema.ts` — nouveau
- `src/lib/db/queries.ts` — nouveau
- `src/lib/db/queries.test.ts` — nouveau
- `src/stores/useProfileStore.ts` — nouveau
- `src/stores/useProfileStore.test.ts` — nouveau
- `src/stores/useSessionStore.ts` — nouveau
- `src/stores/useSessionStore.test.ts` — nouveau
- `src/stores/useCameraStore.ts` — nouveau
- `src/stores/useCameraStore.test.ts` — nouveau
- `src/stores/useEpisodeStore.ts` — nouveau
- `src/stores/useEpisodeStore.test.ts` — nouveau
- `src/guards/ProfileGuard.tsx` — mis à jour (Dexie)
- `src/guards/ProfileGuard.test.ts` — mis à jour (Dexie)
- `src/guards/SessionPeriodGuard.tsx` — mis à jour (Dexie)
- `src/guards/SessionPeriodGuard.test.ts` — mis à jour (Dexie)
