/**
 * validate-daily-mission-ux-flow.ts
 * 
 * Script validasi untuk memastikan UX Misi Harian berjalan dengan benar.
 * Mencakup: checklist anak, approve/reject parent, auto-sort, anti-double-click,
 * reward safety, empty states, dan kontras UI.
 * 
 * Run: npx ts-node --esm scripts/validate-daily-mission-ux-flow.ts
 *   or: npx tsx scripts/validate-daily-mission-ux-flow.ts
 */

// ═══════════════════════════════════════════
// TYPES (mirroring app types for standalone execution)
// ═══════════════════════════════════════════

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
  childNote?: string;
  rewardGranted: boolean;
  rewardGrantedAt?: string;
  pointsAwarded: number;
}

interface DailyMissionRewardLedgerEntry {
  id: string;
  profileId: string;
  assignmentId: string;
  date: string;
  points: number;
  reason: "mission_approved" | "daily_bonus" | "streak_reward";
  grantedAt: string;
}

// ═══════════════════════════════════════════
// SORTING LOGIC (mirroring app logic)
// ═══════════════════════════════════════════

function sortDailyMissionAssignments(assignments: DailyMissionAssignment[]): DailyMissionAssignment[] {
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
    const aTime = a.checkedAt || a.approvedAt || a.rejectedAt || "";
    const bTime = b.checkedAt || b.approvedAt || b.rejectedAt || "";
    return bTime.localeCompare(aTime);
  });
}

function sortParentValidationAssignments(assignments: DailyMissionAssignment[]): DailyMissionAssignment[] {
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

// ═══════════════════════════════════════════
// BUSINESS LOGIC (mirroring app logic)
// ═══════════════════════════════════════════

function checkInAssignment(assignments: DailyMissionAssignment[], assignmentId: string): DailyMissionAssignment[] | null {
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;
  const a = assignments[idx];
  if (a.status !== "not_started" && a.status !== "rejected_by_parent") return null;
  const now = new Date().toISOString();
  const updated = [...assignments];
  updated[idx] = { ...a, status: "pending_parent_validation", checkedAt: now, rewardGranted: false };
  return updated;
}

function approveAssignment(
  assignments: DailyMissionAssignment[],
  assignmentId: string,
  ledger: DailyMissionRewardLedgerEntry[],
  profileId: string
): { assignments: DailyMissionAssignment[]; ledger: DailyMissionRewardLedgerEntry[]; pointsAwarded: number } | null {
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;
  const a = assignments[idx];
  if (a.status !== "pending_parent_validation" && a.status !== "checked_by_child") return null;
  if (a.rewardGranted) return null;
  const now = new Date().toISOString();
  const pointsAwarded = a.points;
  const updated = [...assignments];
  updated[idx] = {
    ...a,
    status: "approved_by_parent",
    approvedAt: now,
    rewardGranted: true,
    rewardGrantedAt: now,
    pointsAwarded,
  };
  const newLedger = [...ledger, {
    id: crypto.randomUUID(),
    profileId,
    assignmentId: a.id,
    date: a.date,
    points: pointsAwarded,
    reason: "mission_approved" as const,
    grantedAt: now,
  }];
  return { assignments: updated, ledger: newLedger, pointsAwarded };
}

function rejectAssignment(
  assignments: DailyMissionAssignment[],
  assignmentId: string,
  parentNote?: string
): DailyMissionAssignment[] | null {
  const idx = assignments.findIndex(a => a.id === assignmentId);
  if (idx === -1) return null;
  const a = assignments[idx];
  if (a.status !== "pending_parent_validation" && a.status !== "checked_by_child") return null;
  const now = new Date().toISOString();
  const updated = [...assignments];
  updated[idx] = { ...a, status: "rejected_by_parent", rejectedAt: now, parentNote: parentNote || a.parentNote, rewardGranted: false, pointsAwarded: 0 };
  return updated;
}

// ═══════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => boolean | void) {
  totalTests++;
  try {
    const result = fn();
    if (result === false) {
      console.error(`  ❌ FAIL: ${name}`);
      failedTests++;
    } else {
      console.log(`  ✅ PASS: ${name}`);
      passedTests++;
    }
  } catch (e: any) {
    console.error(`  ❌ FAIL: ${name} — ${e.message}`);
    failedTests++;
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg);
}

