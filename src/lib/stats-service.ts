/**
 * StatsService — safe statistics computation for TMT.
 *
 * All methods return safe defaults even when data is missing,
 * incomplete, or from an older schema.
 *
 * Never throws; always returns a well-formed object.
 */

import type { Profile, CategoryId, MiniGameSession, BattleHistoryEntry, RewardMilestone, WorldDefinition } from "@/types";
import { CATEGORIES, CATEGORY_MAP, DIFFICULTY_MAP } from "@/data/constants";
import { strongestCategory, weakestCategory, totalStarsEarned, missionsForDifficulty } from "@/lib/progress";
import { xpProgress } from "@/lib/leveling";
import { WORLDS_BY_DIFFICULTY } from "@/data/worlds";

// ── Types ──

export interface SafeStats {
  profileName: string;
  avatar: string;
  difficulty: string;
  difficultyLabel: string;
  level: number;
  xp: number;
  xpNeeded: number;
  xpPercent: number;
  totalPoints: number;
  totalStars: number;
  totalMissionsCompleted: number;
  totalBadges: number;
  totalCoins: number;
  totalHearts: number;
  accuracy: number;
  totalCorrect: number;
  totalAttempts: number;
  avgTimeMinutes: number;
  streak: number;
  adabStreak: number;
  strongestCategory: { id: CategoryId; emoji: string; label: string } | null;
  weakestCategory: { id: CategoryId; emoji: string; label: string } | null;
  categoryProgress: Array<{ id: CategoryId; emoji: string; label: string; color: string; correct: number; total: number }>;
  recentActivities: Array<{ title: string; stars: number; completedAt: number }>;
  miniGameStats: Array<{
    gameType: string;
    name: string;
    emoji: string;
    sessions: number;
    bestScore: number;
    bestCorrect: number;
    rank: number;
  }>;
  battleStats: {
    totalBattles: number;
    wins: number;
    bestScore: number;
    awards: string[];
  } | null;
  rewardStats: {
    total: number;
    unlocked: number;
    claimed: number;
    nextReward: string | null;
  };
  worldProgress: Array<{ id: string; name: string; icon: string; total: number; completed: number; stars: number; themeColor: string }>;
  isEmpty: boolean;
}

export interface StatsServiceInput {
  profile: Profile;
  miniGameSessions?: MiniGameSession[];
  miniGameLeaderboards?: Record<string, Array<{ profileId: string; score: number }>>;
  battleHistory?: BattleHistoryEntry[];
  rewardMilestones?: RewardMilestone[];
}

// ── Service ──

