import type { CategoryInfo, CategoryId, DifficultyInfo, DifficultyId, BadgeDef } from "./types";

export const DIFFICULTIES: DifficultyInfo[] = [
  { id: "sd-kecil", label: "SD Kecil", shortLabel: "SD Kecil", description: "Kelas 1–3 SD", multiplier: 1.0, emoji: "🌱" },
  { id: "sd-muda", label: "SD Muda", shortLabel: "SD Muda", description: "Kelas 4–6 SD", multiplier: 1.2, emoji: "🌿" },
  { id: "smp", label: "SMP", shortLabel: "SMP", description: "Tingkat menengah", multiplier: 1.5, emoji: "🌳" },
  { id: "sma", label: "SMA", shortLabel: "SMA", description: "Tingkat sulit", multiplier: 2.0, emoji: "🏔️" },
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
];

export const CATEGORY_MAP: Record<CategoryId, CategoryInfo> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryInfo>;

export const BADGES: BadgeDef[] = [
  { id: "sahabat-amanah", name: "Sahabat Amanah", description: "Selalu jujur dalam misi adab.", emoji: "🤝", color: "leaf", unlockHint: "Selesaikan 3 misi moral dengan benar." },
  { id: "pemecah-pola", name: "Pemecah Pola", description: "Ahli mengenali pola tersembunyi.", emoji: "🔍", color: "grape", unlockHint: "Selesaikan 3 misi pola." },
  { id: "penjelajah-ilmu", name: "Penjelajah Ilmu", description: "Telah menyelesaikan 5 misi.", emoji: "🗺️", color: "sky", unlockHint: "Selesaikan 5 misi apa saja." },
  { id: "pemimpin-bijak", name: "Pemimpin Bijak", description: "Bijak dalam keputusan kepemimpinan.", emoji: "👑", color: "sun", unlockHint: "Selesaikan misi kepemimpinan SMP/SMA." },
  { id: "ahli-numerasi", name: "Ahli Numerasi", description: "Hebat dalam hitung-hitungan.", emoji: "🔢", color: "leaf-dark", unlockHint: "Selesaikan 3 misi numerasi." },
  { id: "penjaga-adab", name: "Penjaga Adab", description: "Selalu menjaga adab di setiap misi.", emoji: "🕌", color: "berry", unlockHint: "Dapatkan bonus adab 5 kali." },
];

export const AVATARS = ["🦊", "🐯", "🐼", "🦉", "🐧", "🐶", "🐱", "🦁", "🐵", "🐰", "🐨", "🦄"];
