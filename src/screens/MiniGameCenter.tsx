/**
 * Mini Game Center — hub showing all 5 mini-game packages
 */
import type { Profile, ScreenId, MiniGamePackageId } from "@/types";
import { MINI_GAME_PACKAGES, getMiniGameCount } from "@/data/minigame-definitions";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";

interface Props {
  profile: Profile;
  onBack: () => void;
  onNavigate: (s: ScreenId) => void;
  onOpenPackage: (packageId: MiniGamePackageId) => void;
}

export function MiniGameCenter({ profile, onBack, onOpenPackage }: Props) {
  const { store } = useGameStore();

  // Get mini-game sessions for this profile
  const mySessions = (store.miniGameSessions || []).filter(s => s.profileId === profile.id);

  // Compute per-package stats
  const packageStats = MINI_GAME_PACKAGES.map(pkg => {
    const pkgSessions = mySessions.filter(s => s.packageId === pkg.id);
    const totalGames = getMiniGameCount(pkg.id);
    const gamesPlayed = new Set(pkgSessions.map(s => s.gameType)).size;
    const bestScore = pkgSessions.reduce((max, s) => Math.max(max, s.score), 0);

    return { ...pkg, totalGames, sessions: pkgSessions.length, gamesPlayed, bestScore };
  });

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            Mini Game Center
          </h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80 truncate">
            Pilih paket mini-game favoritmu!
          </p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">🎮</div>
      </header>

      {/* Package Cards */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-3 pb-8">
        <p className="text-xs font-bold text-[#8C6B45] text-center mb-2">
          {mySessions.length > 0
            ? `Kamu sudah main ${mySessions.length}x mini-game. Terus semangat!`
            : "Yuk coba mini-game seru di bawah ini!"}
        </p>

        {packageStats.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => onOpenPackage(pkg.id)}
            className="w-full rounded-[24px] p-4 text-left border-4 shadow-pop active:translate-y-1 transition-all bg-white/90 border-[#CBB794] hover:border-[#185E9F]"
          >
            <div className="flex items-center gap-4">
              {/* Package icon */}
              <div
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-[20px] grid place-items-center text-3xl sm:text-4xl shrink-0 border-2"
                style={{ backgroundColor: `${pkg.themeColor}20`, borderColor: `${pkg.themeColor}55` }}
              >
                {pkg.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-lg sm:text-xl text-[#5A3515] truncate">
                    {pkg.title}
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E8DCC2] text-[#8C6B45] shrink-0">
                    {pkg.totalGames} game
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#8C6B45] mt-1 line-clamp-2">
                  {pkg.description}
                </p>

                {/* Progress summary */}
                {pkg.sessions > 0 && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (pkg.gamesPlayed / pkg.totalGames) * 100)}%`,
                          backgroundColor: pkg.themeColor,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#8C6B45] shrink-0">
                      {pkg.gamesPlayed}/{pkg.totalGames}
                    </span>
                    {pkg.bestScore > 0 && (
                      <span className="text-[10px] font-bold text-yellow-600 shrink-0">
                        ⭐{pkg.bestScore}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xl shrink-0 text-[#8C6B45]">→</div>
            </div>
          </button>
        ))}

        {/* Quick stats */}
        {mySessions.length > 0 && (
          <GameCard tone="blue" className="text-white">
            <h3 className="font-display font-black text-base mb-2">Ringkasan Mini-Game</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 rounded-xl p-2">
                <div className="font-black text-lg">{mySessions.length}</div>
                <div className="text-[10px] uppercase opacity-70">Sesi</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="font-black text-lg">{mySessions.reduce((s, g) => Math.max(s, g.score), 0)}</div>
                <div className="text-[10px] uppercase opacity-70">Skor Terbaik</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2">
                <div className="font-black text-lg">{new Set(mySessions.map(s => s.gameType)).size}</div>
                <div className="text-[10px] uppercase opacity-70">Game Unik</div>
              </div>
            </div>
          </GameCard>
        )}
      </main>

      {/* Bottom */}
      <div className="shrink-0 content-wrapper pb-safe pt-2 bg-white/40 backdrop-blur-sm border-t border-white/50">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          🏠 Beranda
        </GameButton>
      </div>
    </div>
  );
}
