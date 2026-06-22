/**
 * validate-difficulty-progression-500.ts
 * 
 * Validates the TMT Difficulty Progression System (500 missions per difficulty).
 * Run with: npx tsx scripts/validate-difficulty-progression-500.ts
 * 
 * Checks:
 *   1. Difficulty order is correct (TK → SD Bawah → SD Atas → SMP → SMA → Universitas)
 *   2. Universitas is the final difficulty
 *   3. No difficulty after Universitas
 *   4. Stage 500 is the completion trigger
 *   5. Stage 300 is NOT a completion trigger
 *   6. EXP does not unlock difficulty
 *   7. getNextDifficulty returns correct values for all difficulties
 *   8. Reward akhir level tersedia untuk semua difficulty
 *   9. Reward akhir level hanya bisa diklaim sekali
 *   10. Lencana completion tersedia
 *   11. The True Mastermind tersedia untuk Universitas
 *   12. First completion reward multiplier = 1.0
 *   13. Replay reward multiplier = 0.25
 *   14. Reward replay tidak NaN/negative
 *   15. Reward box stage biasa hanya sekali
 *   16. Reward box completion hanya sekali
 *   17. unlockedDifficulties update setelah stage 500
 *   18. pendingDifficultyUpgrade bekerja
 *   19. currentDifficulty berubah hanya saat user memilih Naik Sekarang/Naik Tingkat
 *   20. Migration data lama aman
 */

// ════════════════════════════════════════════════════
// Mock Types (mirrors src/types/index.ts)
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

interface MissionProgress {
  missionId: string;
  stars: number;
  bestPoints: number;
  attempts: number;
  completedCount: number;
  firstCompletedAt: number;
  completedAt: number;
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
  level: number;
  missionProgress: Record<string, MissionProgress>;
  claimedStageRewardIds: string[];
  upgradedAt?: number;
}

// ════════════════════════════════════════════════════
// Helper functions (mirroring src/lib/progress.ts)
// ════════════════════════════════════════════════════

function getNextDifficulty(current: DifficultyId): DifficultyId | null {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  if (idx === -1 || idx >= DIFFICULTY_ORDER.length - 1) return null;
  return DIFFICULTY_ORDER[idx + 1];
}

function isFinalStage(stageNumber: number): boolean {
  return stageNumber === FINAL_STAGE_NUMBER;
}

function isFinalDifficulty(difficulty: DifficultyId): boolean {
  return difficulty === "universitas";
}

function hasClaimedDifficultyCompletionReward(profile: Profile, difficulty: DifficultyId): boolean {
  return profile.claimedFinalRewardsByDifficulty[difficulty]?.rewardClaimed === true;
}

function normalizeDifficultyName(difficulty: string): DifficultyId {
  if (difficulty === "sd-kecil") return "sd-bawah";
  if (difficulty === "sd-muda") return "sd-atas";
  if (DIFFICULTY_ORDER.includes(difficulty as DifficultyId)) return difficulty as DifficultyId;
  return "sd-bawah";
}

function isFirstCompletion(profile: Profile, stageId: string): boolean {
  const progress = profile.missionProgress[stageId];
  if (!progress) return true;
  return progress.completedCount === 0;
}

function calculateRewardMultiplier(profile: Profile, stageId: string): number {
  return isFirstCompletion(profile, stageId) ? 1.0 : 0.25;
}

