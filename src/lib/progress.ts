import type { Profile, CategoryId, DifficultyId, Mission, DifficultyCompletionReward } from "@/types";
import { DIFFICULTY_ORDER, FINAL_STAGE_NUMBER, DIFFICULTY_COMPLETION_REWARDS } from "@/types";
import { CATEGORIES } from "@/data/constants";
import { BADGES } from "@/data/badges";
import { MISSIONS } from "@/data/missions";
import { getMissionsForDifficulty as getGeneratedMissions, getMissionById as getGeneratedById } from "@/data/mission-adapter";

export function emptyCategoryStats(): Profile["categoryStats"] {
  return CATEGORIES.reduce((acc, c) => {
    acc[c.id] = { correct: 0, total: 0 };
    return acc;
  }, {} as Profile["categoryStats"]);
}

export function strongestCategory(p: Profile): CategoryId | null {
  let best: CategoryId | null = null;
  let bestRatio = -1;
  for (const c of CATEGORIES) {
    const s = p.categoryStats[c.id];
    if (!s || s.total === 0) continue;
    const r = s.correct / s.total;
    if (r > bestRatio) {
      bestRatio = r;
      best = c.id;
    }
  }
  return best;
}

export function weakestCategory(p: Profile): CategoryId | null {
  let worst: CategoryId | null = null;
  let worstRatio = 2;
  for (const c of CATEGORIES) {
    const s = p.categoryStats[c.id];
    if (!s || s.total === 0) continue;
    const r = s.correct / s.total;
    if (r < worstRatio) {
      worstRatio = r;
      worst = c.id;
    }
  }
  return worst;
}

export function missionsForDifficulty(d: DifficultyId): Mission[] {
  // Try legacy missions first
  const legacy = MISSIONS.filter((m) => m.difficulty === d);
  
  // Use generated stages (500-stage system)
  try {
    const generated = getGeneratedMissions(d);
    
    if (legacy.length === 0) {
      // No legacy missions, use generated
      return generated.sort((a, b) => a.number - b.number);
    }
    
    // Merge: legacy for stages they cover, generated for remaining 301-500
    const legacyNums = new Set(legacy.map(m => m.number));
    const merged = [...legacy];
    
    for (const gm of generated) {
      if (!legacyNums.has(gm.number)) {
        merged.push(gm);
      }
    }
    
    return merged.sort((a, b) => a.number - b.number);
  } catch {
    return legacy.sort((a, b) => a.number - b.number);
  }
}

/** Get mission by ID from either legacy or generated pool */
export function findMissionById(id: string): Mission | null {
  const legacy = MISSIONS.find(m => m.id === id);
  if (legacy) return legacy;
  try {
    return getGeneratedById(id);
  } catch {
    return null;
  }
}

export function checkBadges(profile: Profile): string[] {
  const earned = new Set(profile.badges);
  const completedMissions = Object.values(profile.missionProgress).filter((p) => p.stars > 0);

  const getCompletedForCategory = (cat: CategoryId) =>
    completedMissions.filter((mp) => {
      const m = MISSIONS.find((x) => x.id === mp.missionId);
      return m && (m.category === cat || m.secondaryCategory === cat);
    });

  // Sahabat Amanah: complete 10 moral missions with best choice
  const moralMissions = getCompletedForCategory("moral");
  const moralBestChoices = moralMissions.filter(mp => mp.bestChoiceSelected).length;
  if (moralBestChoices >= 10) earned.add("sahabat-amanah");

  // Pemecah Pola: complete 10 pattern missions
  if (getCompletedForCategory("pola").length >= 10) earned.add("pemecah-pola");

  // Penjelajah Ilmu: complete 25 total missions
  if (completedMissions.length >= 25) earned.add("penjelajah-ilmu");

  // Pemimpin Bijak: complete 5 boss leadership missions (moral category + isBossMission)
  const bossLeadershipMissions = completedMissions.filter(mp => {
    const m = MISSIONS.find((x) => x.id === mp.missionId);
    return m && m.isBossMission && (m.category === "moral" || m.secondaryCategory === "moral");
  }).length;
  if (bossLeadershipMissions >= 5) earned.add("pemimpin-bijak");

  // Ahli Numerasi: complete 10 numeracy missions
  if (getCompletedForCategory("literasi-numerasi").length >= 10) earned.add("ahli-numerasi");

  // Penjaga Adab: 7-day adab mission streak
  if (profile.adabStreak >= 7) earned.add("penjaga-adab");

  return Array.from(earned);
}

