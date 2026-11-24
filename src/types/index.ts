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
  id: string; // will be used as mapSegmentId
  name: string;
  description: string;
  difficulty: DifficultyId;
  backgroundTheme: string;
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
  mapSegmentId: string;
  backgroundTheme: string;
  category: CategoryId;
  stageType: StageType;
  challengeType: MiniGameType | MissionType; // Used for routing renderer
  missionType: MissionType; // kept for legacy compat
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
  // Story Adventure fields (optional, added by stageToMission)
  storyTitle?: string;
  introText?: string;
  userRoleText?: string;
  challengeContext?: string;
  successText?: string;
  failureText?: string;
  worldImpactText?: string;
  companionId?: string;
  companionHint?: string;
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
  challengeType?: MiniGameType | MissionType;
  missionType: MissionType;
  mapSegmentId?: string;
  backgroundTheme?: string;
  worldArea?: string; // Legacy
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
  completedCount: number; // how many times this mission was completed (stars > 0). 0 = never, 1 = first, 2+ = replay
  firstCompletedAt: number; // timestamp of first completion (0 if never)
  bestChoiceSelected?: boolean;
  fastestTimeSeconds?: number;
  completedAt: number;
}

export type Gender = "male" | "female" | "unspecified";

export interface Profile {
  id: string;
  name: string;
  avatar: string; // Stable avatar ID or legacy emoji string
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
  dailyAdabChecklist?: DailyAdabChecklist; // @deprecated — migrated to dailyMissionAssignments
  claimedStageRewardIds: string[];
  
  // New Daily Mission System (parent-managed)
  dailyMissionAssignments?: DailyMissionAssignment[];
  dailyMissionRewardLedger?: DailyMissionRewardLedgerEntry[];
  dailyMissionStreak?: DailyMissionStreak;

