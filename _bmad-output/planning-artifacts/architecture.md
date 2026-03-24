---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-24'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/product-brief-bmad-2026-03-23.md"
workflowType: 'architecture'
project_name: 'BrossQuest'
user_name: 'Romain'
date: '2026-03-24'
---

# Architecture Decision Document — BrossQuest

_Ce document se construit collaborativement étape par étape. Les sections sont ajoutées au fil des décisions architecturales prises ensemble._

---

## Contexte Projet

### Vue d'ensemble

**Projet :** BrossQuest — PWA offline-first pour enfants 6–10 ans
**Type :** SPA statique, rendu client uniquement, zéro backend V1
**Hébergement :** Statique (GitHub Pages ou équivalent)
**Ressource :** Développeur solo (Romain)
**Complexité :** Medium-high — ML on-device, dual-persona, contraintes iOS Safari

### Exigences Fonctionnelles

40 FRs organisées en 6 catégories :

| Catégorie | FRs | Implications architecturales |
|---|---|---|
| Détection du geste | FR1–FR8 | Moteur MediaPipe WASM, 3 états détection, adaptation orientation |
| Session de brossage | FR9–FR18 | getUserMedia par geste utilisateur, 3 phases, 8 zones, accumulation cumulative, limite 1 session/période |
| Narration & Contenu | FR19–FR23 | Web Speech API, épisodes séquentiels, adaptation matin/soir |
| Profil & Onboarding | FR24–FR32 | IndexedDB uniquement, pas de compte cloud, passage de main |
| Gestion erreurs & Récupération | FR33–FR37 | Isolation erreurs côté parent, guards de navigation, onboarding de récupération rapide |
| Infrastructure PWA | FR38–FR40 | Service Worker cache-first, budget < 30 Mo, mise à jour différée hors session |

### Exigences Non-Fonctionnelles Critiques

| NFR | Contrainte | Impact architectural |
|---|---|---|
| NFR-P1 | Démarrage ≤ 10s | WASM MediaPipe chargé en différé (au tap session, pas au démarrage app) |
| NFR-P3 | Latence détection ≤ 1s | requestAnimationFrame + pipeline MediaPipe synchrone avec Canvas |
| NFR-P4 | Animation ≥ 30fps (15fps mid-range) | Frame rate adaptatif — contrainte dure sur latence, pas FPS |
| NFR-P5 | Budget cache ≤ 30 Mo | WASM + assets visuels uniquement (narration via Web Speech API = 0 Mo) |
| NFR-R2 | Session interrompue récupérable | Sauvegarde IndexedDB temps réel (zone active + temps cumulé) |
| NFR-C1 | Flux caméra 100% on-device | MediaPipe WASM exclusivement — aucune donnée biométrique transmise |

### Complexité & Échelle

- **Complexité :** Medium-high
- **Domaine primaire :** PWA Client-side SPA
- **Backend V1 :** Aucun
- **Composants custom critiques :** 6 (PulseButton, NebulaCanvas, EmojiPicker, NarrativeCard, CameraFade, PermissionRecovery)
- **Prérequis bloquant :** Spike MediaPipe Hands validé en conditions réelles avant tout développement fonctionnel

### Contraintes Techniques iOS Safari (P0)

1. **getUserMedia** — uniquement déclenchable dans le même event handler que le tap utilisateur. Aucune logique asynchrone entre le tap et l'appel `getUserMedia`.
2. **AudioContext** — doit être créé/resumed dans le même geste utilisateur que le tap de lancement. Risque de suspension si l'app passe en arrière-plan → reprise obligatoire au retour au premier plan.
3. **IndexedDB** — évictable silencieusement par iOS si l'espace disque est insuffisant → flux d'onboarding de récupération rapide requis.
4. **Service Worker** — éviction agressive du cache → budget dur < 30 Mo. Mise à jour différée jusqu'à la fin de la session en cours.
5. **Permission caméra** — révocable sans préavis → vérification à chaque lancement avant tout écran enfant.

### Décisions Architecturales Validées (Party Mode)

