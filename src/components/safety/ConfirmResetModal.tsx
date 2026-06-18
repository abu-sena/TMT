import { useState } from "react";
import { GameButton } from "@/components/ui/GameButton";

interface Props {
  open: boolean;
  profileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  mode?: "reset-profile" | "delete-all";
}

/**
 * Enhanced confirmation modal for destructive actions.
 * Requires typing a confirmation word to prevent accidental taps.
 */
export function ConfirmResetModal({ open, profileName, onConfirm, onCancel, mode = "reset-profile" }: Props) {
  const [typed, setTyped] = useState("");

  const confirmationWord = mode === "delete-all" ? "HAPUS SEMUA" : "RESET";
  const isMatch = typed.trim().toUpperCase() === confirmationWord;

  const title =
    mode === "delete-all"
      ? "Hapus Semua Data"
      : `Reset Progres ${profileName}`;
  const description =
    mode === "delete-all"
      ? `Ini akan menghapus SEMUA profil dan data dari perangkat ini. Semua progres akan hilang selamanya.`
      : `Ini akan menghapus semua progres belajar ${profileName}: poin, bintang, badge, level — semuanya kembali ke awal. Profil tetap ada.`;
  const warning =
    "Tindakan ini tidak bisa dibatalkan.";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="surface-panel rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border-4 border-[#D4B483] text-center">
        <div className="text-5xl mb-3">
          {mode === "delete-all" ? "⚠️" : "🗑️"}
        </div>
        <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">
          {title}
        </h2>
        <p className="text-sm font-bold text-[#8C6B45] mb-1">{description}</p>
        <p className="text-xs font-black text-[#A02020] mb-4">{warning}</p>

        <div className="mb-3">
          <p className="text-xs font-bold text-[#8C6B45] mb-2">
            Ketik <span className="font-black text-[#A02020]">{confirmationWord}</span> untuk melanjutkan:
          </p>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmationWord}
            autoFocus
            className={`w-full text-center rounded-[18px] border-4 px-4 py-3 text-lg font-display font-black uppercase tracking-widest ${
              isMatch
                ? "border-[#A02020] bg-[#A02020]/10 text-[#A02020]"
                : "border-[#CBB794] bg-white text-[#5A3515]"
            } outline-none transition-colors`}
          />
        </div>

        <div className="flex gap-3">
          <GameButton variant="ghost" size="md" onClick={onCancel} full>
            Batal
          </GameButton>
          <GameButton
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={!isMatch}
            full
          >
            {mode === "delete-all" ? "Hapus Semua" : "Reset Progres"}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
