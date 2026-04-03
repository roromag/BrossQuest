# Story 3.3 : Phase Avant — CameraFade & narration placeholder

**Epic :** 3 — Session technique complète — moteur détection, nébuleuse & pipeline Avant/Pendant/Après  
**Story ID :** 3.3  
**Story Key :** `3-3-phase-avant-camerafade-narration-placeholder`  
**Status :** review  
**Date :** 2026-04-02

_Note : analyse contexte « ultimate story » terminée — guide d’implémentation pour l’agent dev._

---

## Story

As a enfant,  
I want voir brièvement mon reflet dans la caméra avant que l’animation démarre,  
So that m’ancrer dans le moment avant le brossage.

---

## Contexte produit

La Story 3.2 a livré `/session` avec flux `getUserMedia` stocké dans `useCameraStore.sessionStream` et `<video playsinline autoplay muted>`. Cette story introduit la **phase Avant** : courte calibration visuelle, **narration placeholder** (Web Speech API, sans contenu éditorial final), **transition ritualisée** caméra → cible visuelle de la nébuleuse, puis passage en phase **Pendant** (`'during'`).

L’animation riche de `NebulaCanvas` (8 zones, particules) est la **Story 3.4**. Ici, `NebulaCanvas` doit exister comme **coquille minimale** (plein écran, fond statique cohérent avec la future palette nébuleuse — ex. fond très sombre ou vert profond discret) pour respecter l’architecture fichiers et le fondu de `CameraFade` ; la logique particules reste hors scope.

---

## Acceptance Criteria

**Scénario 1 — Phase Avant : caméra ~3 s puis fondu**

**Given** la session est lancée et le flux caméra est actif (Story 3.2)  
**When** la phase Avant démarre sur `/session`  
**Then** le flux caméra est visible en plein écran environ **3 secondes** (calibration naturelle)  
**And** `CameraFade` enchaîne un **fondu CSS ~3 s** `ease-in-out` de la couche caméra vers `NebulaCanvas` (placeholder Story 3.3)  
**And** à la **fin** du fondu, **toutes les pistes** du `MediaStream` sont arrêtées et le flux est **libéré** (`stopSessionCamera` + `video.srcObject = null` + cohérence `useCameraStore`)  
**And** `useSessionStore.phase` passe de `'before'` à `'during'` **à la fin du fondu** (pas avant)

**Scénario 2 — Narration placeholder Web Speech**

**Given** `useProfileStore.profile?.firstName` est disponible (ou non)  
**When** la phase Avant démarre  
**Then** une **utterance** Web Speech API est déclenchée avec un **texte générique** court en français, le **prénom injecté** quand présent (ex. « Allons-y, {firstName}, on se prépare à brosser » — formulation libre tant que générique et bienveillant)  
**And** si `speechSynthesis` est indisponible ou échoue, **aucun message technique** n’est montré à l’enfant et le **pipeline visuel** (timers + fondu + phases) **continue**

**Scénario 3 — Cohérence état & garde-fous**

**Given** le déroulé de la phase Avant  
**When** le flux est coupé après transition  
**Then** l’état caméra runtime reste cohérent (pas de `sessionStream` actif avec pistes vivantes après libération)  
**And** les composants utilisent des **sélecteurs Zustand fins** (`useXStore(s => s.y)`)

---

## Tasks / Subtasks

- [x] T1 — Initialiser la phase session sur `/session`
  - [x] Au montage effectif de la page session (flux présent), positionner `useSessionStore` en `phase: 'before'` si ce n’est pas déjà fait (éviter d’écraser une reprise future — pour l’instant une session « neuve » depuis `/home` suffit).
  - [x] Ne pas introduire de persistance Dexie du state session dans cette story sauf déjà requis ailleurs (hors scope explicite 3.3).

- [x] T2 — Composant `CameraFade`
  - [x] Créer `src/components/session/CameraFade.tsx` (+ tests co-localisés `CameraFade.test.tsx`).
  - [x] Props typées : au minimum `videoRef` ou `stream` + callbacks `onFadeComplete` / durées configurables en constantes (ex. `CAMERA_VISIBLE_MS = 3000`, `FADE_DURATION_MS = 3000`).
  - [x] Superposition : couche vidéo plein écran + couche `NebulaCanvas` (placeholder) ; opacité / transition CSS **~3 s ease-in-out** conforme [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — CameraFade].
  - [x] Sur `transitionend` (ou équivalent fiable), appeler libération flux + `onFadeComplete`.

