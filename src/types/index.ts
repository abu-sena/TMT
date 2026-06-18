// Game type definitions

export type DifficultyId = "tk" | "sd-bawah" | "sd-atas" | "smp" | "sma" | "universitas";

/** Ordered difficulties for progression */
export const DIFFICULTY_ORDER: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];

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
  | "penalaran"
  | "tk-adab"
  | "tk-pra-literasi"
  | "tk-pola"
  | "tk-visual"
  | "tk-kreativitas"
  // Universitas
  | "advanced-reasoning"
  | "systems-kompleks"
  | "ethical-leadership"
  | "argument-evaluation"
  | "quantitative-logic"
  | "strategic-decision"
  | "problem-solving";

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  short: string;
  emoji: string;
  color: string; // tailwind/css color token name
}

export type MissionType =
  | "multiple_choice"
  | "moral_decision"
  | "numeracy_story"
  | "pattern_recognition"
  | "spatial_reasoning"
  | "systems_thinking"
  | "lateral_thinking"
  | "general_reasoning"
  | "boss_mission"
  | "tk_adab_basic"
  | "tk_pre_literacy"
  | "tk_counting"
  | "tk_pattern_simple"
  | "tk_visual_match"
  | "tk_creativity_simple"
  // Universitas
  | "argument_evaluation"
  | "ethical_leadership"
  | "university_case_analysis";

export type StageType = "mission" | "boss" | "review" | "reward" | "challenge";

// ══════════════════════════════════════════
// World System
// ══════════════════════════════════════════

export interface WorldDefinition {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyId;
  categoryFocus: CategoryId[];
  themeColor: string;
  icon: string;
  stageRange: [number, number];
  bossStages: number[];
  unlockRequirement?: string[];
  completionReward: string;
  worldIntroText: string;
  worldCompleteText: string;
}

