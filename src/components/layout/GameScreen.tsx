import { ReactNode } from "react";

interface GameScreenProps {
  children: ReactNode;
  /** Background class (default: bg-gradient-sky) */
  bgClass?: string;
  /** Whether the screen is scrollable (default: true). When true, uses fixed h-dvh + internal scroll so scroll stays inside the WebView. */
  scrollable?: boolean;
  className?: string;
}

/**
 * GameScreen — the outer shell for every main screen.
 *
 * Always fills the viewport (h-dvh) so that internal scroll containers
 * can work reliably inside Android WebView.
 *
 * Children should use flex-1 + overflow-y-auto on the content area
 * so that scroll stays inside this component, not on body.
 */
export function GameScreen({
  children,
  bgClass = "bg-gradient-sky",
  scrollable = true,
  className = "",
}: GameScreenProps) {
  return (
    <div
      className={`
        w-full flex flex-col
        ${bgClass}
        ${scrollable ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
