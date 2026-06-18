import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "cream" | "wood" | "leaf" | "white" | "blue" | "coin" | "heart" | "meadow";

interface Props extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  children: ReactNode;
  padded?: boolean;
}

const tones: Record<Tone, string> = {
  cream: "surface-panel",
  wood: "surface-wood text-white",
  leaf: "bg-gradient-meadow text-white border-4 border-[#2E8B12] rounded-[26px] shadow-card",
  white: "bg-white border-2 border-border rounded-[26px] shadow-pop-sm",
  blue: "bg-gradient-blue text-white border-4 border-[#185E9F] rounded-[26px] shadow-card",
  coin: "bg-gradient-coin text-[#5A3515] border-4 border-[#D48806] rounded-[26px] shadow-card",
  heart: "bg-gradient-heart text-white border-4 border-[#A02020] rounded-[26px] shadow-card",
  meadow: "bg-gradient-meadow text-white border-4 border-[#2E8B12] rounded-[26px] shadow-card",
};

export function GameCard({ tone = "cream", padded = true, className, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        "relative overflow-hidden",
        tones[tone],
        padded && "p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
