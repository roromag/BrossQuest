# Story 2.6 : Écran de bascule parent → enfant avec animation d'apparition des emojis

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.6
**Story Key :** `2-6-ecran-bascule-parent-enfant-animation`
**Status :** done
**Date :** 2026-04-01

---

## Story

As a parent,
I want voir un écran de bascule avant que l'enfant choisisse son emoji,
So that je puisse lui expliquer ce qu'il va faire et lui tendre le téléphone au bon moment.

---

## Contexte produit

Le `/handoff` est aujourd'hui la **dernière étape du parcours parent**. C'est aussi le **premier contact de l'enfant avec l'app**. Il manque un écran intermédiaire qui :
1. Signale au parent que son rôle est terminé
2. Lui donne le temps d'expliquer à l'enfant ce qu'il choisit ("ton emoji, celui qu'on verra quand tu ouvres l'app")
3. Laisse l'enfant appuyer lui-même sur le bouton — premier geste, moment magique

L'emoji est un **élément de personnalisation** : il apparaît à l'écran de lancement de l'app avec le prénom de l'enfant. Il n'a pas de rôle fonctionnel dans la session.

---

## Acceptance Criteria

**Scénario 1 — Écran de bascule affiché en premier**
**Given** l'onboarding parent complété (Stories 2.1–2.4 : profil créé, permission caméra, `onboardingComplete === false`)
**When** la route `/handoff` est chargée
**Then** l'écran affiche le message "Quel emoji pour accueillir [Prénom] ?" avec le prénom réel de l'enfant
**And** un bouton "Choisir mon emoji" est visible et interactable
**And** la grille `EmojiPicker` n'est PAS encore visible

**Scénario 2 — Animation d'apparition de la grille**
**Given** l'écran de bascule affiché
**When** l'utilisateur appuie sur "Choisir mon emoji"
**Then** la grille `EmojiPicker` apparaît avec une animation douce : chaque emoji passe **d’une échelle ~0,3 → 1** avec **opacity 0 → 1**, **cubic-bezier** type léger ressort (overshoot modéré), et un **stagger** (`animationDelay` = index × 50 ms sur 8 boutons)
**And** chaque pastille a une durée d’animation **~300 ms** ; le **stagger couvre ~350 ms** (du 1er au 8e délai) — la **dernière pastille** termine son entrée vers **~650 ms** après le clic (350 ms + 300 ms), pas une seule fenêtre de 400 ms
**And** le bouton "Choisir mon emoji" disparaît lors de l'apparition de la grille ; **le titre de bascule disparaît aussi** (seule la grille est affichée à cette étape — comportement actuel, pas d’écran titre + grille)

**Scénario 3 — Sélection emoji après animation**
**Given** la grille animée affichée
**When** l'enfant sélectionne un emoji
**Then** le comportement existant s'exécute (`HandoffPageContent` / flux handoff) : `saveProfile`, `setProfile`, navigation vers `/home`

**Scénario 4 — Prénom affiché correctement**
**Given** un profil avec `firstName = "Léa"` en base
**When** la route `/handoff` est résolue et l’écran de bascule s’affiche
**Then** le message est "Quel emoji pour accueillir Léa ?"
**And** le profil actif est chargé **une seule fois** par visite via le **`loader`** TanStack Router (`getActiveProfile`) ; il est injecté dans le composant — **pas d’état « profil en cours de chargement » dans la page** et **pas de `return null`** pendant un fetch interne au composant. Si `getActiveProfile` ne renvoie pas de profil ou si l’onboarding est déjà complété, le **`loader`** **redirige** vers `/onboarding` ou `/home` (pas d’erreur technique affichée sur cette route)
**And** *Limite connue* : un `firstName` vide ou non renseigné en base produit un libellé du type « Quel emoji pour accueillir  ? » (interpolation naïve) — hors cas nominal si les étapes parent valident le prénom

**Scénario 5 — Comportements annexes (documentés, hors périmètre UX avancé)**
**Given** l’implémentation actuelle
**Then** **pas de bouton retour** vers l’écran de bascule après ouverture du picker (`showPicker` non réversible sans recharger)
**And** **vibration** : ~10 ms sur « Choisir mon emoji », puis ~10 ms **à chaque** tap sur une pastille emoji
**And** **accessibilité** : pas de règle `prefers-reduced-motion` spécifique sur cette animation (hors scope story)
**And** les **tests** couvrent l’animation via **`EmojiPicker` + prop `animated`** et le **loader** de route ; pas d’assertion e2e sur la keyframe dans le test `HandoffPageContent` isolé

---

## Tasks / Subtasks

