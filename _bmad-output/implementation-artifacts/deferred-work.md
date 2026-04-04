# Travail différé (file d'attente)

## Deferred from: code review (2026-04-02) — 3-2-lancement-session-integration-camera-getusermedia-ios.md

- **Aucun arrêt explicite des tracks** (`stopSessionCamera`) à la sortie de `/session` : à traiter quand le flux de fin / navigation hors session sera défini (risque de caméra active tant que la page reste chargée).
- **`PWA_WORKBOX_NO_TERSER` dans `vite.config.ts`** : contournement CI/sandbox pour Workbox ; à réévaluer dans l’epic PWA / pipeline qualité.

## Deferred from: code review of 3-4-nebulacanvas-animation-nebuleuse-8-zones.md (2026-04-04)

- **Sprint status 3-3 → `done` dans le même lot que 3-4** : confirmer en revue produit que la story 3-3 est réellement terminée et que le statut sprint est intentionnel.
- **NFR-P4 (≥ 30 fps iPhone SE 2)** : aucun test ou budget perf automatisé pour `NebulaCanvas` ; validation matérielle ou instrumentation à prévoir (hors scope du diff actuel).
