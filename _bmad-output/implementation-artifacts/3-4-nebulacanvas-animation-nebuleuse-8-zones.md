# Story 3.4 : NebulaCanvas — animation nébuleuse 8 zones

**Epic :** 3 — Session technique complète — moteur détection, nébuleuse & pipeline Avant/Pendant/Après  
**Story ID :** 3.4  
**Story Key :** `3-4-nebulacanvas-animation-nebuleuse-8-zones`  
**Status :** review  
**Date :** 2026-04-02

_Note : analyse contexte « ultimate story » terminée — guide d’implémentation pour l’agent dev._

---

## Story

As a enfant,  
I want voir une animation qui se déplace lentement pendant que je brosse,  
So that être guidé implicitement vers chaque zone sans instruction explicite.

---

## Contexte produit

La Story 3.3 a livré `NebulaCanvas` comme **placeholder** statique (`bg-[#0a1810]`) sous `CameraFade`. Cette story remplace l’interne par un **canvas HTML5** plein écran : système de particules, **8 positions spatiales** (quadrants × avant/arrière), dérive ~3 s entre zones, styles visuels distincts avant/arrière, réaction à la **vélocité** et à la **machine d’états de détection** — conformément à l’UX et à l’architecture.

**Périmètre voisin :**

- **Story 3.5** câble MediaPipe → progression temps / `advanceZone` / timer DEBOUNCING réel. En 3.4, les champs Zustand doivent être **lisibles** par le canvas et **initialisés** de façon cohérente à l’entrée en phase `during` ; la logique complète des transitions peut rester minimale côté détecteur tant que les **comportements visuels** des AC sont testables (mocks / setters de store).
- **Story 3.6** : micro-événement inattention (teinte `#F6AD55` 800 ms) — **hors scope 3.4**.
- **Story 3.6** : `HandLostOverlay` — **hors scope 3.4** ; en 3.4, seul le **gel** du canvas sur `HAND_LOST` est exigé.

---

## Acceptance Criteria

**Scénario 1 — Dérive organique & styles par zone**

**Given** la phase `'during'` active et `NebulaCanvas` rendu plein écran  
**When** `activeZone` change (1–8)  
**Then** la nébuleuse dérive organiquement vers la position spatiale correspondante en ~3s  
**And** zones avant (1, 3, 5, 7) : nébuleuse étendue, couleur `#48BB78`, particules rapides et légères  
**And** zones arrière (2, 4, 6, 8) : nébuleuse contractée, couleur `#2D6A4F`, particules lentes et denses  
**And** `NebulaCanvas` lit `activeZone`, `velocity` et `detectionState` via sélecteurs Zustand fins — jamais le store entier  
**And** quand `detectionState` passe à `DEBOUNCING` ou `PAUSED` : l'animation ralentit progressivement sur `BRUSHING_CONFIG.pauseAnimationDurationMs` (2s) puis s'arrête — aucun son, aucune couleur d'alerte  
**And** quand `detectionState` repasse à `BRUSHING` (reprise) : l'animation repart depuis le début de son cycle en `BRUSHING_CONFIG.resumeAnimationDurationMs` (0.5s) — jamais depuis la position au ralenti  
**And** quand `detectionState` est `HAND_LOST` : `NebulaCanvas` reste figé à son état courant  
**And** aucune interaction tactile sur le canvas  
**And** le canvas tient ≥ 30fps sur iPhone SE 2nd gen (NFR-P4)

**Scénario 2 — Cohérence UX & accessibilité décorative**

**Given** le canvas actif  
**Then** le calque reste décoratif : `role="presentation"` et `aria-hidden={true}` conservés (comme le placeholder 3.3)  
**And** dimensions : s’aligner sur l’UX — taille canvas via `width/height` × `devicePixelRatio`, resize au `resize` / `orientationchange` si pertinent [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — dimensions canvas]

---

## Tasks / Subtasks

- [x] T1 — Config & types machine à états
  - [x] Exporter `BRUSHING_CONFIG` (`pauseThresholdMs`, `pauseAnimationDurationMs`, `resumeAnimationDurationMs`) depuis `src/lib/mediapipe/` — fichier dédié léger (ex. `brushingConfig.ts`) **sans** import `@mediapipe/tasks-vision`, pour consommation par `NebulaCanvas` et future 3.5 [Source: `architecture.md` — BRUSHING_CONFIG]
  - [x] Aligner le type `detectionState` consommé par la session / canvas sur les 4 états architecture : `BRUSHING` | `DEBOUNCING` | `PAUSED` | `HAND_LOST` [Source: `architecture.md` — Machine d’états]. Migrer depuis le spike (`brushing-active`, `pause`, `absent`) : mettre à jour `types.ts`, `useCameraStore`, `detector.ts`, `spike.route.tsx`, tests — avec mapping explicite documenté en Dev Notes (DEBOUNCING peut être produit de façon minimale jusqu’à 3.5 si nécessaire, mais le **rendu** NebulaCanvas doit implémenter les AC).

