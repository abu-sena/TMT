/**
 * BATTLE_GAME_POOL — Central registry of all mini-games usable in Battle.
 *
 * Defines which games are battle-enabled, their generators, validators,
 * scoring, and rendering adapters. Games marked `isAdabGame: true` are
 * excluded from Battle (focus on character building, not competition).
 */

import type { DifficultyId } from "@/types";
import { shuffleArray } from "./utils";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export type BattleCategory = "fokus-cepat" | "logika" | "spasial" | "keluarga";

export interface BattleGameDefinition {
  gameId: string;
  title: string;
  packageId: string;
  battleCategory: BattleCategory | null; // null = not in battle
  emoji: string;
  isAdabGame: boolean;
  isBattleEnabled: boolean;
  supportedDifficulties: DifficultyId[];
  /** Generate a battle question for one turn */
  generateQuestion: (difficulty: DifficultyId) => BattleQuestion;
  /** Generate choices for the answer */
  generateChoices: (answer: any, difficulty: DifficultyId) => BattleChoice[];
  /** Validate an answer */
  validateAnswer: (question: BattleQuestion, choice: BattleChoice) => boolean;
  /** Calculate score for a turn */
  calculateScore: (isCorrect: boolean, responseTimeMs: number, timeLimitMs: number, difficulty: DifficultyId, question: BattleQuestion, choice: BattleChoice) => BattleScoreResult;
  /** Get feedback text */
  getFeedback: (isCorrect: boolean, question: BattleQuestion, choice: BattleChoice) => string;
}

export interface BattleQuestion {
  type: string;
  data: any; // raw data for rendering
}

export interface BattleChoice {
  value: any;
  label: string;
  emoji?: string;
  idx?: number;
}

export interface BattleScoreResult {
  baseScore: number;
  speedBonus: number;
  difficultyBonus: number;
  efficiencyBonus: number;
  finalScore: number;
}

// ═══════════════════════════════════════
// Difficulty bonus map
// ═══════════════════════════════════════

const DIFFICULTY_BONUS: Record<string, number> = {
  tk: 0,
  "sd-bawah": 10,
  "sd-atas": 20,
  smp: 30,
  sma: 40,
  universitas: 50,
};

export function getDifficultyBonus(difficulty: DifficultyId): number {
  return DIFFICULTY_BONUS[difficulty] ?? 20;
}

// ═══════════════════════════════════════
// Default scoring
// ═══════════════════════════════════════

export function defaultBattleScore(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitMs: number,
  difficulty: DifficultyId,
): BattleScoreResult {
  if (!isCorrect) {
    return { baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 };
  }
  const baseScore = 100;
  const speedRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs);
  const speedBonus = Math.round(speedRatio * 50);
  const difficultyBonus = getDifficultyBonus(difficulty);
  const finalScore = baseScore + speedBonus + difficultyBonus;
  return { baseScore, speedBonus, difficultyBonus, efficiencyBonus: 0, finalScore };
}

// ═══════════════════════════════════════
// Question Generators
// ═══════════════════════════════════════

// ── Hitung Kilat ──
function generateHitungQuestion(diff: DifficultyId): BattleQuestion {
  const isTK = diff === "tk";
  const maxAdd = isTK ? 10 : diff === "sd-bawah" ? 30 : 100;
  const ops: string[] = ["+", "-"];
  if (!isTK) ops.push("×");
  if (diff !== "tk" && diff !== "sd-bawah") ops.push("÷");
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, ans: number;
  switch (op) {
    case "+": a = Math.floor(Math.random() * maxAdd) + 1; b = Math.floor(Math.random() * maxAdd) + 1; ans = a + b; break;
    case "-": a = Math.floor(Math.random() * maxAdd) + Math.floor(maxAdd / 2); b = Math.floor(Math.random() * (a - 1)) + 1; ans = a - b; break;
    case "×": a = Math.floor(Math.random() * (isTK ? 5 : 10)) + 2; b = Math.floor(Math.random() * (isTK ? 3 : 10)) + 2; ans = a * b; break;
    case "÷": b = Math.floor(Math.random() * 8) + 2; ans = Math.floor(Math.random() * 10) + 2; a = b * ans; break;
    default: a = 1; b = 1; ans = 2;
  }
  return { type: "hitung", data: { a, b, op, answer: ans, display: `${a} ${op} ${b} = ?` } };
}
function generateHitungChoices(answer: number, diff: DifficultyId): BattleChoice[] {
  const count = diff === "tk" ? 4 : diff === "sd-bawah" ? 5 : 6;
  const choices = new Set<number>(); choices.add(answer);
  while (choices.size < count) {
    const offset = Math.floor(Math.random() * Math.max(4, Math.floor(answer * 0.3))) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    choices.add(Math.max(0, answer + sign * offset));
  }
  return shuffleArray([...choices]).map(n => ({ value: n, label: String(n) }));
}

