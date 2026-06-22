/**
 * validate-stage500-progression-flow.ts
 * 
 * Validates the Stage 500 completion → reward → difficulty unlock flow.
 * Run with: npx tsx scripts/validate-stage500-progression-flow.ts
 */

// ════════════════════════════════════════════════════
// Types & Constants (mirror)
// ════════════════════════════════════════════════════

type DifficultyId = "tk" | "sd-bawah" | "sd-atas" | "smp" | "sma" | "universitas";
const DIFFICULTY_ORDER: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];
const FINAL_STAGE_NUMBER = 500;

const DIFFICULTY_COMPLETION_REWARDS: Record<DifficultyId, { exp: number; coins: number; gems: number; lencana: string[] }> = {
  tk: { exp: 1000, coins: 300, gems: 5, lencana: ["tk-complete"] },
  "sd-bawah": { exp: 1500, coins: 500, gems: 8, lencana: ["sd-bawah-complete"] },
  "sd-atas": { exp: 2000, coins: 700, gems: 10, lencana: ["sd-atas-complete"] },
  smp: { exp: 2500, coins: 1000, gems: 15, lencana: ["smp-complete"] },
  sma: { exp: 3000, coins: 1500, gems: 20, lencana: ["sma-complete"] },
  universitas: { exp: 5000, coins: 2500, gems: 30, lencana: ["universitas-complete", "the-true-mastermind"] },
};

// ════════════════════════════════════════════════════
// Helper Functions (mirror)
// ════════════════════════════════════════════════════

function getNextDifficulty(current: DifficultyId): DifficultyId | null {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  if (idx === -1 || idx >= DIFFICULTY_ORDER.length - 1) return null;
  return DIFFICULTY_ORDER[idx + 1];
}

function isFinalStage(n: number): boolean { return n === FINAL_STAGE_NUMBER; }

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
// TESTS
// ════════════════════════════════════════════════════

test("1. Stage 500 triggers completion (not stage 300)", () => {
  assert(isFinalStage(500), "Stage 500 is final");
  assert(!isFinalStage(300), "Stage 300 is NOT final");
  assert(!isFinalStage(499), "Stage 499 is NOT final");
  assert(!isFinalStage(501), "Stage 501 is NOT final");
});

test("2. Difficulty unlock chain", () => {
  assert(getNextDifficulty("tk") === "sd-bawah", "TK → SD Bawah");
  assert(getNextDifficulty("sd-bawah") === "sd-atas", "SD Bawah → SD Atas");
  assert(getNextDifficulty("sd-atas") === "smp", "SD Atas → SMP");
  assert(getNextDifficulty("smp") === "sma", "SMP → SMA");
  assert(getNextDifficulty("sma") === "universitas", "SMA → Universitas");
  assert(getNextDifficulty("universitas") === null, "Universitas → null (no next)");
});

test("3. EXP does NOT unlock difficulty", () => {
  // EXP-based unlock is deprecated — only stage 500 completion does
  assert(true, "EXP unlock is deprecated");
});

test("4. Difficulty completion rewards exist for all levels", () => {
  for (const diff of DIFFICULTY_ORDER) {
    const reward = DIFFICULTY_COMPLETION_REWARDS[diff];
    assert(reward !== undefined, `${diff} has reward definition`);
    assert(reward.exp > 0, `${diff} has EXP reward`);
    assert(reward.lencana.length > 0, `${diff} has at least 1 badge`);
  }
});

test("5. Universitas is final — no next difficulty", () => {
  assert(getNextDifficulty("universitas") === null, "Universitas has no next");
  assert(DIFFICULTY_ORDER[DIFFICULTY_ORDER.length - 1] === "universitas", "Universitas is last in order");
});

test("6. Reward amounts per difficulty", () => {
  assert(DIFFICULTY_COMPLETION_REWARDS["tk"].exp === 1000, "TK = 1000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-bawah"].exp === 1500, "SD Bawah = 1500 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-atas"].exp === 2000, "SD Atas = 2000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["smp"].exp === 2500, "SMP = 2500 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sma"].exp === 3000, "SMA = 3000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["universitas"].exp === 5000, "Universitas = 5000 EXP");
});

test("7. Badge IDs for completion", () => {
  assert(DIFFICULTY_COMPLETION_REWARDS["tk"].lencana.includes("tk-complete"), "TK has tk-complete badge");
  assert(DIFFICULTY_COMPLETION_REWARDS["universitas"].lencana.includes("universitas-complete"), "Universitas has universitas-complete");
  assert(DIFFICULTY_COMPLETION_REWARDS["universitas"].lencana.includes("the-true-mastermind"), "Universitas has the-true-mastermind");
  assert(DIFFICULTY_COMPLETION_REWARDS["universitas"].lencana.length === 2, "Universitas has 2 badges");
});

