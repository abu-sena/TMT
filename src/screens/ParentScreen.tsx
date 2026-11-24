import { useMemo, useState } from "react";
import type { Profile, Mission, DailyMissionCategory, DailyMissionDifficultyWeight, DailyMissionAssignment } from "@/types";
import { CATEGORIES, CATEGORY_MAP, DIFFICULTY_MAP } from "@/data/constants";
import { DAILY_MISSION_CATEGORY_META } from "@/types";
import {
  strongestCategory,
  weakestCategory,
  totalStarsEarned,
  adabBestChoiceCount,
  recentCompletedMissions,
  recommendedMissions,
} from "@/lib/progress";
import { xpProgress } from "@/lib/leveling";
import { GameButton } from "../game/GameButton";
import { RewardStars } from "../game/RewardStars";
import { useGameStore } from "@/lib/storage";
import type { LeaderboardEntry, DailyMission } from "@/types";
import { clampMissionPoints, getDefaultPointsForWeight, calculateDailyTotalPoints, exceedsSoftCap, exceedsHardCap, getPointCapWarning, getTodayAssignments, approveAssignment, rejectAssignment, grantDailyBonusIfEligible, updateStreakIfQualified, seedTodayAssignments } from "@/lib/dailyMissions";
import { cn } from "@/lib/utils";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

interface Props {
  profile: Profile;
  profiles: Profile[];
  onBack: () => void;
  onExportProfile: () => void;
  onExportAll: () => void;
  onManageRewards: () => void;
}

