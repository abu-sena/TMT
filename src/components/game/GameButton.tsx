import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "wood" | "danger" | "ghost" | "coin";
type Size = "sm" | "md" | "lg" | "xl";

const baseCandy =
  "shadow-candy hover:brightness-110 active:translate-y-[3px] active:shadow-candy-sm";

const variants: Record<Variant, string> = {
  primary:
    `bg-gradient-meadow text-white border-transparent ${baseCandy}`,
  secondary:
    `bg-gradient-blue text-white border-transparent ${baseCandy}`,
  wood:
    `bg-gradient-wood text-white border-transparent ${baseCandy}`,
  danger:
    `bg-gradient-heart text-white border-transparent ${baseCandy}`,
  coin:
    `bg-gradient-coin text-white border-transparent ${baseCandy}`,
  ghost:
    "bg-white/8 text-white border-white/15 backdrop-blur-sm hover:bg-white/12 active:translate-y-[1px] shadow-pop-sm",
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
        "inline-flex items-center justify-center gap-2 font-display font-extrabold tracking-wide uppercase text-[0.95em] border-2 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]",
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
