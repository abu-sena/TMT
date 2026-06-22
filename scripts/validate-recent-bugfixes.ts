/**
 * validate-recent-bugfixes.ts
 * Validasi perbaikan bug Rantai Warna, Jalur Angka, dan Misi Harian.
 * 
 * Run: npx tsx scripts/validate-recent-bugfixes.ts
 */

import { calculateOrbitNodePositions } from "../src/games/color-sequence/generator";
import { generateColorSequenceQuestion, getColorCountForDifficulty, getSequenceLengthForDifficulty, getDifficultyConfig as getCSConfig } from "../src/games/color-sequence/generator";
import { validateColorSequenceStep, createSession as createCSSession, calculateColorSequenceScore } from "../src/games/color-sequence/scoring";
import { generateNumberPathPuzzle, getDifficultyConfig } from "../src/games/number-path/generator";
import { validateNumericInput, validateNumberPathPuzzle, areAllInputsFilled } from "../src/games/number-path/validator";
import { checkInAssignment, approveAssignment, rejectAssignment, getTodayAssignments, sortDailyMissionAssignments } from "../src/lib/dailyMissions";
import type { DifficultyId, Profile, DailyMissionAssignment } from "../src/types";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(`❌ ${label}`);
  }
}

function assertEqual<T>(actual: T, expected: T, label: string) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    failures.push(`❌ ${label} — expected ${String(expected)}, got ${String(actual)}`);
  }
}

// ═══════════════════════════════════════════
// 1. Rantai Warna — Orbit Placement
// ═══════════════════════════════════════════
console.log("\n📋 Suite 1: Rantai Warna — Orbit Placement");

const orbitPositions = calculateOrbitNodePositions(6, 150, 30);
assert(orbitPositions.length === 6, "Orbit: generates correct number of positions");
for (const pos of orbitPositions) {
  assert(pos.x >= 0.05 && pos.x <= 0.95, `Orbit: x in bounds (${pos.x.toFixed(3)})`);
  assert(pos.y >= 0.05 && pos.y <= 0.95, `Orbit: y in bounds (${pos.y.toFixed(3)})`);
}
// Check that all positions are roughly on a circle
const centerX = 0.5, centerY = 0.5;
const distances = orbitPositions.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2));
const avgDist = distances.reduce((s, d) => s + d, 0) / distances.length;
for (const d of distances) {
  assert(Math.abs(d - avgDist) < 0.1, `Orbit: roughly circular (distance ${d.toFixed(3)} vs avg ${avgDist.toFixed(3)})`);
}

// ═══════════════════════════════════════════
// 2. Rantai Warna — Question Generation
// ═══════════════════════════════════════════
console.log("\n📋 Suite 2: Rantai Warna — Question Generation");

const difficulties: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];
for (const diff of difficulties) {
  const q = generateColorSequenceQuestion(diff);
  assert(q.nodes.length > 0, `QGen [${diff}]: has nodes`);
  assert(q.sequenceNumbers.length > 0, `QGen [${diff}]: has sequence`);
  assert(q.sequenceNodeIds.length === q.sequenceNumbers.length, `QGen [${diff}]: seqIds match seqNums`);
  assert(q.nodes.length >= q.sequenceNumbers.length, `QGen [${diff}]: enough nodes for sequence`);
  
  // All nodes should be within 0.05-0.95 x,y bounds
  for (const node of q.nodes) {
    assert(node.x >= 0.05 && node.x <= 0.95, `QGen [${diff}]: node x=${node.x.toFixed(3)} in bounds`);
    assert(node.y >= 0.05 && node.y <= 0.95, `QGen [${diff}]: node y=${node.y.toFixed(3)} in bounds`);
  }
}

// ═══════════════════════════════════════════
// 3. Rantai Warna — Node Numbers (REMOVED from arena)
// ═══════════════════════════════════════════
console.log("\n📋 Suite 3: Rantai Warna — Node Properties");

