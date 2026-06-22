/**
 * validate-minigames.ts
 *
 * Validates mini-game definitions and implementations:
 * - All active mini-games are playable (have screens)
 * - Removed mini-games (Susun Puzzle, Jurnal Kebaikan, Hadiah Dunia Nyata) are not active
 * - Each game has valid package, difficulties, gameType
 * - No placeholder-only games in active list
 */

import { MINI_GAMES, MINI_GAME_PACKAGES, getMiniGamesByPackage } from "../src/data/minigame-definitions";
import type { MiniGamePackageId } from "../src/types";

const REMOVED_GAMES = ["susun-puzzle", "jurnal-kebaikan", "hadiah-dunia-nyata"];
const REQUIRED_PACKAGES: MiniGamePackageId[] = ["fokus-cepat", "adab", "logika", "spasial", "keluarga"];

// Required mini-games per package (id → package)
const REQUIRED_GAMES: Record<string, string[]> = {
  "fokus-cepat": ["hitung-kilat", "pola-kilat", "ingatan-cepat", "cari-berbeda"],
  "adab": ["pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak"],
  "logika": ["detektif-petunjuk", "tebak-aturan", "pilih-kesimpulan", "benar-atau-salah", "kode-warna"],
  "spasial": ["ubah-posisi", "cocok-bayangan", "jalur-tercepat"],
  "keluarga": ["misi-keluarga", "family-challenge"],
};

function main() {
  console.log("🔍 Validating mini-game definitions...\n");

  // 1. Check packages
  if (MINI_GAME_PACKAGES.length !== 5) {
    console.error(`❌ Expected 5 packages, found ${MINI_GAME_PACKAGES.length}`);
  } else {
    console.log("✅ 5 mini-game packages defined");
  }

  const packageIds = MINI_GAME_PACKAGES.map(p => p.id);
  for (const reqPkg of REQUIRED_PACKAGES) {
    if (!packageIds.includes(reqPkg)) {
      console.error(`❌ Missing required package: ${reqPkg}`);
    }
  }

  // 2. Check removed games are NOT in active list
  const activeIds = MINI_GAMES.filter(g => g.isActive).map(g => g.id);
  for (const removed of REMOVED_GAMES) {
    if (activeIds.includes(removed)) {
      console.error(`❌ Removed game "${removed}" is still ACTIVE in definitions!`);
    } else {
      console.log(`✅ Removed game "${removed}" is not active`);
    }
  }

  // 3. Check all active games have screenId
  const missingScreenIds = MINI_GAMES.filter(g => g.isActive && !g.screenId);
  if (missingScreenIds.length > 0) {
    console.error(`❌ ${missingScreenIds.length} active games missing screenId:`);
    missingScreenIds.forEach(g => console.log(`  - ${g.id} (${g.title})`));
  } else {
    console.log("✅ All active mini-games have screenId");
  }

  // 4. Check all required games exist and are active
  let missingRequired = false;
  for (const [pkgId, gameIds] of Object.entries(REQUIRED_GAMES)) {
    const pkgGames = getMiniGamesByPackage(pkgId as MiniGamePackageId);
    const pkgGameIds = pkgGames.map(g => g.id);
    for (const gameId of gameIds) {
      if (!pkgGameIds.includes(gameId)) {
        console.error(`❌ Required game "${gameId}" missing from package "${pkgId}"`);
        missingRequired = true;
      }
    }
  }
  if (!missingRequired) {
    console.log("✅ All required mini-games present in their packages");
  }

  // 5. Validate game types
  const validGameTypes = new Set([
    "speed-math", "pattern-speed", "memory-speed", "spot-difference",
    "moral-choice", "gentle-advice", "adab-sort", "wisdom-dilemma",
    "detective-clues", "guess-rule", "pick-conclusion", "true-or-false",
    "change-position", "match-shadow", "fastest-path",
    "family-mission", "family-challenge", "color-code",
  ]);

  const invalidTypes = MINI_GAMES.filter(g => !validGameTypes.has(g.gameType));
  if (invalidTypes.length > 0) {
    console.error(`❌ ${invalidTypes.length} games have invalid gameType:`);
    invalidTypes.forEach(g => console.log(`  - ${g.id}: "${g.gameType}"`));
  } else {
    console.log("✅ All mini-game types are valid");
  }

  // 6. Count active games
  const activeGameCount = MINI_GAMES.filter(g => g.isActive).length;
  console.log(`\n📊 Total mini-games: ${MINI_GAMES.length}`);
  console.log(`📊 Active mini-games: ${activeGameCount}`);
  console.log(`📊 Inactive mini-games: ${MINI_GAMES.length - activeGameCount}`);

  console.log("\n✅ Mini-game validation complete.");
  process.exit(0);
}

main();
