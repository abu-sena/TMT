/**
 * Color Sequence Path Game — Types
 * 
 * "Rantai Warna" — Hubungkan warna sesuai urutan angka.
 */

import type { DifficultyId } from "@/types";

export interface ColorNode {
  id: string;
  number: number;        // 1-based legend number
  colorName: string;
  colorHex: string;
  x: number;             // position within arena (0-1 normalized)
  y: number;             // position within arena (0-1 normalized)
  radius: number;        // visual radius in px
  isDistractor?: boolean; // not part of the sequence
}

export type ColorSequenceMode = "normal" | "reverse" | "memory";

export interface ColorSequenceQuestion {
  id: string;
  difficulty: DifficultyId;
  nodes: ColorNode[];
  sequenceNumbers: number[];      // e.g., [1, 6, 2, 7, 3, 8]
  sequenceNodeIds: string[];      // ordered node IDs matching sequenceNumbers
  allowRepeat: boolean;
  hasDistractor: boolean;
  mode: ColorSequenceMode;
  arenaRadius: number;            // px
  nodeRadius: number;             // px (varies by difficulty)
  createdAt: string;
}

export interface ColorSequenceStep {
  stepIndex: number;              // 0-based, which step in the sequence
  expectedNodeId: string;
  expectedNumber: number;
  selectedNodeId: string | null;
  isCorrect: boolean;
  isDone: boolean;
}

export interface ColorSequenceSession {
  questionId: string;
  startedAt: number;
  completedAt?: number;
  elapsedTimeMs: number;
  selectedNodeIds: string[];      // ordered, correctly selected
  mistakes: number;
  totalSteps: number;
  isCompleted: boolean;
  score: number;
  accuracy: number;
  speedBonus: number;
  difficultyBonus: number;
}
