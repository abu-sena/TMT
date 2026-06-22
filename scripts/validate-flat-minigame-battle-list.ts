/**
 * validate-flat-minigame-battle-list.ts
 * 
 * Validates the flat Mini-Game and Battle navigation (no category menu).
 * Run with: npx tsx scripts/validate-flat-minigame-battle-list.ts
 */

// ════════════════════════════════════════════════════
// Import game definitions
// ════════════════════════════════════════════════════

import { MINI_GAME_FLAT_LIST, getFlatMiniGames, getFlatBattleGames, isGamePlayable } from "../src/data/minigame-definitions";
import type { DifficultyId } from "../src/types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { console.log(`  ✅ ${msg}`); passed++; }
  else { console.log(`  ❌ ${msg}`); failed++; }
}

function test(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  fn();
}

console.log("═══════════════════════════════════");
console.log("  Flat Mini-Game & Battle Validator");
console.log("═══════════════════════════════════");

// ── 1. All expected mini-games present ──
test("1. Mini-Game list contains all 16 final games", () => {
  const flat = getFlatMiniGames();
  const expected = [
    "hitung-kilat", "pola-kilat", "ingatan-cepat", "cari-berbeda",
    "kode-warna", "cocok-bayangan", "ubah-posisi", "jalur-tercepat",
    "detektif-petunjuk", "tebak-aturan", "pilih-kesimpulan", "benar-atau-salah",
    "pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak",
  ];
  for (const id of expected) {
    assert(flat.some(g => g.id === id), `"${id}" present`);
  }
  assert(flat.length === 16, `Exactly 16 games (got ${flat.length})`);
});

// ── 2. Correct order ──
test("2. Mini-Game list in correct order", () => {
  const flat = getFlatMiniGames();
  const orderedIds = [
    "hitung-kilat", "pola-kilat", "ingatan-cepat", "cari-berbeda",
    "kode-warna", "cocok-bayangan", "ubah-posisi", "jalur-tercepat",
    "detektif-petunjuk", "tebak-aturan", "pilih-kesimpulan", "benar-atau-salah",
    "pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak",
  ];
  for (let i = 0; i < orderedIds.length; i++) {
    assert(flat[i].id === orderedIds[i], `Position ${i}: ${orderedIds[i]} (got ${flat[i].id})`);
  }
});

// ── 3. No old/removed games ──
test("3. No removed/old games present", () => {
  const flat = getFlatMiniGames();
  const removed = ["putar-bentuk", "jalur-aman", "susun-puzzle", "hadiah-dunia-nyata", "jurnal-kebaikan", "mastermind-duel"];
  for (const id of removed) {
    assert(!flat.some(g => g.id === id || g.title.toLowerCase().includes(id.replace(/-/g, " "))), `"${id}" NOT present`);
  }
});

// ── 4. Battle list excludes adab games ──
test("4. Battle list excludes adab games", () => {
  const battle = getFlatBattleGames();
  const adabGames = ["pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak"];
  for (const id of adabGames) {
    assert(!battle.some(g => g.id === id), `"${id}" NOT in battle list`);
  }
});

// ── 5. Battle Campuran only uses non-adab games ──
test("5. Battle Campuran uses only non-adab games", () => {
  const battle = getFlatBattleGames();
  for (const g of battle) {
    assert(!g.isAdabGame, `"${g.title}" is not adab`);
  }
});

// ── 6. All battle games have adapter key ──
test("6. All battle games have adapter key", () => {
  const battle = getFlatBattleGames();
  for (const g of battle) {
    assert(!!g.battleAdapterKey, `"${g.id}" has battleAdapterKey: ${g.battleAdapterKey}`);
  }
});

// ── 7. Difficulty locks work ──
test("7. Difficulty locks work correctly", () => {
  const dilema = MINI_GAME_FLAT_LIST.find(g => g.id === "dilema-bijak")!;
  assert(!isGamePlayable(dilema, "tk"), "Dilema locked for TK");
  assert(!isGamePlayable(dilema, "sd-bawah"), "Dilema locked for SD Bawah");
  assert(isGamePlayable(dilema, "smp"), "Dilema playable for SMP");
  assert(isGamePlayable(dilema, "sma"), "Dilema playable for SMA");
  assert(isGamePlayable(dilema, "universitas"), "Dilema playable for Universitas");

  const ubah = MINI_GAME_FLAT_LIST.find(g => g.id === "ubah-posisi")!;
  assert(!isGamePlayable(ubah, "tk"), "Ubah Posisi locked for TK");
  assert(isGamePlayable(ubah, "sd-bawah"), "Ubah Posisi playable for SD Bawah");
});

// ── 8. All games have isMiniGameEnabled ──
test("8. All flat games have isMiniGameEnabled = true", () => {
  const mini = getFlatMiniGames();
  assert(mini.length === 16, "16 mini-games enabled");
  for (const g of mini) {
    assert(g.isMiniGameEnabled, `"${g.id}" miniGameEnabled`);
  }
});

// ── 9. Categories are tags, not menus ──
test("9. Categories exist as metadata tags", () => {
  const flat = getFlatMiniGames();
  const tags = new Set(flat.map(g => g.categoryTag));
  assert(tags.has("Cepat"), "Tag 'Cepat' exists");
  assert(tags.has("Logika"), "Tag 'Logika' exists");
  assert(tags.has("Spasial"), "Tag 'Spasial' exists");
  assert(tags.has("Adab"), "Tag 'Adab' exists");
});

// ── 10. Game count per category ──
test("10. Category distribution correct", () => {
  const flat = getFlatMiniGames();
  const cepat = flat.filter(g => g.categoryTag === "Cepat").length;
  const logika = flat.filter(g => g.categoryTag === "Logika").length;
  const spasial = flat.filter(g => g.categoryTag === "Spasial").length;
  const adab = flat.filter(g => g.categoryTag === "Adab").length;
  assert(cepat === 4, `Cepat: ${cepat} (expected 4)`);
  assert(cepat === 4, `Cepat: ${cepat} (expected 4 — Hitung, Pola, Ingatan, Cari Beda)`);
  // Logika = 5: Kode Warna, Detektif, Tebak Aturan, Pilih Kesimpulan, Benar atau Salah
  assert(logika === 5, `Logika: ${logika} (expected 5 — Kode Warna, Detektif, Tebak Aturan, Pilih Kesimpulan, Benar/Salah)`);
  assert(spasial === 3, `Spasial: ${spasial} (expected 3 — Cocok Bayangan, Ubah Posisi, Jalur Tercepat)`);
  assert(adab === 4, `Adab: ${adab} (expected 4 — Pilih Sikap, Nasihat, Urutkan Adab, Dilema Bijak)`);
});

// ── 11. Score above pass threshold ──
console.log("\n═══════════════════════════════");
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log("═══════════════════════════════");

if (failed > 0) {
  console.log("\n⚠️  Some validations FAILED.");
  process.exit(1);
} else {
  console.log("\n🎉 All validations PASSED! Flat Mini-Game & Battle list is correct.");
  process.exit(0);
}
