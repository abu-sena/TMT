import type { Mission } from "@/types";
import { DIFFICULTY_MAP } from "@/data/constants";

export interface ScoreInput {
  mission: Mission;
  isCorrect: boolean;
  hintsUsed: number;
  attempts: number; // 1 = first try
  streak: number;
  adabApplied: boolean;
  isBestChoice?: boolean;
  elapsedSeconds?: number;
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
    fastCompletionBonus: number;
  };
}

export function scoreMission(input: ScoreInput): ScoreResult {
  const { mission, isCorrect, hintsUsed, attempts, streak, adabApplied, isBestChoice, elapsedSeconds } = input;
  const diff = DIFFICULTY_MAP[mission.difficulty];
  const base = mission.basePoint;

  // Boss mission extra multiplier
  const bossMultiplier = mission.isBossMission && mission.missionType === "boss_mission"
    ? ((mission as any).bossRewardMultiplier as number) ?? 2.0
    : 1.0;
  
  // Performance factors
  let performanceMultiplier = 0;
  if (isCorrect) {
    if (attempts === 1) performanceMultiplier = 1.0;
    else if (attempts === 2) performanceMultiplier = 0.7;
    else performanceMultiplier = 0.4;
  }

  // Fast completion bonus
  let fastCompletionBonus = 0;
  if (isCorrect && elapsedSeconds !== undefined && mission.estimatedTime) {
    if (elapsedSeconds <= mission.estimatedTime * 0.5) fastCompletionBonus = 20;
    else if (elapsedSeconds <= mission.estimatedTime) fastCompletionBonus = 10;
  }

  // Penalties
  const hintPenalty = hintsUsed * 10;
  const attemptPenalty = Math.max(0, attempts - 1) * 15;
  
  // Bonuses
  const adabBonus = (isCorrect && adabApplied) || isBestChoice ? (mission.adabBonus ?? 10) : 0;
  const streakBonus = isCorrect ? Math.min(streak, 10) * 5 : 0;

  // Final Point Calculation (with boss multiplier)
  const raw = Math.round(
    base * diff.multiplier * performanceMultiplier * bossMultiplier +
    adabBonus +
    streakBonus +
    fastCompletionBonus -
    hintPenalty -
    attemptPenalty
  );
  const finalPoint = Math.max(0, raw);

  // Stars Calculation
  let stars = 0;
  if (isCorrect) {
    if (attempts === 1 && hintsUsed === 0) stars = 3;
    else if (attempts <= 2 && hintsUsed <= 1) stars = 2;
    else stars = 1;
  }

  // XP is roughly a percentage of final points + base completion value
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
      fastCompletionBonus,
    },
  };
}
