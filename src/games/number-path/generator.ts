/**
 * Number Path Puzzle — Generator
 * 
 * Menghasilkan puzzle jalur angka berdasarkan difficulty.
 * Uses a linear calculation approach: generates a valid sequence,
 * hides some numbers as input cells, renders into grid layout.
 */

import type { DifficultyId } from "@/types";
import type {
  NumberPathCell, NumberPathQuestion, NumberPathCellType,
  NumberPathOperator, ValidationMode
} from "./types";

// ═══════════════════════════════════════════
// Difficulty Config
// ═══════════════════════════════════════════

interface DifficultyConfig {
  pathLength: number;       // total cells in path (incl operators)
  inputCount: number;       // how many cells are hidden for input
  minNumber: number;
  maxNumber: number;
  allowNegative: boolean;
  allowMultiply: boolean;
  allowDivide: boolean;
  validationMode: ValidationMode;
  label: string;
}

const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  tk:            { pathLength: 6,   inputCount: 2,  minNumber: 1,  maxNumber: 10,  allowNegative: false, allowMultiply: false, allowDivide: false, validationMode: "instant",    label: "Jalur Angka Ceria" },
  "sd-bawah":   { pathLength: 10,  inputCount: 3,  minNumber: 1,  maxNumber: 20,  allowNegative: false, allowMultiply: false, allowDivide: false, validationMode: "instant",    label: "Jalur Angka" },
  "sd-atas":    { pathLength: 16,  inputCount: 5,  minNumber: 1,  maxNumber: 100, allowNegative: false, allowMultiply: true,  allowDivide: false, validationMode: "after_submit", label: "Jalur Angka" },
  smp:           { pathLength: 22,  inputCount: 7,  minNumber: -50, maxNumber: 200, allowNegative: true,  allowMultiply: true,  allowDivide: true,  validationMode: "after_submit", label: "Jalur Angka" },
  sma:           { pathLength: 30,  inputCount: 9,  minNumber: -100, maxNumber: 500, allowNegative: true,  allowMultiply: true,  allowDivide: true,  validationMode: "after_submit", label: "Jalur Angka" },
  universitas:   { pathLength: 40,  inputCount: 12, minNumber: -200, maxNumber: 1000, allowNegative: true,  allowMultiply: true,  allowDivide: true,  validationMode: "after_submit", label: "Jalur Angka" },
};

// ═══════════════════════════════════════════
// Generator
// ═══════════════════════════════════════════

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a number path puzzle.
 * 
 * Approach: create a linear equation sequence, then hide some values,
 * then render into a grid layout.
 */
