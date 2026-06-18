/**
 * Mission Adapter — bridges the new Stage system with legacy Mission system
 *
 * Caches generated stages as Mission-compatible objects so that
 * the existing PlayScreen, MapScreen, and other game logic work
 * with all 3000 stages without modification.
 */

import type { Mission, DifficultyId } from "@/types";
import { generateStagesForDifficulty, stageToMission } from "./stage-generator";

// Cache per difficulty to avoid regenerating
const missionCache = new Map<DifficultyId, Mission[]>();

/**
 * Get all missions for a difficulty, including generated stages.
 * Replaces the old missionsForDifficulty from progress.ts.
 */
export function getMissionsForDifficulty(diff: DifficultyId): Mission[] {
  if (missionCache.has(diff)) {
    return missionCache.get(diff)!;
  }

  try {
    const stages = generateStagesForDifficulty(diff);
    const missions = stages.map(stageToMission);
    missionCache.set(diff, missions);
    return missions;
  } catch (err) {
    console.error(`[MissionAdapter] Failed to generate stages for ${diff}:`, err);
    return [];
  }
}

/**
 * Get all missions across all difficulties.
 */
export function getAllMissions(): Mission[] {
  const all: Mission[] = [];
  for (const diff of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as DifficultyId[]) {
    all.push(...getMissionsForDifficulty(diff));
  }
  return all;
}

/**
 * Clear the cache (useful for testing/dev).
 */
export function clearMissionCache(): void {
  missionCache.clear();
}

/**
 * Get a single mission by ID (searches all difficulties).
 */
export function getMissionById(id: string): Mission | null {
  for (const diff of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as DifficultyId[]) {
    const missions = getMissionsForDifficulty(diff);
    const found = missions.find(m => m.id === id);
    if (found) return found;
  }
  return null;
}

/**
 * Get the count of missions per difficulty.
 */
export function getMissionCounts(): Record<DifficultyId, number> {
  const counts: Record<string, number> = {};
  for (const diff of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as DifficultyId[]) {
    counts[diff] = getMissionsForDifficulty(diff).length;
  }
  return counts as Record<DifficultyId, number>;
}
