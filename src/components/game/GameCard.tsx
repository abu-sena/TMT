import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "cream" | "wood" | "leaf" | "white";

interface Props extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  children: ReactNode;
  padded?: boolean;
}

const tones: Record<Tone, string> = {
  cream: "bg-gradient-cream border-[color:var(--wood)]/40",
  wood: "bg-gradient-wood text-cream border-[color:var(--wood-dark)]",
  leaf: "bg-gradient-meadow text-primary-foreground border-leaf-dark/60",
  white: "bg-white border-border",
};

export function GameCard({ tone = "cream", padded = true, className, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-3xl border-2 shadow-card relative overflow-hidden",
        tones[tone],
        padded && "p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
