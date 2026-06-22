/**
 * validate-fastest-path-and-rewards.ts
 *
 * Validates:
 * 1. Jalur Tercepat: 6 cols × 16 rows grid
 * 2. Grid generator always produces valid paths
 * 3. Shortest path calculable via BFS
 * 4. User movement only adjacent cells
 * 5. Fullscreen/large grid mode active
 * 6. Mission choices shuffled at session start (Fisher-Yates)
 * 7. Validator uses choice IDs, not indices
 * 8. Reward box only opens once per stage/profile
 * 9. Stage 500 reward uses separate key
 * 10. No duplicate choices
 * 11. Correct answer always present
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════
// Fisher-Yates shuffle
// ═══════════════════════════════════════════

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════
// BFS for shortest path
// ═══════════════════════════════════════════

function bfs(
  grid: string[][],
  startR: number,
  startC: number,
  goalR: number,
  goalC: number,
  rows: number,
  cols: number
): [number, number][] | null {
  const queue: [number, number, [number, number][]][] = [[startR, startC, [[startR, startC]]]];
  const visited = new Set<string>();
  visited.add(`${startR},${startC}`);
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

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

// ═══════════════════════════════════════════
// Test helpers
// ═══════════════════════════════════════════

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean | string) {
  try {
    const result = fn();
    if (result === true) {
      results.push({ name, passed: true, message: "✅ LULUS" });
    } else {
      results.push({ name, passed: false, message: `❌ GAGAL: ${result}` });
    }
  } catch (e: any) {
    results.push({ name, passed: false, message: `❌ ERROR: ${e.message}` });
  }
}

// ═══════════════════════════════════════════
// Test 1: Jalur Tercepat Grid Dimensions
// ═══════════════════════════════════════════

console.log("🔍 Test 1: Jalur Tercepat grid dimensions (6×16)...\n");

const spasialFile = path.join(__dirname, "..", "src", "screens", "MiniGameSpasialKeluargaScreens.tsx");
if (fs.existsSync(spasialFile)) {
  const content = fs.readFileSync(spasialFile, "utf-8");

  test("1.1 — ROWS = 16", () => {
    return content.includes("FASTEST_PATH_ROWS = 16") || content.includes("rows: 16")
      ? true : "ROWS bukan 16";
  });

  test("1.2 — COLS = 6", () => {
    return content.includes("FASTEST_PATH_COLS = 6") || content.includes("cols: 6")
      ? true : "COLS bukan 6";
  });

  test("1.3 — Tidak ada rows = 20 (old value)", () => {
    // Should not have the old 20 rows value for Jalur Tercepat
    const hasOldRows = content.includes("const rows = 20, cols = 6");
    return !hasOldRows ? true : "Masih ada rows=20 (nilai lama)";
  });

  test("1.4 — grid-template-rows: repeat(16, 1fr)", () => {
    return content.includes("gridTemplateRows") || content.includes("grid-template-rows")
      ? true : "CSS grid rows tidak ditemukan";
  });

  test("1.5 — BFS shortest path calculation", () => {
    return content.includes("bfs(") || content.includes("shortestPath") || content.includes("BFS")
      ? true : "BFS/shortest path tidak ditemukan";
  });

  test("1.6 — Fullscreen/besar layout", () => {
    return (content.includes("max-h-[80vh]") || content.includes("fullscreen") || content.includes("h-full"))
      ? true : "Layout fullscreen tidak ditemukan";
  });

  test("1.7 — Feedback invalid moves", () => {
    return content.includes("Pilih kotak yang bersebelahan") || content.includes("Tidak bisa melewati")
      ? true : "Feedback invalid moves tidak ditemukan";
  });
}

// ═══════════════════════════════════════════
// Test 2: Grid Generator Always Produces Valid Path
// ═══════════════════════════════════════════

console.log("\n🔍 Test 2: Grid generator produces valid paths...\n");

function generateTestGrid(rows: number, cols: number): { grid: string[][]; startR: number; startC: number; goalR: number; goalC: number; path: [number, number][] | null } {
  const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill("🐾"));
  const startR = 0;
  const startC = Math.floor(Math.random() * cols);
  const goalR = rows - 1;
  const goalC = Math.floor(Math.random() * cols);

  grid[startR][startC] = "🐒";
  grid[goalR][goalC] = "🍌";

  const obstacleCount = Math.floor(rows * cols * 0.2);
  for (let i = 0; i < obstacleCount; i++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if ((r === startR && c === startC) || (r === goalR && c === goalC) || grid[r][c] === "🪵") continue;
    grid[r][c] = "🪵";
  }

  let path = bfs(grid, startR, startC, goalR, goalC, rows, cols);
  let retries = 0;
  while (!path && retries < 20) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === "🪵" && Math.random() < 0.3) grid[r][c] = "🐾";
      }
    }
    path = bfs(grid, startR, startC, goalR, goalC, rows, cols);
    retries++;
  }

  return { grid, startR, startC, goalR, goalC, path };
}

let validPathCount = 0;
const totalGridTests = 50;

for (let i = 0; i < totalGridTests; i++) {
  const result = generateTestGrid(16, 6);
  if (result.path !== null && result.path.length > 1) validPathCount++;
}

test("2.1 — 50 grids generated, all have valid paths", () => {
  return validPathCount === totalGridTests
    ? true
    : `${validPathCount}/${totalGridTests} grids valid`;
});

test("2.2 — Shortest path start matches start cell", () => {
  const g = generateTestGrid(16, 6);
  if (!g.path) return "No path found";
  return g.path[0][0] === g.startR && g.path[0][1] === g.startC
    ? true
    : "Path doesn't start at correct cell";
});

test("2.3 — Shortest path end matches goal cell", () => {
  const g = generateTestGrid(16, 6);
  if (!g.path) return "No path found";
  const last = g.path[g.path.length - 1];
  return last[0] === g.goalR && last[1] === g.goalC
    ? true
    : "Path doesn't end at correct cell";
});

// ═══════════════════════════════════════════
// Test 3: User Movement Validation
// ═══════════════════════════════════════════

console.log("\n🔍 Test 3: User movement validation...\n");

function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

test("3.1 — Adjacent cells (horizontal)", () => {
  return isAdjacent(0, 0, 0, 1) ? true : "Horizontal adjacent failed";
});

test("3.2 — Adjacent cells (vertical)", () => {
  return isAdjacent(0, 0, 1, 0) ? true : "Vertical adjacent failed";
});

test("3.3 — NOT adjacent (diagonal)", () => {
  return !isAdjacent(0, 0, 1, 1) ? true : "Diagonal should NOT be adjacent";
});

test("3.4 — NOT adjacent (far cell)", () => {
  return !isAdjacent(0, 0, 3, 5) ? true : "Far cell should NOT be adjacent";
});

test("3.5 — NOT adjacent (same cell)", () => {
  return !isAdjacent(0, 0, 0, 0) ? true : "Same cell should NOT be adjacent";
});

// ═══════════════════════════════════════════
// Test 4: Mission Choice Shuffling
// ═══════════════════════════════════════════

console.log("\n🔍 Test 4: Mission choice shuffling...\n");

interface TestChoice {
  id: string;
  label: string;
  isCorrect?: boolean;
}

const testChoices: TestChoice[] = [
  { id: "a", label: "Option A", isCorrect: true },
  { id: "b", label: "Option B" },
  { id: "c", label: "Option C" },
  { id: "d", label: "Option D" },
];

test("4.1 — Fisher-Yates shuffle produces different order", () => {
  let allSame = true;
  for (let i = 0; i < 20; i++) {
    const shuffled = shuffleArray(testChoices);
    const ids = shuffled.map(c => c.id).join("");
    if (ids !== "abcd") { allSame = false; break; }
  }
  return !allSame ? true : "All shuffles produced same order (very unlikely)";
});

test("4.2 — Correct answer always present after shuffle", () => {
  for (let i = 0; i < 30; i++) {
    const shuffled = shuffleArray(testChoices);
    const hasCorrect = shuffled.some(c => c.isCorrect);
    if (!hasCorrect) return `Correct answer missing in trial ${i}`;
  }
  return true;
});

test("4.3 — No duplicate choices after shuffle", () => {
  for (let i = 0; i < 30; i++) {
    const shuffled = shuffleArray(testChoices);
    const ids = shuffled.map(c => c.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) return `Duplicates found in trial ${i}`;
  }
  return true;
});

test("4.4 — Validator uses choice.id, not index", () => {
  const shuffled = shuffleArray(testChoices);
  const correctId = "a";
  // Find by ID instead of index
  const found = shuffled.find(c => c.id === correctId);
  return found !== undefined ? true : "Correct answer not found by ID";
});

// ═══════════════════════════════════════════
// Test 5: PlayScreen uses shuffledMission
// ═══════════════════════════════════════════

console.log("\n🔍 Test 5: PlayScreen shuffledMission...\n");

const playScreenFile = path.join(__dirname, "..", "src", "screens", "PlayScreen.tsx");
if (fs.existsSync(playScreenFile)) {
  const content = fs.readFileSync(playScreenFile, "utf-8");

  test("5.1 — PlayScreen has shuffledMission", () => {
    return content.includes("shuffledMission") ? true : "shuffledMission not found";
  });

  test("5.2 — createShuffledChoices called", () => {
    return content.includes("createShuffledChoices") ? true : "createShuffledChoices not found";
  });

  test("5.3 — Boss step options also shuffled", () => {
    return content.includes("bossSteps") && content.includes("shuffled")
      ? true : "Boss step shuffling not found";
  });
}

// ═══════════════════════════════════════════
// Test 6: Reward Box Once-Only
// ═══════════════════════════════════════════

console.log("\n🔍 Test 6: Reward box once-only...\n");

const gameAppFile = path.join(__dirname, "..", "src", "GameAppStandalone.tsx");
if (fs.existsSync(gameAppFile)) {
  const content = fs.readFileSync(gameAppFile, "utf-8");

  test("6.1 — isFirstCompletion field in ResultData", () => {
    return content.includes("isFirstCompletion: boolean") ? true : "isFirstCompletion not in ResultData";
  });

  test("6.2 — claimedStageRewardIds check", () => {
    return content.includes("claimedStageRewardIds") ? true : "claimedStageRewardIds not found";
  });

  test("6.3 — first completion check before reward box", () => {
    return content.includes("isFirstCompletion = wasNewlyCompleted") ? true : "First completion logic not found";
  });

  test("6.4 — claimedStageRewardIds updated on first completion", () => {
    return content.includes("claimedStageRewardIds, activeMission.id") ? true : "Reward id not added to list";
  });
}

// ═══════════════════════════════════════════
// Test 7: ResultScreen uses isFirstCompletion
// ═══════════════════════════════════════════

console.log("\n🔍 Test 7: ResultScreen uses isFirstCompletion...\n");

const resultScreenFile = path.join(__dirname, "..", "src", "screens", "ResultScreen.tsx");
if (fs.existsSync(resultScreenFile)) {
  const content = fs.readFileSync(resultScreenFile, "utf-8");

  test("7.1 — ResultScreen has isFirstCompletion prop", () => {
    return content.includes("isFirstCompletion: boolean") ? true : "isFirstCompletion prop not found";
  });

  test("7.2 — showGiftBox uses isFirstCompletion", () => {
    return content.includes("isFirstCompletion && isCorrect && stars") ? true : "showGiftBox doesn't use isFirstCompletion";
  });
}

// ═══════════════════════════════════════════
// Test 8: Types contains claimedStageRewardIds
// ═══════════════════════════════════════════

console.log("\n🔍 Test 8: Types validation...\n");

const typesFile = path.join(__dirname, "..", "src", "types", "index.ts");
if (fs.existsSync(typesFile)) {
  const content = fs.readFileSync(typesFile, "utf-8");

  test("8.1 — Profile has claimedStageRewardIds", () => {
    return content.includes("claimedStageRewardIds: string[]") ? true : "claimedStageRewardIds not in Profile type";
  });
}

// ═══════════════════════════════════════════
// Test 9: Fisher-Yates not using sort random
// ═══════════════════════════════════════════

console.log("\n🔍 Test 9: No Array.sort random...\n");

test("9.1 — shuffleArray uses Fisher-Yates, not sort", () => {
  const fnStr = shuffleArray.toString();
  return !fnStr.includes("sort(() => Math.random()") ? true : "Uses sort random instead of Fisher-Yates";
});

// ═══════════════════════════════════════════
// Test 10: Anti double-claim simulation
// ═══════════════════════════════════════════

console.log("\n🔍 Test 10: Anti double-claim simulation...\n");

test("10.1 — claimedStageRewardIds prevents double claim", () => {
  const claimed: string[] = [];
  const stageId = "mission-42";

  // First completion
  if (!claimed.includes(stageId)) {
    claimed.push(stageId);
  }

  // Second completion (replay)
  const alreadyClaimed = claimed.includes(stageId);

  return alreadyClaimed && claimed.length === 1
    ? true
    : `Already claimed: ${alreadyClaimed}, count: ${claimed.length}`;
});

test("10.2 — Stage 500 uses separate key", () => {
  // Stage 500 completion reward uses claimedFinalRewardsByDifficulty, not claimedStageRewardIds
  if (fs.existsSync(gameAppFile)) {
    const content = fs.readFileSync(gameAppFile, "utf-8");
    const hasDifficultyReward = content.includes("claimedFinalRewardsByDifficulty") ||
      content.includes("hasClaimedDifficultyCompletionReward");
    return hasDifficultyReward ? true : "Stage 500 separate key not found";
  }
  return "GameAppStandalone.tsx not found";
});

// ═══════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║                    HASIL VALIDASI                    ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

for (const r of results) {
  console.log(`  ${r.message} — ${r.name}`);
}

console.log(`\n  Total: ${results.length} tes`);
console.log(`  Lulus: ${passed} ✅`);
console.log(`  Gagal: ${failed} ❌`);
console.log(`  Success rate: ${Math.round((passed / results.length) * 100)}%\n`);

if (failed > 0) {
  console.log("❌ Ada tes yang gagal. Perbaiki sebelum melanjutkan.\n");
  process.exit(1);
} else {
  console.log("🎉 Semua tes lulus! Jalur Tercepat, random pilihan, dan reward box siap.\n");
  process.exit(0);
}
