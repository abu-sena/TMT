/**
 * validate-adventure-map-mixing.ts
 * 
 * Validates that the adventure map stages are properly mixed
 * (not grouped by category), have valid renderer mappings,
 * correct answers, proper progression, and follow all mixing rules.
 */

import { generateAllStages } from "../src/data/stage-generator";
import { CHALLENGE_RENDERER_MAP } from "../src/components/missions/renderers/MissionRendererRouter";
import { DIFFICULTY_ORDER } from "../src/types";
import { WORLDS_BY_DIFFICULTY } from "../src/data/worlds";

// Old category names that should NOT appear in UI segments
const FORBIDDEN_SEGMENT_NAMES = [
  "dunia adab",
  "dunia logika",
  "dunia numerasi",
  "dunia spasial",
  "dunia pola",
  "adab",
  "logika",
  "numerasi",
  "spasial",
];

function validateStages() {
  console.log("═══════════════════════════════════════════════");
  console.log("  TMT Adventure Map Mixing Validation");
  console.log("═══════════════════════════════════════════════\n");

  console.log("Generating all stages...");
  const allStages = generateAllStages();
  
  if (allStages.length === 0) {
    console.error("❌ FAILED: No stages generated.");
    process.exit(1);
  }

  console.log(`Total stages generated: ${allStages.length}\n`);

  let errors = 0;
  let warnings = 0;

  // ═══════════════════════════════════════════
  // RULE 12: No UI segment named "Dunia Adab", "Dunia Logika", etc.
  // ═══════════════════════════════════════════
  console.log("── Rule 12: Checking segment names...");
  for (const diff of DIFFICULTY_ORDER) {
    const worlds = WORLDS_BY_DIFFICULTY[diff] || [];
    for (const w of worlds) {
      const nameLower = w.name.toLowerCase();
      const idLower = w.id.toLowerCase();
      const descLower = w.description.toLowerCase();
      const introLower = w.worldIntroText.toLowerCase();
      
      for (const forbidden of FORBIDDEN_SEGMENT_NAMES) {
        if (nameLower.includes(forbidden) && forbidden.length > 5) {
          console.error(`  ❌ World [${w.id}] name "${w.name}" contains forbidden segment name "${forbidden}"`);
          errors++;
        }
        if (descLower.includes(`belajar ${forbidden}`) || descLower.includes(`tempat ${forbidden}`)) {
          console.error(`  ❌ World [${w.id}] description ties segment to category: "${w.description}"`);
          errors++;
        }
        if (introLower.includes(`belajar ${forbidden}`)) {
          console.error(`  ❌ World [${w.id}] intro text ties segment to category`);
          errors++;
        }
      }
    }
  }
  console.log("  ✅ Segment name check complete.\n");

  // ═══════════════════════════════════════════
  // Group by difficulty
  // ═══════════════════════════════════════════
  const byDifficulty: Record<string, typeof allStages> = {};
  for (const diff of DIFFICULTY_ORDER) {
    byDifficulty[diff] = allStages.filter(s => s.difficulty === diff);
  }

  for (const diff of DIFFICULTY_ORDER) {
    const stages = byDifficulty[diff];
    console.log(`── Validating ${diff.toUpperCase()} (${stages.length} stages)...`);
    
    if (stages.length === 0) {
      console.error(`  ❌ No stages for difficulty ${diff}.`);
      errors++;
      continue;
    }

    // Sort to ensure sequence
    stages.sort((a, b) => a.stageNumber - b.stageNumber);

    let lastCat = "";
    let catStreak = 0;
    let lastChall = "";
    let challStreak = 0;
    const categoriesSeen = new Set<string>();
    const challengeTypesSeen = new Set<string>();

    // Track numerasi domination
    let numerasiCount = 0;
    const numerasiCats = ["literasi-numerasi", "tk-pra-literasi", "tk_counting"];

    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];

      // RULE 5: Stage must have category
      if (!s.category) {
        console.error(`  ❌ [#${s.stageNumber} ${s.id}] Missing category`);
        errors++;
      } else {
        categoriesSeen.add(s.category);
      }

      // RULE 6: Stage must have challengeType or missionType
      const cType = (s as any).challengeType || s.missionType;
      if (!cType) {
        console.error(`  ❌ [#${s.stageNumber} ${s.id}] Missing challengeType/missionType`);
        errors++;
      } else {
        challengeTypesSeen.add(cType);
      }

      // RULE 9: Stage must have correctAnswer or validation rule
      if (!s.correctAnswer && !(s as any).validationRule && !s.isBossStage) {
        console.error(`  ❌ [#${s.stageNumber} ${s.id}] Missing correctAnswer`);
        errors++;
      }

      // RULE 10: Stage must have feedback/explanation
      if (!s.explanation && !s.isBossStage) {
        console.error(`  ❌ [#${s.stageNumber} ${s.id}] Missing explanation`);
        errors++;
      }

      // RULE 1: No 3 consecutive same category
      if (s.category === lastCat) {
        catStreak++;
        if (catStreak >= 3) {
          console.error(`  ❌ [#${s.stageNumber} ${s.id}] Rule 1: 3 consecutive same category "${s.category}" (stages ${s.stageNumber - 2}-${s.stageNumber})`);
          errors++;
        }
      } else {
        lastCat = s.category || "";
        catStreak = 1;
      }

      // RULE 2: No 3 consecutive same challengeType
      if (cType === lastChall) {
        challStreak++;
        if (challStreak >= 3) {
          console.error(`  ❌ [#${s.stageNumber} ${s.id}] Rule 2: 3 consecutive same challengeType "${cType}" (stages ${s.stageNumber - 2}-${s.stageNumber})`);
          errors++;
        }
      } else {
        lastChall = cType || "";
        challStreak = 1;
      }

      // RULE 7: Renderer mapping exists
      if (cType && !CHALLENGE_RENDERER_MAP[cType] && s.missionType !== "boss_mission") {
        // Check if MC fallback is available
        if (!s.choices || s.choices.length === 0) {
          console.error(`  ❌ [#${s.stageNumber} ${s.id}] No renderer for challengeType "${cType}" and no MC options fallback`);
          errors++;
        }
      }

      // RULE 11: Background segment != category
      if (s.backgroundTheme) {
        const bgLower = s.backgroundTheme.toLowerCase();
        for (const forbidden of FORBIDDEN_SEGMENT_NAMES) {
          if (bgLower.includes(forbidden) && forbidden.length > 5) {
            console.error(`  ❌ [#${s.stageNumber} ${s.id}] Background theme "${s.backgroundTheme}" references old category "${forbidden}"`);
            errors++;
          }
        }
      }

      // RULE 5 (numerasi): Count numerasi stages
      if (s.category && numerasiCats.includes(s.category)) {
        numerasiCount++;
      }

      // RULE 16: Check choices integrity
      if (s.choices && s.choices.length > 0) {
        const ids = s.choices.map(c => c.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
          console.error(`  ❌ [#${s.stageNumber} ${s.id}] Duplicate choice IDs`);
          errors++;
        }
        if (s.correctAnswer && !uniqueIds.has(s.correctAnswer)) {
          console.error(`  ❌ [#${s.stageNumber} ${s.id}] correctAnswer "${s.correctAnswer}" not in choices`);
          errors++;
        }
      }

      // RULE 15: Boss stage check
      if (s.isBossStage) {
        if (!s.stageType || s.stageType !== "boss") {
          console.warn(`  ⚠ [#${s.stageNumber} ${s.id}] isBossStage=true but stageType=${s.stageType}`);
          warnings++;
        }
      }

      // RULE 14: Gift stage check
      if (s.isRewardStage && !s.stageType) {
        console.warn(`  ⚠ [#${s.stageNumber} ${s.id}] isRewardStage=true but no stageType`);
        warnings++;
      }
    }

    // RULE 4: Stage progression (first should be easier than last)
    const first = stages[0];
    const last = stages[stages.length - 1];
    if (first && last && !last.isBossStage) {
      if (first.basePoint >= last.basePoint) {
        console.warn(`  ⚠ [${diff}] Warning: First stage point (${first.basePoint}) >= Last stage point (${last.basePoint}). Difficulty may not scale.`);
        warnings++;
      }
    }

    // RULE 3: Each difficulty has valid stages
    if (stages.length < 100) {
      console.warn(`  ⚠ [${diff}] Only ${stages.length} stages (expected 500 for full game)`);
      warnings++;
    }

    // RULE 5 (numerasi check): Numerasi should not dominate
    const numerasiPct = (numerasiCount / stages.length) * 100;
    if (numerasiPct > 35) {
      console.warn(`  ⚠ [${diff}] Numerasi percentage: ${numerasiPct.toFixed(1)}% (>35% may indicate dominance)`);
      warnings++;
    }

    // RULE 14, 15: Boss stages present
    const bosses = stages.filter(s => s.isBossStage);
    if (bosses.length === 0) {
      console.error(`  ❌ [${diff}] Missing boss stages`);
      errors++;
    }

    // Summary
    console.log(`  Categories used: ${categoriesSeen.size} (${[...categoriesSeen].join(", ")})`);
    console.log(`  Challenge types used: ${challengeTypesSeen.size}`);
    console.log(`  Boss stages: ${bosses.length}`);
    console.log(`  Gift/reward stages: ${stages.filter(s => s.isRewardStage).length}`);
    console.log(`  Numerasi ratio: ${numerasiPct.toFixed(1)}%\n`);
  }

  // ═══════════════════════════════════════════
  // RULE 13: Final stage should unlock next difficulty
  // ═══════════════════════════════════════════
  console.log("── Rule 13: Checking final stage progression...");
  for (let d = 0; d < DIFFICULTY_ORDER.length - 1; d++) {
    const stages = byDifficulty[DIFFICULTY_ORDER[d]];
    if (stages.length > 0) {
      const finalStage = stages[stages.length - 1];
      if (finalStage.isBossStage || finalStage.stageType === "boss" || finalStage.stageType === "review") {
        console.log(`  ✅ [${DIFFICULTY_ORDER[d]}] Final stage #${finalStage.stageNumber} is boss/review — can unlock next difficulty.`);
      } else {
        console.warn(`  ⚠ [${DIFFICULTY_ORDER[d]}] Final stage #${finalStage.stageNumber} is not boss/review (stageType=${finalStage.stageType}). May affect unlock flow.`);
        warnings++;
      }
    }
  }
  console.log("  ✅ Progression check complete.\n");

  // ═══════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════
  console.log("═══════════════════════════════════════════════");
  console.log(`  Errors:   ${errors}`);
  console.log(`  Warnings: ${warnings}`);
  console.log(`  Total stages: ${allStages.length}`);
  console.log("═══════════════════════════════════════════════");

  if (errors > 0) {
    console.error(`\n❌ VALIDATION FAILED with ${errors} error(s).`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`\n⚠ VALIDATION PASSED with ${warnings} warning(s).`);
    process.exit(0);
  } else {
    console.log("\n✅ ALL VALIDATIONS PASSED — Adventure map mixing is correct!");
    process.exit(0);
  }
}

validateStages();