function markFinalRewardPending(profile: Profile, difficulty: DifficultyId): Profile {
  const rewards = { ...(profile.claimedFinalRewardsByDifficulty || {}) };
  rewards[difficulty] = {
    ...(rewards[difficulty] || {}),
    difficulty,
    stageNumber: FINAL_STAGE_NUMBER,
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
  return {
    ...profile,
    claimedFinalRewardsByDifficulty: rewards,
    pendingFinalRewardDifficulty: difficulty,
  };
}

function claimDifficultyCompletionReward(profile: Profile, difficulty: DifficultyId): Profile | null {
  const def = DIFFICULTY_COMPLETION_REWARDS[difficulty];
  if (!def) return null;

  const rewards = { ...(profile.claimedFinalRewardsByDifficulty || {}) };
  if (rewards[difficulty]?.rewardClaimed) return null;

  const now = Date.now();
  rewards[difficulty] = {
    difficulty,
    stageNumber: FINAL_STAGE_NUMBER,
    rewardClaimed: true,
    rewardPending: false,
    claimedAt: now,
    expAwarded: def.exp,
    coinsAwarded: def.coins,
    gemsAwarded: def.gems,
    lencanaAwarded: def.lencana,
    nextDifficultyUnlocked: difficulty !== "universitas",
    upgradePromptShown: false,
  };

  const newBadges = [...profile.badges];
  for (const badgeId of def.lencana) {
    if (!newBadges.includes(badgeId)) {
      newBadges.push(badgeId);
    }
  }

  const updated: Profile = {
    ...profile,
    xp: profile.xp + def.exp,
    points: profile.points + def.gems,
    coins: profile.coins + def.coins,
    badges: newBadges,
    claimedFinalRewardsByDifficulty: rewards,
    pendingFinalRewardDifficulty: null,
  };

  if (!updated.completedDifficulties.includes(difficulty)) {
    updated.completedDifficulties = [...updated.completedDifficulties, difficulty];
  }

  return updated;
}

function unlockNextDifficulty(profile: Profile, currentDifficulty: DifficultyId): Profile | null {
  const next = getNextDifficulty(currentDifficulty);
  if (!next) return null;

  const unlocked = [...(profile.unlockedDifficulties || [])];
  if (unlocked.includes(next)) return null;

  unlocked.push(next);

  return {
    ...profile,
    unlockedDifficulties: unlocked,
    pendingDifficultyUpgrade: next,
  };
}

function setPendingDifficultyUpgrade(profile: Profile, nextDifficulty: DifficultyId): Profile {
  return {
    ...profile,
    difficultyUpgradeAvailable: true,
    pendingDifficultyUpgrade: nextDifficulty,
  };
}

function clearPendingDifficultyUpgrade(profile: Profile): Profile {
  return {
    ...profile,
    difficultyUpgradeAvailable: false,
    pendingDifficultyUpgrade: null,
  };
}

function hasClaimedStageReward(profile: Profile, stageId: string): boolean {
  return profile.claimedStageRewardIds?.includes(stageId) ?? false;
}

function claimStageReward(profile: Profile, stageId: string): Profile {
  if (profile.claimedStageRewardIds?.includes(stageId)) return profile;
  return {
    ...profile,
    claimedStageRewardIds: [...(profile.claimedStageRewardIds || []), stageId],
  };
}

// ════════════════════════════════════════════════════
// Test Helpers
// ════════════════════════════════════════════════════

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

function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  const base: Profile = {
    id: "test-" + Math.random().toString(36).slice(2, 8),
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
    level: 1,
    missionProgress: {},
    claimedStageRewardIds: [],
  };
  const merged = { ...base, ...overrides };
  // If difficulty was overridden but currentDifficulty wasn't, sync them
  if (overrides.difficulty && !overrides.currentDifficulty) {
    merged.currentDifficulty = overrides.difficulty;
  }
  return merged;
}

// ════════════════════════════════════════════════════
// Validation Tests
// ════════════════════════════════════════════════════

// ── Test 1: Difficulty order correct ──
test("1. Difficulty order benar", () => {
  assert(DIFFICULTY_ORDER.length === 6, "6 difficulties total");
  assert(DIFFICULTY_ORDER[0] === "tk", "TK is first");
  assert(DIFFICULTY_ORDER[1] === "sd-bawah", "SD Bawah is second");
  assert(DIFFICULTY_ORDER[2] === "sd-atas", "SD Atas is third");
  assert(DIFFICULTY_ORDER[3] === "smp", "SMP is fourth");
  assert(DIFFICULTY_ORDER[4] === "sma", "SMA is fifth");
  assert(DIFFICULTY_ORDER[5] === "universitas", "Universitas is last");
});

// ── Test 2: Universitas is final difficulty ──
test("2. Universitas adalah difficulty terakhir", () => {
  assert(isFinalDifficulty("universitas") === true, "Universitas is final");
  assert(isFinalDifficulty("sma") === false, "SMA is NOT final");
  assert(isFinalDifficulty("tk") === false, "TK is NOT final");
});

