import { generateShadowMatchQuestion, SVG_OBJECT_DEFS } from "../src/lib/shadow-match-generator";
import { DifficultyId } from "../src/types";

const ALL_DIFFICULTIES: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];

function runValidation() {
  console.log("=== Validating SVG Shadow Match ===");
  let errors = 0;

  // 1. Validate Objects
  console.log("Checking objects integrity...");
  const uniqueIds = new Set();
  SVG_OBJECT_DEFS.forEach(obj => {
    if (!obj.id || !obj.name || !obj.parts || obj.parts.length === 0) {
      console.error(`Object missing required fields or parts: ${JSON.stringify(obj)}`);
      errors++;
    }
    if (uniqueIds.has(obj.id)) {
      console.error(`Duplicate object id: ${obj.id}`);
      errors++;
    }
    uniqueIds.add(obj.id);
  });

  // 2. Validate Questions per difficulty
  console.log("Checking question generator...");
  ALL_DIFFICULTIES.forEach(diff => {
    for (let i = 0; i < 50; i++) {
      const q = generateShadowMatchQuestion(diff);
      
      // Check correct shadow presence
      if (!q.shuffledChoices.find(c => c.isCorrect && c.id === q.correctShadow.id)) {
        console.error(`Correct shadow missing from choices for difficulty ${diff}`);
        errors++;
      }
      
      // Check duplicates
      const choiceIds = new Set(q.shuffledChoices.map(c => c.id));
      if (choiceIds.size !== q.shuffledChoices.length) {
        console.error(`Duplicate choices found in difficulty ${diff}`);
        errors++;
      }

      // Check counts
      const expectedCount = diff === "tk" ? 3 : diff === "sd-bawah" || diff === "sd-atas" ? 4 : diff === "smp" ? 5 : 6;
      if (q.shuffledChoices.length !== expectedCount) {
        console.error(`Expected ${expectedCount} choices for ${diff}, got ${q.shuffledChoices.length}`);
        errors++;
      }
    }
  });

  if (errors === 0) {
    console.log("✅ SVG Shadow Match validation PASSED!");
  } else {
    console.error(`❌ SVG Shadow Match validation FAILED with ${errors} errors.`);
    process.exit(1);
  }
}

runValidation();
