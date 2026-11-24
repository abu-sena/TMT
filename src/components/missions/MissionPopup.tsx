import { X as TmtCloseGlyph } from "lucide-react";
import type { Mission } from "@/types";
import { CATEGORY_MAP, DIFFICULTY_MAP } from "@/data/constants";
import { GameButton } from "@/components/ui/GameButton";
import { RewardStars } from "@/components/rewards/RewardStars";
import { COMPANIONS } from "@/data/adventure-story";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

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
  const bossColor = bossMission?.bossThemeColor ?? "#A02020";

  // Story fields (may not exist on legacy missions)
  const introText = (mission as any).introText || "";
  const challengeContext = (mission as any).challengeContext || "";
  const companionId = (mission as any).companionId || null;
  const companionHint = (mission as any).companionHint || "";
  const companion = companionId ? COMPANIONS[companionId] : null;
  const isFinalStage = mission.number === 500;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent hideCloseButton className={`block w-[calc(100%-2rem)] max-w-md max-h-[88dvh] overflow-y-auto p-0 animate-pop-in ${isBoss ? "rounded-[28px] border-4 shadow-2xl" : "surface-panel tmt-dialog-surface shadow-2xl"}`}
        style={isBoss ? {
          background: `linear-gradient(180deg, #1a1a2e 0%, #2d1f3d 100%)`,
          borderColor: bossColor,
        } : {}}
      >
        <DialogDescription className="sr-only">Rincian misi dan pilihan untuk memulai petualangan.</DialogDescription>
        {/* Header */}
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
            {isFinalStage && (
              <div className="text-[9px] font-black uppercase tracking-widest bg-[#FFD700]/30 rounded-full px-2 py-0.5 inline-block mb-1 text-[#FFD700]">
                ⭐ FINAL STAGE ⭐
              </div>
            )}
            <div className="text-[11px] uppercase tracking-wider opacity-80">Stage #{mission.number} · {diff.label}</div>
            <DialogTitle className="font-display font-bold text-lg leading-tight truncate">
              {(mission as any).storyTitle || mission.title}
            </DialogTitle>
          </div>
          <button type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="tmt-icon-button h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 grid place-items-center text-white font-bold shrink-0"
          >
            <TmtCloseGlyph aria-hidden="true" />
          </button>
        </div>

        {/* Story Content */}
        <div className={`p-5 space-y-4 overflow-y-auto overscroll-contain ${isBoss ? "text-white/80" : ""}`}>
          {/* Story Intro — the heart of Story Adventure Map */}
          {introText && (
            <div className={`rounded-[18px] p-4 text-sm font-bold leading-relaxed border-2 ${
              isBoss ? "bg-white/10 border-white/20 text-white" : "bg-[#E8DCC2]/60 border-[#CBB794] text-[#5A3515]"
            }`}>
              <div className="text-xs font-black uppercase tracking-wide mb-1 opacity-60">📖 Cerita</div>
              <p>{introText}</p>
            </div>
          )}

          {/* Challenge Context */}
          {challengeContext && (
            <div className={`rounded-[18px] p-4 text-base font-bold leading-relaxed text-center border-2 ${
              isBoss ? "bg-white/10 border-white/20 text-white" : "bg-[#FFF9E6] border-[#D48806]/40 text-[#5A3515]"
            }`}>
              <p>🎯 {challengeContext}</p>
            </div>
          )}

          {/* Companion Hint */}
          {companion && (
            <div className="flex items-start gap-3 rounded-[18px] p-4 border-2"
              style={{
                background: isBoss ? `${companion.colorTheme}15` : `${companion.colorTheme}10`,
                borderColor: `${companion.colorTheme}40`,
              }}
            >
              <div className="text-3xl shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: `${companion.colorTheme}20` }}
              >
                {companion.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-black uppercase mb-0.5 ${isBoss ? "text-white/60" : "text-[#8C6B45]"}`}>
                  {companion.name} — {companion.role}
                </div>
                <p className={`text-sm font-bold leading-relaxed ${isBoss ? "text-white/80" : "text-[#5A3515]"}`}>
                  {companionHint || companion.introPhrase}
                </p>
              </div>
            </div>
          )}

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

          {/* Tags */}
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
          </div>

          {stars > 0 ? (
            <div className={`flex items-center justify-between rounded-[18px] border-2 px-4 py-3 ${
              isBoss ? "bg-white/10 border-white/20" : "bg-[#E8DCC2]/60 border-[#CBB794]"
            }`}>
              <span className={`text-sm font-bold ${isBoss ? "text-white/70" : "text-[#8C6B45]"}`}>Bintang terbaik</span>
              <RewardStars count={stars} />
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <GameButton variant={isBoss ? "ghost" : "wood"} size="lg" onClick={onClose} full>
              Kembali
            </GameButton>
            <GameButton
              variant="primary"
              size="md"
              onClick={onPlay}
              full
              leadingIcon={isBoss ? "👑" : "▶"}
            >
              {isBoss ? "Hadapi Boss!" : "Mulai Misi"}
            </GameButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
