# Story 3.1 : Écran d'accueil atmosphérique & PulseButton

**Epic :** 3 — Session technique complète — moteur détection, nébuleuse & pipeline Avant/Pendant/Après
**Story ID :** 3.1
**Story Key :** `3-1-ecran-accueil-atmospherique-pulsebutton`
**Status :** review
**Date :** 2026-04-01

---

## Story

As a enfant (ou parent),
I want voir l'écran d'accueil atmosphérique avec le bouton de lancement,
So that lancer une session en un seul tap.

---

## Contexte produit

Cette story ouvre l'Epic 3 et constitue le point d'entree quotidien de la session. L'ecran `/home` doit etre:
- Immediate a comprendre (enfant non-lecteur)
- Coherent avec le rituel (fond atmospherique + episode courant + action unique)
- Techniquement pret pour la suite (chargement differe MediaPipe sans bloquer l'app)

Cette story ne lance pas encore la session complete (Story 3.2+), mais elle doit poser les contrats UI/state qui permettront l'integration camera et detection sans refonte.

---

## Acceptance Criteria

**Scenario 1 - Rendu de l'ecran d'accueil**
**Given** l'onboarding est complete et la route `/home` est accessible
**When** l'ecran se charge
**Then** `NarrativeCard` affiche un fond etoile CSS, le titre de l'episode courant, et `PulseButton` centre
**And** `ParentAccessIcon` est visible avec opacite 40%, hors parcours enfant principal

**Scenario 2 - Etats du PulseButton**
**Given** la route `/home` est affichee
**When** aucune presence n'est detectee
**Then** `PulseButton` est en etat `idle` (pulse lent)
**And When** une presence est detectee
**Then** `PulseButton` passe en etat `presence-detected` (pulse accelere)

**Scenario 3 - Gate de chargement MediaPipe**
**Given** la route `/home` est affichee
**When** `useCameraStore.isMediaPipeLoading === true`
**Then** `PulseButton` est desactive
**And** aucun spinner n'est affiche
**And** le bouton devient interactif quand `isMediaPipeLoading === false`

**Scenario 4 - Contraintes layout session-ready**
**Given** l'ecran `/home`
**When** il est rendu sur iOS Safari/Android Chrome mobile
**Then** le layout occupe 100vw x 100dvh
**And** les safe areas iOS (`env(safe-area-inset-*)`) sont respectees
**And** aucun chrome navigateur parasite n'est introduit par le layout applicatif

---

## Tasks / Subtasks

- [x] T1 - Assembler l'ecran `/home` autour de `NarrativeCard`
  - [x] Verifier que le titre episode provient de `useEpisodeStore` (selecteur fin)
  - [x] Integrer `PulseButton` en element central unique de l'action enfant
  - [x] Integrer `ParentAccessIcon` discret (opacite 40%, zone tap parent >= 44x44)

- [x] T2 - Gerer les etats `PulseButton` via stores existants
  - [x] Mapper `idle` / `presence-detected` depuis l'etat camera (sans hook global non-selectif)
  - [x] Desactiver le bouton tant que `isMediaPipeLoading` est vrai
  - [x] Garder la logique de lancement session hors scope de cette story (sera Story 3.2)

- [x] T3 - Verrouiller les contraintes de structure/layout
  - [x] Appliquer `100dvh` et safe areas au container ecran
  - [x] Verifier l'affichage iPhone SE (compact) et devices standards
  - [x] Eviter toute regression parent/enfant dans le routage existant

- [x] T4 - Ajouter/adapter les tests
  - [x] Tests unitaires composant `NarrativeCard` et/ou route `/home` pour presence des elements critiques
  - [x] Tests etats `PulseButton` (idle, presence-detected, disabled sur loading)
  - [x] Test de non-regression acces `ParentAccessIcon` (visible mais discret)

- [x] T5 - Verification locale
  - [x] `npm test` vert
  - [x] `npm run build` sans nouvelle erreur liee a cette story

---

## Guardrails developpeur

### Fichiers cibles probables
```
src/routes/home.route.tsx
src/components/onboarding/NarrativeCard.tsx
src/components/session/PulseButton.tsx
src/components/parent/ParentAccessIcon.tsx
src/stores/useCameraStore.ts
src/stores/useEpisodeStore.ts
src/index.css
```

### Regles d'architecture a respecter
- Aucun import direct `@mediapipe/tasks-vision` hors `src/lib/mediapipe/`
- Selecteurs Zustand fins uniquement (`useXStore(s => s.y)`)
- Aucune erreur technique exposee dans le flux enfant (`/home`, `/session`, `/handoff`)
- Persistance via Dexie uniquement (pas de `localStorage` fonctionnel)
- Tests co-localises (`*.test.tsx` a cote des composants)

### Regles UX non-negociables pour cette story
- `PulseButton` = action unique, centre, min 120x120
- Pas de spinner sur chargement MediaPipe (discret, non anxiogene)
- `ParentAccessIcon` visible mais non intrusif (opacite 40%)
- Flux enfant non-textuel prioritaire (le titre episode reste signal contextuel)
- Palette et ambiance conformes aux tokens (`bg-session`, `accent-cyan`, etc.)

### Contrats inter-storys (important)
- Story 3.1 prepare le terrain UI/state
- Story 3.2 branchera `getUserMedia` dans le tap utilisateur (contrainte iOS stricte)
- Story 3.3 branchera `CameraFade` et narration placeholder
- Ne pas precoce-implanter des comportements de session avances ici

---

## Conformite architecture

- **Stack:** React + TypeScript + TanStack Router + Zustand + Tailwind v4
- **Routing:** `/home` reste la frontiere enfant avec guards resolus avant rendu
- **State:** `useCameraStore` et `useEpisodeStore` via selecteurs fins
- **Performance:** chargement MediaPipe differe, pas de blocage du demarrage app
- **Compatibilite:** iOS Safari >= 15.4 et Android Chrome >= 100
- **Accessibilite fonctionnelle:** zones tactiles parent >= 44x44, enfant >= 56x56 (PulseButton depasse deja)

---

## Exigences bibliotheques & versions (veille)

Validation web rapide au 2026-04-01:
- `vite-plugin-pwa` stable: `1.2.0`
- `@mediapipe/tasks-vision` stable npm: `0.10.34`
- TanStack Router v1: recommandation guard via `beforeLoad` / contexte routeur type

Implication pour le dev:
- Ne pas introduire de lib animation externe pour cette story (CSS/canvas natif attendu)
- Conserver la strategie Workbox existante (pas de changement SW dans cette story)
- Garder la logique de guards dans les patterns TanStack deja poses

---

## Structure projet & references

- PRD: `_bmad-output/planning-artifacts/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- UX spec: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Epics/stories: `_bmad-output/planning-artifacts/epics.md`
- Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`

Points source majeurs:
- AC story 3.1 definis dans `epics.md`
- Tokens et comportement UX (`NarrativeCard`, `PulseButton`, layout plein ecran) dans UX spec
- Regles absolues (imports MediaPipe, erreurs enfant, Zustand, Dexie) dans architecture

---

## Definition of Done

- [ ] Les 4 AC de la story 3.1 sont couverts par implementation + tests
- [ ] Aucun conflit avec guards/routes existants
- [ ] Pas de regression sur onboarding/handoff/home
- [ ] `npm test` passe
- [ ] `npm run build` passe ou n'introduit aucune nouvelle erreur

---

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex-low

### Debug Log References

- Analyse artefacts planning/implementation
- Veille versions libs critiques (PWA/MediaPipe/Router)
- Implémentation `NarrativeCard` + `PulseButton` + `ParentAccessIcon` et assemblage route `/home`
- Validation tests: `npm test` (18 files, 124 tests passants)
- Build vérifié: `npm run build` passe TypeScript + bundle, échec final Workbox/Terser déjà présent dans la chaîne SW

### Completion Notes List

- Écran `/home` assemblé autour de `NarrativeCard` avec fond atmosphérique, titre d'épisode depuis `useEpisodeStore` (sélecteur fin), `PulseButton` central et `ParentAccessIcon` discret
- États `PulseButton` branchés sur `useCameraStore` (idle vs presence-detected) + désactivation stricte pendant `isMediaPipeLoading`, sans spinner
- Contraintes layout appliquées (`100dvh`, `100vw`, safe areas iOS) sans modifier les guards de routage
- Tests ajoutés pour les éléments critiques `/home`, états du bouton et non-régression visibilité/discrétion de l'accès parent
- La logique de lancement de session reste volontairement hors scope (Story 3.2)

### File List

- `_bmad-output/implementation-artifacts/3-1-ecran-accueil-atmospherique-pulsebutton.md` (modifié)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)
- `src/routes/home.route.tsx` (modifié)
- `src/routes/home.route.test.tsx` (nouveau)
- `src/components/onboarding/NarrativeCard.tsx` (nouveau)
- `src/components/session/PulseButton.tsx` (nouveau)
- `src/components/parent/ParentAccessIcon.tsx` (nouveau)
- `src/index.css` (modifié)

## Change Log

- 2026-04-01: Implémentation story 3.1 complète (écran `/home` atmosphérique, états `PulseButton`, accès parent discret, tests associés)