- [x] T3 — Placeholder `NebulaCanvas`
  - [x] Créer `src/components/session/NebulaCanvas.tsx` minimal (plein écran, sans interaction tactile) — contenu statique ; Story 3.4 remplacera l’interne par le moteur particules.
  - [x] Tests minimaux : rendu plein écran, pas de régression import paths.

- [x] T4 — Narration placeholder
  - [x] Encapsuler Web Speech dans `src/lib/speech/` (ex. `phaseBeforeNarration.ts`) : lecture de `firstName` depuis le store ou paramètre, `SpeechSynthesisUtterance`, garde si `!window.speechSynthesis`.
  - [x] Déclenchement au début de la phase Avant (une seule fois par entrée sur cette phase pour ce flux de session).
  - [x] Aucune erreur utilisateur visible si TTS indisponible.

- [x] T5 — Intégrer dans `session.route.tsx`
  - [x] Remplacer le simple `<video>` plein page par la composition orchestrée (CameraFade + phases).
  - [x] Conserver redirection vers `/recovery/camera` si `sessionStream` absent (comportement 3.2).
  - [x] Après transition : afficher uniquement la couche « pendant » (placeholder `NebulaCanvas` jusqu’à 3.4).

- [x] T6 — Libération caméra
  - [x] Utiliser `stopSessionCamera` depuis `src/lib/camera/sessionCamera.ts` sur le stream du store.
  - [x] Mettre à jour `useCameraStore.setSessionStream(null)` (et tout setter existant nécessaire pour cohérence).
  - [x] Vérifier qu’on ne casse pas les guards : permission « granted » peut rester vrai sans stream actif — comportement attendu tant que l’utilisateur n’a pas révoqué.

- [x] T7 — Tests & build
  - [x] Tests unitaires : timing simulé ou mocks `transitionend` ; passage `before` → `during` ; appel `stopSessionCamera` / mise à jour store ; speech optionnellement mockée (`global.speechSynthesis`).
  - [x] `npm test` et `npm run build` verts.

---

## Dev Notes

### Exigences techniques (garde-fous)

- **Durées :** ~3 s de caméra visible puis ~3 s de fondu — constantes nommées, pas de nombres magiques dispersés.
- **CSS :** `ease-in-out`, durée alignée UX (~3 s) [Source: `ux-design-specification.md`].
- **Vidéo iOS :** conserver `playsInline`, `autoPlay`, `muted` sur l’élément vidéo pendant la phase caméra.
- **Zustand :** sélecteurs fins uniquement ; pas `useSessionStore()` sans sélecteur.
- **Pas d’import MediaPipe** dans `CameraFade` / narration.
- **Pas de texte d’erreur** dans le flux enfant.

### Anti-patterns à éviter

- Libérer le flux **avant** la fin visible du fondu (flash ou coupure brutale).
- Passer `phase` à `'during'` au début du fondu au lieu de la fin.
- Dupliquer la logique `getUserMedia` (déjà dans 3.2).
- Implémenter l’animation particulaire complète des 8 zones ici (Story 3.4).
- Contenu narratif final / scripts matin-soir (Epic 4 / FR19) — ici uniquement **placeholder** générique + prénom.

### Intelligence Story 3.2 (à réutiliser)

- Fichiers clés : `src/routes/session.route.tsx`, `src/lib/camera/sessionCamera.ts`, `src/stores/useCameraStore.ts`, `home.launch-session.ts` (lancement déjà conforme iOS).
- `stopSessionCamera` existe déjà — l’utiliser pour la libération des tracks.
- Review 3.2 : arrêt explicite des tracks à la sortie de session était **différé** ; cette story **exige** l’arrêt après la phase Avant pour respecter les AC « libéré après la transition complète ».

### Structure fichiers (architecture)

Référence [Source: `_bmad-output/planning-artifacts/architecture.md` — arborescence `components/session/`] :

