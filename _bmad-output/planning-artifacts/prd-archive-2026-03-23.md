---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
classification:
  projectType: web_app
  domain: edtech
  complexity: medium
  projectContext: greenfield
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-bmad-2026-03-23.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-23-1400.md"
workflowType: 'prd'
briefCount: 1
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
---

# Product Requirements Document - BrossQuest

**Auteur :** Romain
**Date :** 2026-03-23
**Type :** PWA · greenfield · edtech comportemental

## Executive Summary

BrossQuest est une Progressive Web App conçue pour les enfants de 4 à 10 ans, distribuée en cercle restreint et gratuite. Elle résout un problème précis et personnel : un enfant avec des difficultés d'attention ne peut pas maintenir sa concentration 2 minutes sur ses dents sans qu'un adulte soit présent en boucle constante. BrossQuest remplace ce rôle parental — non pas par de la gamification, mais par des micro-événements narratifs calibrés pour ramener l'attention de l'enfant vers le geste physique, à intervalles réguliers, sans punir ni interrompre.

Chaque zone de la bouche correspond à une zone narrative à "nettoyer" dans l'histoire. Les zones se débloquent après un temps minimum de brossage actif détecté via Web Audio API. L'histoire ne progresse pas si l'enfant ne brosse pas — le brossage est le moteur, pas une récompense.

L'objectif de conception long terme est le transfert des automatismes : après plusieurs mois d'usage, l'enfant doit avoir intégré la carte spatiale de sa bouche à travers l'habitude narrative — sans l'app, dans n'importe quel contexte.

### Ce qui rend BrossQuest unique

Les applications existantes de brossage capturent l'attention *vers* l'écran. BrossQuest utilise l'écran comme support narratif discret qui oriente l'attention *vers les dents*. Cette inversion est le différenciateur core.

Les micro-événements d'engagement (coffre qui s'ouvre, animation d'intensité, son signal distinct) sont des rappels d'attention déguisés en moments narratifs. Conçus à l'origine pour un enfant avec des difficultés de concentration, ils ont une efficacité supérieure pour tous les profils — parce qu'ils résolvent la version la plus exigeante du problème.

Philosophie produit : zéro pénalité, zéro notification, zéro pression. L'app fonctionne offline, démarre en moins de 10 secondes, et disparaît après la session.

**Classification :** PWA greenfield · edtech comportemental (enfants) · complexité medium · distribution cercle restreint V1, ouverture publique possible si adoption confirmée

## Success Criteria

### Succès utilisateur

**Signal primaire — Renversement de l'initiative**
L'enfant demande l'app lui-même avant que le parent propose. Succès gradué :
- Partiel : l'enfant accepte sans résistance quand le parent propose
- Succès : l'enfant demande l'app la majorité des soirs/matins
- Grand succès : l'enfant ne rate pas une séance volontairement

**Signal secondaire — Régularité**
5 sessions complètes ou plus par semaine (matin et/ou soir confondus), maintenues sur au moins 4 semaines consécutives dans un foyer du cercle.

**Signal qualitatif — Transfert des automatismes**
Observable hors-app : l'enfant fait spontanément référence aux zones de brossage ("la zone du château", "les dents du dragon") dans des contextes hors-session. Non mesurable automatiquement — observable par le parent.

### Succès business

BrossQuest est un projet personnel sans objectif commercial. Le succès se définit par :
- **Adoption sans friction** : un parent du cercle peut utiliser l'app de manière autonome après une seule démonstration
- **Rétention à 4 semaines** : l'app est encore utilisée régulièrement 1 mois après la première installation dans un foyer
- **Ouverture possible** : si l'adoption et la rétention sont confirmées dans le cercle, une extension publique devient envisageable — conséquence, pas objectif

### Outcomes mesurables

| Outcome | Seuil | Horizon |
|---|---|---|
| Sessions par semaine par enfant | ≥ 5 | Semaines 2–6 |
| Demande spontanée de l'enfant | Majorité des soirs/matins | Semaine 3–4 |
| Autonomie parent cercle proche | Après 1 démonstration | Onboarding |
| Rétention foyer | Utilisation active à J+30 | 1 mois post-install |
| Flux de démarrage | ≤ 10 secondes | Avant lancement |

