import type { BadgeDef } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  badge: BadgeDef;
  unlocked: boolean;
  onClick?: () => void;
}

export function BadgeCard({ badge, unlocked, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full p-4 text-center transition-all cursor-pointer",
        unlocked
          ? "surface-panel hover:-translate-y-1 active:translate-y-0"
          : "surface-panel opacity-60 grayscale border-[#B0A89A] bg-stone-100",
      )}
    >
      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-sun border-4 border-white grid place-items-center text-4xl shadow-pop-sm">
        {unlocked ? badge.emoji : "🔒"}
      </div>
      <div className="mt-3 font-display font-extrabold text-lg text-[#5A3515] leading-tight">{badge.name}</div>
      <div className="text-[11px] mt-0.5 text-muted-foreground leading-tight">
        {unlocked ? badge.description : badge.unlockHint}
      </div>
    </button>
  );
}
