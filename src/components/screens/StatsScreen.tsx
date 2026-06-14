import type { Profile } from "@/game/types";
import { CATEGORIES, CATEGORY_MAP, DIFFICULTY_MAP } from "@/game/constants";
import { strongestCategory, weakestCategory, xpProgress } from "@/game/logic";
import { CategoryProgress } from "../game/CategoryProgress";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function StatsScreen({ profile, onBack }: Props) {
  const xp = xpProgress(profile);
  const strong = strongestCategory(profile);
  const weak = weakestCategory(profile);
  const diff = DIFFICULTY_MAP[profile.difficulty];

  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-8">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="h-12 w-12 rounded-2xl bg-white/90 border-2 border-white grid place-items-center text-xl shadow-pop-sm" aria-label="Kembali">←</button>
        <div className="flex-1">
          <h1 className="font-display font-black text-2xl text-[color:var(--wood-dark)]">Statistik</h1>
          <p className="text-sm text-[color:var(--wood-dark)]/80">{profile.name} · {diff.label}</p>
        </div>
        <div className="text-3xl">📊</div>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Misi Selesai" value={profile.totalMissionsCompleted} emoji="🎯" />
          <StatTile label="Total Poin" value={profile.points} emoji="⭐" />
          <StatTile label="Level" value={profile.level} emoji="⚡" />
        </div>

        <GameCard tone="cream">
          <div className="text-xs font-bold uppercase text-muted-foreground">XP Saat Ini</div>
          <div className="mt-1 font-display font-black text-2xl text-[color:var(--wood-dark)]">
            {xp.current} / {xp.needed}
          </div>
          <div className="mt-2 h-3 rounded-full bg-black/10 overflow-hidden">
            <div className="h-full bg-gradient-xp" style={{ width: `${xp.percent}%` }} />
          </div>
        </GameCard>

        <div>
          <div className="px-1 py-2 text-xs font-bold uppercase text-[color:var(--wood-dark)]/80">Per Kategori</div>
          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const s = profile.categoryStats[c.id];
              return <CategoryProgress key={c.id} category={c.id} correct={s.correct} total={s.total} />;
            })}
          </div>
        </div>

        <GameCard tone="leaf">
          <div className="text-xs uppercase font-bold opacity-90">Kategori Terkuat</div>
          <div className="font-display font-black text-xl">
            {strong ? `${CATEGORY_MAP[strong].emoji} ${CATEGORY_MAP[strong].label}` : "Belum ada data"}
          </div>
        </GameCard>

        <GameCard tone="wood">
          <div className="text-xs uppercase font-bold opacity-90">Rekomendasi Latihan</div>
          <div className="font-display font-black text-xl">
            {weak ? `${CATEGORY_MAP[weak].emoji} ${CATEGORY_MAP[weak].label}` : "Selesaikan beberapa misi dulu"}
          </div>
        </GameCard>

        <GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Beranda</GameButton>
      </main>
    </div>
  );
}

function StatTile({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="rounded-2xl bg-gradient-cream border-2 border-[color:var(--wood)]/40 p-3 text-center shadow-pop-sm">
      <div className="text-xl">{emoji}</div>
      <div className="font-display font-black text-xl text-[color:var(--wood-dark)]">{value}</div>
      <div className="text-[10px] uppercase font-bold text-muted-foreground leading-tight">{label}</div>
    </div>
  );
}
