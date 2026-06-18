import type { MigrationFn } from "./types";
import type { GameStoreState } from "@/types";
import { CURRENT_VERSION } from "./constants";

/**
 * Registry of migration functions indexed by TARGET version.
 *
 * Example: if we add a "tutorialDone" field in v2, register:
 *   migrations[2] = (state) => ({ ...state, profiles: state.profiles.map(p => ({ ...p, tutorialDone: false })) });
 *
 * Migrations are applied **sequentially** from (current+1) to CURRENT_VERSION.
 * Each function receives the full GameStoreState and returns the migrated version.
 */
export const MIGRATIONS: Record<number, MigrationFn> = {
  // v1 is the initial schema — no migration needed from v0→v1 (fresh start).

  // v2: Add difficulty upgrade fields to all existing profiles
  2: (state) => ({
    ...state,
    profiles: state.profiles.map(p => ({
      ...p,
      unlockedDifficulties: p.unlockedDifficulties || [p.difficulty],
      currentDifficulty: p.currentDifficulty || p.difficulty,
      completedDifficulties: p.completedDifficulties || [],
      difficultyUpgradeAvailable: p.difficultyUpgradeAvailable ?? false,
    })),
  }),

  // v3: Add gender field. Rename difficulty sd-kecil→sd-bawah, sd-muda→sd-atas.
  3: (state) => {
    const migrateDifficulty = (d: string): string => {
      if (d === "sd-kecil") return "sd-bawah";
      if (d === "sd-muda") return "sd-atas";
      return d;
    };
    return {
      ...state,
      profiles: state.profiles.map(p => ({
        ...p,
        gender: (p as any).gender || "unspecified",
        difficulty: migrateDifficulty(p.difficulty) as any,
        currentDifficulty: migrateDifficulty(p.currentDifficulty || p.difficulty) as any,
        unlockedDifficulties: (p.unlockedDifficulties || [p.difficulty]).map(migrateDifficulty) as any,
        completedDifficulties: (p.completedDifficulties || []).map(migrateDifficulty) as any,
      })),
    };
  },
};

/**
 * Run all pending migrations on a GameStoreState.
 * Returns the migrated state.
 * Throws if a migration is missing (corrupted data).
 */
export function applyMigrations(state: GameStoreState, fromVersion: number): GameStoreState {
  let current = state;
  for (let v = fromVersion + 1; v <= CURRENT_VERSION; v++) {
    const migrate = MIGRATIONS[v];
    if (!migrate) {
      throw new Error(
        `[Storage] Missing migration for version ${v}. ` +
        `Current schema is ${CURRENT_VERSION}. Data may be corrupted.`,
      );
    }
    try {
      current = migrate(current);
    } catch (err) {
      throw new Error(
        `[Storage] Migration to v${v} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return current;
}
