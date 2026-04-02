# Travail différé (file d'attente)

## Deferred from: code review (2026-04-02) — 3-2-lancement-session-integration-camera-getusermedia-ios.md

- **Aucun arrêt explicite des tracks** (`stopSessionCamera`) à la sortie de `/session` : à traiter quand le flux de fin / navigation hors session sera défini (risque de caméra active tant que la page reste chargée).
- **`PWA_WORKBOX_NO_TERSER` dans `vite.config.ts`** : contournement CI/sandbox pour Workbox ; à réévaluer dans l’epic PWA / pipeline qualité.
