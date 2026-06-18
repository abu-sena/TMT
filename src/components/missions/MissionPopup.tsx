import type { Mission } from "@/types";
import { CATEGORY_MAP, DIFFICULTY_MAP } from "@/data/constants";
import { GameButton } from "@/components/ui/GameButton";
import { RewardStars } from "@/components/rewards/RewardStars";

interface Props {
  mission: Mission;
  stars: number;
  onClose: () => void;
  onPlay: () => void;
}

export function MissionPopup({ mission, stars, onClose, onPlay }: Props) {
  const cat = CATEGORY_MAP[mission.category];
  const diff = DIFFICULTY_MAP[mission.difficulty];
  const isBoss = mission.missionType === "boss_mission" && mission.isBossMission;
  const bossMission = isBoss ? mission as any : null;
  const stepCount = bossMission?.steps?.length ?? 0;
  const bossColor = bossMission?.bossThemeColor ?? "#A02020";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-pop-in">
      <div className={`w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden p-0 ${isBoss ? "rounded-[28px] border-4 shadow-2xl" : "surface-panel"}`}
        style={isBoss ? {
          background: `linear-gradient(180deg, #1a1a2e 0%, #2d1f3d 100%)`,
          borderColor: bossColor,
        } : {}}
      >
        <div className={isBoss
          ? "px-4 py-4 flex items-center gap-3 text-white border-b-4"
          : "bg-gradient-wood px-4 py-4 flex items-center gap-3 text-white border-b-4 border-[#5A3515]"}
          style={isBoss ? {
            background: `linear-gradient(135deg, ${bossColor}dd, ${bossColor}88, #1a1a2e)`,
            borderColor: bossColor,
          } : {}}
        >
          <div className={`h-12 w-12 rounded-[18px] border-2 grid place-items-center text-2xl ${isBoss ? "bg-white/20 border-white/40" : "bg-white/20 border-white/40"}`}>
            {isBoss ? (bossMission?.bossEmoji ?? "👑") : cat.emoji}
          </div>
          <div className="min-w-0 flex-1">
            {isBoss && (
              <div className="text-[9px] font-black uppercase tracking-widest bg-white/20 rounded-full px-2 py-0.5 inline-block mb-1">
                ⚡ BOSS MISSION ⚡
              </div>
            )}
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

        <div className={`p-5 space-y-4 overflow-y-auto overscroll-contain ${isBoss ? "text-white/80" : ""}`}>
          {/* Boss step preview */}
          {isBoss && bossMission?.steps && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {bossMission.steps.map((step: any) => {
                const stepCat = CATEGORY_MAP[step.category as keyof typeof CATEGORY_MAP];
                return (
                  <span key={step.id} className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold backdrop-blur-sm">
                    {stepCat?.emoji ?? "📋"} {step.title}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full border-2 text-xs font-bold shadow-sm ${
              isBoss ? "bg-white/10 border-white/20 text-white" : "bg-[#E8DCC2] border-[#CBB794] text-[#5A3515]"
            }`}>
              {cat.emoji} {cat.short}
            </span>
            <span className={`px-3 py-1 rounded-full border-2 text-xs font-bold shadow-sm ${
              isBoss ? "bg-white/10 border-white/20 text-white" : "bg-[#E8DCC2] border-[#CBB794] text-[#5A3515]"
            }`}>
              {diff.emoji} {diff.label}
            </span>
            <span className={`px-3 py-1 rounded-full border-2 text-xs font-bold shadow-sm ${
              isBoss
                ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] border-[#D48806] text-[#3a2400]"
                : "bg-gradient-coin border-[#D48806] text-[#3a2400]"
            }`}>
              ⭐ {isBoss ? Math.round(mission.basePoint * (bossMission?.bossRewardMultiplier ?? 2)) : mission.basePoint} poin
            </span>
            {mission.adabBonus ? (
              <span className="px-3 py-1 rounded-full bg-gradient-heart text-white border-2 border-[#A02020] text-xs font-bold shadow-sm">
                ✨ Adab +{mission.adabBonus}
              </span>
            ) : null}
            {isBoss && stepCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-white/10 border-2 border-white/20 text-white text-xs font-bold backdrop-blur-sm">
                🎯 {stepCount} Langkah
              </span>
            )}
          </div>

          <p className={`text-base font-bold leading-relaxed text-center ${isBoss ? "text-white" : "text-[#5A3515]"}`}>{mission.story}</p>

          {isBoss && bossMission?.bossIntro && (
            <div className={`rounded-[18px] p-4 text-sm border-2`}
              style={{
                background: `${bossColor}15`,
                borderColor: `${bossColor}40`,
              }}
            >
              <p className="font-bold text-white/70 italic text-center">"{bossMission.bossIntroNarration}"</p>
            </div>
          )}

          {stars > 0 ? (
            <div className={`flex items-center justify-between rounded-[18px] border-2 px-4 py-3 ${
              isBoss ? "bg-white/10 border-white/20" : "bg-[#E8DCC2]/60 border-[#CBB794]"
            }`}>
              <span className={`text-sm font-bold ${isBoss ? "text-white/70" : "text-[#8C6B45]"}`}>Bintang terbaik</span>
              <RewardStars count={stars} />
            </div>
          ) : null}

          {!isBoss && (
            <div className="rounded-[18px] bg-[#E8DCC2]/60 border-2 border-dashed border-[#CBB794] px-4 py-3">
              <div className="text-[11px] font-black uppercase text-[#8C6B45] mb-2 tracking-wide">Booster (Segera)</div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1.5 rounded-xl bg-gradient-sun/70 border-2 border-[#D48806]/50 text-[#3a2400]/60 shadow-pop-sm font-bold">💡 Petunjuk</span>
                <span className="px-3 py-1.5 rounded-xl bg-gradient-blue/70 border-2 border-[#185E9F]/50 text-white/60 shadow-pop-sm font-bold">⏱️ Waktu +</span>
                <span className="px-3 py-1.5 rounded-xl bg-gradient-meadow/70 text-white/60 border-2 border-[#2E8B12]/50 shadow-pop-sm font-bold">2× Poin</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <GameButton variant={isBoss ? "ghost" : "wood"} size="lg" onClick={onClose} full>
              Tutup
            </GameButton>
            <GameButton
              variant="primary"
              size="md"
              onClick={onPlay}
              full
              leadingIcon={isBoss ? "👑" : "▶"}
            >
              {isBoss ? "Hadapi Boss!" : "Main"}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