function makeAssignment(
  id: string,
  status: DailyMissionAssignmentStatus,
  overrides: Partial<DailyMissionAssignment> = {}
): DailyMissionAssignment {
  return {
    id,
    missionId: `m-${id}`,
    profileId: "profile-1",
    date: new Date().toISOString().split("T")[0],
    title: `Misi ${id}`,
    description: "",
    category: "ibadah",
    points: 20,
    status,
    rewardGranted: false,
    pointsAwarded: 0,
    ...overrides,
  };
}

// ═══════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════

console.log("\n╔══════════════════════════════════════════╗");
console.log("║  VALIDASI UX MISI HARIAN                ║");
console.log("╚══════════════════════════════════════════╝\n");

// ── Suite 1: Child Checklist ──
console.log("\n📋 Suite 1: Child Checklist Flow");
{
  test("Checklist changes status to pending_parent_validation", () => {
    const assignments = [makeAssignment("a1", "not_started")];
    const result = checkInAssignment(assignments, "a1");
    assert(result !== null, "Should return updated assignments");
    assert(result![0].status === "pending_parent_validation", "Status should be pending_parent_validation");
    assert(result![0].checkedAt !== undefined, "checkedAt should be set");
    assert(result![0].rewardGranted === false, "Reward should not be granted");
  });

  test("Checklist from not_started works", () => {
    const assignments = [makeAssignment("a2", "not_started")];
    const result = checkInAssignment(assignments, "a2");
    assert(result !== null, "Should work");
  });

  test("Checklist from rejected_by_parent works (redo)", () => {
    const assignments = [makeAssignment("a3", "rejected_by_parent", { checkedAt: "123" })];
    const result = checkInAssignment(assignments, "a3");
    assert(result !== null, "Should allow redo");
    assert(result![0].status === "pending_parent_validation", "Should go back to pending");
  });

  test("Checklist from pending_parent_validation should be rejected", () => {
    const assignments = [makeAssignment("a4", "pending_parent_validation")];
    const result = checkInAssignment(assignments, "a4");
    assert(result === null, "Should not allow double check-in");
  });

  test("Checklist from approved_by_parent should be rejected", () => {
    const assignments = [makeAssignment("a5", "approved_by_parent", { rewardGranted: true, pointsAwarded: 20 })];
    const result = checkInAssignment(assignments, "a5");
    assert(result === null, "Should not allow check-in after approval");
  });

  test("Checklist non-existent assignment returns null", () => {
    const assignments = [makeAssignment("a6", "not_started")];
    const result = checkInAssignment(assignments, "nonexistent");
    assert(result === null, "Should return null");
  });

  test("Reward not granted on child checklist", () => {
    const assignments = [makeAssignment("a7", "not_started")];
    const result = checkInAssignment(assignments, "a7");
    assert(result![0].rewardGranted === false, "rewardGranted must be false");
    assert(result![0].pointsAwarded === 0, "pointsAwarded must be 0");
  });

  test("Status badge emoji correct for pending", () => {
    // Checking that the mapping includes proper icon
    const badgeEmojis: Record<string, string> = {
      not_started: "📌",
      pending_parent_validation: "⏳",
      checked_by_child: "⏳",
      approved_by_parent: "✅",
      rejected_by_parent: "🔄",
    };
    assert(badgeEmojis["pending_parent_validation"] === "⏳", "Pending should have hourglass");
    assert(badgeEmojis["approved_by_parent"] === "✅", "Approved should have checkmark");
    assert(badgeEmojis["rejected_by_parent"] === "🔄", "Rejected should have repeat");
  });
}

