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
      {/* top resource pills */}
      <header className="px-4 pt-5 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2">
          <ResourcePill icon="❤️" label={String(profile.hearts)} tone="heart" />
          <ResourcePill icon="🪙" label={String(profile.coins)} tone="coin" />
          <ResourcePill icon="💎" label={String(profile.points)} tone="gem" />
        </div>

        <h1 className="mt-6 text-center font-display font-black text-4xl text-game-title uppercase">
          Adab Quest
        </h1>

        {/* profile card */}
        <div className="mt-4 surface-panel rounded-3xl p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchProfile}
              className="h-14 w-14 rounded-2xl bg-white grid place-items-center text-3xl border-2 border-white/80 shadow-candy-sm shrink-0"
              aria-label="Ganti profil"
            >
              {profile.avatar}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-white truncate">{profile.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 shrink-0">
                  {diff.shortLabel}
                </span>
              </div>
              <div className="mt-1">
                <XPBar level={profile.level} current={xp.current} needed={xp.needed} percent={xp.percent} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 mt-4 space-y-3 max-w-md mx-auto">
        <GameButton variant="primary" size="xl" full onClick={() => onNavigate("map")} leadingIcon="🗺️" trailingIcon="→">
          Lanjutkan Misi
        </GameButton>

        <div className="grid grid-cols-2 gap-3">
          <BigTile emoji="🌍" title="Peta Petualangan" onClick={() => onNavigate("map")} tone="meadow" />
          <BigTile emoji="🎯" title="Tantangan Harian" onClick={() => onNavigate("map")} tone="blue" />
          <BigTile emoji="🏅" title="Koleksi Badge" onClick={() => onNavigate("badges")} tone="coin" />
          <BigTile emoji="📊" title="Statistik" onClick={() => onNavigate("stats")} tone="wood" />
          <BigTile emoji="👨‍👩‍👧" title="Orang Tua" onClick={() => onNavigate("parent")} tone="heart" />
          <BigTile emoji="⚙️" title="Pengaturan" onClick={() => onNavigate("settings")} tone="panel" />
        </div>
      </main>
    </div>
  );
}

function ResourcePill({ icon, label, tone }: { icon: string; label: string; tone: "heart" | "coin" | "gem" }) {
  const badgeBg =
    tone === "heart" ? "bg-gradient-heart" :
    tone === "coin" ? "bg-gradient-coin" :
    "bg-gradient-blue";
  return (
    <div className="relative h-10 rounded-full surface-panel flex items-center pl-10 pr-3">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full grid place-items-center text-xl ${badgeBg} shadow-candy-sm border-2 border-white/30`}>
        <span>{icon}</span>
      </div>
      <span className="ml-1 font-display font-extrabold text-white text-sm drop-shadow-[0_1px_0_rgba(0,0,0,0.5)]">
        {label}
      </span>
    </div>
  );
}

function BigTile({ emoji, title, onClick, tone }: { emoji: string; title: string; onClick: () => void; tone: "meadow" | "blue" | "coin" | "wood" | "heart" | "panel" }) {
  const toneCls = {
    meadow: "bg-gradient-meadow",
    blue: "bg-gradient-blue",
    coin: "bg-gradient-coin",
    wood: "bg-gradient-wood",
    heart: "bg-gradient-heart",
    panel: "bg-gradient-cream",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border-2 border-white/15 p-4 text-left text-white shadow-candy active:translate-y-[3px] active:shadow-candy-sm ${toneCls}`}
    >
      <div className="text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">{emoji}</div>
      <div className="mt-1 font-display font-extrabold text-sm leading-tight uppercase tracking-wide drop-shadow-[0_1px_0_rgba(0,0,0,0.45)]">{title}</div>
    </button>
  );
}
