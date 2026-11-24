import { ArrowLeft as TmtBackGlyph, X as TmtCloseGlyph } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MiniGameIcon, preloadMiniGameSprites } from "@/components/minigames/MiniGameArt";
import type { Profile, MiniGameSession } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import type React from "react";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";
import { getMemoryObjectLabel, MEMORY_OBJECTS, MemoryObjectIcon } from "@/components/minigames/MemoryObjectIcon";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Props {
  profile: Profile;
  onBack: () => void;
  backRef: React.MutableRefObject<(() => boolean) | null>;
}

function getConfig(difficulty: string) {
  if (difficulty === "tk") return { memorizeTime: 5, optionCount: 4, cols: 2, lives: 5, label: "Ingatan Ceria" };
  if (difficulty === "sd-bawah") return { memorizeTime: 3.5, optionCount: 6, cols: 3, lives: 3, label: "Ingatan Cepat" };
  return { memorizeTime: 2.5, optionCount: 6, cols: 3, lives: 3, label: "Ingatan Cepat" };
}

const ALL_EMOJIS = [
  ...MEMORY_OBJECTS.map(({ id }) => id),
  "🚗","🚕","🚙","🚌","🏎️","🚲",
  "🔴","🔵","🟡","🟢","🟣","🟠",
  "⭐","💎","🌈","🔥","❄️","🎵",
  "🌙","☀️","🌸","🍀","🎈","🎁",
];

function getStage(correctCount: number): number {
  if (correctCount <= 3) return 1;
  if (correctCount <= 6) return 2;
  if (correctCount <= 10) return 3;
  if (correctCount <= 15) return 4;
  if (correctCount <= 22) return 5;
  return 6;
}

function getDifficultyBonus(stage: number): number {
  const map: Record<number, number> = { 1: 0, 2: 30, 3: 60, 4: 100, 5: 160, 6: 240 };
  return map[stage] ?? 240;
}

const ITEM_MAP: Record<number, number> = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 6, 6: 7 };

