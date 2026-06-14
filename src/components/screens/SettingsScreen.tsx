import type { Profile, ProfileSettings } from "@/game/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";

interface Props {
  profile: Profile;
  onBack: () => void;
  onUpdate: (s: Partial<ProfileSettings>) => void;
  onReset: () => void;
  onSwitchProfile: () => void;
}

export function SettingsScreen({ profile, onBack, onUpdate, onReset, onSwitchProfile }: Props) {
  const s = profile.settings;
  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-8">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="h-12 w-12 rounded-2xl bg-black/30 border border-white/15 text-white grid place-items-center text-xl shadow-pop-sm shrink-0" aria-label="Kembali">←</button>
        <div className="flex-1">
          <h1 className="font-display font-black text-2xl text-[color:var(--wood-dark)]">Pengaturan</h1>
          <p className="text-sm text-[color:var(--wood-dark)]/80">Sesuaikan permainan</p>
        </div>
        <div className="text-3xl">⚙️</div>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-3">
        <GameCard tone="cream" padded={false}>
          <Row label="🔊 Suara Efek" value={s.sound} onToggle={(v) => onUpdate({ sound: v })} />
          <Divider />
          <Row label="🎵 Musik Latar" value={s.music} onToggle={(v) => onUpdate({ music: v })} />
          <Divider />
          <Row label="☁️ Sinkron Google" value={s.googleConnected} onToggle={(v) => onUpdate({ googleConnected: v })} hint="Opsional — cadangkan progres" />
          <Divider />
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-bold">🌐 Bahasa</div>
              <div className="text-xs text-muted-foreground">Indonesia</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-gradient-meadow text-primary-foreground text-xs font-bold">ID</span>
          </div>
          <Divider />
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-bold">📶 Mode Offline</div>
              <div className="text-xs text-muted-foreground">Semua misi tersimpan lokal</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-gradient-coin text-[color:var(--wood-dark)] text-xs font-bold">Aktif</span>
          </div>
        </GameCard>

        <GameButton variant="secondary" size="md" full leadingIcon="👤" onClick={onSwitchProfile}>
          Ganti Profil
        </GameButton>

        <GameButton
          variant="danger"
          size="md"
          full
          leadingIcon="🗑️"
          onClick={() => {
            if (confirm("Reset semua progres untuk profil ini? Tindakan tidak bisa dibatalkan.")) {
              onReset();
            }
          }}
        >
          Reset Progres
        </GameButton>

        <GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Beranda</GameButton>

        <div className="pt-2 text-center text-xs text-[color:var(--wood-dark)]/70">
          Adab Quest · Prototype v0.1
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, onToggle, hint }: { label: string; value: boolean; onToggle: (v: boolean) => void; hint?: string }) {
  return (
    <button onClick={() => onToggle(!value)} className="w-full flex items-center justify-between px-4 py-3 text-left">
      <div>
        <div className="font-bold">{label}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </div>
      <span className={`relative inline-flex h-7 w-12 rounded-full border-2 transition-colors ${value ? "bg-gradient-meadow border-leaf-dark" : "bg-stone-300 border-stone-400"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-[color:var(--wood)]/20 mx-3" />;
}
