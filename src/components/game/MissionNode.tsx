import { cn } from "@/lib/utils";

interface Props {
  number: number;
  state: "locked" | "available" | "completed";
  stars?: number;
  isBoss?: boolean;
  isBonus?: boolean;
  onClick?: () => void;
}

export function MissionNode({ number, state, stars = 0, isBoss, isBonus, onClick }: Props) {
  const baseRing =
    "relative grid place-items-center rounded-full border-4 transition-transform select-none";
  const sizeCls = isBoss ? "h-24 w-24" : "h-20 w-20";

  const stateCls =
    state === "locked"
      ? "bg-gradient-to-b from-stone-300 to-stone-400 border-stone-500 text-white/70 cursor-not-allowed"
      : state === "completed"
      ? "bg-gradient-coin border-[color:var(--wood)] text-[color:var(--wood-dark)] shadow-pop hover:scale-105"
      : isBoss
      ? "bg-gradient-heart border-[color:var(--heart)] text-white shadow-pop hover:scale-105 animate-bob"
      : isBonus
      ? "bg-gradient-sun border-[color:var(--wood)] text-[color:var(--wood-dark)] shadow-pop hover:scale-105 animate-bob"
      : "bg-gradient-meadow border-leaf-dark text-primary-foreground shadow-pop hover:scale-105 animate-bob";

  return (
    <button
      type="button"
      disabled={state === "locked"}
      onClick={onClick}
      className={cn(baseRing, sizeCls, stateCls)}
      aria-label={`Misi ${number}`}
    >
      {/* inner disc */}
      <div className="absolute inset-2 rounded-full bg-white/20 pointer-events-none" />
      <div className="relative font-display font-black text-2xl leading-none">
        {state === "locked" ? "🔒" : isBoss ? "👑" : isBonus ? "🎁" : number}
      </div>

      {/* stars under node */}
      {state === "completed" ? (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white border border-[color:var(--wood)]/40 shadow-pop-sm text-[10px] leading-none flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? "text-[color:var(--sun)]" : "text-black/15"}>★</span>
          ))}
        </div>
      ) : null}

      {/* badge label */}
      {isBoss && state !== "locked" ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[color:var(--heart)] text-white text-[10px] font-bold border-2 border-white shadow-pop-sm whitespace-nowrap">
          BOSS
        </div>
      ) : null}
    </button>
  );
}
