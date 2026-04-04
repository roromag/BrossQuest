/** Nombre de zones dentaires (avant/arrière × quadrants). */
export const ZONE_COUNT = 8

/**
 * Durée cible par zone (epic 3). Story 3.5 remplacera ce timer par `zoneProgress` + MediaPipe.
 * En 3.4 : permet de valider visuellement la dérive du canvas quand `activeZone` change.
 */
export const ZONE_DURATION_MS = 15_000