export function generateNumberPathPuzzle(difficulty: DifficultyId): NumberPathQuestion {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG["sd-atas"];

  // 1. Available operators
  const ops: NumberPathOperator[] = ["+", "-"];
  if (cfg.allowMultiply) ops.push("×");
  if (cfg.allowDivide) ops.push("÷");

  // 2. Generate a solvable linear sequence
  // Format: value → op → value → op → value → ... → target
  // Number of values = (pathLength / 2) rounded up, interspersed with operators
  const valueCount = Math.ceil(cfg.pathLength / 2);
  
  // Start with initial value
  let currentValue = randInt(cfg.minNumber, cfg.maxNumber);
  const valuePath: number[] = [currentValue];
  const operatorPath: NumberPathOperator[] = [];
  const calculations: string[] = [String(currentValue)];

  for (let i = 1; i < valueCount; i++) {
    const op = pickRandom(ops);
    operatorPath.push(op);
    
    let nextValue: number;
    if (op === "+") {
      nextValue = randInt(Math.max(1, cfg.minNumber), cfg.maxNumber);
      currentValue = currentValue + nextValue;
    } else if (op === "-") {
      // Ensure result stays in range
      const maxSub = Math.min(currentValue - cfg.minNumber, cfg.maxNumber);
      nextValue = randInt(Math.max(1, cfg.minNumber > 0 ? 1 : -cfg.maxNumber), Math.max(1, maxSub));
      currentValue = currentValue - nextValue;
    } else if (op === "×") {
      nextValue = randInt(2, Math.min(12, cfg.maxNumber));
      currentValue = currentValue * nextValue;
    } else { // ÷
      // Find a divisor that gives integer result
      const divisors: number[] = [];
      const absCur = Math.abs(currentValue);
      for (let d = 2; d <= Math.min(absCur, 12); d++) {
        if (absCur % d === 0) divisors.push(d);
      }
      if (divisors.length === 0) {
        // Fallback to +
        nextValue = randInt(1, Math.min(10, cfg.maxNumber));
        currentValue = currentValue + nextValue;
        operatorPath[operatorPath.length - 1] = "+";
      } else {
        nextValue = pickRandom(divisors);
        currentValue = currentValue / nextValue;
      }
    }
    
    // Clamp to valid range
    currentValue = Math.max(cfg.minNumber, Math.min(cfg.maxNumber, currentValue));
    valuePath.push(nextValue);
    calculations.push(String(op), String(nextValue));
  }

  // Store final value as target
  const targetValue = currentValue;

  // 3. Decide which values to hide as input cells
  const totalValues = valuePath.length;
  const inputCount = Math.min(cfg.inputCount, totalValues - 1); // don't hide all
  const hideIndices = shuffleArray([...Array(totalValues).keys()])
    .slice(0, inputCount);
  const hideSet = new Set(hideIndices);

  // 4. Build cells for the path
  const cells: NumberPathCell[] = [];
  const pathCellIds: string[] = [];
  const inputCellIds: string[] = [];
  const solutionMap: Record<string, number> = {};

  let orderIndex = 0;
  for (let i = 0; i < valuePath.length; i++) {
    // Value cell
    const cellId = `cell-${orderIndex}`;
    const isHidden = hideSet.has(i);
    const val = valuePath[i];
    
    const cell: NumberPathCell = {
      id: cellId,
      row: 0, // will be laid out later
      col: 0,
      type: isHidden ? "input" : "fixed_number",
      value: isHidden ? undefined : val,
      expectedValue: val,
      editable: isHidden,
      orderIndex,
      isRequired: isHidden,
    };

    cells.push(cell);
    pathCellIds.push(cellId);
    if (isHidden) {
      inputCellIds.push(cellId);
      solutionMap[cellId] = val;
    }
    orderIndex++;

    // Operator cell (between values)
    if (i < operatorPath.length) {
      const opId = `cell-${orderIndex}`;
      const opCell: NumberPathCell = {
        id: opId,
        row: 0, col: 0,
        type: "operator",
        value: operatorPath[i],
        editable: false,
        orderIndex,
        operator: operatorPath[i],
      };
      cells.push(opCell);
      pathCellIds.push(opId);
      orderIndex++;
    }
  }

  // Add target/checkpoint cell at end (optional display)
  const targetCellId = `cell-${orderIndex}`;
  const targetCell: NumberPathCell = {
    id: targetCellId,
    row: 0, col: 0,
    type: "target",
    value: targetValue,
    expectedValue: targetValue,
    editable: false,
    orderIndex,
  };
  cells.push(targetCell);
  pathCellIds.push(targetCellId);
  orderIndex++;

  // 5. Layout cells into a snake-path grid for clear sequential reading
  // Use a compact snake layout: each row goes left→right or right→left
  const cols = Math.min(5, Math.ceil(orderIndex / 2) + 1);
  let row = 0, col = 0, dir = 1;
  for (let i = 0; i < cells.length; i++) {
    cells[i].row = row;
    cells[i].col = col;
    col += dir;
    if (col >= cols || col < 0) {
      dir *= -1;
      col += dir;
      row++;
    }
  }

  // Add connector data: for each pair of adjacent path cells, store fromCellId→toCellId
  const connectors: { from: string; to: string }[] = [];
  for (let i = 0; i < pathCellIds.length - 1; i++) {
    connectors.push({ from: pathCellIds[i], to: pathCellIds[i + 1] });
  }

  return {
    id: crypto.randomUUID(),
    difficulty,
    title: cfg.label,
    instruction: "Klik kotak \"?\" lalu isi angka yang tepat.",
    rows: row + 1,
    cols,
    cells,
    pathCellIds,
    inputCellIds,
    targetValue,
    solutionMap,
    connectors,
    allowNegative: cfg.allowNegative,
    allowDecimal: false,
    validationMode: cfg.validationMode,
    createdAt: new Date().toISOString(),
  };
}

export function getDifficultyConfig(difficulty: DifficultyId): DifficultyConfig {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG["sd-atas"];
}
