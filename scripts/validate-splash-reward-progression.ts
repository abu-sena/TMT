/**
 * Validator: Splash Screen, Replay Reward 1/4, Difficulty Progression (Stage 500)
 *
 * Run with: npx tsx scripts/validate-splash-reward-progression.ts
 *
 * Checks all critical invariants before QA and APK build.
 */

import * as fs from "fs";
import * as path from "path";

let errors = 0;
let warnings = 0;
let passes = 0;

function check(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passes++;
  } else {
    console.error(`  ❌ ${label}`);
    errors++;
  }
}

function warn(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passes++;
  } else {
    console.warn(`  ⚠️ ${label}`);
    warnings++;
  }
}

function checkFileExists(filePath: string, label?: string): void {
  const exists = fs.existsSync(filePath);
  check(exists, label || `File exists: ${filePath}`);
}

// ──────────────────────────────────────────────
// 1. SPLASH SCREEN VALIDATION
// ──────────────────────────────────────────────
console.log("\n═══ 1. SPLASH SCREEN VALIDATION ═══");

// 1a. Check index.html uses TMT splash (not 📜)
const indexHtml = fs.readFileSync("index.html", "utf-8");
check(
  indexHtml.includes("tmt-native-splash"),
  "index.html uses TMT-native-splash class"
);
check(
  !indexHtml.includes("📜"),
  "index.html does NOT contain old 📜 splash fallback"
);
check(
  indexHtml.includes("logo.png"),
  "index.html references TMT logo.png"
);
check(
  indexHtml.includes("#0A1628"),
  "index.html splash background uses TMT dark theme (#0A1628)"
);

// 1b. Check SplashScreen component exists
checkFileExists("src/screens/SplashScreen.tsx", "SplashScreen.tsx exists");
const splashScreen = fs.readFileSync("src/screens/SplashScreen.tsx", "utf-8");
check(
  splashScreen.includes("logo.png"),
  "SplashScreen.tsx references logo.png"
);
check(
  splashScreen.includes("Petualangan Ilmu"),
  "SplashScreen.tsx has TMT subtitle"
);

// 1c. Check routes/index.tsx uses SplashScreen during hydration
const routesIndex = fs.readFileSync("src/routes/index.tsx", "utf-8");
check(
  routesIndex.includes("<SplashScreen onDone={() => {}} />"),
  "routes/index.tsx renders SplashScreen during hydration (not 📜 fallback)"
);
check(
  !routesIndex.includes("📜"),
  "routes/index.tsx does NOT contain old 📜 fallback"
);

// 1d. Check GameAppStandalone uses SplashScreen during boot
const gameAppStandalone = fs.readFileSync("src/GameAppStandalone.tsx", "utf-8");
check(
  gameAppStandalone.includes("<SplashScreen onDone={() => {}} />"),
  "GameAppStandalone.tsx renders SplashScreen during boot"
);
check(
  gameAppStandalone.includes("isBooting"),
  "GameAppStandalone.tsx has boot state (isBooting)"
);

// 1e. Check Android native splash
const stylesXml = fs.readFileSync("android/app/src/main/res/values/styles.xml", "utf-8");
check(
  stylesXml.includes("@drawable/splash"),
  "Android styles.xml uses @drawable/splash for launch theme"
);
check(
  stylesXml.includes('windowSplashScreenBackground">#0A1628'),
  "Android styles.xml has TMT dark background for splash"
);

// 1f. Check Android drawable splash is TMT logo (not old 4KB fallback)
const splashDrawableStats = fs.statSync("android/app/src/main/res/drawable/splash.png");
check(
  splashDrawableStats.size > 500000, // TMT logo is ~580KB, old was 4KB
  `Android splash drawable is TMT logo (size: ${splashDrawableStats.size} bytes)`
);

console.log("\n═══ 2. REPLAY REWARD 1/4 VALIDATION ═══");

// 2a. Check types have completedCount and firstCompletedAt
const typesFile = fs.readFileSync("src/types/index.ts", "utf-8");
check(
  typesFile.includes("completedCount: number;"),
  "MissionProgress has completedCount field"
);
check(
  typesFile.includes("firstCompletedAt: number;"),
  "MissionProgress has firstCompletedAt field"
);

