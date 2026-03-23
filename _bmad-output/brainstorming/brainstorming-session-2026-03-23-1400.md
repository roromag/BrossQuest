---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Application mobile d''aide au brossage de dents pour enfants avec minuterie'
session_goals: 'Trouver le meilleur design UX/UI, simple et accessible aux jeunes enfants'
selected_approach: 'progressive-flow'
techniques_used: ['What If Scenarios', 'Mind Mapping', 'SCAMPER Method', 'Solution Matrix']
ideas_generated: 25
phase1_complete: true
context_file: ''
---

# Brainstorming Session Results

**Facilitateur :** Romain
**Date :** 2026-03-23

## Aperçu de la session

**Sujet :** BrossQuest — Application mobile d'aide au brossage de dents pour enfants — avec minuterie intégrée
**Objectifs :** Trouver le meilleur design UX/UI, simple et accessible aux jeunes enfants (ergonomie, engagement, accessibilité)

### Configuration de la session

_Session démarrée avec l'approche Progressive Technique Flow : exploration large puis convergence vers des solutions actionnables._

## Sélection des techniques

**Approche :** Progressive Technique Flow
**Conception du voyage :** Développement systématique de l'exploration à l'action

**Techniques progressives :**

- **Phase 1 – Exploration :** What If Scenarios — pour maximiser la génération d'idées sans contraintes
- **Phase 2 – Reconnaissance de patterns :** Mind Mapping — pour organiser et relier les idées par thèmes
- **Phase 3 – Développement :** SCAMPER Method — pour raffiner les concepts les plus prometteurs
- **Phase 4 – Planification :** Solution Matrix — pour trouver les combinaisons optimales de design

**Justification du voyage :** Le sujet implique un public cible très spécifique (enfants), une interaction quotidienne répétitive (2x/jour), et un objectif clair (timer de 2 minutes). La progression large→convergente est idéale pour ne pas manquer des angles inattendus (gamification, émotions, accessibilité) avant de raffiner.

---

## Phase 1 — Exploration Expansive (What If Scenarios)

**25 idées générées — session terminée**

### Contraintes validées

