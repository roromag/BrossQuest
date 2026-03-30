# Story 2.2 : Demande et gestion de la permission caméra

**Epic :** 2 — Onboarding parent & passage de main
**Story ID :** 2.2
**Story Key :** `2-2-demande-gestion-permission-camera`
**Status :** review
**Date :** 2026-03-29

---

## Story

As a parent,
I want comprendre pourquoi l'app a besoin de la caméra et l'autoriser facilement,
So that la session de brossage puisse détecter le geste de mon enfant.

---

## Acceptance Criteria

**Scénario 1 — Explication précédant la demande**
**Given** le profil enfant créé (Story 2.1) et l'onboarding en étape `'camera'`
**When** l'écran `CameraStep` s'affiche
**Then** une explication en une phrase est visible ("La caméra analyse le mouvement localement. Rien n'est envoyé.")
**And** un bouton "Autoriser la caméra" déclenche la demande système

**Scénario 2 — Permission accordée**
**Given** le parent appuie sur "Autoriser la caméra"
**When** `getUserMedia({video:true})` retourne un stream
**Then** les tracks du stream sont immédiatement arrêtées (stream non utilisé ici)
**And** `useCameraStore.setPermissionState('granted')` est appelé
**And** le flux avance vers l'étape `'pwa'` (placeholder Story 2.3)

**Scénario 3 — Permission refusée (premier refus)**
**Given** le parent appuie sur "Autoriser la caméra"
**When** `getUserMedia` lève une `NotAllowedError`
**Then** `useCameraStore.setPermissionState('denied')` est appelé
**And** `PermissionRecovery` s'affiche avec des instructions contextuelles selon l'OS
**And** aucune couleur rouge vif n'est utilisée (`text-accent-erreur` interdit ici)
**And** l'écran n'est pas une modale bloquante — le parent peut retenter