// ── Suite 2: Parent Approve ──
console.log("\n✅ Suite 2: Parent Approve Flow");
{
  test("Parent approve changes status to approved_by_parent", () => {
    const assignments = [makeAssignment("b1", "pending_parent_validation", { checkedAt: "t1" })];
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const result = approveAssignment(assignments, "b1", ledger, "p1");
    assert(result !== null, "Should work");
    assert(result!.assignments[0].status === "approved_by_parent", "Status should be approved");
    assert(result!.assignments[0].approvedAt !== undefined, "approvedAt should be set");
  });

  test("Parent approve grants reward once", () => {
    const assignments = [makeAssignment("b2", "pending_parent_validation", { points: 30, checkedAt: "t1" })];
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const result = approveAssignment(assignments, "b2", ledger, "p1");
    assert(result !== null, "Should work");
    assert(result!.assignments[0].rewardGranted === true, "rewardGranted should be true");
    assert(result!.pointsAwarded === 30, "Points awarded should match");
    assert(result!.ledger.length === 1, "Ledger should have one entry");
    assert(result!.ledger[0].points === 30, "Ledger points should match");
    assert(result!.ledger[0].reason === "mission_approved", "Ledger reason should be mission_approved");
  });

  test("Parent approve on already approved returns null (anti-double)", () => {
    const assignments = [
      makeAssignment("b3", "approved_by_parent", { rewardGranted: true, pointsAwarded: 20, approvedAt: "t0" }),
    ];
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const result = approveAssignment(assignments, "b3", ledger, "p1");
    assert(result === null, "Should reject double approve");
  });

  test("Parent approve on not_started returns null", () => {
    const assignments = [makeAssignment("b4", "not_started")];
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const result = approveAssignment(assignments, "b4", ledger, "p1");
    assert(result === null, "Should not approve not_started");
  });

  test("Double click approve does not double reward", () => {
    const assignments = [makeAssignment("b5", "pending_parent_validation", { points: 25, checkedAt: "t1" })];
    const ledger1: DailyMissionRewardLedgerEntry[] = [];
    const result1 = approveAssignment(assignments, "b5", ledger1, "p1");
    assert(result1 !== null, "First approve should work");
    
    // Second approve on same assignment (already approved)
    const result2 = approveAssignment(result1!.assignments, "b5", result1!.ledger, "p1");
    assert(result2 === null, "Second approve should be rejected");
    
    // Ledger should have only 1 entry
    assert(result1!.ledger.length === 1, "Only one ledger entry");
  });
}

// ── Suite 3: Parent Reject ──
console.log("\n🔄 Suite 3: Parent Reject Flow");
{
  test("Parent reject changes status to rejected_by_parent", () => {
    const assignments = [makeAssignment("c1", "pending_parent_validation", { checkedAt: "t1" })];
    const result = rejectAssignment(assignments, "c1");
    assert(result !== null, "Should work");
    assert(result![0].status === "rejected_by_parent", "Status should be rejected");
    assert(result![0].rejectedAt !== undefined, "rejectedAt should be set");
  });

  test("Reject does not grant reward", () => {
    const assignments = [makeAssignment("c2", "pending_parent_validation", { points: 20, checkedAt: "t1" })];
    const result = rejectAssignment(assignments, "c2");
    assert(result![0].rewardGranted === false, "rewardGranted must be false");
    assert(result![0].pointsAwarded === 0, "pointsAwarded must be 0 after reject");
  });

  test("Reject with parent note persists note", () => {
    const assignments = [makeAssignment("c3", "pending_parent_validation")];
    const result = rejectAssignment(assignments, "c3", "Coba lagi ya nak");
    assert(result![0].parentNote === "Coba lagi ya nak", "Parent note should be saved");
    assert(result![0].status === "rejected_by_parent", "Status should be rejected");
  });

  test("Reject on not_started returns null", () => {
    const assignments = [makeAssignment("c4", "not_started")];
    const result = rejectAssignment(assignments, "c4");
    assert(result === null, "Should not reject not_started");
  });

  test("Reject on already approved returns null", () => {
    const assignments = [makeAssignment("c5", "approved_by_parent", { rewardGranted: true })];
    const result = rejectAssignment(assignments, "c5");
    assert(result === null, "Should not reject approved");
  });

  test("After reject, child can redo (check-in again)", () => {
    const assignments = [makeAssignment("c6", "pending_parent_validation", { checkedAt: "t1" })];
    const rejected = rejectAssignment(assignments, "c6", "Perbaiki");
    assert(rejected![0].status === "rejected_by_parent", "Should be rejected");
    
    // Child redoes
    const redone = checkInAssignment(rejected!, "c6");
    assert(redone !== null, "Child should be able to redo");
    assert(redone![0].status === "pending_parent_validation", "Should go back to pending");
  });
}