**[Contrainte #1] : Le Paradoxe Sonore**
_Concept :_ Si l'aventure est audio, l'enfant peut freiner le brossage pour mieux entendre. L'app ne doit pas créer ce conflit.
_Principe clé :_ Le canal sensoriel principal de l'aventure ≠ le canal perturbé par le brossage.

**[Contrainte #2] : Brosse Électrique Compatible**
_Concept :_ On ne peut pas utiliser l'intensité du son, mais on peut détecter la présence du son. Détection binaire ON/OFF, pas d'intensité.

**[Contrainte #3] : Web Browser Mobile (PWA)**
_Concept :_ getUserMedia() micro = bien supporté. Caméra = trop complexe, batterie, friction. Architecture PWA retenue.

**[Contrainte #4] : Anti-Bavardage**
_Concept :_ Le micro distingue son de brossage de la voix. Si voix détectée → aventure se fige. Règle implicite que l'enfant découvre naturellement.

**[Contrainte #5] : Zéro Texte Requis côté enfant**
_Concept :_ L'app doit être utilisable par un enfant qui ne sait pas lire. Parcours enfant = 100% icônes, couleurs, animations, son.

**[Contrainte #6] : Anti-Farming**
_Concept :_ Deux demi-journées max par jour. Pas de session infinie pour progresser plus vite.

---

### Idées — Mécanique d'Input

**[Gameplay #1] : Le Brossage-Moteur**
_Concept :_ L'histoire ne progresse que si l'enfant brosse. S'il s'arrête, le personnage s'immobilise. Le mouvement de la brosse fait avancer le héros.
_Nouveauté :_ Le timer devient invisible — la causalité brosse→aventure crée l'engagement, pas le décompte.

**[Son #2] : L'Alchimie Sonore**
_Concept :_ Le micro capte le bruit de la brosse et le transforme en temps réel en son d'aventure (galop, fusée, vagues). L'enfant entend son brossage se transformer en magie.
_Nouveauté :_ L'enfant devient l'instrument. Pas de compétition entre l'app et le brossage — ils sont la même chose.

**[Visuel #3] : L'Écran Magique**
_Concept :_ Progression 100% visuelle — une planète qui se rapproche, une fleur qui éclot, un château qui se construit. Chaque seconde de brossage = un élément visuel qui apparaît.
_Nouveauté :_ Zéro compétition sonore, engagement par la curiosité visuelle.

**[Haptique #4] : La Pulsation**
_Concept :_ Feedback haptique rythmique comme signal d'aventure secondaire. Discret, non-intrusif, perceptible dans la main.
_Nouveauté :_ Canal sensoriel distinct — aucun conflit possible avec le son du brossage.

**[Input #5] : Le Seuil Magique**
_Concept :_ Détection binaire présence/absence de son via micro web. Compatible brosse manuelle ET électrique. Trois états : brossage → aventure avance / voix → pause "chut" / silence → attente patiente.
_Nouveauté :_ Simple à implémenter, universel, la pause narrative est naturelle et non-punitive.

**[Input #6] : Le Pouce Magique** _(écarté)_
_Concept :_ Contact tactile continu comme signal de brossage. Écarté car risque de déconcentration de l'enfant.

**[Input #7] : Le Détecteur Intelligent**
_Concept :_ Analyse fréquentielle via Web Audio API : fréquences de friction (brossage) vs fréquences vocales (85-255 Hz). Trois états bien distincts techniquement.
_Nouveauté :_ La contrainte éducative "ne pas parler en se brossant" est encodée dans la mécanique, pas dans une règle affichée.

---

### Idées — Narration & Univers

**[Progression #8] : La Série**
_Concept :_ Aventure découpée en épisodes quotidiens de 2 minutes. Chaque brossage = un épisode. Le streak crée une habitude par curiosité narrative.
_Nouveauté :_ La motivation est intrinsèque ("qu'est-ce qui arrive ce soir ?"), pas basée sur des points abstraits.

**[Contextuel #9] : Matin/Soir**
_Concept :_ Deux tons narratifs selon l'heure de lancement. Matin : énergisant, mission qui part. Soir : apaisant, héros qui rentre. Même univers, ambiance différente.
_Nouveauté :_ Accompagne le rythme circadien — pas stimulant avant le coucher.

**[Déblocage #10] : Les Mondes**
_Concept :_ Progression méta sur plusieurs semaines via déblocage d'univers visuels. Forêt → Océan → Espace → etc. Stocké en localStorage/IndexedDB.
_Nouveauté :_ La collection d'univers devient une conversation, une fierté partageable.

**[Architecture #11] : Deux Couches Indépendantes**
_Concept :_ Progression narrative (épisodes) et ton ambiant (matin/soir) sont deux systèmes séparés qui se combinent. Rater un matin ne crée aucune incohérence narrative.
_Nouveauté :_ L'app s'adapte à la réalité de l'enfant, pas l'inverse.

**[Bienveillance #12] : L'Aventure Patiente**
_Concept :_ Aucun streak cassé, aucune pénalité. L'histoire attend là où elle a été laissée. "Ton aventure t'attend."
_Nouveauté :_ À contre-courant de la gamification punitive. Conçu pour durer des années sans anxiété.

**[Célébration #13] : La Fin de Monde**
_Concept :_ Scène finale légèrement plus longue à la conclusion d'un univers + animation de déblocage du suivant. Image souvenir simple (screenshot naturel).
_Nouveauté :_ Récompense narrative et mémorable, pas abstraite.

**[UX #25] : Changement d'Univers en Cours**
_Concept :_ L'enfant peut mettre en pause et switcher d'univers. La progression narrative de chaque univers est sauvegardée indépendamment.
_Nouveauté :_ Sentiment de liberté et de collection vivante, pas un déblocage linéaire forcé.

---

### Idées — Personnalisation & Onboarding

**[Onboarding #14] : Mon Héros**
_Concept :_ Au premier lancement, le parent saisit le prénom du héros. L'app l'utilise dans la narration vocale. "[Prénom] entre dans la forêt..."
_Nouveauté :_ Personnalisation minimale mais puissante. Lien émotionnel immédiat.

**[Audio #16] : La Voix de l'Aventure**
_Concept :_ Text-to-speech ou voix pré-enregistrées pour narrer les épisodes avec injection dynamique du prénom. Narration jouée avant le brossage actif, ambiance minimaliste pendant.
_Nouveauté :_ Résout l'accessibilité non-lecteurs ET renforce l'immersion.

**[UI #17] : L'Interface Pictographique**
_Concept :_ Toute l'interface enfant = images, couleurs, animations. Le bouton "lancer" est une grande animation pulsante. Zéro texte requis côté enfant.
_Nouveauté :_ Design contraint à l'essentiel — ce qui est bon pour les 3 ans est excellent pour les 8 ans.

---

### Idées — Système & Compte

**[Onboarding #15] : Le Rôle du Parent**
_Concept :_ Deux modes distincts. Mode Parent : configuration (une seule fois), texte autorisé. Mode Enfant : usage quotidien, 100% pictographique, zéro friction.
_Nouveauté :_ La séparation parent/enfant est une décision d'architecture qui structure tout le reste.

**[Compte #20] : Le Modèle Famille**
_Concept :_ Compte parent (email + MDP) avec un ou plusieurs profils enfants. L'enfant choisit son profil sur l'écran d'accueil (icône + prénom) sans mot de passe.
_Nouveauté :_ Gestion multi-enfants, progression synchronisée cloud, accessible depuis n'importe quel appareil.

**[Parent #21] : Vue Partagée**
_Concept :_ Tableau de bord accessible depuis les deux modes. Vue enfant : ludique, étoiles, galerie des univers complétés, trophées. Vue parent : sobre, données de configuration accessibles.
_Nouveauté :_ L'enfant est fier de sa progression — il peut revivre son parcours.

**[Système #19] : Les Deux Demi-Journées**
_Concept :_ Deux périodes simples — Matin (0h-16h59) et Soir (17h-23h59). Une session max par période, sans créneau strict. Brossage à 14h = session matin, pas de punition.
_Nouveauté :_ Souplesse maximale, aucune pression temporelle, ambiance matin/soir cohérente automatiquement.

**[Philosophie #24] : Récompense Pure**
_Concept :_ L'app ne notifie jamais, ne relance jamais, ne culpabilise jamais. Elle est là quand l'enfant arrive, elle récompense quand il brosse.
_Nouveauté :_ Pression zéro, fierté maximale. Philosophie de conception fondamentale.

**[Technique #23] : PWA + IndexedDB + Background Sync**
_Concept :_ Progressive Web App installable sur écran d'accueil. Service Worker pour cache offline. IndexedDB pour stockage local robuste. Background Sync pour synchronisation automatique au retour du réseau.
_Nouveauté :_ 100% web, pas d'App Store, expérience offline identique au natif. Résout les vacances sans réseau.

---

### Stack technique émergente

```
PWA (web, installable sur écran d'accueil)
├── Frontend : interface enfant (pictographique) + interface parent
├── Audio : Web Audio API — détection son/voix par analyse fréquentielle
├── Stockage local : IndexedDB + Service Worker (offline first)
├── Backend : comptes parents, profils enfants, sync progression
└── Offline : Service Worker + Background Sync API
```

---

### Principes de design validés

1. **Le brossage est le moteur** — pas un timer à surveiller
2. **Trois états audio** — brossage / voix / silence, chacun a une réponse narrative
3. **Deux couches indépendantes** — progression narrative + ton matin/soir
4. **Bienveillance totale** — aucune punition, aucune notification, aucune pression
5. **Zéro texte côté enfant** — 100% pictographique
6. **Architecture famille** — compte parent, profils enfants, multi-appareils
7. **PWA offline-first** — fonctionne sans réseau, sync silencieuse

---

## Phase 2 — Reconnaissance de Patterns (Mind Mapping)

_À réaliser dans un nouveau contexte — fichier de session à charger : `brainstorming-session-2026-03-23-1400.md`_
