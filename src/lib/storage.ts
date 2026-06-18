/**
 * React bindings for the StorageService.
 *
 * This file is the primary integration point: every component that reads or
 * writes game state goes through `useGameStore()`.
 *
 * Under the hood it delegates to the singleton StorageService, which can be
 * swapped (localStorage → IndexedDB → Google Cloud) without touching React
 * code.
 */

import { useState, useEffect } from "react";
import type { Profile, DifficultyId, GameStoreState, Gender } from "@/types";
import { emptyCategoryStats, getDefaultUnlockedDifficulties } from "./progress";
import { storageService } from "./storage/service";
import type { DebugExport, ProfileExport } from "./storage/types";

// Re-export the store state type so consumers don't need to know about the
// storage package layout.
export type { GameStoreState } from "@/types";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createProfile(name: string, avatar: string, difficulty: DifficultyId, gender: Gender = "unspecified"): Profile {
  const unlocked = getDefaultUnlockedDifficulties(difficulty);
  return {
    id: crypto.randomUUID(),
    name,
    avatar,
    gender,
    difficulty,
    xp: 0,
    level: 1,
    points: 0,
    coins: 0,
    hearts: 5,
    streak: 0,
    adabStreak: 0,
    lastAdabDate: undefined,
    badges: [],
    missionProgress: {},
    categoryStats: emptyCategoryStats(),
    totalMissionsCompleted: 0,
    timePlayedMinutes: 0,
    createdAt: Date.now(),
    settings: {
      sound: true,
      music: true,
      language: "id",
      googleConnected: false,
      screenTimeReminder: false,
      screenTimeMinutes: 0,
    },
    // Difficulty upgrade
    unlockedDifficulties: unlocked,
    currentDifficulty: difficulty,
    completedDifficulties: [],
    difficultyUpgradeAvailable: false,
  };
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * Primary game-state hook.
 *
 * Returns the full store, a hydrated flag, the active profile (if any),
 * and stable mutation callbacks.
 */
export function useGameStore() {
  const [version, setVersion] = useState(0);
  const storeData = storageService.getState();

  // Hydration: on first mount mark as hydrated.
  useEffect(() => {
    if (!storeData.hydrated) {
      storageService.setHydrated();
      // Force re-render so consumers see hydrated === true.
      setVersion((v) => v + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // We derive everything from the service, but React needs to know when to
  // re-render. We use a simple version counter for that — any mutation bumps it.
  // In a real app you'd use useSyncExternalStore; for this MVP the version
  // counter + key prop pattern suffices.

  const state = storageService.getState();
  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId) ?? null;

  return {
    hydrated: state.hydrated,
    store: state,
    activeProfile,

    // ---- Actions ----
    bumpVersion: () => setVersion((v) => v + 1),

    setOnboardingDone: () => {
      storageService.setOnboardingDone();
      setVersion((v) => v + 1);
    },

    addProfile: (p: Profile) => {
      storageService.addProfile(p);
      setVersion((v) => v + 1);
    },

    selectProfile: (id: string) => {
      storageService.selectProfile(id);
      setVersion((v) => v + 1);
    },

    updateProfile: (id: string, updates: Partial<Profile>) => {
      storageService.updateProfile(id, updates);
      setVersion((v) => v + 1);
    },

    deleteProfile: (id: string) => {
      storageService.deleteProfile(id);
      setVersion((v) => v + 1);
    },

    resetProfileProgress: (id: string) => {
      storageService.resetProfileProgress(id, true);
      setVersion((v) => v + 1);
    },

    updateGlobalState: (patch: Partial<GameStoreState>) => {
      storageService.updateGlobalState(patch);
      setVersion((v) => v + 1);
    },

    /** Export full store as JSON for debugging. */
    exportDebugSnapshot: (): DebugExport => storageService.exportDebugSnapshot(),

    /** Export a single profile's data. */
    exportProfile: (profileId: string): ProfileExport | null =>
      storageService.exportProfile(profileId),

    /** Reset entire store (wipes everything). */
    resetAll: () => {
      storageService.resetAll(true);
      setVersion((v) => v + 1);
    },

    addMiniGameSession: (session: import("@/types").MiniGameSession) => {
      storageService.addMiniGameSession(session);
      setVersion((v) => v + 1);
    },

    getLeaderboard: (gameType: string) => storageService.getLeaderboard(gameType),

    saveBattleHistory: (entry: import("@/types").BattleHistoryEntry) => {
      storageService.saveBattleHistory(entry);
      setVersion((v) => v + 1);
    },

    getBattleHistory: () => storageService.getBattleHistory(),

    // ── Reward milestones (Hadiah Dunia Nyata) ──
    getRewards: (profileId?: string) => storageService.getRewards(profileId),

    addReward: (reward: import("@/types").RewardMilestone) => {
      storageService.addReward(reward);
      setVersion((v) => v + 1);
    },

    updateReward: (id: string, updates: Partial<import("@/types").RewardMilestone>) => {
      storageService.updateReward(id, updates);
      setVersion((v) => v + 1);
    },

    deleteReward: (id: string) => {
      storageService.deleteReward(id);
      setVersion((v) => v + 1);
    },

    checkRewardsForProfile: (profileId: string, currentLevel: number) =>
      storageService.checkRewardsForProfile(profileId, currentLevel),
  };
}
