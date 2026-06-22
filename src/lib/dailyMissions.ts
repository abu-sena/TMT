/**
 * Daily Mission Helpers — business logic for parent-managed daily missions.
 * 
 * Covers: assignment creation, point validation, check-in, approve/reject,
 * daily bonus, streak tracking, and anti-double-claim.
 */

import type {
  Profile,
  DailyMission,
  DailyMissionAssignment,
  DailyMissionAssignmentStatus,
  DailyMissionTemplate,
  DailyMissionDifficultyWeight,
  DailyMissionRewardLedgerEntry,
  DailyMissionStreak,
} from "@/types";
import {
  DAILY_MISSION_SOFT_CAP,
  DAILY_MISSION_HARD_CAP,
  DAILY_MISSION_MIN_POINTS,
  DAILY_MISSION_MAX_POINTS_PER_MISSION,
  DAILY_MISSION_ALL_DONE_BONUS,
  DAILY_MISSION_WEIGHT_DEFAULTS,
  DAILY_MISSION_STREAK_MILESTONES,
} from "@/types";

// ══════════════════════════════════════════
// NOTE: Built-in templates have been removed (2026-06-22).
// Parents must create Daily Missions from scratch.
// No auto-recommendations, no pre-built packages.
// ══════════════════════════════════════════

/** Get default points for a weight (still useful for form defaults) */
export function getDefaultPointsForWeight(weight: DailyMissionDifficultyWeight): number {
  return DAILY_MISSION_WEIGHT_DEFAULTS[weight]?.defaultPoints ?? 20;
}

// ──────────────────────────────────────────────
// Point Validation
// ──────────────────────────────────────────────

/** Clamp points to valid range (5-75) */
export function clampMissionPoints(points: number): number {
  return Math.max(DAILY_MISSION_MIN_POINTS, Math.min(DAILY_MISSION_MAX_POINTS_PER_MISSION, Math.round(points)));
}

/** Calculate total points for today's mission assignments for a profile */
export function calculateDailyTotalPoints(assignments: DailyMissionAssignment[]): number {
  return assignments
    .filter(a => a.status !== "rejected_by_parent")
    .reduce((sum, a) => sum + a.points, 0);
}

/** Check if daily total exceeds soft cap (150) */
export function exceedsSoftCap(assignments: DailyMissionAssignment[]): boolean {
  return calculateDailyTotalPoints(assignments) > DAILY_MISSION_SOFT_CAP;
}

/** Check if daily total exceeds hard cap (250) */
export function exceedsHardCap(assignments: DailyMissionAssignment[]): boolean {
  return calculateDailyTotalPoints(assignments) > DAILY_MISSION_HARD_CAP;
}

/** Get warning message for point caps */
export function getPointCapWarning(assignments: DailyMissionAssignment[]): string | null {
  const total = calculateDailyTotalPoints(assignments);
  if (total > DAILY_MISSION_HARD_CAP) {
    return `Total poin Misi Harian tidak boleh lebih dari ${DAILY_MISSION_HARD_CAP} poin per hari per anak.`;
  }
  if (total > DAILY_MISSION_SOFT_CAP) {
    return `Total poin harian sudah cukup besar (${total}). Agar seimbang dengan Peta Petualangan dan Mini Game, disarankan maksimal ${DAILY_MISSION_SOFT_CAP} poin per hari.`;
  }
  return null;
}

// ──────────────────────────────────────────────
// Assignment Helpers
// ──────────────────────────────────────────────

/** Get today's assignments for a profile */
export function getTodayAssignments(profile: Profile): DailyMissionAssignment[] {
  const today = new Date().toISOString().split("T")[0];
  return (profile.dailyMissionAssignments || []).filter(a => a.date === today);
}

/** Create an assignment from a mission for a specific date */
export function createAssignmentFromMission(mission: DailyMission, profile: Profile, date: string): DailyMissionAssignment {
  return {
    id: crypto.randomUUID(),
    missionId: mission.id,
    profileId: profile.id,
    date,
    title: mission.title,
    description: mission.description,
    category: mission.category,
    points: mission.points,
    status: "not_started",
    rewardGranted: false,
    pointsAwarded: 0,
  };
}

