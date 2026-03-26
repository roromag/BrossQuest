---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# BrossQuest - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for BrossQuest, decomposing the requirements from the PRD, UX Design and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Détection temps réel du mouvement oscillatoire de la main dans la zone bouche (brossage actif)
FR2: Distinction brossage actif / absence de mouvement
FR3: Accumulation cumulative du temps de brossage par quadrant, sans réinitialisation lors des pauses
FR4: Suspension de la progression narrative sans pénalité si le brossage s'arrête
FR5: Détection d'un manque d'attention → déclenchement d'un micro-événement réactif d'animation
FR6: Détection de la présence de l'utilisateur dans le champ caméra
FR7: Détection de l'orientation inversée du téléphone + adaptation automatique du flux caméra
FR8: Signal d'état « détection dégradée » (éclairage insuffisant / mauvais cadrage) distinct de l'absence de brossage
FR9: Lancement de la session par tap unique de l'enfant (déclenchement getUserMedia par geste utilisateur)
FR10: Structure de session en 3 phases séquentielles : Avant / Pendant / Après
FR11: Phase Avant : flux caméra visible brièvement pour calibration naturelle, puis fondu avant la phase Pendant
FR12: Phase Pendant structurée en 8 segments (4 quadrants × avant/arrière) — ~15s chacun
FR13: Progression de l'animation d'un segment au suivant selon le temps de brossage actif cumulé sur ce segment
FR14: Micro-événements d'animation déclenchés par inattention détectée — non aléatoires, non programmés
FR15: Micro-célébration visuelle et sonore à la fin d'une session complète
FR16: Retour visuel discret à la transition entre segments (feedback implicite de progression)
FR17: Sauvegarde de l'état de session en cours + reprise possible après interruption
FR18: Limitation à 1 session par période (matin 0h00–16h59 / soir 17h00–23h59)
FR19: Narration vocale courte en phase Avant avec injection dynamique du prénom de l'enfant
FR20: Progression narrative par épisodes séquentiels — un épisode consommé uniquement à la fin d'une session complète
FR21: Épisodes flashback disponibles comme alternative aux épisodes originaux (re-visite d'un épisode passé)
FR22: Adaptation du ton narratif selon la période détectée (matin : énergisant / soir : apaisant)
FR23: Détection automatique de la période de la journée pour adapter la narration sans action utilisateur
FR24: Création de profil enfant avec prénom par le parent lors de l'onboarding
FR25: Choix d'emoji par l'enfant lors du passage de main (premier geste dans l'app)
FR26: Modification de l'emoji et du prénom depuis les paramètres profil post-onboarding
FR27: Demande d'autorisation caméra depuis le flux onboarding parent (avant passage de main)
FR28: Accès à l'app via lien direct sans store (distribution hors App Store / Play Store)
FR29: Installation PWA sur l'écran d'accueil (Add to Home Screen)
FR30: Stockage du profil et de la progression localement (IndexedDB), sans compte en ligne en V1
FR31: Accès aux paramètres profil depuis l'interface parent post-onboarding
FR32: Sélection du profil enfant pour démarrer une session (écran d'accueil atmosphérique)
FR33: Détection de l'absence ou de la révocation de permission caméra au lancement
FR34: Flux de récupération permission caméra guidé pour le parent (instructions contextuelles selon navigateur/OS)
FR35: Isolation des erreurs techniques côté parent — l'enfant ne voit jamais d'écran d'erreur technique
FR36: Détection d'IndexedDB vide ou corrompu + flux d'onboarding de récupération rapide
FR37: Détection des APIs non supportées (MediaPipe WASM, IndexedDB) + message d'erreur explicite à l'ouverture
FR38: Fonctionnement offline après première installation, incluant assets WASM MediaPipe
FR39: Mise à jour du Service Worker sans interruption d'une session en cours (update différé à la prochaine ouverture)
FR40: Reprise ou réinitialisation de session après interruption technique (crash navigateur, mise en veille)

### NonFunctional Requirements

NFR-P1: Démarrage de l'app ≤ 10 secondes (LCP, réseau 4G, iOS Safari)
NFR-P2: Chargement du module MediaPipe WASM différé au tap de lancement session — ne bloque pas le démarrage app
NFR-P3: Délai de réponse animation ≤ 1 seconde après détection de geste (brossage actif → réaction visible)
NFR-P4: Animation fluide pendant la phase Pendant ≥ 30 fps (iPhone SE 2nd gen comme cible minimale)
NFR-P5: Budget cache Service Worker ≤ 30 Mo (contrainte Safari iOS)
NFR-R1: Profil et progression conservés après fermeture / réouverture et redémarrage appareil
NFR-R2: Session interrompue récupérable — état sauvegardé en temps réel (zone active + temps cumulé)
NFR-R3: Service Worker mis en cache avant la fin de l'onboarding — offline disponible dès l'installation
NFR-R4: Spike technique MediaPipe validé en conditions réelles avant tout développement produit
NFR-C1: Flux caméra traité exclusivement on-device (MediaPipe WASM) — aucune image ou donnée biométrique transmise
NFR-C2: Aucune donnée personnelle envoyée à un serveur en V1 (pas d'analytics, pas de tracking, pas de telemetry)
NFR-C3: Prénom de l'enfant stocké uniquement en local (IndexedDB) — jamais transmis
NFR-C4: Aucun cookie, aucun localStorage de tracking, aucune dépendance analytics tierce en V1
NFR-X1: Support navigateurs : iOS Safari ≥ 15.4 et Android Chrome ≥ 100
NFR-X2: Résolution minimale supportée : 360×640px (portrait)
NFR-X3: Orientation portrait uniquement — orientation inversée détectée et gérée (FR7), pas de mode paysage
NFR-X4: App fonctionnelle sans connexion internet après première installation

### Additional Requirements

- **Starter template** : `npm create vite@latest brossquest -- --template react-ts` + Tailwind CSS v4 (`@tailwindcss/vite`) + vite-plugin-pwa + Vitest + Testing Library + jsdom. L'initialisation du projet constitue la première story d'implémentation (Epic 1, Story 1)
- **MediaPipe WASM chargé en différé** : commence à charger au montage de `/home`, pas au démarrage de l'app (NFR-P2 = ne bloque pas le LCP au démarrage). `getUserMedia` est appelé au tap uniquement — pas MediaPipe. Le `PulseButton` est activé quand le WASM est prêt (`isMediaPipeLoading = false`)
- **getUserMedia iOS Safari** : uniquement dans le même event handler que le tap utilisateur — aucune logique asynchrone entre le tap et l'appel getUserMedia
- **AudioContext iOS** : créé/resumed dans le geste utilisateur du tap session, repris obligatoirement au retour au premier plan
- **IndexedDB source de vérité unique** : 4 tables (profiles, episodes, SessionState, sessionHistory) — Dexie comme ORM
- **Service Worker cache-first (Workbox)** : budget < 30 Mo, mise à jour différée jusqu'à fin de session
- **Guards de navigation** : ProfileGuard, CameraGuard, SessionPeriodGuard — résolution avant rendu, jamais de rendu partiel
- **Routing par persona** : routes distinctes /onboarding, /handoff, /home, /session, /parent, /recovery/camera, /recovery/profile — frontière claire parent/enfant
- **Isolation erreurs** : toutes erreurs techniques redirigent vers /recovery/*, jamais exposées à l'enfant (routes /home, /session, /handoff)
- **6 composants custom critiques** : PulseButton, NebulaCanvas, EmojiPicker, NarrativeCard, CameraFade, PermissionRecovery
- **Conventions absolues** : jamais d'import direct `@mediapipe/tasks-vision` hors `src/lib/mediapipe/` ; sélecteurs Zustand fins ; tests co-localisés ; Dexie uniquement pour la persistance ; zéro CDN externe
- **Déploiement** : build statique → GitHub Pages via GitHub Actions

### UX Design Requirements

UX-DR1: Implémentation du système de tokens de design — palette sourde nuit (bg-session #1E2A3A, bg-parent #2D3748, bg-surface #3D4F63), tokens animation (anim-avant #48BB78, anim-arrière #2D6A4F, anim-micro #F6AD55), accents (accent-cyan #76E4F7, accent-ambre #F6AD55, accent-erreur #FC8181), typographie Inter variable, espacements en multiples de 4px
UX-DR2: Composant `PulseButton` — cercle centré min 120×120px, animation radial pulse CSS, 3 états (idle / presence-detected / tapped→fondu session), déclencheur getUserMedia iOS Safari au tap
UX-DR3: Composant `NebulaCanvas` — canvas HTML5 plein écran, système de particules, 8 positions spatiales (4 quadrants × avant/arrière), zones avant #48BB78 dispersées / zones arrière #2D6A4F denses, réactivité vélocité MediaPipe en temps réel, micro-événement inattention teinte ambre #F6AD55 800ms, dérive organique ~3s entre zones, zéro interaction tactile
UX-DR4: Composant `EmojiPicker` — grille 4×2, taille emoji 64px, zéro texte, sélection unique, haptic feedback si disponible, cellules ≥ 56×56px
UX-DR5: Composant `NarrativeCard` — écran atmosphérique fond étoilé CSS, titre épisode en cours, PulseButton centré, icône parent discrète opacité 40%, aucune décision utilisateur requise
UX-DR6: Composant `CameraFade` — transition flux caméra → NebulaCanvas, fondu CSS ~3s ease-in-out, libération flux vidéo après transition complète, `<video playsinline>` obligatoire iOS
UX-DR7: Composant `CelebrationOverlay` — micro-célébration proportionnée (jamais excessive), accroche narrative vers prochain épisode, teinte ambre #F6AD55, sans score ni étoiles
UX-DR8: Composant `PermissionRecovery` — instructions contextuelles selon OS (iOS Safari / Android Chrome), sans rouge vif, flux guidé parent uniquement, jamais exposé à l'enfant
UX-DR9: Composant `ParentAccessIcon` — icône discrète sur NarrativeCard, accès ProfileSettings, opacité réduite, hors parcours enfant principal
UX-DR10: Layout session plein écran — 100vw × 100vh (100dvh), safe areas iOS `env(safe-area-inset-*)`, `viewport-fit=cover`, zéro chrome UI visible pendant la session
UX-DR11: Accessibilité fonctionnelle — contraste ≥ 4.5:1 pour tout texte parent, zones tactiles ≥ 44×44px tous éléments interactifs, navigation enfant par pictogrammes exclusivement (zéro texte requis pour action), `<video playsinline autoplay muted>` pour flux caméra
UX-DR12: Responsive mobile portrait uniquement — ajustements max-width 390px pour iPhone SE, pas de breakpoint tablet/desktop, paysage bloqué activement pendant session

### FR Coverage Map

FR1: Epic 3 — Détection mouvement oscillatoire main (brossage actif)
FR2: Epic 3 — Distinction brossage actif / absence de mouvement
FR3: Epic 3 — Accumulation cumulative temps de brossage par segment
FR4: Epic 3 — Suspension progression sans pénalité
FR5: Epic 3 — Détection inattention → micro-événement réactif
FR6: Epic 3 — Détection présence utilisateur champ caméra
FR7: Epic 3 — Détection orientation inversée + adaptation flux caméra
FR8: Epic 3 — Signal détection dégradée (éclairage / cadrage)
FR9: Epic 3 — Lancement session par tap unique (getUserMedia iOS)
FR10: Epic 3 — Structure session 3 phases : Avant / Pendant / Après
FR11: Epic 3 — Phase Avant : flux caméra brief + fondu
FR12: Epic 3 — Phase Pendant : 8 segments (4 quadrants × avant/arrière)
FR13: Epic 3 — Progression animation segment par segment (temps cumulé)
FR14: Epic 3 — Micro-événements déclenchés par inattention détectée
FR15: Epic 3 — Micro-célébration visuelle et sonore fin session
FR16: Epic 3 — Retour visuel discret à la transition entre segments
FR17: Epic 3 — Sauvegarde état session en cours (IndexedDB temps réel)
FR18: Epic 3 — Limite 1 session par période (matin / soir)
FR19: Epic 4 — Narration vocale phase Avant avec prénom injecté dynamiquement
FR20: Epic 4 — Progression narrative par épisodes séquentiels
FR21: Epic 4 — Épisodes flashback disponibles
FR22: Epic 4 — Adaptation ton narratif matin / soir
FR23: Epic 4 — Détection automatique période de la journée
FR24: Epic 2 — Création profil enfant (prénom) par le parent
FR25: Epic 2 — Choix emoji enfant lors du passage de main
FR26: Epic 5 — Modification emoji et prénom post-onboarding
FR27: Epic 2 — Demande autorisation caméra pendant onboarding parent
FR28: Epic 2 — Accès app via lien direct (hors App Store / Play Store)
FR29: Epic 2 — Installation PWA sur l'écran d'accueil
FR30: Epic 2 — Stockage profil et progression en local (IndexedDB)
FR31: Epic 5 — Accès paramètres profil depuis interface parent
FR32: Epic 2 — Sélection profil enfant depuis l'écran d'accueil atmosphérique
FR33: Epic 2 — Détection absence / révocation permission caméra au lancement
FR34: Epic 2 — Flux récupération permission caméra guidé (instructions OS)
FR35: Epic 2 — Isolation erreurs techniques côté parent
FR36: Epic 2 — Détection IndexedDB vide + onboarding récupération rapide
FR37: Epic 1 — Détection APIs non supportées + message d'erreur explicite
FR38: Epic 5 — Fonctionnement offline après première installation (SW cache-first)
FR39: Epic 5 — Mise à jour SW sans interruption session (update différé)
FR40: Epic 3 — Reprise / réinitialisation session après interruption technique

## Epic List

### Epic 1 : Fondation technique & Spike MediaPipe
L'équipe dispose d'une base de code fonctionnelle (Vite + React + TypeScript, routing, guards, Dexie schema, CI/CD) et a prouvé que MediaPipe Hands fonctionne en conditions réelles (salle de bain, iOS Safari, éclairage variable). Aucun développement fonctionnel ne peut démarrer avant validation du spike — c'est le prérequis bloquant du projet.
**FRs couverts :** FR37
**NFRs adressés :** NFR-R4

### Epic 2 : Onboarding parent & passage de main
Un parent peut installer l'app via lien direct, créer le profil de son enfant, obtenir la permission caméra et passer la main — en moins de 3 minutes. L'enfant prend possession de son espace en choisissant son emoji. Les erreurs techniques (permission révoquée, IndexedDB vide) restent côté parent, l'enfant n'en voit jamais.
**FRs couverts :** FR24, FR25, FR27, FR28, FR29, FR30, FR32, FR33, FR34, FR35, FR36

### Epic 3 : Session technique complète — moteur détection, nébuleuse & pipeline Avant/Pendant/Après
Le pipeline de session complet est câblé et validé techniquement : détection MediaPipe (3 états, 8 zones, orientation), animation nébuleuse organique réactive, progression cumulative, micro-événements, sauvegarde IndexedDB temps réel, limite session/période. Une narration placeholder (Web Speech API générique) valide le pipeline Avant→Pendant→Après sans contenu éditorial final.
**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR40
**NFRs adressés :** NFR-P2, NFR-P3, NFR-P4, NFR-R2

### Epic 4 : Narration & Série narrative
L'enfant vit une histoire personnalisée qui avance épisode par épisode. La narration vocale inclut son prénom. Le ton s'adapte automatiquement au matin ou au soir. Les épisodes flashback maintiennent l'engagement sur la durée. C'est le premier epic qui constitue un livrable terrain pour le cercle proche.
**FRs couverts :** FR19, FR20, FR21, FR22, FR23
**NFRs adressés :** NFR-C1, NFR-C2, NFR-C3, NFR-C4

### Epic 5 : PWA production-ready, paramètres & polish
L'app fonctionne offline dès la première installation, se met à jour sans interruption de session, les paramètres profil (prénom, emoji) sont accessibles au parent post-onboarding. L'expérience est fiable et performante sur iOS Safari et Android Chrome dans les conditions cibles.
**FRs couverts :** FR26, FR31, FR38, FR39
**NFRs adressés :** NFR-P1, NFR-P5, NFR-R1, NFR-R3, NFR-X1, NFR-X2, NFR-X3, NFR-X4

---

## Epic 1 : Fondation technique & Spike MediaPipe

L'équipe dispose d'une base de code fonctionnelle (Vite + React + TypeScript, routing, guards, Dexie schema, CI/CD) et a prouvé que MediaPipe Hands fonctionne en conditions réelles (salle de bain, iOS Safari, éclairage variable). Aucun développement fonctionnel ne peut démarrer avant validation du spike — c'est le prérequis bloquant du projet.

### Story 1.1 : Initialisation du projet et pipeline CI/CD

As a développeur,
I want initialiser le projet BrossQuest avec la stack définie et le déploiement automatique,
So that disposer d'une base de code opérationnelle déployée sur GitHub Pages dès le premier commit.

**Acceptance Criteria:**

**Given** un dépôt GitHub vide
**When** le développeur exécute `npm create vite@latest brossquest -- --template react-ts` et installe les dépendances (Tailwind CSS v4, vite-plugin-pwa, Vitest, Testing Library, jsdom, TanStack Router, Zustand, Dexie)
**Then** l'app démarre en local avec `npm run dev` et affiche un écran par défaut
**And** `npm run build` produit un bundle statique sans erreur TypeScript strict
**And** un push sur `main` déclenche un workflow GitHub Actions qui déploie le build sur GitHub Pages
**And** l'URL GitHub Pages est accessible et charge l'app
**And** `vite-plugin-pwa` est configuré en mode `generateSW` minimal dans `vite.config.ts` — Service Worker actif dès le premier déploiement GitHub Pages (offline disponible avant Epic 5)

### Story 1.2 : Architecture routing, guards & structure dossiers

As a développeur,
I want mettre en place la structure de routing TanStack Router avec les guards de navigation,
So that avoir les frontières parent/enfant et les routes de récupération en place avant tout développement fonctionnel.

**Acceptance Criteria:**

**Given** le projet initialisé (Story 1.1)
**When** l'app est lancée
**Then** les 7 routes sont enregistrées : `/onboarding`, `/handoff`, `/home`, `/session`, `/parent`, `/recovery/camera`, `/recovery/profile`
**And** `ProfileGuard` redirige vers `/onboarding` si `Profile.onboardingComplete = false` ou IndexedDB vide
**And** `CameraGuard` redirige vers `/recovery/camera` si la permission caméra est absente ou révoquée
**And** `SessionPeriodGuard` place `/home` en mode repos si une session complète existe pour la période courante
**And** la structure dossiers `src/routes/`, `src/guards/`, `src/components/`, `src/stores/`, `src/lib/`, `src/constants/`, `src/types/` est créée conformément à l'architecture

### Story 1.3 : Schéma IndexedDB Dexie & stores Zustand initiaux

As a développeur,
I want initialiser le schéma Dexie avec les 4 tables et les stores Zustand de base,
So that la couche de persistance soit opérationnelle avant les features qui en dépendent.

**Acceptance Criteria:**

**Given** le projet avec routing en place (Story 1.2)
**When** l'app est lancée pour la première fois
**Then** Dexie crée la base IndexedDB `brossquest` avec les 4 tables : `profiles`, `episodes`, `sessionState`, `sessionHistory`
**And** les types TypeScript sont définis pour chaque table (Profile, Episode, SessionState, SessionHistory)
**And** `useProfileStore`, `useSessionStore`, `useCameraStore`, `useEpisodeStore` sont créés avec leurs états initiaux typés
**And** les queries Dexie de base (getProfile, saveProfile, getActiveSession, saveSessionHistory) sont implémentées et testées
**And** tous les tests unitaires passent (stores + queries co-localisés)

### Story 1.4 : Spike MediaPipe Hands — validation en conditions réelles

As a développeur,
I want valider que MediaPipe Hands WASM détecte correctement le mouvement de brossage en conditions réelles,
So that confirmer le prérequis bloquant avant tout développement fonctionnel sur la session.

**Acceptance Criteria:**

**Given** un prototype isolé (route `/spike`) qui charge MediaPipe Hands WASM via `src/lib/mediapipe/detector.ts`
**When** l'utilisateur se place devant la caméra à 40–70cm dans une salle de bain avec éclairage standard et effectue un mouvement oscillatoire de la main
**Then** la détection retourne l'état `brushing-active` dans ≤ 1 seconde après le début du mouvement (NFR-P3)
**And** l'absence de mouvement retourne l'état `pause` correctement
**And** le module WASM se charge en différé (pas au démarrage de l'app) sans bloquer le rendu initial (NFR-P2)
**And** la détection fonctionne sur iOS Safari (iPhone physique) sans crash mémoire
**And** les types `DetectionResult`, `DetectionState`, `DetectionQuality` sont définis dans `src/lib/mediapipe/types.ts`
**And** aucun import direct de `@mediapipe/tasks-vision` n'existe hors de `src/lib/mediapipe/`
**And** le résultat du spike est documenté (fonctionne / ne fonctionne pas, conditions testées, appareil utilisé) — condition bloquante pour Epic 3

---

## Epic 2 : Onboarding parent & passage de main

Un parent peut installer l'app via lien direct, créer le profil de son enfant, obtenir la permission caméra et passer la main — en moins de 3 minutes. L'enfant prend possession de son espace en choisissant son emoji. Les erreurs techniques restent côté parent, l'enfant n'en voit jamais.

### Story 2.1 : Écran d'accueil onboarding & création de profil parent

As a parent,
I want créer le profil de mon enfant en saisissant son prénom,
So that personnaliser l'expérience avant de passer la main à mon enfant.

**Acceptance Criteria:**

**Given** un utilisateur ouvre l'app pour la première fois (IndexedDB vide → ProfileGuard redirige vers `/onboarding`)
**When** le parent saisit le prénom de l'enfant et valide
**Then** le prénom est sauvegardé en IndexedDB (`profiles` table, `onboardingComplete = false`)
**And** le flux avance vers l'étape permission caméra
**And** l'interface est sobre, max-width 390px, une seule action principale par écran
**And** le champ texte respecte les patterns de formulaire (label fixe, focus `accent-cyan`, validation après blur)
**And** les zones tactiles sont ≥ 44×44px

### Story 2.2 : Demande et gestion de la permission caméra

As a parent,
I want comprendre pourquoi l'app a besoin de la caméra et l'autoriser facilement,
So that la session de brossage puisse détecter le geste de mon enfant.

**Acceptance Criteria:**

**Given** le profil enfant créé (Story 2.1) et l'onboarding parent en cours
**When** l'app demande la permission caméra
**Then** une explication en une phrase précède la demande système ("traitement local, rien n'est envoyé")
**And** si la permission est accordée, le flux avance vers l'installation PWA
**And** si la permission est refusée, `PermissionRecovery` affiche des instructions contextuelles selon l'OS (iOS Safari / Android Chrome) sans rouge vif ni modale bloquante
**And** le flux de récupération permet de ré-autoriser et reprendre l'onboarding normalement
**And** `CameraGuard` vérifie l'état de la permission via `navigator.permissions.query({name:'camera'})` avant tout écran enfant
**And** l'enfant ne voit jamais cet écran d'erreur (FR35) — le guard intercepte avant tout écran enfant

### Story 2.3 : Installation PWA guidée

As a parent,
I want installer l'app sur l'écran d'accueil de mon téléphone,
So that mon enfant puisse lancer l'app rapidement sans passer par un navigateur.

**Acceptance Criteria:**

**Given** la permission caméra accordée (Story 2.2)
**When** l'app affiche l'étape d'installation
**Then** des instructions Add to Home Screen sont affichées selon le navigateur (iOS Safari : partage → "Sur l'écran d'accueil" / Android Chrome : menu → "Ajouter à l'écran d'accueil")
**And** l'installation est suggérée, pas bloquante — le parent peut continuer sans installer
**And** le `manifest.webmanifest` est correctement configuré (nom, icônes 192px et 512px, `display: standalone`, `orientation: portrait`)
**And** l'app installée démarre directement sur l'écran d'accueil enfant sans barre de navigation navigateur

### Story 2.4 : Passage de main — sélection emoji par l'enfant

As a enfant,
I want choisir mon emoji parmi une sélection,
So that m'approprier l'app avant même le premier brossage.

**Acceptance Criteria:**

**Given** l'onboarding parent complété (Stories 2.1–2.3) et la route `/handoff` affichée
**When** l'enfant voit la grille d'emojis
**Then** `EmojiPicker` affiche une grille 4×2 d'emojis, taille 64px, zéro texte, cellules ≥ 56×56px
**And** un seul emoji est sélectionnable — la sélection est confirmée par un retour haptique si disponible
**And** après sélection, l'emoji est sauvegardé dans `profiles` et `Profile.onboardingComplete = true`
**And** l'app redirige vers `/home` (écran atmosphérique)
**And** `ProfileGuard` ne redirige plus vers `/onboarding` après ce point

### Story 2.5 : Flux de récupération IndexedDB vide

As a parent,
I want retrouver rapidement le profil de mon enfant si l'app a perdu ses données locales,
So that mon enfant ne voie jamais une expérience brisée.

**Acceptance Criteria:**

**Given** iOS a vidé silencieusement IndexedDB (ou l'utilisateur a vidé le cache navigateur)
**When** l'app est lancée et `ProfileGuard` détecte IndexedDB vide
**Then** l'app redirige vers `/recovery/profile` et non vers un écran d'erreur brut
**And** un onboarding de récupération rapide permet de re-saisir le prénom et choisir un emoji en < 1 minute
**And** après récupération, `Profile.onboardingComplete = true` est restauré et l'app reprend normalement depuis `/home`
**And** le message affiché est bienveillant et explicatif — pas un message d'erreur technique

---

## Epic 3 : Session technique complète — moteur détection, nébuleuse & pipeline Avant/Pendant/Après

Le pipeline de session complet est câblé et validé techniquement : détection MediaPipe (3 états, 8 zones, orientation), animation nébuleuse organique réactive, progression cumulative, micro-événements, sauvegarde IndexedDB temps réel, limite session/période. Une narration placeholder (Web Speech API générique) valide le pipeline Avant→Pendant→Après sans contenu éditorial final.

### Story 3.1 : Écran d'accueil atmosphérique & PulseButton

As a enfant (ou parent),
I want voir l'écran d'accueil atmosphérique avec le bouton de lancement,
So that lancer une session en un seul tap.

**Acceptance Criteria:**

**Given** l'onboarding complété et `/home` affiché
**When** l'écran se charge
**Then** `NarrativeCard` affiche un fond étoilé CSS, le titre de l'épisode en cours, et `PulseButton` centré
**And** `ParentAccessIcon` est visible avec opacité 40%, hors parcours enfant principal
**And** `PulseButton` est en état `idle` (pulse lent) et passe en `presence-detected` (pulse accéléré) quand la caméra détecte une présence
**And** `PulseButton` est disabled (`isMediaPipeLoading = true`) tant que le module WASM n'est pas prêt — aucun spinner visible, le bouton apparaît simplement quand prêt
**And** le layout est plein écran 100vw × 100dvh, safe areas iOS respectées, zéro chrome navigateur visible

### Story 3.2 : Lancement session & intégration caméra (getUserMedia iOS)

As a enfant,
I want lancer la session en tapant le bouton pulsant,
So that la caméra s'active et la session démarre.

**Acceptance Criteria:**

**Given** `/home` affiché avec `PulseButton` en état `presence-detected`
**When** l'enfant tape le bouton
**Then** `getUserMedia` est appelé dans le même event handler que le tap (contrainte iOS Safari stricte)
**And** le flux caméra est activé et visible dans `<video playsinline autoplay muted>`
**And** si `getUserMedia` échoue (permission révoquée entre-temps), `CameraGuard` redirige vers `/recovery/camera` sans exposer d'erreur technique à l'enfant
**And** `useCameraStore` met à jour `permissionState` et `isMediaPipeLoading` en conséquence
**And** `AudioContext` est créé/resumed dans ce même geste utilisateur (contrainte iOS Safari)

### Story 3.3 : Phase Avant — CameraFade & narration placeholder

As a enfant,
I want voir brièvement mon reflet dans la caméra avant que l'animation démarre,
So that m'ancrer dans le moment avant le brossage.

**Acceptance Criteria:**

**Given** la session lancée et le flux caméra actif (Story 3.2)
**When** la phase Avant démarre
**Then** le flux caméra est visible ~3 secondes (calibration naturelle)
**And** une narration placeholder via Web Speech API se déclenche (texte générique, prénom injecté depuis `useProfileStore`) — valide le pipeline narratif sans contenu éditorial final
**And** `CameraFade` effectue un fondu CSS ~3s ease-in-out de la caméra vers `NebulaCanvas`
**And** le flux vidéo est libéré après la transition complète
**And** `useSessionStore.phase` passe de `'before'` à `'during'` à la fin du fondu

### Story 3.4 : NebulaCanvas — animation nébuleuse 8 zones

As a enfant,
I want voir une animation qui se déplace lentement pendant que je brosse,
So that être guidé implicitement vers chaque zone sans instruction explicite.

**Acceptance Criteria:**

**Given** la phase `'during'` active et `NebulaCanvas` rendu plein écran
**When** `activeZone` change (1–8)
**Then** la nébuleuse dérive organiquement vers la position spatiale correspondante en ~3s
**And** zones avant (1, 3, 5, 7) : nébuleuse étendue, couleur `#48BB78`, particules rapides et légères
**And** zones arrière (2, 4, 6, 8) : nébuleuse contractée, couleur `#2D6A4F`, particules lentes et denses
**And** `NebulaCanvas` lit `activeZone` et `velocity` via sélecteurs Zustand fins — jamais le store entier
**And** aucune interaction tactile sur le canvas
**And** le canvas tient ≥ 30fps sur iPhone SE 2nd gen

### Story 3.5 : Détection MediaPipe & progression cumulative

As a enfant,
I want que ma progression avance uniquement quand je brosse activement,
So that vivre une expérience honnête où mon geste compte vraiment.

**Acceptance Criteria:**

**Given** `NebulaCanvas` actif et MediaPipe WASM chargé
**When** MediaPipe détecte un mouvement oscillatoire de la main
**Then** `DetectionState` passe à `brushing-active` et le temps s'accumule sur `zoneProgress[activeZone]`
**And** quand le brossage s'arrête, `DetectionState` passe à `pause` — la progression s'arrête sans réinitialisation
**And** quand `zoneProgress[activeZone]` atteint `ZONE_DURATION_MS` (~15s), `useSessionStore.advanceZone()` est appelé
**And** la latence entre début de mouvement et réaction visible est ≤ 1 seconde (NFR-P3)
**And** `detectionQuality: 'degraded'` est exposé dans `useCameraStore` si l'éclairage ou le cadrage est insuffisant — sans interrompre la session enfant

### Story 3.6 : Micro-événements réactifs à l'inattention

As a enfant,
I want que l'animation réagisse doucement si je me décroche,
So that être réengagé sans jamais recevoir de signal négatif.

**Acceptance Criteria:**

**Given** la session `'during'` active et `DetectionState` en `pause` depuis > seuil d'inattention
**When** le seuil est atteint
**Then** `NebulaCanvas` déclenche un micro-événement : contraction + teinte `#F6AD55` (ambre) pendant 800ms
**And** le micro-événement est déclenché par `DetectionState`, pas par un timer fixe
**And** aucun son, aucune alerte, aucun texte n'accompagne le micro-événement
**And** si l'enfant reprend le brossage, la progression reprend exactement là où elle s'était arrêtée
**And** si l'orientation du téléphone est inversée, le flux caméra est retourné automatiquement via `screen.orientation` API

### Story 3.7 : Phase Après & micro-célébration

As a enfant,
I want voir une célébration à la fin de ma session,
So that ressentir une fierté légère et une curiosité pour la prochaine fois.

**Acceptance Criteria:**

**Given** les 8 zones complétées et `useSessionStore.phase` passant à `'after'`
**When** la phase Après démarre
**Then** `CelebrationOverlay` affiche une micro-célébration visuelle proportionnée, teinte ambre `#F6AD55`, durée 5–10s
**And** une accroche narrative placeholder est lue via Web Speech API (promesse de suite, pas de résolution)
**And** aucun score, aucune étoile, aucun pourcentage n'est affiché
**And** l'app retourne vers `/home` après la célébration — l'épisode courant est marqué `status: 'played'` en IndexedDB
**And** `SessionPeriodGuard` détecte la session complète → `/home` affiche le mode repos ("À ce soir ✨" ou "À demain ✨" selon la période)

### Story 3.8 : Sauvegarde temps réel & reprise après interruption

As a enfant (ou parent),
I want que ma progression soit préservée si la session est interrompue,
So that ne jamais perdre de brossage accompli.

**Acceptance Criteria:**

**Given** une session en cours (`useSessionStore.status = 'in_progress'`)
**When** le téléphone se verrouille, reçoit un appel ou le parent reprend l'app
**Then** `sessionState` (episodeId, activeZone, zoneProgress, startedAt, period) est sauvegardé en IndexedDB en temps réel à chaque changement de zone
**And** au prochain lancement, `ProfileGuard` détecte une session interrompue et propose "Reprendre" ou "Recommencer l'épisode"
**And** si "Reprendre" : `useSessionStore` est réhydraté depuis IndexedDB et la session reprend à la zone sauvegardée
**And** si "Recommencer" : `sessionState` est réinitialisé et l'épisode repart depuis le début
**And** `sessionHistory` enregistre une entrée complète à la fin de chaque session (totalDuration, totalPauseTime, zonesCompleted)

---

## Epic 4 : Narration & Série narrative

L'enfant vit une histoire personnalisée qui avance épisode par épisode. La narration vocale inclut son prénom. Le ton s'adapte automatiquement au matin ou au soir. Les épisodes flashback maintiennent l'engagement sur la durée. C'est le premier epic qui constitue un livrable terrain pour le cercle proche.

### Story 4.1 : Système d'épisodes séquentiels & flashbacks

As a enfant,
I want que chaque session me fasse avancer dans une histoire qui continue,
So that vouloir revenir le lendemain pour savoir la suite.

**Acceptance Criteria:**

**Given** la base d'épisodes définie dans `src/constants/episodes.ts`
**When** une session se termine avec toutes les zones complétées
**Then** l'épisode courant passe à `status: 'played'` et `playedAt` est enregistré en IndexedDB
**And** l'épisode suivant (type `'original'` ou `'flashback'`) devient `status: 'current'`
**And** `NarrativeCard` affiche le titre et l'accroche du prochain épisode dès le retour sur `/home`
**And** si tous les épisodes originaux sont joués, un épisode flashback est sélectionné automatiquement
**And** un épisode n'est consommé que si la session est complète — une session interrompue ne fait pas avancer l'histoire

### Story 4.2 : Narration vocale Web Speech API avec prénom & scripts éditoriaux

As a enfant,
I want entendre mon prénom dans une narration qui m'emmène dans l'épisode,
So that me sentir le protagoniste de l'histoire avant même de commencer à brosser.

**Acceptance Criteria:**

**Given** la phase Avant d'une session active et l'épisode courant chargé depuis `useEpisodeStore`
**When** la phase Avant démarre
**Then** `src/lib/speech/narrator.ts` appelle `window.speechSynthesis.cancel()` puis `speak()` avec le script narratif de l'épisode courant
**And** le prénom de l'enfant est injecté via template literal : `` `Le Dragon Molaire est malade, ${profile.firstName}.` `` — jamais par concaténation
**And** le script narratif encode la zone de départ de la session pour guider implicitement l'animation
**And** au retour au premier plan iOS (`visibilitychange`), `speechSynthesis.cancel()` est appelé pour éviter la double lecture
**And** la narration fonctionne sans aucun fichier audio précaché — Web Speech API uniquement (zéro Mo de budget cache consommé)

### Story 4.3 : Adaptation matin / soir & accroche narrative fin de session

As a enfant,
I want que l'app sente différemment le matin et le soir,
So that chaque session soit accordée à mon état du moment.

**Acceptance Criteria:**

**Given** une session lancée à n'importe quel moment de la journée
**When** `useEpisodeStore` détecte la période courante
**Then** la période est déterminée automatiquement : matin si 0h00–16h59, soir si 17h00–23h59
**And** le ton narratif de la phase Avant est énergisant le matin, apaisant le soir — deux versions du script par épisode
**And** `period` est sauvegardé dans `sessionState` et `sessionHistory` pour le signal de transfert (totalPauseTime décroissant)
**And** la phase Après inclut une accroche narrative vers le prochain épisode, différente selon la période
**And** aucune action utilisateur n'est requise pour l'adaptation — entièrement automatique

---

## Epic 5 : PWA production-ready, paramètres & polish

L'app fonctionne offline dès la première installation, se met à jour sans interruption de session, les paramètres profil (prénom, emoji) sont accessibles au parent post-onboarding. L'expérience est fiable et performante sur iOS Safari et Android Chrome dans les conditions cibles.

### Story 5.1 : Service Worker offline-first & budget cache

As a parent (ou enfant),
I want que l'app fonctionne sans réseau après la première installation,
So that pouvoir lancer une session dans la salle de bain sans connexion.

**Acceptance Criteria:**

**Given** l'app installée en PWA sur l'écran d'accueil
**When** l'appareil est en mode avion ou sans réseau
**Then** l'app se charge complètement depuis le cache Service Worker (JS, CSS, WASM MediaPipe, icônes, manifest) — aucune requête réseau requise
**And** le Service Worker est préchargé avant la fin de l'onboarding — offline disponible dès l'installation
**And** le budget total des assets précachés est ≤ 30 Mo — vérifié par un test de build
**And** si une mise à jour est disponible en cours de session, le Service Worker l'installe en arrière-plan et l'applique uniquement au prochain lancement — aucune interruption visible
**And** `vite-plugin-pwa` est configuré en mode `generateSW` avec stratégie `CacheFirst` pour tous les assets statiques

### Story 5.2 : Paramètres profil parent (prénom & emoji)

As a parent,
I want modifier le prénom et l'emoji de mon enfant après l'onboarding,
So that corriger une erreur ou laisser l'enfant changer d'emoji.

**Acceptance Criteria:**

**Given** l'app en cours d'utilisation normale et `ParentAccessIcon` visible sur `/home`
**When** le parent tape l'icône discrète
**Then** `ParentAccessIcon` est accessible depuis `/home`, opacité 40%, min 44×44px de zone de tap
**And** la route `/parent` affiche `ProfileSettings` avec le prénom et l'emoji actuels éditables
**And** la modification du prénom est sauvegardée en IndexedDB et immédiatement reflétée dans la narration vocale
**And** la modification de l'emoji est sauvegardée et reflétée sur `NarrativeCard`
**And** `ProfileSettings` se ferme par swipe bas ou bouton retour OS — retour à `/home`
**And** l'accès `/parent` est hors parcours enfant principal — aucun enfant n'y accède accidentellement pendant une session

### Story 5.3 : Performance, compatibilité & accessibilité production

As a parent ou enfant,
I want que l'app démarre rapidement et fonctionne de façon fiable sur mon téléphone,
So that ne jamais avoir de friction technique au moment du brossage.

**Acceptance Criteria:**

**Given** l'app installée en PWA sur iOS Safari ≥ 15.4 ou Android Chrome ≥ 100
**When** l'app est lancée depuis l'icône écran d'accueil, hors réseau
**Then** le premier écran interactif est disponible en ≤ 10 secondes — MediaPipe WASM non inclus dans ce budget
**And** l'app s'affiche correctement sur iPhone SE (375×667px) comme plancher et iPhone 16 Pro Max (430×932px) comme plafond
**And** les safe areas iOS sont respectées sur tous les écrans (`env(safe-area-inset-*)`, `100dvh`, `viewport-fit=cover`)
**And** le mode paysage est bloqué activement pendant la session (`screen.orientation.lock('portrait')` si supporté, sinon overlay)
**And** le contraste texte est ≥ 4.5:1 sur tous les écrans parent — vérifié manuellement sur iPhone SE
**And** toutes les zones tactiles parent sont ≥ 44×44px — enfant ≥ 56×56px
**And** profil et progression conservés après fermeture / redémarrage appareil — aucune perte lors d'une fermeture normale
