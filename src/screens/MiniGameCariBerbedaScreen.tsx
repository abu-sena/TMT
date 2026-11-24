/**
 * Cari yang Berbeda — Spot the difference mini-game
 * Fokus Cepat package
 * Uses familiar illustrated objects with six rounds of progressive challenge.
 */
import { X as TmtCloseGlyph } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MiniGameIcon, PuzzleObjectArt } from "@/components/minigames/MiniGameArt";
import { PUZZLE_OBJECTS, getPuzzleObject, type PuzzleObjectId } from "@/lib/puzzle-objects";
import type { Profile, MiniGameSession } from "@/types";
import { shuffleArray } from "@/lib/utils";
import { createMiniGameSession } from "@/lib/minigame-engine";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { MiniGameResultScreen } from "./MiniGameResultScreen";
import { useGameStore } from "@/lib/storage";
import type React from "react";

interface Props { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null>; }

interface PuzzleItem {
  id: string;
  objectId: PuzzleObjectId;
  rotation: number;
  mirrored: boolean;
  isOdd: boolean;
}

const BASE_ITEM_COUNTS: Record<string, number> = {
  tk: 12,
  "sd-bawah": 16,
  "sd-atas": 18,
  smp: 20,
  sma: 20,
  universitas: 20,
};

const MAX_ITEM_COUNTS: Record<string, number> = {
  tk: 18,
  "sd-bawah": 20,
  "sd-atas": 22,
  smp: 24,
  sma: 24,
  universitas: 24,
};

function getRoundTimeLimit(difficulty: string, stage: number) {
  const base = difficulty === "tk" ? 12 : difficulty === "sd-bawah" ? 10 : 8;
  return Math.max(difficulty === "tk" ? 8 : 5, base - Math.ceil((stage - 1) / 1.5));
}

function generateQuestion(difficulty: string, correctCount: number): { items: PuzzleItem[]; oddIndex: number; stage: number } {
  const stage = Math.min(6, Math.floor(correctCount / 2) + 1);
  const baseCount = BASE_ITEM_COUNTS[difficulty] ?? 16;
  const maximum = MAX_ITEM_COUNTS[difficulty] ?? 24;
  const count = Math.min(maximum, baseCount + (stage - 1) * 2);
  const normalObject = shuffleArray([...PUZZLE_OBJECTS])[0];
  const sameFamily = shuffleArray(PUZZLE_OBJECTS.filter((object) => object.family === normalObject.family && object.id !== normalObject.id));
  const otherFamilies = shuffleArray(PUZZLE_OBJECTS.filter((object) => object.family !== normalObject.family));
  const oddObject = stage <= 2 ? otherFamilies[0] : sameFamily[0];
  const oddPosition = Math.floor(Math.random() * count);

  const items = Array.from({ length: count }, (_, index) => {
    const isOdd = index === oddPosition;
    return {
      id: `icon-${index}`,
      objectId: isOdd && stage <= 4 ? oddObject.id : normalObject.id,
      rotation: isOdd && stage === 5 ? 180 : 0,
      mirrored: isOdd && stage >= 6,
      isOdd,
    };
  });

  return { items, oddIndex: oddPosition, stage };
}

