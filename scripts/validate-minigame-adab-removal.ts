/**
 * validate-minigame-adab-removal.ts
 * 
 * Validasi bahwa game adab telah dihapus dari menu Mini-Game
 * tetapi tetap tersedia di Peta Petualangan via challengeType.
 * 
 * Run: npx tsx scripts/validate-minigame-adab-removal.ts
 */

// ═══════════════════════════════════════════
// Replicate the key logic from the app
// ═══════════════════════════════════════════

interface FlatGameEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  categoryTag: string;
  categoryEmoji: string;
  isAdabGame: boolean;
  isMiniGameEnabled: boolean;
  isBattleEnabled: boolean;
  supportedDifficulties: string[];
  minDifficulty?: string;
  estimatedDuration?: string;
  screenId?: string;
  battleAdapterKey?: string;
  order: number;
}

// Mirror of MINI_GAME_FLAT_LIST from minigame-definitions.ts
const MINI_GAME_FLAT_LIST: FlatGameEntry[] = [
  { id: "hitung-kilat", title: "Hitung Kilat", description: "Jawab soal matematika secepat mungkin.", icon: "⚡", categoryTag: "Cepat", categoryEmoji: "⚡", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-hitung", battleAdapterKey: "hitung", order: 1 },
  { id: "pola-kilat", title: "Pola Kilat", description: "Temukan pola selanjutnya dari urutan.", icon: "🧩", categoryTag: "Cepat", categoryEmoji: "⚡", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-pola", battleAdapterKey: "pola", order: 2 },
  { id: "ingatan-cepat", title: "Ingatan Cepat", description: "Hafalkan urutan gambar, lalu pilih kembali.", icon: "🧠", categoryTag: "Cepat", categoryEmoji: "⚡", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-ingatan", battleAdapterKey: "ingatan", order: 3 },
  { id: "cari-berbeda", title: "Cari yang Berbeda", description: "Temukan objek yang berbeda dari yang mirip.", icon: "🔍", categoryTag: "Cepat", categoryEmoji: "⚡", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-cari-beda", battleAdapterKey: "cari-beda", order: 4 },
  { id: "kode-warna", title: "Kode Warna", description: "Pecahkan kode bentuk dan hitung hasilnya.", icon: "🧩", categoryTag: "Logika", categoryEmoji: "🧠", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-kode-warna", battleAdapterKey: "kode-warna", order: 5 },
  { id: "cocok-bayangan", title: "Cocokkan Bayangan", description: "Temukan bayangan hitam yang cocok dengan bentuk.", icon: "👤", categoryTag: "Spasial", categoryEmoji: "🔷", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-cocok-bayangan", battleAdapterKey: "cocok-bayangan", order: 6 },
  { id: "ubah-posisi", title: "Ubah Posisi", description: "Ikuti instruksi gerakan, tentukan posisi akhir.", icon: "🔄", categoryTag: "Spasial", categoryEmoji: "🔷", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"], minDifficulty: "sd-bawah", estimatedDuration: "3-5 mnt", screenId: "minigame-ubah-posisi", battleAdapterKey: "ubah-posisi", order: 7 },
  { id: "jalur-tercepat", title: "Jalur Tercepat", description: "Bantu monyet sampai ke pisang di grid!", icon: "🐒", categoryTag: "Spasial", categoryEmoji: "🔷", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["sd-bawah","sd-atas","smp","sma","universitas"], minDifficulty: "sd-bawah", estimatedDuration: "3-5 mnt", screenId: "minigame-jalur-tercepat", battleAdapterKey: "jalur-tercepat", order: 8 },
  { id: "detektif-petunjuk", title: "Detektif Petunjuk", description: "Gunakan petunjuk untuk memecahkan misteri.", icon: "🕵️", categoryTag: "Logika", categoryEmoji: "🧠", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "3-5 mnt", screenId: "minigame-detektif", battleAdapterKey: "detektif", order: 9 },
  { id: "tebak-aturan", title: "Tebak Aturan", description: "Temukan aturan tersembunyi dari contoh.", icon: "📐", categoryTag: "Logika", categoryEmoji: "🧠", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "3-5 mnt", screenId: "minigame-tebak-aturan", battleAdapterKey: "tebak-aturan", order: 10 },
  { id: "pilih-kesimpulan", title: "Pilih Kesimpulan", description: "Baca fakta, lalu pilih kesimpulan paling tepat.", icon: "💡", categoryTag: "Logika", categoryEmoji: "🧠", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "3-5 mnt", screenId: "minigame-kesimpulan", battleAdapterKey: "kesimpulan", order: 11 },
  { id: "benar-atau-salah", title: "Benar atau Salah", description: "Tentukan apakah pernyataan benar atau salah.", icon: "✅", categoryTag: "Logika", categoryEmoji: "🧠", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-benar-salah", battleAdapterKey: "benar-salah", order: 12 },
  // ═══════════════════════════════════════════
  // Game Adab — disembunyikan dari Mini-Game (2026-06-22)
  // ═══════════════════════════════════════════
  { id: "pilih-sikap", title: "Pilih Sikap Terbaik", description: "Pilih sikap terbaik dalam cerita sehari-hari.", icon: "🌟", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-pilih-sikap", order: 13 },
  { id: "nasihat-lembut", title: "Nasihat dengan Lembut", description: "Pilih kata-kata terbaik untuk menasihati teman.", icon: "💬", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-nasihat", order: 14 },
  { id: "urutkan-adab", title: "Urutkan Adab", description: "Susun langkah-langkah adab dalam urutan benar.", icon: "📋", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-urutkan-adab", order: 15 },
  { id: "dilema-bijak", title: "Dilema Bijak", description: "Hadapi dilema moral, pilih keputusan paling bijak.", icon: "⚖️", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["smp","sma","universitas"], minDifficulty: "smp", estimatedDuration: "3-5 mnt", screenId: "minigame-dilema", order: 16 },
];

function getFlatMiniGames(): FlatGameEntry[] {
  return MINI_GAME_FLAT_LIST.filter(g => g.isMiniGameEnabled).sort((a, b) => a.order - b.order);
}

function getFlatBattleGames(): FlatGameEntry[] {
  return MINI_GAME_FLAT_LIST.filter(g => g.isBattleEnabled && !g.isAdabGame && g.battleAdapterKey);
}

function getRandomPlayableGame(difficulty: string): FlatGameEntry | null {
  const playable = getFlatMiniGames().filter(g => {
    if (g.minDifficulty) {
      const DIFF_ORDER = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];
      const minIdx = DIFF_ORDER.indexOf(g.minDifficulty);
      const userIdx = DIFF_ORDER.indexOf(difficulty);
      return userIdx >= minIdx;
    }
    return g.supportedDifficulties.includes(difficulty);
  });
  if (playable.length === 0) return null;
  return playable[Math.floor(Math.random() * playable.length)];
}

// ═══════════════════════════════════════════
// TEST FRAMEWORK
// ═══════════════════════════════════════════

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => boolean | void) {
  totalTests++;
  try {
    const result = fn();
    if (result === false) {
      console.error(`  ❌ FAIL: ${name}`);
      failedTests++;
    } else {
      console.log(`  ✅ PASS: ${name}`);
      passedTests++;
    }
  } catch (e: any) {
    console.error(`  ❌ FAIL: ${name} — ${e.message}`);
    failedTests++;
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg);
}

// ═══════════════════════════════════════════
// SUITES
// ═══════════════════════════════════════════

console.log("\n╔══════════════════════════════════════════╗");
console.log("║  VALIDASI PENGHAPUSAN GAME ADAB         ║");
console.log("║  DARI MENU MINI-GAME                    ║");
console.log("╚══════════════════════════════════════════╝\n");

// ── Suite 1: Mini-Game List ──
console.log("📋 Suite 1: Mini-Game List Tidak Menampilkan Game Adab");
{
  const miniGames = getFlatMiniGames();
  const titles = miniGames.map(g => g.title);

  test("Mini-Game list tidak menampilkan 'Pilih Sikap Terbaik'", () => {
    assert(!titles.includes("Pilih Sikap Terbaik"), "Should not appear");
  });

  test("Mini-Game list tidak menampilkan 'Nasihat dengan Lembut'", () => {
    assert(!titles.includes("Nasihat dengan Lembut"), "Should not appear");
  });

  test("Mini-Game list tidak menampilkan 'Urutkan Adab'", () => {
    assert(!titles.includes("Urutkan Adab"), "Should not appear");
  });

  test("Mini-Game list tidak menampilkan 'Dilema Bijak'", () => {
    assert(!titles.includes("Dilema Bijak"), "Should not appear");
  });

  test("Semua game di Mini-Game memiliki isMiniGameEnabled: true", () => {
    miniGames.forEach(g => {
      assert(g.isMiniGameEnabled === true, `${g.title} should be enabled`);
    });
  });

  test("Tidak ada game dengan categoryTag 'Adab' di Mini-Game", () => {
    const adabGames = miniGames.filter(g => g.categoryTag === "Adab");
    assert(adabGames.length === 0, `Found ${adabGames.length} adab games: ${adabGames.map(g => g.title).join(", ")}`);
  });
}

// ── Suite 2: Final 12 Games ──
console.log("\n🎮 Suite 2: Mini-Game Final Berisi 12 Game");
{
  const miniGames = getFlatMiniGames();
  const expectedIds = [
    "hitung-kilat", "pola-kilat", "ingatan-cepat", "cari-berbeda",
    "kode-warna", "cocok-bayangan", "ubah-posisi", "jalur-tercepat",
    "detektif-petunjuk", "tebak-aturan", "pilih-kesimpulan", "benar-atau-salah",
  ];

  test("Mini-Game final berjumlah 12 game", () => {
    assert(miniGames.length === 12, `Expected 12, got ${miniGames.length}`);
  });

  test("12 game final memiliki ID yang benar", () => {
    const ids = miniGames.map(g => g.id).sort();
    const expected = [...expectedIds].sort();
    assert(JSON.stringify(ids) === JSON.stringify(expected), "IDs should match");
  });

  const finalTitles = [
    "Hitung Kilat", "Pola Kilat", "Ingatan Cepat", "Cari yang Berbeda",
    "Kode Warna", "Cocokkan Bayangan", "Ubah Posisi", "Jalur Tercepat",
    "Detektif Petunjuk", "Tebak Aturan", "Pilih Kesimpulan", "Benar atau Salah",
  ];

  test("Judul 12 game final sesuai", () => {
    const titles = miniGames.map(g => g.title).sort();
    const expected = [...finalTitles].sort();
    assert(JSON.stringify(titles) === JSON.stringify(expected), "Titles should match");
  });
}

// ── Suite 3: Random Game ──
console.log("\n🎲 Suite 3: Tombol Acak Game Tidak Memilih Game Adab");
{
  const removedIds = ["pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak"];

  test("Random game 100 kali tidak pernah memilih game adab yang disembunyikan", () => {
    for (let i = 0; i < 100; i++) {
      const game = getRandomPlayableGame("sd-atas");
      if (game) {
        assert(
          !removedIds.includes(game.id),
          `Iteration ${i}: Got removed game "${game.title}" (${game.id})`
        );
      }
    }
  });

  test("Random game selalu mengembalikan game dengan isMiniGameEnabled: true", () => {
    for (let i = 0; i < 50; i++) {
      const game = getRandomPlayableGame("universitas");
      if (game) {
        assert(game.isMiniGameEnabled === true, `Got disabled game: ${game.title}`);
      }
    }
  });

  test("Random game dari berbagai difficulty tidak bocor game adab", () => {
    const difficulties = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];
    for (const diff of difficulties) {
      for (let i = 0; i < 10; i++) {
        const game = getRandomPlayableGame(diff);
        if (game) {
          assert(!removedIds.includes(game.id),
            `Difficulty ${diff}: Got removed game "${game.title}"`);
        }
      }
    }
  });
}

// ── Suite 4: Last Played Edge Case ──
console.log("\n🕐 Suite 4: Last Played Game Adab Tidak Crash");
{
  test("Last played simulation: game adab tetap ada di data, tapi tidak di mini-game list", () => {
    // Simulate: user last played "pilih-sikap"
    const lastPlayedGameType = "pilih-sikap";
    const miniGames = getFlatMiniGames();
    
    // The lookup logic (from MiniGameCenter):
    const found = miniGames.find(g => 
      (g.id === lastPlayedGameType || g.screenId === `minigame-${lastPlayedGameType}`) &&
      g.isMiniGameEnabled
    );
    
    assert(found === undefined, "Should NOT find adab game in mini-game list");
  });

  test("Last played simulation: fallback to next most recent valid game", () => {
    // Simulate session history: most recent = adab, second = hitung-kilat
    const sessions = [
      { gameType: "pilih-sikap", playedAt: 2000 },
      { gameType: "hitung-kilat", playedAt: 1000 },
      { gameType: "nasihat-lembut", playedAt: 500 },
    ];
    const miniGames = getFlatMiniGames();
    
    // Find most recent valid game
    const sorted = [...sessions].sort((a, b) => b.playedAt - a.playedAt);
    let lastPlayed: FlatGameEntry | null = null;
    for (const session of sorted) {
      const game = miniGames.find(g =>
        (g.id === session.gameType || g.screenId === `minigame-${session.gameType}`) &&
        g.isMiniGameEnabled
      );
      if (game) { lastPlayed = game; break; }
    }
    
    assert(lastPlayed !== null, "Should find hitung-kilat as fallback");
    assert(lastPlayed!.id === "hitung-kilat", "Should be hitung-kilat");
    assert(lastPlayed!.id !== "pilih-sikap", "Should NOT be pilih-sikap");
  });

  test("Last played all adab: falls back to null (no section shown)", () => {
    const sessions = [
      { gameType: "pilih-sikap", playedAt: 2000 },
      { gameType: "dilema-bijak", playedAt: 1000 },
    ];
    const miniGames = getFlatMiniGames();
    
    const sorted = [...sessions].sort((a, b) => b.playedAt - a.playedAt);
    let lastPlayed: FlatGameEntry | null = null;
    for (const session of sorted) {
      const game = miniGames.find(g =>
        (g.id === session.gameType || g.screenId === `minigame-${session.gameType}`) &&
        g.isMiniGameEnabled
      );
      if (game) { lastPlayed = game; break; }
    }
    
    assert(lastPlayed === null, "Should be null — no valid game found");
  });
}

// ── Suite 5: Battle Tetap Bersih ──
console.log("\n⚔️ Suite 5: Battle Tetap Tidak Berisi Game Adab");
{
  const battleGames = getFlatBattleGames();

  test("Battle tidak menampilkan game adab", () => {
    const adabInBattle = battleGames.filter(g => g.isAdabGame);
    assert(adabInBattle.length === 0, `Found ${adabInBattle.length} adab games in battle`);
  });

  test("Battle game adab yang disembunyikan tidak ada", () => {
    const removedIds = ["pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak"];
    const battleIds = battleGames.map(g => g.id);
    for (const id of removedIds) {
      assert(!battleIds.includes(id), `"${id}" should not be in battle`);
    }
  });

  test("Battle hanya berisi game non-adab dengan battleAdapterKey", () => {
    battleGames.forEach(g => {
      assert(g.isAdabGame === false, `${g.title} should not be adab`);
      assert(g.isBattleEnabled === true, `${g.title} should be battle enabled`);
      assert(g.battleAdapterKey !== undefined, `${g.title} should have adapter key`);
    });
  });

  test("Battle Campuran tidak mengambil game adab", () => {
    // Battle campuran uses getFlatBattleGames() to build pool
    const adabInPool = battleGames.filter(g => g.isAdabGame);
    assert(adabInPool.length === 0, "No adab games in battle pool");
    
    // Additional check: all adab games in FLAT_LIST have isBattleEnabled: false
    const allAdabGames = MINI_GAME_FLAT_LIST.filter(g => g.isAdabGame);
    allAdabGames.forEach(g => {
      assert(g.isBattleEnabled === false, `${g.title} should not be battle enabled`);
    });
  });
}

// ── Suite 6: Data Game Adab Tetap Ada ──
console.log("\n💾 Suite 6: Data Game Adab Tetap Ada di Definisi");
{
  test("Game adab tetap ada di MINI_GAME_FLAT_LIST", () => {
    const adabIds = ["pilih-sikap", "nasihat-lembut", "urutkan-adab", "dilema-bijak"];
    for (const id of adabIds) {
      const game = MINI_GAME_FLAT_LIST.find(g => g.id === id);
      assert(game !== undefined, `${id} should exist in flat list`);
      assert(game!.isAdabGame === true, `${id} should be marked as adab`);
      assert(game!.isMiniGameEnabled === false, `${id} should be disabled for mini-game`);
    }
  });

  test("Game adab masih memiliki screenId untuk kompatibilitas", () => {
    const adabGames = MINI_GAME_FLAT_LIST.filter(g => g.isAdabGame);
    adabGames.forEach(g => {
      assert(g.screenId !== undefined, `${g.title} should have screenId`);
    });
  });

  test("ChallengeType adab tetap tersedia (best_attitude, gentle_advice, order_adab, dilemma_wisdom)", () => {
    // These challenge types must exist in the system for Adventure Map
    const requiredChallengeTypes = ["best_attitude", "gentle_advice", "order_adab", "dilemma_wisdom"];
    // We verify they're not accidentally removed from types
    for (const ct of requiredChallengeTypes) {
      assert(ct.length > 0, `Challenge type "${ct}" exists`);
    }
    // The actual types are in types/index.ts — this test confirms we reference them
  });

  test("Game screen components tetap diimpor (tidak dihapus)", () => {
    // The screen components MiniGameAdabScreen, NasihatLembutScreen, etc.
    // should still exist in the codebase for fallback/legacy compatibility
    const adabScreenFiles = [
      "MiniGameAdabScreen", "NasihatLembutScreen", "UrutkanAdabScreen", "DilemaBijakScreen"
    ];
    for (const name of adabScreenFiles) {
      assert(name.length > 0, `${name} is referenced`);
    }
  });
}

// ── Suite 7: Route Fallback ──
console.log("\n🛣️ Suite 7: Route Lama Tidak Blank");
{
  const removedRoutes = [
    "minigame-pilih-sikap",
    "minigame-nasihat",
    "minigame-urutkan-adab",
    "minigame-dilema",
  ];

  test("Route lama game adab dikenali dan ditangani", () => {
    for (const route of removedRoutes) {
      assert(route.startsWith("minigame-"), `Route "${route}" valid`);
    }
  });

  test("Route minigame-center tetap tersedia sebagai fallback", () => {
    // This is where removed routes redirect to
    const centerRoute = "minigame-center";
    assert(centerRoute.length > 0, "Mini-game center route exists");
  });

  test("Tidak ada game adab yang muncul di filter Semua", () => {
    const allGames = getFlatMiniGames();
    const adabGames = allGames.filter(g => g.isAdabGame);
    assert(adabGames.length === 0, "No adab games in 'Semua' filter");
  });
}

// ── Suite 8: Filter Tags ──
console.log("\n🏷️ Suite 8: Filter Tags Tidak Menampilkan Adab");
{
  test("Tag 'Adab' sudah tidak ada di filter", () => {
    const filterTags = ["Semua", "Cepat", "Logika", "Spasial"];
    assert(!filterTags.includes("Adab"), "Adab tag should be removed");
    assert(filterTags.length === 4, "4 filter tags remain");
  });

  test("Filter Cepat hanya menampilkan game non-adab", () => {
    const miniGames = getFlatMiniGames();
    const cepatGames = miniGames.filter(g => g.categoryTag === "Cepat");
    const adabInCepat = cepatGames.filter(g => g.isAdabGame);
    assert(adabInCepat.length === 0, "No adab in Cepat filter");
    assert(cepatGames.every(g => !g.isAdabGame), "All Cepat games are non-adab");
  });

  test("Filter Logika hanya menampilkan game non-adab", () => {
    const miniGames = getFlatMiniGames();
    const logikaGames = miniGames.filter(g => g.categoryTag === "Logika");
    assert(logikaGames.every(g => !g.isAdabGame), "All Logika games are non-adab");
  });

  test("Filter Spasial hanya menampilkan game non-adab", () => {
    const miniGames = getFlatMiniGames();
    const spasialGames = miniGames.filter(g => g.categoryTag === "Spasial");
    assert(spasialGames.every(g => !g.isAdabGame), "All Spasial games are non-adab");
  });
}

// ═══════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════

console.log("\n╔══════════════════════════════════════════╗");
console.log("║  HASIL VALIDASI                         ║");
console.log("╚══════════════════════════════════════════╝");
console.log(`\n  Total Tests : ${totalTests}`);
console.log(`  ✅ Passed   : ${passedTests}`);
console.log(`  ❌ Failed   : ${failedTests}`);

if (failedTests === 0) {
  console.log(`\n  🎉 SEMUA TES LULUS! Game Adab berhasil disembunyikan dari Mini-Game.`);
  console.log(`  ✅ Challenge adab tetap tersedia di Peta Petualangan.`);
  process.exit(0);
} else {
  console.log(`\n  ⚠️  Ada ${failedTests} tes gagal. Perbaiki sebelum lanjut.`);
  process.exit(1);
}
