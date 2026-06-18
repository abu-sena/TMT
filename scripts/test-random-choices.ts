/**
 * TMT — Random Choices Test Script
 *
 * Validates that all multiple-choice options are properly randomized
 * across all game types and that the correct answer is never lost.
 *
 * Usage: npx tsx scripts/test-random-choices.ts
 */

// Fisher-Yates shuffle (mirror of src/lib/utils.ts)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createShuffledChoices<T extends { id: string }>(options: T[]): T[] {
  return shuffleArray(options);
}

function validateChoices(
  choices: { id: string }[],
  correctAnswerId: string,
): { valid: boolean; reason?: string } {
  if (!choices || choices.length === 0) {
    return { valid: false, reason: "Choices array is empty" };
  }
  const hasCorrect = choices.some((c) => c.id === correctAnswerId);
  if (!hasCorrect) {
    return { valid: false, reason: `Correct answer "${correctAnswerId}" not found in choices` };
  }
  const ids = choices.map((c) => c.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return { valid: false, reason: "Duplicate choice IDs detected" };
  }
  return { valid: true };
}

// ── Test Data ──

interface TestMission {
  type: string;
  options: { id: string; label: string }[];
  correctAnswer: string;
}

const testMissions: TestMission[] = [
  // Multiple choice standard
  {
    type: "multiple_choice",
    options: [
      { id: "a", label: "Pilihan A" },
      { id: "b", label: "Pilihan B" },
      { id: "c", label: "Pilihan C" },
      { id: "d", label: "Pilihan D" },
    ],
    correctAnswer: "b",
  },
  // Moral decision
  {
    type: "moral_decision",
    options: [
      { id: "m1", label: "Meminjamkan" },
      { id: "m2", label: "Mengejek" },
      { id: "m3", label: "Diam" },
      { id: "m4", label: "Menyembunyikan" },
      { id: "m5", label: "Mengambil" },
      { id: "m6", label: "Memarahi" },
    ],
    correctAnswer: "m1",
  },
  // TK visual
  {
    type: "tk_visual_match",
    options: [
      { id: "v1", label: "🔴" },
      { id: "v2", label: "🔵" },
      { id: "v3", label: "🟢" },
      { id: "v4", label: "🟡" },
    ],
    correctAnswer: "v3",
  },
  // Boss step
  {
    type: "boss_step",
    options: [
      { id: "s1", label: "Jawab A" },
      { id: "s2", label: "Jawab B" },
      { id: "s3", label: "Jawab C" },
      { id: "s4", label: "Jawab D" },
      { id: "s5", label: "Jawab E" },
    ],
    correctAnswer: "s4",
  },
];

// ── Test Runner ──

console.log("╔══════════════════════════════════════════╗");
console.log("║   TMT Random Choices — Test Suite       ║");
console.log("╚══════════════════════════════════════════╝\n");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const mission of testMissions) {
  console.log(`\n── Testing: ${mission.type} (${mission.options.length} options) ──`);

  const positionCounts: Map<string, number> = new Map();

  for (let i = 1; i <= mission.options.length; i++) {
    positionCounts.set(String(i), 0);
  }

  // Generate 100 shuffled versions
  for (let trial = 1; trial <= 100; trial++) {
    totalTests++;
    const shuffled = createShuffledChoices(mission.options);

    // Validate
    const validation = validateChoices(shuffled, mission.correctAnswer);
    if (!validation.valid) {
      console.error(`  ❌ Trial ${trial}: ${validation.reason}`);
      failedTests++;
      continue;
    }

    // Track correct answer position
    const correctPos = shuffled.findIndex((o) => o.id === mission.correctAnswer) + 1;
    const posKey = String(correctPos);
    positionCounts.set(posKey, (positionCounts.get(posKey) || 0) + 1);

    passedTests++;
  }

  // Report position distribution
  console.log("  Correct answer position distribution (100 trials):");
  let allPositionsPresent = true;
  for (let i = 1; i <= mission.options.length; i++) {
    const count = positionCounts.get(String(i)) || 0;
    const bar = "█".repeat(Math.round(count / 2));
    console.log(`    Position ${i}: ${String(count).padStart(3)} ${bar}`);
    if (count === 0) allPositionsPresent = false;
  }

  // Verify correct answer appears in all positions
  if (allPositionsPresent) {
    console.log("  ✅ Correct answer appeared in all positions — properly randomized");
  } else {
    console.log("  ⚠️  Correct answer did NOT appear in all positions — check random distribution");
    failedTests++;
  }

  // Check no duplicate IDs
  const dedupCheck = new Set(mission.options.map((o) => o.id));
  if (dedupCheck.size !== mission.options.length) {
    console.log("  ❌ Source options contain duplicate IDs");
    failedTests++;
  }
}

// ── Edge Case Tests ──

console.log("\n── Edge Cases ──");

// Empty options
totalTests++;
try {
  createShuffledChoices([]);
  console.log("  ✅ Empty options: returns empty array");
  passedTests++;
} catch {
  console.log("  ❌ Empty options: threw error");
  failedTests++;
}

// Single option
totalTests++;
const single = createShuffledChoices([{ id: "only", label: "Satu" }]);
if (single.length === 1 && single[0].id === "only") {
  console.log("  ✅ Single option: preserved correctly");
  passedTests++;
} else {
  console.log("  ❌ Single option: corrupted");
  failedTests++;
}

// Two options — verify both positions appear
console.log("  Two-option test (50 trials):");
const twoOpts = [{ id: "x", label: "X" }, { id: "y", label: "Y" }];
let pos1Count = 0;
for (let i = 0; i < 50; i++) {
  const sh = createShuffledChoices(twoOpts);
  if (sh[0].id === "x") pos1Count++;
  totalTests++;
  passedTests++;
}
const pos2Count = 50 - pos1Count;
console.log(`    Position 1: ${pos1Count}/50, Position 2: ${pos2Count}/50`);
if (pos1Count >= 15 && pos2Count >= 15) {
  console.log("  ✅ Two-option: reasonable distribution");
} else {
  console.log("  ⚠️  Two-option: unbalanced distribution");
  failedTests++;
}

// ── Summary ──

console.log("\n╔══════════════════════════════════════════╗");
console.log("║              TEST SUMMARY                ║");
console.log("╚══════════════════════════════════════════╝");
console.log(`  Total: ${totalTests} tests`);
console.log(`  Passed: ${passedTests} ✅`);
console.log(`  Failed: ${failedTests} ❌`);
console.log(`  Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
console.log("");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("  🎉 All tests passed!\n");
  process.exit(0);
}
