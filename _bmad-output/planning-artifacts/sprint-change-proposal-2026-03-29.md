# Sprint Change Proposal — BrossQuest
**Date :** 2026-03-29
**Scrum Master :** Claude (bmad-correct-course)
**Statut :** Approuvé

---

## Section 1 — Résumé de l'issue

**Déclencheur :** Story 1.4 — Spike MediaPipe Hands, validée le 2026-03-29 sur iPhone 14 / iOS 26.3.1 / Safari.

**Problème :** Le modèle de détection à 3 états (`brushing-active | pause | absent`) défini avant le spike est insuffisant pour les transitions réelles du geste de brossage. Les tests terrain ont révélé :

1. **Faux positifs pause fréquents** — une micro-immobilité de la main (repositionnement, transition entre zones) déclenchait `pause` immédiatement, provoquant une interruption injuste de la progression.
2. **Absence de distinction `HAND_LOST` vs `PAUSED`** — quand la main sort du champ caméra, l'ancien modèle ne distinguait pas ce cas d'une vraie pause volontaire. Résultat : le timer de pause continuait à tourner pendant `HAND_LOST`, pénalisant injustement l'enfant pour un problème de cadrage.
3. **Comportement animation non défini** — les transitions d'animation entre états (ralenti progressif, reprise dynamique) n'étaient pas spécifiées.
4. **Feedback `HAND_LOST` absent** — aucun composant ne gérait le cas "main hors champ", laissant l'animation figée sans explication pour l'enfant.

**Découverte :** Party Mode du 2026-03-29 — 4 décisions design formalisées après analyse terrain.

**Type :** Limitation technique découverte pendant l'implémentation — enrichissement de design pré-Epic 3.

---

## Section 2 — Analyse d'impact

### Impact Epics

| Epic | Impact | Nature |
|------|--------|--------|
| Epic 1 | Nul — Story 1.4 `done`, code valide | — |
| Epic 2 | Nul | — |
| **Epic 3** | **Fort** — stories 3.4, 3.5, 3.6 à mettre à jour | Spécifications enrichies |
| Epic 4 | Nul | — |
| Epic 5 | Nul | — |

### Impact Stories

| Story | Impact | Changement |
|-------|--------|------------|
| 3.4 NebulaCanvas | Fort | ACs animation : comportement DEBOUNCING/PAUSED/BRUSHING/HAND_LOST |
| 3.5 Détection & progression | Fort | ACs : 4 états, timer suspendu pendant HAND_LOST |
| 3.6 Micro-événements | Moyen | ACs : HandLostOverlay + déclencheur PAUSED (vs ancien `pause`) |

**Toutes les stories Epic 3 sont en `backlog` — aucun retravail de code requis.**

### Impact Artefacts

| Artefact | Conflit | Résolution |
|----------|---------|------------|
| Architecture | "3 états détection", machine d'états absente, `HandLostOverlay` absent | Mis à jour |
| Epics.md | États obsolètes dans 3.4, 3.5, 3.6 | Mis à jour |
| UX spec | Table feedback incomplète, `HandLostOverlay` absent | Mis à jour |
| PRD | FR2, FR8 — formulations vagues mais compatibles | Non modifié (non bloquant) |
| Story 1.4 | Dev Notes = état historique pré-Party Mode | Non modifié (document historique) |

### Impact Technique

Aucun — les décisions s'appliquent à des stories non encore démarrées. Le code existant (`detector.ts`, `useCameraStore.ts`) reste valide. `BRUSHING_CONFIG` et le nouveau `DetectionState` seront implémentés en Epic 3.

---

## Section 3 — Approche recommandée

**Option retenue : Direct Adjustment**

Mise à jour des 3 artefacts de planification (Architecture, Epics, UX spec) avec les 4 décisions du Party Mode. Les stories Epic 3 étant toutes en `backlog`, le timing est idéal — aucun retravail de code, aucun rollback.

**Effort :** Faible · **Risque :** Nul · **Impact timeline :** Nul