const q = generateColorSequenceQuestion("sd-atas");
// Nodes must have numbers (for legend), but the SCREEN should not render them in arena
for (const node of q.nodes) {
  assert(typeof node.number === "number" && node.number >= 1, `Node: has valid number (${node.number})`);
  assert(typeof node.colorHex === "string" && node.colorHex.startsWith("#"), `Node: has valid colorHex`);
}
// Sequence numbers must be valid
for (const num of q.sequenceNumbers) {
  assert(q.nodes.some(n => n.number === num), `Seq: number ${num} exists in nodes`);
}

// ═══════════════════════════════════════════
// 4. Rantai Warna — Drag/Line Support
// ═══════════════════════════════════════════
console.log("\n📋 Suite 4: Rantai Warna — Session & Validation");

const session = createCSSession(q);
assert(session.selectedNodeIds.length === 0, "Session: starts empty");
assert(session.mistakes === 0, "Session: no mistakes initially");
assert(!session.isCompleted, "Session: not completed initially");

// Validate first correct step
const firstExpected = q.sequenceNodeIds[0];
const result1 = validateColorSequenceStep(q, session, firstExpected);
assert(result1.isCorrect, "Validate: first correct step");
assert(!result1.isSequenceComplete, "Validate: not complete after 1 step");

// Validate wrong node
const wrongNode = q.nodes.find(n => n.id !== firstExpected && !q.sequenceNodeIds.includes(n.id));
if (wrongNode) {
  const resultWrong = validateColorSequenceStep(q, session, wrongNode.id);
  assert(resultWrong.isWrongNode, "Validate: wrong node detected");
  assert(!resultWrong.isCorrect, "Validate: wrong node not correct");
}

// Complete full sequence
let s = session;
for (const nodeId of q.sequenceNodeIds) {
  const r = validateColorSequenceStep(q, s, nodeId);
  assert(r.isCorrect, `Validate: step correct for ${nodeId}`);
  s = { ...s, selectedNodeIds: [...s.selectedNodeIds, nodeId] };
}
assert(s.selectedNodeIds.length === q.sequenceNodeIds.length, "Validate: all steps completed");

const score = calculateColorSequenceScore(s, "sd-atas");
assert(score.totalScore >= 0, "Score: totalScore non-negative");
assert(score.accuracy >= 0 && score.accuracy <= 100, "Score: accuracy 0-100");

// ═══════════════════════════════════════════
// 5. Jalur Angka — Path Generation
// ═══════════════════════════════════════════
console.log("\n📋 Suite 5: Jalur Angka — Path Generation");

for (const diff of difficulties) {
  const puzzle = generateNumberPathPuzzle(diff);
  assert(puzzle.cells.length > 0, `JAGen [${diff}]: has cells`);
  assert(puzzle.inputCellIds.length > 0, `JAGen [${diff}]: has input cells`);
  assert(puzzle.pathCellIds.length > 0, `JAGen [${diff}]: has path cells`);
  assert(puzzle.connectors.length === puzzle.pathCellIds.length - 1, `JAGen [${diff}]: correct connector count`);
  assert(Object.keys(puzzle.solutionMap).length === puzzle.inputCellIds.length, `JAGen [${diff}]: solutionMap matches inputs`);
  
  // Solution map values should be valid numbers
  for (const [id, val] of Object.entries(puzzle.solutionMap)) {
    assert(typeof val === "number" && !isNaN(val), `JAGen [${diff}]: solution ${id} is valid number`);
    assert(puzzle.inputCellIds.includes(id), `JAGen [${diff}]: solution ${id} is input cell`);
  }
}

// ═══════════════════════════════════════════
// 6. Jalur Angka — Input Validation
// ═══════════════════════════════════════════
console.log("\n📋 Suite 6: Jalur Angka — Input Validation");

const puzzle = generateNumberPathPuzzle("sd-atas");

// Valid numeric input
const v1 = validateNumericInput("42", false, false);
assert(v1.isValid, "Input: '42' is valid");
const v2 = validateNumericInput("-5", true, false);
assert(v2.isValid, "Input: '-5' valid with allowNegative");
const v3 = validateNumericInput("-5", false, false);
assert(!v3.isValid, "Input: '-5' rejected without allowNegative");
const v4 = validateNumericInput("abc", false, false);
assert(!v4.isValid, "Input: 'abc' rejected");
const v5 = validateNumericInput("", false, false);
assert(!v5.isValid, "Input: empty rejected");
const v6 = validateNumericInput("  ", false, false);
assert(!v6.isValid, "Input: whitespace rejected");