| Décision | Choix retenu | Rationale |
|---|---|---|
| Narration vocale | Web Speech API | Zéro budget cache, liste de prénoms ouverte, qualité améliorable post-V1 |
| Routing persona | Routes distinctes | Frontière claire parent/enfant dans le code et les tests |
| Limite session/période | 1 session par période (matin/soir) | Installe l'habitude, protège la rareté des épisodes |
| Écran "déjà brossé" | Bouton pulsant absent + sous-titre | Matin : "À ce soir ✨" · Soir : "À demain ✨" |

### Modèle de Données IndexedDB

```
Profile
  ├── id (uuid)
  ├── firstName (string)
  ├── emoji (string)
  ├── createdAt (timestamp)
  └── onboardingComplete (boolean)

Episode
  ├── id (string — ex: "ep-001")
  ├── type ("original" | "flashback")
  ├── status ("available" | "played" | "current")
  ├── playedAt (timestamp | null)
  └── narrativeScript (string → Web Speech API)

SessionState  ← état session en cours (1 enregistrement)
  ├── episodeId
  ├── activeZone (1–8)
  ├── zoneProgress ({ zoneId: secondsCumulées })
  ├── status ("in_progress" | "completed" | "interrupted")
  ├── startedAt (timestamp)
  └── period ("morning" | "evening")

SessionHistory  ← une entrée par session complète
  ├── id (uuid)
  ├── episodeId
  ├── date (timestamp)
  ├── period ("morning" | "evening")
  ├── totalDuration (seconds)
  ├── totalPauseTime (seconds)  ← signal de transfert décroissant
  └── zonesCompleted (number)
```

### Structure de Routing

```
/onboarding          → flux parent (prénom, permission caméra, PWA install)
/handoff             → passage de main (sélection emoji par l'enfant)
/home                → écran atmosphérique (persona enfant, épisode en cours)
/session             → session active (Avant / Pendant / Après)
/parent              → paramètres parent (icône discrète, hors parcours enfant)
/recovery/camera     → flux récupération permission caméra
/recovery/profile    → flux récupération IndexedDB vide
```

### Guards de Navigation

```
ProfileGuard
  IndexedDB vide ou Profile.onboardingComplete = false
  → redirect /onboarding

CameraGuard
  Permission caméra absente ou révoquée
  (navigator.permissions.query({name:'camera'}))
  → redirect /recovery/camera
  Vérifié à chaque lancement, avant tout écran enfant

SessionPeriodGuard
  SessionHistory contient une session complète dans la période courante
  → /home en mode "repos"
    · bouton pulsant absent
    · sous-titre : period === "morning" → "À ce soir ✨"
                   period === "evening" → "À demain ✨"
```

### Préoccupations Transversales

- **État permission caméra** — vérifié à chaque lancement via `CameraGuard`, avant tout écran enfant
- **Isolation erreurs** — toutes les erreurs techniques remontent vers les routes `/recovery/*`, jamais exposées à l'enfant
- **IndexedDB comme source de vérité unique** — profil, épisodes, session en cours, historique
- **État MediaPipe** — pilote l'animation NebulaCanvas, les micro-événements, la progression narrative
- **Budget cache PWA** — narration via Web Speech API (0 Mo) libère tout le budget pour WASM + assets visuels
- **AudioContext iOS** — créé dans le geste utilisateur du tap session, repris au retour au premier plan

---

## Patterns d'Implémentation & Règles de Cohérence

### Points de Conflit Identifiés

7 zones où des agents AI pourraient faire des choix différents et incompatibles : nommage fichiers, conventions TypeScript, nommage Dexie, organisation stores Zustand, gestion d'erreurs, loading states, patterns AudioContext.

### Conventions de Nommage

**Fichiers & Composants**

| Convention | Usage | Exemple |
|---|---|---|
| PascalCase | Composants React | `NebulaCanvas.tsx` |
| camelCase | Hooks, utils, lib | `useSessionStore.ts`, `formatPeriod.ts` |
| kebab-case | Fichiers de routes | `session.route.tsx`, `recovery-camera.route.tsx` |
| SCREAMING_SNAKE | Constantes globales | `DETECTION_THRESHOLD`, `ZONE_DURATION_MS` |

**TypeScript**