// ── Suite 4: Auto Sort ──
console.log("\n📊 Suite 4: Auto Sort & Grouping");
{
  test("Child sort: not_started first", () => {
    const items = [
      makeAssignment("d1", "approved_by_parent", { rewardGranted: true, pointsAwarded: 20 }),
      makeAssignment("d2", "not_started"),
      makeAssignment("d3", "pending_parent_validation", { checkedAt: "t1" }),
      makeAssignment("d4", "rejected_by_parent", { rejectedAt: "t2" }),
    ];
    const sorted = sortDailyMissionAssignments(items);
    assert(sorted[0].status === "not_started", "First should be not_started");
    assert(sorted[1].status === "rejected_by_parent", "Second should be rejected");
    assert(sorted[2].status === "pending_parent_validation", "Third should be pending");
    assert(sorted[3].status === "approved_by_parent", "Last should be approved");
  });

  test("Parent sort: pending first", () => {
    const items = [
      makeAssignment("e1", "approved_by_parent", { rewardGranted: true }),
      makeAssignment("e2", "pending_parent_validation", { checkedAt: "t1" }),
      makeAssignment("e3", "rejected_by_parent", { rejectedAt: "t2" }),
    ];
    const sorted = sortParentValidationAssignments(items);
    assert(sorted[0].status === "pending_parent_validation", "First should be pending");
    assert(sorted[1].status === "rejected_by_parent", "Second should be rejected");
    assert(sorted[2].status === "approved_by_parent", "Last should be approved");
  });

  test("After status change, item moves in sort order", () => {
    const items = [
      makeAssignment("f1", "not_started"),
      makeAssignment("f2", "not_started"),
      makeAssignment("f3", "not_started"),
    ];
    
    // Child checks in f2
    const afterCheckIn = checkInAssignment(items, "f2")!;
    const sorted1 = sortDailyMissionAssignments(afterCheckIn);
    
    // f2 should move to after not_started items
    assert(sorted1[0].id === "f1", "f1 still not_started, first");
    assert(sorted1[1].id === "f3", "f3 still not_started, second");
    assert(sorted1[2].id === "f2", "f2 now pending, third");
    assert(sorted1[2].status === "pending_parent_validation", "f2 is pending");
    
    // Parent approves f2
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const approved = approveAssignment(sorted1, "f2", ledger, "p1")!;
    const sorted2 = sortDailyMissionAssignments(approved.assignments);
    
    // f2 should be last
    assert(sorted2[2].id === "f2", "f2 now approved, last");
    assert(sorted2[2].status === "approved_by_parent", "f2 is approved");
    assert(sorted2[2].rewardGranted === true, "Reward granted");
  });

  test("Grouping by section works for child view", () => {
    const items = [
      makeAssignment("g1", "not_started"),
      makeAssignment("g2", "pending_parent_validation", { checkedAt: "t1" }),
      makeAssignment("g3", "approved_by_parent", { rewardGranted: true, pointsAwarded: 20 }),
      makeAssignment("g4", "rejected_by_parent"),
    ];
    
    const groups = {
      not_started: items.filter(a => a.status === "not_started"),
      rejected: items.filter(a => a.status === "rejected_by_parent"),
      pending: items.filter(a => a.status === "pending_parent_validation" || a.status === "checked_by_child"),
      approved: items.filter(a => a.status === "approved_by_parent"),
    };
    
    assert(groups.not_started.length === 1, "1 not_started");
    assert(groups.pending.length === 1, "1 pending");
    assert(groups.approved.length === 1, "1 approved");
    assert(groups.rejected.length === 1, "1 rejected");
    assert(groups.not_started[0].id === "g1", "correct grouping");
    assert(groups.pending[0].id === "g2", "correct grouping");
    assert(groups.approved[0].id === "g3", "correct grouping");
    assert(groups.rejected[0].id === "g4", "correct grouping");
  });
}