// ──────────────────────────────────────────────
// Child Check-in
// ──────────────────────────────────────────────

/** Child checks in a mission — status becomes pending_parent_validation */
export function checkInAssignment(
  profile: Profile,
  assignmentId: string
): Profile | null {
  const assignments = [...(profile.dailyMissionAssignments || [])];
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;

  const a = assignments[idx];
  // Only allow check-in from not_started or rejected_by_parent
  if (a.status !== "not_started" && a.status !== "rejected_by_parent") return null;

  const now = new Date().toISOString();
  assignments[idx] = {
    ...a,
    status: "pending_parent_validation",
    checkedAt: now,
    rewardGranted: false,
  };

  return { ...profile, dailyMissionAssignments: assignments };
}

// ──────────────────────────────────────────────
// Parent Approval / Rejection
// ──────────────────────────────────────────────

/** Parent approves an assignment — reward is granted once */
export function approveAssignment(
  profile: Profile,
  assignmentId: string,
  parentNote?: string
): { profile: Profile; pointsAwarded: number } | null {
  const assignments = [...(profile.dailyMissionAssignments || [])];
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;

  const a = assignments[idx];
  if (a.status !== "pending_parent_validation" && a.status !== "checked_by_child") return null;
  // Anti-double-claim
  if (a.rewardGranted) return null;

  const now = new Date().toISOString();
  const pointsAwarded = a.points;

  assignments[idx] = {
    ...a,
    status: "approved_by_parent",
    approvedAt: now,
    parentNote: parentNote || a.parentNote,
    rewardGranted: true,
    rewardGrantedAt: now,
    pointsAwarded,
  };

  // Add to reward ledger
  const ledger = [...(profile.dailyMissionRewardLedger || [])];
  ledger.push({
    id: crypto.randomUUID(),
    profileId: profile.id,
    assignmentId: a.id,
    date: a.date,
    points: pointsAwarded,
    reason: "mission_approved",
    grantedAt: now,
  });

  const updated: Profile = {
    ...profile,
    dailyMissionAssignments: assignments,
    dailyMissionRewardLedger: ledger,
    points: profile.points + pointsAwarded,
  };

  return { profile: updated, pointsAwarded };
}

/** Parent rejects an assignment — no reward, child can re-check-in */
export function rejectAssignment(
  profile: Profile,
  assignmentId: string,
  parentNote?: string
): Profile | null {
  const assignments = [...(profile.dailyMissionAssignments || [])];
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;

  const a = assignments[idx];
  if (a.status !== "pending_parent_validation" && a.status !== "checked_by_child") return null;

  const now = new Date().toISOString();
  assignments[idx] = {
    ...a,
    status: "rejected_by_parent",
    rejectedAt: now,
    parentNote: parentNote || a.parentNote,
    rewardGranted: false,
    pointsAwarded: 0,
  };

  return { ...profile, dailyMissionAssignments: assignments };
}

// ──────────────────────────────────────────────
// Daily Completion Bonus
// ──────────────────────────────────────────────

/** Check if ALL assigned missions for today are approved by parent */
export function allMissionsApprovedToday(profile: Profile): boolean {
  const assignments = getTodayAssignments(profile);
  if (assignments.length === 0) return false;
  return assignments.every(a => a.status === "approved_by_parent");
}

/** Grant the daily "all done" bonus (+25 points) — only once per day */
export function grantDailyBonusIfEligible(profile: Profile): Profile | null {
  const today = new Date().toISOString().split("T")[0];

  // Must have all assignments approved
  if (!allMissionsApprovedToday(profile)) return null;

  // Check if already claimed today
  const ledger = profile.dailyMissionRewardLedger || [];
  const alreadyClaimedToday = ledger.some(
    e => e.date === today && e.reason === "daily_bonus"
  );
  if (alreadyClaimedToday) return null;

  // Grant bonus
  const now = new Date().toISOString();
  const newLedger = [...ledger, {
    id: crypto.randomUUID(),
    profileId: profile.id,
    assignmentId: "__daily_bonus__",
    date: today,
    points: DAILY_MISSION_ALL_DONE_BONUS,
    reason: "daily_bonus" as const,
    grantedAt: now,
  }];

  return {
    ...profile,
    dailyMissionRewardLedger: newLedger,
    points: profile.points + DAILY_MISSION_ALL_DONE_BONUS,
  };
}

