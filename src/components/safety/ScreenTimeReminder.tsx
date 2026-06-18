import { GameButton } from "@/components/ui/GameButton";

interface Props {
  open: boolean;
  minutes: number;
  onDismiss: () => void;
  onExtend: () => void;
}

/**
 * Gentle screen time reminder — shows a friendly popup
 * when the player has reached their daily limit.
 *
 * Does NOT lock the game — just reminds and suggests a break.
 */
export function ScreenTimeReminder({ open, minutes, onDismiss, onExtend }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="surface-panel rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border-4 border-[#D4B483] text-center animate-pop-in">
        <div className="text-6xl mb-3">⏰</div>
        <h2 className="font-display font-black text-2xl text-[#5A3515] mb-2">
          Waktu Istirahat!
        </h2>
        <p className="text-base font-bold text-[#8C6B45] mb-1">
          Kamu sudah bermain selama{" "}
          <span className="text-[#5A3515]">{minutes} menit</span>.
        </p>
        <p className="text-sm font-bold text-[#8C6B45]/70 mb-4">
          Yuk istirahat dulu, stretching, minum air, atau shalat.{"\n"}
          Belajar dan bermain itu seru, tapi badan juga butuh istirahat! 🌟
        </p>
        <div className="flex gap-3">
          <GameButton variant="ghost" size="md" onClick={onDismiss} full>
            Baik, Istirahat Dulu
          </GameButton>
          <GameButton variant="secondary" size="md" onClick={onExtend} full>
            Tambah 15 Menit
          </GameButton>
        </div>
      </div>
    </div>
  );
}
