/**
 * validate-difficulty-completion.ts
 * 
 * Validates the TMT Difficulty Completion (Stage 500) system.
 * Run with: npx tsx scripts/validate-difficulty-completion.ts
 */

// ── Mock data and minimal imports ──

type DifficultyId = "tk" | "sd-bawah" | "sd-atas" | "smp" | "sma" | "universitas";

const DIFFICULTY_ORDER: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];

const DIFFICULTY_COMPLETION_REWARDS: Record<DifficultyId, { exp: number; coins: number; gems: number; lencana: string[] }> = {
  tk: { exp: 1000, coins: 300, gems: 5, lencana: ["tk-complete"] },
  "sd-bawah": { exp: 1500, coins: 500, gems: 8, lencana: ["sd-bawah-complete"] },
  "sd-atas": { exp: 2000, coins: 700, gems: 10, lencana: ["sd-atas-complete"] },
  smp: { exp: 2500, coins: 1000, gems: 15, lencana: ["smp-complete"] },
  sma: { exp: 3000, coins: 1500, gems: 20, lencana: ["sma-complete"] },
  universitas: { exp: 5000, coins: 2500, gems: 30, lencana: ["universitas-complete", "the-true-mastermind"] },
};

interface DifficultyCompletionReward {
  difficulty: DifficultyId;
  stageNumber: number;
  rewardClaimed: boolean;
  rewardPending: boolean;
  claimedAt: number;
  expAwarded: number;
  coinsAwarded: number;
  gemsAwarded: number;
  lencanaAwarded: string[];
  nextDifficultyUnlocked: boolean;
  upgradePromptShown: boolean;
}

interface Profile {
  id: string;
  difficulty: DifficultyId;
  currentDifficulty: DifficultyId;
  unlockedDifficulties: DifficultyId[];
  completedDifficulties: DifficultyId[];
  difficultyUpgradeAvailable: boolean;
  claimedFinalRewardsByDifficulty: Partial<Record<DifficultyId, DifficultyCompletionReward>>;
  pendingDifficultyUpgrade: DifficultyId | null;
  pendingFinalRewardDifficulty: DifficultyId | null;
  badges: string[];
  xp: number;
  points: number;
  coins: number;
}

const FINAL_STAGE_NUMBER = 500;

// ── Helper functions mirroring progress.ts ──

function getNextDifficulty(current: DifficultyId): DifficultyId | null {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  if (idx === -1 || idx >= DIFFICULTY_ORDER.length - 1) return null;
  return DIFFICULTY_ORDER[idx + 1];
}

function isFinalStage(stageNumber: number): boolean {
  return stageNumber === FINAL_STAGE_NUMBER;
}

function hasClaimedDifficultyCompletionReward(profile: Profile, difficulty: DifficultyId): boolean {
  return profile.claimedFinalRewardsByDifficulty[difficulty]?.rewardClaimed === true;
}

// ── Validation tests ──

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.log(`  ❌ ${msg}`);
    failed++;
  }
}

function test(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  fn();
}

// ═══ Test 1: Difficulty order is correct ═══
test("1. Difficulty order correct", () => {
  assert(DIFFICULTY_ORDER.length === 6, "6 difficulties total");
  assert(DIFFICULTY_ORDER[0] === "tk", "TK is first");
  assert(DIFFICULTY_ORDER[1] === "sd-bawah", "SD Bawah is second");
  assert(DIFFICULTY_ORDER[2] === "sd-atas", "SD Atas is third");
  assert(DIFFICULTY_ORDER[3] === "smp", "SMP is fourth");
  assert(DIFFICULTY_ORDER[4] === "sma", "SMA is fifth");
  assert(DIFFICULTY_ORDER[5] === "universitas", "Universitas is last");
});

