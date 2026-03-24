---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: complete
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-23-1400.md"
date: 2026-03-23
lastRevised: 2026-03-24
author: Romain
---

# Product Brief: BrossQuest

## Executive Summary

BrossQuest est une Progressive Web App conçue pour les enfants de 4 à 10 ans,
accessible à un cercle restreint et gratuite. Elle transforme les 2 minutes de
brossage quotidien en une aventure narrative séquentielle — l'enfant choisit son
univers du jour (forêt, océan, espace…), puis son geste de brossage fait
littéralement avancer l'histoire.

L'application résout un problème précis : les enfants brossent en automatique,
sans couvrir toutes les zones. BrossQuest détecte le mouvement réel de brossage
via la caméra frontale (MediaPipe Hands) et structure les 2 minutes en une
séquence en trois temps — mise en scène narrative, brossage actif guidé
visuellement, micro-célébration — sans instruction froide, sans texte, sans
compétition entre l'écran et les dents.

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

BrossQuest articule quatre mécanismes complémentaires :

**1. Détection du vrai geste**
BrossQuest utilise la caméra frontale (MediaPipe Hands, traitement 100%
on-device) pour détecter le mouvement oscillatoire de la main dans la zone
bouche. C'est la seule approche qui valide un brossage réel — pas juste
une brosse allumée. Le téléphone posé sur le rebord du lavabo, face à
l'enfant, est déjà dans la position naturelle : aucune contrainte de
positionnement.

**2. Séquence temporelle en trois états**
L'expérience est découpée en trois temps distincts :
- **Avant (10-15s)** — narration vocale courte avec le prénom de l'enfant,
  mise en scène de l'épisode, flux caméra visible quelques secondes pour
  une calibration naturelle ("tu te vois ?"), puis fondu vers l'animation.
