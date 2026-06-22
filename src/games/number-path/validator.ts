/**
 * Number Path Puzzle — Validator & Scoring
 */

import type { DifficultyId } from "@/types";
import type { NumberPathQuestion, NumberPathSession } from "./types";

// ═══════════════════════════════════════════
// Input Validation
// ═══════════════════════════════════════════

export interface InputValidationResult {
  isValid: boolean;
  parsedNumber: number | null;
  error: string | null;
}

/**
 * Validate raw user input for a cell.
 */
export function validateNumericInput(
  rawInput: string,
  allowNegative: boolean,
  allowDecimal: boolean
): InputValidationResult {
  const trimmed = rawInput.trim();

  if (trimmed === "") {
    return { isValid: false, parsedNumber: null, error: "Masukkan angka." };
  }

  // Reject non-numeric (except leading minus when allowed)
  if (allowNegative && allowDecimal) {
    if (!/^-?\d*\.?\d*$/.test(trimmed)) {
      return { isValid: false, parsedNumber: null, error: "Masukkan angka saja." };
    }
  } else if (allowNegative) {
    if (!/^-?\d+$/.test(trimmed)) {
      return { isValid: false, parsedNumber: null, error: "Masukkan angka bulat (boleh negatif)." };
    }
  } else {
    if (!/^\d+$/.test(trimmed)) {
      return { isValid: false, parsedNumber: null, error: "Gunakan angka positif saja." };
    }
  }

  const num = Number(trimmed);
  if (isNaN(num) || !isFinite(num)) {
    return { isValid: false, parsedNumber: null, error: "Masukkan angka yang valid." };
  }

  return { isValid: true, parsedNumber: num, error: null };
}

// ═══════════════════════════════════════════
// Puzzle Validation
// ═══════════════════════════════════════════

export interface CellValidationResult {
  cellId: string;
  isCorrect: boolean;
  userValue: string;
  expectedValue: number;
}

export interface PuzzleValidationResult {
  allCorrect: boolean;
  cellResults: CellValidationResult[];
  correctCount: number;
  totalInputs: number;
  isComplete: boolean;
  message: string;
}

/**
 * Validate all user inputs against the solution map.
 */
export function validateNumberPathPuzzle(
  question: NumberPathQuestion,
  session: NumberPathSession
): PuzzleValidationResult {
  const cellResults: CellValidationResult[] = [];
  let correctCount = 0;

  for (const cellId of question.inputCellIds) {
    const userVal = session.userInputs[cellId] || "";
    const expected = question.solutionMap[cellId];
    const trimmed = userVal.trim();

    const isCorrect = trimmed !== "" && Number(trimmed) === expected;
    if (isCorrect) correctCount++;

    cellResults.push({
      cellId,
      isCorrect,
      userValue: trimmed,
      expectedValue: expected,
    });
  }

  const totalInputs = question.inputCellIds.length;
  const allCorrect = correctCount === totalInputs && totalInputs > 0;

  let message: string;
  if (allCorrect) {
    message = "🎉 Hebat! Semua kotak benar. Jalur angka tersambung sempurna!";
  } else if (correctCount === 0) {
    message = "Coba isi kotak kosong dengan angka yang tepat.";
  } else if (totalInputs - correctCount === 1) {
    message = `Hampir! Masih ada 1 kotak yang perlu diperbaiki.`;
  } else {
    message = `Ada ${totalInputs - correctCount} kotak yang perlu diperbaiki.`;
  }

  return {
    allCorrect,
    cellResults,
    correctCount,
    totalInputs,
    isComplete: allCorrect,
    message,
  };
}

/**
 * Check if all required inputs are filled (not empty).
 */
export function areAllInputsFilled(
  question: NumberPathQuestion,
  session: NumberPathSession
): boolean {
  for (const cellId of question.inputCellIds) {
    const val = session.userInputs[cellId] || "";
    if (val.trim() === "") return false;
  }
  return true;
}

// ═══════════════════════════════════════════
// Scoring
// ═══════════════════════════════════════════

interface SpeedBand {
  maxMsPerInput: number;
  label: string;
  bonus: number;
}

function getSpeedBand(elapsedMs: number, totalInputs: number): SpeedBand {
  const msPerInput = elapsedMs / Math.max(totalInputs, 1);
  if (msPerInput < 2000) return { maxMsPerInput: 2000, label: "Sangat Cepat ⚡", bonus: 100 };
  if (msPerInput < 5000) return { maxMsPerInput: 5000, label: "Cepat 🏃", bonus: 75 };
  if (msPerInput < 10000) return { maxMsPerInput: 10000, label: "Normal 👍", bonus: 50 };
  if (msPerInput < 20000) return { maxMsPerInput: 20000, label: "Lambat 🐢", bonus: 25 };
  return { maxMsPerInput: Infinity, label: "Sangat Lambat 💤", bonus: 10 };
}

function getDifficultyBonus(difficulty: DifficultyId): number {
  const map: Record<string, number> = {
    tk: 0, "sd-bawah": 10, "sd-atas": 20, smp: 30, sma: 40, universitas: 50,
  };
  return map[difficulty] ?? 20;
}

export interface ScoreResult {
  baseScore: number;
  accuracy: number;
  accuracyBonus: number;
  speedBonus: number;
  speedLabel: string;
  difficultyBonus: number;
  mistakePenalty: number;
  hintPenalty: number;
  totalScore: number;
}

export function calculateNumberPathScore(
  correctCount: number,
  totalInputs: number,
  elapsedMs: number,
  mistakes: number,
  hintsUsed: number,
  difficulty: DifficultyId
): ScoreResult {
  const baseScore = 100;
  const accuracy = totalInputs > 0 ? correctCount / totalInputs : 0;
  const accuracyBonus = Math.round(100 * accuracy);
  const speedBand = getSpeedBand(elapsedMs, totalInputs);
  const difficultyBonus = getDifficultyBonus(difficulty);
  const mistakePenalty = mistakes * 10;
  const hintPenalty = hintsUsed * 15;

  let totalScore = baseScore + accuracyBonus + speedBand.bonus + difficultyBonus - mistakePenalty - hintPenalty;
  totalScore = Math.max(10, totalScore);

  return {
    baseScore,
    accuracy: Math.round(accuracy * 100),
    accuracyBonus,
    speedBonus: speedBand.bonus,
    speedLabel: speedBand.label,
    difficultyBonus,
    mistakePenalty,
    hintPenalty,
    totalScore,
  };
}

export function createSession(question: NumberPathQuestion): NumberPathSession {
  return {
    questionId: question.id,
    startedAt: Date.now(),
    elapsedTimeMs: 0,
    userInputs: {},
    mistakes: 0,
    hintsUsed: 0,
    isCompleted: false,
    score: 0,
    accuracy: 0,
    speedBonus: 0,
    difficultyBonus: 0,
  };
}
