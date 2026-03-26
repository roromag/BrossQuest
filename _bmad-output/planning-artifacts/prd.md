---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish"]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-bmad-2026-03-23.md"
workflowType: 'prd'
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: web_app
  domain: edtech_ritual_companion
  complexity: medium-high
  projectContext: greenfield
  architecture: pwa_static_offline_first
  signInSocial: v2
  userStructure: dual_persona
---

# Product Requirements Document - BrossQuest

**Auteur :** Romain
**Date :** 2026-03-24

## Executive Summary

BrossQuest est une Progressive Web App conçue pour les enfants de 6 à 10 ans, distribuée en cercle restreint et gratuite. Elle résout un problème précis : les enfants brossent leurs dents en automatique, sans couvrir les zones — leur attention n'est pas sur les dents, elle est ailleurs.

L'objectif de conception est le **transfert de la carte spatiale** : après plusieurs mois d'usage, l'enfant fait spontanément référence aux zones de sa bouche dans des contextes hors-session, et brosse instinctivement toutes les zones sans guidage. La routine quotidienne n'est pas la fin — elle est le vecteur de répétition qui permet cet ancrage. Le signal observable de ce transfert est la **tendance décroissante du temps de pause** par session sur plusieurs semaines : un enfant qui a intégré la carte mentale reste concentré plus longtemps, fait des pauses plus courtes, sans qu'on lui demande.

BrossQuest structure chaque session en trois états distincts. **Avant** (10–15s) : narration vocale courte avec le prénom de l'enfant, mise en scène de l'épisode — une phrase narrative orientée vers la zone à traiter qui active l'imagination de l'enfant et lui permet de projeter mentalement l'histoire sur sa bouche. Flux caméra visible brièvement pour calibration naturelle, puis fondu. **Pendant** (2 min) : visuel seul — aucune narration, aucun son. Une animation abstraite évocatrice se déplace lentement d'un quadrant à l'autre, guidant implicitement la brosse sans instruction explicite. Sa lisibilité repose sur la phrase introductive : c'est la narration "Avant" qui décode l'animation, pas l'animation elle-même. **Après** (5–10s) : micro-célébration discrète et accroche narrative vers le prochain épisode.

La progression est pilotée par la détection visuelle du geste réel (MediaPipe Hands, traitement 100% on-device). L'histoire avance uniquement quand un brossage actif est détecté. Elle se met en pause sans brossage — sans pénalité, sans signal négatif. Les micro-événements d'animation ne sont pas aléatoires : ils se déclenchent quand la détection signale un manque d'attention, pour ramener le focus sur les dents.

La progression narrative est construite sur la **Série** : des épisodes séquentiels qui avancent à chaque session dans un univers unique, créant l'attachement et le désir de revenir savoir la suite. En V2, la **Collection** étendra ce modèle — l'enfant pourra choisir librement son univers du jour parmi plusieurs disponibles, chacun maintenant sa propre progression indépendante.

L'onboarding est un rituel en deux temps : le parent configure (prénom, permission caméra, installation PWA), puis **passe la main** — l'enfant choisit son emoji parmi une sélection, premier geste dans l'app avant même le premier brossage. Ce passage de main est un différenciateur d'onboarding : l'enfant ne reçoit pas un compte configuré, il prend possession de son univers.

Conçu à l'origine pour résoudre le problème dans sa version la plus exigeante — un enfant avec des difficultés d'attention — BrossQuest est efficace pour tous les profils parce qu'il n'a jamais cédé sur le cas difficile.

Philosophie produit : zéro pénalité, zéro notification, zéro pression. L'app fonctionne offline, démarre en moins de 10 secondes, disparaît après la session.

### Ce qui rend BrossQuest unique

Les apps de brossage existantes (Disney Magic Timer, Pokémon Smile) capturent l'attention *vers* l'écran. BrossQuest oriente l'attention *vers les dents* — la caméra renforce cette inversion : le flux disparaît après calibration, l'animation abstraite reste suffisamment présente pour guider sans jamais concurrencer le geste.

Le différenciateur core est la **réactivité** : les micro-événements ne sont pas programmés à intervalle fixe, ils sont déclenchés par la détection d'inattention. L'app perçoit le décrochage et répond. C'est un système qui observe, pas un timer déguisé.

La **Série** crée l'attachement narratif : l'enfant revient parce qu'il veut savoir ce qui arrive à "son" dragon — pas parce qu'une notification le rappelle. En V2, la Collection ajoutera un second levier — l'agentivité du choix quotidien d'univers.

Le **passage de main** à l'onboarding est un rituel d'entrée : l'enfant prend possession de l'app dès la première minute, avant même le premier brossage.

**Prérequis bloquant — Spike technique :** la fiabilité de MediaPipe Hands en conditions réelles (salle de bain, éclairage variable, distance 40–70cm, enfant en mouvement) doit être validée avant tout développement fonctionnel. C'est la dépendance critique du projet.

## Classification Projet

**Type :** PWA · Web App (SPA statique, offline-first, zéro backend V1)
**Domaine :** EdTech · ritual companion comportemental (enfants 6–10 ans)
**Complexité :** Medium-high — ML on-device (MediaPipe Hands) · dual-persona · bifurcation spike technique
**Contexte :** Greenfield · distribution cercle restreint V1 · solo developer

## Critères de Succès

### Succès utilisateur