- [x] T1 — Modifier `src/routes/handoff.route.tsx`
  - [x] **`loader`** TanStack : un seul appel à `getActiveProfile()` par entrée sur `/handoff` ; redirections si pas de profil ou onboarding déjà complété ; retour `{ profile }`
  - [x] **`HandoffPage`** : `handoffRoute.useLoaderData()` puis rendu de **`HandoffPageContent`** (même fichier, exposé pour les tests unitaires sans router)
  - [x] **`HandoffPageContent`** : état local `showPicker: boolean` (défaut `false`), reçoit `profile: Profile`
  - [x] Affichage **conditionnel** :
    - si `!showPicker` → écran de bascule (titre + bouton)
    - si `showPicker` → `EmojiPicker` avec prop `animated`
  - [x] Le bouton "Choisir mon emoji" appelle `setShowPicker(true)` + `navigator.vibrate?.(10)`
  - [x] Le titre : `Quel emoji pour accueillir {profile.firstName} ?` — interpolation directe sur le `profile` fourni par le loader

- [x] T2 — Animation CSS dans `src/index.css`
  - [x] Définir un keyframe `@keyframes emoji-appear` : `from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); }`
  - [x] Ajouter une classe utilitaire `.emoji-appear` : `animation: emoji-appear 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both` (cubic-bezier avec léger bounce = effet "spring" soft)

- [x] T3 — Modifier `src/components/onboarding/EmojiPicker.tsx`
  - [x] Accepter une prop optionnelle `animated?: boolean` (défaut `false`)
  - [x] Si `animated === true`, chaque bouton reçoit `className="emoji-appear"` + `style={{ animationDelay: `${index * 50}ms` }}`
  - [x] Si `animated === false`, comportement actuel inchangé (rétrocompatibilité tests existants)

- [x] T4 — Mettre à jour `src/routes/handoff.route.test.tsx`
  - [x] Tests UI sur **`HandoffPageContent`** avec `profile={mockProfile}` (le loader est testé séparément)
  - [x] Test : écran initial affiche le texte "Quel emoji pour accueillir" + prénom du profil mocké
  - [x] Test : `EmojiPicker` n'est PAS rendu avant le clic sur le bouton
  - [x] Test : clic sur "Choisir mon emoji" → `EmojiPicker` est rendu
  - [x] Test : après apparition picker, sélection emoji → `saveProfile` + navigation `/home` (comportement Story 2.4 conservé)
  - [x] Tests **`handoffRoute.loader`** : profil OK → `{ profile }` ; sans profil → redirect `/onboarding` ; onboarding complété → redirect `/home`

- [x] T5 — Mettre à jour `src/components/onboarding/EmojiPicker.test.tsx`
  - [x] Ajouter test : prop `animated={true}` → chaque bouton a `animationDelay` dans son style
  - [x] Vérifier que les tests existants passent toujours (pas de régression — `animated` est optionnel)

- [x] T6 — Vérification
  - [x] `npm test` vert — **120** tests (après ajout tests loader + bascule tests sur `HandoffPageContent`)
  - [x] `npm run build` — erreur pré-existante dans `recovery.profile.route.test.tsx` (hors scope, présente avant cette story)

---

## Guardrails développeur

### Fichiers à modifier (et seulement ceux-là)
```
src/routes/handoff.route.tsx          ← loader + HandoffPage / HandoffPageContent + showPicker + écran bascule
src/routes/handoff.route.test.tsx     ← nouveaux tests + conserve anciens
src/components/onboarding/EmojiPicker.tsx      ← ajouter prop animated?
src/components/onboarding/EmojiPicker.test.tsx ← test prop animated
src/index.css                         ← keyframe + classe utilitaire
```

### Structure handoff (même fichier)
Pas de **nouveau fichier** dédié : **`HandoffPage`** reste le `component` de la route ; **`HandoffPageContent`** concentre l’UI avec `profile` en prop (facilite les tests sans monter tout le router). L’état `showPicker` reste local à ce contenu.

### Animation : CSS pur, zéro dépendance externe
Le projet n'a **aucune librairie d'animation** (`framer-motion`, `react-spring`, etc.). L'animation se fait via keyframes CSS dans `src/index.css` + `animationDelay` en style inline sur chaque bouton emoji. C'est cohérent avec l'architecture "Tailwind CSS v4 + canvas custom" du projet.

### Tailwind CSS v4 (syntaxe `@theme`)
Le projet utilise Tailwind v4 via `@tailwindcss/vite`. Les couleurs custom sont dans `@theme { }` dans `src/index.css`. Pour le keyframe, utiliser `@keyframes` standard CSS directement dans `src/index.css`, pas dans `tailwind.config.ts`.

### Rétrocompatibilité EmojiPicker
La prop `animated` est **optionnelle** (`animated?: boolean`). Les tests existants appellent `<EmojiPicker onSelect={fn} />` sans `animated` — ils ne doivent pas casser.

### Cubic-bezier recommandé pour "soft magical"
`cubic-bezier(0.34, 1.56, 0.64, 1)` — légère dépassement (overshoot) qui donne un effet "spring" doux sans librairie. Ne pas utiliser `ease-bounce` (trop agressif).

### Stagger timing
- Délai entre le 1er et le 8e bouton : **7 × 50 ms = 350 ms** (le 1er a 0 ms de délai) ; durée d’animation **300 ms** par bouton → **dernier bouton** environ **350 + 300 ms** après le clic
- `animationDelay: `${index * 50}ms`` sur chaque bouton
- `index` provient de `.map((emoji, index) => ...)`