// ── Pola Kilat ──
const POLA_SETS = [
  ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠"],
  ["⭐", "🔷", "🔶", "💎", "🌙", "☀️"],
  ["🍎", "🍌", "🍉", "🍇", "🍓", "🍒"],
  ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼"],
];
function generatePolaQuestion(diff: DifficultyId): BattleQuestion {
  const set = POLA_SETS[Math.floor(Math.random() * POLA_SETS.length)];
  const [a, b] = set;
  const patternType = diff === "tk" ? "ABAB" : ["ABAB", "AAB", "ABC"][Math.floor(Math.random() * 3)];
  let seq: string[], answer: string;
  if (patternType === "ABAB") { seq = [a, b, a, b]; answer = a; }
  else if (patternType === "AAB") { seq = [a, a, b, a, a]; answer = b; }
  else { seq = [a, b, set[2], a, b]; answer = set[2]; }
  return { type: "pola", data: { seq, answer, display: seq.join(" ") + " ?" } };
}
function generatePolaChoices(answer: string, diff: DifficultyId): BattleChoice[] {
  const all = POLA_SETS.flat();
  const count = diff === "tk" ? 4 : diff === "sd-bawah" ? 5 : 6;
  const choices = new Set<string>(); choices.add(answer);
  while (choices.size < count) { choices.add(all[Math.floor(Math.random() * all.length)]); }
  return shuffleArray([...choices]).map(e => ({ value: e, label: e }));
}

// ── Ingatan Cepat ──
const INGATAN_ITEMS = ["🍎","🍌","🍉","🍇","🍓","🍒","🐶","🐱","🐰","🦊","🐻","🐼","🚗","🚕","🚙","🚌","🏎️","🚲","🔴","🔵","🟡","🟢","🟣","🟠","⭐","💎","🌈","🔥","❄️","🎵"];
function generateIngatanQuestion(diff: DifficultyId): BattleQuestion {
  let count: number;
  if (diff === "tk") count = 3; else if (diff === "sd-bawah") count = 4; else if (diff === "sd-atas") count = 5; else count = 6;
  const pool = shuffleArray([...INGATAN_ITEMS]);
  const items = pool.slice(0, count);
  const answer = items[Math.floor(Math.random() * items.length)];
  return { type: "ingatan", data: { items, answer, display: items.join(" ") } };
}
function generateIngatanChoices(answer: string, diff: DifficultyId): BattleChoice[] {
  const count = diff === "tk" ? 4 : diff === "sd-bawah" ? 5 : 6;
  const choices = new Set<string>(); choices.add(answer);
  while (choices.size < count) { choices.add(INGATAN_ITEMS[Math.floor(Math.random() * INGATAN_ITEMS.length)]); }
  return shuffleArray([...choices]).map(e => ({ value: e, label: e }));
}

// ── Cari yang Berbeda ──
const SHAPE_TYPES = ["circle", "square", "triangle-up", "diamond", "hexagon", "star"] as const;
function generateCariBerbedaQuestion(diff: DifficultyId): BattleQuestion {
  const countMap: Record<string, number> = { tk: 12, "sd-bawah": 16, "sd-atas": 20, smp: 24, sma: 28, universitas: 30 };
  const count = countMap[diff] || 16;
  const shapes = shuffleArray([...SHAPE_TYPES]);
  const oddShape = shapes[0];
  const normalShape = shapes[1];
  const oddIndex = Math.floor(Math.random() * count);
  const items = Array.from({ length: count }, (_, i) => ({
    shapeType: i === oddIndex ? oddShape : normalShape,
    color: ["#FF6B6B","#4ECDC4","#FFE66D","#A78BFA","#FB923C","#38BDF8"][Math.floor(Math.random() * 6)],
    isOdd: i === oddIndex,
  }));
  return { type: "cari-berbeda", data: { oddIndex, items, oddShape, normalShape } };
}
function generateCariBerbedaChoices(answer: number, diff: DifficultyId): BattleChoice[] {
  const count = answer >= 0 ? 6 : 4;
  const choices = new Set<number>(); choices.add(answer);
  while (choices.size < Math.min(count, (answer >= 0 ? 20 : 10) + 1)) {
    choices.add(Math.floor(Math.random() * (answer >= 0 ? 20 : 10)));
  }
  return shuffleArray([...choices]).map(n => ({ value: n, label: String(n + 1) }));
}