- **Pendant (2 min)** — visuel seul, aucune narration, aucun son.
  Une animation abstraite évocatrice (une masse sombre qui pulse, des
  formes qui s'assemblent) se déplace lentement d'un quadrant à l'autre —
  guidant implicitement la brosse sans instruction explicite. L'enfant
  suit le mouvement, il ne lit pas une instruction.
- **Après (5-10s)** — micro-célébration visuelle et sonore, accroche
  narrative courte vers le prochain épisode.

**3. Double niveau de progression**
La **Collection** est le niveau méta : l'enfant choisit librement son
univers du jour parmi ceux disponibles. Chaque univers reprend exactement
là où il a été laissé. Ce choix quotidien est un acte d'agentivité qui
précède et motive le brossage. La **Série** est le niveau narratif :
chaque univers avance par épisodes quotidiens de 2 minutes, créant
l'attachement et le désir de revenir le lendemain.

**4. Onboarding avec passage de main**
L'onboarding est une session unique en deux moments. Moment parent :
sign-in social (Google/Apple), saisie du prénom. Moment enfant : l'écran
bascule en mode pictographique, l'enfant choisit son emoji parmi une
sélection — son premier geste dans l'app, avant même le premier brossage.
Ce "passage de main" est un rituel d'entrée : l'enfant ne reçoit pas
un compte configuré, il prend possession de son univers.

### Key Differentiators

- **Détection du vrai geste** : MediaPipe Hands valide le mouvement réel de
  la main, pas juste la présence d'une brosse allumée — le seul signal honnête
- **Séquence sacrée** : Avant / Pendant / Après — trois états distincts qui
  éliminent tout conflit cognitif entre l'aventure et le brossage
- **Le brossage est le moteur** : l'histoire ne progresse que si l'enfant brosse
- **Animation abstraite guidante** : les quadrants dentaires sont encodés dans
  le comportement visuel, sans carte ni instruction froide
- **Double progression** : Collection (agentivité quotidienne) + Série
  (attachement narratif par épisodes) — deux leviers de motivation distincts
- **Passage de main** : l'enfant prend possession de l'app dès l'onboarding,
  avant même le premier brossage
- **Philosophie bienveillante** : zéro pénalité, zéro notification, zéro pression
- **PWA offline-first** : sans App Store, fonctionne sans réseau
- **Focus absolu** : BrossQuest résout un seul problème, en profondeur

### V1 → V2 Roadmap

V1 — Cercle restreint. Détection visuelle (MediaPipe Hands). Séquence
Avant/Pendant/Après. Collection + Série. Onboarding avec passage de main.
Accompagnement parental au lancement.

V2 — Mode Audio (brosses manuelles) : détection sonore via Web Audio API,
avec ses propres défis techniques à résoudre proprement. Autonomie progressive
de l'enfant. Guidage par zones progressivement implicite au fil des univers
débloqués.

*Note : la frontière précise V1/V2 sera arbitrée dans le PRD — le product
brief fixe la vision complète, pas le scope de livraison.*

### Constraints & Key Risks

**Fiabilité de la détection visuelle**
MediaPipe Hands doit être validé en conditions réelles : éclairage salle de
bain (souvent faible ou contre-jour), distance 40-70cm, enfant en mouvement,
brosse dans la bouche. Ce spike technique conditionne l'ensemble du produit —
c'est la dépendance critique à lever avant tout développement fonctionnel.

**Performance on-device**
Le traitement MediaPipe est 100% local (aucune donnée transmise). La charge
CPU sur des appareils mid-range doit rester compatible avec une expérience
fluide pendant 2 minutes. À valider dans le spike.

**Densité de contenu narratif**
L'engagement repose sur la nouveauté. Le volume d'épisodes produits doit tenir
3 à 6 mois d'usage quotidien sans répétition perceptible (deux sessions/jour
maximum). Les épisodes flashback (#35) réduisent la pression de production,
mais ne l'éliminent pas.

**Honnêteté de la promesse produit**
BrossQuest améliore l'attention et la conscience des zones. Elle ne peut pas
certifier la couverture réelle sans capteur physique de position. La promesse
est : une meilleure habitude, pas un brossage médicalement certifié.

**Friction de démarrage**
Le contexte d'usage (soir, parent fatigué, enfant pressé) impose une friction
minimale. Contrainte UX : moins de 10 secondes entre "sortir le téléphone"
et "brossage actif dans l'app". La détection de présence par caméra et
l'auto-démarrage sont des leviers techniques directs sur cette contrainte.

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
Onboarding en une session, deux moments. Moment parent : sign-in social
(Google ou Apple, zéro création de compte), saisie du prénom de l'enfant —
rapide, textuel, sobre. Moment enfant : l'écran bascule en mode pictographique,
l'enfant choisit son emoji parmi une sélection. C'est son premier geste dans
l'app, avant même le premier brossage — le "passage de main". Durée cible :
moins de 3 minutes. L'emoji est modifiable à tout moment, ce qui permet au
parent de tester seul puis de finaliser avec l'enfant.

**Usage quotidien**
Soir ou matin : le parent ouvre l'app, tend le téléphone posé sur le rebord
du lavabo. L'app détecte la présence de l'enfant via la caméra et propose un
grand bouton animé pulsant — ou démarre automatiquement après 3 secondes.
L'enfant choisit son univers du jour (Collection), la narration vocale courte
démarre (Avant), puis il brosse pendant que l'animation abstraite guide
silencieusement ses quadrants (Pendant), avant la micro-célébration (Après).
Le parent peut rester ou partir.

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

### Prerequisite — Spike Technique Visuel

Avant tout développement fonctionnel, valider MediaPipe Hands en conditions
réelles : salle de bain, éclairage variable, distance 40-70cm, enfant en
mouvement, brosse dans la bouche. Ce prototype isolé conditionne l'ensemble
du produit — si la détection ne tient pas fiablement, les mécaniques core
s'effondrent. C'est la dépendance critique du projet.

### Core Features

**Moteur de détection**
- Détection visuelle via MediaPipe Hands (on-device, aucune donnée transmise)
- Détection de présence à l'approche → déclenchement du lancement
- Fondu de calibration : flux caméra visible 3-5s, puis estompage vers l'animation
- Progression narrative pilotée par le mouvement réel de brossage

**Séquence Avant / Pendant / Après**
- **Avant** : narration vocale courte avec prénom, mise en scène de l'épisode
- **Pendant** : visuel seul — animation abstraite évocatrice, mouvement de
  zone sur 4 quadrants (≈30s chacun), aucune narration, aucun son
- **Après** : micro-célébration discrète (session ordinaire) ou animation
  mémorable (fin d'univers)

**Collection + Série**
- Collection d'univers disponibles — l'enfant choisit librement son univers
  du jour à chaque session
- Chaque univers maintient sa propre progression narrative indépendante
  (épisodes séquentiels), reprenant exactement là où elle a été laissée
- Épisodes flashback possibles (souvenir d'un moment clé) — réduit la
  pression de production de nouveau contenu

**Onboarding avec passage de main**
- Sign-in social (Google ou Apple) — zéro création de compte
- Saisie du prénom de l'enfant par le parent (injection dans la narration)
- Passage de main : l'enfant choisit son emoji — premier geste dans l'app
- Emoji modifiable à tout moment depuis le profil

**Adaptation matin / soir**
- Détection automatique de la période basée sur l'heure de lancement
- Seuil configurable par le parent (défaut : 17h)
- Ton narratif adapté : énergisant le matin, apaisant le soir

**Infrastructure PWA**
- Progressive Web App installable sur écran d'accueil
- Fonctionnement offline via Service Worker + IndexedDB
- Sync cloud de la progression (multi-appareils)
- Temps de démarrage ≤ 10 secondes depuis l'écran d'accueil

### Out of Scope (philosophique)

Ces éléments sont exclus par principe, indépendamment du scope de livraison :

- **Notifications ou rappels** : aucune sollicitation sortante, jamais
- **Reporting comportemental au parent** : la progression appartient à l'enfant
- **Gamification punitive** : aucun streak cassé, aucune pénalité, aucune pression
- **Mode audio V1** : la détection sonore (brosses manuelles) est une phase
  distincte avec ses propres défis — elle sera adressée proprement en V2

### MVP Success Criteria

L'app est prête à valider son MVP quand :
- Le spike visuel (MediaPipe Hands) fonctionne fiablement en conditions réelles
- L'enfant demande l'app de lui-même après 2 semaines d'usage
- Un parent du cercle proche est autonome après une démonstration
- Flux de démarrage ≤ 10 secondes

### Future Vision

**Horizon suivant**
- Mode Audio (brosses manuelles) : détection sonore via Web Audio API,
  trois états brossage / voix / silence
- Autonomie de lancement pour l'enfant
- Guidage par zones progressivement implicite au fil des univers
- Multi-profils enfants par compte parent

**Horizon long terme**
- Élargissement vers les 4-5 ans avec mécaniques adaptées
- Partage de progression entre enfants du cercle (fierté, pas compétition)

---
