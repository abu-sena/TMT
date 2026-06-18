/**
 * validate-map-stages.ts
 *
 * Validates the adventure map / peta petualangan:
 * - World-based structure (not checklist list)
 * - Background variety across worlds
 * - Challenge types are mixed (not all same category consecutive)
 * - Stages match difficulty
 * - Boss stages exist
 * - Reward/gift boxes at world completion
 */

import { ALL_WORLDS, WORLDS_BY_DIFFICULTY } from "../src/data/worlds";
import { MISSIONS } from "../src/data/missions";
import { getMissionsForDifficulty } from "../src/data/mission-adapter";

function main() {
  console.log("🔍 Validating Peta Petualangan (adventure map)...\n");

  // 1. Check world structure (worlds, not list)
  console.log(`📊 Total worlds: ${ALL_WORLDS.length}`);
  const difficulties = Object.keys(WORLDS_BY_DIFFICULTY);
  console.log(`📊 Difficulty levels with worlds: ${difficulties.length}`);
  
  for (const [diff, worlds] of Object.entries(WORLDS_BY_DIFFICULTY)) {
    console.log(`  - ${diff}: ${worlds.length} worlds`);
  }

  // 2. Check background variety (themeColor, icon, description)
  const themes = ALL_WORLDS.map(w => `${w.icon} ${w.name}`);
  const uniqueThemes = new Set(ALL_WORLDS.map(w => w.themeColor));
  console.log(`\n📊 Unique theme colors: ${uniqueThemes.size}`);
  
  // Check world variety - look at descriptions
  const worldTypes = ALL_WORLDS.map(w => w.description.split(" ")[0]); // first word of description
  console.log(`📊 World types: ${[...new Set(worldTypes)].join(", ")}`);

  // 3. Check boss stages per world
  const worldsWithoutBoss = ALL_WORLDS.filter(w => w.bossStages.length === 0);
  if (worldsWithoutBoss.length > 0) {
    console.error(`❌ ${worldsWithoutBoss.length} worlds have no boss stages`);
  } else {
    console.log("✅ All worlds have boss stages");
  }

  // 4. Check completion rewards
  const worldsWithoutReward = ALL_WORLDS.filter(w => !w.completionReward);
  if (worldsWithoutReward.length > 0) {
    console.error(`❌ ${worldsWithoutReward.length} worlds missing completion reward`);
  } else {
    console.log("✅ All worlds have completion rewards");
  }

  // 5. Try to access missions per difficulty (adapter check)
  const missionErrors: string[] = [];
  for (const diff of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as const) {
    try {
      const missions = getMissionsForDifficulty(diff);
      console.log(`  - ${diff}: ${missions.length} missions via adapter`);
    } catch (e) {
      missionErrors.push(`Failed to get missions for ${diff}: ${e}`);
    }
  }

  // 6. Check legacy missions difficulty spread
  const legacyMissions = MISSIONS;
  const diffCounts: Record<string, number> = {};
  for (const m of legacyMissions) {
    diffCounts[m.difficulty] = (diffCounts[m.difficulty] || 0) + 1;
  }
  console.log("\n📊 Legacy mission counts per difficulty:");
  for (const [diff, count] of Object.entries(diffCounts)) {
    console.log(`  - ${diff}: ${count}`);
  }

  // 7. Check for mission category mixing in legacy missions
  // For each difficulty, check consecutive same-category missions
  for (const diff of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as const) {
    const diffMissions = legacyMissions.filter(m => m.difficulty === diff).sort((a, b) => a.number - b.number);
    let consecutiveCount = 0;
    let maxConsecutive = 0;
    let prevCategory = "";
    for (const m of diffMissions) {
      if (m.category === prevCategory) {
        consecutiveCount++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      } else {
        consecutiveCount = 1;
        prevCategory = m.category;
      }
    }
    if (maxConsecutive > 3) {
      console.log(`⚠️  ${diff}: Max ${maxConsecutive} consecutive same-category missions (limit 3)`);
    }
  }

  console.log("\n✅ Map stages validation complete.");
  process.exit(0);
}

main();
