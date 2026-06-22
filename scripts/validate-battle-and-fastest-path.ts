/**
 * Validator: Battle Mini-Game Expansion & Jalur Tercepat Fullscreen
 *
 * Run with: npx tsx scripts/validate-battle-and-fastest-path.ts
 */

import * as fs from "fs";
import { BATTLE_GAME_POOL, getBattleGames, type BattleCategory } from "../src/lib/battle-game-pool";

let errors = 0;
let warnings = 0;
let passes = 0;

function check(condition: boolean, label: string): void {
  if (condition) { console.log(`  ✅ ${label}`); passes++; }
  else { console.error(`  ❌ ${label}`); errors++; }
}

// ═══════════════════════════════════════
// 1. BATTLE GAME POOL VALIDATION
// ═══════════════════════════════════════
console.log("\n═══ 1. BATTLE GAME POOL ═══");

// All non-adab games have isBattleEnabled = true
const nonAdabGames = BATTLE_GAME_POOL.filter(g => !g.isAdabGame);
const adabGames = BATTLE_GAME_POOL.filter(g => g.isAdabGame);

for (const g of nonAdabGames) {
  check(g.isBattleEnabled, `${g.gameId}: isBattleEnabled = true`);
}
for (const g of adabGames) {
  check(!g.isBattleEnabled, `${g.gameId}: isBattleEnabled = false (adab excluded from Battle)`);
}

// Verify Fokus Cepat games in pool
console.log("\n═══ 2. FOKUS CEPAT BATTLE GAMES ═══");
const fokusGames = getBattleGames("fokus-cepat");
const fokusIds = fokusGames.map(g => g.gameId);
check(fokusIds.includes("hitung-kilat"), "hitung-kilat in Fokus Cepat");
check(fokusIds.includes("pola-kilat"), "pola-kilat in Fokus Cepat");
check(fokusIds.includes("ingatan-cepat"), "ingatan-cepat in Fokus Cepat");
check(fokusIds.includes("cari-yang-berbeda"), "cari-yang-berbeda in Fokus Cepat");
check(fokusGames.length >= 4, `Fokus Cepat has ${fokusGames.length} games (min 4)`);

// Verify Logika games
console.log("\n═══ 3. LOGIKA BATTLE GAMES ═══");
const logikaGames = getBattleGames("logika");
const logikaIds = logikaGames.map(g => g.gameId);
check(logikaIds.includes("detektif-petunjuk"), "detektif-petunjuk in Logika");
check(logikaIds.includes("tebak-aturan"), "tebak-aturan in Logika");
check(logikaIds.includes("pilih-kesimpulan"), "pilih-kesimpulan in Logika");
check(logikaIds.includes("benar-atau-salah"), "benar-atau-salah in Logika");
check(logikaIds.includes("kode-warna"), "kode-warna in Logika");
check(logikaGames.length >= 5, `Logika has ${logikaGames.length} games (min 5)`);

// Verify Spasial games
console.log("\n═══ 4. SPASIAL BATTLE GAMES ═══");
const spasialGames = getBattleGames("spasial");
const spasialIds = spasialGames.map(g => g.gameId);
check(spasialIds.includes("ubah-posisi"), "ubah-posisi in Spasial");
check(spasialIds.includes("cocokkan-bayangan"), "cocokkan-bayangan in Spasial");
check(spasialIds.includes("jalur-tercepat"), "jalur-tercepat in Spasial");
check(spasialGames.length >= 3, `Spasial has ${spasialGames.length} games (min 3)`);

// Verify adab games NOT in battle
console.log("\n═══ 5. ADAB GAMES EXCLUDED ═══");
const adabIds = adabGames.map(g => g.gameId);
check(adabIds.includes("pilih-sikap-terbaik"), "pilih-sikap-terbaik is adab (excluded)");
check(adabIds.includes("nasihat-dengan-lembut"), "nasihat-dengan-lembut is adab (excluded)");
check(adabIds.includes("urutkan-adab"), "urutkan-adab is adab (excluded)");
check(adabIds.includes("dilema-bijak"), "dilema-bijak is adab (excluded)");
check(adabIds.includes("misi-keluarga"), "misi-keluarga is adab/keluarga (excluded)");

// Verify no adab games in getBattleGames
const allBattleIds = getBattleGames().map(g => g.gameId);
check(!allBattleIds.includes("pilih-sikap-terbaik"), "pilih-sikap-terbaik NOT in Battle pool");
check(!allBattleIds.includes("nasihat-dengan-lembut"), "nasihat-dengan-lembut NOT in Battle pool");
check(!allBattleIds.includes("urutkan-adab"), "urutkan-adab NOT in Battle pool");
check(!allBattleIds.includes("dilema-bijak"), "dilema-bijak NOT in Battle pool");
check(!allBattleIds.includes("misi-keluarga"), "misi-keluarga NOT in Battle pool");

// Verify each battle game has required functions
console.log("\n═══ 6. BATTLE GAME ADAPTERS ═══");
for (const g of allBattleIds) {
  const game = BATTLE_GAME_POOL.find(x => x.gameId === g);
  if (!game) continue;
  check(typeof game.generateQuestion === "function", `${g}: has generateQuestion`);
  // Most games have generateChoices
  if (g !== "jalur-tercepat" && g !== "ubah-posisi") {
    check(typeof game.generateChoices === "function", `${g}: has generateChoices`);
  }
  check(typeof game.validateAnswer === "function", `${g}: has validateAnswer`);
  check(typeof game.calculateScore === "function", `${g}: has calculateScore`);
  check(typeof game.getFeedback === "function", `${g}: has getFeedback`);
}

