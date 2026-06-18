/**
 * Storage layer for TMT.
 *
 * Exports:
 *   storageService   — singleton StorageService instance (use for raw access)
 *   useGameStore     — React hook wrapping the service for components
 *   Types            — DebugExport, ProfileExport, VersionedStore
 */

export { StorageService, storageService } from "./service";
export type { StorageAdapter } from "./service";

export { CURRENT_VERSION, STORAGE_KEYS } from "./constants";
export { applyMigrations, MIGRATIONS } from "./migrations";

export type { DebugExport, ProfileExport, VersionedStore } from "./types";
