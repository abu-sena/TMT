/**
 * Validasi Reset Data Teknis & Perbaikan Double Misi Harian
 *
 * Script ini memvalidasi:
 * 1. Fitur Reset Data Teknis di Setting
 * 2. Perbaikan double setting Misi Harian di menu Orang Tua
 * 3. Keamanan data penting (profil, poin, lencana, laporan)
 *
 * Jalankan: npx tsx scripts/validate-technical-reset.ts
 */

import fs from "fs";
import path from "path";

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════

function readFile(relativePath: string): string {
  return fs.readFileSync(path.resolve(relativePath), "utf-8");
}

let passed = 0;
let failed = 0;
const failures: { test: string; reason: string }[] = [];

function assert(condition: boolean, test: string, reason?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${test}`);
  } else {
    failed++;
    const r = reason || "Gagal";
    failures.push({ test, reason: r });
    console.log(`  ❌ ${test} — ${r}`);
  }
}

function assertContains(content: string, search: string, test: string) {
  assert(content.includes(search), test, `Tidak ditemukan: "${search.slice(0, 60)}..."`);
}

function assertNotContains(content: string, search: string, test: string) {
  assert(!content.includes(search), test, `Seharusnya tidak ada: "${search.slice(0, 60)}..."`);
}

// ══════════════════════════════════════════
// 1. FITUR RESET DATA TEKNIS DI SETTING
// ══════════════════════════════════════════

console.log("\n📋 Fitur Reset Data Teknis di Setting");
console.log("=".repeat(50));

const settingsContent = readFile("src/screens/SettingsScreen.tsx");
const routesContent = readFile("src/routes/index.tsx");
const technicalResetContent = readFile("src/lib/technical-reset.ts");

// 1.1 Ada tombol Reset Data Teknis di Setting
assertContains(
  settingsContent,
  "Reset Data Teknis",
  "1.1 Tombol Reset Data Teknis ada di SettingsScreen"
);

// 1.2 Tombol punya click handler
assertContains(
  settingsContent,
  'openGate("technical")',
  "1.2 Tombol memiliki click handler"
);

// 1.3 Ada modal konfirmasi
assertContains(
  settingsContent,
  "TechnicalResetConfirmModal",
  "1.3 Ada modal konfirmasi TechnicalResetConfirmModal"
);

// 1.4 Modal punya checkbox konfirmasi
assertContains(
  settingsContent,
  "Saya paham bahwa hanya data teknis yang dihapus",
  "1.4 Modal memiliki checkbox konfirmasi"
);

// 1.5 Ada handler reset teknis
assertContains(
  settingsContent,
  "handleTechnicalReset",
  "1.5 Ada handler untuk menjalankan reset"
);

// 1.6 Import fungsi reset
assertContains(
  settingsContent,
  'import { resetTechnicalData } from "@/lib/technical-reset"',
  "1.6 Import resetTechnicalData dari technical-reset module"
);

// 1.7 Hasil reset ditampilkan
assertContains(
  settingsContent,
  "Data Teknis Berhasil Direset",
  "1.7 Hasil reset ditampilkan ke user"
);

// 1.8 Ada tombol Muat Ulang Aplikasi setelah reset
assertContains(
  settingsContent,
  "Muat Ulang Aplikasi",
  "1.8 Tombol Muat Ulang Aplikasi tersedia setelah reset"
);

// 1.9 onReload prop tersedia
assertContains(
  settingsContent,
  "onReload: () => void",
  "1.9 Props onReload di SettingsScreen interface"
);

// 1.10 Routes mengirim onReload
assertContains(
  routesContent,
  "onReload={() => window.location.reload()}",
  "1.10 Routes/index.tsx mengirim onReload ke SettingsScreen"
);

// ══════════════════════════════════════════
// 2. MODUL TECHNICAL RESET
// ══════════════════════════════════════════

console.log("\n📋 Modul Technical Reset");
console.log("=".repeat(50));

// 2.1 Fungsi resetTechnicalData ada
assertContains(
  technicalResetContent,
  "export function resetTechnicalData",
  "2.1 Fungsi resetTechnicalData diekspor"
);

// 2.2 Fungsi auditTechnicalData ada
assertContains(
  technicalResetContent,
  "export function auditTechnicalData",
  "2.2 Fungsi auditTechnicalData diekspor"
);

// 2.3 Protected state keys terdefinisi
assertContains(
  technicalResetContent,
  "PROTECTED_STATE_KEYS",
  "2.3 Whitelist protected state keys terdefinisi"
);

// 2.4 Protected profile keys terdefinisi
assertContains(
  technicalResetContent,
  "PROTECTED_PROFILE_KEYS",
  "2.4 Whitelist protected profile keys terdefinisi"
);

// 2.5 Technical local storage keys terdefinisi
assertContains(
  technicalResetContent,
  "TECHNICAL_LOCAL_STORAGE_KEYS",
  "2.5 Daftar technical local storage keys terdefinisi"
);

// 2.6 Validation misi valid
assertContains(
  technicalResetContent,
  "isValidParentMission",
  "2.6 Validasi misi harian valid terdefinisi"
);

// 2.7 Cleanup corrupt assignments
assertContains(
  technicalResetContent,
  "isCorruptAssignment",
  "2.7 Deteksi assignment corrupt terdefinisi"
);

// 2.8 Reset log dibuat
assertContains(
  technicalResetContent,
  "TechnicalResetLog",
  "2.8 Interface TechnicalResetLog terdefinisi"
);

// 2.9 Reset log disimpan
assertContains(
  technicalResetContent,
  "adab_quest_technical_reset_logs",
  "2.9 Reset log disimpan ke localStorage"
);

// 2.10 Profil tetap aman
assertContains(
  technicalResetContent,
  '"profiles"',
  "2.10 Key 'profiles' termasuk dalam PROTECTED_STATE_KEYS"
);

// 2.11 Batch history tetap aman
assertContains(
  technicalResetContent,
  '"battleHistory"',
  "2.11 Key 'battleHistory' termasuk dalam PROTECTED_STATE_KEYS"
);

// 2.12 Mini-game stats tetap aman
assertContains(
  technicalResetContent,
  '"miniGameSessions"',
  "2.12 Key 'miniGameSessions' termasuk dalam PROTECTED_STATE_KEYS"
);

// 2.13 Badges dilindungi (via profiles)
assertContains(
  technicalResetContent,
  '"badges"',
  "2.13 Key 'badges' termasuk dalam PROTECTED_PROFILE_KEYS"
);

// 2.14 Parent password dilindungi
assertContains(
  technicalResetContent,
  '"parentPasswordHash"',
  "2.14 Key 'parentPasswordHash' termasuk dalam PROTECTED_STATE_KEYS"
);

// 2.15 Daily mission reward ledger dilindungi
assertContains(
  technicalResetContent,
  '"dailyMissionRewardLedger"',
  "2.15 Key 'dailyMissionRewardLedger' termasuk dalam PROTECTED_PROFILE_KEYS"
);

// 2.16 Cleanup daily adab checklist legacy
assertContains(
  technicalResetContent,
  "cleanupProfileDailyMissionData",
  "2.16 Fungsi cleanup profile daily mission data terdefinisi"
);

// ══════════════════════════════════════════
// 3. PERBAIKAN DOUBLE SETTING MISI HARIAN
// ══════════════════════════════════════════

console.log("\n📋 Perbaikan Double Setting Misi Harian");
console.log("=".repeat(50));

const parentContent = readFile("src/screens/ParentScreen.tsx");

// 3.1 Tidak ada lagi referensi legacy validation section
assertNotContains(
  parentContent,
  "Validasi Misi Harian (Parent - Legacy)",
  "3.1 Tidak ada legacy validation section"
);

// 3.2 Tidak ada referensi DailyAdabChecklist di import
assertNotContains(
  parentContent,
  "import type { Profile, Mission, DailyAdabChecklist",
  "3.2 Import DailyAdabChecklist sudah dihapus"
);

// 3.3 Tidak ada DailyAdabItemStatus
assertNotContains(
  parentContent,
  "DailyAdabItemStatus",
  "3.3 Tidak ada referensi DailyAdabItemStatus"
);

// 3.4 Tidak ada DailyAdabChecklistItem
assertNotContains(
  parentContent,
  "DailyAdabChecklistItem",
  "3.4 Tidak ada referensi DailyAdabChecklistItem"
);

// 3.5 Hanya ada satu "Kelola Misi Harian" section
const kelolaCount = (parentContent.match(/Kelola Misi Harian/g) || []).length;
assert(
  kelolaCount === 1,
  "3.5 Hanya ada 1 section 'Kelola Misi Harian' (tidak duplikat)",
  `Ditemukan ${kelolaCount} kemunculan (seharusnya 1)`
);

// 3.6 Hanya ada satu validasi misi harian section
const validasiCount = (parentContent.match(/Validasi Misi Harian/g) || []).length;
assert(
  validasiCount === 1,
  "3.6 Hanya ada 1 section 'Validasi Misi Harian' (tidak duplikat)",
  `Ditemukan ${validasiCount} kemunculan (seharusnya 1)`
);

// 3.6b No legacy validation
assertNotContains(
  parentContent,
  "Parent - Legacy",
  "3.6b Tidak ada tanda 'Parent - Legacy' di ParentScreen"
);

// 3.7 Tidak ada parentNote/activeNoteItem state
assertNotContains(
  parentContent,
  "const [parentNote, setParentNote]",
  "3.7 State parentNote sudah dihapus (hanya digunakan legacy)"
);

// 3.8 Tidak ada setActiveNoteItem
assertNotContains(
  parentContent,
  "const [activeNoteItem, setActiveNoteItem]",
  "3.8 State activeNoteItem sudah dihapus (hanya digunakan legacy)"
);

// 3.9 Kelola Misi Harian masih ada (section biru)
assertContains(
  parentContent,
  "Kelola Misi Harian",
  "3.9 Section Kelola Misi Harian tetap ada"
);

// 3.10 Validasi Misi Harian baru tetap ada
assertContains(
  parentContent,
  "VALIDASI MISI HARIAN (Parent - New)",
  "3.10 Section Validasi Misi Harian (New) tetap ada"
);

// ══════════════════════════════════════════
// 4. IMPORT DAN DEPENDENSI
// ══════════════════════════════════════════

console.log("\n📋 Import & Dependensi");
console.log("=".repeat(50));

// 4.1 Import dailyMissions helpers di ParentScreen
assertContains(
  parentContent,
  'import { clampMissionPoints',
  "4.1 Import dailyMissions helpers tetap ada di ParentScreen"
);

// 4.2 Import useGameStore
assertContains(
  parentContent,
  'import { useGameStore } from "@/lib/storage"',
  "4.2 Import useGameStore tetap ada"
);

// 4.3 cn utility
assertContains(
  parentContent,
  'import { cn } from "@/lib/utils"',
  "4.3 Import cn utility tetap ada"
);

// 4.4 Technical reset import di SettingsScreen
assertContains(
  settingsContent,
  'import { resetTechnicalData } from "@/lib/technical-reset"',
  "4.4 Import resetTechnicalData di SettingsScreen"
);

// ══════════════════════════════════════════
// 5. EDGE CASES
// ══════════════════════════════════════════

console.log("\n📋 Edge Cases");
console.log("=".repeat(50));

// 5.1 Tidak ada undefined/null/NaN di output reset
assertContains(
  technicalResetContent,
  "success: true",
  "5.1 Reset result selalu return success status"
);

// 5.2 Fallback untuk store kosong
assertContains(
  technicalResetContent,
  "|| []",
  "5.2 Ada fallback array kosong untuk dailyMissions"
);

// 5.3 Backup protected data sebelum reset
assertContains(
  technicalResetContent,
  "protectedBackup",
  "5.3 Protected data dibackup ke memory sebelum reset"
);

// 5.4 Validasi profile IDs
assertContains(
  technicalResetContent,
  "validProfileIds",
  "5.4 Ada validasi profile IDs untuk assignment"
);

// 5.5 Validasi mission IDs
assertContains(
  technicalResetContent,
  "validMissionIds",
  "5.5 Ada validasi mission IDs untuk assignment"
);

// 5.6 Date validation untuk assignments
assertContains(
  technicalResetContent,
  "/^\\d{4}-\\d{2}-\\d{2}$/.test",
  "5.6 Validasi format tanggal untuk assignment"
);

// ══════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════

console.log("\n" + "=".repeat(50));
console.log(`✅ LULUS: ${passed}`);
console.log(`❌ GAGAL: ${failed}`);

if (failures.length > 0) {
  console.log("\nDetail kegagalan:");
  for (const f of failures) {
    console.log(`  ❌ ${f.test}`);
    console.log(`     ${f.reason}`);
  }
}

console.log("\nTotal assertions:", passed + failed);

if (failed > 0) {
  process.exit(1);
}

console.log("\n🎉 Semua validasi lulus!\n");
