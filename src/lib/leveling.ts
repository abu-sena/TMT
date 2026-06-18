import type { Profile } from "@/types";

export function nextLevelXP(currentLevel: number): number {
  return 500 + currentLevel * 150 + currentLevel * currentLevel * 20;
}

export function xpProgress(profile: Profile): { current: number; needed: number; percent: number } {
  const needed = nextLevelXP(profile.level);
  const percent = Math.min(100, Math.round((profile.xp / needed) * 100));
  return { current: profile.xp, needed, percent };
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