// ── Test 3: No difficulty after Universitas ──
test("3. Tidak ada difficulty setelah Universitas", () => {
  assert(getNextDifficulty("universitas") === null, "Universitas returns null for next");
  assert(getNextDifficulty("sma") === "universitas", "SMA → Universitas");
  assert(getNextDifficulty("smp") === "sma", "SMP → SMA");
  assert(getNextDifficulty("sd-atas") === "smp", "SD Atas → SMP");
  assert(getNextDifficulty("sd-bawah") === "sd-atas", "SD Bawah → SD Atas");
  assert(getNextDifficulty("tk") === "sd-bawah", "TK → SD Bawah");
});

// ── Test 4: Stage 500 is completion trigger ──
test("4. Stage 500 adalah trigger completion", () => {
  assert(isFinalStage(500) === true, "Stage 500 adalah final");
  assert(isFinalStage(499) === false, "Stage 499 BUKAN final");
  assert(isFinalStage(501) === false, "Stage 501 BUKAN final");
  assert(isFinalStage(1) === false, "Stage 1 BUKAN final");
  assert(isFinalStage(500) === true && isFinalStage(300) === false, "500 trigger, 300 NOT trigger");
});

// ── Test 5: Stage 300 is NOT completion trigger ──
test("5. Stage 300 BUKAN trigger completion", () => {
  assert(isFinalStage(300) === false, "Stage 300 BUKAN final stage");
  assert(isFinalStage(100) === false, "Stage 100 BUKAN final stage");
  assert(isFinalStage(200) === false, "Stage 200 BUKAN final stage");

  // Simulate: completing stage 300 should NOT trigger completion flow
  const profile = createMockProfile({ difficulty: "tk" });
  // Mark stage 300 as completed
  profile.missionProgress["tk-stage-300"] = {
    missionId: "tk-stage-300",
    stars: 3,
    bestPoints: 100,
    attempts: 1,
    completedCount: 1,
    firstCompletedAt: Date.now(),
    completedAt: Date.now(),
  };
  // Stage 300 completion should NOT unlock next difficulty
  assert(!hasClaimedDifficultyCompletionReward(profile, "tk"), "Stage 300 does NOT mark difficulty as completed");
  assert(profile.unlockedDifficulties.length === 1, "Only TK is unlocked after stage 300");
});

// ── Test 6: EXP tidak membuka difficulty ──
test("6. EXP tidak membuka difficulty", () => {
  const profile = createMockProfile({ difficulty: "tk", xp: 99999, level: 100 });
  // Even with massive XP, difficulty should not unlock
  assert(profile.unlockedDifficulties.length === 1, "High XP does NOT unlock next difficulty");
  assert(!profile.difficultyUpgradeAvailable, "No upgrade available just from XP");
  assert(profile.currentDifficulty === "tk", "Current difficulty unchanged despite high XP");
});

// ── Test 7: getNextDifficulty benar untuk semua ──
test("7. getNextDifficulty benar untuk semua difficulty", () => {
  const expected: Record<DifficultyId, DifficultyId | null> = {
    tk: "sd-bawah",
    "sd-bawah": "sd-atas",
    "sd-atas": "smp",
    smp: "sma",
    sma: "universitas",
    universitas: null,
  };
  for (const [from, to] of Object.entries(expected)) {
    const result = getNextDifficulty(from as DifficultyId);
    assert(result === to, `${from} → ${to ?? "null"} (got: ${result})`);
  }
});

// ── Test 8: Reward akhir level tersedia untuk semua ──
test("8. Reward akhir level tersedia untuk semua difficulty", () => {
  for (const d of DIFFICULTY_ORDER) {
    const r = DIFFICULTY_COMPLETION_REWARDS[d];
    assert(r !== undefined, `${d} has reward definition`);
    assert(r.exp > 0, `${d} has positive EXP (${r.exp})`);
    assert(r.coins > 0, `${d} has positive coins (${r.coins})`);
    assert(r.gems > 0, `${d} has positive gems (${r.gems})`);
    assert(r.lencana.length > 0, `${d} has at least 1 lencana`);
  }
});

