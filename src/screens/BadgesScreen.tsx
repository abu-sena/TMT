import type { Profile } from "@/types";
import { BADGES } from "@/data/badges";
import { BadgeCard } from "../game/BadgeCard";
import { GameButton } from "../game/GameButton";

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function BadgesScreen({ profile, onBack }: Props) {
  const earnedCount = BADGES.filter((b) => profile.badges.includes(b.id)).length;
  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform" aria-label="Kembali">←</button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">Koleksi Lencana</h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80">{earnedCount} dari {BADGES.length} lencana terkumpul</p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">🏅</div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain content-wrapper">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {BADGES.map((b) => (
            <BadgeCard key={b.id} badge={b} unlocked={profile.badges.includes(b.id)} />
          ))}
        </div>
      </main>

      <div className="shrink-0 content-wrapper pb-safe pt-2">
        <GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Beranda</GameButton>
      </div>
    </div>
  );
}
