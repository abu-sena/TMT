import type { Profile, CategoryId, DifficultyId, Mission } from "@/types";
import { DIFFICULTY_ORDER } from "@/types";
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
  // Try legacy missions first, fall back to generated
  const legacy = MISSIONS.filter((m) => m.difficulty === d);
  if (legacy.length > 0) return legacy.sort((a, b) => a.number - b.number);

  // Use generated stages (3000-stage system)
  try {
    return getGeneratedMissions(d);
  } catch {
    return legacy;
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
// Difficulty Upgrade System
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a profile has completed all missions in their current difficulty.
 * Returns true if every mission in the difficulty has at least 1 star.
 */
export function hasCompletedAllMissionsInDifficulty(profile: Profile): boolean {
  const diffMissions = missionsForDifficulty(profile.difficulty);
  if (diffMissions.length === 0) return false;
  return diffMissions.every((m) => (profile.missionProgress[m.id]?.stars ?? 0) > 0);
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

/**
 * Check if upgrade is available and return the next difficulty.
 * Returns null if not eligible or already at max.
 */
export function checkDifficultyUpgrade(profile: Profile): DifficultyId | null {
  if (!hasCompletedAllMissionsInDifficulty(profile)) return null;

  const next = getNextDifficulty(profile.difficulty);
  if (!next) return null;

  // Already unlocked?
  if (profile.unlockedDifficulties?.includes(next)) return null;

  return next;
}

/**
 * Get default unlocked difficulties for a new profile.
 */
export function getDefaultUnlockedDifficulties(startDifficulty: DifficultyId): DifficultyId[] {
  const idx = DIFFICULTY_ORDER.indexOf(startDifficulty);
  return DIFFICULTY_ORDER.slice(0, idx + 1);
}
