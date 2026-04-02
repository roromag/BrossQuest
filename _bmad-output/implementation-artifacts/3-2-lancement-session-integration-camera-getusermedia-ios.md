# Story 3.2 : Lancement session & integration camera (getUserMedia iOS)

**Epic :** 3 - Session technique complete - moteur detection, nebuleuse & pipeline Avant/Pendant/Apres
**Story ID :** 3.2
**Story Key :** `3-2-lancement-session-integration-camera-getusermedia-ios`
**Status :** ready-for-dev
**Date :** 2026-04-02

---

## Story

As a enfant,
I want lancer la session en tapant le bouton pulsant,
So that la camera s'active et la session demarre.

---

## Contexte produit

Cette story transforme l'ecran `/home` de la Story 3.1 en point d'entree session reel:
- Le tap enfant doit declencher la camera en respectant les contraintes iOS Safari de geste utilisateur.
- Le flux doit basculer vers `/session` avec un stream valide, sans exposer d'erreur technique a l'enfant.
- Les etats camera/audio doivent etre poses proprement pour les stories 3.3+ (CameraFade, narration, detection).

Objectif principal: fiabiliser le "one tap to session start" en conditions mobiles reelles.

---

## Acceptance Criteria

**Scenario 1 - getUserMedia dans le meme handler utilisateur**
**Given** `/home` affiche avec `PulseButton` en etat `presence-detected`
**When** l'enfant tape le bouton
**Then** `navigator.mediaDevices.getUserMedia(...)` est appele dans le meme event handler que le tap
**And** aucune logique asynchrone intermediaire (`await`, `setTimeout`, `Promise.then`) ne s'intercale avant cet appel

**Scenario 2 - Flux camera actif et visible dans session**
**Given** l'appel `getUserMedia` reussit
**When** l'app navigue vers `/session`
**Then** le flux camera est disponible pour la phase Avant
**And** un element video est configure en `<video playsinline autoplay muted>`
**And** le stream est stocke via la couche dediee (store/lib) sans duplication de source de verite

**Scenario 3 - Echec camera isole cote parent**
**Given** la permission a ete revoquee entre `/home` et le tap, ou `getUserMedia` echoue
**When** l'erreur est recue
**Then** l'enfant n'observe aucun message technique brut
**And** la navigation est redirigee vers `/recovery/camera` (directement ou via guard)
**And** l'etat camera est mis a jour de facon coherente (`permissionState`, disponibilite stream)

**Scenario 4 - Synchronisation useCameraStore**
**Given** la tentative de demarrage session
**When** le flux demarre ou echoue
**Then** `useCameraStore` met a jour au minimum `permissionState` et `isMediaPipeLoading` de facon coherente
**And** les transitions d'etat evitent les etats impossibles (ex: permission denied + stream actif)

**Scenario 5 - AudioContext iOS dans le geste utilisateur**
**Given** le tap enfant sur `PulseButton`
**When** la session est lancee
**Then** `AudioContext` est cree ou `resume()` dans ce meme geste utilisateur
**And** une strategie de reprise au retour premier plan est preparee (visibilitychange) pour eviter les suspensions iOS

---

## Tasks / Subtasks

- [ ] T1 - Implementer le demarrage session sur tap depuis `/home`
  - [ ] Connecter `PulseButton` a un handler de lancement explicite (pas seulement rendu visuel)
  - [ ] Appeler `getUserMedia` immediatement dans ce handler (sans async prealable)
  - [ ] Naviguer vers `/session` uniquement apres initialisation camera validee

- [ ] T2 - Introduire une couche camera reutilisable et testable
  - [ ] Centraliser start/stop stream dans `src/lib/camera/` (ou dossier equivalent coherent architecture)
  - [ ] Eviter le code camera inline dans les composants
  - [ ] Definir des types explicites pour succes/echec d'initialisation camera