// ── Benar atau Salah ──
const BENAR_SALAH_STATEMENTS = [
  { text: "Matahari terbit dari barat.", answer: false }, { text: "Air mendidih pada 100°C di permukaan laut.", answer: true },
  { text: "Semua burung bisa terbang.", answer: false }, { text: "Indonesia adalah negara kepulauan.", answer: true },
  { text: "1 + 1 = 3", answer: false }, { text: "Bulan mengelilingi bumi.", answer: true },
  { text: "Ikan bernapas dengan paru-paru.", answer: false }, { text: "Jujur adalah akhlak terpuji.", answer: true },
  { text: "Semua logam bisa mengapung di air.", answer: false }, { text: "Segitiga memiliki 3 sisi.", answer: true },
  { text: "Senyum adalah sedekah.", answer: true }, { text: "Air hujan berasal dari awan.", answer: true },
  { text: "Belajar dengan tekun akan membuat kita pintar.", answer: true },
  { text: "Tumbuhan membuat makanan melalui fotosintesis.", answer: true },
];
function generateBenarSalahQuestion(diff: DifficultyId): BattleQuestion {
  const stmt = BENAR_SALAH_STATEMENTS[Math.floor(Math.random() * BENAR_SALAH_STATEMENTS.length)];
  return { type: "benar-salah", data: { text: stmt.text, answer: stmt.answer } };
}
function generateBenarSalahChoices(_answer: boolean, _diff: DifficultyId): BattleChoice[] {
  return shuffleArray([
    { value: true, label: "✅ Benar" },
    { value: false, label: "❌ Salah" },
  ]);
}

// ── Kode Warna ──
const COLOR_CODE_PATTERNS: { shapes: { type: string; color: string }[]; answer: number }[] = [
  { shapes: [{ type: "circle", color: "red" }, { type: "square", color: "blue" }, { type: "triangle-up", color: "red" }], answer: 1 },
  { shapes: [{ type: "diamond", color: "green" }, { type: "circle", color: "green" }, { type: "square", color: "blue" }], answer: 0 },
  { shapes: [{ type: "hexagon", color: "purple" }, { type: "circle", color: "orange" }, { type: "triangle-up", color: "purple" }, { type: "square", color: "orange" }], answer: 2 },
  { shapes: [{ type: "square", color: "yellow" }, { type: "circle", color: "pink" }, { type: "diamond", color: "yellow" }, { type: "hexagon", color: "pink" }], answer: 1 },
  { shapes: [{ type: "circle", color: "red" }, { type: "square", color: "green" }, { type: "triangle-up", color: "blue" }, { type: "circle", color: "blue" }], answer: 0 },
];
function generateKodeWarnaQuestion(diff: DifficultyId): BattleQuestion {
  const pattern = COLOR_CODE_PATTERNS[Math.floor(Math.random() * COLOR_CODE_PATTERNS.length)];
  return { type: "kode-warna", data: { shapes: pattern.shapes, answer: pattern.answer } };
}
function generateKodeWarnaChoices(answer: number, _diff: DifficultyId): BattleChoice[] {
  const count = 4;
  const choices = new Set<number>(); choices.add(answer);
  while (choices.size < count) { choices.add(Math.floor(Math.random() * 4)); }
  return shuffleArray([...choices]).map(n => ({ value: n, label: `Pola ${n + 1}` }));
}

