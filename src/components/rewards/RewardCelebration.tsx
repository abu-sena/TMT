import type { RewardMilestone } from "@/types";
import { GameButton } from "@/components/ui/GameButton";

interface Props {
  open: boolean;
  rewards: RewardMilestone[];
  currentIndex: number;
  onClose: () => void;
  onViewRewards: () => void;
  onNext: () => void;
}

export function RewardCelebration({
  open,
  rewards,
  currentIndex,
  onClose,
  onViewRewards,
  onNext,
}: Props) {
  if (!open || rewards.length === 0) return null;

  const reward = rewards[currentIndex];
  if (!reward) return null;

  const hasMore = currentIndex < rewards.length - 1;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Confetti-like decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-star-burst"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              opacity: 0.8,
            }}
          >
            {["⭐", "🌟", "✨", "💫", "🎉", "🎊", "💖"][i % 7]}
          </div>
        ))}
      </div>

      <div className="relative z-10 tmt-dialog-surface rounded-[32px] border-4 border-[#D48806] p-6 max-w-sm w-full shadow-2xl animate-pop-in text-center">
        {/* Golden glow icon */}
        <div className="relative inline-block mb-3">
          <div className="absolute inset-0 rounded-full bg-yellow-300/40 blur-xl animate-pulse" />
          <div
            className="relative h-24 w-24 rounded-[28px] grid place-items-center text-5xl border-4 border-[#D48806] shadow-lg"
            style={{ backgroundColor: reward.rewardColor || "#FFE0A3" }}
          >
            {reward.rewardIcon}
          </div>
        </div>

        <h2 className="font-display font-black text-2xl text-[#D48806] mb-1">
          Hadiah Terbuka!
        </h2>

        <div className="font-display font-black text-xl text-[#5A3515] mb-2">
          {reward.rewardTitle}
        </div>

        <p className="text-sm font-bold text-[#8C6B45] leading-relaxed mb-1">
          MasyaAllah! Kamu mencapai Level {reward.targetLevel} dan membuka hadiah{" "}
          <strong>{reward.rewardTitle}</strong>.
        </p>

        {reward.rewardDescription && (
          <p className="text-xs text-[#8C6B45]/70 mb-2">{reward.rewardDescription}</p>
        )}

        <div className="bg-white/60 rounded-[18px] p-3 mb-4">
          <p className="text-xs font-bold text-[#5A3515]">
            🎉 Tunjukkan ini kepada orang tua untuk mendapatkan hadiah dunia nyata.
          </p>
        </div>

        {/* Counter if multiple */}
        {rewards.length > 1 && (
          <div className="text-xs font-bold text-[#8C6B45] mb-3">
            Hadiah {currentIndex + 1} dari {rewards.length}
          </div>
        )}

        <div className="flex gap-3">
          {hasMore ? (
            <GameButton variant="primary" size="md" full onClick={onNext}>
              Selanjutnya 🎉
            </GameButton>
          ) : (
            <>
              <GameButton variant="secondary" size="md" onClick={onClose}>
                Hore!
              </GameButton>
              <GameButton variant="primary" size="md" onClick={onViewRewards}>
                Lihat Hadiah
              </GameButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
