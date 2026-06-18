/**
 * Battle — Main Battle Screen
 * Orchestrates: setup → shuffle → turn → gameplay → scoreboard → result
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Profile, BattlePlayer, BattleSession, BattleRound, BattleTurn, BattleAward, BattleMode, BattleDifficultyMode, DifficultyId } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import {
  shuffleArray, rotateOrder, buildRoundOrders, getRoundGameType, getBattleTimer,
  generateHitungQuestion, generateHitungChoices,
  generatePolaQuestion, generatePolaChoices,
  generateAdabQuestion, generateAdabChoices,
  generateIngatanQuestion, generateIngatanChoices,
  generateBossDuelSteps, getFamilyTargetScore,
  calculateBattleScore, calculateAwards,
} from "@/lib/battle";
import type React from "react";

interface Props {
  profiles: Profile[];
  onBack: () => void;
  backRef: React.MutableRefObject<(() => boolean) | null>;
}

type Phase = "select-players" | "select-mode" | "select-rounds" | "select-difficulty" | "set-difficulty" | "shuffle" | "turn-intro" | "gameplay" | "ingatan-memorize" | "ingatan-recall" | "boss-step" | "feedback" | "scoreboard" | "result" | "family-intro";

const BATTLE_MODES: { id: BattleMode; label: string; emoji: string; desc: string }[] = [
  { id: "hitung", label: "Hitung Kilat Duel", emoji: "⚡", desc: "Adu cepat berhitung bergiliran." },
  { id: "pola", label: "Pola Kilat Duel", emoji: "🧩", desc: "Temukan pola dengan cepat dan teliti." },
  { id: "ingatan", label: "Ingatan Cepat Duel", emoji: "🧠", desc: "Hafalkan gambar lalu pilih yang benar." },
  { id: "adab", label: "Adab Bijak Duel", emoji: "💖", desc: "Pilih sikap terbaik dan pelajari hikmahnya." },
  { id: "campuran", label: "Campuran Mastermind", emoji: "🎲", desc: "Gabungan hitung, pola, ingatan, dan adab." },
  { id: "boss-duel", label: "Boss Duel", emoji: "👑", desc: "Tantangan gabungan multi-langkah." },
  { id: "family-challenge", label: "Family Challenge", emoji: "👨‍👩‍👧", desc: "Kerja sama mencapai target skor bersama." },
];

const ROUND_OPTIONS = [
  { count: 3, label: "3 Ronde Cepat", desc: "Sekitar 5 menit" },
  { count: 5, label: "5 Ronde Standar", desc: "Sekitar 10 menit" },
  { count: 10, label: "10 Ronde Panjang", desc: "Sekitar 20 menit" },
];

const DIFFICULTY_OPTIONS: { id: DifficultyId; label: string; emoji: string }[] = [
  { id: "tk", label: "TK", emoji: "🧸" },
  { id: "sd-bawah", label: "SD Bawah", emoji: "📘" },
  { id: "sd-atas", label: "SD Atas", emoji: "📗" },
  { id: "smp", label: "SMP", emoji: "📙" },
  { id: "sma", label: "SMA", emoji: "📕" },
  { id: "universitas", label: "Universitas", emoji: "🎓" },
];

export function BattleScreen({ profiles, onBack, backRef }: Props) {
  const { saveBattleHistory } = useGameStore();

  // ── Setup state ──
  const [phase, setPhase] = useState<Phase>("select-players");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [battleMode, setBattleMode] = useState<BattleMode>("campuran");
  const [roundCount, setRoundCount] = useState(5);
  const [difficultyMode, setDifficultyMode] = useState<BattleDifficultyMode>("seimbang");
  const [setDifficulty, setSetDifficulty] = useState<DifficultyId>("sd-atas");

  // ── Battle state ──
  const [session, setSession] = useState<BattleSession | null>(null);
  const [currentTurn, setCurrentTurn] = useState<BattleTurn | null>(null);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);

  // ── Gameplay state ──
  const [timeLeft, setTimeLeft] = useState(10);
  const [questionData, setQuestionData] = useState<any>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnStartRef = useRef(Date.now());

  // Boss Duel state
  const [bossSteps, setBossSteps] = useState<any[]>([]);
  const [bossStepIndex, setBossStepIndex] = useState(0);
  const [bossTotalScore, setBossTotalScore] = useState(0);
  const [bossTurnResults, setBossTurnResults] = useState<any[]>([]);

  // Family Challenge state
  const [familyTarget, setFamilyTarget] = useState(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Derived ──
  const selectedPlayers = useMemo(() =>
    profiles.filter(p => selectedPlayerIds.has(p.id)),
    [profiles, selectedPlayerIds]
  );

  const canProceed = selectedPlayerIds.size >= 2;

  // Current player for turn intro
  const currentPlayer = useMemo(() => {
    if (!session) return null;
    const order = session.roundOrders[session.currentRound - 1];
    if (!order || session.currentTurnIndex >= order.length) return null;
    const pid = order[session.currentTurnIndex];
    return session.players.find(p => p.profileId === pid) || null;
  }, [session]);

  const currentGameType = useMemo(() => {
    if (!session) return "hitung" as const;
    const round = session.rounds[session.currentRound - 1];
    return round?.gameType || "hitung";
  }, [session]);

  // ── Phase: Select Players ──
  const togglePlayer = (id: string) => {
    setSelectedPlayerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 6) next.add(id);
      return next;
    });
  };

  // ── Phase: Start Battle ──
  const startBattle = () => {
    const players: BattlePlayer[] = selectedPlayers.map(p => ({
      profileId: p.id,
      profileName: p.name,
      avatar: p.avatar,
      difficulty: p.difficulty,
      level: p.level,
    }));

    const initialOrder = shuffleArray(players.map(p => p.profileId));
    const roundOrders = buildRoundOrders(initialOrder, roundCount);

    // Pre-create rounds
    const rounds: BattleRound[] = Array.from({ length: roundCount }, (_, i) => ({
      roundNumber: i + 1,
      gameType: getRoundGameType(i, battleMode),
      order: roundOrders[i],
      turns: [],
      completed: false,
    }));

    const scores: Record<string, number> = {};
    players.forEach(p => { scores[p.profileId] = 0; });

    const newSession: BattleSession = {
      id: crypto.randomUUID(),
      battleMode,
      players,
      roundCount,
      difficultyMode,
      setDifficulty: difficultyMode === "setara" ? setDifficulty : undefined,
      initialOrder,
      roundOrders,
      rounds,
      currentRound: 1,
      currentTurnIndex: 0,
      scores,
      awards: [],
      winnerProfileId: "",
      status: "playing",
      startedAt: Date.now(),
      finishedAt: 0,
    };

    setSession(newSession);
    setShuffledOrder(initialOrder);
    setPhase("shuffle");
  };

  // ── Phase: Start a turn ──
  const startTurn = useCallback(() => {
    if (!session) return;
    const round = session.rounds[session.currentRound - 1];
    const order = round.order;
    const turnIdx = session.currentTurnIndex;
    if (turnIdx >= order.length) {
      // Round complete — go to scoreboard
      setPhase("scoreboard");
      return;
    }

    const pid = order[turnIdx];
    const player = session.players.find(p => p.profileId === pid);
    if (!player) return;

    const diff = session.difficultyMode === "setara" && session.setDifficulty
      ? session.setDifficulty
      : player.difficulty;
    const gameType = round.gameType;
    const timeLimit = getBattleTimer(gameType, diff);
    const optCount = getBattleOptionCount(diff, gameType);

    let qData: any;
    let qChoices: any[];
    let correctAnswer: any;

    if (gameType === "hitung") {
      qData = generateHitungQuestion(diff);
      qChoices = generateHitungChoices(qData.answer, optCount).map(n => ({ value: n, label: String(n) }));
      correctAnswer = qData.answer;
    } else if (gameType === "pola") {
      qData = generatePolaQuestion(diff);
      qChoices = generatePolaChoices(qData.answer, optCount).map(e => ({ value: e, label: e }));
      correctAnswer = qData.answer;
    } else if (gameType === "ingatan") {
      qData = generateIngatanQuestion(diff);
      qChoices = generateIngatanChoices(qData.answer, optCount).map(e => ({ value: e, label: e }));
      correctAnswer = qData.answer;
      setQuestionData(qData);
      setChoices(qChoices);
      setSelectedAnswer(null);
      setFeedbackText("");
      setPhase("ingatan-memorize");
      return;
    } else {
      qData = generateAdabQuestion();
      qChoices = generateAdabChoices(qData.options, qData.bestIndex, optCount);
      correctAnswer = qData.bestIndex;
    }

    setQuestionData(qData);
    setChoices(qChoices);
    setSelectedAnswer(null);
    setFeedbackText("");
    setTimeLeft(timeLimit);
    setTimerPaused(false);
    turnStartRef.current = Date.now();

    clearTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimers();
          handleTimeout(correctAnswer, qData);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    setPhase("gameplay");
  }, [session, clearTimers]);

  // ── Handle timeout ──
  const handleTimeout = (correctAnswer: any, qData: any) => {
    setTimerPaused(true);
    setFeedbackText("⏰ Waktu habis! Tidak mendapat poin.");

    const turn: BattleTurn = {
      id: crypto.randomUUID(),
      roundNumber: session!.currentRound,
      profileId: currentPlayer!.profileId,
      gameType: currentGameType,
      questionData: qData,
      shuffledChoices: choices,
      selectedAnswer: null,
      correctAnswer,
      isCorrect: false,
      responseTimeMs: 0,
      baseScore: 0,
      speedBonus: 0,
      difficultyBonus: 0,
      finalScore: 0,
      feedback: "Waktu habis",
      createdAt: Date.now(),
    };
    setCurrentTurn(turn);
    setPhase("feedback");
  };

  // ── Handle answer ──
  const handleAnswer = (choice: any) => {
    clearTimers();
    setTimerPaused(true);
    const elapsed = Date.now() - turnStartRef.current;
    const diff = session!.difficultyMode === "setara" && session!.setDifficulty
      ? session!.setDifficulty
      : currentPlayer!.difficulty;
    const timeLimitMs = getBattleTimer(currentGameType, diff) * 1000;

    let isCorrect = false;
    let isBestChoice = false;
    let fbText = "";

    if (currentGameType === "hitung" || currentGameType === "pola" || currentGameType === "ingatan") {
      isCorrect = choice.value === questionData.answer;
      fbText = isCorrect ? "✅ Jawaban tepat!" : "❌ Jawaban kurang tepat.";
    } else {
      // Adab
      isCorrect = choice.idx === questionData.bestIndex;
      isBestChoice = isCorrect;
      if (isCorrect) {
        fbText = "🌟 Pilihan terbaik!\n\n" + questionData.explanation;
      } else if (choice.idx === questionData.acceptableIndex) {
        isCorrect = true;
        fbText = "💡 Cukup baik.\n\n" + questionData.explanation;
      } else {
        fbText = "📖 " + questionData.explanation;
      }
    }

    setSelectedAnswer(choice);
    setFeedbackText(fbText);

    const score = calculateBattleScore(isCorrect, elapsed, timeLimitMs, diff, isBestChoice);

    const turn: BattleTurn = {
      id: crypto.randomUUID(),
      roundNumber: session!.currentRound,
      profileId: currentPlayer!.profileId,
      gameType: currentGameType,
      questionData,
      shuffledChoices: choices,
      selectedAnswer: choice,
      correctAnswer: currentGameType === "adab" ? questionData.bestIndex : questionData.answer,
      isCorrect,
      responseTimeMs: elapsed,
      baseScore: score.baseScore,
      speedBonus: score.speedBonus,
      difficultyBonus: score.difficultyBonus,
      finalScore: score.finalScore,
      feedback: fbText,
      createdAt: Date.now(),
    };
    setCurrentTurn(turn);
    setPhase("feedback");
  };

  // ── Boss Duel: Start multi-step turn ──
  const startBossDuelTurn = useCallback(() => {
    if (!session || !currentPlayer) return;
    const diff = session.difficultyMode === "setara" && session.setDifficulty
      ? session.setDifficulty
      : currentPlayer.difficulty;
    const steps = generateBossDuelSteps(diff);
    setBossSteps(steps);
    setBossStepIndex(0);
    setBossTotalScore(0);
    setBossTurnResults([]);
    setPhase("boss-step");
  }, [session, currentPlayer]);

  // ── Boss Duel: Handle step answer ──
  const handleBossStepAnswer = (choice: any) => {
    const steps = bossSteps;
    const step = steps[bossStepIndex];
    if (!step) return;

    const isCorrect = step.type === "adab"
      ? choice.idx === step.correctAnswer
      : choice.value === step.correctAnswer;

    const result = { stepIndex: bossStepIndex, selected: choice, isCorrect, points: isCorrect ? step.points : 0 };
    const newResults = [...bossTurnResults, result];
    setBossTurnResults(newResults);
    setBossTotalScore(prev => prev + (isCorrect ? step.points : 0));

    if (bossStepIndex < steps.length - 1) {
      setBossStepIndex(prev => prev + 1);
    } else {
      // All steps complete
      finishBossDuelTurn(newResults);
    }
  };

  // ── Boss Duel: Finish turn ──
  const finishBossDuelTurn = (results: any[]) => {
    const totalScore = results.reduce((s, r) => s + r.points, 0);
    const allCorrect = results.every((r: any) => r.isCorrect);

    const turn: BattleTurn = {
      id: crypto.randomUUID(),
      roundNumber: session!.currentRound,
      profileId: currentPlayer!.profileId,
      gameType: "hitung" as any,
      questionData: { bossSteps, results },
      shuffledChoices: [],
      selectedAnswer: results,
      correctAnswer: null,
      isCorrect: allCorrect,
      responseTimeMs: 0,
      baseScore: totalScore,
      speedBonus: 0,
      difficultyBonus: 0,
      finalScore: totalScore,
      feedback: allCorrect ? "🌟 Boss berhasil dikalahkan!" : "💪 Semangat terus!",
      createdAt: Date.now(),
    };
    setCurrentTurn(turn);
    setFeedbackText(allCorrect
      ? `Boss Duel Selesai! +${totalScore} poin`
      : `Selesai! +${totalScore} poin. Terus berlatih ya!`
    );
    setPhase("feedback");
  };

  // ── Ingatan: Move to recall phase ──
  const startIngatanRecall = () => {
    if (!questionData) return;
    const diff = session!.difficultyMode === "setara" && session!.setDifficulty
      ? session!.setDifficulty
      : currentPlayer!.difficulty;
    const timeLimit = getBattleTimer("ingatan", diff);
    setTimeLeft(timeLimit);
    turnStartRef.current = Date.now();

    clearTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimers();
          handleTimeout(questionData.answer, questionData);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    setPhase("ingatan-recall");
  };

  // ── Continue from feedback ──
  const handleContinueTurn = () => {
    if (!session || !currentTurn) return;

    // Save turn to session
    const newSession = { ...session };
    const round = { ...newSession.rounds[session.currentRound - 1] };
    round.turns = [...round.turns, currentTurn];
    newSession.rounds = [...newSession.rounds];
    newSession.rounds[session.currentRound - 1] = round;

    // Update scores
    newSession.scores = { ...newSession.scores };
    newSession.scores[currentTurn.profileId] = (newSession.scores[currentTurn.profileId] || 0) + currentTurn.finalScore;

    // Advance
    newSession.currentTurnIndex = session.currentTurnIndex + 1;
    setSession(newSession);
    setCurrentTurn(null);
    setPhase("turn-intro");
  };

  // ── Complete round & go to scoreboard ──
  const goToScoreboard = useCallback(() => {
    if (!session) return;

    const newSession = { ...session };
    const round = { ...newSession.rounds[session.currentRound - 1] };
    round.completed = true;
    newSession.rounds = [...newSession.rounds];
    newSession.rounds[session.currentRound - 1] = round;

    setSession(newSession);
    setPhase("scoreboard");
  }, [session]);

  // ── Advance to next round ──
  const advanceRound = () => {
    if (!session) return;

    if (session.currentRound >= session.roundCount) {
      // Battle finished!
      finalizeBattle(session);
      return;
    }

    const newSession = { ...session };
    newSession.currentRound = session.currentRound + 1;
    newSession.currentTurnIndex = 0;
    setSession(newSession);
    setPhase("turn-intro");
  };

  // ── Finalize battle ──
  const finalizeBattle = (sess: BattleSession) => {
    const allTurns = sess.rounds.flatMap(r => r.turns);
    const awards = calculateAwards(sess.players, sess.scores, allTurns);

    const winner = Object.entries(sess.scores).reduce((best, [id, score]) =>
      score > best.score ? { profileId: id, score } : best,
      { profileId: "", score: -1 }
    );

    const finalSession: BattleSession = {
      ...sess,
      awards,
      winnerProfileId: winner.profileId,
      status: "finished",
      finishedAt: Date.now(),
    };

    setSession(finalSession);
    setPhase("result");

    // Save to history
    const winnerPlayer = sess.players.find(p => p.profileId === winner.profileId);
    saveBattleHistory({
      sessionId: finalSession.id,
      battleMode: finalSession.battleMode,
      players: finalSession.players,
      winner: {
        profileId: winner.profileId,
        profileName: winnerPlayer?.profileName || "",
        avatar: winnerPlayer?.avatar || "👤",
      },
      finalScores: finalSession.scores,
      awards,
      playedAt: Date.now(),
    });
  };

  // ── Back handler ──
  useEffect(() => {
    backRef.current = () => {
      if (phase === "gameplay" || phase === "feedback") {
        // Confirm exit
        setPhase("turn-intro"); // Go back to intro first, then user can back further
        return true;
      }
      if (phase === "scoreboard" || phase === "shuffle") {
        onBack();
        return true;
      }
      if (phase === "result") {
        onBack();
        return true;
      }
      // Setup phases — step back
      if (phase === "select-mode") { setPhase("select-players"); return true; }
      if (phase === "select-rounds") { setPhase("select-mode"); return true; }
      if (phase === "select-difficulty") { setPhase("select-rounds"); return true; }
      if (phase === "set-difficulty") { setPhase("select-difficulty"); return true; }
      if (phase === "select-players") { onBack(); return true; }
      if (phase === "turn-intro") {
        // Go back to scoreboard or exit confirm
        if (session && session.currentTurnIndex === 0 && session.currentRound > 1) {
          setPhase("scoreboard");
        } else {
          onBack();
        }
        return true;
      }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, phase, session, onBack]);

  // Cleanup timer
  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Effect: when phase changes to turn-intro, check if round is complete ──
  useEffect(() => {
    if (phase === "turn-intro" && session && session.currentTurnIndex >= session.roundOrders[session.currentRound - 1].length) {
      goToScoreboard();
    }
  }, [phase, session, goToScoreboard]);

  // ══════════════════════════════════════════
  // RENDER: Select Players
  // ══════════════════════════════════════════
  if (phase === "select-players") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
          <button onClick={onBack} className="h-12 w-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shadow-sm shrink-0 active:scale-95">←</button>
          <div className="flex-1">
            <h1 className="font-display font-black text-xl sm:text-2xl text-white">Pilih Pemain</h1>
            <p className="text-xs sm:text-sm text-white/60">Siapa yang ikut duel hari ini?</p>
          </div>
          <div className="text-2xl sm:text-3xl shrink-0">⚔️</div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          <div className="text-xs text-white/50 text-center mb-2">Pilih 2–6 pemain</div>
          {profiles.map(p => {
            const selected = selectedPlayerIds.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={`w-full rounded-2xl p-4 flex items-center gap-4 border-4 transition-all active:scale-[0.98] ${
                  selected
                    ? "bg-gradient-meadow/30 border-[#2E8B12] shadow-lg shadow-[#2E8B12]/20"
                    : "bg-white/10 border-white/10"
                }`}
              >
                <div className="h-14 w-14 rounded-2xl bg-white/20 grid place-items-center text-3xl shrink-0">
                  {p.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-display font-black text-lg text-white truncate">{p.name}</div>
                  <div className="text-xs text-white/60">Level {p.level} · {p.difficulty.toUpperCase()}</div>
                </div>
                <div className={`h-8 w-8 rounded-full grid place-items-center text-lg shrink-0 transition-all ${
                  selected ? "bg-[#2E8B12] text-white" : "bg-white/20 text-white/50"
                }`}>
                  {selected ? "✓" : "+"}
                </div>
              </button>
            );
          })}
          {profiles.length < 2 && (
            <GameCard tone="cream" className="text-center py-4">
              <p className="text-sm font-bold text-[#8C6B45]">Buat minimal 2 profil anak untuk memulai duel.</p>
            </GameCard>
          )}
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2 flex gap-3">
          <GameButton variant="ghost" size="md" onClick={onBack}>Kembali</GameButton>
          <GameButton variant="primary" size="md" full disabled={!canProceed} onClick={() => setPhase("select-mode")}>
            {canProceed ? `Lanjut (${selectedPlayerIds.size} pemain)` : "Pilih minimal 2 pemain"}
          </GameButton>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Select Mode
  // ══════════════════════════════════════════
  if (phase === "select-mode") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
          <button onClick={() => setPhase("select-players")} className="h-12 w-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shrink-0 active:scale-95">←</button>
          <div className="flex-1">
            <h1 className="font-display font-black text-xl sm:text-2xl text-white">Mode Battle</h1>
            <p className="text-xs text-white/60">{selectedPlayers.length} pemain terpilih</p>
          </div>
          <div className="text-2xl">🎮</div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          {BATTLE_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setBattleMode(m.id); setPhase("select-rounds"); }}
              className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${
                battleMode === m.id
                  ? "bg-gradient-blue/40 border-[#185E9F]"
                  : "bg-white/10 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-black text-lg text-white">{m.label}</div>
                  <div className="text-xs text-white/60">{m.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2">
          <GameButton variant="ghost" size="md" full onClick={() => setPhase("select-players")}>Kembali</GameButton>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Select Rounds
  // ══════════════════════════════════════════
  if (phase === "select-rounds") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
          <button onClick={() => setPhase("select-mode")} className="h-12 w-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shrink-0 active:scale-95">←</button>
          <div className="flex-1">
            <h1 className="font-display font-black text-xl sm:text-2xl text-white">Jumlah Ronde</h1>
          </div>
          <div className="text-2xl">🔢</div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          {ROUND_OPTIONS.map(opt => (
            <button
              key={opt.count}
              onClick={() => { setRoundCount(opt.count); setPhase("select-difficulty"); }}
              className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${
                roundCount === opt.count
                  ? "bg-gradient-coin/30 border-[#D48806]"
                  : "bg-white/10 border-white/10"
              }`}
            >
              <div className="font-display font-black text-lg text-white">{opt.label}</div>
              <div className="text-xs text-white/60">{opt.desc}</div>
            </button>
          ))}
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2">
          <GameButton variant="ghost" size="md" full onClick={() => setPhase("select-mode")}>Kembali</GameButton>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Select Difficulty Mode
  // ══════════════════════════════════════════
  if (phase === "select-difficulty") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
          <button onClick={() => setPhase("select-rounds")} className="h-12 w-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shrink-0 active:scale-95">←</button>
          <div className="flex-1">
            <h1 className="font-display font-black text-xl sm:text-2xl text-white">Sistem Difficulty</h1>
          </div>
          <div className="text-2xl">⚖️</div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          <button
            onClick={() => { setDifficultyMode("seimbang"); startBattle(); }}
            className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${
              difficultyMode === "seimbang" ? "bg-gradient-meadow/30 border-[#2E8B12]" : "bg-white/10 border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <div className="font-display font-black text-lg text-white">Mode Seimbang</div>
                <div className="text-xs text-white/60">Soal menyesuaikan difficulty masing-masing. Cocok untuk beda usia.</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPhase("set-difficulty")}
            className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${
              difficultyMode === "setara" ? "bg-gradient-blue/30 border-[#185E9F]" : "bg-white/10 border-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚖️</span>
              <div>
                <div className="font-display font-black text-lg text-white">Mode Setara</div>
                <div className="text-xs text-white/60">Semua pemain dapat soal level sama. Cocok untuk usia mirip.</div>
              </div>
            </div>
          </button>
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2">
          <GameButton variant="ghost" size="md" full onClick={() => setPhase("select-rounds")}>Kembali</GameButton>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Set Difficulty (for Mode Setara)
  // ══════════════════════════════════════════
  if (phase === "set-difficulty") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
          <button onClick={() => setPhase("select-difficulty")} className="h-12 w-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shrink-0 active:scale-95">←</button>
          <div className="flex-1">
            <h1 className="font-display font-black text-xl text-white">Pilih Tingkat</h1>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          {DIFFICULTY_OPTIONS.map(d => (
            <button
              key={d.id}
              onClick={() => { setSetDifficulty(d.id); startBattle(); }}
              className={`w-full rounded-2xl p-4 flex items-center gap-4 border-4 transition-all active:scale-[0.98] ${
                setDifficulty === d.id ? "bg-gradient-coin/30 border-[#D48806]" : "bg-white/10 border-white/10"
              }`}
            >
              <span className="text-3xl">{d.emoji}</span>
              <span className="font-display font-black text-lg text-white">{d.label}</span>
            </button>
          ))}
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2">
          <GameButton variant="ghost" size="md" full onClick={() => setPhase("select-difficulty")}>Kembali</GameButton>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Shuffle Order
  // ══════════════════════════════════════════
  if (phase === "shuffle") {
    const players = session!.players;
    const playerMap = new Map(players.map(p => [p.profileId, p]));

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4 animate-bob">🎲</div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">Urutan Ronde Pertama</h1>
        <p className="text-sm text-white/60 mb-8">Urutan diacak agar adil!</p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {shuffledOrder.map((pid, i) => {
            const p = playerMap.get(pid);
            if (!p) return null;
            return (
              <div key={pid} className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 border-2 border-white/20">
                <div className="h-10 w-10 rounded-full bg-gradient-blue grid place-items-center text-white font-black text-sm">{i + 1}</div>
                <div className="text-3xl">{p.avatar}</div>
                <div className="font-display font-black text-lg text-white">{p.profileName}</div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-white/40 mb-6 text-center">Setiap ronde berikutnya urutan akan bergeser agar semua dapat giliran awal, tengah, dan akhir.</p>

        <GameButton variant="primary" size="lg" onClick={() => setPhase("turn-intro")}>
          ⚡ Mulai Ronde 1
        </GameButton>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Turn Intro
  // ══════════════════════════════════════════
  if (phase === "turn-intro") {
    if (!currentPlayer) {
      // Round complete — shouldn't happen but safety
      setTimeout(() => goToScoreboard(), 0);
      return null;
    }

    const round = session!.rounds[session!.currentRound - 1];
    const gameTypeLabels: Record<string, string> = { hitung: "Hitung Kilat", pola: "Pola Kilat", adab: "Adab Bijak", ingatan: "Ingatan Cepat", "boss-duel": "Boss Duel", "family-challenge": "Family Challenge" };
    const gameTypeEmojis: Record<string, string> = { hitung: "⚡", pola: "🧩", adab: "💖", ingatan: "🧠", "boss-duel": "👑", "family-challenge": "👨‍👩‍👧" };

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col items-center justify-center p-4">
        <GameCard tone="blue" className="text-center w-full max-w-sm p-8 text-white">
          <div className="text-3xl mb-3">{gameTypeEmojis[currentGameType]}</div>
          <div className="text-xs uppercase font-bold opacity-60 mb-2">Ronde {session!.currentRound} · {gameTypeLabels[currentGameType]}</div>
          <div className="text-6xl mb-3">{currentPlayer.avatar}</div>
          <h1 className="font-display font-black text-3xl mb-1">Giliran {currentPlayer.profileName}</h1>
          <p className="text-sm font-bold opacity-80 mb-4">
            Skor: {session!.scores[currentPlayer.profileId] || 0}
          </p>
          <p className="text-xs text-white/50 mb-6">Berikan device ke {currentPlayer.profileName} dan klik Saya Siap!</p>
          <GameButton variant="primary" size="lg" full onClick={startTurn}>
            💪 Saya Siap!
          </GameButton>
        </GameCard>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Ingatan Memorize Phase
  // ══════════════════════════════════════════
  if (phase === "ingatan-memorize") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col items-center justify-center p-4">
        <GameCard tone="blue" className="text-center w-full max-w-sm p-6 text-white">
          <div className="text-6xl mb-4">👀</div>
          <h2 className="font-display font-black text-2xl mb-2">Hafalkan Gambar!</h2>
          <p className="text-sm opacity-80 mb-6">Lihat baik-baik, sebentar lagi akan hilang!</p>

          <div className="flex justify-center flex-wrap gap-3 text-5xl mb-6">
            {questionData?.items?.map((item: string, i: number) => (
              <span key={i} className="drop-shadow-lg">{item}</span>
            ))}
          </div>

          <p className="text-xs opacity-60 mb-6">{questionData?.memorizeTime} detik lagi...</p>

          <GameButton variant="primary" size="md" full onClick={startIngatanRecall}>
            🧠 Aku Siap!
          </GameButton>
        </GameCard>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Ingatan Recall Phase
  // ══════════════════════════════════════════
  if (phase === "ingatan-recall") {
    const timerPercent = questionData
      ? (timeLeft / getBattleTimer("ingatan", currentPlayer?.difficulty || "sd-atas")) * 100
      : 100;
    const timerColor = timeLeft <= 2 ? "#A02020" : timeLeft <= 4 ? "#D48806" : "#2E8B12";

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col p-3 sm:p-4">
        <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm border-2 border-white/20">
            {currentPlayer?.avatar} {currentPlayer?.profileName}
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm border-2 border-white/20 ml-auto">
            Ronde {session!.currentRound}
          </div>
        </header>

        <div className="h-3 rounded-full bg-white/10 mb-4 shrink-0 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
        </div>

        <main className="flex-1 flex flex-col items-center justify-center min-h-0">
          <GameCard tone="cream" className="w-full max-w-sm text-center py-6 mb-4 border-4 shrink-0">
            <div className="text-xs font-bold text-[#185E9F] mb-3 uppercase">Mana yang tadi ada?</div>
            <p className="text-3xl opacity-30">{questionData?.display}</p>
          </GameCard>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm">
            {choices.map((c: any, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(c)}
                className="h-16 sm:h-20 rounded-2xl bg-white border-4 border-[#CBB794] grid place-items-center text-3xl sm:text-4xl shadow-pop active:translate-y-[4px] transition-all hover:border-[#185E9F]"
              >
                {c.label}
              </button>
            ))}
          </div>
        </main>

        <div className="text-center text-xs font-bold text-white/40 pt-2 shrink-0">
          ⏱ {timeLeft} detik
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Boss Duel Step
  // ══════════════════════════════════════════
  if (phase === "boss-step") {
    const step = bossSteps[bossStepIndex];
    if (!step) return null;

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col p-3 sm:p-4">
        <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm border-2 border-white/20">
            {currentPlayer?.avatar} {currentPlayer?.profileName}
          </div>
          <div className="bg-yellow-400/20 px-3 py-1.5 rounded-full font-black text-yellow-300 text-sm border-2 border-yellow-400/30 ml-auto">
            👑 Langkah {bossStepIndex + 1}/{bossSteps.length}
          </div>
        </header>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-white/10 mb-4 shrink-0 overflow-hidden">
          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${((bossStepIndex) / bossSteps.length) * 100}%` }} />
        </div>

        <main className="flex-1 flex flex-col items-center justify-center min-h-0">
          <GameCard tone="cream" className="w-full max-w-sm text-center py-8 mb-4 border-4 shrink-0">
            <p className="font-bold text-sm text-[#8C6B45] mb-2">{step.instruction}</p>
            {step.type === "hitung" && (
              <div className="font-display font-black text-4xl sm:text-5xl text-[#5A3515]">{step.question?.display}</div>
            )}
            {step.type === "pola" && (
              <div className="font-display font-black text-xl text-[#5A3515]">{step.question?.display}</div>
            )}
            {step.type === "adab" && (
              <>
                <div className="text-3xl mb-2">{step.question?.emoji}</div>
                <p className="font-bold text-base text-[#5A3515]">{step.question?.situation}</p>
              </>
            )}
          </GameCard>

          <div className={`grid ${step.choices.length <= 4 ? "grid-cols-2" : "grid-cols-3"} gap-2 sm:gap-3 w-full max-w-sm`}>
            {step.choices.map((c: any, i: number) => (
              <button
                key={i}
                onClick={() => handleBossStepAnswer(c)}
                className={`h-16 sm:h-20 rounded-2xl bg-white border-4 border-[#CBB794] text-[#5A3515] font-display font-black text-lg sm:text-xl shadow-pop active:translate-y-[4px] transition-all hover:border-[#185E9F] ${
                  step.type === "adab" ? "text-xs sm:text-sm leading-tight px-2 text-left" : ""
                }`}
              >
                {step.type === "adab" ? (
                  <span className="flex items-center gap-1">
                    <span className="text-lg shrink-0">{["🌟","💚","💛","💙","💜","🧡"][c.idx % 6]}</span>
                    <span className="break-words">{c.text}</span>
                  </span>
                ) : c.label}
              </button>
            ))}
          </div>

          <div className="text-center text-xs font-bold text-white/40 pt-2 shrink-0">
            Skor langkah ini: +{bossTotalScore} poin
          </div>
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Gameplay
  // ══════════════════════════════════════════
  if (phase === "gameplay") {
    const timerPercent = (timeLeft / getBattleTimer(currentGameType, currentPlayer?.difficulty || "sd-atas")) * 100;
    const timerColor = timeLeft <= 2 ? "#A02020" : timeLeft <= 4 ? "#D48806" : "#2E8B12";
    const gridCols = choices.length <= 4 ? "grid-cols-2" : "grid-cols-3";

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col p-3 sm:p-4">
        <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm border-2 border-white/20">
            {currentPlayer?.avatar} {currentPlayer?.profileName}
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm border-2 border-white/20 ml-auto">
            Ronde {session!.currentRound}
          </div>
        </header>

        <div className="h-3 rounded-full bg-white/10 mb-4 shrink-0 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-100" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} />
        </div>

        <main className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Question */}
          <GameCard tone="cream" className="w-full max-w-sm text-center py-8 mb-4 border-4 shrink-0">
            {currentGameType === "hitung" && (
              <div className="font-display font-black text-5xl sm:text-6xl text-[#5A3515]">
                {questionData?.display}
              </div>
            )}
            {currentGameType === "pola" && (
              <>
                <div className="text-xs font-bold text-[#8C6B45] mb-3 uppercase">Apa selanjutnya?</div>
                <div className="flex justify-center items-center gap-1 sm:gap-2 text-3xl sm:text-4xl flex-wrap">
                  {questionData?.sequence?.map((e: string, i: number) => (
                    <span key={i}>{e}</span>
                  ))}
                  <span className="text-[#A02020] font-black text-4xl sm:text-5xl ml-1">?</span>
                </div>
              </>
            )}
            {currentGameType === "adab" && (
              <>
                <div className="text-3xl mb-2">{questionData?.emoji}</div>
                <p className="font-display font-bold text-lg sm:text-xl text-[#5A3515] leading-snug px-2">
                  {questionData?.situation}
                </p>
              </>
            )}
          </GameCard>

          {/* Options */}
          <div className={`grid ${gridCols} gap-2 sm:gap-3 w-full max-w-sm`}>
            {choices.map((c: any, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(c)}
                className={`h-16 sm:h-20 rounded-2xl bg-white border-4 border-[#CBB794] text-[#5A3515] font-display font-black text-xl sm:text-2xl shadow-pop active:translate-y-[4px] active:shadow-sm transition-all hover:border-[#185E9F] max-w-full overflow-hidden ${
                  currentGameType === "adab" ? "text-sm sm:text-base leading-tight px-2 text-left" : ""
                }`}
              >
                {currentGameType === "adab" ? (
                  <span className="flex items-center gap-1">
                    <span className="text-lg shrink-0">{["🌟","💚","💛","💙","💜","🧡"][c.idx % 6]}</span>
                    <span className="break-words">{c.text}</span>
                  </span>
                ) : (
                  c.label
                )}
              </button>
            ))}
          </div>
        </main>

        <div className="text-center text-xs font-bold text-white/40 pt-2 shrink-0">
          ⏱ {timeLeft} detik
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Feedback
  // ══════════════════════════════════════════
  if (phase === "feedback") {
    const isCorrect = currentTurn?.isCorrect;
    const isAdab = currentGameType === "adab";

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col items-center justify-center p-4">
        <GameCard tone={isCorrect ? "meadow" : "wood"} className="text-center w-full max-w-sm p-6 text-white">
          <div className="text-6xl mb-3">{isCorrect ? "🎉" : "💪"}</div>
          <h2 className="font-display font-black text-2xl mb-2">
            {isCorrect ? "Jawaban Tepat!" : "Semangat Terus!"}
          </h2>

          {feedbackText && (
            <div className="bg-black/20 rounded-2xl p-4 mb-4 text-sm leading-relaxed whitespace-pre-line">
              {feedbackText}
            </div>
          )}

          {isCorrect && (
            <div className="text-yellow-300 font-black text-xl mb-4">
              +{currentTurn?.finalScore} poin
            </div>
          )}

          {!isAdab || isCorrect ? (
            <GameButton variant="primary" size="md" full onClick={handleContinueTurn}>
              Pemain Berikutnya →
            </GameButton>
          ) : (
            <div className="space-y-2">
              <GameButton variant="primary" size="md" full onClick={handleContinueTurn}>
                Pemain Berikutnya →
              </GameButton>
            </div>
          )}
        </GameCard>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Scoreboard
  // ══════════════════════════════════════════
  if (phase === "scoreboard") {
    const sorted = [...(session?.players || [])].sort((a, b) =>
      (session?.scores[b.profileId] || 0) - (session?.scores[a.profileId] || 0)
    );
    const isLastRound = session!.currentRound >= session!.roundCount;

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="font-display font-black text-xl sm:text-2xl text-white">Ronde {session!.currentRound} Selesai!</h1>
          </div>
          <div className="text-2xl">📊</div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-2 pb-4">
          {sorted.map((p, i) => {
            const roundScore = session?.rounds[session.currentRound - 1]?.turns
              .filter(t => t.profileId === p.profileId)
              .reduce((s, t) => s + t.finalScore, 0) || 0;

            return (
              <div key={p.profileId} className={`rounded-2xl p-4 flex items-center gap-4 border-2 ${
                i === 0 ? "bg-gradient-coin/20 border-[#D48806]" : "bg-white/10 border-white/10"
              }`}>
                <div className="text-2xl font-black w-10 text-center shrink-0 text-white">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div className="text-3xl shrink-0">{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{p.profileName}</div>
                  <div className="text-xs text-white/50">Ronde ini: +{roundScore}</div>
                </div>
                <div className="font-display font-black text-xl text-white text-right shrink-0">
                  {session?.scores[p.profileId] || 0}
                </div>
              </div>
            );
          })}
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2 space-y-2">
          {!isLastRound && (
            <p className="text-xs text-white/40 text-center">Ronde berikutnya urutan bergeser agar adil.</p>
          )}
          <GameButton variant="primary" size="lg" full onClick={advanceRound}>
            {isLastRound ? "🏆 Lihat Hasil Akhir" : "Lanjut Ronde Berikutnya →"}
          </GameButton>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // RENDER: Final Result
  // ══════════════════════════════════════════
  if (phase === "result") {
    // ── Family Challenge Result ──
    if (session?.battleMode === "family-challenge") {
      const totalScore = Object.values(session?.scores || {}).reduce((a, b) => a + b, 0);
      const target = getFamilyTargetScore(session.players.length, session.roundCount, session.setDifficulty || "sd-atas");
      const achieved = totalScore >= target;
      return (
        <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
          <header className="shrink-0 px-4 pt-safe mt-2 pb-3 text-center">
            <div className="text-6xl mb-2">{achieved ? "🎉" : "💪"}</div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
              {achieved ? "Target Tercapai!" : "Hampir Tercapai!"}
            </h1>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
            <div className="rounded-2xl bg-white/10 border-2 border-white/20 p-5 text-center">
              <div className="text-xs uppercase font-bold text-white/50 mb-2">Skor Kelompok</div>
              <div className="font-display font-black text-4xl text-yellow-300">{totalScore}</div>
              <div className="text-xs text-white/50 mt-1">Target: {target}</div>
              <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-yellow-400 rounded-full" style={{ width: `${Math.min(100, (totalScore / target) * 100)}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              {(session?.players || []).map((p) => (
                <div key={p.profileId} className="rounded-2xl bg-white/10 border border-white/10 p-3 flex items-center gap-3">
                  <div className="text-2xl shrink-0">{p.avatar}</div>
                  <div className="flex-1 min-w-0"><div className="font-bold text-white truncate text-sm">{p.profileName}</div></div>
                  <div className="font-black text-lg text-white shrink-0">{session?.scores[p.profileId] || 0}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#0F2847] border border-white/10 p-4 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm text-white/70 leading-relaxed">
                {achieved ? "Kerja sama membuat segalanya mungkin. Teruslah saling menyemangati!" : "Tidak apa-apa! Yang penting sudah berusaha bersama. Coba lagi ya!"}
              </p>
            </div>
          </main>
          <div className="shrink-0 px-4 pb-safe pt-2 flex gap-3">
            <GameButton variant="ghost" size="md" onClick={onBack}>🏠 Home</GameButton>
            <GameButton variant="primary" size="md" full onClick={() => { setPhase("select-players"); setSelectedPlayerIds(new Set()); setSession(null); }}>👨‍👩‍👧 Main Lagi</GameButton>
          </div>
        </div>
      );
    }

    const sorted = [...(session?.players || [])].sort((a, b) =>
      (session?.scores[b.profileId] || 0) - (session?.scores[a.profileId] || 0)
    );
    const winner = session?.players.find(p => p.profileId === session?.winnerProfileId);

    return (
      <div className="h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847] flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 text-center">
          <div className="text-5xl mb-2">👑</div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-yellow-300">{session?.battleMode === "boss-duel" ? "Boss Duel Selesai!" : "Pemenang Battle!"}</h1>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          {/* Winner highlight */}
          {winner && (
            <div className="rounded-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 border-2 border-yellow-400/50 p-5 text-center">
              <div className="text-7xl mb-2">{winner.avatar}</div>
              <div className="font-display font-black text-2xl text-yellow-300">{winner.profileName}</div>
              <div className="text-3xl font-black text-white mt-1">{session?.scores[winner.profileId]} poin</div>
            </div>
          )}

          {/* All rankings */}
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <div key={p.profileId} className={`rounded-2xl p-3 flex items-center gap-3 border-2 ${
                i === 0 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-white/5 border-white/10"
              }`}>
                <div className="text-xl font-black w-8 text-center shrink-0 text-white">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </div>
                <div className="text-2xl shrink-0">{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate text-sm">{p.profileName}</div>
                </div>
                <div className="font-black text-lg text-white shrink-0">{session?.scores[p.profileId]}</div>
              </div>
            ))}
          </div>

          {/* Awards */}
          {session?.awards && session.awards.length > 0 && (
            <div>
              <h3 className="font-display font-black text-sm text-white/60 uppercase mb-2">Penghargaan Tambahan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {session.awards.map((a, i) => (
                  <div key={i} className="rounded-2xl bg-white/10 border border-white/10 p-3 flex items-center gap-2">
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{a.profileName}</div>
                      <div className="text-xs text-yellow-300 font-bold">{a.award}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adab message */}
          <div className="rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#0F2847] border border-white/10 p-4 text-center">
            <div className="text-3xl mb-2">🤲</div>
            <p className="text-sm text-white/70 leading-relaxed">
              Pemenang yang baik tetap rendah hati. Yang belum menang tetap semangat belajar.
            </p>
          </div>
        </main>

        <div className="shrink-0 px-4 pb-safe pt-2 flex gap-3">
          <GameButton variant="ghost" size="md" onClick={onBack}>🏠 Home</GameButton>
          <GameButton variant="primary" size="md" full onClick={() => {
            // Reset to setup
            setPhase("select-players");
            setSelectedPlayerIds(new Set());
            setSession(null);
            setCurrentTurn(null);
            setShuffledOrder([]);
          }}>
            ⚔️ Main Lagi
          </GameButton>
        </div>
      </div>
    );
  }

  return null;
}

// Re-export helper used in BattleScreen
function getBattleOptionCount(difficulty: DifficultyId, gameType: string): number {
  if (difficulty === "tk") return gameType === "adab" ? 4 : 4;
  if (difficulty === "sd-bawah") return gameType === "adab" ? 5 : 6;
  return 6;
}