```typescript
// Types/Interfaces : PascalCase
type SessionPhase = 'before' | 'during' | 'after'
interface ZoneProgress { zoneId: number; secondsCumulated: number }

// Props : NomComposantProps
interface NebulaCanvasProps { activeZone: number; velocity: number }

// Stores Zustand : useNomStore
const useSessionStore = create<SessionStore>(...)

// Queries Dexie : verbe + entité
async function getActiveSession(): Promise<SessionState | undefined>
async function saveSessionHistory(entry: SessionHistory): Promise<void>
```

**Dexie — Tables & Champs**

| Convention | Usage | Exemple |
|---|---|---|
| camelCase pluriel | Noms de tables | `profiles`, `episodes`, `sessionHistory` |
| camelCase | Noms de champs | `firstName`, `playedAt`, `zonesCompleted` |
| string uuid | IDs | `crypto.randomUUID()` |
| number (Date.now()) | Timestamps | `createdAt`, `startedAt` |

### Structure & Organisation

**Tests : co-localisés**

```
src/components/session/NebulaCanvas.tsx
src/components/session/NebulaCanvas.test.tsx   ← co-localisé, jamais dans __tests__/
```

**Lib : wrappers techniques isolés**

```
src/lib/mediapipe/   Tout ce qui touche @mediapipe/tasks-vision
src/lib/db/          Dexie schema, queries, migrations
src/lib/speech/      Web Speech API wrapper
src/lib/sw/          Service Worker config (vite-plugin-pwa)
```

**Règle stricte :** les composants React n'importent jamais directement depuis `@mediapipe/tasks-vision` — toujours via `src/lib/mediapipe/`.

### Patterns Zustand

```typescript
// Store : état + actions dans le même objet typé
interface SessionStore {
  phase: SessionPhase
  activeZone: number
  setPhase: (phase: SessionPhase) => void
  advanceZone: () => void
}

// Sélecteurs fins — jamais le store entier
const phase = useSessionStore(s => s.phase)   // ✅
const store = useSessionStore()                // ❌ re-render sur tout changement
```

`useSessionStore` et `NebulaCanvas` sont découplés via sélecteurs. Le canvas lit `activeZone` et `velocity` — il ne re-rend pas si `phase` change sans affecter ces valeurs.

### Patterns de Gestion d'Erreurs

**Règle fondamentale :** toute erreur technique est interceptée avant d'atteindre le flux enfant.

```typescript
// Erreurs Dexie — loguées, jamais remontées à l'enfant
try {
  await db.sessionHistory.add(entry)
} catch (e) {
  console.error('[DB]', e)
  // Pas de toast, pas de modale côté enfant
}
```

- **Error Boundary React :** un seul boundary global autour de `/session` et `/home` → redirige vers `/recovery/profile`
- **Erreurs MediaPipe :** signal `detectionQuality: 'degraded'` dans `useCameraStore` — jamais d'erreur UI enfant
- **Guards :** résolution avant rendu — si condition échoue → redirect immédiate, jamais de rendu partiel

### Patterns Loading State

```typescript
// Nommage : isLoading + contexte, jamais "loading" seul
isMediaPipeLoading: boolean   // dans useCameraStore
isDbReady: boolean            // dans useProfileStore

// Bouton pulsant disabled tant que isMediaPipeLoading = true
// L'app est utilisable (onboarding, home) avant que WASM soit prêt
```

### Patterns Web Speech API

```typescript
// Toujours annuler avant de relancer
window.speechSynthesis.cancel()
const utterance = new SpeechSynthesisUtterance(script)
window.speechSynthesis.speak(utterance)

// Injection du prénom : template literal, jamais de concaténation
const script = `Le Dragon Molaire est malade, ${profile.firstName}.`

// Reprise après retour premier plan iOS
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    window.speechSynthesis.cancel()
  }
})
```

### Règles Absolues — Tous les Agents AI DOIVENT

1. **Jamais d'import direct** de `@mediapipe/tasks-vision` hors de `src/lib/mediapipe/`
2. **Sélecteurs Zustand fins** — toujours `useSessionStore(s => s.x)`, jamais `useSessionStore()`
3. **Jamais d'erreur technique** visible dans le flux enfant (routes `/home`, `/session`, `/handoff`)
4. **Zéro CDN** — tous les assets précachés, aucun fetch externe en production
5. **Tests co-localisés** — `Composant.test.tsx` à côté de `Composant.tsx`
6. **Dexie uniquement** pour la persistance — pas de `localStorage` direct (sauf flag debug)

