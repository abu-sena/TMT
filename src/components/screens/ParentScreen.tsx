import type { Profile } from "@/game/types";
import { CATEGORIES, CATEGORY_MAP } from "@/game/constants";
import { strongestCategory, weakestCategory } from "@/game/logic";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";

interface Props {
  profile: Profile;
  onBack: () => void;
}

export function ParentScreen({ profile, onBack }: Props) {
  const strong = strongestCategory(profile);
  const weak = weakestCategory(profile);

  return (
    <div className="min-h-[100dvh] bg-gradient-sky pb-8">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="h-12 w-12 rounded-2xl bg-white/90 border-2 border-white grid place-items-center text-xl shadow-pop-sm" aria-label="Kembali">←</button>
        <div className="flex-1">
          <h1 className="font-display font-black text-2xl text-[color:var(--wood-dark)]">Dashboard Orang Tua</h1>
          <p className="text-sm text-[color:var(--wood-dark)]/80">Ringkasan progres {profile.name}</p>
        </div>
        <div className="text-3xl">👨‍👩‍👧</div>
      </header>

      <main className="px-4 max-w-md mx-auto space-y-3">
        <GameCard tone="cream" className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-white border-2 border-[color:var(--wood)]/40 grid place-items-center text-3xl">{profile.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-lg">{profile.name}</div>
            <div className="text-xs text-muted-foreground">Level {profile.level} · {profile.points} poin · {profile.badges.length} badge</div>
          </div>
        </GameCard>

        <div className="grid grid-cols-2 gap-2">
          <Tile emoji="🎯" label="Misi Selesai" value={profile.totalMissionsCompleted} />
          <Tile emoji="⏱️" label="Total Bermain" value={`${profile.timePlayedMinutes} mnt`} />
        </div>

        <GameCard tone="leaf">
          <div className="text-xs uppercase font-bold opacity-90">Kekuatan</div>
          <div className="font-display font-bold text-lg">
            {strong ? `${CATEGORY_MAP[strong].emoji} ${CATEGORY_MAP[strong].label}` : "Belum cukup data"}
          </div>
        </GameCard>

        <GameCard tone="wood">
          <div className="text-xs uppercase font-bold opacity-90">Perlu Latihan</div>
          <div className="font-display font-bold text-lg">
            {weak ? `${CATEGORY_MAP[weak].emoji} ${CATEGORY_MAP[weak].label}` : "Belum cukup data"}
          </div>
        </GameCard>

        <GameCard tone="cream">
          <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Detail Kategori</div>
          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const s = profile.categoryStats[c.id];
              const ratio = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xl">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{c.label}</div>
                    <div className="h-2 mt-1 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full bg-gradient-xp" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground tabular-nums">{s.correct}/{s.total}</div>
                </div>
              );
            })}
          </div>
        </GameCard>

        <GameButton variant="secondary" size="md" full leadingIcon="📄" onClick={() => alert("Ekspor laporan akan tersedia di versi berikutnya.")}>
          Ekspor Laporan
        </GameButton>
        <GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Beranda</GameButton>
      </main>
    </div>
  );
}

function Tile({ emoji, label, value }: { emoji: string; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-gradient-cream border-2 border-[color:var(--wood)]/40 p-3 text-center shadow-pop-sm">
      <div className="text-2xl">{emoji}</div>
      <div className="font-display font-black text-xl text-[color:var(--wood-dark)]">{value}</div>
      <div className="text-[10px] uppercase font-bold text-muted-foreground">{label}</div>
    </div>
  );
}
