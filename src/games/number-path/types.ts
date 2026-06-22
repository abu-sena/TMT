/**
 * Number Path Puzzle Game — Types
 * 
 * "Jalur Angka" — Isi kotak kosong agar jalur hitung menjadi benar.
 */

import type { DifficultyId } from "@/types";

export type NumberPathCellType = "fixed_number" | "operator" | "input" | "target" | "checkpoint" | "empty";

export type NumberPathOperator = "+" | "-" | "×" | "÷";

export type ValidationMode = "instant" | "after_submit";

export interface NumberPathCell {
  id: string;
  row: number;
  col: number;
  type: NumberPathCellType;
  value?: number | string;        // display value (number or operator symbol)
  expectedValue?: number;         // expected answer for input cells
  operator?: NumberPathOperator;
  editable: boolean;
  orderIndex: number;             // position in the calculation path
  groupId?: string;
  isRequired?: boolean;
}

export interface NumberPathQuestion {
  id: string;
  difficulty: DifficultyId;
  title: string;
  instruction: string;
  rows: number;
  cols: number;
  cells: NumberPathCell[];
  pathCellIds: string[];           // ordered cell IDs along the calculation path
  inputCellIds: string[];          // cell IDs that need user input
  targetValue?: number;
  checkpointValues?: number[];
  solutionMap: Record<string, number>;  // inputCellId → correct number
  connectors: { from: string; to: string }[];  // path connectors for rendering
  allowNegative: boolean;
  allowDecimal: boolean;
  validationMode: ValidationMode;
  createdAt: string;
}

export interface NumberPathSession {
  questionId: string;
  startedAt: number;
  completedAt?: number;
  elapsedTimeMs: number;
  userInputs: Record<string, string>;  // inputCellId → user-entered string
  mistakes: number;
  hintsUsed: number;
  isCompleted: boolean;
  score: number;
  accuracy: number;
  speedBonus: number;
  difficultyBonus: number;
}
