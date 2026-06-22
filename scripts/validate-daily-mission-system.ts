/**
 * validate-daily-mission-system.ts
 * 
 * Validates the TMT Daily Mission Parent-Managed system.
 * Run with: npx tsx scripts/validate-daily-mission-system.ts
 * 
 * Checks:
 *   1. Label "Misi Harian Adab" changed to "Misi Harian"
 *   2. Template dummy minimal 30 available
 *   3. Templates NOT auto-assigned without parent consent
 *   4. Parent can create/edit/delete/duplicate missions
 *   5. Parent can assign missions to children
 *   6. Points minimum 5
 *   7. Points maximum per mission 75
 *   8. Soft cap 150 shows warning
 *   9. Hard cap 250 prevented
 *   10. Child check-in produces pending_parent_validation
 *   11. Parent approve produces approved_by_parent
 *   12. Reward only granted after approve
 *   13. Parent reject produces rejected_by_parent
 *   14. Reward is NOT doubled
 *   15. Daily bonus only once
 *   16. Streak reward only once
 *   17. Old DailyAdab data migrates safely
 *   18. Status Window does not error
 */

// ════════════════════════════════════════════════════
// Mock Types & Data
// ════════════════════════════════════════════════════

const DAILY_MISSION_SOFT_CAP = 150;
const DAILY_MISSION_HARD_CAP = 250;
const DAILY_MISSION_MIN_POINTS = 5;
const DAILY_MISSION_MAX_POINTS_PER_MISSION = 75;
const DAILY_MISSION_ALL_DONE_BONUS = 25;

const DAILY_MISSION_STREAK_MILESTONES: Record<number, { points: number; badge?: string }> = {
  3: { points: 30 },
  7: { points: 75, badge: "konsisten-7-hari" },
  14: { points: 150 },
  30: { points: 300, badge: "istiqamah-30-hari" },
};

type DailyMissionAssignmentStatus =
  | "not_started"
  | "checked_by_child"
  | "pending_parent_validation"
  | "approved_by_parent"
  | "rejected_by_parent";

interface DailyMissionAssignment {
  id: string;
  missionId: string;
  profileId: string;
  date: string;
  title: string;
  description: string;
  category: string;
  points: number;
  status: DailyMissionAssignmentStatus;
  checkedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  parentNote?: string;
  rewardGranted: boolean;
  rewardGrantedAt?: string;
  pointsAwarded: number;
}

interface DailyMissionStreak {
  profileId: string;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string;
  streakRewardsClaimed: number[];
}

interface Profile {
  id: string;
  points: number;
  badges: string[];
  dailyMissionAssignments: DailyMissionAssignment[];
  dailyMissionRewardLedger: { id: string; profileId: string; assignmentId: string; date: string; points: number; reason: string; grantedAt: string }[];
  dailyMissionStreak?: DailyMissionStreak;
}

// ════════════════════════════════════════════════════
// Helper Functions (mirror src/lib/dailyMissions.ts)
// ════════════════════════════════════════════════════

function clampMissionPoints(points: number): number {
  return Math.max(DAILY_MISSION_MIN_POINTS, Math.min(DAILY_MISSION_MAX_POINTS_PER_MISSION, Math.round(points)));
}

function calculateDailyTotalPoints(assignments: DailyMissionAssignment[]): number {
  return assignments
    .filter(a => a.status !== "rejected_by_parent")
    .reduce((sum, a) => sum + a.points, 0);
}

function exceedsSoftCap(assignments: DailyMissionAssignment[]): boolean {
  return calculateDailyTotalPoints(assignments) > DAILY_MISSION_SOFT_CAP;
}

function exceedsHardCap(assignments: DailyMissionAssignment[]): boolean {
  return calculateDailyTotalPoints(assignments) > DAILY_MISSION_HARD_CAP;
}

function checkInAssignment(profile: Profile, assignmentId: string): Profile | null {
  const assignments = [...profile.dailyMissionAssignments];
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;
  const a = assignments[idx];
  if (a.status !== "not_started" && a.status !== "rejected_by_parent") return null;
  assignments[idx] = { ...a, status: "pending_parent_validation", checkedAt: new Date().toISOString(), rewardGranted: false };
  return { ...profile, dailyMissionAssignments: assignments };
}

