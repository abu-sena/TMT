import type { BadgeDef } from "@/game/types";
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
        "relative w-full rounded-3xl border-2 p-3 text-center transition-all shadow-card",
        unlocked
          ? "bg-gradient-cream border-[color:var(--wood)]/50 hover:-translate-y-0.5"
          : "bg-stone-200/70 border-stone-300 grayscale",
      )}
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-gradient-sun border-4 border-white grid place-items-center text-3xl shadow-pop-sm">
        {unlocked ? badge.emoji : "🔒"}
      </div>
      <div className="mt-2 font-display font-bold text-sm text-[color:var(--wood-dark)]">{badge.name}</div>
      <div className="text-[11px] mt-0.5 text-muted-foreground leading-tight">
        {unlocked ? badge.description : badge.unlockHint}
      </div>
    </button>
  );
}
