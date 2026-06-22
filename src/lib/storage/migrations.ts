import type { MigrationFn } from "./types";
import type { GameStoreState, DailyAdabItemStatus } from "@/types";
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

  // v4: Add difficulty completion reward fields (stage 500 system)
  4: (state) => ({
    ...state,
    difficultyCompletionRewards: (state as any).difficultyCompletionRewards || [],
    profiles: state.profiles.map(p => ({
      ...p,
      claimedFinalRewardsByDifficulty: (p as any).claimedFinalRewardsByDifficulty || {},
      pendingDifficultyUpgrade: (p as any).pendingDifficultyUpgrade || null,
      pendingFinalRewardDifficulty: (p as any).pendingFinalRewardDifficulty || null,
    })),
  }),

  // v5: Migrate DailyAdabChecklist items to new status enum fields + claimedStageRewardIds
  5: (state) => {
    const newProfiles = state.profiles.map(p => {
      const checklist = p.dailyAdabChecklist;
      if (!checklist) return { ...p, claimedStageRewardIds: (p as any).claimedStageRewardIds || [] };

      // Migrate items: old isChecked/isVerified → new status enum
      const migratedItems = checklist.items.map(item => {
        const oldItem = item as any;
        // Determine status from legacy fields
        let status: string = oldItem.status;
        if (!status) {
          if (oldItem.isVerified) {
            status = "approved_by_parent";
          } else if (oldItem.isChecked) {
            status = "checked_by_child";
          } else {
            status = "not_started";
          }
        }

        return {
          ...item,
          status: status as DailyAdabItemStatus,
          rewardGranted: oldItem.rewardGranted ?? (oldItem.isVerified === true),
          rewardGrantedAt: oldItem.rewardGrantedAt || (oldItem.isVerified ? oldItem.verifiedAt : undefined),
          approvedAt: oldItem.approvedAt || (oldItem.isVerified ? oldItem.verifiedAt : undefined),
          rejectedAt: oldItem.rejectedAt,
          parentNote: oldItem.parentNote,
          checkedAt: oldItem.checkedAt,
          verifiedAt: oldItem.verifiedAt,
        };
      });

      // Recalculate counts based on status
      const pendingCount = migratedItems.filter(i => i.status === "pending_parent_validation" || i.status === "checked_by_child").length;
      const approvedCount = migratedItems.filter(i => i.status === "approved_by_parent").length;
      const rejectedCount = migratedItems.filter(i => i.status === "rejected_by_parent").length;

      return {
        ...p,
        claimedStageRewardIds: (p as any).claimedStageRewardIds || [],
        dailyAdabChecklist: {
          ...checklist,
          items: migratedItems,
          pendingValidationCount: checklist.pendingValidationCount ?? pendingCount,
          approvedCount: checklist.approvedCount ?? approvedCount,
          rejectedCount: checklist.rejectedCount ?? rejectedCount,
          createdAt: checklist.createdAt || new Date().toISOString(),
          updatedAt: checklist.updatedAt || new Date().toISOString(),
        },
      };
    });
    return { ...state, profiles: newProfiles };
  },

  // v6: Add completedCount & firstCompletedAt to MissionProgress entries
  6: (state) => ({
    ...state,
    profiles: state.profiles.map(p => {
      const migratedProgress: Record<string, any> = {};
      for (const [id, mp] of Object.entries(p.missionProgress || {})) {
        const old = mp as any;
        const wasCompleted = (old.stars ?? 0) > 0;
        migratedProgress[id] = {
          ...old,
          completedCount: old.completedCount ?? (wasCompleted ? 1 : 0),
          firstCompletedAt: old.firstCompletedAt ?? (wasCompleted ? (old.completedAt ?? 0) : 0),
        };
      }
      return {
        ...p,
        missionProgress: migratedProgress,
      };
    }),
  }),

  // v7: Migrate DailyAdabChecklist → DailyMissionAssignments
  7: (state) => {
    const newProfiles = state.profiles.map(p => {
      const oldChecklist = p.dailyAdabChecklist;
      if (!oldChecklist) {
        return {
          ...p,
          dailyMissionAssignments: p.dailyMissionAssignments || [],
          dailyMissionRewardLedger: p.dailyMissionRewardLedger || [],
        };
      }

      // Migrate old checklist items to new assignment format
      const migratedAssignments = (p.dailyMissionAssignments || []).slice();
      const existingIds = new Set(migratedAssignments.map(a => a.id));

      for (const item of oldChecklist.items || []) {
        const newId = `migrated-${oldChecklist.date}-${item.id}`;
        if (existingIds.has(newId)) continue;

        // Map old status to new status
        let status: "not_started" | "pending_parent_validation" | "approved_by_parent" | "rejected_by_parent" = "not_started";
        if (item.status === "pending_parent_validation" || item.status === "checked_by_child") {
          status = "pending_parent_validation";
        } else if (item.status === "approved_by_parent") {
          status = "approved_by_parent";
        } else if (item.status === "rejected_by_parent") {
          status = "rejected_by_parent";
        }

        migratedAssignments.push({
          id: newId,
          missionId: `legacy-adab-${item.id}`,
          profileId: p.id,
          date: oldChecklist.date,
          title: item.title,
          description: item.description || "",
          category: "adab" as any,
          points: 20,
          status,
          checkedAt: item.checkedAt || undefined,
          approvedAt: item.approvedAt || undefined,
          rejectedAt: item.rejectedAt || undefined,
          parentNote: item.parentNote || undefined,
          rewardGranted: item.rewardGranted || (status === "approved_by_parent"),
          rewardGrantedAt: item.rewardGrantedAt || item.approvedAt || undefined,
          pointsAwarded: (status === "approved_by_parent") ? 20 : 0,
        });
      }

      // Migrate reward ledger if old checklist had claimed rewards
      const ledger = p.dailyMissionRewardLedger || [];
      if (oldChecklist.rewardClaimed && !ledger.some(e => e.date === oldChecklist.date && e.reason === "daily_bonus")) {
        ledger.push({
          id: `migrated-bonus-${oldChecklist.date}`,
          profileId: p.id,
          assignmentId: "__daily_bonus__",
          date: oldChecklist.date,
          points: 20,
          reason: "daily_bonus" as any,
          grantedAt: oldChecklist.updatedAt || oldChecklist.createdAt || new Date().toISOString(),
        });
      }

      // Migrate streak
      const oldStreak = oldChecklist.streak || p.adabStreak || 0;
      const dailyMissionStreak = p.dailyMissionStreak || {
        profileId: p.id,
        currentStreak: oldStreak,
        longestStreak: oldStreak,
        lastQualifiedDate: oldChecklist.date,
        streakRewardsClaimed: [] as number[],
      };

      return {
        ...p,
        dailyMissionAssignments: migratedAssignments,
        dailyMissionRewardLedger: ledger,
        dailyMissionStreak: {
          ...dailyMissionStreak,
          currentStreak: Math.max(dailyMissionStreak.currentStreak, oldStreak),
          longestStreak: Math.max(dailyMissionStreak.longestStreak, oldStreak),
        },
        // Keep old field for backward compat
        dailyAdabChecklist: p.dailyAdabChecklist,
      };
    });

    return {
      ...state,
      profiles: newProfiles,
      dailyMissions: (state as any).dailyMissions || [],
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