export function ParentScreen({ profile: initialProfile, profiles: initialProfiles, onBack, onExportProfile, onExportAll, onManageRewards }: Props) {
  const { store, updateProfile, updateGlobalState } = useGameStore();
  const profiles = store.profiles;
  const profile = profiles.find(p => p.id === initialProfile.id) || initialProfile;
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [selectedChildId, setSelectedChildId] = useState<string>("__all__");
  const isAllChildren = selectedChildId === "__all__";
  
  // Determine which profile to display
  const displayProfile: Profile = isAllChildren ? profile : (profiles.find(p => p.id === selectedChildId) || profile);
  
  const diff = DIFFICULTY_MAP[displayProfile.difficulty];
  const xp = xpProgress(displayProfile);
  const strong = strongestCategory(displayProfile);
  const weak = weakestCategory(displayProfile);
  const starsTotal = totalStarsEarned(displayProfile);
  const adabBest = adabBestChoiceCount(displayProfile);
  const recent = useMemo(() => recentCompletedMissions(displayProfile, 5), [displayProfile]);
  const recommended = useMemo(() => recommendedMissions(displayProfile, 3), [displayProfile]);
  const [parentValidationTab, setParentValidationTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  const [processingAssignmentIds, setProcessingAssignmentIds] = useState<Set<string>>(new Set());
  const [animatedAssignmentId, setAnimatedAssignmentId] = useState<string | null>(null);

  // ── New Daily Mission Management State ──
  const [showManageMissions, setShowManageMissions] = useState(false);
  const [editingMission, setEditingMission] = useState<DailyMission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [missionForm, setMissionForm] = useState({
    title: "",
    description: "",
    category: "adab" as DailyMissionCategory,
    difficultyWeight: "normal" as DailyMissionDifficultyWeight,
    points: 20,
    scheduleType: "daily" as "daily" | "once",
    date: new Date().toISOString().split("T")[0],
    requiresParentValidation: true,
    assignedProfileIds: [] as string[],
  });
  const [dailyMissionFeedback, setDailyMissionFeedback] = useState<string | null>(null);
  
  // Store-managed daily missions (in-memory for now, persisted via global state)
  const dailyMissions: DailyMission[] = (store as any).dailyMissions || [];
  
  // Get today's assignments for the selected child
  const todayAssignments = displayProfile ? getTodayAssignments(displayProfile) : [];

  // ── Insight texts ──
  const insights = useMemo(() => {
    const list: { emoji: string; text: string }[] = [];

    if (strong) {
      list.push({
        emoji: "💪",
        text: `${displayProfile.name} kuat di ${CATEGORY_MAP[strong].label}.`,
      });
    }
    if (weak) {
      list.push({
        emoji: "🎯",
        text: `Perlu latihan lagi di ${CATEGORY_MAP[weak].label}.`,
      });
    }
    if (adabBest >= 3) {
      list.push({
        emoji: "🌟",
        text: "Sering memilih jawaban adab terbaik.",
      });
    }
    if (displayProfile.adabStreak >= 3) {
      list.push({
        emoji: "🔥",
        text: `${displayProfile.adabStreak} hari berturut-turut misi adab!`,
      });
    }
    if (recommended.length > 0 && recommended[0].isBossMission) {
      list.push({
        emoji: "👑",
        text: "Siap hadapi misi boss berikutnya!",
      });
    } else if (recommended.length > 0) {
      list.push({
        emoji: "🚀",
        text: `Cocok lanjut ke "${recommended[0].title}".`,
      });
    }
    if (displayProfile.totalMissionsCompleted >= 20) {
      list.push({
        emoji: "🏆",
        text: `${displayProfile.totalMissionsCompleted} misi telah ditaklukkan!`,
      });
    }

    return list;
  }, [strong, weak, adabBest, profile, recommended]);

  // ── Stars earned breakdown ──
  const starCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    for (const mp of Object.values(displayProfile.missionProgress)) {
      if (mp.stars === 1) counts[1]++;
      else if (mp.stars === 2) counts[2]++;
      else if (mp.stars === 3) counts[3]++;
    }
    return counts;
  }, [profile]);

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#FDF8F0] via-[#F7EDDC] to-[#E8DCC2] flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="shrink-0 px-4 pt-safe mt-2 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="h-12 w-12 rounded-[18px] bg-white border-2 border-[#D4B483] text-[#5A3515] grid place-items-center text-xl shadow-sm hover:bg-[#F5E6B3] active:translate-y-[2px] transition-all"
            aria-label="Kembali"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-black text-2xl text-[#5A3515] leading-tight">
              Dashboard Orang Tua
            </h1>
            <p className="text-xs font-bold text-[#8C6B45]">
              Pantau perkembangan belajar &amp; adab ananda
            </p>
          </div>
          <div className="text-3xl">👨‍👩‍👧</div>
        </div>
      </header>

      <main className="flex-1 min-h-0 px-4 max-w-lg mx-auto space-y-4 overflow-y-auto overflow-x-hidden overscroll-contain">
        {/* ═══ Child Dropdown ═══ */}
        {profiles.length > 1 && (
          <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-3 shadow-card">
            <label className="text-xs font-bold uppercase text-[#8C6B45] mb-1 block">Pilih Anak</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full rounded-[16px] bg-[#FDF8F0] border-2 border-[#D4B483] p-2.5 text-[#5A3515] font-bold text-sm focus:border-[#185E9F] outline-none"
            >
              <option value="__all__">👨‍👩‍👧‍👦 Semua Anak</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {DIFFICULTY_MAP[p.difficulty]?.shortLabel || p.difficulty}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ═══ Semua Anak - Ringkasan Gabungan ═══ */}
        {isAllChildren && profiles.length > 1 && (() => {
          const allTotalMissions = profiles.reduce((s, p) => s + p.totalMissionsCompleted, 0);
          const allTotalStars = profiles.reduce((s, p) => s + Object.values(p.missionProgress).reduce((sum, mp) => sum + mp.stars, 0), 0);
          const allMiniGameSessions = (store.miniGameSessions || []).filter(s => profiles.some(pp => pp.id === s.profileId));
          const allBattleCount = (store.battleHistory || []).filter(b => b.players?.some(pl => profiles.some(pp => pp.id === pl.profileId))).length;
          const avgLevel = profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + p.level, 0) / profiles.length) : 0;
          const mostActive = [...profiles].sort((a, b) => b.totalMissionsCompleted - a.totalMissionsCompleted)[0];
          const needsPractice = [...profiles].sort((a, b) => (a.adabStreak || 0) - (b.adabStreak || 0))[0];
          const totalAdabStreak = profiles.reduce((s, p) => s + (p.adabStreak || 0), 0);
          
          return (
            <div className="rounded-[28px] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#2E8B12] p-4 shadow-card">
              <h3 className="font-display font-black text-lg text-[#2E8B12] uppercase mb-3 text-center">
                👨‍👩‍👧‍👦 Ringkasan Semua Anak
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-white/60 rounded-[18px] p-3 text-center">
                  <div className="font-black text-2xl text-[#5A3515]">{allTotalMissions}</div>
                  <div className="text-[10px] uppercase text-[#8C6B45]">Total Misi Selesai</div>
                </div>
                <div className="bg-white/60 rounded-[18px] p-3 text-center">
                  <div className="font-black text-2xl text-[#5A3515]">{allTotalStars}</div>
                  <div className="text-[10px] uppercase text-[#8C6B45]">Total Bintang</div>
                </div>
                <div className="bg-white/60 rounded-[18px] p-3 text-center">
                  <div className="font-black text-2xl text-[#5A3515]">{allMiniGameSessions.length}</div>
                  <div className="text-[10px] uppercase text-[#8C6B45]">Mini-Game</div>
                </div>
                <div className="bg-white/60 rounded-[18px] p-3 text-center">
                  <div className="font-black text-2xl text-[#5A3515]">{allBattleCount}</div>
                  <div className="text-[10px] uppercase text-[#8C6B45]">Battle</div>
                </div>
                <div className="bg-white/60 rounded-[18px] p-3 text-center">
                  <div className="font-black text-2xl text-[#5A3515]">Lv.{avgLevel}</div>
                  <div className="text-[10px] uppercase text-[#8C6B45]">Rata² Level</div>
                </div>
                <div className="bg-white/60 rounded-[18px] p-3 text-center">
                  <div className="font-black text-2xl text-[#5A3515]">🔥{totalAdabStreak}</div>
                  <div className="text-[10px] uppercase text-[#8C6B45]">Total Streak Adab</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mostActive && (
                  <div className="bg-[#FFF9E6] rounded-[18px] p-3 border border-[#D48806]">
                    <div className="text-xs font-black uppercase text-[#D48806]">🏆 Paling Aktif</div>
                    <div className="font-bold text-[#5A3515] mt-1 flex items-center gap-2"><AvatarPortrait avatar={mostActive.avatar} className="w-7 h-7 rounded-full" />{mostActive.name}</div>
                    <div className="text-[10px] text-[#8C6B45]">{mostActive.totalMissionsCompleted} misi selesai</div>
                  </div>
                )}
                {needsPractice && (
                  <div className="bg-[#FFF0E5] rounded-[18px] p-3 border border-[#FF9800]">
                    <div className="text-xs font-black uppercase text-[#FF9800]">🎯 Perlu Latihan</div>
                    <div className="font-bold text-[#5A3515] mt-1 flex items-center gap-2"><AvatarPortrait avatar={needsPractice.avatar} className="w-7 h-7 rounded-full" />{needsPractice.name}</div>
                    <div className="text-[10px] text-[#8C6B45]">Streak adab: {needsPractice.adabStreak || 0} hari</div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ═══ Profile Card ═══ */}
        {!isAllChildren && (
        <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card flex items-center gap-4">
          <AvatarPortrait avatar={displayProfile.avatar} className="h-16 w-16 rounded-[20px] border-2 border-[#D48806] shadow-sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-xl text-[#5A3515] truncate">
                {displayProfile.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#E8DCC2] text-[#8C6B45] text-[10px] font-black border border-[#CBB794]">
                {diff.shortLabel}
              </span>
            </div>
            <div className="mt-1">
              {/* XP bar */}
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8C6B45] mb-0.5">
                <span>Level {displayProfile.level}</span>
                <span>{xp.current} / {xp.needed} XP</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#E8DCC2] overflow-hidden border border-[#D4B483]">
                <div
                  className="h-full rounded-full bg-gradient-xp transition-all duration-500"
                  style={{ width: `${xp.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ═══ Individual Child Sections ═══ */}
        {!isAllChildren && <>

        {/* ═══ Quick Stats Grid ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatTile emoji="⭐" label="Total Poin" value={displayProfile.points.toLocaleString("id")} tone="sun" />
          <StatTile emoji="✅" label="Misi Selesai" value={displayProfile.totalMissionsCompleted} tone="meadow" />
          <StatTile emoji="🌟" label="Bintang" value={`${starsTotal} ⭑`} tone="coin" />
          <StatTile emoji="🏅" label="Lencana" value={displayProfile.badges.length} tone="berry" />
        </div>

        {/* ═══ Stars Breakdown ═══ */}
        <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
          <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-3 flex items-center gap-2">
            <span>⭐</span> Perolehan Bintang
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <StarPile stars={3} count={starCounts[3]} />
            <StarPile stars={2} count={starCounts[2]} />
            <StarPile stars={1} count={starCounts[1]} />
          </div>
        </div>

        {/* ═══ Category Progress Chart ═══ */}
        <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
          <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-3">
            📊 Kemajuan per Kategori
          </h3>
          <div className="space-y-2.5">
            {CATEGORIES.map((c) => {
              const s = displayProfile.categoryStats[c.id];
              const total = s?.total ?? 0;
              const correct = s?.correct ?? 0;
              const ratio = total === 0 ? 0 : Math.round((correct / total) * 100);
              const barColor =
                ratio >= 80 ? "bg-gradient-meadow"
                : ratio >= 50 ? "bg-gradient-coin"
                : ratio > 0 ? "bg-gradient-sun"
                : "bg-[#D8CFC0]";

              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center shrink-0">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs font-bold mb-0.5">
                      <span className="text-[#5A3515] truncate">{c.label}</span>
                      <span className="text-[#8C6B45] tabular-nums ml-2 shrink-0">
                        {correct}/{total}
                        {total > 0 && <span className="ml-1 opacity-60">{ratio}%</span>}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#E8DCC2] overflow-hidden border border-[#D4B483]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${Math.max(ratio, 4)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Strengths & Gaps (side-by-side) ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-[28px] bg-gradient-meadow border-2 border-[#2E8B12] p-4 shadow-card text-white">
            <div className="text-xs font-black uppercase tracking-wide opacity-80 mb-1">Kekuatan</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{strong ? CATEGORY_MAP[strong].emoji : "❓"}</span>
              <span className="font-display font-black text-sm leading-tight">
                {strong ? CATEGORY_MAP[strong].label : "Belum cukup data"}
              </span>
            </div>
          </div>
          <div className="rounded-[28px] bg-[#FFF0E5] border-2 border-[#D48806] p-4 shadow-card">
            <div className="text-xs font-black uppercase tracking-wide text-[#8C6B45] mb-1">Perlu Latihan</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{weak ? CATEGORY_MAP[weak].emoji : "❓"}</span>
              <span className="font-display font-black text-sm text-[#5A3515] leading-tight">
                {weak ? CATEGORY_MAP[weak].label : "Belum cukup data"}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Adab Growth Summary ═══ */}
        <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
          <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-3">
            🤲 Ringkasan Pertumbuhan Adab
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <AdabMetric
              emoji="🌟"
              label="Pilihan Adab Terbaik"
              value={`${adabBest}×`}
              sub={`dari ${Object.keys(displayProfile.missionProgress).length} misi`}
            />
            <AdabMetric
              emoji="🔥"
              label="Streak Adab"
              value={`${displayProfile.adabStreak} hari`}
              sub={displayProfile.adabStreak >= 7 ? "🏅 Penjaga Adab!" : "Teruskan!"}
            />
            <AdabMetric
              emoji="🕌"
              label="Misi Moral Selesai"
              value={displayProfile.categoryStats.moral?.correct ?? 0}
              sub="jawaban tepat"
            />
            <AdabMetric
              emoji="💎"
              label="Total Streak"
              value={`${displayProfile.streak}×`}
              sub="berturut-turut"
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            KELOLA MISI HARIAN
           ═══════════════════════════════════════════ */}
        <div className="rounded-[28px] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] border-2 border-[#185E9F] p-4 shadow-card">
          <h3 className="font-display font-black text-sm text-[#185E9F] uppercase mb-3 flex items-center gap-2">
            <span>📋</span> Kelola Misi Harian
          </h3>

          {dailyMissionFeedback && (
            <div className="mb-3 p-2.5 rounded-xl bg-white/80 border border-[#185E9F]/30 text-sm font-bold text-[#185E9F] text-center">
              {dailyMissionFeedback}
            </div>
          )}

          {/* Empty state: no missions yet */}
          {dailyMissions.length === 0 && !showManageMissions && (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-xs font-bold text-[#5A3515] mb-3">
                Belum ada Misi Harian. Buat misi pertama untuk anak.
              </p>
              <button
                onClick={() => {
                  setEditingMission(null);
                  setMissionForm({
                    title: "", description: "", category: "custom" as DailyMissionCategory,
                    difficultyWeight: "normal" as DailyMissionDifficultyWeight, points: 20,
                    scheduleType: "daily", date: new Date().toISOString().split("T")[0],
                    requiresParentValidation: true, assignedProfileIds: [],
                  });
                  setShowManageMissions(true);
                }}
                className="py-3 px-6 rounded-xl bg-[#185E9F] text-white font-black text-sm active:scale-95 transition-transform"
              >
                ➕ Buat Misi Harian
              </button>
            </div>
          )}

          {/* Active missions list */}
          {dailyMissions.length > 0 && !showManageMissions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-[#8C6B45] uppercase">
                  Misi Aktif ({dailyMissions.filter(m => m.isActive).length})
                </div>
                <button
                  onClick={() => {
                    setEditingMission(null);
                    setMissionForm({
                      title: "", description: "", category: "custom" as DailyMissionCategory,
                      difficultyWeight: "normal" as DailyMissionDifficultyWeight, points: 20,
                      scheduleType: "daily", date: new Date().toISOString().split("T")[0],
                      requiresParentValidation: true, assignedProfileIds: [],
                    });
                    setShowManageMissions(true);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-[#185E9F] text-white font-black text-[10px] active:scale-95 transition-transform"
                >
                  ➕ Buat Misi
                </button>
              </div>

              {/* Delete confirmation */}
              {showDeleteConfirm && (
                <div className="rounded-xl bg-[#FFEBEE] border-2 border-[#E53935] p-3 text-center">
                  <p className="text-xs font-bold text-[#E53935] mb-2">
                    Hapus misi ini? Reward yang sudah diberikan tetap aman.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        const updated = dailyMissions.map(m =>
                          m.id === showDeleteConfirm ? { ...m, isActive: false, updatedAt: new Date().toISOString() } : m
                        );
                        updateGlobalState({ dailyMissions: updated });
                        setDailyMissionFeedback("✅ Misi dinonaktifkan. Riwayat reward tetap aman.");
                        setTimeout(() => setDailyMissionFeedback(null), 3000);
                        setShowDeleteConfirm(null);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-[#E53935] text-white font-bold text-xs"
                    >
                      Ya, Nonaktifkan
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="py-1.5 px-3 rounded-lg bg-gray-200 text-[#5A3515] font-bold text-xs"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {dailyMissions.filter(m => m.isActive).map(m => {
                const catMeta = DAILY_MISSION_CATEGORY_META[m.category];
                const assignedNames = m.assignedProfileIds
                  .map(pid => profiles.find(p => p.id === pid)?.name || "?")
                  .join(", ");
                return (
                  <div key={m.id} className="bg-white/60 rounded-xl p-2.5 border border-[#E8DCC2]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{catMeta?.emoji || "✨"}</span>
                      <span className="flex-1 text-xs font-bold text-[#5A3515] truncate">{m.title}</span>
                      <span className="text-[10px] font-black text-[#D48806]">+{m.points}pts</span>
                    </div>
                    <div className="text-[9px] text-[#8C6B45] mb-1.5">
                      {m.scheduleType === "daily" ? "🔄 Setiap hari" : `📅 ${m.date}`}
                      {" · "}{assignedNames}
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingMission(m);
                          setMissionForm({
                            title: m.title,
                            description: m.description,
                            category: m.category,
                            difficultyWeight: m.difficultyWeight,
                            points: m.points,
                            scheduleType: m.scheduleType as "daily" | "once",
                            date: m.date,
                            requiresParentValidation: m.requiresParentValidation,
                            assignedProfileIds: [...m.assignedProfileIds],
                          });
                          setShowManageMissions(true);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-white border border-[#185E9F]/30 text-[#185E9F] font-bold text-[10px]"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(m.id)}
                        className="flex-1 py-1.5 rounded-lg bg-white border border-[#E53935]/30 text-[#E53935] font-bold text-[10px]"
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Inactive missions */}
              {dailyMissions.filter(m => !m.isActive).length > 0 && (
                <div className="mt-3 pt-2 border-t border-[#185E9F]/20">
                  <div className="text-[9px] font-bold text-[#8C6B45] uppercase mb-1">
                    Nonaktif ({dailyMissions.filter(m => !m.isActive).length})
                  </div>
                  {dailyMissions.filter(m => !m.isActive).map(m => (
                    <div key={m.id} className="flex items-center gap-2 py-1">
                      <span className="text-xs text-[#8C6B45] truncate flex-1 opacity-60">{m.title}</span>
                      <button
                        onClick={() => {
                          const updated = dailyMissions.map(dm => dm.id === m.id ? { ...dm, isActive: true, updatedAt: new Date().toISOString() } : dm);
                          updateGlobalState({ dailyMissions: updated });
                          setDailyMissionFeedback("✅ Misi diaktifkan kembali.");
                          setTimeout(() => setDailyMissionFeedback(null), 2000);
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#2E8B12] font-bold"
                      >
                        Aktifkan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Mission Form */}
        {showManageMissions && (
          <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-black text-sm text-[#5A3515]">
                {editingMission ? "✏️ Edit Misi Harian" : "➕ Buat Misi Harian"}
              </h4>
              <button onClick={() => { setShowManageMissions(false); setEditingMission(null); }} className="text-sm text-[#8C6B45] font-bold">✕ Tutup</button>
            </div>

            {/* Edit warning if mission has pending/rejected assignments */}
            {editingMission && (() => {
              const hasPending = profiles.some(p => {
                const assigns = (p.dailyMissionAssignments || []).filter(a => a.missionId === editingMission.id);
                return assigns.some(a => a.status === "pending_parent_validation" || a.status === "checked_by_child");
              });
              if (hasPending) {
                return (
                  <div className="mb-3 p-2 rounded-xl bg-[#FFF3E0] border border-[#FF9800]/30 text-[10px] font-bold text-[#E65100]">
                    ⚠️ Misi ini sedang menunggu validasi. Mengubah misi dapat mengembalikan status ke Belum Dilakukan.
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-2.5">
              {/* 1. Judul Misi */}
              <div>
                <label className="text-[10px] font-bold text-[#8C6B45] uppercase block mb-0.5">
                  1. Judul Misi <span className="text-[#E53935]">*</span>
                </label>
                <input
                  type="text" value={missionForm.title}
                  onChange={e => setMissionForm({ ...missionForm, title: e.target.value })}
                  placeholder="Contoh: Membaca buku 10 menit"
                  className="w-full rounded-xl border border-[#D4B483] p-2.5 text-sm font-bold text-[#5A3515] outline-none focus:border-[#185E9F] placeholder:text-[#CBB794]"
                />
              </div>

              {/* 2. Untuk Anak */}
              <div>
                <label className="text-[10px] font-bold text-[#8C6B45] uppercase block mb-0.5">
                  2. Untuk Anak <span className="text-[#E53935]">*</span>
                </label>
                <div className="space-y-1 mb-1">
                  {profiles.map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-[#FDF8F0] border border-[#E8DCC2] text-xs font-bold text-[#5A3515]">
                      <input
                        type="checkbox"
                        checked={missionForm.assignedProfileIds.includes(p.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setMissionForm({ ...missionForm, assignedProfileIds: [...missionForm.assignedProfileIds, p.id] });
                          } else {
                            setMissionForm({ ...missionForm, assignedProfileIds: missionForm.assignedProfileIds.filter(id => id !== p.id) });
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <AvatarPortrait avatar={p.avatar} className="inline-block w-6 h-6 align-middle rounded-full mr-2" />{p.name}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setMissionForm({ ...missionForm, assignedProfileIds: profiles.map(p => p.id) })}
                  className="text-[9px] font-bold text-[#185E9F] underline"
                >
                  ✅ Semua Anak
                </button>
              </div>

              {/* 3. Poin/EXP */}
              <div>
                <label className="text-[10px] font-bold text-[#8C6B45] uppercase block mb-0.5">
                  3. Poin/EXP <span className="text-[#E53935]">*</span>
                </label>
                <input
                  type="number" min={5} max={75}
                  value={missionForm.points}
                  onChange={e => setMissionForm({ ...missionForm, points: clampMissionPoints(parseInt(e.target.value) || 5) })}
                  className="w-full rounded-xl border border-[#D4B483] p-2.5 text-sm font-bold text-[#5A3515] outline-none focus:border-[#185E9F]"
                />
                <p className="text-[9px] text-[#8C6B45] mt-0.5">
                  Saran: 10 ringan, 20 normal, 30 sedang, 50 berat.
                </p>
              </div>

              {/* 4. Jadwal */}
              <div>
                <label className="text-[10px] font-bold text-[#8C6B45] uppercase block mb-0.5">
                  4. Jadwal <span className="text-[#E53935]">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMissionForm({ ...missionForm, scheduleType: "daily" })}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                      missionForm.scheduleType === "daily"
                        ? "bg-[#185E9F] text-white"
                        : "bg-white border border-[#D4B483] text-[#5A3515]"
                    )}
                  >
                    🔄 Ulang Setiap Hari
                  </button>
                  <button
                    onClick={() => setMissionForm({ ...missionForm, scheduleType: "once" })}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                      missionForm.scheduleType === "once"
                        ? "bg-[#185E9F] text-white"
                        : "bg-white border border-[#D4B483] text-[#5A3515]"
                    )}
                  >
                    📅 Tanggal Tertentu
                  </button>
                </div>
                {missionForm.scheduleType === "once" && (
                  <input
                    type="date" value={missionForm.date}
                    onChange={e => setMissionForm({ ...missionForm, date: e.target.value })}
                    className="w-full rounded-xl border border-[#D4B483] p-2 mt-1.5 text-xs font-bold text-[#5A3515] outline-none"
                  />
                )}
              </div>

              {/* 5. Deskripsi & Kategori (optional) */}
              <div>
                <label className="text-[10px] font-bold text-[#8C6B45] uppercase block mb-0.5">
                  5. Deskripsi & Kategori <span className="text-[#8C6B45]">(opsional)</span>
                </label>
                <input
                  type="text" value={missionForm.description}
                  onChange={e => setMissionForm({ ...missionForm, description: e.target.value })}
                  placeholder="Catatan singkat untuk anak..."
                  className="w-full rounded-xl border border-[#D4B483] p-2 text-xs font-bold text-[#5A3515] outline-none focus:border-[#185E9F] placeholder:text-[#CBB794]"
                />
                <select
                  value={missionForm.category}
                  onChange={e => setMissionForm({ ...missionForm, category: e.target.value as DailyMissionCategory })}
                  className="w-full rounded-xl border border-[#D4B483] p-2 mt-1.5 text-xs font-bold text-[#5A3515] outline-none"
                >
                  {Object.entries(DAILY_MISSION_CATEGORY_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                  ))}
                </select>
              </div>

              {/* Point cap warning */}
              {(() => {
                const testAssignments: DailyMissionAssignment[] = [{
                  id: "test", missionId: "test", profileId: profiles[0]?.id || "",
                  date: new Date().toISOString().split("T")[0],
                  title: missionForm.title, description: missionForm.description,
                  category: missionForm.category, points: missionForm.points,
                  status: "not_started", rewardGranted: false, pointsAwarded: 0,
                }];
                const allAssets = [...todayAssignments, ...testAssignments];
                const warning = getPointCapWarning(allAssets);
                if (warning) {
                  return (
                    <div className={cn(
                      "p-2 rounded-xl text-[10px] font-bold",
                      exceedsHardCap(allAssets) ? "bg-[#FFEBEE] text-[#E53935]" : "bg-[#FFF3E0] text-[#E65100]"
                    )}>
                      ⚠️ {warning}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowManageMissions(false); setEditingMission(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-gray-200 text-[#5A3515] font-bold text-sm active:scale-95 transition-transform"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (!missionForm.title.trim()) {
                      setDailyMissionFeedback("⚠️ Judul misi tidak boleh kosong.");
                      setTimeout(() => setDailyMissionFeedback(null), 2500);
                      return;
                    }
                    if (missionForm.assignedProfileIds.length === 0) {
                      setDailyMissionFeedback("⚠️ Pilih minimal satu anak.");
                      setTimeout(() => setDailyMissionFeedback(null), 2500);
                      return;
                    }
                    if (missionForm.points < 5) {
                      setDailyMissionFeedback("⚠️ Poin minimal 5.");
                      setTimeout(() => setDailyMissionFeedback(null), 2500);
                      return;
                    }
                    if (missionForm.points > 75) {
                      setDailyMissionFeedback("⚠️ Poin maksimal per misi adalah 75.");
                      setTimeout(() => setDailyMissionFeedback(null), 2500);
                      return;
                    }
                    // Check hard cap for each assigned child
                    for (const pid of missionForm.assignedProfileIds) {
                      const child = profiles.find(p => p.id === pid);
                      if (child) {
                        const childAssignments = getTodayAssignments(child);
                        const testAssignments: DailyMissionAssignment[] = [{
                          id: "test", missionId: "test", profileId: pid,
                          date: new Date().toISOString().split("T")[0],
                          title: missionForm.title, description: missionForm.description,
                          category: missionForm.category, points: missionForm.points,
                          status: "not_started", rewardGranted: false, pointsAwarded: 0,
                        }];
                        const allAssets = [...childAssignments, ...testAssignments];
                        if (exceedsHardCap(allAssets)) {
                          setDailyMissionFeedback(`⚠️ Total poin harian ${child.name} akan melebihi 250. Kurangi poin.`);
                          setTimeout(() => setDailyMissionFeedback(null), 3000);
                          return;
                        }
                      }
                    }

                    const mission: DailyMission = {
                      id: editingMission?.id || crypto.randomUUID(),
                      title: missionForm.title.trim(),
                      description: missionForm.description.trim(),
                      category: missionForm.category,
                      difficultyWeight: missionForm.difficultyWeight,
                      points: clampMissionPoints(missionForm.points),
                      assignedProfileIds: missionForm.assignedProfileIds,
                      date: missionForm.date,
                      scheduleType: missionForm.scheduleType,
                      requiresParentValidation: true,
                      isActive: true,
                      createdAt: editingMission?.createdAt || new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };

                    const updated = editingMission
                      ? dailyMissions.map(m => m.id === mission.id ? mission : m)
                      : [...dailyMissions, mission];
                    updateGlobalState({ dailyMissions: updated });

                    // Seed today's assignments for assigned children
                    for (const pid of mission.assignedProfileIds) {
                      const child = profiles.find(p => p.id === pid);
                      if (child) {
                        const seeded = seedTodayAssignments(child, [mission]);
                        updateProfile(child.id, seeded);
                      }
                    }

                    setDailyMissionFeedback(editingMission ? "✅ Misi diperbarui!" : "✅ Misi baru dibuat! Muncul di halaman anak.");
                    setTimeout(() => setDailyMissionFeedback(null), 3000);
                    setShowManageMissions(false);
                    setEditingMission(null);
                  }}
                  disabled={
                    !missionForm.title.trim() ||
                    missionForm.assignedProfileIds.length === 0 ||
                    missionForm.points < 5 ||
                    missionForm.points > 75
                  }
                  className={cn(
                    "flex-[2] py-2.5 rounded-xl font-black text-sm active:translate-y-0.5 transition-all",
                    (!missionForm.title.trim() || missionForm.assignedProfileIds.length === 0 || missionForm.points < 5 || missionForm.points > 75)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-meadow border-b-2 border-[#2E8B12] text-white"
                  )}
                >
                  💾 Simpan Misi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            VALIDASI MISI HARIAN (Parent - Section Grouped)
           ═══════════════════════════════════════════ */}
        {!showManageMissions && (
          <div className="rounded-[28px] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#2E8B12] p-4 shadow-card">
            <h3 className="font-display font-black text-sm text-[#2E8B12] uppercase mb-3 flex items-center gap-2">
              <span>✅</span> Validasi Misi Harian
            </h3>

            {/* Validation feedback toast */}
            {validationFeedback && (
              <div className="mb-3 p-2.5 rounded-xl bg-white/90 border-2 border-[#2E8B12]/40 text-xs font-bold text-[#2E8B12] text-center animate-pop-in shadow-sm">
                {validationFeedback}
              </div>
            )}

            {/* Child selector for validation */}
            {profiles.length > 1 && (
              <div className="mb-3">
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full rounded-xl bg-white/80 border-2 border-[#2E8B12]/30 p-2 text-[#5A3515] font-bold text-xs focus:border-[#2E8B12] outline-none"
                >
                  <option value="__all__">👨‍👩‍👧‍👦 Semua Anak</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* ═══ Validation Sections ═══ */}
            {(() => {
              const childrenToCheck = isAllChildren ? profiles : [displayProfile];
              let allItems: { profile: Profile; assignment: DailyMissionAssignment }[] = [];

              for (const child of childrenToCheck) {
                const assigns = getTodayAssignments(child);
                for (const a of assigns) {
                  // Only show items needing validation or already handled
                  const s = a.status;
                  if (s === "pending_parent_validation" || s === "checked_by_child" ||
                      s === "approved_by_parent" || s === "rejected_by_parent") {
                    allItems.push({ profile: child, assignment: a });
                  }
                }
              }

              // Group items
              const pendingItems = allItems.filter(
                p => p.assignment.status === "pending_parent_validation" || p.assignment.status === "checked_by_child"
              );
              const rejectedItems = allItems.filter(
                p => p.assignment.status === "rejected_by_parent"
              );
              const approvedItems = allItems.filter(
                p => p.assignment.status === "approved_by_parent"
              );

              const totalPending = pendingItems.length;
              const totalApproved = approvedItems.length;
              const totalRejected = rejectedItems.length;

              // Count total points given today
              const totalPointsGiven = approvedItems.reduce(
                (sum, p) => sum + p.assignment.pointsAwarded, 0
              );
              const totalPendingPoints = pendingItems.reduce(
                (sum, p) => sum + p.assignment.points, 0
              );

              // If no items at all
              if (allItems.length === 0) {
                return (
                  <div className="text-center py-5">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm font-bold text-[#8C6B45]">
                      Belum ada misi yang perlu divalidasi.
                    </p>
                    <p className="text-[10px] text-[#8C6B45]/70 mt-1">
                      Misi akan muncul di sini setelah anak mencentang.
                    </p>
                  </div>
                );
              }

              // Render a single validation item card
              const renderValidationItem = (
                child: Profile,
                a: DailyMissionAssignment,
                isPending: boolean,
                isApproved: boolean,
                isRejected: boolean
              ) => {
                const catMeta = DAILY_MISSION_CATEGORY_META[a.category];
                const isProcessing = processingAssignmentIds.has(a.id);
                const isAnimating = animatedAssignmentId === a.id;

                const handleApprove = () => {
                  if (isProcessing || a.rewardGranted) return;
                  setProcessingAssignmentIds(prev => new Set(prev).add(a.id));

                  setTimeout(() => {
                    const result = approveAssignment(child, a.id);
                    if (result) {
                      let updated = result.profile;
                      updated = grantDailyBonusIfEligible(updated) || updated;
                      updated = updateStreakIfQualified(updated);
                      updateProfile(child.id, updated);
                      setAnimatedAssignmentId(a.id);
                      setValidationFeedback(
                        `✅ "${a.title}" disetujui. +${result.pointsAwarded} poin diberikan.`
                      );
                      setTimeout(() => setValidationFeedback(null), 3500);
                      setTimeout(() => setAnimatedAssignmentId(null), 600);
                    }
                    setProcessingAssignmentIds(prev => {
                      const next = new Set(prev);
                      next.delete(a.id);
                      return next;
                    });
                  }, 350);
                };

                const handleReject = () => {
                  if (isProcessing) return;
                  setProcessingAssignmentIds(prev => new Set(prev).add(a.id));

                  setTimeout(() => {
                    const result = rejectAssignment(child, a.id);
                    if (result) {
                      updateProfile(child.id, result);
                      setAnimatedAssignmentId(a.id);
                      setValidationFeedback(
                        `🔄 "${a.title}" dikembalikan untuk diulang.`
                      );
                      setTimeout(() => setValidationFeedback(null), 3500);
                      setTimeout(() => setAnimatedAssignmentId(null), 600);
                    }
                    setProcessingAssignmentIds(prev => {
                      const next = new Set(prev);
                      next.delete(a.id);
                      return next;
                    });
                  }, 350);
                };

                const cardBg = isPending
                  ? "bg-[#FFF8E1] border-[#FF9800]/30"
                  : isApproved
                    ? "bg-[#E8F5E9] border-[#4CAF50]/30"
                    : "bg-[#FFEBEE] border-[#E53935]/20";

                return (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-[18px] bg-white/80 border p-3 transition-all duration-300",
                      cardBg,
                      isAnimating && "animate-pop-in scale-[0.97] shadow-md"
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <AvatarPortrait avatar={child.avatar} className="w-7 h-7 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#5A3515]">{child.name}</span>
                          <span className="text-[10px] text-[#8C6B45]">·</span>
                          <span className={cn(
                            "font-bold text-xs",
                            isApproved ? "text-[#2E7D32]" : isRejected ? "text-[#C62828]" : "text-[#5A3515]"
                          )}>
                            {a.title}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          <span className="text-[9px] text-[#8C6B45]">{catMeta?.emoji} {catMeta?.label}</span>
                          <span className="text-[9px] font-black text-[#D48806]">+{a.points} pts</span>
                        </div>
                        {a.checkedAt && (
                          <p className="text-[9px] text-[#8C6B45]/70 mt-0.5">
                            Dicentang: {new Date(a.checkedAt).toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                        {a.parentNote && isRejected && (
                          <p className="text-[9px] text-[#C62828]/80 mt-0.5 italic">
                            💬 {a.parentNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons for pending */}
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl font-black text-xs transition-all duration-200",
                            isProcessing
                              ? "bg-gray-300 text-gray-500 cursor-wait"
                              : "bg-[#2E8B12] text-white active:scale-95"
                          )}
                        >
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                              Menyetujui…
                            </span>
                          ) : (
                            "✅ Setujui"
                          )}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={isProcessing}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl font-black text-xs transition-all duration-200",
                            isProcessing
                              ? "bg-gray-300 text-gray-500 cursor-wait"
                              : "bg-[#E53935] text-white active:scale-95"
                          )}
                        >
                          {isProcessing ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                              Memproses…
                            </span>
                          ) : (
                            "🔄 Perlu Diulang"
                          )}
                        </button>
                      </div>
                    )}

                    {/* Status badge for approved */}
                    {isApproved && (
                      <div className="flex items-center gap-2 text-xs font-bold px-2 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#4CAF50]/30">
                        <span>✅</span>
                        <span>Disetujui · +{a.pointsAwarded} poin</span>
                      </div>
                    )}

                    {/* Status badge for rejected */}
                    {isRejected && (
                      <div className="flex items-center gap-2 text-xs font-bold px-2 py-1.5 rounded-full bg-[#FFEBEE] text-[#C62828] border border-[#E53935]/20">
                        <span>🔄</span>
                        <span>Dikembalikan untuk diulang</span>
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div className="space-y-4">
                  {/* Summary mini-card */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#FFF3E0] rounded-xl p-2.5 text-center border border-[#FF9800]/20">
                      <div className="text-lg">⏳</div>
                      <div className="font-black text-base text-[#E65100]">{totalPending}</div>
                      <div className="text-[9px] font-bold text-[#8C6B45]">Menunggu</div>
                      {totalPendingPoints > 0 && (
                        <div className="text-[8px] text-[#D48806] mt-0.5">{totalPendingPoints} pts</div>
                      )}
                    </div>
                    <div className="bg-[#E8F5E9] rounded-xl p-2.5 text-center border border-[#4CAF50]/20">
                      <div className="text-lg">✅</div>
                      <div className="font-black text-base text-[#2E7D32]">{totalApproved}</div>
                      <div className="text-[9px] font-bold text-[#8C6B45]">Disetujui</div>
                      {totalPointsGiven > 0 && (
                        <div className="text-[8px] text-[#2E8B12] mt-0.5">+{totalPointsGiven} pts</div>
                      )}
                    </div>
                    <div className="bg-[#FFEBEE] rounded-xl p-2.5 text-center border border-[#E53935]/20">
                      <div className="text-lg">🔄</div>
                      <div className="font-black text-base text-[#C62828]">{totalRejected}</div>
                      <div className="text-[9px] font-bold text-[#8C6B45]">Diulang</div>
                    </div>
                  </div>

                  {/* Section: Menunggu Validasi */}
                  {pendingItems.length > 0 && (
                    <div>
                      <h4 className="font-display font-black text-xs text-[#E65100] mb-2 flex items-center gap-1.5">
                        <span>⏳</span> Menunggu Validasi
                        <span className="text-[9px] font-bold text-[#8C6B45] bg-white/60 px-1.5 py-0.5 rounded-full">
                          {pendingItems.length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {pendingItems.map(({ profile: child, assignment: a }) =>
                          renderValidationItem(child, a, true, false, false)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section: Perlu Diulang */}
                  {rejectedItems.length > 0 && (
                    <div>
                      <h4 className="font-display font-black text-xs text-[#C62828] mb-2 flex items-center gap-1.5">
                        <span>🔄</span> Perlu Diulang
                        <span className="text-[9px] font-bold text-[#8C6B45] bg-white/60 px-1.5 py-0.5 rounded-full">
                          {rejectedItems.length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {rejectedItems.map(({ profile: child, assignment: a }) =>
                          renderValidationItem(child, a, false, false, true)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section: Disetujui Hari Ini */}
                  {approvedItems.length > 0 && (
                    <div>
                      <h4 className="font-display font-black text-xs text-[#2E7D32] mb-2 flex items-center gap-1.5">
                        <span>✅</span> Disetujui Hari Ini
                        <span className="text-[9px] font-bold text-[#8C6B45] bg-white/60 px-1.5 py-0.5 rounded-full">
                          {approvedItems.length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {approvedItems.map(({ profile: child, assignment: a }) =>
                          renderValidationItem(child, a, false, true, false)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empty pending */}
                  {pendingItems.length === 0 && allItems.length === 0 && (
                    <div className="text-center py-3">
                      <p className="text-[10px] font-bold text-[#8C6B45]/70">
                        Semua validasi hari ini sudah selesai.
                      </p>
                    </div>
                  )}

                  {/* All done state */}
                  {pendingItems.length === 0 && allItems.length > 0 && (
                    <div className="text-center py-2">
                      <div className="text-2xl mb-1">🎉</div>
                      <p className="text-xs font-bold text-[#2E7D32]">
                        Semua validasi hari ini sudah selesai!
                      </p>
                      <p className="text-[10px] text-[#8C6B45] mt-0.5">
                        Total {totalPointsGiven} poin diberikan hari ini.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══ Insights ═══ */}
        {insights.length > 0 && (
          <div className="rounded-[28px] bg-gradient-to-br from-[#FFF9E6] to-[#F5E6B3] border-2 border-[#D4B483] p-4 shadow-card">
            <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-2">
              💡 Wawasan
            </h3>
            <div className="space-y-1.5">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm font-bold text-[#5A3515] leading-relaxed"
                >
                  <span className="shrink-0 mt-0.5">{ins.emoji}</span>
                  <span>{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Mini-Game Stats ═══ */}
        {(() => {
          const myGames = store.miniGameSessions?.filter(s => s.profileId === displayProfile.id) || [];
          if (myGames.length === 0) return null;
          
          const gameTypes = ["hitung", "pola", "ingatan", "adab"];
          const gameNames: Record<string, string> = { hitung: "Hitung Kilat", pola: "Pola Kilat", ingatan: "Ingatan Cepat", adab: "Adab Cepat" };
          const gameEmojis: Record<string, string> = { hitung: "⚡", pola: "🧩", ingatan: "🧠", adab: "💖" };
          
          return (
            <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
              <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-3">
                🎮 Mini-Game Cepat
              </h3>
              <div className="space-y-2">
                {gameTypes.map(gt => {
                  const sessions = myGames.filter(s => s.gameType === gt);
                  if (sessions.length === 0) return null;
                  const best = sessions.reduce((max, s) => s.score > max.score ? s : max, sessions[0]);
                  const lb = store.miniGameLeaderboards[gt] || [];
                  const rank = lb.findIndex(e => e.profileId === displayProfile.id);
                  return (
                    <div key={gt} className="rounded-[18px] bg-[#FDF8F0] border border-[#E8DCC2] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{gameEmojis[gt]}</span>
                        <span className="font-display font-black text-sm text-[#5A3515]">{gameNames[gt]}</span>
                        <span className="text-[10px] font-bold text-[#8C6B45] ml-auto">{sessions.length}x dimainkan</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="font-black text-lg text-[#5A3515]">{best.score}</div>
                          <div className="text-[10px] text-muted-foreground">Skor Terbaik</div>
                        </div>
                        <div>
                          <div className="font-black text-lg text-[#5A3515]">{best.correctCount}</div>
                          <div className="text-[10px] text-muted-foreground">Benar</div>
                        </div>
                        <div>
                          <div className="font-black text-lg text-[#5A3515]">{rank >= 0 ? `#${rank + 1}` : "—"}</div>
                          <div className="text-[10px] text-muted-foreground">Peringkat</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ═══ Battle History ═══ */}
        {(() => {
          const myBattles = (store.battleHistory || []).filter(b =>
            b.players?.some(p => p.profileId === displayProfile.id)
          );
          if (myBattles.length === 0) return null;

          const wins = myBattles.filter(b => b.winner?.profileId === displayProfile.id).length;
          const lastBattle = myBattles[myBattles.length - 1];
          const awards = myBattles.flatMap(b =>
            (b.awards || []).filter(a => a.profileId === displayProfile.id)
          );

          // Battle insights
          const battleInsights: string[] = [];
          if (wins > 0) battleInsights.push(`${displayProfile.name} memenangkan ${wins} dari ${myBattles.length} duel.`);
          const hitungBattles = myBattles.filter(b => b.battleMode === "hitung" || b.battleMode === "campuran");
          if (hitungBattles.length >= 2 && wins / myBattles.length > 0.5) battleInsights.push(`${displayProfile.name} cepat di Hitung Kilat Battle.`);
          const adabBattles = myBattles.filter(b => b.battleMode === "adab" || b.battleMode === "campuran");
          if (adabBattles.length >= 1) battleInsights.push(`${displayProfile.name} perlu latihan Adab Bijak untuk duel berikutnya.`);

          return (
            <div className="rounded-[28px] bg-gradient-to-br from-[#1B3A5C] to-[#0F2847] border-2 border-[#185E9F] p-4 shadow-card text-white">
              <h3 className="font-display font-black text-sm uppercase mb-3 flex items-center gap-2">
                <span>⚔️</span> Battle
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-white/10 rounded-[18px] p-2">
                  <div className="font-black text-xl">{myBattles.length}</div>
                  <div className="text-[8px] uppercase opacity-60">Battle</div>
                </div>
                <div className="text-center bg-white/10 rounded-[18px] p-2">
                  <div className="font-black text-xl">{wins}</div>
                  <div className="text-[8px] uppercase opacity-60">Menang</div>
                </div>
                <div className="text-center bg-white/10 rounded-[18px] p-2">
                  <div className="font-black text-xl">{awards.length}</div>
                  <div className="text-[8px] uppercase opacity-60">Award</div>
                </div>
              </div>
              {lastBattle && (
                <div className="text-[10px] opacity-70 mb-2">
                  Terakhir: {new Date(lastBattle.playedAt).toLocaleDateString("id")} — {lastBattle.battleMode === "campuran" ? "Campuran" : lastBattle.battleMode}
                </div>
              )}
              {battleInsights.length > 0 && (
                <div className="space-y-1">
                  {battleInsights.map((ins, i) => (
                    <div key={i} className="text-xs text-white/70">💡 {ins}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══ Recent Completed Missions ═══ */}
        {recent.length > 0 && (
          <div className="rounded-[28px] bg-white border-2 border-[#D4B483] p-4 shadow-card">
            <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-3">
              📋 Misi Terakhir Diselesaikan
            </h3>
            <div className="space-y-1.5">
              {recent.map(({ mission, stars }) => {
                const cat = CATEGORY_MAP[mission.category];
                const isBoss = mission.isBossMission;
                return (
                  <div
                    key={mission.id}
                    className={`flex items-center gap-3 p-2 rounded-xl ${
                      isBoss
                        ? "bg-gradient-to-r from-[#1a1a2e]/5 to-[#2d1f3d]/10 border border-[#A02020]/20"
                        : "bg-[#FDF8F0]"
                    }`}
                  >
                    <span className="text-lg shrink-0">
                      {isBoss ? "👑" : cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#5A3515] truncate">
                        {mission.title}
                      </div>
                      <div className="text-[10px] font-bold text-[#8C6B45]">
                        #{mission.number} · {cat.short}
                        {isBoss && <span className="ml-1 text-[#A02020]">· BOSS</span>}
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-0.5">
                      {[0, 1, 2].map((s) => (
                        <span
                          key={s}
                          className={s < stars ? "text-[#FFD700] text-sm" : "text-[#D8CFC0] text-sm"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Recommended Next Missions ═══ */}
        {recommended.length > 0 && (
          <div className="rounded-[28px] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#2E8B12]/50 p-4 shadow-card">
            <h3 className="font-display font-black text-sm text-[#2E8B12] uppercase mb-3">
              🚀 Rekomendasi Misi Berikutnya
            </h3>
            <div className="space-y-1.5">
              {recommended.map((m) => {
                const cat = CATEGORY_MAP[m.category];
                const isBoss = m.isBossMission;
                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 p-2 rounded-xl ${
                      isBoss
                        ? "bg-gradient-to-r from-[#1a1a2e]/10 to-[#2d1f3d]/15 border border-[#A02020]/30"
                        : "bg-white/70"
                    }`}
                  >
                    <span className="text-lg shrink-0">
                      {isBoss ? "👑" : cat.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-[#5A3515] truncate">
                        {m.title}
                      </div>
                      <div className="text-[10px] font-bold text-[#8C6B45]">
                        Misi #{m.number} · {cat.short}
                        {isBoss && <span className="ml-1 text-[#A02020]">· BOSS</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs font-black px-2 py-1 rounded-full bg-white border border-[#2E8B12]/40 text-[#2E8B12]">
                      ⭐ {isBoss && m.missionType === "boss_mission"
                        ? Math.round(m.basePoint * ((m as any).bossRewardMultiplier ?? 2))
                        : m.basePoint} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        </>}
        {/* End individual child sections */}

        {/* ═══ Play Time Summary ═══ */}
        <div className="rounded-[28px] bg-white border-2 border-dashed border-[#CBB794] p-4 shadow-card text-center">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="font-display font-black text-sm text-[#5A3515]">Ringkasan Waktu Bermain</div>
          <div className="text-xs font-bold text-[#8C6B45] mt-0.5">
            Total: <span className="text-[#5A3515]">{displayProfile.timePlayedMinutes} menit</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#E8DCC2] overflow-hidden border border-[#D4B483]">
            <div
              className="h-full rounded-full bg-gradient-blue"
              style={{ width: `${Math.min(100, (profile.timePlayedMinutes / 600) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#8C6B45] mt-0.5">
            <span>0</span>
            <span>Target: 10 jam</span>
          </div>
          <p className="text-[10px] font-bold text-[#8C6B45]/60 mt-2">
            📈 Fitur batas waktu &amp; laporan jadwal akan hadir di update berikutnya.
          </p>
        </div>

        {/* ═══ Hadiah Dunia Nyata ═══ */}
        {(() => {
          const rewards = (store.rewardMilestones || []).filter(
            (r) => r.profileId === profile.id && r.isActive
          );
          const nextReward = rewards
            .filter((r) => !r.isUnlocked)
            .sort((a, b) => a.targetLevel - b.targetLevel)[0];
          const readyRewards = rewards.filter((r) => r.isUnlocked && !r.isClaimed);
          return (
            <div className="rounded-[28px] bg-gradient-to-br from-[#FFF9E6] to-[#F5E6B3] border-2 border-[#D48806] p-4 shadow-card">
              <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-2 flex items-center gap-2">
                <span>🎁</span> Pengaturan Hadiah Dunia Nyata
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                <div className="bg-white/60 rounded-[18px] p-2">
                  <div className="font-black text-lg text-[#5A3515]">{rewards.length}</div>
                  <div className="text-[10px] font-bold text-[#8C6B45]">Hadiah Aktif</div>
                </div>
                <div className="bg-white/60 rounded-[18px] p-2">
                  <div className="font-black text-lg text-[#28A745]">{readyRewards.length}</div>
                  <div className="text-[10px] font-bold text-[#8C6B45]">Siap Diberikan</div>
                </div>
              </div>
              {nextReward && (
                <div className="text-xs font-bold text-[#5A3515] mb-2">
                  🎯 Hadiah berikutnya: {nextReward.rewardIcon} {nextReward.rewardTitle} (Level {nextReward.targetLevel})
                </div>
              )}
              <button
                onClick={onManageRewards}
                className="w-full py-2.5 rounded-[18px] bg-gradient-meadow border-2 border-[#2E8B12] text-white font-black text-sm shadow-candy-sm active:translate-y-[2px] transition-all"
              >
                🎁 Atur Hadiah
              </button>
            </div>
          );
        })()}

        {/* ═══ Export & Actions ═══ */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={onExportProfile}
              className="w-full py-3 rounded-[18px] bg-white border-2 border-[#D4B483] text-[#5A3515] font-black text-sm shadow-sm hover:bg-[#F5E6B3] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>📋</span> Ekspor Profil
            </button>
            <button
              onClick={onExportAll}
              className="w-full py-3 rounded-[18px] bg-white border-2 border-[#D4B483] text-[#5A3515] font-black text-sm shadow-sm hover:bg-[#F5E6B3] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>💾</span> Ekspor Semua
            </button>
          </div>
          <button
            className="w-full py-3 rounded-[18px] bg-white border-2 border-dashed border-[#CBB794] text-[#8C6B45] font-black text-sm hover:bg-[#F5E6B3]/50 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            title="Fitur akan datang"
          >
            <span>📄</span> Unduh Laporan Lengkap (Segera)
          </button>
        </div>

      </main>

      <div className="shrink-0 px-4 pb-safe pt-2">
        <div className="max-w-lg mx-auto">
          <GameButton variant="ghost" size="md" full onClick={onBack}>
            🏠 Kembali ke Beranda
          </GameButton>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function StatTile({
  emoji,
  label,
  value,
  tone,
}: {
  emoji: string;
  label: string;
  value: string | number;
  tone: "sun" | "meadow" | "coin" | "berry";
}) {
  const bgMap = {
    sun: "bg-gradient-to-br from-[#FFF9E6] to-[#FFE0A3] border-[#D48806]",
    meadow: "bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-[#2E8B12]",
    coin: "bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] border-[#D48806]",
    berry: "bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD0] border-[#A02020]",
  };
  return (
    <div className={`rounded-[20px] border-2 p-3 text-center shadow-sm ${bgMap[tone]}`}>
      <div className="text-2xl">{emoji}</div>
      <div className="font-display font-black text-xl text-[#5A3515] leading-tight">
        {value}
      </div>
      <div className="text-[10px] uppercase font-bold text-[#8C6B45]">{label}</div>
    </div>
  );
}

function StarPile({ stars, count }: { stars: number; count: number }) {
  const starEmoji = "★";
  return (
    <div className="rounded-[20px] bg-[#FDF8F0] border border-[#E8DCC2] p-3 text-center">
      <div className="flex justify-center gap-0.5 mb-1">
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i} className="text-[#FFD700] text-lg drop-shadow-sm">
            {starEmoji}
          </span>
        ))}
      </div>
      <div className="font-display font-black text-xl text-[#5A3515]">{count}</div>
      <div className="text-[10px] font-bold text-[#8C6B45] uppercase">misi</div>
    </div>
  );
}

function AdabMetric({
  emoji,
  label,
  value,
  sub,
}: {
  emoji: string;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="rounded-[18px] bg-[#FDF8F0] border border-[#E8DCC2] p-3">
      <div className="text-xl mb-0.5">{emoji}</div>
      <div className="font-display font-black text-lg text-[#5A3515] leading-tight">
        {value}
      </div>
      <div className="text-[11px] font-bold text-[#5A3515] leading-tight">{label}</div>
      <div className="text-[10px] font-bold text-[#8C6B45] mt-0.5">{sub}</div>
    </div>
  );
}