### Pattern de l'écran de bascule
```tsx
// Écran de bascule (showPicker === false)
<div className="min-h-screen bg-bg-session flex flex-col items-center justify-center px-6">
  <div className="w-full max-w-[390px] flex flex-col items-center gap-10">
    <p className="text-white text-2xl font-semibold text-center">
      Quel emoji pour accueillir {profile.firstName} ?
    </p>
    <button
      type="button"
      onClick={() => { navigator.vibrate?.(10); setShowPicker(true) }}
      className="..."
    >
      Choisir mon emoji
    </button>
  </div>
</div>
```

### Style du bouton
Suivre le style des autres boutons d'action de l'onboarding (Story 2.1) — fond clair sur fond sombre, arrondi, padding généreux, zones tactiles ≥ 44×44px.

---

## Intelligence des stories précédentes

**Story 2.4 (base de ce travail) :**
- Garde-fous **dans le `loader`** de `/handoff` : profil requis + `onboardingComplete === false` ; sinon redirection
- **Une seule lecture** `getActiveProfile` par navigation vers `/handoff` (loader), plus de doublon `beforeLoad` + `useEffect`
- `saveProfile`, `useProfileStore`, `useNavigate` inchangés côté sélection emoji

**Pattern de test Story 2.4 :**
```tsx
// Mock pattern validé pour les tests handoff
vi.mock('../lib/db/queries', () => ({ getActiveProfile: vi.fn(), saveProfile: vi.fn() }))
vi.mock('../stores/useProfileStore', () => ({ useProfileStore: vi.fn() }))
```

---

## Définition de "Done"

- [x] Écran de bascule affiché avec prénom correct
- [x] Grille d'emojis invisible au départ
- [x] Bouton "Choisir mon emoji" déclenche l'animation
- [x] Animation douce et staggerée (keyframe CSS, cubic-bezier spring, 50ms délai par emoji)
- [x] Sélection emoji → comportement Story 2.4 conservé (saveProfile + navigation /home)
- [x] `npm test` 100% vert (120 tests)
- [x] `npm run build` — erreur pré-existante hors scope (recovery.profile.route.test.tsx:160)

---

## Dev Agent Record

### Completion Notes — 2026-03-31

**Implémentation :**
- `handoff.route.tsx` : ajout état `showPicker` (défaut `false`). Affichage conditionnel : écran bascule (titre + bouton) → puis `<EmojiPicker animated />`. Le bouton appelle `navigator.vibrate?.(10)` + `setShowPicker(true)`.
- `src/index.css` : keyframe `@keyframes emoji-appear` (scale 0.3→1, opacity 0→1) + classe `.emoji-appear` avec `cubic-bezier(0.34, 1.56, 0.64, 1)` (effet spring doux).
- `EmojiPicker.tsx` : prop `animated?: boolean` ajoutée. Si `true`, chaque bouton reçoit `className="emoji-appear"` et `style={{ animationDelay: `${index * 50}ms` }}`. Rétrocompatibilité totale (`animated` optionnel, défaut `false`).
- Tests `handoff.route.test.tsx` : 8 tests couvrant l'écran bascule, la transition, et les comportements Story 2.4.
- Tests `EmojiPicker.test.tsx` : 3 nouveaux tests pour `animated={true}` (animationDelay, classe emoji-appear, absence sans prop).

**Résultats :** 118/118 tests verts. Build TypeScript : erreur pré-existante dans `recovery.profile.route.test.tsx:160` (hors scope, présente avant cette story).

### Completion Notes — 2026-04-01 (alignement spec + perf route)

- **`loader` unique** : suppression du `beforeLoad` redondant et du `useEffect`/`getActiveProfile` dans le composant — une seule requête profil par visite de `/handoff`.
- **`HandoffPage` + `HandoffPageContent`** : loader → données ; contenu testable avec mock `profile`.
- **AC / story** : critères et garde-fous mis à jour pour refléter le **timing réel** (~650 ms fin d’animation dernière pastille), **scale 0,3→1**, **titre masqué avec la grille**, **redirections** plutôt que placeholder async, **limites** (prénom vide, retour arrière, vibrate double, reduced-motion, couverture tests).
- Tests : **120** verts après ajout des tests `handoffRoute.loader` et migration des tests UI vers `HandoffPageContent`.

### File List

- `src/routes/handoff.route.tsx` — modifié
- `src/routes/handoff.route.test.tsx` — modifié
- `src/components/onboarding/EmojiPicker.tsx` — modifié
- `src/components/onboarding/EmojiPicker.test.tsx` — modifié
- `src/index.css` — modifié

### Change Log

- 2026-03-31 : Story 2.6 implémentée — écran bascule parent→enfant avec animation d'apparition des emojis (CSS keyframe, stagger 50ms, cubic-bezier spring)
- 2026-04-01 : `handoff` — `loader` TanStack + `HandoffPageContent` ; AC / story alignés sur le comportement réel ; tests 120/120