// ═══════════════════════════════════════
// 7. BATTLE SCREEN UPDATES
// ═══════════════════════════════════════
console.log("\n═══ 7. BATTLE SCREEN ═══");
const battleScreen = fs.readFileSync("src/screens/BattleScreen.tsx", "utf-8");
check(battleScreen.includes("Battle Fokus Cepat"), "BattleScreen has 'Battle Fokus Cepat' mode");
check(battleScreen.includes("Battle Logika"), "BattleScreen has 'Battle Logika' mode");
check(battleScreen.includes("Battle Spasial"), "BattleScreen has 'Battle Spasial' mode");
check(battleScreen.includes("Battle Campuran"), "BattleScreen has 'Battle Campuran' mode");
check(!battleScreen.includes("Adab Bijak Duel"), "BattleScreen does NOT have 'Adab Bijak Duel'");
check(!battleScreen.includes("Mastermind Duel"), "BattleScreen does NOT have old 'Mastermind Duel' label");
check(battleScreen.includes("battle-game-pool"), "BattleScreen imports from battle-game-pool");
check(battleScreen.includes("BATTLE_GAME_POOL"), "BattleScreen references BATTLE_GAME_POOL");
check(battleScreen.includes("jalur-tercepat-play"), "BattleScreen has jalur-tercepat-play phase");
check(battleScreen.includes("ubah-posisi-play"), "BattleScreen has ubah-posisi-play phase");

// ═══════════════════════════════════════
// 8. JALUR TERCEPAT FULLSCREEN
// ═══════════════════════════════════════
console.log("\n═══ 8. JALUR TERCEPAT FULLSCREEN ═══");
const spasialScreen = fs.readFileSync("src/screens/MiniGameSpasialKeluargaScreens.tsx", "utf-8");

// Check grid dimensions
check(spasialScreen.includes("FASTEST_PATH_ROWS = 16"), "FASTEST_PATH_ROWS = 16");
check(spasialScreen.includes("FASTEST_PATH_COLS = 6"), "FASTEST_PATH_COLS = 6");

// Check fullscreen layout
check(spasialScreen.includes("95vw"), "Jalur Tercepat uses 95vw width");
check(spasialScreen.includes("max-w-[600px]"), "Jalur Tercepat has max-w-[600px]");
// Find Jalur Tercepat grid section — should use 95vw, not max-w-lg
const jtGridSection = spasialScreen.substring(spasialScreen.indexOf("Grid - fullscreen focus"));
check(!jtGridSection.includes("max-w-lg"), "Jalur Tercepat grid section does NOT use max-w-lg (uses 95vw)");

// Check grid in Battle too
check(battleScreen.includes("95vw"), "Battle Jalur Tercepat also uses 95vw");
check(battleScreen.includes(`FP_COLS || 6`), "Battle has FP_COLS fallback");

// Check movement rules
check(spasialScreen.includes("dist > 1"), "Jalur Tercepat validates adjacent movement");
check(spasialScreen.includes("Pilih kotak yang bersebelahan"), "Shows feedback for non-adjacent clicks");
check(spasialScreen.includes("Tidak bisa melewati rintangan"), "Shows feedback for obstacle clicks");

// Check BFS path finding
check(spasialScreen.includes("function bfs"), "Has BFS function for shortest path");
check(spasialScreen.includes("shortestPath"), "References shortestPath");

// ═══════════════════════════════════════
// 9. FISHER-YATES SHUFFLE FOR BATTLE CHOICES
// ═══════════════════════════════════════
console.log("\n═══ 9. RANDOM CHOICES ═══");
const poolFile = fs.readFileSync("src/lib/battle-game-pool.ts", "utf-8");
check(poolFile.includes("shuffleArray"), "battle-game-pool uses shuffleArray");
check(poolFile.includes("return shuffleArray"), "Choices are shuffled before return");

// ═══════════════════════════════════════
// 10. APK BUILD
// ═══════════════════════════════════════
console.log("\n═══ 10. APK BUILD ═══");
const apkExists = fs.existsSync("release/TMT.apk");
check(apkExists, "APK exists at release/TMT.apk");
if (apkExists) {
  const apkStats = fs.statSync("release/TMT.apk");
  check(apkStats.size > 5000000, `APK size: ${(apkStats.size / 1024 / 1024).toFixed(1)} MB (>5MB)`);
}

// Version check
const gradle = fs.readFileSync("android/app/build.gradle", "utf-8");
check(gradle.includes("versionCode 8"), "versionCode bumped to 8");
check(gradle.includes('versionName "1.0.8"'), "versionName is 1.0.8");

// ═══════════════════════════════════════
console.log("\n═══════════════════════════════════════");
console.log(`  RESULTS: ${passes} passed, ${errors} errors, ${warnings} warnings`);
console.log("═══════════════════════════════════════");

if (errors > 0) {
  console.error(`\n❌ VALIDATION FAILED with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log(`\n✅ ALL VALIDATIONS PASSED (${passes} checks). Ready!`);
}
