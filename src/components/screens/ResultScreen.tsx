import { useEffect, useMemo, useState } from "react";
import type { BadgeDef, Mission } from "@/game/types";
import { GameButton } from "../game/GameButton";
import { RewardStars } from "../game/RewardStars";

interface Props {
  mission: Mission;
  isCorrect: boolean;
  stars: number;
  finalPoint: number;
  xpGain: number;
  leveledUp: boolean;
  newBadges: BadgeDef[];
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
  onNextMission,
  onBackToMap,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(isCorrect);
  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  const confettiBits = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        emoji: ["⭐", "✨", "🎉", "💛", "🌟"][i % 5],
      })),
    [],
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-sky relative overflow-hidden flex flex-col">
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

      <main className="flex-1 px-4 pt-8 pb-4 flex flex-col items-center max-w-md mx-auto w-full">
        <div className="text-6xl animate-pop-in">{isCorrect ? "🎉" : "💪"}</div>
        <h1 className="mt-2 font-display font-black text-3xl text-[color:var(--wood-dark)] text-center">
          {isCorrect ? "Misi Berhasil!" : "Coba Lagi Yuk!"}
        </h1>
        <p className="text-center text-sm text-[color:var(--wood-dark)]/80 mt-1">
          {mission.title}
        </p>

        <div className="mt-4">
          <RewardStars count={stars} size="xl" animated />
        </div>

        <div className="mt-5 w-full grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-coin border-2 border-[color:var(--wood)]/40 p-3 text-center shadow-pop-sm">
            <div className="text-2xl">⭐</div>
            <div className="font-display font-black text-2xl text-[color:var(--wood-dark)]">+{finalPoint}</div>
            <div className="text-[11px] font-bold text-[color:var(--wood-dark)]/80 uppercase">Poin</div>
          </div>
          <div className="rounded-2xl bg-gradient-meadow border-2 border-leaf-dark/60 p-3 text-center shadow-pop-sm text-primary-foreground">
            <div className="text-2xl">⚡</div>
            <div className="font-display font-black text-2xl">+{xpGain}</div>
            <div className="text-[11px] font-bold opacity-90 uppercase">XP</div>
          </div>
        </div>

        {leveledUp ? (
          <div className="mt-3 w-full rounded-2xl bg-gradient-sun border-2 border-[color:var(--wood)]/60 p-3 text-center shadow-pop animate-pop-in">
            <div className="font-display font-black text-lg text-[color:var(--wood-dark)]">🎊 Naik Level!</div>
            <div className="text-xs text-[color:var(--wood-dark)]/80">Selamat, kamu makin hebat!</div>
          </div>
        ) : null}

        {newBadges.length > 0 ? (
          <div className="mt-3 w-full rounded-2xl bg-white border-2 border-[color:var(--berry)]/40 p-3 shadow-pop animate-pop-in">
            <div className="font-display font-bold text-sm text-[color:var(--berry)] uppercase tracking-wide">Badge Baru!</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {newBadges.map((b) => (
                <div key={b.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-cream border border-[color:var(--wood)]/40">
                  <span className="text-xl">{b.emoji}</span>
                  <span className="font-display font-bold text-sm">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 w-full rounded-2xl bg-gradient-cream border-2 border-[color:var(--wood)]/40 p-3">
          <div className="text-xs font-bold uppercase text-muted-foreground">{isCorrect ? "Penjelasan" : "Jawaban yang benar"}</div>
          <p className="text-sm mt-1 leading-relaxed">{mission.explanation}</p>
          {isCorrect && mission.adabFeedback ? (
            <div className="mt-2 text-sm font-bold text-[color:var(--berry)]">✨ {mission.adabFeedback}</div>
          ) : null}
        </div>
      </main>

      <footer className="px-4 pb-6 pt-2 space-y-2 max-w-md mx-auto w-full">
        <GameButton variant="primary" size="xl" full onClick={onNextMission} trailingIcon="→">
          Misi Berikutnya
        </GameButton>
        <GameButton variant="ghost" size="md" full onClick={onBackToMap}>
          🗺️ Kembali ke Peta
        </GameButton>
      </footer>
    </div>
  );
}