- [x] T2 — Données Zustand pour le canvas
  - [x] Exposer une **vélocité scalaire** lisible par le canvas (ex. `brushVelocitySmoothed` dérivée de `VelocityData.smoothed` ou équivalent) dans `useCameraStore`, mise à jour en 3.5 depuis MediaPipe ; en 3.4 : valeur par défaut cohérente à l’entrée en `during` + possibilité de tests.
  - [x] À la transition vers `phase === 'during'` (ex. après `CameraFade`), initialiser `detectionState` à `BRUSHING` (et vélocité par défaut) pour une animation « normale » jusqu’au branchement complet 3.5.

- [x] T3 — Implémenter `NebulaCanvas` (canvas + rAF)
  - [x] Remplacer le `<div>` placeholder par `<canvas>` plein écran dans le conteneur session existant.
  - [x] Boucle `requestAnimationFrame` : lire l’état via `useSessionStore.getState()` / `useCameraStore.getState()` ou **abonnement** `store.subscribe` pour éviter un re-render React à chaque frame [Source: `architecture.md` — Canvas + sélecteurs fins, zéro re-render React pendant session à haute fréquence].
  - [x] Mapper les 8 zones à des **cibles spatiales** (ex. positions normalisées sur le canvas) ; interpolation douce ~3 s vers la cible quand `activeZone` change.
  - [x] Varier densité / vitesse particules : avant vs arrière (couleurs UX `#48BB78` / `#2D6A4F`) ; moduler par `velocity` (réactivité temps réel quand la valeur sera alimentée).
  - [x] Implémenter ralentissement progressif (2 s) sur DEBOUNCING/PAUSED, arrêt, reprise cycle (0,5 s) sur BRUSHING selon AC ; figer sur HAND_LOST.
  - [x] Aucun écouteur `pointer` / `touch` sur le canvas.

- [x] T4 — Tests & qualité
  - [x] Étendre `NebulaCanvas.test.tsx` : présence canvas, props d’accessibilité, tests de comportement avec **mocks Zustand** ou wrappers (changement `activeZone` / `detectionState`) sans dépendre de MediaPipe.
  - [x] Ajuster / ajouter tests store ou types si migration `DetectionState`.
  - [x] `npm test` et `npm run build` verts.

---

## Dev Notes

### Garde-fous techniques

- **Pas de librairie d’animation externe** pour le canvas [Source: `ux-design-specification.md` — Canvas API + requestAnimationFrame].
- **Imports MediaPipe :** `NebulaCanvas` ne doit **pas** importer `@mediapipe/tasks-vision` ; uniquement stores + config TS partagée.
- **Sélecteurs Zustand fins :** en React, ne pas appeler `useSessionStore()` sans sélecteur ; pour la boucle canvas, préférer `getState()` / `subscribe` pour les valeurs à haute fréquence.
- **Couleurs / tokens :** alignement UX-DR1 / UX-DR3 — avant `#48BB78`, arrière `#2D6A4F` [Source: `epics.md`, `ux-design-specification.md`].
- **Performance :** limiter allocations dans la boucle rAF ; viser NFR-P4 (≥ 30 fps sur cible iPhone SE 2).

### Carte des zones (rappel epic)

- Avant : zones **1, 3, 5, 7** — étendu, particules rapides/légères.  
- Arrière : zones **2, 4, 6, 8** — contracté, particules lentes/denses.

### Migration `DetectionState` (spike → produit)

Le code actuel utilise `brushing-active` | `pause` | `absent` dans `src/lib/mediapipe/types.ts`. Les AC epic et `architecture.md` exigent `BRUSHING` | `DEBOUNCING` | `PAUSED` | `HAND_LOST`.  
**Attendu :** unifier le type dans le codebase, adapter `classifyState` / résultats détecteur et tous les tests ; où la distinction DEBOUNCING (timer 3 s) n’est pas encore implémentée côté détecteur, le comportement **visuel** DEBOUNCING doit quand même être validable via mise à jour manuelle du store dans les tests — la **logique timer complète** reste explicitement la Story 3.5.

