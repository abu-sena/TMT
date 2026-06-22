/**
 * Speed-based scoring helpers for mini-games.
 * 
 * Used by: Ubah Posisi, Jalur Tercepat
 * 
 * Principle: elapsed time (no countdown). Faster completion = higher score.
 */

import type { DifficultyId } from "@/types";

// ══════════════════════════════════════════
// Constants
// ══════════════════════════════════════════

const BASE_SCORE = 100;

const SPEED_BONUS = {
  veryFast: 100,
  fast: 75,
  normal: 50,
  slow: 25,
  verySlow: 10,
} as const;

const DIFFICULTY_BONUS: Record<DifficultyId, number> = {
  tk: 0,
  "sd-bawah": 10,
  "sd-atas": 20,
  smp: 30,
  sma: 40,
  universitas: 50,
};

const EFFICIENCY_BONUS = {
  perfect: 50,
  close: 25,
  basic: 10,
} as const;

// ══════════════════════════════════════════
// Thresholds per difficulty — Ubah Posisi
// ══════════════════════════════════════════

const POSITION_SHIFT_SPEED_THRESHOLDS: Record<string, { veryFast: number; fast: number; normal: number; slow: number }> = {
  tk: { veryFast: 5000, fast: 8000, normal: 12000, slow: 20000 },
  "sd-bawah": { veryFast: 6000, fast: 10000, normal: 15000, slow: 25000 },
  "sd-atas": { veryFast: 8000, fast: 13000, normal: 20000, slow: 30000 },
  smp: { veryFast: 10000, fast: 15000, normal: 22000, slow: 35000 },
  sma: { veryFast: 12000, fast: 18000, normal: 25000, slow: 38000 },
  universitas: { veryFast: 15000, fast: 22000, normal: 30000, slow: 45000 },
};

// ══════════════════════════════════════════
// Elapsed Time Formatting
// ══════════════════════════════════════════

/** Format elapsed time in ms to MM:SS.ms */
export function formatElapsedTime(ms: number): string {
  const totalCentis = Math.floor(ms / 10);
  const min = Math.floor(totalCentis / 6000);
  const sec = Math.floor((totalCentis % 6000) / 100);
  const centi = totalCentis % 100;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(centi).padStart(2, "0")}`;
}

// ══════════════════════════════════════════
// Speed Bonus Calculation
// ══════════════════════════════════════════

/** Calculate speed bonus for Ubah Posisi based on elapsed time and difficulty */
export function calculatePositionShiftSpeedBonus(elapsedMs: number, difficulty: DifficultyId): { bonus: number; tier: string } {
  const thresholds = POSITION_SHIFT_SPEED_THRESHOLDS[difficulty] || POSITION_SHIFT_SPEED_THRESHOLDS["sd-bawah"];

  if (elapsedMs <= thresholds.veryFast) return { bonus: SPEED_BONUS.veryFast, tier: "Sangat Cepat ⚡" };
  if (elapsedMs <= thresholds.fast) return { bonus: SPEED_BONUS.fast, tier: "Cepat 🚀" };
  if (elapsedMs <= thresholds.normal) return { bonus: SPEED_BONUS.normal, tier: "Normal ⭐" };
  if (elapsedMs <= thresholds.slow) return { bonus: SPEED_BONUS.slow, tier: "Lambat 🐢" };
  return { bonus: SPEED_BONUS.verySlow, tier: "Sangat Lambat ⏳" };
}

/** Calculate speed bonus for Jalur Tercepat based on elapsed time and shortest path length */
export function calculateFastestPathSpeedBonus(elapsedMs: number, shortestPathLength: number): { bonus: number; tier: string } {
  const expectedFast = shortestPathLength * 700;
  const expectedNormal = shortestPathLength * 1200;
  const expectedSlow = shortestPathLength * 2000;

  if (elapsedMs <= expectedFast) return { bonus: SPEED_BONUS.veryFast, tier: "Sangat Cepat ⚡" };
  if (elapsedMs <= expectedNormal) return { bonus: SPEED_BONUS.fast, tier: "Cepat 🚀" };
  if (elapsedMs <= expectedSlow) return { bonus: SPEED_BONUS.normal, tier: "Normal ⭐" };
  return { bonus: SPEED_BONUS.slow, tier: "Lambat 🐢" };
}

// ══════════════════════════════════════════
// Path Efficiency Bonus
// ══════════════════════════════════════════

/** Calculate efficiency bonus for Jalur Tercepat — how close user's steps are to shortest path */
export function calculatePathEfficiencyBonus(userSteps: number, shortestPathLength: number): { bonus: number; tier: string } {
  if (shortestPathLength === 0) return { bonus: 0, tier: "" };

  const diff = userSteps - shortestPathLength;
  if (diff === 0) return { bonus: EFFICIENCY_BONUS.perfect, tier: "Jalur Sempurna 🎯" };
  if (diff >= 1 && diff <= 3) return { bonus: EFFICIENCY_BONUS.close, tier: "Jalur Efisien 👌" };
  return { bonus: EFFICIENCY_BONUS.basic, tier: "Jalur Aman 🚶" };
}

// ══════════════════════════════════════════
// Combined Score Calculation
// ══════════════════════════════════════════

/** Calculate total score for Ubah Posisi: base + speed + difficulty */
export function calculatePositionShiftScore(
  elapsedMs: number,
  difficulty: DifficultyId,
  isCorrect: boolean
): { totalScore: number; speedBonus: number; difficultyBonus: number; speedTier: string } {
  if (!isCorrect) return { totalScore: 0, speedBonus: 0, difficultyBonus: 0, speedTier: "" };

  const speed = calculatePositionShiftSpeedBonus(elapsedMs, difficulty);
  const diffBonus = DIFFICULTY_BONUS[difficulty] || 0;

  return {
    totalScore: BASE_SCORE + speed.bonus + diffBonus,
    speedBonus: speed.bonus,
    difficultyBonus: diffBonus,
    speedTier: speed.tier,
  };
}

/** Calculate total score for Jalur Tercepat: base + speed + difficulty + efficiency */
export function calculateFastestPathScore(
  elapsedMs: number,
  difficulty: DifficultyId,
  userSteps: number,
  shortestPathLength: number
): { totalScore: number; speedBonus: number; difficultyBonus: number; efficiencyBonus: number; speedTier: string; efficiencyTier: string } {
  const speed = calculateFastestPathSpeedBonus(elapsedMs, shortestPathLength);
  const efficiency = calculatePathEfficiencyBonus(userSteps, shortestPathLength);
  const diffBonus = DIFFICULTY_BONUS[difficulty] || 0;

  return {
    totalScore: BASE_SCORE + speed.bonus + efficiency.bonus + diffBonus,
    speedBonus: speed.bonus,
    difficultyBonus: diffBonus,
    efficiencyBonus: efficiency.bonus,
    speedTier: speed.tier,
    efficiencyTier: efficiency.tier,
  };
}