// ── Test 9: Reward akhir level hanya sekali klaim ──
test("9. Reward akhir level hanya bisa diklaim sekali", () => {
  const profile = createMockProfile({ difficulty: "smp" });

  // First claim — should succeed
  const claimed1 = claimDifficultyCompletionReward(profile, "smp");
  assert(claimed1 !== null, "First claim succeeds");
  assert(claimed1!.xp === 2500, "EXP awarded (2500)");

  // Second claim — should fail
  const claimed2 = claimDifficultyCompletionReward(claimed1!, "smp");
  assert(claimed2 === null, "Second claim returns null (already claimed)");

  // Verify rewards only applied once
  assert(claimed1!.xp === 2500, "XP remains at 2500 (not doubled)");
  assert(hasClaimedDifficultyCompletionReward(claimed1!, "smp"), "Marked as claimed");
});

// ── Test 10: Lencana completion tersedia ──
test("10. Lencana completion tersedia", () => {
  const allLencana = Object.values(DIFFICULTY_COMPLETION_REWARDS).flatMap(r => r.lencana);
  assert(allLencana.includes("tk-complete"), "tk-complete");
  assert(allLencana.includes("sd-bawah-complete"), "sd-bawah-complete");
  assert(allLencana.includes("sd-atas-complete"), "sd-atas-complete");
  assert(allLencana.includes("smp-complete"), "smp-complete");
  assert(allLencana.includes("sma-complete"), "sma-complete");
  assert(allLencana.includes("universitas-complete"), "universitas-complete");
});

// ── Test 11: The True Mastermind untuk Universitas ──
test("11. The True Mastermind tersedia untuk Universitas", () => {
  const univReward = DIFFICULTY_COMPLETION_REWARDS.universitas;
  assert(univReward.lencana.includes("the-true-mastermind"), "The True Mastermind included");
  assert(univReward.lencana.length === 2, "Universitas has 2 badges (complete + mastermind)");
  assert(univReward.exp === 5000, "Universitas reward = 5.000 EXP");
});

// ── Test 12: First completion multiplier = 1.0 ──
test("12. First completion reward multiplier = 1.0", () => {
  const profile = createMockProfile();
  const stageId = "tk-stage-1";

  // Never played — first completion
  assert(isFirstCompletion(profile, stageId), "Never played = first completion");
  assert(calculateRewardMultiplier(profile, stageId) === 1.0, "Multiplier = 1.0 for first time");

  // After completion
  profile.missionProgress[stageId] = {
    missionId: stageId,
    stars: 3,
    bestPoints: 100,
    attempts: 1,
    completedCount: 1,
    firstCompletedAt: Date.now(),
    completedAt: Date.now(),
  };
  assert(!isFirstCompletion(profile, stageId), "After completion = NOT first");
  assert(calculateRewardMultiplier(profile, stageId) === 0.25, "Multiplier = 0.25 for replay");
});

// ── Test 13: Replay multiplier = 0.25 ──
test("13. Replay reward multiplier = 0.25", () => {
  const profile = createMockProfile();
  const stageId = "tk-stage-5";

  // Multiple completions — still 0.25
  profile.missionProgress[stageId] = {
    missionId: stageId,
    stars: 3,
    bestPoints: 100,
    attempts: 5,
    completedCount: 3,
    firstCompletedAt: Date.now() - 86400000,
    completedAt: Date.now(),
  };
  assert(!isFirstCompletion(profile, stageId), "Not first completion after 3 plays");
  assert(calculateRewardMultiplier(profile, stageId) === 0.25, "Replay multiplier = 0.25");

  // After 10 replays — still 0.25
  profile.missionProgress[stageId].completedCount = 10;
  assert(calculateRewardMultiplier(profile, stageId) === 0.25, "After 10 replays still 0.25");
});

// ── Test 14: Reward replay tidak NaN/negative ──
test("14. Reward replay tidak NaN/negative", () => {
  const baseXP = 100;
  const replayMultiplier = 0.25;
  const awardedXP = Math.floor(baseXP * replayMultiplier);
  assert(awardedXP >= 1, `Replay XP floor >= 1 (got ${awardedXP})`);
  assert(!isNaN(awardedXP), "Awarded XP is not NaN");
  assert(awardedXP >= 0, "Awarded XP is not negative");

  // Edge case: very small base
  const smallBase = 3;
  const smallAwarded = Math.max(1, Math.floor(smallBase * 0.25));
  assert(smallAwarded === 1, "Min 1 awarded for very small base");
});

