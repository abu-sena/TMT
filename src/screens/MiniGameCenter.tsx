import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, Lock, Play, Shuffle } from "lucide-react";
import type { Profile, ScreenId } from "@/types";
import { getFlatMiniGames, getRandomPlayableGame, isGamePlayable, type FlatGameEntry } from "@/data/minigame-definitions";
import { useGameStore } from "@/lib/storage";
import { MiniGameIcon } from "@/components/minigames/MiniGameArt";

interface Props {
  profile: Profile;
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
}

const filters = ["Semua", "Cepat", "Logika", "Spasial"] as const;
const games = getFlatMiniGames();

export function MiniGameCenter({ profile, onBack, onNavigate }: Props) {
  const { store } = useGameStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("Semua");
  const [randomGame, setRandomGame] = useState<FlatGameEntry | null>(null);
  const sessions = (store.miniGameSessions ?? []).filter(session => session.profileId === profile.id);
  const lastPlayed = [...sessions].sort((a, b) => b.playedAt - a.playedAt)
    .map(session => games.find(game => game.id === session.gameType || game.screenId === "minigame-" + session.gameType))
    .find(game => game && isGamePlayable(game, profile.difficulty));
  const visible = games.filter(game => filter === "Semua" || game.categoryTag === filter);
  const available = visible.filter(game => isGamePlayable(game, profile.difficulty)).length;
  const playable = games.filter(game => isGamePlayable(game, profile.difficulty));
  const recommendations = filters.slice(1).flatMap(category => {
    const game = playable.find(entry => entry.categoryTag === category);
    return game ? [game] : [];
  });
  const play = (game: FlatGameEntry) => {
    if (game.screenId) onNavigate(game.screenId as ScreenId);
  };

  return (
    <Dialog.Root open={randomGame !== null} onOpenChange={open => { if (!open) setRandomGame(null); }}>
      <div className="field-shell">
        <main className="field-scroll">
          <div className="field-wrap field-library">
            <button type="button" className="field-back" onClick={onBack}><ArrowLeft size={19} />Beranda</button>
            <section className="field-library-hero">
              <h1>Ruang Bermain</h1>
              <p>Pilih mini-game atau coba secara acak.</p>
              <Dialog.Trigger asChild>
                <button type="button" className="field-button" disabled={playable.length === 0} onClick={() => setRandomGame(getRandomPlayableGame(profile.difficulty))}>
                  <Shuffle size={17} /> Acak game
                </button>
              </Dialog.Trigger>
            </section>
            {lastPlayed && (
              <section>
                <h2 className="field-section-title">Terakhir dimainkan</h2>
                <GameRow game={lastPlayed} playable onPlay={() => play(lastPlayed)} />
              </section>
            )}
            {recommendations.length > 0 && (
              <section>
                <h2 className="field-section-title">Coba permainan ini</h2>
                <div className="field-game-list">
                  {recommendations.map(game => <GameRow key={game.id} game={game} playable onPlay={() => play(game)} />)}
                </div>
              </section>
            )}
            <section aria-labelledby="game-catalog">
              <h2 className="field-section-title" id="game-catalog">Katalog mini-game</h2>
              <div className="field-filters" role="group" aria-label="Kategori mini-game">
                {filters.map(name => <button type="button" key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>{name}</button>)}
              </div>
              <p className="field-catalog-count" aria-live="polite">{available} permainan tersedia</p>
              <div className="field-game-list">
                {visible.map(game => {
                  const history = sessions.filter(session => session.gameType === game.id || session.gameType === game.id.replace(/-/g, ""));
                  const summary = history.length ? history.length + " kali main · Skor terbaik " + Math.max(...history.map(session => session.score)) : undefined;
                  return <GameRow key={game.id} game={game} playable={isGamePlayable(game, profile.difficulty)} onPlay={() => play(game)} summary={summary} />;
                })}
              </div>
            </section>
            {sessions.length > 0 && (
              <section className="field-game-row" aria-label="Ringkasan mini-game">
                <div className="field-game-text">
                  <strong>Riwayat bermain</strong>
                  <small>{sessions.length} sesi · {new Set(sessions.map(session => session.gameType)).size} jenis permainan</small>
                  <small>Skor terbaik {sessions.reduce((best, session) => Math.max(best, session.score), 0)}</small>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="field-dialog-overlay" />
        {randomGame && (
          <Dialog.Content className="field-dialog tmt-dialog-surface">
            <span className="field-game-icon"><MiniGameIcon gameId={randomGame.id} fallback={randomGame.icon} className="size-9" /></span>
            <Dialog.Title>{randomGame.title}</Dialog.Title>
            <Dialog.Description>{randomGame.description}</Dialog.Description>
            <div className="field-dialog-actions">
              <Dialog.Close asChild><button type="button" className="field-back">Batal</button></Dialog.Close>
              <button type="button" className="field-button" onClick={() => { setRandomGame(null); play(randomGame); }}><Play size={17} /> Main</button>
            </div>
          </Dialog.Content>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function GameRow({ game, playable, onPlay, summary }: { game: FlatGameEntry; playable: boolean; onPlay: () => void; summary?: string }) {
  const tone = game.categoryTag === "Logika" ? "lilac" : game.categoryTag === "Spasial" ? "mint" : "honey";
  const Icon = playable ? Play : Lock;
  const content = (
    <>
      <span className="field-game-icon" data-tone={tone}><MiniGameIcon gameId={game.id} fallback={game.icon} className="size-9" /></span>
      <span className="field-game-text">
        <strong>{game.title}</strong>
        <small>{game.description}</small>
        <small>{playable ? [game.categoryTag, game.estimatedDuration].filter(Boolean).join(" · ") : "Terkunci · " + (game.minDifficulty?.toUpperCase() ?? "Naik tingkat untuk membuka")}</small>
        {summary && <small>{summary}</small>}
      </span>
      <Icon size={18} aria-hidden="true" />
    </>
  );
  return playable ? <button type="button" className="field-game-row" onClick={onPlay}>{content}</button> : <div className="field-game-row">{content}</div>;
}
