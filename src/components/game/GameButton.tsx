import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "wood" | "danger" | "ghost" | "coin";
type Size = "sm" | "md" | "lg" | "xl";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-meadow text-primary-foreground border-leaf-dark/60 shadow-pop hover:brightness-105 active:translate-y-[2px] active:shadow-pop-sm",
  secondary:
    "bg-gradient-sun text-[color:var(--wood-dark)] border-[color:var(--wood)]/60 shadow-pop hover:brightness-105 active:translate-y-[2px] active:shadow-pop-sm",
  wood:
    "bg-gradient-wood text-cream border-[color:var(--wood-dark)] shadow-pop hover:brightness-110 active:translate-y-[2px] active:shadow-pop-sm",
  danger:
    "bg-gradient-heart text-white border-[color:var(--heart)]/70 shadow-pop hover:brightness-105 active:translate-y-[2px] active:shadow-pop-sm",
  coin:
    "bg-gradient-coin text-[color:var(--wood-dark)] border-[color:var(--wood)]/60 shadow-pop hover:brightness-105 active:translate-y-[2px] active:shadow-pop-sm",
  ghost:
    "bg-white/70 text-foreground border-border hover:bg-white active:translate-y-[1px]",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-sm rounded-xl",
  md: "px-4 py-3 text-base rounded-2xl",
  lg: "px-5 py-4 text-lg rounded-2xl",
  xl: "px-6 py-5 text-xl rounded-3xl",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  full?: boolean;
}

export function GameButton({
  variant = "primary",
  size = "lg",
  leadingIcon,
  trailingIcon,
  full,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-display font-bold border-2 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
    >
      {leadingIcon ? <span className="text-xl leading-none">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="text-xl leading-none">{trailingIcon}</span> : null}
    </button>
  );
}
