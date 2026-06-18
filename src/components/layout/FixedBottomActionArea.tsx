import { ReactNode } from "react";

interface FixedBottomActionAreaProps {
  children: ReactNode;
  /** Whether the container is sticky or flex-end. (default: true = sticky) */
  sticky?: boolean;
  className?: string;
}

/**
 * FixedBottomActionArea — bottom action bar.
 *
 * - When sticky=true (default): sticks to the bottom of the parent,
 *   works best when parent is a flex-col with flex-1 scrollable body.
 * - When sticky=false: sits at the end of content flow.
 */
export function FixedBottomActionArea({
  children,
  sticky = true,
  className = "",
}: FixedBottomActionAreaProps) {
  return (
    <div
      className={`
        shrink-0 z-10
        w-full px-4 pt-4 pb-safe
        bg-gradient-to-t from-white/95 via-white/85 to-transparent
        ${className}
      `}
    >
      <div className="content-wrapper flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}
