/**
 * MiniGame: Jalur Angka (Number Path Puzzle)
 * 
 * Gameplay: Isi kotak kosong di sepanjang jalur matematika agar hasil hitung benar.
 */

import { X as TmtCloseGlyph } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MiniGameIcon } from "@/components/minigames/MiniGameArt";
import type { Profile, MiniGameSession } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import type React from "react";
import { cn } from "@/lib/utils";
import {
  generateNumberPathPuzzle,
  getDifficultyConfig,
} from "@/games/number-path/generator";
import {
  validateNumericInput,
  validateNumberPathPuzzle,
  areAllInputsFilled,
  calculateNumberPathScore,
  createSession,
} from "@/games/number-path/validator";
import type {
  NumberPathQuestion,
  NumberPathSession,
  NumberPathCell,
} from "@/games/number-path/types";

// ═══════════════════════════════════════════
// Props
// ═══════════════════════════════════════════

interface Props {
  profile: Profile;
  onBack: () => void;
  backRef: React.MutableRefObject<(() => boolean) | null>;
}

// ═══════════════════════════════════════════
// Custom Numeric Keypad Component
// ═══════════════════════════════════════════

interface KeypadProps {
  value: string;
  onChange: (v: string) => void;
  onOk: () => void;
  onCancel: () => void;
  allowNegative: boolean;
}

