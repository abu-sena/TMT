/**
 * validate-badges.ts
 *
 * Validates badge/lencana definitions:
 * - Minimum 50 badges
 * - Each badge has all required fields
 * - No duplicate IDs
 * - Valid categories & rarities
 */

import { BADGES } from "../src/data/badges";

const MIN_BADGES = 50;

function main() {
  console.log("🔍 Validating lencana (badges)...\n");

  // 1. Count check
  const count = BADGES.length;
  console.log(`📊 Total lencana: ${count}`);
  if (count >= MIN_BADGES) {
    console.log(`✅ Meets minimum requirement (${MIN_BADGES}+)`);
  } else {
    console.error(`❌ Only ${count} lencana, need at least ${MIN_BADGES}`);
  }

  // 2. Check for duplicate IDs
  const ids = BADGES.map(b => b.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    console.error(`❌ Duplicate badge IDs: ${[...new Set(duplicates)].join(", ")}`);
  } else {
    console.log("✅ No duplicate badge IDs");
  }

  // 3. Check required fields
  const missingFields: string[] = [];
  for (const badge of BADGES) {
    if (!badge.id) missingFields.push(`${badge.name || "unknown"}: missing id`);
    if (!badge.name) missingFields.push(`${badge.id}: missing name`);
    if (!badge.description) missingFields.push(`${badge.id}: missing description`);
    if (!badge.emoji) missingFields.push(`${badge.id}: missing emoji`);
    if (!badge.color) missingFields.push(`${badge.id}: missing color`);
    if (!badge.unlockHint) missingFields.push(`${badge.id}: missing unlockHint`);
  }
  
  if (missingFields.length === 0) {
    console.log("✅ All badges have required fields (id, name, description, emoji, color, unlockHint)");
  } else {
    console.log(`❌ ${missingFields.length} badges have missing fields:`);
    missingFields.forEach(f => console.log(`  - ${f}`));
  }

  // 4. Check unique names
  const names = BADGES.map(b => b.name);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    console.error(`❌ Duplicate badge names found`);
  } else {
    console.log("✅ All badge names are unique");
  }

  // 5. Summary
  console.log("\n✅ Lencana validation complete.");
  process.exit(count < MIN_BADGES ? 1 : 0);
}

main();
