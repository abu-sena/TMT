/**
 * StorageService — the single persistence API for TMT.
 *
 * All data reads/writes go through this service. The current backend is
 * `localStorage` but the interface is abstract enough to swap in IndexedDB,
 * Google Drive, or a REST API later without touching game logic.
 *
 * Offline-first guarantees:
 *   - Missions are imported from bundled TypeScript (no network fetch).
 *   - Progress is written to localStorage synchronously.
 *   - No internet permission is required for core gameplay.
 */

import type { GameStoreState, Profile } from "@/types";
import type { ProfileExport, DebugExport, VersionedStore } from "./types";
import { CURRENT_VERSION, STORAGE_KEYS } from "./constants";
import { applyMigrations } from "./migrations";
import { emptyCategoryStats } from "../progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Low-level localStorage adapter (pluggable)
// ---------------------------------------------------------------------------

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const localStorageAdapter: StorageAdapter = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("[Storage] Failed to write to localStorage:", e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

// ---------------------------------------------------------------------------
// StorageService
// ---------------------------------------------------------------------------

export class StorageService {
  private adapter: StorageAdapter;
  private cache: VersionedStore | null = null;
  private dirty = false;

  constructor(adapter: StorageAdapter = localStorageAdapter) {
    this.adapter = adapter;
  }

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  /**
   * Load the full game store from persistence.
   *
   * On first run returns an empty default store (versioned).
   * Automatically runs pending migrations when schema version changed.
   * Takes a backup before any migration so data is never lost.
   */
  load(): VersionedStore {
    if (this.cache) return this.cache;

    const raw = this.adapter.getItem(STORAGE_KEYS.store);
    if (!raw) {
      const fresh: VersionedStore = {
        version: CURRENT_VERSION,
        lastSaved: nowISO(),
        data: this.defaultState(),
      };
      this.cache = fresh;
      this.persist();
      return fresh;
    }

    let parsed: VersionedStore;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("[Storage] Corrupted store — resetting to defaults.", e);
      this.adapter.setItem(
        STORAGE_KEYS.migrationBackup,
        JSON.stringify({ reason: "parse-error", original: raw, at: nowISO() }),
      );
      const fresh: VersionedStore = {
        version: CURRENT_VERSION,
        lastSaved: nowISO(),
        data: this.defaultState(),
      };
      this.cache = fresh;
      this.persist();
      return fresh;
    }

    // Version check & migration
    if (!parsed.version || parsed.version < CURRENT_VERSION) {
      // Backup before migration
      this.adapter.setItem(
        STORAGE_KEYS.migrationBackup,
        JSON.stringify({ reason: "pre-migration", version: parsed.version, data: parsed, at: nowISO() }),
      );

      try {
        parsed.data = applyMigrations(parsed.data, parsed.version || 0);
        parsed.version = CURRENT_VERSION;
        parsed.lastSaved = nowISO();
      } catch (e) {
        console.error("[Storage] Migration failed — restoring defaults.", e);
        parsed = {
          version: CURRENT_VERSION,
          lastSaved: nowISO(),
          data: this.defaultState(),
        };
      }
    }

    // Ensure minimum shape
    parsed.data = { ...this.defaultState(), ...parsed.data };

    this.cache = parsed;
    this.dirty = true;
    this.persist(); // write migrated data back
    return parsed;
  }

  /**
   * Persist current cache to the adapter.
   */
  persist(): void {
    if (!this.cache) return;
    this.cache.lastSaved = nowISO();
    try {
      this.adapter.setItem(STORAGE_KEYS.store, JSON.stringify(this.cache));
      this.dirty = false;
    } catch (e) {
      console.error("[Storage] Failed to save:", e);
    }
  }

  /**
   * Reload from the adapter, discarding in-memory cache.
   */
  reload(): VersionedStore {
    this.cache = null;
    return this.load();
  }

  // ------------------------------------------------------------------
  // State accessors
  // ------------------------------------------------------------------

  getState(): GameStoreState {
    return this.load().data;
  }

  getProfiles(): Profile[] {
    return this.load().data.profiles;
  }

  getActiveProfile(): Profile | null {
    const s = this.load().data;
    return s.profiles.find((p) => p.id === s.activeProfileId) ?? null;
  }

  getProfileById(id: string): Profile | null {
    return this.load().data.profiles.find((p) => p.id === id) ?? null;
  }

  isHydrated(): boolean {
    return this.load().data.hydrated;
  }

  isOnboardingDone(): boolean {
    return this.load().data.onboardingDone;
  }

  // ------------------------------------------------------------------
  // Mutations
  // ------------------------------------------------------------------

  /** Mark the store as hydrated (called once after initial load). */
  setHydrated(): void {
    this.updateGlobalState({ hydrated: true });
  }

  setOnboardingDone(): void {
    this.updateGlobalState({ onboardingDone: true });
  }

  addProfile(profile: Profile): void {
    const state = this.getState();
    this.updateGlobalState({
      profiles: [...state.profiles, profile],
      activeProfileId: profile.id,
    });
  }

  selectProfile(id: string): void {
    this.updateGlobalState({ activeProfileId: id });
  }

  updateProfile(id: string, updates: Partial<Profile>): void {
    const state = this.getState();
    this.updateGlobalState({
      profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  }

  deleteProfile(id: string): void {
    const state = this.getState();
    this.updateGlobalState({
      profiles: state.profiles.filter((p) => p.id !== id),
      activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
    });
  }

  /**
   * Reset a profile's progress while keeping the profile itself.
   * Clears: xp, level, points, coins, hearts, streak, badges, missionProgress,
   *         categoryStats, totalMissionsCompleted.
   * Preserves: id, name, avatar, difficulty, settings, createdAt.
   *
   * Requires an explicit `confirmed: true` flag to prevent accidental calls.
   */
  resetProfileProgress(id: string, confirmed: boolean): boolean {
    if (!confirmed) return false;
    const state = this.getState();
    const profile = state.profiles.find((p) => p.id === id);
    if (!profile) return false;

    this.updateGlobalState({
      profiles: state.profiles.map((p) =>
        p.id === id
          ? {
              ...p,
              xp: 0,
              level: 1,
              points: 0,
              coins: 0,
              hearts: 5,
              streak: 0,
              adabStreak: 0,
              lastPlayDate: undefined,
              lastAdabDate: undefined,
              badges: [],
              missionProgress: {},
              categoryStats: emptyCategoryStats(),
              totalMissionsCompleted: 0,
              timePlayedMinutes: 0,
            }
          : p,
      ),
    });
    return true;
  }

  /**
   * Reset the entire store to factory defaults (all profiles wiped).
   * Requires explicit confirmation.
   */
  resetAll(confirmed: boolean): boolean {
    if (!confirmed) return false;
    this.cache = {
      version: CURRENT_VERSION,
      lastSaved: nowISO(),
      data: this.defaultState(),
    };
    this.persist();
    return true;
  }

  // ------------------------------------------------------------------
  // Export / Import (debug & support)
  // ------------------------------------------------------------------

  /**
   * Export the entire local store as a JSON snapshot for debugging.
   */
  exportDebugSnapshot(): DebugExport {
    return {
      exportedAt: nowISO(),
      appName: "TMT",
      schemaVersion: CURRENT_VERSION,
      store: this.load(),
    };
  }

  /**
   * Export a single profile's progress as JSON.
   */
  exportProfile(profileId: string): ProfileExport | null {
    const profile = this.getProfileById(profileId);
    if (!profile) return null;
    return {
      exportedAt: nowISO(),
      profileId: profile.id,
      profileName: profile.name,
      data: profile,
    };
  }

  /**
   * Import a full debug snapshot (replaces all local data).
   * Takes a backup before importing.
   * Requires explicit confirmation.
   */
  importDebugSnapshot(snapshot: DebugExport, confirmed: boolean): boolean {
    if (!confirmed) return false;
    // Backup current state
    const current = this.load();
    this.adapter.setItem(
      STORAGE_KEYS.migrationBackup,
      JSON.stringify({ reason: "pre-import", data: current, at: nowISO() }),
    );
    this.cache = snapshot.store;
    this.cache.version = CURRENT_VERSION; // ensure we use current schema
    this.cache.lastSaved = nowISO();
    this.persist();
    return true;
  }

  // ------------------------------------------------------------------
  // Daily challenge helpers
  // ------------------------------------------------------------------

  getDailyChallengeDate(profileId: string): string | null {
    return this.adapter.getItem(STORAGE_KEYS.dailyChallenge(profileId));
  }

  setDailyChallengeDate(profileId: string, date: string): void {
    this.adapter.setItem(STORAGE_KEYS.dailyChallenge(profileId), date);
  }

  // ------------------------------------------------------------------
  // Global / Internals
  // ------------------------------------------------------------------

  updateGlobalState(patch: Partial<GameStoreState>): void {
    const current = this.load().data;
    this.cache = {
      ...this.load(),
      data: { ...current, ...patch },
      lastSaved: nowISO(),
    };
    this.dirty = true;
    this.persist();
  }

  /**
   * Save a mini-game session and update leaderboard (top 10).
   */
  addMiniGameSession(session: import("@/types").MiniGameSession): void {
    const state = this.getState();
    const sessions = [...state.miniGameSessions, session];
    
    // Update leaderboard
    const lb = { ...state.miniGameLeaderboards };
    const entries = [...(lb[session.gameType] || [])];
    const entry: import("@/types").LeaderboardEntry = {
      id: session.id,
      profileId: session.profileId,
      profileName: state.profiles.find(p => p.id === session.profileId)?.name || "???",
      avatar: state.profiles.find(p => p.id === session.profileId)?.avatar || "👤",
      score: session.score,
      correctCount: session.correctCount,
      averageAnswerTime: session.averageAnswerTime,
      maxStage: session.maxStage,
      difficulty: session.difficulty,
      playedAt: session.playedAt,
    };

    if (entries.length < 10) {
      entries.push(entry);
    } else {
      const lowest = entries.reduce((min, e) => e.score < min.score ? e : min);
      if (entry.score > lowest.score ||
          (entry.score === lowest.score && entry.correctCount > lowest.correctCount) ||
          (entry.score === lowest.score && entry.correctCount === lowest.correctCount && entry.averageAnswerTime < lowest.averageAnswerTime)) {
        entries.splice(entries.indexOf(lowest), 1);
        entries.push(entry);
      }
    }
    entries.sort((a, b) => b.score - a.score);
    lb[session.gameType] = entries;

    this.updateGlobalState({
      miniGameSessions: sessions,
      miniGameLeaderboards: lb,
    });
  }

  /** Get leaderboard for a game type (top 10, sorted). */
  getLeaderboard(gameType: string): import("@/types").LeaderboardEntry[] {
    return this.getState().miniGameLeaderboards[gameType] || [];
  }

  /** Save a completed battle to history. */
  saveBattleHistory(entry: import("@/types").BattleHistoryEntry): void {
    const state = this.getState();
    this.updateGlobalState({
      battleHistory: [...state.battleHistory, entry],
    });
  }

  /** Get all battle history entries. */
  getBattleHistory(): import("@/types").BattleHistoryEntry[] {
    return this.getState().battleHistory || [];
  }

  // ------------------------------------------------------------------
  // Reward milestones (Hadiah Dunia Nyata)
  // ------------------------------------------------------------------

  getRewards(profileId?: string): import("@/types").RewardMilestone[] {
    const all = this.getState().rewardMilestones || [];
    return profileId ? all.filter((r) => r.profileId === profileId) : all;
  }

  addReward(reward: import("@/types").RewardMilestone): void {
    const state = this.getState();
    this.updateGlobalState({
      rewardMilestones: [...(state.rewardMilestones || []), reward],
    });
  }

  updateReward(id: string, updates: Partial<import("@/types").RewardMilestone>): void {
    const state = this.getState();
    this.updateGlobalState({
      rewardMilestones: (state.rewardMilestones || []).map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
      ),
    });
  }

  deleteReward(id: string): void {
    const state = this.getState();
    this.updateGlobalState({
      rewardMilestones: (state.rewardMilestones || []).filter((r) => r.id !== id),
    });
  }

  checkRewardsForProfile(profileId: string, currentLevel: number): import("@/types").RewardMilestone[] {
    const state = this.getState();
    const rewards = (state.rewardMilestones || []).filter(
      (r) => r.profileId === profileId && r.isActive && !r.isUnlocked
    );
    const newlyUnlocked: import("@/types").RewardMilestone[] = [];
    for (const r of rewards) {
      if (r.targetLevel <= currentLevel) {
        this.updateReward(r.id, { isUnlocked: true, unlockedAt: Date.now() });
        newlyUnlocked.push({ ...r, isUnlocked: true, unlockedAt: Date.now() });
      }
    }
    return newlyUnlocked;
  }

  private defaultState(): GameStoreState {
    return {
      hydrated: false,
      onboardingDone: false,
      activeProfileId: null,
      profiles: [],
      miniGameSessions: [],
      miniGameLeaderboards: {},
      battleHistory: [],
      parentPasswordHash: null,
      rewardMilestones: [],
    };
  }
}

/**
 * Singleton instance used app-wide.
 */
export const storageService = new StorageService();