**Mapping appliqué (Story 3.4) :** `brushing-active` → `BRUSHING` · `pause` → `DEBOUNCING` (détecteur, sans timer 3 s — Story 3.5) · `absent` (pas de landmark) → `HAND_LOST`. Qualité `DetectionQuality` conserve la valeur `'absent'` indépendamment. L’état `PAUSED` est consommé par le canvas et les tests ; production côté détecteur en 3.5.

### Anti-patterns à éviter

- Re-render de tout le tree à 60 Hz via hooks Zustand non optimisés sur le canvas.
- Dupliquer `BRUSHING_CONFIG` en dur dans le composant — source unique dans `lib/mediapipe/`.
- Implémenter le micro-événement ambre ou `HandLostOverlay` (Stories 3.6).
- Interaction enfant sur le canvas (AC : zéro tactile).

### Intelligence Story 3.3 (continuité)

- `NebulaCanvas` est monté sous `session.route.tsx` lorsque `phase === 'during'` ; `CameraFade` laisse un fond cohérent avant transition — conserver l’enveloppe layout (plein écran, safe areas).
- Fichiers touchés récemment : `session.route.tsx`, `CameraFade.tsx`, `NebulaCanvas.tsx`, `useSessionStore.ts`, `useCameraStore.ts`, `home.launch-session.ts`.
- Redirection `/recovery/camera` si pas de stream **sauf** phases `during` / `after` — ne pas régresser ce comportement.

### Structure fichiers (architecture)

[Source: `_bmad-output/planning-artifacts/architecture.md`]

- `src/components/session/NebulaCanvas.tsx` + `NebulaCanvas.test.tsx`
- `src/stores/useCameraStore.ts` (+ tests)
- `src/stores/useSessionStore.ts` — `activeZone` déjà présent
- `src/lib/mediapipe/types.ts`, `detector.ts`, `detector.test.ts`
- `src/routes/spike.route.tsx` si couleurs / états affichés selon ancien enum

### Références

- Epics : `_bmad-output/planning-artifacts/epics.md` — Story 3.4, UX-DR3
- Architecture : `_bmad-output/planning-artifacts/architecture.md` — NebulaCanvas, Zustand, BRUSHING_CONFIG, DetectionState
- UX : `_bmad-output/planning-artifacts/ux-design-specification.md` — nébuleuse 8 zones, canvas, pipeline Pendant
- Story précédente : `_bmad-output/implementation-artifacts/3-3-phase-avant-camerafade-narration-placeholder.md`

---

## Definition of Done

- [x] AC scénarios 1–2 couverts en code et tests automatisés là où c’est faisable sans appareil.
- [x] `NebulaCanvas` = canvas animé (plus simple div placeholder) avec règles avant/arrière, dérive ~3 s, états BRUSHING / DEBOUNCING / PAUSED / HAND_LOST + config centralisée.
- [x] Zéro import `@mediapipe/tasks-vision` hors `src/lib/mediapipe/`.
- [x] `npm test` et `npm run build` OK.

---

## Dev Agent Record

### Agent Model Used

Cursor agent (implémentation guidée workflow dev-story).

### Debug Log References

_(aucun)_

### Completion Notes List

- `BRUSHING_CONFIG` centralisé dans `brushingConfig.ts` (sans MediaPipe).
- Migration `DetectionState` : détecteur émet `BRUSHING` / `DEBOUNCING` / `HAND_LOST` ; `PAUSED` réservé à la logique timer 3.5.
- `NebulaCanvas` : canvas + rAF, `getState` uniquement (pas de hook store dans la boucle), 8 cibles ~3 s, avant/arrière UX, blends pause/reprise via `BRUSHING_CONFIG`, gel sur `HAND_LOST`, `touch-none` sans handlers pointer.
- jsdom : stub `getContext('2d')` dans `test-setup.ts` pour les tests canvas.

### File List

- `src/lib/mediapipe/brushingConfig.ts` (nouveau)
- `src/lib/mediapipe/types.ts`
- `src/lib/mediapipe/detector.ts`
- `src/lib/mediapipe/detector.test.ts`
- `src/stores/useCameraStore.ts`
- `src/stores/useCameraStore.test.ts`
- `src/routes/home.route.tsx`
- `src/routes/home.route.test.tsx`
- `src/routes/session.route.tsx`
- `src/routes/session.route.test.tsx`
- `src/routes/spike.route.tsx`
- `src/components/session/NebulaCanvas.tsx`
- `src/components/session/NebulaCanvas.test.tsx`
- `src/test-setup.ts`

### Change Log

- 2026-04-02 — Story 3.4 : nébuleuse canvas 8 zones, config brossage, migration états détection, init session `during`, tests et stub canvas jsdom.

---

## Story completion status

**Statut :** review  
**Note :** Implémentation complète — prête pour code review (idéalement autre LLM).
