import { cn } from "@/lib/utils";

interface Props {
  count: number; // 0..3
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

const sizes = {
  sm: "text-base gap-0.5",
  md: "text-xl gap-1",
  lg: "text-3xl gap-1.5",
  xl: "text-5xl gap-2",
};

export function RewardStars({ count, size = "md", animated }: Props) {
  return (
    <div className={cn("inline-flex items-center", sizes[size])}>
      {[0, 1, 2].map((i) => {
        const filled = i < count;
        return (
          <span
            key={i}
            className={cn(
              filled ? "text-[color:var(--sun)] drop-shadow-[0_2px_0_oklch(0.55_0.18_75)]" : "text-black/15",
              animated && filled && "animate-star-burst",
            )}
            style={animated && filled ? { animationDelay: `${i * 120}ms` } : undefined}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
