/**
 * Mission Validation Script
 * Run: npx tsx scripts/validate-missions.ts
 * 
 * Checks all missions in the project for completeness and correctness.
 */
import { MISSIONS } from "../src/data/missions";

interface ValidationError {
  missionId: string;
  errors: string[];
}

function validateAll(): { errors: ValidationError[]; summary: any } {
  const allErrors: ValidationError[] = [];
  const ids = new Set<string>();
  const duplicateIds: string[] = [];
  const difficultyCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  let playableCount = 0;
  let totalMissions = 0;

  // Check duplicates
  MISSIONS.forEach(m => {
    if (ids.has(m.id)) duplicateIds.push(m.id);
    ids.add(m.id);
  });
  
  if (duplicateIds.length > 0) {
    console.log(`⚠️  DUPLICATE IDs FOUND: ${duplicateIds.join(', ')}`);
  }

  // Validate each mission
  MISSIONS.forEach(m => {
    totalMissions++;
    const errs: string[] = [];
    const id = m.id || "unknown";

    if (!m.id) errs.push("Missing id");
    if (!m.title) errs.push("Missing title");
    if (!m.difficulty) errs.push("Missing difficulty");
    if (!m.category) errs.push("Missing category");
    if (!m.missionType) errs.push("Missing missionType");
    if (!m.instruction) errs.push("Missing instruction");
    if (!m.explanation) errs.push("Missing explanation");
    if (!m.hintLevels || m.hintLevels.length === 0) errs.push("Missing hintLevels");
    if (!m.basePoint || m.basePoint <= 0) errs.push("Missing/invalid basePoint");
    if (!m.number && m.number !== 0) errs.push("Missing number");
    if (!m.story) errs.push("Missing story");

    // Check options/answers
    const isBossMission = m.missionType === "boss_mission";
    const hasOptions = (m as any).options && Array.isArray((m as any).options) && (m as any).options.length >= 2;
    const hasCorrectAnswer = (m as any).correctAnswer;
    const hasAcceptableAnswers = (m as any).acceptableAnswers && Array.isArray((m as any).acceptableAnswers) && (m as any).acceptableAnswers.length > 0;
    const hasBossSteps = isBossMission && (m as any).steps && Array.isArray((m as any).steps) && (m as any).steps.length > 0;

    // Boss missions have answers in their steps, not at top level
    if (!isBossMission && !hasCorrectAnswer && !hasAcceptableAnswers) {
      errs.push("Missing both correctAnswer and acceptableAnswers");
    }

    if (isBossMission && !hasBossSteps) {
      errs.push("Boss mission missing steps");
    }

    if (hasOptions && hasCorrectAnswer) {
      const validIds = (m as any).options.map((o: any) => o.id);
      if (!validIds.includes((m as any).correctAnswer)) {
        errs.push(`correctAnswer '${(m as any).correctAnswer}' not found in options`);
      }
    }

    if (hasOptions && (m as any).options.length < 2) {
      errs.push("Fewer than 2 options");
    }

    // Track playable
    if (hasOptions && (hasCorrectAnswer || hasAcceptableAnswers)) {
      playableCount++;
    }

    // Count by difficulty
    const diff = m.difficulty || "unknown";
    difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;

    // Count by category
    const cat = m.category || "unknown";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Count by mission type
    const type = m.missionType || "unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    if (errs.length > 0) {
      allErrors.push({ missionId: id, errors: errs });
    }
  });

  return {
    errors: allErrors,
    summary: {
      totalMissions,
      validMissions: totalMissions - allErrors.length,
      invalidMissions: allErrors.length,
      duplicateIds,
      playableMissions: playableCount,
      unplayableMissions: totalMissions - playableCount,
      difficultyCounts,
      categoryCounts,
      typeCounts,
    },
  };
}

// Run validation
console.log("🔍 EDUGAME MISSION VALIDATION");
console.log("═══════════════════════════════\n");

const result = validateAll();

if (result.errors.length === 0) {
  console.log("✅ All missions valid!\n");
} else {
  console.log(`❌ ${result.errors.length} invalid missions found:\n`);
  result.errors.forEach(e => {
    console.log(`  ${e.missionId}:`);
    e.errors.forEach(err => console.log(`    - ${err}`));
  });
  console.log();
}

const s = result.summary;
console.log("📊 SUMMARY");
console.log("─────────");
console.log(`Total missions: ${s.totalMissions}`);
console.log(`Valid: ${s.validMissions} ✅`);
console.log(`Invalid: ${s.invalidMissions} ❌`);
console.log(`Duplicate IDs: ${s.duplicateIds.length}`);
console.log(`Playable: ${s.playableMissions}`);
console.log(`Unplayable: ${s.unplayableMissions}`);

console.log("\n📊 BY DIFFICULTY");
Object.entries(s.difficultyCounts).sort().forEach(([d, c]) => {
  console.log(`  ${d}: ${c}`);
});

console.log("\n📊 BY CATEGORY");
Object.entries(s.categoryCounts).sort().forEach(([c, n]) => {
  console.log(`  ${c}: ${n}`);
});

console.log("\n📊 BY MISSION TYPE");
Object.entries(s.typeCounts).sort().forEach(([t, n]) => {
  console.log(`  ${t}: ${n}`);
});

// Exit with error code if invalid missions found
if (result.errors.length > 0 || result.summary.duplicateIds.length > 0) {
  console.log("\n❌ VALIDATION FAILED");
  process.exit(1);
} else {
  console.log("\n✅ VALIDATION PASSED");
}