// ── Detektif Petunjuk / Tebak Aturan / Pilih Kesimpulan ──
const LOGIKA_QUESTIONS = [
  { type: "detektif" as const, prompt: "Aku selalu basah kalau di luar. Kalau di dalam aku kering. Siapakah aku?", choices: ["Jemuran", "Ikan", "Payung", "Buku"], correctIdx: 0, explanation: "Jemuran basah saat hujan (di luar) dan kering saat di dalam rumah." },
  { type: "detektif" as const, prompt: "Semakin banyak kamu mengambil dariku, semakin besar aku. Apakah aku?", choices: ["Lubang", "Air", "Kue", "Uang"], correctIdx: 0, explanation: "Lubang semakin besar semakin kamu menggali." },
  { type: "tebak-aturan" as const, prompt: "2 → 4, 3 → 9, 4 → 16. Apa aturannya?", choices: ["Kuadrat (n²)", "Dikali 2", "Ditambah 2", "Dikali sendiri"], correctIdx: 0, explanation: "Setiap angka dikuadratkan. 2²=4, 3²=9, 4²=16." },
  { type: "tebak-aturan" as const, prompt: "🔴🔵 → 🔵🔴, 🟡🟢 → 🟢🟡. Apa aturannya?", choices: ["Dibalik urutannya", "Ditukar warnanya", "Dihilangkan satu", "Ditambah satu"], correctIdx: 0, explanation: "Urutan dibalik. Yang kiri jadi kanan, kanan jadi kiri." },
  { type: "kesimpulan" as const, prompt: "Semua kucing suka ikan. Tom adalah kucing. Kesimpulan:", choices: ["Tom suka ikan", "Tom tidak suka ikan", "Tom adalah ikan", "Tidak bisa disimpulkan"], correctIdx: 0, explanation: "Jika semua kucing suka ikan dan Tom adalah kucing, maka Tom suka ikan." },
  { type: "kesimpulan" as const, prompt: "Jika hujan, jalan basah. Jalan basah. Kesimpulan:", choices: ["Tidak bisa disimpulkan", "Pasti hujan", "Tidak hujan", "Jalan selalu basah"], correctIdx: 0, explanation: "Jalan bisa basah karena disiram atau sebab lain. Tidak bisa disimpulkan pasti hujan." },
];
function generateLogikaQuestion(diff: DifficultyId): BattleQuestion {
  const q = LOGIKA_QUESTIONS[Math.floor(Math.random() * LOGIKA_QUESTIONS.length)];
  return { type: "logika", data: { ...q } };
}
function generateLogikaChoices(_answer: any, _diff: DifficultyId): BattleChoice[] {
  return []; // choices embedded in question
}

// ── Cocokkan Bayangan ──
function generateCocokBayanganQuestion(diff: DifficultyId): BattleQuestion {
  const shapes = shuffleArray(["🐱","🐶","🐰","🦊","🐻","🐼","🐵","🐯"]);
  const correctIdx = Math.floor(Math.random() * Math.min(4, shapes.length));
  return { type: "cocok-bayangan", data: { targetEmoji: shapes[correctIdx], options: shapes.slice(0, 4).map((e, i) => ({ value: e, idx: i })), correctIdx } };
}
function generateCocokBayanganChoices(answer: string, _diff: DifficultyId): BattleChoice[] {
  const shapes = shuffleArray(["🐱","🐶","🐰","🦊","🐻","🐼","🐵","🐯"]);
  const choices = new Set<string>(); choices.add(answer);
  while (choices.size < 4) { choices.add(shapes[Math.floor(Math.random() * shapes.length)]); }
  return shuffleArray([...choices]).map(e => ({ value: e, label: e }));
}

// ── Ubah Posisi ──
function generateUbahPosisiQuestion(diff: DifficultyId): BattleQuestion {
  const gridSize = 10;
  const sr = Math.floor(Math.random() * 4);
  const sc = Math.floor(Math.random() * 4);
  const dirs: { d: string; dr: number; dc: number }[] = [{ d: "right", dr: 0, dc: 1 }, { d: "left", dr: 0, dc: -1 }, { d: "up", dr: -1, dc: 0 }, { d: "down", dr: 1, dc: 0 }];
  const maxMoves = diff === "tk" ? 2 : diff === "sd-bawah" ? 2 : 3;
  const moveCount = 1 + Math.floor(Math.random() * maxMoves);
  let cr = sr, cc = sc;
  const moves: { direction: string; steps: number }[] = [];
  for (let i = 0; i < moveCount; i++) {
    const { d, dr, dc } = dirs[Math.floor(Math.random() * dirs.length)];
    const steps = 1 + Math.floor(Math.random() * 3);
    const nr = cr + dr * steps, nc = cc + dc * steps;
    if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) { i--; continue; }
    cr = nr; cc = nc;
    moves.push({ direction: d, steps });
  }
  return { type: "ubah-posisi", data: { start: { row: sr, col: sc }, moves, correctEnd: { row: cr, col: cc }, gridSize } };
}
function generateUbahPosisiChoices(answer: any, _diff: DifficultyId): BattleChoice[] {
  return []; // interactive click-grid
}

