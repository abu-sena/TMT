import type { CategoryId } from "@/types";
import { CATEGORY_MAP } from "@/data/constants";

interface Props {
  category: CategoryId;
  correct: number;
  total: number;
}

export function CategoryProgress({ category, correct, total }: Props) {
  const info = CATEGORY_MAP[category];
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div className="rounded-2xl bg-white/70 border-2 border-[#8C6B45]/30 p-3">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-cream border border-[#8C6B45]/40 grid place-items-center text-xl shrink-0">
          {info.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate">{info.label}</div>
          <div className="text-[11px] text-muted-foreground">{correct} dari {total} benar</div>
        </div>
        <div className="font-display font-bold text-[color:var(--leaf-dark)]">{percent}%</div>
      </div>
      <div className="mt-2 h-3 rounded-full bg-black/10 overflow-hidden">
        <div className="h-full bg-gradient-xp rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
