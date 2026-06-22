import type { DifficultyId } from "@/types";
import { DIFFICULTY_MAP, DIFFICULTY_UI_LABELS } from "@/data/constants";

interface Props {
  currentDifficulty: DifficultyId;
  nextDifficulty: DifficultyId;
  onUpgradeNow: () => void;
  onUpgradeLater: () => void;
  onClose: () => void;
}

export function DifficultyUnlockModal({
  currentDifficulty,
  nextDifficulty,
  onUpgradeNow,
  onUpgradeLater,
  onClose,
}: Props) {
  const currInfo = DIFFICULTY_MAP[currentDifficulty];
  const nextInfo = DIFFICULTY_MAP[nextDifficulty];
  const nextLabel = DIFFICULTY_UI_LABELS[nextDifficulty] || nextDifficulty;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#FFF9E6] to-[#FFE0A3] rounded-[2rem] p-6 text-center shadow-2xl max-w-sm w-full border-4 border-[#D48806] animate-pop-in">
        <div className="text-6xl mb-3">🚀</div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#5A3515] leading-tight mb-2">
          Level Kesulitan Baru Terbuka!
        </h2>
        <p className="text-sm font-bold text-[#8C6B45] mb-1">
          MasyaAllah! Kamu telah menyelesaikan 500 misi{" "}
          <span className="text-[#185E9F] font-black">
            {currInfo?.label || currentDifficulty}
          </span>
          .
        </p>
        <p className="text-base font-black text-[#2E8B12] mb-3">
          Sekarang level{" "}
          <span className="text-xl">{nextInfo?.emoji} {nextLabel}</span>{" "}
          terbuka!
        </p>

        <div className="space-y-3">
          <button
            onClick={onUpgradeNow}
            className="w-full py-3 rounded-2xl bg-gradient-meadow border-b-4 border-[#2E8B12] text-white font-black text-lg shadow-sm active:translate-y-1 active:border-b-0 transition-all"
          >
            🚀 Naik Sekarang
          </button>
          <button
            onClick={onUpgradeLater}
            className="w-full py-3 rounded-2xl bg-white/60 border-2 border-[#D4B483] text-[#5A3515] font-black text-base shadow-sm active:translate-y-1 transition-all"
          >
            ⏳ Nanti Dulu
          </button>
        </div>

        <p className="text-[10px] font-bold text-[#8C6B45] mt-3">
          Progresmu saat ini tetap aman. Kamu bisa naik tingkat kapan saja dari Peta.
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-3 text-xs font-bold text-[#8C6B45] hover:text-[#5A3515] underline"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