// ──────────────────────────────────────────────
// Streak Tracking
// ──────────────────────────────────────────────

/** Get the current streak data for a profile */
export function getStreak(profile: Profile): DailyMissionStreak {
  return profile.dailyMissionStreak || {
    profileId: profile.id,
    currentStreak: 0,
    longestStreak: 0,
    lastQualifiedDate: "",
    streakRewardsClaimed: [],
  };
}

/** Check if today qualifies for a streak day:
 * - At least 3 missions approved today, OR
 * - If today has < 3 missions, ALL must be approved
 */
export function qualifiesForStreakDay(profile: Profile): boolean {
  const assignments = getTodayAssignments(profile);
  if (assignments.length === 0) return false;

  const approvedCount = assignments.filter(a => a.status === "approved_by_parent").length;
  const minRequired = Math.min(3, assignments.length);

  return approvedCount >= minRequired;
}

/** Update streak if today qualifies — called after parent approval */
export function updateStreakIfQualified(profile: Profile): Profile {
  if (!qualifiesForStreakDay(profile)) return profile;

  const streak = getStreak(profile);
  const today = new Date().toISOString().split("T")[0];

  // Already counted today?
  if (streak.lastQualifiedDate === today) return profile;

  // Check if consecutive with yesterday
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let newStreak = 1;
  if (streak.lastQualifiedDate === yesterday) {
    newStreak = streak.currentStreak + 1;
  }

  const updatedStreak: DailyMissionStreak = {
    ...streak,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, streak.longestStreak),
    lastQualifiedDate: today,
  };

  // Check if a streak milestone was reached
  let profileAfterRewards = { ...profile, dailyMissionStreak: updatedStreak };

  for (const [daysStr, reward] of Object.entries(DAILY_MISSION_STREAK_MILESTONES)) {
    const days = parseInt(daysStr);
    if (newStreak === days && !streak.streakRewardsClaimed.includes(days)) {
      // Grant streak reward
      const now = new Date().toISOString();
      const ledger = [...(profileAfterRewards.dailyMissionRewardLedger || []), {
        id: crypto.randomUUID(),
        profileId: profile.id,
        assignmentId: `__streak_${days}__`,
        date: today,
        points: reward.points,
        reason: "streak_reward" as const,
        grantedAt: now,
      }];

      const newBadges = [...profileAfterRewards.badges];
      if (reward.badge && !newBadges.includes(reward.badge)) {
        newBadges.push(reward.badge);
      }

      profileAfterRewards = {
        ...profileAfterRewards,
        dailyMissionRewardLedger: ledger,
        points: profileAfterRewards.points + reward.points,
        badges: newBadges,
        dailyMissionStreak: {
          ...updatedStreak,
          streakRewardsClaimed: [...(updatedStreak.streakRewardsClaimed || []), days],
        },
      };
    }
  }

  return profileAfterRewards;
}

// ──────────────────────────────────────────────
// Sorting Helper
// ──────────────────────────────────────────────

/**
 * Sort assignments for child view.
 * Order: not_started → rejected_by_parent → pending_parent_validation → approved_by_parent
 * This ensures actionable items are always at the top.
 */
export function sortDailyMissionAssignments(assignments: DailyMissionAssignment[]): DailyMissionAssignment[] {
  const order: Record<DailyMissionAssignmentStatus, number> = {
    not_started: 0,
    rejected_by_parent: 1,
    checked_by_child: 2,
    pending_parent_validation: 2,
    approved_by_parent: 3,
  };
  return [...assignments].sort((a, b) => {
    const diff = (order[a.status] ?? 99) - (order[b.status] ?? 99);
    if (diff !== 0) return diff;
    // Secondary sort: most recently updated first within same status
    const aTime = a.checkedAt || a.approvedAt || a.rejectedAt || "";
    const bTime = b.checkedAt || b.approvedAt || b.rejectedAt || "";
    return bTime.localeCompare(aTime);
  });
}

