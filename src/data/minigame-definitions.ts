/**
 * Mini-Game Definitions — all 20 mini-games in 5 packages
 */
import type { MiniGamePackage, MiniGameDefinition, MiniGamePackageId, DifficultyId } from "@/types";

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
