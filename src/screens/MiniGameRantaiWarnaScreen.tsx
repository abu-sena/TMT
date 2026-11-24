/**
 * MiniGame: Rantai Warna (Color Sequence Path)
 * 
 * Gameplay: Hubungkan warna sesuai urutan angka dengan drag.
 * User menekan bulatan pertama, lalu menggeser ke bulatan berikutnya.
 */

import { X as TmtCloseGlyph } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MiniGameIcon } from "@/components/minigames/MiniGameArt";
import { VictoryDialog } from "@/components/rewards/VictoryDialog";
import type { Profile, MiniGameSession } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import type React from "react";
import {
  generateColorSequenceQuestion,
  getColorCountForDifficulty,
  getSequenceLengthForDifficulty,
} from "@/games/color-sequence/generator";
import {
  validateColorSequenceStep,
  calculateColorSequenceScore,
  createSession,
} from "@/games/color-sequence/scoring";
import type {
  ColorSequenceQuestion,
  ColorSequenceSession,
  ColorNode,
} from "@/games/color-sequence/types";

// ═══════════════════════════════════════════
// Props
// ═══════════════════════════════════════════

interface Props {
  profile: Profile;
  onBack: () => void;
  backRef: React.MutableRefObject<(() => boolean) | null>;
}

// ═══════════════════════════════════════════
// Helper: check if pointer is inside a node
// ═══════════════════════════════════════════

function hitTest(
  px: number, py: number,
  node: ColorNode,
  arenaWidth: number, arenaHeight: number,
  centerX: number, centerY: number
): boolean {
  const nx = node.x * arenaWidth;
  const ny = node.y * arenaHeight;
  const dx = px - nx;
  const dy = py - ny;
  const hitRadius = node.radius + 10; // generous hit area for kids
  return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
}

// ═══════════════════════════════════════════
// Main Screen Component
// ═══════════════════════════════════════════

