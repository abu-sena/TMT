import { Component, type ReactNode } from "react";
import type { Profile } from "@/types";
import { CATEGORIES } from "@/data/constants";
import { computeStats } from "@/lib/stats-service";
import { getTodaySummary, getStreak } from "@/lib/dailyMissions";
import { DAILY_MISSION_CATEGORY_META } from "@/types";
import { CategoryProgress } from "../game/CategoryProgress";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import type { SafeStats } from "@/lib/stats-service";

// ════════════════════════════════════════════════════════
// Error Boundary for Stats Screen
// ════════════════════════════════════════════════════════

interface ErrorBoundaryProps {
  children: ReactNode;
  onBack: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class StatsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || "Terjadi kesalahan tidak dikenal" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[StatsScreen] Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4 overscroll-contain">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="font-display font-black text-2xl text-[#5A3515] mb-2">Status Window Tidak Tersedia</h1>
            <p className="text-sm font-bold text-[#8C6B45] mb-4">
              Maaf, halaman statistik sedang mengalami kendala. Data permainanmu tetap aman.
            </p>
            <button
              onClick={this.props.onBack}
              className="px-6 py-3 rounded-2xl bg-gradient-meadow text-white font-black text-lg border-b-4 border-[#2E8B12] active:translate-y-1 active:border-b-0 transition-all"
            >
              🏠 Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ════════════════════════════════════════════════════════
// Main Stats Screen
// ════════════════════════════════════════════════════════

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function StatsScreen({ profile, onBack }: Props) {
  const { store } = useGameStore();

  // Compute all stats safely with defaults
  const stats: SafeStats = computeStats({
    profile,
    miniGameSessions: store.miniGameSessions || [],
    miniGameLeaderboards: store.miniGameLeaderboards || {},
    battleHistory: store.battleHistory || [],
    rewardMilestones: store.rewardMilestones || [],
  });

  const hasMiniGames = stats.miniGameStats.some((mg) => mg.sessions > 0);
  const hasBattles = stats.battleStats !== null && stats.battleStats.totalBattles > 0;
  const hasRewards = stats.rewardStats.total > 0;

  return (
    <StatsErrorBoundary onBack={onBack}>
      <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
            aria-label="Kembali"
          >
            ←
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="text-3xl bg-white rounded-full h-12 w-12 flex items-center justify-center border-2 border-[#CBB794] shrink-0">
              {stats.avatar}
            </div>
            <div>
              <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">Status Window</h1>
              <p className="text-xs sm:text-sm text-[#5A3515]/80 truncate">
                {stats.profileName} · {stats.difficultyLabel}
              </p>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl shrink-0">📊</div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain content-wrapper space-y-3 pb-8">
          {/* Empty state */}
          {stats.isEmpty ? (
            <GameCard tone="cream" className="text-center py-8">
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">
                Belum ada statistik
              </h2>
              <p className="text-sm font-bold text-[#8C6B45]">
                Yuk selesaikan misi pertama!
              </p>
            </GameCard>
          ) : (
            <>
              {/* Stat tiles */}
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Misi Selesai" value={stats.totalMissionsCompleted} emoji="🎯" />
                <StatTile label="Total XP" value={stats.xp} emoji="✨" />
                <StatTile label="Total Poin" value={stats.totalPoints} emoji="⭐" />
                <StatTile label="Total Bintang" value={stats.totalStars} emoji="🌟" />
                <StatTile label="Lencana" value={stats.totalBadges} emoji="🏅" />
                <StatTile label="Level" value={stats.level} emoji="⚡" />
              </div>

              {/* XP Progress */}
              <GameCard tone="cream">
                <div className="text-xs font-bold uppercase text-muted-foreground">
                  Progres Level Saat Ini
                </div>
                <div className="mt-1 font-display font-black text-xl sm:text-2xl text-[#5A3515]">
                  {stats.xp.toLocaleString("id")} / {stats.xpNeeded.toLocaleString("id")} XP
                </div>
                <div className="mt-2 h-3 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-xp transition-all duration-500"
                    style={{ width: `${stats.xpPercent}%` }}
                  />
                </div>
              </GameCard>

              {/* Performance */}
              <GameCard tone="cream">
                <h3 className="font-display font-black text-lg text-[#5A3515] mb-2">Performa</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground">Akurasi</div>
                    <div className="font-display font-black text-xl text-[#2E8B12]">{stats.accuracy}%</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase text-muted-foreground">Rata-rata Waktu</div>
                    <div className="font-display font-black text-xl text-[#185E9F]">
                      {stats.avgTimeMinutes} mnt/misi
                    </div>
                  </div>
                </div>
              </GameCard>

              {/* Strongest / Weakest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <GameCard tone="leaf">
                  <div className="text-xs uppercase font-bold opacity-90">Kategori Terkuat</div>
                  <div className="font-display font-black text-lg sm:text-xl">
                    {stats.strongestCategory
                      ? `${stats.strongestCategory.emoji} ${stats.strongestCategory.label}`
                      : "Belum ada data"}
                  </div>
                </GameCard>
                <GameCard tone="wood">
                  <div className="text-xs uppercase font-bold opacity-90">Rekomendasi Latihan</div>
                  <div className="font-display font-black text-lg sm:text-xl">
                    {stats.weakestCategory
                      ? `${stats.weakestCategory.emoji} ${stats.weakestCategory.label}`
                      : "Selesaikan beberapa misi dulu"}
                  </div>
                </GameCard>
              </div>

              {/* Mini-Game Stats */}
              {hasMiniGames && (
                <GameCard tone="blue">
                  <h3 className="font-display font-black text-lg text-white mb-2">
                    🎮 Mini-Game Cepat
                  </h3>
                  <div className="space-y-3">
                    {stats.miniGameStats
                      .filter((mg) => mg.sessions > 0)
                      .map((mg) => (
                        <div key={mg.gameType} className="bg-white/15 rounded-[18px] p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">{mg.emoji}</span>
                            <span className="font-bold text-sm text-white">{mg.name}</span>
                            <span className="text-[10px] text-white/60 ml-auto">
                              {mg.sessions}x main
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="font-black text-lg text-yellow-300">{mg.bestScore}</div>
                              <div className="text-[8px] uppercase text-white/50">Skor Terbaik</div>
                            </div>
                            <div className="text-center">
                              <div className="font-black text-lg text-white">{mg.bestCorrect}</div>
                              <div className="text-[8px] uppercase text-white/50">Benar</div>
                            </div>
                            <div className="text-center">
                              <div className="font-black text-lg text-white">
                                {mg.rank > 0 ? `#${mg.rank}` : "—"}
                              </div>
                              <div className="text-[8px] uppercase text-white/50">Peringkat</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </GameCard>
              )}

              {/* Battle Stats */}
              {hasBattles && stats.battleStats && (
                <GameCard tone="wood">
                  <h3 className="font-display font-black text-lg text-white mb-2">
                    ⚔️ Battle
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-white">
                    <div className="bg-white/10 rounded-[18px] p-3 text-center">
                      <div className="font-black text-2xl">{stats.battleStats.totalBattles}</div>
                      <div className="text-[10px] uppercase opacity-70">Battle</div>
                    </div>
                    <div className="bg-white/10 rounded-[18px] p-3 text-center">
                      <div className="font-black text-2xl">{stats.battleStats.wins}</div>
                      <div className="text-[10px] uppercase opacity-70">Menang</div>
                    </div>
                    <div className="bg-white/10 rounded-[18px] p-3 text-center">
                      <div className="font-black text-2xl">{stats.battleStats.bestScore}</div>
                      <div className="text-[10px] uppercase opacity-70">Skor Terbaik</div>
                    </div>
                    <div className="bg-white/10 rounded-[18px] p-3 text-center">
                      <div className="font-black text-2xl">{stats.battleStats.awards.length}</div>
                      <div className="text-[10px] uppercase opacity-70">Penghargaan</div>
                    </div>
                  </div>
                  {stats.battleStats.awards.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stats.battleStats.awards.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </GameCard>
              )}

              {/* Reward stats */}
              {hasRewards && (
                <GameCard tone="coin">
                  <h3 className="font-display font-black text-lg text-[#5A3515] mb-2">
                    🎁 Hadiah Dunia Nyata
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-white/50 rounded-xl">
                      <div className="font-black text-lg text-[#2E8B12]">{stats.rewardStats.unlocked}</div>
                      <div className="text-[10px] uppercase text-[#8C6B45]">Terbuka</div>
                    </div>
                    <div className="text-center p-2 bg-white/50 rounded-xl">
                      <div className="font-black text-lg text-[#D48806]">{stats.rewardStats.claimed}</div>
                      <div className="text-[10px] uppercase text-[#8C6B45]">Diklaim</div>
                    </div>
                  </div>
                  {stats.rewardStats.nextReward && (
                    <div className="mt-2 text-xs font-bold text-[#8C6B45] text-center">
                      Berikutnya: {stats.rewardStats.nextReward}
                    </div>
                  )}
                </GameCard>
              )}

              {/* Daily Mission Status */}
              <DailyMissionSection profile={profile} />

              {/* Difficulty Completion Status */}
              <DifficultyCompletionSection profile={profile} />

              {/* Category Progress */}
              <div>
                <div className="px-1 py-2 text-xs font-bold uppercase text-[#5A3515]/80">
                  Progres Kategori
                </div>
                <div className="space-y-2">
                  {stats.categoryProgress.map((c) => (
                    <CategoryProgress
                      key={c.id}
                      category={c.id}
                      correct={c.correct}
                      total={c.total}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        {/* Bottom */}
        <div className="shrink-0 content-wrapper pb-safe pt-2 bg-white/40 backdrop-blur-sm border-t border-white/50">
          <GameButton variant="ghost" size="md" full onClick={onBack}>
            🏠 Beranda
          </GameButton>
        </div>
      </div>
    </StatsErrorBoundary>
  );
}

// ── Difficulty Completion Section ──

function DifficultyCompletionSection({ profile }: { profile: Profile }) {
  const DIFFICULTIES: Array<{ id: import("@/types").DifficultyId; label: string; emoji: string }> = [
    { id: "tk", label: "TK", emoji: "🌸" },
    { id: "sd-bawah", label: "SD Bawah", emoji: "🌱" },
    { id: "sd-atas", label: "SD Atas", emoji: "🌿" },
    { id: "smp", label: "SMP", emoji: "🌳" },
    { id: "sma", label: "SMA", emoji: "🏔️" },
    { id: "universitas", label: "Universitas", emoji: "🎓" },
  ];

  const claimedRewards = profile.claimedFinalRewardsByDifficulty || {};
  const hasAnyCompletion = DIFFICULTIES.some(d => claimedRewards[d.id]?.rewardClaimed);

  if (!hasAnyCompletion && profile.completedDifficulties.length === 0) return null;

  return (
    <div className="rounded-[18px] bg-gradient-cream border-2 border-[#8C6B45]/40 p-4 shadow-pop-sm">
      <h3 className="font-display font-black text-lg text-[#5A3515] mb-2">
        🏆 Progres Level Kesulitan
      </h3>
      <div className="space-y-1.5">
        {DIFFICULTIES.map((d) => {
          const reward = claimedRewards[d.id];
          const isCompleted = reward?.rewardClaimed || profile.completedDifficulties.includes(d.id);
          const isUnlocked = profile.unlockedDifficulties.includes(d.id);
          const isCurrent = profile.currentDifficulty === d.id || profile.difficulty === d.id;
          const isPending = reward?.rewardPending;

          return (
            <div
              key={d.id}
              className={`flex items-center gap-2 rounded-xl p-2 text-xs ${
                isCompleted
                  ? "bg-[#2E8B12]/10 border border-[#2E8B12]/20"
                  : isCurrent
                    ? "bg-[#185E9F]/10 border border-[#185E9F]/20"
                    : isUnlocked
                      ? "bg-white/50 border border-[#CBB794]/20"
                      : "bg-stone-100/50 border border-stone-200"
              }`}
            >
              <span className="text-lg">{d.emoji}</span>
              <span className="flex-1 font-bold text-[#5A3515]">{d.label}</span>
              {isCompleted ? (
                <span className="text-[#2E8B12] font-black text-xs">✅ Selesai</span>
              ) : isPending ? (
                <span className="text-[#D48806] font-black text-xs animate-pulse">🎁 Hadiah</span>
              ) : isCurrent ? (
                <span className="text-[#185E9F] font-black text-xs">📍 Aktif</span>
              ) : isUnlocked ? (
                <span className="text-[#8C6B45] font-bold text-xs">🔓 Terbuka</span>
              ) : (
                <span className="text-stone-400 font-bold text-xs">🔒</span>
              )}
            </div>
          );
        })}
      </div>
      {profile.pendingDifficultyUpgrade && (
        <div className="mt-2 text-center text-[10px] font-bold text-[#2E8B12] bg-[#2E8B12]/10 rounded-xl py-1.5">
          🚀 Level baru sudah terbuka! Buka dari Peta atau Beranda.
        </div>
      )}
    </div>
  );
}

// ── Stat Tile component ──

// ── Daily Mission Section ──

function DailyMissionSection({ profile }: { profile: Profile }) {
  const summary = getTodaySummary(profile);
  const streak = getStreak(profile);

  if (summary.total === 0 && streak.currentStreak === 0) return null;

  return (
    <div className="rounded-[18px] bg-gradient-to-br from-[#FFF8E1] to-[#FFE0B2] border-2 border-[#FF9800]/40 p-4 shadow-pop-sm">
      <h3 className="font-display font-black text-lg text-[#E65100] mb-2">
        ☀️ Misi Harian
      </h3>
      
      {/* Today's progress */}
      {summary.total > 0 && (
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#8C6B45]">Progres Hari Ini</span>
            <span className="text-[#5A3515]">{summary.approved}/{summary.total} Disetujui</span>
          </div>
          <div className="h-2 rounded-full bg-white/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF9800] to-[#FFD54F] transition-all"
              style={{ width: `${summary.total > 0 ? (summary.approved / summary.total) * 100 : 0}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
            <div className="bg-white/50 rounded-lg py-1">
              <div className="font-black text-[#4CAF50]">{summary.approved}</div>
              <div className="text-[#8C6B45]">Disetujui</div>
            </div>
            <div className="bg-white/50 rounded-lg py-1">
              <div className="font-black text-[#FF9800]">{summary.pending}</div>
              <div className="text-[#8C6B45]">Pending</div>
            </div>
            <div className="bg-white/50 rounded-lg py-1">
              <div className="font-black text-[#E53935]">{summary.rejected}</div>
              <div className="text-[#8C6B45]">Diulang</div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-bold mt-1">
            <span className="text-[#8C6B45]">Poin hari ini</span>
            <span className="text-[#D48806]">+{summary.totalPointsEarned}</span>
          </div>
        </div>
      )}

      {/* Streak */}
      {streak.currentStreak > 0 && (
        <div className="flex items-center gap-2 bg-white/50 rounded-xl p-2">
          <span className="text-xl">🔥</span>
          <div>
            <div className="text-xs font-black text-[#E65100]">Streak {streak.currentStreak} Hari</div>
            <div className="text-[10px] text-[#8C6B45]">
              Terpanjang: {streak.longestStreak} hari
            </div>
          </div>
        </div>
      )}

      {/* Last 7 days quick view */}
      {summary.total > 0 && (
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0];
            const dayAssignments = (profile.dailyMissionAssignments || []).filter(a => a.date === d);
            const dayApproved = dayAssignments.filter(a => a.status === "approved_by_parent").length;
            const dayTotal = dayAssignments.length;
            const hasActivity = dayTotal > 0;
            const allDone = hasActivity && dayApproved === dayTotal;
            return (
              <div
                key={d}
                className={`flex-1 rounded-lg py-1 text-center text-[9px] font-bold ${
                  allDone ? "bg-[#4CAF50] text-white" :
                  hasActivity ? "bg-[#FF9800]/30 text-[#E65100]" :
                  "bg-gray-100 text-gray-400"
                }`}
                title={d}
              >
                {allDone ? "✓" : hasActivity ? dayApproved : "·"}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number | string;
  emoji: string;
}) {
  const safeValue =
    value === null || value === undefined || (typeof value === "number" && isNaN(value))
      ? "—"
      : typeof value === "number"
        ? value.toLocaleString("id")
        : String(value);

  return (
    <div className="rounded-[18px] bg-gradient-cream border-2 border-[#8C6B45]/40 p-3 text-center shadow-pop-sm flex flex-col items-center justify-center">
      <div className="text-xl sm:text-2xl mb-1">{emoji}</div>
      <div className="font-display font-black text-lg sm:text-xl text-[#5A3515] leading-none mb-1">
        {safeValue}
      </div>
      <div className="text-[10px] uppercase font-bold text-muted-foreground leading-tight text-center">
        {label}
      </div>
    </div>
  );
}