  // Difficulty upgrade system
  unlockedDifficulties: DifficultyId[];
  currentDifficulty: DifficultyId;
  completedDifficulties: DifficultyId[];
  difficultyUpgradeAvailable: boolean;
  upgradedAt?: number;
  // Difficulty completion rewards (stage 500)
  claimedFinalRewardsByDifficulty: Partial<Record<DifficultyId, DifficultyCompletionReward>>;
  pendingDifficultyUpgrade: DifficultyId | null;
  pendingFinalRewardDifficulty: DifficultyId | null;
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
// Daily Adab Checklist (Legacy — migrated to Daily Mission System)
// ══════════════════════════════════════════

export type DailyAdabItemStatus =
  | "not_started"
  | "checked_by_child"
  | "pending_parent_validation"
  | "approved_by_parent"
  | "rejected_by_parent";

/** @deprecated Use DailyMissionAssignment instead */
export interface DailyAdabChecklist {
  id: string;
  profileId: string;
  date: string;
  items: DailyAdabChecklistItem[];
  completedCount: number;
  pendingValidationCount: number;
  approvedCount: number;
  rejectedCount: number;
  verifiedCount: number;
  rewardClaimed: boolean;
  streak: number;
  createdAt?: string;
  updatedAt?: string;
}

/** @deprecated Use DailyMissionAssignment instead */
export interface DailyAdabChecklistItem {
  id: string;
  title: string;
  description: string;
  requiresParentVerification: boolean;
  isChecked: boolean;
  isVerified: boolean;
  status: DailyAdabItemStatus;
  checkedAt?: string;
  verifiedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  parentNote?: string;
  rewardGranted: boolean;
  rewardGrantedAt?: string;
}

// ══════════════════════════════════════════
// New Daily Mission System (Parent-Managed)
// ══════════════════════════════════════════

export type DailyMissionCategory =
  | "adab"
  | "ibadah"
  | "belajar"
  | "membaca"
  | "tanggung-jawab"
  | "kesehatan"
  | "keluarga"
  | "custom";

export type DailyMissionDifficultyWeight = "ringan" | "normal" | "sedang" | "berat" | "spesial";

export const DAILY_MISSION_CATEGORY_META: Record<DailyMissionCategory, { label: string; emoji: string }> = {
  adab: { label: "Adab", emoji: "🌟" },
  ibadah: { label: "Ibadah", emoji: "🕌" },
  belajar: { label: "Belajar", emoji: "📚" },
  membaca: { label: "Membaca", emoji: "📖" },
  "tanggung-jawab": { label: "Tanggung Jawab", emoji: "🏠" },
  kesehatan: { label: "Kesehatan", emoji: "💪" },
  keluarga: { label: "Keluarga", emoji: "👨‍👩‍👧" },
  custom: { label: "Custom", emoji: "✨" },
};

export const DAILY_MISSION_WEIGHT_DEFAULTS: Record<DailyMissionDifficultyWeight, { label: string; defaultPoints: number }> = {
  ringan: { label: "Ringan", defaultPoints: 10 },
  normal: { label: "Normal", defaultPoints: 20 },
  sedang: { label: "Sedang", defaultPoints: 30 },
  berat: { label: "Berat", defaultPoints: 50 },
  spesial: { label: "Spesial", defaultPoints: 75 },
};

export type DailyMissionScheduleType = "daily" | "once" | "custom";

export type DailyMissionAssignmentStatus =
  | "not_started"
  | "checked_by_child"
  | "pending_parent_validation"
  | "approved_by_parent"
  | "rejected_by_parent";

export interface DailyMissionTemplate {
  id: string;
  title: string;
  description: string;
  category: DailyMissionCategory;
  difficultyWeight: DailyMissionDifficultyWeight;
  defaultPoints: number;
  requiresParentValidation: boolean;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMission {
  id: string;
  templateId?: string;
  title: string;
  description: string;
  category: DailyMissionCategory;
  difficultyWeight: DailyMissionDifficultyWeight;
  points: number;
  assignedProfileIds: string[];
  date: string; // YYYY-MM-DD
  scheduleType: DailyMissionScheduleType;
  repeatDays?: number[]; // 0=Sun..6=Sat
  requiresParentValidation: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMissionAssignment {
  id: string;
  missionId: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: DailyMissionCategory;
  points: number;
  status: DailyMissionAssignmentStatus;
  checkedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  parentNote?: string;
  childNote?: string;
  rewardGranted: boolean;
  rewardGrantedAt?: string;
  pointsAwarded: number;
}

export interface DailyMissionRewardLedgerEntry {
  id: string;
  profileId: string;
  assignmentId: string;
  date: string;
  points: number;
  reason: "mission_approved" | "daily_bonus" | "streak_reward";
  grantedAt: string;
}

export interface DailyMissionStreak {
  profileId: string;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string; // YYYY-MM-DD
  streakRewardsClaimed: number[]; // streak day milestones claimed (3, 7, 14, 30)
}

// ── Daily Mission System Constants ──

export const DAILY_MISSION_SOFT_CAP = 150;
export const DAILY_MISSION_HARD_CAP = 250;
export const DAILY_MISSION_MIN_POINTS = 5;
export const DAILY_MISSION_MAX_POINTS_PER_MISSION = 75;
export const DAILY_MISSION_ALL_DONE_BONUS = 25;

export const DAILY_MISSION_STREAK_MILESTONES: Record<number, { points: number; badge?: string }> = {
  3: { points: 30 },
  7: { points: 75, badge: "konsisten-7-hari" },
  14: { points: 150 },
  30: { points: 300, badge: "istiqamah-30-hari" },
};

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
  | "minigame-rantai-warna"
  | "minigame-jalur-angka"
  | "minigame-misi-keluarga"
  | "minigame-family-challenge"
  | "minigame-kode-warna"
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
  | "family-challenge"
  | "color-code"
  | "color-sequence-path"
  | "number-path-puzzle";

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
// Difficulty Completion Reward (Stage 500)
// ══════════════════════════════════════════

export interface DifficultyCompletionReward {
  difficulty: DifficultyId;
  stageNumber: number; // always 500
  rewardClaimed: boolean;
  rewardPending: boolean; // pending box not yet opened
  claimedAt: number; // timestamp
  expAwarded: number;
  coinsAwarded: number;
  gemsAwarded: number;
  lencanaAwarded: string[];
  nextDifficultyUnlocked: boolean;
  upgradePromptShown: boolean;
}

export const FINAL_STAGE_NUMBER = 500;

export const DIFFICULTY_COMPLETION_REWARDS: Record<DifficultyId, { exp: number; coins: number; gems: number; lencana: string[] }> = {
  tk: { exp: 1000, coins: 300, gems: 5, lencana: ["tk-complete"] },
  "sd-bawah": { exp: 1500, coins: 500, gems: 8, lencana: ["sd-bawah-complete"] },
  "sd-atas": { exp: 2000, coins: 700, gems: 10, lencana: ["sd-atas-complete"] },
  smp: { exp: 2500, coins: 1000, gems: 15, lencana: ["smp-complete"] },
  sma: { exp: 3000, coins: 1500, gems: 20, lencana: ["sma-complete"] },
  universitas: { exp: 5000, coins: 2500, gems: 30, lencana: ["universitas-complete", "the-true-mastermind"] },
};

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
  difficultyCompletionRewards: DifficultyCompletionReward[];
  dailyMissions: DailyMission[];
}
