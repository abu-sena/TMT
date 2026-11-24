import { useState, useMemo, useCallback } from "react";
import type { Profile, DailyMissionAssignment, DailyMissionAssignmentStatus } from "@/types";
import { DAILY_MISSION_CATEGORY_META } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameNotice } from "@/components/layout/GameNotice";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  getTodaySummary,
  checkInAssignment,
  getStreak,
  sortDailyMissionAssignments,
} from "@/lib/dailyMissions";

// ═══════════════════════════════════════════
// Status badge config
// ═══════════════════════════════════════════

const STATUS_BADGE: Record<
  DailyMissionAssignmentStatus,
  { emoji: string; label: string; bgClass: string; textClass: string }
> = {
  not_started: {
    emoji: "📌",
    label: "Belum Dilakukan",
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
  },
  checked_by_child: {
    emoji: "⏳",
    label: "Menunggu Validasi",
    bgClass: "bg-[#FFF3E0]",
    textClass: "text-[#FF9800]",
  },
  pending_parent_validation: {
    emoji: "⏳",
    label: "Menunggu Validasi",
    bgClass: "bg-[#FFF3E0]",
    textClass: "text-[#FF9800]",
  },
  approved_by_parent: {
    emoji: "✅",
    label: "Disetujui",
    bgClass: "bg-[#E8F5E9]",
    textClass: "text-[#4CAF50]",
  },
  rejected_by_parent: {
    emoji: "🔄",
    label: "Perlu Diulang",
    bgClass: "bg-[#FFEBEE]",
    textClass: "text-[#E53935]",
  },
};

// ═══════════════════════════════════════════
// Section config for child view
// ═══════════════════════════════════════════
type ChildSection =
  | "not_started"
  | "rejected"
  | "pending"
  | "approved";

const SECTION_META: Record<
  ChildSection,
  { emoji: string; label: string; emptyEmoji: string; emptyText: string; emptySub?: string }
