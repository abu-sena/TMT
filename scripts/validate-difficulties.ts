/**
 * validate-difficulties.ts
 *
 * Validates difficulty levels across the entire project:
 * - Only 6 valid difficulties: tk, sd-bawah, sd-atas, smp, sma, universitas
 * - No old names (sd-kecil, sd-muda) in active code/data
 * - All missions reference valid difficulties
 * - All worlds reference valid difficulties
 * - All mini-games reference valid difficulties
 */

import { DIFFICULTIES, DIFFICULTY_ORDER } from "../src/types";
import { MISSIONS } from "../src/data/missions";
import { ALL_WORLDS, WORLDS_BY_DIFFICULTY } from "../src/data/worlds";
import { MINI_GAMES } from "../src/data/minigame-definitions";

const VALID_DIFFICULTIES = new Set<string>(["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"]);
const OLD_NAMES = ["sd-kecil", "sd-muda", "SD Kecil", "SD Muda"];

function main() {
  console.log("🔍 Validating difficulty levels...\n");

  // 1. Check DIFFICULTIES constant has exactly 6 entries
  if (DIFFICULTIES.length !== 6) {
    console.error(`❌ DIFFICULTIES has ${DIFFICULTIES.length} entries, expected 6`);
  } else {
    console.log("✅ DIFFICULTIES has exactly 6 entries");
  }

  // 2. Check DIFFICULTY_ORDER has exactly 6 entries
  if (DIFFICULTY_ORDER.length !== 6) {
    console.error(`❌ DIFFICULTY_ORDER has ${DIFFICULTY_ORDER.length} entries, expected 6`);
  } else {
    console.log("✅ DIFFICULTY_ORDER has exactly 6 entries");
  }

  // 3. Validate all mission difficulties
  const missionErrors: string[] = [];
  for (const m of MISSIONS) {
    if (!VALID_DIFFICULTIES.has(m.difficulty)) {
      missionErrors.push(`Mission ${m.id} has invalid difficulty: "${m.difficulty}"`);
    }
  }
  if (missionErrors.length === 0) {
    console.log(`✅ All ${MISSIONS.length} missions have valid difficulties`);
  } else {
    console.log(`❌ ${missionErrors.length} missions have invalid difficulties:`);
    missionErrors.forEach(e => console.log(`  - ${e}`));
  }

  // 4. Validate all world difficulties
  const worldErrors: string[] = [];
  for (const w of ALL_WORLDS) {
    if (!VALID_DIFFICULTIES.has(w.difficulty)) {
      worldErrors.push(`World ${w.id} has invalid difficulty: "${w.difficulty}"`);
    }
  }
  if (worldErrors.length === 0) {
    console.log(`✅ All ${ALL_WORLDS.length} worlds have valid difficulties`);
  } else {
    console.log(`❌ ${worldErrors.length} worlds have invalid difficulties:`);
    worldErrors.forEach(e => console.log(`  - ${e}`));
  }

  // 5. Check WORLDS_BY_DIFFICULTY keys
  const worldKeys = Object.keys(WORLDS_BY_DIFFICULTY);
  const invalidWorldKeys = worldKeys.filter(k => !VALID_DIFFICULTIES.has(k));
  if (invalidWorldKeys.length === 0) {
    console.log("✅ WORLDS_BY_DIFFICULTY has only valid difficulty keys");
  } else {
    console.log(`❌ WORLDS_BY_DIFFICULTY has invalid keys: ${invalidWorldKeys.join(", ")}`);
  }

  // 6. Validate mini-game supported difficulties
  const miniGameErrors: string[] = [];
  for (const mg of MINI_GAMES) {
    for (const d of mg.supportedDifficulties) {
      if (!VALID_DIFFICULTIES.has(d)) {
        miniGameErrors.push(`Mini-game ${mg.id} references invalid difficulty: "${d}"`);
      }
    }
  }
  if (miniGameErrors.length === 0) {
    console.log(`✅ All ${MINI_GAMES.length} mini-games have valid supported difficulties`);
  } else {
    console.log(`❌ ${miniGameErrors.length} mini-games have invalid difficulties:`);
    miniGameErrors.forEach(e => console.log(`  - ${e}`));
  }

  // Summary
  const totalErrors = missionErrors.length + worldErrors.length + invalidWorldKeys.length + miniGameErrors.length;
  console.log(`\n${totalErrors === 0 ? "✅ All difficulty validations passed!" : `❌ ${totalErrors} errors found`}`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
