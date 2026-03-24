---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-23-1400.md"
date: 2026-03-23
author: Romain
---

# Product Brief: BrossQuest

## Executive Summary

BrossQuest est une Progressive Web App conçue pour les enfants de 4 à 10 ans,
accessible à un cercle restreint et gratuite. Elle transforme les 2 minutes de
brossage quotidien en une mission de nettoyage narrative, où chaque zone de la
bouche correspond à une zone à "réparer" dans l'histoire — les dents d'un dragon
malade, la mousse d'un château assiégé, les rochers d'une grotte à débloquer.

L'application résout un problème précis : les enfants brossent en automatique,
sans couvrir toutes les zones. BrossQuest structure les 2 minutes en segments
temporels par zone, avec des micro-événements narratifs qui ramènent
régulièrement l'attention de l'enfant sur le geste physique — sans instruction
froide, sans texte, sans compétition entre l'écran et les dents.

---

## Core Vision

### Problem Statement

Les enfants acceptent de se brosser les dents, mais brossent en automatique :
leur attention n'est pas sur les zones. Les applications existantes aggravent
le problème en captant l'attention vers l'écran. Résultat : 2 minutes passées,
mais qualité insuffisante.

### Problem Impact

- Zones mal couvertes malgré une routine apparente
- Les parents ne peuvent pas vérifier la qualité en temps réel
- L'enfant développe une habitude mécanique sans conscience des zones

### Why Existing Solutions Fall Short

Les applications existantes misent sur la gamification à l'écran : animations,
scores, récompenses visuelles. L'enfant fixe l'écran, pas ses dents. Le timer
est respecté, pas la qualité du geste.

### Proposed Solution

BrossQuest combine trois mécanismes complémentaires :

**1. Métaphore narrative comme système de guidage**
Chaque zone de la bouche correspond à une zone à nettoyer dans l'histoire.
L'enfant ne reçoit pas d'instruction — il accomplit une mission dont la logique
*est* le bon geste. La détection sonore (Web Audio API) valide la présence du
brossage ; les zones se débloquent après un temps minimum de brossage actif.

**2. Micro-événements d'engagement**
À intervalles réguliers dans chaque zone, des événements narratifs courts
(un coffre qui s'ouvre, une animation d'intensité, un son signal distinct)
ramènent l'attention de l'enfant vers l'écran — et donc vers la conscience
de sa progression. Ces rappels sont fictifs dans le récit mais réels dans
leur effet : ils brisent le pilote automatique sans punir ni interrompre.

**3. Feedback de complétion par zone**
À chaque zone complétée, une micro-animation de déblocage confirme le passage
à la suivante. L'enfant acquiert progressivement le sens du découpage spatial
de sa bouche par l'habitude narrative, pas par l'instruction.

### Key Differentiators

- **Métaphore narrative comme guidage** : les zones de l'histoire = les zones
  de la bouche, sans instruction froide
- **Micro-événements d'engagement** : rappels d'attention déguisés en moments
  narratifs — brisent le pilote automatique sans punir
- **Le brossage est le moteur** : l'histoire ne progresse que si l'enfant brosse
- **Attention redirigée vers le geste** : l'écran est support narratif discret,
  pas aimant à attention
- **Philosophie bienveillante** : zéro pénalité, zéro notification, zéro pression
- **PWA offline-first** : sans App Store, fonctionne sans réseau
- **Accès restreint, gratuit** : conçu pour un cercle familial proche

### V1 → V2 Roadmap

V1 — Cercle restreint, accompagnement parental au lancement, guidage explicite
par zones avec métaphore narrative directe et micro-événements d'engagement.

