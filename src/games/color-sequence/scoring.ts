/**
 * Color Sequence Path Game — Validator & Scoring
 * 
 * Validates each step and calculates final score.
 */

import type { DifficultyId } from "@/types";
import type { ColorSequenceQuestion, ColorSequenceSession } from "./types";

// ═══════════════════════════════════════════
// Step Validator
// ═══════════════════════════════════════════

export interface StepValidationResult {
  isCorrect: boolean;
  currentStep: number;
  expectedNodeId: string;
  expectedNumber: number;
  isSequenceComplete: boolean;
  isWrongNode: boolean;
  feedback: string;
}

/**
 * Validate a single step. Returns whether the selected node is correct.
 * Uses nodeId-based validation, NOT visual index.
 */
export function validateColorSequenceStep(
  question: ColorSequenceQuestion,
  session: ColorSequenceSession,
  nodeId: string
): StepValidationResult {
  const { sequenceNodeIds, sequenceNumbers } = question;
  const currentStep = session.selectedNodeIds.length;
  const expectedNodeId = sequenceNodeIds[currentStep];
  const expectedNumber = sequenceNumbers[currentStep];

  // Check if this node is the expected one
  const isCorrect = nodeId === expectedNodeId;

  if (isCorrect) {
    const newLength = currentStep + 1;
    return {
      isCorrect: true,
      currentStep: newLength,
      expectedNodeId,
      expectedNumber,
      isSequenceComplete: newLength >= sequenceNodeIds.length,
      isWrongNode: false,
      feedback: newLength >= sequenceNodeIds.length
        ? "Hebat! Kamu berhasil menyusun Rantai Warna. 🎉"
        : "Benar! Lanjutkan ke warna berikutnya. ✨",
    };
  }

  // Wrong — find which node was expected vs what was picked
  const wrongNode = question.nodes.find(n => n.id === nodeId);
  return {
    isCorrect: false,
    currentStep,
    expectedNodeId,
    expectedNumber,
    isSequenceComplete: false,
    isWrongNode: true,
    feedback: wrongNode
      ? `Ini warna ${wrongNode.colorName} (#${wrongNode.number}). Cari warna #${expectedNumber}.`
      : "Ikuti urutan angka dari kiri ke kanan.",
  };
}

// ═══════════════════════════════════════════
// Scoring
// ═══════════════════════════════════════════

interface SpeedBand {
  maxMsPerStep: number;
  label: string;
  bonus: number;
}

function getSpeedBand(elapsedMs: number, totalSteps: number): SpeedBand {
  const msPerStep = elapsedMs / Math.max(totalSteps, 1);

  if (msPerStep < 800) return { maxMsPerStep: 800, label: "Sangat Cepat ⚡", bonus: 100 };
  if (msPerStep < 1500) return { maxMsPerStep: 1500, label: "Cepat 🏃", bonus: 75 };
  if (msPerStep < 3000) return { maxMsPerStep: 3000, label: "Normal 👍", bonus: 50 };
  if (msPerStep < 6000) return { maxMsPerStep: 6000, label: "Lambat 🐢", bonus: 25 };
  return { maxMsPerStep: Infinity, label: "Sangat Lambat 💤", bonus: 10 };
}

function getDifficultyBonus(difficulty: DifficultyId): number {
  const map: Record<string, number> = {
    tk: 0,
    "sd-bawah": 10,
    "sd-atas": 20,
    smp: 30,
    sma: 40,
    universitas: 50,
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
  totalScore: number;
}

/**
 * Calculate final score for a completed session.
 */
export function calculateColorSequenceScore(
  session: ColorSequenceSession,
  difficulty: DifficultyId
): ScoreResult {
  const { totalSteps, selectedNodeIds, mistakes, elapsedTimeMs } = session;

  // Guard against empty
  if (totalSteps === 0) {
    return {
      baseScore: 0, accuracy: 0, accuracyBonus: 0,
      speedBonus: 0, speedLabel: "—", difficultyBonus: 0,
      mistakePenalty: 0, totalScore: 0,
    };
  }

  const baseScore = 100;

  // Accuracy
  const correctSteps = selectedNodeIds.length;
  const accuracy = correctSteps / totalSteps;
  const accuracyBonus = Math.round(100 * accuracy);

  // Speed
  const speedBand = getSpeedBand(elapsedTimeMs, totalSteps);
  const speedBonus = speedBand.bonus;

  // Difficulty
  const difficultyBonus = getDifficultyBonus(difficulty);

  // Mistake penalty
  const mistakePenalty = mistakes * 10;

  // Total
  let totalScore = baseScore + accuracyBonus + speedBonus + difficultyBonus - mistakePenalty;

  // Clamp: minimum 10
  totalScore = Math.max(10, totalScore);

  return {
    baseScore,
    accuracy: Math.round(accuracy * 100),
    accuracyBonus,
    speedBonus,
    speedLabel: speedBand.label,
    difficultyBonus,
    mistakePenalty,
    totalScore,
  };
}

/**
 * Create initial session for a question.
 */
export function createSession(question: ColorSequenceQuestion): ColorSequenceSession {
  return {
    questionId: question.id,
    startedAt: Date.now(),
    elapsedTimeMs: 0,
    selectedNodeIds: [],
    mistakes: 0,
    totalSteps: question.sequenceNodeIds.length,
    isCompleted: false,
    score: 0,
    accuracy: 0,
    speedBonus: 0,
    difficultyBonus: 0,
  };
}
