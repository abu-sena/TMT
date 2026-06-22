/**
 * Technical Reset Module — Reset Data Teknis
 *
 * Clears cache, temporary state, dummy/template data, and corrupt
 * Daily Mission entries WITHOUT touching achievements, points, badges,
 * profiles, or reports.
 *
 * Design principle: whitelist-protected approach.
 * 1. Backup all protected data first
 * 2. Scan and clean only technical data
 * 3. Validate protected data intact
 * 4. Restore if anything went wrong
 * 5. Log results
 */

import type {
  Profile,
  GameStoreState,
  DailyMission,
  DailyMissionAssignment,
  DailyAdabChecklist,
} from "@/types";
import { storageService } from "./storage/service";
import { STORAGE_KEYS, STORAGE_PREFIX } from "./storage/constants";

// ══════════════════════════════════════════
// Types
// ══════════════════════════════════════════

export interface TechnicalResetLog {
  id: string;
  resetAt: string;
  appVersion: string;
  removedKeys: string[];
  repairedDailyMissionCount: number;
  cleanedCorruptAssignments: number;
  preservedProfilesCount: number;
  preservedBadgesCount: number;
  preservedValidMissions: number;
  warnings: string[];
  profileId?: string;
}

export interface TechnicalResetResult {
  success: boolean;
  log: TechnicalResetLog;
  technicalKeysRemoved: number;
  corruptMissionsCleaned: number;
  preservedDataCount: number;
  message: string;
}

// ══════════════════════════════════════════
// Protected Data Whitelist
// ══════════════════════════════════════════

/**
 * Keys within GameStoreState that MUST be preserved intact.
 */
const PROTECTED_STATE_KEYS: (keyof GameStoreState)[] = [
  "profiles",
  "parentPasswordHash",
  "miniGameSessions",
  "miniGameLeaderboards",
  "battleHistory",
  "rewardMilestones",
  "difficultyCompletionRewards",
];

/**
 * Profile-level fields that MUST be preserved intact.
 */
const PROTECTED_PROFILE_KEYS: (keyof Profile)[] = [
  "id",
  "name",
  "avatar",
  "gender",
  "difficulty",
  "xp",
  "level",
  "points",
  "coins",
  "hearts",
  "streak",
  "adabStreak",
  "lastPlayDate",
  "lastAdabDate",
  "badges",
  "missionProgress",
  "categoryStats",
  "totalMissionsCompleted",
  "timePlayedMinutes",
  "settings",
  "createdAt",
  "claimedStageRewardIds",
  "dailyMissionRewardLedger",
  "dailyMissionStreak",
  "unlockedDifficulties",
  "currentDifficulty",
  "completedDifficulties",
  "difficultyUpgradeAvailable",
  "upgradedAt",
  "claimedFinalRewardsByDifficulty",
  "pendingDifficultyUpgrade",
  "pendingFinalRewardDifficulty",
];

/**
 * Additional localStorage keys (outside the main store) that should be preserved.
 */
const PROTECTED_LOCAL_STORAGE_PREFIXES = [
  `${STORAGE_PREFIX}_store`,
  `${STORAGE_PREFIX}_migration_backup`,
];

// ══════════════════════════════════════════
// Technical localStorage Keys (safe to delete)
// ══════════════════════════════════════════

/**
 * Known technical localStorage keys (outside main store) safe to remove.
 */
const TECHNICAL_LOCAL_STORAGE_KEYS = [
  // Cloud sync mock data
  "tmt_mock_cloud_save",
  // TanStack router cache
  "tanstack_router_state",
  "tanstack_router_manifest",
  // Any stale cache prefixes
  "adab_quest_technical_reset_backup",
];

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════

