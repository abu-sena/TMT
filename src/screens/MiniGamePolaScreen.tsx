import { ArrowLeft as TmtBackGlyph, X as TmtCloseGlyph } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MiniGameIcon, preloadMiniGameSprites } from "@/components/minigames/MiniGameArt";
import { MemoryObjectIcon, getMemoryObjectLabel } from "@/components/minigames/MemoryObjectIcon";
import type { Profile, MiniGameSession } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import type React from "react";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

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

// ── Pattern config ──
function getConfig(difficulty: string) {
  if (difficulty === "tk") return { timeLimit: 10, optionCount: 4, cols: 2, label: "Pola Ceria" };
  if (difficulty === "sd-bawah") return { timeLimit: 7, optionCount: 4, cols: 2, label: "Pola Kilat" };
  return { timeLimit: 5, optionCount: 6, cols: 3, label: "Pola Kilat" };
}

const COLOR_SETS = [
  ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠"],
  ["❤️", "💙", "💛", "💚", "💜", "🧡"],
];

const SHAPE_SETS = [
  ["⭐", "🔷", "🔶", "💎", "🔵", "🔴"],
  ["🌙", "☀️", "⭐", "🌈", "❄️", "🔥"],
];

const NUMBER_SETS = [
  ["1", "2", "3", "4", "5", "6"],
  ["➀", "➁", "➂", "➃", "➄", "➅"],
];

const ALL_SETS = [...COLOR_SETS, ...SHAPE_SETS];

// Pattern types by stage
function getPatternType(stage: number): "ABAB" | "AAB" | "ABC" | "number" | "combo" | "complex" {
  if (stage <= 1) return "ABAB";
  if (stage === 2) return "AAB";
  if (stage === 3) return "ABC";
  if (stage === 4) return "number";
  if (stage === 5) return "combo";
  return "complex";
}

function getStage(correctCount: number): number {
  if (correctCount <= 5) return 1;
  if (correctCount <= 10) return 2;
  if (correctCount <= 20) return 3;
  if (correctCount <= 35) return 4;
  if (correctCount <= 50) return 5;
  return 6;
}

function getDifficultyBonus(stage: number): number {
  const map: Record<number, number> = { 1: 0, 2: 20, 3: 50, 4: 90, 5: 140, 6: 200 };
  return map[stage] ?? 200;
}

function generatePattern(cfg: ReturnType<typeof getConfig>, correctCount: number) {
  const stage = getStage(correctCount);
  const pType = getPatternType(stage);
  
  let sequence: string[] = [];
  let answer: string;
  
  if (pType === "number") {
    // Number sequence: 1 3 5 7 ?
    const sets = NUMBER_SETS;
    const set = sets[Math.floor(Math.random() * sets.length)];
    const start = Math.floor(Math.random() * 5) + 1;
    const step = [1, 2, 3][Math.floor(Math.random() * 3)];
    sequence = [set[start - 1], set[start + step - 1], set[start + step * 2 - 1]];
    answer = set[start + step * 3 - 1] || set[(start + step * 3 - 1) % set.length];
  } else if (pType === "combo") {
    // Simple combo: shape + color pattern
    const shapes = SHAPE_SETS[0];
    const colors = COLOR_SETS[0];
    sequence = [shapes[0], colors[0], shapes[0], colors[0], shapes[0]];
    answer = colors[0];
  } else {
    // Emoji/color pattern
    const set = ALL_SETS[Math.floor(Math.random() * ALL_SETS.length)];
    const a = set[0];
    const b = set[1];
    const c = set[2];
    
    if (pType === "ABAB") {
      sequence = [a, b, a, b];
      answer = a;
    } else if (pType === "AAB") {
      sequence = [a, a, b, a, a];
      answer = b;
    } else if (pType === "ABC") {
      sequence = [a, b, c, a, b];
      answer = c;
    } else {
      // complex
      sequence = [a, b, c, a, a, b];
      answer = c;
    }
  }

  // Generate options
  const distractors = new Set<string>();
  distractors.add(answer);
  const pool = [...ALL_SETS.flat(), ...NUMBER_SETS.flat()];
  while (distractors.size < cfg.optionCount) {
    const d = pool[Math.floor(Math.random() * pool.length)];
    distractors.add(d);
  }
  const options = shuffleArray([...distractors]);

  return { sequence, answer, options, stage };
}

