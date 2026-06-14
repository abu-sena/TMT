// Game type definitions

export type DifficultyId = "sd-kecil" | "sd-muda" | "smp" | "sma";

export interface DifficultyInfo {
  id: DifficultyId;
  label: string;
  shortLabel: string;
  description: string;
  multiplier: number;
  emoji: string;
}

export type CategoryId =
  | "literasi-numerasi"
  | "spasial"
  | "pola"
  | "kreativitas"
  | "systems"
  | "moral"
  | "penalaran";

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  short: string;
  emoji: string;
  color: string; // tailwind/css color token name
}

export type MissionType =
  | "multiple-choice"
  | "numerasi"
  | "pola"
  | "spasial"
  | "systems"
  | "moral"
  | "penalaran";

export interface MissionOption {
  id: string;
  label: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface Mission {
  id: string;
  number: number; // node number on map
  difficulty: DifficultyId;
  category: CategoryId;
  secondaryCategory?: CategoryId;
  type: MissionType;
  title: string;
  story: string;
  question: string;
  options: MissionOption[];
  correctOptionId: string;
  explanation: string;
  hint: string;
  basePoint: number;
  adabBonus?: number;
  adabFeedback?: string;
  isBoss?: boolean;
  isBonusChest?: boolean;
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  unlockHint: string;
}

export interface ProfileSettings {
  sound: boolean;
  music: boolean;
  language: "id";
  googleConnected: boolean;
}

export interface MissionProgress {
  missionId: string;
  stars: number; // 0..3
  bestPoints: number;
  attempts: number;
  completedAt: number;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji
  difficulty: DifficultyId;
  xp: number;
  level: number;
  points: number;
  coins: number;
  hearts: number;
  streak: number;
  badges: string[]; // badge ids
  missionProgress: Record<string, MissionProgress>;
  categoryStats: Record<CategoryId, { correct: number; total: number }>;
  totalMissionsCompleted: number;
  timePlayedMinutes: number;
  settings: ProfileSettings;
  createdAt: number;
}

export type ScreenId =
  | "splash"
  | "onboarding"
  | "profile-select"
  | "home"
  | "map"
  | "play"
  | "result"
  | "badges"
  | "stats"
  | "parent"
  | "settings";
