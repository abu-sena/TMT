import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { DifficultyInfo } from "@/types";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  difficulty: DifficultyInfo;
  selected: boolean;
  onSelect: () => void;
}

export function DifficultyCard({ difficulty, selected, onSelect, className, ...rest }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-[18px] border-4 p-3 text-left transition-all active:translate-y-[2px] w-full flex flex-col justify-center",
        selected
          ? "bg-gradient-sun border-[#D48806] shadow-candy-sm text-[#3a2400]"
          : "bg-[#E8DCC2] border-[#CBB794] text-[#5A3515] hover:border-[#8C6B45] shadow-sm",
        className
      )}
      {...rest}
    >
      <div className="font-display font-bold text-base flex items-center gap-1.5">
        <span className="text-xl">{difficulty.emoji}</span>
        {difficulty.label}
      </div>
      <div className="text-[12px] font-medium opacity-80 mt-1 pl-7 leading-tight">
        {difficulty.description}
      </div>
    </button>
  );
}
