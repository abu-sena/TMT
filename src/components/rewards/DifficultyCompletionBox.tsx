import { useState, useRef, useMemo } from "react";
import type { DifficultyId } from "@/types";
import { DIFFICULTY_COMPLETION_REWARDS } from "@/types";
import { DIFFICULTY_MAP } from "@/data/constants";
import { DashboardIcon } from "@/components/TmtBrandArt";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface RewardItem {
  emoji: string;
  label: string;
  value: string;
}

interface Props {
  difficulty: DifficultyId;
  onOpen: () => void;
  onClose: () => void;
}

export function DifficultyCompletionBox({ difficulty, onOpen, onClose }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const hasOpened = useRef(false);

  const diffInfo = DIFFICULTY_MAP[difficulty];
  const rewardDef = DIFFICULTY_COMPLETION_REWARDS[difficulty];

  const rewards = useMemo<RewardItem[]>(() => {
    if (!rewardDef) return [];
    return [
      { emoji: "⚡", label: "EXP Besar", value: `+${rewardDef.exp.toLocaleString("id")}` },
      { emoji: "🪙", label: "Koin", value: `+${rewardDef.coins.toLocaleString("id")}` },
      { emoji: "💎", label: "Permata", value: `+${rewardDef.gems}` },
      ...rewardDef.lencana.map((badgeId) => ({
        emoji: "🏅",
        label: "Lencana Baru",
        value: badgeId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    ];
  }, [rewardDef]);

  const handleTap = () => {
    if (isAnimating || hasOpened.current) return;
    setIsAnimating(true);
    hasOpened.current = true;

    setTimeout(() => {
      setIsOpened(true);
      setIsAnimating(false);
    }, 800);
  };

  const handleClaim = () => {
    onOpen();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent hideCloseButton className="block z-[110] w-[calc(100%-2rem)] max-w-sm max-h-[90dvh] overflow-y-auto border-0 bg-transparent p-0 shadow-none">
      <DialogDescription className="sr-only">Hadiah penyelesaian tingkat kesulitan.</DialogDescription>
      {/* Confetti / stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-xl animate-confetti-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          >
            {["⭐", "✨", "🎉", "💛", "🌟"][i % 5]}
          </span>
        ))}
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#FFD700] opacity-20 blur-3xl animate-pulse" />
      </div>

      {!isOpened ? (
        /* Closed gift box */
        <div className="relative z-10 w-full max-w-sm animate-pop-in">
          <div
            onClick={handleTap}
            onKeyDown={(event) => {
              if (!isAnimating && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                handleTap();
              }
            }}
            role="button"
            tabIndex={isAnimating ? -1 : 0}
            aria-label="Buka box hadiah akhir level"
            aria-disabled={isAnimating}
            className={`tmt-dialog-surface w-full rounded-[2rem] p-8 text-center border-4 shadow-2xl cursor-pointer select-none transition-all active:scale-95 ${
              isAnimating
                ? "animate-float border-[#FFD700] bg-gradient-to-b from-[#FFF9E6] to-[#FFE0A3]"
                : "border-[#D48806] bg-gradient-to-b from-[#FFF9E6] to-[#FFE0A3] hover:border-[#FFD700] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]"
            }`}
          >
            {/* Sparkle decorations */}
            <div className="absolute top-3 left-4 text-2xl animate-pulse" style={{ animationDelay: "0s" }}>✨</div>
            <div className="absolute top-5 right-5 text-xl animate-pulse" style={{ animationDelay: "0.4s" }}>✨</div>
            <div className="absolute bottom-4 left-6 text-xl animate-pulse" style={{ animationDelay: "0.8s" }}>✨</div>
            <div className="absolute bottom-3 right-4 text-2xl animate-pulse" style={{ animationDelay: "1.2s" }}>🌟</div>

            {/* Box */}
            <div className={`mb-4 ${isAnimating ? "animate-bounce" : "animate-bob"}`}>
              <DashboardIcon name="gift" className="tmt-reward-art" />
            </div>
            <DialogTitle className="font-display font-black text-2xl text-[#5A3515] mb-2">
              {isAnimating ? "Membuka hadiah..." : "Box Hadiah Akhir Level!"}
            </DialogTitle>
            <p className="text-base font-bold text-[#8C6B45] mb-1">
              {diffInfo?.emoji} {diffInfo?.label}
            </p>
            <p className="text-sm font-bold text-[#5A3515]">
              {isAnimating ? "✨" : "Tap untuk membuka hadiah! 🎀"}
            </p>
          </div>

          {/* Close button (X) — only for "nanti" escape */}
          <button type="button" data-action="neutral"
            onClick={onClose}
            className="tmt-action-button mt-4 mx-auto block text-white/80 hover:text-white font-bold text-sm py-2 px-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            Nanti Dulu
          </button>
        </div>
      ) : (
        /* Opened box — rewards revealed */
        <div className="relative z-10 w-full max-w-sm animate-pop-in">
          <div className="tmt-dialog-surface w-full rounded-[2rem] p-6 text-center border shadow-2xl">
            <div className="text-5xl mb-2">🎉</div>
            <DialogTitle className="font-display font-black text-2xl text-[#5A3515] mb-1">
              Hadiah Terbuka!
            </DialogTitle>
            <p className="text-sm font-bold text-[#8C6B45] mb-4">
              Kamu telah menyelesaikan semua 500 misi {diffInfo?.label}!
            </p>

            {/* Reward items */}
            <div className="space-y-2 mb-4">
              {rewards.map((reward, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/70 rounded-2xl p-3 border-2 border-[#D4B483] animate-pop-in"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="text-2xl shrink-0 w-10 h-10 flex items-center justify-center bg-[#E8DCC2] rounded-xl">
                    {reward.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-[#8C6B45] uppercase">{reward.label}</div>
                    <div className="font-display font-black text-lg text-[#5A3515]">{reward.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs font-bold text-[#2E8B12] mb-3">
              🎀 MasyaAllah! Kamu hebat!
            </p>

            <button type="button" data-action="primary"
              onClick={handleClaim}
              className="tmt-action-button w-full py-3 rounded-2xl bg-gradient-meadow border-b-4 border-[#2E8B12] text-white font-black text-lg shadow-sm active:translate-y-1 active:border-b-0 transition-all"
            >
              🎊 Lanjutkan
            </button>
          </div>
        </div>
      )}
      </DialogContent>
    </Dialog>
  );
}