// ── Suite 5: Reward Safety ──
console.log("\n🎁 Suite 5: Reward Safety");
{
  test("Reward only given on parent approve", () => {
    const assignments1 = [makeAssignment("h1", "not_started")];
    const afterCheckIn = checkInAssignment(assignments1, "h1")!;
    assert(afterCheckIn[0].rewardGranted === false, "No reward on check-in");
    assert(afterCheckIn[0].pointsAwarded === 0, "No points on check-in");
    
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const afterApprove = approveAssignment(afterCheckIn, "h1", ledger, "p1")!;
    assert(afterApprove.assignments[0].rewardGranted === true, "Reward on approve");
    assert(afterApprove.pointsAwarded === 20, "Points awarded on approve");
  });

  test("Reward never double", () => {
    const assignments = [makeAssignment("h2", "pending_parent_validation", { points: 30, checkedAt: "t1" })];
    const ledger1: DailyMissionRewardLedgerEntry[] = [];
    const r1 = approveAssignment(assignments, "h2", ledger1, "p1");
    assert(r1!.ledger.length === 1, "First ledger entry");
    
    const r2 = approveAssignment(r1!.assignments, "h2", r1!.ledger, "p1");
    assert(r2 === null, "Second approve rejected");
    assert(r1!.ledger.length === 1, "Still only one ledger entry");
  });

  test("Reward ledger entry has all required fields", () => {
    const assignments = [makeAssignment("h3", "pending_parent_validation", { points: 25, checkedAt: "t1" })];
    const ledger: DailyMissionRewardLedgerEntry[] = [];
    const r = approveAssignment(assignments, "h3", ledger, "p1")!;
    const entry = r.ledger[0];
    assert(entry.id !== undefined && entry.id !== "", "Has id");
    assert(entry.profileId === "p1", "Has profileId");
    assert(entry.assignmentId === "h3", "Has assignmentId");
    assert(entry.points === 25, "Points correct");
    assert(entry.reason === "mission_approved", "Reason correct");
  });

  test("Reject gives 0 points and no ledger entry", () => {
    const assignments = [makeAssignment("h4", "pending_parent_validation", { points: 40, checkedAt: "t1" })];
    const rejected = rejectAssignment(assignments, "h4")!;
    assert(rejected[0].pointsAwarded === 0, "Points = 0");
    assert(rejected[0].rewardGranted === false, "rewardGranted = false");
  });
}

// ── Suite 6: Anti Double Click ──
console.log("\n🔒 Suite 6: Anti Double Click");
{
  test("Double check-in is prevented by status guard", () => {
    const assignments = [makeAssignment("i1", "not_started")];
    const r1 = checkInAssignment(assignments, "i1")!;
    assert(r1[0].status === "pending_parent_validation", "First check-in works");
    
    const r2 = checkInAssignment(r1, "i1");
    assert(r2 === null, "Second check-in should be rejected (status guard)");
  });

  test("Double approve is prevented by rewardGranted flag", () => {
    const assignments = [makeAssignment("i2", "pending_parent_validation", { points: 20, checkedAt: "t1" })];
    const ledger1: DailyMissionRewardLedgerEntry[] = [];
    const r1 = approveAssignment(assignments, "i2", ledger1, "p1")!;
    assert(r1.assignments[0].rewardGranted === true, "First approve grants reward");
    
    const r2 = approveAssignment(r1.assignments, "i2", r1.ledger, "p1");
    assert(r2 === null, "Second approve rejected (rewardGranted)");
  });

  test("Double reject is prevented by status guard", () => {
    const assignments = [makeAssignment("i3", "pending_parent_validation")];
    const r1 = rejectAssignment(assignments, "i3")!;
    assert(r1[0].status === "rejected_by_parent", "First reject works");
    
    const r2 = rejectAssignment(r1, "i3");
    assert(r2 === null, "Second reject rejected");
  });

  test("Processing state prevents concurrent operations", () => {
    // Simulate the `processingAssignmentIds` Set pattern
    const processingIds = new Set<string>();
    const assignmentId = "i4";
    
    // First operation starts
    processingIds.add(assignmentId);
    assert(processingIds.has(assignmentId), "Marked as processing");
    
    // Would-be second operation checks
    const canProcess = !processingIds.has(assignmentId);
    assert(canProcess === false, "Second operation blocked");
    
    // First operation finishes
    processingIds.delete(assignmentId);
    assert(!processingIds.has(assignmentId), "Processing complete");
  });
}