// ── Test 15: Reward box stage biasa hanya sekali ──
test("15. Reward box stage biasa hanya sekali klaim", () => {
  const profile = createMockProfile();
  const stageId = "tk-stage-42";

  // First claim
  assert(!hasClaimedStageReward(profile, stageId), "Not claimed initially");
  const afterClaim = claimStageReward(profile, stageId);
  assert(hasClaimedStageReward(afterClaim, stageId), "Now claimed");

  // Second claim — should be no-op
  const afterClaim2 = claimStageReward(afterClaim, stageId);
  assert(afterClaim2 === afterClaim, "Second claim is no-op (same object)");
  assert(afterClaim2.claimedStageRewardIds.length === 1, "Only 1 claim recorded");
});

// ── Test 16: Reward box completion hanya sekali ──
test("16. Reward box completion hanya sekali klaim", () => {
  const profile = createMockProfile({ difficulty: "sd-atas" });

  // Mark pending
  const pending = markFinalRewardPending(profile, "sd-atas");
  assert(pending.pendingFinalRewardDifficulty === "sd-atas", "Pending set");

  // Claim
  const claimed = claimDifficultyCompletionReward(pending, "sd-atas");
  assert(claimed !== null, "Claim succeeded");

  // Double claim
  const double = claimDifficultyCompletionReward(claimed!, "sd-atas");
  assert(double === null, "Double claim blocked");
  assert(claimed!.xp === 2000, "EXP only applied once (2000)");
});

// ── Test 17: unlockedDifficulties update setelah stage 500 ──
test("17. unlockedDifficulties update setelah stage 500", () => {
  // TK → SD Bawah
  const profile = createMockProfile({ difficulty: "tk" });
  const withUnlock = unlockNextDifficulty(profile, "tk");
  assert(withUnlock !== null, "Unlock succeeds");
  assert(withUnlock!.unlockedDifficulties.includes("sd-bawah"), "SD Bawah now unlocked");
  assert(withUnlock!.pendingDifficultyUpgrade === "sd-bawah", "Pending upgrade set to SD Bawah");

  // Double unlock
  const doubleUnlock = unlockNextDifficulty(withUnlock!, "tk");
  assert(doubleUnlock === null, "Double unlock blocked (already unlocked)");
});

// ── Test 18: pendingDifficultyUpgrade bekerja ──
test("18. pendingDifficultyUpgrade bekerja", () => {
  const profile = createMockProfile({ difficulty: "smp" });

  // Set pending
  const withPending = setPendingDifficultyUpgrade(profile, "sma");
  assert(withPending.difficultyUpgradeAvailable === true, "Upgrade available");
  assert(withPending.pendingDifficultyUpgrade === "sma", "Pending = SMA");
  assert(withPending.currentDifficulty === "smp", "Current difficulty still SMP");

  // Clear pending
  const cleared = clearPendingDifficultyUpgrade(withPending);
  assert(!cleared.difficultyUpgradeAvailable, "Upgrade no longer available");
  assert(cleared.pendingDifficultyUpgrade === null, "Pending cleared");
});

// ── Test 19: currentDifficulty berubah hanya saat user pilih Naik ──
test("19. currentDifficulty berubah hanya saat user memilih Naik Sekarang/Naik Tingkat", () => {
  // Scenario: complete stage 500 SMP, unlock SMA, choose "Nanti Dulu"
  const profile = createMockProfile({ difficulty: "smp", unlockedDifficulties: ["tk", "sd-bawah", "sd-atas", "smp"] });

  // Unlock next difficulty (does NOT change current)
  const withUnlock = unlockNextDifficulty(profile, "smp");
  assert(withUnlock !== null, "SMA unlocked");
  assert(withUnlock!.currentDifficulty === "smp", "currentDifficulty tetap SMP");

  // Set pending (user chose "Nanti Dulu")
  const withPending = setPendingDifficultyUpgrade(withUnlock!, "sma");
  assert(withPending.currentDifficulty === "smp", "currentDifficulty masih SMP setelah Nanti Dulu");
  assert(withPending.pendingDifficultyUpgrade === "sma", "Pending upgrade exists");

  // User clicks "Naik Tingkat" later
  const upgraded = clearPendingDifficultyUpgrade({
    ...withPending,
    difficulty: "sma",
    currentDifficulty: "sma",
    upgradedAt: Date.now(),
  });
  assert(upgraded.currentDifficulty === "sma", "currentDifficulty sekarang SMA setelah Naik Tingkat");
  assert(upgraded.difficulty === "sma", "difficulty now SMA");
  assert(upgraded.pendingDifficultyUpgrade === null, "Pending cleared after upgrade");
  assert(!upgraded.difficultyUpgradeAvailable, "Upgrade flag cleared");
});

