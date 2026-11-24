import { useState, useCallback, useEffect } from "react";
import { GameButton } from "@/components/ui/GameButton";
import { useGameStore } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onPass: () => void;
  onCancel: () => void;
  title?: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parent Gate — password protected area.
 * If password is not set, prompts to create one.
 */
export function ParentGate({ open, onPass, onCancel, title = "Area Orang Tua" }: Props) {
  const { store, updateGlobalState } = useGameStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [mode, setMode] = useState<"enter" | "create" | "confirm" | "recovery">("enter");

  const hasPassword = !!store.parentPasswordHash;

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setError("");
      setMode(hasPassword ? "enter" : "create");
    }
  }, [open, hasPassword]);

  const inputLabel = mode === "confirm"
    ? "Konfirmasi password baru"
    : mode === "recovery" ? "Kode reset" : "Password orang tua";

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async () => {
    if (!password.trim()) return;

    if (mode === "create") {
      if (password.length < 4) {
        triggerError("Password minimal 4 karakter.");
        return;
      }
      setMode("confirm");
      setError("");
      return;
    }

    if (mode === "confirm") {
      if (password !== confirmPassword) {
        triggerError("Password tidak cocok. Coba lagi.");
        setConfirmPassword("");
        return;
      }
      const hash = await hashPassword(password);
      updateGlobalState({ parentPasswordHash: hash });
      onPass();
      return;
    }

    if (mode === "enter") {
      const hash = await hashPassword(password);
      if (hash === store.parentPasswordHash) {
        onPass();
      } else {
        triggerError("Password belum tepat. Coba lagi atau minta bantuan orang tua.");
        setPassword("");
      }
      return;
    }
    
    if (mode === "recovery") {
      if (password === "RESET_12345") {
        updateGlobalState({ parentPasswordHash: null });
        setMode("create");
        setPassword("");
        setConfirmPassword("");
        setError("");
      } else {
        triggerError("Kode reset salah.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <DialogContent hideCloseButton className="z-[100] w-[calc(100%_-_2rem)] max-w-sm gap-0 rounded-[1.5rem] p-5 sm:p-6 text-center shadow-xl">
      <div className={shake ? "animate-boss-shake" : undefined}>
        <div className="text-5xl mb-3">🔐</div>
        <DialogTitle className="font-display font-black text-xl sm:text-2xl text-[#173c3a] mb-2 leading-snug">
          {title}
        </DialogTitle>
        
        <DialogDescription className="text-sm font-bold text-[#8C6B45] mb-4">
          {mode === "create" && "Buat password baru (minimal 4 karakter)."}
          {mode === "confirm" && "Konfirmasi password baru."}
          {mode === "enter" && "Masukkan password orang tua."}
          {mode === "recovery" && "Masukkan kode reset."}
        </DialogDescription>

        <div className="mb-4">
          {mode === "confirm" ? (
            <input
              id="parent-gate-password"
              type="password"
              inputMode="numeric"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Ulangi kata sandi"
              autoFocus
              className={`w-full text-center rounded-xl border-2 px-3 py-3 text-xl font-display font-black tracking-[0.2em] placeholder:text-sm placeholder:tracking-normal ${
                error ? "border-[#A02020] bg-[#A02020]/10 text-[#A02020]" : "border-[#CBB794] bg-white text-[#5A3515]"
              } outline-none focus:border-[#2E8B12] transition-colors`}
            />
          ) : (
            <input
              id="parent-gate-password"
              type={mode === "recovery" ? "text" : "password"}
              inputMode={mode === "recovery" ? "text" : "numeric"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={mode === "recovery" ? "Kode reset" : "Kata sandi"}
              autoFocus
              className={`w-full text-center rounded-xl border-2 px-3 py-3 text-xl font-display font-black tracking-[0.2em] placeholder:text-sm placeholder:tracking-normal ${
                error ? "border-[#A02020] bg-[#A02020]/10 text-[#A02020]" : "border-[#CBB794] bg-white text-[#5A3515]"
              } outline-none focus:border-[#2E8B12] transition-colors`}
            />
          )}
          <label htmlFor="parent-gate-password" className="sr-only">{inputLabel}</label>
          {error && (
            <p role="alert" aria-live="assertive" className="text-xs font-bold text-[#A02020] mt-2">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <GameButton variant="ghost" size="md" onClick={onCancel} full>
            Batal
          </GameButton>
          <GameButton
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={mode === "confirm" ? !confirmPassword.trim() : !password.trim()}
            full
          >
            Lanjutkan
          </GameButton>
        </div>
        
        {mode === "enter" && (
          <button type="button" onClick={() => { setMode("recovery"); setPassword(""); setError(""); }} className="tmt-text-button text-xs text-[#8C6B45] underline mt-2">
            Lupa Password?
          </button>
        )}
      </div>
      </DialogContent>
    </Dialog>
  );
}
