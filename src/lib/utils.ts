import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ═══════════════════════════════════════════════════════════════
// Fisher-Yates Shuffle & Choice Utilities
// ═══════════════════════════════════════════════════════════════

/** Fisher-Yates shuffle — returns new array, does not mutate original. */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Create shuffled choices for multiple choice missions.
 * Preserves original option data (id, label, emoji, etc.) but randomizes order.
 * Only shuffles once per question creation; stable across re-renders.
 */
export function createShuffledChoices<T extends { id: string }>(options: T[]): T[] {
  return shuffleArray(options);
}

/**
 * Validate that shuffled choices contain the correct answer and are unique.
 */
export function validateChoices(
  choices: { id: string }[],
  correctAnswerId: string,
): { valid: boolean; reason?: string } {
  if (!choices || choices.length === 0) {
    return { valid: false, reason: "Choices array is empty" };
  }

  // Check correct answer is present
  const hasCorrect = choices.some((c) => c.id === correctAnswerId);
  if (!hasCorrect) {
    return { valid: false, reason: `Correct answer "${correctAnswerId}" not found in choices` };
  }

  // Check no duplicates
  const ids = choices.map((c) => c.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return { valid: false, reason: "Duplicate choice IDs detected" };
  }

  return { valid: true };
}

/**
 * Ensure the returned choices are unique (by id).
 */
export function ensureUniqueChoices<T extends { id: string }>(choices: T[]): T[] {
  const seen = new Set<string>();
  return choices.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}
