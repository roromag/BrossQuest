# Story 1.1 — Initialisation du projet et pipeline CI/CD

**Epic :** 1 — Fondation technique & Spike MediaPipe
**Story ID :** 1.1
**Story Key :** `1-1-initialisation-du-projet-et-pipeline-cicd`
**Status :** review
**Date :** 2026-03-26

---

## Dev Agent Record

### Statut de complétion
✅ **Implémenté le 2026-03-26** — Tous les critères d'acceptance satisfaits.

### Décision clé — Vite 7.3.1 (pas Vite 8)
`vite-plugin-pwa@1.2.0` (version stable) ne supporte que jusqu'à Vite 7 (`^3.1.0 || ... || ^7.0.0`). L'architecture mentionnait Vite 8, mais ce choix est incompatible avec vite-plugin-pwa. **Vite 7.3.1** a été utilisé — architecture.md mis à jour en conséquence.

### Versions réelles installées
- `vite`: 7.3.1
- `@vitejs/plugin-react`: 5.2.0 (supporte Vite 4–8)
- `vite-plugin-pwa`: 1.2.0
- `@tailwindcss/vite`: 4.2.2
- `vitest`: 4.1.1
- `@tanstack/react-router`: 1.168.3
- `dexie`: 4.3.0
- `zustand`: 5.0.12

### Vulnérabilités connues (non bloquantes)
4 high severity dans `serialize-javascript` via `workbox-build` (chaîne de build uniquement, pas en production). Le fix rétrograderait vers `vite-plugin-pwa@0.19.8` (API incompatible). À revisiter quand vite-plugin-pwa mettra à jour workbox.

### Résultats de validation
- `npm run build` : ✅ bundle `dist/` sans erreur TypeScript strict
- `npm test` : ✅ 2/2 tests passés
- Service Worker généré : ✅ `dist/sw.js` + `dist/workbox-*.js`

---

## User Story

**As a** développeur,
**I want** initialiser le projet BrossQuest avec la stack définie et le déploiement automatique,
**So that** disposer d'une base de code opérationnelle déployée sur GitHub Pages dès le premier commit.

---

## Critères d'Acceptance (BDD)

**Scénario 1 — Démarrage local**
**Given** un dépôt GitHub vide
**When** le développeur exécute les commandes d'initialisation complètes (voir section Implémentation)
**Then** `npm run dev` démarre l'app sans erreur et affiche un écran par défaut

**Scénario 2 — Build TypeScript strict**
**Given** le projet initialisé
**When** `npm run build` est exécuté
**Then** le build produit un bundle statique dans `dist/` sans erreur TypeScript strict
**And** aucun `any` implicite n'est présent

**Scénario 3 — Déploiement automatique**
**Given** un push sur la branche `main`
**When** le workflow GitHub Actions `deploy.yml` se déclenche
**Then** le build est déployé automatiquement sur GitHub Pages
**And** l'URL GitHub Pages est accessible et charge l'app

**Scénario 4 — Service Worker actif dès le premier déploiement**
**Given** `vite-plugin-pwa` configuré en mode `generateSW` minimal
**When** l'app est chargée depuis l'URL GitHub Pages
**Then** le Service Worker est enregistré et actif
**And** l'app est disponible offline après la première visite (vérifiable via DevTools → Application → Service Workers)

---

## Contexte Technique Critique

### Stack exacte à utiliser — NE PAS dévier

