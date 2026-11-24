import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "wood" | "danger" | "danger-outline" | "ghost" | "coin";
type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 min-h-11 text-sm rounded-xl",
  md: "px-4 py-2.5 min-h-11 text-sm sm:text-base rounded-2xl",
  lg: "px-5 py-3 min-h-12 text-base sm:text-lg rounded-[1.125rem]",
  xl: "px-6 py-3.5 min-h-14 text-lg sm:text-xl rounded-[1.25rem]",
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
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      data-variant={variant}
      className={cn(
        "tmt-game-button inline-flex min-w-0 max-w-full items-center justify-center gap-2 font-display font-extrabold select-none box-border whitespace-normal text-center",
        sizes[size],
        full && "w-full",
        className,
      )}
    >
      {leadingIcon ? <span className="tmt-button-icon" aria-hidden="true">{leadingIcon}</span> : null}
      <span className="tmt-button-label">{children}</span>
      {trailingIcon ? <span className="tmt-button-icon" aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}
