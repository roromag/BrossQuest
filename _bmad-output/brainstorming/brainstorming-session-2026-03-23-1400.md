---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Application mobile d''aide au brossage de dents pour enfants avec minuterie'
session_goals: 'Trouver le meilleur design UX/UI, simple et accessible aux jeunes enfants'
selected_approach: 'progressive-flow'
techniques_used: ['What If Scenarios', 'Mind Mapping', 'SCAMPER Method', 'Solution Matrix']
ideas_generated: 44
phase1_complete: true
phase2_complete: true
phase3_complete: true
phase4_complete: true
session_continued: true
continuation_date: '2026-03-24'
session_active: false
workflow_completed: true
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

**26 idées consolidées — session terminée**

### Décisions structurantes

**[Décision #1] : Deux clients, deux définitions du succès**
- **Parent** → branche critique : 🎮 Le Moteur (brossage correct et régulier)
- **Enfant** → branche critique : 📖 L'Aventure (envie de revenir, curiosité narrative)
- Le Moteur est le **pont** entre les deux : `Désir enfant → Aventure → Moteur → Brossage correct → Satisfaction parent`

**[Décision #2] : La Famille = continuité, pas contrôle**
- Pas de tableau de bord parent séparé — éliminé
- Pas de reporting au parent (notifications, stats de brossage)
- Compte parent = conteneur de sauvegarde uniquement
- La progression appartient à l'enfant, il la montre par fierté (pas le parent qui la consulte)

**[Décision #3] : Le Design = séquence temporelle en 3 états**
- Avant : narration vocale, mise en scène de l'épisode
- Pendant : visuel progressif seul (bouche et main occupées)
- Après : micro-célébration simple + accroche narrative

---

### Nouvelle idée capturée

**[Design #26] : La Micro-Célébration**
*Concept :* Animation simple et identique à la fin de chaque épisode ordinaire. Marque la complétion immédiate, récompense le geste, sans en faire trop. Distincte de `[Célébration #13]` réservée aux fins d'univers.
*Nouveauté :* Deux niveaux de célébration calibrés — quotidien (discret) vs milestone (mémorable). Évite l'inflation de récompense.

---

### Mind Map complet

```
BrossQuest
│
├── 🎮 Le Moteur (pont entre les deux clients)
│   ├── Détection sonore binaire (Web Audio API)
│   ├── 3 états : brossage / voix / silence
│   ├── Brossage = moteur narratif (pas un timer)
│   └── Compatible manuel + électrique
│
├── 📖 L'Aventure (critique côté enfant)
│   ├── Épisodes quotidiens de 2 min
│   ├── Deux tons : matin énergisant / soir apaisant
│   ├── Univers débloquables (progression méta)
│   ├── Bienveillance totale — aucune pénalité
│   └── Curiosité narrative comme moteur de retour
│
├── 🎨 Le Design (séquence temporelle en 3 états)
│   ├── Avant  → narration vocale + mise en scène
│   ├── Pendant → visuel progressif seul, une main libre
│   ├── Après  → micro-célébration simple (quotidien)
│   │            + célébration mémorable (fin d'univers)
│   └── 100% pictographique, zéro texte requis
│
├── 👨‍👩‍👧 La Famille (continuité, pas contrôle)
│   ├── Compte parent → conteneur de sauvegarde
│   ├── Profils enfants → identité persistante, sans mdp
│   └── Progression → appartient à l'enfant, partageable par lui
│
└── ⚙️ La Tech (implémentation du Moteur)
    ├── PWA offline-first
    ├── Web Audio API
    ├── IndexedDB + Service Worker
    └── Backend minimal (sync uniquement)
```

---

### Principes de design mis à jour

1. **Le brossage est le moteur** — pas un timer à surveiller
2. **Deux clients, deux motivations** — Le Moteur sert le parent, L'Aventure sert l'enfant
3. **Le Design est une séquence** — trois états distincts en 2-3 minutes
4. **Deux niveaux de célébration** — quotidien (discret) et milestone (mémorable)
5. **La Famille = confiance, pas contrôle** — pas de reporting, progression partagée par fierté
6. **Backend minimal** — sync uniquement, pas de tracking comportemental

---

## Phase 3 — Développement (SCAMPER Method)

**10 idées + 3 contraintes supplémentaires — session terminée (2026-03-24)**

### S — Substituer

**[Vision #27] : Le Mode Visuel**
*Concept :* Alternative au micro via caméra frontale. MediaPipe Hands détecte la main dans la zone bouche + mouvement oscillatoire = brossage. Traitement 100% on-device, aucune donnée transmise. Le parent choisit le mode dans les réglages (Audio par défaut / Visuel opt-in). Le positionnement est naturel : le téléphone est déjà face à l'enfant pour l'écran.
*Nouveauté :* Élimine complètement la dépendance au son — utile pour les enfants hypersensibles au bruit, les brosses silencieuses, ou les environnements où le micro est gêné. Deux capteurs, une seule expérience enfant identique.

---

### C — Combiner

**[Contrainte #7] : Le Principe de Non-Addition**
*Concept :* BrossQuest ne combine pas avec d'autres routines ou apprentissages. La fenêtre d'attention de l'enfant est 100% dédiée au brossage. Tout ajout externe est un vecteur de déconcentration.
*Principe clé :* L'app résout un seul problème. Sa valeur vient de sa profondeur sur ce problème, pas de son étendue.

---

### A — Adapter

**[Rythme #28] : La Modulation**
*Concept :* Pendant les 2 minutes, le rythme narratif varie intentionnellement — ralentissement pour laisser l'enfant souffler, puis accélération soudaine qui l'incite à accélérer son geste physique en miroir. Inspiré des jeux de rythme : la variation maintient l'attention mieux qu'un tempo constant.
*Nouveauté :* Le rythme devient un outil de re-concentration actif, pas juste un fond sonore. L'enfant *sent* le changement de rythme dans sa main.

**[Narration #29] : Le Guidage Narratif par Zone**
*Concept :* Les quadrants dentaires sont intégrés dans la diégèse vocale. "On brosse les dents du haut à gauche du Dragon Malad." En parallèle, une carte dentaire discrète en coin d'écran surligne le quadrant actif — ancre visuelle qui fait le lien entre l'histoire et les vraies dents de l'enfant. La narration guide, la carte confirme.
*Nouveauté :* Double canal (auditif + visuel) sans redondance — la narration raconte, la carte schématise. L'enfant comprend que "les dents du Dragon" = ses propres dents. Déjà validé avec Marie.

**[Contrainte #8] : Densité Narrative ≠ Engagement Écran**
*Principe :* Toute technique narrative qui attire le regard vers l'écran est contre-productive. L'enfant regarde la carte dentaire, pas l'animation principale.

---

### M — Modifier

**[Narration #30] : L'Épisode Minuscule**
*Concept :* Chaque épisode est structuré narrativement comme "juste un tout petit bout" — une micro-scène avec une promesse immédiate. "On a juste le temps de voir si le dragon ouvre les yeux..." L'enfant perçoit 2 minutes comme un instant fugace, pas une durée à tenir.
*Nouveauté :* La brièveté perçue est un levier de concentration — l'enfant ne "tient pas" 2 minutes, il "finit juste ce petit bout." Cohérent avec le principe de non-distraction vers l'écran.

**[Onboarding #31] : Sign-In Social**
*Concept :* Connexion via compte Google ou Apple existant — zéro création de compte, zéro mot de passe à mémoriser. La progression est immédiatement liée à une identité cloud fiable. Multi-appareils natif dès le premier jour.
*Nouveauté :* Réduit la friction onboarding sans différer la persistance. Le parent utilise quelque chose qu'il a déjà.

**[Contrainte #9] : Onboarding Différé = Friction Amplifiée**
*Principe :* Ne pas différer la création de compte. Le jour du changement d'appareil, la friction de reconnexion serait plus grande que celle de la création initiale.

---

### P — Utiliser autrement

*Hors scope pour la v1 — la mécanique de détection sonore est générique mais BrossQuest reste focalisé sur le brossage.*

---

### É — Éliminer

**[Narration #32] : La Phrase de Lancement**
*Concept :* L'intro narrative est réduite à une seule phrase personnalisée avec le prénom. "C'est parti Lucas, on continue notre aventure pour..." — puis le brossage démarre immédiatement. Zéro histoire à écouter avant de commencer, mais un ancrage émotionnel immédiat.
*Nouveauté :* Le prénom fait le travail de toute une intro. Implication maximale, friction minimale.

**[Système #33] : Le Seuil Configurable Matin/Soir**
*Concept :* La distinction matin/soir est 100% automatique basée sur l'heure de lancement. Seuil par défaut à 17h, modifiable par le parent. Avant 17h = session matin, après 17h = session soir. Un brossage à 14h après le déjeuner compte comme session matin — aucune pénalité, aucune confusion.
*Nouveauté :* Résout le cas du brossage post-déjeuner sans règle arbitraire. Le parent adapte le seuil à son rythme familial. Déjà évoqué avec Marie — maintenant formalisé.

**[Décision #34] : La Collection Vivante**
*Concept :* Plusieurs univers distincts, chacun avec sa propre progression narrative indépendante. L'enfant choisit librement son univers à chaque session — médiéval aujourd'hui, maritime demain, médiéval après-demain. Chaque univers reprend exactement là où il a été laissé.
*Nouveauté :* Pas un déblocage linéaire forcé — une collection vivante que l'enfant habite à son rythme. La liberté de choix quotidien renforce l'implication sans jamais créer de perte.

---

### R — Réorganiser / Inverser

**[Narration #35] : L'Épisode Flashback**
*Concept :* De temps en temps, un épisode "souvenir" — le héros revit un moment clé des épisodes passés. L'enfant reconnaît la scène, ressent l'attachement à son parcours.
*Nouveauté :* Double bénéfice — renforce l'attachement narratif ET réduit la pression de production de nouveau contenu. Un épisode flashback = zéro nouvelle histoire à écrire.

**[Onboarding #36] : L'Emoji du Héros**
*Concept :* À l'onboarding, pendant que le parent crée le compte, l'enfant choisit un emoji associé à son prénom. Simple, visuel, immédiat. Cet emoji devient son identité dans l'app — sur l'écran de sélection de profil, dans les célébrations.
*Nouveauté :* Premier geste de personnalisation appartient à l'enfant, pas au parent. Implication émotionnelle dès le premier lancement.

---

### Principes de design mis à jour

1. **Le brossage est le moteur** — pas un timer à surveiller
2. **Deux clients, deux motivations** — Le Moteur sert le parent, L'Aventure sert l'enfant
3. **Le Design est une séquence** — trois états distincts en 2-3 minutes
4. **Deux niveaux de célébration** — quotidien (discret) et milestone (mémorable)
5. **La Famille = confiance, pas contrôle** — pas de reporting, progression partagée par fierté
6. **Backend minimal** — sync uniquement, pas de tracking comportemental
7. **Focus absolu** — BrossQuest résout un seul problème, en profondeur
8. **Deux modes de détection** — Audio (défaut) / Visuel opt-in, même expérience enfant
9. **Narration calibrée** — brièveté perçue, pas de tension frustrante, rythme variable
10. **Collection vivante** — univers multiples, progression indépendante, liberté de choix quotidien

---

## Phase 4 — Planification (Solution Matrix)

**8 idées + 3 contraintes — session terminée (2026-03-24)**

### Décision fondatrice : Le Vrai Signal

**[Détection #37] : Le Vrai Signal**
*Concept :* Le mode Audio détecte la présence d'une brosse électrique allumée, pas le mouvement réel. Le mode Visuel (MediaPipe Hands) détecte le mouvement oscillatoire de la main dans la zone bouche — ce qui valide un brossage actif, pas juste un appareil en marche. C'est une différence fondamentale de ce qu'on mesure.
*Nouveauté :* Le mode Visuel n'est pas une alternative au mode Audio — c'est la seule solution qui résout le problème réel pour les utilisateurs de brosses électriques. Un enfant peut allumer sa brosse électrique, la mettre dans la bouche et regarder l'écran sans bouger. Le Visuel seul détecte ce cas.

**[Décision #38] : Visuel en V1, Audio en V2**
*Concept :* V1 se concentre exclusivement sur la détection visuelle via MediaPipe Hands — mouvement oscillatoire de la main dans la zone bouche. C'est le cas d'usage dominant (brosse électrique) et la solution qui résout vraiment le problème. Le mode Audio (brosses manuelles) est une V2 distincte, avec ses propres défis techniques à résoudre proprement.
*Nouveauté :* Ce n'est pas une limitation — c'est un focus. BrossQuest V1 résout un problème précis pour un public précis, sans compromis technique.

---

### Contrainte #10 : Le Contexte Physique

**[Contrainte #10] : Le Contexte Physique**
*Concept :* Téléphone posé sur le rebord du lavabo face au miroir. L'enfant se tient debout devant, à hauteur naturelle de l'écran. La caméra frontale capte la scène de face, à 40-70cm. MediaPipe Hands n'a pas besoin de chercher — la main qui brosse passe naturellement dans le champ.
*Principe clé :* Le setup physique est déjà optimal. Aucune instruction de positionnement complexe n'est nécessaire — l'enfant se met là où il se met toujours.

---

### La Séquence de Brossage

**[UX #39] : Le Lancement Sans Friction**
*Concept :* Détection de présence via la caméra — quand un visage/une silhouette entre dans le champ, l'app propose visuellement de démarrer avec un grand bouton animé pulsant. L'enfant peut toucher l'écran ou simplement attendre 3 secondes pour que ça parte automatiquement.
*Nouveauté :* Zéro friction de lancement pour des mains qui vont bientôt être occupées. L'app accueille l'enfant, pas l'inverse.

**[UX #40] : Le Fondu de Calibration**
*Concept :* Au lancement de la session, le flux caméra est visible 3-5 secondes — l'enfant se voit, ajuste sa position naturellement, l'app valide le cadrage (main détectable). Puis le flux s'estompe progressivement pour laisser place à l'animation. La caméra continue de tourner et détecter en arrière-plan — seul l'affichage disparaît.
*Nouveauté :* La calibration n'est pas une étape technique contraignante — c'est un moment ludique ("tu te vois ?") avant que la magie commence. L'enfant comprend intuitivement ce qu'on attend de lui sans instruction.

**[Contrainte #11] : Le Silence du Brossage**
*Concept :* Pendant les 2 minutes actives, l'expérience est 100% visuelle. Zéro narration vocale, zéro son d'instruction. Une brosse électrique dans la bouche = oreilles partiellement masquées + risque d'arrêt pour écouter. L'audio est réservé au "Avant" (mise en scène de l'épisode) et au "Après" (micro-célébration).
*Principe clé :* La séquence temporelle est maintenant claire : **Avant = audio + visuel / Pendant = visuel seul / Après = audio + visuel.**

**[Design #41] : L'Animation Évocatrice**
*Concept :* Les visuels des univers ne représentent jamais précisément l'objet — ils l'évoquent. Une masse sombre qui pulse légèrement = un dragon endormi. Des formes géométriques qui s'assemblent = un château. Une tache lumineuse qui grossit = une planète. Le cerveau de l'enfant complète l'image — son imagination fait le travail, l'écran ne fait que suggérer.
*Nouveauté :* L'abstraction est une décision de design délibérée, pas un compromis technique. Ce qui est flou invite à regarder moins longtemps et à imaginer plus. L'enfant brosse, son cerveau joue.

**[Design #42] : L'Animation-Guide de Zone**
*Concept :* La forme abstraite se déplace sur l'écran pour indiquer le quadrant actif — haut gauche, haut droite, bas gauche, bas droite. Le mouvement est lent, naturel, diégétique ("le dragon tourne la tête"). Pas de carte dentaire explicite, pas de schéma — juste une présence qui migre doucement d'une zone à l'autre. L'enfant suit le mouvement avec sa brosse sans s'en rendre compte.
*Nouveauté :* La guidance dentaire est encodée dans le comportement de l'animation, pas dans une interface séparée. Zéro charge cognitive — l'enfant imite un mouvement, il ne lit pas une instruction.

---

### Progression et Onboarding

**[Décision #43] : Deux Niveaux de Progression**
*Concept :* La **Collection** est le niveau méta — l'enfant choisit son univers du jour (Forêt, Océan, Espace...). La **Série** est le niveau narratif — chaque univers a sa propre séquence d'épisodes qui avance exactement là où elle a été laissée. Le choix quotidien de collection est un acte d'agentivité qui précède le brossage. La série crée l'attachement et le désir de revenir.
*Nouveauté :* L'enfant est acteur à deux niveaux — il décide *où* il va (collection), puis il est embarqué (série). La motivation extrinsèque (choix) déclenche la motivation intrinsèque (curiosité narrative).

**[Onboarding #44] : Le Passage de Main**
*Concept :* Onboarding en une session, deux moments distincts. Moment parent : sign-in social (Google/Apple) + saisie du prénom de l'enfant — rapide, textuel, sobre. Moment enfant : l'écran bascule en mode pictographique, l'enfant choisit son emoji parmi une sélection. C'est son premier geste dans l'app, avant même le premier brossage. L'emoji est modifiable à tout moment depuis le profil — ce qui permet au parent de tester l'app seul et de faire le choix avec l'enfant plus tard.
*Nouveauté :* Le passage de main est un rituel d'entrée. L'enfant n'hérite pas d'un compte configuré par son parent — il prend possession de son univers dès le premier instant.

---

### Séquence complète BrossQuest V1

```
AVANT (10-15s)
  → App détecte la présence → bouton pulsant
  → Narration vocale courte + animation de mise en scène
  → "[Prénom], c'est parti — le dragon t'attend..."
  → Flux caméra visible 3-5s (calibration naturelle)

PENDANT (2 min) — VISUEL UNIQUEMENT
  → Flux caméra s'estompe
  → Forme abstraite évocatrice apparaît
  → Mouvement de zone ×4 quadrants (30s chacun)
  → Aucun son, aucune instruction

APRÈS (5-10s)
  → Micro-célébration visuelle + son de victoire
  → Accroche narrative courte ("demain on découvre...")
```

---

## Solution Matrix — Configuration V1

| Dimension | Décision |
|---|---|
| **Détection** | Visuel (MediaPipe Hands) — défaut unique V1 |
| **Séquence** | Avant (audio+visuel) / Pendant (visuel seul) / Après (audio+visuel) |
| **Calibration** | Flux caméra 3-5s → fondu → animation |
| **Animation** | Abstraite, évocatrice, mouvement de zone (4 quadrants) |
| **Progression** | Collection (choix quotidien) + Série (épisodes séquentiels) |
| **Onboarding** | Sign-in social → prénom → passage de main → emoji enfant |
| **Compte** | Multi-profils enfants, emoji modifiable, progression cloud |
| **Philosophie** | Zéro punition, zéro notification, bienveillance totale |
| **Scope V1** | Brosse électrique, mode visuel uniquement |
| **V2** | Mode audio (brosses manuelles) |

---

## Organisation thématique — Session complète (44 idées)

### Thème 1 : Le Moteur de Détection
*La décision architecturale centrale.*
- #27 Le Mode Visuel → #37 Le Vrai Signal → #38 Visuel V1 / Audio V2
- Contraintes #2 (brosse électrique), #10 (contexte physique lavabo)
- **Breakthrough :** Le mode Audio ne résout pas le vrai problème (brosse allumée ≠ brossage actif). Le Visuel est le seul signal valide pour la brosse électrique.

### Thème 2 : La Séquence de Brossage
*L'expérience enfant en 3 états temporels distincts.*
- #39 Lancement sans friction → #40 Fondu de calibration → #41 Animation évocatrice → #42 Animation-guide de zone → #26 Micro-célébration → #13 Fin de Monde
- Contraintes #11 (silence du brossage), #8 (densité narrative ≠ engagement écran)
- **Breakthrough :** Pendant = visuel seul. L'audio crée un conflit cognitif avec une brosse électrique en bouche.

### Thème 3 : La Narration et les Univers
*Ce qui donne envie de revenir chaque soir.*
- #8 La Série → #9 Matin/Soir → #10 Les Mondes → #11 Deux couches indépendantes → #30 L'Épisode Minuscule → #35 L'Épisode Flashback
- #16 Voix de l'Aventure → #29 Guidage narratif → #32 Phrase de lancement → #28 La Modulation
- **Breakthrough :** La brièveté perçue ("juste ce petit bout") est un levier actif de concentration, pas une contrainte.

### Thème 4 : La Progression et la Collection
*Deux niveaux d'implication de l'enfant.*
- #34 La Collection Vivante → #43 Deux niveaux de progression → #25 Changement d'univers en cours
- #12 L'Aventure Patiente → #24 Récompense Pure → Contrainte #6 (anti-farming)
- **Breakthrough :** Le choix quotidien de collection est un acte d'agentivité qui précède et motive le brossage.

### Thème 5 : L'Architecture Famille
*Compte, profils, onboarding.*
- #15 Rôle du Parent → #20 Modèle Famille → #31 Sign-In Social → #36 Emoji du Héros → #44 Le Passage de Main
- #19 Les Deux Demi-Journées → #33 Seuil configurable → Décision #2 (Famille = continuité, pas contrôle)
- Contrainte #9 (onboarding différé = friction amplifiée)
- **Breakthrough :** Le passage de main parent→enfant pendant l'onboarding est un rituel d'entrée — l'enfant prend possession de son univers dès le premier instant.

### Thème 6 : Philosophie et Principes
*Les règles implicites qui font que BrossQuest dure.*
- #24 Récompense Pure, #12 Aventure Patiente, Contrainte #7 (non-addition), Contrainte #5 (zéro texte)
- Décision #2 (Famille = continuité, pas contrôle), #17 Interface Pictographique

### Thème 7 : Stack Technique
- #23 PWA offline-first + IndexedDB + Service Worker
- #37 MediaPipe Hands (on-device, aucune donnée transmise)
- #33 Seuil matin/soir configurable

---

## Priorités V1

**Top 3 — Non négociables :**
1. **Détection visuelle (MediaPipe Hands)** — valeur différenciante absolue
2. **Séquence Avant/Pendant/Après avec animation abstraite guidante** — l'expérience cœur
3. **Collection + Série + Onboarding avec passage de main** — rétention et implication

**Quick wins :**
- Seuil matin/soir configurable (#33)
- Phrase de lancement avec prénom (#32)
- Micro-célébration discrète (#26)

**Déféré en V2 :**
- Mode Audio (brosses manuelles)

---

## Principes de design finaux

1. **Le brossage est le moteur** — pas un timer à surveiller
2. **Le Visuel valide le vrai geste** — brosse allumée ≠ brossage actif
3. **Deux clients, deux motivations** — Le Moteur sert le parent, L'Aventure sert l'enfant
4. **La séquence est sacrée** — Avant (audio+visuel) / Pendant (visuel seul) / Après (audio+visuel)
5. **L'abstraction est intentionnelle** — évocation > représentation, imagination > distraction
6. **Deux niveaux de progression** — Collection (agentivité) + Série (attachement narratif)
7. **Bienveillance totale** — zéro punition, zéro notification, zéro pression
8. **Le passage de main** — l'enfant prend possession de l'app dès l'onboarding
9. **Focus absolu** — BrossQuest résout un seul problème, en profondeur
10. **Backend minimal** — sync uniquement, aucun tracking comportemental