// ── Jalur Tercepat ──
const FP_ROWS = 16, FP_COLS = 6;
function fpBfs(grid: string[][], sr: number, sc: number, gr: number, gc: number): [number, number][] | null {
  const queue: [number, number, [number, number][]][] = [[sr, sc, [[sr, sc]]]];
  const visited = new Set<string>(); visited.add(`${sr},${sc}`);
  while (queue.length > 0) {
    const [r, c, path] = queue.shift()!;
    if (r === gr && c === gc) return path;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < FP_ROWS && nc >= 0 && nc < FP_COLS && grid[nr][nc] !== "🪵" && !visited.has(key)) {
        visited.add(key); queue.push([nr, nc, [...path, [nr, nc]]]);
      }
    }
  }
  return null;
}
function generateJalurTercepatQuestion(diff: DifficultyId): BattleQuestion {
  const grid: string[][] = Array.from({ length: FP_ROWS }, () => Array(FP_COLS).fill("🐾"));
  const sr = 0, sc = Math.floor(Math.random() * FP_COLS);
  const gr = FP_ROWS - 1, gc = Math.floor(Math.random() * FP_COLS);
  grid[sr][sc] = "🐒"; grid[gr][gc] = "🍌";
  const ratio = diff === "sd-bawah" ? 0.15 : diff === "sd-atas" ? 0.20 : 0.25;
  const obs = Math.floor(FP_ROWS * FP_COLS * ratio);
  for (let i = 0; i < obs; i++) {
    const r = Math.floor(Math.random() * FP_ROWS), c = Math.floor(Math.random() * FP_COLS);
    if ((r === sr && c === sc) || (r === gr && c === gc) || grid[r][c] === "🪵") continue;
    grid[r][c] = "🪵";
  }
  let shortestPath = fpBfs(grid, sr, sc, gr, gc);
  let retries = 0;
  while (!shortestPath && retries < 15) {
    for (let r = 0; r < FP_ROWS; r++) for (let c = 0; c < FP_COLS; c++) if (grid[r][c] === "🪵" && Math.random() < 0.3) grid[r][c] = "🐾";
    shortestPath = fpBfs(grid, sr, sc, gr, gc); retries++;
  }
  if (!shortestPath) { for (let r = 0; r < FP_ROWS; r++) for (let c = 0; c < FP_COLS; c++) if (grid[r][c] === "🪵") grid[r][c] = "🐾"; shortestPath = fpBfs(grid, sr, sc, gr, gc); }
  const tl = diff === "sd-bawah" ? 25 : diff === "sd-atas" ? 20 : 15;
  return { type: "jalur-tercepat", data: { rows: FP_ROWS, cols: FP_COLS, start: { row: sr, col: sc }, goal: { row: gr, col: gc }, cells: grid, shortestPath: shortestPath || [[sr, sc]], shortestPathLength: shortestPath ? shortestPath.length - 1 : FP_ROWS + FP_COLS, timerLimit: tl } };
}
function generateJalurTercepatChoices(_answer: any, _diff: DifficultyId): BattleChoice[] {
  return []; // interactive grid
}

// ── Rantai Warna Generator ──
function generateRantaiWarnaQuestion(diff: DifficultyId): BattleQuestion {
  const seqLenMap: Record<string, number> = { tk: 3, "sd-bawah": 4, "sd-atas": 5, smp: 6, sma: 7, universitas: 8 };
  const seqLen = seqLenMap[diff] || 5;
  const colors = [
    { name: "merah", hex: "#E53935", emoji: "🔴" },
    { name: "ungu", hex: "#8E24AA", emoji: "🟣" },
    { name: "kuning", hex: "#FDD835", emoji: "🟡" },
    { name: "hijau", hex: "#43A047", emoji: "🟢" },
    { name: "biru", hex: "#42A5F5", emoji: "🔵" },
    { name: "oranye", hex: "#FB8C00", emoji: "🟠" },
  ];
  const shuffled = shuffleArray([...colors]);
  const sequence = shuffled.slice(0, seqLen);
  const displayOrder = shuffleArray([...sequence]);
  return { type: "rantai-warna", data: { sequence, displayOrder, colorCount: seqLen } };
}
function generateRantaiWarnaChoices(_answer: any, _diff: DifficultyId): BattleChoice[] { return []; }