export function MiniGameRantaiWarnaScreen({ profile, onBack, backRef }: Props) {
  const { store, addMiniGameSession } = useGameStore();
  const difficulty = profile.difficulty;

  // Game states
  const [screen, setScreen] = useState<"start" | "playing" | "result">("start");
  const [question, setQuestion] = useState<ColorSequenceQuestion | null>(null);
  const [session, setSession] = useState<ColorSequenceSession | null>(null);
  const [timerMs, setTimerMs] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shakeNodeId, setShakeNodeId] = useState<string | null>(null);
  const [showExit, setShowExit] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartNode, setDragStartNode] = useState<ColorNode | null>(null);
  const [dragLine, setDragLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Arena refs
  const arenaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  // Connected lines (correct steps so far)
  const connectedLines = useMemo(() => {
    if (!question || !session) return [];
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
    const seqIds = question.sequenceNodeIds;
    const selectedIds = session.selectedNodeIds;

    for (let i = 1; i < selectedIds.length; i++) {
      const prevNode = question.nodes.find(n => n.id === selectedIds[i - 1]);
      const currNode = question.nodes.find(n => n.id === selectedIds[i]);
      if (prevNode && currNode) {
        lines.push({
          x1: prevNode.x,
          y1: prevNode.y,
          x2: currNode.x,
          y2: currNode.y,
          color: currNode.colorHex,
        });
      }
    }
    return lines;
  }, [question, session]);

  // Current expected step
  const currentStep = session?.selectedNodeIds.length ?? 0;
  const expectedNodeId = question
    ? question.sequenceNodeIds[currentStep] ?? null
    : null;

  // Score result (for result screen)
  const [scoreResult, setScoreResult] = useState<ReturnType<typeof calculateColorSequenceScore> | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  // Personal best
  const mySessions = store.miniGameSessions.filter(
    s => s.profileId === profile.id && s.gameType === "rantai-warna"
  );
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  // ═══════════════════════════════════════════
  // Timer
  // ═══════════════════════════════════════════
  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimers();
    timerRef.current = setInterval(() => {
      setTimerMs(t => t + 100);
    }, 100);
  }, [clearTimers]);

  const stopTimer = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  // ═══════════════════════════════════════════
  // Game Actions
  // ═══════════════════════════════════════════

  const startGame = useCallback(() => {
    const q = generateColorSequenceQuestion(difficulty);
    const s = createSession(q);
    finishedRef.current = false;
    setQuestion(q);
    setSession(s);
    setTimerMs(0);
    setFeedback(null);
    setScoreResult(null);
    setIsDragging(false);
    setDragStartNode(null);
    setDragLine(null);
    setShakeNodeId(null);
    setScreen("playing");
    startTimer();
  }, [difficulty, startTimer]);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2500);
  }, []);

  const finishGame = useCallback((completedSession: ColorSequenceSession) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopTimer();
    const completedAt = Date.now();
    const elapsedTimeMs = Math.max(0, completedAt - completedSession.startedAt);

    const updatedSession: ColorSequenceSession = {
      ...completedSession,
      completedAt,
      elapsedTimeMs,
      isCompleted: true,
    };

    const result = calculateColorSequenceScore(updatedSession, difficulty);
    updatedSession.score = result.totalScore;
    updatedSession.accuracy = result.accuracy;
    updatedSession.speedBonus = result.speedBonus;
    updatedSession.difficultyBonus = result.difficultyBonus;

    setSession(updatedSession);
    setScoreResult(result);
    setTimerMs(elapsedTimeMs);
    setIsNewBest(result.totalScore > personalBest);

    // Save session
    const miniSession: MiniGameSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      gameType: "rantai-warna",
      score: result.totalScore,
      correctCount: updatedSession.selectedNodeIds.length,
      wrongCount: updatedSession.mistakes,
      totalQuestions: updatedSession.totalSteps,
      averageAnswerTime: updatedSession.totalSteps > 0
        ? Math.round(elapsedTimeMs / updatedSession.totalSteps / 100) / 10
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
  }, [stopTimer, difficulty, profile.id, personalBest, addMiniGameSession]);

  const handleUndo = useCallback(() => {
    if (!session || session.selectedNodeIds.length === 0) return;
    const newSelected = session.selectedNodeIds.slice(0, -1);
    setSession({ ...session, selectedNodeIds: newSelected });
    showFeedback("Langkah terakhir dibatalkan. ↩️");
  }, [session, showFeedback]);

  const handleReset = useCallback(() => {
    if (!question) return;
    const s = createSession(question);
    finishedRef.current = false;
    setSession(s);
    setTimerMs(0);
    setFeedback(null);
    setShakeNodeId(null);
    setIsDragging(false);
    setDragStartNode(null);
    setDragLine(null);
    clearTimers();
    startTimer();
    showFeedback("Soal diulang. Mulai dari awal! 🔄");
  }, [question, clearTimers, startTimer, showFeedback]);

  // ═══════════════════════════════════════════
  // Node tap (for touch: a direct tap on expected node)
  // ═══════════════════════════════════════════

  const handleNodeTap = useCallback((node: ColorNode) => {
    if (!question || !session || session.isCompleted) return;

    const result = validateColorSequenceStep(question, session, node.id);
    
    if (result.isCorrect) {
      const newSelected = [...session.selectedNodeIds, node.id];
      const newSession = { ...session, selectedNodeIds: newSelected };
      if (result.isSequenceComplete) {
        finishGame(newSession);
      } else {
        setSession(newSession);
        showFeedback(result.feedback);
      }
    } else {
      if (!result.isWrongNode) return;
      // Wrong node — shake and count mistake
      setShakeNodeId(node.id);
      setTimeout(() => setShakeNodeId(null), 500);
      setSession({ ...session, mistakes: session.mistakes + 1 });
      showFeedback(result.feedback);
    }
  }, [question, session, finishGame, showFeedback]);

  // ═══════════════════════════════════════════
  // Pointer/Drag handlers
  // ═══════════════════════════════════════════

  const getArenaGeometry = useCallback(() => {
    const el = arenaRef.current;
    if (!el) return { width: 0, height: 0, cx: 0, cy: 0, left: 0, top: 0 };
    const rect = el.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      cx: rect.width / 2,
      cy: rect.height / 2,
      left: rect.left,
      top: rect.top,
    };
  }, []);

  const findNodeAtPoint = useCallback((clientX: number, clientY: number): ColorNode | null => {
    if (!question) return null;
    const geo = getArenaGeometry();
    const px = clientX - geo.left;
    const py = clientY - geo.top;
    // Check in reverse to get topmost node first
    for (let i = question.nodes.length - 1; i >= 0; i--) {
      const node = question.nodes[i];
      if (hitTest(px, py, node, geo.width, geo.height, geo.cx, geo.cy)) {
        return node;
      }
    }
    return null;
  }, [question, getArenaGeometry]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    if (!question || !session || session.isCompleted) return;
    const node = findNodeAtPoint(e.clientX, e.clientY);
    if (!node) return;

    // Only allow drag from the first unselected node in the sequence
    const expectedId = question.sequenceNodeIds[session.selectedNodeIds.length];
    if (node.id === expectedId) {
      setIsDragging(true);
      setDragStartNode(node);
      const geo = getArenaGeometry();
      setDragLine({
        x1: node.x * geo.width,
        y1: node.y * geo.height,
        x2: e.clientX - geo.left,
        y2: e.clientY - geo.top,
      });
    }
  }, [question, session, findNodeAtPoint, getArenaGeometry]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartNode) return;
    e.preventDefault();
    const geo = getArenaGeometry();
    setDragLine({
      x1: dragStartNode.x * geo.width,
      y1: dragStartNode.y * geo.height,
      x2: Math.max(0, Math.min(geo.width, e.clientX - geo.left)),
      y2: Math.max(0, Math.min(geo.height, e.clientY - geo.top)),
    });
  }, [isDragging, dragStartNode, getArenaGeometry]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !question || !session) {
      setIsDragging(false);
      setDragStartNode(null);
      setDragLine(null);
      return;
    }

    const node = findNodeAtPoint(e.clientX, e.clientY);
    setIsDragging(false);
    setDragStartNode(null);
    setDragLine(null);

    if (node) {
      handleNodeTap(node);
    }
  }, [isDragging, question, session, findNodeAtPoint, handleNodeTap]);

  // Prevent default scroll on arena
  const handleTouchStart = useCallback((_e: React.TouchEvent) => {
    // Allow default behavior to be prevented at arena level
  }, []);

  // ═══════════════════════════════════════════
  // Cleanup
  // ═══════════════════════════════════════════

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Register back handler
  useEffect(() => {
    backRef.current = () => {
      if (screen === "playing") {
        setShowExit(true);
        return true;
      }
      if (screen === "result") {
        setScreen("start");
        return true;
      }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, screen]);

  // ═══════════════════════════════════════════
  // Format time
  // ═══════════════════════════════════════════

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  };

  // ═══════════════════════════════════════════
  // Render: Start Screen
  // ═══════════════════════════════════════════

  if (screen === "start") {
    const colorCount = getColorCountForDifficulty(difficulty);
    const seqLength = getSequenceLengthForDifficulty(difficulty);

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#E3F2FD] to-[#BBDEFB] flex flex-col items-center justify-center p-4">
        <GameCard tone="blue" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
          <MiniGameIcon gameId="rantai-warna" className="size-20 mb-3" />
          <h1 className="font-display font-black text-2xl sm:text-3xl mb-1">Rantai Warna</h1>
          <p className="text-sm font-bold opacity-80 mb-4">
            Hubungkan warna sesuai urutan angka.
          </p>

          <div className="bg-black/15 rounded-2xl p-4 mb-4 text-left text-xs space-y-1.5">
            <p>🎯 <strong>Cara bermain:</strong></p>
            <p>1. Lihat legenda angka & warna di atas</p>
            <p>2. Lihat urutan angka di bawah arena</p>
            <p>3. Sentuh & geser dari warna ke warna sesuai urutan</p>
            <p>4. Tepat & cepat = poin lebih besar!</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4 text-center">
            <div className="bg-black/15 rounded-xl p-2">
              <div className="font-black text-lg">{colorCount}</div>
              <div className="text-[10px] uppercase opacity-70">Warna</div>
            </div>
            <div className="bg-black/15 rounded-xl p-2">
              <div className="font-black text-lg">{seqLength}</div>
              <div className="text-[10px] uppercase opacity-70">Urutan</div>
            </div>
          </div>

          {personalBest > 0 && (
            <div className="mb-4 p-3 rounded-2xl bg-black/20">
              <div className="text-xs uppercase font-bold opacity-70">Rekor Terbaik</div>
              <div className="font-display font-black text-2xl text-yellow-300">{personalBest}</div>
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
  // Render: Exit Confirmation
  // ═══════════════════════════════════════════

  if (showExit && screen === "playing") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#E3F2FD] to-[#BBDEFB] flex flex-col items-center justify-center p-4">
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
  // Render: Arena and result overlay
  // ═══════════════════════════════════════════

  if (!question || !session) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center">
        <p className="font-bold text-[#8C6B45]">Memuat soal...</p>
      </div>
    );
  }

  const arenaSize = Math.min(question.arenaRadius * 2 + 40, 340);

  return (
    <div
      className="h-[100dvh] bg-gradient-to-b from-[#E3F2FD] to-[#BBDEFB] flex flex-col overflow-hidden"
      onContextMenu={e => e.preventDefault()}
    >
      {/* ═══ Header ═══ */}
      <header className="shrink-0 pt-safe mt-1 px-3 pb-1 flex items-center gap-2">
        <button type="button" aria-label="Tutup"
          onClick={() => setShowExit(true)}
          className="tmt-icon-button h-10 w-10 rounded-xl bg-white/60 border-2 border-[#185E9F]/20 text-[#185E9F] grid place-items-center text-lg shadow-sm shrink-0 active:scale-95"
        >
          <TmtCloseGlyph aria-hidden="true" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black text-base text-[#5A3515] truncate">Rantai Warna</h1>
          <p className="text-[10px] text-[#8C6B45] truncate">Hubungkan warna sesuai urutan</p>
        </div>
        <div className="bg-white/70 px-3 py-1.5 rounded-full font-black text-sm text-[#5A3515] border-2 border-[#185E9F]/20 tabular-nums">
          ⏱ {formatTime(timerMs)}
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-2 py-1 overflow-y-auto">
        {/* Legend */}
        <div className="w-full max-w-sm mb-2 overflow-x-auto pb-1">
          <div className="flex gap-1.5 justify-center min-w-min">
            {question.nodes
              .sort((a, b) => a.number - b.number)
              .map(node => {
                const isCompleted = session.selectedNodeIds.includes(node.id);
                const isCurrent = node.id === expectedNodeId;
                return (
                  <div
                    key={node.id}
                    className="flex flex-col items-center gap-0.5 shrink-0"
                  >
                    <span className={`
                      text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none
                      ${isCompleted ? "bg-[#E8F5E9] text-[#2E8B12]" : 
                        isCurrent ? "bg-[#FFF3E0] text-[#FF9800] ring-2 ring-[#FF9800]/50" :
                        "bg-white/70 text-[#8C6B45]"}
                    `}>
                      {node.number}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white/80 shadow-sm"
                      style={{ backgroundColor: node.colorHex }}
                    />
                  </div>
                );
              })}
          </div>
          {question.hasDistractor && (
            <p className="text-[9px] text-center text-[#8C6B45]/70 mt-0.5">
              * Beberapa warna tidak dipakai
            </p>
          )}
        </div>

        {/* Arena */}
        <div
          ref={arenaRef}
          className="relative rounded-full bg-white/70 border-4 border-[#185E9F]/30 shadow-lg shrink-0"
          style={{
            width: `min(${arenaSize}px, 92vw)`,
            height: `min(${arenaSize}px, 92vw)`,
            touchAction: "none",
            userSelect: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
        >
          {/* SVG for connected lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${arenaSize} ${arenaSize}`}
          >
            {/* Completed lines */}
            {connectedLines.map((line, i) => {
              const x1 = line.x1 * arenaSize;
              const y1 = line.y1 * arenaSize;
              const x2 = line.x2 * arenaSize;
              const y2 = line.y2 * arenaSize;
              return (
                <line
                  key={`done-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={line.color}
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={0.8}
                />
              );
            })}
            {/* Active drag line */}
            {dragLine && (
              <line
                x1={dragLine.x1}
                y1={dragLine.y1}
                x2={dragLine.x2}
                y2={dragLine.y2}
                stroke="#1565C0"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="8 4"
                opacity={0.7}
              />
            )}
          </svg>

          {/* Nodes */}
          {question.nodes.map(node => {
            const isSelected = session.selectedNodeIds.includes(node.id);
            const isExpected = node.id === expectedNodeId;
            const isShaking = shakeNodeId === node.id;
            const isLastSelected = session.selectedNodeIds[session.selectedNodeIds.length - 1] === node.id;

            return (
              <div
                key={node.id}
                className={`
                  absolute rounded-full cursor-pointer transition-transform duration-200
                  border-3 shadow-md
                  ${isSelected ? "scale-110 shadow-lg ring-4 ring-white/60" : ""}
                  ${isExpected && !isDragging ? "animate-pulse-glow" : ""}
                  ${isShaking ? "animate-wiggle" : ""}
                  ${isLastSelected ? "ring-4 ring-yellow-300" : ""}
                `}
                style={{
                  width: node.radius * 2,
                  height: node.radius * 2,
                  left: `calc(${node.x * 100}% - ${node.radius}px)`,
                  top: `calc(${node.y * 100}% - ${node.radius}px)`,
                  backgroundColor: node.colorHex,
                  borderColor: isSelected
                    ? "#FFD54F"
                    : isExpected
                      ? "#FF9800"
                      : "rgba(255,255,255,0.5)",
                  zIndex: isExpected ? 10 : isSelected ? 8 : 1,
                }}
              >
                {/* Check mark for completed nodes only — no numbers in arena */}
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md text-sm font-black">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Sequence Display */}
        <div className="w-full max-w-sm mt-3">
          <div className="text-center text-[10px] font-bold text-[#8C6B45] uppercase mb-1">
            Urutan
          </div>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {question.sequenceNumbers.map((num, idx) => {
              const seqNodeId = question.sequenceNodeIds[idx];
              const isCompleted = session.selectedNodeIds.includes(seqNodeId);
              const isCurrent = idx === currentStep;
              const node = question.nodes.find(n => n.number === num);
              const colorHex = node?.colorHex || "#ccc";

              return (
                <div
                  key={idx}
                  className={`
                    flex items-center gap-1 px-2 py-1.5 rounded-xl text-sm font-black transition-all
                    ${isCompleted
                      ? "bg-[#E8F5E9] text-[#2E7D32] border-2 border-[#4CAF50]"
                      : isCurrent
                        ? "bg-[#FFF3E0] text-[#FF9800] border-2 border-[#FF9800] ring-2 ring-[#FF9800]/30"
                        : "bg-white/70 text-[#8C6B45] border-2 border-[#E8DCC2]"}
                  `}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span>{num}</span>
                  {isCompleted && <span className="text-[10px]">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mt-2 px-4 py-2 rounded-xl bg-white/90 border-2 border-[#185E9F]/20 text-xs font-bold text-[#5A3515] text-center animate-pop-in max-w-sm">
            {feedback}
          </div>
        )}

        {/* Progress */}
        <div className="mt-2 text-xs font-bold text-[#8C6B45]">
          Langkah {currentStep} / {session.totalSteps}
          {session.mistakes > 0 && (
            <span className="text-[#E53935] ml-1">· ❌{session.mistakes}</span>
          )}
        </div>
      </main>

      {/* ═══ Bottom Buttons ═══ */}
      <footer className="shrink-0 px-3 pb-safe pb-2 pt-1 flex gap-2">
        <button type="button" data-action="neutral"
          onClick={handleUndo}
          disabled={session.selectedNodeIds.length === 0}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-white/70 border-2 border-[#CBB794] text-[#5A3515] font-bold text-sm active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↩️ Undo
        </button>
        <button type="button" data-action="danger-outline"
          onClick={handleReset}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-white/70 border-2 border-[#E53935]/30 text-[#E53935] font-bold text-sm active:scale-95 transition-transform"
        >
          🔄 Ulangi
        </button>
        <button type="button" data-action="neutral"
          onClick={onBack}
          className="tmt-action-button flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#185E9F] to-[#1565C0] border-b-3 border-[#0D47A1] text-white font-bold text-sm active:translate-y-0.5 active:border-b-0 transition-all"
        >
          🏠 Kembali
        </button>
      </footer>

      {screen === "result" && scoreResult && (
        <VictoryDialog
          title={isNewBest ? "Rekor baru!" : "Rantai lengkap!"}
          context="Rantai Warna"
          stars={scoreResult.accuracy === 100 ? 3 : scoreResult.accuracy >= 75 ? 2 : scoreResult.accuracy >= 50 ? 1 : 0}
          rewards={[{ label: "Total poin", value: String(scoreResult.totalScore), icon: "points" }]}
          onClose={() => setScreen("start")}
          onPrimary={startGame}
          primaryLabel="Main lagi"
          onSecondary={onBack}
          secondaryLabel="Ruang Bermain"
        >
          <details className="tmt-victory-details">
            <summary>Rincian permainan</summary>
            <dl>
              <div><dt>Langkah benar</dt><dd>{session.selectedNodeIds.length}/{session.totalSteps}</dd></div>
              <div><dt>Kesalahan</dt><dd>{session.mistakes}</dd></div>
              <div><dt>Waktu</dt><dd>{formatTime(session.elapsedTimeMs)}</dd></div>
              <div><dt>Akurasi</dt><dd>{scoreResult.accuracy}%</dd></div>
              <div><dt>Skor dasar</dt><dd>+{scoreResult.baseScore}</dd></div>
              <div><dt>Bonus akurasi</dt><dd>+{scoreResult.accuracyBonus}</dd></div>
              <div><dt>Bonus kecepatan</dt><dd>+{scoreResult.speedBonus}</dd></div>
              <div><dt>Bonus kesulitan</dt><dd>+{scoreResult.difficultyBonus}</dd></div>
              {scoreResult.mistakePenalty > 0 && <div><dt>Penalti kesalahan</dt><dd>−{scoreResult.mistakePenalty}</dd></div>}
            </dl>
          </details>
        </VictoryDialog>
      )}
    </div>
  );
}