## Périmètre produit & Roadmap

### Stratégie MVP

**Approche :** Validation de concept — prouver que le mécanisme audio-narratif maintient l'attention d'un enfant pendant 2 minutes de brossage, durablement, sans adulte en boucle constante.

**Ressources :** Développeur solo (Romain). Toutes les décisions de scope s'évaluent à l'aune d'un effort solo soutenable.

**Prérequis bloquant — Spike technique**
Valider la détection sonore Web Audio API en conditions réelles (salle de bain, robinet, brosse électrique) avant tout développement. C'est un prototype isolé (fichier HTML standalone, quelques heures à quelques jours). Si la détection est insuffisante, le périmètre fonctionnel core est à revoir entièrement.

### MVP Core

**Parcours couverts :** P1 (session nominale), P2 (décrochage), P3 (onboarding parent), P4 (cercle proche)

| Feature | Justification MVP |
|---|---|
| Détection sonore Web Audio API (3 états) | Moteur core — condition sine qua non |
| Progression narrative par zone | Différenciateur principal |
| Micro-événements d'engagement | Résout le problème d'attention — raison d'être du produit |
| Feedback de complétion par zone | Boucle de rétroaction essentielle |
| Micro-célébration de fin de session | Signal de réussite pour l'enfant |
| Un univers narratif complet | Volume suffisant pour 3–6 mois sans répétition perceptible |
| Onboarding parent (prénom + icône) | Condition d'usage — sans profil, pas de session |
| Permission microphone dans onboarding | L'enfant ne doit pas voir ce message système |
| PWA installable, offline-first | Contrainte d'usage réel (salle de bain, offline) |
| Démarrage ≤ 10 secondes | KPI de conception non négociable |

### MVP Final (avant usage familial régulier)

- Adaptation matin / soir : détection automatique de la période, ton narratif adapté (énergisant le matin, apaisant le soir)

### Hors scope MVP

- Profils multiples enfants · Univers multiples · Compte parent / sync cloud
- Guidage implicite · Autonomie de lancement enfant · Notifications / rappels · Analytics / tracking

### Phase 2 — Croissance (post-MVP)

- Multi-profils enfants par installation
- Univers multiples débloquables (forêt → océan → espace…)
- Compte parent avec sync cloud et multi-appareils
- Guidage par zones progressivement implicite
- Autonomie de lancement pour l'enfant

### Phase 3 — Vision (horizon long terme)

- L'app grandit avec l'enfant : guidage implicite total, autonomie complète
- Élargissement vers les 4–5 ans
- Partage de progression entre enfants du cercle (fierté, pas compétition)
- Ouverture publique si l'adoption dans le cercle le justifie

### Risques produit

| Risque | Type | Mitigation |
|---|---|---|
| Détection audio non fiable | Technique | Spike isolé avant tout développement — bloquant |
| Volume narratif insuffisant (lassitude) | Contenu | 3–6 mois sans répétition — contrainte de production V1 |
| Scope creep solo | Ressource | Hors scope défini explicitement — aucune feature ajoutée sans décision consciente |
| Cache éviction iOS Safari | Technique | Budget assets à définir en architecture ; stratégie de précache à valider |

## Parcours utilisateurs

### Parcours 1 — Lucas, chemin nominal (session du soir)

*Lucas, 6 ans. Difficultés d'attention. Aime les dragons et les quêtes. Accepte de se brosser les dents, mais part dans sa tête au bout de 20 secondes.*

**Scène d'ouverture**
C'est 20h15. Lucas est en pyjama. Son père sort le téléphone, ouvre BrossQuest, sélectionne le profil "Lucas ⚔️". L'app s'ouvre sur une grande animation pulsante. Lucas appuie dessus. Le chrono démarre.