// ── Jalur Angka Generator ──
function generateJalurAngkaQuestion(diff: DifficultyId): BattleQuestion {
  const inputMap: Record<string, number> = { tk: 1, "sd-bawah": 2, "sd-atas": 3, smp: 4, sma: 4, universitas: 5 };
  const inputCount = inputMap[diff] || 2;
  const maxNum = diff === "tk" ? 10 : diff === "sd-bawah" ? 20 : 100;
  const operations: string[] = ["+", "-"];
  if (diff !== "tk" && diff !== "sd-bawah") operations.push("×");
  let currentValue = Math.floor(Math.random() * maxNum) + 1;
  const steps: { visible: string; hidden: boolean; expected?: number }[] = [{ visible: String(currentValue), hidden: false }];
  const solutionMap: Record<number, number> = {};
  let hiddenCount = 0;
  const totalOps = inputCount + 1;
  for (let i = 0; i < totalOps; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let operand: number;
    if (op === "+") { operand = Math.floor(Math.random() * maxNum) + 1; currentValue += operand; }
    else if (op === "-") { operand = Math.floor(Math.random() * Math.min(currentValue - 1, maxNum)) + 1; currentValue -= operand; }
    else { operand = Math.floor(Math.random() * Math.min(5, maxNum)) + 2; currentValue *= operand; }
    steps.push({ visible: op, hidden: false });
    const shouldHide = hiddenCount < inputCount && Math.random() < 0.6;
    if (shouldHide) { steps.push({ visible: "?", hidden: true, expected: operand }); solutionMap[steps.length - 1] = operand; hiddenCount++; }
    else { steps.push({ visible: String(operand), hidden: false }); }
  }
  while (hiddenCount < inputCount) {
    for (let i = 2; i < steps.length - 1; i += 2) {
      if (!steps[i].hidden && hiddenCount < inputCount) {
        steps[i] = { visible: "?", hidden: true, expected: Number(steps[i].visible) };
        solutionMap[i] = Number(steps[i].expected);
        hiddenCount++;
      }
    }
  }
  const display = steps.map(s => s.visible).join(" ") + " = " + currentValue;
  return { type: "jalur-angka", data: { display, steps, solutionMap, target: currentValue, hiddenIndices: Object.keys(solutionMap).map(Number) } };
}
function generateJalurAngkaChoices(_answer: any, _diff: DifficultyId): BattleChoice[] { return []; }

// ═══════════════════════════════════════
// THE POOL
// ═══════════════════════════════════════