export function CariBerbedaScreen({ profile, onBack, backRef }: Props) {
  const { addMiniGameSession, store } = useGameStore();
  const [screen, setScreen] = useState<"start" | "playing" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [stage, setStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timeLimit, setTimeLimit] = useState(10);
  const [question, setQuestion] = useState(() => generateQuestion(profile.difficulty, 0));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [showExit, setShowExit] = useState(false);
  const [session, setSession] = useState<MiniGameSession | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qStartRef = useRef(Date.now());
  const ftRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "cari-berbeda");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ftRef.current) { clearTimeout(ftRef.current); ftRef.current = null; }
  }, []);

  const endGame = useCallback(() => {
    clearTimers();
    const avgTime = answerTimes.length > 0 ? answerTimes.reduce((a,b)=>a+b,0)/answerTimes.length : 0;
    const sess = createMiniGameSession(profile, "cari-berbeda", "fokus-cepat", score, correctCount, Math.round(avgTime*100)/100, answerTimes.length>0?Math.min(...answerTimes):0, answerTimes.length>0?Math.max(...answerTimes):0, stage, profile.difficulty, correctCount, 0);
    setSession(sess);
    addMiniGameSession(sess);
    setScreen("result");
  }, [clearTimers, answerTimes, profile, score, correctCount, stage, addMiniGameSession]);

  const nextQuestion = useCallback((cc: number) => {
    const q = generateQuestion(profile.difficulty, cc);
    setQuestion(q);
    setStage(q.stage);
    setSelectedIdx(null);
    setFeedback(null);
    const tl = getRoundTimeLimit(profile.difficulty, q.stage);
    setTimeLimit(tl);
    setTimeLeft(tl);
    qStartRef.current = Date.now();
    clearTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearTimers(); endGame(); return 0; } return t - 1; });
    }, 1000);
  }, [profile.difficulty, clearTimers, endGame]);

  const handleSelect = (idx: number) => {
    if (feedback) return;
    clearTimers();
    const elapsed = (Date.now() - qStartRef.current) / 1000;
    setSelectedIdx(idx);

    // Validate based on shape (item.isOdd), not color
    if (idx === question.oddIndex) {
      const speedBonus = Math.round((timeLeft / timeLimit) * 50);
      const qScore = 100 + speedBonus + question.stage * 10;
      setScore(s => s + qScore);
      setCorrectCount(c => c + 1);
      setAnswerTimes(t => [...t, elapsed]);
      setFeedback("correct");
      ftRef.current = setTimeout(() => nextQuestion(correctCount + 1), 400);
    } else {
      setFeedback("wrong");
      setAnswerTimes(t => [...t, elapsed]);
      ftRef.current = setTimeout(() => endGame(), 800);
    }
  };

  const startGame = () => { setScore(0); setCorrectCount(0); setAnswerTimes([]); setFeedback(null); setScreen("playing"); nextQuestion(0); };

  useEffect(() => () => clearTimers(), [clearTimers]);
  useEffect(() => { backRef.current = () => { if (screen === "playing") { setShowExit(true); return true; } if (screen === "result") { setScreen("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, screen]);

  if (screen === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="blue" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <MiniGameIcon gameId="cari-berbeda" className="size-20 mb-3" />
        <h1 className="font-display font-black text-3xl mb-1">Cari yang Berbeda</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Temukan satu ikon yang berbeda. Semakin jauh, pilihannya makin mirip!</p>
        {personalBest > 0 && (<div className="mb-4 p-3 rounded-2xl bg-black/20"><div className="text-xs uppercase opacity-70">Rekor Terbaik</div><div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div></div>)}
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (screen === "result" && session) return (
    <MiniGameResultScreen profile={profile} session={session} gameTitle="Cari yang Berbeda" gameIcon="🔍" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setScreen("start")} />
  );

  if (showExit) return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="cream" className="text-center w-full max-w-sm p-6 border-4 border-[#CBB794]">
        <div className="text-5xl mb-3">🚪</div><h2 className="font-display font-black text-xl text-[#5A3515] mb-2">Keluar dari mini-game?</h2>
        <p className="text-sm font-bold text-[#8C6B45] mb-4">Skor sesi ini belum disimpan.</p>
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={() => setShowExit(false)}>Lanjut Main</GameButton><GameButton variant="danger" full onClick={onBack}>Keluar</GameButton></div>
      </GameCard>
    </div>
  );

  const timerPercent = (timeLeft / timeLimit) * 100;
  const timerColor = timeLeft <= 2 ? "#A02020" : timeLeft <= 4 ? "#D48806" : "#2E8B12";

  // Determine grid columns based on object count
  const gridCols = question.items.length <= 16 ? 4 : question.items.length <= 20 ? 5 : 6;
  const iconSize = stage >= 5 ? "size-7 sm:size-8" : stage >= 3 ? "size-8 sm:size-9" : "size-9 sm:size-10";
  const instruction = stage >= 6
    ? "Periksa arah ikon dengan teliti."
    : stage === 5
      ? "Ada satu ikon yang arahnya berubah."
      : stage >= 3
        ? "Perhatikan bentuk ikon yang satu keluarga."
        : "Cari satu ikon yang berbeda dari kelompoknya.";

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button type="button" onClick={() => setShowExit(true)} aria-label="Keluar dari mini-game" className="tmt-icon-button h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95"><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794]">⭐ {score}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794]">✅ {correctCount}</div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-xs border-2 border-[#CBB794] ml-auto">Stage {stage}</div>
      </header>
      <div className="h-3 rounded-full bg-black/10 mb-4 shrink-0 overflow-hidden border border-white/50">
        <div className="h-full rounded-full transition-all" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
        <GameCard tone="cream" className={`w-full max-w-lg text-center py-6 mb-4 border-4 shrink-0 ${feedback === "correct" ? "border-[#2E8B12] bg-[#E8F5E9]" : feedback === "wrong" ? "border-[#A02020] bg-[#FFEBEE]" : "border-[#CBB794]"}`}>
          <p className="text-xs font-bold text-[#8C6B45] mb-3">{instruction}</p>
          <div className={`grid gap-2 justify-center px-2`} style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            {question.items.map((item, i) => {
              const isSelected = selectedIdx === i;
              const isOdd = i === question.oddIndex;
              return (
                <button type="button"
                  key={item.id}
                  onClick={() => handleSelect(i)}
                  disabled={feedback !== null}
                  aria-label={`Pilihan ${i + 1}: ${getPuzzleObject(item.objectId)?.name ?? "ikon"}`}
                  aria-pressed={isSelected}
                  className={`tmt-grid-button p-2 rounded-xl border-3 transition-all flex items-center justify-center aspect-square ${
                    isSelected 
                      ? (isOdd ? "border-[#2E8B12] bg-green-100 scale-105" : "border-[#A02020] bg-red-100 scale-105")
                      : "border-transparent hover:border-[#185E9F] hover:bg-white/50"
                  } disabled:cursor-default`}
                >
                  <PuzzleObjectArt objectId={item.objectId} className={iconSize} rotation={item.rotation} mirrored={item.mirrored} />
                </button>
              );
            })}
          </div>
        </GameCard>
      </main>
      <div className="text-center text-xs font-bold text-[#8C6B45]/70 pt-2 shrink-0">⏱ {timeLeft} detik · Temukan ikon yang berbeda</div>
    </div>
  );
}