export function MiniGamePolaScreen({ profile, onBack, backRef }: Props) {
  preloadMiniGameSprites("props", "nature");
  const cfg = getConfig(profile.difficulty);
  const { store, addMiniGameSession } = useGameStore();

  const [screen, setScreen] = useState<"start" | "playing" | "result" | "leaderboard">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(cfg.timeLimit);
  const [question, setQuestion] = useState(() => generatePattern(cfg, 0));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [showExit, setShowExit] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef(Date.now());
  const ftRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "pola");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);
  const leaderboard = store.miniGameLeaderboards["pola"] || [];

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ftRef.current) { clearTimeout(ftRef.current); ftRef.current = null; }
  }, []);

  const endGame = useCallback(() => {
    clearTimers();
    const avgTime = answerTimes.length > 0
      ? answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length
      : cfg.timeLimit;

    const session: MiniGameSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      gameType: "pola",
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
  }, [clearTimers, answerTimes, cfg.timeLimit, profile, score, correctCount, stage, addMiniGameSession]);

  const nextQuestion = useCallback((currentCorrect: number) => {
    const q = generatePattern(cfg, currentCorrect);
    setQuestion(q);
    setStage(q.stage);
    setTimeLeft(cfg.timeLimit);
    questionStartRef.current = Date.now();

    clearTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearTimers(); endGame(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [cfg, clearTimers, endGame]);

  const handleAnswer = (ans: string) => {
    clearTimers();
    const elapsed = (Date.now() - questionStartRef.current) / 1000;

    if (ans === question.answer) {
      const speedBonus = Math.round((timeLeft / cfg.timeLimit) * 100);
      const diffBonus = getDifficultyBonus(stage);
      const streakBonus = Math.min(Math.floor((correctCount + 1) / 5) * 10, 100);
      const questionScore = 100 + speedBonus + diffBonus + streakBonus;

      setScore(s => s + questionScore);
      setCorrectCount(c => c + 1);
      setAnswerTimes(t => [...t, elapsed]);
      setFeedback("correct");

      ftRef.current = setTimeout(() => {
        setFeedback(null);
        nextQuestion(correctCount + 1);
      }, 400);
    } else {
      setFeedback("wrong");
      setAnswerTimes(t => [...t, elapsed]);
      ftRef.current = setTimeout(() => endGame(), 800);
    }
  };

  const startGame = () => {
    setScore(0); setCorrectCount(0); setStage(1); setAnswerTimes([]);
    setFeedback(null); setScreen("playing");
    nextQuestion(0);
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
        <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
          <MiniGameIcon gameId="pola-kilat" className="size-20 mb-3" />
          <h1 className="font-display font-black text-3xl mb-1">{cfg.label}</h1>
          <p className="text-sm font-bold opacity-80 mb-4">Tebak gambar selanjutnya dari pola yang ada!</p>
          {personalBest > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-black/20">
              <div className="text-xs uppercase font-bold opacity-70">Rekor Terbaik</div>
              <div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div>
            </div>
          )}
          {leaderboard.length > 0 && (
            <div className="mb-4 text-left">
              <div className="text-xs uppercase font-bold opacity-70 mb-1">Top 3</div>
              {leaderboard.slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center gap-2 text-sm">
                  <span className="font-black">{["🥇","🥈","🥉"][i]}</span>
                  <AvatarPortrait avatar={e.avatar} className="w-6 h-6 rounded-full" />
                  <span className="truncate flex-1">{e.profileName}</span>
                  <span className="font-black">{e.score}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton>
            <GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton>
          </div>
          <button type="button" onClick={() => setScreen("leaderboard")} className="tmt-text-button mt-3 text-xs font-bold text-white/70 underline">Lihat Leaderboard</button>
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
              <div className="text-2xl font-black w-10 text-center shrink-0">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</div>
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

  // ── Result Screen ──
  if (screen === "result") {
    const avgTime = answerTimes.length > 0 ? (answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length).toFixed(1) : "—";
    const isNewBest = score > personalBest;
    return (
      <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
        <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
          <div className="text-6xl mb-3">{isNewBest ? "👑" : "🏆"}</div>
          <h2 className="font-display font-black text-2xl mb-1">Permainan Selesai!</h2>
          {isNewBest && <p className="text-yellow-300 font-black text-sm mb-3 animate-bob">🎉 Rekor Baru!</p>}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black text-yellow-300">{score}</div><div className="text-[10px] uppercase font-bold opacity-70">Skor</div></div>
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black">{correctCount}</div><div className="text-[10px] uppercase font-bold opacity-70">Benar</div></div>
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black">{stage}</div><div className="text-[10px] uppercase font-bold opacity-70">Stage</div></div>
            <div className="bg-black/20 rounded-2xl p-3"><div className="text-3xl font-black">{avgTime}s</div><div className="text-[10px] uppercase font-bold opacity-70">Rata² Waktu</div></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <GameButton variant="ghost" full onClick={onBack}>Home</GameButton>
            <GameButton variant="primary" full onClick={startGame}>Main Lagi</GameButton>
          </div>
          <button type="button" onClick={() => setScreen("leaderboard")} className="tmt-text-button text-xs font-bold text-white/70 underline">Lihat Leaderboard</button>
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
          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="ghost" full onClick={() => setShowExit(false)}>Lanjut Main</GameButton>
            <GameButton variant="danger" full onClick={onBack}>Keluar</GameButton>
          </div>
        </GameCard>
      </div>
    );
  }

  // ── Playing Screen ──
  const timerPercent = (timeLeft / cfg.timeLimit) * 100;
  const timerColor = timeLeft <= 2 ? "#A02020" : timeLeft <= 4 ? "#D48806" : "#2E8B12";
  const colsClass = cfg.optionCount <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button type="button" aria-label="Tutup" onClick={() => setShowExit(true)} className="tmt-icon-button h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95"><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm sm:text-lg border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm sm:text-lg border-2 border-[#CBB794]">✅ {correctCount}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-xs sm:text-sm border-2 border-[#CBB794] ml-auto">Stage {stage}</div>
      </header>

      <div className="h-3 rounded-full bg-black/10 mb-4 shrink-0 overflow-hidden border border-white/50">
        <div className="h-full rounded-full transition-all duration-100" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center min-h-0">
        <GameCard tone="cream" className={`w-full max-w-sm text-center py-8 mb-4 border-4 shrink-0 ${feedback === "correct" ? "border-[#2E8B12] bg-[#E8F5E9]" : feedback === "wrong" ? "border-[#A02020] bg-[#FFEBEE]" : "border-[#CBB794]"}`}>
          <div className="text-xs font-bold text-[#8C6B45] mb-3 uppercase">Apa selanjutnya?</div>
          <div className="flex justify-center items-center gap-1 sm:gap-2 text-3xl sm:text-4xl flex-wrap">
            {question.sequence.map((emoji, i) => (
              <MemoryObjectIcon key={i} value={emoji} className="size-9 sm:size-11" />
            ))}
            <span className="text-[#A02020] font-black text-4xl sm:text-5xl ml-1">?</span>
          </div>
        </GameCard>

        <div className={`grid ${colsClass} gap-2 sm:gap-3 w-full max-w-sm`}>
          {question.options.map((opt, i) => (
            <button type="button"
              key={i}
              onClick={() => feedback === null && handleAnswer(opt)}
              disabled={feedback !== null}
              aria-label={getMemoryObjectLabel(opt)}
              className="tmt-choice-button h-16 sm:h-20 rounded-2xl bg-white border-4 border-[#CBB794] grid place-items-center text-3xl sm:text-4xl shadow-pop active:translate-y-[4px] active:shadow-sm transition-all hover:border-[#185E9F] disabled:opacity-50"
            >
              <MemoryObjectIcon value={opt} className="size-11" decorative />
            </button>
          ))}
        </div>
      </main>

      <div className="text-center text-xs font-bold text-[#8C6B45]/70 pt-2 shrink-0">⏱ {cfg.timeLimit} detik per soal</div>
    </div>
  );
}