export const BATTLE_GAME_POOL: BattleGameDefinition[] = [
  // ── FOKUS CEPAT ──
  {
    gameId: "hitung-kilat", title: "Hitung Kilat", packageId: "fokus-cepat",
    battleCategory: "fokus-cepat", emoji: "⚡", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateHitungQuestion, generateChoices: generateHitungChoices,
    validateAnswer: (q, c) => c.value === q.data.answer,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q, c) => isCorrect ? `✅ ${q.data.display} = ${q.data.answer}. Tepat!` : `❌ ${q.data.display} Jawabannya ${q.data.answer}.`,
  },
  {
    gameId: "pola-kilat", title: "Pola Kilat", packageId: "fokus-cepat",
    battleCategory: "fokus-cepat", emoji: "🧩", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generatePolaQuestion, generateChoices: generatePolaChoices,
    validateAnswer: (q, c) => c.value === q.data.answer,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Pola ditemukan! Tepat!" : "❌ Pola belum tepat.",
  },
  {
    gameId: "ingatan-cepat", title: "Ingatan Cepat", packageId: "fokus-cepat",
    battleCategory: "fokus-cepat", emoji: "🧠", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateIngatanQuestion, generateChoices: generateIngatanChoices,
    validateAnswer: (q, c) => c.value === q.data.answer,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? "✅ Ingatan tajam!" : "❌ Coba hafalkan lagi!",
  },
  {
    gameId: "cari-yang-berbeda", title: "Cari yang Berbeda", packageId: "fokus-cepat",
    battleCategory: "fokus-cepat", emoji: "👁️", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateCariBerbedaQuestion, generateChoices: generateCariBerbedaChoices,
    validateAnswer: (q, c) => c.value === q.data.oddIndex,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? `✅ Ketemu! Yang berbeda adalah #${q.data.oddIndex + 1}.` : `❌ Yang berbeda adalah #${q.data.oddIndex + 1}.`,
  },

  // ── LOGIKA ──
  {
    gameId: "detektif-petunjuk", title: "Detektif Petunjuk", packageId: "logika",
    battleCategory: "logika", emoji: "🕵️", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateLogikaQuestion, generateChoices: generateLogikaChoices,
    validateAnswer: (q, c) => c.idx !== undefined ? c.idx === q.data.correctIdx : c.value === q.data.correctIdx,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? `✅ ${q.data.explanation}` : `❌ ${q.data.explanation}`,
  },
  {
    gameId: "tebak-aturan", title: "Tebak Aturan", packageId: "logika",
    battleCategory: "logika", emoji: "📐", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateLogikaQuestion, generateChoices: generateLogikaChoices,
    validateAnswer: (q, c) => c.idx !== undefined ? c.idx === q.data.correctIdx : c.value === q.data.correctIdx,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? `✅ ${q.data.explanation}` : `❌ ${q.data.explanation}`,
  },
  {
    gameId: "pilih-kesimpulan", title: "Pilih Kesimpulan", packageId: "logika",
    battleCategory: "logika", emoji: "💡", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateLogikaQuestion, generateChoices: generateLogikaChoices,
    validateAnswer: (q, c) => c.idx !== undefined ? c.idx === q.data.correctIdx : c.value === q.data.correctIdx,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? `✅ ${q.data.explanation}` : `❌ ${q.data.explanation}`,
  },
  {
    gameId: "benar-atau-salah", title: "Benar atau Salah", packageId: "logika",
    battleCategory: "logika", emoji: "✅", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateBenarSalahQuestion, generateChoices: generateBenarSalahChoices,
    validateAnswer: (q, c) => c.value === q.data.answer,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? `✅ Benar! ${q.data.text}` : `❌ ${q.data.text} — Pernyataan ini ${q.data.answer ? "Benar" : "Salah"}.`,
  },
  {
    gameId: "kode-warna", title: "Kode Warna", packageId: "logika",
    battleCategory: "logika", emoji: "🎨", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateKodeWarnaQuestion, generateChoices: generateKodeWarnaChoices,
    validateAnswer: (q, c) => c.value === q.data.answer,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect, q) => isCorrect ? "✅ Kode warna tepat!" : `❌ Jawaban yang benar adalah Pola ${q.data.answer + 1}.`,
  },

  // ── SPASIAL ──
  {
    gameId: "ubah-posisi", title: "Ubah Posisi", packageId: "spasial",
    battleCategory: "spasial", emoji: "🔄", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateUbahPosisiQuestion, generateChoices: generateUbahPosisiChoices,
    validateAnswer: () => false, // handled by interactive grid
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Posisi akhir tepat!" : "❌ Posisi belum tepat.",
  },
  {
    gameId: "cocokkan-bayangan", title: "Cocokkan Bayangan", packageId: "spasial",
    battleCategory: "spasial", emoji: "👤", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateCocokBayanganQuestion, generateChoices: generateCocokBayanganChoices,
    validateAnswer: (q, c) => c.value === q.data.targetEmoji,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Bayangan cocok!" : "❌ Bayangan belum cocok.",
  },
  {
    gameId: "jalur-tercepat", title: "Jalur Tercepat", packageId: "spasial",
    battleCategory: "spasial", emoji: "🐒", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateJalurTercepatQuestion, generateChoices: generateJalurTercepatChoices,
    validateAnswer: () => false, // handled by interactive grid
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Monyet sampai ke pisang!" : "❌ Belum sampai ke pisang.",
  },

  // ── ADAB (NOT IN BATTLE) ──
  { gameId: "pilih-sikap-terbaik", title: "Pilih Sikap Terbaik", packageId: "adab", battleCategory: null, emoji: "💖", isAdabGame: true, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], generateQuestion: () => ({ type: "adab", data: {} }), generateChoices: () => [], validateAnswer: () => false, calculateScore: () => ({ baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 }), getFeedback: () => "" },
  { gameId: "nasihat-dengan-lembut", title: "Nasihat dengan Lembut", packageId: "adab", battleCategory: null, emoji: "💬", isAdabGame: true, isBattleEnabled: false, supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"], generateQuestion: () => ({ type: "adab", data: {} }), generateChoices: () => [], validateAnswer: () => false, calculateScore: () => ({ baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 }), getFeedback: () => "" },
  { gameId: "urutkan-adab", title: "Urutkan Adab", packageId: "adab", battleCategory: null, emoji: "📋", isAdabGame: true, isBattleEnabled: false, supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"], generateQuestion: () => ({ type: "adab", data: {} }), generateChoices: () => [], validateAnswer: () => false, calculateScore: () => ({ baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 }), getFeedback: () => "" },
  { gameId: "dilema-bijak", title: "Dilema Bijak", packageId: "adab", battleCategory: null, emoji: "⚖️", isAdabGame: true, isBattleEnabled: false, supportedDifficulties: ["sd-atas","smp","sma","universitas"], generateQuestion: () => ({ type: "adab", data: {} }), generateChoices: () => [], validateAnswer: () => false, calculateScore: () => ({ baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 }), getFeedback: () => "" },

  // ── RANTAI WARNA ──
  {
    gameId: "rantai-warna", title: "Rantai Warna", packageId: "fokus-cepat",
    battleCategory: "fokus-cepat", emoji: "🎨", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateRantaiWarnaQuestion, generateChoices: generateRantaiWarnaChoices,
    validateAnswer: () => false, calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Rantai warna tersambung!" : "❌ Rantai belum tepat.",
  },
  // ── JALUR ANGKA ──
  {
    gameId: "jalur-angka", title: "Jalur Angka", packageId: "logika",
    battleCategory: "logika", emoji: "🔢", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateJalurAngkaQuestion, generateChoices: generateJalurAngkaChoices,
    validateAnswer: () => false, calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Jalur angka benar!" : "❌ Jalur belum tepat.",
  },

  {
    gameId: "family-challenge", title: "Family Challenge", packageId: "keluarga",
    battleCategory: "keluarga", emoji: "👨‍👩‍👧", isAdabGame: false, isBattleEnabled: true,
    supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"],
    generateQuestion: generateHitungQuestion, generateChoices: generateHitungChoices,
    validateAnswer: (q, c) => c.value === q.data.answer,
    calculateScore: (isCorrect, rt, tl, diff) => defaultBattleScore(isCorrect, rt, tl, diff),
    getFeedback: (isCorrect) => isCorrect ? "✅ Tepat!" : "❌ Belum tepat.",
  },
  { gameId: "misi-keluarga", title: "Misi Keluarga", packageId: "keluarga", battleCategory: null, emoji: "🏡", isAdabGame: true, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], generateQuestion: () => ({ type: "adab", data: {} }), generateChoices: () => [], validateAnswer: () => false, calculateScore: () => ({ baseScore: 0, speedBonus: 0, difficultyBonus: 0, efficiencyBonus: 0, finalScore: 0 }), getFeedback: () => "" },
];

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