**Action montante**
La voix narrative annonce : "Le Dragon Molaire est malade. Ses écailles du côté gauche sont couvertes de vase noire. Il a besoin de toi." Lucas brosse le côté gauche. L'animation de la zone réagit — légèrement, subtilement. 30 secondes s'écoulent. Un son distinct retentit : un coffre s'ouvre dans la caverne. Lucas lève les yeux vers l'écran une fraction de seconde — puis reprend. La zone se débloque.

**Climax**
Quatrième zone. Lucas commence à brosser plus vite, mécaniquement. Un micro-événement : le dragon tousse, une animation d'intensité apparaît. Lucas ralentit instinctivement et porte son attention sur ses dents. La zone se débloque après le temps minimum.

**Résolution**
Deux minutes. Une micro-célébration : le dragon vole à nouveau. Lucas dit "il est guéri !" Le parent reprend le téléphone. Lucas se rince. Demain soir, il se souviendra du dragon.

*Capabilities révélées : moteur de détection sonore, progression par zone, micro-événements d'engagement, feedback de complétion, célébration de fin, gestion du temps par segment.*

---

### Parcours 2 — Lucas, cas limite (décrochage en session)

*Même Lucas. Ce soir il est fatigué, grognon. Il commence à brosser mais s'arrête après 40 secondes, brosse posée, regard dans le vague.*

**Scène d'ouverture**
La session est lancée. Lucas brosse normalement les 30 premières secondes. Puis il s'arrête. La détection sonore passe en état "silence". La progression s'arrête — la zone ne se débloque pas.

**Action montante**
L'app ne punit pas, ne bipe pas, n'affiche pas de message d'erreur. Elle attend. Après quelques secondes, un micro-événement narratif doux se déclenche — un son signal, une légère animation. Pas une injonction : une invitation.

**Climax**
Lucas reprend la brosse. La détection sonore repasse en état "brossage". La progression reprend exactement là où elle s'était arrêtée. La zone se débloque après cumul du temps minimum de brossage actif.

**Résolution**
La session dure 2 minutes 40 au lieu de 2 minutes. Lucas finit sans frustration. L'app ne lui a jamais dit qu'il avait mal fait.

*Capabilities révélées : états de détection (brossage / voix / silence), pause implicite sans pénalité, progression cumulative (pas réinitialisée), micro-événements de rappel non-intrusifs.*

---

### Parcours 3 — Parent principal, onboarding

*Sandrine, 38 ans. Mère de Lucas. A reçu un lien PWA de Romain. Sceptique sur les apps de brossage — la dernière que Lucas avait, il fixait l'écran et brossait n'importe comment.*

**Scène d'ouverture**
Sandrine reçoit un message de Romain avec un lien. Elle l'ouvre sur son téléphone. L'app se charge. Un écran simple lui propose "Créer le profil de ton aventurier".

**Action montante**
Elle saisit "Lucas", choisit une icône (épée ⚔️). L'app lui demande l'autorisation d'accéder au microphone — un écran parent explique pourquoi. Elle accepte. L'app lui montre à quoi ressemblera le lancement pour Lucas. Elle installe la PWA sur son écran d'accueil.

**Climax**
Ce soir, elle tend le téléphone à Lucas. Elle n'a pas eu à créer de compte email, pas de mot de passe, pas de synchronisation. 3 minutes au total depuis le lien reçu.

**Résolution**
Sandrine part faire la vaisselle. Lucas se brosse. Elle revient deux minutes plus tard. Demain, Lucas demandera l'app lui-même.

*Capabilities révélées : onboarding parent (prénom + icône), permission microphone dans flux parent, installation PWA guidée, pas de compte cloud, flux ≤ 3 minutes.*

---

### Parcours 4 — Parent du cercle proche, première utilisation

*Thierry, 42 ans. Cousin de Romain. A vu l'app chez lui un week-end. Sa fille Emma (7 ans) veut essayer. Romain lui fait une démonstration de 2 minutes.*

**Scène d'ouverture**
Romain ouvre l'app sur son propre téléphone, montre le lancement en 3 gestes : écran d'accueil → profil → grande animation pulsante. "C'est tout." Il envoie le lien PWA à Thierry par SMS.

**Action montante**
Thierry ouvre le lien sur son téléphone. Il crée le profil "Emma 🌟", autorise le microphone, installe la PWA. Ce soir, il lance l'app pour Emma comme Romain le lui a montré.

