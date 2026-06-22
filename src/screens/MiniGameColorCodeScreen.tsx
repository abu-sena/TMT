import React, { useState, useEffect, useRef } from "react";
import { GameCard } from "@/components/ui/GameCard";
import { GameButton } from "@/components/ui/GameButton";
import { MiniGameResultScreen } from "./MiniGameResultScreen";
import { useGameStore } from "@/lib/storage";
import { createMiniGameSession } from "@/lib/minigame-engine";
import type { Profile, MiniGameSession, DifficultyId } from "@/types";
import { generateColorCodeQuestion, validateColorCodeAnswer, type ColorCodeQuestion } from "@/lib/color-code-generator";
import { CodeShape } from "@/components/CodeShape";

export function ColorCodeGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [question, setQuestion] = useState<ColorCodeQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [session, setSession] = useState<MiniGameSession | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "color-code");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const getTimerDuration = (diff: DifficultyId) => {
    switch (diff) {
      case "tk": return 15;
      case "sd-bawah": return 12;
      case "sd-atas": return 10;
      case "smp": return 8;
      case "sma": return 7;
      case "universitas": return 7;
      default: return 12;
    }
  };

  const genQ = () => {
    setQuestion(generateColorCodeQuestion(profile.difficulty));
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(getTimerDuration(profile.difficulty));
    setPhase("playing");
  };

  const handleSelectChoice = (answer: number) => {
    if (!question || phase !== "playing") return; 
    setSelectedAnswer(answer);
    
    const correct = validateColorCodeAnswer(question, answer);
    setIsCorrect(correct);
    
    if (correct) {
      // Speed bonus max 50
      const duration = getTimerDuration(profile.difficulty);
      const speedBonus = Math.floor((timeLeft / duration) * 50);
      
      // Difficulty bonus
      let diffBonus = 0;
      if (profile.difficulty === "sd-bawah") diffBonus = 10;
      if (profile.difficulty === "sd-atas") diffBonus = 20;
      if (profile.difficulty === "smp") diffBonus = 30;
      if (profile.difficulty === "sma") diffBonus = 40;
      if (profile.difficulty === "universitas") diffBonus = 50;

      setScore(s => s + 100 + speedBonus + diffBonus);
      setCorrectCount(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 20));
    }
    
    setPhase("feedback");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const timerId = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerId);
          setIsCorrect(false);
          setSelectedAnswer(null); // time up
          setPhase("feedback");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [phase]);

  const handleNext = () => {
    if (qIdx >= 9) {
      endGame();
    } else {
      setQIdx(q => q + 1);
      genQ();
    }
  };

  const endGame = () => {
    const sess = createMiniGameSession(profile, "color-code", "logika", score, correctCount, 0, 0, 0, 1, profile.difficulty, 10, 10 - correctCount);
    setSession(sess);
    addMiniGameSession(sess);
    setPhase("result");
  };

  const startGame = () => {
    setScore(0);
    setCorrectCount(0);
    setQIdx(0);
    genQ();
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
        <div className="text-6xl mb-4">🧩</div>
        <h1 className="font-display font-black text-3xl mb-1">Kode Warna</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Pahami kode bentuk dan hitung hasilnya.</p>
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
        gameTitle="Kode Warna"
        gameIcon="🧩"
        isNewBest={score > personalBest}
        leaderboardRank={null}
        onPlayAgain={startGame}
        onLeaderboard={() => {}}
        onBack={() => setPhase("start")}
      />
    );
  }

  const renderExpressionDisplay = () => {
    if (!question) return null;
    const parts = question.expressionDisplay.split(/(\[[a-zA-Z]+\])/g);
    
    return (
      <div className="flex items-center justify-center gap-2 text-3xl sm:text-5xl font-black text-[#5A3515] flex-wrap">
        {parts.map((part, i) => {
          if (part.startsWith("[") && part.endsWith("]")) {
            const shapeName = part.slice(1, -1);
            const op = question.operands.find(o => o.shape === shapeName);
            // fallback to codeMap if not in operands (for algebra mode)
            const mapOp = question.codeMap.find(c => c.shape === shapeName);
            const color = op ? op.color : (mapOp ? mapOp.color : "#000");
            
            return (
              <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 inline-block shrink-0 filter drop-shadow-sm">
                <CodeShape shapeType={shapeName as any} color={color} />
              </div>
            );
          }
          return <span key={i} className="mx-1">{part}</span>;
        })}
      </div>
    );
  };

  const maxTimer = getTimerDuration(profile.difficulty);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4 overflow-hidden">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="flex-1 text-center">
          <h2 className="font-display font-black text-[#5A3515] text-lg">Kode Warna</h2>
        </div>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] shrink-0 flex items-center gap-2">
          <span>⭐ {score}</span>
          <span className="w-px h-4 bg-[#CBB794]/50"></span>
          <span>{qIdx + 1}/10</span>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center min-h-0 w-full max-w-2xl mx-auto">
        {question && (
          <>
            {/* Timer Bar */}
            <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden mb-3 shrink-0">
              <div 
                className={`h-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${(timeLeft / maxTimer) * 100}%` }}
              />
            </div>

            {/* Legend Area */}
            <GameCard tone="cream" className="w-full p-3 sm:p-4 mb-4 border-4 shrink-0 border-[#CBB794]">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {question.codeMap.map((code, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-white p-2 rounded-xl border-2 border-[#E8DCC2] min-w-[3.5rem]">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 mb-1">
                      <CodeShape shapeType={code.shape} color={code.color} />
                    </div>
                    <div className="font-black text-[#5A3515] text-sm sm:text-base border-t-2 border-dashed border-[#E8DCC2] w-full text-center pt-1 mt-1">
                      {code.value}
                    </div>
                  </div>
                ))}
              </div>
            </GameCard>

            {/* Question Area */}
            <div className="flex-1 w-full flex items-center justify-center min-h-[120px] mb-4">
               {renderExpressionDisplay()}
            </div>

            {/* Choices Area */}
            <div className="w-full shrink-0">
              {phase === "playing" ? (
                <div className={`grid gap-3 w-full max-w-sm mx-auto ${question.shuffledChoices.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {question.shuffledChoices.map((choice, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSelectChoice(choice)}
                      className="bg-white border-4 border-[#CBB794] text-[#5A3515] font-black text-2xl h-16 rounded-[20px] shadow-pop active:translate-y-1 hover:border-[#185E9F] transition-all"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-full bg-white/90 backdrop-blur-sm rounded-[24px] p-4 border-4 border-[#CBB794] shadow-pop animate-pop-in">
                  <div className={`text-center font-black text-xl mb-2 ${isCorrect ? "text-[#2E8B12]" : "text-[#D32F2F]"}`}>
                    {isCorrect ? "Benar!" : (timeLeft === 0 ? "Waktu Habis!" : "Belum tepat.")}
                  </div>
                  <p className="text-center text-sm font-bold text-[#8C6B45] mb-4">
                    {question.explanation}
                  </p>
                  <GameButton variant={isCorrect ? "primary" : "secondary"} size="md" full onClick={handleNext}>
                    {qIdx >= 9 ? "Selesai" : "Lanjut →"}
                  </GameButton>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
