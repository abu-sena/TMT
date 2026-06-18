import { ReactNode } from "react";

interface GamePopupProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
}

export function GamePopup({ children, isOpen, className = "" }: GamePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 animate-pop-in">
      <div className={`w-full max-w-md max-h-[85dvh] flex flex-col overflow-hidden surface-panel p-0 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ScrollablePopupBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-5 ${className}`}>
      {children}
    </div>
  );
}
