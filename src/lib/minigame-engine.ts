/**
 * MiniGameEngine — reusable game engine for all mini-games
 *
 * Provides:
 *   - Common session lifecycle (start → play → end → save)
 *   - Scoring calculations
 *   - Leaderboard management
 *   - Result generation
 */

import type {
  MiniGameSession, MiniGameAttempt,
  LeaderboardEntry, DifficultyId, Profile, MiniGamePackageId,
} from "@/types";
import { getMiniGameById } from "@/data/minigame-definitions";

// ═══════════════════════════════════════════
// Engine State
// ═══════════════════════════════════════════

export interface EngineState {
  session: MiniGameSession | null;
  attempts: MiniGameAttempt[];
  startedAt: number;
  questionIndex: number;
  isActive: boolean;
}

export interface MiniGameResult {
  session: MiniGameSession;
  attempts: MiniGameAttempt[];
  isNewBest: boolean;
  leaderboardRank: number | null;
}

// ═══════════════════════════════════════════
// Scoring Configuration
// ═══════════════════════════════════════════

export interface ScoringConfig {
  baseScore: number;
  speedBonusMax: number;
  difficultyBonus: number;
  streakBonusPer: number;
  wisdomBonus: number;
  familyBonus: number;
  timeLimitNormalizer: number;
  useTieredScoring: boolean; // for adab games
}

const DEFAULT_SCORING: ScoringConfig = {
  baseScore: 100,
  speedBonusMax: 50,
  difficultyBonus: 10,
  streakBonusPer: 5,
  wisdomBonus: 30,
  familyBonus: 20,
  timeLimitNormalizer: 10,
  useTieredScoring: false,
};

const ADAB_SCORING: ScoringConfig = {
  baseScore: 100,
  speedBonusMax: 20,
  difficultyBonus: 5,
  streakBonusPer: 5,
  wisdomBonus: 50,
  familyBonus: 20,
  timeLimitNormalizer: 15,
  useTieredScoring: true,
};

// ═══════════════════════════════════════════
// Engine Class
// ═══════════════════════════════════════════

export class MiniGameEngine {
  private state: EngineState;
  private profile: Profile;
  private gameId: string;
  private scoring: ScoringConfig;

  constructor(profile: Profile, gameId: string) {
    this.profile = profile;
    this.gameId = gameId;
    this.scoring = gameId === "pilih-sikap" || gameId === "adab"
      ? ADAB_SCORING : DEFAULT_SCORING;
    this.state = {
      session: null,
      attempts: [],
      startedAt: 0,
      questionIndex: 0,
      isActive: false,
    };
  }

  // ── Lifecycle ──

  startGame(difficulty: DifficultyId): void {
    const def = getMiniGameById(this.gameId);
    this.state = {
      session: {
        id: crypto.randomUUID(),
        profileId: this.profile.id,
        gameType: this.gameId,
        gameId: this.gameId,
        packageId: def?.packageId || "fokus-cepat",
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        totalQuestions: 0,
        averageAnswerTime: 0,
        fastestAnswerTime: Infinity,
        slowestAnswerTime: 0,
        maxStage: 1,
        difficulty,
        playedAt: Date.now(),
        startedAt: Date.now(),
        finishedAt: 0,
        resultStatus: "quit",
      },
      attempts: [],
      startedAt: Date.now(),
      questionIndex: 0,
      isActive: true,
    };
  }

  // ── Attempt Recording ──

  recordAttempt(
    prompt: string,
    shuffledChoices: { id: string; label: string }[],
    selectedAnswer: string,
    correctAnswer: string,
    responseTime: number,
    isBestChoice?: boolean,
  ): MiniGameAttempt {
    if (!this.state.session) throw new Error("Game not started");

    const isCorrect = selectedAnswer === correctAnswer;
    const tier = this.determineTier(selectedAnswer, correctAnswer, isBestChoice);
    const scoreEarned = this.calculateQuestionScore(isCorrect, responseTime, tier);

    const attempt: MiniGameAttempt = {
      id: crypto.randomUUID(),
      sessionId: this.state.session.id,
      questionId: this.state.questionIndex,
      prompt,
      shuffledChoices,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      responseTime,
      scoreEarned,
      feedback: isCorrect ? "✅ Tepat!" : "❌ Kurang tepat.",
    };

    this.state.attempts.push(attempt);
    this.state.questionIndex++;

    // Update session stats
    const s = this.state.session;
    s.score += scoreEarned;
    s.totalQuestions = this.state.attempts.length;
    if (isCorrect) s.correctCount++;
    else s.wrongCount = (s.wrongCount || 0) + 1;
    s.averageAnswerTime =
      this.state.attempts.reduce((sum, a) => sum + a.responseTime, 0) / s.totalQuestions;
    s.fastestAnswerTime = Math.min(s.fastestAnswerTime, responseTime);
    s.slowestAnswerTime = Math.max(s.slowestAnswerTime, responseTime);

    return attempt;
  }

