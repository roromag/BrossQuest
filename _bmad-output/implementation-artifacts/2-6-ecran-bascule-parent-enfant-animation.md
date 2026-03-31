# Story 2.6 : Écran de bascule parent → enfant avec animation d'apparition des emojis

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.6
**Story Key :** `2-6-ecran-bascule-parent-enfant-animation`
**Status :** review
**Date :** 2026-03-30

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
**Then** la grille `EmojiPicker` apparaît avec une animation douce : chaque emoji scale de 0 → 1 avec un effet spring (ease-out), en stagger (délai croissant par emoji)
**And** l'animation dure environ 400ms au total (8 emojis × ~50ms de délai entre chaque)
**And** le bouton "Choisir mon emoji" disparaît lors de l'apparition de la grille

**Scénario 3 — Sélection emoji après animation**
**Given** la grille animée affichée
**When** l'enfant sélectionne un emoji
**Then** le comportement existant de `HandoffPage` s'exécute : `saveProfile`, `setProfile`, navigation vers `/home`

**Scénario 4 — Prénom affiché correctement**
**Given** un profil avec `firstName = "Léa"` en base
**When** l'écran de bascule s'affiche
**Then** le message est "Quel emoji pour accueillir Léa ?"
**And** si le profil n'est pas encore chargé (async), le message affiche une version sans prénom ou un placeholder sobre — pas d'erreur visible

---

## Tasks / Subtasks

- [x] T1 — Modifier `src/routes/handoff.route.tsx`
  - [x] Ajouter un état local `showPicker: boolean` (défaut `false`)
  - [x] Afficher **conditionnellement** :
    - si `!showPicker` → écran de bascule (titre + bouton)
    - si `showPicker` → `EmojiPicker` avec classe d'animation
  - [x] Le bouton "Choisir mon emoji" appelle `setShowPicker(true)` + `navigator.vibrate?.(10)`
  - [x] Le titre : `Quel emoji pour accueillir {profile.firstName} ?` — interpolation directe, zéro état séparé
  - [x] Si profil non encore chargé → `return null` (comportement actuel conservé)

- [x] T2 — Animation CSS dans `src/index.css`
  - [x] Définir un keyframe `@keyframes emoji-appear` : `from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); }`
  - [x] Ajouter une classe utilitaire `.emoji-appear` : `animation: emoji-appear 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both` (cubic-bezier avec léger bounce = effet "spring" soft)

- [x] T3 — Modifier `src/components/onboarding/EmojiPicker.tsx`
  - [x] Accepter une prop optionnelle `animated?: boolean` (défaut `false`)
  - [x] Si `animated === true`, chaque bouton reçoit `className="emoji-appear"` + `style={{ animationDelay: `${index * 50}ms` }}`
  - [x] Si `animated === false`, comportement actuel inchangé (rétrocompatibilité tests existants)

- [x] T4 — Mettre à jour `src/routes/handoff.route.test.tsx`
  - [x] Test : écran initial affiche le texte "Quel emoji pour accueillir" + prénom du profil mocké
  - [x] Test : `EmojiPicker` n'est PAS rendu avant le clic sur le bouton
  - [x] Test : clic sur "Choisir mon emoji" → `EmojiPicker` est rendu
  - [x] Test : après apparition picker, sélection emoji → `saveProfile` + navigation `/home` (comportement Story 2.4 conservé)

- [x] T5 — Mettre à jour `src/components/onboarding/EmojiPicker.test.tsx`
  - [x] Ajouter test : prop `animated={true}` → chaque bouton a `animationDelay` dans son style
  - [x] Vérifier que les tests existants passent toujours (pas de régression — `animated` est optionnel)

- [x] T6 — Vérification
  - [x] `npm test` vert (tous les tests existants + nouveaux) — 118/118 tests passent
  - [x] `npm run build` — erreur pré-existante dans `recovery.profile.route.test.tsx` (hors scope, présente avant cette story)

---

## Guardrails développeur

### Fichiers à modifier (et seulement ceux-là)
```
src/routes/handoff.route.tsx          ← ajouter état showPicker + écran bascule
src/routes/handoff.route.test.tsx     ← nouveaux tests + conserve anciens
src/components/onboarding/EmojiPicker.tsx      ← ajouter prop animated?
src/components/onboarding/EmojiPicker.test.tsx ← test prop animated
src/index.css                         ← keyframe + classe utilitaire
```

### NE PAS créer de nouveau composant
Le `HandoffPage` existant est suffisant — ajouter un état `showPicker` en local. Pas de nouveau fichier, pas de nouveau composant.

### Animation : CSS pur, zéro dépendance externe
Le projet n'a **aucune librairie d'animation** (`framer-motion`, `react-spring`, etc.). L'animation se fait via keyframes CSS dans `src/index.css` + `animationDelay` en style inline sur chaque bouton emoji. C'est cohérent avec l'architecture "Tailwind CSS v4 + canvas custom" du projet.

### Tailwind CSS v4 (syntaxe `@theme`)
Le projet utilise Tailwind v4 via `@tailwindcss/vite`. Les couleurs custom sont dans `@theme { }` dans `src/index.css`. Pour le keyframe, utiliser `@keyframes` standard CSS directement dans `src/index.css`, pas dans `tailwind.config.ts`.

### Rétrocompatibilité EmojiPicker
La prop `animated` est **optionnelle** (`animated?: boolean`). Les tests existants appellent `<EmojiPicker onSelect={fn} />` sans `animated` — ils ne doivent pas casser.

### Cubic-bezier recommandé pour "soft magical"
`cubic-bezier(0.34, 1.56, 0.64, 1)` — légère dépassement (overshoot) qui donne un effet "spring" doux sans librairie. Ne pas utiliser `ease-bounce` (trop agressif).

### Stagger timing
- 8 emojis × 50ms = 400ms total pour que la grille soit entièrement visible
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
- `HandoffPage` utilise déjà `useState`, `useEffect`, `getActiveProfile`, `saveProfile`, `useProfileStore`, `useNavigate` — tout est en place, ne pas réimporter
- Le guard de `/handoff` garantit que le profil existe en DB → `profile` sera toujours non-null après chargement
- Le `if (!profile) return null` pendant le chargement async est le pattern validé

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
- [x] `npm test` 100% vert (118/118)
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

### File List

- `src/routes/handoff.route.tsx` — modifié
- `src/routes/handoff.route.test.tsx` — modifié
- `src/components/onboarding/EmojiPicker.tsx` — modifié
- `src/components/onboarding/EmojiPicker.test.tsx` — modifié
- `src/index.css` — modifié

### Change Log

- 2026-03-31 : Story 2.6 implémentée — écran bascule parent→enfant avec animation d'apparition des emojis (CSS keyframe, stagger 50ms, cubic-bezier spring)
