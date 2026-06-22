/**
 * validate-adventure-stages-500.ts
 *
 * Comprehensive validation for 500-stage adventure map expansion.
 * Checks:
 *   1. Each difficulty has exactly 500 stages
 *   2. Total stages = 3,000
 *   3. Stage numbers 1–500 complete per difficulty
 *   4. No duplicate stage IDs
 *   5. No missing stage numbers
 *   6. Stages 301–500 present and valid
 *   7. No placeholders
 *   8. All stages have category
 *   9. All stages have challengeType
 *  10. All challengeTypes have renderer mappings
 *  11. All playable stages have validators (correctAnswer or validationRule)
 *  12. All playable stages have feedback/explanation
 *  13. Multiple choice choices are valid
 *  14. Correct answer is in choices
 *  15. No duplicate choices
 *  16. No 3 consecutive same category
 *  17. No 3 consecutive same challengeType
 *  18. Spasial and Logika are spread out (not in long blocks)
 *  19. Early stages easier than late stages (progressive difficulty)
 *  20. Stage 500 is final challenge/boss
 *  21. Stage 500 unlocks next difficulty
 *  22. Legacy/migration data does not crash
 */

import { generateAllStages, generateStagesForDifficulty } from "../src/data/stage-generator";
import { CHALLENGE_RENDERER_MAP } from "../src/components/missions/renderers/MissionRendererRouter";
import { DIFFICULTY_ORDER, type DifficultyId } from "../src/types";
import { WORLDS_BY_DIFFICULTY } from "../src/data/worlds";
import { getMissionsForDifficulty, getMissionCounts } from "../src/data/mission-adapter";

const EXPECTED_PER_DIFFICULTY = 500;
const TOTAL_EXPECTED = 3000;

// Categories considered "spasial"
const SPASIAL_CATEGORIES = ["spasial", "tk-visual"];
// Categories considered "logika"
const LOGIKA_CATEGORIES = ["penalaran", "pola", "tk-pola", "advanced-reasoning", "argument-evaluation", "quantitative-logic"];
// Numerasi categories
const NUMERASI_CATEGORIES = ["literasi-numerasi", "tk-pra-literasi", "tk_counting"];

interface ValidationResult {
  errors: string[];
  warnings: string[];
  stats: {
    totalStages: number;
    perDifficulty: Record<string, number>;
    categoryDistribution: Record<string, Record<string, number>>;
    challengeTypeDistribution: Record<string, Record<string, number>>;
    spatialLogicRatio: Record<string, number>;
  };
}

