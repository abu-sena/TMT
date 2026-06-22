import { generateColorCodeQuestion, validateColorCodeAnswer } from "../src/lib/color-code-generator";
import { DifficultyId } from "../src/types";

const ALL_DIFFICULTIES: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];

function runValidation() {
  console.log("=== Validating Color Code Game ===");
  let errors = 0;

  // Validate Questions per difficulty
  console.log("Checking question generator...");
  ALL_DIFFICULTIES.forEach(diff => {
    for (let i = 0; i < 50; i++) {
      const q = generateColorCodeQuestion(diff);
      
      // Check correct answer presence in choices
      if (!q.shuffledChoices.includes(q.correctAnswer)) {
        console.error(`Correct answer missing from choices for difficulty ${diff}. Question: ${JSON.stringify(q)}`);
        errors++;
      }
      
      // Check duplicates
      const choiceIds = new Set(q.shuffledChoices);
      if (choiceIds.size !== q.shuffledChoices.length) {
        console.error(`Duplicate choices found in difficulty ${diff}: ${q.shuffledChoices}`);
        errors++;
      }

      // Check NaN
      if (isNaN(q.correctAnswer)) {
         console.error(`NaN correctAnswer found in difficulty ${diff}`);
         errors++;
      }

      // Check validator
      if (!validateColorCodeAnswer(q, q.correctAnswer)) {
         console.error(`Validator failed for correct answer in difficulty ${diff}`);
         errors++;
      }
    }
  });

  if (errors === 0) {
    console.log("✅ Color Code Game validation PASSED!");
  } else {
    console.error(`❌ Color Code Game validation FAILED with ${errors} errors.`);
    process.exit(1);
  }
}

runValidation();
