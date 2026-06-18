import { useState } from "react";
import type { MultipleChoiceMission } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  mission: MultipleChoiceMission;
  revealed: boolean;
  selectedId: string | null;
  wrongIds: string[];
  onSelect: (id: string) => void;
}

export function MultipleChoiceRenderer({ mission, revealed, selectedId, wrongIds, onSelect }: Props) {
  return (
    <div className="space-y-4 w-full">
      {/* story panel */}
      <div className="surface-panel rounded-3xl p-5 mb-6">
        <h1 className="font-display font-black text-2xl text-[#5A3515] leading-tight">{mission.title}</h1>
        <p className="mt-2 text-base font-bold leading-relaxed text-[#8C6B45]">{mission.story}</p>
      </div>

      {/* instruction */}
      <div className="font-display font-black text-xl text-[#185E9F] px-2 mb-3 text-center bg-white/40 border-2 border-white/60 py-3 rounded-2xl shadow-sm">
        {mission.instruction}
      </div>

      <div className="space-y-2">
        {mission.options.map((o, i) => {
          const isSel = selectedId === o.id;
          const wasWrong = wrongIds.includes(o.id);
          const isRight = revealed && o.id === mission.correctAnswer;
          const isWrongPick = revealed && isSel && o.id !== mission.correctAnswer;
          
          return (
            <button
              key={o.id}
              disabled={revealed || wasWrong}
              onClick={() => onSelect(o.id)}
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
                isSel ? "bg-white/30 border-white/50 text-white" : "bg-[#F5E6B3] border-[#D4B483] text-[#8C6B45]",
              )}>
                {revealed && o.id === mission.correctAnswer ? "✓" :
                 revealed && isSel ? "✗" :
                 String.fromCharCode(65 + i)}
              </div>
              <div className="text-base font-black flex-1 break-words">{o.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
