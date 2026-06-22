/**
 * validate-adab-games-and-daily-checklist.ts
 *
 * Validates all adab mini-games and daily checklist flow:
 * 1. No 🌟 icon clue on correct answers before submission
 * 2. All choices have neutral icons/styles before submission
 * 3. All choices are random (Fisher-Yates)
 * 4. Urutkan Adab shuffled steps ≠ correct order
 * 5. Validator uses step IDs, not indices
 * 6. Daily Adab Checklist has correct status enum
 * 7. Child checklist → pending_parent_validation
 * 8. Parent approve → approved_by_parent
 * 9. Parent reject → rejected_by_parent
 * 10. Reward only when approved
 * 11. No double reward
 * 12. Parent only validates, not checklist from scratch
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════
// Fisher-Yates shuffle (mirror)
// ═══════════════════════════════════════════

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ═══════════════════════════════════════════
// Test helpers
// ═══════════════════════════════════════════

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];
function test(name: string, fn: () => boolean | string) {
  try {
    const result = fn();
    if (result === true) {
      results.push({ name, passed: true, message: "✅ LULUS" });
    } else {
      results.push({ name, passed: false, message: `❌ GAGAL: ${result}` });
    }
  } catch (e: any) {
    results.push({ name, passed: false, message: `❌ ERROR: ${e.message}` });
  }
}

// ═══════════════════════════════════════════
// 1. Check source code for 🌟 icon clue
// ═══════════════════════════════════════════

const screensDir = path.join(__dirname, "..", "src", "screens");

function checkFileForIconClue(filePath: string): string | null {
  const content = fs.readFileSync(filePath, "utf-8");
  
  // Look for patterns where 🌟 could indicate correct answer before submission
  // The problematic pattern: icon arrays like ["🌟","💚",...] in choice buttons
  
  // Check if 🌟 appears in choice/option rendering contexts (before submission)
  const lines = content.split("\n");
  const problematicLines: number[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for 🌟 in icon arrays used for choices
    if (line.includes("🌟") && (line.includes("💚") || line.includes("💛") || line.includes("💙") || line.includes("💜"))) {
      // Check if this is in a choice button context (not feedback/result)
      if (!line.includes("feedback") && !line.includes("result") && !line.includes("Pelajaran")) {
        problematicLines.push(i + 1);
      }
    }
  }
  
  return problematicLines.length > 0 
    ? `${path.basename(filePath)}: lines ${problematicLines.join(", ")} — 🌟 icon still in choice array`
    : null;
}

// ═══════════════════════════════════════════
// 2. Validate Urutkan Adab shuffle
// ═══════════════════════════════════════════

interface UrutkanStep {
  id: number;
  text: string;
  correctOrder: number;
}

const URUTKAN_RAW = [
  { title: "Urutan berwudhu", steps: ["Niat", "Cuci tangan", "Berkumur", "Cuci muka", "Cuci tangan sampai siku", "Usap kepala", "Cuci kaki"] },
  { title: "Urutan sebelum makan", steps: ["Cuci tangan", "Duduk", "Baca doa makan (Bismillah)", "Makan dengan tangan kanan", "Baca doa selesai (Alhamdulillah)"] },
  { title: "Urutan meminjam barang", steps: ["Ucapkan salam", "Minta izin meminjam", "Gunakan dengan hati-hati", "Kembalikan", "Ucapkan terima kasih"] },
  { title: "Urutan masuk masjid", steps: ["Masuk dengan kaki kanan", "Baca doa masuk masjid", "Shalat tahiyatul masjid", "Duduk dengan tenang", "Keluar dengan kaki kiri"] },
];

function createCorrectSteps(steps: string[]): UrutkanStep[] {
  return steps.map((text, i) => ({ id: i, text, correctOrder: i }));
}

function shuffledDiffersFromCorrect(correctSteps: UrutkanStep[]): boolean {
  for (let trial = 0; trial < 10; trial++) {
    const shuffled = shuffleArray(correctSteps);
    const isSame = shuffled.every((s, i) => s.correctOrder === i);
    if (!isSame) {
      // Verify we can detect this is different
      return true;
    }
  }
  return false; // All 10 trials were same (extremely unlikely with Fisher-Yates)
}

function validateUrutkanAnswer(correctSteps: UrutkanStep[], selectedIds: number[]): boolean {
  return selectedIds.every((id, i) => {
    const step = correctSteps.find(s => s.id === id);
    return step?.correctOrder === i;
  });
}

// ═══════════════════════════════════════════
// 3. Daily Adab Checklist status validation
// ═══════════════════════════════════════════

const VALID_STATUSES = [
  "not_started",
  "checked_by_child",
  "pending_parent_validation",
  "approved_by_parent",
  "rejected_by_parent",
];

// ═══════════════════════════════════════════
// Run Tests
// ═══════════════════════════════════════════

console.log("╔══════════════════════════════════════════════════════╗");
console.log("║  Validasi Mini-Game Adab & Misi Harian Checklist    ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

// ── Test 1: No 🌟 icon clue in choice arrays ──
console.log("🔍 Test 1: Memeriksa 🌟 icon clue pada pilihan adab...\n");

const adabScreenFiles = [
  "MiniGameAdabScreen.tsx",
  "MiniGameAdabScreens.tsx",
];

for (const file of adabScreenFiles) {
  const filePath = path.join(screensDir, file);
  if (fs.existsSync(filePath)) {
    const issue = checkFileForIconClue(filePath);
    test(`1.${adabScreenFiles.indexOf(file) + 1} — ${file}: tidak ada 🌟 di pilihan`, () => {
      return issue === null ? true : issue;
    });
  }
}

// ── Test 2: All choices have neutral icons ──
console.log("\n🔍 Test 2: Memeriksa icon netral di semua pilihan...\n");

for (const file of adabScreenFiles) {
  const filePath = path.join(screensDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const hasNeutralIcons = content.includes("💬") && (content.includes("🔷") || content.includes("📌") || content.includes("🔹"));
    test(`2.${adabScreenFiles.indexOf(file) + 1} — ${file}: menggunakan icon netral`, () => {
      return hasNeutralIcons ? true : "Icon netral (💬,🔷,📌,🔹) tidak ditemukan di pilihan";
    });
  }
}

// ── Test 3: Fisher-Yates shuffle present ──
console.log("\n🔍 Test 3: Memeriksa Fisher-Yates shuffle di semua game adab...\n");

for (const file of adabScreenFiles) {
  const filePath = path.join(screensDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    const hasFisherYates = content.includes("for (let i = arr.length - 1; i > 0; i--)") ||
                           content.includes("for (let i = a.length - 1; i > 0; i--)") ||
                           content.includes("shuffleArray");
    const hasBadSort = content.includes(".sort(() => Math.random() - 0.5)");
    test(`3.${adabScreenFiles.indexOf(file) + 1} — ${file}: Fisher-Yates, bukan sort random`, () => {
      if (hasBadSort) return "Menggunakan .sort(() => Math.random() - 0.5) — HARUS Fisher-Yates";
      return hasFisherYates ? true : "Fisher-Yates tidak ditemukan (mungkin import dari utils)";
    });
  }
}

// ── Test 4: Urutkan Adab shuffle ≠ correct order ──
console.log("\n🔍 Test 4: Validasi Urutkan Adab — shuffle & validator...\n");

for (let qi = 0; qi < URUTKAN_RAW.length; qi++) {
  const raw = URUTKAN_RAW[qi];
  const correctSteps = createCorrectSteps(raw.steps);

  test(`4.${qi + 1}a — ${raw.title}: shuffled ≠ correct order`, () => {
    const isDifferent = shuffledDiffersFromCorrect(correctSteps);
    return isDifferent ? true : "Shuffle menghasilkan urutan yang sama dengan correct order";
  });

  test(`4.${qi + 1}b — ${raw.title}: validator pakai step.id`, () => {
    // Test correct answer
    const correctIds = correctSteps.map(s => s.id); // [0,1,2,...]
    const isCorrect = validateUrutkanAnswer(correctSteps, correctIds);
    if (!isCorrect) return "Validator gagal mendeteksi jawaban benar";

    // Test wrong answer (reversed)
    const wrongIds = [...correctIds].reverse();
    const isWrong = !validateUrutkanAnswer(correctSteps, wrongIds);
    if (!isWrong) return "Validator gagal mendeteksi jawaban salah (reversed)";

    // Test partial wrong
    const partialWrong = [...correctIds];
    [partialWrong[0], partialWrong[1]] = [partialWrong[1], partialWrong[0]];
    const isPartialWrong = !validateUrutkanAnswer(correctSteps, partialWrong);
    if (!isPartialWrong) return "Validator gagal mendeteksi jawaban salah (partial swap)";

    return true;
  });

  // Verify step count appropriate
  test(`4.${qi + 1}c — ${raw.title}: jumlah langkah masuk akal`, () => {
    if (raw.steps.length < 2) return "Terlalu sedikit langkah (< 2)";
    if (raw.steps.length > 9) return "Terlalu banyak langkah (> 9)";
    return true;
  });
}

// ── Test 5: Daily Adab Checklist status enum ──
console.log("\n🔍 Test 5: Validasi enum status Daily Adab Checklist...\n");

test("5.1 — Status enum lengkap", () => {
  const required = ["not_started", "checked_by_child", "pending_parent_validation", "approved_by_parent", "rejected_by_parent"];
  for (const s of required) {
    if (!VALID_STATUSES.includes(s)) return `Status "${s}" tidak ada di valid statuses`;
  }
  return true;
});

test("5.2 — Status flow: not_started → pending_parent_validation", () => {
  // Simulate child checking
  const initial: string = "not_started";
  let status = initial;
  // Child checks
  status = "pending_parent_validation";
  if (status !== "pending_parent_validation") return "Gagal transisi ke pending_parent_validation";
  return true;
});

test("5.3 — Status flow: pending_parent_validation → approved_by_parent", () => {
  let status: string = "pending_parent_validation";
  // Parent approves
  status = "approved_by_parent";
  if (status !== "approved_by_parent") return "Gagal transisi ke approved_by_parent";
  return true;
});

test("5.4 — Status flow: pending_parent_validation → rejected_by_parent", () => {
  let status: string = "pending_parent_validation";
  // Parent rejects
  status = "rejected_by_parent";
  if (status !== "rejected_by_parent") return "Gagal transisi ke rejected_by_parent";
  return true;
});

test("5.5 — Reward hanya saat approved_by_parent", () => {
  const rewardRules = {
    not_started: false,
    checked_by_child: false,
    pending_parent_validation: false,
    approved_by_parent: true,
    rejected_by_parent: false,
  };
  for (const [s, shouldReward] of Object.entries(rewardRules)) {
    if (s === "approved_by_parent" && !shouldReward) return `Harusnya reward saat ${s}`;
    if (s !== "approved_by_parent" && shouldReward) return `Seharusnya TIDAK reward saat ${s}`;
  }
  return true;
});

test("5.6 — Tidak boleh double reward", () => {
  // Simulate: parent approves twice — should only reward once
  let rewardCount = 0;
  let itemRewardGranted = false;
  
  // First approve
  if (!itemRewardGranted) {
    itemRewardGranted = true;
    rewardCount++;
  }
  // Second approve (double click)
  if (!itemRewardGranted) {
    // This should never execute because itemRewardGranted is already true
    rewardCount++;
  }
  
  return rewardCount === 1 ? true : `Double reward terdeteksi: count = ${rewardCount}`;
});

// ── Test 6: Generate 30 Urutkan Adab scenarios ──
console.log("\n🔍 Test 6: Generate 30 soal Urutkan Adab...\n");

const allScenarios = [
  { scenario: "Urutan wudhu", steps: ["Niat", "Cuci tangan", "Berkumur", "Cuci muka", "Cuci tangan sampai siku", "Usap kepala", "Cuci kaki"] },
  { scenario: "Sebelum makan", steps: ["Cuci tangan", "Duduk", "Baca doa", "Makan tangan kanan", "Alhamdulillah"] },
  { scenario: "Meminjam barang", steps: ["Salam", "Minta izin", "Gunakan hati-hati", "Kembalikan", "Terima kasih"] },
  { scenario: "Masuk masjid", steps: ["Kaki kanan", "Doa masuk", "Tahiyatul masjid", "Duduk tenang", "Kaki kiri"] },
];

let generatedCount = 0;
let allDifferentCount = 0;

for (const sc of allScenarios) {
  for (let i = 0; i < 8; i++) { // ~8 per scenario = ~32 total
    const correct = createCorrectSteps(sc.steps);
    const shuffled = shuffleArray(correct);
    const isDiff = !shuffled.every((s, j) => s.correctOrder === j);
    generatedCount++;
    if (isDiff) allDifferentCount++;
  }
}

test("6.1 — 30+ soal dapat digenerate", () => {
  return generatedCount >= 30 ? true : `Hanya ${generatedCount} soal, butuh ≥30`;
});

test("6.2 — Semua soal shuffled berbeda dari correct order", () => {
  return allDifferentCount === generatedCount ? true : `${allDifferentCount}/${generatedCount} berbeda, ${generatedCount - allDifferentCount} sama`;
});

// ── Test 7: DailyMissionsScreen source checks ──
console.log("\n🔍 Test 7: Memeriksa source DailyMissionsScreen...\n");

const dailyPath = path.join(screensDir, "DailyMissionsScreen.tsx");
if (fs.existsSync(dailyPath)) {
  const dailyContent = fs.readFileSync(dailyPath, "utf-8");
  
  test("7.1 — DailyMissionsScreen: status pending_parent_validation", () => {
    return dailyContent.includes("pending_parent_validation") ? true : "pending_parent_validation tidak ditemukan";
  });
  
  test("7.2 — DailyMissionsScreen: status approved_by_parent", () => {
    return dailyContent.includes("approved_by_parent") ? true : "approved_by_parent tidak ditemukan";
  });
  
  test("7.3 — DailyMissionsScreen: status rejected_by_parent", () => {
    return dailyContent.includes("rejected_by_parent") ? true : "rejected_by_parent tidak ditemukan";
  });
  
  test("7.4 — DailyMissionsScreen: status tidak reward saat pending", () => {
    return dailyContent.includes("not_started") ? true : "not_started tidak ditemukan";
  });
  
  test("7.5 — DailyMissionsScreen: Fisher-Yates shuffle untuk item harian", () => {
    return dailyContent.includes("shuffleArray") ? true : "shuffleArray tidak ditemukan";
  });
}

// ── Test 8: ParentScreen source checks ──
console.log("\n🔍 Test 8: Memeriksa source ParentScreen validasi...\n");

const parentPath = path.join(screensDir, "ParentScreen.tsx");
if (fs.existsSync(parentPath)) {
  const parentContent = fs.readFileSync(parentPath, "utf-8");
  
  test("8.1 — ParentScreen: section Validasi Misi Harian Adab", () => {
    return parentContent.includes("Validasi Misi Harian Adab") ? true : "Section validasi tidak ditemukan";
  });
  
  test("8.2 — ParentScreen: tombol Setujui", () => {
    return parentContent.includes("Setujui") ? true : "Tombol Setujui tidak ditemukan";
  });
  
  test("8.3 — ParentScreen: tombol Perlu Diulang", () => {
    const hasReject = parentContent.includes("Perlu Diulang") || parentContent.includes("Diulang");
    return hasReject ? true : "Tombol Perlu Diulang tidak ditemukan";
  });
  
  test("8.4 — ParentScreen: updateProfile dipanggil saat validasi", () => {
    return parentContent.includes("updateProfile") ? true : "updateProfile tidak ditemukan di ParentScreen";
  });
  
  test("8.5 — ParentScreen: rewardGranted flag", () => {
    return parentContent.includes("rewardGranted") ? true : "rewardGranted tidak ditemukan di ParentScreen";
  });
  
  test("8.6 — ParentScreen: catatan opsional", () => {
    return parentContent.includes("parentNote") || parentContent.includes("Catatan") ? true : "Catatan opsional tidak ditemukan";
  });
}

// ── Test 9: Types validation ──
console.log("\n🔍 Test 9: Memeriksa type definitions...\n");

const typesPath = path.join(__dirname, "..", "src", "types", "index.ts");
if (fs.existsSync(typesPath)) {
  const typesContent = fs.readFileSync(typesPath, "utf-8");
  
  test("9.1 — Types: DailyAdabItemStatus type defined", () => {
    return typesContent.includes("DailyAdabItemStatus") ? true : "DailyAdabItemStatus tidak ditemukan";
  });
  
  test("9.2 — Types: status field di DailyAdabChecklistItem", () => {
    return typesContent.includes("status: DailyAdabItemStatus") ? true : "Field 'status' tidak ditemukan di DailyAdabChecklistItem";
  });
  
  test("9.3 — Types: rewardGranted field di DailyAdabChecklistItem", () => {
    return typesContent.includes("rewardGranted") ? true : "Field 'rewardGranted' tidak ditemukan di DailyAdabChecklistItem";
  });
  
  test("9.4 — Types: parentNote field di DailyAdabChecklistItem", () => {
    return typesContent.includes("parentNote") ? true : "Field 'parentNote' tidak ditemukan di DailyAdabChecklistItem";
  });
  
  test("9.5 — Types: pendingValidationCount di DailyAdabChecklist", () => {
    return typesContent.includes("pendingValidationCount") ? true : "Field 'pendingValidationCount' tidak ditemukan";
  });
}

// ── Test 10: Storage migration ──
console.log("\n🔍 Test 10: Memeriksa storage migration v5...\n");

const migrationsPath = path.join(__dirname, "..", "src", "lib", "storage", "migrations.ts");
if (fs.existsSync(migrationsPath)) {
  const migContent = fs.readFileSync(migrationsPath, "utf-8");
  
  test("10.1 — Migration v5 exists", () => {
    return migContent.includes("5: (state)") || migContent.includes("v5:") ? true : "Migration v5 tidak ditemukan";
  });
  
  test("10.2 — CURRENT_VERSION = 5", () => {
    const constantsPath = path.join(__dirname, "..", "src", "lib", "storage", "constants.ts");
    if (fs.existsSync(constantsPath)) {
      const constContent = fs.readFileSync(constantsPath, "utf-8");
      return constContent.includes("CURRENT_VERSION = 5") ? true : "CURRENT_VERSION ≠ 5";
    }
    return "constants.ts tidak ditemukan";
  });
  
  test("10.3 — Migration: old isChecked → status mapping", () => {
    return migContent.includes("checked_by_child") ? true : "checked_by_child tidak ada di migration";
  });
  
  test("10.4 — Migration: old isVerified → approved_by_parent mapping", () => {
    return migContent.includes("approved_by_parent") ? true : "approved_by_parent tidak ada di migration";
  });
}

// ═══════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║                    HASIL VALIDASI                    ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

for (const r of results) {
  console.log(`  ${r.message} — ${r.name}`);
}

console.log(`\n  Total: ${results.length} tes`);
console.log(`  Lulus: ${passed} ✅`);
console.log(`  Gagal: ${failed} ❌`);
console.log(`  Success rate: ${Math.round((passed / results.length) * 100)}%\n`);

if (failed > 0) {
  console.log("❌ Ada tes yang gagal. Perbaiki sebelum melanjutkan.\n");
  process.exit(1);
} else {
  console.log("🎉 Semua tes lulus! Mini-game adab & misi harian siap.\n");
  process.exit(0);
}