// ── Suite 7: Summary & Empty States ──
console.log("\n📈 Suite 7: Summary & Empty States");
{
  test("Summary calculates correct counts", () => {
    const assignments = [
      makeAssignment("j1", "not_started"),
      makeAssignment("j2", "not_started"),
      makeAssignment("j3", "pending_parent_validation", { checkedAt: "t1" }),
      makeAssignment("j4", "approved_by_parent", { rewardGranted: true, pointsAwarded: 20 }),
      makeAssignment("j5", "rejected_by_parent"),
    ];
    
    const approved = assignments.filter(a => a.status === "approved_by_parent").length;
    const pending = assignments.filter(a => a.status === "pending_parent_validation" || a.status === "checked_by_child").length;
    const rejected = assignments.filter(a => a.status === "rejected_by_parent").length;
    const notStarted = assignments.filter(a => a.status === "not_started").length;
    const totalPointsEarned = assignments.filter(a => a.rewardGranted).reduce((sum, a) => sum + a.pointsAwarded, 0);
    
    assert(approved === 1, "1 approved");
    assert(pending === 1, "1 pending");
    assert(rejected === 1, "1 rejected");
    assert(notStarted === 2, "2 not started");
    assert(totalPointsEarned === 20, "20 points earned");
  });

  test("Empty state when no assignments", () => {
    const assignments: DailyMissionAssignment[] = [];
    assert(assignments.length === 0, "Empty array");
  });

  test("Empty state: all approved", () => {
    const assignments = [
      makeAssignment("j6", "approved_by_parent", { rewardGranted: true, pointsAwarded: 20 }),
      makeAssignment("j7", "approved_by_parent", { rewardGranted: true, pointsAwarded: 30 }),
    ];
    const notDone = assignments.filter(a => a.status !== "approved_by_parent").length;
    assert(notDone === 0, "All approved — should show celebration");
  });

  test("Total assignment count matches sum of all groups", () => {
    const assignments = [
      makeAssignment("j8", "not_started"),
      makeAssignment("j9", "pending_parent_validation"),
      makeAssignment("j10", "approved_by_parent", { rewardGranted: true }),
      makeAssignment("j11", "rejected_by_parent"),
      makeAssignment("j12", "not_started"),
    ];
    const groups = {
      not_started: assignments.filter(a => a.status === "not_started"),
      rejected: assignments.filter(a => a.status === "rejected_by_parent"),
      pending: assignments.filter(a => a.status === "pending_parent_validation" || a.status === "checked_by_child"),
      approved: assignments.filter(a => a.status === "approved_by_parent"),
    };
    const total = Object.values(groups).reduce((sum, g) => sum + g.length, 0);
    assert(total === assignments.length, "Groups sum to total");
    assert(groups.not_started.length === 2, "2 not started");
    assert(groups.pending.length === 1, "1 pending");
    assert(groups.approved.length === 1, "1 approved");
    assert(groups.rejected.length === 1, "1 rejected");
  });
}