- [ ] T3 - Mettre a jour `useCameraStore` pour l'etat runtime session
  - [ ] Setter coherents pour `permissionState`, `isMediaPipeLoading` et etat stream
  - [ ] Garder des selecteurs fins dans les composants (pas de `useCameraStore()` global)
  - [ ] Garantir un reset propre en cas d'echec

- [ ] T4 - Preparer route `/session` pour affichage flux video
  - [ ] Remplacer le placeholder Story 3.2 par une base minimale de session camera-ready
  - [ ] Rendre un `<video playsinline autoplay muted>` alimente par le stream courant
  - [ ] Laisser CameraFade/narration hors scope (Story 3.3)

- [ ] T5 - Gestions d'erreurs et redirections
  - [ ] Mapper `NotAllowedError`/permission refusee vers `/recovery/camera`
  - [ ] Logger cote dev sans exposer message brut cote enfant
  - [ ] Verifier que `CameraGuard` et le flux de lancement ne se contredisent pas

- [ ] T6 - AudioContext lifecycle iOS
  - [ ] Initialiser ou `resume()` AudioContext dans le tap handler
  - [ ] Ajouter gestion `visibilitychange` pour reprise au retour foreground
  - [ ] Encapsuler cette logique dans `src/lib/audio/` ou `src/lib/speech/` (pas dans la route)

- [ ] T7 - Tests et verification
  - [ ] Tests unitaires handler tap: appel immediat `getUserMedia`, navigation, mise a jour store
  - [ ] Tests echec camera: redirection `/recovery/camera`, pas d'UI erreur enfant
  - [ ] Test rendu session: presence `<video playsinline autoplay muted>`
  - [ ] `npm test` vert
  - [ ] `npm run build` sans nouvelle erreur introduite

---

## Guardrails developpeur

### Fichiers cibles probables
```
src/routes/home.route.tsx
src/routes/session.route.tsx
src/components/session/PulseButton.tsx
src/stores/useCameraStore.ts
src/lib/camera/* (nouveau probable)
src/lib/audio/* ou src/lib/speech/* (ajustements probables)
```

### Intelligence story precedente (3.1)
- `PulseButton` est deja integre visuellement dans `home.route.tsx` avec etats `idle/presence-detected`.
- La logique de lancement session a ete explicitement laissee hors scope et doit maintenant etre branchee proprement.
- Le layout plein ecran/safe area est deja en place: eviter toute regression visuelle.

### Conventions recemment observees (git)
- `feat(home): ecran d'accueil atmospherique (PulseButton, NarrativeCard)`
- `feat(handoff): loader unique pour le profil, story 2.6 terminee`
- `Mise a jour status stories`
- `feat: story 2.6 - ecran de bascule parent-enfant avec animation emoji`
- `feat: story 2.5 - flux recuperation profil si IndexedDB vide`

Implication: conserver un style de commits/features incremental, axe story, sans refonte large.

### Regles d'architecture a respecter
- Jamais d'import direct `@mediapipe/tasks-vision` hors `src/lib/mediapipe/`
- Selecteurs Zustand fins uniquement (`useXStore(s => s.y)`)
- Aucune erreur technique visible dans le flux enfant (`/home`, `/session`, `/handoff`)
- Persistance via Dexie uniquement (pas de `localStorage` fonctionnel)
- Tests co-localises (`*.test.tsx` a cote des composants)

### Contraintes techniques critiques pour cette story
- iOS Safari: `getUserMedia` doit rester dans la pile d'appel du geste utilisateur.
- Eviter tout `await` avant `getUserMedia` dans le handler de tap.
- `<video playsinline autoplay muted>` obligatoire pour un rendu camera inline iOS.
- `AudioContext` doit etre cree/resume dans ce meme geste utilisateur.
- Reprise audio a prevoir au retour premier plan (visibilitychange).

