/**
 * Mini Game Center — flat list of all mini-games.
 * No category menu. Games listed directly with optional filter chips.
 */
import { useState, useMemo } from "react";
import type { Profile, ScreenId } from "@/types";
import { getFlatMiniGames, getPlayableMiniGames, getRandomPlayableGame, isGamePlayable, type FlatGameEntry } from "@/data/minigame-definitions";
import { GameButton } from "../game/GameButton";
import { useGameStore } from "@/lib/storage";

interface Props {
  profile: Profile;
  onBack: () => void;
  onNavigate: (s: ScreenId) => void;
}

type FilterTag = "Semua" | "Cepat" | "Logika" | "Spasial";

const FILTER_TAGS: { key: FilterTag; emoji: string }[] = [
  { key: "Semua", emoji: "🎮" },
  { key: "Cepat", emoji: "⚡" },
  { key: "Logika", emoji: "🧠" },
  { key: "Spasial", emoji: "🔷" },
];

export function MiniGameCenter({ profile, onBack, onNavigate }: Props) {
  const { store } = useGameStore();
  const [filter, setFilter] = useState<FilterTag>("Semua");
  const [randomGame, setRandomGame] = useState<FlatGameEntry | null>(null);

  const mySessions = (store.miniGameSessions || []).filter(s => s.profileId === profile.id);
  const allGames = useMemo(() => getFlatMiniGames(), []);
  const playableGames = useMemo(() => getPlayableMiniGames(profile.difficulty), [profile.difficulty]);

  // Filtered games
  const filteredGames = useMemo(() => {
    if (filter === "Semua") return allGames;
    return allGames.filter(g => g.categoryTag === filter);
  }, [filter, allGames]);

  // Last played game — only show if still enabled in mini-game list
  const lastPlayed = useMemo(() => {
    if (mySessions.length === 0) return null;
    const sorted = [...mySessions].sort((a, b) => b.playedAt - a.playedAt);
    // Find the most recent game that is still enabled in mini-game list
    for (const session of sorted) {
      const game = allGames.find(g =>
        (g.id === session.gameType || g.screenId === `minigame-${session.gameType}`) &&
        g.isMiniGameEnabled
      );
      if (game) return game;
    }
    return null;
  }, [mySessions, allGames]);

  // Recommended today (3 random playable, diverse categories)
  const recommendations = useMemo(() => {
    const playable = [...playableGames];
    const result: FlatGameEntry[] = [];
    const usedTags = new Set<string>();
    // Try to pick 3 with diverse category tags
    for (const game of playable) {
      if (result.length >= 3) break;
      if (!usedTags.has(game.categoryTag) || result.length >= 2) {
        result.push(game);
        usedTags.add(game.categoryTag);
      }
    }
    return result.slice(0, 3);
  }, [playableGames]);

  const handleRandom = () => {
    const game = getRandomPlayableGame(profile.difficulty);
    if (game) setRandomGame(game);
  };

  const handlePlayGame = (game: FlatGameEntry) => {
    if (game.screenId) onNavigate(game.screenId as import("@/types").ScreenId);
  };

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
          <h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">Mini-Game</h1>
          <p className="text-xs sm:text-sm text-[#5A3515]/80 truncate">Pilih permainan yang ingin kamu mainkan 🎮</p>
        </div>
        <div className="text-2xl sm:text-3xl shrink-0">🎮</div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-4 pb-8">
        {/* Stats */}
        {mySessions.length > 0 && (
          <div className="text-xs font-bold text-[#8C6B45] text-center">
            Kamu sudah main {mySessions.length}x mini-game. Terus semangat! 🔥
          </div>
        )}

        {/* ── Lanjutkan Terakhir ── */}
        {lastPlayed && (
          <div>
            <h2 className="font-display font-black text-sm text-[#5A3515] mb-2 flex items-center gap-2">
              <span>🕐</span> Lanjutkan Terakhir
            </h2>
            <GameCardBig
              game={lastPlayed}
              profile={profile}
              onClick={() => handlePlayGame(lastPlayed)}
            />
          </div>
        )}

        {/* ── Rekomendasi Hari Ini ── */}
        <div>
          <h2 className="font-display font-black text-sm text-[#5A3515] mb-2 flex items-center gap-2">
            <span>🌟</span> Rekomendasi Hari Ini
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {recommendations.map(g => (
              <GameCardSmall
                key={g.id}
                game={g}
                profile={profile}
                onClick={() => handlePlayGame(g)}
              />
            ))}
          </div>
        </div>

        {/* ── Acak Game ── */}
        <button
          onClick={handleRandom}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7B1FA2] to-[#E040FB] border-b-4 border-[#4A148C] text-white font-black text-sm shadow-pop active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">🎲</span> Acak Game
        </button>

        {/* ── Filter Chips ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTER_TAGS.map(ft => (
            <button
              key={ft.key}
              onClick={() => setFilter(ft.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === ft.key
                  ? "bg-[#185E9F] text-white shadow-sm"
                  : "bg-white/70 text-[#5A3515] hover:bg-white"
              }`}
            >
              {ft.emoji} {ft.key}
            </button>
          ))}
        </div>

        {/* ── Semua Mini-Game ── */}
        <div>
          <h2 className="font-display font-black text-sm text-[#5A3515] mb-2">
            Semua Mini-Game ({filteredGames.filter(g => isGamePlayable(g, profile.difficulty)).length} tersedia)
          </h2>
          <div className="space-y-2">
            {filteredGames.map(g => {
              const playable = isGamePlayable(g, profile.difficulty);
              return playable ? (
                <GameCardRow
                  key={g.id}
                  game={g}
                  profile={profile}
                  onClick={() => handlePlayGame(g)}
                />
              ) : (
                <GameCardLocked key={g.id} game={g} />
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        {mySessions.length > 0 && (
          <div className="rounded-[24px] bg-gradient-to-br from-[#1B3A5C] to-[#0F2847] border-2 border-[#185E9F] p-4 text-white">
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
          </div>
        )}
      </main>

      {/* Random Game Modal */}
      {randomGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setRandomGame(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border-4 border-[#7B1FA2] shadow-2xl text-center animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-3">🎲</div>
            <h2 className="font-display font-black text-2xl text-[#5A3515] mb-2">Main {randomGame.title}?</h2>
            <p className="text-sm font-bold text-[#8C6B45] mb-4">{randomGame.description}</p>
            <div className="space-y-2">
              <button
                onClick={() => { setRandomGame(null); handlePlayGame(randomGame); }}
                className="w-full py-3 rounded-2xl bg-gradient-meadow border-b-4 border-[#2E8B12] text-white font-black text-lg active:translate-y-1 active:border-b-0 transition-all"
              >
                🎮 Main Sekarang
              </button>
              <button
                onClick={() => setRandomGame(null)}
                className="w-full py-3 rounded-2xl bg-gray-200 text-[#5A3515] font-black text-base active:translate-y-1 transition-all"
              >
                Ganti Game Lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="shrink-0 content-wrapper pb-safe pt-2 bg-white/40 backdrop-blur-sm border-t border-white/50">
        <GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Beranda</GameButton>
      </div>
    </div>
  );
}

// ── Card Components ──

function GameCardBig({ game, profile, onClick }: { game: FlatGameEntry; profile: Profile; onClick: () => void }) {
  const playable = isGamePlayable(game, profile.difficulty);
  return (
    <button
      onClick={playable ? onClick : undefined}
      disabled={!playable}
      className="w-full rounded-[24px] p-4 text-left border-4 shadow-pop active:translate-y-1 transition-all bg-white/90 border-[#CBB794] hover:border-[#185E9F]"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-[20px] grid place-items-center text-3xl shrink-0 border-2 bg-white/50 border-[#CBB794]">
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-lg text-[#5A3515]">{game.title}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8DCC2] text-[#8C6B45]">
              {game.categoryEmoji} {game.categoryTag}
            </span>
          </div>
          <p className="text-xs font-bold text-[#8C6B45] mt-0.5">{game.description}</p>
          {game.estimatedDuration && (
            <p className="text-[10px] text-[#8C6B45]/60 mt-0.5">⏱ {game.estimatedDuration}</p>
          )}
        </div>
        <div className="text-xl shrink-0">▶</div>
      </div>
    </button>
  );
}

function GameCardSmall({ game, profile, onClick }: { game: FlatGameEntry; profile: Profile; onClick: () => void }) {
  const playable = isGamePlayable(game, profile.difficulty);
  return (
    <button
      onClick={playable ? onClick : undefined}
      disabled={!playable}
      className="rounded-[20px] p-3 text-center border-3 shadow-pop active:translate-y-1 transition-all bg-white/85 border-[#CBB794] hover:border-[#185E9F] flex flex-col items-center gap-1.5"
    >
      <div className="h-12 w-12 rounded-[14px] grid place-items-center text-2xl bg-white/50 border-2 border-[#CBB794]">
        {game.icon}
      </div>
      <div>
        <div className="font-display font-black text-xs text-[#5A3515]">{game.title}</div>
        <div className="text-[9px] text-[#8C6B45]">{game.categoryTag}</div>
      </div>
    </button>
  );
}

function GameCardRow({ game, profile, onClick }: { game: FlatGameEntry; profile: Profile; onClick: () => void }) {
  const { store } = useGameStore();
  const mySessions = (store.miniGameSessions || [])
    .filter(s => s.profileId === profile.id && (s.gameType === game.id || s.gameType === game.id.replace(/-/g, "")));
  const playCount = mySessions.length;
  const bestScore = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[20px] p-3 text-left border-3 shadow-pop-sm active:translate-y-1 transition-all bg-white/85 border-[#CBB794] hover:border-[#185E9F] flex items-center gap-3"
    >
      <div className="h-12 w-12 rounded-[14px] grid place-items-center text-2xl shrink-0 bg-white/50 border-2 border-[#CBB794]">
        {game.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-black text-sm text-[#5A3515]">{game.title}</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E8DCC2] text-[#8C6B45]">
            {game.categoryTag}
          </span>
        </div>
        <p className="text-[10px] font-bold text-[#8C6B45] mt-0.5">{game.description}</p>
        <div className="flex items-center gap-2 mt-1">
          {playCount > 0 && <span className="text-[9px] bg-[#E8F5E9] text-[#2E8B12] px-1.5 py-0.5 rounded-full font-bold">{playCount}x</span>}
          {bestScore > 0 && <span className="text-[9px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">⭐{bestScore}</span>}
          {game.estimatedDuration && <span className="text-[9px] text-[#8C6B45]/60">⏱ {game.estimatedDuration}</span>}
        </div>
      </div>
      <div className="text-lg shrink-0">▶</div>
    </button>
  );
}

function GameCardLocked({ game }: { game: FlatGameEntry }) {
  const diffLabel = game.minDifficulty === "smp" ? "SMP" : game.minDifficulty?.toUpperCase() || "";
  return (
    <div className="w-full rounded-[20px] p-3 text-left border-3 bg-white/40 border-[#E8DCC2] opacity-60 flex items-center gap-3">
      <div className="h-12 w-12 rounded-[14px] grid place-items-center text-2xl shrink-0 bg-black/5 border-2 border-black/10 grayscale">
        {game.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-black text-sm text-[#5A3515]/60">{game.title}</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/10 text-[#5A3515]/50">🔒</span>
        </div>
        <p className="text-[10px] font-bold text-[#8C6B45]/60 mt-0.5">Tersedia mulai {diffLabel}</p>
      </div>
      <span className="text-lg shrink-0 opacity-30">🔒</span>
    </div>
  );
}