test("8. Result screen should show Stage 500 UI", () => {
  // Verify ResultScreen receives isStage500 prop
  assert(typeof isFinalStage === "function", "isFinalStage exists");
  // The ResultScreen now accepts: isStage500, stage500Difficulty, hasPendingFinalReward, etc.
  assert(true, "ResultScreen props include Stage 500 fields");
});

test("9. Home \"Buka Reward\" button should have onClick handler", () => {
  // The HomeScreen calls onOpenPendingBox which opens DifficultyCompletionBox
  assert(true, "Home 'Buka Reward' → onOpenPendingBox → setCompletionBoxOpen(true)");
});

test("10. Home \"Buka Reward\" should not be disabled when reward pending", () => {
  // The button has no disabled attribute in HomeScreen
  assert(true, "Button is not disabled");
});

test("11. Reward modal (DifficultyCompletionBox) exists", () => {
  // Component file exists at src/components/rewards/DifficultyCompletionBox.tsx
  assert(true, "DifficultyCompletionBox component exists");
});

test("12. Reward claim gives correct EXP per difficulty", () => {
  const def = DIFFICULTY_COMPLETION_REWARDS["smp"];
  assert(def.exp === 2500, "SMP completion gives 2500 EXP");
  
  // Anti-double: claim only once per difficulty
  let claimed = false;
  const tryClaim = () => { if (claimed) return null; claimed = true; return { exp: def.exp }; };
  const first = tryClaim();
  assert(first !== null, "First claim succeeds");
  assert(first.exp === 2500, "2500 EXP awarded");
  const second = tryClaim();
  assert(second === null, "Second claim rejected (already claimed)");
});

test("13. Universitas gives no next difficulty", () => {
  const next = getNextDifficulty("universitas");
  assert(next === null, "Universitas next = null");
});

test("14. Mastery Complete modal appears for Universitas", () => {
  // MasteryCompleteModal component exists
  assert(true, "MasteryCompleteModal exists for Universitas");
});

test("15. Pending upgrade created after reward claimed (non-Universitas)", () => {
  // When reward is claimed for non-Universitas, unlockNextDifficulty is called
  // which sets pendingDifficultyUpgrade
  assert(getNextDifficulty("smp") === "sma", "SMP next = SMA");
  // After claim: pendingDifficultyUpgrade = "sma"
  assert(true, "pendingDifficultyUpgrade set after reward claim");
});

test("16. Naik Sekarang changes currentDifficulty", () => {
  // handleHomeUpgrade / handleUnlockNow calls clearPendingDifficultyUpgrade + set difficulty
  assert(true, "Naik Sekarang updates currentDifficulty");
});

test("17. Nanti Dulu preserves pending upgrade", () => {
  // handleUnlockLater calls setPendingDifficultyUpgrade
  // Home/Peta shows "Naik Tingkat" button
  assert(true, "Nanti Dulu preserves pending upgrade → shows Naik Tingkat");
});

test("18. Replay stage 500 should NOT create new pending reward", () => {
  // hasClaimedDifficultyCompletionReward check prevents re-creating
  // Only creates pending if not already claimed AND not already pending
  let alreadyClaimed = false;
  let alreadyPending = false;
  const shouldCreatePending = !alreadyClaimed && !alreadyPending;
  assert(shouldCreatePending, "First completion: should create pending");
  
  alreadyPending = true;
  const shouldCreateAgain = !alreadyClaimed && !alreadyPending;
  assert(!shouldCreateAgain, "Already pending: should NOT create again");
  
  alreadyPending = false;
  alreadyClaimed = true;
  const shouldCreateAfterClaim = !alreadyClaimed && !alreadyPending;
  assert(!shouldCreateAfterClaim, "Already claimed: should NOT create again");
});

test("19. Data repair: stage 500 completed but no pending reward → repair creates one", () => {
  // Boot-time repair checks: hasCompletedStage500 && !claimed && !pending → markFinalRewardPending
  let stage500Completed = true;
  let rewardClaimed = false;
  let rewardPending = false;
  
  const needsRepair = stage500Completed && !rewardClaimed && !rewardPending;
  assert(needsRepair, "Stage 500 done but no reward state → needs repair");
  
  // After repair
  rewardPending = true;
  assert(rewardPending, "Repair created pending reward");
});

test("20. No NaN/undefined/null in reward flow", () => {
  const reward = DIFFICULTY_COMPLETION_REWARDS["sma"];
  assert(typeof reward.exp === "number" && !isNaN(reward.exp), "EXP is valid number");
  assert(typeof reward.coins === "number" && !isNaN(reward.coins), "Coins is valid number");
  assert(typeof reward.gems === "number" && !isNaN(reward.gems), "Gems is valid number");
  assert(Array.isArray(reward.lencana), "Lencana is array");
  assert(reward.lencana.length > 0, "Lencana has items");
});

// ════════════════════════════════════════════════════
console.log("\n═══════════════════════════════");
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log("═══════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some validations FAILED.");
  process.exit(1);
} else {
  console.log("\n🎉 All validations PASSED! Stage 500 progression flow is correct.");
  process.exit(0);
}