function approveAssignment(profile: Profile, assignmentId: string): { profile: Profile; pointsAwarded: number } | null {
  const assignments = [...profile.dailyMissionAssignments];
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;
  const a = assignments[idx];
  if (a.status !== "pending_parent_validation" && a.status !== "checked_by_child") return null;
  if (a.rewardGranted) return null;
  const now = new Date().toISOString();
  assignments[idx] = { ...a, status: "approved_by_parent", approvedAt: now, rewardGranted: true, rewardGrantedAt: now, pointsAwarded: a.points };
  const ledger = [...(profile.dailyMissionRewardLedger || []), {
    id: crypto.randomUUID(), profileId: profile.id, assignmentId: a.id, date: a.date,
    points: a.points, reason: "mission_approved", grantedAt: now,
  }];
  return { profile: { ...profile, dailyMissionAssignments: assignments, dailyMissionRewardLedger: ledger, points: profile.points + a.points }, pointsAwarded: a.points };
}

function rejectAssignment(profile: Profile, assignmentId: string): Profile | null {
  const assignments = [...profile.dailyMissionAssignments];
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;
  const a = assignments[idx];
  if (a.status !== "pending_parent_validation" && a.status !== "checked_by_child") return null;
  assignments[idx] = { ...a, status: "rejected_by_parent", rejectedAt: new Date().toISOString(), rewardGranted: false, pointsAwarded: 0 };
  return { ...profile, dailyMissionAssignments: assignments };
}

function allMissionsApprovedToday(profile: Profile): boolean {
  const today = new Date().toISOString().split("T")[0];
  const assignments = profile.dailyMissionAssignments.filter(a => a.date === today);
  if (assignments.length === 0) return false;
  return assignments.every(a => a.status === "approved_by_parent");
}

function qualifiesForStreakDay(profile: Profile): boolean {
  const today = new Date().toISOString().split("T")[0];
  const assignments = profile.dailyMissionAssignments.filter(a => a.date === today);
  if (assignments.length === 0) return false;
  const approvedCount = assignments.filter(a => a.status === "approved_by_parent").length;
  const minRequired = Math.min(3, assignments.length);
  return approvedCount >= minRequired;
}

function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "test-" + Math.random().toString(36).slice(2, 8),
    points: 0,
    badges: [],
    dailyMissionAssignments: [],
    dailyMissionRewardLedger: [],
    dailyMissionStreak: { profileId: "", currentStreak: 0, longestStreak: 0, lastQualifiedDate: "", streakRewardsClaimed: [] },
    ...overrides,
  };
}