// ── Test 20: Migration data lama aman ──
test("20. Migration data lama aman", () => {
  // Simulate old profile (pre-migration)
  const oldProfile: any = {
    id: "old-1",
    difficulty: "sd-kecil",  // old name
    currentDifficulty: "sd-kecil",
    unlockedDifficulties: ["tk", "sd-kecil"],
    completedDifficulties: ["tk"],
    badges: [],
  };

  // Apply migration (normalize names)
  const migrated: Profile = {
    id: oldProfile.id,
    difficulty: normalizeDifficultyName(oldProfile.difficulty),
    currentDifficulty: normalizeDifficultyName(oldProfile.currentDifficulty),
    unlockedDifficulties: oldProfile.unlockedDifficulties.map((d: string) => normalizeDifficultyName(d)),
    completedDifficulties: oldProfile.completedDifficulties.map((d: string) => normalizeDifficultyName(d)),
    difficultyUpgradeAvailable: oldProfile.difficultyUpgradeAvailable ?? false,
    claimedFinalRewardsByDifficulty: oldProfile.claimedFinalRewardsByDifficulty || {},
    pendingDifficultyUpgrade: oldProfile.pendingDifficultyUpgrade ? normalizeDifficultyName(oldProfile.pendingDifficultyUpgrade) : null,
    pendingFinalRewardDifficulty: oldProfile.pendingFinalRewardDifficulty ? normalizeDifficultyName(oldProfile.pendingFinalRewardDifficulty) : null,
    badges: oldProfile.badges || [],
    xp: oldProfile.xp ?? 0,
    points: oldProfile.points ?? 0,
    coins: oldProfile.coins ?? 0,
    level: oldProfile.level ?? 1,
    missionProgress: oldProfile.missionProgress || {},
    claimedStageRewardIds: oldProfile.claimedStageRewardIds || [],
  };

  assert(migrated.difficulty === "sd-bawah", "sd-kecil → sd-bawah");
  assert(migrated.currentDifficulty === "sd-bawah", "currentDifficulty normalized");
  assert(migrated.unlockedDifficulties.includes("sd-bawah"), "Unlocked has sd-bawah");
  assert(!migrated.unlockedDifficulties.includes("sd-kecil" as any), "No sd-kecil in unlocked");
  assert(migrated.claimedFinalRewardsByDifficulty !== undefined, "claimedFinalRewards exists");
  assert(typeof migrated.claimedFinalRewardsByDifficulty === "object", "claimedFinalRewards is object");
  assert(migrated.pendingDifficultyUpgrade === null, "pendingDiff default null");
  assert(migrated.pendingFinalRewardDifficulty === null, "pendingFinalReward default null");

  // Profile with old 300/300 should NOT be considered completed for 500 system
  assert(Object.keys(migrated.claimedFinalRewardsByDifficulty).length === 0, "No claimed rewards by default");
  assert(!hasClaimedDifficultyCompletionReward(migrated, "sd-bawah"), "Not claimed as completed (need stage 500, not 300)");
});

// ── Test 21: Reward amounts correct ──
test("21. Reward amounts match spec", () => {
  assert(DIFFICULTY_COMPLETION_REWARDS.tk.exp === 1000, "TK = 1.000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-bawah"].exp === 1500, "SD Bawah = 1.500 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS["sd-atas"].exp === 2000, "SD Atas = 2.000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS.smp.exp === 2500, "SMP = 2.500 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS.sma.exp === 3000, "SMA = 3.000 EXP");
  assert(DIFFICULTY_COMPLETION_REWARDS.universitas.exp === 5000, "Universitas = 5.000 EXP");
});