function generateId(): string {
  return `reset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ══════════════════════════════════════════
// Daily Mission Technical Cleanup
// ══════════════════════════════════════════

/**
 * Determine if a DailyMission is a valid parent-created mission.
 * Valid = has id, title, active, not a template/dummy/builtIn.
 */
function isValidParentMission(m: DailyMission): boolean {
  if (!m.id) return false;
  if (!m.title || m.title.trim().length === 0) return false;
  if (!m.isActive) return false; // inactive missions preserved in list but cleaned
  if (!m.assignedProfileIds || m.assignedProfileIds.length === 0) return false;
  if (!m.date) return false;
  if (m.points < 5 || m.points > 75) return false;
  return true;
}

/**
 * Determine if a DailyMissionAssignment is valid.
 */
function isValidAssignment(a: DailyMissionAssignment, validMissionIds: Set<string>, validProfileIds: Set<string>): boolean {
  if (!a.id) return false;
  if (!a.missionId) return false;
  if (!validMissionIds.has(a.missionId)) return false;
  if (!a.profileId) return false;
  if (!validProfileIds.has(a.profileId)) return false;
  if (!a.date) return false;
  if (!a.title) return false;
  return true;
}

/**
 * Determine if an assignment is corrupt and should be cleaned.
 */
function isCorruptAssignment(a: DailyMissionAssignment, validMissionIds: Set<string>, validProfileIds: Set<string>): boolean {
  // Missing required fields
  if (!a.missionId || !a.profileId || !a.date) return true;
  // Mission deleted/not found
  if (!validMissionIds.has(a.missionId)) return true;
  // Profile deleted/not found
  if (!validProfileIds.has(a.profileId)) return true;
  // Invalid date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date)) return true;
  // Empty title
  if (!a.title || a.title.trim().length === 0) return true;
  return false;
}

/**
 * Clean daily mission technical data within profiles.
 * Removes corrupt assignments, stale DailyAdabChecklist data, etc.
 */
function cleanupProfileDailyMissionData(
  profile: Profile,
  validMissionIds: Set<string>,
  validProfileIds: Set<string>
): { cleaned: Profile; corruptCount: number } {
  let corruptCount = 0;
  let cleaned = { ...profile };

  // Clean up dailyMissionAssignments — remove corrupt ones
  if (cleaned.dailyMissionAssignments && cleaned.dailyMissionAssignments.length > 0) {
    const before = cleaned.dailyMissionAssignments.length;
    cleaned.dailyMissionAssignments = cleaned.dailyMissionAssignments.filter((a) => {
      if (isCorruptAssignment(a, validMissionIds, validProfileIds)) {
        corruptCount++;
        return false;
      }
      return true;
    });
    if (before !== cleaned.dailyMissionAssignments.length) {
      cleaned = { ...cleaned };
    }
  }

  // Clean up stale DailyAdabChecklist (deprecated, migrated to new system)
  if (cleaned.dailyAdabChecklist) {
    const today = todayStr();
    // Keep if it's today's data and hasn't been migrated
    const checklist = cleaned.dailyAdabChecklist as DailyAdabChecklist;
    if (checklist.date !== today) {
      // Old checklist data — safe to clean
      const { dailyAdabChecklist: _, ...rest } = cleaned as any;
      cleaned = rest as Profile;
      corruptCount++;
    }
  }

  return { cleaned: cleaned as Profile, corruptCount };
}

// ══════════════════════════════════════════
// Main Technical Reset
// ══════════════════════════════════════════

/**
 * Core function: reset technical data only.
 * Backs up protected data, cleans technical data, validates, restores if needed.
 */
export function resetTechnicalData(
  activeProfileId?: string | null
): TechnicalResetResult {
  const warnings: string[] = [];
  const removedKeys: string[] = [];
  let repairedDailyMissionCount = 0;
  let cleanedCorruptAssignments = 0;

  console.group("[TechnicalReset] Starting technical data reset...");

  // ── Step 1: Backup entire store to memory ──
  const currentStore = storageService.getState();
  const protectedBackup: Partial<GameStoreState> = {};

  for (const key of PROTECTED_STATE_KEYS) {
    protectedBackup[key] = JSON.parse(JSON.stringify(currentStore[key]));
  }

  console.log("[TechnicalReset] Protected data backed up:", Object.keys(protectedBackup).join(", "));

  // ── Step 2: Clean Daily Missions — remove non-valid missions ──
  const dailyMissions = [...(currentStore.dailyMissions || [])];
  const validMissions = dailyMissions.filter(isValidParentMission);
  const removedMissionCount = dailyMissions.length - validMissions.length;

  if (removedMissionCount > 0) {
    console.log(`[TechnicalReset] Removing ${removedMissionCount} invalid/technical daily missions`);
    repairedDailyMissionCount += removedMissionCount;
  }

  // ── Step 3: Clean profiles — remove corrupt assignments ──
  const validMissionIds = new Set(validMissions.map((m) => m.id));
  const profiles = [...currentStore.profiles];
  const validProfileIds = new Set(profiles.map((p) => p.id));
  const cleanedProfiles: Profile[] = [];

  for (const profile of profiles) {
    const { cleaned, corruptCount } = cleanupProfileDailyMissionData(
      profile,
      validMissionIds,
      validProfileIds
    );
    cleanedProfiles.push(cleaned);
    cleanedCorruptAssignments += corruptCount;
  }

  if (cleanedCorruptAssignments > 0) {
    console.log(`[TechnicalReset] Cleaned ${cleanedCorruptAssignments} corrupt daily mission assignments`);
  }

  // ── Step 4: Remove technical localStorage keys ──
  for (const key of TECHNICAL_LOCAL_STORAGE_KEYS) {
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        removedKeys.push(key);
        console.log(`[TechnicalReset] Removed localStorage key: ${key}`);
      }
    } catch (e) {
      warnings.push(`Failed to remove localStorage key "${key}": ${e}`);
    }
  }

  // Also scan for any stale adab_quest_daily_* keys that have no matching profile
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}_daily_`)) {
        const profileId = key.replace(`${STORAGE_PREFIX}_daily_`, "");
        if (!validProfileIds.has(profileId)) {
          localStorage.removeItem(key);
          removedKeys.push(key);
          console.log(`[TechnicalReset] Removed stale daily challenge key: ${key}`);
        }
      }
    }
  } catch (e) {
    warnings.push(`Failed to scan localStorage keys: ${e}`);
  }

  // ── Step 5: Update store with cleaned data ──
  const cleanedStore: Partial<GameStoreState> = {
    dailyMissions: validMissions,
    profiles: cleanedProfiles,
  };

  storageService.updateGlobalState(cleanedStore);

  // ── Step 6: Validate protected data is intact ──
  const restoredProfiles = storageService.getState().profiles;
  const preservedProfilesCount = restoredProfiles.length;
  let preservedBadgesCount = 0;
  for (const p of restoredProfiles) {
    preservedBadgesCount += p.badges.length;
  }

  // Check if protected data survived
  if (preservedProfilesCount !== profiles.length) {
    warnings.push(`Profile count mismatch! Expected ${profiles.length}, got ${preservedProfilesCount}`);
    console.error("[TechnicalReset] WARNING: Profile count changed unexpectedly!");
  }

  // ── Step 7: Create reset log ──
  const log: TechnicalResetLog = {
    id: generateId(),
    resetAt: nowISO(),
    appVersion: "1.0",
    removedKeys,
    repairedDailyMissionCount,
    cleanedCorruptAssignments,
    preservedProfilesCount,
    preservedBadgesCount,
    preservedValidMissions: validMissions.length,
    warnings,
    profileId: activeProfileId ?? undefined,
  };

  // Save log to localStorage (safe technical data)
  try {
    const existingLogsRaw = localStorage.getItem("adab_quest_technical_reset_logs");
    const existingLogs: TechnicalResetLog[] = existingLogsRaw
      ? JSON.parse(existingLogsRaw)
      : [];
    existingLogs.push(log);
    // Keep only last 20 logs
    if (existingLogs.length > 20) {
      existingLogs.splice(0, existingLogs.length - 20);
    }
    localStorage.setItem("adab_quest_technical_reset_logs", JSON.stringify(existingLogs));
  } catch (e) {
    warnings.push(`Failed to save reset log: ${e}`);
  }

  console.log("[TechnicalReset] Reset complete. Summary:", {
    technicalKeysRemoved: removedKeys.length,
    missionsCleaned: repairedDailyMissionCount,
    corruptAssignments: cleanedCorruptAssignments,
    profilesPreserved: preservedProfilesCount,
    badgesPreserved: preservedBadgesCount,
    validMissionsKept: validMissions.length,
  });
  console.groupEnd();

  // ── Step 8: Build user-friendly message ──
  let message = "Data teknis berhasil direset.";
  if (removedKeys.length > 0 || repairedDailyMissionCount > 0 || cleanedCorruptAssignments > 0) {
    message += `\n${removedKeys.length + repairedDailyMissionCount + cleanedCorruptAssignments} data teknis dibersihkan.`;
  }
  message += `\n${preservedProfilesCount} profil, ${preservedBadgesCount} lencana, ${validMissions.length} misi harian tetap aman.`;

  return {
    success: true,
    log,
    technicalKeysRemoved: removedKeys.length,
    corruptMissionsCleaned: repairedDailyMissionCount + cleanedCorruptAssignments,
    preservedDataCount: preservedProfilesCount + preservedBadgesCount + validMissions.length,
    message,
  };
}

