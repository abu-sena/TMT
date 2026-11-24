import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "wood" | "danger" | "ghost" | "coin";
type Size = "sm" | "md" | "lg" | "xl";

const baseCandy =
  "shadow-candy hover:brightness-110 active:translate-y-[4px] active:shadow-candy-sm border-2 border-b-4";

const variants: Record<Variant, string> = {
  primary:
    `bg-gradient-meadow text-white border-[#2E8B12] ${baseCandy}`,
  secondary:
    `bg-gradient-blue text-white border-[#185E9F] ${baseCandy}`,
  wood:
    `bg-gradient-wood text-white border-[#5A3515] ${baseCandy}`,
  danger:
    `bg-gradient-heart text-white border-[#A02020] ${baseCandy}`,
  coin:
    `bg-gradient-coin text-[#5A3515] border-[#D48806] ${baseCandy}`,
  ghost:
    "bg-white/10 text-white border-white/20 backdrop-blur-sm hover:bg-white/20 active:translate-y-[2px] shadow-pop-sm border-2",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 min-h-10 text-sm rounded-[16px]",
  md: "px-5 py-2.5 min-h-11 text-base rounded-[20px]",
  lg: "px-6 py-3.5 min-h-13 text-lg rounded-[28px]",
  xl: "px-8 py-4 min-h-[72px] text-xl rounded-[32px]",
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
        "inline-flex items-center justify-center gap-2 font-display font-extrabold tracking-wide uppercase transition-[filter,transform,box-shadow] duration-150 ease-out select-none disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-sm max-w-full overflow-hidden box-border whitespace-normal break-words",
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
