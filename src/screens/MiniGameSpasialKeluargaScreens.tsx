/**
 * Spasial mini-games: Ubah Posisi, Cocokkan Bayangan, Jalur Tercepat
 * Keluarga: Misi Keluarga
 */
import { ArrowLeft as TmtBackGlyph, X as TmtCloseGlyph } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Profile, MiniGameSession } from "@/types";
import { createMiniGameSession } from "@/lib/minigame-engine";
import { shuffleArray } from "@/lib/utils";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { MiniGameResultScreen } from "./MiniGameResultScreen";
import { useGameStore } from "@/lib/storage";
import { getPathTileLabel, MiniGameIcon, MiniGameSprite, PathTileArt, preloadMiniGameSprites } from "@/components/minigames/MiniGameArt";
import { MemoryObjectIcon } from "@/components/minigames/MemoryObjectIcon";
import type React from "react";

// ═══════════════════════════
// Ubah Posisi (10×10 grid)
// ═══════════════════════════

function UbahPosisiGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  preloadMiniGameSprites("memory", "path");
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [startPos, setStartPos] = useState({ row: 0, col: 0 });
  const [moves, setMoves] = useState<{ direction: string; steps: number; emoji: string }[]>([]);
  const [correctPos, setCorrectPos] = useState({ row: 0, col: 0 });
  const [userPos, setUserPos] = useState<{ row: number; col: number } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [session, setSession] = useState<MiniGameSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastQScore, setLastQScore] = useState(0);
  const [lastQSpeedTier, setLastQSpeedTier] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const gridSize = 10;

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "ubah-posisi");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const dirEmojis: Record<string, string> = { right: "➡️", left: "⬅️", up: "⬆️", down: "⬇️" };
  const maxMoves = profile.difficulty === "tk" ? 1 : profile.difficulty === "sd-bawah" ? 2 : profile.difficulty === "sd-atas" ? 3 : profile.difficulty === "smp" ? 4 : profile.difficulty === "sma" ? 5 : 6;

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const startTimer = () => {
    clearTimer();
    startTimeRef.current = Date.now();
    setElapsedMs(0);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 50);
  };

  const stopTimer = (): number => {
    clearTimer();
    return Date.now() - startTimeRef.current;
  };

  const genQ = () => {
    const sr = Math.floor(Math.random() * gridSize);
    const sc = Math.floor(Math.random() * gridSize);
    const moveCount = Math.min(maxMoves, 2 + Math.floor(Math.random() * (maxMoves - 1)));
    const dirs = ["right", "left", "up", "down"];
    let cr = sr, cc = sc;
    const genMoves: { direction: string; steps: number; emoji: string }[] = [];
    for (let i = 0; i < moveCount; i++) {
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      const steps = 1 + Math.floor(Math.random() * 4);
      let nr = cr, nc = cc;
      if (d === "right") nc += steps;
      else if (d === "left") nc -= steps;
      else if (d === "up") nr -= steps;
      else nr += steps;
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) { i--; continue; }
      cr = nr; cc = nc;
      genMoves.push({ direction: d, steps, emoji: dirEmojis[d] });
    }
    setStartPos({ row: sr, col: sc });
    setMoves(genMoves);
    setCorrectPos({ row: cr, col: cc });
    setUserPos(null);
    setIsCorrect(null);
    setLastQScore(0);
    setLastQSpeedTier("");
    startTimer();
  };

  const nextQ = () => { if (qIdx >= 8) { endGame(); return; } setQIdx(q => q + 1); genQ(); };

  const checkAnswer = (row: number, col: number) => {
    const elapsed = stopTimer();
    setUserPos({ row, col });
    const correct = row === correctPos.row && col === correctPos.col;
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount(c => c + 1);
      const speedBonus = (() => {
        // inline speed bonus calculation
        const thresholds: Record<string, number[]> = {
          tk: [5000, 8000, 12000, 20000],
          "sd-bawah": [6000, 10000, 15000, 25000],
          "sd-atas": [8000, 13000, 20000, 30000],
          smp: [10000, 15000, 22000, 35000],
          sma: [12000, 18000, 25000, 38000],
          universitas: [15000, 22000, 30000, 45000],
        };
        const t = thresholds[profile.difficulty] || thresholds["sd-bawah"];
        if (elapsed <= t[0]) return { bonus: 100, tier: "Sangat Cepat ⚡" };
        if (elapsed <= t[1]) return { bonus: 75, tier: "Cepat 🚀" };
        if (elapsed <= t[2]) return { bonus: 50, tier: "Normal ⭐" };
        if (elapsed <= t[3]) return { bonus: 25, tier: "Lambat 🐢" };
        return { bonus: 10, tier: "Sangat Lambat ⏳" };
      })();
      const diffBonus = { tk: 0, "sd-bawah": 10, "sd-atas": 20, smp: 30, sma: 40, universitas: 50 }[profile.difficulty] || 0;
      const qScore = 100 + speedBonus.bonus + diffBonus;
      setScore(s => s + qScore);
      setLastQScore(qScore);
      setLastQSpeedTier(speedBonus.tier);
    } else {
      setScore(s => Math.max(0, s - 20));
    }
  };

  const endGame = () => {
    clearTimer();
    const sess = createMiniGameSession(profile, "ubah-posisi", "spasial", score, correctCount, 0, 0, 0, 1, profile.difficulty, qIdx, qIdx - correctCount);
    setSession(sess); addMiniGameSession(sess); setPhase("result");
  };

  const startGame = () => { setScore(0); setCorrectCount(0); setQIdx(0); setPhase("playing"); genQ(); };

  useEffect(() => { backRef.current = () => { clearTimer(); if (phase === "playing") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; clearTimer(); }; }, [backRef, phase, onBack]);

  const formatElapsed = (ms: number) => {
    const totalCentis = Math.floor(ms / 10);
    const min = Math.floor(totalCentis / 6000);
    const sec = Math.floor((totalCentis % 6000) / 100);
    const centi = totalCentis % 100;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(centi).padStart(2, "0")}`;
  };

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#A5D6A7] via-[#C8E6C9] to-[#E8F5E9] flex flex-col items-center justify-center p-4">
      <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <MiniGameIcon gameId="ubah-posisi" className="size-20 mb-3" />
        <h1 className="font-display font-black text-3xl mb-1">Ubah Posisi</h1>
        <p className="text-sm font-bold opacity-80 mb-2">
          Seekor kelinci kecil tersesat di padang rumput.
        </p>
        <p className="text-xs font-bold opacity-70 mb-4">
          Ikuti arah geraknya dan bantu ia menemukan sarangnya! 🕳️
        </p>
        {personalBest > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-black/20">
            <div className="text-xs uppercase font-bold opacity-70">Rekor Terbaik</div>
            <div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div>
          </div>
        )}
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) return (
    <MiniGameResultScreen profile={profile} session={session} gameTitle="Ubah Posisi" gameIcon="🐰" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />
  );

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#C8E6C9] via-[#A5D6A7] to-[#81C784] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 pt-safe mt-1 px-2 flex items-center gap-2">
        <button type="button" aria-label="Tutup" onClick={() => { clearTimer(); onBack(); }} className="tmt-icon-button h-10 w-10 rounded-xl bg-white/60 border-2 border-[#2E8B12]/30 text-[#1B5E20] grid place-items-center text-lg shrink-0 active:scale-95"><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="flex-1 text-center">
          <h1 className="font-display font-black text-sm sm:text-base text-[#1B5E20] leading-tight">🐰 Bantu Kelinci Pulang</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/60 px-3 py-1.5 rounded-full font-black text-[#1B5E20] text-xs border-2 border-[#2E8B12]/30 font-mono">
            ⏱ {formatElapsed(elapsedMs)}
          </div>
          <div className="bg-white/60 px-2 py-1.5 rounded-full font-black text-[#1B5E20] text-xs border-2 border-[#2E8B12]/30">{qIdx + 1}/8</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto px-2">
        {/* Story hint */}
        <p className="text-[10px] font-bold text-[#33691E] mb-1 text-center opacity-70">
          Semakin cepat kamu membantu kelinci, semakin besar poinmu!
        </p>

        {/* Instructions */}
        <div className="bg-white/80 rounded-2xl p-3 mb-2 border-2 border-[#2E8B12]/30 w-[95vw] max-w-lg">
          <div className="text-xs font-bold text-[#33691E] mb-1 text-center">
            🐰 Kelinci mulai dari ({startPos.row + 1}, {startPos.col + 1})
          </div>
          <div className="text-[10px] font-bold text-[#558B2F] mb-1 text-center">
            Cari sarangnya di posisi akhir!
          </div>
          <div className="flex justify-center gap-2 text-sm font-black text-[#1B5E20] flex-wrap">
            {moves.map((m, i) => (
              <span key={i} className="bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#4CAF50]/30">
                {m.emoji}{m.steps}
              </span>
            ))}
          </div>
        </div>

        {/* Grid — 95% width, centered */}
        <div className="w-[95vw] max-w-lg mx-auto">
          <div className="bg-white/70 rounded-2xl p-2 border-2 border-[#2E8B12]/30">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const row = Math.floor(i / gridSize);
                const col = i % gridSize;
                const isStart = row === startPos.row && col === startPos.col;
                const isUser = userPos?.row === row && userPos?.col === col;
                const showCorrect = isCorrect !== null && row === correctPos.row && col === correctPos.col;
                const marker = isStart
                  ? <MemoryObjectIcon value="animal-rabbit" className="mini-game-tile-art" decorative />
                  : isUser && !isCorrect
                    ? "❌"
                    : isUser || showCorrect
                      ? <MiniGameSprite atlas="path" index={5} className="mini-game-tile-art" />
                      : null;
                return (
                  <button type="button"
                    key={i}
                    onClick={() => !isCorrect && isCorrect === null && checkAnswer(row, col)}
                    disabled={isCorrect !== null}
                    aria-label={`${isStart ? "Titik awal, " : ""}baris ${row + 1}, kolom ${col + 1}`}
                    className={`tmt-grid-button aspect-square rounded-md text-xs sm:text-sm grid place-items-center transition-all ${
                      isStart ? "bg-[#FFF9C4] border-2 border-[#F9A825] font-bold" :
                      isUser ? (isCorrect ? "bg-[#C8E6C9] border-2 border-[#4CAF50] ring-2 ring-[#4CAF50]/40" : "bg-[#FFCDD2] border-2 border-[#F44336]") :
                      showCorrect && isCorrect === false ? "bg-[#C8E6C9] border-2 border-[#4CAF50]" :
                      "bg-white/60 border border-[#A5D6A7] hover:bg-[#E8F5E9]"
                    }`}
                  >
                    {marker}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback after answer */}
        {isCorrect !== null && (
          <div className="mt-3 w-[95vw] max-w-lg animate-pop-in">
            {isCorrect ? (
              <div className="rounded-2xl bg-[#E8F5E9] border-2 border-[#4CAF50] p-3 text-center">
                <div className="text-lg mb-1">🐰🕳️</div>
                <div className="font-black text-sm text-[#2E8B12]">
                  Hebat! Kamu membantu kelinci menemukan sarangnya!
                </div>
                <div className="text-xs font-bold text-[#33691E] mt-1">
                  Waktu: {formatElapsed(elapsedMs)} · {lastQSpeedTier}
                </div>
                <div className="text-xs font-bold text-[#558B2F] mt-0.5">
                  +{lastQScore} poin
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FFEBEE] border-2 border-[#E53935] p-3 text-center">
                <div className="font-black text-sm text-[#C62828]">
                  Belum tepat. Yuk perhatikan lagi arah gerak kelinci.
                </div>
                <div className="text-xs font-bold text-[#8C6B45] mt-1">
                  Sarang seharusnya di ({correctPos.row + 1}, {correctPos.col + 1})
                </div>
              </div>
            )}
            <div className="mt-2">
              <GameButton variant="primary" size="md" full onClick={nextQ}>
                {qIdx >= 8 ? "Lihat Hasil" : "Lanjut →"}
              </GameButton>
            </div>
          </div>
        )}

        {/* Grass decoration at bottom */}
        <div className="text-center text-2xl leading-none opacity-30 mt-auto pt-2 select-none">
          🌿🌱🌾🌸🌿🌱🌾🌸🌿
        </div>
      </main>
    </div>
  );
}

import { PuzzleObjectArt } from "@/components/minigames/MiniGameArt";
import { generateShadowMatchQuestion, validateShadowMatchAnswer, type ShadowMatchQuestion } from "@/lib/shadow-match-generator";

function CocokBayanganGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<ShadowMatchQuestion | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [session, setSession] = useState<MiniGameSession | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "cocok-bayangan");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const genQ = (roundIndex = qIdx) => {
    setQuestion(generateShadowMatchQuestion(profile.difficulty, roundIndex));
    setSelectedChoiceId(null);
    setIsCorrect(null);
    setPhase("playing");
  };

  const handleSelectChoice = (choiceId: string) => {
    if (!question || selectedChoiceId) return; // Prevent multiple clicks
    setSelectedChoiceId(choiceId);
    
    const correct = validateShadowMatchAnswer(question, choiceId);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 100);
      setCorrectCount(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 20));
    }
    
    setPhase("feedback");
  };

  const handleNext = () => {
    if (qIdx >= 9) {
      endGame();
    } else {
      const nextRound = qIdx + 1;
      setQIdx(nextRound);
      genQ(nextRound);
    }
  };

  const endGame = () => {
    const sess = createMiniGameSession(profile, "cocok-bayangan", "spasial", score, correctCount, 0, 0, 0, Math.min(10, qIdx + 1), profile.difficulty, 10, 10 - correctCount);
    setSession(sess);
    addMiniGameSession(sess);
    setPhase("result");
  };

  const startGame = () => {
    setScore(0);
    setCorrectCount(0);
    setQIdx(0);
    genQ(0);
  };

  useEffect(() => {
    backRef.current = () => {
      if (phase === "playing" || phase === "feedback") { onBack(); return true; }
      if (phase === "result") { setPhase("start"); return true; }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <MiniGameIcon gameId="cocok-bayangan" className="size-20 mb-3" />
        <h1 className="font-display font-black text-3xl mb-1">Cocokkan Bayangan</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Pilih bayangan hitam yang cocok dengan gambar utama.</p>
        <div className="flex gap-3">
          <GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton>
          <GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton>
        </div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) {
    return (
      <MiniGameResultScreen
        profile={profile}
        session={session}
        gameTitle="Cocokkan Bayangan"
        gameIcon="👤"
        isNewBest={score > personalBest}
        leaderboardRank={null}
        onPlayAgain={startGame}
        onLeaderboard={() => {}}
        onBack={() => setPhase("start")}
      />
    );
  }

  // Column count based on choices: 3 choices -> 3 cols (or 1 row of 3), 4 choices -> 2x2, 5-6 -> 3x2
  const getGridCols = (count: number) => {
    if (count <= 3) return "grid-cols-3";
    if (count === 4) return "grid-cols-2";
    return "grid-cols-2 sm:grid-cols-3";
  };

  // Helper to render SVG
  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4 overflow-hidden">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button type="button" aria-label="Tutup" onClick={onBack} className="tmt-icon-button h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95"><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="flex-1 text-center">
          <h2 className="font-display font-black text-[#5A3515] text-lg">Cocokkan Bayangan</h2>
        </div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] shrink-0">
          {qIdx + 1}/10
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto w-full max-w-lg mx-auto">
        {question && (
          <>
            {/* Top Area: Main Object */}
            <GameCard tone="cream" className="mini-game-shadow-board w-full text-center py-6 mb-4 border-4 shrink-0 border-[#CBB794] relative overflow-hidden">
              <div className="text-xs font-bold text-[#8C6B45] mb-2 uppercase tracking-wide">Pilih bayangan yang cocok</div>
              <div className="flex justify-center items-center h-28 sm:h-32 mx-auto w-32">
                <div className="w-full h-full filter drop-shadow-md">
                  <PuzzleObjectArt objectId={question.mainObject.id} className="size-full" />
                </div>
              </div>
            </GameCard>

            {/* Bottom Area: Shadow Choices */}
            <div className={`grid ${getGridCols(question.shuffledChoices.length)} gap-3 sm:gap-4 w-full flex-1 min-h-0 content-start pb-4`}>
              {question.shuffledChoices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;
                const isAnswerCorrect = choice.isCorrect;
                
                // Styling logic during feedback phase
                let cardStyle = "bg-white border-[#CBB794] hover:border-[#185E9F]";
                let radioStyle = "border-[#CBB794] bg-white text-transparent";
                
                if (phase === "feedback") {
                  if (isSelected && isAnswerCorrect) {
                    cardStyle = "bg-[#C8E6C9] border-[#2E8B12]";
                    radioStyle = "border-[#2E8B12] bg-[#2E8B12] text-white";
                  } else if (isSelected && !isAnswerCorrect) {
                    cardStyle = "bg-[#FFCDD2] border-[#D32F2F]";
                    radioStyle = "border-[#D32F2F] bg-[#D32F2F] text-white";
                  } else if (isAnswerCorrect) {
                    // Highlight the correct answer if they got it wrong
                    cardStyle = "bg-[#E8F5E9] border-[#4CAF50] ring-4 ring-[#4CAF50]/40 ring-offset-2";
                    radioStyle = "border-[#4CAF50] bg-[#4CAF50] text-white";
                  } else {
                    cardStyle = "bg-white/50 border-[#E8DCC2] opacity-60";
                    radioStyle = "border-[#E8DCC2] bg-white text-transparent";
                  }
                } else if (isSelected) {
                  cardStyle = "bg-[#E3F2FD] border-[#185E9F]";
                  radioStyle = "border-[#185E9F] bg-[#185E9F] text-white";
                }

                return (
                  <button type="button"
                    key={choice.id} 
                    onClick={() => handleSelectChoice(choice.id)}
                    disabled={phase === "feedback"}
                    aria-label={`Bayangan ${index + 1}`}
                    aria-pressed={isSelected}
                    className={`tmt-choice-button h-28 sm:h-36 rounded-[24px] border-4 flex flex-col items-center justify-center p-2 shadow-pop active:translate-y-1 transition-all ${cardStyle}`}
                  >
                    <div className="flex-1 flex items-center justify-center overflow-hidden w-16 sm:w-20">
                      {/* SVGs handle their own flat black color via isShadow prop */}
                      <PuzzleObjectArt
                        objectId={choice.objectId}
                        className="size-full"
                        silhouette
                        rotation={choice.rotation}
                        mirrored={choice.mirrored}
                      />
                    </div>
                    
                    {/* Radio button indicator */}
                    <div className={`mt-2 h-6 w-6 rounded-full border-2 flex items-center justify-center text-sm shrink-0 transition-colors ${radioStyle}`}>
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback / Next button area */}
            {phase === "feedback" && (
              <div className="w-full shrink-0 bg-white/90 backdrop-blur-sm rounded-[24px] p-4 border-4 border-[#CBB794] shadow-pop animate-pop-in mt-auto">
                <div className={`text-center font-black text-lg mb-1 ${isCorrect ? "text-[#2E8B12]" : "text-[#D32F2F]"}`}>
                  {isCorrect ? "Benar!" : "Belum tepat."}
                </div>
                <p className="text-center text-sm font-bold text-[#8C6B45] mb-3">
                  {isCorrect ? "Bayangan ini cocok dengan gambar utama." : question.explanation}
                </p>
                <GameButton variant={isCorrect ? "primary" : "secondary"} size="md" full onClick={handleNext}>
                  {qIdx >= 9 ? "Selesai" : "Lanjut →"}
                </GameButton>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════
// Jalur Tercepat (6×16 grid, fullscreen)
// ═══════════════════════════

const FASTEST_PATH_ROWS = 16;
const FASTEST_PATH_COLS = 6;

interface FastestPathQuestion {
  id: string;
  rows: number;
  cols: number;
  start: { row: number; col: number };
  goal: { row: number; col: number };
  cells: string[][];
  shortestPath: [number, number][];
  shortestPathLength: number;
  timerLimit: number;
}

function bfs(grid: string[][], startR: number, startC: number, goalR: number, goalC: number, rows: number, cols: number): [number, number][] | null {
  const queue: [number, number, [number, number][]][] = [[startR, startC, [[startR, startC]]]];
  const visited = new Set<string>();
  visited.add(`${startR},${startC}`);
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  while (queue.length > 0) {
    const [r, c, path] = queue.shift()!;
    if (r === goalR && c === goalC) return path;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== "🪵" && !visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc, [...path, [nr, nc]]]);
      }
    }
  }
  return null;
}

function generateFastestPathQuestion(difficulty: string): FastestPathQuestion {
  const rows = FASTEST_PATH_ROWS;
  const cols = FASTEST_PATH_COLS;
  
  // Create grid
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill("🐾"));
  
  // Start at top, goal at bottom
  const startR = 0;
  const startC = Math.floor(Math.random() * cols);
  const goalR = rows - 1;
  const goalC = Math.floor(Math.random() * cols);
  
  grid[startR][startC] = "🐒";
  grid[goalR][goalC] = "🍌";
  
  // Add obstacles based on difficulty
  const obstacleRatio = difficulty === "sd-bawah" || difficulty === "tk" ? 0.12 : difficulty === "sd-atas" ? 0.18 : difficulty === "smp" ? 0.22 : 0.28;
  const obstacleCount = Math.floor(rows * cols * obstacleRatio);
  
  for (let i = 0; i < obstacleCount; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if ((r === startR && c === startC) || (r === goalR && c === goalC) || grid[r][c] === "🪵") continue;
    grid[r][c] = "🪵";
  }
  
  // Find shortest path
  let shortestPath = bfs(grid, startR, startC, goalR, goalC, rows, cols);
  
  // Regenerate if no path — remove some obstacles
  let retries = 0;
  while (!shortestPath && retries < 20) {
    const obsToRemove = Math.floor(obstacleCount * 0.2);
    for (let i = 0; i < obsToRemove; i++) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (grid[r][c] === "🪵") grid[r][c] = "🐾";
    }
    shortestPath = bfs(grid, startR, startC, goalR, goalC, rows, cols);
    retries++;
  }
  
  // If still no path, create a simple one
  if (!shortestPath) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === "🪵") grid[r][c] = "🐾";
      }
    }
    for (let i = 0; i < Math.floor(rows * cols * 0.1); i++) {
      const r = 1 + Math.floor(Math.random() * (rows - 2));
      const c = Math.floor(Math.random() * cols);
      if (grid[r][c] === "🐾") grid[r][c] = "🪵";
    }
    shortestPath = bfs(grid, startR, startC, goalR, goalC, rows, cols);
  }

  return {
    id: crypto.randomUUID(),
    rows,
    cols,
    start: { row: startR, col: startC },
    goal: { row: goalR, col: goalC },
    cells: grid,
    shortestPath: shortestPath || [[startR, startC]],
    shortestPathLength: shortestPath ? shortestPath.length - 1 : rows + cols,
    timerLimit: 0, // No countdown — elapsed timer instead
  };
}

function JalurTercepatGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<FastestPathQuestion | null>(null);
  const [userPath, setUserPath] = useState<[number, number][]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [reachedGoal, setReachedGoal] = useState(false);
  const [lastQStats, setLastQStats] = useState<{ score: number; speedTier: string; efficiencyTier: string } | null>(null);
  const [session, setSession] = useState<MiniGameSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "jalur-tercepat");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);
  const totalQuestions = profile.difficulty === "sd-bawah" || profile.difficulty === "tk" ? 5 : 6;

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  const clearAllTimers = () => { clearTimer(); if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; } };

  const startElapsedTimer = () => {
    clearTimer();
    startTimeRef.current = Date.now();
    setElapsedMs(0);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 50);
  };

  const stopElapsedTimer = (): number => {
    clearTimer();
    return Date.now() - startTimeRef.current;
  };

  const genQ = () => {
    clearAllTimers();
    const q = generateFastestPathQuestion(profile.difficulty);
    setQuestion(q);
    setUserPath([[q.start.row, q.start.col]]);
    setFeedbackMsg(null);
    setReachedGoal(false);
    setLastQStats(null);
    startElapsedTimer();
  };

  const clickCell = (row: number, col: number) => {
    if (!question || reachedGoal) return;
    const [lr, lc] = userPath[userPath.length - 1];
    const dist = Math.abs(row - lr) + Math.abs(col - lc);
    
    if (dist > 1) {
      showFeedback("Pilih kotak yang bersebelahan.");
      return;
    }
    if (dist === 0) return;
    if (question.cells[row][col] === "🪵") {
      showFeedback("Tidak bisa melewati rintangan 🪵.");
      return;
    }
    if (userPath.some(([r, c]) => r === row && c === col)) return;
    
    const newPath: [number, number][] = [...userPath, [row, col]];
    setUserPath(newPath);

    // Check if reached goal
    if (question.cells[row][col] === "🍌") {
      const elapsed = stopElapsedTimer();
      setReachedGoal(true);
      const stepsUsed = newPath.length - 1;

      // Speed bonus based on elapsed time
      const expectedFast = question.shortestPathLength * 700;
      const expectedNormal = question.shortestPathLength * 1200;
      const expectedSlow = question.shortestPathLength * 2000;
      let speedBonus = 25;
      let speedTier = "Lambat 🐢";
      if (elapsed <= expectedFast) { speedBonus = 100; speedTier = "Sangat Cepat ⚡"; }
      else if (elapsed <= expectedNormal) { speedBonus = 75; speedTier = "Cepat 🚀"; }
      else if (elapsed <= expectedSlow) { speedBonus = 50; speedTier = "Normal ⭐"; }

      // Efficiency bonus
      const stepDiff = stepsUsed - question.shortestPathLength;
      let effBonus = 10;
      let effTier = "Jalur Aman 🚶";
      if (stepDiff === 0) { effBonus = 50; effTier = "Jalur Sempurna 🎯"; }
      else if (stepDiff >= 1 && stepDiff <= 3) { effBonus = 25; effTier = "Jalur Efisien 👌"; }

      const diffBonus = { tk: 0, "sd-bawah": 10, "sd-atas": 20, smp: 30, sma: 40, universitas: 50 }[profile.difficulty] || 0;
      const finalScore = 100 + speedBonus + effBonus + diffBonus;
      setScore(s => s + finalScore);
      setLastQStats({ score: finalScore, speedTier, efficiencyTier: effTier });
      setFeedbackMsg("Berhasil! Kamu menemukan jalur menuju pisang.");
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const undoLast = () => {
    if (userPath.length > 1 && !reachedGoal) {
      setUserPath(p => p.slice(0, -1));
    }
  };

  const resetPath = () => {
    if (!question || reachedGoal) return;
    setUserPath([[question.start.row, question.start.col]]);
  };

  const endGame = () => {
    clearAllTimers();
    const sess = createMiniGameSession(profile, "jalur-tercepat", "spasial", score, qIdx + 1, 0, 0, 0, 1, profile.difficulty, totalQuestions, 0);
    setSession(sess);
    addMiniGameSession(sess);
    setPhase("result");
  };

  const nextQ = () => {
    if (qIdx >= totalQuestions - 1) { endGame(); }
    else { setQIdx(q => q + 1); genQ(); }
  };

  const startGame = () => { setScore(0); setQIdx(0); setPhase("playing"); genQ(); };

  useEffect(() => () => clearAllTimers(), []);

  useEffect(() => {
    backRef.current = () => {
      if (phase === "playing" || phase === "feedback") { clearAllTimers(); onBack(); return true; }
      if (phase === "result") { setPhase("start"); return true; }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, phase, onBack]);

  const formatElapsed = (ms: number) => {
    const totalCentis = Math.floor(ms / 10);
    const min = Math.floor(totalCentis / 6000);
    const sec = Math.floor((totalCentis % 6000) / 100);
    const centi = totalCentis % 100;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(centi).padStart(2, "0")}`;
  };

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <PathTileArt value="🐒" className="size-20 mb-3" />
        <h1 className="font-display font-black text-3xl mb-1">Jalur Tercepat</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Bantu monyet mencapai pisang lewat jalur tercepat. Pilih petak yang bersebelahan.</p>
        {personalBest > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-black/20">
            <div className="text-xs uppercase font-bold opacity-70">Rekor Terbaik</div>
            <div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div>
          </div>
        )}
        <div className="flex gap-3">
          <GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton>
          <GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton>
        </div>
      </GameCard>
    </div>
  );

  if (phase === "result" && session) return (
    <MiniGameResultScreen profile={profile} session={session} gameTitle="Jalur Tercepat" gameIcon="🐒" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />
  );

  if (!question) return null;

  const isPathCell = (r: number, c: number) => userPath.some(([pr, pc]) => pr === r && pc === c);
  const isUserPos = (r: number, c: number) => userPath.length > 0 && userPath[userPath.length - 1][0] === r && userPath[userPath.length - 1][1] === c;

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      {/* Compact header */}
      <header className="shrink-0 pt-safe mt-1 px-2 flex items-center gap-2">
        <button type="button" aria-label="Tutup" onClick={() => { clearAllTimers(); onBack(); }} className="tmt-icon-button h-9 w-9 rounded-lg bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-base shrink-0 active:scale-95"><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="flex-1 text-center">
          <h1 className="font-display font-black text-sm sm:text-base text-[#5A3515] leading-tight">🐒 Jalur Tercepat</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-white/50 px-2 py-1.5 rounded-full font-black text-[#5A3515] text-xs border-2 border-[#CBB794] font-mono">
            ⏱ {formatElapsed(elapsedMs)}
          </div>
          <div className="bg-white/50 px-2 py-1 rounded-full font-black text-[#5A3515] text-xs border-2 border-[#CBB794]">{qIdx + 1}/{totalQuestions}</div>
        </div>
      </header>

      {/* Main grid area */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-2 py-1">
        {/* Instruction */}
        {!reachedGoal && (
          <div className="text-[10px] font-bold text-[#8C6B45] mb-1 text-center">
            Ayo bantu secepat yang kamu bisa! | 🐒 ke 🍌
          </div>
        )}

        {/* Grid - 95% width */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden px-1">
          <div
            className="grid gap-0.5 w-[95vw] max-w-[600px] h-full max-h-[80vh]"
            style={{ gridTemplateColumns: `repeat(${FASTEST_PATH_COLS}, 1fr)`, gridTemplateRows: `repeat(${FASTEST_PATH_ROWS}, 1fr)` }}
          >
            {question.cells.map((row, ri) =>
              row.map((cell, ci) => {
                const isStart = ri === question.start.row && ci === question.start.col;
                const isGoal = ri === question.goal.row && ci === question.goal.col;
                const isBlocked = cell === "🪵";
                const isPath = isPathCell(ri, ci);
                const isCurrent = isUserPos(ri, ci);

                let bgClass = "bg-white/50";
                if (isStart || isGoal) bgClass = "bg-[#FFE0B2]";
                if (isBlocked) bgClass = "bg-[#795548]/50";
                if (isPath && !isStart && !isGoal) bgClass = "bg-[#A5D6A7]";
                if (isCurrent && !isStart && !isGoal) bgClass = "bg-[#81C784]";

                return (
                  <button type="button"
                    key={`${ri}-${ci}`}
                    onClick={() => clickCell(ri, ci)}
                    disabled={reachedGoal}
                    aria-label={`${getPathTileLabel(cell)}, baris ${ri + 1}, kolom ${ci + 1}`}
                    className={`tmt-grid-button rounded-[3px] grid place-items-center transition-all text-sm sm:text-xl select-none ${
                      bgClass
                    } ${!reachedGoal && !isBlocked ? "active:scale-90 active:bg-[#C8E6C9]" : ""} ${
                      isBlocked ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <PathTileArt value={cell} className="mini-game-tile-art" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Feedback message */}
        <div className="h-8 flex items-center justify-center shrink-0">
          {feedbackMsg && (
            <div className={`text-xs font-bold px-3 py-1 rounded-full animate-pop-in ${
              reachedGoal && userPath.length > 0 && question.cells[userPath[userPath.length - 1][0]][userPath[userPath.length - 1][1]] === "🍌"
                ? "bg-[#E8F5E9] text-[#2E8B12] border border-[#4CAF50]"
                : "bg-[#FFF3E0] text-[#E65100] border border-[#FF9800]"
            }`}>
              {feedbackMsg}
            </div>
          )}
        </div>

        {/* Stats when goal reached */}
        {reachedGoal && question.cells[userPath[userPath.length - 1][0]]?.[userPath[userPath.length - 1][1]] === "🍌" && (
          <div className="w-full max-w-sm mb-2 p-3 rounded-2xl bg-white/90 border-2 border-[#4CAF50] space-y-1.5 animate-pop-in">
            <div className="text-center font-black text-sm text-[#2E8B12]">🎉 Berhasil!</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-black text-[#5A3515]">{userPath.length - 1}</div>
                <div className="text-[10px] text-[#8C6B45]">Langkah</div>
              </div>
              <div>
                <div className="font-black text-[#5A3515]">{question.shortestPathLength}</div>
                <div className="text-[10px] text-[#8C6B45]">Terpendek</div>
              </div>
              <div>
                <div className="font-black text-[#5A3515]">⏱{formatElapsed(elapsedMs)}</div>
                <div className="text-[10px] text-[#8C6B45]">Waktu</div>
              </div>
            </div>
            {lastQStats && (
              <div className="mt-2 pt-2 border-t border-[#4CAF50]/20 text-center">
                <div className="text-[10px] font-bold text-[#33691E]">
                  {lastQStats.speedTier} · {lastQStats.efficiencyTier}
                </div>
                <div className="text-xs font-black text-[#2E8B12]">
                  +{lastQStats.score} poin
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom action area */}
      <footer className="shrink-0 px-2 pb-safe pt-1 flex gap-2">
        {!reachedGoal ? (
          <>
            <button type="button" data-action="neutral" onClick={undoLast} disabled={userPath.length <= 1}
              className="tmt-action-button h-10 px-3 rounded-xl bg-white/60 border-2 border-[#CBB794] text-[#5A3515] font-bold text-xs disabled:opacity-30 active:scale-95 transition-all">↩ Undo</button>
            <button type="button" data-action="danger-outline" onClick={resetPath}
              className="tmt-action-button h-10 px-3 rounded-xl bg-white/60 border-2 border-[#CBB794] text-[#5A3515] font-bold text-xs active:scale-95 transition-all">🔄 Reset</button>
            <div className="flex-1" />
            <div className="bg-white/50 px-3 h-10 rounded-xl border-2 border-[#CBB794] flex items-center font-black text-xs text-[#5A3515]">
              📏 {userPath.length - 1} langkah
            </div>
          </>
        ) : (
          <>
            <GameButton variant="ghost" size="md" full onClick={() => { setPhase("start"); }}>🏠 Kembali</GameButton>
            <GameButton variant="primary" size="md" full onClick={nextQ}>
              {qIdx >= totalQuestions - 1 ? "Lihat Hasil" : "Lanjut →"}
            </GameButton>
          </>
        )}
      </footer>
    </div>
  );
}

// ═══════════════════════════
// Susun Puzzle
// ═══════════════════════════
// Misi Keluarga
// ═══════════════════════════

const MISI_KELUARGA_LIST = [
  { id: "rapikan-meja", title: "Bantu Rapikan Meja", desc: "Rapikan meja belajar atau meja makanmu.", emoji: "🧹", category: "membantu" },
  { id: "terima-kasih", title: "Ucapkan Terima Kasih", desc: "Ucapkan terima kasih kepada orang tuamu hari ini.", emoji: "🙏", category: "adab" },
  { id: "baca-buku", title: "Membaca Buku 10 Menit", desc: "Baca buku apa saja selama 10 menit.", emoji: "📚", category: "belajar" },
  { id: "minta-maaf", title: "Minta Maaf", desc: "Jika ada salah, mintalah maaf dengan tulus.", emoji: "💝", category: "adab" },
  { id: "bantu-adik", title: "Bantu Adik/Kakak", desc: "Bantu saudaramu melakukan sesuatu hari ini.", emoji: "👨‍👩‍👧", category: "membantu" },
  { id: "doa-bersama", title: "Doa Bersama", desc: "Ajak keluarga shalat atau doa bersama.", emoji: "🤲", category: "ibadah" },
  { id: "senyum", title: "Senyum ke Semua Orang", desc: "Berikan senyum tulus ke semua orang di rumah.", emoji: "😊", category: "adab" },
];

function MisiKeluargaScreen({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { store, updateProfile } = useGameStore();
  const [missions, setMissions] = useState(MISI_KELUARGA_LIST.map(m => ({ ...m, done: false, verified: false })));

  const toggleMission = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  useEffect(() => { backRef.current = () => { onBack(); return true; }; return () => { backRef.current = null; }; }, [backRef, onBack]);

  const doneCount = missions.filter(m => m.done).length;
  const verifiedCount = missions.filter(m => m.verified).length;

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col overflow-hidden">
      <header className="shrink-0 content-wrapper pt-safe mt-2 pb-3 flex items-center gap-3">
        <button type="button" aria-label="Kembali" onClick={onBack} className="tmt-icon-button h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95"><TmtBackGlyph aria-hidden="true" /></button>
        <div className="flex-1"><h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">Misi Keluarga</h1><p className="text-xs text-[#5A3515]/80">Lakukan kebaikan di dunia nyata!</p></div>
        <div className="text-2xl">🏡</div>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-2 pb-4">
        <div className="flex gap-4 text-center mb-2">
          <div className="flex-1 rounded-2xl bg-white/80 p-3 border-2 border-[#CBB794]"><div className="font-black text-2xl text-[#2E8B12]">{doneCount}</div><div className="text-[10px] uppercase text-[#8C6B45]">Selesai</div></div>
          <div className="flex-1 rounded-2xl bg-white/80 p-3 border-2 border-[#CBB794]"><div className="font-black text-2xl text-[#D48806]">{verifiedCount}</div><div className="text-[10px] uppercase text-[#8C6B45]">Diverifikasi</div></div>
        </div>
        {missions.map(m => (
          <button type="button" key={m.id} onClick={() => toggleMission(m.id)}
            className={`tmt-choice-button w-full rounded-2xl p-4 text-left border-4 transition-all ${m.done ? "bg-[#E8F5E9] border-[#2E8B12]" : "bg-white/90 border-[#CBB794] hover:border-[#185E9F]"}`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{m.emoji}</div>
              <div className="flex-1"><div className="font-bold text-[#5A3515] text-sm">{m.title}</div><div className="text-xs text-[#8C6B45]">{m.desc}</div></div>
              <div className={`h-8 w-8 rounded-full grid place-items-center text-lg shrink-0 ${m.done ? "bg-[#2E8B12] text-white" : "bg-white/50 text-[#8C6B45] border-2 border-[#CBB794]"}`}>{m.done ? "✓" : "○"}</div>
            </div>
          </button>
        ))}
        <p className="text-xs text-center text-[#8C6B45] mt-4">Tap misi setelah kamu melakukannya. Minta orang tua untuk verifikasi di Parent Dashboard.</p>
      </main>
      <div className="shrink-0 content-wrapper pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={onBack}>🏠 Kembali</GameButton></div>
    </div>
  );
}

export { UbahPosisiGame, CocokBayanganGame, JalurTercepatGame, MisiKeluargaScreen };