  // ── End Game ──

  endGame(resultStatus: MiniGameSession["resultStatus"] = "completed"): MiniGameResult {
    if (!this.state.session) throw new Error("Game not started");
    this.state.isActive = false;
    this.state.session.finishedAt = Date.now();
    this.state.session.resultStatus = resultStatus;

    // Remove Infinity from fastestTime if no attempts
    if (this.state.session.fastestAnswerTime === Infinity || this.state.attempts.length === 0) {
      this.state.session.fastestAnswerTime = 0;
    }

    // Check if new personal best
    const isNewBest = this.checkIsNewBest();

    return {
      session: this.state.session,
      attempts: this.state.attempts,
      isNewBest,
      leaderboardRank: null, // Updated externally
    };
  }

  // ── Scoring ──

  private determineTier(selectedAnswer: string, correctAnswer: string, isBestChoice?: boolean): "best" | "acceptable" | "weak" | "wrong" {
    if (selectedAnswer === correctAnswer) {
      return isBestChoice === true ? "best" : "acceptable";
    }
    if (isBestChoice === false) return "weak";
    return "wrong";
  }

  private calculateQuestionScore(isCorrect: boolean, responseTimeMs: number, tier: string): number {
    if (!isCorrect && tier === "wrong") return 0;

    const c = this.scoring;
    let score = 0;

    if (c.useTieredScoring) {
      // Tiered scoring for adab games
      if (tier === "best") score = c.baseScore + c.wisdomBonus;
      else if (tier === "acceptable") score = Math.round(c.baseScore * 0.75);
      else if (tier === "weak") score = Math.round(c.baseScore * 0.3);
    } else {
      // Standard scoring
      score = c.baseScore + c.difficultyBonus;

      // Speed bonus: faster = more points
      const speedRatio = 1 - Math.min(responseTimeMs / (c.timeLimitNormalizer * 1000), 1);
      score += Math.round(c.speedBonusMax * speedRatio);
    }

    return Math.max(0, score);
  }

  // ── Personal Best ──

  private checkIsNewBest(): boolean {
    // This checks against stored sessions — to be implemented with store access
    return false; // Placeholder — actual check done in screen via store
  }

  // ── Getters ──

  getSession(): MiniGameSession | null {
    return this.state.session;
  }

  getAttempts(): MiniGameAttempt[] {
    return this.state.attempts;
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  getScore(): number {
    return this.state.session?.score || 0;
  }

  getCorrectCount(): number {
    return this.state.session?.correctCount || 0;
  }
}

// ═══════════════════════════════════════════
// Utility: Create a mini-game session from raw data (for existing screens)
// ═══════════════════════════════════════════

export function createMiniGameSession(
  profile: Profile,
  gameId: string,
  packageId: MiniGamePackageId,
  score: number,
  correctCount: number,
  averageAnswerTime: number,
  fastestAnswerTime: number,
  slowestAnswerTime: number,
  maxStage: number,
  difficulty: DifficultyId,
  totalQuestions: number = correctCount,
  wrongCount: number = 0,
): MiniGameSession {
  return {
    id: crypto.randomUUID(),
    profileId: profile.id,
    gameType: gameId,
    gameId,
    packageId,
    score,
    correctCount,
    wrongCount,
    totalQuestions,
    averageAnswerTime,
    fastestAnswerTime,
    slowestAnswerTime,
    maxStage,
    difficulty,
    playedAt: Date.now(),
    startedAt: Date.now(),
    finishedAt: Date.now(),
    resultStatus: "completed",
  };
}