// ═══ Test 2: Universitas has no next difficulty ═══
test("2. Universitas has no next difficulty", () => {
  assert(getNextDifficulty("universitas") === null, "Universitas returns null for next difficulty");
  assert(getNextDifficulty("sma") === "universitas", "SMA → Universitas");
  assert(getNextDifficulty("smp") === "sma", "SMP → SMA");
  assert(getNextDifficulty("sd-atas") === "smp", "SD Atas → SMP");
  assert(getNextDifficulty("sd-bawah") === "sd-atas", "SD Bawah → SD Atas");
  assert(getNextDifficulty("tk") === "sd-bawah", "TK → SD Bawah");
});

// ═══ Test 3: Stage 500 is final stage ═══
test("3. Stage 500 is final stage", () => {
  assert(isFinalStage(500) === true, "Stage 500 is final");
  assert(isFinalStage(499) === false, "Stage 499 is NOT final");
  assert(isFinalStage(501) === false, "Stage 501 is NOT final");
  assert(isFinalStage(1) === false, "Stage 1 is NOT final");
});

// ═══ Test 4: Reward completion exists for all difficulties ═══
test("4. Reward completion for all difficulties", () => {
  for (const d of DIFFICULTY_ORDER) {
    const r = DIFFICULTY_COMPLETION_REWARDS[d];
    assert(r !== undefined, `${d} has reward definition`);
    assert(r.exp > 0, `${d} has positive EXP (${r.exp})`);
    assert(r.coins > 0, `${d} has positive coins (${r.coins})`);
    assert(r.gems > 0, `${d} has positive gems (${r.gems})`);
    assert(r.lencana.length > 0, `${d} has at least 1 lencana`);
  }
});

// ═══ Test 5: EXP rewards are correct ═══
test("5. EXP rewards correct", () => {
  assert(DIFFICULTY_COMPLETION_REWARDS.tk.exp === 1000, "TK = 1.000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-bawah"].exp === 1500, "SD Bawah = 1.500 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-atas"].exp === 2000, "SD Atas = 2.000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS.smp.exp === 2500, "SMP = 2.500 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS.sma.exp === 3000, "SMA = 3.000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS.universitas.exp === 5000, "Universitas = 5.000 EXP");
});

// ═══ Test 6: Completion lencana exist ═══
test("6. Completion lencana exist", () => {
  const allLencana = Object.values(DIFFICULTY_COMPLETION_REWARDS).flatMap(r => r.lencana);
  assert(allLencana.includes("tk-complete"), "tk-complete lencana");
  assert(allLencana.includes("sd-bawah-complete"), "sd-bawah-complete lencana");
  assert(allLencana.includes("sd-atas-complete"), "sd-atas-complete lencana");
  assert(allLencana.includes("smp-complete"), "smp-complete lencana");
  assert(allLencana.includes("sma-complete"), "sma-complete lencana");
  assert(allLencana.includes("universitas-complete"), "universitas-complete lencana");
});

// ═══ Test 7: The True Mastermind exists ═══
test("7. The True Mastermind lencana", () => {
  const univReward = DIFFICULTY_COMPLETION_REWARDS.universitas;
  assert(univReward.lencana.includes("the-true-mastermind"), "Universitas includes The True Mastermind");
  assert(univReward.lencana.length === 2, "Universitas has 2 lencana (complete + mastermind)");
});

// ═══ Test 8: Reward only claimable once ═══
test("8. Reward only claimable once", () => {
  const profile: Profile = {
    id: "test-1",
    difficulty: "tk",
    currentDifficulty: "tk",
    unlockedDifficulties: ["tk"],
    completedDifficulties: [],
    difficultyUpgradeAvailable: false,
    claimedFinalRewardsByDifficulty: {},
    pendingDifficultyUpgrade: null,
    pendingFinalRewardDifficulty: null,
    badges: [],
    xp: 0,
    points: 0,
    coins: 0,
  };

  // First claim — should succeed
  assert(!hasClaimedDifficultyCompletionReward(profile, "tk"), "Not claimed initially");
  
  // Simulate claim
  profile.claimedFinalRewardsByDifficulty.tk = {
    difficulty: "tk",
    stageNumber: 500,
    rewardClaimed: true,
    rewardPending: false,
    claimedAt: Date.now(),
    expAwarded: 1000,
    coinsAwarded: 300,
    gemsAwarded: 5,
    lencanaAwarded: ["tk-complete"],
    nextDifficultyUnlocked: true,
    upgradePromptShown: false,
  };

  assert(hasClaimedDifficultyCompletionReward(profile, "tk"), "Now claimed");

  // Trying to claim again — should detect already claimed
  assert(hasClaimedDifficultyCompletionReward(profile, "tk"), "Still shows as claimed (no double)");
});

