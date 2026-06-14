import { useCallback, useEffect, useState } from "react";
import type { DifficultyId, Profile } from "./types";
import { emptyCategoryStats } from "./logic";

const STORAGE_KEY = "adab-quest:v1";

interface Store {
  profiles: Profile[];
  activeProfileId: string | null;
  onboardingDone: boolean;
}

const defaultStore: Store = {
  profiles: [],
  activeProfileId: null,
  onboardingDone: false,
};

function load(): Store {
  if (typeof window === "undefined") return defaultStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore;
    return { ...defaultStore, ...JSON.parse(raw) };
  } catch {
    return defaultStore;
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function createProfile(name: string, avatar: string, difficulty: DifficultyId): Profile {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    avatar,
    difficulty,
    xp: 0,
    level: 1,
    points: 0,
    coins: 20,
    hearts: 5,
    streak: 0,
    badges: [],
    missionProgress: {},
    categoryStats: emptyCategoryStats(),
    totalMissionsCompleted: 0,
    timePlayedMinutes: 0,
    settings: { sound: true, music: true, language: "id", googleConnected: false },
    createdAt: Date.now(),
  };
}

export function useGameStore() {
  const [store, setStore] = useState<Store>(defaultStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(store);
  }, [store, hydrated]);

  const setOnboardingDone = useCallback(() => {
    setStore((s) => ({ ...s, onboardingDone: true }));
  }, []);

  const addProfile = useCallback((p: Profile) => {
    setStore((s) => ({ ...s, profiles: [...s.profiles, p], activeProfileId: p.id }));
  }, []);

  const selectProfile = useCallback((id: string) => {
    setStore((s) => ({ ...s, activeProfileId: id }));
  }, []);

  const updateProfile = useCallback((id: string, patch: Partial<Profile> | ((p: Profile) => Profile)) => {
    setStore((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === id ? (typeof patch === "function" ? patch(p) : { ...p, ...patch }) : p,
      ),
    }));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setStore((s) => {
      const profiles = s.profiles.filter((p) => p.id !== id);
      return {
        ...s,
        profiles,
        activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
      };
    });
  }, []);

  const resetProfileProgress = useCallback((id: string) => {
    setStore((s) => ({
      ...s,
      profiles: s.profiles.map((p) =>
        p.id === id
          ? {
              ...p,
              xp: 0,
              level: 1,
              points: 0,
              coins: 20,
              hearts: 5,
              streak: 0,
              badges: [],
              missionProgress: {},
              categoryStats: emptyCategoryStats(),
              totalMissionsCompleted: 0,
              timePlayedMinutes: 0,
            }
          : p,
      ),
    }));
  }, []);

  const activeProfile = store.profiles.find((p) => p.id === store.activeProfileId) ?? null;

  return {
    hydrated,
    store,
    activeProfile,
    setOnboardingDone,
    addProfile,
    selectProfile,
    updateProfile,
    deleteProfile,
    resetProfileProgress,
  };
}