function NumericKeypad({ value, onChange, onOk, onCancel, allowNegative }: KeypadProps) {
  const keys = [
    ["1","2","3"],
    ["4","5","6"],
    ["7","8","9"],
    [allowNegative?"-/+":"⌫","0", allowNegative?"⌫":"⌫"],
  ];

  const handleKey = (k: string) => {
    if (k === "⌫") {
      onChange(value.slice(0, -1));
    } else if (k === "-/+") {
      if (value.startsWith("-")) {
        onChange(value.slice(1));
      } else {
        onChange("-" + value);
      }
    } else {
      if (value.length < 8) onChange(value + k);
    }
  };

  return (
    <div className="tmt-dialog-surface rounded-2xl p-3 border shadow-lg">
      {/* Display */}
      <div className="bg-[#FDF8F0] rounded-xl p-3 mb-2 text-center border-2 border-[#E8DCC2]">
        <span className="font-display font-black text-2xl text-[#5A3515] min-h-[32px]">
          {value || "\u00A0"}
        </span>
      </div>
      {/* Keys */}
      <div className="space-y-1.5">
        {keys.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map(k => (
              <button type="button"
                key={`${ri}-${k}`}
                onPointerDown={e => { e.preventDefault(); handleKey(k); }}
                className={cn("tmt-grid-button",
                  "flex-1 py-3 rounded-xl font-black text-lg sm:text-xl active:scale-90 transition-transform",
                  k === "⌫"
                    ? "bg-[#FFEBEE] text-[#E53935] border-2 border-[#E53935]/30"
                    : k === "-/+"
                      ? "bg-[#FFF3E0] text-[#FF9800] border-2 border-[#FF9800]/30"
                      : "bg-[#E3F2FD] text-[#185E9F] border-2 border-[#185E9F]/20"
                )}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* Action buttons */}
      <div className="flex gap-2 mt-2">
        <button type="button" data-action="neutral"
          onClick={onCancel}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-gray-200 text-[#5A3515] font-bold text-sm active:scale-95 transition-transform"
        >
          Batal
        </button>
        <button type="button" data-action="primary"
          onClick={onOk}
          disabled={value.trim() === ""}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-gradient-meadow border-b-3 border-[#2E8B12] text-white font-black text-sm active:translate-y-0.5 active:border-b-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✓ Simpan
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Screen
// ═══════════════════════════════════════════

export function MiniGameJalurAngkaScreen({ profile, onBack, backRef }: Props) {
  const { store, addMiniGameSession } = useGameStore();
  const difficulty = profile.difficulty;

  const [screen, setScreen] = useState<"start" | "playing" | "result">("start");
  const [question, setQuestion] = useState<NumberPathQuestion | null>(null);
  const [session, setSession] = useState<NumberPathSession | null>(null);
  const [timerMs, setTimerMs] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showExit, setShowExit] = useState(false);

  // Keypad modal state
  const [keypadCellId, setKeypadCellId] = useState<string | null>(null);
  const [keypadValue, setKeypadValue] = useState("");

  // Validation result overlay
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateNumberPathPuzzle> | null>(null);

  // Mistake tracking
  const [mistakeCount, setMistakeCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Personal best
  const mySessions = store.miniGameSessions.filter(
    s => s.profileId === profile.id && s.gameType === "jalur-angka"
  );
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const difficultyCfg = useMemo(() => getDifficultyConfig(difficulty), [difficulty]);

  // ═══════════════════════════════════════════
  // Timer
  // ═══════════════════════════════════════════
  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimers();
    timerRef.current = setInterval(() => setTimerMs(t => t + 100), 100);
  }, [clearTimers]);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000);
  }, []);

  // ═══════════════════════════════════════════
  // Game Actions
  // ═══════════════════════════════════════════

  const startGame = useCallback(() => {
    const q = generateNumberPathPuzzle(difficulty);
    const s = createSession(q);
    setQuestion(q);
    setSession(s);
    setTimerMs(0);
    setFeedback(null);
    setMistakeCount(0);
    setValidationResult(null);
    setScreen("playing");
    startTimer();
  }, [difficulty, startTimer]);

  const handleCellClick = useCallback((cellId: string) => {
    if (!question || !session || session.isCompleted) return;
    const cell = question.cells.find(c => c.id === cellId);
    if (!cell || !cell.editable) return;

    setValidationResult(null);
    setKeypadCellId(cellId);
    setKeypadValue(session.userInputs[cellId] || "");
  }, [question, session]);

  const handleKeypadOk = useCallback(() => {
    if (!keypadCellId || !question || !session) return;

    const validation = validateNumericInput(keypadValue, question.allowNegative, question.allowDecimal);
    if (!validation.isValid) {
      showFeedback(validation.error!);
      return;
    }

    const newInputs = { ...session.userInputs, [keypadCellId]: keypadValue.trim() };
    setSession({ ...session, userInputs: newInputs });
    setKeypadCellId(null);
    setKeypadValue("");

    // Instant validation for lower difficulties
    if (question.validationMode === "instant") {
      const result = validateNumberPathPuzzle(question, { ...session, userInputs: newInputs });
      if (result.cellResults.some(r => r.cellId === keypadCellId && !r.isCorrect)) {
        setMistakeCount(m => m + 1);
        showFeedback("Belum tepat. Coba angka lain.");
      } else if (result.allCorrect) {
        handleComplete(result);
      }
    }
  }, [keypadCellId, keypadValue, question, session, showFeedback]);

  const handleKeypadCancel = useCallback(() => {
    setKeypadCellId(null);
    setKeypadValue("");
  }, []);

  const handleClearCell = useCallback(() => {
    if (!keypadCellId || !session) return;
    const newInputs = { ...session.userInputs };
    delete newInputs[keypadCellId];
    setSession({ ...session, userInputs: newInputs });
    setKeypadCellId(null);
    setKeypadValue("");
    setValidationResult(null);
  }, [keypadCellId, session]);

  const handleSubmit = useCallback(() => {
    if (!question || !session) return;
    const allFilled = areAllInputsFilled(question, session);
    if (!allFilled) {
      showFeedback("Isi semua kotak kosong terlebih dahulu.");
      return;
    }

    const result = validateNumberPathPuzzle(question, session);
    setValidationResult(result);

    if (!result.allCorrect) {
      const wrongCount = result.totalInputs - result.correctCount;
      setMistakeCount(m => m + wrongCount);
      showFeedback(result.message);
    } else {
      handleComplete(result);
    }
  }, [question, session, showFeedback]);

  const handleComplete = useCallback((result: ReturnType<typeof validateNumberPathPuzzle>) => {
    if (!question || !session) return;
    clearTimers();

    const scoreResult = calculateNumberPathScore(
      result.correctCount,
      result.totalInputs,
      timerMs,
      mistakeCount,
      session.hintsUsed,
      difficulty
    );

    const updatedSession: NumberPathSession = {
      ...session,
      completedAt: Date.now(),
      elapsedTimeMs: timerMs,
      isCompleted: true,
      score: scoreResult.totalScore,
      accuracy: scoreResult.accuracy,
      speedBonus: scoreResult.speedBonus,
      difficultyBonus: scoreResult.difficultyBonus,
      mistakes: mistakeCount,
    };
    setSession(updatedSession);

    // Save session
    const miniSession: MiniGameSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      gameType: "jalur-angka",
      score: scoreResult.totalScore,
      correctCount: result.correctCount,
      wrongCount: result.totalInputs - result.correctCount,
      totalQuestions: result.totalInputs,
      averageAnswerTime: result.totalInputs > 0
        ? Math.round((timerMs / result.totalInputs) * 10) / 10
        : 0,
      fastestAnswerTime: 0,
      slowestAnswerTime: 0,
      maxStage: 1,
      difficulty,
      playedAt: Date.now(),
      startedAt: updatedSession.startedAt,
      finishedAt: updatedSession.completedAt,
      resultStatus: "completed",
    };
    addMiniGameSession(miniSession);
    setScreen("result");
  }, [question, session, clearTimers, timerMs, mistakeCount, difficulty, profile, addMiniGameSession]);

  const handleReset = useCallback(() => {
    if (!question) return;
    const s = createSession(question);
    setSession(s);
    setTimerMs(0);
    setFeedback(null);
    setMistakeCount(0);
    setValidationResult(null);
    clearTimers();
    startTimer();
    showFeedback("Papan direset. Mulai dari awal! 🔄");
  }, [question, clearTimers, startTimer, showFeedback]);

  const handleNewQuestion = useCallback(() => {
    clearTimers();
    startGame();
  }, [clearTimers, startGame]);

  // ═══════════════════════════════════════════
  // Cleanup
  // ═══════════════════════════════════════════
  useEffect(() => { return () => clearTimers(); }, [clearTimers]);

  useEffect(() => {
    backRef.current = () => {
      if (screen === "playing" && !keypadCellId) {
        setShowExit(true);
        return true;
      }
      if (screen === "playing" && keypadCellId) {
        handleKeypadCancel();
        return true;
      }
      if (screen === "result") { setScreen("start"); return true; }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, screen, keypadCellId, handleKeypadCancel]);

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════
  // Render: Start
  // ═══════════════════════════════════════════
  if (screen === "start") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#FFF8E1] to-[#FFE0B2] flex flex-col items-center justify-center p-4">
        <GameCard tone="coin" className="text-center w-full max-w-sm p-6 sm:p-8">
          <MiniGameIcon gameId="jalur-angka" className="size-20 mb-3" />
          <h1 className="font-display font-black text-2xl sm:text-3xl mb-1 text-[#5A3515]">
            Jalur Angka
          </h1>
          <p className="text-sm font-bold text-[#8C6B45] mb-4">
            Isi kotak kosong agar hasil hitung di sepanjang jalur benar.
          </p>

          <div className="bg-white/60 rounded-2xl p-4 mb-4 text-left text-xs space-y-1.5 text-[#5A3515]">
            <p>🎯 <strong>Cara bermain:</strong></p>
            <p>1. Lihat jalur kotak dengan angka & operator</p>
            <p>2. Klik kotak kosong untuk mengisi angka</p>
            <p>3. Isi semua kotak kosong dengan benar</p>
            <p>4. Klik Periksa Jawaban untuk mengecek</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4 text-center">
            <div className="bg-white/40 rounded-xl p-2">
              <div className="font-black text-lg text-[#5A3515]">{difficultyCfg.pathLength}</div>
              <div className="text-[10px] uppercase text-[#8C6B45]">Kotak Jalur</div>
            </div>
            <div className="bg-white/40 rounded-xl p-2">
              <div className="font-black text-lg text-[#5A3515]">{difficultyCfg.inputCount}</div>
              <div className="text-[10px] uppercase text-[#8C6B45]">Kotak Isi</div>
            </div>
          </div>

          {personalBest > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-white/70">
              <div className="text-xs uppercase font-bold text-[#8C6B45]">Rekor Terbaik</div>
              <div className="font-display font-black text-2xl text-[#D48806]">{personalBest}</div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton>
            <GameButton variant="primary" full onClick={startGame}>🎮 Mulai!</GameButton>
          </div>
        </GameCard>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Render: Exit
  // ═══════════════════════════════════════════
  if (showExit && screen === "playing") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#FFF8E1] to-[#FFE0B2] flex flex-col items-center justify-center p-4">
        <GameCard tone="cream" className="text-center w-full max-w-sm p-6 border-4 border-[#CBB794]">
          <div className="text-5xl mb-3">🚪</div>
          <h2 className="font-display font-black text-xl text-[#5A3515] mb-2">Keluar dari game?</h2>
          <p className="text-sm font-bold text-[#8C6B45] mb-4">Progres sesi ini akan hilang.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <GameButton variant="ghost" full onClick={() => setShowExit(false)}>Lanjut Main</GameButton>
            <GameButton variant="danger" full onClick={onBack}>Keluar</GameButton>
          </div>
        </GameCard>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Render: Result
  // ═══════════════════════════════════════════
  if (screen === "result" && session && question) {
    const scoreResult = calculateNumberPathScore(
      question.inputCellIds.length,
      question.inputCellIds.length,
      session.elapsedTimeMs,
      session.mistakes,
      session.hintsUsed,
      difficulty
    );
    const isNewBest = scoreResult.totalScore > personalBest;

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#FFF8E1] to-[#FFE0B2] flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm">
          <GameCard tone="cream" className="text-center p-6 sm:p-8 border-4 border-[#CBB794]">
            <div className="text-5xl sm:text-6xl mb-3">{isNewBest ? "👑" : "🏆"}</div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] mb-1">
              {isNewBest ? "Rekor Baru!" : "Jalur Lengkap!"}
            </h2>
            <p className="text-sm font-bold text-[#8C6B45] mb-4">
              Jalur angka tersambung sempurna! ✨
            </p>

            <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3] rounded-2xl p-4 mb-4 border-2 border-[#FFD54F]">
              <div className="font-display font-black text-3xl sm:text-4xl text-[#5A3515]">
                {scoreResult.totalScore}
              </div>
              <div className="text-[10px] uppercase font-bold text-[#8C6B45]">Total Poin</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#E8F5E9] rounded-xl p-3">
                <div className="font-black text-lg text-[#2E7D32]">{question.inputCellIds.length}/{question.inputCellIds.length}</div>
                <div className="text-[10px] font-bold text-[#8C6B45]">Kotak Benar</div>
              </div>
              <div className="bg-[#FFEBEE] rounded-xl p-3">
                <div className="font-black text-lg text-[#E53935]">{session.mistakes}</div>
                <div className="text-[10px] font-bold text-[#8C6B45]">Kesalahan</div>
              </div>
              <div className="bg-[#E3F2FD] rounded-xl p-3">
                <div className="font-black text-lg text-[#185E9F]">{formatTime(session.elapsedTimeMs)}</div>
                <div className="text-[10px] font-bold text-[#8C6B45]">Waktu</div>
              </div>
              <div className="bg-[#FFF3E0] rounded-xl p-3">
                <div className="font-black text-lg text-[#FF9800]">{scoreResult.accuracy}%</div>
                <div className="text-[10px] font-bold text-[#8C6B45]">Akurasi</div>
              </div>
            </div>

            <div className="text-left text-xs font-bold text-[#8C6B45] space-y-1 mb-4 bg-white/50 rounded-xl p-3">
              <div className="flex justify-between"><span>Skor Dasar</span><span>+{scoreResult.baseScore}</span></div>
              <div className="flex justify-between"><span>Bonus Akurasi</span><span>+{scoreResult.accuracyBonus}</span></div>
              <div className="flex justify-between"><span>Bonus Cepat ({scoreResult.speedLabel})</span><span>+{scoreResult.speedBonus}</span></div>
              <div className="flex justify-between"><span>Bonus Difficulty</span><span>+{scoreResult.difficultyBonus}</span></div>
              {scoreResult.mistakePenalty > 0 && (
                <div className="flex justify-between text-[#E53935]"><span>Penalti Kesalahan</span><span>-{scoreResult.mistakePenalty}</span></div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <GameButton variant="ghost" full onClick={onBack}>🏠 Home</GameButton>
              <GameButton variant="primary" full onClick={handleNewQuestion}>🔄 Soal Baru</GameButton>
            </div>
          </GameCard>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Render: Playing
  // ═══════════════════════════════════════════
  if (!question || !session) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#FFF8E1] to-[#FFE0B2] flex items-center justify-center">
        <p className="font-bold text-[#8C6B45]">Memuat soal...</p>
      </div>
    );
  }

  const allFilled = areAllInputsFilled(question, session);
  const filledCount = question.inputCellIds.filter(id => (session.userInputs[id] || "").trim() !== "").length;

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#FFF8E1] to-[#FFE0B2] flex flex-col overflow-hidden">
      {/* ═══ Header ═══ */}
      <header className="shrink-0 pt-safe mt-1 px-3 pb-1 flex items-center gap-2">
        <button type="button" aria-label="Tutup"
          onClick={() => setShowExit(true)}
          className="tmt-icon-button h-10 w-10 rounded-xl bg-white/60 border-2 border-[#D48806]/20 text-[#E65100] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95"
        ><TmtCloseGlyph aria-hidden="true" /></button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-base text-[#5A3515] truncate">Jalur Angka</h1>
          <p className="text-[10px] text-[#8C6B45] truncate">{question.instruction}</p>
        </div>
        <div className="bg-white/70 px-3 py-1.5 rounded-full font-black text-sm text-[#5A3515] border-2 border-[#D48806]/20 tabular-nums">
          ⏱ {formatTime(timerMs)}
        </div>
      </header>

      {/* ═══ Puzzle Board — Snake path layout ═══ */}
      <main className="flex-1 min-h-0 overflow-auto p-3 flex flex-col items-center">
        {/* Target display */}
        {question.targetValue !== undefined && (
          <div className="mb-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] text-white font-black text-sm shadow-md">
            🎯 Target: {question.targetValue}
          </div>
        )}

        {/* Path Board with connector arrows */}
        <div className="relative bg-white/80 rounded-2xl border-2 border-[#D4B483] shadow-md p-4">
          {/* Render cells in absolute position based on row/col */}
          <div
            className="relative"
            style={{
              width: question.cols * 68,
              height: (question.rows) * 68 + 20,
            }}
          >
            {/* SVG connectors between cells */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {question.connectors.map((conn, i) => {
                const fromCell = question.cells.find(c => c.id === conn.from);
                const toCell = question.cells.find(c => c.id === conn.to);
                if (!fromCell || !toCell) return null;
                const x1 = fromCell.col * 68 + 34;
                const y1 = fromCell.row * 68 + 34;
                const x2 = toCell.col * 68 + 34;
                const y2 = toCell.row * 68 + 34;
                return (
                  <g key={`conn-${i}`}>
                    {/* Thick path trail */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#FFE0B2" strokeWidth={24} strokeLinecap="round" />
                    {/* Thin center line for detail */}
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#FFB74D" strokeWidth={4} strokeLinecap="round" strokeDasharray="4 4" />
                  </g>
                );
              })}
            </svg>

            {/* Cells */}
            {question.cells
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map(cell => {
                const isInput = cell.type === "input";
                const userVal = isInput ? (session.userInputs[cell.id] || "") : "";
                const isFilled = userVal.trim() !== "";
                const valResult = validationResult?.cellResults.find(r => r.cellId === cell.id);
                const isWrong = valResult && !valResult.isCorrect;
                const isCorrect = valResult && valResult.isCorrect;

                let bgClass = "bg-white border-[#BDBDBD] border-2 shadow-sm";
                let textClass = "text-[#5A3515]";
                
                if (cell.type === "operator") { 
                  bgClass = "bg-transparent border-transparent"; 
                  textClass = "text-[#1565C0] text-3xl drop-shadow-sm"; 
                }
                else if (cell.type === "target") { 
                  bgClass = "bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] border-[#FF9800] border-2 shadow-sm"; 
                  textClass = "text-[#E65100]"; 
                }
                else if (cell.type === "fixed_number") { 
                  bgClass = "bg-white border-[#BDBDBD] border-2 shadow-sm"; 
                }
                else if (isInput && isFilled && isCorrect) { bgClass = "bg-[#E8F5E9] border-[#4CAF50] border-2 shadow-sm"; textClass = "text-[#2E7D32]"; }
                else if (isInput && isFilled && isWrong) { bgClass = "bg-[#FFEBEE] border-[#E53935] border-2 shadow-sm"; textClass = "text-[#E53935]"; }
                else if (isInput && isFilled) { bgClass = "bg-[#FFF8E1] border-[#FF9800] border-2 shadow-sm"; textClass = "text-[#E65100]"; }
                else if (isInput) { bgClass = "bg-white border-dashed border-2 border-[#9E9E9E] shadow-sm"; }

                return (
                  <div
                    key={cell.id}
                    className={cn(
                      "absolute flex items-center justify-center font-bold transition-all",
                      isInput && !session.isCompleted ? "cursor-pointer active:scale-95 hover:scale-105" : "",
                      isWrong && "animate-wiggle"
                    )}
                    style={{
                      left: cell.col * 68 + 4,
                      top: cell.row * 68 + 4,
                      width: 60,
                      height: 60,
                      zIndex: 5,
                    }}
                    role={isInput ? "button" : undefined}
                    tabIndex={isInput && !session.isCompleted ? 0 : undefined}
                    aria-disabled={isInput ? session.isCompleted : undefined}
                    aria-label={isInput ? `Kotak jawaban ${isFilled ? `berisi ${userVal}` : "kosong"}` : undefined}
                    onClick={() => isInput && handleCellClick(cell.id)}
                    onKeyDown={(event) => {
                      if (isInput && !session.isCompleted && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        handleCellClick(cell.id);
                      }
                    }}
                  >
                    <div className={cn(
                      "text-center w-full h-full flex items-center justify-center relative",
                      bgClass,
                      cell.type === "operator" ? "" : "rounded-full"
                    )}>
                      {cell.type === "operator" && (
                        <span className={cn("font-black z-10", textClass)}>{cell.value}</span>
                      )}
                      {cell.type === "fixed_number" && (
                        <span className="font-black text-xl z-10">{cell.value}</span>
                      )}
                      {cell.type === "target" && (
                        <span className={cn("font-black text-sm z-10", textClass)}>🎯{cell.value}</span>
                      )}
                      {isInput && isFilled && (
                        <span className={cn("font-black text-xl z-10", textClass)}>
                          {userVal}
                        </span>
                      )}
                      {isInput && !isFilled && (
                        <span className="text-gray-400 text-2xl font-black z-10">?</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Step labels: "Mulai" and "Target" indicators */}
        <div className="flex justify-between w-full max-w-xs mt-1 px-2">
          <span className="text-[10px] font-bold text-[#4CAF50]">🟢 Mulai</span>
          <span className="text-[10px] font-bold text-[#FF9800]">🎯 Target</span>
        </div>

        {/* Info bar */}
        <div className="mt-2 flex gap-3 text-xs font-bold text-[#8C6B45]">
          <span>📝 {filledCount}/{question.inputCellIds.length} terisi</span>
          {mistakeCount > 0 && <span className="text-[#E53935]">❌ {mistakeCount}</span>}
        </div>

        {/* Validation feedback */}
        {validationResult && !validationResult.allCorrect && (
          <div className="mt-2 px-4 py-2 rounded-xl bg-[#FFEBEE] border border-[#E53935]/30 text-xs font-bold text-[#E53935] text-center max-w-xs animate-pop-in">
            {validationResult.message}
          </div>
        )}

        {/* General feedback */}
        {feedback && !validationResult && (
          <div className="mt-2 px-4 py-2 rounded-xl bg-white/90 border-2 border-[#D48806]/20 text-xs font-bold text-[#5A3515] text-center animate-pop-in max-w-xs">
            {feedback}
          </div>
        )}

        {/* Instructions */}
        <p className="mt-1 text-[10px] text-[#8C6B45]/70 text-center">
          Klik kotak ? lalu isi angka yang tepat.
        </p>
      </main>

      {/* ═══ Bottom Buttons ═══ */}
      <footer className="shrink-0 px-3 pb-safe pb-2 pt-1 flex gap-2">
        <button type="button" data-action="danger-outline"
          onClick={handleReset}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-white/70 border-2 border-[#D48806]/30 text-[#E65100] font-bold text-sm active:scale-95 transition-transform"
        >
          🔄 Ulangi
        </button>
        <button type="button"
          onClick={handleSubmit}
          disabled={!allFilled}
          className={cn("tmt-choice-button",
            "flex-[2] py-2.5 rounded-xl font-black text-sm active:translate-y-0.5 active:border-b-0 transition-all",
            allFilled
              ? "bg-gradient-meadow border-b-3 border-[#2E8B12] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          )}
        >
          {allFilled ? "✅ Periksa Jawaban" : `✏️ Isi semua kotak dulu (${filledCount}/${question.inputCellIds.length})`}
        </button>
        <button type="button" data-action="neutral"
          onClick={onBack}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9800] to-[#F57C00] border-b-3 border-[#E65100] text-white font-bold text-sm active:translate-y-0.5 active:border-b-0 transition-all"
        >
          🏠 Kembali
        </button>
      </footer>

      {/* ═══ Numeric Keypad Modal ═══ */}
      {keypadCellId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleKeypadCancel}
        >
          <div onClick={e => e.stopPropagation()} className="w-full max-w-xs animate-pop-in">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-white bg-black/30 px-3 py-1 rounded-full">
                Isi Angka
              </span>
            </div>
            <NumericKeypad
              value={keypadValue}
              onChange={setKeypadValue}
              onOk={handleKeypadOk}
              onCancel={handleKeypadCancel}
              allowNegative={question.allowNegative}
            />
            <button type="button" data-action="danger-outline"
              onClick={handleClearCell}
              className="tmt-action-button mt-2 w-full py-2 rounded-xl bg-white/80 text-[#E53935] font-bold text-xs border border-[#E53935]/20"
            >
              🗑 Hapus Isi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
