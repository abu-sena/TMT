import { ArrowLeft as TmtBackGlyph } from "lucide-react";
import { useMemo } from "react";
import type { Profile, RewardMilestone, RewardStatus } from "@/types";
import { useGameStore } from "@/lib/storage";
import { GameButton } from "../game/GameButton";

interface Props {
  profile: Profile;
  onBack: () => void;
}

function getStatus(reward: RewardMilestone): RewardStatus {
  if (!reward.isActive) return "nonaktif";
  if (reward.isClaimed) return "sudah_diberikan";
  if (reward.isUnlocked) return "siap_diberikan";
  return "menunggu";
}

export function MyRewardsScreen({ profile, onBack }: Props) {
  const { store } = useGameStore();
  const rewards = (store.rewardMilestones || []).filter(
    (r) => r.profileId === profile.id
  );

  const sorted = useMemo(
    () =>
      [...rewards].sort((a, b) => {
        // Unlocked first, then by targetLevel
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        return a.targetLevel - b.targetLevel;
      }),
    [rewards]
  );

  const nextReward = sorted.find((r) => r.isActive && !r.isUnlocked);
  const readyRewards = sorted.filter((r) => r.isActive && r.isUnlocked && !r.isClaimed);
  const claimedRewards = sorted.filter((r) => r.isClaimed);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button type="button"
          onClick={onBack}
          className="tmt-icon-button h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          <TmtBackGlyph aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            Hadiahku
          </h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80">Hadiah dunia nyata dari orang tua</p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">🎁</div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-4 pb-6">
        {rewards.length === 0 ? (
          /* No rewards at all */
          <div className="rounded-[28px] bg-white/80 border-2 border-dashed border-[#CBB794] p-8 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">
              Belum Ada Hadiah
            </h2>
            <p className="text-sm font-bold text-[#8C6B45] leading-relaxed">
              Orang tua bisa menambahkan hadiah dunia nyata dari Halaman Orang Tua.
            </p>
            <p className="text-xs text-[#8C6B45]/60 mt-2">
              Setiap kali kamu mencapai level tertentu, hadiah akan terbuka!
            </p>
          </div>
        ) : (
          <>
            {/* Next reward - upcoming */}
            {nextReward && (
              <div className="rounded-[28px] bg-gradient-to-br from-[#FFF9E6] to-[#FFE0A3] border-2 border-[#D48806] p-5 shadow-card text-center">
                <div className="text-5xl mb-2">{nextReward.rewardIcon}</div>
                <h2 className="font-display font-black text-lg text-[#5A3515]">
                  Hadiah Berikutnya
                </h2>
                <div className="font-display font-black text-2xl text-[#D48806] mt-1">
                  {nextReward.rewardTitle}
                </div>
                <p className="text-sm font-bold text-[#8C6B45] mt-1">
                  Terbuka di Level {nextReward.targetLevel}
                </p>
                <div className="mt-3 bg-white/60 rounded-[18px] p-3">
                  <div className="text-xs font-bold text-[#8C6B45] mb-1">
                    Progress Level
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-black text-[#5A3515]">
                      Lv. {profile.level}
                    </div>
                    <div className="flex-1 h-3 rounded-full bg-white border border-[#D48806]/30 overflow-hidden">
                      <div
                        className="h-full bg-gradient-meadow transition-all rounded-full"
                        style={{
                          width: `${Math.min(100, (profile.level / nextReward.targetLevel) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-sm font-black text-[#D48806]">
                      Lv. {nextReward.targetLevel}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-[#2E8B12] mt-2">
                    {nextReward.targetLevel - profile.level > 0
                      ? `Kurang ${nextReward.targetLevel - profile.level} level lagi! 💪`
                      : "Hadiah siap dibuka! 🎉"}
                  </p>
                </div>
              </div>
            )}

            {/* Ready to claim */}
            {readyRewards.length > 0 && (
              <div>
                <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-2 flex items-center gap-2">
                  <span>🌟</span> Hadiah Sudah Terbuka!
                </h3>
                <div className="space-y-2">
                  {readyRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="rounded-[28px] bg-gradient-to-br from-[#D4EDDA] to-[#C3E6CB] border-2 border-[#28A745] p-4 shadow-card animate-pulse-glow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-14 w-14 rounded-[18px] grid place-items-center text-3xl shrink-0 border-2 border-[#28A745]"
                          style={{ backgroundColor: reward.rewardColor || "#FFF" }}
                        >
                          {reward.rewardIcon}
                        </div>
                        <div>
                          <div className="font-display font-black text-lg text-[#155724]">
                            {reward.rewardTitle}
                          </div>
                          <div className="text-xs font-bold text-[#28A745]">
                            Terbuka di Level {reward.targetLevel}
                          </div>
                          {reward.rewardDescription && (
                            <div className="text-xs text-[#155724]/70 mt-0.5">
                              {reward.rewardDescription}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 bg-white/60 rounded-[18px] p-3 text-center">
                        <p className="text-sm font-bold text-[#155724]">
                          🎉 Tunjukkan ini ke orang tua untuk mendapatkan hadiah dunia nyata!
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {sorted.filter((r) => r.isActive && !r.isUnlocked && r !== nextReward).length > 0 && (
              <div>
                <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-2">
                  📅 Hadiah Mendatang
                </h3>
                <div className="space-y-2">
                  {sorted
                    .filter((r) => r.isActive && !r.isUnlocked && r !== nextReward)
                    .map((reward) => (
                      <div
                        key={reward.id}
                        className="rounded-[28px] bg-white/80 border-2 border-[#CBB794]/50 p-3 flex items-center gap-3"
                      >
                        <div className="text-3xl">{reward.rewardIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-black text-sm text-[#5A3515] truncate">
                            {reward.rewardTitle}
                          </div>
                          <div className="text-xs font-bold text-[#8C6B45]">
                            Level {reward.targetLevel}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-[#8C6B45]/50">
                          {Math.max(0, reward.targetLevel - profile.level)} level lagi
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Claimed rewards */}
            {claimedRewards.length > 0 && (
              <div>
                <h3 className="font-display font-black text-sm text-[#5A3515] uppercase mb-2">
                  ✅ Hadiah Diterima
                </h3>
                <div className="space-y-1.5">
                  {claimedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="rounded-[28px] bg-white/60 border border-[#E8DCC2] p-3 flex items-center gap-3 opacity-70"
                    >
                      <div className="text-3xl grayscale">{reward.rewardIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-black text-sm text-[#5A3515] truncate">
                          {reward.rewardTitle}
                        </div>
                        <div className="text-[10px] font-bold text-[#8C6B45]">
                          Level {reward.targetLevel} · Diterima{" "}
                          {reward.claimedAt
                            ? new Date(reward.claimedAt).toLocaleDateString("id")
                            : ""}
                        </div>
                      </div>
                      <div className="text-lg">✅</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <div className="shrink-0 content-wrapper pb-safe pt-2">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          🏠 Kembali ke Beranda
        </GameButton>
      </div>
    </div>
  );
}