- `src/components/session/CameraFade.tsx` + `CameraFade.test.tsx`
- `src/components/session/NebulaCanvas.tsx` + `NebulaCanvas.test.tsx` (placeholder 3.3)
- `src/routes/session.route.tsx` (orchestration)
- `src/lib/speech/*.ts` (narration placeholder)
- `src/stores/useSessionStore.ts` (déjà `phase`, `setPhase`)

### Tests

- Co-localisation `*.test.tsx` à côté des composants.
- Mocks : `matchMedia`, `speechSynthesis`, `ResizeObserver` si nécessaire selon patterns existants du repo.
- Vérifier que la route session ne régresse pas sur l’absence de stream (redirection recovery).

### Conformité architecture

- Pipeline session : `CameraFade (flux caméra → fondu ~3s → NebulaCanvas)` puis `useSessionStore` [Source: `architecture.md` — flux données session].
- Types : `SessionPhase = 'before' | 'during' | 'after'` déjà dans `src/types/session.types.ts`.

### Veille technique (2026)

- **Web Speech API :** `SpeechSynthesisUtterance` + `window.speechSynthesis.speak` — pas de dépendance npm [Source: `architecture.md`].
- **Compatibilité :** TTS peut être dégradée sur certaines plateformes ; le story exige dégradation silencieuse sans bloquer le flux UI.

### Références

- Epics : `_bmad-output/planning-artifacts/epics.md` — Story 3.3, Epic 3 intro (placeholder narration).
- Architecture : `_bmad-output/planning-artifacts/architecture.md` — composants session, Zustand, `SessionPhase`.
- PRD : `_bmad-output/planning-artifacts/prd.md` — FR11 (phase Avant).
- UX : `_bmad-output/planning-artifacts/ux-design-specification.md` — `CameraFade`, enchaînement ritualisé caméra → nébuleuse.
- Story précédente : `_bmad-output/implementation-artifacts/3-2-lancement-session-integration-camera-getusermedia-ios.md`

---

## Definition of Done

- [x] AC scénarios 1–3 couverts en code et tests.
- [x] `CameraFade` + placeholder `NebulaCanvas` présents aux emplacements architecture.
- [x] Flux vidéo arrêté et store mis à jour après fin de fondu ; `phase === 'during'`.
- [x] Narration placeholder avec injection `firstName`, sans crash si TTS absent.
- [x] `npm test` et `npm run build` OK.

---

## Dev Agent Record

### Agent Model Used

Cursor — workflow dev-story (story 3.3)

### Debug Log References

### Completion Notes List

- Phase Avant : `CameraFade` (3 s visibles + fondu opacity 3 s `ease-in-out`), `stopSessionCamera` + `srcObject = null` sur `transitionend` (propriété `opacity`), puis `onFadeComplete` → `setSessionStream(null)` et `setPhase('during')`.
- Redirection `/recovery/camera` si `sessionStream` absent **sauf** `phase === 'during' | 'after'` (évite la redirection après libération post-fondu).
- Lancement depuis `/home` : `onSessionCameraReady` → `setPhase('before')` pour une session neuve ; `useLayoutEffect` sur `/session` complète si `phase === null` (filet).
- Narration : `speakPhaseBeforeNarration` (Web Speech, `fr-FR`, prénom optionnel), une fois par montage avec flux ; dégradation silencieuse.
- Tests : `CameraFade`, `NebulaCanvas`, `phaseBeforeNarration`, `session.route`, `home.launch-session` (ordre callback `onSessionCameraReady`).

### File List

- `src/components/session/CameraFade.tsx`
- `src/components/session/CameraFade.test.tsx`
- `src/components/session/NebulaCanvas.tsx`
- `src/components/session/NebulaCanvas.test.tsx`
- `src/lib/speech/phaseBeforeNarration.ts`
- `src/lib/speech/phaseBeforeNarration.test.ts`
- `src/routes/session.route.tsx`
- `src/routes/session.route.test.tsx`
- `src/routes/home.launch-session.ts`
- `src/routes/home.launch-session.test.ts`
- `src/routes/home.route.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/3-3-phase-avant-camerafade-narration-placeholder.md`

---

## Change Log

- 2026-04-02 : Story créée — statut `ready-for-dev` (contexte complet pour implémentation 3.3).
- 2026-04-02 : Implémentation complète — `CameraFade`, `NebulaCanvas` placeholder, narration Web Speech, intégration route session + lancement home ; statut `review`.
