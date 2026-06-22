/**
 * Storage keys used by the persistence layer.
 * All scoped under a common prefix to avoid collisions.
 */
export const STORAGE_PREFIX = "adab_quest";

export const STORAGE_KEYS = {
  /** Main game store (versioned). */
  store: `${STORAGE_PREFIX}_store`,
  /** Backup taken automatically before each migration. */
  migrationBackup: `${STORAGE_PREFIX}_migration_backup`,
  /** Last daily challenge date (per profile, keyed by profile id). */
  dailyChallenge: (profileId: string) => `${STORAGE_PREFIX}_daily_${profileId}`,
} as const;

/**
 * CURRENT DATA SCHEMA VERSION.
 *
 * Bump this whenever the Profile or GameStoreState shape changes
 * in a way that requires a data migration.
 *
 * Migration history:
 *   1 — Initial schema (2025-06-15).
 *   2 — Added difficulty upgrade fields (unlockedDifficulties, currentDifficulty, etc.)
 *   3 — Added gender field. Renamed sd-kecil→sd-bawah, sd-muda→sd-atas.
 *   4 — Added difficulty completion rewards (stage 500 final reward system).
 *   5 — Added DailyAdabChecklistItem status enum, parent validation flow fields.
 *   6 — Added completedCount & firstCompletedAt to MissionProgress (replay 1/4 reward).
 *   7 — Migrate DailyAdabChecklist → DailyMissionAssignments; add dailyMissions to store.
 */
export const CURRENT_VERSION = 7;