### Anti-patterns a eviter
- Demarrer la camera dans un `useEffect` au montage de `/session` sans geste utilisateur.
- Faire un pre-check async avant `getUserMedia` dans le handler tap.
- Dupliquer l'etat camera entre plusieurs stores non synchronises.
- Afficher un message d'erreur technique enfant en cas d'echec camera.
- Coder CameraFade complet ici (doit rester Story 3.3).

---

## Architecture compliance

- **Routing/guards:** garder `beforeLoad` comme frontiere de securite (`/home`, `/session`, `/recovery/camera`).
- **State:** etat camera centralise dans `useCameraStore`; composants lecteurs via selecteurs fins.
- **Isolation:** logique API navigateur (camera/audio) dans `src/lib/*`, pas melangee dans JSX complexe.
- **Performance:** pas de chargement MediaPipe ou operations lourdes sur le tap qui retardent `getUserMedia`.
- **UX:** parcours enfant reste "1 tap", erreurs absorbees cote parent.

---

## Library & framework requirements (veille)

Validation de veille rapide (2026-04-02):
- WebKit User Activation API: APIs sensibles (camera/audio) requierent activation utilisateur transitoire.
- Pattern terrain iOS Safari: les appels via chaines async perdent souvent le contexte de geste.
- MDN `AudioContext.resume()`: reprise a faire dans contexte d'interaction utilisateur.

Implication implementation:
- Prioriser un handler tap synchrone et minimal.
- Deplacer les traitements secondaires apres acquisition stream.
- Encapsuler audio/camera dans des wrappers testables.

---

## Project structure & references

- Epics: `_bmad-output/planning-artifacts/epics.md` (Story 3.2 AC)
- Architecture: `_bmad-output/planning-artifacts/architecture.md` (contraintes iOS, guards, regles absolues)
- PRD: `_bmad-output/planning-artifacts/prd.md` (FR9, FR33, FR35, NFR-P2/P3)
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md` (`PulseButton`, `CameraFade`, `<video playsinline>`)
- Story precedente: `_bmad-output/implementation-artifacts/3-1-ecran-accueil-atmospherique-pulsebutton.md`
- Sprint tracking: `_bmad-output/implementation-artifacts/sprint-status.yaml`

Code existant cle:
- `src/routes/home.route.tsx` (PulseButton deja rendu, guards actifs)
- `src/stores/useCameraStore.ts` (permission/detection/loading deja exposes)
- `src/routes/session.route.tsx` (placeholder a remplacer pour story 3.2)

---

## Definition of Done

- [ ] Tous les AC story 3.2 couverts en code + tests
- [ ] `getUserMedia` appele dans le handler tap sans async prealable
- [ ] Route `/session` affiche un flux video inline camera-ready
- [ ] Echec permission/stream redirige vers `/recovery/camera` sans UI erreur enfant
- [ ] Etat `useCameraStore` coherent sur succes/echec
- [ ] AudioContext initialise/repris dans geste utilisateur + reprise foreground
- [ ] `npm test` passe
- [ ] `npm run build` n'introduit aucune nouvelle erreur

---

## Dev Agent Record

### Agent Model Used

gpt-5.3-codex-low

### Debug Log References

- Analyse exhaustive `epics.md`, `architecture.md`, `prd.md`, `ux-design-specification.md`
- Relecture complete sprint status et story 3.1
- Inspection code existant (`home.route.tsx`, `session.route.tsx`, `useCameraStore.ts`)
- Verification historique git recent (5 commits)
- Veille technique rapide WebKit/MDN (user activation camera/audio iOS)

### Completion Notes List

- Story 3.2 contextualisee avec contraintes iOS strictes (camera + audio)
- Taches orientees implementation incremental sans deborder sur Story 3.3
- Guardrails anti-regressions enfant/parent explicites
- References de code et architecture reliees au contexte reel du repo

### File List

- `_bmad-output/implementation-artifacts/3-2-lancement-session-integration-camera-getusermedia-ios.md` (nouveau)

## Change Log

- 2026-04-02: Creation story 3.2 ready-for-dev (contexte complet implementation + guardrails)
