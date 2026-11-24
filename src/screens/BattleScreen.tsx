/**
 * Battle — Main Battle Screen
 * Uses BATTLE_GAME_POOL for all game types.
 * Battle categories: Fokus Cepat, Logika, Spasial, Campuran, Family Challenge.
 * Adab games excluded from Battle.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Profile, BattlePlayer, BattleSession, BattleRound, BattleTurn, BattleAward, BattleDifficultyMode, DifficultyId } from "@/types";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { useGameStore } from "@/lib/storage";
import { shuffleArray, rotateOrder, buildRoundOrders, calculateBattleScore, calculateAwards } from "@/lib/battle";
import {
  BATTLE_GAME_POOL, getBattleGames, getBattleTimer, pickGameForRound,
  pickRandomCampuranGame, getDifficultyBonus,
  type BattleGameDefinition, type BattleQuestion, type BattleChoice,
} from "@/lib/battle-game-pool";
import type React from "react";
import { AvatarPortrait } from "@/components/profile/AvatarPortrait";

interface Props {
  profiles: Profile[];
  onBack: () => void;
  backRef: React.MutableRefObject<(() => boolean) | null>;
}

type BattleCategory = "fokus-cepat" | "logika" | "spasial" | "campuran" | "keluarga";
type Phase = "select-players" | "select-mode" | "select-rounds" | "select-difficulty" | "set-difficulty"
  | "select-campuran-games"
  | "shuffle" | "turn-intro" | "gameplay" | "ingatan-memorize" | "ingatan-recall"
  | "feedback" | "scoreboard" | "result" | "family-intro"
  | "jalur-tercepat-play" | "ubah-posisi-play"
  | "rantai-warna-play" | "jalur-angka-play";

const BATTLE_MODES: { id: BattleCategory; label: string; emoji: string; desc: string }[] = [
  { id: "fokus-cepat", label: "Battle Fokus Cepat", emoji: "⚡", desc: "Hitung, Pola, Ingatan, dan Cari Beda bergiliran." },
  { id: "logika", label: "Battle Logika", emoji: "🧠", desc: "Detektif, Tebak Aturan, Kesimpulan, Benar-Salah, Kode Warna." },
  { id: "spasial", label: "Battle Spasial", emoji: "🗺️", desc: "Ubah Posisi, Cocok Bayangan, dan Jalur Tercepat." },
  { id: "campuran", label: "Battle Campuran", emoji: "🎲", desc: "Gabungan semua game non-adab secara acak." },
  { id: "keluarga", label: "Family Challenge", emoji: "👨‍👩‍👧", desc: "Kerja sama mencapai target skor bersama." },
];

const ROUND_OPTIONS = [
  { count: 3, label: "3 Ronde Cepat", desc: "Sekitar 5 menit" },
  { count: 5, label: "5 Ronde Standar", desc: "Sekitar 10 menit" },
  { count: 10, label: "10 Ronde Panjang", desc: "Sekitar 20 menit" },
];

const DIFFICULTY_OPTIONS: { id: DifficultyId; label: string; emoji: string }[] = [
  { id: "tk", label: "TK", emoji: "🧸" }, { id: "sd-bawah", label: "SD Bawah", emoji: "📘" },
  { id: "sd-atas", label: "SD Atas", emoji: "📗" }, { id: "smp", label: "SMP", emoji: "📙" },
  { id: "sma", label: "SMA", emoji: "📕" }, { id: "universitas", label: "Universitas", emoji: "🎓" },
];

export function BattleScreen({ profiles, onBack, backRef }: Props) {
  const { saveBattleHistory } = useGameStore();

  const [phase, setPhase] = useState<Phase>("select-players");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [battleCategory, setBattleCategory] = useState<BattleCategory>("campuran");
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [selectedMixedGameIds, setSelectedMixedGameIds] = useState<Set<string>>(new Set());
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);
  const [roundCount, setRoundCount] = useState(5);
  const [difficultyMode, setDifficultyMode] = useState<BattleDifficultyMode>("seimbang");
  const [setDifficulty, setSetDifficulty] = useState<DifficultyId>("sd-atas");

  const [session, setSession] = useState<BattleSession | null>(null);
  const [currentTurn, setCurrentTurn] = useState<BattleTurn | null>(null);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);

  // Gameplay state
  const [currentGame, setCurrentGame] = useState<BattleGameDefinition | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [questionData, setQuestionData] = useState<BattleQuestion | null>(null);
  const [choices, setChoices] = useState<BattleChoice[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<BattleChoice | null>(null);
  const [timerPaused, setTimerPaused] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [memoryPhase, setMemoryPhase] = useState(false);

  // Interactive game states (Jalur Tercepat, Ubah Posisi)
  const [fpUserPath, setFpUserPath] = useState<[number, number][]>([]);
  const [fpReachedGoal, setFpReachedGoal] = useState(false);
  const [upUserPos, setUpUserPos] = useState<{ row: number; col: number } | null>(null);
  const [upIsCorrect, setUpIsCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const turnStartRef = useRef(Date.now());
  const clearTimers = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const selectedPlayers = useMemo(() => profiles.filter(p => selectedPlayerIds.has(p.id)), [profiles, selectedPlayerIds]);
  const canProceed = selectedPlayerIds.size >= 2;

  const currentPlayer = useMemo(() => {
    if (!session) return null;
    const order = session.roundOrders[session.currentRound - 1];
    if (!order || session.currentTurnIndex >= order.length) return null;
    const pid = order[session.currentTurnIndex];
    return session.players.find(p => p.profileId === pid) || null;
  }, [session]);

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else if (next.size < 6) next.add(id);
      return next;
    });
  };

  // ── Start Battle ──
  const startBattle = () => {
    const players: BattlePlayer[] = selectedPlayers.map(p => ({
      profileId: p.id, profileName: p.name, avatar: p.avatar, difficulty: p.difficulty, level: p.level,
    }));
    const initialOrder = shuffleArray(players.map(p => p.profileId));
    const roundOrders = buildRoundOrders(initialOrder, roundCount);
    const scores: Record<string, number> = {};
    players.forEach(p => { scores[p.profileId] = 0; });

    const newSession: BattleSession = {
      id: crypto.randomUUID(),
      battleMode: battleCategory as any,
      players, roundCount, difficultyMode,
      setDifficulty: difficultyMode === "setara" ? setDifficulty : undefined,
      initialOrder, roundOrders,
      rounds: Array.from({ length: roundCount }, (_, i) => ({
        roundNumber: i + 1,
        gameType: battleCategory as any,
        order: roundOrders[i],
        turns: [],
        completed: false,
      })),
      currentRound: 1, currentTurnIndex: 0,
      scores, awards: [], winnerProfileId: "",
      status: "playing", startedAt: Date.now(), finishedAt: 0,
    };
    setSession(newSession);
    setShuffledOrder(initialOrder);
    setPhase("shuffle");
  };

  // ── Pick game for current round ──
  const pickGame = useCallback(() => {
    // Single game mode
    if (selectedGameId) {
      const g = BATTLE_GAME_POOL.find(bg => bg.gameId === selectedGameId);
      return g || getBattleGames("fokus-cepat")[0];
    }
    // Campuran with user-selected games
    if (battleCategory === "campuran") {
      const pool = BATTLE_GAME_POOL.filter(g => g.isBattleEnabled && !g.isAdabGame &&
        (selectedMixedGameIds.size === 0 || selectedMixedGameIds.has(g.gameId)));
      if (pool.length === 0) return getBattleGames("fokus-cepat")[0];
      // Avoid same game 3x in a row
      const recent = recentGameIds.slice(-2);
      const candidates = pool.filter(g => !recent.every(r => r === g.gameId));
      const chosen = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : pool[0];
      setRecentGameIds(prev => [...prev.slice(-9), chosen.gameId]);
      return chosen;
    }
    return pickGameForRound((session?.currentRound || 1) - 1, battleCategory);
  }, [battleCategory, session?.currentRound, selectedGameId, selectedMixedGameIds, recentGameIds]);

  // ── Start a turn ──
  const startTurn = useCallback(() => {
    if (!session || !currentPlayer) return;
    const round = session.rounds[session.currentRound - 1];
    const turnIdx = session.currentTurnIndex;
    if (turnIdx >= round.order.length) { setPhase("scoreboard"); return; }

    const diff = session.difficultyMode === "setara" && session.setDifficulty
      ? session.setDifficulty : currentPlayer.difficulty;
    const game = pickGame();
    setCurrentGame(game);

    const timeLimit = getBattleTimer(game.gameId, diff);
    const q = game.generateQuestion(diff);
    const ch = game.generateChoices(q.data.answer ?? q.data.correctIdx, diff);

    // Special handling for interactive games
    if (game.gameId === "jalur-tercepat") {
      setQuestionData(q);
      setFpUserPath([[q.data.start.row, q.data.start.col]]);
      setFpReachedGoal(false);
      setTimeLeft(q.data.timerLimit || timeLimit);
      turnStartRef.current = Date.now();
      clearTimers();
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearTimers(); return 0; } return t - 1; });
      }, 1000);
      setPhase("jalur-tercepat-play");
      return;
    }
    if (game.gameId === "ubah-posisi") {
      setQuestionData(q);
      setUpUserPos(null);
      setUpIsCorrect(null);
      setTimeLeft(timeLimit);
      turnStartRef.current = Date.now();
      clearTimers();
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearTimers(); return 0; } return t - 1; });
      }, 1000);
      setPhase("ubah-posisi-play");
      return;
    }
    if (game.gameId === "ingatan-cepat") {
      setQuestionData(q);
      setChoices(ch);
      setSelectedAnswer(null);
      setFeedbackText("");
      setMemoryPhase(true);
      setPhase("ingatan-memorize");
      return;
    }
    if (game.gameId === "rantai-warna") {
      // Interactive drag game — show instructions then play
      setQuestionData(q);
      setChoices([]);
      setTimeLeft(timeLimit);
      turnStartRef.current = Date.now();
      clearTimers();
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearTimers(); handleTimeout(); return 0; } return t - 1; });
      }, 1000);
      setPhase("rantai-warna-play");
      return;
    }
    if (game.gameId === "jalur-angka") {
      setQuestionData(q);
      setChoices([]);
      setTimeLeft(timeLimit);
      turnStartRef.current = Date.now();
      clearTimers();
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearTimers(); handleTimeout(); return 0; } return t - 1; });
      }, 1000);
      setPhase("jalur-angka-play");
      return;
    }

    setQuestionData(q);
    setChoices(ch);
    setSelectedAnswer(null);
    setFeedbackText("");
    setTimeLeft(timeLimit);
    setTimerPaused(false);
    turnStartRef.current = Date.now();

    clearTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearTimers(); handleTimeout(); return 0; } return t - 1; });
    }, 1000);

    setPhase("gameplay");
  }, [session, currentPlayer, pickGame, clearTimers]);

  // ── Handle timeout ──
  const handleTimeout = () => {
    setTimerPaused(true);
    setFeedbackText("⏰ Waktu habis! Tidak mendapat poin.");
    const turn: BattleTurn = createTurn(false, 0, null);
    setCurrentTurn(turn);
    setPhase("feedback");
  };

  const createTurn = (isCorrect: boolean, responseTimeMs: number, choice: BattleChoice | null): BattleTurn => {
    if (!currentGame || !questionData || !currentPlayer) return {} as BattleTurn;
    const diff = session!.difficultyMode === "setara" && session!.setDifficulty
      ? session!.setDifficulty : currentPlayer.difficulty;
    const score = currentGame.calculateScore(isCorrect, responseTimeMs, getBattleTimer(currentGame.gameId, diff) * 1000, diff, questionData, choice!);
    return {
      id: crypto.randomUUID(),
      roundNumber: session!.currentRound,
      profileId: currentPlayer.profileId,
      gameType: currentGame.gameId as any,
      questionData: { gameId: currentGame.gameId, ...questionData.data },
      shuffledChoices: choices,
      selectedAnswer: choice,
      correctAnswer: questionData.data.answer ?? questionData.data.correctIdx,
      isCorrect,
      responseTimeMs,
      baseScore: score.baseScore,
      speedBonus: score.speedBonus,
      difficultyBonus: score.difficultyBonus,
      finalScore: score.finalScore,
      feedback: currentGame.getFeedback(isCorrect, questionData, choice!),
      createdAt: Date.now(),
    };
  };

  // ── Handle answer ──
  const handleAnswer = (choice: BattleChoice) => {
    clearTimers();
    setTimerPaused(true);
    if (!currentGame || !questionData) return;
    const elapsed = Date.now() - turnStartRef.current;
    const isCorrect = currentGame.validateAnswer(questionData, choice);
    const fb = currentGame.getFeedback(isCorrect, questionData, choice);
    setSelectedAnswer(choice);
    setFeedbackText(fb);
    const turn = createTurn(isCorrect, elapsed, choice);
    setCurrentTurn(turn);
    setPhase("feedback");
  };

  // ── Jalur Tercepat handlers ──
  const fpClickCell = (row: number, col: number) => {
    if (!questionData || fpReachedGoal || !currentGame) return;
    const data = questionData.data;
    const [lr, lc] = fpUserPath[fpUserPath.length - 1];
    const dist = Math.abs(row - lr) + Math.abs(col - lc);
    if (dist > 1) { setFeedbackText("Pilih kotak yang bersebelahan."); return; }
    if (dist === 0) return;
    if (data.cells[row][col] === "🪵") { setFeedbackText("Tidak bisa melewati rintangan 🪵."); return; }
    if (fpUserPath.some(([r, c]) => r === row && c === col)) return;
    const newPath: [number, number][] = [...fpUserPath, [row, col]];
    setFpUserPath(newPath);
    if (data.cells[row][col] === "🍌") {
      clearTimers();
      setFpReachedGoal(true);
      const stepsUsed = newPath.length - 1;
      const shortestLen = data.shortestPathLength || 1;
      const efficiency = Math.min(1, shortestLen / Math.max(stepsUsed, 1));
      const timeBonus = Math.round(timeLeft * efficiency * 3);
      const stepScore = Math.round(150 * efficiency);
      const finalScore = 100 + timeBonus + stepScore;
      setFeedbackText(`Berhasil! +${finalScore} poin`);
      const fbChoice: BattleChoice = { value: { path: newPath, steps: stepsUsed }, label: "Jalur ditemukan" };
      const turn: BattleTurn = {
        id: crypto.randomUUID(), roundNumber: session!.currentRound,
        profileId: currentPlayer!.profileId, gameType: "jalur-tercepat" as any,
        questionData: { gameId: "jalur-tercepat", ...data },
        shuffledChoices: [], selectedAnswer: fbChoice, correctAnswer: data.shortestPath,
        isCorrect: true, responseTimeMs: Date.now() - turnStartRef.current,
        baseScore: 100, speedBonus: timeBonus, difficultyBonus: stepScore, finalScore,
        feedback: `Berhasil! ${stepsUsed} langkah (terpendek: ${shortestLen}). +${finalScore} poin`,
        createdAt: Date.now(),
      };
      setCurrentTurn(turn);
      setTimeout(() => setPhase("feedback"), 800);
    }
  };

  // ── Ubah Posisi handler ──
  const upClickCell = (row: number, col: number) => {
    if (!questionData || upIsCorrect !== null || !currentGame) return;
    const data = questionData.data;
    setUpUserPos({ row, col });
    const correct = row === data.correctEnd.row && col === data.correctEnd.col;
    setUpIsCorrect(correct);
    clearTimers();
    const elapsed = Date.now() - turnStartRef.current;
    const choice: BattleChoice = { value: { row, col }, label: `(${row},${col})` };
    const isCorrect = correct;
    const fb = isCorrect ? "✅ Posisi akhir tepat!" : "❌ Posisi belum tepat.";
    setFeedbackText(fb);
    const diff = session!.difficultyMode === "setara" && session!.setDifficulty
      ? session!.setDifficulty : currentPlayer!.difficulty;
    const score = currentGame.calculateScore(isCorrect, elapsed, getBattleTimer("ubah-posisi", diff) * 1000, diff, questionData, choice);
    const turn: BattleTurn = {
      id: crypto.randomUUID(), roundNumber: session!.currentRound,
      profileId: currentPlayer!.profileId, gameType: "ubah-posisi" as any,
      questionData: { gameId: "ubah-posisi", ...data },
      shuffledChoices: [], selectedAnswer: choice, correctAnswer: data.correctEnd,
      isCorrect, responseTimeMs: elapsed,
      baseScore: score.baseScore, speedBonus: score.speedBonus, difficultyBonus: score.difficultyBonus,
      finalScore: score.finalScore, feedback: fb, createdAt: Date.now(),
    };
    setCurrentTurn(turn);
    setTimeout(() => setPhase("feedback"), 800);
  };

  // ── Ingatan memorize → recall ──
  const startIngatanRecall = () => {
    if (!questionData || !currentPlayer) return;
    const diff = session!.difficultyMode === "setara" && session!.setDifficulty
      ? session!.setDifficulty : currentPlayer.difficulty;
    setTimeLeft(getBattleTimer("ingatan-cepat", diff));
    turnStartRef.current = Date.now();
    clearTimers();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearTimers(); handleTimeout(); return 0; } return t - 1; });
    }, 1000);
    setMemoryPhase(false);
    setPhase("ingatan-recall");
  };

  // ── Continue from feedback ──
  const handleContinueTurn = () => {
    if (!session || !currentTurn) return;
    const newSession = { ...session };
    const round = { ...newSession.rounds[session.currentRound - 1] };
    round.turns = [...round.turns, currentTurn];
    newSession.rounds = [...newSession.rounds];
    newSession.rounds[session.currentRound - 1] = round;
    newSession.scores = { ...newSession.scores };
    newSession.scores[currentTurn.profileId] = (newSession.scores[currentTurn.profileId] || 0) + currentTurn.finalScore;
    newSession.currentTurnIndex = session.currentTurnIndex + 1;
    setSession(newSession);
    setCurrentTurn(null);
    setPhase("turn-intro");
  };

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

  const advanceRound = () => {
    if (!session) return;
    if (session.currentRound >= session.roundCount) { finalizeBattle(session); return; }
    const newSession = { ...session };
    newSession.currentRound = session.currentRound + 1;
    newSession.currentTurnIndex = 0;
    setSession(newSession);
    setPhase("turn-intro");
  };

  const finalizeBattle = (sess: BattleSession) => {
    const allTurns = sess.rounds.flatMap(r => r.turns);
    const awards = calculateAwards(sess.players, sess.scores, allTurns);
    const winner = Object.entries(sess.scores).reduce((best, [id, score]) =>
      score > best.score ? { profileId: id, score } : best, { profileId: "", score: -1 });
    const finalSession: BattleSession = { ...sess, awards, winnerProfileId: winner.profileId, status: "finished", finishedAt: Date.now() };
    setSession(finalSession);
    setPhase("result");
    const winnerPlayer = sess.players.find(p => p.profileId === winner.profileId);
    saveBattleHistory({
      sessionId: finalSession.id, battleMode: finalSession.battleMode,
      players: finalSession.players,
      winner: { profileId: winner.profileId, profileName: winnerPlayer?.profileName || "", avatar: winnerPlayer?.avatar || "👤" },
      finalScores: finalSession.scores, awards, playedAt: Date.now(),
    });
  };

  // Back handler
  useEffect(() => {
    backRef.current = () => {
      if (phase === "gameplay" || phase === "jalur-tercepat-play" || phase === "ubah-posisi-play" || phase === "rantai-warna-play" || phase === "jalur-angka-play" || phase === "ingatan-recall") {
        clearTimers(); setPhase("turn-intro"); return true;
      }
      if (phase === "feedback") { handleContinueTurn(); return true; }
      if (phase === "scoreboard" || phase === "shuffle" || phase === "result") { onBack(); return true; }
      if (phase === "select-mode") { setPhase("select-players"); return true; }
      if (phase === "select-campuran-games") { setPhase("select-mode"); return true; }
      if (phase === "select-difficulty") { setPhase("select-rounds"); return true; }
      if (phase === "set-difficulty") { setPhase("select-difficulty"); return true; }
      if (phase === "select-players") { onBack(); return true; }
      return false;
    };
    return () => { backRef.current = null; };
  }, [backRef, phase, session, onBack, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (phase === "turn-intro" && session && session.currentTurnIndex >= session.roundOrders[session.currentRound - 1].length) {
      goToScoreboard();
    }
  }, [phase, session, goToScoreboard]);

  // ═══════════════════ RENDER HELPERS ═══════════════════
  const darkBg = "h-[100dvh] bg-gradient-to-b from-[#0A1628] via-[#1B3A5C] to-[#0F2847]";
  const header = (title: string, subtitle?: string, extra?: React.ReactNode) => (
    <header className="shrink-0 px-4 pt-safe mt-2 pb-3 flex items-center gap-3">
      <button onClick={() => backRef.current?.()} className="h-12 w-12 rounded-2xl bg-white/10 border-2 border-white/20 text-white grid place-items-center text-xl shrink-0 active:scale-95">←</button>
      <div className="flex-1"><h1 className="font-display font-black text-xl sm:text-2xl text-white">{title}</h1>{subtitle && <p className="text-xs text-white/60">{subtitle}</p>}</div>
      {extra}
    </header>
  );

  // ═══════════════════ RENDER: Select Players ═══════════════════
  if (phase === "select-players") return (
    <div className={`${darkBg} flex flex-col overflow-hidden`}>
      {header("Pilih Pemain", "Siapa yang ikut Battle hari ini?", <div className="text-2xl shrink-0">⚔️</div>)}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
        <div className="text-xs text-white/50 text-center mb-2">Pilih 2–6 pemain</div>
        {profiles.map(p => {
          const sel = selectedPlayerIds.has(p.id);
          return (
            <button key={p.id} onClick={() => togglePlayer(p.id)}
              className={`w-full rounded-2xl p-4 flex items-center gap-4 border-4 transition-all active:scale-[0.98] ${sel ? "bg-gradient-meadow/30 border-[#2E8B12]" : "bg-white/10 border-white/10"}`}>
              <AvatarPortrait avatar={p.avatar} className="h-14 w-14 rounded-2xl shrink-0" />
              <div className="flex-1 text-left min-w-0"><div className="font-display font-black text-lg text-white truncate">{p.name}</div><div className="text-xs text-white/60">Level {p.level} · {p.difficulty.toUpperCase()}</div></div>
              <div className={`h-8 w-8 rounded-full grid place-items-center text-lg shrink-0 ${sel ? "bg-[#2E8B12] text-white" : "bg-white/20 text-white/50"}`}>{sel ? "✓" : "+"}</div>
            </button>
          );
        })}
      </main>
      <div className="shrink-0 px-4 pb-safe pt-2 flex gap-3">
        <GameButton variant="ghost" size="md" onClick={onBack}>Kembali</GameButton>
        <GameButton variant="primary" size="md" full disabled={!canProceed} onClick={() => setPhase("select-mode")}>
          {canProceed ? `Lanjut (${selectedPlayerIds.size} pemain)` : "Pilih minimal 2 pemain"}
        </GameButton>
      </div>
    </div>
  );

  // ═══════════════════ RENDER: Select Game ═══════════════════
  if (phase === "select-mode") {
    const allBattleGames = BATTLE_GAME_POOL.filter(g => g.isBattleEnabled && !g.isAdabGame && g.battleCategory !== "keluarga");
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        {header("Pilih Game Battle", `${selectedPlayers.length} pemain`, <div className="text-2xl">🎮</div>)}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-2 pb-4">
          {/* Battle Campuran — always first */}
          <button onClick={() => {
            setBattleCategory("campuran");
            // Default: semua game dicentang
            setSelectedMixedGameIds(new Set(allBattleGames.map(g => g.gameId)));
            setPhase("select-campuran-games");
          }}
            className="w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] bg-gradient-to-r from-[#7B1FA2] to-[#E040FB] border-[#4A148C]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎲</span>
              <div className="flex-1 min-w-0"><div className="font-display font-black text-lg text-white">Battle Campuran</div><div className="text-xs text-white/80">Pilih game mana saja, sistem akan mengacak di setiap ronde.</div></div>
              <span className="text-lg">▶</span>
            </div>
          </button>
          {/* Individual game cards */}
          {allBattleGames.map(g => (
            <button key={g.gameId} onClick={() => { setSelectedGameId(g.gameId); setBattleCategory(g.battleCategory || "fokus-cepat"); setPhase("select-rounds"); }}
              className="w-full rounded-2xl p-3 text-left border-2 transition-all active:scale-[0.98] bg-white/5 border-white/10 hover:border-[#185E9F]/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.emoji}</span>
                <div className="flex-1 min-w-0"><div className="font-display font-black text-base text-white">{g.title}</div><div className="text-[10px] text-white/50">{g.packageId}</div></div>
                <span className="text-white/30">▶</span>
              </div>
            </button>
          ))}
        </main>
        <div className="shrink-0 px-4 pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={() => setPhase("select-players")}>Kembali</GameButton></div>
      </div>
    );
  }

  // ═══════════════════ RENDER: Select Rounds ═══════════════════
  if (phase === "select-rounds") return (
    <div className={`${darkBg} flex flex-col overflow-hidden`}>
      {header("Jumlah Ronde", undefined, <div className="text-2xl">🔢</div>)}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
        {ROUND_OPTIONS.map(opt => (
          <button key={opt.count} onClick={() => { setRoundCount(opt.count); setPhase("select-difficulty"); }}
            className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${roundCount === opt.count ? "bg-gradient-coin/30 border-[#D48806]" : "bg-white/10 border-white/10"}`}>
            <div className="font-display font-black text-lg text-white">{opt.label}</div><div className="text-xs text-white/60">{opt.desc}</div>
          </button>
        ))}
      </main>
      <div className="shrink-0 px-4 pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={() => setPhase("select-mode")}>Kembali</GameButton></div>
    </div>
  );

  // ═══════════════════ RENDER: Select Difficulty ═══════════════════
  if (phase === "select-difficulty") return (
    <div className={`${darkBg} flex flex-col overflow-hidden`}>
      {header("Sistem Difficulty", undefined, <div className="text-2xl">⚖️</div>)}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
        <button onClick={() => { setDifficultyMode("seimbang"); startBattle(); }}
          className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${difficultyMode === "seimbang" ? "bg-gradient-meadow/30 border-[#2E8B12]" : "bg-white/10 border-white/10"}`}>
          <div className="flex items-center gap-3"><span className="text-3xl">🎯</span><div><div className="font-display font-black text-lg text-white">Mode Seimbang</div><div className="text-xs text-white/60">Soal menyesuaikan difficulty masing-masing.</div></div></div>
        </button>
        <button onClick={() => setPhase("set-difficulty")}
          className={`w-full rounded-2xl p-4 text-left border-4 transition-all active:scale-[0.98] ${difficultyMode === "setara" ? "bg-gradient-blue/30 border-[#185E9F]" : "bg-white/10 border-white/10"}`}>
          <div className="flex items-center gap-3"><span className="text-3xl">⚖️</span><div><div className="font-display font-black text-lg text-white">Mode Setara</div><div className="text-xs text-white/60">Semua pemain dapat soal level sama.</div></div></div>
        </button>
      </main>
      <div className="shrink-0 px-4 pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={() => setPhase("select-rounds")}>Kembali</GameButton></div>
    </div>
  );

  // ═══════════════════ RENDER: Set Difficulty ═══════════════════
  if (phase === "set-difficulty") return (
    <div className={`${darkBg} flex flex-col overflow-hidden`}>
      {header("Pilih Tingkat")}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
        {DIFFICULTY_OPTIONS.map(d => (
          <button key={d.id} onClick={() => { setSetDifficulty(d.id); startBattle(); }}
            className={`w-full rounded-2xl p-4 flex items-center gap-4 border-4 transition-all active:scale-[0.98] ${setDifficulty === d.id ? "bg-gradient-coin/30 border-[#D48806]" : "bg-white/10 border-white/10"}`}>
            <span className="text-3xl">{d.emoji}</span><span className="font-display font-black text-lg text-white">{d.label}</span>
          </button>
        ))}
      </main>
      <div className="shrink-0 px-4 pb-safe pt-2"><GameButton variant="ghost" size="md" full onClick={() => setPhase("select-difficulty")}>Kembali</GameButton></div>
    </div>
  );

  // ═══════════════════ RENDER: Select Campuran Games ═══════════════════
  if (phase === "select-campuran-games") {
    const allBattleGames = BATTLE_GAME_POOL.filter(g => g.isBattleEnabled && !g.isAdabGame && g.battleCategory !== "keluarga");
    const cepatGames = allBattleGames.filter(g => g.battleCategory === "fokus-cepat");
    const logikaGames = allBattleGames.filter(g => g.battleCategory === "logika");
    const spasialGames = allBattleGames.filter(g => g.battleCategory === "spasial");
    const numerasiGames = allBattleGames.filter(g => ["hitung-kilat","kode-warna","jalur-angka"].includes(g.gameId));
    const toggleGame = (id: string) => {
      setSelectedMixedGameIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    };
    const selectPreset = (ids: string[]) => setSelectedMixedGameIds(new Set(ids));
    const canStart = selectedMixedGameIds.size >= 2;
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        {header("Pilih Game Campuran", `${selectedMixedGameIds.size} game dipilih`, <div className="text-2xl">🎲</div>)}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => selectPreset(allBattleGames.map(g => g.gameId))} className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-bold active:scale-95">✅ Pilih Semua</button>
            <button onClick={() => setSelectedMixedGameIds(new Set())} className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-bold active:scale-95">🗑 Hapus Semua</button>
            <button onClick={() => selectPreset(cepatGames.map(g => g.gameId))} className="px-3 py-1.5 rounded-full bg-[#2196F3]/30 text-white text-[10px] font-bold active:scale-95">⚡ Cepat</button>
            <button onClick={() => selectPreset(spasialGames.map(g => g.gameId))} className="px-3 py-1.5 rounded-full bg-[#4CAF50]/30 text-white text-[10px] font-bold active:scale-95">🔷 Visual</button>
            <button onClick={() => selectPreset(logikaGames.map(g => g.gameId))} className="px-3 py-1.5 rounded-full bg-[#9C27B0]/30 text-white text-[10px] font-bold active:scale-95">🧠 Logika</button>
            <button onClick={() => selectPreset(numerasiGames.map(g => g.gameId))} className="px-3 py-1.5 rounded-full bg-[#FF9800]/30 text-white text-[10px] font-bold active:scale-95">🔢 Numerasi</button>
          </div>
          {allBattleGames.map(g => (
            <button key={g.gameId} onClick={() => toggleGame(g.gameId)}
              className={`w-full rounded-2xl p-3 text-left border-2 transition-all active:scale-[0.98] flex items-center gap-3 ${selectedMixedGameIds.has(g.gameId) ? "bg-white/15 border-[#185E9F]" : "bg-white/5 border-white/10 opacity-60"}`}>
              <div className={`w-6 h-6 rounded-lg grid place-items-center border-2 text-sm ${selectedMixedGameIds.has(g.gameId) ? "bg-[#2E8B12] border-[#2E8B12] text-white" : "border-white/30"}`}>
                {selectedMixedGameIds.has(g.gameId) ? "✓" : ""}
              </div>
              <span className="text-xl">{g.emoji}</span>
              <span className="font-display font-black text-sm text-white flex-1">{g.title}</span>
            </button>
          ))}
        </main>
        <div className="shrink-0 px-4 pb-safe pt-2 space-y-2">
          {!canStart && <p className="text-xs text-[#FF9800] text-center font-bold">Pilih minimal 2 game untuk Battle Campuran.</p>}
          <div className="flex gap-2">
            <GameButton variant="ghost" size="md" onClick={() => setPhase("select-mode")}>Kembali</GameButton>
            <GameButton variant="primary" size="md" disabled={!canStart} onClick={() => setPhase("select-rounds")}>Lanjut 🎲</GameButton>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════ RENDER: Shuffle ═══════════════════
  if (phase === "shuffle") {
    const playerMap = new Map((session?.players || []).map(p => [p.profileId, p]));
    return (
      <div className={`${darkBg} flex flex-col items-center justify-center p-4`}>
        <div className="text-6xl mb-4 animate-bob">🎲</div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">Urutan Ronde Pertama</h1>
        <div className="w-full max-w-sm space-y-3 mb-8">
          {shuffledOrder.map((pid, i) => {
            const p = playerMap.get(pid); if (!p) return null;
            return <div key={pid} className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 border-2 border-white/20"><div className="h-10 w-10 rounded-full bg-gradient-blue grid place-items-center text-white font-black text-sm">{i + 1}</div><AvatarPortrait avatar={p.avatar} className="w-10 h-10 rounded-full" /><div className="font-display font-black text-lg text-white">{p.profileName}</div></div>;
          })}
        </div>
        <GameButton variant="primary" size="lg" onClick={() => setPhase("turn-intro")}>⚡ Mulai Ronde 1</GameButton>
      </div>
    );
  }

  // ═══════════════════ RENDER: Turn Intro ═══════════════════
  if (phase === "turn-intro") {
    if (!currentPlayer) { setTimeout(() => goToScoreboard(), 0); return null; }
    const game = pickGame();
    return (
      <div className={`${darkBg} flex flex-col items-center justify-center p-4`}>
        <GameCard tone="blue" className="text-center w-full max-w-sm p-8 text-white">
          <div className="text-3xl mb-3">{game.emoji}</div>
          <div className="text-xs uppercase font-bold opacity-60 mb-2">Ronde {session!.currentRound} · {game.title}</div>
          <AvatarPortrait avatar={currentPlayer.avatar} className="w-16 h-16 rounded-full mx-auto mb-3" />
          <h1 className="font-display font-black text-3xl mb-1">Giliran {currentPlayer.profileName}</h1>
          <p className="text-sm font-bold opacity-80 mb-4">Skor: {session!.scores[currentPlayer.profileId] || 0}</p>
          <GameButton variant="primary" size="lg" full onClick={startTurn}>💪 Saya Siap!</GameButton>
        </GameCard>
      </div>
    );
  }

  // ═══════════════════ RENDER: Ingatan Memorize ═══════════════════
  if (phase === "ingatan-memorize") return (
    <div className={`${darkBg} flex flex-col items-center justify-center p-4`}>
      <GameCard tone="blue" className="text-center w-full max-w-sm p-6 text-white">
        <div className="text-6xl mb-4">👀</div>
        <h2 className="font-display font-black text-2xl mb-2">Hafalkan!</h2>
        <div className="flex justify-center flex-wrap gap-3 text-5xl mb-6">{questionData?.data?.items?.map((item: string, i: number) => <span key={i} className="drop-shadow-lg">{item}</span>)}</div>
        <GameButton variant="primary" size="md" full onClick={startIngatanRecall}>🧠 Aku Siap!</GameButton>
      </GameCard>
    </div>
  );

  // ═══════════════════ RENDER: Ingatan Recall ═══════════════════
  if (phase === "ingatan-recall") {
    const timerPercent = (timeLeft / (getBattleTimer("ingatan-cepat", currentPlayer?.difficulty || "sd-atas") || 5)) * 100;
    return (
      <div className={`${darkBg} flex flex-col p-3 sm:p-4`}>
        <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm flex items-center gap-2"><AvatarPortrait avatar={currentPlayer?.avatar || ""} className="w-6 h-6 rounded-full" />{currentPlayer?.profileName}</div>
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm ml-auto">Ronde {session!.currentRound}</div>
        </header>
        <div className="h-3 rounded-full bg-white/10 mb-4 shrink-0 overflow-hidden"><div className="h-full rounded-full transition-all bg-green-400" style={{ width: `${timerPercent}%` }} /></div>
        <main className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm">
            {choices.map((c, i) => (
              <button key={i} onClick={() => handleAnswer(c)} className="h-16 sm:h-20 rounded-2xl bg-white border-4 border-[#CBB794] grid place-items-center text-3xl shadow-pop active:translate-y-[4px]">{c.label}</button>
            ))}
          </div>
        </main>
        <div className="text-center text-xs text-white/40 pt-2">⏱ {timeLeft}s</div>
      </div>
    );
  }

  // ═══════════════════ RENDER: Gameplay (multiple choice) ═══════════════════
  if (phase === "gameplay") {
    const timerPercent = (timeLeft / (getBattleTimer(currentGame?.gameId || "hitung-kilat", currentPlayer?.difficulty || "sd-atas") || 7)) * 100;
    const timerColor = timeLeft <= 2 ? "#A02020" : timeLeft <= 4 ? "#D48806" : "#2E8B12";
    const gridCols = choices.length <= 4 ? "grid-cols-2" : "grid-cols-3";
    const gameType = currentGame?.gameId || "";

    return (
      <div className={`${darkBg} flex flex-col p-3 sm:p-4`}>
        <header className="pt-safe flex items-center gap-2 mb-3 shrink-0">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm flex items-center gap-2"><AvatarPortrait avatar={currentPlayer?.avatar || ""} className="w-6 h-6 rounded-full" />{currentPlayer?.profileName}</div>
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-sm ml-auto">Ronde {session!.currentRound}</div>
        </header>
        <div className="h-3 rounded-full bg-white/10 mb-4 shrink-0 overflow-hidden"><div className="h-full rounded-full transition-all duration-100" style={{ width: `${timerPercent}%`, backgroundColor: timerColor }} /></div>
        <main className="flex-1 flex flex-col items-center justify-center min-h-0">
          <GameCard tone="cream" className="w-full max-w-sm text-center py-6 mb-4 border-4 shrink-0">
            {gameType === "hitung-kilat" && <div className="font-display font-black text-5xl sm:text-6xl text-[#5A3515]">{questionData?.data?.display}</div>}
            {gameType === "pola-kilat" && <><div className="text-xs font-bold text-[#8C6B45] mb-3 uppercase">Apa selanjutnya?</div><div className="flex justify-center items-center gap-1 sm:gap-2 text-3xl flex-wrap">{questionData?.data?.seq?.map((e: string, i: number) => <span key={i}>{e}</span>)}<span className="text-[#A02020] font-black text-4xl ml-1">?</span></div></>}
            {(gameType === "detektif-petunjuk" || gameType === "tebak-aturan" || gameType === "pilih-kesimpulan") && <><div className="text-xs font-bold uppercase text-[#8C6B45] mb-2">{gameType === "detektif-petunjuk" ? "🕵️ Detektif" : gameType === "tebak-aturan" ? "📐 Tebak Aturan" : "💡 Kesimpulan"}</div><p className="font-bold text-base sm:text-lg text-[#5A3515] leading-snug px-2">{questionData?.data?.prompt}</p></>}
            {gameType === "benar-atau-salah" && <><div className="text-xs font-bold uppercase text-[#8C6B45] mb-2">✅ Benar atau Salah?</div><p className="font-bold text-base sm:text-lg text-[#5A3515] leading-snug px-2">{questionData?.data?.text}</p></>}
            {gameType === "kode-warna" && <><div className="text-xs font-bold uppercase text-[#8C6B45] mb-2">🎨 Kode Warna</div><p className="text-sm text-[#5A3515]">Temukan pola yang benar!</p></>}
            {gameType === "cari-yang-berbeda" && <><div className="text-xs font-bold uppercase text-[#8C6B45] mb-2">👁️ Cari yang Berbeda</div><p className="text-sm text-[#5A3515]">Mana yang berbeda dari yang lain?</p></>}
            {gameType === "cocokkan-bayangan" && <><div className="text-xs font-bold uppercase text-[#8C6B45] mb-2">👤 Cocokkan Bayangan</div><div className="text-6xl mb-2">{questionData?.data?.targetEmoji}</div><p className="text-sm text-[#5A3515]">Pilih yang sama!</p></>}
          </GameCard>
          <div className={`grid ${gridCols} gap-2 sm:gap-3 w-full max-w-sm`}>
            {choices.map((c, i) => (
              <button key={i} onClick={() => handleAnswer(c)}
                className={`h-16 sm:h-20 rounded-2xl bg-white border-4 border-[#CBB794] text-[#5A3515] font-display font-black text-lg sm:text-xl shadow-pop active:translate-y-[4px] transition-all ${gameType === "benar-atau-salah" ? "text-2xl" : ""}`}>
                {c.label}
              </button>
            ))}
          </div>
        </main>
        <div className="text-center text-xs text-white/40 pt-2">⏱ {timeLeft}s</div>
      </div>
    );
  }

  // ═══════════════════ RENDER: Jalur Tercepat Play ═══════════════════
  if (phase === "jalur-tercepat-play" && questionData) {
    const data = questionData.data;
    const isPathCell = (r: number, c: number) => fpUserPath.some(([pr, pc]) => pr === r && pc === c);
    const isUserPos = (r: number, c: number) => fpUserPath.length > 0 && fpUserPath[fpUserPath.length - 1][0] === r && fpUserPath[fpUserPath.length - 1][1] === c;
    const timerPercent = (timeLeft / (data.timerLimit || 25)) * 100;
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        <header className="shrink-0 pt-safe mt-1 px-2 flex items-center gap-2">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-xs flex items-center gap-2"><AvatarPortrait avatar={currentPlayer?.avatar || ""} className="w-5 h-5 rounded-full" />{currentPlayer?.profileName}</div>
          <div className="flex-1 text-center font-black text-white text-xs">{currentGame?.title || "Jalur Tercepat"}</div>
          <div className="bg-white/10 px-2 py-1 rounded-full font-black text-white text-xs">⏱{timeLeft}s</div>
        </header>
        <div className="shrink-0 h-1.5 bg-white/10 mx-2 rounded-full overflow-hidden"><div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${timerPercent}%` }} /></div>
        <main className="flex-1 min-h-0 flex items-center justify-center p-1">
          <div className="w-[95vw] max-w-[600px] h-full max-h-[85vh] flex items-center justify-center">
            <div className="grid gap-0.5 w-full h-full" style={{ gridTemplateColumns: `repeat(${FP_COLS || 6}, 1fr)`, gridTemplateRows: `repeat(${FP_ROWS || 16}, 1fr)` }}>
              {data.cells.map((row: string[], ri: number) =>
                row.map((cell: string, ci: number) => {
                  const isStart = ri === data.start.row && ci === data.start.col;
                  const isGoal = ri === data.goal.row && ci === data.goal.col;
                  const isBlocked = cell === "🪵";
                  const isPath = isPathCell(ri, ci);
                  const isCurrent = isUserPos(ri, ci);
                  let bg = "bg-white/50";
                  if (isStart || isGoal) bg = "bg-[#FFE0B2]";
                  if (isBlocked) bg = "bg-[#795548]/50";
                  if (isPath && !isStart && !isGoal) bg = "bg-[#A5D6A7]";
                  if (isCurrent && !isStart && !isGoal) bg = "bg-[#81C784]";
                  return (
                    <button key={`${ri}-${ci}`} onClick={() => fpClickCell(ri, ci)} disabled={fpReachedGoal}
                      className={`rounded-[3px] grid place-items-center text-sm sm:text-lg select-none ${bg} ${!fpReachedGoal && !isBlocked ? "active:scale-90" : ""} ${isBlocked ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <span className="leading-none">{cell}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </main>
        <footer className="shrink-0 px-2 pb-safe pt-1 flex gap-2 items-center">
          <div className="bg-white/20 px-3 h-9 rounded-xl flex items-center font-black text-xs text-white">📏 {fpUserPath.length - 1} langkah</div>
          {fpReachedGoal && <div className="flex-1 text-center font-black text-green-300 text-sm">{feedbackText}</div>}
        </footer>
      </div>
    );
  }

  // ═══════════════════ RENDER: Ubah Posisi Play ═══════════════════
  if (phase === "ubah-posisi-play" && questionData) {
    const data = questionData.data;
    const dirEmoji: Record<string, string> = { right: "➡️", left: "⬅️", up: "⬆️", down: "⬇️" };
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        <header className="shrink-0 pt-safe mt-1 px-2 flex items-center gap-2">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-xs flex items-center gap-2"><AvatarPortrait avatar={currentPlayer?.avatar || ""} className="w-5 h-5 rounded-full" />{currentPlayer?.profileName}</div>
          <div className="flex-1 text-center font-black text-white text-xs">Ubah Posisi</div>
          <div className="bg-white/10 px-2 py-1 rounded-full font-black text-white text-xs">⏱{timeLeft}s</div>
        </header>
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-2">
          <div className="flex items-center gap-2 text-xl sm:text-2xl mb-3 flex-wrap justify-center">
            <span className="text-3xl">🍎</span>
            {data.moves?.map((m: any, i: number) => <span key={i} className="text-white font-black">{dirEmoji[m.direction] || m.direction}×{m.steps}</span>)}
            <span className="text-[#A02020] font-black text-3xl">?</span>
          </div>
          <div className="grid grid-cols-10 gap-0.5 w-[min(95vw,400px)] aspect-square mb-3">
            {Array.from({ length: 100 }, (_, i) => {
              const r = Math.floor(i / 10), c = i % 10;
              const isStart = r === data.start.row && c === data.start.col;
              const isUser = upUserPos?.row === r && upUserPos?.col === c;
              const isCorrectEnd = upIsCorrect !== null && r === data.correctEnd.row && c === data.correctEnd.col;
              let bg = "bg-white/30";
              if (isStart) bg = "bg-green-400/60";
              if (isUser) bg = upIsCorrect ? "bg-green-400" : "bg-red-400/60";
              if (isCorrectEnd && upIsCorrect !== null) bg = "bg-green-400 ring-2 ring-yellow-400";
              return (
                <button key={i} onClick={() => upClickCell(r, c)} disabled={upIsCorrect !== null}
                  className={`rounded-[2px] text-[8px] sm:text-xs select-none ${bg} ${upIsCorrect === null ? "active:scale-90" : ""}`}>
                  {isStart ? "🍎" : isUser ? "📍" : ""}
                </button>
              );
            })}
          </div>
          {upIsCorrect !== null && <div className={`text-sm font-black px-4 py-2 rounded-xl ${upIsCorrect ? "bg-green-500/30 text-green-300" : "bg-red-500/30 text-red-300"}`}>{feedbackText}</div>}
        </main>
      </div>
    );
  }

  // ═══════════════════ RENDER: Rantai Warna Play (Battle) ═══════════════════
  if (phase === "rantai-warna-play" && questionData) {
    const data = questionData.data;
    const seq = data.sequence || [];
    const dist = data.displayOrder || [];
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        <header className="shrink-0 pt-safe mt-1 px-2 flex items-center gap-2">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-xs flex items-center gap-2"><AvatarPortrait avatar={currentPlayer?.avatar || ""} className="w-5 h-5 rounded-full" />{currentPlayer?.profileName}</div>
          <div className="flex-1 text-center font-black text-white text-xs">Rantai Warna</div>
          <div className="bg-white/10 px-2 py-1 rounded-full font-black text-white text-xs">⏱{timeLeft}s</div>
        </header>
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-3 gap-4">
          <p className="text-white/80 text-xs text-center">Hubungkan warna sesuai urutan:</p>
          <div className="flex gap-3 text-3xl">{seq.map((c: any, i: number) => <span key={i} className="bg-white/10 rounded-xl px-3 py-2">{c.emoji}</span>)}</div>
          <p className="text-white/60 text-xs">Tersedia:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {dist.map((c: any, i: number) => (
              <button key={i} onClick={() => {
                clearTimers();
                const elapsed = Date.now() - turnStartRef.current;
                const correct = c.name === seq[0]?.name;
                const fb = correct ? "✅ Rantai warna tersambung!" : "❌ Rantai belum tepat.";
                setFeedbackText(fb);
                const diffScore = currentGame?.calculateScore(correct, elapsed, getBattleTimer("rantai-warna", currentPlayer?.difficulty || "sd-atas") * 1000, currentPlayer?.difficulty || "sd-atas", questionData, { value: c, label: c.emoji }) || { baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 };
                const turn: BattleTurn = { id: crypto.randomUUID(), roundNumber: session!.currentRound, profileId: currentPlayer!.profileId, gameType: "rantai-warna" as any, questionData: data, shuffledChoices: [], selectedAnswer: { value: c, label: c.emoji }, correctAnswer: seq[0], isCorrect: correct, responseTimeMs: elapsed, baseScore: diffScore.baseScore, speedBonus: diffScore.speedBonus, difficultyBonus: diffScore.difficultyBonus, finalScore: diffScore.finalScore, feedback: fb, createdAt: Date.now() };
                setCurrentTurn(turn);
                setTimeout(() => setPhase("feedback"), 700);
              }} className="bg-white/10 rounded-2xl px-5 py-4 text-3xl active:scale-90 transition-transform">{c.emoji}</button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════ RENDER: Jalur Angka Play (Battle) ═══════════════════
  if (phase === "jalur-angka-play" && questionData) {
    const data = questionData.data;
    const display = data.display || "";
    const [userAnswer, setUserAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = () => {
      if (submitted) return;
      clearTimers();
      setSubmitted(true);
      const elapsed = Date.now() - turnStartRef.current;
      // Check if all hidden values are correct by parsing the equation
      const expectedTarget = data.target;
      // Simple check: if user fills all blanks, verify final result
      const correct = Number(userAnswer) === expectedTarget;
      const fb = correct ? "✅ Jalur angka benar!" : `❌ Hasil seharusnya ${expectedTarget}.`;
      setFeedbackText(fb);
      const diffScore = currentGame?.calculateScore(correct, elapsed, getBattleTimer("jalur-angka", currentPlayer?.difficulty || "sd-atas") * 1000, currentPlayer?.difficulty || "sd-atas", questionData, { value: userAnswer, label: userAnswer }) || { baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 };
      const turn: BattleTurn = { id: crypto.randomUUID(), roundNumber: session!.currentRound, profileId: currentPlayer!.profileId, gameType: "jalur-angka" as any, questionData: data, shuffledChoices: [], selectedAnswer: { value: userAnswer, label: userAnswer }, correctAnswer: String(expectedTarget), isCorrect: correct, responseTimeMs: elapsed, baseScore: diffScore.baseScore, speedBonus: diffScore.speedBonus, difficultyBonus: diffScore.difficultyBonus, finalScore: diffScore.finalScore, feedback: fb, createdAt: Date.now() };
      setCurrentTurn(turn);
      setTimeout(() => setPhase("feedback"), 900);
    };
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        <header className="shrink-0 pt-safe mt-1 px-2 flex items-center gap-2">
          <div className="bg-white/10 px-3 py-1.5 rounded-full font-black text-white text-xs flex items-center gap-2"><AvatarPortrait avatar={currentPlayer?.avatar || ""} className="w-5 h-5 rounded-full" />{currentPlayer?.profileName}</div>
          <div className="flex-1 text-center font-black text-white text-xs">Jalur Angka ⚡</div>
          <div className="bg-white/10 px-2 py-1 rounded-full font-black text-white text-xs">⏱{timeLeft}s</div>
        </header>
        <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-3 gap-4">
          <p className="text-white/80 text-xs text-center">Isi jawaban akhir dari jalur angka:</p>
          <div className="bg-white/10 rounded-2xl px-5 py-3 font-mono font-black text-lg text-white text-center">{display}</div>
          <p className="text-white/60 text-xs">Masukkan hasil akhir:</p>
          <input type="number" inputMode="numeric" value={userAnswer} onChange={e => setUserAnswer(e.target.value)} disabled={submitted}
            className="w-32 text-center py-3 rounded-xl bg-white/20 border-2 border-white/30 text-white font-black text-2xl outline-none" />
          <button onClick={handleSubmit} disabled={submitted || userAnswer.trim() === ""}
            className="px-8 py-3 rounded-xl bg-gradient-meadow border-b-3 border-[#2E8B12] text-white font-black text-base active:translate-y-0.5 transition-all disabled:opacity-40">
            {submitted ? "Diproses..." : "✓ Periksa"}
          </button>
          {submitted && <div className="text-sm font-black px-4 py-2 rounded-xl bg-white/10">{feedbackText}</div>}
        </main>
      </div>
    );
  }

  // ═══════════════════ RENDER: Feedback ═══════════════════
  if (phase === "feedback") {
    const isCorrect = currentTurn?.isCorrect;
    return (
      <div className={`${darkBg} flex flex-col items-center justify-center p-4`}>
        <GameCard tone={isCorrect ? "meadow" : "wood"} className="text-center w-full max-w-sm p-6 text-white">
          <div className="text-6xl mb-3">{isCorrect ? "🎉" : "💪"}</div>
          <h2 className="font-display font-black text-2xl mb-2">{isCorrect ? "Jawaban Tepat!" : "Semangat Terus!"}</h2>
          {feedbackText && <div className="bg-black/20 rounded-2xl p-4 mb-4 text-sm leading-relaxed">{feedbackText}</div>}
          {isCorrect && <div className="text-yellow-300 font-black text-xl mb-4">+{currentTurn?.finalScore} poin</div>}
          <GameButton variant="primary" size="md" full onClick={handleContinueTurn}>Pemain Berikutnya →</GameButton>
        </GameCard>
      </div>
    );
  }

  // ═══════════════════ RENDER: Scoreboard ═══════════════════
  if (phase === "scoreboard") {
    const sorted = [...(session?.players || [])].sort((a, b) => (session?.scores[b.profileId] || 0) - (session?.scores[a.profileId] || 0));
    const isLastRound = session!.currentRound >= session!.roundCount;
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        {header(`Ronde ${session!.currentRound} Selesai!`, undefined, <div className="text-2xl">📊</div>)}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-2 pb-4">
          {sorted.map((p, i) => {
            const roundScore = session?.rounds[session.currentRound - 1]?.turns.filter(t => t.profileId === p.profileId).reduce((s, t) => s + t.finalScore, 0) || 0;
            return (
              <div key={p.profileId} className={`rounded-2xl p-4 flex items-center gap-4 border-2 ${i === 0 ? "bg-gradient-coin/20 border-[#D48806]" : "bg-white/10 border-white/10"}`}>
                <div className="text-2xl font-black w-10 text-center shrink-0 text-white">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</div>
                <AvatarPortrait avatar={p.avatar} className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0"><div className="font-bold text-white truncate">{p.profileName}</div><div className="text-xs text-white/50">Ronde ini: +{roundScore}</div></div>
                <div className="font-display font-black text-xl text-white text-right shrink-0">{session?.scores[p.profileId] || 0}</div>
              </div>
            );
          })}
        </main>
        <div className="shrink-0 px-4 pb-safe pt-2 space-y-2">
          <GameButton variant="primary" size="lg" full onClick={advanceRound}>{isLastRound ? "🏆 Lihat Hasil Akhir" : "Lanjut Ronde Berikutnya →"}</GameButton>
        </div>
      </div>
    );
  }

  // ═══════════════════ RENDER: Final Result ═══════════════════
  if (phase === "result") {
    if (session && (session.battleMode as string) === "keluarga") {
      const totalScore = Object.values(session.scores || {}).reduce((a, b) => a + b, 0);
      const target = Math.round((session.players.length * session.roundCount * 100) * 1.0);
      const achieved = totalScore >= target;
      return (
        <div className={`${darkBg} flex flex-col overflow-hidden`}>
          <header className="shrink-0 px-4 pt-safe mt-2 pb-3 text-center"><div className="text-6xl mb-2">{achieved ? "🎉" : "💪"}</div><h1 className="font-display font-black text-2xl sm:text-3xl text-white">{achieved ? "Target Tercapai!" : "Hampir Tercapai!"}</h1></header>
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
            <div className="rounded-2xl bg-white/10 border-2 border-white/20 p-5 text-center"><div className="font-display font-black text-4xl text-yellow-300">{totalScore}</div><div className="text-xs text-white/50 mt-1">Target: {target}</div></div>
            {(session?.players || []).map(p => <div key={p.profileId} className="rounded-2xl bg-white/10 p-3 flex items-center gap-3"><AvatarPortrait avatar={p.avatar} className="w-8 h-8 rounded-full" /><div className="flex-1 text-white font-bold text-sm">{p.profileName}</div><div className="font-black text-lg text-white">{session?.scores[p.profileId] || 0}</div></div>)}
          </main>
          <div className="shrink-0 px-4 pb-safe pt-2 flex gap-3"><GameButton variant="ghost" size="md" onClick={onBack}>🏠 Home</GameButton><GameButton variant="primary" size="md" full onClick={() => { setPhase("select-players"); setSelectedPlayerIds(new Set()); setSession(null); }}>👨‍👩‍👧 Main Lagi</GameButton></div>
        </div>
      );
    }

    const sorted = [...(session?.players || [])].sort((a, b) => (session?.scores[b.profileId] || 0) - (session?.scores[a.profileId] || 0));
    const winner = session?.players.find(p => p.profileId === session?.winnerProfileId);
    return (
      <div className={`${darkBg} flex flex-col overflow-hidden`}>
        <header className="shrink-0 px-4 pt-safe mt-2 pb-3 text-center"><div className="text-5xl mb-2">👑</div><h1 className="font-display font-black text-2xl sm:text-3xl text-yellow-300">Pemenang Battle!</h1></header>
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 space-y-3 pb-4">
          {winner && <div className="rounded-2xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 border-2 border-yellow-400/50 p-5 text-center"><AvatarPortrait avatar={winner.avatar} className="w-20 h-20 rounded-full mx-auto mb-2" /><div className="font-display font-black text-2xl text-yellow-300">{winner.profileName}</div><div className="text-3xl font-black text-white mt-1">{session?.scores[winner.profileId]} poin</div></div>}
          {sorted.map((p, i) => (
            <div key={p.profileId} className={`rounded-2xl p-3 flex items-center gap-3 border-2 ${i === 0 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-white/5 border-white/10"}`}>
              <div className="text-xl font-black w-8 text-center shrink-0 text-white">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</div>
              <AvatarPortrait avatar={p.avatar} className="w-8 h-8 rounded-full shrink-0" /><div className="flex-1 min-w-0"><div className="font-bold text-white truncate text-sm">{p.profileName}</div></div>
              <div className="font-black text-lg text-white shrink-0">{session?.scores[p.profileId]}</div>
            </div>
          ))}
          {session?.awards && session.awards.length > 0 && (
            <div><h3 className="font-display font-black text-sm text-white/60 uppercase mb-2">Penghargaan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{session.awards.map((a, i) => <div key={i} className="rounded-2xl bg-white/10 border border-white/10 p-3 flex items-center gap-2"><span className="text-2xl">{a.emoji}</span><div className="min-w-0"><div className="font-bold text-white text-xs truncate">{a.profileName}</div><div className="text-xs text-yellow-300 font-bold">{a.award}</div></div></div>)}</div>
            </div>
          )}
        </main>
        <div className="shrink-0 px-4 pb-safe pt-2 flex gap-3">
          <GameButton variant="ghost" size="md" onClick={onBack}>🏠 Home</GameButton>
          <GameButton variant="primary" size="md" full onClick={() => { setPhase("select-players"); setSelectedPlayerIds(new Set()); setSession(null); setCurrentTurn(null); setShuffledOrder([]); }}>⚔️ Main Lagi</GameButton>
        </div>
      </div>
    );
  }

  return null;
}

// Constants used in Jalur Tercepat grid
const FP_ROWS = 16;
const FP_COLS = 6;