export interface Stage {
  id: string;
  stageNumber: number;
  difficulty: DifficultyId;
  worldId: string;
  worldName: string;
  category: CategoryId;
  stageType: StageType;
  missionType: MissionType;
  title: string;
  story: string;
  instruction: string;
  choices: MissionOption[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  scoringRubric?: { best: number; acceptable?: number; wrong: number };
  validationRule?: string;
  explanation: string;
  adabFeedback?: string;
  hintLevels: string[];
  basePoint: number;
  xpReward: number;
  giftBoxReward?: boolean;
  unlockRequirement?: string[];
  isBossStage: boolean;
  isRewardStage: boolean;
  isReviewStage: boolean;
  estimatedTime: number;
  tags: string[];
  contentVersion: number;
  // Legacy compat
  secondaryCategory?: CategoryId;
  adabBonus?: number;
  isBossMission?: boolean;
  worldArea?: string;
  mapPosition?: { x: number; y: number };
  options?: MissionOption[];
  rewardBadgeId?: string;
}

export interface MissionOption {
  id: string;
  label: string;
  feedback?: string;
  isBestChoice?: boolean;
  emoji?: string;
}

export interface BaseMission {
  id: string;
  number: number;
  title: string;
  difficulty: DifficultyId;
  gradeRange: string;
  category: CategoryId;
  secondaryCategory?: CategoryId;
  missionType: MissionType;
  worldArea?: string;
  mapPosition?: { x: number; y: number };
  story: string;
  instruction: string;
  explanation: string;
  hintLevels: string[];
  basePoint: number;
  estimatedTime?: number;
  unlockRequirement?: string[];
  rewardBadgeId?: string;
  starsRule?: {
    threeStarsMaxAttempts?: number;
    twoStarsMaxAttempts?: number;
  };
  isBossMission?: boolean;
  adabBonus?: number;
  adabFeedback?: string;
  // TK-specific fields
  audioInstructionText?: string;
  visualPrompt?: string;
  simpleChoices?: { id: string; label: string; emoji?: string }[];
  iconBasedChoices?: boolean;
  parentReadAloudHint?: string;
}

export interface MultipleChoiceMission extends BaseMission {
  missionType: "multiple_choice";
  options: MissionOption[];
  correctAnswer: string;
}

export interface MoralDecisionMission extends BaseMission {
  missionType: "moral_decision";
  options: MissionOption[];
  correctAnswer: string;
}

export interface NumeracyStoryMission extends BaseMission {
  missionType: "numeracy_story";
  acceptableAnswers: string[];
  options?: MissionOption[];
}

export interface PatternRecognitionMission extends BaseMission {
  missionType: "pattern_recognition";
  patternType: "visual" | "sequence";
  options?: MissionOption[];
  correctAnswer: string;
}

export interface SpatialReasoningMission extends BaseMission {
  missionType: "spatial_reasoning";
  options: MissionOption[];
  correctAnswer: string;
}

export interface SystemsThinkingMission extends BaseMission {
  missionType: "systems_thinking";
  options: MissionOption[];
  correctAnswer: string;
}

export interface LateralThinkingMission extends BaseMission {
  missionType: "lateral_thinking";
  options: MissionOption[];
  correctAnswer: string;
}

export interface GeneralReasoningMission extends BaseMission {
  missionType: "general_reasoning";
  options: MissionOption[];
  correctAnswer: string;
}

export interface BossStep {
  id: string;
  stepNumber: number;
  title: string;
  category: CategoryId;
  story: string;
  instruction: string;
  options: MissionOption[];
  correctAnswer: string;
  explanation: string;
  hintLevels: string[];
}

export interface BossMission extends BaseMission {
  missionType: "boss_mission";
  bossIntro: string;
  bossIntroNarration: string;
  steps: BossStep[];
  finalEvaluation: string;
  bossRewardMultiplier: number;
  specialBadgeChance?: string;
  bossThemeColor: string;
  bossEmoji: string;
}

// ─── TK Mission Interfaces ───

export interface TKAdabBasicMission extends BaseMission {
  missionType: "tk_adab_basic";
  options: MissionOption[];
  correctAnswer: string;
}

export interface TKPreLiteracyMission extends BaseMission {
  missionType: "tk_pre_literacy";
  options: MissionOption[];
  correctAnswer: string;
}

export interface TKCountingMission extends BaseMission {
  missionType: "tk_counting";
  options: MissionOption[];
  correctAnswer: string;
}

export interface TKPatternSimpleMission extends BaseMission {
  missionType: "tk_pattern_simple";
  options: MissionOption[];
  correctAnswer: string;
}

export interface TKVisualMatchMission extends BaseMission {
  missionType: "tk_visual_match";
  options: MissionOption[];
  correctAnswer: string;
}

export interface TKCreativitySimpleMission extends BaseMission {
  missionType: "tk_creativity_simple";
  options: MissionOption[];
  correctAnswer: string;
}

// ─── Universitas Mission Interfaces ───

export interface ArgumentEvaluationMission extends BaseMission {
  missionType: "argument_evaluation";
  options: MissionOption[];
  correctAnswer: string;
}

export interface EthicalLeadershipMission extends BaseMission {
  missionType: "ethical_leadership";
  options: MissionOption[];
  correctAnswer: string;
}

export interface UniversityCaseAnalysisMission extends BaseMission {
  missionType: "university_case_analysis";
  options: MissionOption[];
  correctAnswer: string;
}

export type Mission =
  | MultipleChoiceMission
  | MoralDecisionMission
  | NumeracyStoryMission
  | PatternRecognitionMission
  | SpatialReasoningMission
  | SystemsThinkingMission
  | LateralThinkingMission
  | GeneralReasoningMission
  | BossMission
  | TKAdabBasicMission
  | TKPreLiteracyMission
  | TKCountingMission
  | TKPatternSimpleMission
  | TKVisualMatchMission
  | TKCreativitySimpleMission
  | ArgumentEvaluationMission
  | EthicalLeadershipMission
  | UniversityCaseAnalysisMission;

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
  screenTimeReminder: boolean;
  screenTimeMinutes: number; // 0 = disabled, else e.g. 30, 45, 60
}

export interface MissionProgress {
  missionId: string;
  stars: number; // 0..3
  bestPoints: number;
  attempts: number;
  bestChoiceSelected?: boolean;
  fastestTimeSeconds?: number;
  completedAt: number;
}

export type Gender = "male" | "female" | "unspecified";

export interface Profile {
  id: string;
  name: string;
  avatar: string; // emoji
  gender: Gender;
  difficulty: DifficultyId;
  xp: number;
  level: number;
  points: number;
  coins: number;
  hearts: number;
  streak: number;
  adabStreak: number;
  lastPlayDate?: string;
  lastAdabDate?: string;
  badges: string[]; // badge ids
  missionProgress: Record<string, MissionProgress>;
  categoryStats: Record<CategoryId, { correct: number; total: number }>;
  totalMissionsCompleted: number;
  timePlayedMinutes: number;
  settings: ProfileSettings;
  createdAt: number;
  
  // New features:
  dailyMissionState?: DailyMissionState;
  dailyAdabChecklist?: DailyAdabChecklist;

  // Difficulty upgrade system
  unlockedDifficulties: DifficultyId[];
  currentDifficulty: DifficultyId;
  completedDifficulties: DifficultyId[];
  difficultyUpgradeAvailable: boolean;
  upgradedAt?: number;
}

