import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GameInput = forwardRef<HTMLInputElement, Props>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label ? (
          <label className="text-xs font-bold uppercase text-[#8C6B45] block mb-1">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-[18px] border-4 border-[#D4B483] bg-[#FFF9E6] px-4 py-3 text-base font-bold text-[#5A3515] placeholder:text-[#8C6B45]/50 focus:outline-none focus:border-[#2E8B12] shadow-inset-b transition-all",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GameInput.displayName = "GameInput";
