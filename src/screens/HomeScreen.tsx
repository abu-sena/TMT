import type { Profile, ScreenId } from "@/types";
import { DIFFICULTY_MAP, DIFFICULTY_UI_LABELS } from "@/data/constants";
import { xpProgress } from "@/lib/leveling";
import { getNextDifficulty, checkDifficultyUpgrade } from "@/lib/progress";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { XPBar } from "../game/XPBar";
import { GameScreen } from "@/components/layout/GameScreen";
import { useGameStore } from "@/lib/storage";

interface Props {
  profile: Profile;
  onNavigate: (s: ScreenId) => void;
  onSwitchProfile: () => void;
}

export function HomeScreen({ profile, onNavigate, onSwitchProfile }: Props) {
  const { store } = useGameStore();
  const diff = DIFFICULTY_MAP[profile.difficulty];
  const xp = xpProgress(profile);

  // Next reward
  const nextReward = (store.rewardMilestones || [])
    .filter((r) => r.profileId === profile.id && r.isActive && !r.isUnlocked)
    .sort((a, b) => a.targetLevel - b.targetLevel)[0];
  const readyRewards = (store.rewardMilestones || [])
    .filter((r) => r.profileId === profile.id && r.isActive && r.isUnlocked && !r.isClaimed);

  return (
    <GameScreen bgClass="bg-gradient-sky">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
      {/* top resource pills with labels */}
      <header className="content-wrapper pt-safe mt-4">
        <div className="grid grid-cols-3 gap-2">
          <ResourcePill icon="❤️" label={String(profile.hearts)} subLabel="Energi" tone="heart" />
          <ResourcePill icon="🪙" label={String(profile.coins)} subLabel="Koin" tone="coin" />
          <ResourcePill icon="💎" label={String(profile.points)} subLabel="Permata" tone="gem" />
        </div>

        {/* LOGO TMT */}
        <div className="mt-6 flex justify-center">
          <img src="/assets/logo.png" alt="TMT Logo" className="h-20 sm:h-24 w-auto object-contain drop-shadow-lg" />
        </div>
        <p className="text-center text-[10px] font-bold text-[#5A3515]/60 -mt-1 mb-2">
          The Mastermind Trials
        </p>

        {/* profile card with switch icon */}
        <div className="rounded-[28px] surface-panel p-4 flex items-center gap-4">
          <button
            onClick={onSwitchProfile}
            className="h-16 w-16 rounded-[20px] bg-white grid place-items-center text-4xl border-4 border-[#CBB794] shadow-sm shrink-0 active:translate-y-[2px] relative"
            aria-label="Ganti profil"
          >
            {profile.avatar}
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-meadow border-2 border-white grid place-items-center text-xs">🔄</span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl text-[#5A3515] truncate leading-none">{profile.name}</h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#E8DCC2] text-[#8C6B45] border-2 border-[#CBB794] shrink-0">
                {diff.shortLabel}
              </span>
            </div>
            <div className="mt-2">
              <XPBar level={profile.level} current={xp.current} needed={xp.needed} percent={xp.percent} />
            </div>
          </div>
        </div>
      </header>

      <main className="content-wrapper mt-4 space-y-4 pb-8">
        {/* Lanjutkan Misi button — big CTA */}
        <button
          onClick={() => onNavigate("map")}
          className="w-full py-4 rounded-[26px] bg-gradient-to-r from-[#2E8B12] to-[#4CAF50] border-b-4 border-[#1B5E20] text-white font-black text-lg shadow-pop active:translate-y-[2px] active:border-b-2 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-2xl">🗺️</span> Lanjutkan Misi
        </button>

        {/* Main grid — colorful tiles */}
        <div className="grid grid-cols-2 gap-3">
          <ColorTile emoji="🌍" title="Peta Petualangan" onClick={() => onNavigate("map")} color="green" />
          <ColorTile emoji="☀️" title="Misi Harian Adab" subtitle="Baru" onClick={() => onNavigate("daily-missions")} color="orange" />
          <ColorTile emoji="🏅" title="Koleksi Lencana" onClick={() => onNavigate("badges")} color="purple" />
          <ColorTile emoji="📊" title="Status Window" onClick={() => onNavigate("stats")} color="blue" />
        </div>

        {/* Mini-Game & Battle in one row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("minigame-center")}
            className="py-3.5 rounded-[22px] bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] border-b-4 border-[#D32F2F] text-white font-black text-sm shadow-pop active:translate-y-[2px] active:border-b-2 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">🎮</span> Mini-Game
          </button>
          <button
            onClick={() => onNavigate("battle")}
            className="py-3.5 rounded-[22px] bg-gradient-to-br from-[#7B1FA2] to-[#E040FB] border-b-4 border-[#4A148C] text-white font-black text-sm shadow-pop active:translate-y-[2px] active:border-b-2 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">⚔️</span> Battle
          </button>
        </div>

        {/* Hadiah Berikutnya */}
        {(nextReward || readyRewards.length > 0) && (
          <button
            onClick={() => onNavigate("my-rewards")}
            className="w-full rounded-[26px] bg-gradient-to-br from-[#FFF9E6] to-[#FFE0A3] border-3 border-[#D48806] p-4 text-left shadow-pop active:translate-y-[4px] active:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl shrink-0">
                {readyRewards.length > 0 ? "🎉" : "🎁"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-black text-sm text-[#5A3515] uppercase leading-tight">
                  {readyRewards.length > 0
                    ? "Hadiah Sudah Terbuka!"
                    : "Hadiah Berikutnya"}
                </div>
                {nextReward ? (
                  <>
                    <div className="text-xs font-bold text-[#8C6B45] mt-0.5">
                      {nextReward.rewardIcon} {nextReward.rewardTitle} · Level {nextReward.targetLevel}
                    </div>
                    <div className="text-[10px] font-bold text-[#2E8B12] mt-0.5">
                      Level sekarang {profile.level}. Kurang {Math.max(0, nextReward.targetLevel - profile.level)} level lagi!
                    </div>
                  </>
                ) : readyRewards.length > 0 ? (
                  <div className="text-xs font-bold text-[#A02020] mt-0.5">
                    Tunjukkan ke orang tua untuk mendapatkan hadiah!
                  </div>
                ) : null}
                <div className="mt-1.5 h-2 rounded-full bg-white/60 overflow-hidden border border-[#D48806]/30">
                  <div
                    className="h-full bg-gradient-coin rounded-full transition-all"
                    style={{
                      width: `${nextReward ? Math.min(100, (profile.level / nextReward.targetLevel) * 100) : 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-xl shrink-0">→</div>
            </div>
          </button>
        )}

        {/* Difficulty Upgrade Banner */}
        {profile.difficultyUpgradeAvailable && (() => {
          const nextDiff = getNextDifficulty(profile.difficulty);
          if (!nextDiff) return null;
          const nextLabel = DIFFICULTY_UI_LABELS[nextDiff] || nextDiff;
          return (
            <button
              onClick={() => onNavigate("map")}
              className="w-full rounded-[26px] bg-gradient-to-br from-[#E8F5E9] to-[#A5D6A7] border-4 border-[#2E8B12] p-4 text-left shadow-pop active:translate-y-[4px] active:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl shrink-0">🚀</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-black text-sm text-[#2E8B12] uppercase leading-tight">
                    Bisa Naik Tingkat!
                  </div>
                  <div className="text-xs font-bold text-[#5A3515] mt-0.5">
                    Kamu sudah menyelesaikan semua misi. Siap ke {nextLabel}?
                  </div>
                </div>
                <div className="text-xl shrink-0">→</div>
              </div>
            </button>
          );
        })()}

        {/* Kontrol & Pengaturan section — at bottom */}
        <div className="pt-2">
          <h2 className="font-display font-black text-lg text-[#5A3515] mb-3 text-center flex items-center justify-center gap-2">
            <span>⚙️</span> Kontrol & Pengaturan
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ColorTile emoji="👨‍👩‍👧" title="Orang Tua" onClick={() => onNavigate("parent")} color="teal" />
            <ColorTile emoji="⚙️" title="Pengaturan" onClick={() => onNavigate("settings")} color="gray" />
          </div>
        </div>
      </main>
      </div>
    </GameScreen>
  );
}

function ResourcePill({ icon, label, subLabel, tone }: { icon: string; label: string; subLabel: string; tone: "heart" | "coin" | "gem" }) {
  const badgeBg =
    tone === "heart" ? "bg-gradient-heart border-[#A02020]" :
    tone === "coin" ? "bg-gradient-coin border-[#D48806]" :
    "bg-gradient-blue border-[#185E9F]";
  return (
    <div className="relative h-14 sm:h-16 rounded-full surface-panel flex flex-col items-center justify-center pl-10 sm:pl-12 pr-2 sm:pr-3 py-1">
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full grid place-items-center text-xl sm:text-2xl ${badgeBg} shadow-sm border-[3px] sm:border-4`}>
        <span>{icon}</span>
      </div>
      <span className="font-display font-black text-[#5A3515] text-sm sm:text-base leading-none">
        {label}
      </span>
      <span className="text-[9px] sm:text-[10px] font-bold text-[#8C6B45] leading-tight">
        {subLabel}
      </span>
    </div>
  );
}

function ColorTile({ emoji, title, subtitle, onClick, color }: {
  emoji: string; title: string; subtitle?: string;
  onClick: () => void;
  color: "green" | "orange" | "purple" | "blue" | "teal" | "gray";
}) {
  const colorCls: Record<string, string> = {
    green: "bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] border-[#1B5E20] text-white",
    orange: "bg-gradient-to-br from-[#FF9800] to-[#F57C00] border-[#E65100] text-white",
    purple: "bg-gradient-to-br from-[#9C27B0] to-[#6A1B9A] border-[#4A148C] text-white",
    blue: "bg-gradient-to-br from-[#2196F3] to-[#1565C0] border-[#0D47A1] text-white",
    teal: "bg-gradient-to-br from-[#009688] to-[#00695C] border-[#004D40] text-white",
    gray: "bg-gradient-to-br from-[#78909C] to-[#455A64] border-[#263238] text-white",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-[22px] border-b-4 p-3 sm:p-4 text-left shadow-pop active:translate-y-[2px] active:border-b-2 ${colorCls[color]}`}
    >
      <div className="text-3xl sm:text-4xl drop-shadow-sm">{emoji}</div>
      <div className="mt-1.5 font-display font-black text-xs sm:text-sm leading-tight uppercase tracking-wide">{title}</div>
      {subtitle ? <div className="text-[10px] font-bold opacity-70 mt-0.5">{subtitle}</div> : null}
    </button>
  );
}
