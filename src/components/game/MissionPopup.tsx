import type { Mission } from "@/game/types";
import { CATEGORY_MAP, DIFFICULTY_MAP } from "@/game/constants";
import { GameButton } from "./GameButton";
import { RewardStars } from "./RewardStars";

interface Props {
  mission: Mission;
  stars: number;
  onClose: () => void;
  onPlay: () => void;
}

export function MissionPopup({ mission, stars, onClose, onPlay }: Props) {
  const cat = CATEGORY_MAP[mission.category];
  const diff = DIFFICULTY_MAP[mission.difficulty];

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm p-3 animate-pop-in">
      <div className="w-full max-w-md surface-panel rounded-3xl overflow-hidden">
        <div className="bg-gradient-wood px-4 py-3 flex items-center gap-3 text-white">
          <div className="h-12 w-12 rounded-2xl bg-white/20 border-2 border-white/40 grid place-items-center text-2xl">
            {mission.isBoss ? "👑" : cat.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider opacity-80">Misi #{mission.number} · {diff.label}</div>
            <h2 className="font-display font-bold text-lg leading-tight truncate">{mission.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 grid place-items-center text-white font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-black/30 border border-white/15 text-white text-xs font-bold">
              {cat.emoji} {cat.short}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/30 border border-white/15 text-white text-xs font-bold">
              {diff.emoji} {diff.label}
            </span>
            <span className="px-3 py-1 rounded-full bg-gradient-coin border border-white/30 text-xs font-bold text-[#3a2400] shadow-candy-sm">
              ⭐ {mission.basePoint} poin
            </span>
            {mission.adabBonus ? (
              <span className="px-3 py-1 rounded-full bg-[color:var(--berry)] text-white border border-white/40 text-xs font-bold shadow-candy-sm">
                ✨ Adab +{mission.adabBonus}
              </span>
            ) : null}
          </div>

          <p className="text-sm text-white/85 leading-relaxed">{mission.story}</p>

          {stars > 0 ? (
            <div className="flex items-center justify-between rounded-2xl bg-black/30 border border-white/15 px-3 py-2">
              <span className="text-xs font-bold text-white/60">Bintang terbaik</span>
              <RewardStars count={stars} />
            </div>
          ) : null}

          <div className="rounded-2xl bg-black/30 border border-dashed border-white/20 px-3 py-2">
            <div className="text-[11px] font-bold uppercase text-white/60 mb-1">Booster tersedia</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-gradient-sun border border-white/30 text-[#3a2400] shadow-candy-sm">💡 Petunjuk</span>
              <span className="px-2 py-1 rounded-full bg-gradient-blue border border-white/30 text-white shadow-candy-sm">⏱️ Waktu +</span>
              <span className="px-2 py-1 rounded-full bg-gradient-meadow text-white border border-white/30 shadow-candy-sm">2× Poin</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <GameButton variant="ghost" size="md" onClick={onClose} full>
              Tutup
            </GameButton>
            <GameButton variant="primary" size="md" onClick={onPlay} full leadingIcon="▶">
              Main
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
