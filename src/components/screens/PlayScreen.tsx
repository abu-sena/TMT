import { useState } from "react";
import type { Mission } from "@/game/types";
import { CATEGORY_MAP, DIFFICULTY_MAP } from "@/game/constants";
import { GameButton } from "../game/GameButton";
import { cn } from "@/lib/utils";

interface Props {
  mission: Mission;
  onFinish: (result: { isCorrect: boolean; hintsUsed: number; attempts: number; selectedId: string }) => void;
  onQuit: () => void;
}

export function PlayScreen({ mission, onFinish, onQuit }: Props) {
  const cat = CATEGORY_MAP[mission.category];
  const diff = DIFFICULTY_MAP[mission.difficulty];
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const submit = () => {
    if (!selected) return;
    const isCorrect = selected === mission.correctOptionId;
    if (isCorrect || attempts >= 3) {
      setRevealed(true);
      setTimeout(() => {
        onFinish({ isCorrect, hintsUsed, attempts, selectedId: selected });
      }, 900);
    } else {
      setWrongIds((w) => [...w, selected]);
      setAttempts((a) => a + 1);
      setSelected(null);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-6 flex flex-col">
      <header className="px-4 pt-5 pb-2 flex items-center gap-2">
        <button onClick={onQuit} className="h-10 w-10 rounded-2xl bg-white/90 border-2 border-white grid place-items-center text-lg shadow-pop-sm" aria-label="Keluar">
          ✕
        </button>
        <div className="flex-1 flex gap-1.5 items-center">
          <span className="px-2.5 py-1 rounded-full bg-white/90 border border-[color:var(--wood)]/40 text-xs font-bold">
            {cat.emoji} {cat.short}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/90 border border-[color:var(--wood)]/40 text-xs font-bold">
            {diff.emoji} {diff.shortLabel}
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-gradient-heart text-white text-xs font-bold border border-white/40">
          Coba {attempts}/3
        </div>
      </header>

      <main className="flex-1 px-4 mt-2 space-y-4 max-w-md mx-auto w-full">
        {/* parchment story panel */}
        <div className="rounded-3xl bg-gradient-cream border-2 border-[color:var(--wood)]/50 shadow-card p-4">
          <h1 className="font-display font-black text-xl text-[color:var(--wood-dark)]">{mission.title}</h1>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">{mission.story}</p>
        </div>

        {/* question */}
        <div className="font-display font-bold text-base text-[color:var(--wood-dark)] px-1">
          {mission.question}
        </div>

        <div className="space-y-2">
          {mission.options.map((o, i) => {
            const isSel = selected === o.id;
            const wasWrong = wrongIds.includes(o.id);
            const isRight = revealed && o.id === mission.correctOptionId;
            const isWrongPick = revealed && isSel && o.id !== mission.correctOptionId;
            return (
              <button
                key={o.id}
                disabled={revealed || wasWrong}
                onClick={() => setSelected(o.id)}
                className={cn(
                  "w-full rounded-2xl border-2 p-3 text-left flex items-center gap-3 transition-all shadow-pop-sm",
                  isRight ? "bg-gradient-meadow border-leaf-dark text-primary-foreground" :
                  isWrongPick ? "bg-gradient-heart border-[color:var(--heart)] text-white" :
                  wasWrong ? "bg-stone-200 border-stone-300 text-stone-500" :
                  isSel ? "bg-gradient-sun border-[color:var(--wood)] -translate-y-0.5" :
                  "bg-white border-[color:var(--wood)]/40 hover:-translate-y-0.5",
                )}
              >
                <div className={cn(
                  "h-9 w-9 rounded-xl grid place-items-center font-display font-bold shrink-0 border-2",
                  isRight ? "bg-white/30 border-white/50" :
                  isWrongPick ? "bg-white/30 border-white/50" :
                  isSel ? "bg-white border-[color:var(--wood)]/60" : "bg-gradient-cream border-[color:var(--wood)]/40",
                )}>
                  {revealed && o.id === mission.correctOptionId ? "✓" :
                   revealed && isSel ? "✗" :
                   String.fromCharCode(65 + i)}
                </div>
                <div className="text-sm font-bold flex-1">{o.label}</div>
              </button>
            );
          })}
        </div>

        {showHint ? (
          <div className="rounded-2xl bg-gradient-sun/80 border-2 border-[color:var(--wood)]/40 p-3 text-sm">
            <span className="font-display font-bold">💡 Petunjuk: </span>
            {mission.hint}
          </div>
        ) : null}
      </main>

      <footer className="px-4 pt-3 pb-2 space-y-2 max-w-md mx-auto w-full">
        <div className="flex gap-2">
          <GameButton
            variant="secondary"
            size="md"
            onClick={() => {
              if (!showHint) {
                setShowHint(true);
                setHintsUsed((h) => h + 1);
              }
            }}
            disabled={showHint || revealed}
            leadingIcon="💡"
          >
            Petunjuk
          </GameButton>
          <GameButton variant="primary" size="md" full onClick={submit} disabled={!selected || revealed} trailingIcon="✓">
            Jawab
          </GameButton>
        </div>
      </footer>
    </div>
  );
}