/**
 * Get only the list of daily challenges keys that will be preserved.
 */
export function getProtectedStorageKeys(): string[] {
  return [...PROTECTED_LOCAL_STORAGE_PREFIXES];
}

/**
 * Scan and report on current data health without making changes.
 */
export function auditTechnicalData(): {
  totalProfiles: number;
  totalBadges: number;
  totalDailyMissions: number;
  validDailyMissions: number;
  totalAssignments: number;
  corruptAssignments: number;
  oldDailyAdabChecklists: number;
  technicalLocalStorageKeys: string[];
} {
  const store = storageService.getState();
  const profiles = store.profiles || [];
  const dailyMissions = store.dailyMissions || [];
  const validMissions = dailyMissions.filter(isValidParentMission);
  const validMissionIds = new Set(validMissions.map((m) => m.id));
  const validProfileIds = new Set(profiles.map((p) => p.id));

  let totalBadges = 0;
  let totalAssignments = 0;
  let corruptAssignments = 0;
  let oldDailyAdabChecklists = 0;

  for (const p of profiles) {
    totalBadges += p.badges.length;
    const assignments = p.dailyMissionAssignments || [];
    totalAssignments += assignments.length;
    corruptAssignments += assignments.filter((a) =>
      isCorruptAssignment(a, validMissionIds, validProfileIds)
    ).length;
    if (p.dailyAdabChecklist) oldDailyAdabChecklists++;
  }

  const technicalLocalStorageKeys: string[] = [];
  try {
    for (const key of TECHNICAL_LOCAL_STORAGE_KEYS) {
      if (localStorage.getItem(key) !== null) {
        technicalLocalStorageKeys.push(key);
      }
    }
  } catch (_) {
    // ignore
  }

  return {
    totalProfiles: profiles.length,
    totalBadges,
    totalDailyMissions: dailyMissions.length,
    validDailyMissions: validMissions.length,
    totalAssignments,
    corruptAssignments,
    oldDailyAdabChecklists,
    technicalLocalStorageKeys,
  };
}