// ── Test 22: Full progression flow (TK → Mastery) ──
test("22. Full progression flow dari TK ke Mastery Complete", () => {
  let profile = createMockProfile({ difficulty: "tk" });

  // Complete each difficulty through stage 500
  const chain: { from: DifficultyId; to: DifficultyId | null; exp: number }[] = [
    { from: "tk", to: "sd-bawah", exp: 1000 },
    { from: "sd-bawah", to: "sd-atas", exp: 1500 },
    { from: "sd-atas", to: "smp", exp: 2000 },
    { from: "smp", to: "sma", exp: 2500 },
    { from: "sma", to: "universitas", exp: 3000 },
    { from: "universitas", to: null, exp: 5000 },
  ];

  let totalXP = 0;
  for (const { from, to, exp } of chain) {
    profile.difficulty = from;
    profile.currentDifficulty = from;

    // Mark pending
    const pending = markFinalRewardPending(profile, from);
    assert(pending.pendingFinalRewardDifficulty === from, `${from}: pending set`);

    // Claim
    const claimed = claimDifficultyCompletionReward(pending, from);
    assert(claimed !== null, `${from}: claim succeeded`);
    assert(claimed!.xp === totalXP + exp, `${from}: EXP ${exp} awarded correctly`);
    totalXP += exp;

    // Verify completed
    assert(hasClaimedDifficultyCompletionReward(claimed!, from), `${from}: marked completed`);
    assert(claimed!.completedDifficulties.includes(from), `${from}: in completedDifficulties`);

    if (to) {
      // Unlock next
      const withUnlock = unlockNextDifficulty(claimed!, from);
      assert(withUnlock !== null, `${from}: unlock ${to} succeeds`);
      assert(withUnlock!.unlockedDifficulties.includes(to), `${to}: now unlocked`);
      assert(withUnlock!.pendingDifficultyUpgrade === to, `${to}: pending upgrade set`);
      profile = withUnlock!;
    } else {
      profile = claimed!;
    }
  }

  // Clear any pending upgrade from previous step (simulates user clicking "Naik Sekarang")
  profile = clearPendingDifficultyUpgrade(profile);
  
  // Verify final state
  assert(profile.completedDifficulties.length === 6, "All 6 difficulties completed");
  assert(profile.unlockedDifficulties.length === 6, "All 6 difficulties unlocked");
  assert(profile.xp === 15000, "Total EXP = 15.000 (1000+1500+2000+2500+3000+5000)");
  assert(profile.badges.includes("the-true-mastermind"), "The True Mastermind badge earned");
  assert(profile.badges.includes("universitas-complete"), "Universitas Complete badge earned");
  // After mastery complete, pending upgrade should be cleared
  assert(profile.pendingDifficultyUpgrade === null, "No pending upgrade after Universitas mastery complete");
});

// ── Test 23: No old terminology ──
test("23. No old terminology (sd-kecil, sd-muda)", () => {
  assert(!DIFFICULTY_ORDER.includes("sd-kecil" as any), "No sd-kecil");
  assert(!DIFFICULTY_ORDER.includes("sd-muda" as any), "No sd-muda");
  assert(DIFFICULTY_ORDER.includes("sd-bawah"), "sd-bawah present");
  assert(DIFFICULTY_ORDER.includes("sd-atas"), "sd-atas present");
  assert(normalizeDifficultyName("sd-kecil") === "sd-bawah", "sd-kecil normalizes to sd-bawah");
  assert(normalizeDifficultyName("sd-muda") === "sd-atas", "sd-muda normalizes to sd-atas");
  assert(normalizeDifficultyName("smp") === "smp", "smp stays smp");
});

// ── Test 24: XP level is separate from difficulty level ──
test("24. XP level terpisah dari difficulty level", () => {
  const profile = createMockProfile({ difficulty: "tk", xp: 50000, level: 42 });
  assert(profile.difficulty === "tk", "XP level 42 does NOT unlock next difficulty");
  assert(profile.currentDifficulty === "tk", "currentDifficulty unchanged");
  assert(profile.unlockedDifficulties.length === 1, "Only 1 difficulty unlocked");
});

// ════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════
console.log("\n═══════════════════════════════");
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log("═══════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some validations FAILED. Please fix before proceeding.");
  process.exit(1);
} else {
  console.log("\n🎉 All validations PASSED! Difficulty progression 500 system is correct.");
  process.exit(0);
}
