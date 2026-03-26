---
stepsCompleted: ["step-01-document-discovery", "step-02-prd-analysis", "step-03-epic-coverage-validation", "step-04-ux-alignment", "step-05-epic-quality-review", "step-06-final-assessment"]
documentsInventory:
  prd: "_bmad-output/planning-artifacts/prd.md"
  architecture: "_bmad-output/planning-artifacts/architecture.md"
  epics: "_bmad-output/planning-artifacts/epics.md"
  ux: "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# Implementation Readiness Assessment Report

**Date:** 2026-03-26
**Project:** BrossQuest

---

## PRD Analysis

### Functional Requirements

**Détection du geste (FR1–FR8)**

- FR1 : Détection temps réel du mouvement oscillatoire de la main dans la zone bouche (brossage actif)
- FR2 : Distinction brossage actif / absence de mouvement
- FR3 : Accumulation cumulative du temps de brossage par quadrant, sans réinitialisation lors des pauses
- FR4 : Suspension de la progression narrative sans pénalité si le brossage s'arrête
- FR5 : Détection d'un manque d'attention → déclenchement d'un micro-événement réactif d'animation
- FR6 : Détection de la présence de l'utilisateur dans le champ caméra
- FR7 : Détection de l'orientation inversée du téléphone + adaptation automatique du flux caméra
- FR8 : Signal d'état « détection dégradée » (éclairage insuffisant / mauvais cadrage) distinct de l'absence de brossage

**Session de brossage (FR9–FR18)**

- FR9 : Lancement de la session par tap unique de l'enfant (déclenchement getUserMedia par geste utilisateur)
- FR10 : Structure de session en 3 phases séquentielles : Avant / Pendant / Après
- FR11 : Phase Avant : flux caméra visible brièvement pour calibration naturelle, puis fondu avant la phase Pendant
- FR12 : Phase Pendant structurée en 4 segments correspondant aux quadrants buccaux
- FR13 : Progression de l'animation d'un quadrant au suivant selon le temps de brossage actif cumulé sur ce quadrant
- FR14 : Micro-événements d'animation déclenchés par inattention détectée — non aléatoires, non programmés
- FR15 : Micro-célébration visuelle et sonore à la fin d'une session complète
- FR16 : Retour visuel discret par quadrant à la transition entre quadrants (feedback implicite de progression)
- FR17 : Sauvegarde de l'état de session en cours + reprise possible après interruption
- FR18 : Limitation à 1 session par période (matin 0h00–16h59 / soir 17h00–23h59)

**Narration & Contenu (FR19–FR23)**