| Dimension | Décision | Version |
|---|---|---|
| Langage | TypeScript strict | ~5.x (inclus dans Vite template) |
| Bundler | Vite | **v7.3.1** — v8+ incompatible avec `vite-plugin-pwa@1.2.0` |
| Framework UI | React | 19.x (inclus dans template `react-ts`) |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` **4.2.2** |
| PWA / Service Worker | vite-plugin-pwa | **1.2.0** |
| State management | Zustand | **5.0.12** (⚠️ API v5 — voir note ci-dessous) |
| Routing | TanStack Router | **1.168.3** |
| Persistance | Dexie | **4.3.0** |
| Tests unitaires | Vitest | **4.1.1** |
| Tests composants | @testing-library/react | **16.3.2** |
| Node minimum | LTS | 20.19+ ou 22.12+ |

**⚠️ Zustand v5 — API différente de v4 :**
- `create` s'importe depuis `zustand` (pas `zustand/vanilla`)
- `persist` middleware dans `zustand/middleware`
- Pas de `immer` par défaut — installer séparément si besoin
- Story 1.3 définira les stores — se référer à cette note lors de la création

**⚠️ Tailwind v4 — Différence critique vs v3 :**
- Package : `tailwindcss` + `@tailwindcss/vite` (PAS `tailwindcss-postcss`)
- Import dans CSS : `@import "tailwindcss"` (PAS `@tailwind base/components/utilities`)
- Pas de `tailwind.config.js` en v4 (configuration en CSS via `@theme`)
- Plugin Vite natif : pas de `postcss.config.js` requis

---

## Séquence d'Implémentation

### Étape 1 — Initialisation Vite

```bash
npm create vite@latest brossquest -- --template react-ts
cd brossquest
npm install
```

### Étape 2 — Dépendances production

```bash
# Tailwind CSS v4 (plugin Vite natif)
npm install tailwindcss @tailwindcss/vite

# Routing
npm install @tanstack/react-router

# State management
npm install zustand

# Persistance IndexedDB
npm install dexie
```

### Étape 3 — Dépendances dev

```bash
# PWA + Service Worker (Workbox)
npm install -D vite-plugin-pwa

# Tests unitaires
npm install -D vitest@4.1.1 @testing-library/react@16.3.2 @testing-library/user-event jsdom
```

### Étape 4 — Configuration `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      // Configuration minimale pour Epic 1 — enrichie en Epic 5
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 Mo budget
      },
      manifest: {
        name: 'BrossQuest',
        short_name: 'BrossQuest',
        description: 'La quête du brossage pour les enfants',
        theme_color: '#1E2A3A',
        background_color: '#1E2A3A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  base: '/brossquest/', // ⚠️ Requis pour GitHub Pages (remplacer par le nom du repo exact)
})
```

### Étape 5 — Configuration `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

Créer `src/test-setup.ts` :
```typescript
import '@testing-library/jest-dom'
```

### Étape 6 — Import Tailwind v4 dans `src/index.css`

```css
@import "tailwindcss";

/* Tokens design BrossQuest — définis ici pour Epic 2+
   Pas besoin de les définir maintenant, placeholder commenté */
/* @theme {
  --color-bg-session: #1E2A3A;
  --color-bg-parent: #2D3748;
} */
```

### Étape 7 — `tsconfig.app.json` — TypeScript strict

S'assurer que ces options sont activées :
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Étape 8 — Structure de dossiers initiale

Créer les dossiers vides (avec `.gitkeep`) pour respecter l'architecture dès le départ :
```
src/
├── routes/
├── guards/
├── components/
│   ├── session/
│   ├── onboarding/
│   └── parent/
├── stores/
├── lib/
│   ├── mediapipe/
│   ├── db/
│   ├── speech/
│   └── sw/
├── constants/
└── types/
```

### Étape 9 — GitHub Actions `deploy.yml`

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**⚠️ Prérequis GitHub :** Dans Settings → Pages → Source, sélectionner "GitHub Actions" (pas "Deploy from a branch").

### Étape 10 — Icônes PWA

Créer des icônes placeholder dans `public/icons/` :
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

(Images simples pour déploiement initial — remplacées par assets graphiques réels en Epic 5)

