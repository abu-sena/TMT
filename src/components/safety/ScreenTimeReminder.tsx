import { GameButton } from "@/components/ui/GameButton";
import { CelebrationArt } from "@/components/rewards/GameCelebrationDialog";

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
      <div className="surface-panel tmt-dialog-surface rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border text-center animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="tmt-break-title">
        <CelebrationArt kind="break" />
        <h2 id="tmt-break-title" className="font-display font-black text-2xl text-[#173c3a] mb-2">
          Waktunya istirahat
        </h2>
        <p className="text-base font-bold text-[#8C6B45] mb-1">
          Kamu sudah bermain selama{" "}
          <span className="text-[#5A3515]">{minutes} menit</span>.
        </p>
        <p className="text-sm font-bold text-[#49625a] mb-4">
          Regangkan badan, minum air, atau istirahat sebentar.
        </p>
        <div className="flex gap-3">
          <GameButton variant="primary" size="md" onClick={onDismiss} full>
            Istirahat dulu
          </GameButton>
          <GameButton variant="secondary" size="md" onClick={onExtend} full>
            Tambah 15 Menit
          </GameButton>
        </div>
      </div>
    </div>
  );
}