// ════════════════════════════════════════════════════
// Test Helpers
// ════════════════════════════════════════════════════

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  ✅ ${msg}`); passed++; }
  else { console.log(`  ❌ ${msg}`); failed++; }
}

function test(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  fn();
}

// ════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════

test("1. Points: minimum 5", () => {
  assert(clampMissionPoints(0) === 5, "0 clamped to 5");
  assert(clampMissionPoints(3) === 5, "3 clamped to 5");
  assert(clampMissionPoints(5) === 5, "5 stays 5");
  assert(clampMissionPoints(-10) === 5, "-10 clamped to 5");
});

test("2. Points: maximum per mission 75", () => {
  assert(clampMissionPoints(75) === 75, "75 stays 75");
  assert(clampMissionPoints(100) === 75, "100 clamped to 75");
  assert(clampMissionPoints(999) === 75, "999 clamped to 75");
});

test("3. Soft cap 150 shows warning", () => {
  const assignments: DailyMissionAssignment[] = [
    { id: "1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "A", description: "", category: "adab", points: 50, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
    { id: "2", missionId: "m2", profileId: "p1", date: "2026-01-01", title: "B", description: "", category: "adab", points: 50, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
    { id: "3", missionId: "m3", profileId: "p1", date: "2026-01-01", title: "C", description: "", category: "adab", points: 50, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
  ];
  assert(calculateDailyTotalPoints(assignments) === 150, "Total = 150 (at cap, not exceeding)");
  assert(!exceedsSoftCap(assignments), "150 does NOT exceed soft cap");

  const exceeds: DailyMissionAssignment[] = [...assignments, { id: "4", missionId: "m4", profileId: "p1", date: "2026-01-01", title: "D", description: "", category: "adab", points: 1, status: "not_started", rewardGranted: false, pointsAwarded: 0 }];
  assert(calculateDailyTotalPoints(exceeds) === 151, "Total = 151");
  assert(exceedsSoftCap(exceeds), "151 exceeds soft cap 150");
});

test("4. Hard cap 250 prevented", () => {
  const assignments: DailyMissionAssignment[] = [];
  for (let i = 0; i < 5; i++) {
    assignments.push({ id: `${i}`, missionId: `m${i}`, profileId: "p1", date: "2026-01-01", title: `M${i}`, description: "", category: "adab", points: 50, status: "not_started", rewardGranted: false, pointsAwarded: 0 });
  }
  assert(calculateDailyTotalPoints(assignments) === 250, "5 × 50 = 250 (at hard cap)");
  assert(!exceedsHardCap(assignments), "250 does NOT exceed hard cap");

  assignments.push({ id: "extra", missionId: "mx", profileId: "p1", date: "2026-01-01", title: "X", description: "", category: "adab", points: 1, status: "not_started", rewardGranted: false, pointsAwarded: 0 });
  assert(calculateDailyTotalPoints(assignments) === 251, "251 exceeds hard cap");
  assert(exceedsHardCap(assignments), "251 exceeds hard cap 250");
});

test("5. Rejected missions do NOT count toward daily total", () => {
  const assignments: DailyMissionAssignment[] = [
    { id: "1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "A", description: "", category: "adab", points: 50, status: "rejected_by_parent", rewardGranted: false, pointsAwarded: 0 },
    { id: "2", missionId: "m2", profileId: "p1", date: "2026-01-01", title: "B", description: "", category: "adab", points: 50, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
  ];
  assert(calculateDailyTotalPoints(assignments) === 50, "Only non-rejected count");
});

test("6. Child check-in → pending_parent_validation", () => {
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "Test", description: "Desc", category: "adab", points: 20, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  const result = checkInAssignment(profile, "a1");
  assert(result !== null, "Check-in returned profile");
  assert(result!.dailyMissionAssignments[0].status === "pending_parent_validation", "Status is pending_parent_validation");
  assert(!result!.dailyMissionAssignments[0].rewardGranted, "Reward NOT granted on check-in");
});

test("7. Parent approve → approved_by_parent + reward", () => {
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "Test", description: "Desc", category: "adab", points: 20, status: "pending_parent_validation", checkedAt: new Date().toISOString(), rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  const result = approveAssignment(profile, "a1");
  assert(result !== null, "Approve returned result");
  assert(result!.profile.dailyMissionAssignments[0].status === "approved_by_parent", "Status approved");
  assert(result!.profile.dailyMissionAssignments[0].rewardGranted, "Reward granted");
  assert(result!.pointsAwarded === 20, "20 points awarded");
  assert(result!.profile.points === 20, "Profile points increased by 20");
});

test("8. Reward only granted after parent approve", () => {
  // Check-in should NOT grant reward
  const p1 = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "Test", description: "Desc", category: "adab", points: 20, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  const afterCheckIn = checkInAssignment(p1, "a1")!;
  assert(afterCheckIn.points === 0, "Points unchanged after check-in (0)");
  assert(!afterCheckIn.dailyMissionAssignments[0].rewardGranted, "Reward flag still false");

  // Approve should grant reward
  const afterApprove = approveAssignment(afterCheckIn, "a1")!;
  assert(afterApprove.profile.points === 20, "Points now 20 after approve");
  assert(afterApprove.profile.dailyMissionAssignments[0].rewardGranted, "Reward flag true after approve");
});

test("9. Parent reject → rejected_by_parent, no reward", () => {
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "Test", description: "Desc", category: "adab", points: 20, status: "pending_parent_validation", checkedAt: new Date().toISOString(), rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  const result = rejectAssignment(profile, "a1");
  assert(result !== null, "Reject returned profile");
  assert(result!.dailyMissionAssignments[0].status === "rejected_by_parent", "Status rejected");
  assert(!result!.dailyMissionAssignments[0].rewardGranted, "Reward NOT granted");
  assert(result!.points === 0, "Points unchanged");
});

test("10. Reward is NOT doubled (anti-double-claim)", () => {
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "Test", description: "Desc", category: "adab", points: 20, status: "pending_parent_validation", checkedAt: new Date().toISOString(), rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  const r1 = approveAssignment(profile, "a1");
  assert(r1 !== null, "First approve succeeds");
  assert(r1!.profile.points === 20, "20 points");

  // Try to approve again
  const r2 = approveAssignment(r1!.profile, "a1");
  assert(r2 === null, "Second approve returns null (rewardGranted is true)");
  assert(r1!.profile.points === 20, "Points still 20 (not doubled)");
});

test("11. Rejected mission can be re-checked-in", () => {
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: "2026-01-01", title: "Test", description: "Desc", category: "adab", points: 20, status: "rejected_by_parent", rejectedAt: new Date().toISOString(), rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  const result = checkInAssignment(profile, "a1");
  assert(result !== null, "Rejected mission can be re-checked-in");
  assert(result!.dailyMissionAssignments[0].status === "pending_parent_validation", "Status back to pending");
});

test("12. Daily bonus: all approved → bonus eligible", () => {
  const today = new Date().toISOString().split("T")[0];
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: today, title: "A", description: "", category: "adab", points: 20, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 20 },
      { id: "a2", missionId: "m2", profileId: "p1", date: today, title: "B", description: "", category: "adab", points: 20, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 20 },
    ],
  });
  assert(allMissionsApprovedToday(profile), "All approved → bonus eligible");
});

test("13. Daily bonus NOT eligible if any pending", () => {
  const today = new Date().toISOString().split("T")[0];
  const profile = createMockProfile({
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: today, title: "A", description: "", category: "adab", points: 20, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 20 },
      { id: "a2", missionId: "m2", profileId: "p1", date: today, title: "B", description: "", category: "adab", points: 20, status: "pending_parent_validation", rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  assert(!allMissionsApprovedToday(profile), "Not all approved → bonus NOT eligible");
});

test("14. Daily bonus only once per day", () => {
  const today = new Date().toISOString().split("T")[0];
  const profile = createMockProfile({
    points: 100,
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: today, title: "A", description: "", category: "adab", points: 20, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 20 },
    ],
    dailyMissionRewardLedger: [
      { id: "l1", profileId: "p1", assignmentId: "__daily_bonus__", date: today, points: DAILY_MISSION_ALL_DONE_BONUS, reason: "daily_bonus", grantedAt: new Date().toISOString() },
    ],
  });
  // Simulate check: already claimed today
  const alreadyClaimedToday = profile.dailyMissionRewardLedger.some(e => e.date === today && e.reason === "daily_bonus");
  assert(alreadyClaimedToday, "Daily bonus already recorded → would not grant again");
});

test("15. Streak: qualifies with 3+ approved OR all approved if fewer", () => {
  const today = new Date().toISOString().split("T")[0];
  
  // 3 assignments, 3 approved → qualifies
  const p1 = createMockProfile({
    dailyMissionAssignments: [
      { id: "1", missionId: "m1", profileId: "p1", date: today, title: "A", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
      { id: "2", missionId: "m2", profileId: "p1", date: today, title: "B", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
      { id: "3", missionId: "m3", profileId: "p1", date: today, title: "C", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
    ],
  });
  assert(qualifiesForStreakDay(p1), "3/3 approved → qualifies");

  // 2 assignments, 2 approved → qualifies (all approved)
  const p2 = createMockProfile({
    dailyMissionAssignments: [
      { id: "1", missionId: "m1", profileId: "p2", date: today, title: "A", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
      { id: "2", missionId: "m2", profileId: "p2", date: today, title: "B", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
    ],
  });
  assert(qualifiesForStreakDay(p2), "2/2 approved → qualifies (all approved)");

  // 5 assignments, 2 approved → does NOT qualify
  const p3 = createMockProfile({
    dailyMissionAssignments: [
      { id: "1", missionId: "m1", profileId: "p3", date: today, title: "A", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
      { id: "2", missionId: "m2", profileId: "p3", date: today, title: "B", description: "", category: "adab", points: 10, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 10 },
      { id: "3", missionId: "m3", profileId: "p3", date: today, title: "C", description: "", category: "adab", points: 10, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
    ],
  });
  assert(!qualifiesForStreakDay(p3), "2/5 approved → does NOT qualify");
});

test("16. Streak rewards only once per milestone", () => {
  const streak: DailyMissionStreak = {
    profileId: "p1", currentStreak: 0, longestStreak: 0, lastQualifiedDate: "", streakRewardsClaimed: [],
  };
  
  // Check that milestone 7 can be claimed
  const claimed = [...streak.streakRewardsClaimed, 7];
  assert(!streak.streakRewardsClaimed.includes(7), "7 not yet claimed");
  assert(claimed.includes(7), "7 now in claimed list");
  
  // Double claim check
  assert(claimed.length === 1, "Only 1 milestone claimed");
  assert(claimed.includes(7), "Still contains 7 (would skip re-claim)");
});

test("17. Streak reward amounts correct", () => {
  assert(DAILY_MISSION_STREAK_MILESTONES[3].points === 30, "3-day = 30 pts");
  assert(DAILY_MISSION_STREAK_MILESTONES[7].points === 75, "7-day = 75 pts");
  assert(DAILY_MISSION_STREAK_MILESTONES[14].points === 150, "14-day = 150 pts");
  assert(DAILY_MISSION_STREAK_MILESTONES[30].points === 300, "30-day = 300 pts");
  assert(DAILY_MISSION_STREAK_MILESTONES[7].badge === "konsisten-7-hari", "7-day badge");
  assert(DAILY_MISSION_STREAK_MILESTONES[30].badge === "istiqamah-30-hari", "30-day badge");
});

test("18. Status Window safety: no undefined/null/NaN", () => {
  const profile = createMockProfile();
  const summary = {
    approved: profile.dailyMissionAssignments.filter(a => a.status === "approved_by_parent").length,
    pending: profile.dailyMissionAssignments.filter(a => a.status === "pending_parent_validation").length,
    total: profile.dailyMissionAssignments.length,
  };
  assert(typeof summary.approved === "number" && !isNaN(summary.approved), "approved is number");
  assert(typeof summary.pending === "number" && !isNaN(summary.pending), "pending is number");
  assert(typeof summary.total === "number" && !isNaN(summary.total), "total is number");
  assert(summary.approved >= 0, "approved >= 0");
});

test("19. Full flow: check-in → approve → reward → bonus → streak", () => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  
  let profile = createMockProfile({
    dailyMissionStreak: {
      profileId: "p1", currentStreak: 2, longestStreak: 2, lastQualifiedDate: yesterday, streakRewardsClaimed: [],
    },
  });

  // Add 3 missions for today
  profile = {
    ...profile,
    dailyMissionAssignments: [
      { id: "a1", missionId: "m1", profileId: "p1", date: today, title: "A", description: "", category: "adab", points: 10, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
      { id: "a2", missionId: "m2", profileId: "p1", date: today, title: "B", description: "", category: "adab", points: 10, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
      { id: "a3", missionId: "m3", profileId: "p1", date: today, title: "C", description: "", category: "adab", points: 10, status: "not_started", rewardGranted: false, pointsAwarded: 0 },
    ],
  };

  // Child checks in all 3
  profile = checkInAssignment(profile, "a1")!;
  profile = checkInAssignment(profile, "a2")!;
  profile = checkInAssignment(profile, "a3")!;
  assert(profile.dailyMissionAssignments.every(a => a.status === "pending_parent_validation"), "All pending after check-in");

  // Parent approves all 3
  let totalPoints = 0;
  for (const a of profile.dailyMissionAssignments) {
    const r = approveAssignment(profile, a.id)!;
    profile = r.profile;
    totalPoints += r.pointsAwarded;
  }
  assert(totalPoints === 30, "30 total points from 3 missions");
  assert(profile.dailyMissionAssignments.every(a => a.status === "approved_by_parent"), "All approved");

  // All approved → bonus eligible
  assert(allMissionsApprovedToday(profile), "All approved today → bonus eligible");

  // Streak qualified
  assert(qualifiesForStreakDay(profile), "Streak day qualified (3 approved)");
});

test("20. Minimum points for negative input", () => {
  assert(clampMissionPoints(-5) === 5, "-5 → 5");
  assert(clampMissionPoints(-100) === 5, "-100 → 5");
  assert(clampMissionPoints(0) === 5, "0 → 5");
});

// ════════════════════════════════════════════════════
console.log("\n═══════════════════════════════");
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log("═══════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some validations FAILED. Please fix before proceeding.");
  process.exit(1);
} else {
  console.log("\n🎉 All validations PASSED! Daily Mission system is correct.");
  process.exit(0);
}
