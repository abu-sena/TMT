/**
 * Companion Characters & Story Templates for Story Adventure Map
 * 
 * TMT — The Mastermind Trials
 * "Negeri Cahaya Ilmu"
 */

import type { DifficultyId, CategoryId } from "@/types";

// ════════════════════════════════════════════════════════
// Companion Characters
// ════════════════════════════════════════════════════════

export interface CompanionDef {
  id: string;
  name: string;
  role: string;
  avatar: string;
  colorTheme: string;
  introPhrase: string;
}

export const COMPANIONS: Record<string, CompanionDef> = {
  nara: {
    id: "nara",
    name: "Nara",
    role: "Pemandu Adab",
    avatar: "🌸",
    colorTheme: "#E91E63",
    introPhrase: "Aku Nara, pemandu adab dan kebaikan. Yuk pilih sikap terbaik!",
  },
  qiro: {
    id: "qiro",
    name: "Qiro",
    role: "Pemandu Logika",
    avatar: "🔍",
    colorTheme: "#2196F3",
    introPhrase: "Aku Qiro, pemandu logika. Perhatikan petunjuknya satu per satu!",
  },
  luma: {
    id: "luma",
    name: "Luma",
    role: "Pemandu Spasial",
    avatar: "👁️",
    colorTheme: "#4CAF50",
    introPhrase: "Aku Luma, pemandu ruang dan bentuk. Lihat dengan teliti ya!",
  },
  aman: {
    id: "aman",
    name: "Aman",
    role: "Pemandu Kepemimpinan",
    avatar: "🛡️",
    colorTheme: "#FF9800",
    introPhrase: "Aku Aman, pemandu kepemimpinan. Keputusanmu penting untuk semua!",
  },
};

// Map challenge types to companions
export function getCompanionForChallenge(challengeType: string): CompanionDef | null {
  const type = challengeType.toLowerCase();
  
  // Nara — Adab
  if (type.includes("moral") || type.includes("adab") || type.includes("sikap") ||
      type.includes("nasihat") || type.includes("dilema") || type.includes("urutkan")) {
    return COMPANIONS.nara;
  }
  
  // Qiro — Logika
  if (type.includes("detektif") || type.includes("tebak") || type.includes("kesimpulan") ||
      type.includes("benar") || type.includes("salah") || type.includes("warna") ||
      type.includes("kode") || type.includes("reasoning") || type.includes("argument") ||
      type.includes("strategi") || type.includes("quantitative")) {
    return COMPANIONS.qiro;
  }
  
  // Luma — Spasial
  if (type.includes("bayangan") || type.includes("posisi") || type.includes("jalur") ||
      type.includes("cari") || type.includes("berbeda") || type.includes("spasial") ||
      type.includes("visual") || type.includes("pola")) {
    return COMPANIONS.luma;
  }
  
  // Aman — Kepemimpinan
  if (type.includes("boss") || type.includes("systems") || type.includes("leadership") ||
      type.includes("ethical") || type.includes("case") || type.includes("problem") ||
      type.includes("decision") || type.includes("musyawarah")) {
    return COMPANIONS.aman;
  }
  
  // Default for mixed/unknown
  return COMPANIONS.qiro;
}

// ════════════════════════════════════════════════════════
// Story Adventure Types
// ════════════════════════════════════════════════════════

export interface AdventureStageStory {
  stageId: string;
  stageNumber: number;
  difficulty: DifficultyId;
  storyTitle: string;
  introText: string;         // 1-2 kalimat cerita
  userRoleText: string;       // gaya bahasa aktif ke user
  challengeContext: string;   // alasan menantang dalam cerita
  successText: string;        // feedback berhasil
  failureText: string;        // feedback gagal (lembut)
  worldImpactText: string;    // dampak ke dunia
  companionId: string | null; // id companion atau null
  companionHint: string;      // hint dari companion
}

export interface AdventureTheme {
  id: string;
  name: string;
  difficulty: DifficultyId;
  themeName: string;
  userTitle: string;
  description: string;
  emoji: string;
}

export const ADVENTURE_THEMES: AdventureTheme[] = [
  { id: "tk-adventure", name: "Penjelajah Kecil", difficulty: "tk", themeName: "Taman Ceria", userTitle: "Penjelajah Kecil", description: "Petualangan penuh warna dan keceriaan untuk si kecil!", emoji: "🌸" },
  { id: "sd-bawah-adventure", name: "Sahabat Ceria", difficulty: "sd-bawah", themeName: "Negeri Sahabat", userTitle: "Sahabat Ceria", description: "Membantu teman-teman dan belajar adab harian.", emoji: "🌱" },
  { id: "sd-atas-adventure", name: "Penjaga Amanah", difficulty: "sd-atas", themeName: "Benteng Amanah", userTitle: "Penjaga Amanah", description: "Menjaga tanggung jawab dan memecahkan teka-teki.", emoji: "🌿" },
  { id: "smp-adventure", name: "Pemecah Masalah", difficulty: "smp", themeName: "Kota Musyawarah", userTitle: "Pemecah Masalah", description: "Logika, musyawarah, dan keputusan bijak.", emoji: "🌳" },
  { id: "sma-adventure", name: "Calon Pemimpin", difficulty: "sma", themeName: "Menara Mastermind", userTitle: "Calon Pemimpin", description: "Kepemimpinan, strategi, dan systems thinking.", emoji: "🏔️" },
  { id: "universitas-adventure", name: "Mastermind", difficulty: "universitas", themeName: "Puncak Ilmu", userTitle: "Calon Mastermind", description: "Analisis kompleks dan kebijaksanaan tingkat tinggi.", emoji: "🎓" },
];

export function getThemeForDifficulty(diff: DifficultyId): AdventureTheme {
  return ADVENTURE_THEMES.find(t => t.difficulty === diff) || ADVENTURE_THEMES[0];
}

// ════════════════════════════════════════════════════════
// World Impact Effects
// ════════════════════════════════════════════════════════

export const WORLD_IMPROVEMENTS = [
  "Cahaya kecil mulai bersinar di sekitar sini.",
  "Bunga-bunga kecil bermekaran di sepanjang jalan.",
  "Jembatan tampak lebih kuat dan kokoh.",
  "Suara riang mulai terdengar dari kejauhan.",
  "Awan gelap perlahan menjauh.",
  "Pintu gua perlahan terbuka.",
  "Pohon-pohon mulai berdaun kembali.",
  "Air sungai mulai jernih dan berkilau.",
  "Burung-burung kembali bernyanyi di langit.",
  "Pelangi kecil muncul di ufuk timur.",
  "Penduduk desa tersenyum dan melambaikan tangan.",
  "Batu-batu di jalan mulai bercahaya lembut.",
  "Angin sepoi membawa aroma bunga segar.",
  "Bintang kecil mulai terlihat meski masih siang.",
  "Rerumputan di sekitar jalur menjadi lebih hijau.",
];