**Scénario 4 — Flux de récupération**
**Given** `PermissionRecovery` est affiché
**When** le parent a réautorisé la caméra dans les Réglages et appuie sur "J'ai autorisé"
**Then** `getUserMedia({video:true})` est rappelé via `onRetry`
**And** si accordé → flux reprend normalement (étape `'pwa'`)
**And** si toujours refusé → `PermissionRecovery` reste affiché (pas d'erreur fatale)

**Scénario 5 — Permission déjà accordée**
**Given** le parent a déjà autorisé la caméra lors d'une session précédente
**When** `CameraStep` monte (useEffect)
**Then** `checkCameraPermission()` retourne `'granted'`
**And** `onComplete()` est appelé directement sans afficher l'explication

**Scénario 6 — CameraGuard post-onboarding**
**Given** `CameraGuard` est déjà câblé dans `beforeLoad` de `/home` et `/session` (story 1.2)
**When** la permission est `'denied'` au lancement de l'app
**Then** la redirection vers `/recovery/camera` est déjà opérationnelle
**And** `RecoveryCameraPage` doit afficher `PermissionRecovery` avec un `onRetry` qui recheck et navigue vers `/home`

---

## Tasks / Subtasks

- [x] T1 — Créer `src/components/onboarding/PermissionRecovery.tsx`
  - [x] Détecter l'OS via `navigator.userAgent` : iOS Safari vs Android Chrome vs autre
  - [x] Afficher les instructions numérotées selon l'OS
  - [x] Bouton "J'ai autorisé" → appelle `props.onRetry`
  - [x] Pas de rouge : utiliser `text-accent-ambre` pour le titre d'avertissement
  - [x] Respecter `min-h-[44px]` sur le bouton, `max-w-[390px]`

- [x] T2 — Créer `src/components/onboarding/PermissionRecovery.test.tsx`
  - [x] Test : affiche les instructions iOS si userAgent iOS Safari
  - [x] Test : affiche les instructions Android si userAgent Android
  - [x] Test : appelle `onRetry` au clic sur "J'ai autorisé"

- [x] T3 — Implémenter `CameraStep` dans `src/routes/onboarding.route.tsx`
  - [x] Remplacer `<div>Étape caméra — Story 2.2</div>` par le composant réel
  - [x] `useEffect` → `checkCameraPermission()` : si `'granted'` → appeler `onComplete` directement
  - [x] Si `'prompt'` : afficher explication + bouton "Autoriser la caméra"
  - [x] Si `'denied'` (depuis le check initial) : afficher `PermissionRecovery` directement
  - [x] Handler bouton : appeler `getUserMedia({video:true})` (contrainte iOS : dans le même event handler)
    - Success → stopper les tracks → `setPermissionState('granted')` → `onComplete()`
    - `NotAllowedError` → `setPermissionState('denied')` → afficher `PermissionRecovery`
  - [x] Exporter `CameraStep` en named export (même pattern que `NameStep`)
  - [x] Ajouter `step === 'pwa'` → `<div>Étape PWA — Story 2.3</div>` (placeholder)

- [x] T4 — Implémenter `src/routes/recovery.camera.route.tsx`
  - [x] Remplacer le placeholder par `PermissionRecovery`
  - [x] `onRetry` : appeler `getUserMedia({video:true})` → si accordé → `setPermissionState('granted')` → naviguer vers `/home` via `useNavigate`
  - [x] Si refusé → rester sur la page (PermissionRecovery reste visible)

- [x] T5 — Ajouter les tests `CameraStep` dans `src/routes/onboarding.route.test.tsx`
  - [x] Mock `checkCameraPermission` de `'../guards/CameraGuard'`
  - [x] Mock `navigator.mediaDevices.getUserMedia`
  - [x] Mock `useCameraStore`
  - [x] Test : si permission déjà `'granted'` → `onComplete` appelé sans bouton
  - [x] Test : si `'prompt'` → affiche le bouton + l'explication
  - [x] Test : clic bouton + getUserMedia success → `onComplete` appelé
  - [x] Test : clic bouton + getUserMedia NotAllowedError → PermissionRecovery affiché
  - [x] Test : OnboardingPage — après CameraStep accordé → texte `'PWA'` visible (placeholder 2.3)

- [x] T6 — Vérification
  - [x] `npm test` vert (tous les tests existants + nouveaux)
  - [x] `npm run build` sans erreur TypeScript strict

---

## Dev Notes

### Architecture des fichiers à modifier / créer

```
src/
├── components/
│   └── onboarding/                         ← NOUVEAU DOSSIER
│       ├── PermissionRecovery.tsx          ← CRÉER
│       └── PermissionRecovery.test.tsx     ← CRÉER
└── routes/
    ├── onboarding.route.tsx                ← MODIFIER (remplacer CameraStep placeholder)
    ├── onboarding.route.test.tsx           ← MODIFIER (ajouter tests CameraStep)
    └── recovery.camera.route.tsx           ← MODIFIER (remplacer placeholder)
```

**Aucun autre fichier à modifier** — `CameraGuard.tsx`, `useCameraStore.ts`, `router.ts`, `queries.ts` : déjà opérationnels.

---

### Contrainte iOS Safari P0 — getUserMedia obligatoire dans le même event handler

```typescript
// ✅ CORRECT — getUserMedia dans le click handler direct
async function handleRequestCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(t => t.stop()) // arrêter immédiatement, pas utilisé ici
    setPermissionState('granted')
    onComplete()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      setPermissionState('denied')
      setShowRecovery(true)
    }
  }
}

// ❌ INCORRECT — ne pas introduire d'asynchronicité avant getUserMedia
// setTimeout / async check / state update avant l'appel → permission ignorée sur iOS Safari
```

---

### Implémentation `CameraStep` dans `onboarding.route.tsx`

```typescript
import { checkCameraPermission } from '../guards/CameraGuard'
import { useCameraStore } from '../stores/useCameraStore'
import { PermissionRecovery } from '../components/onboarding/PermissionRecovery'

interface CameraStepProps {
  onComplete: () => void
}

export function CameraStep({ onComplete }: CameraStepProps) {
  const [status, setStatus] = useState<'checking' | 'explain' | 'denied'>('checking')
  const setPermissionState = useCameraStore(s => s.setPermissionState)

  useEffect(() => {
    checkCameraPermission().then((perm) => {
      if (perm === 'granted') {
        onComplete()
      } else if (perm === 'denied') {
        setPermissionState('denied')
        setStatus('denied')
      } else {
        setStatus('explain') // 'prompt' ou fallback
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      setPermissionState('granted')
      onComplete()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setPermissionState('denied')
        setStatus('denied')
      }
    }
  }

  if (status === 'checking') return null // bref flash — acceptable

  if (status === 'denied') {
    return <PermissionRecovery onRetry={handleRequest} />
  }

  // status === 'explain'
  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-10">
        <h1 className="text-2xl font-bold text-[#EDF2F7]">
          Autoriser la caméra
        </h1>
        <p className="text-sm text-[#A0AEC0]">
          La caméra analyse le mouvement localement. Rien n'est envoyé.
        </p>
        <button
          type="button"
          onClick={handleRequest}
          className="
            w-full rounded-3xl py-4
            bg-accent-cyan text-[#1E2A3A] font-semibold
            min-h-[56px] text-base
            transition-opacity
          "
        >
          Autoriser la caméra
        </button>
      </div>
    </div>
  )
}
```

**Dans `OnboardingPage` — mettre à jour le flux :**

```typescript
type OnboardingStep = 'name' | 'camera' | 'pwa'

function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('name')
  const setProfile = useProfileStore(s => s.setProfile)

  if (step === 'name') {
    return (
      <NameStep
        onComplete={(profile) => {
          setProfile(profile)
          setStep('camera')
        }}
      />
    )
  }

  if (step === 'camera') {
    return <CameraStep onComplete={() => setStep('pwa')} />
  }

  if (step === 'pwa') {
    return <div>Étape PWA — Story 2.3</div>
  }

  return null
}
```

---

### Implémentation `PermissionRecovery.tsx`

```typescript
// src/components/onboarding/PermissionRecovery.tsx

interface PermissionRecoveryProps {
  onRetry: () => void
}

function detectOS(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

const INSTRUCTIONS = {
  ios: [
    'Ouvre "Réglages" sur ton iPhone',
    'Descends jusqu\'à Safari',
    'Appuie sur "Caméra" → sélectionne "Autoriser"',
    'Reviens sur cette page',
  ],
  android: [
    'Appuie sur l\'icône cadenas dans la barre d\'adresse',
    'Appuie sur "Autorisations"',
    'Active "Caméra"',
    'Recharge la page',
  ],
  other: [
    'Autorise la caméra dans les paramètres de ton navigateur',
    'Reviens sur cette page',
  ],
}

export function PermissionRecovery({ onRetry }: PermissionRecoveryProps) {
  const os = detectOS()
  const steps = INSTRUCTIONS[os]

  return (
    <div className="min-h-screen bg-bg-parent flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#EDF2F7] mb-2">
            Accès à la caméra nécessaire
          </h1>
          <p className="text-sm text-accent-ambre">
            La caméra est requise pour détecter le brossage de ton enfant.
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="text-accent-cyan font-bold min-w-[1.5rem]">{i + 1}.</span>
              <span className="text-sm text-[#EDF2F7]">{step}</span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onRetry}
          className="
            w-full rounded-3xl py-4
            bg-accent-cyan text-[#1E2A3A] font-semibold
            min-h-[56px] text-base
            transition-opacity
          "
        >
          J'ai autorisé
        </button>
      </div>
    </div>
  )
}
```

---

### Implémentation `recovery.camera.route.tsx`

```typescript
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { useNavigate } from '@tanstack/react-router'
import { PermissionRecovery } from '../components/onboarding/PermissionRecovery'
import { useCameraStore } from '../stores/useCameraStore'

function RecoveryCameraPage() {
  const navigate = useNavigate()
  const setPermissionState = useCameraStore(s => s.setPermissionState)

  const handleRetry = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(t => t.stop())
      setPermissionState('granted')
      navigate({ to: '/home' })
    } catch {
      // Toujours refusé — PermissionRecovery reste affiché (pas de changement d'état)
    }
  }

  return <PermissionRecovery onRetry={handleRetry} />
}

export const recoveryCameraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recovery/camera',
  component: RecoveryCameraPage,
})
```

---

### Tests — Patterns de mock

**Mock `checkCameraPermission` et `getUserMedia` :**

```typescript
// Dans onboarding.route.test.tsx — à ajouter en haut du fichier
vi.mock('../guards/CameraGuard', () => ({
  checkCameraPermission: vi.fn().mockResolvedValue('prompt'),
}))

const mockSetPermissionState = vi.fn()
vi.mock('../stores/useCameraStore', () => ({
  useCameraStore: vi.fn((selector: (s: { setPermissionState: typeof mockSetPermissionState }) => unknown) =>
    selector({ setPermissionState: mockSetPermissionState })
  ),
}))

// Dans beforeEach ou au début du test :
Object.defineProperty(navigator, 'mediaDevices', {
  value: { getUserMedia: vi.fn() },
  configurable: true,
})
```

**Tests `CameraStep` à ajouter :**

```typescript
describe('CameraStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('appelle onComplete immédiatement si permission déjà accordée', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('granted')
    const onComplete = vi.fn()
    render(<CameraStep onComplete={onComplete} />)
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())
  })

  it('affiche le bouton autoriser si permission en attente', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    render(<CameraStep onComplete={vi.fn()} />)
    expect(await screen.findByRole('button', { name: /autoriser la caméra/i })).toBeInTheDocument()
  })

  it('appelle onComplete après getUserMedia success', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    const mockStream = { getTracks: () => [{ stop: vi.fn() }] }
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValue(mockStream as unknown as MediaStream)
    const onComplete = vi.fn()
    render(<CameraStep onComplete={onComplete} />)
    await userEvent.click(await screen.findByRole('button', { name: /autoriser la caméra/i }))
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce())
    expect(mockSetPermissionState).toHaveBeenCalledWith('granted')
  })

  it('affiche PermissionRecovery si getUserMedia échoue', async () => {
    const { checkCameraPermission } = await import('../guards/CameraGuard')
    vi.mocked(checkCameraPermission).mockResolvedValue('prompt')
    const error = new DOMException('Permission denied', 'NotAllowedError')
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(error)
    render(<CameraStep onComplete={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /autoriser la caméra/i }))
    expect(await screen.findByRole('button', { name: /j'ai autorisé/i })).toBeInTheDocument()
    expect(mockSetPermissionState).toHaveBeenCalledWith('denied')
  })
})
```

---

### Design tokens — Règle couleurs PermissionRecovery

| Usage | Token | Valeur | Règle |
|---|---|---|---|
| Fond | `bg-bg-parent` | #2D3748 | Standard onboarding parent |
| Titre | `text-[#EDF2F7]` | blanc doux | Standard |
| Avertissement | `text-accent-ambre` | #F6AD55 | ⚠️ Jamais `text-accent-erreur` |
| Numéros étapes | `text-accent-cyan` | #76E4F7 | Standard CTA |
| Bouton | `bg-accent-cyan text-[#1E2A3A]` | — | Standard CTA onboarding |

**`text-accent-erreur` (#FC8181) est réservé aux erreurs de formulaire côté parent (ex: prénom vide). Ne jamais l'utiliser dans `PermissionRecovery` — l'avertissement caméra n'est pas une erreur fatale.**

---

### Pièges à éviter absolument

- ❌ **Ne pas appeler `getUserMedia` hors d'un event handler** — contrainte iOS Safari P0 ; ne pas ajouter d'`await` ou de logique asynchrone entre le clic et l'appel `getUserMedia`
- ❌ **Ne pas oublier `stream.getTracks().forEach(t => t.stop())`** — sinon la caméra reste active (voyant rouge allumé)
- ❌ **Ne pas utiliser `navigator.permissions.query` comme gate définitif** — retourne `'prompt'` sur iOS même après révocation ; `getUserMedia` est la vraie vérification
- ❌ **Ne pas modifier `CameraGuard.tsx`** — `checkCameraPermission()` est déjà opérationnel et utilisé par `home.route.tsx`
- ❌ **Ne pas créer `src/components/camera/`** — le dossier correct est `src/components/onboarding/`
- ❌ **Ne pas utiliser `useProfileStore()` sans sélecteur** — toujours `useCameraStore(s => s.x)`
- ❌ **Ne pas implémenter la step PWA** — placeholder `<div>Étape PWA — Story 2.3</div>` uniquement

---

### Intelligence des stories précédentes

**De la Story 2.1 :**
- Pattern `NameStep` → `CameraStep` : même structure (named export, props `onComplete`, no internal navigation)
- `OnboardingPage` gère le state `step` avec `useState<OnboardingStep>`
- Tests co-localisés dans `onboarding.route.test.tsx` — ajouter les tests CameraStep dans ce fichier existant
- `useCameraStore(s => s.setPermissionState)` — sélecteur fin, jamais `useCameraStore()`
- `saveProfile` était dans queries.ts ; ici `checkCameraPermission` est dans `CameraGuard.tsx`
- Pattern `try/finally` pour les états de chargement — appliquer à `handleRequest` si besoin

**De l'Epic 1 :**
- `checkCameraPermission()` exportée depuis `src/guards/CameraGuard.tsx` — déjà utilisée par `home.route.tsx`
- `home.route.tsx` redirige vers `/recovery/camera` si `camPerm === 'denied'` — cette logique est **déjà en place**
- Basepath `/BrossQuest` dans `router.ts` — `useNavigate` dans `recovery.camera.route.tsx` ne pas inclure le basepath
- TypeScript strict actif — pas de `any`, typer correctement `MediaStream`

---

### Contexte cross-story

- **Story 2.3** implémentera l'étape `'pwa'` → ne mettre qu'un placeholder ici
- **Story 3.2** utilisera `getUserMedia` pour démarrer la vraie session — même contrainte iOS Safari
- **`PermissionRecovery`** sera réutilisé dans `recovery.camera.route.tsx` (déjà prévu dans cette story)

---

## Définition of Done

- [ ] `npm test` vert (tous les tests existants + nouveaux CameraStep + PermissionRecovery)
- [ ] `npm run build` sans erreur TypeScript strict
- [ ] `CameraStep` remplace le placeholder dans `onboarding.route.tsx`
- [ ] `PermissionRecovery` créé dans `src/components/onboarding/`
- [ ] `recovery.camera.route.tsx` utilise `PermissionRecovery`
- [ ] Instructions contextuelles iOS / Android dans `PermissionRecovery`
- [ ] Aucune couleur `text-accent-erreur` dans `PermissionRecovery`
- [ ] `getUserMedia` appelé exclusivement depuis un event handler direct (contrainte iOS)
- [ ] Les tracks du stream sont stoppées après vérification de la permission
- [ ] `useCameraStore` mis à jour avec le bon état permission
- [ ] `CameraStep` exporté en named export (pattern `NameStep`)

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun blocage — implémentation directe conforme aux specs.

### Completion Notes List

- `PermissionRecovery.tsx` créé dans `src/components/onboarding/` : détection iOS/Android/other via `navigator.userAgent`, instructions numérotées, couleur `text-accent-ambre` pour l'avertissement, jamais `text-accent-erreur`
- `CameraStep` exporté en named export depuis `onboarding.route.tsx` : useEffect → checkCameraPermission, `getUserMedia` appelé exclusivement depuis le click handler (contrainte iOS P0), tracks stoppées immédiatement, state machine `'checking' | 'explain' | 'denied'`
- `OnboardingPage` mis à jour : étape `'pwa'` ajoutée avec placeholder `<div>Étape PWA — Story 2.3</div>`
- `recovery.camera.route.tsx` remplace son placeholder par `PermissionRecovery` avec `onRetry` qui recheck via `getUserMedia` et navigue vers `/home` si accordé
- 72 tests passent (12 fichiers), build TypeScript strict sans erreur
- 2026-03-30 : Corrections code review — P-1 à P-9 adressés : gestion erreurs non-NotAllowedError, rejet checkCameraPermission, stale closure useRef, isRequesting guard, navigator.mediaDevices guard, cleanup unmount, tests RecoveryCameraPage, transition-opacity CSS, accessibilité ol — 89 tests verts, build OK (Dev Agent)

### File List

- `src/components/onboarding/PermissionRecovery.tsx` — CRÉÉ / MODIFIÉ (a11y, CSS)
- `src/components/onboarding/PermissionRecovery.test.tsx` — CRÉÉ
- `src/routes/onboarding.route.tsx` — MODIFIÉ
- `src/routes/onboarding.route.test.tsx` — MODIFIÉ
- `src/routes/recovery.camera.route.tsx` — MODIFIÉ (export, guard mediaDevices)
- `src/routes/recovery.camera.route.test.tsx` — CRÉÉ

---

## Change Log

- 2026-03-29 : Création story 2.2 — demande et gestion permission caméra (SM Agent)
- 2026-03-29 : Implémentation complète — PermissionRecovery, CameraStep, RecoveryCameraPage, 72 tests verts, build OK (Dev Agent)
- 2026-03-30 : Corrections post-review — 9 patches appliqués, 89 tests verts, build OK (Dev Agent)
