import { useEffect, useState } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

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
  useEffect(() => { if (!open) setTyped(""); }, [open, mode]);

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

  return (
    <Dialog open={open} onOpenChange={value => { if (!value) onCancel(); }}>
      <DialogContent hideCloseButton className="z-[110] w-[calc(100%_-_2rem)] max-w-sm gap-0 rounded-[1.5rem] p-5 sm:p-6 text-center shadow-xl">
        <div aria-hidden="true" className="text-4xl mb-3">
          {mode === "delete-all" ? "⚠️" : "🗑️"}
        </div>
        <DialogTitle className="font-display font-black text-xl text-[#173c3a] mb-2">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm text-[#49625a] mb-2">{description}</DialogDescription>
        <p className="text-xs font-black text-[#A02020] mb-4">{warning}</p>

        <div className="mb-3">
          <p className="text-xs font-bold text-[#8C6B45] mb-2">
            Ketik <span className="font-black text-[#A02020]">{confirmationWord}</span> untuk melanjutkan:
          </p>
          <input
            type="text"
            aria-label={`Ketik ${confirmationWord} untuk konfirmasi`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmationWord}
            autoFocus
            className={`w-full text-center rounded-xl border-2 px-3 py-3 text-base font-display font-black uppercase tracking-wide ${
              isMatch
                ? "border-[#A02020] bg-[#A02020]/10 text-[#A02020]"
                : "border-[#CBB794] bg-white text-[#5A3515]"
            } outline-none transition-colors`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
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
      </DialogContent>
    </Dialog>
  );
}