---

## Section 4 — Propositions de changement détaillées

### 4.1 Architecture — `_bmad-output/planning-artifacts/architecture.md`

**A — Tableau FR catégories (ligne 38)**
- ANCIEN : `Moteur MediaPipe WASM, 3 états détection, adaptation orientation`
- NOUVEAU : `Moteur MediaPipe WASM, machine d'états 4 états (BRUSHING/DEBOUNCING/PAUSED/HAND_LOST), adaptation orientation`

**B — Décisions Party Mode : 2 nouvelles entrées**
- Machine d'états détection : 4 états + règle timer HAND_LOST
- Config centralisée `BRUSHING_CONFIG` : 3 constantes ajustables

**C — Nouvelle section "Machine d'États de Détection"** (entre Error Handling et Loading State)
- Table 4 états avec description + comportement animation
- Diagramme de transitions
- Règle critique : timer NE TOURNE PAS pendant HAND_LOST
- `BRUSHING_CONFIG` TypeScript
- Mention `HandLostOverlay`

**D — Structure fichiers**
- `useCameraStore.ts` commentaire : `+ detectionState`
- Nouveau composant : `HandLostOverlay.tsx` + `HandLostOverlay.test.tsx`

---

### 4.2 Epics — `_bmad-output/planning-artifacts/epics.md`

**A — Description Epic 3 (2 occurrences)**
- "3 états" → "machine d'états 4 états : BRUSHING / DEBOUNCING / PAUSED / HAND_LOST"

**B — Story 3.5 ACs : 4 états complets**
- `brushing-active` → `BRUSHING`
- `pause` → `DEBOUNCING` (timer 3s) → `PAUSED`
- Nouveau : `HAND_LOST` avec timer suspendu

**C — Story 3.4 ACs : comportement animation**
- `detectionState` comme input `NebulaCanvas`
- DEBOUNCING/PAUSED : ralenti progressif 2s
- BRUSHING (reprise) : redémarrage cycle en 0.5s
- HAND_LOST : canvas figé

**D — Story 3.6 ACs : HandLostOverlay + déclencheur PAUSED**
- `pause` → `PAUSED` dans le déclencheur
- Nouveau comportement `HAND_LOST` : HandLostOverlay fade-in/out

---

### 4.3 UX Spec — `_bmad-output/planning-artifacts/ux-design-specification.md`

**A — Table composants** : `HandLostOverlay` ★★★ Alpha (entre CameraFade et CelebrationOverlay)

**B — Spec NebulaCanvas** : inputs + 4 comportements selon detectionState

**C — Nouvelle spec HandLostOverlay** : overlay caméra en coin, contour pulsant, fade-in/out, zéro texte, zéro rouge

**D — Roadmap Phase Alpha** : `HandLostOverlay` ajouté aux composants bloquants

**E — Table Patterns de Feedback** : 4 lignes états de détection remplacent les 2 anciennes

---

## Section 5 — Handoff

**Scope : Minor** — les changements sont des mises à jour de spécifications sur des stories non démarrées.

**Handoff → Équipe de développement**

| Rôle | Action |
|------|--------|
| Dev | Implémenter la machine d'états 4 états dans Epic 3 (stories 3.4, 3.5, 3.6) |
| Dev | Créer `HandLostOverlay` composant (Phase Alpha) |
| Dev | Définir `BRUSHING_CONFIG` dans `detector.ts` avant Story 3.5 |
| SM | Créer les story files Epic 3 depuis les ACs mis à jour |

**Critères de succès :**
- `DetectionState` TypeScript reflète les 4 états dans `src/lib/mediapipe/types.ts`
- `BRUSHING_CONFIG` défini et ajustable dans `src/lib/mediapipe/detector.ts`
- `HandLostOverlay` testé et fonctionnel avant validation Story 3.6
- Timer de pause vérifié : ne s'incrémente pas pendant `HAND_LOST`

---

*Correct Course workflow — BrossQuest · 2026-03-29*
