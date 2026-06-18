import { useState, useEffect, useMemo } from "react";
import type { Profile, DailyAdabChecklistItem } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════
// Adab Checklist items per difficulty
// ═══════════════════════════════════════════

const CHECKLIST_POOL: DailyAdabChecklistItem[] = [
  { id: "bantu-ortu", title: "Membantu Ibu/Ayah", description: "Bantu pekerjaan rumah hari ini (menyapu, mencuci piring, dll).", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "salam", title: "Mengucapkan Salam", description: "Ucapkan salam saat masuk rumah atau bertemu keluarga.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "rapikan-tidur", title: "Merapikan Tempat Tidur", description: "Rapikan tempat tidur setelah bangun pagi.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "bantu-teman", title: "Membantu Teman/Adik", description: "Bantu teman atau adik yang kesulitan hari ini.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "terima-kasih", title: "Mengucapkan Terima Kasih", description: "Ucapkan terima kasih pada orang yang membantu.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "minta-maaf", title: "Meminta Maaf Jika Salah", description: "Berani minta maaf jika melakukan kesalahan.", requiresParentVerification: true, isChecked: false, isVerified: false },
  { id: "baca-buku", title: "Membaca Buku 10 Menit", description: "Baca buku atau Al-Qur'an minimal 10 menit.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "jaga-lisan", title: "Menjaga Lisan", description: "Tidak berkata kasar, bohong, atau menyakiti hari ini.", requiresParentVerification: true, isChecked: false, isVerified: false },
  { id: "berbagi", title: "Berbagi dengan Saudara", description: "Berbagi makanan, mainan, atau cerita dengan saudara.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "taruh-barang", title: "Menaruh Barang pada Tempatnya", description: "Kembalikan mainan/buku ke tempatnya setelah dipakai.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "sholat", title: "Sholat Tepat Waktu", description: "Sholat 5 waktu tanpa disuruh.", requiresParentVerification: true, isChecked: false, isVerified: false },
  { id: "doa", title: "Berdoa Sebelum & Sesudah", description: "Baca doa sebelum dan sesudah makan/belajar.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "senyum", title: "Tersenyum & Ramah", description: "Tersenyum dan bersikap ramah pada keluarga.", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "antri", title: "Mengantri dengan Sabar", description: "Mengantri dengan tertib (di rumah, sekolah, tempat umum).", requiresParentVerification: false, isChecked: false, isVerified: false },
  { id: "hemat", title: "Hemat Air & Listrik", description: "Matikan lampu/air jika tidak digunakan.", requiresParentVerification: false, isChecked: false, isVerified: false },
];

interface Props {
  profile: Profile;
  onBack: () => void;
  onPlayMission: () => void;
  onPlayMiniGame: () => void;
}

export function DailyMissionsScreen({ profile, onBack }: Props) {
  const { updateProfile } = useGameStore();
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Generate checklist for today if needed
  const checklist = useMemo(() => {
    if (!dateStr) return null;

    const existing = profile.dailyAdabChecklist;
    if (existing && existing.date === dateStr) return existing;

    // Generate 4-5 random items for today (Fisher-Yates)
    const pool = [...CHECKLIST_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const itemCount = profile.difficulty === "tk" ? 3 : profile.difficulty === "sd-bawah" ? 4 : 5;
    const items = pool.slice(0, itemCount).map(item => ({
      ...item,
      isChecked: false,
      isVerified: false,
    }));

    return {
      id: crypto.randomUUID(),
      profileId: profile.id,
      date: dateStr,
      items,
      completedCount: 0,
      verifiedCount: 0,
      rewardClaimed: false,
      streak: existing?.streak || 0,
    };
  }, [dateStr, profile.dailyAdabChecklist, profile.id, profile.difficulty]);

  // Persist new checklist
  useEffect(() => {
    if (checklist && checklist.date === dateStr && !profile.dailyAdabChecklist?.date?.startsWith(dateStr)) {
      updateProfile(profile.id, { dailyAdabChecklist: checklist });
    }
  }, [checklist]);

  const currentChecklist = profile.dailyAdabChecklist;
  const items = currentChecklist?.items || [];
  const completedCount = items.filter(i => i.isChecked).length;
  const verifiedCount = items.filter(i => i.isVerified).length;

  const toggleItem = (itemId: string) => {
    if (!currentChecklist) return;
    const newItems = currentChecklist.items.map(i =>
      i.id === itemId ? { ...i, isChecked: !i.isChecked, checkedAt: !i.isChecked ? new Date().toISOString() : undefined } : i
    );
    updateProfile(profile.id, {
      dailyAdabChecklist: {
        ...currentChecklist,
        items: newItems,
        completedCount: newItems.filter(i => i.isChecked).length,
      },
    });
  };

  const claimReward = () => {
    if (!currentChecklist || currentChecklist.rewardClaimed || completedCount < items.length) return;
    const xpGain = 30 + (verifiedCount * 10);
    updateProfile(profile.id, {
      xp: profile.xp + xpGain,
      points: profile.points + 20,
      dailyAdabChecklist: {
        ...currentChecklist,
        rewardClaimed: true,
        streak: currentChecklist.streak + 1,
      },
    });
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#FFF8E1] to-[#FFE0B2] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-12 w-12 rounded-[18px] bg-white/60 border-2 border-[#FF9800]/30 text-[#E65100] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            Misi Harian Adab
          </h1>
          <p className="text-xs sm:text-sm text-[#8C6B45] truncate">
            Checklist kebaikan hari ini ✨
          </p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">☀️</div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-4 pb-6">
        {/* Progress Card */}
        <GameCard tone="coin" className="text-white border-[#E65100]/50 bg-gradient-to-br from-[#FF9800] to-[#F57C00]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-bold opacity-80 uppercase">Progres Hari Ini</div>
              <div className="font-display font-black text-2xl">
                {completedCount} / {items.length} Selesai
              </div>
              {verifiedCount > 0 && (
                <div className="text-xs font-bold opacity-80 mt-0.5">
                  ✅ {verifiedCount} diverifikasi orang tua
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-sm font-bold">{currentChecklist?.streak || 0} Hari Beruntun</div>
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full bg-[#FFD54F] transition-all duration-500"
              style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </GameCard>

        {/* Checklist Items */}
        <div>
          <h2 className="font-display font-black text-lg text-[#5A3515] mb-3 flex items-center gap-2">
            <span>📋</span> Checklist Hari Ini
          </h2>
          <div className="space-y-2.5">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "w-full rounded-[20px] p-3.5 text-left border-2 transition-all active:translate-y-[2px]",
                  item.isChecked
                    ? "bg-[#E8F5E9] border-[#4CAF50] shadow-sm"
                    : "bg-white/80 border-[#D4B483] hover:border-[#FF9800]",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-7 w-7 rounded-full border-2 grid place-items-center shrink-0 mt-0.5 transition-all",
                    item.isChecked
                      ? "bg-[#4CAF50] border-[#4CAF50] text-white"
                      : "bg-white border-[#CBB794]"
                  )}>
                    {item.isChecked ? "✓" : ""}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-bold text-sm",
                      item.isChecked ? "text-[#2E7D32]" : "text-[#5A3515]"
                    )}>
                      {item.title}
                    </div>
                    <div className="text-[11px] font-semibold text-[#8C6B45] mt-0.5">
                      {item.description}
                    </div>
                    {item.requiresParentVerification && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {item.isVerified ? (
                          <span className="text-[10px] font-bold text-[#4CAF50] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                            ✅ Diverifikasi Orang Tua
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#FF9800] bg-[#FFF3E0] px-2 py-0.5 rounded-full">
                            ⏳ Menunggu Konfirmasi Orang Tua
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {item.isChecked && (
                    <div className="text-xl shrink-0 self-center">{item.isVerified ? "🌟" : "⭐"}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reward Section */}
        <div className="pt-2">
          <h2 className="font-display font-black text-lg text-[#5A3515] mb-2">Hadiah Harian</h2>
          <GameCard tone={completedCount === items.length && !currentChecklist?.rewardClaimed ? "coin" : "cream"} className="overflow-hidden">
            <div className="min-w-0">
              <div className="font-bold text-[#5A3515] mb-1">
                {currentChecklist?.rewardClaimed
                  ? "✅ Hadiah Sudah Diklaim"
                  : completedCount === items.length
                    ? "🎉 Semua checklist selesai!"
                    : `Selesaikan ${items.length - completedCount} checklist lagi`}
              </div>
              <div className="text-sm font-bold text-[#8C6B45] mb-3">
                +{30 + (verifiedCount * 10)} XP, +20 Poin
                {verifiedCount > 0 && <span className="text-[#4CAF50]"> (+bonus verifikasi)</span>}
              </div>
              <button
                disabled={completedCount < items.length || currentChecklist?.rewardClaimed}
                onClick={claimReward}
                className={cn(
                  "w-full py-2.5 rounded-[18px] font-black text-sm transition-all",
                  completedCount === items.length && !currentChecklist?.rewardClaimed
                    ? "bg-gradient-meadow border-b-4 border-[#2E7D32] text-white active:translate-y-[2px] active:border-b-0"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                🎁 Klaim Hadiah
              </button>
            </div>
          </GameCard>

          {/* Parent note */}
          <div className="mt-3 bg-[#FFF3E0] rounded-[18px] p-3 border border-[#FF9800]/20">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">👨‍👩‍👧</span>
              <div>
                <div className="text-xs font-black text-[#E65100] uppercase">Untuk Orang Tua</div>
                <p className="text-[11px] font-bold text-[#8C6B45] mt-0.5 leading-relaxed">
                  Beberapa checklist perlu verifikasi orang tua. Buka <strong>Dashboard Orang Tua</strong> untuk memverifikasi dan memberi semangat pada ananda!
                </p>
              </div>
            </div>
          </div>
        </div>
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
