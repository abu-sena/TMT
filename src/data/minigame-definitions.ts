/**
 * Mini-Game Definitions — all mini-games with flat list support.
 * 
 * Categories (packageId) are kept as metadata/tags only.
 * Primary navigation uses MINI_GAME_LIST (ordered flat list).
 */
import type { MiniGamePackage, MiniGameDefinition, MiniGamePackageId, DifficultyId } from "@/types";

// ═══════════════════════════════════════════
// Flat Mini-Game List (ordered per spec)
// ═══════════════════════════════════════════

export interface FlatGameEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  categoryTag: string;      // short tag like "Logika" or "Adab"
  categoryEmoji: string;
  isAdabGame: boolean;
  isMiniGameEnabled: boolean;
  isBattleEnabled: boolean;
  supportedDifficulties: DifficultyId[];
  minDifficulty?: DifficultyId; // locked below this
  estimatedDuration?: string;
  screenId?: string;
  battleAdapterKey?: string;
  order: number;
}

export const MINI_GAME_FLAT_LIST: FlatGameEntry[] = [
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
  // Rantai Warna — Mini-Game baru (2026-06-22)
  // ═══════════════════════════════════════════
  { id: "rantai-warna", title: "Rantai Warna", description: "Hubungkan warna sesuai urutan angka.", icon: "🎨", categoryTag: "Cepat", categoryEmoji: "⚡", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-5 mnt", screenId: "minigame-rantai-warna", battleAdapterKey: "rantai-warna", order: 13 },
  // ═══════════════════════════════════════════
  // Jalur Angka — Mini-Game baru (2026-06-22)
  // ═══════════════════════════════════════════
  { id: "jalur-angka", title: "Jalur Angka", description: "Isi kotak kosong agar jalur hitung menjadi benar.", icon: "🔢", categoryTag: "Logika", categoryEmoji: "🧠", isAdabGame: false, isMiniGameEnabled: true, isBattleEnabled: true, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "3-8 mnt", screenId: "minigame-jalur-angka", battleAdapterKey: "jalur-angka", order: 14 },
  // ═══════════════════════════════════════════
  // Game Adab — disembunyikan dari Mini-Game (2026-06-22)
  // Tetap tersedia di Peta Petualangan via challengeType.
  // ═══════════════════════════════════════════
  { id: "pilih-sikap", title: "Pilih Sikap Terbaik", description: "Pilih sikap terbaik dalam cerita sehari-hari.", icon: "🌟", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-pilih-sikap", order: 15 },
  { id: "nasihat-lembut", title: "Nasihat dengan Lembut", description: "Pilih kata-kata terbaik untuk menasihati teman.", icon: "💬", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-nasihat", order: 16 },
  { id: "urutkan-adab", title: "Urutkan Adab", description: "Susun langkah-langkah adab dalam urutan benar.", icon: "📋", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["tk","sd-bawah","sd-atas","smp","sma","universitas"], estimatedDuration: "2-3 mnt", screenId: "minigame-urutkan-adab", order: 17 },
  { id: "dilema-bijak", title: "Dilema Bijak", description: "Hadapi dilema moral, pilih keputusan paling bijak.", icon: "⚖️", categoryTag: "Adab", categoryEmoji: "💖", isAdabGame: true, isMiniGameEnabled: false, isBattleEnabled: false, supportedDifficulties: ["smp","sma","universitas"], minDifficulty: "smp", estimatedDuration: "3-5 mnt", screenId: "minigame-dilema", order: 18 },
];

/** Get flat list filtered for mini-game display */
export function getFlatMiniGames(): FlatGameEntry[] {
  return MINI_GAME_FLAT_LIST.filter(g => g.isMiniGameEnabled).sort((a, b) => a.order - b.order);
}

/** Get flat list filtered for battle display (non-adab, battle-enabled) */
export function getFlatBattleGames(): FlatGameEntry[] {
  return MINI_GAME_FLAT_LIST.filter(g => g.isBattleEnabled && !g.isAdabGame && g.battleAdapterKey);
}

/** Check if a game is playable for a given difficulty */
export function isGamePlayable(game: FlatGameEntry, difficulty: DifficultyId): boolean {
  if (game.minDifficulty) {
    const DIFF_ORDER = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];
    const minIdx = DIFF_ORDER.indexOf(game.minDifficulty);
    const userIdx = DIFF_ORDER.indexOf(difficulty);
    return userIdx >= minIdx;
  }
  return game.supportedDifficulties.includes(difficulty);
}

/** Get mini-games playable for a difficulty */
export function getPlayableMiniGames(difficulty: DifficultyId): FlatGameEntry[] {
  return getFlatMiniGames().filter(g => isGamePlayable(g, difficulty));
}

/** Get random playable mini-game (not locked, not disabled) */
export function getRandomPlayableGame(difficulty: DifficultyId): FlatGameEntry | null {
  const playable = getPlayableMiniGames(difficulty);
  if (playable.length === 0) return null;
  return playable[Math.floor(Math.random() * playable.length)];
}

// ═══════════════════════════════════════════
// Legacy package structure (kept for backward compat)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// Packages
// ═══════════════════════════════════════════

export const MINI_GAME_PACKAGES: MiniGamePackage[] = [
  {
    id: "fokus-cepat",
    title: "Fokus Cepat",
    description: "Latihan singkat untuk kecepatan berpikir, fokus, dan ketelitian.",
    icon: "⚡",
    themeColor: "#2196F3",
    order: 1,
  },
  {
    id: "adab",
    title: "Adab",
    description: "Belajar akhlak mulia melalui pilihan sikap dan hikmah kehidupan.",
    icon: "💖",
    themeColor: "#E91E63",
    order: 2,
  },
  {
    id: "logika",
    title: "Logika",
    description: "Asah kemampuan berpikir logis, deduksi, dan analisis.",
    icon: "🧠",
    themeColor: "#9C27B0",
    order: 3,
  },
  {
    id: "spasial",
    title: "Spasial",
    description: "Latih kemampuan visual, orientasi ruang, dan pemecahan masalah visual.",
    icon: "🔷",
    themeColor: "#4CAF50",
    order: 4,
  },
  {
    id: "keluarga",
    title: "Keluarga",
    description: "Aktivitas bersama keluarga, misi kebaikan, dan hadiah dunia nyata.",
    icon: "👨‍👩‍👧",
    themeColor: "#FF9800",
    order: 5,
  },
];

// ═══════════════════════════════════════════
// All Mini-Games
// ═══════════════════════════════════════════

const ALL_DIFFICULTIES: DifficultyId[] = ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"];

export const MINI_GAMES: MiniGameDefinition[] = [
  // ─── Paket Fokus Cepat ───
  {
    id: "hitung-kilat",
    packageId: "fokus-cepat",
    title: "Hitung Kilat",
    description: "Jawab soal matematika secepat mungkin sebelum waktu habis.",
    icon: "⚡",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "speed-math",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: true,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-hitung",
  },
  {
    id: "pola-kilat",
    packageId: "fokus-cepat",
    title: "Pola Kilat",
    description: "Temukan pola selanjutnya dari urutan yang ditampilkan.",
    icon: "🧩",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "pattern-speed",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: true,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-pola",
  },
  {
    id: "ingatan-cepat",
    packageId: "fokus-cepat",
    title: "Ingatan Cepat",
    description: "Hafalkan urutan gambar, lalu pilih kembali sesuai urutan.",
    icon: "🧠",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "memory-speed",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: true,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-ingatan",
  },
  {
    id: "cari-berbeda",
    packageId: "fokus-cepat",
    title: "Cari yang Berbeda",
    description: "Temukan objek yang berbeda dari kumpulan yang mirip.",
    icon: "🔍",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "spot-difference",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: true,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-cari-beda",
  },

  // ─── Paket Adab ───
  {
    id: "pilih-sikap",
    packageId: "adab",
    title: "Pilih Sikap Terbaik",
    description: "Pilih sikap terbaik dari situasi sehari-hari.",
    icon: "🌟",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "moral-choice",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-pilih-sikap",
  },
  {
    id: "nasihat-lembut",
    packageId: "adab",
    title: "Nasihat dengan Lembut",
    description: "Pilih kata-kata terbaik untuk menasihati teman dengan cara yang baik.",
    icon: "💬",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "gentle-advice",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-nasihat",
  },
  {
    id: "urutkan-adab",
    packageId: "adab",
    title: "Urutkan Adab",
    description: "Susun langkah-langkah adab dalam urutan yang benar.",
    icon: "📋",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "adab-sort",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-urutkan-adab",
  },
  {
    id: "dilema-bijak",
    packageId: "adab",
    title: "Dilema Bijak",
    description: "Hadapi dilema moral dan pilih keputusan paling bijaksana.",
    icon: "⚖️",
    supportedDifficulties: ["smp", "sma", "universitas"],
    gameType: "wisdom-dilemma",
    hasTimer: false,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-dilema",
  },

  // ─── Paket Logika ───
  {
    id: "detektif-petunjuk",
    packageId: "logika",
    title: "Detektif Petunjuk",
    description: "Gunakan petunjuk untuk memecahkan misteri dan menemukan jawaban.",
    icon: "🕵️",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "detective-clues",
    hasTimer: false,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-detektif",
  },
  {
    id: "tebak-aturan",
    packageId: "logika",
    title: "Tebak Aturan",
    description: "Temukan aturan tersembunyi dari contoh yang diberikan.",
    icon: "📐",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "guess-rule",
    hasTimer: false,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-tebak-aturan",
  },
  {
    id: "pilih-kesimpulan",
    packageId: "logika",
    title: "Pilih Kesimpulan",
    description: "Baca beberapa fakta, lalu pilih kesimpulan yang paling tepat.",
    icon: "💡",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "pick-conclusion",
    hasTimer: false,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-kesimpulan",
  },
  {
    id: "benar-atau-salah",
    packageId: "logika",
    title: "Benar atau Salah",
    description: "Tentukan apakah pernyataan yang diberikan benar atau salah.",
    icon: "✅",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "true-or-false",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-benar-salah",
  },
  {
    id: "kode-warna",
    packageId: "logika",
    title: "Kode Warna",
    description: "Pahami kode bentuk dan hitung hasilnya.",
    icon: "🧩",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "color-code",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-kode-warna",
  },
  // ═══════════════════════════════════════════
  // Rantai Warna — Mini-Game baru (2026-06-22)
  // ═══════════════════════════════════════════
  {
    id: "rantai-warna",
    packageId: "fokus-cepat",
    title: "Rantai Warna",
    description: "Hubungkan warna sesuai urutan angka yang diberikan.",
    icon: "🎨",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "color-sequence-path",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-rantai-warna",
  },
  // ═══════════════════════════════════════════
  // Jalur Angka — Mini-Game baru (2026-06-22)
  // ═══════════════════════════════════════════
  {
    id: "jalur-angka",
    packageId: "logika",
    title: "Jalur Angka",
    description: "Isi kotak kosong agar jalur hitung menjadi benar.",
    icon: "🔢",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "number-path-puzzle",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-jalur-angka",
  },

  // ─── Paket Spasial ───
  {
    id: "ubah-posisi",
    packageId: "spasial",
    title: "Ubah Posisi",
    description: "Ikuti instruksi gerakan dan tentukan posisi akhir objek di grid 10×10.",
    icon: "🔄",
    supportedDifficulties: ["sd-bawah", "sd-atas", "smp", "sma", "universitas"],
    gameType: "change-position",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-ubah-posisi",
  },
  {
    id: "cocok-bayangan",
    packageId: "spasial",
    title: "Cocokkan Bayangan",
    description: "Temukan bayangan hitam yang cocok dengan bentuk objek.",
    icon: "👤",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "match-shadow",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-cocok-bayangan",
  },
  {
    id: "jalur-tercepat",
    packageId: "spasial",
    title: "Jalur Tercepat",
    description: "Cari jalur tercepat dari monyet ke pisang di grid 6×20!",
    icon: "🐒",
    supportedDifficulties: ["sd-bawah", "sd-atas", "smp", "sma", "universitas"],
    gameType: "fastest-path",
    hasTimer: true,
    hasLeaderboard: true,
    hasStages: false,
    isFamilyMode: false,
    isActive: true,
    screenId: "minigame-jalur-tercepat",
  },

  // ─── Paket Keluarga ───
  {
    id: "misi-keluarga",
    packageId: "keluarga",
    title: "Misi Keluarga",
    description: "Misi kebaikan yang diberikan orang tua untuk dikerjakan bersama.",
    icon: "🏡",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "family-mission",
    hasTimer: false,
    hasLeaderboard: false,
    hasStages: false,
    isFamilyMode: true,
    isActive: true,
    screenId: "minigame-misi-keluarga",
  },
  {
    id: "family-challenge",
    packageId: "keluarga",
    title: "Family Challenge",
    description: "Battle bergiliran dalam 1 device. Ajak kakak, adik, atau teman!",
    icon: "⚔️",
    supportedDifficulties: ALL_DIFFICULTIES,
    gameType: "family-challenge",
    hasTimer: true,
    hasLeaderboard: false,
    hasStages: false,
    isFamilyMode: true,
    isActive: true,
    screenId: "minigame-family-challenge",
  },
];

// ─── Helpers ───

export function getMiniGamesByPackage(packageId: MiniGamePackageId): MiniGameDefinition[] {
  return MINI_GAMES.filter(g => g.packageId === packageId && g.isActive);
}

export function getMiniGameById(id: string): MiniGameDefinition | undefined {
  return MINI_GAMES.find(g => g.id === id);
}

export function getPackageById(id: MiniGamePackageId): MiniGamePackage | undefined {
  return MINI_GAME_PACKAGES.find(p => p.id === id);
}

export function getMiniGameCount(packageId: MiniGamePackageId): number {
  return getMiniGamesByPackage(packageId).length;
}