// 2b. Check routes/index.tsx has replay multiplier logic
check(
  routesIndex.includes("rewardMultiplier = isFirstCompletion ? 1.0"),
  "routes/index.tsx has first completion multiplier = 1.0"
);
check(
  routesIndex.includes("isReplay ? 0.25"),
  "routes/index.tsx has replay multiplier = 0.25"
);
check(
  routesIndex.includes("Math.floor(score.finalPoint * rewardMultiplier)"),
  "routes/index.tsx applies floor() to replay points"
);
check(
  routesIndex.includes("Math.floor(score.xpGain * rewardMultiplier)"),
  "routes/index.tsx applies floor() to replay XP"
);
check(
  routesIndex.includes("completedCount: newCompletedCount"),
  "routes/index.tsx tracks completedCount in missionProgress"
);
check(
  routesIndex.includes("firstCompletedAt:"),
  "routes/index.tsx tracks firstCompletedAt"
);

// 2c. Check GameAppStandalone.tsx has replay multiplier logic
check(
  gameAppStandalone.includes("rewardMultiplier = isFirstCompletion ? 1.0"),
  "GameAppStandalone.tsx has first completion multiplier = 1.0"
);
check(
  gameAppStandalone.includes("isReplay ? 0.25"),
  "GameAppStandalone.tsx has replay multiplier = 0.25"
);
check(
  gameAppStandalone.includes("Math.floor(score.finalPoint * rewardMultiplier)"),
  "GameAppStandalone.tsx applies floor() to replay points"
);
check(
  gameAppStandalone.includes("completedCount: newCompletedCount"),
  "GameAppStandalone.tsx tracks completedCount"
);

// 2d. Check reward box only appears for first completion
check(
  routesIndex.includes("isFirstCompletion && result.isCorrect"),
  "routes/index.tsx has first completion guard for stage rewards"
);
check(
  gameAppStandalone.includes("isFirstCompletion && result.isCorrect"),
  "GameAppStandalone.tsx has first completion guard for stage rewards"
);

console.log("\n═══ 3. DIFFICULTY PROGRESSION (STAGE 500) VALIDATION ═══");

// 3a. Check types have DIFFICULTY_ORDER and FINAL_STAGE_NUMBER
check(
  typesFile.includes('FINAL_STAGE_NUMBER = 500'),
  "FINAL_STAGE_NUMBER = 500 defined in types"
);
check(
  typesFile.includes('DIFFICULTY_ORDER: DifficultyId[] = ["tk"'),
  "DIFFICULTY_ORDER defined in types (6 difficulties)"
);
check(
  typesFile.includes('"universitas"') && typesFile.includes('"sma"'),
  "All 6 difficulties present in DIFFICULTY_ORDER"
);

// 3b. Check progress.ts has all helper functions
const progressFile = fs.readFileSync("src/lib/progress.ts", "utf-8");
check(
  progressFile.includes("export function isFinalStage"),
  "progress.ts has isFinalStage()"
);
check(
  progressFile.includes("export function getNextDifficulty"),
  "progress.ts has getNextDifficulty()"
);
check(
  progressFile.includes("export function claimDifficultyCompletionReward"),
  "progress.ts has claimDifficultyCompletionReward()"
);
check(
  progressFile.includes("export function unlockNextDifficulty"),
  "progress.ts has unlockNextDifficulty()"
);
check(
  progressFile.includes("export function hasClaimedDifficultyCompletionReward"),
  "progress.ts has hasClaimedDifficultyCompletionReward()"
);
check(
  progressFile.includes("export function markFinalRewardPending"),
  "progress.ts has markFinalRewardPending()"
);
check(
  progressFile.includes("export function hasAnyPendingFinalRewards"),
  "progress.ts has hasAnyPendingFinalRewards()"
);

// 3c. Check DIFFICULTY_COMPLETION_REWARDS has all 6 difficulties
check(
  typesFile.includes('tk: { exp: 1000'),
  "TK completion reward: 1,000 EXP"
);
check(
  typesFile.includes('"sd-bawah": { exp: 1500'),
  "SD Bawah completion reward: 1,500 EXP"
);
check(
  typesFile.includes('"sd-atas": { exp: 2000'),
  "SD Atas completion reward: 2,000 EXP"
);
check(
  typesFile.includes('smp: { exp: 2500'),
  "SMP completion reward: 2,500 EXP"
);
check(
  typesFile.includes('sma: { exp: 3000'),
  "SMA completion reward: 3,000 EXP"
);
check(
  typesFile.includes('universitas: { exp: 5000'),
  "Universitas completion reward: 5,000 EXP"
);
check(
  typesFile.includes('"the-true-mastermind"'),
  "The True Mastermind badge defined for Universitas completion"
);

// 3d. Check badges have all completion badges
const badgesFile = fs.readFileSync("src/data/badges.ts", "utf-8");
check(
  badgesFile.includes('id: "tk-complete"'),
  "Badge: TK Complete defined"
);
check(
  badgesFile.includes('id: "universitas-complete"'),
  "Badge: Universitas Complete defined"
);
check(
  badgesFile.includes('id: "the-true-mastermind"'),
  "Badge: The True Mastermind defined"
);