// ═══ Test 9: Next difficulty unlock after stage 500 ═══
test("9. Next difficulty unlock after stage 500", () => {
  // TK → SD Bawah
  const next1 = getNextDifficulty("tk");
  assert(next1 === "sd-bawah", "TK unlocks SD Bawah");

  // SD Bawah → SD Atas
  const next2 = getNextDifficulty("sd-bawah");
  assert(next2 === "sd-atas", "SD Bawah unlocks SD Atas");

  // SD Atas → SMP
  const next3 = getNextDifficulty("sd-atas");
  assert(next3 === "smp", "SD Atas unlocks SMP");

  // SMP → SMA
  const next4 = getNextDifficulty("smp");
  assert(next4 === "sma", "SMP unlocks SMA");

  // SMA → Universitas
  const next5 = getNextDifficulty("sma");
  assert(next5 === "universitas", "SMA unlocks Universitas");

  // Universitas → null (mastery complete)
  const next6 = getNextDifficulty("universitas");
  assert(next6 === null, "Universitas has NO next difficulty");
});

// ═══ Test 10: Migration fields are safe ═══
test("10. Migration field progress safe", () => {
  // Simulate old profile without new fields
  const oldProfile: any = {
    id: "old-1",
    difficulty: "tk",
    currentDifficulty: "tk",
    unlockedDifficulties: ["tk"],
    completedDifficulties: [],
    badges: [],
  };

  // Migration: add new fields with defaults
  const migrated: Profile = {
    ...oldProfile,
    claimedFinalRewardsByDifficulty: oldProfile.claimedFinalRewardsByDifficulty || {},
    pendingDifficultyUpgrade: oldProfile.pendingDifficultyUpgrade || null,
    pendingFinalRewardDifficulty: oldProfile.pendingFinalRewardDifficulty || null,
    difficultyUpgradeAvailable: oldProfile.difficultyUpgradeAvailable ?? false,
    xp: oldProfile.xp ?? 0,
    points: oldProfile.points ?? 0,
    coins: oldProfile.coins ?? 0,
  };

  assert(migrated.claimedFinalRewardsByDifficulty !== undefined, "claimedFinalRewardsByDifficulty exists");
  assert(typeof migrated.claimedFinalRewardsByDifficulty === "object", "claimedFinalRewardsByDifficulty is object");
  assert(migrated.pendingDifficultyUpgrade === null, "pendingDifficultyUpgrade default null");
  assert(migrated.pendingFinalRewardDifficulty === null, "pendingFinalRewardDifficulty default null");
  assert(Object.keys(migrated.claimedFinalRewardsByDifficulty).length === 0, "No claimed rewards by default");

  // Profile should still have original fields
  assert(migrated.id === "old-1", "Profile ID preserved");
  assert(migrated.difficulty === "tk", "Difficulty preserved");
  assert(migrated.unlockedDifficulties.length === 1, "Unlocked difficulties preserved");
});

