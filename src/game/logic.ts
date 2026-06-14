import type { CategoryId, DifficultyId, Mission, Profile } from "./types";
import { DIFFICULTY_MAP, CATEGORIES, BADGES } from "./constants";
import { MISSIONS } from "./missions";

export function nextLevelXP(currentLevel: number): number {
  return 500 + currentLevel * 150 + currentLevel * currentLevel * 20;
}

export function xpProgress(profile: Profile): { current: number; needed: number; percent: number } {
  const needed = nextLevelXP(profile.level);
  const percent = Math.min(100, Math.round((profile.xp / needed) * 100));
  return { current: profile.xp, needed, percent };
}

export interface ScoreInput {
  mission: Mission;
  isCorrect: boolean;
  hintsUsed: number;
  attempts: number; // 1 = first try
  streak: number;
  adabApplied: boolean;
}

export interface ScoreResult {
  finalPoint: number;
  stars: number;
  xpGain: number;
  breakdown: {
    base: number;
    difficultyMultiplier: number;
    performanceMultiplier: number;
    adabBonus: number;
    streakBonus: number;
    hintPenalty: number;
    attemptPenalty: number;
  };
}

export function scoreMission(input: ScoreInput): ScoreResult {
  const { mission, isCorrect, hintsUsed, attempts, streak, adabApplied } = input;
  const diff = DIFFICULTY_MAP[mission.difficulty];
  const base = mission.basePoint;
  const performanceMultiplier = isCorrect ? (attempts === 1 ? 1.0 : attempts === 2 ? 0.7 : 0.4) : 0.1;
  const hintPenalty = hintsUsed * 10;
  const attemptPenalty = Math.max(0, attempts - 1) * 15;
  const adabBonus = isCorrect && adabApplied ? (mission.adabBonus ?? 0) : 0;
  const streakBonus = isCorrect ? Math.min(streak, 10) * 5 : 0;

  const raw = Math.round(base * diff.multiplier * performanceMultiplier + adabBonus + streakBonus - hintPenalty - attemptPenalty);
  const finalPoint = Math.max(0, raw);

  // stars: 3 if first try no hint, 2 if first try with hint or 2nd try, 1 if got it eventually, 0 if wrong
  let stars = 0;
  if (isCorrect) {
    if (attempts === 1 && hintsUsed === 0) stars = 3;
    else if (attempts === 1 || hintsUsed <= 1) stars = 2;
    else stars = 1;
  }
  const xpGain = Math.round(finalPoint * 0.6) + (isCorrect ? 20 : 5);
  return {
    finalPoint,
    stars,
    xpGain,
    breakdown: {
      base,
      difficultyMultiplier: diff.multiplier,
      performanceMultiplier,
      adabBonus,
      streakBonus,
      hintPenalty,
      attemptPenalty,
    },
  };
}

export function applyXP(profile: Profile, xpGain: number): { level: number; xp: number; leveledUp: boolean } {
  let xp = profile.xp + xpGain;
  let level = profile.level;
  let leveledUp = false;
  while (xp >= nextLevelXP(level)) {
    xp -= nextLevelXP(level);
    level += 1;
    leveledUp = true;
  }
  return { level, xp, leveledUp };
}

export function missionsForDifficulty(d: DifficultyId): Mission[] {
  return MISSIONS.filter((m) => m.difficulty === d).sort((a, b) => a.number - b.number);
}

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

export function checkBadges(profile: Profile): string[] {
  const earned = new Set(profile.badges);
  const completedMissions = Object.values(profile.missionProgress).filter((p) => p.stars > 0);

  const countByCategory = (cat: CategoryId) =>
    completedMissions.filter((mp) => {
      const m = MISSIONS.find((x) => x.id === mp.missionId);
      return m && (m.category === cat || m.secondaryCategory === cat);
    }).length;

  if (countByCategory("moral") >= 3) earned.add("sahabat-amanah");
  if (countByCategory("pola") >= 3) earned.add("pemecah-pola");
  if (completedMissions.length >= 5) earned.add("penjelajah-ilmu");
  if (countByCategory("literasi-numerasi") >= 3) earned.add("ahli-numerasi");
  // leadership: any moral mission completed in smp or sma
  const leadershipDone = completedMissions.some((mp) => {
    const m = MISSIONS.find((x) => x.id === mp.missionId);
    return m && m.category === "moral" && (m.difficulty === "smp" || m.difficulty === "sma");
  });
  if (leadershipDone) earned.add("pemimpin-bijak");
  // penjaga-adab: 5 adab bonus collected — track separately via attempts? approximate via moral correct count
  const adabHits = completedMissions.filter((mp) => {
    const m = MISSIONS.find((x) => x.id === mp.missionId);
    return m && (m.adabBonus ?? 0) > 0;
  }).length;
  if (adabHits >= 5) earned.add("penjaga-adab");

  return Array.from(earned);
}

export function newlyUnlockedBadges(before: string[], after: string[]): typeof BADGES {
  const beforeSet = new Set(before);
  return BADGES.filter((b) => after.includes(b.id) && !beforeSet.has(b.id));
}
