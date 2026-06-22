/**
 * Color Sequence Path Game — Generator
 * 
 * Generates questions for setiap difficulty.
 */

import type { DifficultyId } from "@/types";
import type { ColorNode, ColorSequenceQuestion, ColorSequenceMode } from "./types";

// ═══════════════════════════════════════════
// Color palette — child-friendly, kontras
// ═══════════════════════════════════════════

const COLOR_PALETTE = [
  { name: "merah", hex: "#E53935" },
  { name: "ungu", hex: "#8E24AA" },
  { name: "kuning", hex: "#FDD835" },
  { name: "hijau", hex: "#43A047" },
  { name: "biru muda", hex: "#42A5F5" },
  { name: "abu-abu", hex: "#757575" },
  { name: "oranye", hex: "#FB8C00" },
  { name: "pink", hex: "#EC407A" },
  { name: "biru tua", hex: "#1E3A5F" },
  { name: "coklat", hex: "#795548" },
  { name: "lime", hex: "#7CB342" },
  { name: "cyan", hex: "#00BCD4" },
];

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════
// Difficulty Config
// ═══════════════════════════════════════════

interface DifficultyConfig {
  colorCount: number;       // jumlah warna dalam arena
  sequenceLength: number;   // panjang urutan
  distractorCount: number;  // jumlah warna yang tidak dipakai di sequence
  allowRepeat: boolean;     // boleh warna berulang dalam sequence
  nodeRadius: number;       // px
  arenaRadius: number;      // px
}

const DIFFICULTY_CONFIG: Record<string, DifficultyConfig> = {
  tk:            { colorCount: 3, sequenceLength: 3, distractorCount: 0, allowRepeat: false, nodeRadius: 38, arenaRadius: 130 },
  "sd-bawah":   { colorCount: 5, sequenceLength: 4, distractorCount: 0, allowRepeat: false, nodeRadius: 34, arenaRadius: 140 },
  "sd-atas":    { colorCount: 6, sequenceLength: 5, distractorCount: 1, allowRepeat: false, nodeRadius: 30, arenaRadius: 150 },
  smp:           { colorCount: 8, sequenceLength: 7, distractorCount: 1, allowRepeat: false, nodeRadius: 28, arenaRadius: 155 },
  sma:           { colorCount: 10, sequenceLength: 9, distractorCount: 2, allowRepeat: true,  nodeRadius: 26, arenaRadius: 160 },
  universitas:   { colorCount: 12, sequenceLength: 12, distractorCount: 2, allowRepeat: true,  nodeRadius: 24, arenaRadius: 165 },
};

// ═══════════════════════════════════════════
// Generate node positions around a circle
// ═══════════════════════════════════════════

/**
 * Calculate orbit positions for nodes around a clean circle.
 * Nodes are evenly spaced with optional micro-jitter for natural look.
 * All nodes stay within the arena bounds.
 */
export function calculateOrbitNodePositions(
  nodeCount: number,
  arenaRadius: number,
  nodeRadius: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  // Orbit radius: place nodes at ~44% of arena radius so they stay inside
  const orbitRadius = 0.44;
  // Random starting angle for variety
  const startAngle = Math.random() * Math.PI * 2;

  for (let i = 0; i < nodeCount; i++) {
    const angle = startAngle + (i / nodeCount) * Math.PI * 2;
    // Tiny jitter (max ±2°) for natural look, but still on orbit
    const jitter = (Math.random() - 0.5) * 0.04;
    const finalAngle = angle + jitter;
    const x = 0.5 + Math.cos(finalAngle) * orbitRadius;
    const y = 0.5 + Math.sin(finalAngle) * orbitRadius;
    // Clamp to safe bounds
    positions.push({
      x: Math.max(0.08, Math.min(0.92, x)),
      y: Math.max(0.08, Math.min(0.92, y)),
    });
  }
  return positions;
}

function generateNodePositions(count: number, arenaRadius: number, nodeRadius: number): { x: number; y: number }[] {
  return calculateOrbitNodePositions(count, arenaRadius, nodeRadius);
}

// ═══════════════════════════════════════════
// Main Generator
// ═══════════════════════════════════════════

export function generateColorSequenceQuestion(
  difficulty: DifficultyId,
  mode: ColorSequenceMode = "normal"
): ColorSequenceQuestion {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG["sd-atas"];

  // 1. Pick colors from palette
  const shuffledPalette = shuffleArray(COLOR_PALETTE);
  const usedColors = shuffledPalette.slice(0, cfg.colorCount);

  // Assign number to each color
  const colorMap = usedColors.map((c, i) => ({
    number: i + 1,
    colorName: c.name,
    colorHex: c.hex,
  }));

  // 2. Generate sequence
  let sequenceNumbers: number[];
  if (cfg.allowRepeat) {
    // For SMA/Universitas, allow repeats, but not consecutively
    sequenceNumbers = [];
    for (let i = 0; i < cfg.sequenceLength; i++) {
      let num: number;
      do {
        num = Math.floor(Math.random() * cfg.colorCount) + 1;
      } while (i > 0 && num === sequenceNumbers[i - 1]);
      sequenceNumbers.push(num);
    }
  } else {
    // No repeats: pick unique numbers
    const available = [...Array(cfg.colorCount).keys()].map(i => i + 1);
    sequenceNumbers = shuffleArray(available).slice(0, cfg.sequenceLength);
  }

  // 3. Generate positions
  const positions = generateNodePositions(cfg.colorCount, cfg.arenaRadius, cfg.nodeRadius);

  // 4. Create nodes
  const nodes: ColorNode[] = colorMap.map((cm, i) => ({
    id: `node-${cm.number}`,
    number: cm.number,
    colorName: cm.colorName,
    colorHex: cm.colorHex,
    x: positions[i].x,
    y: positions[i].y,
    radius: cfg.nodeRadius,
    isDistractor: !sequenceNumbers.includes(cm.number),
  }));

  // If we need distractors but don't have enough from sequence, mark extras
  // The sequence already determines which numbers are used vs distractors

  // 5. Build sequenceNodeIds from sequenceNumbers
  const sequenceNodeIds = sequenceNumbers.map(num => `node-${num}`);

  return {
    id: crypto.randomUUID(),
    difficulty,
    nodes,
    sequenceNumbers,
    sequenceNodeIds,
    allowRepeat: cfg.allowRepeat,
    hasDistractor: nodes.some(n => n.isDistractor),
    mode,
    arenaRadius: cfg.arenaRadius,
    nodeRadius: cfg.nodeRadius,
    createdAt: new Date().toISOString(),
  };
}

/** Get difficulty config (for display purposes) */
export function getDifficultyConfig(difficulty: DifficultyId): DifficultyConfig {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG["sd-atas"];
}

/** Get label for number of colors */
export function getColorCountForDifficulty(difficulty: DifficultyId): number {
  return DIFFICULTY_CONFIG[difficulty]?.colorCount ?? 6;
}

/** Get label for sequence length */
export function getSequenceLengthForDifficulty(difficulty: DifficultyId): number {
  return DIFFICULTY_CONFIG[difficulty]?.sequenceLength ?? 5;
}