// Check all inputs filled detection
const partialSession = { userInputs: {}, mistakes: 0, hintsUsed: 0 } as any;
assert(!areAllInputsFilled(puzzle, partialSession), "Filled: empty session not filled");

const fullSession = { userInputs: {}, mistakes: 0, hintsUsed: 0 } as any;
for (const id of puzzle.inputCellIds) {
  fullSession.userInputs[id] = String(puzzle.solutionMap[id]);
}
assert(areAllInputsFilled(puzzle, fullSession), "Filled: full session is filled");

// Validate correct puzzle
const correctResult = validateNumberPathPuzzle(puzzle, fullSession as any);
assert(correctResult.allCorrect, "ValidatePuzzle: all correct");
assertEqual(correctResult.correctCount, puzzle.inputCellIds.length, "ValidatePuzzle: correct count");

// Validate wrong puzzle
const wrongSession = { userInputs: {}, mistakes: 0, hintsUsed: 0 } as any;
for (const id of puzzle.inputCellIds) {
  wrongSession.userInputs[id] = String(puzzle.solutionMap[id] + 999);
}
const wrongResult = validateNumberPathPuzzle(puzzle, wrongSession as any);
assert(!wrongResult.allCorrect, "ValidatePuzzle: wrong answers detected");
assert(wrongResult.correctCount < puzzle.inputCellIds.length, "ValidatePuzzle: some wrong");

// ═══════════════════════════════════════════
// 7. Misi Harian — Child Check-in Flow
// ═══════════════════════════════════════════
console.log("\n📋 Suite 7: Misi Harian — Child Check-in");

// Create a mock profile with a daily assignment
const mockAssignment: DailyMissionAssignment = {
  id: "test-assign-1",
  missionId: "test-mission-1",
  profileId: "test-profile",
  date: new Date().toISOString().split("T")[0],
  title: "Test Mission",
  description: "Test description",
  category: "adab",
  points: 20,
  status: "not_started",
  rewardGranted: false,
  pointsAwarded: 0,
};

const mockProfile: Profile = {
  id: "test-profile",
  name: "Test Child",
  avatar: "🧒",
  gender: "unspecified",
  difficulty: "sd-bawah",
  xp: 0, level: 1, points: 0, coins: 0, hearts: 5, streak: 0, adabStreak: 0,
  badges: [],
  missionProgress: {},
  categoryStats: {} as any,
  totalMissionsCompleted: 0,
  timePlayedMinutes: 0,
  settings: { sound: true, music: true, language: "id", googleConnected: false, screenTimeReminder: false, screenTimeMinutes: 0 },
  dailyMissionAssignments: [mockAssignment],
  claimedStageRewardIds: [],
  unlockedDifficulties: ["sd-bawah"],
  currentDifficulty: "sd-bawah",
  completedDifficulties: [],
  difficultyUpgradeAvailable: false,
  claimedFinalRewardsByDifficulty: {},
  pendingDifficultyUpgrade: null,
  pendingFinalRewardDifficulty: null,
  createdAt: Date.now(),
};

// Child checks in
const result7 = checkInAssignment(mockProfile, "test-assign-1");
assert(result7 !== null, "CheckIn: returns updated profile");
if (result7) {
  const updated = getTodayAssignments(result7).find(a => a.id === "test-assign-1");
  assert(updated?.status === "pending_parent_validation", "CheckIn: status becomes pending_parent_validation");
  assert(updated?.rewardGranted === false, "CheckIn: reward not granted");
  assert(updated?.checkedAt !== undefined, "CheckIn: checkedAt set");
}

// Cannot check in again
const alreadyCheckedProfile: Profile = {
  ...mockProfile,
  dailyMissionAssignments: [{ ...mockAssignment, status: "pending_parent_validation", rewardGranted: false }],
};
const result7b = checkInAssignment(alreadyCheckedProfile, "test-assign-1");
assert(result7b === null, "CheckIn: rejects when already pending");

