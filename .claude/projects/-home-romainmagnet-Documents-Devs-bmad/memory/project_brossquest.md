---
name: BrossQuest — Projet app brossage de dents
description: Contexte et décisions clés du projet BrossQuest, app PWA de brossage de dents pour enfants
type: project
---

**BrossQuest** — PWA d'aide au brossage de dents pour enfants, développée par Romain pour son enfant et son entourage proche.

**Why:** Usage personnel/familial, pas de diffusion large prévue. Basé sur l'expérience directe avec son propre enfant.

**How to apply:** Garder les solutions simples et pragmatiques. Pas besoin d'over-engineering pour une audience large.

---

## Décisions clés validées

- **Nom :** BrossQuest
- **Format :** PWA (Progressive Web App) — web mobile, installable, pas d'App Store
- **Durée fixe :** 2 minutes (pas de durée adaptative — âge minimum implicite = enfant autonome)
- **Input principal :** Micro (Web Audio API) — détection présence son (brossage) vs voix vs silence
- **Brosse électrique :** Compatible — détection binaire ON/OFF, pas d'intensité
- **Pas de caméra** — trop complexe pour PWA, pas nécessaire
- **Pas de notifications** — philosophie bienveillance pure, zéro pression

## Architecture

```
PWA offline-first
├── Interface enfant : 100% pictographique (zéro texte requis)
├── Interface parent : configuration, tableau de bord
├── Audio : Web Audio API — 3 états (brossage / voix / silence)
├── Stockage : IndexedDB + Service Worker + Background Sync
└── Backend : comptes parents, profils enfants, sync cloud
```

## Système de sessions

- **2 demi-journées** : Matin (0h-16h59) + Soir (17h-23h59)
- **1 session max par demi-journée** — anti-farming
- **Pas de punition** pour sessions manquées — l'aventure attend

## Narration

- Histoire progresse uniquement si l'enfant brosse (brossage = moteur)
- **2 couches indépendantes** : progression narrative (épisodes) + ton ambiant (matin/soir)
- Voix narrative avec prénom du héros injecté dynamiquement
- Si voix détectée → aventure se fige (règle implicite anti-bavardage)
- Ambiance minimaliste pendant le brossage actif (pas de son narratif en compétition)

## Univers & Progression

- 2-3 univers toujours disponibles, choix de l'enfant au démarrage
- Changement d'univers possible en pause (progression sauvegardée par univers)
- Déblocage de nouveaux mondes après completion
- Célébration à la fin de chaque univers (scène finale + animation déblocage)
- Prénom du héros saisi par le parent à l'onboarding

## Compte famille

- Compte parent (email + MDP) + profils enfants sans mot de passe
- Multi-enfants sur un même compte
- Tableau de bord partagé : vue ludique (enfant) + vue sobre (parent)
- Offline-first : fonctionne sans réseau, sync silencieuse au retour

## Fichier de session brainstorming

`_bmad-output/brainstorming/brainstorming-session-2026-03-23-1400.md`
Phase 1 (What If Scenarios) complète — 25 idées.
Phase 2 (Mind Mapping) à réaliser.
