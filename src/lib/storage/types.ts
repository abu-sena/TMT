import type { Profile, GameStoreState } from "@/types";
// Re-export GameStoreState for convenience
export type { GameStoreState };

/**
 * Top-level wrapper persisted to localStorage.
 * `version` enables safe schema migrations across app updates.
 */
export interface VersionedStore {
  /** Monotonic schema version. CURRENT_VERSION in constants.ts. */
  version: number;
  /** ISO timestamp of last successful save. */
  lastSaved: string;
  /** The actual game data. */
  data: GameStoreState;
}

/**
 * Debug / support snapshot — a full export of all local state.
 * Includes version info so support can reproduce issues.
 */
export interface DebugExport {
  exportedAt: string;
  appName: string;
  schemaVersion: number;
  store: VersionedStore;
}

/**
 * Signature for a migration step.
 * Receives the data as-is and returns the migrated data.
 */
export type MigrationFn = (state: GameStoreState) => GameStoreState;

/**
 * Profile-level progress snapshot (for per-profile export).
 */
export interface ProfileExport {
  exportedAt: string;
  profileId: string;
  profileName: string;
  data: Profile;
}
