interface Props {
  level: number;
  current: number;
  needed: number;
  percent: number;
  compact?: boolean;
}

export function XPBar({ level, current, needed, percent, compact }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="grid place-items-center h-8 w-8 rounded-full bg-gradient-sun border-2 border-[color:var(--wood)]/60 text-sm font-display font-bold text-[color:var(--wood-dark)] shadow-pop-sm shrink-0">
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-4 rounded-full bg-black/15 border border-black/10 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-xp rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {!compact ? (
            <div className="mt-1 text-[10px] font-bold text-[color:var(--wood-dark)]/80 text-right">
              {current} / {needed} XP
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
