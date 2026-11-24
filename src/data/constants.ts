import type { CategoryInfo, CategoryId, DifficultyInfo, DifficultyId } from "@/types";

export const DIFFICULTIES: DifficultyInfo[] = [
  { id: "tk", label: "TK", shortLabel: "TK", description: "Belajar adab, bentuk, pola, dan angka sederhana", multiplier: 0.8, emoji: "🌸" },
  { id: "sd-bawah", label: "SD Bawah", shortLabel: "SD Bawah", description: "Kelas 1–3 SD", multiplier: 1.0, emoji: "🌱" },
  { id: "sd-atas", label: "SD Atas", shortLabel: "SD Atas", description: "Kelas 4–6 SD", multiplier: 1.2, emoji: "🌿" },
  { id: "smp", label: "SMP", shortLabel: "SMP", description: "Tingkat menengah", multiplier: 1.5, emoji: "🌳" },
  { id: "sma", label: "SMA", shortLabel: "SMA", description: "Tingkat sulit", multiplier: 2.0, emoji: "🏔️" },
  { id: "universitas", label: "Universitas", shortLabel: "Univ", description: "Tingkat ahli", multiplier: 2.5, emoji: "🎓" },
];

export const DIFFICULTY_MAP: Record<DifficultyId, DifficultyInfo> =
  Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d])) as Record<DifficultyId, DifficultyInfo>;

export const CATEGORIES: CategoryInfo[] = [
  { id: "literasi-numerasi", label: "Literasi & Numerasi", short: "Literasi", emoji: "📖", color: "leaf" },
  { id: "spasial", label: "Visualisasi Spasial", short: "Spasial", emoji: "🧭", color: "sky" },
  { id: "pola", label: "Pengenalan Pola", short: "Pola", emoji: "🔣", color: "grape" },
  { id: "kreativitas", label: "Kreativitas & Lateral", short: "Kreatif", emoji: "💡", color: "sun" },
  { id: "systems", label: "Systems Thinking", short: "Sistem", emoji: "⚙️", color: "wood" },
  { id: "moral", label: "Moral & Adab", short: "Adab", emoji: "🌟", color: "berry" },
  { id: "penalaran", label: "Penalaran Umum", short: "Nalar", emoji: "🧠", color: "leaf-dark" },
  { id: "tk-adab", label: "Adab Dasar", short: "Adab", emoji: "🌸", color: "berry" },
  { id: "tk-pra-literasi", label: "Pra-Literasi & Numerasi Awal", short: "Pra-Literasi", emoji: "🔤", color: "leaf" },
  { id: "tk-pola", label: "Pola Sederhana", short: "Pola", emoji: "🔷", color: "grape" },
  { id: "tk-visual", label: "Visual Spasial Dasar", short: "Visual", emoji: "👁️", color: "sky" },
  { id: "tk-kreativitas", label: "Kreativitas Sederhana", short: "Kreatif", emoji: "🎨", color: "sun" },
  // Universitas
  { id: "advanced-reasoning", label: "Advanced Reasoning", short: "Reasoning", emoji: "🧠", color: "leaf-dark" },
  { id: "systems-kompleks", label: "Systems Thinking Kompleks", short: "Sistem Kompleks", emoji: "⚙️", color: "wood" },
  { id: "ethical-leadership", label: "Ethical Leadership", short: "Etika", emoji: "🌟", color: "berry" },
  { id: "argument-evaluation", label: "Argument Evaluation", short: "Argumen", emoji: "💬", color: "sun" },
  { id: "quantitative-logic", label: "Quantitative Logic", short: "Logika Q", emoji: "🔢", color: "grape" },
  { id: "strategic-decision", label: "Strategic Decision", short: "Strategi", emoji: "♟️", color: "sky" },
  { id: "problem-solving", label: "Problem Solving Kompleks", short: "Problem Solving", emoji: "🧩", color: "leaf" },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryInfo> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryInfo>;


export const AVATARS = [
  { id: "shinobi-blue-boy", label: "Pemimpin penjelajah berjubah dan bertudung" },
  { id: "shinobi-teal-hijabi-girl", label: "Koki penjelajah berambut kepang dan bertopi tinggi" },
  { id: "shinobi-green-boy", label: "Penjaga gunung dengan tongkat kayu" },
  { id: "shinobi-rose-hijabi-girl", label: "Kurir langit bertopi bulu dengan tas selempang" },
  { id: "shinobi-orange-boy", label: "Tabib hutan berjubah dan membawa keranjang herba" },
  { id: "shinobi-emerald-hijabi-girl", label: "Mekanik berambut tembaga dengan kacamata kerja" },
  { id: "scout-indigo-boy", label: "Navigator berhijab ungu dengan kompas" },
  { id: "scout-sage-hijabi-girl", label: "Penjaga berhijab merah muda dengan pelindung bahu" },
  { id: "scout-coral-hat-boy", label: "Peramu berhijab hijau tua dengan kantong herba" },
  { id: "scout-lilac-hijabi-girl", label: "Cendekia berhijab keemasan dengan gulungan peta" },
  { id: "scout-teal-boy", label: "Pemanah berhijab biru dengan busur" },
  { id: "scout-navy-hijabi-girl", label: "Ahli tanaman berhijab hijau sage dengan keranjang" },
  { id: "original-blue-hat-boy", label: "Kapten bertopi lebar dengan rompi merah" },
  { id: "original-teal-hijabi-girl", label: "Koki bertopi tinggi dengan mantel biru" },
  { id: "original-forest-boy", label: "Pendekar berambut hijau dengan tiga gagang pedang" },
  { id: "original-rose-hijabi-girl", label: "Kurir berambut merah muda dengan seragam biru" },
  { id: "original-gold-scarf-boy", label: "Tabib bertopi bulu dengan jubah herba" },
  { id: "original-emerald-hijabi-girl", label: "Mekanik berambut tembaga dengan kacamata kerja" },
  { id: "extra-indigo-scarf-boy", label: "Navigator berhijab ungu dengan kompas" },
  { id: "extra-sage-hijabi-girl", label: "Penjaga berhijab merah muda dengan tongkat" },
  { id: "extra-coral-hat-boy", label: "Peramu berhijab biru kehijauan dengan herba" },
  { id: "extra-lilac-hijabi-girl", label: "Cendekia berhijab keemasan dengan gulungan peta" },
  { id: "extra-teal-scout-boy", label: "Pemanah berhijab biru dengan busur" },
  { id: "extra-navy-hijabi-girl", label: "Ahli tanaman berhijab hijau sage dengan keranjang" },
] as const;

/** UI-friendly label for SD */
export const DIFFICULTY_UI_LABELS: Record<DifficultyId, string> = {
  tk: "TK",
  "sd-bawah": "SD Bawah (Kelas 1–3)",
  "sd-atas": "SD Atas (Kelas 4–6)",
  smp: "SMP",
  sma: "SMA",
  universitas: "Universitas",
};