**Climax**
Emma brosse. Thierry ne comprend pas tous les détails narratifs, mais il voit Emma concentrée, qui regarde l'écran par intermittence et brosse. Il ne dit rien. Il n'a pas besoin.

**Résolution**
Thierry n'a posé aucune question technique à Romain. L'app a fonctionné du premier coup, sans aide. Critère d'adoption cercle proche : validé.

*Capabilities révélées : accès par lien direct, onboarding autonome, permission microphone, usage immédiat sans formation.*

---

### Synthèse des capabilities par parcours

| Capability | P1 | P2 | P3 | P4 |
|---|---|---|---|---|
| Détection sonore 3 états | ✓ | ✓ | | |
| Progression cumulative sans pénalité | | ✓ | | |
| Micro-événements d'engagement | ✓ | ✓ | | |
| Feedback de complétion par zone | ✓ | ✓ | | |
| Célébration de fin de session | ✓ | | | |
| Permission microphone (onboarding parent) | | | ✓ | ✓ |
| Onboarding parent (profil enfant) | | | ✓ | ✓ |
| Installation PWA guidée | | | ✓ | ✓ |
| Flux de démarrage ≤ 10 secondes | ✓ | ✓ | | |
| Accès par lien direct (sans App Store) | | | ✓ | ✓ |

## Exigences spécifiques au domaine

### Conformité & Réglementation

- **COPPA/RGPD mineurs** : non applicable en V1 — aucune donnée personnelle collectée ni transmise. Le prénom de l'enfant est stocké exclusivement en localStorage, jamais envoyé à un serveur.
- **Cookies & tracking** : aucun. Pas de consentement requis, pas de bannière.
- **Hébergement** : statique (GitHub Pages ou équivalent). Aucun traitement serveur, aucune base de données.

### Contraintes techniques

- **Permission microphone** : la Web Audio API nécessite une autorisation navigateur explicite. Cette demande doit être déclenchée pendant l'onboarding parent — pas au lancement de la session enfant. L'enfant ne doit jamais voir ce message système. Si la permission est refusée ou révoquée, l'app doit proposer un chemin de récupération dans le flux parent.
- **Offline-first** : Service Worker obligatoire. L'app doit fonctionner sans réseau après la première installation, y compris les assets audio et visuels du narratif.
- **Stockage local** : localStorage pour le profil enfant et la progression narrative. Perte de données si l'utilisateur vide le cache navigateur — risque accepté en V1.

### Intégrations requises

Aucune intégration externe en V1.

### Risques et mitigations

| Risque | Mitigation |
|---|---|
| Refus de permission microphone | Écran d'explication contextuel pendant l'onboarding parent ; flux de récupération si révocation ultérieure |
| Perte de progression (vidage cache) | Risque accepté en V1 |
| Web Audio API non supportée | Détection au démarrage + message d'erreur explicite |

## Innovation & Patterns Novateurs

### Axes d'innovation identifiés

**Progression narrative pilotée par l'audio**
BrossQuest est, à notre connaissance, la première app de brossage à utiliser la détection sonore (Web Audio API) comme moteur de progression narrative — et non comme simple validation booléenne. L'histoire ne progresse pas si l'enfant ne brosse pas activement. Ce couplage brossage ↔ narration crée une boucle de motivation intrinsèque absente des approches timer-based.

**Guidage implicite par métaphore spatiale**
Au lieu d'instructions ("brosse maintenant le côté gauche"), chaque zone de la bouche est encodée dans la géographie narrative de l'univers. L'enfant n'est jamais instruit — il accomplit une mission dont la logique spatiale *est* le bon geste. L'objectif de conception est que cette carte spatiale s'intègre progressivement, hors-app.

**Rappels d'attention déguisés en moments narratifs**
Les micro-événements d'engagement sont des mécanismes de re-focalisation attentionnelle déguisés en contenus narratifs. Conçus à l'origine pour un enfant avec des difficultés d'attention, ils constituent une approche qui résout le problème dans sa version la plus exigeante — et s'avère efficace pour tous les profils.