export interface DailyMissionState {
  dailyMissionDate: string; // YYYY-MM-DD
  selectedDailyMissions: string[]; // mission IDs
  completedDailyMissions: string[]; // mission IDs
  dailyRewardClaimed: boolean;
  dailyStreak: number;
  lastCompletedDate?: string;
}

export interface MiniGameSession {
  id: string;
  profileId: string;
  gameType: string;
  gameId?: string;
  packageId?: MiniGamePackageId;
  score: number;
  correctCount: number;
  wrongCount?: number;
  totalQuestions?: number;
  averageAnswerTime: number;
  fastestAnswerTime: number;
  slowestAnswerTime: number;
  maxStage: number;
  difficulty: DifficultyId;
  playedAt: number;
  startedAt?: number;
  finishedAt?: number;
  resultStatus?: "win" | "lose" | "completed" | "quit";
}

export interface LeaderboardEntry {
  id: string;
  profileId: string;
  profileName: string;
  avatar: string;
  score: number;
  correctCount: number;
  averageAnswerTime: number;
  maxStage: number;
  difficulty: DifficultyId;
  playedAt: number;
}

// ══════════════════════════════════════════
// Daily Adab Checklist (Real-World)
// ══════════════════════════════════════════

export interface DailyAdabChecklist {
  id: string;
  profileId: string;
  date: string;
  items: DailyAdabChecklistItem[];
  completedCount: number;
  verifiedCount: number;
  rewardClaimed: boolean;
  streak: number;
}

