import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { BossMission, BossStep } from "@/types";
import { CATEGORY_MAP } from "@/data/constants";

interface BossStepResult {
  stepId: string;
  selectedId: string;
  isCorrect: boolean;
  attempts: number;
  hintsUsed: number;
}

interface Props {
  mission: BossMission;
  revealed: boolean;
  selectedId: string | null;
  wrongIds: string[];
  onSelect: (id: string) => void;
  onBossComplete: (results: BossStepResult[]) => void;
}

export function BossMissionRenderer({ mission, revealed, selectedId, wrongIds, onSelect, onBossComplete }: Props) {
  const [phase, setPhase] = useState<"intro" | "step" | "result">("intro");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<BossStepResult[]>([]);
  const [stepAttempts, setStepAttempts] = useState(1);
  const [stepWrongIds, setStepWrongIds] = useState<string[]>([]);
  const [stepHintsUsed, setStepHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [stepSelected, setStepSelected] = useState<string | null>(null);
  const [stepRevealed, setStepRevealed] = useState(false);
  const [introAnimClass, setIntroAnimClass] = useState("animate-pop-in");

  const totalSteps = mission.steps.length;
  const currentStep = mission.steps[currentStepIndex];

  const handleIntroContinue = () => {
    setPhase("step");
  };

  const handleStepSelect = (id: string) => {
    if (stepRevealed) return;
    setStepSelected(id);
  };

  const handleStepSubmit = () => {
    if (!stepSelected || !currentStep) return;

    const isCorrect = stepSelected === currentStep.correctAnswer;

    if (isCorrect || stepAttempts >= 3) {
      setStepRevealed(true);
      const result: BossStepResult = {
        stepId: currentStep.id,
        selectedId: stepSelected,
        isCorrect,
        attempts: stepAttempts,
        hintsUsed: stepHintsUsed,
      };

      setTimeout(() => {
        setStepResults(prev => [...prev, result]);

        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex(prev => prev + 1);
          setStepSelected(null);
          setStepRevealed(false);
          setStepAttempts(1);
          setStepWrongIds([]);
          setStepHintsUsed(0);
          setShowHint(false);
        } else {
          setPhase("result");
          const finalResults = [...stepResults, result];
          setStepResults(finalResults);
          onBossComplete(finalResults);
        }
      }, 1200);
    } else {
      setStepWrongIds(prev => [...prev, stepSelected]);
      setStepAttempts(prev => prev + 1);
      setStepSelected(null);
    }
  };

  const handleShowHint = () => {
    if (!showHint && !stepRevealed) {
      setShowHint(true);
      setStepHintsUsed(prev => prev + 1);
    }
  };

  // ── INTRO PHASE ──
  if (phase === "intro") {
    return (
      <div className="space-y-4 w-full">
        {/* Boss header */}
        <div
          className="relative rounded-3xl p-5 text-center border-4 shadow-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${mission.bossThemeColor}dd, ${mission.bossThemeColor}88, #1a1a2e)`,
            borderColor: mission.bossThemeColor,
          }}
        >
          {/* Sparkle effects */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <span className="absolute top-3 left-6 text-4xl animate-float opacity-80" style={{ animationDelay: "0s" }}>✨</span>
            <span className="absolute top-10 right-8 text-3xl animate-float opacity-70" style={{ animationDelay: "0.5s" }}>⭐</span>
            <span className="absolute bottom-6 left-10 text-2xl animate-float opacity-60" style={{ animationDelay: "1s" }}>💫</span>
            <span className="absolute bottom-4 right-6 text-4xl animate-float opacity-80" style={{ animationDelay: "0.3s" }}>✨</span>
          </div>

          <div className="relative z-10">
            <div className="text-7xl mb-3 drop-shadow-lg animate-bob">{mission.bossEmoji}</div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 border-2 border-white/40 text-white text-xs font-black uppercase tracking-widest mb-2 backdrop-blur-sm">
              ⚡ M I S I &nbsp; B O S S ⚡
            </div>
            <h1 className="font-display font-black text-3xl text-white drop-shadow-lg leading-tight mt-1">
              {mission.title}
            </h1>
            <div className="mt-3 flex justify-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/25 border border-white/30 text-white text-xs font-bold backdrop-blur-sm">
                {totalSteps} Langkah
              </span>
              <span className="px-3 py-1 rounded-full bg-gradient-coin border border-[#D48806] text-white text-xs font-bold">
                ⭐ {mission.basePoint * mission.bossRewardMultiplier} Poin
              </span>
            </div>
          </div>
        </div>

        {/* Story narration */}
        <div className="surface-panel rounded-3xl p-5 border-2 border-[#D4B483]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📜</span>
            <span className="font-display font-black text-sm text-[#8C6B45] uppercase tracking-wide">Prolog</span>
          </div>
          <p className="text-base font-bold text-[#5A3515] leading-relaxed whitespace-pre-line">
            {mission.bossIntro}
          </p>
        </div>

        {/* Narration */}
        <div className="rounded-2xl bg-[#1a1a2e] border-2 border-[#333] p-4 text-center">
          <p className="text-sm font-bold text-[#aab] italic">
            "{mission.bossIntroNarration}"
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={handleIntroContinue}
          className="w-full py-4 rounded-2xl font-display font-black text-xl text-white border-b-4 shadow-lg active:translate-y-1 active:border-b-0 transition-all animate-bob"
          style={{
            background: `linear-gradient(135deg, ${mission.bossThemeColor}, ${mission.bossThemeColor}cc)`,
            borderColor: mission.bossThemeColor,
          }}
        >
          ⚔️ Mulai Misi Boss!
        </button>
      </div>
    );
  }

  // ── STEP PHASE ──
  if (phase === "step" && currentStep) {
    const cat = CATEGORY_MAP[currentStep.category];

    return (
      <div className="space-y-4 w-full">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-[#8C6B45] uppercase tracking-widest">
              Langkah {currentStepIndex + 1} dari {totalSteps}
            </span>
            <span className="text-xs font-black text-[#8C6B45]">
              {Math.round(((currentStepIndex) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-[#E8DCC2] border-2 border-[#CBB794] overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${((currentStepIndex) / totalSteps) * 100}%`,
                background: `linear-gradient(90deg, ${mission.bossThemeColor}, ${mission.bossThemeColor}cc)`,
              }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-center gap-2">
            {mission.steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-3 w-3 rounded-full border-2 transition-all duration-300",
                  i < currentStepIndex
                    ? "border-[#2E8B12] bg-[#2E8B12] scale-110"
                    : i === currentStepIndex
                    ? "border-[#D48806] bg-[#D48806] animate-pulse scale-125"
                    : "border-[#CBB794] bg-[#D8CFC0]",
                )}
              />
            ))}
          </div>
        </div>

        {/* Step header */}
        <div className="rounded-2xl p-4 flex items-center gap-3 border-2"
          style={{
            background: `${mission.bossThemeColor}15`,
            borderColor: `${mission.bossThemeColor}55`,
          }}
        >
          <div className="h-12 w-12 rounded-xl grid place-items-center text-2xl shrink-0"
            style={{ background: `${mission.bossThemeColor}25`, border: `2px solid ${mission.bossThemeColor}40` }}
          >
            {cat.emoji}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-[#8C6B45]">{cat.short} · Step {currentStep.stepNumber}</div>
            <h3 className="font-display font-black text-lg text-[#5A3515] leading-tight">{currentStep.title}</h3>
          </div>
        </div>

        {/* Story */}
        <div className="surface-panel rounded-3xl p-5">
          <p className="text-base font-bold text-[#5A3515] leading-relaxed whitespace-pre-line">{currentStep.story}</p>
        </div>

        {/* Instruction */}
        <div className="font-display font-black text-lg text-[#185E9F] px-3 text-center bg-white/40 border-2 border-white/60 py-3 rounded-2xl shadow-sm">
          {currentStep.instruction}
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentStep.options.map((o, i) => {
            const isSel = stepSelected === o.id;
            const wasWrong = stepWrongIds.includes(o.id);
            const isRight = stepRevealed && o.id === currentStep.correctAnswer;
            const isWrongPick = stepRevealed && isSel && o.id !== currentStep.correctAnswer;

            return (
              <button
                key={o.id}
                disabled={stepRevealed || wasWrong}
                onClick={() => handleStepSelect(o.id)}
                className={cn(
                  "w-full rounded-2xl border-4 p-3 text-left flex items-center gap-3 transition-all",
                  isRight ? "bg-gradient-meadow border-[#2E8B12] text-white shadow-candy-sm" :
                  isWrongPick ? "bg-gradient-heart border-[#A02020] text-white shadow-candy-sm" :
                  wasWrong ? "bg-stone-200 border-stone-300 text-stone-400 grayscale" :
                  isSel ? "bg-gradient-blue border-[#185E9F] text-white -translate-y-1 shadow-pop-sm" :
                  "bg-white border-[#B0A89A] text-[#5A3515] shadow-pop-sm hover:-translate-y-1",
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl grid place-items-center font-display font-black shrink-0 border-2 text-lg",
                  isRight ? "bg-white/30 border-white/50 text-white" :
                  isWrongPick ? "bg-white/30 border-white/50 text-white" :
                  isSel ? "bg-white/30 border-white/50 text-white" :
                  "bg-[#F5E6B3] border-[#D4B483] text-[#8C6B45]",
                )}>
                  {stepRevealed && o.id === currentStep.correctAnswer ? "✓" :
                   stepRevealed && isSel ? "✗" :
                   String.fromCharCode(65 + i)}
                </div>
                <div className="text-base font-black flex-1">{o.label}</div>
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {showHint && (
          <div className="rounded-2xl bg-gradient-sun border-2 border-[#D48806] p-4 text-base font-bold text-[#5A3515] shadow-pop-sm animate-pop-in">
            <span className="font-display font-black text-[#8C6B45]">💡 Petunjuk: </span>
            {currentStep.hintLevels?.[0] || "Tidak ada petunjuk lebih lanjut."}
          </div>
        )}

        {/* Explanation after reveal */}
        {stepRevealed && (
          <div className="rounded-2xl surface-panel border-2 border-[#D4B483] p-4 animate-pop-in">
            <div className="text-sm font-black uppercase text-[#8C6B45] mb-1">Penjelasan</div>
            <p className="text-sm font-bold text-[#5A3515] leading-relaxed">{currentStep.explanation}</p>
          </div>
        )}

        {/* Action buttons */}
        {!stepRevealed && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleShowHint}
              disabled={showHint}
              className="px-4 py-3 rounded-2xl bg-gradient-sun border-2 border-[#D48806] text-[#5A3515] font-black text-sm shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              💡 Petunjuk
            </button>
            <button
              onClick={handleStepSubmit}
              disabled={!stepSelected}
              className="flex-1 py-3 rounded-2xl font-black text-white border-b-4 shadow-sm active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50 disabled:translate-y-0"
              style={{
                background: `linear-gradient(135deg, ${mission.bossThemeColor}, ${mission.bossThemeColor}cc)`,
                borderColor: mission.bossThemeColor,
              }}
            >
              {stepAttempts > 1 ? `Jawab (Coba ${stepAttempts}/3)` : "Jawab ✓"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── RESULT PHASE (summary before final evaluation) ──
  if (phase === "result") {
    const correctCount = stepResults.filter(r => r.isCorrect).length;
    const totalAttempts = stepResults.reduce((sum, r) => sum + r.attempts, 0);
    const allCorrect = correctCount === totalSteps;

    return (
      <div className="space-y-4 w-full">
        {/* Completion header */}
        <div
          className="relative rounded-3xl p-5 text-center border-4 shadow-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${mission.bossThemeColor}dd, ${mission.bossThemeColor}88, #1a1a2e)`,
            borderColor: mission.bossThemeColor,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {/* Animated stars */}
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-2xl opacity-0"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 80}%`,
                  animation: `boss-star-pop 0.6s ${0.3 + i * 0.15}s ease-out forwards`,
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="relative z-10">
            <div className="text-7xl mb-2 drop-shadow-lg">
              {allCorrect ? "🏆" : correctCount >= totalSteps / 2 ? "🎖️" : "💪"}
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white drop-shadow-lg">
              {allCorrect ? "Boss Dikalahkan!" : "Misi Boss Selesai!"}
            </h2>
            <p className="text-white/80 text-sm font-bold mt-1">
              {correctCount}/{totalSteps} langkah benar
            </p>
          </div>
        </div>

        {/* Step-by-step results */}
        <div className="surface-panel rounded-3xl p-4 space-y-2">
          <h3 className="font-display font-black text-sm text-[#8C6B45] uppercase mb-2">Rincian Langkah</h3>
          {mission.steps.map((step, i) => {
            const result = stepResults[i];
            const isCorrect = result?.isCorrect ?? false;
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all",
                  isCorrect
                    ? "bg-gradient-meadow/10 border-[#2E8B12]/30"
                    : "bg-gradient-heart/10 border-[#A02020]/30",
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl grid place-items-center shrink-0 text-lg",
                  isCorrect ? "bg-[#2E8B12]/20" : "bg-[#A02020]/20",
                )}>
                  {isCorrect ? "✅" : "❌"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-sm text-[#5A3515] truncate">{step.title}</div>
                  <div className="text-xs text-[#8C6B45]">
                    {isCorrect
                      ? result.attempts === 1 ? "Benar di percobaan pertama!" : `Benar di percobaan ke-${result.attempts}`
                      : "Belum tepat"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final evaluation */}
        <div className="rounded-2xl p-5 border-2 text-center"
          style={{
            background: `${mission.bossThemeColor}10`,
            borderColor: `${mission.bossThemeColor}40`,
          }}
        >
          <div className="text-3xl mb-2">{mission.bossEmoji}</div>
          <p className="text-base font-bold text-[#5A3515] leading-relaxed whitespace-pre-line">
            {mission.finalEvaluation}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