> = {
  not_started: {
    emoji: "📋",
    label: "Belum Dilakukan",
    emptyEmoji: "🎉",
    emptyText: "Semua misi sudah dicentang!",
    emptySub: "Tunggu orang tua memvalidasi ya.",
  },
  rejected: {
    emoji: "🔄",
    label: "Perlu Diulang",
    emptyEmoji: "👍",
    emptyText: "Tidak ada misi yang perlu diulang.",
  },
  pending: {
    emoji: "⏳",
    label: "Menunggu Validasi",
    emptyEmoji: "📭",
    emptyText: "Tidak ada misi yang menunggu validasi.",
  },
  approved: {
    emoji: "✅",
    label: "Disetujui",
    emptyEmoji: "⭐",
    emptyText: "Belum ada misi yang disetujui hari ini.",
  },
};

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function DailyMissionsScreen({ profile: initialProfile, onBack }: Props) {
  const { store, updateProfile } = useGameStore();
  const profile = store.profiles.find(p => p.id === initialProfile.id) || initialProfile;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [animateItemId, setAnimateItemId] = useState<string | null>(null);

  const summary = useMemo(() => getTodaySummary(profile), [profile]);
  const streak = useMemo(() => getStreak(profile), [profile]);

  // Sort assignments for child view
  const sortedAssignments = useMemo(
    () => sortDailyMissionAssignments(summary.assignments),
    [summary.assignments]
  );

  // Group by section
  const sections = useMemo(() => {
    const groups: Record<ChildSection, DailyMissionAssignment[]> = {
      not_started: [],
      rejected: [],
      pending: [],
      approved: [],
    };
    for (const a of sortedAssignments) {
      if (a.status === "not_started") groups.not_started.push(a);
      else if (a.status === "rejected_by_parent") groups.rejected.push(a);
      else if (a.status === "pending_parent_validation" || a.status === "checked_by_child")
        groups.pending.push(a);
      else if (a.status === "approved_by_parent") groups.approved.push(a);
    }
    return groups;
  }, [sortedAssignments]);

  // Show toast helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Handle child check-in with animation
  const handleCheckIn = useCallback(
    (assignmentId: string) => {
      if (submittingId) return; // anti-double-click
      setSubmittingId(assignmentId);

      // Brief delay to show "Mengirim..." state
      setTimeout(() => {
        const result = checkInAssignment(profile, assignmentId);
        if (!result) {
          setSubmittingId(null);
          return;
        }
        updateProfile(profile.id, result);
        setAnimateItemId(assignmentId);
        showToast("Misi dikirim ke orang tua untuk diperiksa.");
        setSubmittingId(null);

        // Clear animation flag after transition
        setTimeout(() => setAnimateItemId(null), 600);
      }, 400);
    },
    [profile, submittingId, updateProfile, showToast]
  );

  // Handle child re-check after rejection
  const handleRecheck = useCallback(
    (assignmentId: string) => {
      if (submittingId) return;
      setSubmittingId(assignmentId);

      setTimeout(() => {
        const result = checkInAssignment(profile, assignmentId);
        if (!result) {
          setSubmittingId(null);
          return;
        }
        updateProfile(profile.id, result);
        setAnimateItemId(assignmentId);
        showToast("Misi dikirim ulang ke orang tua.");
        setSubmittingId(null);

        setTimeout(() => setAnimateItemId(null), 600);
      }, 400);
    },
    [profile, submittingId, updateProfile, showToast]
  );

  const isEmpty = summary.total === 0;
  const allApproved =
    summary.total > 0 &&
    summary.notStarted === 0 &&
    summary.pending === 0 &&
    summary.rejected === 0;

  // Render a single assignment card
  const renderAssignmentCard = (item: DailyMissionAssignment) => {
    const badge = STATUS_BADGE[item.status] || STATUS_BADGE.not_started;
    const catMeta = DAILY_MISSION_CATEGORY_META[item.category];
    const isPending =
      item.status === "pending_parent_validation" || item.status === "checked_by_child";
    const isApproved = item.status === "approved_by_parent";
    const isRejected = item.status === "rejected_by_parent";
    const isNotStarted = item.status === "not_started";
    const isSubmitting = submittingId === item.id;
    const isAnimating = animateItemId === item.id;

    const cardBg = isApproved
      ? "bg-[#E8F5E9] border-[#4CAF50]"
      : isRejected
        ? "bg-[#FFEBEE] border-[#E53935]"
        : isPending
          ? "bg-[#FFF8E1] border-[#FF9800]"
          : "bg-white/80 border-[#D4B483]";

    return (
      <div
        key={item.id}
        className={cn(
          "w-full rounded-[20px] p-3.5 text-left border-2 transition-all duration-300",
          cardBg,
          isAnimating && "animate-pop-in scale-[0.98] shadow-md",
          "hover:shadow-sm"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div
            className={cn(
              "h-10 w-10 rounded-full grid place-items-center shrink-0 mt-0.5 text-lg transition-colors duration-300",
              isApproved
                ? "bg-[#4CAF50]/20"
                : isRejected
                  ? "bg-[#E53935]/15"
                  : isPending
                    ? "bg-[#FF9800]/20"
                    : "bg-[#E3F2FD]"
            )}
          >
            {catMeta?.emoji || "✨"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "font-bold text-sm",
                  isApproved
                    ? "text-[#2E7D32]"
                    : isRejected
                      ? "text-[#C62828]"
                      : isPending
                        ? "text-[#E65100]"
                        : "text-[#5A3515]"
                )}
              >
                {item.title}
              </span>
              <span className="text-[10px] font-black bg-[#FFD54F]/30 text-[#E65100] px-1.5 py-0.5 rounded-full">
                +{item.points} pts
              </span>
            </div>
            {item.description && (
              <div className="text-[11px] font-semibold text-[#8C6B45] mt-0.5 line-clamp-2">
                {item.description}
              </div>
            )}

            {/* Status badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full",
                badge.bgClass,
                badge.textClass
              )}
            >
              <span>{badge.emoji}</span>
              <span>{badge.label}</span>
            </div>

            {/* Subtle hint for pending */}
            {isPending && (
              <p className="text-[10px] text-[#E65100]/70 mt-1 italic">
                Menunggu orang tua memeriksa.
              </p>
            )}

            {/* Approved points */}
            {isApproved && item.pointsAwarded > 0 && (
              <p className="text-[11px] font-bold text-[#2E7D32] mt-1">
                🎉 +{item.pointsAwarded} poin didapat
              </p>
            )}

            {/* Parent note if rejected */}
            {isRejected && item.parentNote && (
              <div className="mt-1.5 text-[10px] font-semibold text-[#C62828] italic bg-[#FFEBEE] p-1.5 rounded-lg border border-[#E53935]/20">
                💬 Catatan: {item.parentNote}
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-2.5">
          {isNotStarted && (
            <button type="button"
              onClick={() => handleCheckIn(item.id)}
              disabled={isSubmitting}
              className={cn("tmt-choice-button",
                "w-full py-2.5 rounded-xl font-black text-sm transition-all duration-200",
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-wait"
                  : "bg-gradient-to-r from-[#4CAF50] to-[#2E8B12] border-b-3 border-[#1B5E20] text-white active:translate-y-0.5 active:border-b-0"
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  Mengirim…
                </span>
              ) : (
                "✅ Saya sudah melakukan"
              )}
            </button>
          )}

          {isPending && (
            <button type="button"
              disabled
              className="tmt-choice-button w-full py-2.5 rounded-xl bg-[#FFF3E0] border border-[#FF9800]/30 text-[#E65100]/70 font-bold text-sm cursor-not-allowed"
            >
              ⏳ Menunggu Validasi Orang Tua
            </button>
          )}

          {isApproved && (
            <div className="w-full py-2.5 rounded-xl bg-[#E8F5E9] border border-[#4CAF50]/30 text-[#2E7D32] font-bold text-sm text-center cursor-default">
              ✅ Disetujui · +{item.pointsAwarded} poin
            </div>
          )}

          {isRejected && (
            <button type="button"
              onClick={() => handleRecheck(item.id)}
              disabled={isSubmitting}
              className={cn("tmt-choice-button",
                "w-full py-2.5 rounded-xl font-black text-sm transition-all duration-200",
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-wait"
                  : "bg-gradient-to-r from-[#FF9800] to-[#F57C00] border-b-3 border-[#E65100] text-white active:translate-y-0.5 active:border-b-0"
              )}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  Mengirim…
                </span>
              ) : (
                "🔄 Saya sudah mengulang"
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render a section
  const renderSection = (key: ChildSection, items: DailyMissionAssignment[]) => {
    const meta = SECTION_META[key];
    if (items.length === 0) {
      // Hide empty "approved" section unless everything is done
      if (key === "approved" && !allApproved) return null;
      if (key === "pending" || key === "rejected") return null;
      // For not_started when empty but total > 0, show a friendly empty
      if (key === "not_started" && summary.total > 0) {
        return (
          <div className="mb-3">
            <h3 className="font-display font-black text-sm text-[#5A3515] mb-2 flex items-center gap-2">
              <span>{meta.emoji}</span> {meta.label}
            </h3>
            <div className="rounded-[18px] bg-[#FDF8F0] border-2 border-dashed border-[#D4B483] p-4 text-center">
              <div className="text-3xl mb-1">{meta.emptyEmoji}</div>
              <p className="text-xs font-bold text-[#8C6B45]">{meta.emptyText}</p>
              {meta.emptySub && (
                <p className="text-[10px] text-[#8C6B45]/70 mt-0.5">{meta.emptySub}</p>
              )}
            </div>
          </div>
        );
      }
      return null;
    }

    return (
      <div className="mb-3" key={key}>
        <h3 className="font-display font-black text-sm text-[#5A3515] mb-2 flex items-center gap-2">
          <span>{meta.emoji}</span> {meta.label}
          <span className="text-[10px] font-bold text-[#8C6B45] bg-white/60 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </h3>
        <div className="space-y-2.5">
          {items.map(renderAssignmentCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="field-shell">
      {/* Header */}
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button type="button"
          onClick={onBack}
          className="field-back shrink-0"
          aria-label="Kembali"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl">
            Misi Harian
          </h1>
          <p className="text-xs sm:text-sm text-[#49625a]">
            Centang misi yang sudah kamu lakukan hari ini.
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain content-wrapper space-y-4 pb-6">
        {/* Toast message */}
        {toastMessage && (
          <GameNotice tone="success" onClose={() => setToastMessage(null)}>{toastMessage}</GameNotice>
        )}

        {/* Empty state - absolutely no missions */}
        {isEmpty && (
          <GameCard tone="cream" className="text-center py-8">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-display font-black text-lg text-[#5A3515] mb-2">
              Belum ada Misi Harian
            </h2>
            <p className="text-sm font-bold text-[#8C6B45]">
              Belum ada Misi Harian dari orang tua.
            </p>
          </GameCard>
        )}

        {!isEmpty && (
          <>
            {/* ═══ Progress Summary ═══ */}
            <GameCard
              tone="cream"
              className="field-daily-summary"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold opacity-80 uppercase tracking-wide">
                    Misi Hari Ini
                  </div>
                  <div className="font-display font-black text-xl mt-0.5">
                    {summary.approved} dari {summary.total} Disetujui
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl">🔥</div>
                  <div className="text-xs font-bold">{streak.currentStreak} Hari Beruntun</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-3 rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full bg-[#FFD54F] transition-all duration-700 ease-out"
                  style={{
                    width: `${summary.total > 0 ? (summary.approved / summary.total) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Quick stats row */}
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <div className="bg-white/15 rounded-xl p-2 text-center">
                  <div className="text-lg">⏳</div>
                  <div className="font-black text-sm">{summary.pending}</div>
                  <div className="text-[9px] font-bold opacity-70">Menunggu</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2 text-center">
                  <div className="text-lg">🔄</div>
                  <div className="font-black text-sm">{summary.rejected}</div>
                  <div className="text-[9px] font-bold opacity-70">Diulang</div>
                </div>
                <div className="bg-white/15 rounded-xl p-2 text-center">
                  <div className="text-lg">⭐</div>
                  <div className="font-black text-sm">+{summary.totalPointsEarned}</div>
                  <div className="text-[9px] font-bold opacity-70">Poin</div>
                </div>
              </div>

              {summary.totalPointsPending > 0 && (
                <div className="mt-1.5 text-[10px] font-bold opacity-70 text-center">
                  💎 {summary.totalPointsPending} poin menunggu validasi
                </div>
              )}
            </GameCard>

            {/* ═══ Sections ═══ */}
            {renderSection("not_started", sections.not_started)}
            {renderSection("rejected", sections.rejected)}
            {renderSection("pending", sections.pending)}
            {renderSection("approved", sections.approved)}

            {/* ═══ All Done Celebration ═══ */}
            {allApproved && (
              <GameCard
                tone="meadow"
                className="text-center border-[#2E8B12] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]"
              >
                <div className="text-4xl mb-2 animate-bounce-in">🎉</div>
                <h3 className="font-display font-black text-lg text-[#2E8B12]">
                  MasyaAllah! Semua misi hari ini sudah disetujui.
                </h3>
                <p className="text-sm font-bold text-[#4CAF50] mt-1">
                  Hebat! Orang tua sudah memvalidasi semua misimu.
                </p>
                {summary.bonusEarned > 0 && (
                  <p className="text-xs font-bold text-[#D48806] mt-1.5">
                    🎁 Bonus selesai semua: +{summary.bonusEarned} poin
                  </p>
                )}
              </GameCard>
            )}

            {/* Streak info */}
            {streak.currentStreak >= 3 && (
              <div className="rounded-[18px] bg-[#FFF8E1] border-2 border-[#FFD54F] p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div className="text-xs font-bold text-[#E65100]">
                    Streak {streak.currentStreak} hari!
                    {streak.currentStreak >= 30 && " 🏆 Lencana Istiqamah 30 Hari!"}
                    {streak.currentStreak >= 7 &&
                      streak.currentStreak < 30 &&
                      " ⭐ Lencana Konsisten 7 Hari!"}
                    {streak.currentStreak >= 3 &&
                      streak.currentStreak < 7 &&
                      " Teruskan semangatmu!"}
                  </div>
                </div>
              </div>
            )}

            {/* Parent note */}
            <div className="rounded-[18px] bg-[#FFF3E0] border-2 border-[#FF9800]/20 p-3">
              <div className="flex items-start gap-2">
                <span className="text-xl shrink-0">👨‍👩‍👧</span>
                <div>
                  <div className="text-xs font-black text-[#E65100] uppercase">Untuk Kamu</div>
                  <p className="text-[11px] font-bold text-[#8C6B45] mt-0.5 leading-relaxed">
                    Setelah kamu mencentang misi, orang tua akan memvalidasi di Dashboard Orang
                    Tua. Poin akan masuk setelah disetujui!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom */}
      <div className="shrink-0 content-wrapper pb-safe pt-2 bg-white/40 backdrop-blur-sm border-t border-[#FF9800]/20">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          🏠 Kembali ke Beranda
        </GameButton>
      </div>
    </div>
  );
}