/** Get all battle-enabled games (excluding adab) */
export function getBattleGames(category?: BattleCategory): BattleGameDefinition[] {
  let games = BATTLE_GAME_POOL.filter(g => g.isBattleEnabled);
  if (category) games = games.filter(g => g.battleCategory === category);
  return games;
}

/** Get a game by ID */
export function getBattleGame(gameId: string): BattleGameDefinition | undefined {
  return BATTLE_GAME_POOL.find(g => g.gameId === gameId);
}

/** Get battle timer for a game type */
export function getBattleTimer(gameId: string, difficulty: DifficultyId): number {
  const timers: Record<string, Record<string, number>> = {
    "hitung-kilat": { tk: 10, "sd-bawah": 7, "sd-atas": 5, smp: 5, sma: 5, universitas: 5 },
    "pola-kilat": { tk: 10, "sd-bawah": 7, "sd-atas": 5, smp: 5, sma: 5, universitas: 5 },
    "ingatan-cepat": { tk: 8, "sd-bawah": 6, "sd-atas": 5, smp: 5, sma: 4, universitas: 4 },
    "cari-yang-berbeda": { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 8, sma: 6, universitas: 6 },
    "detektif-petunjuk": { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 8, sma: 7, universitas: 7 },
    "tebak-aturan": { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 8, sma: 7, universitas: 7 },
    "pilih-kesimpulan": { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 8, sma: 7, universitas: 7 },
    "benar-atau-salah": { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 7, sma: 6, universitas: 6 },
    "kode-warna": { tk: 12, "sd-bawah": 10, "sd-atas": 8, smp: 8, sma: 7, universitas: 7 },
    "ubah-posisi": { tk: 15, "sd-bawah": 12, "sd-atas": 10, smp: 10, sma: 8, universitas: 8 },
    "cocokkan-bayangan": { tk: 10, "sd-bawah": 8, "sd-atas": 6, smp: 6, sma: 5, universitas: 5 },
    "jalur-tercepat": { tk: 30, "sd-bawah": 25, "sd-atas": 20, smp: 20, sma: 15, universitas: 15 },
    "family-challenge": { tk: 10, "sd-bawah": 7, "sd-atas": 5, smp: 5, sma: 5, universitas: 5 },
    "rantai-warna": { tk: 15, "sd-bawah": 12, "sd-atas": 10, smp: 10, sma: 8, universitas: 8 },
    "jalur-angka": { tk: 20, "sd-bawah": 15, "sd-atas": 12, smp: 12, sma: 10, universitas: 10 },
  };
  return timers[gameId]?.[difficulty] ?? 7;
}

/** Pick a random game from a category for a round */
export function pickRandomBattleGame(category: BattleCategory): BattleGameDefinition {
  const games = getBattleGames(category);
  return games[Math.floor(Math.random() * games.length)] || getBattleGames("fokus-cepat")[0];
}

/** Pick a random game from ALL battle games for Campuran mode */
export function pickRandomCampuranGame(): BattleGameDefinition {
  const games = BATTLE_GAME_POOL.filter(g => g.isBattleEnabled && g.battleCategory !== "keluarga");
  return games[Math.floor(Math.random() * games.length)] || getBattleGames("fokus-cepat")[0];
}

/** Pick a game for a round in a battle mode (category-based cycling) */
export function pickGameForRound(roundIndex: number, battleCategory: BattleCategory): BattleGameDefinition {
  const games = getBattleGames(battleCategory);
  if (games.length === 0) return getBattleGames("fokus-cepat")[0];
  // Cycle through games in the category
  return games[roundIndex % games.length];
}
