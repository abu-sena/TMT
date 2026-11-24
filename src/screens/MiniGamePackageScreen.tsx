/**
 * MiniGame Package Screen — lists all mini-games in a package
 */
import { ArrowLeft as TmtBackGlyph } from "lucide-react";
import type { Profile, ScreenId, MiniGamePackageId } from "@/types";
import { getMiniGamesByPackage, getPackageById } from "@/data/minigame-definitions";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";

interface Props {
  profile: Profile;
  packageId: MiniGamePackageId;
  onBack: () => void;
  onPlayGame: (screenId: ScreenId) => void;
}

export function MiniGamePackageScreen({ profile, packageId, onBack, onPlayGame }: Props) {
  const { store } = useGameStore();
  const pkg = getPackageById(packageId);
  const games = getMiniGamesByPackage(packageId);

  if (!pkg) {
    return (
      <div className="h-[100dvh] bg-gradient-sky grid place-items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="font-bold text-[#5A3515]">Paket tidak ditemukan.</p>
          <button type="button" data-action="neutral" onClick={onBack} className="tmt-action-button mt-4 px-6 py-2 rounded-2xl bg-gradient-meadow text-white font-bold">Kembali</button>
        </div>
      </div>
    );
  }

  // Get sessions for games in this package
  const mySessions = (store.miniGameSessions || [])
    .filter(s => s.profileId === profile.id && s.packageId === packageId);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button type="button"
          onClick={onBack}
          className="tmt-icon-button h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95 transition-transform"
          aria-label="Kembali"
        >
          <TmtBackGlyph aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">
            {pkg.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80 truncate">
            {pkg.description}
          </p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">{pkg.icon}</div>
      </header>

      {/* Game list */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-3 pb-8">
        {/* Package intro card */}
        <div
          className="rounded-[24px] p-4 border-4 shadow-pop"
          style={{ backgroundColor: `${pkg.themeColor}15`, borderColor: `${pkg.themeColor}40` }}
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">{pkg.icon}</div>
            <div>
              <h2 className="font-display font-black text-lg text-[#5A3515]">{pkg.title}</h2>
              <p className="text-xs font-bold text-[#8C6B45]">{games.length} mini-game tersedia</p>
            </div>
          </div>
        </div>

        {/* Game cards */}
        {(() => {
          if (games.length === 0) return (
            <GameCard tone="cream" className="text-center py-8">
              <div className="text-5xl mb-4">🔧</div>
              <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">Belum Tersedia</h2>
              <p className="text-sm font-bold text-[#8C6B45]">Mini-game di paket ini akan segera hadir!</p>
            </GameCard>
          );
          return games.map(game => {
          const isSupported = game.supportedDifficulties.includes(profile.difficulty);
          const gameSessions = mySessions.filter(s => s.gameType === game.id);
          const bestScore = gameSessions.reduce((max, s) => Math.max(max, s.score), 0);
          const playCount = gameSessions.length;

          // Map game ID to leaderboard key (for existing games)
          const leaderboardKey = game.id.replace(/-/g, "");
          const leaderboard = store.miniGameLeaderboards?.[leaderboardKey] || [];
          const rank = leaderboard.findIndex(e => e.profileId === profile.id);

          if (!isSupported) {
            // Find the lowest supported difficulty for display
            const minDiff = game.supportedDifficulties[0] || "SD Bawah";
            const diffLabel = minDiff === "sd-bawah" ? "SD Bawah" : minDiff === "sd-atas" ? "SD Atas" : minDiff.toUpperCase();
            
            return (
              <div
                key={game.id}
                className="w-full rounded-[24px] p-4 text-left border-4 bg-white/50 border-[#E8DCC2] opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[18px] grid place-items-center text-2xl sm:text-3xl shrink-0 border-2 bg-black/5 border-black/10 grayscale">
                    {game.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-base sm:text-lg text-[#5A3515]/70 truncate">
                        {game.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 text-[#5A3515]/60 shrink-0">
                        🔒 Terkunci
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#8C6B45]/70 mt-1">
                      Tersedia mulai {diffLabel}
                    </p>
                  </div>
                  <div className="text-xl shrink-0 text-black/20">🔒</div>
                </div>
              </div>
            );
          }

          return (
            <button type="button"
              key={game.id}
              onClick={() => game.screenId && onPlayGame(game.screenId)}
              className="tmt-choice-button w-full rounded-[24px] p-4 text-left border-4 shadow-pop active:translate-y-1 transition-all bg-white/90 border-[#CBB794] hover:border-[#185E9F]"
            >
              <div className="flex items-center gap-3">
                {/* Game icon */}
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[18px] grid place-items-center text-2xl sm:text-3xl shrink-0 border-2 bg-white/50 border-[#CBB794]">
                  {game.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-base sm:text-lg text-[#5A3515] truncate">
                      {game.title}
                    </h3>
                    {game.hasTimer && <span className="text-xs shrink-0">⏱</span>}
                    {game.isFamilyMode && <span className="text-xs shrink-0">👨‍👩‍👧</span>}
                  </div>
                  <p className="text-xs font-bold text-[#8C6B45] mt-0.5 line-clamp-2">
                    {game.description}
                  </p>

                  {/* Stats row */}
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    {playCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E8B12]">
                        {playCount}x main
                      </span>
                    )}
                    {bestScore > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                        ⭐ {bestScore}
                      </span>
                    )}
                    {rank >= 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3F2FD] text-[#185E9F]">
                        #{rank + 1}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-[#8C6B45]/70">
                      {game.supportedDifficulties.length} tingkat
                    </span>
                  </div>
                </div>

                <div className="text-lg shrink-0 text-[#8C6B45]">▶</div>
              </div>
            </button>
          );
        });
      })()}

      </main>

      {/* Bottom */}
      <div className="shrink-0 content-wrapper pb-safe pt-2 bg-white/40 backdrop-blur-sm border-t border-white/50">
        <GameButton variant="ghost" size="md" full onClick={onBack}>
          ← Kembali ke Mini Game Center
        </GameButton>
      </div>
    </div>
  );
}