### Contexte marché

Les apps de brossage existantes (Disney Magic Timer, Brush DJ, Pokémon Smile) partagent le même modèle : gamification à l'écran, timer visuel, récompenses conditionnelles. Elles capturent l'attention *vers* l'écran. Aucune n'utilise la détection audio comme moteur narratif ni ne vise le transfert des automatismes hors-app.

### Approche de validation

- **Signal primaire** : l'enfant demande l'app lui-même après 2 semaines
- **Signal secondaire** : référence aux zones hors-app après 4–6 semaines

### Risques innovation

| Risque | Mitigation |
|---|---|
| Détection audio non fiable en conditions réelles | Spike technique isolé avant développement — condition bloquante |
| Seuil de nouveauté narrative insuffisant (lassitude) | Volume de contenu pour 3–6 mois sans répétition perceptible |
| Métaphore spatiale non comprise par les 4–5 ans | Tranche d'âge V1 ciblée à 6–10 ans |

## Exigences spécifiques PWA

### Architecture technique

- **Type** : SPA, rendu client uniquement — pas de serveur applicatif
- **Hébergement** : statique (GitHub Pages ou équivalent)
- **Offline** : Service Worker avec stratégie cache-first pour tous les assets (JS, CSS, audio, visuels)
- **Stockage** : localStorage — profil enfant, progression narrative, état de la session

### Support navigateur

| Navigateur | Priorité | Notes |
|---|---|---|
| Safari iOS (iPhone) | P0 — cible principale | Web Audio API, Service Worker, PWA install |
| Chrome Android | P1 — cercle restreint | Comportement PWA plus permissif qu'iOS |
| Desktop (tous) | Hors scope | Non optimisé, non testé |
| Firefox/Chrome iOS | Acceptable | Tous sur WebKit iOS — comportement identique à Safari |

### Responsive design

Optimisé mobile portrait uniquement. Pas de breakpoint desktop. Interface conçue pour un enfant qui tient le téléphone à deux mains ou le pose.

### Accessibilité

Pas de cible WCAG formelle en V1. Contraintes UX fonctionnelles :
- Zones tactiles ≥ 44×44px (standard Apple HIG)
- Interface utilisable par un enfant non-lecteur (navigation par icônes et animations, pas par texte)
- Feedback sonore et visuel combinés — jamais l'un sans l'autre

### Considérations d'implémentation

- La permission microphone est demandée pendant l'onboarding parent — testée sur iOS Safari en priorité (comportement plus restrictif que Chrome)
- Le Service Worker gère la mise à jour de l'app sans rechargement brutal pendant une session
- Pas de dépendances CDN externes — tout doit fonctionner offline
- Budget assets non fixé en PRD — à définir en architecture. Point d'attention : iOS Safari applique une éviction agressive du cache PWA sur les fichiers volumineux ; les assets audio doivent être dimensionnés en conséquence

## Exigences fonctionnelles

### Détection audio

- **FR1 :** Le système peut détecter en temps réel si l'enfant brosse activement (état : brossage)
- **FR2 :** Le système peut distinguer le brossage d'autres sons ambiants (voix, silence, bruit de fond)
- **FR3 :** Le système peut accumuler le temps de brossage actif par zone de façon cumulative, sans réinitialiser si l'enfant s'arrête temporairement
- **FR4 :** Le système peut suspendre la progression narrative sans pénalité ni signal négatif lorsque le brossage s'arrête
- **FR5 :** Le système peut figer la progression narrative lorsqu'une voix est détectée — la règle "ne pas parler en se brossant" est encodée dans la mécanique, découverte naturellement par l'enfant, jamais affichée

### Session de brossage