// 3e. Check routes/index.tsx has Stage 500 flow
check(
  routesIndex.includes("isFinalStage(activeMission.number)"),
  "routes/index.tsx checks isFinalStage after mission completion"
);
check(
  routesIndex.includes("DifficultyCompletionBox"),
  "routes/index.tsx imports DifficultyCompletionBox"
);
check(
  routesIndex.includes("DifficultyUnlockModal"),
  "routes/index.tsx imports DifficultyUnlockModal"
);
check(
  routesIndex.includes("MasteryCompleteModal"),
  "routes/index.tsx imports MasteryCompleteModal"
);
check(
  routesIndex.includes("handleCompletionBoxClaim"),
  "routes/index.tsx has handleCompletionBoxClaim"
);
check(
  routesIndex.includes("handleUnlockNow"),
  "routes/index.tsx has handleUnlockNow"
);
check(
  routesIndex.includes("handleUnlockLater"),
  "routes/index.tsx has handleUnlockLater"
);
check(
  routesIndex.includes("handleMasteryClose"),
  "routes/index.tsx has handleMasteryClose"
);

// 3f. Check GameAppStandalone has Stage 500 flow
check(
  gameAppStandalone.includes("completionBoxOpen"),
  "GameAppStandalone.tsx has completionBoxOpen state"
);
check(
  gameAppStandalone.includes("unlockModalOpen"),
  "GameAppStandalone.tsx has unlockModalOpen state"
);
check(
  gameAppStandalone.includes("masteryModalOpen"),
  "GameAppStandalone.tsx has masteryModalOpen state"
);

// 3g. Check HomeScreen receives onOpenPendingBox and onHomeUpgrade
const homeScreen = fs.readFileSync("src/screens/HomeScreen.tsx", "utf-8");
check(
  homeScreen.includes("onOpenPendingBox"),
  "HomeScreen.tsx accepts onOpenPendingBox prop"
);
check(
  homeScreen.includes("onHomeUpgrade"),
  "HomeScreen.tsx accepts onHomeUpgrade prop"
);

console.log("\n═══ 4. MIGRATION VALIDATION ═══");

// 4a. Check v6 migration exists
const migrationsFile = fs.readFileSync("src/lib/storage/migrations.ts", "utf-8");
check(
  migrationsFile.includes("v6: Add completedCount & firstCompletedAt"),
  "Migration v6 exists with description"
);
check(
  migrationsFile.includes("completedCount: old.completedCount ?? (wasCompleted ? 1 : 0)"),
  "Migration v6 adds completedCount defaults"
);
check(
  migrationsFile.includes("firstCompletedAt: old.firstCompletedAt ?? (wasCompleted ? (old.completedAt ?? 0) : 0)"),
  "Migration v6 adds firstCompletedAt defaults"
);

// 4b. Check CURRENT_VERSION is 6
const constantsFile = fs.readFileSync("src/lib/storage/constants.ts", "utf-8");
check(
  constantsFile.includes("CURRENT_VERSION = 6"),
  "CURRENT_VERSION is 6"
);
check(
  constantsFile.includes("6 — Added completedCount & firstCompletedAt"),
  "CURRENT_VERSION comment documents v6 change"
);

console.log("\n═══ 5. APK BUILD VALIDATION ═══");

// 5a. Check APK exists
checkFileExists("release/EduGame.apk", "APK exists at release/EduGame.apk");
const apkStats = fs.statSync("release/EduGame.apk");
check(
  apkStats.size > 5000000, // should be > 5MB
  `APK size: ${(apkStats.size / 1024 / 1024).toFixed(1)} MB (>5MB)`
);

// 5b. Check versionCode bumped
const gradleFile = fs.readFileSync("android/app/build.gradle", "utf-8");
check(
  gradleFile.includes("versionCode 7"),
  "versionCode bumped to 7"
);
check(
  gradleFile.includes('versionName "1.0.7"'),
  "versionName bumped to 1.0.7"
);

// ──────────────────────────────────────────────
// SUMMARY
// ──────────────────────────────────────────────
console.log("\n═══════════════════════════════════════");
console.log(`  RESULTS: ${passes} passed, ${errors} errors, ${warnings} warnings`);
console.log("═══════════════════════════════════════");

if (errors > 0) {
  console.error(`\n❌ VALIDATION FAILED with ${errors} error(s). Fix before build.`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n⚠️  VALIDATION PASSED with ${warnings} warning(s). Review before proceeding.`);
  process.exit(0);
} else {
  console.log(`\n✅ ALL VALIDATIONS PASSED (${passes} checks). Ready for QA and APK build.`);
}