// Already approved — cannot check in
const approvedProfile: Profile = {
  ...mockProfile,
  dailyMissionAssignments: [{ ...mockAssignment, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 20 }],
};
const result7c = checkInAssignment(approvedProfile, "test-assign-1");
assert(result7c === null, "CheckIn: rejects when already approved");

// ═══════════════════════════════════════════
// 8. Misi Harian — Parent Approve
// ═══════════════════════════════════════════
console.log("\n📋 Suite 8: Misi Harian — Parent Approve");

const pendingProfile: Profile = {
  ...mockProfile,
  dailyMissionAssignments: [{ ...mockAssignment, status: "pending_parent_validation", checkedAt: new Date().toISOString() }],
};
const result8 = approveAssignment(pendingProfile, "test-assign-1");
assert(result8 !== null, "Approve: returns result");
if (result8) {
  assertEqual(result8.pointsAwarded, 20, "Approve: awards correct points");
  const approved = getTodayAssignments(result8.profile).find(a => a.id === "test-assign-1");
  assert(approved?.status === "approved_by_parent", "Approve: status becomes approved");
  assert(approved?.rewardGranted === true, "Approve: rewardGranted true");
  assert(approved?.approvedAt !== undefined, "Approve: approvedAt set");
  assert(result8.profile.points > mockProfile.points, "Approve: profile points increased");
}

// Anti-double-approve
const alreadyApprovedProfile: Profile = {
  ...mockProfile,
  dailyMissionAssignments: [{ ...mockAssignment, status: "approved_by_parent", rewardGranted: true, pointsAwarded: 20 }],
};
const result8b = approveAssignment(alreadyApprovedProfile, "test-assign-1");
assert(result8b === null, "Approve: rejects double-approve (rewardGranted guard)");

// ═══════════════════════════════════════════
// 9. Misi Harian — Parent Reject
// ═══════════════════════════════════════════
console.log("\n📋 Suite 9: Misi Harian — Parent Reject");

const result9 = rejectAssignment(pendingProfile, "test-assign-1");
assert(result9 !== null, "Reject: returns updated profile");
if (result9) {
  const rejected = getTodayAssignments(result9).find(a => a.id === "test-assign-1");
  assert(rejected?.status === "rejected_by_parent", "Reject: status becomes rejected");
  assert(rejected?.rewardGranted === false, "Reject: rewardGranted false");
  assert(rejected?.rejectedAt !== undefined, "Reject: rejectedAt set");
  assert(rejected?.pointsAwarded === 0, "Reject: pointsAwarded 0");
}

// Cannot reject already approved
const result9b = rejectAssignment(alreadyApprovedProfile, "test-assign-1");
assert(result9b === null, "Reject: rejects when already approved");

// ═══════════════════════════════════════════
// 10. Misi Harian — Auto Sort
// ═══════════════════════════════════════════
console.log("\n📋 Suite 10: Misi Harian — Auto Sort");

const mixed: DailyMissionAssignment[] = [
  { ...mockAssignment, id: "a-1", status: "approved_by_parent", rewardGranted: true },
  { ...mockAssignment, id: "a-2", status: "not_started" },
  { ...mockAssignment, id: "a-3", status: "pending_parent_validation" },
  { ...mockAssignment, id: "a-4", status: "rejected_by_parent" },
  { ...mockAssignment, id: "a-5", status: "not_started" },
];

const sorted = sortDailyMissionAssignments(mixed);
const order = sorted.map(s => s.status);

// Expected order: not_started → rejected → pending → approved
const notStartedIdx = order.indexOf("not_started");
const rejectedIdx = order.indexOf("rejected_by_parent");
const pendingIdx = order.indexOf("pending_parent_validation");
const approvedIdx = order.indexOf("approved_by_parent");

assert(notStartedIdx < rejectedIdx, "Sort: not_started before rejected");
assert(rejectedIdx < pendingIdx, "Sort: rejected before pending");
assert(pendingIdx < approvedIdx, "Sort: pending before approved");

// ═══════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════
console.log(`\n${"═".repeat(60)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  ${f}`);
}
console.log(`${"═".repeat(60)}`);

if (failed > 0) {
  process.exit(1);
}