V2 — Autonomie progressive de l'enfant, guidage implicite au fil des mondes
débloqués (l'enfant a intégré les automatismes), lancement indépendant.

Les deux axes — autonomie et implicite — évoluent ensemble, l'app grandissant
avec l'enfant.

### Constraints & Key Risks

**Densité de contenu narratif**
L'engagement repose sur la nouveauté narrative. La V1 doit prévoir un volume
de contenu suffisant pour tenir 3 à 6 mois d'usage quotidien sans répétition
perceptible. C'est une contrainte de production à adresser avant le lancement.

**Fiabilité de la détection sonore**
La détection via Web Audio API doit être validée en conditions réelles : salle
de bain, robinet ouvert, brosse électrique, environnement bruité. Des tests en
conditions réelles sont une condition de lancement V1, pas une itération
post-lancement.

**Honnêteté de la promesse produit**
BrossQuest améliore l'attention et la conscience des zones de brossage. Elle
ne peut pas garantir la couverture réelle sans capteur physique de position.
La promesse produit doit refléter cette limite : une meilleure habitude, pas
un brossage médicalement certifié.

**Friction de démarrage**
Le contexte d'usage (soir, parent fatigué, enfant pressé) impose une friction
minimale. Contrainte UX : le temps entre "sortir le téléphone" et "brossage
actif dans l'app" ne doit pas dépasser 10 secondes. Cette contrainte est un
KPI de conception, pas une évidence technique.

---

## Target Users

### Primary Users

#### L'Enfant Aventurier — 6 à 10 ans

**Profil type : Lucas, 6 ans**
Lucas aime les histoires de héros, les dragons, les quêtes. Il sait ce qu'est
une app, il utilise une tablette, mais il ne lit pas encore couramment. Le
brossage des dents n'est pas un combat — il accepte — mais il brosse vite et
en automatique, impatient de passer à autre chose.

**Expérience actuelle du problème**
Lucas brosse 2 minutes parce qu'on lui dit de brosse 2 minutes. Il ne sait pas
pourquoi les zones importent. Son attention est ailleurs — il pense à ce qu'il
faisait avant, ou regarde le mur. Le brossage est un geste mécanique, pas une
action consciente.

**Ce que le succès lui ressemble**
Lucas *demande* à lancer BrossQuest avant que son parent le rappelle. Il parle
de "son dragon" à table. Il a conscience de brosse "la zone du château" et fait
le lien naturellement avec sa bouche. La routine n'est plus subie, elle est
attendue.

---

### Secondary Users

#### Le Parent Gestionnaire — 30 à 45 ans

**Profil type : Parent du soir ou du matin, pas nécessairement tech-friendly**
Ce parent gère la routine brossage comme une étape parmi d'autres dans une
soirée ou un matin chargé. Il n'est pas toujours présent pendant toute la durée
— il pose le téléphone, vaque à autre chose, revient. Il n'a pas besoin de
comprendre comment fonctionne l'app ; il a besoin que ça marche sans friction.

**Expérience actuelle du problème**
Il sait que son enfant ne brosse pas bien, mais il n'a ni le temps ni l'énergie
de superviser chaque geste chaque soir. Les apps existantes lui ont semblé
prometteuses mais son enfant regardait l'écran, pas ses dents.

**Ce que le succès lui ressemble**
Le parent lance l'app en moins de 10 secondes, pose le téléphone et repart.
Son enfant brosse seul, correctement, sans qu'il ait à surveiller. La routine
se déroule sans négociation.

**Profils inclus dans ce segment :**
- Parent principal (créateur du compte, configure les profils)
- Second parent (utilise l'app telle quelle, sans reconfiguration)
- Parent du cercle proche (cousin, ami) — non tech-friendly, doit pouvoir
  utiliser l'app sans aide après une première démonstration

---

### User Journey

**Découverte**
Le parent entend parler de BrossQuest par Romain (partage direct, lien PWA).
Pas d'App Store, pas de recherche — accès sur invitation uniquement.

**Onboarding**
Le parent crée un compte (email + mot de passe), crée le profil de l'enfant
(prénom + icône). Durée cible : moins de 3 minutes. L'enfant n'intervient pas
dans l'onboarding — c'est un espace parent.

**Usage quotidien**
Soir ou matin : le parent ouvre l'app, sélectionne le profil de l'enfant,
tend le téléphone. L'enfant lance la session en appuyant sur une grande
animation pulsante. Le parent peut rester ou partir. L'app tourne 2 minutes,
l'enfant brosse.

**Moment "aha"**
Pour l'enfant : la première fois qu'il voit une zone narrative se débloquer
grâce à son brossage — le dragon guérit, le château se reconstruit — et qu'il
comprend instinctivement le lien.
Pour le parent : la première fois que son enfant dit "attends, j'ai pas encore
lancé mon aventure" avant de se brosser.

**Adoption long terme**
Les nouveaux mondes débloqués entretiennent la curiosité narrative sur 3 à 6
mois. L'enfant développe progressivement une conscience des zones. En V2,
l'autonomie de lancement réduit encore la dépendance parentale.

---

## Success Metrics

BrossQuest est un projet personnel, gratuit, sans objectif commercial.
Les métriques de succès sont comportementales et qualitatives, alignées
sur la valeur réelle créée pour l'enfant et la famille.

### Indicateur primaire — Engagement de l'enfant

**Signal clé : l'enfant demande l'app lui-même.**
Le succès se mesure au renversement de l'initiative : le parent n'a plus
à proposer BrossQuest, l'enfant le réclame avant le brossage. C'est
l'indicateur le plus fort que l'engagement est intrinsèque.

- **Succès partiel** : l'enfant accepte sans résistance quand le parent propose
- **Succès** : l'enfant demande l'app de lui-même la majorité des soirs
- **Grand succès** : l'enfant ne rate pas une séance volontairement

### Indicateurs secondaires — Rétention et progression

- **Régularité** : nombre de sessions complétées sur 7 jours consécutifs
- **Progression narrative** : avancement dans les mondes débloqués
  (proxy indirect de la constance du brossage sur plusieurs semaines)
- **Durée de vie active** : combien de semaines avant la première session
  manquée — pas une cible fixe, mais un signal d'alerte si la courbe
  chute brutalement

### Indicateur qualitatif — Transfert des automatismes

Non mesurable directement, mais observable par le parent dans des
contextes hors-app (voyage, grand-parents) : est-ce que l'enfant brosse
spontanément plus longtemps ou fait référence aux zones ?
Ce transfert est l'objectif long terme, pas une métrique de lancement.

### Métriques cercle proche

- **Adoption sans friction** : un parent du cercle peut utiliser l'app
  après une seule démonstration, sans aide technique supplémentaire
- **Rétention à 4 semaines** : l'app est encore utilisée 1 mois après
  la première installation dans un foyer du cercle

### Business Objectives

N/A — projet personnel, sans objectif de revenus ou de croissance.
L'objectif stratégique est simple : créer une app qui fonctionne
vraiment pour au moins un enfant, durablement.

---

## MVP Scope

### Prerequisite — Spike Technique

Avant tout développement, valider la détection sonore en conditions réelles :
salle de bain, robinet ouvert, brosse manuelle et électrique. Ce prototype
isolé conditionne l'ensemble du MVP — si la détection ne tient pas, les
mécaniques core s'effondrent. C'est la dépendance critique du projet.

### Core Features

**Moteur de brossage**
- Détection sonore via Web Audio API : trois états (brossage / voix / silence)
- Progression narrative pilotée par le brossage actif
- Zones débloquées après un temps minimum de brossage par segment

**Univers narratif unique**
- Un univers complet avec guidage par zones intégré à la narration
- Métaphore de nettoyage cohérente sur l'ensemble de l'univers
- Micro-événements d'engagement à intervalles réguliers dans chaque zone
- Feedback visuel de complétion par zone
- Micro-célébration de fin de session (animation simple)

**Onboarding parent**
- Saisie du prénom de l'enfant (injection dans la narration)
- Choix d'une icône de profil
- Un seul profil enfant par installation

**Infrastructure PWA**
- Progressive Web App installable sur écran d'accueil
- Fonctionnement offline via Service Worker
- Stockage local via localStorage (pas de backend ni de compte cloud en V1)
- Temps de démarrage ≤ 10 secondes depuis l'écran d'accueil

### Quick Follow-on (post-validation spike)

**Adaptation matin / soir**
- Détection automatique de la période (matin : 0h–16h59 / soir : 17h–23h59)
- Ton narratif adapté : énergisant le matin, apaisant le soir
- Ajoutée rapidement après validation du spike technique — pas un
  prérequis pour tester les mécaniques core, mais non-négociable avant
  usage familial régulier

### Out of Scope for MVP

- **Profils multiples** : un seul enfant par installation en V1
- **Univers multiples** : un seul univers pour valider les mécaniques core
- **Compte parent avec sync cloud** : localStorage uniquement
- **Guidage implicite** : guidage par zones explicite en V1
- **Autonomie de lancement enfant** : lancement initié par le parent en V1
- **Notifications ou rappels** : aucune sollicitation sortante

### MVP Success Criteria

L'app est prête à sortir du MVP quand :
- L'enfant demande l'app de lui-même après 2 semaines d'usage
- La détection sonore fonctionne de façon fiable en conditions réelles
- Un parent du cercle proche est autonome après une démonstration
- Flux de démarrage ≤ 10 secondes

### Future Vision

**V2 — L'app grandit avec l'enfant**
- Multi-profils enfants par compte parent
- Univers multiples débloquables (forêt → océan → espace…)
- Compte parent avec sync cloud et accès multi-appareils
- Guidage par zones progressivement implicite au fil des mondes
- Autonomie de lancement pour l'enfant
- Pont visuel zone narrative → zone réelle affiné selon retours V1

**Horizon long terme**
- Élargissement vers les 4-5 ans avec mécaniques adaptées
- Partage de progression entre enfants du cercle (fierté, pas compétition)

---