export interface DailyAdabChecklistItem {
  id: string;
  title: string;
  description: string;
  requiresParentVerification: boolean;
  isChecked: boolean;
  isVerified: boolean;
  checkedAt?: string;
  verifiedAt?: string;
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
  | "privacy"
  | "settings"
  | "daily-missions"
  | "minigame-center"
  | "minigame-package"
  | "minigame-hitung"
  | "minigame-pola"
  | "minigame-ingatan"
  | "minigame-adab"
  | "minigame-cari-beda"
  | "minigame-pilih-sikap"
  | "minigame-nasihat"
  | "minigame-urutkan-adab"
  | "minigame-dilema"
  | "minigame-detektif"
  | "minigame-tebak-aturan"
  | "minigame-kesimpulan"
  | "minigame-benar-salah"
  | "minigame-ubah-posisi"
  | "minigame-cocok-bayangan"
  | "minigame-jalur-tercepat"
  | "minigame-misi-keluarga"
  | "minigame-family-challenge"
  | "battle"
  | "my-rewards"
  | "reward-setup"
  | "battle-setup"
  | "battle-shuffle"
  | "battle-turn"
  | "battle-gameplay"
  | "battle-scoreboard"
  | "battle-result";

// ══════════════════════════════════════════
// Mini-Game Architecture Types
// ══════════════════════════════════════════

export type MiniGamePackageId = "fokus-cepat" | "adab" | "logika" | "spasial" | "keluarga";

export interface MiniGamePackage {
  id: MiniGamePackageId;
  title: string;
  description: string;
  icon: string;
  themeColor: string;
  order: number;
}

export interface MiniGameDefinition {
  id: string;
  packageId: MiniGamePackageId;
  title: string;
  description: string;
  icon: string;
  supportedDifficulties: DifficultyId[];
  gameType: MiniGameType;
  hasTimer: boolean;
  hasLeaderboard: boolean;
  hasStages: boolean;
  isFamilyMode: boolean;
  isActive: boolean;
  screenId?: ScreenId;
}

export type MiniGameType =
  | "speed-math"
  | "pattern-speed"
  | "memory-speed"
  | "spot-difference"
  | "moral-choice"
  | "gentle-advice"
  | "adab-sort"
  | "wisdom-dilemma"
  | "detective-clues"
  | "guess-rule"
  | "pick-conclusion"
  | "true-or-false"
  | "change-position"
  | "match-shadow"
  | "fastest-path"
  | "family-mission"
  | "family-challenge";

export interface MiniGameAttempt {
  id: string;
  sessionId: string;
  questionId: number;
  prompt: string;
  shuffledChoices: { id: string; label: string }[];
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTime: number;
  scoreEarned: number;
  feedback: string;
}

export interface FamilyMission {
  id: string;
  profileId: string;
  title: string;
  description: string;
  category: string;
  assignedByParent: boolean;
  status: "pending" | "done" | "verified";
  completedAt?: number;
  verifiedByParent: boolean;
  createdAt: number;
}

// ══════════════════════════════════════════
// Shuffle & Random Utilities
// ══════════════════════════════════════════

/** Fisher-Yates shuffle — returns new array */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Create shuffled choices from an array of option objects, preserving correct answer */
export function createShuffledChoices<T extends { id: string }>(choices: T[], correctId: string): { choices: T[]; correctAnswer: string } {
  const shuffled = shuffleArray(choices);
  return { choices: shuffled, correctAnswer: correctId };
}

/** Validate choice integrity: no duplicates, correct answer present */
export function validateChoiceIntegrity(choices: { id: string }[], correctAnswer: string): boolean {
  const ids = choices.map(c => c.id);
  const uniqueIds = new Set(ids);
  return uniqueIds.size === ids.length && uniqueIds.has(correctAnswer);
}

// ══════════════════════════════════════════
// Mastermind Duel — Battle Types
// ══════════════════════════════════════════

export type BattleMode = "hitung" | "pola" | "adab" | "campuran" | "ingatan" | "boss-duel" | "family-challenge";
export type BattleDifficultyMode = "seimbang" | "setara";
export type BattleStatus = "setup" | "shuffle" | "playing" | "finished";

export interface BattlePlayer {
  profileId: string;
  profileName: string;
  avatar: string;
  difficulty: DifficultyId;
  level: number;
}

export interface BattleTurn {
  id: string;
  roundNumber: number;
  profileId: string;
  gameType: "hitung" | "pola" | "adab" | "ingatan";
  questionData: any;
  shuffledChoices: any[];
  selectedAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  responseTimeMs: number;
  baseScore: number;
  speedBonus: number;
  difficultyBonus: number;
  finalScore: number;
  feedback: string;
  createdAt: number;
}

export interface BattleRound {
  roundNumber: number;
  gameType: "hitung" | "pola" | "adab" | "ingatan";
  order: string[]; // profileIds in order
  turns: BattleTurn[];
  completed: boolean;
}

export interface BattleSession {
  id: string;
  battleMode: BattleMode;
  players: BattlePlayer[];
  roundCount: number;
  difficultyMode: BattleDifficultyMode;
  setDifficulty?: DifficultyId;
  initialOrder: string[];
  roundOrders: string[][];
  rounds: BattleRound[];
  currentRound: number;
  currentTurnIndex: number;
  scores: Record<string, number>; // profileId → total score
  awards: BattleAward[];
  winnerProfileId: string;
  status: BattleStatus;
  startedAt: number;
  finishedAt: number;
}

export interface BattleAward {
  profileId: string;
  profileName: string;
  award: string;
  emoji: string;
  description: string;
}

export interface BattleHistoryEntry {
  sessionId: string;
  battleMode: BattleMode;
  players: BattlePlayer[];
  winner: { profileId: string; profileName: string; avatar: string };
  finalScores: Record<string, number>;
  awards: BattleAward[];
  playedAt: number;
}

// ══════════════════════════════════════════
// Hadiah Dunia Nyata (Offline Reward)
// ══════════════════════════════════════════

export type RewardStatus = "menunggu" | "siap_diberikan" | "sudah_diberikan" | "nonaktif";

export interface RewardMilestone {
  id: string;
  profileId: string;
  targetLevel: number;
  rewardTitle: string;
  rewardDescription?: string;
  rewardIcon: string; // emoji
  rewardColor?: string;
  isActive: boolean;
  isUnlocked: boolean;
  unlockedAt?: number;
  isClaimed: boolean;
  claimedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export const REWARD_ICONS = [
  { emoji: "🍦", label: "Es Krim" },
  { emoji: "🍕", label: "Pizza" },
  { emoji: "📚", label: "Buku" },
  { emoji: "🧸", label: "Mainan" },
  { emoji: "🚗", label: "Jalan-jalan" },
  { emoji: "🎁", label: "Kado" },
  { emoji: "🏆", label: "Piala" },
  { emoji: "⭐", label: "Bintang" },
  { emoji: "🍔", label: "Makanan" },
  { emoji: "💝", label: "Hadiah Spesial" },
] as const;

/** Top-level game store shape persisted to localStorage. */
export interface GameStoreState {
  hydrated: boolean;
  onboardingDone: boolean;
  activeProfileId: string | null;
  profiles: Profile[];
  parentPasswordHash?: string | null;
  statisticsCache?: any;
  miniGameSessions: MiniGameSession[];
  miniGameLeaderboards: Record<string, LeaderboardEntry[]>;
  battleHistory: BattleHistoryEntry[];
  rewardMilestones: RewardMilestone[];
}