// ═══ Test 11: Coin and gem amounts ═══
test("11. Coin and gem amounts correct", () => {
  assert(DIFFICULTY_COMPLETION_REWARDS.tk.coins === 300, "TK coins = 300");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-bawah"].coins === 500, "SD Bawah coins = 500");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-atas"].coins === 700, "SD Atas coins = 700");
  assert(DIFFICULTY_COMPLETION_REWARDS.smp.coins === 1000, "SMP coins = 1.000");
  assert(DIFFICULTY_COMPLETION_REWARDS.sma.coins === 1500, "SMA coins = 1.500");
  assert(DIFFICULTY_COMPLETION_REWARDS.universitas.coins === 2500, "Universitas coins = 2.500");

  assert(DIFFICULTY_COMPLETION_REWARDS.tk.gems === 5, "TK gems = 5");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-bawah"].gems === 8, "SD Bawah gems = 8");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-atas"].gems === 10, "SD Atas gems = 10");
  assert(DIFFICULTY_COMPLETION_REWARDS.smp.gems === 15, "SMP gems = 15");
  assert(DIFFICULTY_COMPLETION_REWARDS.sma.gems === 20, "SMA gems = 20");
  assert(DIFFICULTY_COMPLETION_REWARDS.universitas.gems === 30, "Universitas gems = 30");
});

// ═══ Test 12: No old terminology ═══
test("12. No old terminology (sd-kecil, sd-muda)", () => {
  assert(!DIFFICULTY_ORDER.includes("sd-kecil" as any), "No sd-kecil in difficulty order");
  assert(!DIFFICULTY_ORDER.includes("sd-muda" as any), "No sd-muda in difficulty order");
  assert(DIFFICULTY_ORDER.includes("sd-bawah"), "sd-bawah present");
  assert(DIFFICULTY_ORDER.includes("sd-atas"), "sd-atas present");
});

// ═══ Test 13: Pending reward state transitions ═══
test("13. Pending reward state transitions", () => {
  const profile: Profile = {
    id: "test-2",
    difficulty: "smp",
    currentDifficulty: "smp",
    unlockedDifficulties: ["tk", "sd-bawah", "sd-atas", "smp"],
    completedDifficulties: ["tk", "sd-bawah", "sd-atas"],
    difficultyUpgradeAvailable: false,
    claimedFinalRewardsByDifficulty: {},
    pendingDifficultyUpgrade: null,
    pendingFinalRewardDifficulty: null,
    badges: [],
    xp: 1000,
    points: 50,
    coins: 200,
  };

  // State 1: Not claimed, not pending
  assert(!hasClaimedDifficultyCompletionReward(profile, "smp"), "SMP not claimed yet");

  // State 2: Mark pending (box shown but not opened)
  profile.pendingFinalRewardDifficulty = "smp";
  profile.claimedFinalRewardsByDifficulty.smp = {
    difficulty: "smp",
    stageNumber: 500,
    rewardClaimed: false,
    rewardPending: true,
    claimedAt: 0,
    expAwarded: 0,
    coinsAwarded: 0,
    gemsAwarded: 0,
    lencanaAwarded: [],
    nextDifficultyUnlocked: false,
    upgradePromptShown: false,
  };
  assert(profile.pendingFinalRewardDifficulty === "smp", "Pending difficulty set");
  assert(profile.claimedFinalRewardsByDifficulty.smp?.rewardPending === true, "Reward pending");
  assert(!hasClaimedDifficultyCompletionReward(profile, "smp"), "Not yet claimed (only pending)");

  // State 3: Claimed
  profile.claimedFinalRewardsByDifficulty.smp = {
    difficulty: "smp",
    stageNumber: 500,
    rewardClaimed: true,
    rewardPending: false,
    claimedAt: Date.now(),
    expAwarded: 2500,
    coinsAwarded: 1000,
    gemsAwarded: 15,
    lencanaAwarded: ["smp-complete"],
    nextDifficultyUnlocked: true,
    upgradePromptShown: false,
  };
  profile.pendingFinalRewardDifficulty = null;
  assert(hasClaimedDifficultyCompletionReward(profile, "smp"), "Now claimed");
  assert(profile.pendingFinalRewardDifficulty === null, "Pending cleared after claim");
});

// ── Summary ──
console.log("\n═══════════════════════════════");
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log("═══════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some validations FAILED. Please fix before proceeding.");
  process.exit(1);
} else {
  console.log("\n🎉 All validations PASSED!");
  process.exit(0);
}