- **FR6 :** Le système peut structurer une session en trois phases séquentielles : (1) narration vocale d'introduction avant le brossage actif, (2) progression visuelle seule pendant le brossage, (3) micro-célébration et accroche narrative après complétion
- **FR7 :** L'enfant peut lancer une session de brossage par une interaction unique à l'écran
- **FR8 :** Le système peut structurer une session en zones temporelles séquentielles correspondant aux zones de la bouche
- **FR9 :** Le système peut débloquer une zone narrative après que l'enfant a cumulé un temps minimum de brossage actif dans cette zone
- **FR10 :** Le système peut déclencher des micro-événements narratifs à intervalles réguliers dans chaque zone pour ramener l'attention de l'enfant
- **FR11 :** L'enfant peut recevoir un feedback visuel de complétion lorsqu'une zone se débloque
- **FR12 :** Le système peut déclencher une micro-célébration de fin de session lorsque toutes les zones sont complétées
- **FR13 :** Le système peut limiter à une session par période de la journée (matin : 0h–16h59 / soir : 17h–23h59), pour un maximum de deux sessions par jour

### Univers narratif

- **FR14 :** Le système peut présenter une métaphore narrative où chaque zone de l'histoire correspond à une zone de brossage
- **FR15 :** Le système peut faire progresser la narration uniquement lorsqu'un brossage actif est détecté
- **FR16 :** Le système peut injecter le prénom de l'enfant dans la narration
- **FR17 :** Le système peut proposer un volume narratif suffisant pour 3 à 6 mois d'usage quotidien sans répétition perceptible
- **FR18 :** Le système peut adapter le ton narratif selon la période de la journée (matin / soir)
- **FR19 :** Le système peut détecter automatiquement la période de la journée pour adapter la narration

### Profil enfant

- **FR20 :** Le parent peut créer un profil enfant avec un prénom et une icône
- **FR21 :** Le système peut stocker le profil enfant et la progression narrative localement sur l'appareil, sans compte en ligne
- **FR22 :** Le parent peut sélectionner le profil enfant pour démarrer une session

### Onboarding parent

- **FR23 :** Le parent peut accéder à l'app via un lien direct sans passer par un store d'applications
- **FR24 :** Le parent peut créer un profil enfant sans créer de compte en ligne
- **FR25 :** Le parent peut autoriser l'accès au microphone depuis le flux d'onboarding — avant toute session enfant
- **FR26 :** Le système peut guider le parent vers un flux de récupération si la permission microphone est refusée ou révoquée
- **FR27 :** Le parent peut installer l'app sur l'écran d'accueil depuis le navigateur

### Infrastructure PWA

- **FR28 :** Le système peut fonctionner sans connexion réseau après la première installation, y compris les assets audio et visuels
- **FR29 :** Le système peut détecter si le navigateur ne supporte pas les APIs requises et en informer l'utilisateur
- **FR30 :** Le système peut se mettre à jour sans interrompre une session en cours

## Exigences non-fonctionnelles

### Performance

- **NFR1 :** L'app démarre en ≤ 10 secondes depuis l'icône écran d'accueil (PWA installée, hors réseau)
- **NFR2 :** La détection sonore produit une réponse à l'état de l'audio (brossage / voix / silence) en < 200ms
- **NFR3 :** Les micro-événements narratifs se déclenchent sans délai visible par rapport à leur cue temporel
- **NFR4 :** Les transitions entre zones s'affichent en < 500ms après validation du temps minimum de brossage

### Fiabilité

- **NFR5 :** L'app fonctionne sans connexion réseau après la première installation (tous les assets précachés par le Service Worker)
- **NFR6 :** La progression de la session en cours n'est pas perdue en cas d'interruption du navigateur ou mise en veille de l'écran
- **NFR7 :** La mise à jour de l'app n'interrompt pas une session en cours

### Compatibilité

- **NFR8 :** L'app est pleinement fonctionnelle sur Safari iOS (versions courantes ± 2 ans) — cible P0
- **NFR9 :** L'app est pleinement fonctionnelle sur Chrome Android (versions courantes ± 2 ans) — cible P1
- **NFR10 :** L'app affiche un message d'erreur explicite si la Web Audio API ou le Service Worker ne sont pas supportés

### Sécurité & Confidentialité

- **NFR11 :** Aucune donnée utilisateur n'est transmise à un serveur externe en V1
- **NFR12 :** Le prénom de l'enfant et la progression narrative restent exclusivement sur l'appareil (localStorage)