export function newlyUnlockedBadges(before: string[], after: string[]): typeof BADGES {
  const beforeSet = new Set(before);
  return BADGES.filter((b) => after.includes(b.id) && !beforeSet.has(b.id));
}

/** Total stars earned across all missions. */
export function totalStarsEarned(profile: Profile): number {
  return Object.values(profile.missionProgress).reduce((sum, mp) => sum + mp.stars, 0);
}

/** Count of missions where best adab choice was selected. */
export function adabBestChoiceCount(profile: Profile): number {
  return Object.values(profile.missionProgress).filter(mp => mp.bestChoiceSelected).length;
}

/** Recent completed missions sorted by completion time (newest first). */
export function recentCompletedMissions(profile: Profile, limit = 5): { mission: Mission; stars: number }[] {
  return Object.values(profile.missionProgress)
    .filter(mp => mp.stars > 0)
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, limit)
    .map(mp => {
      const mission = MISSIONS.find(m => m.id === mp.missionId);
      return { mission: mission!, stars: mp.stars };
    })
    .filter(x => x.mission);
}

/** Recommend next missions based on: next unlocked, or boss mission ahead, or weakest category. */
export function recommendedMissions(profile: Profile, limit = 3): Mission[] {
  const difficultyMissions = missionsForDifficulty(profile.difficulty);
  const completedIds = new Set(
    Object.entries(profile.missionProgress)
      .filter(([, mp]) => mp.stars > 0)
      .map(([id]) => id)
  );
  const completedNumbers = difficultyMissions
    .filter(m => completedIds.has(m.id))
    .map(m => m.number);
  const highestCompleted = completedNumbers.length > 0 ? Math.max(...completedNumbers) : 0;

  const recommendations: Mission[] = [];

  // 1. Next sequential mission
  const nextMissions = difficultyMissions
    .filter(m => m.number > highestCompleted && !completedIds.has(m.id))
    .sort((a, b) => a.number - b.number)
    .slice(0, 2);
  recommendations.push(...nextMissions);

  // 2. Upcoming boss mission if any
  if (recommendations.length < limit) {
    const upcomingBoss = difficultyMissions.find(
      m => m.isBossMission && m.number > highestCompleted && !completedIds.has(m.id)
    );
    if (upcomingBoss && !recommendations.find(r => r.id === upcomingBoss.id)) {
      recommendations.push(upcomingBoss);
    }
  }

  // 3. Mission in weakest category
  const weak = weakestCategory(profile);
  if (weak && recommendations.length < limit) {
    const weakMission = difficultyMissions.find(
      m => (m.category === weak || m.secondaryCategory === weak) &&
        !completedIds.has(m.id) &&
        !recommendations.find(r => r.id === m.id)
    );
    if (weakMission) recommendations.push(weakMission);
  }

  return recommendations.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
// Difficulty Utilities
// ═══════════════════════════════════════════════════════════════

/** Get the ordered list of all difficulty levels */
export function getDifficultyOrder(): DifficultyId[] {
  return [...DIFFICULTY_ORDER];
}

/**
 * Get the next difficulty level after the given one.
 * Returns null if already at max difficulty.
 */
export function getNextDifficulty(current: DifficultyId): DifficultyId | null {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  if (idx === -1 || idx >= DIFFICULTY_ORDER.length - 1) return null;
  return DIFFICULTY_ORDER[idx + 1];
}

/**
 * Get the previous difficulty level.
 */
export function getPreviousDifficulty(current: DifficultyId): DifficultyId | null {
  const idx = DIFFICULTY_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return DIFFICULTY_ORDER[idx - 1];
}

/** Check if the given difficulty is the final one (Universitas) */
export function isFinalDifficulty(difficulty: DifficultyId): boolean {
  return difficulty === "universitas";
}

/**
 * Normalize difficulty name — maps old terminology to current.
 * "sd-kecil" → "sd-bawah", "sd-muda" → "sd-atas"
 */
export function normalizeDifficultyName(difficulty: string): DifficultyId {
  if (difficulty === "sd-kecil") return "sd-bawah";
  if (difficulty === "sd-muda") return "sd-atas";
  if (DIFFICULTY_ORDER.includes(difficulty as DifficultyId)) return difficulty as DifficultyId;
  return "sd-bawah"; // safe fallback
}

/**
 * Get default unlocked difficulties for a new profile.
 */
export function getDefaultUnlockedDifficulties(startDifficulty: DifficultyId): DifficultyId[] {
  const idx = DIFFICULTY_ORDER.indexOf(startDifficulty);
  return DIFFICULTY_ORDER.slice(0, idx + 1);
}

// ═══════════════════════════════════════════════════════════════
// DEPRECATED — Old "complete all missions" unlock system.
// The 500-stage system below replaces this. These remain for
// backward compatibility but should NOT trigger difficulty unlock.
// ═══════════════════════════════════════════════════════════════

/**
 * @deprecated Use hasCompletedStage500() instead.
 * Difficulty unlock is now based on completing stage 500, NOT all missions.
 */
export function hasCompletedAllMissionsInDifficulty(profile: Profile): boolean {
  const diffMissions = missionsForDifficulty(profile.difficulty);
  if (diffMissions.length === 0) return false;
  return diffMissions.every((m) => (profile.missionProgress[m.id]?.stars ?? 0) > 0);
}

/**
 * @deprecated Difficulty unlock now requires stage 500 completion.
 * EXP does not unlock difficulty. Use the stage-500 flow instead.
 */
export function checkDifficultyUpgrade(profile: Profile): DifficultyId | null {
  // No longer active — difficulty is unlocked only via stage 500 completion.
  // This function is kept for backward compat but always returns null.
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Stage 500 Difficulty Completion System (PRIMARY UNLOCK MECHANISM)
// ═══════════════════════════════════════════════════════════════
//
// IMPORTANT RULES:
//   - EXP does NOT unlock difficulty.
//   - Difficulty unlocks ONLY after completing stage 500.
//   - Stage 300 is NOT a completion trigger.
//   - Universitas is the final difficulty (no next).
// ═══════════════════════════════════════════════════════════════

/** Check if a stage number is the final stage (500) for any difficulty */
export function isFinalStage(stageNumber: number): boolean {
  return stageNumber === FINAL_STAGE_NUMBER;
}

/** Check if the stage number is the old 300 (should NOT trigger completion) */
export function isLegacyCompletionStage(stageNumber: number): boolean {
  return stageNumber === 300;
}

/** Get the reward definition for completing a difficulty */
export function getDifficultyCompletionRewardDef(difficulty: DifficultyId): { exp: number; coins: number; gems: number; lencana: string[] } | null {
  return DIFFICULTY_COMPLETION_REWARDS[difficulty] || null;
}

/** Check if a profile has already claimed the final reward for a difficulty */
export function hasClaimedDifficultyCompletionReward(profile: Profile, difficulty: DifficultyId): boolean {
  const rewards = profile.claimedFinalRewardsByDifficulty || {};
  return rewards[difficulty]?.rewardClaimed === true;
}

/** Check if a profile has a pending (unopened) final reward for a difficulty */
export function hasPendingFinalReward(profile: Profile, difficulty: DifficultyId): boolean {
  const rewards = profile.claimedFinalRewardsByDifficulty || {};
  return rewards[difficulty]?.rewardPending === true;
}

/** Check if stage 500 has been completed (1+ star) for a given difficulty */
export function hasCompletedStage500(profile: Profile, difficulty: DifficultyId): boolean {
  const diffMissions = missionsForDifficulty(difficulty);
  const stage500 = diffMissions.find(m => m.number === FINAL_STAGE_NUMBER);
  if (!stage500) return false;
  return (profile.missionProgress[stage500.id]?.stars ?? 0) > 0;
}

/**
 * Check if a difficulty has been fully completed.
 * A difficulty is "completed" if stage 500 has been finished AND the reward has been claimed.
 */
export function hasCompletedDifficulty(profile: Profile, difficulty: DifficultyId): boolean {
  return hasClaimedDifficultyCompletionReward(profile, difficulty);
}

/**
 * Mark a difficulty as completed (adds to completedDifficulties list).
 * Does NOT touch rewards — call claimDifficultyCompletionReward first.
 */
export function markDifficultyCompleted(profile: Profile, difficulty: DifficultyId): Profile {
  if (profile.completedDifficulties.includes(difficulty)) return profile;
  return {
    ...profile,
    completedDifficulties: [...profile.completedDifficulties, difficulty],
  };
}

/** Get the pending final reward difficulty for a profile (if any) */
export function getPendingFinalRewardDifficulty(profile: Profile): DifficultyId | null {
  return profile.pendingFinalRewardDifficulty || null;
}

/** Mark a difficulty as having a pending final reward (box shown but not yet opened) */
export function markFinalRewardPending(profile: Profile, difficulty: DifficultyId): Profile {
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

/** Claim the final reward for a difficulty. Returns updated profile with rewards applied. */
export function claimDifficultyCompletionReward(profile: Profile, difficulty: DifficultyId): Profile | null {
  const def = DIFFICULTY_COMPLETION_REWARDS[difficulty];
  if (!def) return null;

  const rewards = { ...(profile.claimedFinalRewardsByDifficulty || {}) };
  if (rewards[difficulty]?.rewardClaimed) return null; // already claimed — prevent double

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

  // Award badges — no duplicates
  const newBadges = [...profile.badges];
  for (const badgeId of def.lencana) {
    if (!newBadges.includes(badgeId)) {
      newBadges.push(badgeId);
    }
  }

  // Award XP, coins, gems
  const updated: Profile = {
    ...profile,
    xp: profile.xp + def.exp,
    points: profile.points + def.gems,
    coins: profile.coins + def.coins,
    badges: newBadges,
    claimedFinalRewardsByDifficulty: rewards,
    pendingFinalRewardDifficulty: null,
  };

  // Add to completed difficulties if not already there
  if (!updated.completedDifficulties.includes(difficulty)) {
    updated.completedDifficulties = [...updated.completedDifficulties, difficulty];
  }

  return updated;
}

/** Unlock the next difficulty for a profile (does NOT change current difficulty) */
export function unlockNextDifficulty(profile: Profile, currentDifficulty: DifficultyId): Profile | null {
  const next = getNextDifficulty(currentDifficulty);
  if (!next) return null;

  const unlocked = [...(profile.unlockedDifficulties || [])];
  if (unlocked.includes(next)) return null; // already unlocked — no double unlock

  unlocked.push(next);

  return {
    ...profile,
    unlockedDifficulties: unlocked,
    pendingDifficultyUpgrade: next,
  };
}

/** Set a pending difficulty upgrade (user chose "Nanti Dulu") */
export function setPendingDifficultyUpgrade(profile: Profile, nextDifficulty: DifficultyId): Profile {
  return {
    ...profile,
    difficultyUpgradeAvailable: true,
    pendingDifficultyUpgrade: nextDifficulty,
  };
}

/** Clear the pending difficulty upgrade after user switches */
export function clearPendingDifficultyUpgrade(profile: Profile): Profile {
  return {
    ...profile,
    difficultyUpgradeAvailable: false,
    pendingDifficultyUpgrade: null,
  };
}

/** Upgrade to the next difficulty — changes current difficulty and clears pending */
export function applyDifficultyUpgrade(profile: Profile): Profile | null {
  const nextDiff = profile.pendingDifficultyUpgrade;
  if (!nextDiff) return null;

  return {
    ...profile,
    difficulty: nextDiff,
    currentDifficulty: nextDiff,
    difficultyUpgradeAvailable: false,
    pendingDifficultyUpgrade: null,
    upgradedAt: Date.now(),
  };
}

/** Mark that the upgrade prompt has been shown (so we don't re-show it) */
export function markUpgradePromptShown(profile: Profile, difficulty: DifficultyId): Profile {
  const rewards = { ...(profile.claimedFinalRewardsByDifficulty || {}) };
  if (rewards[difficulty]) {
    rewards[difficulty] = { ...rewards[difficulty], upgradePromptShown: true };
  }
  return {
    ...profile,
    claimedFinalRewardsByDifficulty: rewards,
  };
}

// ═══════════════════════════════════════════════════════════════
// Stage Progress Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a stage is a first-time completion (never completed before).
 * Returns true if completedCount would be 0 before this completion.
 */
export function isFirstCompletion(profile: Profile, stageId: string): boolean {
  const progress = profile.missionProgress[stageId];
  if (!progress) return true; // never played = first completion
  return (progress.completedCount ?? (progress.stars > 0 ? 1 : 0)) === 0;
}

/** Get the current stage number for a difficulty (highest completed + 1, or 1 if none) */
export function getCurrentStageByDifficulty(profile: Profile, difficulty: DifficultyId): number {
  const diffMissions = missionsForDifficulty(difficulty);
  const completedIds = new Set(
    Object.entries(profile.missionProgress)
      .filter(([, mp]) => mp.stars > 0)
      .map(([id]) => id)
  );
  const completedNums = diffMissions
    .filter(m => completedIds.has(m.id))
    .map(m => m.number);
  return completedNums.length > 0 ? Math.max(...completedNums) + 1 : 1;
}

/** Get count of completed stages for a difficulty */
export function getCompletedStageCount(profile: Profile, difficulty: DifficultyId): number {
  const diffMissions = missionsForDifficulty(difficulty);
  const completedIds = new Set(
    Object.entries(profile.missionProgress)
      .filter(([, mp]) => mp.stars > 0)
      .map(([id]) => id)
  );
  return diffMissions.filter(m => completedIds.has(m.id)).length;
}

/** Get stage completion status for display */
export function getStageCompletionStatus(
  profile: Profile,
  difficulty: DifficultyId
): { completed: number; total: number; label: string } {
  const completed = getCompletedStageCount(profile, difficulty);
  const total = missionsForDifficulty(difficulty).length;
  return {
    completed,
    total: total || 500,
    label: `${completed}/${total || 500}`,
  };
}

/**
 * Get progress summary for all difficulties.
 * Returns: locked | unlocked | active | completed
 */
export function getDifficultyStatus(
  profile: Profile,
  difficulty: DifficultyId
): "locked" | "unlocked" | "active" | "completed" {
  if (hasCompletedDifficulty(profile, difficulty)) return "completed";
  if (profile.currentDifficulty === difficulty || profile.difficulty === difficulty) return "active";
  if (profile.unlockedDifficulties.includes(difficulty)) return "unlocked";
  return "locked";
}

/** Check if a profile has any pending final rewards to claim */
export function hasAnyPendingFinalRewards(profile: Profile): boolean {
  return profile.pendingFinalRewardDifficulty !== null && profile.pendingFinalRewardDifficulty !== undefined;
}

// ═══════════════════════════════════════════════════════════════
// Mission Reward Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate adventure mission reward based on first completion vs replay.
 * First completion: 1.0x multiplier
 * Replay: 0.25x multiplier (floor, minimum 1 for XP/points if base > 0)
 */
export function calculateRewardMultiplier(profile: Profile, stageId: string): number {
  return isFirstCompletion(profile, stageId) ? 1.0 : 0.25;
}

/** Check if a stage reward has been claimed */
export function hasClaimedStageReward(profile: Profile, stageId: string): boolean {
  return profile.claimedStageRewardIds?.includes(stageId) ?? false;
}

/** Mark a stage reward as claimed (first time only) */
export function claimStageReward(profile: Profile, stageId: string): Profile {
  if (profile.claimedStageRewardIds?.includes(stageId)) return profile;
  return {
    ...profile,
    claimedStageRewardIds: [...(profile.claimedStageRewardIds || []), stageId],
  };
}

/** Check if difficulty progression is valid — returns error message or null */
export function validateProgressionState(profile: Profile): string | null {
  // Stage 300 should NOT be a completion trigger
  // Check that no old-format completions exist
  const hasOld300Completion = profile.completedDifficulties.some(() => {
    // We can't detect old 300 specifically without historical data,
    // but the migration should have handled it. Users with 300/300
    // will show as 300/500 in the status window.
    return false;
  });
  
  // Universitas should never have a next difficulty
  if (profile.difficulty === "universitas" && profile.pendingDifficultyUpgrade) {
    return "Universitas should not have pending difficulty upgrade";
  }

  return null;
}