- FR19 : Narration vocale courte en phase Avant avec injection dynamique du prénom de l'enfant
- FR20 : Progression narrative par épisodes séquentiels — un épisode consommé uniquement à la fin d'une session complète
- FR21 : Épisodes flashback disponibles comme alternative aux épisodes originaux (re-visite d'un épisode passé)
- FR22 : Adaptation du ton narratif selon la période détectée (matin : énergisant / soir : apaisant)
- FR23 : Détection automatique de la période de la journée pour adapter la narration sans action utilisateur

**Profil & Onboarding (FR24–FR32)**

- FR24 : Création de profil enfant avec prénom par le parent lors de l'onboarding
- FR25 : Choix d'emoji par l'enfant lors du passage de main (premier geste dans l'app)
- FR26 : Modification de l'emoji et du prénom depuis les paramètres profil post-onboarding
- FR27 : Demande d'autorisation caméra depuis le flux onboarding parent (avant passage de main)
- FR28 : Accès à l'app via lien direct sans store (distribution hors App Store / Play Store)
- FR29 : Installation PWA sur l'écran d'accueil (Add to Home Screen)
- FR30 : Stockage du profil et de la progression localement (IndexedDB), sans compte en ligne en V1
- FR31 : Accès aux paramètres profil depuis l'interface parent post-onboarding
- FR32 : Sélection du profil enfant pour démarrer une session (écran d'accueil)

**Gestion erreurs & Récupération (FR33–FR37)**

- FR33 : Détection de l'absence ou de la révocation de permission caméra au lancement de session
- FR34 : Flux de récupération permission caméra guidé pour le parent (instructions contextuelles selon navigateur/OS)
- FR35 : Isolation des erreurs techniques côté parent — l'enfant ne voit jamais d'écran d'erreur technique
- FR36 : Détection d'IndexedDB vide ou corrompu + flux d'onboarding de récupération rapide
- FR37 : Détection des APIs non supportées (MediaPipe WASM, IndexedDB) + message d'erreur explicite à l'ouverture

**Infrastructure PWA (FR38–FR40)**

- FR38 : Fonctionnement offline après première installation, incluant les assets audio et les assets WASM MediaPipe
- FR39 : Mise à jour du Service Worker sans interruption d'une session en cours (update différé à la prochaine ouverture)
- FR40 : Reprise ou réinitialisation de session après interruption technique (crash navigateur, mise en veille)

**Total FRs : 40**

---

### Non-Functional Requirements

**Performance**

- NFR-P1 : Démarrage de l'app ≤ 10 secondes (LCP / première interaction, réseau 4G, iOS Safari)
- NFR-P2 : Chargement du module MediaPipe WASM différé au lancement de session — ne bloque pas le démarrage app
- NFR-P3 : Délai de réponse animation ≤ 1 seconde après détection de geste
- NFR-P4 : Animation fluide ≥ 30 fps (iPhone SE 2nd gen comme appareil minimal cible)
- NFR-P5 : Budget cache Service Worker ≤ 30 Mo (contrainte Safari iOS)

**Fiabilité & Intégrité**

- NFR-R1 : Profil et progression conservés après fermeture / réouverture et redémarrage appareil
- NFR-R2 : Session interrompue récupérable — état sauvegardé en temps réel
- NFR-R3 : Service Worker mis en cache avant la fin de l'onboarding — offline disponible dès l'installation
- NFR-R4 : Spike technique MediaPipe validé en conditions réelles avant tout développement produit

**Confidentialité**

- NFR-C1 : Flux caméra traité exclusivement on-device (MediaPipe WASM) — aucune image ou donnée biométrique transmise
- NFR-C2 : Aucune donnée personnelle envoyée à un serveur en V1 (pas d'analytics, pas de tracking, pas de telemetry)
- NFR-C3 : Prénom de l'enfant stocké uniquement en local (IndexedDB) — jamais transmis
- NFR-C4 : Aucun cookie, aucun localStorage de tracking, aucune dépendance analytics tierce en V1

**Compatibilité**

- NFR-X1 : Support iOS Safari ≥ 15.4 et Android Chrome ≥ 100
- NFR-X2 : Résolution minimale supportée : 360×640px (portrait)
- NFR-X3 : Orientation portrait uniquement — orientation inversée détectée et gérée (FR7), pas de mode paysage
- NFR-X4 : App fonctionnelle sans connexion internet après première installation

**Total NFRs : 17**

---

### Additional Requirements

- **Contrainte solo dev** : toutes décisions de scope évaluées à l'aune d'un effort solo soutenable (Romain)
- **Spike MediaPipe bloquant** : prérequis binaire — si échec, le moteur core est à revoir entièrement
- **1 profil enfant par installation** : contrainte V1 explicite
- **Zéro backend V1** : hébergement statique uniquement (GitHub Pages ou équivalent)
- **Accessibilité UX** : zones tactiles ≥ 44×44px ; navigation par icônes pour enfants partiellement non-lecteurs (6 ans) ; feedback sonore et visuel combinés pendant la session
- **Contenu adapté à l'âge** : narration bienveillante (zéro peur, zéro pression) ; micro-célébration proportionnée ; épisodes flashback visuellement distincts
- **Hors scope V1** : Collection · sign-in social · multi-profils · sync cloud · notifications · analytics · multi-appareils · mode audio
- **Distribution** : par lien direct uniquement (SMS, messagerie) — aucun App Store

---

### PRD Completeness Assessment

Le PRD est **très complet et de haute qualité** :
- 40 FRs numérotées et catégorisées, 17 NFRs avec critères de mesure précis
- Parcours utilisateurs détaillés (6 parcours) couvrant les cas nominaux, de décrochage, d'onboarding et de récupération d'erreur
- Hors-scope V1 explicitement délimité
- Risques documentés avec mitigations
- Contraintes techniques claires (budget cache, support navigateur, APIs)
- Prérequis bloquant (spike MediaPipe) clairement identifié et justifié

**Points d'attention potentiels à surveiller lors de la validation épics :**
1. FR18 (limitation 1 session/période) — mécanisme de tracking heure/localStorage à confirmer dans l'architecture
2. FR22/FR23 (adaptation matin/soir) — classée "Phase Final" dans le scope MVP, à vérifier si les épics reflètent cette priorité
3. NFR-R4 (spike MediaPipe) — doit avoir un épic dédié en priorité absolue

---

## Epic Coverage Validation

### Coverage Matrix

| FR | Exigence (résumé) | Epic | Story | Statut |
|---|---|---|---|---|
| FR1 | Détection mouvement oscillatoire (brossage actif) | Epic 3 | Story 3.5 | ✓ Couvert |
| FR2 | Distinction brossage actif / absence | Epic 3 | Story 3.5 | ✓ Couvert |
| FR3 | Accumulation cumulative par quadrant | Epic 3 | Story 3.5 | ✓ Couvert |
| FR4 | Suspension progression sans pénalité | Epic 3 | Story 3.5–3.6 | ✓ Couvert |
| FR5 | Inattention → micro-événement réactif | Epic 3 | Story 3.6 | ✓ Couvert |
| FR6 | Détection présence dans champ caméra | Epic 3 | Story 3.1–3.2 | ✓ Couvert |
| FR7 | Orientation inversée + adaptation flux | Epic 3 | Story 3.6 | ✓ Couvert |
| FR8 | Signal détection dégradée (éclairage) | Epic 3 | Story 3.5 | ✓ Couvert |
| FR9 | Lancement session par tap unique | Epic 3 | Story 3.2 | ✓ Couvert |
| FR10 | Structure session 3 phases Avant/Pendant/Après | Epic 3 | Stories 3.3–3.7 | ✓ Couvert |
| FR11 | Phase Avant : flux caméra + fondu | Epic 3 | Story 3.3 | ✓ Couvert |
| FR12 | Phase Pendant : segments buccaux | Epic 3 | Stories 3.4–3.5 | ⚠️ DIVERGENCE |
| FR13 | Progression animation segment par segment | Epic 3 | Story 3.5 | ✓ Couvert |
| FR14 | Micro-événements déclenchés par inattention | Epic 3 | Story 3.6 | ✓ Couvert |
| FR15 | Micro-célébration fin session | Epic 3 | Story 3.7 | ✓ Couvert |
| FR16 | Retour visuel à la transition segments | Epic 3 | Story 3.5 | ✓ Couvert |
| FR17 | Sauvegarde état session + reprise | Epic 3 | Story 3.8 | ✓ Couvert |
| FR18 | 1 session par période (matin/soir) | Epic 3 | Story 3.7 | ✓ Couvert |
| FR19 | Narration vocale phase Avant avec prénom | Epic 4 | Story 4.2 | ✓ Couvert |
| FR20 | Progression narrative épisodes séquentiels | Epic 4 | Story 4.1 | ✓ Couvert |
| FR21 | Épisodes flashback | Epic 4 | Story 4.1 | ✓ Couvert |
| FR22 | Adaptation ton narratif matin/soir | Epic 4 | Story 4.3 | ⚠️ PRIORITÉ |
| FR23 | Détection automatique période journée | Epic 4 | Story 4.3 | ⚠️ PRIORITÉ |
| FR24 | Création profil enfant (prénom) | Epic 2 | Story 2.1 | ✓ Couvert |
| FR25 | Choix emoji par l'enfant (passage de main) | Epic 2 | Story 2.4 | ✓ Couvert |
| FR26 | Modification emoji et prénom post-onboarding | Epic 5 | Story 5.2 | ✓ Couvert |
| FR27 | Autorisation caméra onboarding parent | Epic 2 | Story 2.2 | ✓ Couvert |
| FR28 | Accès via lien direct | Epic 2 | Story 2.3 | ✓ Couvert |
| FR29 | Installation PWA écran d'accueil | Epic 2 | Story 2.3 | ✓ Couvert |
| FR30 | Stockage local IndexedDB | Epic 2 | Story 1.3+2.x | ✓ Couvert |
| FR31 | Accès paramètres profil post-onboarding | Epic 5 | Story 5.2 | ✓ Couvert |
| FR32 | Sélection profil depuis écran d'accueil | Epic 2 | Story 3.1 | ✓ Couvert |
| FR33 | Détection absence/révocation permission caméra | Epic 2 | Story 2.2 | ✓ Couvert |
| FR34 | Flux récupération permission caméra guidé | Epic 2 | Story 2.2 | ✓ Couvert |
| FR35 | Isolation erreurs techniques (jamais à l'enfant) | Epic 2 | Stories 2.2+3.2 | ✓ Couvert |
| FR36 | Détection IndexedDB vide + récupération rapide | Epic 2 | Story 2.5 | ✓ Couvert |
| FR37 | APIs non supportées + message erreur explicite | Epic 1 | Story 1.1/1.2 | ✓ Couvert |
| FR38 | Offline après première installation | Epic 5 | Story 5.1 | ✓ Couvert |
| FR39 | Mise à jour SW sans interruption session | Epic 5 | Story 5.1 | ✓ Couvert |
| FR40 | Reprise session après interruption technique | Epic 3 | Story 3.8 | ✓ Couvert |

### NFR Coverage

| NFR | Description | Epic | Statut |
|---|---|---|---|
| NFR-P1 | Démarrage ≤ 10s | Epic 5 (Story 5.3) | ✓ Couvert |
| NFR-P2 | WASM différé au tap session | Epic 3 (Story 3.1) | ✓ Couvert |
| NFR-P3 | Latence animation ≤ 1s | Epic 3 (Story 3.5) | ✓ Couvert |
| NFR-P4 | Animation ≥ 30fps | Epic 3 (Story 3.4) | ✓ Couvert |
| NFR-P5 | Budget cache ≤ 30 Mo | Epic 5 (Story 5.1) | ✓ Couvert |
| NFR-R1 | Profil conservé après fermeture | Epic 5 (Story 5.3) | ✓ Couvert |
| NFR-R2 | Session interrompue récupérable | Epic 3 (Story 3.8) | ✓ Couvert |
| NFR-R3 | SW en cache avant fin onboarding | Epic 5 (Story 5.1) | ✓ Couvert |
| NFR-R4 | Spike MediaPipe validé avant démarrage | Epic 1 (Story 1.4) | ✓ Couvert |
| NFR-C1 | Flux caméra on-device uniquement | Epic 4 | ⚠️ PLACEMENT |
| NFR-C2 | Zéro donnée personnelle serveur | Epic 4 | ⚠️ PLACEMENT |
| NFR-C3 | Prénom local uniquement | Epic 4 | ⚠️ PLACEMENT |
| NFR-C4 | Zéro cookie/tracking | Epic 4 | ⚠️ PLACEMENT |
| NFR-X1 | iOS Safari ≥ 15.4 + Android Chrome ≥ 100 | Epic 5 (Story 5.3) | ✓ Couvert |
| NFR-X2 | Résolution min 360×640px | Epic 5 (Story 5.3) | ✓ Couvert |
| NFR-X3 | Portrait uniquement | Epic 5 (Story 5.3) | ✓ Couvert |
| NFR-X4 | Offline après première installation | Epic 5 (Story 5.1) | ✓ Couvert |

### Problèmes identifiés

#### ⚠️ DIVERGENCE — FR12 : 4 vs 8 segments

- **PRD FR12** : "Phase Pendant structurée en **4 segments** correspondant aux quadrants buccaux"
- **Épics FR12** : "Phase Pendant : **8 segments** (4 quadrants × avant/arrière) — ~15s chacun"
- **Impact** : Cette évolution (4→8) est cohérente avec la spec UX (UX-DR3 mentionne 8 positions spatiales) et l'architecture. C'est une **raffinement délibéré**, pas une erreur. Mais le PRD n'a pas été mis à jour.
- **Recommandation** : Mettre à jour FR12 dans le PRD pour aligner le langage — 8 segments = 4 quadrants × avant/arrière.

#### ⚠️ PRIORITÉ — FR22/FR23 : Adaptation matin/soir dans Epic 4

- **PRD** : Ces features sont classées "Phase Final" du MVP (polish)
- **Épics** : Intégrées dans Epic 4 (Story 4.3) sans distinction de priorité par rapport aux autres stories de l'epic
- **Impact** : Le développeur pourrait implémenter matin/soir en même temps que le reste d'Epic 4, alors que le PRD suggère de les différer. Risque de blocage si Epic 4 attend Epic 3, et que 4.3 est perçue comme bloquante pour livrer terrain.
- **Recommandation** : Vérifier si Story 4.3 peut être marquée optionnelle pour une première livraison cercle.

#### ⚠️ PLACEMENT — NFR-C1 à NFR-C4 assignés à Epic 4

- **Observation** : Les NFRs de confidentialité (traitement on-device, zéro analytics, prénom local) sont assignés à l'Epic Narration (Epic 4).
- **Impact** : Ces contraintes s'appliquent dès Epic 1 (aucune dépendance réseau) et Epic 2 (IndexedDB, permission caméra). Le placement dans Epic 4 est trompeur — ces NFRs ne sont pas à "implémenter" en Epic 4, ils sont à respecter dès le début.
- **Impact réel** : Faible, car les stories concernées (1.x, 2.x, 3.x) respectent déjà ces NFRs implicitement. Mais la traçabilité est incomplète.
- **Recommandation** : Redistribuer NFR-C1–C4 sur les epics où ils sont réellement appliqués (Epic 1+2+3) ou les marquer comme "cross-cutting concerns" applicables à tous les épics.

### Coverage Statistics

- **Total FRs PRD :** 40
- **FRs couverts dans les épics :** 40
- **Taux de couverture FR :** **100%**
- **Total NFRs PRD :** 17
- **NFRs adressés dans les épics :** 17
- **Taux de couverture NFR :** **100%**
- **Problèmes critiques :** 0
- **Avertissements à résoudre :** 3 (FR12 divergence, FR22/23 priorité, NFR-C placement)

---

## UX Alignment Assessment

### UX Document Status

**Trouvé :** `_bmad-output/planning-artifacts/ux-design-specification.md` (41 744 o — 24 mars 21:53)
Document complet et très détaillé : vision produit, parcours utilisateurs, système de design, composants, tokens, responsive, accessibilité, flows Mermaid.

### UX ↔ PRD Alignment

| Point d'alignement | Statut | Détail |
|---|---|---|
| 8 segments (UX) vs 4 quadrants (PRD FR12) | ⚠️ DIVERGENCE | UX clarifie et enrichit FR12 — déjà documenté en §Epic Coverage |
| Parcours utilisateurs (6 parcours PRD) | ✓ Aligné | 4 flows Mermaid UX couvrent tous les parcours PRD |
| Philosophie zéro pénalité / zéro pression | ✓ Aligné | Encodée dans les patterns UX (silence = feedback valide) |
| Onboarding ≤ 3 min | ✓ Aligné | UX détaille le flow complet avec timing |
| Passage de main comme moment signature | ✓ Aligné | UX développe en profondeur l'enjeu émotionnel |
| Détection matin/soir (Phase Final PRD) | ✓ Aligné | UX classe `ProfileSettings` en Phase Final — cohérent |
| "Stats pause" ParentAccessIcon | ⚠️ ASPIRATION | UX mentionne "stats pause" dans l'icône parent — PRD dit extraction manuelle par Romain. Non formalisé comme FR |
| Signal reconnaissance 3e lancement | ⚠️ ASPIRATION | UX décrit un ton légèrement différent au 3e lancement — non formalisé en FR dans le PRD |
| Web Speech API pour narration | ℹ️ DÉCISION ARCH | Choix architectural dans les épics (Story 4.2) — non explicit dans PRD/UX mais cohérent avec offline-first |

### UX ↔ Épics Alignment

| Point | Statut |
|---|---|
| UX-DR1 (tokens design) → Story 1.1 / tout le projet | ✓ Aligné |
| UX-DR2 (`PulseButton`) → Story 3.1/3.2 | ✓ Aligné |
| UX-DR3 (`NebulaCanvas` 8 zones) → Story 3.4 | ✓ Aligné |
| UX-DR4 (`EmojiPicker`) → Story 2.4 | ✓ Aligné |
| UX-DR5 (`NarrativeCard`) → Story 3.1 | ✓ Aligné |
| UX-DR6 (`CameraFade`) → Story 3.3 | ✓ Aligné |
| UX-DR7 (`CelebrationOverlay`) → Story 3.7 | ✓ Aligné |
| UX-DR8 (`PermissionRecovery`) → Story 2.2 | ✓ Aligné |
| UX-DR9 (`ParentAccessIcon`) → Story 5.2 | ✓ Aligné |
| UX-DR10 (layout session plein écran) → Story 5.3 | ✓ Aligné |
| UX-DR11 (accessibilité fonctionnelle) → Story 5.3 | ✓ Aligné |
| UX-DR12 (responsive portrait) → Story 5.3 | ✓ Aligné |

**Toutes les UX Design Requirements (UX-DR1 à UX-DR12) sont couvertes dans les épics.**

### Warnings

**⚠️ ASPIRATION non formalisée — "Stats de pause" dans ParentAccessIcon**
- La spec UX mentionne `ParentAccessIcon → "nom / emoji / stats pause"` dans l'architecture écrans.
- Le PRD dit explicitement que les stats de pause (signal de transfert) sont extraites **manuellement** par Romain via localStorage — pas affichées in-app.
- **Risque** : Si un développeur suit la spec UX à la lettre, il pourrait implémenter un affichage de stats non prévu au PRD. En solo, ce risque est faible (Romain est les deux), mais c'est une inconsistance à clarifier.
- **Recommandation** : Ajouter une note dans la spec UX pour clarifier que `ParentAccessIcon` donne accès aux paramètres profil uniquement (V1) — les stats de session sont hors scope.

**ℹ️ NOTE — Signal reconnaissance 3e lancement**
- La spec UX décrit une expérience émotionnelle au 3e lancement ("content de te revoir"). Aucun FR ne formalise ce comportement.
- Probablement implémenté via la narration narrative (la voix change de ton après plusieurs sessions). À confirmer avec le système d'épisodes.
- **Risque** : Faible — peut être encodé dans les scripts narratifs sans story dédiée.

### Conclusion UX Alignment

La spec UX est **cohérente et bien alignée** avec le PRD et les épics :
- Les 12 UX Design Requirements sont toutes couvertes dans les histoires
- Les composants custom listés dans la spec UX correspondent exactement aux composants des épics
- Le système de design (tokens, palette, typographie) est précis et implémentable directement
- Aucun composant UX n'est orphelin (sans story correspondante)

**Problèmes critiques :** 0 · **Avertissements :** 1 (stats pause) · **Notes :** 1 (signal reconnaissance)

---

## Epic Quality Review

### Checklist de Conformité

| Epic | Valeur utilisateur | Indépendant | Stories dimensionnées | Pas de dépendance forward | Tables créées au bon moment | ACs clairs | Traçabilité FR |
|---|---|---|---|---|---|---|---|
| Epic 1 | ⚠️ Technique | ✓ | ✓ | ✓ | 🟡 Toutes à la fois | ✓ | ✓ |
| Epic 2 | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ |
| Epic 3 | 🟠 Partiel | ✓ | ✓ | ✓ | N/A | ✓ | ✓ |
| Epic 4 | ✓ | ✓ | ✓ | ✓ | N/A | ✓ | ✓ |
| Epic 5 | 🟠 Mixte | ✓ | ✓ | ✓ | N/A | ✓ | ✓ |

---

### 🔴 Violations Critiques : 0

Aucune violation critique identifiée.

---

### 🟠 Problèmes Majeurs

#### 🟠 MAJEUR #1 — Epic 3 est un epic technique, pas un livrable utilisateur

- **Epic :** Epic 3 — "Session technique complète"
- **Problème :** L'objectif de l'epic est formulé comme "validé techniquement" avec une "narration placeholder". L'epic livre un pipeline fonctionnel mais pas un livrable terrain — la première livraison réelle est Epic 4. L'épic en lui-même ne constitue pas un incrément de valeur démontrable aux utilisateurs du cercle.
- **Impact :** Pour une équipe ou un solo dev, cela signifie que 8 stories sont développées sans pouvoir montrer le produit réel au cercle proche. Le risque de dérive est faible pour un solo dev, mais l'epic ne passe pas le test "pouvez-vous montrer ça à un utilisateur réel ?"
- **Atténuant :** Cette séquence est délibérée et correctement documentée — l'epic reconnaît lui-même que "la première livraison terrain" est Epic 4. Le choix est conscient.
- **Recommandation :** Acceptable tel quel pour un solo dev avec Vision claire. Si l'équipe s'agrandissait, restructurer pour que l'Epic 3 inclut au moins une story de narration minimale livrable terrain.

#### 🟠 MAJEUR #2 — Service Worker offline-first en Epic 5, livraison terrain en Epic 4

- **Epic :** Epic 5, Story 5.1 vs NFR-R3
- **Problème :** NFR-R3 exige que le Service Worker soit mis en cache avant la fin de l'onboarding ("offline disponible dès l'installation"). Mais la Story 5.1 (Service Worker) est dans Epic 5, qui vient après la "première livraison terrain" (Epic 4).
- **Conséquence concrète :** Le cercle proche testera l'app (Epic 4 livré) sans offline. Si quelqu'un est dans sa salle de bain sans WiFi, l'app ne fonctionnera pas lors des premiers tests terrain.
- **Impact :** Faible pour un cercle proche en validation initiale (on peut supposer un réseau disponible), mais NFR-R3 ne sera pas satisfait lors de la validation terrain.
- **Recommandation :** Envisager de déplacer la configuration Workbox/Service Worker de base dans Story 1.1 ou une story dédiée Epic 1/2 pour garantir l'offline-first dès le déploiement. Le polish du budget cache (< 30 Mo) peut rester en Epic 5.

---

### 🟡 Préoccupations Mineures

#### 🟡 MINEUR #1 — Story 1.3 crée toutes les tables IndexedDB en une seule fois

- **Story :** 1.3 — "Schéma IndexedDB Dexie & stores Zustand initiaux"
- **Bonne pratique :** Chaque story crée les tables dont elle a besoin (pas tout en une fois en Epic 1)
- **Observation :** Story 1.3 crée les 4 tables (`profiles`, `episodes`, `sessionState`, `sessionHistory`) toutes en même temps dès Epic 1.
- **Atténuant :** Dexie fonctionne par migrations versionnées — un schéma unifié en version 1 est plus propre que plusieurs migrations fragmentées. Le schéma est simple (4 tables). Pour un solo dev avec visibilité totale, c'est le choix pragmatique correct.
- **Recommandation :** Acceptable tel quel. Le pragmatisme l'emporte ici.

#### 🟡 MINEUR #2 — Ambiguïté sur le moment de chargement MediaPipe WASM

- **Stories :** 3.1 (PulseButton `isMediaPipeLoading`) vs NFR-P2 ("déféré au TAP de lancement session")
- **Problème :** Story 3.1 implique que MediaPipe charge dès l'affichage de `/home` (le bouton est disabled pendant le chargement, puis activé quand prêt). Mais NFR-P2 dit "déféré au tap de lancement session". Ces deux assertions semblent contradictoires.
- **Résolution probable :** MediaPipe commence à charger quand `/home` s'affiche (pré-chargement anticipé), pas au démarrage de l'app. NFR-P2 signifie "ne charge pas au démarrage de l'app" (i.e., ne bloque pas le LCP). Le pré-chargement sur `/home` est différent du chargement au démarrage.
- **Risque :** Un développeur pourrait mal interpréter NFR-P2 comme "ne charge que APRÈS le tap". Si MediaPipe charge après le tap, l'utilisateur devrait attendre le chargement WASM après avoir tapé le bouton — mauvaise UX.
- **Recommandation :** Clarifier dans une note de story ou dans le Additional Requirements : "MediaPipe WASM commence à charger au montage de `/home`, pas au démarrage de l'app. Le PulseButton est activé quand le WASM est prêt. getUserMedia est appelé au tap — pas MediaPipe."

#### 🟡 MINEUR #3 — Web Speech API : qualité vocale non garantie

- **Story :** 4.2 — "Narration vocale Web Speech API avec prénom & scripts éditoriaux"
- **Problème :** Le PRD décrit une "narration vocale" de qualité expérientielle (chaleur, rythme). Web Speech API utilise les voix TTS système — qualité très variable selon l'appareil et la langue (iOS Safari en français peut utiliser une voix générique pas très engageante).
- **Impact :** Risque expérientiel réel — si la voix TTS système est froide ou robotique, l'effet narratif est dégradé. C'est le choix "zéro Mo de budget cache" qui force ce compromis.
- **Atténuant :** Pour un V1 cercle restreint en conditions iOS (où la voix Siri française est de qualité acceptable), le risque est gérable. C'est un arbitrage offline-first vs qualité vocale documenté dans les Additional Requirements.
- **Recommandation :** Documenter le risque explicitement dans la story. Tester la voix TTS iOS Safari en français sur iPhone SE avant de valider Epic 4 comme livrable terrain.

#### 🟡 MINEUR #4 — Epic 1 entièrement technique sans valeur utilisateur directe

- **Epic :** Epic 1 — "Fondation technique & Spike MediaPipe"
- **Bonne pratique :** Les épics doivent livrer de la valeur utilisateur
- **Observation :** Epic 1 est entièrement technique (initialisation, routing, schéma, spike). Aucun utilisateur ne peut bénéficier du livrable Epic 1 seul.
- **Atténuant :** Epic technique inévitable pour un projet greenfield. Le spike MediaPipe est un prérequis bloquant qui justifie pleinement cette phase isolée. Acceptable.
- **Recommandation :** Acceptable tel quel pour greenfield.

---

### Validation Indépendance des Épics

| Test | Résultat |
|---|---|
| Epic 1 est autonome | ✓ Foundation indépendante |
| Epic 2 fonctionne avec Epic 1 uniquement | ✓ |
| Epic 3 fonctionne avec Epics 1+2 uniquement | ✓ |
| Epic 4 fonctionne avec Epics 1+2+3 uniquement | ✓ |
| Epic 5 fonctionne avec Epics 1+2+3+4 uniquement | ✓ |
| Dépendances circulaires | ✓ Aucune |
| Dépendances forward (épic N référence N+1) | ✓ Aucune |

### Validation Qualité des ACs

Toutes les stories utilisent le format Given/When/Then.

**Stories avec ACs exemplaires :**
- Story 1.4 (spike MediaPipe) : critères de validation très spécifiques (latence ≤ 1s, types définis, aucun import hors lib/)
- Story 3.5 (détection + progression) : `ZONE_DURATION_MS (~15s)`, `advanceZone()`, latence mesurable
- Story 3.2 (getUserMedia iOS) : contrainte iOS Safari explicitement codée dans les ACs
- Story 2.5 (récupération IndexedDB) : scénario complet cause/effet/résolution

**ACs à améliorer :**
- Story 3.3 ("narration placeholder fonctionne") : l'AC valide le pipeline avec un placeholder. Il faudrait une AC de "dépréciation" ou de "remplacement" pour signaler que Story 4.2 remplace Story 3.3 — sinon le développeur pourrait laisser la Web Speech API générique en production.

### Évaluation Dimensionnement Stories

| Story | Estimation effort (solo dev) | Statut |
|---|---|---|
| 1.1 | 0.5 jour | ✓ Bien dimensionnée |
| 1.2 | 1 jour | ✓ Bien dimensionnée |
| 1.3 | 0.5 jour | ✓ Bien dimensionnée |
| 1.4 | 1–2 jours (spike) | ✓ Bien dimensionnée |
| 2.1–2.3 | 0.5 jour chacune | ✓ Bien dimensionnées |
| 2.4–2.5 | 0.5 jour chacune | ✓ Bien dimensionnées |
| 3.1–3.2 | 0.5–1 jour chacune | ✓ Bien dimensionnées |
| 3.3 | 0.5 jour | ✓ Bien dimensionnée |
| 3.4 | 1–2 jours (NebulaCanvas) | ✓ Acceptable — composant complexe |
| 3.5 | 1–2 jours (intégration MediaPipe) | ✓ Acceptable |
| 3.6 | 0.5 jour | ✓ Bien dimensionnée |
| 3.7–3.8 | 0.5–1 jour chacune | ✓ Bien dimensionnées |
| 4.1–4.3 | 0.5–1 jour chacune | ✓ Bien dimensionnées |
| 5.1–5.3 | 1 jour chacune | ✓ Bien dimensionnées |

**Aucune story ne semble sur-dimensionnée ou sous-dimensionnée.**

### Synthèse Epic Quality

- **Total stories :** 19 stories sur 5 épics
- **Violations critiques :** 0
- **Problèmes majeurs :** 2 (Epic 3 technique, offline tardif)
- **Préoccupations mineures :** 4 (tables d'un coup, ambiguïté WASM, voix TTS, Epic 1 technique)
- **Qualité globale :** Bonne à très bonne — les problèmes identifiés sont des choix délibérés documentés, pas des erreurs de conception

---

## Synthèse et Recommandations

### Statut de Readiness Global

# ✅ PRÊT POUR L'IMPLÉMENTATION

> Avec 2 ajustements recommandés avant de démarrer.

---

### Tableau de Bord des Problèmes

| Catégorie | Critique | Majeur | Mineur | Avertissement |
|---|---|---|---|---|
| Couverture FRs | 0 | 0 | 1 (FR12 divergence) | — |
| Couverture NFRs | 0 | 0 | 1 (NFR-C placement) | — |
| Alignement UX | 0 | 0 | 0 | 2 (stats pause, signal 3e) |
| Qualité épics | 0 | 2 | 4 | — |
| **Total** | **0** | **2** | **6** | **2** |

---

### Actions Immédiates Requises (Avant Story 1.1)

**Action 1 — Corriger FR12 dans le PRD**
- **Où :** `_bmad-output/planning-artifacts/prd.md`, ligne FR12
- **Quoi :** Remplacer "4 segments correspondant aux quadrants buccaux" par "8 segments (4 quadrants × avant/arrière) — ~15 secondes chacun"
- **Pourquoi :** Les épics, la spec UX et l'architecture sont tous alignés sur 8 segments. Le PRD est le seul document incohérent. Un développeur qui lit le PRD en premier aura un modèle mental incorrect.
- **Effort :** 5 minutes

**Action 2 — Clarifier le moment de chargement MediaPipe WASM**
- **Où :** `_bmad-output/planning-artifacts/epics.md`, Additional Requirements ou Story 3.1
- **Quoi :** Ajouter une note explicite : "MediaPipe WASM commence à charger au montage de `/home` (pas au démarrage app). NFR-P2 = pas de chargement WASM au démarrage app. getUserMedia = au tap uniquement."
- **Pourquoi :** L'ambiguïté entre Story 3.1 (`isMediaPipeLoading`) et NFR-P2 ("déféré au tap") pourrait conduire à une mauvaise implémentation (WASM chargé après le tap = UX dégradée).
- **Effort :** 10 minutes

---

### Recommandations Secondaires (Bonnes à avoir)

3. **Déplacer la configuration Workbox/SW de base en Epic 1** — pour que l'app soit offline lors de la première livraison terrain (Epic 4). Conserver l'optimisation du budget cache en Epic 5.

4. **Ajouter une note dans Story 3.3** précisant que "la narration Web Speech API générique est remplacée par Story 4.2 — ne pas livrer en production avec le placeholder".

5. **Clarifier `ParentAccessIcon` dans la spec UX** — supprimer "stats pause" de la description ou ajouter une note "stats V2" pour éviter que le développeur implémente un affichage de stats non prévu au PRD.

6. **Tester la voix TTS iOS Safari en français sur iPhone SE** avant de valider Epic 4 comme livrable terrain.

---

### Points Forts de la Planification

Ce projet présente une qualité de planification exceptionnelle pour un projet solo :

- **Traçabilité parfaite :** 100% des FRs et NFRs couverts dans les épics
- **Cohérence cross-documents :** PRD, UX, Architecture et Épics racontent la même histoire, avec seulement 3 divergences mineures
- **Prérequis techniques explicites :** le spike MediaPipe comme bloquant est correctement positionné et conditionne tout Epic 3
- **Philosophie produit encodée dans les ACs :** "zéro pénalité", "l'enfant ne voit jamais d'erreur technique", "bienveillance absolue" — ce ne sont pas des intentions, ce sont des critères de validation
- **Cas d'erreur couverts :** permission révoquée, IndexedDB vide, APIs non supportées, détection dégradée — tous ont leurs stories et leurs flows de récupération
- **19 stories bien dimensionnées** sans story sur-chargée ou sous-estimée

---

### Note Finale

Cette évaluation a identifié **10 problèmes** (0 critique, 2 majeurs, 6 mineurs, 2 avertissements) sur 5 catégories. Aucun ne bloque l'implémentation. Les 2 actions immédiates (correction FR12 + clarification WASM) devraient être adressées en moins de 15 minutes avant de commencer Story 1.1.

**Assesseur :** Winston (Agent Architecte)
**Date :** 2026-03-26
**Rapport :** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-26.md`

