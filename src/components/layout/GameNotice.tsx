import type { ReactNode } from "react";
import { Check, Info, Lock, X } from "lucide-react";

const icons = { info: Info, success: Check, warning: Lock } as const;

export function GameNotice({ children, tone = "info", floating = false, onClose }: {
  children: ReactNode;
  tone?: keyof typeof icons;
  floating?: boolean;
  onClose?: () => void;
}) {
  const Icon = icons[tone];
  return (
    <div className={`tmt-game-notice${floating ? " tmt-game-notice-floating" : ""}`} data-tone={tone} role="status">
      <Icon size={17} aria-hidden="true" />
      <span>{children}</span>
      {onClose && (
        <button type="button" aria-label="Tutup pemberitahuan" onClick={onClose}><X size={17} aria-hidden="true" /></button>
      )}
    </div>
  );
}