---

## Starter Template

### Starter sélectionné : Vite + React + TypeScript (officiel)

**Rationale :** Base officielle minimale, sans overhead de starters communautaires (Cypress, CI/CD, Husky). Ajouts ciblés uniquement sur les besoins du projet.

**Commande d'initialisation :**

```bash
npm create vite@latest brossquest -- --template react-ts
cd brossquest
npm install
```

**Ajouts post-init :**

```bash
# Tailwind CSS v4 (plugin Vite natif)
npm install tailwindcss @tailwindcss/vite

# PWA + Service Worker (Workbox)
npm install -D vite-plugin-pwa

# Tests unitaires (Vitest — intégré à Vite, zéro config)
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Décisions architecturales établies par le starter :**

| Dimension | Décision |
|---|---|
| Langage | TypeScript strict |
| Bundler | Vite v8 (ESM natif, HMR) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| PWA / Service Worker | vite-plugin-pwa v1.2.0 (Workbox, cache-first) |
| Tests | Vitest + Testing Library + jsdom |
| Build output | Static → GitHub Pages |
| Node minimum | 20.19+ ou 22.12+ |

**Note :** L'initialisation du projet avec cette commande constitue la première story d'implémentation.

---

## Structure du Projet & Frontières

### Arborescence Complète

```
brossquest/
├── .github/
│   └── workflows/
│       └── deploy.yml               ← CI/CD GitHub Actions → GitHub Pages
│
├── public/
│   ├── mediapipe/
│   │   └── hand_landmarker.task     ← WASM MediaPipe (précaché Service Worker)
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.webmanifest
│
├── src/
│   ├── main.tsx                     ← Entry point React + TanStack Router
│   ├── app.tsx                      ← Root component + Router provider
│   ├── index.css                    ← Tailwind CSS v4 import
│   │
│   ├── routes/
│   │   ├── __root.tsx               ← Root layout + Error Boundary global
│   │   ├── onboarding.route.tsx     ← FR24–FR29 — flux parent
│   │   ├── handoff.route.tsx        ← FR25 — passage de main (emoji)
│   │   ├── home.route.tsx           ← Écran atmosphérique + SessionPeriodGuard
│   │   ├── session.route.tsx        ← FR9–FR18 — session complète
│   │   ├── parent.route.tsx         ← FR26, FR31 — paramètres profil
│   │   ├── recovery.camera.route.tsx   ← FR33–FR34 — récupération permission
│   │   └── recovery.profile.route.tsx  ← FR36 — récupération IndexedDB vide
│   │
│   ├── guards/
│   │   ├── ProfileGuard.tsx         ← onboardingComplete ? → /home : /onboarding
│   │   ├── CameraGuard.tsx          ← permission ? → continue : /recovery/camera
│   │   └── SessionPeriodGuard.tsx   ← session période courante ? → mode repos : normal
│   │
│   ├── components/
│   │   ├── session/
│   │   │   ├── NebulaCanvas.tsx     ← FR12–FR16 — canvas particules 8 zones
│   │   │   ├── NebulaCanvas.test.tsx
│   │   │   ├── PulseButton.tsx      ← FR9 — bouton lancement + getUserMedia
│   │   │   ├── PulseButton.test.tsx
│   │   │   ├── CameraFade.tsx       ← FR11 — transition caméra → nébuleuse
│   │   │   ├── CameraFade.test.tsx
│   │   │   ├── CelebrationOverlay.tsx  ← FR15 — phase Après
│   │   │   └── CelebrationOverlay.test.tsx
│   │   ├── onboarding/
│   │   │   ├── EmojiPicker.tsx      ← FR25 — sélecteur emoji 4×2
│   │   │   ├── EmojiPicker.test.tsx
│   │   │   ├── NarrativeCard.tsx    ← Écran atmosphérique (fond étoilé, titre épisode)
│   │   │   ├── NarrativeCard.test.tsx
│   │   │   ├── PermissionRecovery.tsx  ← FR34 — instructions récupération caméra
│   │   │   └── PermissionRecovery.test.tsx
│   │   └── parent/
│   │       ├── ProfileSettings.tsx  ← FR26, FR31 — édition prénom/emoji
│   │       ├── ProfileSettings.test.tsx
│   │       ├── ParentAccessIcon.tsx ← Icône discrète accès parent depuis /home
│   │       └── ParentAccessIcon.test.tsx
│   │
│   ├── stores/
│   │   ├── useSessionStore.ts       ← phase, activeZone, zoneProgress, status
│   │   ├── useSessionStore.test.ts
│   │   ├── useProfileStore.ts       ← profile, onboardingComplete, isDbReady
│   │   ├── useProfileStore.test.ts
│   │   ├── useCameraStore.ts        ← permissionState, detectionQuality, isMediaPipeLoading
│   │   ├── useCameraStore.test.ts
│   │   ├── useEpisodeStore.ts       ← currentEpisode, episodeList, period
│   │   └── useEpisodeStore.test.ts
│   │
│   ├── lib/
│   │   ├── mediapipe/
│   │   │   ├── detector.ts          ← FR1–FR8 — chargement différé WASM, pipeline détection
│   │   │   ├── detector.test.ts
│   │   │   └── types.ts             ← DetectionResult, DetectionState, DetectionQuality
│   │   ├── db/
│   │   │   ├── schema.ts            ← Dexie DB class, 4 tables, migrations
│   │   │   ├── queries.ts           ← FR30, FR36 — CRUD profil, session, historique
│   │   │   └── queries.test.ts
│   │   ├── speech/
│   │   │   ├── narrator.ts          ← FR19, FR22 — Web Speech API, injection prénom
│   │   │   └── narrator.test.ts
│   │   └── sw/
│   │       └── sw-config.ts         ← FR38–FR39 — Workbox cache-first, budget < 30 Mo
│   │
│   ├── constants/
│   │   ├── zones.ts                 ← ZONE_DURATION_MS, ZONE_COUNT, DETECTION_THRESHOLD
│   │   ├── colors.ts                ← Tokens couleurs (miroir design tokens Tailwind)
│   │   └── episodes.ts              ← FR19–FR21 — scripts narratifs, liste épisodes/flashbacks
│   │
│   └── types/
│       ├── session.types.ts         ← SessionPhase, ZoneProgress, SessionStatus
│       ├── profile.types.ts         ← Profile, Episode, EpisodeStatus
│       └── mediapipe.types.ts       ← DetectionQuality, DetectionState, VelocityData
│
├── package.json
├── vite.config.ts                   ← vite-plugin-pwa + @tailwindcss/vite
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── vitest.config.ts
└── .gitignore
```

### Cartographie Exigences → Structure

| Catégorie FRs | Fichiers principaux |
|---|---|
| Détection (FR1–FR8) | `lib/mediapipe/detector.ts` · `stores/useCameraStore.ts` |
| Session (FR9–FR18) | `components/session/` · `stores/useSessionStore.ts` · `routes/session.route.tsx` |
| Narration (FR19–FR23) | `lib/speech/narrator.ts` · `constants/episodes.ts` · `stores/useEpisodeStore.ts` |
| Profil/Onboarding (FR24–FR32) | `components/onboarding/` · `lib/db/` · `routes/onboarding.route.tsx` |
| Erreurs/Récupération (FR33–FR37) | `guards/` · `routes/recovery.*.route.tsx` · `components/onboarding/PermissionRecovery.tsx` |
| Infrastructure PWA (FR38–FR40) | `lib/sw/sw-config.ts` · `vite.config.ts` · `public/mediapipe/` |

### Flux de Données

```
getUserMedia (geste utilisateur → PulseButton)
  ↓