export function computeStats(input: StatsServiceInput): SafeStats {
  const {
    profile,
    miniGameSessions = [],
    miniGameLeaderboards = {},
    battleHistory = [],
    rewardMilestones = [],
  } = input;

  // ── Safe profile access ──
  const id = profile?.id ?? "";
  const name = profile?.name || "Tanpa Nama";
  const avatar = profile?.avatar || "👤";
  const diffId = profile?.difficulty || "sd-bawah";
  const diff = DIFFICULTY_MAP[diffId] || DIFFICULTY_MAP["sd-bawah"];

  const level = typeof profile?.level === "number" ? profile.level : 1;
  const xp = typeof profile?.xp === "number" ? profile.xp : 0;
  const points = typeof profile?.points === "number" ? profile.points : 0;
  const coins = typeof profile?.coins === "number" ? profile.coins : 0;
  const hearts = typeof profile?.hearts === "number" ? profile.hearts : 5;
  const streak = typeof profile?.streak === "number" ? profile.streak : 0;
  const adabStreak = typeof profile?.adabStreak === "number" ? profile.adabStreak : 0;
  const totalMissionsCompleted = typeof profile?.totalMissionsCompleted === "number" ? profile.totalMissionsCompleted : 0;
  const timePlayedMinutes = typeof profile?.timePlayedMinutes === "number" ? profile.timePlayedMinutes : 0;

  // XP progress
  let xpNeeded = 500;
  let xpPercent = 0;
  try {
    const xpResult = xpProgress(profile);
    xpNeeded = xpResult.needed ?? 500;
    xpPercent = Math.min(100, Math.max(0, xpResult.percent ?? 0));
  } catch {
    // safe default
  }

  // Stars
  let totalStars = 0;
  try {
    totalStars = totalStarsEarned(profile);
  } catch {
    totalStars = 0;
  }

  // Badges
  const badges = Array.isArray(profile?.badges) ? profile.badges : [];

  // Accuracy
  let totalCorrect = 0;
  let totalAttempts = 0;
  try {
    const catStats = profile?.categoryStats || {};
    Object.values(catStats).forEach((s: any) => {
      if (s && typeof s.correct === "number") totalCorrect += s.correct;
      if (s && typeof s.total === "number") totalAttempts += s.total;
    });
  } catch {
    // safe default
  }
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Avg time
  const avgTimeMinutes = totalMissionsCompleted > 0
    ? parseFloat((timePlayedMinutes / totalMissionsCompleted).toFixed(1))
    : 0;

  // Strongest / weakest
  let strong: { id: CategoryId; emoji: string; label: string } | null = null;
  let weak: { id: CategoryId; emoji: string; label: string } | null = null;
  try {
    const sId = strongestCategory(profile);
    const wId = weakestCategory(profile);
    if (sId && CATEGORY_MAP[sId]) {
      strong = { id: sId, emoji: CATEGORY_MAP[sId].emoji, label: CATEGORY_MAP[sId].label };
    }
    if (wId && CATEGORY_MAP[wId]) {
      weak = { id: wId, emoji: CATEGORY_MAP[wId].emoji, label: CATEGORY_MAP[wId].label };
    }
  } catch {
    // safe default
  }

  // Category progress
  const categoryProgress = CATEGORIES.map((c) => {
    const s = profile?.categoryStats?.[c.id];
    return {
      id: c.id,
      emoji: c.emoji,
      label: c.label,
      color: c.color,
      correct: (s && typeof s.correct === "number") ? s.correct : 0,
      total: (s && typeof s.total === "number") ? s.total : 0,
    };
  });

  // Recent activities
  let recentActivities: Array<{ title: string; stars: number; completedAt: number }> = [];
  try {
    const mp = profile?.missionProgress || {};
    recentActivities = Object.values(mp)
      .filter((m: any) => m && m.stars > 0)
      .sort((a: any, b: any) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 5)
      .map((m: any) => ({
        title: m.missionId || "Misi",
        stars: m.stars || 0,
        completedAt: m.completedAt || 0,
      }));
  } catch {
    recentActivities = [];
  }

  // Mini-game stats
  const mySessions = miniGameSessions.filter(s => s.profileId === id);
  const gameTypes = [
    { key: "hitung", name: "Hitung Kilat", emoji: "⚡" },
    { key: "pola", name: "Pola Kilat", emoji: "🧩" },
    { key: "ingatan", name: "Ingatan Cepat", emoji: "🧠" },
    { key: "adab", name: "Adab Cepat", emoji: "💖" },
  ];

  const miniGameStats = gameTypes.map((gt) => {
    const sessions = mySessions.filter(s => s.gameType === gt.key);
    const bestScore = sessions.reduce((max, s) => (s.score > max ? s.score : max), 0);
    const bestCorrect = sessions.reduce((max, s) => (s.correctCount > max ? s.correctCount : max), 0);
    const lb = miniGameLeaderboards[gt.key] || [];
    const rankIdx = lb.findIndex(e => e.profileId === id);
    return {
      gameType: gt.key,
      name: gt.name,
      emoji: gt.emoji,
      sessions: sessions.length,
      bestScore,
      bestCorrect,
      rank: rankIdx >= 0 ? rankIdx + 1 : 0,
    };
  });

  // Battle stats
  let battleStats: SafeStats["battleStats"] = null;
  let totalUserBattles = 0;
  try {
    const userBattles = battleHistory.filter(b =>
      b?.players?.some(p => p.profileId === id)
    );
    totalUserBattles = userBattles.length;
    if (userBattles.length > 0) {
      const wins = userBattles.filter(b => b.winner?.profileId === id).length;
      const bestScore = userBattles.reduce((max, b) => {
        const s = b.finalScores?.[id] || 0;
        return s > max ? s : max;
      }, 0);
      const awards = userBattles.flatMap(b =>
        (b.awards || []).filter(a => a.profileId === id)
      );
      battleStats = {
        totalBattles: userBattles.length,
        wins,
        bestScore,
        awards: awards.map(a => `${a.emoji} ${a.award}`),
      };
    }
  } catch {
    battleStats = null;
  }

  // Reward stats
  const myRewards = rewardMilestones.filter(r => r.profileId === id && r.isActive);
  const unlockedRewards = myRewards.filter(r => r.isUnlocked);
  const claimedRewards = myRewards.filter(r => r.isClaimed);
  const nextReward = myRewards
    .filter(r => !r.isUnlocked)
    .sort((a, b) => a.targetLevel - b.targetLevel)[0];

  const rewardStats = {
    total: myRewards.length,
    unlocked: unlockedRewards.length,
    claimed: claimedRewards.length,
    nextReward: nextReward ? `${nextReward.rewardIcon} ${nextReward.rewardTitle} (Level ${nextReward.targetLevel})` : null,
  };

  return {
    profileName: name,
    avatar,
    difficulty: diffId,
    difficultyLabel: diff.label || "SD Bawah",
    level,
    xp,
    xpNeeded,
    xpPercent,
    totalPoints: points,
    totalStars,
    totalMissionsCompleted,
    totalBadges: badges.length,
    totalCoins: coins,
    totalHearts: hearts,
    accuracy,
    totalCorrect,
    totalAttempts,
    avgTimeMinutes,
    streak,
    adabStreak,
    strongestCategory: strong,
    weakestCategory: weak,
    categoryProgress,
    recentActivities,
    miniGameStats,
    battleStats,
    rewardStats,
    worldProgress: (() => {
      try {
        const diffWorlds = WORLDS_BY_DIFFICULTY[diffId] || [];
        const missions = missionsForDifficulty(diffId);
        return diffWorlds.map(w => {
          const worldMissions = missions.filter(m =>
            (m as any).worldArea === w.id ||
            (m.number >= w.stageRange[0] && m.number <= w.stageRange[1])
          );
          const completed = worldMissions.filter((m: any) => (profile.missionProgress[m.id]?.stars ?? 0) > 0).length;
          const stars = worldMissions.reduce((sum: number, m: any) => sum + (profile.missionProgress[m.id]?.stars ?? 0), 0);
          return {
            id: w.id,
            name: w.name,
            icon: w.icon,
            total: worldMissions.length,
            completed,
            stars,
            themeColor: w.themeColor,
          };
        });
      } catch {
        return [];
      }
    })(),
    isEmpty: totalMissionsCompleted === 0 && mySessions.length === 0 && totalUserBattles === 0,
  };
}