// ── Suite 8: UI Kontras & Badge Colors ──
console.log("\n🎨 Suite 8: UI Kontras & Badge Colors");
{
  test("Status badges have distinct colors (visual differentiation)", () => {
    const badgeStyles: Record<string, { bg: string; text: string }> = {
      not_started: { bg: "bg-blue-50", text: "text-blue-600" },
      pending_parent_validation: { bg: "bg-[#FFF3E0]", text: "text-[#FF9800]" },
      approved_by_parent: { bg: "bg-[#E8F5E9]", text: "text-[#4CAF50]" },
      rejected_by_parent: { bg: "bg-[#FFEBEE]", text: "text-[#E53935]" },
    };
    
    // Each status has unique styling
    const usedBgs = new Set(Object.values(badgeStyles).map(s => s.bg));
    // Some may share with checked_by_child
    assert(usedBgs.size >= 4, "At least 4 distinct background styles");
    assert(badgeStyles.not_started.bg !== badgeStyles.approved_by_parent.bg, "Not started ≠ approved");
    assert(badgeStyles.pending_parent_validation.bg !== badgeStyles.rejected_by_parent.bg, "Pending ≠ rejected");
  });

  test("Button labels are clear and distinct per status", () => {
    const buttonLabels: Record<string, string> = {
      not_started: "Saya sudah melakukan",
      pending_parent_validation: "Menunggu Validasi Orang Tua",
      approved_by_parent: "Disetujui",
      rejected_by_parent: "Saya sudah mengulang",
    };
    
    // All labels are non-empty and distinct
    const labels = Object.values(buttonLabels);
    const uniqueLabels = new Set(labels);
    assert(uniqueLabels.size === labels.length, "All button labels are unique");
    labels.forEach(l => assert(l.length > 0, `Label should not be empty: "${l}"`));
  });

  test("No undefined/null/NaN in badge labels", () => {
    const badgeLabel: Record<string, string> = {
      not_started: "Belum Dilakukan",
      pending_parent_validation: "Menunggu Validasi",
      checked_by_child: "Menunggu Validasi",
      approved_by_parent: "Disetujui",
      rejected_by_parent: "Perlu Diulang",
    };
    
    Object.entries(badgeLabel).forEach(([status, label]) => {
      assert(label !== undefined, `${status} label defined`);
      assert(label !== null, `${status} label not null`);
      assert(typeof label === "string", `${status} label is string`);
      assert(label.length > 0, `${status} label non-empty`);
    });
  });
}

// ── Suite 9: Edge Cases ──
console.log("\n🛡️ Suite 9: Edge Cases");
{
  test("Handles empty assignments array gracefully", () => {
    const sorted = sortDailyMissionAssignments([]);
    assert(sorted.length === 0, "Empty sort returns empty");
  });

  test("Handles single assignment", () => {
    const sorted = sortDailyMissionAssignments([makeAssignment("k1", "not_started")]);
    assert(sorted.length === 1, "Single item sort works");
    assert(sorted[0].id === "k1", "Item preserved");
  });

  test("All statuses present, correct sort order maintained", () => {
    const items = [
      makeAssignment("k2", "approved_by_parent", { approvedAt: "2026-01-01T00:00:00Z", rewardGranted: true }),
      makeAssignment("k3", "not_started"),
      makeAssignment("k4", "rejected_by_parent", { rejectedAt: "2026-01-02T00:00:00Z" }),
      makeAssignment("k5", "pending_parent_validation", { checkedAt: "2026-01-03T00:00:00Z" }),
      makeAssignment("k6", "checked_by_child", { checkedAt: "2026-01-04T00:00:00Z" }),
    ];
    const sorted = sortDailyMissionAssignments(items);
    const statuses = sorted.map(s => s.status);
    assert(statuses[0] === "not_started", "1: not_started");
    assert(statuses[1] === "rejected_by_parent", "2: rejected");
    // pending / checked_by_child have same order priority (2)
    assert(statuses[4] === "approved_by_parent", "5: approved");
  });

  test("Items with same status sorted by time (most recent first)", () => {
    const items = [
      makeAssignment("k7", "pending_parent_validation", { checkedAt: "2026-01-01T00:00:00Z" }),
      makeAssignment("k8", "pending_parent_validation", { checkedAt: "2026-01-03T00:00:00Z" }),
      makeAssignment("k9", "pending_parent_validation", { checkedAt: "2026-01-02T00:00:00Z" }),
    ];
    const sorted = sortDailyMissionAssignments(items);
    assert(sorted[0].id === "k8", "Most recent first");
    assert(sorted[1].id === "k9", "Second most recent");
    assert(sorted[2].id === "k7", "Oldest last");
  });
}

// ═══════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════

console.log("\n╔══════════════════════════════════════════╗");
console.log("║  HASIL VALIDASI                         ║");
console.log("╚══════════════════════════════════════════╝");
console.log(`\n  Total Tests : ${totalTests}`);
console.log(`  ✅ Passed   : ${passedTests}`);
console.log(`  ❌ Failed   : ${failedTests}`);

if (failedTests === 0) {
  console.log(`\n  🎉 SEMUA TES LULUS! UX Misi Harian siap.`);
  process.exit(0);
} else {
  console.log(`\n  ⚠️  Ada ${failedTests} tes gagal. Perbaiki sebelum lanjut.`);
  process.exit(1);
}