CameraFade (flux caméra visible → fondu ~3s → NebulaCanvas)
  ↓
lib/mediapipe/detector.ts (pipeline WASM on-device)
  ↓
useCameraStore { velocity, detectionQuality, detectionState }
  ↓
useSessionStore { zoneProgress, activeZone, phase }
  ↓
NebulaCanvas { position, densité particules, teinte micro-événement }

lib/db/queries.ts ←→ Dexie.js ←→ IndexedDB (source de vérité unique)
useProfileStore   ←→ lib/db/queries.ts (lecture profil au démarrage)
useSessionStore   ←→ lib/db/queries.ts (sauvegarde temps réel — FR17)
guards/           ←→ lib/db/queries.ts + navigator.permissions API
useEpisodeStore   ←→ lib/db/queries.ts + constants/episodes.ts
```

### Frontières d'Isolation

| Frontière | Règle |
|---|---|
| Enfant / Parent | Guards exécutés avant rendu — jamais de rendu partiel d'un état d'erreur |
| MediaPipe / React | Toute interaction via `lib/mediapipe/` — jamais d'import direct dans les composants |
| Données / UI | `lib/db/queries.ts` est la seule couche qui touche Dexie — les stores ne font pas de requêtes directes |
| PWA / App | `lib/sw/sw-config.ts` centralise toute la config Workbox — pas de config SW dispersée |

---

## Validation de l'Architecture

### Cohérence ✅

**Compatibilité des décisions :** Vite 8 + React + TypeScript + TanStack Router + Zustand + Dexie.js + vite-plugin-pwa + `@mediapipe/tasks-vision` — aucun conflit de versions. Web Speech API native (0 dépendance). Tailwind v4 via `@tailwindcss/vite` est le mode d'intégration officiel pour Vite.

**Cohérence des patterns :** Sélecteurs Zustand fins alignés avec performance Canvas. Isolation `lib/mediapipe/` cohérente avec règle "jamais d'import direct". Guards TanStack Router exécutés avant rendu — cohérent avec l'isolation enfant/parent.

### Couverture des Exigences ✅

**40 FRs couverts — 13 NFRs couverts**

| Catégorie | Couverture architecturale |
|---|---|
| Détection FR1–FR8 | `lib/mediapipe/detector.ts` · `useCameraStore` |
| Session FR9–FR18 | `components/session/` · `useSessionStore` · `session.route.tsx` |
| Narration FR19–FR23 | `lib/speech/narrator.ts` · `constants/episodes.ts` · `useEpisodeStore` |
| Profil/Onboarding FR24–FR32 | `components/onboarding/` · `lib/db/` · routes onboarding/handoff |
| Erreurs/Récupération FR33–FR37 | `guards/` · `routes/recovery.*` · `PermissionRecovery` |
| Infrastructure PWA FR38–FR40 | `lib/sw/sw-config.ts` · `vite.config.ts` · `public/mediapipe/` |

### Gaps Adressés

**FR22/FR23 — Détection matin/soir :** calcul local dans `useEpisodeStore` :
```typescript
const period = new Date().getHours() >= 17 ? 'evening' : 'morning'
```

**FR18 — SessionPeriodGuard :** logique de comparaison précisée :
```typescript
// Session "dans la période courante" =
// dernière SessionHistory { status: 'completed', period: periodActuelle }
// dont le date timestamp est dans la même journée calendaire (minuit local)
```

**Budget cache WASM :** `hand_landmarker.task` ~8 Mo + assets visuels ~5 Mo = ~13 Mo < 30 Mo. À mesurer lors du spike.

**Modèle MediaPipe :** `hand_landmarker.task` (landmarks main) à confirmer lors du spike. `lib/mediapipe/` est agnostique du modèle — pas de refonte si on change.

### Checklist de Complétude

**✅ Analyse du contexte**
- [x] 40 FRs et 8 NFRs analysés pour implications architecturales
- [x] Complexité medium-high, solo dev, greenfield
- [x] Contraintes iOS Safari documentées (getUserMedia, AudioContext, IndexedDB, SW, permission caméra)
- [x] Préoccupations transversales mappées

**✅ Décisions Architecturales**
- [x] Stack complète avec versions vérifiées
- [x] Modèle de données IndexedDB (4 entités, Dexie.js)
- [x] Routing (7 routes, 3 guards, TanStack Router)
- [x] State management (4 stores Zustand, sélecteurs fins)
- [x] Décisions différées documentées (auth V2, analytics)

**✅ Patterns d'Implémentation**
- [x] Conventions de nommage (PascalCase, camelCase, kebab-case, SCREAMING_SNAKE)
- [x] Patterns Zustand (sélecteurs fins, stores par domaine)
- [x] Gestion d'erreurs (isolation enfant/parent, Error Boundary)
- [x] Patterns AudioContext iOS (reprise visibilitychange)
- [x] 6 règles absolues pour agents AI

**✅ Structure du Projet**
- [x] Arborescence complète et spécifique
- [x] Frontières d'isolation (Enfant/Parent, MediaPipe/React, Données/UI, PWA/App)
- [x] Cartographie FRs → fichiers
- [x] Flux de données documenté

### Évaluation de Maturité

**Statut : PRÊT POUR L'IMPLÉMENTATION**
**Niveau de confiance : Élevé**

**Points forts :**
- Zéro backend = zéro surface d'attaque, zéro coût infra
- Web Speech API libère ~15 Mo de budget cache
- Architecture dual-persona propre avec guards typés
- lib/mediapipe/ isolée et testable indépendamment du reste de l'app

**À enrichir post-spike :**
- Valeurs empiriques de `DETECTION_THRESHOLD` et `ZONE_DURATION_MS`
- Stratégie de compression audio si Web Speech API qualité insuffisante
- Confirmation modèle MediaPipe définitif

### Directives pour les Agents AI

- Suivre toutes les décisions architecturales exactement comme documentées
- Utiliser les patterns d'implémentation de manière cohérente dans tous les composants
- Respecter la structure du projet et les frontières d'isolation
- Se référer à ce document pour toute question architecturale
- En cas d'ambiguïté, les **6 règles absolues** ont priorité sur toute autre considération

### Priorité d'Implémentation

**Story 0 (prérequis bloquant) :** Spike MediaPipe Hands — prototype isolé, validation conditions réelles salle de bain

**Story 1 (si spike validé) :**
```bash
npm create vite@latest brossquest -- --template react-ts
```

---

## Décisions Architecturales

### Analyse de Priorité

**Décisions critiques (bloquent l'implémentation) :**
- Routing library → TanStack Router
- State management → Zustand
- IndexedDB library → Dexie.js
- MediaPipe integration → `@mediapipe/tasks-vision` npm

**Décisions importantes (structurent l'architecture) :**
- CI/CD → GitHub Actions (deploy automatique sur push `main`)

**Décisions différées (post-MVP) :**
- Auth / sync cloud → V2 uniquement (sign-in social + RGPD mineurs)
- Analytics → Hors scope V1 (données en localStorage, extraction manuelle)
- Mode audio (Web Audio API) → V2

---

### Data Architecture

**IndexedDB via Dexie.js**

| Décision | Choix | Rationale |
|---|---|---|
| Store | IndexedDB | Seule option viable offline-first, persistance entre sessions |
| Library | Dexie.js | ORM-like, TypeScript natif, versioning de schéma, migrations propres |
| Source de vérité | IndexedDB uniquement | Aucun backend V1 — toute la persistance est locale |
| Perte de données | Acceptée (cache iOS vidé) | Flux d'onboarding de récupération rapide comme mitigation |

Schéma Dexie :
```typescript
class BrossQuestDB extends Dexie {
  profiles!: Table<Profile>
  episodes!: Table<Episode>
  sessionState!: Table<SessionState>
  sessionHistory!: Table<SessionHistory>
}
```

---

### Authentification & Sécurité

**Aucune authentification en V1.**

| Aspect | Décision |
|---|---|
| Comptes utilisateurs | Hors scope V1 — profil local uniquement |
| Permission caméra | Gérée via `navigator.permissions.query` + `CameraGuard` |
| Données personnelles | Stockées localement (IndexedDB) — aucune transmission |
| Conformité RGPD | Non applicable V1 — zéro serveur, zéro données transmises |

---

### API & Communication

**Aucune API externe en V1.**

| Aspect | Décision |
|---|---|
| Backend | Aucun — SPA statique |
| Communication inter-composants | Zustand stores + événements React |
| MediaPipe | On-device WASM uniquement — aucun flux transmis |
| Narration vocale | Web Speech API — on-device, aucun appel réseau |

---

### Architecture Frontend

**Routing — TanStack Router v1**

| Décision | Choix | Rationale |
|---|---|---|
| Library | TanStack Router v1 | Type-safe natif, routes typées bout-en-bout, évolutif vers multi-profils V2 |
| Structure | Routes plates (7 routes) | Pas de layouts imbriqués complexes |
| Guards | 3 guards avant rendu | ProfileGuard · CameraGuard · SessionPeriodGuard |

```
Routes :
/onboarding       ProfileGuard (si onboarding déjà fait → /home)
/handoff          Post-onboarding uniquement
/home             CameraGuard + SessionPeriodGuard
/session          CameraGuard requis
/parent           Accessible depuis /home uniquement
/recovery/camera  CameraGuard déclenché
/recovery/profile ProfileGuard déclenché
```

**State Management — Zustand**

| Décision | Choix | Rationale |
|---|---|---|
| Library | Zustand | Léger (1.5 kB), sélecteurs fins, pas de re-renders sur état haute fréquence |
| Pattern | Stores séparés par domaine | Isolation des mises à jour — l'état MediaPipe ne re-rend pas les écrans parent |

Stores Zustand :
```typescript
useSessionStore    // zone active, zoneProgress, statut détection, phase session
useProfileStore    // profil chargé, onboardingComplete
useCameraStore     // permissionState, détectionQuality
useEpisodeStore    // épisode courant, progression narrative
```

**Architecture Composants**

Organisation par domaine fonctionnel :
```
src/
  components/
    session/       NebulaCanvas, CameraFade, PulseButton
    onboarding/    EmojiPicker, NarrativeCard, PermissionRecovery
    parent/        ProfileSettings, ParentAccessIcon
    shared/        CelebrationOverlay
  stores/          Zustand stores
  lib/
    mediapipe/     Wrapper MediaPipe + types
    db/            Dexie schema + queries
    speech/        Web Speech API wrapper
    sw/            Service Worker config
  routes/          TanStack Router route definitions
  guards/          ProfileGuard, CameraGuard, SessionPeriodGuard
