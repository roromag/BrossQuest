# BrossQuest

Application PWA d'aide au brossage de dents pour enfants.

> Projet en cours de conception — phase brainstorming initiale complète.

## Prérequis

- [Claude Code](https://claude.ai/code) installé et configuré
- BMAD v6.2.0 — [installer BMAD](https://bmad.dev) *(remplacer par la commande/URL exacte)*

## Reprendre le projet

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd brossquest
```

### 2. Réinstaller BMAD

Le dossier `_bmad/` contenant le framework est exclu du dépôt (voir `.gitignore`).
Réinstaller BMAD v6.2.0 dans le répertoire du projet :

```bash
# Remplacer par la commande d'installation BMAD réelle
npx bmad-method install
```

Les fichiers de configuration projet (`_bmad/bmm/config.yaml`) sont déjà versionnés — l'installeur les respectera.

### 3. Ouvrir avec Claude Code

```bash
claude .
```

### 4. Reprendre le workflow

La session brainstorming (Phase 1) est complète. Pour continuer en Phase 2 :

```
/bmad-brainstorming
```

Claude détectera la session existante et proposera de la reprendre à la Phase 2 (Mind Mapping).

---

## État du projet

| Phase | Statut | Fichier |
|-------|--------|---------|
| Brainstorming — Phase 1 (What If) | ✅ Complète | `_bmad-output/brainstorming/brainstorming-session-2026-03-23-1400.md` |
| Brainstorming — Phase 2 (Mind Mapping) | ⏳ À faire | — |
| Brainstorming — Phase 3 (SCAMPER) | ⏳ À faire | — |
| Brainstorming — Phase 4 (Solution Matrix) | ⏳ À faire | — |
| PRD | ⏳ À faire | — |
| Architecture | ⏳ À faire | — |

## Structure du dépôt

```
├── _bmad/
│   └── bmm/config.yaml          # Configuration projet BMAD
├── _bmad-output/
│   ├── brainstorming/           # Sessions brainstorming
│   ├── planning-artifacts/      # PRD, UX, Architecture (à venir)
│   └── implementation-artifacts/ # Stories, sprint plans (à venir)
├── .claude/
│   └── projects/.../memory/     # Contexte projet mémorisé par Claude
└── docs/                        # Documentation projet (à venir)
```