Créer aussi le répertoire `public/mediapipe/` (vide pour l'instant — accueillera `hand_landmarker.task` en Story 1.4).

---

## Fichiers à Créer / Modifier

| Fichier | Action | Notes |
|---|---|---|
| `vite.config.ts` | Modifier | Remplacer le template par défaut |
| `vitest.config.ts` | Créer | Config test séparée |
| `src/index.css` | Modifier | Import Tailwind v4 |
| `src/test-setup.ts` | Créer | Setup Testing Library |
| `tsconfig.app.json` | Vérifier | Strict mode activé |
| `.github/workflows/deploy.yml` | Créer | CI/CD GitHub Pages |
| `public/icons/icon-192.png` | Créer | Placeholder |
| `public/icons/icon-512.png` | Créer | Placeholder |
| `public/mediapipe/` | Créer | Dossier vide (gitkeep) |
| `src/routes/` | Créer | Dossier vide (gitkeep) |
| `src/guards/` | Créer | Dossier vide (gitkeep) |
| `src/components/session/` | Créer | Dossier vide (gitkeep) |
| `src/components/onboarding/` | Créer | Dossier vide (gitkeep) |
| `src/components/parent/` | Créer | Dossier vide (gitkeep) |
| `src/stores/` | Créer | Dossier vide (gitkeep) |
| `src/lib/mediapipe/` | Créer | Dossier vide (gitkeep) |
| `src/lib/db/` | Créer | Dossier vide (gitkeep) |
| `src/lib/speech/` | Créer | Dossier vide (gitkeep) |
| `src/lib/sw/` | Créer | Dossier vide (gitkeep) |
| `src/constants/` | Créer | Dossier vide (gitkeep) |
| `src/types/` | Créer | Dossier vide (gitkeep) |

---

## Tests à Écrire

### Test de smoke (App.test.tsx)

```typescript
// src/App.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Test minimal — le contenu change en Story 1.2 (routing)
    expect(document.body).toBeDefined()
  })
})
```

**Objectif :** `npm test` passe au vert. Pas de coverage exigée pour cette story.

---

## Pièges à Éviter

### ❌ Tailwind v4 — Erreurs communes

```typescript
// ❌ NE PAS FAIRE — import PostCSS style (v3)
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// ✅ FAIRE — plugin Vite natif (v4)
import tailwindcss from '@tailwindcss/vite'
```

```css
/* ❌ NE PAS FAIRE — directives v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ FAIRE — import unique v4 */
@import "tailwindcss";
```

### ❌ Base URL GitHub Pages

```typescript
// ❌ NE PAS FAIRE — base URL absente
export default defineConfig({ plugins: [...] })

// ✅ FAIRE — base URL = nom exact du repo GitHub
export default defineConfig({
  plugins: [...],
  base: '/nom-du-repo/', // ex: '/brossquest/'
})
```

Sans `base`, les assets CSS/JS seront en 404 sur GitHub Pages.

### ❌ vite-plugin-pwa + vitest

```typescript
// Le plugin PWA interfère avec vitest — config séparée obligatoire
// vite.config.ts  ← inclut VitePWA()
// vitest.config.ts ← NE PAS inclure VitePWA()
```

### ❌ TanStack Router — ne pas configurer maintenant

Story 1.2 se charge du routing. En Story 1.1, laisser le composant App par défaut de Vite — ne pas introduire le router.

---

## Conventions de Nommage (à respecter dès maintenant)

| Convention | Usage | Exemple |
|---|---|---|
| PascalCase | Composants React | `App.tsx`, `NebulaCanvas.tsx` |
| camelCase | Hooks, utils, lib | `useSessionStore.ts` |
| kebab-case | Fichiers de routes | `session.route.tsx` |
| SCREAMING_SNAKE | Constantes globales | `ZONE_DURATION_MS` |

---

## Définition of Done

- [ ] `npm install` s'exécute sans erreur
- [ ] `npm run dev` démarre l'app sur `localhost:5173`
- [ ] `npm run build` produit `dist/` sans erreur TypeScript strict
- [ ] `npm test` passe au vert (smoke test App)
- [ ] Push sur `main` → workflow GitHub Actions vert → app accessible sur GitHub Pages
- [ ] Service Worker visible dans DevTools → Application → Service Workers sur GitHub Pages
- [ ] Tous les dossiers d'architecture créés (`src/routes/`, `src/guards/`, `src/components/session/`, etc.)
- [ ] Aucun `console.error` dans la console navigateur au chargement

---

## Dépendances

- **Prérequis :** Dépôt GitHub créé, Pages activé (Settings → Pages → Source: GitHub Actions)
- **Bloque :** Story 1.2 (routing TanStack), Story 1.3 (Dexie schema)

---

## Notes pour l'Agent Développeur

1. **Ne pas configurer TanStack Router** dans cette story — c'est la Story 1.2
2. **Ne pas créer le schéma Dexie** — c'est la Story 1.3
3. **Ne pas toucher à MediaPipe** — c'est la Story 1.4
4. **Garder `App.tsx` minimal** — un simple `<div>BrossQuest</div>` suffit pour valider le pipeline
5. **Le `base` dans `vite.config.ts` doit correspondre exactement** au nom du repo GitHub (sensible à la casse)
6. **vite-plugin-pwa v1.2.0** est la version stable actuelle — ne pas upgrader sans vérifier la compatibilité