```

**Performance**

| Optimisation | Décision |
|---|---|
| WASM MediaPipe | Chargé en différé au tap session (pas au démarrage) |
| Bundle splitting | Route-based code splitting (TanStack Router natif) |
| Canvas | `requestAnimationFrame` + sélecteurs Zustand fins — zéro re-render React pendant session |
| Assets audio | Web Speech API = 0 Mo de cache |

---

### Infrastructure & Déploiement

| Aspect | Décision | Rationale |
|---|---|---|
| Hébergement | GitHub Pages | Statique, gratuit, distribution par lien direct |
| CI/CD | GitHub Actions | Deploy automatique sur push `main` — zéro friction |
| Environnements | `main` → production uniquement | Solo dev, pas de staging |
| Distribution | Lien direct (SMS / messagerie) | Pas d'App Store, pas de SEO |
| Monitoring | Aucun V1 | Données manuelles via localStorage (signal de transfert) |

Pipeline GitHub Actions :
```yaml
push main → npm ci → npm run build → deploy GitHub Pages
```

---

### Analyse d'Impact des Décisions

**Séquence d'implémentation recommandée :**
1. Init projet (Vite + React + TS + Tailwind + vite-plugin-pwa)
2. Spike MediaPipe — prototype isolé, validation conditions réelles ← **bloquant**
3. Dexie.js schema + stores Zustand
4. TanStack Router + guards de navigation
5. Composants session (NebulaCanvas, PulseButton, CameraFade)
6. Flux onboarding + passage de main
7. Intégration MediaPipe → NebulaCanvas
8. Web Speech API + narration épisodique
9. Service Worker + offline-first validation
10. CI/CD GitHub Actions

**Dépendances inter-décisions :**
- Zustand `useSessionStore` ↔ `NebulaCanvas` : couplage fort, concevoir ensemble
- Dexie.js schema ↔ `SessionPeriodGuard` : le guard lit `SessionHistory`
- MediaPipe WASM ↔ budget cache SW : WASM est le poste le plus lourd, à mesurer lors du spike
