import { useEffect, useMemo, useState, useRef } from "react";
import { Sprout, Star } from "lucide-react";
import type { BadgeDef, Mission } from "@/types";
import { GameButton } from "../game/GameButton";
import { RewardStars } from "../game/RewardStars";
import { GameCelebrationDialog } from "@/components/rewards/GameCelebrationDialog";
import { VictoryDialog } from "@/components/rewards/VictoryDialog";

interface BossStepResult {
  stepId: string;
  selectedId: string;
  isCorrect: boolean;
  attempts: number;
  hintsUsed: number;
}

interface Props {
  mission: Mission;
  isCorrect: boolean;
  stars: number;
  finalPoint: number;
  xpGain: number;
  leveledUp: boolean;
  newBadges: BadgeDef[];
  breakdown: any;
  bossStepResults?: BossStepResult[];
  isFirstCompletion: boolean;
  isStage500?: boolean;
  stage500Difficulty?: string;
  hasPendingFinalReward?: boolean;
  hasClaimedFinalReward?: boolean;
  nextDifficulty?: string | null;
  isUniversitas?: boolean;
  onOpenRewardBox?: () => void;
  onCelebrationsComplete?: () => void;
  onNextMission: () => void;
  onBackToMap: () => void;
}

export function ResultScreen({
  mission,
  isCorrect,
  stars,
  finalPoint,
  xpGain,
  leveledUp,
  newBadges,
  breakdown,
  bossStepResults,
  isFirstCompletion,
  isStage500,
  stage500Difficulty,
  hasPendingFinalReward,
  hasClaimedFinalReward,
  nextDifficulty,
  isUniversitas,
  onOpenRewardBox,
  onCelebrationsComplete,
  onNextMission,
  onBackToMap,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(isCorrect);
  const [celebrationIndex, setCelebrationIndex] = useState(0);
  const celebrations = [
    ...(isCorrect ? ["victory" as const] : []),
    ...(leveledUp ? ["level" as const] : []),
    ...(newBadges.length > 0 ? ["medal" as const] : []),
  ];
  const celebration = celebrations[celebrationIndex];
  const nextCelebration = () => {
    setCelebrationIndex(celebrationIndex + 1);
    if (celebrationIndex + 1 === celebrations.length) onCelebrationsComplete?.();
  };

  // ── Gift Box State ──
  // Show gift box only on first-time completion with 3 stars (not boss)
  const showGiftBox = isFirstCompletion && isCorrect && stars === 3 && (mission as any).isBossMission !== true;
  const [isGiftOpened, setIsGiftOpened] = useState(false);
  const [isGiftAnimating, setIsGiftAnimating] = useState(false);
  const [giftRewardsRevealed, setGiftRewardsRevealed] = useState(false);
  const hasClaimedGift = useRef(false);

  // Show continue button after delay if gift not opened
  const [showContinueAnyway, setShowContinueAnyway] = useState(false);

  useEffect(() => {
    if (showGiftBox && !isGiftOpened && !celebration) {
      const t = setTimeout(() => setShowContinueAnyway(true), 8000);
      return () => clearTimeout(t);
    }
  }, [showGiftBox, isGiftOpened, celebration]);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  // Handle gift box tap/click
  const handleGiftTap = () => {
    if (isGiftAnimating || hasClaimedGift.current) return;
    setIsGiftAnimating(true);

    // Play open animation then reveal rewards
    setTimeout(() => {
      setIsGiftOpened(true);
      hasClaimedGift.current = true;
      setIsGiftAnimating(false);
      setGiftRewardsRevealed(true);
    }, 800);
  };

  // Compute gift rewards
  const giftRewards = useMemo(() => {
    if (!showGiftBox) return [];
    const rewards: Array<{ emoji: string; label: string; value: string }> = [];

    // Always show XP and points
    rewards.push({ emoji: "⚡", label: "XP", value: `+${xpGain}` });
    rewards.push({ emoji: "⭐", label: "Poin", value: `+${finalPoint}` });
    rewards.push({ emoji: "🪙", label: "Koin", value: `+${isCorrect ? 5 : 0}` });

    if (stars === 3) {
      rewards.push({ emoji: "🌟", label: "3 Bintang", value: "Sempurna!" });
    }

    if (newBadges.length > 0) {
      rewards.push({ emoji: "🏅", label: "Lencana Baru", value: newBadges[0].name });
    }

    if (isCorrect && (mission as any).adabFeedback) {
      rewards.push({ emoji: "💝", label: "Kartu Hikmah", value: "Adab Mulia!" });
    }

    return rewards;
  }, [showGiftBox, xpGain, finalPoint, isCorrect, stars, newBadges, mission]);

  const confettiBits = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        emoji: ["⭐", "✨", "🎉", "💛", "🌟"][i % 5],
      })),
    [],
  );

  const isBoss = mission.missionType === "boss_mission" && mission.isBossMission;
  const bossStepCount = bossStepResults?.length ?? 0;
  const bossCorrectCount = bossStepResults?.filter(r => r.isCorrect).length ?? 0;

  return (
    <div className={`h-[100dvh] relative overflow-hidden flex flex-col ${isBoss ? "bg-gradient-to-b from-[#1a1a2e] via-[#2d1f3d] to-[#1a1a2e]" : "bg-gradient-sky"}`}>
      {/* Scrollable main */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
      {/* Boss special background */}
      {isBoss && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-6xl opacity-20 animate-boss-spin-slow">⭐</div>
          <div className="absolute top-20 right-16 text-5xl opacity-15 animate-boss-spin-slow" style={{ animationDirection: "reverse", animationDuration: "18s" }}>💫</div>
          <div className="absolute bottom-32 left-20 text-4xl opacity-20 animate-float" style={{ animationDelay: "0.5s" }}>✨</div>
          <div className="absolute bottom-20 right-10 text-6xl opacity-15 animate-float" style={{ animationDelay: "1.5s" }}>🌟</div>
        </div>
      )}

      {showConfetti
        ? confettiBits.map((c, i) => (
            <span
              key={i}
              className="absolute top-0 text-2xl"
              style={{
                left: `${c.left}%`,
                animation: `confetti-fall 2.4s ${c.delay}s ease-in forwards`,
              }}
            >
              {c.emoji}
            </span>
          ))
        : null}

      <main className="flex-1 px-4 pt-safe mt-4 pb-4 flex flex-col items-center max-w-md mx-auto w-full">
        {isBoss ? (
          <>
            <div className="text-7xl animate-star-burst">{isCorrect ? "👑" : "💪"}</div>
            <h1 className={`mt-2 font-display font-black text-4xl text-center drop-shadow-lg ${isCorrect ? "text-[#FFD700]" : "text-white/70"}`}>
              {isCorrect ? "BOSS DIKALAHKAN!" : "Boss Belum Dikalahkan"}
            </h1>
          </>
        ) : (
          <section className="field-result-hero field-landscape" aria-labelledby="result-heading">
            <span aria-hidden="true">{isCorrect ? <Star size={24} /> : <Sprout size={24} />}</span>
            <h1 id="result-heading">{isCorrect ? "Misi berhasil!" : "Ayo coba lagi"}</h1>
            <p>{mission.title}</p>
          </section>
        )}

        {isBoss && <p className="text-center text-base font-bold mt-1 text-white/70">{mission.title}</p>}

        <div className="mt-4">
          <RewardStars count={stars} size="xl" animated />
        </div>

        {/* Boss step results */}
        {isBoss && bossStepResults && bossStepResults.length > 0 && (
          <div className="mt-4 w-full surface-panel rounded-[28px] p-4 space-y-1.5">
            <h3 className="font-display font-black text-sm text-[#8C6B45] uppercase mb-1">
              Hasil Langkah: {bossCorrectCount}/{bossStepCount} Benar
            </h3>
            {bossStepResults.map((sr, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-xl text-sm font-bold ${sr.isCorrect ? "bg-[#2E8B12]/10 text-[#2E8B12]" : "bg-[#A02020]/10 text-[#A02020]"}`}>
                <span>{sr.isCorrect ? "✅" : "❌"}</span>
                <span className="flex-1">Langkah {i + 1}</span>
                <span className="text-xs opacity-70">
                  {sr.isCorrect && sr.attempts === 1 ? "Percobaan pertama!" : `${sr.attempts}× coba`}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 w-full grid grid-cols-2 gap-3">
          <div className={`rounded-[28px] border-4 p-4 text-center shadow-pop-sm ${isBoss ? "bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-[#D48806]" : "bg-gradient-coin border-[#D48806]"}`}>
            <div className="text-3xl">{isBoss ? "👑" : "⭐"}</div>
            <div className={`font-display font-black text-3xl ${isBoss ? "text-[#5A3515]" : "text-[#5A3515]"}`}>+{finalPoint}</div>
            <div className={`text-sm font-black uppercase ${isBoss ? "text-[#5A3515]/70" : "text-[#5A3515]/70"}`}>Poin</div>
          </div>
          <div className={`rounded-[28px] border-4 p-4 text-center shadow-pop-sm ${isBoss ? "bg-gradient-to-br from-[#7B2FBE] to-[#4A0E7E] border-[#4A0E7E] text-white" : "bg-gradient-meadow border-[#2E8B12] text-white"}`}>
            <div className="text-3xl">⚡</div>
            <div className="font-display font-black text-3xl">+{xpGain}</div>
            <div className="text-sm font-black uppercase opacity-80">XP</div>
          </div>
        </div>

        {/* Detailed Breakdown UI */}
        {isCorrect && breakdown && (
          <div className="mt-4 w-full surface-panel rounded-[28px] p-4 space-y-2">
            <h3 className="font-display font-black text-[#5A3515] text-lg border-b-2 border-[#D4B483] pb-2 mb-2">Rincian Poin</h3>
            <div className="flex justify-between text-sm font-bold text-[#8C6B45]">
              <span>Poin Dasar ({mission.difficulty})</span>
              <span>{Math.round(breakdown.base * breakdown.difficultyMultiplier)}</span>
            </div>
            {breakdown.performanceMultiplier > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#2E8B12]">
                <span>Akurasi (x{breakdown.performanceMultiplier})</span>
                <span>✅</span>
              </div>
            )}
            {breakdown.fastCompletionBonus > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#D48806]">
                <span>Bonus Waktu Cepat</span>
                <span>+{breakdown.fastCompletionBonus}</span>
              </div>
            )}
            {breakdown.adabBonus > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#185E9F]">
                <span>Bonus Adab</span>
                <span>+{breakdown.adabBonus}</span>
              </div>
            )}
            {breakdown.streakBonus > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#D48806]">
                <span>Bonus Streak</span>
                <span>+{breakdown.streakBonus}</span>
              </div>
            )}
            {breakdown.hintPenalty > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#A02020]">
                <span>Penalti Petunjuk</span>
                <span>-{breakdown.hintPenalty}</span>
              </div>
            )}
            {breakdown.attemptPenalty > 0 && (
              <div className="flex justify-between text-sm font-bold text-[#A02020]">
                <span>Penalti Percobaan</span>
                <span>-{breakdown.attemptPenalty}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black text-[#5A3515] border-t-2 border-[#D4B483] pt-2 mt-2">
              <span>Total Poin</span>
              <span>{finalPoint}</span>
            </div>
          </div>
        )}

        {celebration === "victory" && (
          <VictoryDialog
            title={isBoss ? "Bos ditaklukkan!" : "Misi berhasil!"}
            context={`Misi ${mission.number} · ${mission.title}`}
            stars={stars}
            rewards={[
              { label: "Poin misi", value: `+${finalPoint}`, icon: "points" },
              { label: "XP", value: `+${xpGain}`, icon: "xp" },
            ]}
            primaryLabel="Lanjut"
            onPrimary={nextCelebration}
            onClose={nextCelebration}
          />
        )}
        {celebration === "level" && (
          <GameCelebrationDialog key="level" kind="level" title="Naik level!" description="Usahamu membuahkan hasil. Level petualangmu naik." onContinue={nextCelebration} />
        )}
        {celebration === "medal" && (
          <GameCelebrationDialog key="medal" kind="medal" title="Lencana baru!" description="Pencapaian ini sudah masuk ke koleksi lencanamu." onContinue={nextCelebration}>
            <ul className="mt-4 space-y-2 text-left">
              {newBadges.map(badge => (
                <li key={badge.id} className="flex items-center gap-3 rounded-xl bg-white/65 p-2.5">
                  <span aria-hidden="true" className="text-2xl">{badge.emoji}</span>
                  <div><strong>{badge.name}</strong><p className="text-sm">{badge.description}</p></div>
                </li>
              ))}
            </ul>
          </GameCelebrationDialog>
        )}

        {/* Story Feedback */}
        {isCorrect && (mission as any).successText && (
          <div className="mt-4 w-full rounded-[28px] bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-3 border-[#4CAF50] p-4 mb-2 shadow-pop-sm">
            <div className="text-sm font-black uppercase text-[#2E8B12] mb-1">💬 Cerita</div>
            <p className="text-base font-bold text-[#5A3515] leading-relaxed">{(mission as any).successText}</p>
          </div>
        )}
        {!isCorrect && (mission as any).failureText && (
          <div className="mt-4 w-full rounded-[28px] bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border-3 border-[#FF9800] p-4 mb-2 shadow-pop-sm">
            <div className="text-sm font-black uppercase text-[#E65100] mb-1">💪 Jangan Menyerah!</div>
            <p className="text-base font-bold text-[#5A3515] leading-relaxed">{(mission as any).failureText}</p>
          </div>
        )}
        {isCorrect && (mission as any).worldImpactText && (
          <div className="w-full rounded-[20px] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] border-2 border-[#2196F3]/40 p-3 mb-2">
            <div className="text-[10px] font-black uppercase text-[#1565C0] mb-0.5">🌍 Dampak Dunia</div>
            <p className="text-xs font-bold text-[#5A3515] italic">{(mission as any).worldImpactText}</p>
          </div>
        )}
        <div className="mt-1 w-full rounded-[28px] surface-panel p-4 mb-4">
          <div className="text-sm font-black uppercase text-[#8C6B45]">{isCorrect ? "Penjelasan" : "Jawaban yang benar"}</div>
          <p className="text-base font-bold text-[#5A3515] mt-1 leading-relaxed">{mission.explanation}</p>
          {isCorrect && mission.adabFeedback ? (
            <div className="mt-3 text-base font-black text-[#2E8B12]">✨ {mission.adabFeedback}</div>
          ) : null}
        </div>

        {/* ── Gift Box (3 Stars Perfect Completion) ── */}
        {showGiftBox && (
          <div className="w-full mt-2 mb-4">
            {/* Closed gift box */}
            {!isGiftOpened && (
              <button type="button"
                onClick={handleGiftTap}
                disabled={isGiftAnimating}
                className={`tmt-choice-button w-full rounded-[28px] p-6 text-center border-4 shadow-2xl cursor-pointer transition-all active:scale-95 select-none ${
                  isGiftAnimating
                    ? "animate-float border-[#FFD700] bg-gradient-to-b from-[#FFF9E6] to-[#FFE0A3]"
                    : "border-[#D48806] bg-gradient-to-b from-[#FFF9E6] to-[#FFE0A3] hover:border-[#FFD700] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
                }`}
                style={{ zIndex: 10, pointerEvents: "auto" }}
              >
                {/* Sparkle decorations */}
                <div className="absolute top-2 left-4 text-2xl animate-pulse" style={{ animationDelay: "0s" }}>✨</div>
                <div className="absolute top-4 right-6 text-xl animate-pulse" style={{ animationDelay: "0.4s" }}>✨</div>

                <div className={`text-7xl mb-3 ${isGiftAnimating ? "animate-bounce" : "animate-bob"}`}>
                  🎁
                </div>
                <h3 className="font-display font-black text-xl text-[#5A3515] mb-1">
                  {isGiftAnimating ? "Membuka kado..." : "Kado Istimewa!"}
                </h3>
                <p className="text-sm font-bold text-[#8C6B45]">
                  {isGiftAnimating ? "✨" : "Tap untuk membuka kado! 🎀"}
                </p>
              </button>
            )}

            {/* Opened gift box — rewards revealed */}
            {isGiftOpened && giftRewardsRevealed && (
              <div className="w-full rounded-[28px] p-5 text-center border-4 border-[#FFD700] bg-gradient-to-b from-[#FFF9E6] to-[#FFE8B0] shadow-2xl animate-pop-in">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-display font-black text-xl text-[#5A3515] mb-3">
                  Kado Terbuka!
                </h3>

                {/* Reward items */}
                <div className="space-y-2 mb-4">
                  {giftRewards.map((reward, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border-2 border-[#D4B483] animate-pop-in"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <div className="text-2xl shrink-0">{reward.emoji}</div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-[#8C6B45] uppercase">{reward.label}</div>
                        <div className="font-display font-black text-base text-[#5A3515]">{reward.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs font-bold text-[#2E8B12] mb-2">
                  🎀 Kado sudah masuk ke kotak hadiahmu!
                </p>
              </div>
            )}
          </div>
        )}

        {/* If gift box exists but not opened yet, show a hint */}
        {showGiftBox && !isGiftOpened && showContinueAnyway && (
          <div className="w-full text-center mb-2">
            <p className="text-xs font-bold text-[#8C6B45] mb-1">Kamu juga bisa lanjut dulu, kado tetap ada ✨</p>
          </div>
        )}

        {/* ═══ Stage 500 Completion Section ═══ */}
        {isStage500 && isCorrect && stage500Difficulty && (
          <div className="mt-4 w-full rounded-[28px] p-5 text-center border-4 shadow-2xl animate-pop-in" style={{
            background: "linear-gradient(to bottom, #FFF9E6, #FFE0A3)",
            borderColor: "#FFD700",
            boxShadow: "0 0 30px rgba(255,215,0,0.5)"
          }}>
            <div className="text-5xl mb-2">🏆</div>
            {!hasClaimedFinalReward ? (
              <>
                <h3 className="font-display font-black text-xl text-[#5A3515] mb-1">
                  Kamu menyelesaikan 500/500 misi!
                </h3>
                <p className="text-sm font-bold text-[#8C6B45] mb-3">
                  Level <span className="text-[#185E9F] font-black">{stage500Difficulty.toUpperCase()}</span> telah kamu taklukkan!
                </p>
                <div className="text-6xl mb-3 animate-bob">🎁</div>
                <p className="text-xs font-bold text-[#2E8B12] mb-3">
                  Hadiah akhir level sudah menunggu. Buka sekarang!
                </p>
                <button type="button" data-action="coin"
                  onClick={onOpenRewardBox}
                  className="tmt-action-button w-full py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-b-4 border-[#D48806] text-[#5A3515] font-black text-lg shadow-sm active:translate-y-1 active:border-b-0 transition-all"
                >
                  🎁 Buka Reward
                </button>
              </>
            ) : isUniversitas ? (
              <>
                <h3 className="font-display font-black text-xl text-[#5A3515] mb-1">
                  Perjalanan Selesai!
                </h3>
                <p className="text-sm font-bold text-[#8C6B45] mb-3">
                  Kamu telah menyelesaikan seluruh perjalanan The Mastermind Trials!
                </p>
                <GameButton variant="primary" size="md" full onClick={onBackToMap}>
                  🗺️ Kembali ke Peta
                </GameButton>
              </>
            ) : nextDifficulty ? (
              <>
                <h3 className="font-display font-black text-xl text-[#5A3515] mb-1">
                  Level Baru Terbuka!
                </h3>
                <p className="text-sm font-bold text-[#8C6B45] mb-3">
                  Level <span className="text-[#185E9F] font-black">{nextDifficulty.toUpperCase()}</span> sudah terbuka. Siap naik tingkat?
                </p>
                <GameButton variant="primary" size="md" full onClick={onBackToMap}>
                  🚀 Lanjut ke Peta
                </GameButton>
              </>
            ) : null}
          </div>
        )}

        {/* Stage 300 reminder — NOT a completion trigger */}
        {mission.number === 300 && isCorrect && !isStage500 && (
          <div className="mt-4 w-full rounded-[20px] p-3 text-center bg-[#E3F2FD] border-2 border-[#2196F3]/40">
            <p className="text-xs font-bold text-[#1565C0]">
              🎯 Bagus! Lanjutkan ke 500 misi untuk hadiah akhir level.
            </p>
          </div>
        )}
      </main>

      </div>
      {/* Sticky bottom buttons */}
      <footer className="shrink-0 content-wrapper pb-safe pt-2 space-y-2">
        {/* Stage 500: hide "Misi Berikutnya" — no mission after 500 */}
        {!isStage500 && (
          <GameButton variant="primary" size="xl" full onClick={onNextMission} trailingIcon="→">
            Misi Berikutnya
          </GameButton>
        )}
        {isStage500 && (
          <GameButton variant="primary" size="xl" full onClick={onBackToMap} trailingIcon="→">
            🗺️ Lanjut ke Peta
          </GameButton>
        )}
        <GameButton variant="ghost" size="md" full onClick={onBackToMap}>
          🗺️ Kembali ke Peta
        </GameButton>
      </footer>
    </div>
  );
}