/**
 * Sort assignments for parent validation view.
 * Order: pending_parent_validation → rejected_by_parent → approved_by_parent
 */
export function sortParentValidationAssignments(assignments: DailyMissionAssignment[]): DailyMissionAssignment[] {
  const order: Record<DailyMissionAssignmentStatus, number> = {
    checked_by_child: 0,
    pending_parent_validation: 0,
    rejected_by_parent: 1,
    approved_by_parent: 2,
    not_started: 3,
  };
  return [...assignments].sort((a, b) => {
    const diff = (order[a.status] ?? 99) - (order[b.status] ?? 99);
    if (diff !== 0) return diff;
    const aTime = a.checkedAt || a.approvedAt || a.rejectedAt || "";
    const bTime = b.checkedAt || b.approvedAt || b.rejectedAt || "";
    return bTime.localeCompare(aTime);
  });
}

// ──────────────────────────────────────────────
// Today's Summary for Child Display
// ──────────────────────────────────────────────

export function getTodaySummary(profile: Profile) {
  const assignments = getTodayAssignments(profile);
  const approved = assignments.filter(a => a.status === "approved_by_parent").length;
  const pending = assignments.filter(a => a.status === "pending_parent_validation" || a.status === "checked_by_child").length;
  const rejected = assignments.filter(a => a.status === "rejected_by_parent").length;
  const notStarted = assignments.filter(a => a.status === "not_started").length;
  const totalPointsEarned = assignments
    .filter(a => a.rewardGranted)
    .reduce((sum, a) => sum + a.pointsAwarded, 0);
  const totalPointsPending = assignments
    .filter(a => a.status === "pending_parent_validation")
    .reduce((sum, a) => sum + a.points, 0);
  const allDone = notStarted === 0 && pending === 0 && rejected === 0 && approved > 0;

  // Check daily bonus
  const ledger = profile.dailyMissionRewardLedger || [];
  const today = new Date().toISOString().split("T")[0];
  const bonusEarned = ledger.filter(e => e.date === today && e.reason === "daily_bonus")
    .reduce((sum, e) => sum + e.points, 0);

  return {
    assignments,
    approved,
    pending,
    rejected,
    notStarted,
    total: assignments.length,
    totalPointsEarned: totalPointsEarned + bonusEarned,
    totalPointsPending,
    allDone,
    bonusEarned,
    streak: getStreak(profile).currentStreak,
  };
}

// ──────────────────────────────────────────────
// Seed assignments from missions for today
// ──────────────────────────────────────────────

/** Generate today's assignments from active daily missions */
export function seedTodayAssignments(profile: Profile, missions: DailyMission[]): Profile {
  const today = new Date().toISOString().split("T")[0];
  const existing = getTodayAssignments(profile);
  const existingMissionIds = new Set(existing.map(a => a.missionId));

  // Get active missions for today that target this profile
  const activeMissions = missions.filter(m => {
    if (!m.isActive) return false;
    if (!m.assignedProfileIds.includes(profile.id)) return false;

    // Check schedule
    if (m.scheduleType === "daily") return true;
    if (m.scheduleType === "once" && m.date === today) return true;
    if (m.scheduleType === "custom") {
      if (m.date === today) return true;
      if (m.repeatDays && m.repeatDays.includes(new Date().getDay())) return true;
    }
    return false;
  });

  const newAssignments = activeMissions
    .filter(m => !existingMissionIds.has(m.id))
    .map(m => createAssignmentFromMission(m, profile, today));

  if (newAssignments.length === 0) return profile;

  return {
    ...profile,
    dailyMissionAssignments: [...(profile.dailyMissionAssignments || []), ...newAssignments],
  };
}
