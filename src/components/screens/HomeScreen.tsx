import type { Profile } from "@/game/types";
import { DIFFICULTY_MAP } from "@/game/constants";
import { xpProgress } from "@/game/logic";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { XPBar } from "../game/XPBar";
import type { ScreenId } from "@/game/types";

interface Props {
  profile: Profile;
  onNavigate: (s: ScreenId) => void;
  onSwitchProfile: () => void;
}

export function HomeScreen({ profile, onNavigate, onSwitchProfile }: Props) {
  const diff = DIFFICULTY_MAP[profile.difficulty];
  const xp = xpProgress(profile);

  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-8">
      {/* top bar */}
      <header className="px-4 pt-6 pb-3">
        <GameCard tone="wood" padded={false} className="p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchProfile}
              className="h-14 w-14 rounded-2xl bg-white grid place-items-center text-3xl border-2 border-white/60 shadow-pop-sm shrink-0"
              aria-label="Ganti profil"
            >
              {profile.avatar}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-cream truncate">{profile.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-cream border border-white/30 shrink-0">
                  {diff.shortLabel}
                </span>
              </div>
              <div className="mt-1">
                <XPBar level={profile.level} current={xp.current} needed={xp.needed} percent={xp.percent} />
              </div>
            </div>
          </div>

          {/* resource bar */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ResourcePill icon="❤️" label={String(profile.hearts)} tone="heart" />
            <ResourcePill icon="🪙" label={String(profile.coins)} tone="coin" />
            <ResourcePill icon="⭐" label={String(profile.points)} tone="sun" />
          </div>
        </GameCard>
      </header>

      <main className="px-4 space-y-3 max-w-md mx-auto">
        <GameButton variant="primary" size="xl" full onClick={() => onNavigate("map")} leadingIcon="🗺️" trailingIcon="→">
          Lanjutkan Misi
        </GameButton>

        <div className="grid grid-cols-2 gap-3">
          <BigTile emoji="🌍" title="Peta Petualangan" onClick={() => onNavigate("map")} tone="meadow" />
          <BigTile emoji="🎯" title="Tantangan Harian" onClick={() => onNavigate("map")} tone="sun" />
          <BigTile emoji="🏅" title="Koleksi Badge" onClick={() => onNavigate("badges")} tone="coin" />
          <BigTile emoji="📊" title="Statistik" onClick={() => onNavigate("stats")} tone="cream" />
          <BigTile emoji="👨‍👩‍👧" title="Orang Tua" onClick={() => onNavigate("parent")} tone="wood" />
          <BigTile emoji="⚙️" title="Pengaturan" onClick={() => onNavigate("settings")} tone="cream" />
        </div>
      </main>
    </div>
  );
}

function ResourcePill({ icon, label, tone }: { icon: string; label: string; tone: "heart" | "coin" | "sun" }) {
  const toneCls =
    tone === "heart" ? "bg-gradient-heart text-white" :
    tone === "coin" ? "bg-gradient-coin text-[color:var(--wood-dark)]" :
    "bg-gradient-sun text-[color:var(--wood-dark)]";
  return (
    <div className={`rounded-2xl border-2 border-white/40 px-2 py-1.5 flex items-center justify-center gap-1.5 font-display font-bold shadow-pop-sm ${toneCls}`}>
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function BigTile({ emoji, title, onClick, tone }: { emoji: string; title: string; onClick: () => void; tone: "meadow" | "sun" | "coin" | "wood" | "cream" }) {
  const toneCls = {
    meadow: "bg-gradient-meadow text-primary-foreground border-leaf-dark/60",
    sun: "bg-gradient-sun text-[color:var(--wood-dark)] border-[color:var(--wood)]/60",
    coin: "bg-gradient-coin text-[color:var(--wood-dark)] border-[color:var(--wood)]/60",
    wood: "bg-gradient-wood text-cream border-[color:var(--wood-dark)]",
    cream: "bg-gradient-cream text-[color:var(--wood-dark)] border-[color:var(--wood)]/40",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border-2 p-4 shadow-pop active:translate-y-[2px] active:shadow-pop-sm text-left ${toneCls}`}
    >
      <div className="text-3xl">{emoji}</div>
      <div className="mt-1 font-display font-bold text-sm leading-tight">{title}</div>
    </button>
  );
}
