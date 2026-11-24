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
  const sizeCls = isBoss ? "h-20 w-20 sm:h-24 sm:w-24" : "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20";

  const stateCls =
    state === "locked"
      ? "bg-[#D8CFC0] border-[#B0A89A] text-white/50 cursor-not-allowed shadow-sm"
      : state === "completed"
      ? "bg-gradient-coin border-[#D48806] text-[#5A3515] shadow-pop hover:-translate-y-1 active:translate-y-0"
      : isBoss
      ? "bg-gradient-heart border-[#A02020] text-white shadow-pop hover:-translate-y-1 active:translate-y-0 animate-bob"
      : isBonus
      ? "bg-gradient-sun border-[#D48806] text-[#5A3515] shadow-pop hover:-translate-y-1 active:translate-y-0 animate-bob"
      : "bg-gradient-meadow border-[#2E8B12] text-white shadow-pop hover:-translate-y-1 active:translate-y-0 animate-bob";

  return (
    <button
      type="button"
      disabled={state === "locked"}
      onClick={onClick}
      className={cn("tmt-choice-button", baseRing, sizeCls, stateCls)}
      aria-label={`Misi ${number}`}
    >
      {/* inner disc */}
      <div className="absolute inset-2 rounded-full bg-white/20 pointer-events-none" />
      <div className="relative font-display font-black text-2xl leading-none">
        {state === "locked" ? "🔒" : isBoss ? "👑" : isBonus ? "🎁" : number}
      </div>

      {/* stars under node */}
      {state === "completed" ? (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white border-2 border-[#D48806] shadow-pop-sm text-[10px] leading-none flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? "text-[#FFD700] drop-shadow-sm" : "text-black/10"}>★</span>
          ))}
        </div>
      ) : null}

      {/* badge label */}
      {isBoss && state !== "locked" ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-heart text-white text-[10px] font-extrabold border-2 border-[#A02020] shadow-pop-sm whitespace-nowrap">
          BOSS
        </div>
      ) : null}
    </button>
  );
}
