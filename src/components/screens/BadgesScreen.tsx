import type { Profile } from "@/game/types";
import { BADGES } from "@/game/constants";
import { BadgeCard } from "../game/BadgeCard";
import { GameButton } from "../game/GameButton";

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function BadgesScreen({ profile, onBack }: Props) {
  const earnedCount = BADGES.filter((b) => profile.badges.includes(b.id)).length;
  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-8">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="h-12 w-12 rounded-2xl bg-white/90 border-2 border-white grid place-items-center text-xl shadow-pop-sm" aria-label="Kembali">←</button>
        <div className="flex-1">
          <h1 className="font-display font-black text-2xl text-[color:var(--wood-dark)]">Koleksi Badge</h1>
          <p className="text-sm text-[color:var(--wood-dark)]/80">{earnedCount} dari {BADGES.length} terkumpul</p>
        </div>
        <div className="text-3xl">🏅</div>
      </header>

      <main className="px-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {BADGES.map((b) => (
            <BadgeCard key={b.id} badge={b} unlocked={profile.badges.includes(b.id)} />
          ))}
        </div>
        <div className="mt-5">
          <GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Beranda</GameButton>
        </div>
      </main>
    </div>
  );
}
