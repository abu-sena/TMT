/**
 * Spasial mini-games: Ubah Posisi, Cocokkan Bayangan, Jalur Tercepat
 * Keluarga: Misi Keluarga
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { Profile, MiniGameSession } from "@/types";
import { createMiniGameSession } from "@/lib/minigame-engine";
import { shuffleArray } from "@/lib/utils";
import { GameButton } from "../game/GameButton";
import { GameCard } from "../game/GameCard";
import { MiniGameResultScreen } from "./MiniGameResultScreen";
import { useGameStore } from "@/lib/storage";
import type React from "react";

// ═══════════════════════════
// Ubah Posisi (10×10 grid)
// ═══════════════════════════

function UbahPosisiGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
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
  const gridSize = 10;

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "ubah-posisi");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const dirEmojis: Record<string, string> = { right: "➡️", left: "⬅️", up: "⬆️", down: "⬇️" };
  const maxMoves = profile.difficulty === "sd-bawah" ? 2 : profile.difficulty === "sd-atas" ? 3 : profile.difficulty === "smp" ? 4 : profile.difficulty === "sma" ? 5 : 6;

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
  };

  const nextQ = () => { if (qIdx >= 8) { endGame(); return; } setQIdx(q => q + 1); genQ(); };

  const checkAnswer = (row: number, col: number) => {
    setUserPos({ row, col });
    const correct = row === correctPos.row && col === correctPos.col;
    setIsCorrect(correct);
    if (correct) { setScore(s => s + 100); setCorrectCount(c => c + 1); }
    else { setScore(s => Math.max(0, s - 20)); }
  };

  const endGame = () => {
    const sess = createMiniGameSession(profile, "ubah-posisi", "spasial", score, correctCount, 0, 0, 0, 1, profile.difficulty, qIdx, qIdx - correctCount);
    setSession(sess); addMiniGameSession(sess); setPhase("result");
  };

  const startGame = () => { setScore(0); setCorrectCount(0); setQIdx(0); setPhase("playing"); genQ(); };

  useEffect(() => { backRef.current = () => { if (phase === "playing") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">🔄</div><h1 className="font-display font-black text-3xl mb-1">Ubah Posisi</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Ikuti instruksi gerakan apel di grid 10×10 dan tentukan posisi akhirnya!</p>
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );
  if (phase === "result" && session) return (<MiniGameResultScreen profile={profile} session={session} gameTitle="Ubah Posisi" gameIcon="🔄" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-2 sm:p-3 overflow-hidden">
      <header className="pt-safe flex items-center gap-2 mb-2 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{qIdx + 1}/8</div>
      </header>
      <main className="flex-1 flex flex-col items-center min-h-0 overflow-y-auto">
        {/* Instructions */}
        <div className="bg-white/80 rounded-2xl p-3 mb-2 border-2 border-[#CBB794] w-full max-w-sm">
          <div className="text-xs font-bold text-[#8C6B45] mb-1 text-center">
            🍎 Posisi mulai: ({startPos.row + 1}, {startPos.col + 1})
          </div>
          <div className="flex justify-center gap-2 text-sm font-black text-[#5A3515] flex-wrap">
            {moves.map((m, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded-full border border-[#CBB794]">
                {m.emoji}{m.steps}
              </span>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white/60 rounded-2xl p-2 border-2 border-[#CBB794] w-full max-w-sm">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const row = Math.floor(i / gridSize);
              const col = i % gridSize;
              const isStart = row === startPos.row && col === startPos.col;
              const isUser = userPos?.row === row && userPos?.col === col;
              const showCorrect = isCorrect !== null && row === correctPos.row && col === correctPos.col;
              return (
                <button
                  key={i}
                  onClick={() => !isCorrect && isCorrect === null && checkAnswer(row, col)}
                  disabled={isCorrect !== null}
                  className={`aspect-square rounded-md text-xs sm:text-sm grid place-items-center transition-all ${
                    isStart ? "bg-[#FFE0B2] border-2 border-[#FF9800] font-bold" :
                    isUser ? (isCorrect ? "bg-[#C8E6C9] border-2 border-[#4CAF50]" : "bg-[#FFCDD2] border-2 border-[#F44336]") :
                    showCorrect && isCorrect === false ? "bg-[#C8E6C9] border-2 border-[#4CAF50]" :
                    "bg-white/50 border border-[#E8DCC2]"
                  }`}
                >
                  {isStart ? "🍎" : isUser ? "📍" : showCorrect && isCorrect === false ? "🍎" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {isCorrect !== null && (
          <div className="mt-3">
            <div className={`text-center font-black text-sm mb-2 ${isCorrect ? "text-[#2E8B12]" : "text-[#A02020]"}`}>
              {isCorrect ? "✅ Benar!" : `❌ Seharusnya di (${correctPos.row + 1}, ${correctPos.col + 1})`}
            </div>
            <GameButton variant="primary" size="md" full onClick={nextQ}>{qIdx >= 8 ? "Lihat Hasil" : "Lanjut →"}</GameButton>
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════
// Cocokkan Bayangan
// ═══════════════════════════

// Shadow pairs: original shape → a set of shadow options (flat black shapes)
// The answer is based on shapeId, not color
interface ShadowPair {
  obj: { shapeType: string; color: string };
  shapeId: string;
  shadows: { shapeId: string; label: string }[];
  correctIdx: number;
}

const SHADOW_SHAPE_TYPES = ["circle", "square", "triangle", "diamond", "star", "hexagon"];

function generateShadowPair(): ShadowPair {
  const types = shuffleArray([...SHADOW_SHAPE_TYPES]);
  const correctType = types[0];
  const wrongTypes = types.slice(1, 5);
  
  const shadows = [
    { shapeId: correctType, label: `Bayangan ${correctType}` },
    ...wrongTypes.map(t => ({ shapeId: t, label: `Bayangan ${t}` })),
  ];
  
  // Shuffle shadows
  const shuffledShadows = shuffleArray(shadows.map((s, i) => ({ ...s, idx: i })));
  
  return {
    obj: { shapeType: correctType, color: getShapeColor(correctType) },
    shapeId: correctType,
    shadows: shuffledShadows,
    correctIdx: shuffledShadows.findIndex(s => s.shapeId === correctType),
  };
}

function getShapeColor(_shapeType: string): string {
  const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA", "#FB923C", "#34D399"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function ShadowSvg({ shapeType, size = 40 }: { shapeType: string; size?: number }) {
  const half = size / 2;
  const fill = "#1a1a1a"; // flat black
  
  switch (shapeType) {
    case "circle":
      return <svg width={size} height={size}><circle cx={half} cy={half} r={half - 4} fill={fill} /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x={4} y={4} width={size - 8} height={size - 8} rx={2} fill={fill} /></svg>;
    case "triangle":
      return <svg width={size} height={size}><polygon points={`${half},4 ${size - 4},${size - 4} 4,${size - 4}`} fill={fill} /></svg>;
    case "diamond":
      return <svg width={size} height={size}><polygon points={`${half},4 ${size - 4},${half} ${half},${size - 4} 4,${half}`} fill={fill} /></svg>;
    case "star":
      const cx = half, cy = half, outerR = half - 4, innerR = outerR * 0.4;
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(" ");
      return <svg width={size} height={size}><polygon points={pts} fill={fill} /></svg>;
    case "hexagon":
      const hcx = half, hcy = half, r = half - 4;
      const hexPts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${hcx + r * Math.cos(angle)},${hcy + r * Math.sin(angle)}`;
      }).join(" ");
      return <svg width={size} height={size}><polygon points={hexPts} fill={fill} /></svg>;
    default:
      return <svg width={size} height={size}><circle cx={half} cy={half} r={half - 4} fill={fill} /></svg>;
  }
}

function ObjectSvg({ shapeType, color, size = 64 }: { shapeType: string; color: string; size?: number }) {
  const half = size / 2;
  
  switch (shapeType) {
    case "circle":
      return <svg width={size} height={size}><circle cx={half} cy={half} r={half - 4} fill={color} /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x={4} y={4} width={size - 8} height={size - 8} rx={4} fill={color} /></svg>;
    case "triangle":
      return <svg width={size} height={size}><polygon points={`${half},4 ${size - 4},${size - 4} 4,${size - 4}`} fill={color} /></svg>;
    case "diamond":
      return <svg width={size} height={size}><polygon points={`${half},4 ${size - 4},${half} ${half},${size - 4} 4,${half}`} fill={color} /></svg>;
    case "star":
      const cx = half, cy = half, outerR = half - 4, innerR = outerR * 0.4;
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(" ");
      return <svg width={size} height={size}><polygon points={pts} fill={color} /></svg>;
    case "hexagon":
      const hcx = half, hcy = half, r = half - 4;
      const hexPts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${hcx + r * Math.cos(angle)},${hcy + r * Math.sin(angle)}`;
      }).join(" ");
      return <svg width={size} height={size}><polygon points={hexPts} fill={color} /></svg>;
    default:
      return <svg width={size} height={size}><circle cx={half} cy={half} r={half - 4} fill={color} /></svg>;
  }
}

function CocokBayanganGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "result">("start");
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [pair, setPair] = useState<ShadowPair>(generateShadowPair);
  const [session, setSession] = useState<MiniGameSession | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "cocok-bayangan");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const genQ = () => {
    setPair(generateShadowPair());
  };

  const checkAnswer = (shadowIdx: number) => {
    const isCorrect = shadowIdx === pair.correctIdx;
    if (isCorrect) {
      setScore(s => s + 100);
      setCorrectCount(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 20));
    }
    if (qIdx >= 10) { endGame(); return; }
    setQIdx(q => q + 1);
    genQ();
  };

  const endGame = () => { const sess = createMiniGameSession(profile, "cocok-bayangan", "spasial", score, correctCount, 0, 0, 0, 1, profile.difficulty, qIdx, qIdx - correctCount); setSession(sess); addMiniGameSession(sess); setPhase("result"); };
  const startGame = () => { setScore(0); setCorrectCount(0); setQIdx(0); setPhase("playing"); genQ(); };

  useEffect(() => { backRef.current = () => { if (phase === "playing") { onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">👤</div><h1 className="font-display font-black text-3xl mb-1">Cocokkan Bayangan</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Temukan bayangan hitam yang cocok dengan bentuk objek!</p>
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );
  if (phase === "result" && session) return (<MiniGameResultScreen profile={profile} session={session} gameTitle="Cocokkan Bayangan" gameIcon="👤" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-3 sm:p-4">
      <header className="pt-safe flex items-center gap-2 mb-3 shrink-0"><button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button><div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794] ml-auto">{qIdx}/10</div></header>
      <main className="flex-1 flex flex-col items-center justify-center min-h-0">
        <GameCard tone="cream" className="w-full max-w-sm text-center py-8 mb-4 border-4 shrink-0 border-[#CBB794]"><div className="text-xs font-bold text-[#8C6B45] mb-2">Cari bayangan hitam yang cocok</div><div className="flex justify-center"><ObjectSvg shapeType={pair.obj.shapeType} color={pair.obj.color} size={64} /></div></GameCard>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {pair.shadows.map((shadow) => (
            <button key={shadow.shapeId} onClick={() => checkAnswer(pair.shadows.indexOf(shadow))}
              className="h-20 sm:h-24 rounded-2xl bg-white border-4 border-[#CBB794] grid place-items-center shadow-pop active:translate-y-1 transition-all hover:border-[#185E9F]">
              <ShadowSvg shapeType={shadow.shapeId} size={40} />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════
// Jalur Tercepat (6×20 grid)
// ═══════════════════════════

function generateJalurTercepat() {
  const rows = 6, cols = 20;
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill("🐾"));
  const startR = 0, startC = 0;
  const goalR = rows - 1, goalC = cols - 1;
  grid[startR][startC] = "🐒";
  grid[goalR][goalC] = "🍌";
  const obstacles = Math.floor(rows * cols * 0.2);
  for (let i = 0; i < obstacles; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if ((r === startR && c === startC) || (r === goalR && c === goalC)) continue;
    grid[r][c] = "🪵";
  }
  const queue: [number, number][] = [[startR, startC]];
  const visited = new Set<string>();
  visited.add(`${startR},${startC}`);
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let solvable = false;
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r === goalR && c === goalC) { solvable = true; break; }
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== "🪵" && !visited.has(`${nr},${nc}`)) {
        visited.add(`${nr},${nc}`);
        queue.push([nr, nc]);
      }
    }
  }
  return { grid, solvable };
}

function JalurTercepatGame({ profile, onBack, backRef }: { profile: Profile; onBack: () => void; backRef: React.MutableRefObject<(() => boolean) | null> }) {
  const { addMiniGameSession, store } = useGameStore();
  const [phase, setPhase] = useState<"start" | "playing" | "result">("start");
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [userPath, setUserPath] = useState<[number, number][]>([]);
  const [timer, setTimer] = useState(60);
  const [session, setSession] = useState<MiniGameSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mySessions = store.miniGameSessions.filter(s => s.profileId === profile.id && s.gameType === "jalur-tercepat");
  const personalBest = mySessions.reduce((max, s) => Math.max(max, s.score), 0);

  const genQ = () => {
    let g = generateJalurTercepat();
    while (!g.solvable) g = generateJalurTercepat();
    setGrid(g.grid);
    setUserPath([[0, 0]]);
    const t = profile.difficulty === "sd-bawah" ? 90 : profile.difficulty === "sd-atas" ? 75 : profile.difficulty === "smp" ? 60 : 45;
    setTimer(t);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { setTimer(t => { if (t <= 1) { endGame(); return 0; } return t - 1; }); }, 1000);
  };

  const clickCell = (row: number, col: number) => {
    if (grid[row][col] === "🪵" || userPath.length === 0) return;
    const [lr, lc] = userPath[userPath.length - 1];
    const dist = Math.abs(row - lr) + Math.abs(col - lc);
    if (dist !== 1) return;
    if (userPath.some(([r, c]) => r === row && c === col)) return;
    const newPath: [number, number][] = [...userPath, [row, col]];
    setUserPath(newPath);
    if (grid[row][col] === "🍌") {
      if (timerRef.current) clearInterval(timerRef.current);
      setScore(s => s + 100 + timer * 5);
      setTimeout(() => { if (qIdx >= 4) endGame(); else { setQIdx(q => q + 1); genQ(); } }, 800);
    }
  };

  const undoLast = () => { if (userPath.length > 1) setUserPath(p => p.slice(0, -1)); };
  const endGame = () => { if (timerRef.current) clearInterval(timerRef.current); const sess = createMiniGameSession(profile, "jalur-tercepat", "spasial", score, qIdx + 1, 0, 0, 0, 1, profile.difficulty, qIdx + 1, 0); setSession(sess); addMiniGameSession(sess); setPhase("result"); };
  const startGame = () => { setScore(0); setQIdx(0); setPhase("playing"); genQ(); };

  useEffect(() => { backRef.current = () => { if (phase === "playing") { if (timerRef.current) clearInterval(timerRef.current); onBack(); return true; } if (phase === "result") { setPhase("start"); return true; } return false; }; return () => { backRef.current = null; if (timerRef.current) clearInterval(timerRef.current); }; }, [backRef, phase, onBack]);

  if (phase === "start") return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col items-center justify-center p-4">
      <GameCard tone="meadow" className="text-center w-full max-w-sm p-6 sm:p-8 text-white">
        <div className="text-6xl mb-4">🐒</div><h1 className="font-display font-black text-3xl mb-1">Jalur Tercepat</h1>
        <p className="text-sm font-bold opacity-80 mb-4">Bantu monyet 🐒 mencapai pisang 🍌 dengan jalur tercepat! Klik cell bersebelahan.</p>
        <div className="flex gap-3"><GameButton variant="ghost" full onClick={onBack}>Kembali</GameButton><GameButton variant="primary" full onClick={startGame}>Mulai!</GameButton></div>
      </GameCard>
    </div>
  );
  if (phase === "result" && session) return (<MiniGameResultScreen profile={profile} session={session} gameTitle="Jalur Tercepat" gameIcon="🐒" isNewBest={score > personalBest} leaderboardRank={null} onPlayAgain={startGame} onLeaderboard={() => {}} onBack={() => setPhase("start")} />);

  return (
    <div className="h-[100dvh] bg-gradient-sky flex flex-col p-2 sm:p-3 overflow-hidden">
      <header className="pt-safe flex items-center gap-2 mb-1 shrink-0">
        <button onClick={onBack} className="h-10 w-10 rounded-xl bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-lg shrink-0 active:scale-95">✕</button>
        <div className="flex items-center gap-2 ml-auto">
          <div className="bg-white/50 px-3 py-1.5 rounded-full font-black text-[#5A3515] text-sm border-2 border-[#CBB794]">{qIdx + 1}/5</div>
          <div className={`px-3 py-1.5 rounded-full font-black text-sm border-2 ${timer <= 10 ? "bg-[#FFEBEE] border-[#A02020] text-[#A02020]" : "bg-white/50 border-[#CBB794] text-[#5A3515]"}`}>⏱{timer}s</div>
          <button onClick={undoLast} className="h-8 w-8 rounded-lg bg-white/40 border border-[#CBB794] grid place-items-center text-sm">↩</button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center min-h-0">
        <div className="flex-1 w-full max-w-full overflow-hidden flex items-center justify-center">
          <div className="grid gap-0.5 p-1" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 20}, 1fr)` }}>
            {grid.map((row, ri) => row.map((cell, ci) => {
              const isPath = userPath.some(([r, c]) => r === ri && c === ci);
              const isStart = cell === "🐒";
              const isGoal = cell === "🍌";
              const isBlocked = cell === "🪵";
              return (
                <button
                  key={`${ri}-${ci}`}
                  onClick={() => clickCell(ri, ci)}
                  className={`text-[10px] sm:text-xs rounded-sm aspect-square grid place-items-center transition-all ${
                    isStart || isGoal ? "bg-[#FFE0B2]" :
                    isBlocked ? "bg-[#795548]/40" :
                    isPath ? "bg-[#A5D6A7] border border-[#4CAF50]" :
                    "bg-white/50 hover:bg-white/70"
                  }`}
                >
                  {cell}
                </button>
              );
            }))}
          </div>
        </div>
        <div className="text-[10px] font-bold text-[#8C6B45] mt-1">🐒 Mulai → klik cell sebelah → 🍌 Pisang!</div>
      </main>
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
        <button onClick={onBack} className="h-12 w-12 rounded-[18px] bg-white/40 border-2 border-white/60 text-[#185E9F] grid place-items-center text-xl shadow-sm shrink-0 active:scale-95">←</button>
        <div className="flex-1"><h1 className="font-display font-black text-xl sm:text-2xl text-[#5A3515] truncate">Misi Keluarga</h1><p className="text-xs text-[#5A3515]/80">Lakukan kebaikan di dunia nyata!</p></div>
        <div className="text-2xl">🏡</div>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain content-wrapper space-y-2 pb-4">
        <div className="flex gap-4 text-center mb-2">
          <div className="flex-1 rounded-2xl bg-white/80 p-3 border-2 border-[#CBB794]"><div className="font-black text-2xl text-[#2E8B12]">{doneCount}</div><div className="text-[10px] uppercase text-[#8C6B45]">Selesai</div></div>
          <div className="flex-1 rounded-2xl bg-white/80 p-3 border-2 border-[#CBB794]"><div className="font-black text-2xl text-[#D48806]">{verifiedCount}</div><div className="text-[10px] uppercase text-[#8C6B45]">Diverifikasi</div></div>
        </div>
        {missions.map(m => (
          <button key={m.id} onClick={() => toggleMission(m.id)}
            className={`w-full rounded-2xl p-4 text-left border-4 transition-all ${m.done ? "bg-[#E8F5E9] border-[#2E8B12]" : "bg-white/90 border-[#CBB794] hover:border-[#185E9F]"}`}>
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
