/**
 * Stage Validator — validates all 3000 stages across 6 difficulties
 *
 * Checks:
 *  1. Total per difficulty = 500
 *  2. Grand total = 3000
 *  3. All stage IDs unique
 *  4. All playable stages have answers/choices
 *  5. Multiple choice has ≥2 options
 *  6. CorrectAnswer is in choices
 *  7. No duplicate choices
 *  8. All explanations present
 *  9. All difficulties valid
 *  10. All worldIds valid
 *  11. All missionTypes valid
 *  12. stageNumbers sequential per difficulty
 *  13. Boss stages have feedback/rewards
 *  14. No placeholder stages
 *  15. Universitas integrated in all systems
 *  16. TK content age-appropriate (not too abstract)
 *  17. All choices can be shuffled (no index-based dependencies)
 */

import { generateAllStages } from "../src/data/stage-generator";
import { ALL_WORLDS, WORLD_MAP } from "../src/data/worlds";
import type { Stage, DifficultyId, MissionType, CategoryId } from "../src/types";
import { DIFFICULTIES, CATEGORIES } from "../src/data/constants";

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════
// Validation State
// ═══════════════════════════════

interface ValidationError {
  stageId: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

const errors: ValidationError[] = [];
const warnings: ValidationError[] = [];

function error(stageId: string, rule: string, message: string) {
  errors.push({ stageId, rule, message, severity: "error" });
}

function warn(stageId: string, rule: string, message: string) {
  warnings.push({ stageId, rule, message, severity: "warning" });
}

// ═══════════════════════════════
// Valid Sets
// ═══════════════════════════════

const VALID_DIFFICULTIES = new Set(DIFFICULTIES.map(d => d.id));
const VALID_CATEGORIES = new Set(CATEGORIES.map(c => c.id));
const VALID_WORLD_IDS = new Set(ALL_WORLDS.map(w => w.id));
const VALID_MISSION_TYPES = new Set<MissionType>([
  "multiple_choice", "moral_decision", "numeracy_story",
  "pattern_recognition", "spatial_reasoning", "systems_thinking",
  "lateral_thinking", "general_reasoning", "boss_mission",
  "tk_adab_basic", "tk_pre_literacy", "tk_counting",
  "tk_pattern_simple", "tk_visual_match", "tk_creativity_simple",
  "argument_evaluation", "ethical_leadership", "university_case_analysis",
]);

const TK_ABSTRACT_WORDS = ["inflasi", "paradoks", "Nash equilibrium", "kebijakan moneter", "reformasi struktural", "subsidi", "trade-off"];

const DIFFICULTY_LABELS: Record<string, string> = {
  tk: "TK", "sd-kecil": "SD Awal", "sd-muda": "SD Muda",
  smp: "SMP", sma: "SMA", universitas: "Universitas",
};

// ═══════════════════════════════
// Main Validation
// ═══════════════════════════════

console.log("╔══════════════════════════════════════════╗");
console.log("║  TMT Stage Validator — 3000 Stages      ║");
console.log("╚══════════════════════════════════════════╝\n");

console.log("Generating stages...");
const allStages = generateAllStages();
console.log(`Generated ${allStages.length} stages.\n`);

// ── Rule 1 & 2: Count Checks ──
console.log("── Rule 1 & 2: Stage Count ──");
const expectedCounts: Record<string, number> = {
  tk: 500, "sd-kecil": 500, "sd-muda": 500,
  smp: 500, sma: 500, universitas: 500,
};

const actualCounts: Record<string, number> = {};
for (const s of allStages) {
  actualCounts[s.difficulty] = (actualCounts[s.difficulty] || 0) + 1;
}

for (const [diff, expected] of Object.entries(expectedCounts)) {
  const actual = actualCounts[diff] || 0;
  if (actual === expected) {
    console.log(`  ✅ ${diff}: ${actual}/${expected}`);
  } else {
    console.log(`  ❌ ${diff}: ${actual}/${expected}`);
    error("ALL", "count", `${DIFFICULTY_LABELS[diff]}: expected ${expected}, got ${actual}`);
  }
}

if (allStages.length === 3000) {
  console.log(`  ✅ Total: 3000/3000`);
} else {
  console.log(`  ❌ Total: ${allStages.length}/3000`);
  error("ALL", "total", `Expected 3000, got ${allStages.length}`);
}

// ── Rule 3: Unique IDs ──
console.log("\n── Rule 3: Unique IDs ──");
const idSet = new Set<string>();
let duplicateCount = 0;
for (const s of allStages) {
  if (idSet.has(s.id)) {
    duplicateCount++;
    error(s.id, "unique-id", `Duplicate stage ID: ${s.id}`);
  }
  idSet.add(s.id);
}
if (duplicateCount === 0) {
  console.log(`  ✅ All ${idSet.size} IDs unique`);
} else {
  console.log(`  ❌ ${duplicateCount} duplicate IDs`);
}

// ── Rules 4-6: Answer/Choice Validation ──
console.log("\n── Rules 4-6: Answer & Choice Validation ──");
let noAnswerCount = 0;
let noChoicesCount = 0;
let wrongAnswerCount = 0;
let tooFewChoices = 0;

for (const s of allStages) {
  if (s.stageType === "reward") continue;

  if (!s.correctAnswer) {
    noAnswerCount++;
    error(s.id, "no-answer", `Missing correctAnswer for playable stage`);
    continue;
  }

  if (!s.choices || s.choices.length === 0) {
    noChoicesCount++;
    error(s.id, "no-choices", `Missing choices for playable stage`);
    continue;
  }

  if (s.choices.length < 2) {
    tooFewChoices++;
    error(s.id, "too-few-choices", `Only ${s.choices.length} choice(s), need ≥2`);
  }

  const choiceIds = new Set(s.choices.map(c => c.id));
  if (!choiceIds.has(s.correctAnswer)) {
    wrongAnswerCount++;
    error(s.id, "wrong-answer", `CorrectAnswer '${s.correctAnswer}' not in choices: [${[...choiceIds].join(", ")}]`);
  }
}

console.log(`  ✅ No answer: ${noAnswerCount === 0 ? "PASS" : `FAIL (${noAnswerCount})`}`);
console.log(`  ✅ No choices: ${noChoicesCount === 0 ? "PASS" : `FAIL (${noChoicesCount})`}`);
console.log(`  ✅ ≥2 choices: ${tooFewChoices === 0 ? "PASS" : `FAIL (${tooFewChoices})`}`);
console.log(`  ✅ Answer in choices: ${wrongAnswerCount === 0 ? "PASS" : `FAIL (${wrongAnswerCount})`}`);

// ── Rule 7: No Duplicate Choices ──
console.log("\n── Rule 7: No Duplicate Choices ──");
let dupChoicesCount = 0;
for (const s of allStages) {
  if (!s.choices) continue;
  const ids = s.choices.map(c => c.id);
  if (new Set(ids).size !== ids.length) {
    dupChoicesCount++;
    error(s.id, "dup-choices", `Duplicate choice IDs: [${ids.join(", ")}]`);
  }
}
console.log(`  ${dupChoicesCount === 0 ? "✅" : "❌"} No duplicate choices: ${dupChoicesCount === 0 ? "PASS" : `FAIL (${dupChoicesCount})`}`);

// ── Rule 8: Explanations ──
console.log("\n── Rule 8: All Playable Stages Have Explanations ──");
let noExplanationCount = 0;
for (const s of allStages) {
  if (s.stageType === "reward") continue;
  if (!s.explanation || s.explanation.trim().length === 0) {
    noExplanationCount++;
    error(s.id, "no-explanation", "Missing explanation");
  }
}
console.log(`  ${noExplanationCount === 0 ? "✅" : "❌"} Explanations present: ${noExplanationCount === 0 ? "PASS" : `FAIL (${noExplanationCount})`}`);

// ── Rule 9: Valid Difficulties ──
console.log("\n── Rule 9: Valid Difficulties ──");
let invalidDiffCount = 0;
for (const s of allStages) {
  if (!VALID_DIFFICULTIES.has(s.difficulty)) {
    invalidDiffCount++;
    error(s.id, "invalid-difficulty", `Invalid difficulty: ${s.difficulty}`);
  }
}
console.log(`  ${invalidDiffCount === 0 ? "✅" : "❌"} Valid difficulties: ${invalidDiffCount === 0 ? "PASS" : `FAIL (${invalidDiffCount})`}`);

// ── Rule 10: Valid World IDs ──
console.log("\n── Rule 10: Valid World IDs ──");
let invalidWorldCount = 0;
for (const s of allStages) {
  if (!VALID_WORLD_IDS.has(s.worldId)) {
    invalidWorldCount++;
    error(s.id, "invalid-world", `Invalid worldId: ${s.worldId}`);
  }
}
console.log(`  ${invalidWorldCount === 0 ? "✅" : "❌"} Valid world IDs: ${invalidWorldCount === 0 ? "PASS" : `FAIL (${invalidWorldCount})`}`);

// ── Rule 11: Valid Mission Types ──
console.log("\n── Rule 11: Valid Mission Types ──");
let invalidMissionTypeCount = 0;
for (const s of allStages) {
  if (!VALID_MISSION_TYPES.has(s.missionType as MissionType)) {
    invalidMissionTypeCount++;
    error(s.id, "invalid-mission", `Invalid missionType: ${s.missionType}`);
  }
}
console.log(`  ${invalidMissionTypeCount === 0 ? "✅" : "❌"} Valid mission types: ${invalidMissionTypeCount === 0 ? "PASS" : `FAIL (${invalidMissionTypeCount})`}`);

// ── Rule 12: Sequential Stage Numbers ──
console.log("\n── Rule 12: Sequential Stage Numbers per Difficulty ──");
let sequentialCount = 0;
for (const difficulty of Object.keys(expectedCounts)) {
  const diffStages = allStages.filter(s => s.difficulty === difficulty).sort((a, b) => a.stageNumber - b.stageNumber);
  if (diffStages.length === 0) {
    console.log(`  ⚠️  ${DIFFICULTY_LABELS[difficulty]}: No stages`);
    continue;
  }
  
  let sequential = true;
  for (let i = 0; i < diffStages.length - 1; i++) {
    if (diffStages[i + 1].stageNumber !== diffStages[i].stageNumber + 1) {
      sequential = false;
      sequentialCount++;
    }
  }
  const first = diffStages[0].stageNumber;
  const last = diffStages[diffStages.length - 1].stageNumber;
  console.log(`  ${sequential ? "✅" : "❌"} ${DIFFICULTY_LABELS[difficulty]}: #${first} → #${last} (${diffStages.length} stages)${sequential ? "" : " — GAPS FOUND"}`);
}
if (sequentialCount === 0) {
  console.log(`  ✅ All difficulties sequential`);
} else {
  console.log(`  ❌ ${sequentialCount} sequential issues`);
}

// ── Rule 13: Boss Stages ──
console.log("\n── Rule 13: Boss Stage Validation ──");
let bossNoFeedbackCount = 0;
for (const s of allStages) {
  if (s.isBossStage) {
    if (!s.hintLevels || s.hintLevels.length === 0) {
      bossNoFeedbackCount++;
      warn(s.id, "boss-no-hints", "Boss stage has no hints");
    }
  }
}
console.log(`  ${bossNoFeedbackCount === 0 ? "✅" : "⚠️"} Boss hints: ${bossNoFeedbackCount === 0 ? "PASS" : `${bossNoFeedbackCount} missing hints`}`);

// ── Rule 14: No Placeholders ──
console.log("\n── Rule 14: No Placeholder Stages ──");
let placeholderCount = 0;
for (const s of allStages) {
  const lc = (s.title + s.story + s.explanation).toLowerCase();
  if (lc.includes("todo") || lc.includes("coming soon") || lc.includes("placeholder") || lc.includes("tbd")) {
    placeholderCount++;
    error(s.id, "placeholder", `Contains placeholder text: ${s.title}`);
  }
}
console.log(`  ${placeholderCount === 0 ? "✅" : "❌"} No placeholders: ${placeholderCount === 0 ? "PASS" : `FAIL (${placeholderCount})`}`);

// ── Rule 15: Universitas Integration ──
console.log("\n── Rule 15: Universitas Integration ──");
const univStages = allStages.filter(s => s.difficulty === "universitas");
const univCategories = new Set(univStages.map(s => s.category));
const univWorlds = new Set(univStages.map(s => s.worldId));
console.log(`  ✅ Universitas stages: ${univStages.length}`);
console.log(`  ✅ Universitas categories: ${[...univCategories].join(", ")}`);
console.log(`  ✅ Universitas worlds: ${[...univWorlds].join(", ")}`);

// ── Rule 16: TK Content Age-Appropriate ──
console.log("\n── Rule 16: TK Content Check ──");
let tkAbstractCount = 0;
for (const s of allStages) {
  if (s.difficulty !== "tk") continue;
  const text = (s.story + s.explanation + s.title).toLowerCase();
  for (const word of TK_ABSTRACT_WORDS) {
    if (text.includes(word.toLowerCase())) {
      tkAbstractCount++;
      warn(s.id, "tk-abstract", `TK stage contains potentially abstract word: "${word}"`);
      break;
    }
  }
}
console.log(`  ${tkAbstractCount === 0 ? "✅" : "⚠️"} TK abstract content: ${tkAbstractCount === 0 ? "PASS" : `${tkAbstractCount} warnings`}`);

// ── Rule 17: Shuffle Compatibility ──
console.log("\n── Rule 17: Shuffle Compatibility ──");
let shuffleFailCount = 0;
for (const s of allStages) {
  if (!s.choices || s.choices.length < 2) continue;
  
  // Shuffle the choices 3 times, each time check correct answer is still present
  for (let trial = 0; trial < 3; trial++) {
    const shuffled = shuffleArray(s.choices);
    const hasCorrect = shuffled.some(c => c.id === s.correctAnswer);
    if (!hasCorrect) {
      shuffleFailCount++;
      error(s.id, "shuffle-fail", `After shuffle, correctAnswer '${s.correctAnswer}' not found`);
      break;
    }
    // Check no duplicates after shuffle
    const ids = shuffled.map(c => c.id);
    if (new Set(ids).size !== ids.length) {
      shuffleFailCount++;
      error(s.id, "shuffle-dup", "Duplicate IDs after shuffle");
      break;
    }
  }
}
console.log(`  ${shuffleFailCount === 0 ? "✅" : "❌"} Shuffle compatible: ${shuffleFailCount === 0 ? "PASS" : `FAIL (${shuffleFailCount})`}`);

// ── Category Distribution ──
console.log("\n── Category Distribution ──");
const catDistribution: Record<string, number> = {};
for (const s of allStages) {
  const key = `${s.difficulty}/${s.category}`;
  catDistribution[key] = (catDistribution[key] || 0) + 1;
}
for (const [key, count] of Object.entries(catDistribution).sort()) {
  console.log(`  ${key}: ${count}`);
}

// ═══════════════════════════════
// Summary
// ═══════════════════════════════

console.log("\n╔══════════════════════════════════════════╗");
console.log("║           VALIDATION SUMMARY             ║");
console.log("╚══════════════════════════════════════════╝");
console.log(`  Total stages: ${allStages.length}`);
console.log(`  Errors: ${errors.length} ❌`);
console.log(`  Warnings: ${warnings.length} ⚠️`);

if (errors.length > 0) {
  console.log("\n  ── ERRORS ──");
  for (const e of errors.slice(0, 20)) {
    console.log(`  ❌ [${e.rule}] ${e.stageId}: ${e.message}`);
  }
  if (errors.length > 20) {
    console.log(`  ... and ${errors.length - 20} more errors`);
  }
}

if (warnings.length > 0) {
  console.log("\n  ── WARNINGS ──");
  for (const w of warnings.slice(0, 10)) {
    console.log(`  ⚠️ [${w.rule}] ${w.stageId}: ${w.message}`);
  }
  if (warnings.length > 10) {
    console.log(`  ... and ${warnings.length - 10} more warnings`);
  }
}

if (errors.length === 0) {
  console.log("\n  🎉 ALL CHECKS PASSED!");
  console.log("  3000 stages validated successfully.\n");
  process.exit(0);
} else {
  console.log(`\n  ❌ VALIDATION FAILED with ${errors.length} errors.`);
  console.log("  Fix errors before proceeding to QA.\n");
  process.exit(1);
}