**Signal primaire — Renversement de l'initiative**
L'enfant demande l'app lui-même avant que le parent propose. Succès gradué :
- Succès partiel : l'enfant accepte sans résistance quand le parent propose
- Succès : l'enfant demande l'app de lui-même la majorité des soirs/matins
- Grand succès : l'enfant ne rate pas une séance volontairement

**Signal secondaire — Régularité**
5 sessions complètes ou plus par semaine maintenues sur au moins 4 semaines consécutives dans un foyer du cercle.

**Signal de transfert — Intégration de la carte spatiale**
Non mesurable directement. Proxy observable : tendance décroissante du temps de pause cumulé par session sur plusieurs semaines. En phase de validation cercle V1, ce signal est extrait manuellement depuis le localStorage par Romain — pas d'analytics automatique. Signal qualitatif complémentaire : le parent observe que l'enfant fait spontanément référence aux zones de sa bouche hors-session.

**Signal d'alerte — Non-adoption**
Moins de 3 sessions par semaine après 3 semaines d'usage dans un foyer = déclencheur d'investigation. Pas un échec définitif, mais un signal que quelque chose bloque (friction d'usage, désintérêt narratif, problème technique) et nécessite une analyse.

### Succès business

BrossQuest est un projet personnel sans objectif commercial. Le succès se définit par :
- **Adoption sans friction** : un parent du cercle proche est autonome après une seule démonstration de 2 minutes
- **Rétention à 4 semaines** : l'app est encore utilisée activement 1 mois après la première installation dans un foyer
- **Ouverture possible** : si adoption et rétention sont confirmées dans le cercle, une extension publique devient envisageable — conséquence, pas objectif

### Succès technique

- **Spike MediaPipe validé** : détection correcte du mouvement de brossage dans les conditions réelles de la salle de bain de Romain. Critère binaire — environnement standard, si ça fonctionne ici, le spike est validé
- **Latence de détection** ≤ 1 seconde entre début du mouvement et réaction de l'animation
- **Démarrage PWA** ≤ 10 secondes depuis l'icône écran d'accueil, hors réseau
- **Offline-first** : tous les assets précachés et disponibles sans réseau après la première installation

### Outcomes mesurables

| Outcome | Seuil | Horizon |
|---|---|---|
| Sessions par semaine par enfant | ≥ 5 | Semaines 2–6 |
| Demande spontanée de l'enfant | Majorité des soirs/matins | Semaine 3–4 *(indicatif, variable selon profil)* |
| Autonomie parent cercle proche | Après 1 démonstration | Onboarding |
| Rétention foyer | Utilisation active à J+30 | 1 mois post-install |
| Tendance temps de pause | Décroissante sur 4 semaines | Mois 1–2 |
| Signal d'alerte non-adoption | < 3 sessions/semaine | Semaine 3 |
| Démarrage PWA | ≤ 10 secondes | Avant lancement |
| Latence détection visuelle | ≤ 1 seconde | Spike technique |

## Périmètre Produit

### MVP — V1 Cercle restreint

**Prérequis bloquant :** spike MediaPipe Hands validé en conditions réelles avant tout développement fonctionnel.

| Feature | Justification | Phase V1 |
|---|---|---|
| Détection visuelle MediaPipe Hands (on-device) | Moteur core — condition sine qua non | Alpha |
| Séquence Avant / Pendant / Après | Structure session — différenciateur principal | Alpha |
| Animation abstraite guidante (4 quadrants) | Guidage implicite sans instruction froide | Alpha |
| Micro-événements réactifs (déclenchés par inattention) | Résout le problème d'attention | Alpha |
| Pause narrative sans pénalité | Philosophie bienveillante encodée dans la mécanique | Alpha |
| Série narrative unique avec épisodes séquentiels | Attachement narratif — levier de rétention | Alpha |
| Épisodes flashback | Réduit la pression de production de contenu original | Alpha |
| Onboarding parent (prénom + permission caméra + installation PWA) | Condition d'usage | Alpha |
| Passage de main : choix d'emoji par l'enfant | Rituel d'entrée — premier geste dans l'app | Alpha |
| 1 profil enfant par installation | Contrainte V1 | Alpha |
| PWA installable, offline-first | Contrainte d'usage réel (salle de bain, hors réseau) | Alpha |
| Démarrage ≤ 10 secondes | KPI non négociable | Alpha |
| Adaptation matin / soir (détection automatique + ton narratif adapté) | Polish — enrichit l'expérience sans changer le moteur | Final |

**Hors scope V1 :** Collection (choix d'univers) · sign-in social · multi-profils enfants · sync cloud · mode audio (brosses manuelles) · notifications · analytics · multi-appareils

### Croissance — V2 (post-validation cercle)

- Collection : choix d'univers quotidien parmi plusieurs thèmes (Médiéval, Marine, Espace…), progressions indépendantes
- Sign-in social (Google / Apple) + sync cloud multi-appareils
- Multi-profils enfants par compte parent
- Mode Audio : détection sonore via Web Audio API (brosses manuelles)
- Autonomie de lancement pour l'enfant
- Guidage par zones progressivement implicite

### Vision — Horizon long terme

- L'app grandit avec l'enfant : guidage implicite total, autonomie complète
- Élargissement vers les 4–5 ans avec mécaniques adaptées
- Partage de progression entre enfants du cercle (fierté, pas compétition)
- Ouverture publique si l'adoption dans le cercle le justifie

## Parcours Utilisateurs

### Parcours 1 — Lucas, session nominale (soir)

*Lucas, 6 ans. Difficultés d'attention. Aime les dragons et les quêtes. La routine de brossage est acceptée — pas combattue — mais Lucas part dans sa tête au bout de 20 secondes.*

**Scène d'ouverture**
20h15. Lucas est en pyjama dans la salle de bain. Son père pose le téléphone sur le rebord du lavabo, face à lui. Il ouvre BrossQuest, sélectionne "Lucas ⚔️". L'écran s'allume. La caméra détecte Lucas à 50cm.

**Action montante**
Un grand bouton animé pulse. Lucas appuie. L'écran bascule : flux caméra visible quelques secondes — Lucas se voit avec sa brosse. Puis la voix narrative démarre : *"Le Dragon Molaire est malade, Lucas. Ses écailles du côté gauche sont couvertes de vase noire. Il a besoin de toi maintenant."* Le flux caméra fond vers l'animation. Lucas commence à brosser. L'animation abstraite — une forme sombre qui pulse lentement — occupe le quadrant gauche haut. Lucas suit instinctivement.

**Climax**
30 secondes. L'animation glisse vers le quadrant gauche bas. Lucas déplace sa brosse. Un micro-événement : la forme pulse plus fort, brièvement — la détection a signalé une baisse d'attention. Lucas refocalise. La progression reprend. Troisième zone. Quatrième. L'animation couvre les quatre quadrants.

**Résolution**
2 minutes. La voix revient : *"Le dragon vole à nouveau."* Une animation mémorable — courte, joyeuse. Lucas dit "il est guéri !". Son père reprend le téléphone. Lucas se rince. Demain soir, il demandera l'app lui-même.

*Capabilities révélées : détection de présence caméra, calibration visuelle, narration vocale "Avant" avec prénom, animation abstraite 4 quadrants, micro-événements réactifs déclenchés par inattention, micro-célébration "Après", accroche narrative vers prochain épisode.*

---

### Parcours 2 — Lucas, décrochage en session

*Même Lucas. Ce soir il est fatigué. Il commence à brosser mais s'arrête après 40 secondes, brosse dans la bouche, regard dans le vague.*

**Scène d'ouverture**
La session est lancée normalement. Lucas brosse les 30 premières secondes. Puis il s'arrête. La détection visuelle ne perçoit plus de mouvement de brossage. La progression s'arrête — la zone ne se débloque pas.

**Action montante**
L'app ne punit pas. Elle attend. Après quelques secondes, un micro-événement se déclenche : l'animation pulse différemment, une légère variation — pas une injonction, une invitation. Lucas reprend instinctivement sa brosse.

**Climax**
La détection reprend. La progression repart exactement là où elle s'était arrêtée — cumulative, sans réinitialisation. Lucas finit la zone. La session dure 2 minutes 30 au lieu de 2 minutes.

**Résolution**
Lucas termine. L'app ne lui a jamais dit qu'il avait mal fait. Aucune pénalité visible. La séance suivante, il ne se souvient que du dragon guéri.

*Capabilities révélées : détection visuelle 3 états (brossage actif / pause / absent), accumulation cumulative du temps de brossage sans réinitialisation, micro-événements réactifs sur inattention détectée, pause narrative sans signal négatif, sauvegarde état session en cas d'interruption.*

---

### Parcours 3 — Sandrine, onboarding parent principal

*Sandrine, 38 ans. Mère de Lucas. A reçu un lien PWA de Romain. Sceptique — la dernière app de brossage que Lucas avait, il fixait l'écran et brossait n'importe comment.*

**Scène d'ouverture**
Sandrine reçoit un message de Romain avec un lien. Elle l'ouvre sur son iPhone, dans sa cuisine. L'app se charge. Un écran sobre lui propose : "Créer le profil de ton aventurier".

**Action montante**
Elle saisit "Lucas". L'app lui explique en une phrase pourquoi elle a besoin de la caméra — détection du vrai geste de brossage, traitement sur l'appareil, rien n'est envoyé. Elle accepte la permission. L'app lui montre brièvement à quoi ressemblera le lancement pour Lucas. Elle installe la PWA sur son écran d'accueil.

**Passage de main**
Le soir, elle tend le téléphone à Lucas dans la salle de bain. L'app affiche une sélection d'emojis animés. Lucas choisit ⚔️ sans hésiter. C'est son premier geste dans l'app. Sandrine n'a rien configuré côté enfant — Lucas l'a fait lui-même.

**Résolution**
Sandrine part faire la vaisselle. Lucas brosse. Elle revient deux minutes plus tard. Pas de compte email, pas de mot de passe, pas de synchronisation. 3 minutes au total depuis le lien reçu. Elle n'a pas eu à rester dans la salle de bain.

*Capabilities révélées : onboarding parent (prénom), explication permission caméra contextualisée, installation PWA guidée, passage de main (sélection emoji par l'enfant), emoji modifiable avant passage de main, flux ≤ 3 minutes, zéro compte cloud.*

---

### Parcours 4 — Thierry, parent du cercle proche

*Thierry, 42 ans. Cousin de Romain. A vu l'app un week-end chez lui. Sa fille Emma (7 ans) veut essayer. Romain lui fait une démonstration de 2 minutes.*

**Scène d'ouverture**
Romain montre le lancement en 3 gestes : écran d'accueil → profil → grande animation. "C'est tout." Il envoie le lien PWA à Thierry par SMS.

**Action montante**
Thierry ouvre le lien sur son Android. Il crée le profil "Emma", autorise la caméra, installe la PWA. Ce soir, il pose le téléphone sur le rebord du lavabo. Emma choisit son emoji 🌟. La session démarre.

**Climax**
Emma brosse. Thierry reste dans l'embrasure, curieux. Il voit Emma regarder l'écran par intermittence, déplacer sa brosse d'un côté à l'autre. Il ne dit rien. Il n'a pas besoin d'intervenir. La salle de bain est mal éclairée — l'app affiche un signal discret de détection dégradée, Thierry repositionne légèrement le téléphone. La détection reprend.

**Résolution**
Thierry n'a posé aucune question technique à Romain. L'app a fonctionné du premier coup. La semaine suivante, Emma demande l'app elle-même.

*Capabilities révélées : accès par lien direct, onboarding autonome, permission caméra, passage de main, usage immédiat sans formation, compatibilité Chrome Android, signal détection dégradée (éclairage), détection orientation inversée + adaptation automatique.*

---

### Parcours 5 — Sandrine teste seule avant la première session

*La veille de montrer l'app à Lucas, Sandrine veut comprendre comment ça fonctionne. Elle teste seule dans la salle de bain.*

**Scène d'ouverture**
Sandrine ouvre l'app, lance la session. La caméra s'active — elle se voit dans le flux. Elle n'a pas de brosse, elle n'est pas un enfant. MediaPipe ne détecte pas de geste de brossage.

**Action montante**
L'app reste sur l'écran d'attente — pas de narration, pas de progression. L'état de détection "aucun brossage" est silencieux. Sandrine explore l'interface : elle voit que l'emoji est encore modifiable. Elle décide de laisser Lucas choisir le sien le soir — elle ne le fixe pas maintenant.

**Résolution**
Le lendemain soir, elle tend le téléphone à Lucas. L'app affiche la sélection d'emojis vierge. Lucas choisit ⚔️. Le passage de main se déroule comme prévu.

*Capabilities révélées : état d'attente silencieux sans brossage détecté, emoji modifiable à tout moment avant passage de main, flux parent → passage de main différé.*

---

### Parcours 6 — Thierry, permission caméra refusée puis récupérée

*Thierry, prudent, refuse la permission caméra par réflexe lors de l'onboarding.*

**Scène d'ouverture**
L'app demande la permission caméra. Thierry refuse — réflexe de protection des données. L'app n'affiche pas un message d'erreur brut. Elle présente un écran d'explication parent contextualisé : pourquoi la caméra est nécessaire, que le traitement est 100% local, comment l'activer dans les réglages iOS.

**Action montante**
Thierry va dans Réglages → Safari → Caméra, autorise. Il revient dans l'app. Le flux reprend normalement. L'onboarding se termine. Emma choisit son emoji.

**Cas de révocation ultérieure**
Trois semaines plus tard, iOS révoque silencieusement la permission. Au prochain lancement, l'app détecte l'absence de permission avant d'afficher quoi que ce soit à Emma. Elle redirige Thierry vers le même flux de récupération côté parent — Emma ne voit jamais le message d'erreur.

**Résolution**
Thierry ré-autorise. La session d'Emma démarre normalement.

*Capabilities révélées : détection permission caméra au lancement, écran d'explication parent contextualisé, flux de récupération permission refusée/révoquée, isolation du flux de récupération (enfant ne voit jamais l'erreur technique).*

---

### Cas techniques — Fiabilité

**Session interrompue :** verrouillage écran, appel entrant, parent reprend le téléphone en urgence. L'état de progression de l'épisode en cours est sauvegardé en IndexedDB. Au prochain lancement, l'app propose de reprendre là où la session s'est arrêtée ou de recommencer l'épisode.

**Mise à jour PWA mid-session :** le Service Worker détecte une nouvelle version. L'installation est différée jusqu'à la fin de la session. Aucune interruption visible.

**Détection impossible — position / angle :** signal distinct de "détection dégradée" affiché, différent de "pas de brossage", pour que le parent comprenne que c'est un problème de conditions et non de geste.

**Téléphone posé à l'envers :** dans certaines salles de bain, poser le téléphone caméra frontale en bas cadre mieux l'enfant. L'app détecte l'orientation inversée (accéléromètre) et retourne automatiquement le traitement du flux caméra — sans action de l'utilisateur.

---

### Synthèse des capabilities par parcours

| Capability | P1 | P2 | P3 | P4 | P5 | P6 |
|---|---|---|---|---|---|---|
| Détection de présence caméra | ✓ | ✓ | | | ✓ | |
| Calibration visuelle (flux caméra brief) | ✓ | ✓ | | | ✓ | |
| Narration vocale "Avant" avec prénom | ✓ | ✓ | | | | |
| Animation abstraite 4 quadrants | ✓ | ✓ | | | | |
| Micro-événements réactifs (inattention) | ✓ | ✓ | | | | |
| Pause sans pénalité, accumulation cumulative | | ✓ | | | | |
| Micro-célébration "Après" + accroche narrative | ✓ | | | | | |
| Onboarding parent + permission caméra | | | ✓ | ✓ | | ✓ |
| Passage de main (emoji enfant) | | | ✓ | ✓ | ✓ | |
| Emoji modifiable avant passage de main | | | | | ✓ | |
| Flux de récupération permission caméra | | | | | | ✓ |
| Isolation erreur technique côté enfant | | | | | | ✓ |
| État d'attente silencieux (pas de brossage) | | | | | ✓ | |
| Signal détection dégradée (éclairage / position) | | | | ✓ | | |
| Détection orientation inversée + adaptation | | | | ✓ | | |
| Sauvegarde état session (interruption) | | ✓ | | | | |
| Mise à jour PWA différée (hors session) | | | | | | |

## Exigences Spécifiques au Domaine

### Conformité & Réglementation

**COPPA / RGPD mineurs — non applicable en V1**
Aucune donnée personnelle collectée ni transmise. Le prénom de l'enfant et la progression narrative sont stockés exclusivement en IndexedDB sur l'appareil, jamais envoyés à un serveur. Pas de compte utilisateur, pas de cookies, pas de tracking. Aucun consentement requis, aucune bannière. Hébergement statique (GitHub Pages ou équivalent) — zéro traitement serveur.

*Note V2 : le sign-in social et la sync cloud introduiront une exposition réglementaire RGPD significative (données d'enfants, consentement parental explicite). Ce point est hors scope V1 mais devra être anticipé dès la conception de V2.*

**Permission caméra — traitement spécial mineurs**
La permission d'accès à la caméra est demandée pendant l'onboarding parent uniquement — jamais face à l'enfant. Le traitement MediaPipe est 100% on-device : aucun flux vidéo n'est transmis, aucune image n'est stockée. C'est l'argument central face à la sensibilité réglementaire accrue pour les mineurs. Si la permission est refusée ou révoquée, un flux de récupération parent existe (cf. Parcours 6).

### Contraintes Techniques

**Stockage local exclusif**
IndexedDB pour le profil enfant, la progression narrative et l'état des sessions. Perte de données si l'utilisateur vide le cache navigateur — risque accepté en V1. Aucune donnée de sauvegarde distante.

**ML on-device obligatoire**
MediaPipe Hands s'exécute entièrement sur l'appareil (WASM). Aucun flux vidéo, aucune donnée biométrique ne quittent jamais l'appareil. Ce choix technique n'est pas seulement une contrainte de performance — c'est la garantie de conformité privacy pour un produit destiné à des mineurs.

**Offline-first**
Service Worker avec stratégie cache-first pour tous les assets (JS, CSS, audio narratif, visuels). L'app doit fonctionner sans réseau après la première installation, y compris la narration vocale.

**Budget assets — iOS Safari**
iOS Safari applique une éviction agressive du cache PWA sur les fichiers volumineux. Le budget total des assets précachés doit être défini en architecture. Les fichiers audio narratifs sont le point d'attention principal — à compresser et dimensionner en conséquence.

### Accessibilité

Pas de cible WCAG formelle en V1. Contraintes UX fonctionnelles non négociables :
- Zones tactiles ≥ 44×44px (standard Apple HIG)
- Interface utilisable par un enfant partiellement non-lecteur (6 ans) : navigation par icônes, animations et retour vocal — jamais par texte seul
- Feedback sonore et visuel combinés — jamais l'un sans l'autre pendant la session

### Contenu adapté à l'âge

- Narration bienveillante — zéro peur, zéro pression, zéro antagoniste menaçant
- Micro-célébration proportionnée — ni excessive (crée une dépendance au reward) ni inexistante
- Épisodes flashback visuellement distincts des épisodes originaux — l'enfant peut percevoir la différence sans que ce soit démotivant

### Intégrations requises

Aucune intégration externe en V1.

### Risques domaine

| Risque | Mitigation |
|---|---|
| Éviction cache iOS Safari | Budget assets défini en architecture ; stratégie de précache validée avant lancement |
| Révocation permission caméra (iOS) | Flux de récupération parent côté app ; détection au lancement avant toute session enfant |
| MediaPipe non supporté (navigateur ancien) | Détection au démarrage + message d'erreur explicite + fallback gracieux |
| Volume narratif insuffisant (lassitude) | Épisodes flashback intégrés en V1 ; contrainte de volume définie avant lancement |
| Exposition RGPD en V2 | Sign-in social et sync cloud à concevoir avec conformité RGPD mineurs dès V2 |

## Innovation & Patterns Novateurs

### Axes d'innovation identifiés

**1. Détection visuelle du geste réel comme moteur narratif (MediaPipe Hands / WASM)**
BrossQuest est, à notre connaissance, la première app de brossage à utiliser la vision par ordinateur on-device (MediaPipe Hands en WebAssembly) pour détecter le mouvement réel de la brosse. Les approches existantes utilisent soit un timer simple, soit la détection sonore d'une brosse électrique. MediaPipe valide le *geste* — pas juste la présence d'une brosse allumée. C'est le seul signal honnête de brossage actif accessible depuis un navigateur mobile sans hardware dédié.

**2. Micro-événements réactifs — un système qui observe, pas un timer déguisé**
Les micro-événements d'animation ne se déclenchent pas à intervalles fixes. Ils sont déclenchés par la détection d'inattention — quand MediaPipe signale l'absence de mouvement de brossage. L'app perçoit le décrochage et répond. Cette réactivité est absente de toutes les apps de brossage connues, qui programment leurs interactions indépendamment du comportement de l'enfant.

**3. Inversion de l'attention — l'écran comme instrument, pas comme destination**
Les apps existantes capturent l'attention *vers* l'écran. BrossQuest utilise l'animation comme guide implicite qui oriente l'attention *vers les dents*. Le flux caméra disparaît après calibration. L'animation abstraite reste suffisamment présente pour guider sans jamais concurrencer le geste. L'enfant peut regarder l'écran et rester concentré sur ses dents — les deux ne s'excluent pas.

**4. La narration "Avant" décode l'animation "Pendant"**
L'animation abstraite est intentionnellement abstraite pour ne pas capter l'attention. Sa lisibilité repose sur la phrase narrative introductive : la narration "Avant" active l'imagination de l'enfant, qui projette ensuite l'histoire sur le visuel abstrait. Ce couplage contenu-visuel est une dépendance de conception rare — changer la phrase change la perception de l'animation.

**5. Conçu pour le cas le plus difficile — efficace pour tous**
BrossQuest a été conçu à l'origine pour un enfant avec des difficultés d'attention. Cette contrainte force des solutions qui fonctionnent dans la version la plus exigeante du problème. Tout mécanisme validé sur ce profil est sur-dimensionné pour le cas général.

### Contexte marché & Paysage concurrentiel

Les apps de brossage existantes partagent le même modèle : timer visuel, gamification à l'écran, récompenses conditionnelles. Aucune n'utilise la vision par ordinateur. Aucune n'est réactive au comportement de l'enfant en temps réel. Aucune ne vise le transfert des automatismes hors-app.

| Concurrent | Mécanisme | Limitation |
|---|---|---|
| Disney Magic Timer | Timer photo + récompenses | Fixation écran, pas de détection de geste |
| Pokémon Smile | AR gamifiée | Attention vers l'écran, timer simple |
| Brush DJ | Timer musical | Aucune détection, aucune narrative |
| Sonicare for Kids | Brosse connectée Bluetooth | Hardware dédié, coût élevé, pas de narrative |

BrossQuest occupe un espace vide : détection comportementale réactive + narration implicite + transfert des automatismes, sans hardware dédié.

### Approche de validation

- **Spike technique** (prérequis bloquant) : MediaPipe Hands en conditions réelles — salle de bain, éclairage variable, distance 40–70cm, enfant en mouvement
- **Signal primaire** (semaine 2–3) : l'enfant demande l'app lui-même
- **Signal de transfert** (mois 1–2) : tendance décroissante du temps de pause par session
- **Signal qualitatif** : référence spontanée aux zones hors-session

### Risques innovation

| Risque | Mitigation |
|---|---|
| MediaPipe non fiable en conditions réelles | Spike isolé avant tout développement — condition bloquante |
| Animation abstraite incomprise (enfants plus jeunes) | Tranche d'âge V1 ciblée 6–10 ans ; narration "Avant" comme décodeur |
| Seuil de nouveauté narrative insuffisant | Épisodes flashback + contrainte de volume avant lancement |
| CPU insuffisant sur appareils mid-range | À valider dans le spike : empreinte MediaPipe WASM sur Android bas de gamme |

## Exigences Spécifiques PWA

### Architecture technique

- **Type** : SPA, rendu client uniquement — aucun serveur applicatif
- **Hébergement** : statique (GitHub Pages ou équivalent) — zéro backend V1
- **Offline** : Service Worker avec stratégie cache-first pour tous les assets (JS, CSS, audio narratif, visuels, WASM MediaPipe)
- **Stockage** : IndexedDB — profil enfant, progression narrative, état de session
- **Budget cache cible** : < 30 Mo total — contrainte de design à tenir pour éviter l'éviction agressive iOS Safari. Le modèle WASM MediaPipe et les fichiers audio narratifs sont les deux postes à surveiller en priorité

### Support navigateur

| Navigateur | Priorité | Notes |
|---|---|---|
| Safari iOS (iPhone) | P0 — cible principale | Caméra, MediaPipe WASM, Service Worker, PWA install |
| Chrome Android | P1 — cercle restreint | Comportement PWA plus permissif qu'iOS |
| Desktop (tous) | Hors scope | Non optimisé, non testé |
| Firefox / Chrome iOS | Acceptable | Tous sur WebKit iOS — comportement identique à Safari |

### Responsive design

Optimisé mobile portrait uniquement. Pas de breakpoint desktop. Interface conçue pour un enfant qui tient le téléphone à deux mains ou le pose sur un rebord. Deux orientations supportées : portrait standard et portrait inversé (téléphone retourné pour mieux cadrer un enfant petit). Détection de l'orientation via `screen.orientation` API — ne nécessite pas de permission supplémentaire (alternative à DeviceOrientationEvent qui requiert une permission explicite sur iOS 13+).

### Performance

- **Démarrage PWA** : ≤ 10 secondes depuis l'icône écran d'accueil, hors réseau — hors initialisation MediaPipe (différée)
- **Initialisation MediaPipe WASM** : différée jusqu'au lancement de la session (pas au démarrage de l'app) — libère le budget démarrage
- **Latence détection** : ≤ 1 seconde entre début de mouvement et réaction animation
- **Frame rate** : adaptatif selon les capacités de l'appareil — cible 30fps sur iPhone 12+ et Android récent, fonctionnel à 15fps sur mid-range moins puissant ; la contrainte dure est la latence de détection ≤ 1s, pas le frame rate

### Considérations d'implémentation

- **Permission caméra — geste utilisateur obligatoire (iOS)** : `getUserMedia` sur iOS Safari ne peut être appelé qu'en réponse à un geste utilisateur direct (tap). Le bouton pulsant de lancement de session remplit ce rôle. À respecter dans toute l'architecture de permission — aucun démarrage automatique de caméra possible
- **Permission caméra — onboarding parent** : demandée pendant l'onboarding parent uniquement, jamais face à l'enfant. Détection de révocation silencieuse à chaque lancement (iOS révoque sans préavis après inactivité)
- **Contexte audio Web API** : iOS Safari suspend le contexte audio si l'app passe en arrière-plan. Au retour au premier plan, le contexte audio doit être repris ou réinitialisé avant la narration vocale "Avant"
- **IndexedDB vide — récupération silencieuse** : iOS peut vider IndexedDB sans préavis si l'espace disque système est insuffisant. Au lancement, l'app détecte un IndexedDB vide et propose un onboarding de récupération rapide (re-saisie prénom, choix emoji) plutôt qu'une expérience brisée silencieuse
- **Service Worker** : mises à jour différées jusqu'à la fin de la session en cours — aucune interruption visible
- **Zéro dépendances CDN externes** : tous les assets précachés, fonctionnement garanti offline

### SEO & Distribution

Pas de stratégie SEO. Distribution exclusivement par lien direct (SMS, messagerie). Pas d'indexation, pas d'App Store. L'URL de l'app est le vecteur de distribution unique en V1.

## Stratégie MVP & Phased Development

### Stratégie MVP

**Approche :** Validation de concept — prouver que la détection visuelle (MediaPipe Hands) couplée à la narration narrative maintient l'attention d'un enfant pendant 2 minutes de brossage, durablement, sans adulte en boucle constante.

**Ressources :** Développeur solo (Romain). Toutes les décisions de scope s'évaluent à l'aune d'un effort solo soutenable.

**Prérequis bloquant :** spike MediaPipe Hands validé en conditions réelles avant tout développement fonctionnel. C'est la dépendance critique — si le spike échoue, le moteur core est à revoir entièrement.

### Parcours MVP couverts

P1 (session nominale) · P2 (décrochage) · P3 (onboarding parent) · P4 (cercle proche) · P5 (parent teste seul) · P6 (récupération permission caméra)

### Features MVP — Phase Alpha

| Feature | Justification |
|---|---|
| Spike MediaPipe Hands (prototype isolé) | Prérequis bloquant — à valider avant tout |
| Détection visuelle du geste (on-device) | Moteur core |
| Séquence Avant / Pendant / Après | Structure session — différenciateur principal |
| Animation abstraite guidante (4 quadrants) | Guidage implicite |
| Micro-événements réactifs (inattention détectée) | Résout le problème d'attention |
| Pause narrative sans pénalité, accumulation cumulative | Philosophie bienveillante encodée |
| Série narrative unique + épisodes flashback | Attachement narratif + gestion volume contenu |
| Onboarding parent (prénom + permission caméra + PWA) | Condition d'usage |
| Passage de main (emoji choisi par l'enfant) | Rituel d'entrée |
| 1 profil enfant par installation | Contrainte V1 |
| Flux de récupération permission caméra | Cas terrain critique |
| Détection orientation inversée + adaptation | Cas terrain réel |
| Sauvegarde état session (IndexedDB) | Fiabilité perçue |
| PWA installable, offline-first | Contrainte d'usage réel |
| Démarrage ≤ 10 secondes | KPI non négociable |

### Features MVP — Phase Final

| Feature | Justification |
|---|---|
| Adaptation matin / soir (détection automatique + ton narratif) | Polish — enrichit sans changer le moteur |

### Risques de scope

| Risque | Type | Mitigation |
|---|---|---|
| Spike MediaPipe non concluant | Technique | Prototype isolé avant tout développement — bloquant |
| Volume narratif insuffisant | Contenu | Épisodes flashback en V1 ; contrainte de volume avant lancement |
| Scope creep solo | Ressource | Hors scope défini explicitement — aucune feature ajoutée sans décision consciente |
| Budget cache iOS Safari dépassé | Technique | Cible < 30 Mo ; à valider en architecture |

## Exigences Fonctionnelles

### Détection du geste

| ID | Exigence |
|---|---|
| FR1 | Détection temps réel du mouvement oscillatoire de la main dans la zone bouche (brossage actif) |
| FR2 | Distinction brossage actif / absence de mouvement |
| FR3 | Accumulation cumulative du temps de brossage par quadrant, sans réinitialisation lors des pauses |
| FR4 | Suspension de la progression narrative sans pénalité si le brossage s'arrête |
| FR5 | Détection d'un manque d'attention → déclenchement d'un micro-événement réactif d'animation |
| FR6 | Détection de la présence de l'utilisateur dans le champ caméra |
| FR7 | Détection de l'orientation inversée du téléphone + adaptation automatique du flux caméra |
| FR8 | Signal d'état « détection dégradée » (éclairage insuffisant / mauvais cadrage) distinct de l'absence de brossage |

### Session de brossage

| ID | Exigence |
|---|---|
| FR9 | Lancement de la session par tap unique de l'enfant (déclenchement getUserMedia par geste utilisateur) |
| FR10 | Structure de session en 3 phases séquentielles : Avant / Pendant / Après |
| FR11 | Phase Avant : flux caméra visible brièvement pour calibration naturelle, puis fondu avant la phase Pendant |
| FR12 | Phase Pendant structurée en 8 segments (4 quadrants × avant/arrière) — ~15 secondes chacun |
| FR13 | Progression de l'animation d'un quadrant au suivant selon le temps de brossage actif cumulé sur ce quadrant |
| FR14 | Micro-événements d'animation déclenchés par inattention détectée — non aléatoires, non programmés |
| FR15 | Micro-célébration visuelle et sonore à la fin d'une session complète |
| FR16 | Retour visuel discret par quadrant à la transition entre quadrants (feedback implicite de progression) |
| FR17 | Sauvegarde de l'état de session en cours + reprise possible après interruption |
| FR18 | Limitation à 1 session par période (matin 0h00–16h59 / soir 17h00–23h59) |

### Narration & Contenu

| ID | Exigence |
|---|---|
| FR19 | Narration vocale courte en phase Avant avec injection dynamique du prénom de l'enfant |
| FR20 | Progression narrative par épisodes séquentiels — un épisode consommé uniquement à la fin d'une session complète |
| FR21 | Épisodes flashback disponibles comme alternative aux épisodes originaux (re-visite d'un épisode passé) |
| FR22 | Adaptation du ton narratif selon la période détectée (matin : énergisant / soir : apaisant) |
| FR23 | Détection automatique de la période de la journée pour adapter la narration sans action utilisateur |

### Profil & Onboarding

| ID | Exigence |
|---|---|
| FR24 | Création de profil enfant avec prénom par le parent lors de l'onboarding |
| FR25 | Choix d'emoji par l'enfant lors du passage de main (premier geste dans l'app) |
| FR26 | Modification de l'emoji et du prénom depuis les paramètres profil post-onboarding |
| FR27 | Demande d'autorisation caméra depuis le flux onboarding parent (avant passage de main) |
| FR28 | Accès à l'app via lien direct sans store (distribution hors App Store / Play Store) |
| FR29 | Installation PWA sur l'écran d'accueil (Add to Home Screen) |
| FR30 | Stockage du profil et de la progression localement (IndexedDB), sans compte en ligne en V1 |
| FR31 | Accès aux paramètres profil depuis l'interface parent post-onboarding |
| FR32 | Sélection du profil enfant pour démarrer une session (écran d'accueil) |

### Gestion erreurs & Récupération

| ID | Exigence |
|---|---|
| FR33 | Détection de l'absence ou de la révocation de permission caméra au lancement de session |
| FR34 | Flux de récupération permission caméra guidé pour le parent (instructions contextuelles selon navigateur/OS) |
| FR35 | Isolation des erreurs techniques côté parent — l'enfant ne voit jamais d'écran d'erreur technique |
| FR36 | Détection d'IndexedDB vide ou corrompu + flux d'onboarding de récupération rapide |
| FR37 | Détection des APIs non supportées (MediaPipe WASM, IndexedDB) + message d'erreur explicite à l'ouverture |

### Infrastructure PWA

| ID | Exigence |
|---|---|
| FR38 | Fonctionnement offline après première installation, incluant les assets audio et les assets WASM MediaPipe |
| FR39 | Mise à jour du Service Worker sans interruption d'une session en cours (update différé à la prochaine ouverture) |
| FR40 | Reprise ou réinitialisation de session après interruption technique (crash navigateur, mise en veille) |

## Exigences Non-Fonctionnelles

### Performance

| ID | Exigence | Mesure |
|---|---|---|
| NFR-P1 | Démarrage de l'app ≤ 10 secondes | LCP / première interaction disponible, réseau 4G, iOS Safari |
| NFR-P2 | Chargement du module MediaPipe WASM différé au lancement de session — ne bloque pas le démarrage app | WASM chargé uniquement au tap de lancement session |
| NFR-P3 | Délai de réponse animation ≤ 1 seconde après détection de geste (brossage actif → réaction visible) | Mesuré sur appareil physique, conditions réelles (salle de bain, éclairage standard) |
| NFR-P4 | Animation fluide pendant la phase Pendant ≥ 30 fps | iPhone SE 2nd gen comme appareil minimal cible |
| NFR-P5 | Budget cache Service Worker ≤ 30 Mo (contrainte Safari iOS) | WASM + assets audio + assets visuels — à valider en architecture |

### Fiabilité & Intégrité

| ID | Exigence | Mesure |
|---|---|---|
| NFR-R1 | Profil et progression conservés après fermeture / réouverture et redémarrage appareil | Aucune perte de données lors d'une fermeture normale |
| NFR-R2 | Session interrompue (appel entrant, mise en veille) récupérable — état sauvegardé en temps réel | Reprise sans perte de progression |
| NFR-R3 | Service Worker mis en cache avant la fin de l'onboarding — offline disponible dès l'installation | App fonctionnelle offline après Add to Home Screen sans connexion ultérieure |
| NFR-R4 | Spike technique MediaPipe validé en conditions réelles avant tout développement produit | Validation sur iPhone SE / Android mid-range, éclairage salle de bain |

### Confidentialité

| ID | Exigence |
|---|---|
| NFR-C1 | Flux caméra traité exclusivement on-device (MediaPipe WASM) — aucune image ou donnée biométrique transmise |
| NFR-C2 | Aucune donnée personnelle envoyée à un serveur en V1 (pas d'analytics, pas de tracking, pas de telemetry) |
| NFR-C3 | Prénom de l'enfant stocké uniquement en local (IndexedDB) — jamais transmis |
| NFR-C4 | Aucun cookie, aucun localStorage de tracking, aucune dépendance analytics tierce en V1 |

### Compatibilité

| ID | Exigence |
|---|---|
| NFR-X1 | Support navigateurs cibles : iOS Safari ≥ 15.4 (PWA Add to Home Screen natif) et Android Chrome ≥ 100 |
| NFR-X2 | Résolution minimale supportée : 360×640px (portrait) |
| NFR-X3 | Orientation portrait uniquement — orientation inversée détectée et gérée (FR7), pas de mode paysage |
| NFR-X4 | App fonctionnelle sans connexion internet après première installation (Service Worker + cache offline complet) |