export function MiniGameIngatanScreen({ profile, onBack, backRef }: Props) {
  preloadMiniGameSprites("memory", "props", "nature");
  const cfg = getConfig(profile.difficulty);
  const { store, addMiniGameSession } = useGameStore();

  const [screen, setScreen] = useState<"start" | "playing" | "result" | "leaderboard">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(cfg.lives);
  const [stage, setStage] = useState(1);
  const [phase, setPhase] = useState<"memorize" | "recall">("memorize");
  const [sequence, setSequence] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [memorizeTime, setMemorizeTime] = useState(cfg.memorizeTime);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [showExit, setShowExit] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ftRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recallStartRef = useRef(Date.now());

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "ingatan");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);
  const leaderboard = store.miniGameLeaderboards["ingatan"] || [];

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ftRef.current) { clearTimeout(ftRef.current); ftRef.current = null; }
  }, []);

  const endGame = useCallback(() => {
    clearTimers();
    const avgTime = answerTimes.length > 0
      ? answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length
      : 0;

    const session: MiniGameSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      gameType: "ingatan",
      score,
      correctCount,
      averageAnswerTime: Math.round(avgTime * 100) / 100,
      fastestAnswerTime: answerTimes.length > 0 ? Math.min(...answerTimes) : 0,
      slowestAnswerTime: answerTimes.length > 0 ? Math.max(...answerTimes) : 0,
      maxStage: stage,
      difficulty: profile.difficulty,
      playedAt: Date.now(),
    };
    addMiniGameSession(session);
    setScreen("result");
  }, [clearTimers, answerTimes, profile, score, correctCount, stage, addMiniGameSession]);

  const startLevel = useCallback((currentCorrect: number) => {
    const stg = getStage(currentCorrect);
    setStage(stg);
    const seqLen = ITEM_MAP[stg] || 3;
    
    const pool = shuffleArray([...ALL_EMOJIS]);
    const seq = pool.slice(0, seqLen);
    const opts = shuffleArray([...seq]);

    setSequence(seq);
    setOptions(opts);
    setPlayerInput([]);
    setPhase("memorize");
    setMemorizeTime(cfg.memorizeTime);

    clearTimers();
    // Countdown during memorize phase
    timerRef.current = setInterval(() => {
      setMemorizeTime(t => {
        if (t <= 0.1) {
          clearTimers();
          setPhase("recall");
          recallStartRef.current = Date.now();
          return 0;
        }
        return Math.round((t - 0.1) * 10) / 10;
      });
    }, 100);
  }, [cfg.memorizeTime, clearTimers]);

  const handleCorrectLevel = useCallback(() => {
    const elapsed = (Date.now() - recallStartRef.current) / 1000;
    const speedBonus = Math.round(Math.min(elapsed, cfg.memorizeTime * 3) / (cfg.memorizeTime * 3) * 100);
    const diffBonus = getDifficultyBonus(stage);
    const questionScore = 150 + speedBonus + diffBonus;

    setScore(s => s + questionScore);
    setCorrectCount(c => c + 1);
    setAnswerTimes(t => [...t, elapsed]);
    setFeedback("correct");

    ftRef.current = setTimeout(() => {
      setFeedback(null);
      startLevel(correctCount + 1);
    }, 500);
  }, [cfg.memorizeTime, stage, correctCount, startLevel]);

  const handleWrong = useCallback(() => {
    setFeedback("wrong");
    const newLives = lives - 1;
    setLives(newLives);
    setAnswerTimes(t => [...t, (Date.now() - recallStartRef.current) / 1000]);

    ftRef.current = setTimeout(() => {
      setFeedback(null);
      if (newLives <= 0) {
        endGame();
      } else {
        startLevel(correctCount);
      }
    }, 600);
  }, [lives, correctCount, startLevel, endGame]);

  const handleSelect = (emoji: string) => {
    if (phase !== "recall" || feedback) return;

    const newInput = [...playerInput, emoji];
    setPlayerInput(newInput);
    const currentIndex = newInput.length - 1;

    if (newInput[currentIndex] !== sequence[currentIndex]) {
      handleWrong();
    } else if (newInput.length === sequence.length) {
      handleCorrectLevel();
    }
  };

  const startGame = () => {
    setScore(0); setCorrectCount(0); setLives(cfg.lives); setAnswerTimes([]);
    setFeedback(null); setScreen("playing");
    startLevel(0);
  };

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Register back handler for Android back button
  useEffect(() => {
    backRef.current = () => {
      if (screen === "playing") {
        setShowExit(true);
        return true;
      }
      if (screen === "leaderboard") {
        setScreen("start");
        return true;
      }
      if (screen === "result") {
        setScreen("start");
        return true;
      }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, screen, setShowExit, setScreen]);

  // ── Start Screen ──
  if (screen === "start") {
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="coin" className="text-center w-full max-w-sm p-6 sm:p-8 text-[#5A3515]">
          <MiniGameIcon gameId="ingatan-cepat" className="size-20 mb-3" />
          <h1 className="font-display font-black text-3xl mb-1">{cfg.label}</h1>
          <p className="text-sm font-bold opacity-70 mb-4">Hafalkan urutan gambar, lalu pilih kembali sesuai urutan! {cfg.lives} nyawa.</p>
          {personalBest > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-yellow-50 border border-[#D48806]">
              <div className="text-xs uppercase font-bold opacity-70">Rekor Terbaik</div>
              <div className="font-display font-black text-2xl text-[#D48806]">{personalBest}</div>
            </div>
          )}
          {leaderboard.length > 0 && (
            <div className="mb-4 text-left">
              <div className="text-xs uppercase font-bold opacity-70 mb-1">Top 3</div>
              {leaderboard.slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center gap-2 text-sm"><span className="font-black">{["🥇","🥈","🥉"][i]}</span><AvatarPortrait avatar={e.avatar} className="w-6 h-6 rounded-full" /><span className="truncate flex-1">{e.profileName}</span><span className="font-black">{e.score}</span></div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton>
            <GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton>
          </div>
          <button type="button" onClick={() => setScreen("leaderboard")} className="tmt-text-button mt-3 text-xs font-bold underline opacity-70">Lihat Leaderboard</button>
        </GameCard>
      </div>
    );
  }

  // ── Leaderboard ──
  if (screen === "leaderboard") {
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
        <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
          <button type="button" aria-label="Kembali" onClick={() => setScreen("start")} className="tmt-icon-button h-12 w-12 rounded-2xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95"><TmtBackGlyph aria-hidden="true" /></button>
          <div className="flex-1"><h1 className="font-display font-black text-xl text-[#5A3515]">Leaderboard</h1><p className="text-xs text-[#5A3515]/70">{cfg.label}</p></div>
          <div className="text-2xl">🏆</div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-2 pb-6">
          {leaderboard.length === 0 ? (
            <GameCard tone="cream" className="text-center py-8"><div className="text-5xl mb-2">🏆</div><p className="font-bold text-[#8C6B45]">Belum ada pemain.</p></GameCard>
          ) : leaderboard.map((e, i) => (
            <div key={e.id} className={`rounded-2xl p-3 flex items-center gap-3 border-2 ${e.profileId === profile.id ? "bg-gradient-meadow/20 border-[#2E8B12]" : "bg-white/80 border-[#CBB794]/50"}`}>
              <div className="text-2xl font-black w-10 text-center shrink-0">{i<3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</div>
              <AvatarPortrait avatar={e.avatar} className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 min-w-0"><div className="font-bold text-[#5A3515] truncate text-sm">{e.profileName}</div><div className="text-[10px] text-[#8C6B45]">{e.correctCount} benar</div></div>
              <div className="font-display font-black text-xl text-[#5A3515] shrink-0">{e.score}</div>
            </div>
          ))}
        </main>
        <div className="shrink-0 content-wrapper pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={() => setScreen("start")}>🏠 Kembali</GameButton></div>
      </div>
    );
  }

  // ── Result ──
  if (screen === "result") {
    const avgTime = answerTimes.length > 0 ? (answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length).toFixed(1) : "—";
    const isNewBest = score > personalBest;
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="coin" className="text-center w-full max-w-sm p-6 sm:p-8 text-[#5A3515]">
          <div className="text-6xl mb-3">{isNewBest ? "👑" : "🏆"}</div>
          <h2 className="font-display font-black text-2xl mb-1">Permainan Selesai!</h2>
          {isNewBest && <p className="text-[#D48806] font-black text-sm mb-3 animate-bob">🎉 Rekor Baru!</p>}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-yellow-50 rounded-2xl p-3 border border-[#D48806]"><div className="text-3xl font-black text-[#D48806]">{score}</div><div className="text-[10px] uppercase font-bold opacity-70">Skor</div></div>
            <div className="bg-yellow-50 rounded-2xl p-3 border border-[#D48806]"><div className="text-3xl font-black">{correctCount}</div><div className="text-[10px] uppercase font-bold opacity-70">Benar</div></div>
            <div className="bg-yellow-50 rounded-2xl p-3 border border-[#D48806]"><div className="text-3xl font-black">{stage}</div><div className="text-[10px] uppercase font-bold opacity-70">Stage</div></div>
            <div className="bg-yellow-50 rounded-2xl p-3 border border-[#D48806]"><div className="text-3xl font-black">{avgTime}s</div><div className="text-[10px] uppercase font-bold opacity-70">Rata² Waktu</div></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-3"><GameButton variant="ghost" full onClick={onBack}>Home</GameButton><GameButton variant="primary" full onClick={startGame}>Main Lagi</GameButton></div>
          <button type="button" onClick={() => setScreen("leaderboard")} className="tmt-text-button text-xs font-bold underline opacity-70">Lihat Leaderboard</button>
        </GameCard>
      </div>
    );
  }

  // ── Exit modal ──
  if (showExit) {
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="cream" className="text-center w-full max-w-sm p-6 border-4 border-[#CBB794]">
          <div className="text-5xl mb-3">🚪</div>
          <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">Keluar dari mini-game?</h2>
          <p className="text-sm font-bold text-[#8C6B45] mb-4">Skor sesi ini belum disimpan.</p>
          <div className="flex flex-col sm:flex-row gap-3"><GameButton variant="ghost" full onClick={() => setShowExit(false)}>Lanjut Main</GameButton><GameButton variant="danger" full onClick={onBack}>Keluar</GameButton></div>
        </GameCard>
      </div>
    );
  }

  const timerPercent = phase === "memorize" ? (memorizeTime / cfg.memorizeTime) * 100 : 0;

  // ── Playing Screen ──
  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button type="button" aria-label="Tutup" onClick={() => setShowExit(true)} className="tmt-icon-button h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95"><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm sm:text-lg border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#A02020] text-lg border-2 border-[#CBB794] ml-auto">{"❤️".repeat(lives)}{"🖤".repeat(cfg.lives - lives)}</div>
      </header>

      {phase === "memorize" && (
        <div className="h-3 rounded-full bg-black/10 mb-4 shrink-0 overflow-hidden border border-white/50">
          <div className="h-full rounded-full bg-[#185E9F] transition-all duration-100" style={{ width: `${timerPercent}%` }} />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center min-h-0">
        {phase === "memorize" ? (
          <GameCard tone="cream" className="w-full max-w-sm text-center py-10 sm:py-12 mb-4 border-4 border-[#185E9F] animate-pulse">
            <div className="text-sm font-black text-[#185E9F] mb-4 uppercase">👀 Hafalkan Urutannya!</div>
            <div className="flex justify-center flex-wrap gap-2 sm:gap-3 text-4xl sm:text-5xl">
              {sequence.map((emoji, i) => (
                <MemoryObjectIcon key={i} value={emoji} className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-md" />
              ))}
            </div>
            <div className="mt-4 text-xs font-bold text-[#8C6B45]">{memorizeTime.toFixed(1)} detik</div>
          </GameCard>
        ) : (
          <>
            <GameCard tone="cream" className={`w-full max-w-sm text-center py-6 mb-4 border-4 shrink-0 ${feedback === "correct" ? "border-[#2E8B12] bg-[#E8F5E9]" : feedback === "wrong" ? "border-[#A02020] bg-[#FFEBEE]" : "border-[#CBB794]"}`}>
              <div className="text-xs font-bold text-[#185E9F] mb-3 uppercase">👉 Pilih Sesuai Urutan</div>
              <div className="flex justify-center flex-wrap gap-1.5 text-3xl sm:text-4xl min-h-[50px] items-center">
                {playerInput.map((emoji, i) => (
                  <MemoryObjectIcon key={i} value={emoji} className="h-10 w-10 sm:h-12 sm:w-12" />
                ))}
                {playerInput.length === 0 && <span className="text-[#8C6B45]/50 text-lg">Ketuk gambar...</span>}
              </div>
            </GameCard>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full max-w-sm">
              {options.map((opt, i) => {
                const isSelected = playerInput.includes(opt);
                return (
                  <button type="button"
                    key={i}
                    onClick={() => handleSelect(opt)}
                    aria-label={getMemoryObjectLabel(opt)}
                    disabled={isSelected || feedback !== null}
                    className={`tmt-choice-button h-16 w-16 sm:h-20 sm:w-20 rounded-2xl text-3xl sm:text-4xl border-4 shadow-pop active:translate-y-[4px] active:shadow-sm transition-all ${
                      isSelected ? "bg-black/10 border-black/20 opacity-40" : "bg-white border-[#CBB794] hover:border-[#185E9F]"
                    } disabled:cursor-not-allowed`}
                  >
                    <MemoryObjectIcon value={opt} className="h-12 w-12 sm:h-14 sm:w-14" decorative />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>

      <div className="text-center text-xs font-bold text-[#8C6B45]/70 pt-2 shrink-0">
        {phase === "memorize" ? "Hafalkan urutannya!" : "Pilih sesuai urutan yang tadi!"}
      </div>
    </div>
  );
}