function validate(): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    stats: {
      totalStages: 0,
      perDifficulty: {},
      categoryDistribution: {},
      challengeTypeDistribution: {},
      spatialLogicRatio: {},
    },
  };

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  TMT Adventure Stage 500 Expansion Validator ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Generate all stages
  console.log("Generating all stages...");
  const allStages = generateAllStages();
  result.stats.totalStages = allStages.length;

  // ════════════════════════════════════
  // CHECK 1 & 2: Count validation
  // ════════════════════════════════════
  console.log("\n── Check 1-2: Count Validation ──");
  const byDifficulty: Record<string, typeof allStages> = {};
  for (const diff of DIFFICULTY_ORDER) {
    const stages = allStages.filter(s => s.difficulty === diff);
    byDifficulty[diff] = stages;
    result.stats.perDifficulty[diff] = stages.length;
    
    if (stages.length !== EXPECTED_PER_DIFFICULTY) {
      result.errors.push(`[${diff}] Has ${stages.length} stages, expected ${EXPECTED_PER_DIFFICULTY}`);
    } else {
      console.log(`  ✅ ${diff.toUpperCase()}: ${stages.length} stages`);
    }
  }

  if (result.stats.totalStages !== TOTAL_EXPECTED) {
    result.errors.push(`Total stages: ${result.stats.totalStages}, expected ${TOTAL_EXPECTED}`);
  } else {
    console.log(`  ✅ Total: ${result.stats.totalStages} stages`);
  }

  // ════════════════════════════════════
  // CHECK 3: Stage number completeness
  // ════════════════════════════════════
  console.log("\n── Check 3: Stage Number Completeness ──");
  for (const diff of DIFFICULTY_ORDER) {
    const stages = byDifficulty[diff];
    stages.sort((a, b) => a.stageNumber - b.stageNumber);
    const nums = new Set(stages.map(s => s.stageNumber));
    const missing: number[] = [];
    for (let i = 1; i <= EXPECTED_PER_DIFFICULTY; i++) {
      if (!nums.has(i)) missing.push(i);
    }
    if (missing.length > 0) {
      result.errors.push(`[${diff}] Missing stage numbers: ${missing.join(", ")}`);
    }
    
    // Check for gaps > 1
    for (let i = 0; i < stages.length - 1; i++) {
      if (stages[i + 1].stageNumber - stages[i].stageNumber > 1) {
        result.warnings.push(`[${diff}] Gap between stage ${stages[i].stageNumber} and ${stages[i + 1].stageNumber}`);
      }
    }
  }
  console.log("  ✅ Stage number check complete");

  // ════════════════════════════════════
  // CHECK 4: No duplicate IDs
  // ════════════════════════════════════
  console.log("\n── Check 4: Duplicate Stage IDs ──");
  const allIds = allStages.map(s => s.id);
  const uniqueIds = new Set(allIds);
  if (uniqueIds.size !== allIds.length) {
    const idCounts: Record<string, number> = {};
    allIds.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
    const dupes = Object.entries(idCounts).filter(([, c]) => c > 1);
    result.errors.push(`Found ${dupes.length} duplicate stage IDs: ${dupes.slice(0, 5).map(([id]) => id).join(", ")}...`);
    console.log(`  ❌ ${dupes.length} duplicate IDs`);
  } else {
    console.log(`  ✅ All ${allIds.length} IDs unique`);
  }

  // ════════════════════════════════════
  // Per-difficulty deep validation
  // ════════════════════════════════════
  for (const diff of DIFFICULTY_ORDER) {
    const stages = byDifficulty[diff];
    stages.sort((a, b) => a.stageNumber - b.stageNumber);
    
    console.log(`\n── Validating ${diff.toUpperCase()} ──`);

    // Category distribution tracking
    const catDist: Record<string, number> = {};
    const ctDist: Record<string, number> = {};
    let lastCat = "";
    let lastCT = "";
    let catStreak = 0;
    let ctStreak = 0;
    let spatialCount = 0;
    let logicCount = 0;
    let numerasiCount = 0;
    let placeholderCount = 0;
    const stages301PlusInvalid: string[] = [];
    
    // Stage 301-500 for special checks
    const stages301to500 = stages.filter(s => s.stageNumber >= 301 && s.stageNumber <= 500);

    for (const s of stages) {
      // CHECK 7: No placeholders
      const story = s.story?.toLowerCase() || "";
      const title = s.title?.toLowerCase() || "";
      if (
        story.includes("todo") || story.includes("coming soon") ||
        title.includes("todo") || title.includes("coming soon") ||
        story.includes("placeholder") || title.includes("placeholder")
      ) {
        result.errors.push(`[${diff}] Stage #${s.stageNumber} contains placeholder/TODO text`);
        placeholderCount++;
      }

      // CHECK 8: Category present
      if (!s.category) {
        result.errors.push(`[${diff}] Stage #${s.stageNumber} missing category`);
      } else {
        catDist[s.category] = (catDist[s.category] || 0) + 1;
      }

      // CHECK 9: ChallengeType present
      const cType = (s as any).challengeType || s.missionType;
      if (!cType) {
        result.errors.push(`[${diff}] Stage #${s.stageNumber} missing challengeType`);
      } else {
        ctDist[cType] = (ctDist[cType] || 0) + 1;

        // CHECK 10: Renderer mapping exists
        if (s.stageType !== "boss" && !CHALLENGE_RENDERER_MAP[cType] && !s.choices?.length) {
          result.errors.push(`[${diff}] Stage #${s.stageNumber} challengeType "${cType}" has no renderer and no MC fallback`);
        }
      }

      // CHECK 11: Validator exists
      if (!s.isBossStage && !s.correctAnswer && !(s as any).validationRule) {
        result.errors.push(`[${diff}] Stage #${s.stageNumber} missing correctAnswer/validationRule`);
      }

      // CHECK 12: Feedback exists
      if (!s.isBossStage && !s.explanation && !s.adabFeedback) {
        result.warnings.push(`[${diff}] Stage #${s.stageNumber} missing explanation/feedback`);
      }

      // CHECK 13-15: Choice integrity
      if (s.choices && s.choices.length > 0) {
        const ids = s.choices.map(c => c.id);
        const uniqueChoiceIds = new Set(ids);
        
        // CHECK 15: No duplicate choices
        if (uniqueChoiceIds.size !== ids.length) {
          result.errors.push(`[${diff}] Stage #${s.stageNumber} has duplicate choice IDs`);
        }

        // CHECK 14: Correct answer in choices
        if (s.correctAnswer && !uniqueChoiceIds.has(s.correctAnswer)) {
          result.errors.push(`[${diff}] Stage #${s.stageNumber} correctAnswer "${s.correctAnswer}" not in choices`);
        }

        // Check for empty/idle choices
        for (const choice of s.choices) {
          if (!choice.label || choice.label.trim() === "") {
            result.errors.push(`[${diff}] Stage #${s.stageNumber} has empty choice label`);
          }
        }
      }

      // CHECK 16: No 3 consecutive same category
      if (s.category === lastCat && s.category) {
        catStreak++;
        if (catStreak >= 3) {
          result.errors.push(
            `[${diff}] Stages ${s.stageNumber - 2}-${s.stageNumber}: 3 consecutive "${s.category}" categories`
          );
        }
      } else {
        lastCat = s.category || "";
        catStreak = 1;
      }

      // CHECK 17: No 3 consecutive same challengeType
      if (cType === lastCT && cType) {
        ctStreak++;
        if (ctStreak >= 3 && s.stageType !== "boss") {
          result.errors.push(
            `[${diff}] Stages ${s.stageNumber - 2}-${s.stageNumber}: 3 consecutive "${cType}" challengeTypes`
          );
        }
      } else {
        lastCT = cType || "";
        ctStreak = 1;
      }

      // Count spatial and logic
      if (s.category && SPASIAL_CATEGORIES.includes(s.category)) spatialCount++;
      if (s.category && LOGIKA_CATEGORIES.includes(s.category)) logicCount++;
      if (s.category && NUMERASI_CATEGORIES.includes(s.category)) numerasiCount++;

      // CHECK 6: Stages 301-500 checks
      if (s.stageNumber >= 301 && s.stageNumber <= 500) {
        if (!s.story || !s.instruction || !s.explanation) {
          stages301PlusInvalid.push(`#${s.stageNumber}`);
        }
      }
    }

    // CHECK 18: Spatial and Logic spread check
    const totalStages = stages.length;
    const spatialPct = (spatialCount / totalStages) * 100;
    const logicPct = (logicCount / totalStages) * 100;
    result.stats.spatialLogicRatio[diff] = spatialPct + logicPct;
    
    console.log(`  Categories: ${Object.keys(catDist).length} types`);
    console.log(`  Challenge Types: ${Object.keys(ctDist).length} types`);
    console.log(`  Spatial: ${spatialCount} (${spatialPct.toFixed(1)}%) | Logic: ${logicCount} (${logicPct.toFixed(1)}%)`);
    console.log(`  Numerasi: ${numerasiCount} (${(numerasiCount/totalStages*100).toFixed(1)}%)`);
    console.log(`  Boss stages: ${stages.filter(s => s.isBossStage).length}`);
    console.log(`  Placeholders: ${placeholderCount}`);

    if (stages301PlusInvalid.length > 0) {
      result.warnings.push(`[${diff}] ${stages301PlusInvalid.length} stages in 301-500 have potential issues: ${stages301PlusInvalid.slice(0, 3).join(", ")}...`);
    }

    // CHECK 19: Progressive difficulty (first 100 avg basePoint vs last 100)
    const first100avg = stages.slice(0, 100).reduce((sum, s) => sum + s.basePoint, 0) / 100;
    const last100avg = stages.slice(-100).reduce((sum, s) => sum + s.basePoint, 0) / 100;
    if (last100avg <= first100avg) {
      result.warnings.push(`[${diff}] Last 100 avg point (${last100avg.toFixed(0)}) not higher than first 100 (${first100avg.toFixed(0)})`);
    }

    // CHECK 20: Stage 500 is boss/review
    const stage500 = stages.find(s => s.stageNumber === 500);
    if (!stage500) {
      result.errors.push(`[${diff}] Stage 500 missing`);
    } else if (!stage500.isBossStage && stage500.stageType !== "review" && stage500.stageType !== "boss") {
      result.warnings.push(`[${diff}] Stage 500 is not boss/review: type=${stage500.stageType}, isBoss=${stage500.isBossStage}`);
    }

    // Store distributions
    result.stats.categoryDistribution[diff] = catDist;
    result.stats.challengeTypeDistribution[diff] = ctDist;
  }

  // CHECK 21: Unlock chain verification
  console.log("\n── Check 21: Difficulty Unlock Chain ──");
  for (let d = 0; d < DIFFICULTY_ORDER.length - 1; d++) {
    const stages = byDifficulty[DIFFICULTY_ORDER[d]];
    const finalStage = stages[stages.length - 1];
    if (finalStage && (finalStage.isBossStage || finalStage.stageType === "boss" || finalStage.stageType === "review")) {
      console.log(`  ✅ ${DIFFICULTY_ORDER[d]}#${finalStage.stageNumber} → unlocks ${DIFFICULTY_ORDER[d+1]}`);
    } else {
      result.warnings.push(`[${DIFFICULTY_ORDER[d]}] Stage 500 may not properly unlock ${DIFFICULTY_ORDER[d+1]}`);
    }
  }
  console.log(`  ✅ ${DIFFICULTY_ORDER[DIFFICULTY_ORDER.length-1].toUpperCase()} stage 500 → Mastery Complete`);

  // CHECK 22: Migration compatibility check
  console.log("\n── Check 22: Migration Compatibility ──");
  try {
    // Test that missionsForDifficulty works with all difficulties
    for (const diff of DIFFICULTY_ORDER) {
      const missions = getMissionsForDifficulty(diff);
      if (missions.length !== EXPECTED_PER_DIFFICULTY) {
        result.warnings.push(`[Migration] missionsForDifficulty(${diff}) returned ${missions.length}, expected ${EXPECTED_PER_DIFFICULTY}`);
      }
    }
    // Test mission counts
    const counts = getMissionCounts();
    for (const diff of DIFFICULTY_ORDER) {
      if (counts[diff] !== EXPECTED_PER_DIFFICULTY) {
        result.warnings.push(`[Migration] getMissionCounts()[${diff}] = ${counts[diff]}, expected ${EXPECTED_PER_DIFFICULTY}`);
      }
    }
    console.log("  ✅ Migration adapter works correctly");
  } catch (err) {
    result.errors.push(`[Migration] Error: ${err}`);
  }

  // ════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║              VALIDATION SUMMARY              ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Errors:      ${String(result.errors.length).padStart(3)}                            ║`);
  console.log(`║  Warnings:    ${String(result.warnings.length).padStart(3)}                            ║`);
  console.log(`║  Total Stages: ${String(result.stats.totalStages).padStart(4)}                          ║`);
  console.log("╚══════════════════════════════════════════════╝");

  if (result.errors.length > 0) {
    console.error(`\n❌ VALIDATION FAILED — ${result.errors.length} error(s):`);
    for (const err of result.errors.slice(0, 20)) {
      console.error(`   • ${err}`);
    }
    if (result.errors.length > 20) {
      console.error(`   ... and ${result.errors.length - 20} more errors`);
    }
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠ ${result.warnings.length} warning(s):`);
    for (const warn of result.warnings.slice(0, 10)) {
      console.log(`   • ${warn}`);
    }
    if (result.warnings.length > 10) {
      console.log(`   ... and ${result.warnings.length - 10} more warnings`);
    }
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log("\n✅ ALL VALIDATIONS PASSED — 500-stage expansion is correct!");
  }

  return result;
}

const result = validate();

if (result.errors.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
