/**
 * World Definitions for TMT — The Mastermind Trials
 *
 * 5 worlds per difficulty × 6 difficulties = 30 total worlds.
 * Each world contains multiple stages (missions, bosses, reviews, rewards).
 *
 * Stage range: [startStage, endStage] within that difficulty.
 * Boss stages: list of stage numbers that are boss battles within this world.
 */

import type { WorldDefinition, StageType } from "@/types";

// ══════════════════════════════════════════════
// TK — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const TK_WORLDS: WorldDefinition[] = [
  {
    id: "tk-taman-adab",
    name: "Taman Adab Ceria",
    description: "Belajar adab dasar sambil bermain di taman penuh bunga dan kupu-kupu.",
    difficulty: "tk",
    categoryFocus: ["tk-adab"],
    themeColor: "#FF6B8A",
    icon: "🌸",
    stageRange: [1, 120],
    bossStages: [30, 60, 90, 120],
    completionReward: "🏅 Mahkota Adab Ceria",
    worldIntroText: "Selamat datang di Taman Adab Ceria! Di sini kita belajar berkata jujur, hormat, dan berbagi. Yuk petik bunga kebaikan!",
    worldCompleteText: "Kamu sudah menyelesaikan Taman Adab Ceria! Bunga-bunga kebaikan telah mekar di hatimu. 🌸",
  },
  {
    id: "tk-kebun-angka",
    name: "Kebun Angka",
    description: "Petualangan di kebun penuh buah dan hewan untuk belajar berhitung.",
    difficulty: "tk",
    categoryFocus: ["tk-pra-literasi"],
    themeColor: "#4CAF50",
    icon: "🍎",
    stageRange: [121, 220],
    bossStages: [160, 220],
    completionReward: "🌟 Bintang Penghitung",
    worldIntroText: "Kebun Angka penuh dengan buah-buahan dan hewan lucu. Ayo kita hitung bersama!",
    worldCompleteText: "Kamu sudah menguasai Kebun Angka! Menghitung jadi semakin mudah. 🍎",
  },
  {
    id: "tk-pulau-bentuk",
    name: "Pulau Bentuk",
    description: "Pulau ajaib dengan berbagai bentuk, warna, dan ukuran benda.",
    difficulty: "tk",
    categoryFocus: ["tk-visual"],
    themeColor: "#2196F3",
    icon: "🔷",
    stageRange: [221, 310],
    bossStages: [270, 310],
    completionReward: "🎨 Palet Bentuk",
    worldIntroText: "Pulau Bentuk penuh dengan benda-benda lucu. Mari kenali bentuk dan warnanya!",
    worldCompleteText: "Pulau Bentuk sudah kamu taklukkan! Sekarang kamu ahli mengenali bentuk. 🔷",
  },
  {
    id: "tk-rumah-pola",
    name: "Rumah Pola",
    description: "Rumah ajaib tempat pola-pola lucu bermunculan.",
    difficulty: "tk",
    categoryFocus: ["tk-pola"],
    themeColor: "#9C27B0",
    icon: "🏠",
    stageRange: [311, 400],
    bossStages: [360, 400],
    completionReward: "🧩 Puzzle Pola",
    worldIntroText: "Selamat datang di Rumah Pola! Lihat, ada pola warna-warni di mana-mana.",
    worldCompleteText: "Rumah Pola sudah selesai! Kamu pintar menemukan pola. 🏠",
  },
  {
    id: "tk-galeri-warna",
    name: "Galeri Warna",
    description: "Galeri kreatif tempat imajinasi berkembang dengan warna dan seni.",
    difficulty: "tk",
    categoryFocus: ["tk-kreativitas"],
    themeColor: "#FF9800",
    icon: "🎨",
    stageRange: [401, 500],
    bossStages: [450, 500],
    completionReward: "🖼️ Lukisan Kreativitas",
    worldIntroText: "Galeri Warna adalah tempatmu berkreasi! Gambar, warna, dan ide seru menanti.",
    worldCompleteText: "Galeri Warna sudah kamu jelajahi! Kreativitasmu bersinar cerah. 🎨",
  },
];

// ══════════════════════════════════════════════
// SD Bawah — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SD_KECIL_WORLDS: WorldDefinition[] = [
  {
    id: "sdk-taman-adab",
    name: "Taman Adab",
    description: "Taman luas tempat kita mempraktikkan adab dan akhlak mulia dalam kehidupan sehari-hari.",
    difficulty: "sd-bawah",
    categoryFocus: ["moral"],
    themeColor: "#E91E63",
    icon: "🌟",
    stageRange: [1, 120],
    bossStages: [30, 70, 120],
    completionReward: "👑 Mahkota Adab",
    worldIntroText: "Taman Adab penuh dengan pelajaran kebaikan. Siap menjadi pribadi berakhlak mulia?",
    worldCompleteText: "Taman Adab berhasil kamu selesaikan! Akhlakmu semakin bersinar. 🌟",
  },
  {
    id: "sdk-kota-angka",
    name: "Kota Angka",
    description: "Kota sibuk tempat angka dan hitungan menjadi kunci menyelesaikan masalah.",
    difficulty: "sd-bawah",
    categoryFocus: ["literasi-numerasi", "penalaran"],
    themeColor: "#4CAF50",
    icon: "🏙️",
    stageRange: [121, 250],
    bossStages: [170, 220, 250],
    completionReward: "🔢 Mahkota Numerasi",
    worldIntroText: "Kota Angka membutuhkan bantuanmu! Hitung dan pecahkan soal-soal seru.",
    worldCompleteText: "Kota Angka sudah kamu selamatkan! Kemampuan berhitungmu luar biasa. 🏙️",
  },
  {
    id: "sdk-jembatan-pola",
    name: "Jembatan Pola",
    description: "Jembatan yang menghubungkan berbagai pulau tantangan pola dan aturan.",
    difficulty: "sd-bawah",
    categoryFocus: ["pola", "kreativitas"],
    themeColor: "#9C27B0",
    icon: "🌉",
    stageRange: [251, 360],
    bossStages: [310, 360],
    completionReward: "🔍 Lensa Pola",
    worldIntroText: "Jembatan Pola penuh teka-teki. Temukan polanya dan seberangi jembatan!",
    worldCompleteText: "Jembatan Pola berhasil kamu lewati! Mata elangmu menangkap semua pola. 🌉",
  },
  {
    id: "sdk-rumah-ingatan",
    name: "Rumah Ingatan",
    description: "Rumah bertingkat dengan ruang-ruang yang menguji daya ingat dan nalar.",
    difficulty: "sd-bawah",
    categoryFocus: ["spasial", "systems"],
    themeColor: "#2196F3",
    icon: "🏡",
    stageRange: [361, 450],
    bossStages: [410, 450],
    completionReward: "🧠 Piala Ingatan",
    worldIntroText: "Setiap kamar di Rumah Ingatan punya teka-teki seru. Siapkah kamu?",
    worldCompleteText: "Rumah Ingatan sudah kamu taklukkan! Ingatan dan nalarmu semakin tajam. 🏡",
  },
  {
    id: "sdk-lapangan-kebaikan",
    name: "Lapangan Kebaikan",
    description: "Lapangan luas tempat keputusan moral dan kebaikan diuji setiap hari.",
    difficulty: "sd-bawah",
    categoryFocus: ["moral", "kreativitas"],
    themeColor: "#FF9800",
    icon: "☀️",
    stageRange: [451, 500],
    bossStages: [470, 500],
    completionReward: "🕊️ Sayap Kebaikan",
    worldIntroText: "Lapangan Kebaikan adalah tempatmu berlatih menjadi pemimpin yang baik hati.",
    worldCompleteText: "Lapangan Kebaikan selesai! Kebaikanmu menginspirasi semua orang. ☀️",
  },
];

// ══════════════════════════════════════════════
// SD Atas — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SD_MUDA_WORLDS: WorldDefinition[] = [
  {
    id: "sdm-kota-numerasi",
    name: "Kota Numerasi",
    description: "Kota besar dengan tantangan matematika dan logika yang lebih menantang.",
    difficulty: "sd-atas",
    categoryFocus: ["literasi-numerasi", "penalaran"],
    themeColor: "#4CAF50",
    icon: "🏢",
    stageRange: [1, 120],
    bossStages: [40, 80, 120],
    completionReward: "🏆 Piala Numerasi",
    worldIntroText: "Kota Numerasi lebih besar dan lebih menantang. Siap mengasah otak?",
    worldCompleteText: "Kota Numerasi sudah kamu kuasai! Matematikamu semakin hebat. 🏢",
  },
  {
    id: "sdm-menara-pola",
    name: "Menara Pola",
    description: "Menara tinggi dengan lantai-lantai teka-teki pola yang semakin rumit.",
    difficulty: "sd-atas",
    categoryFocus: ["pola", "kreativitas"],
    themeColor: "#9C27B0",
    icon: "🗼",
    stageRange: [121, 225],
    bossStages: [180, 225],
    completionReward: "🔮 Bola Kristal Pola",
    worldIntroText: "Setiap lantai Menara Pola lebih sulit dari sebelumnya. Naik terus!",
    worldCompleteText: "Puncak Menara Pola berhasil kamu capai! Kamu master pola sejati. 🗼",
  },
  {
    id: "sdm-gua-ingatan",
    name: "Gua Ingatan",
    description: "Gua misterius dengan ruang-ruang bawah tanah yang menguji daya ingat.",
    difficulty: "sd-atas",
    categoryFocus: ["spasial", "systems"],
    themeColor: "#607D8B",
    icon: "🕳️",
    stageRange: [226, 330],
    bossStages: [280, 330],
    completionReward: "💎 Kristal Ingatan",
    worldIntroText: "Gua Ingatan gelap dan penuh misteri. Gunakan ingatanmu untuk keluar!",
    worldCompleteText: "Gua Ingatan berhasil kamu taklukkan! Ingatanmu sekuat berlian. 🕳️",
  },
  {
    id: "sdm-lembah-logika",
    name: "Lembah Logika",
    description: "Lembah tenang tempat berpikir logis dan sistematis menjadi kunci.",
    difficulty: "sd-atas",
    categoryFocus: ["systems", "penalaran"],
    themeColor: "#8BC34A",
    icon: "🌄",
    stageRange: [331, 430],
    bossStages: [380, 430],
    completionReward: "⚖️ Timbangan Logika",
    worldIntroText: "Di Lembah Logika, setiap masalah harus diselesaikan dengan logika jernih.",
    worldCompleteText: "Lembah Logika selesai! Kamu berpikir dengan jernih dan sistematis. 🌄",
  },
  {
    id: "sdm-kampung-amanah",
    name: "Kampung Amanah",
    description: "Kampung damai tempat setiap keputusan moral membentuk karakter pemimpin.",
    difficulty: "sd-atas",
    categoryFocus: ["moral"],
    themeColor: "#FF5722",
    icon: "🏘️",
    stageRange: [431, 500],
    bossStages: [460, 500],
    completionReward: "🛡️ Perisai Amanah",
    worldIntroText: "Kampung Amanah butuh pemimpin jujur dan adil. Bisakah kamu?",
    worldCompleteText: "Kampung Amanah bangga padamu! Kepemimpinanmu terpuji. 🏘️",
  },
];

// ══════════════════════════════════════════════
// SMP — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SMP_WORLDS: WorldDefinition[] = [
  {
    id: "smp-benteng-logika",
    name: "Benteng Logika",
    description: "Benteng kokoh tempat pertahanan logika dan penalaran diuji.",
    difficulty: "smp",
    categoryFocus: ["systems", "penalaran"],
    themeColor: "#607D8B",
    icon: "🏰",
    stageRange: [1, 120],
    bossStages: [50, 100, 120],
    completionReward: "🗝️ Kunci Logika",
    worldIntroText: "Benteng Logika tak bisa ditembus tanpa pemikiran tajam. Buktikan dirimu!",
    worldCompleteText: "Benteng Logika berhasil kamu taklukkan! Pikiranmu setajam pedang. 🏰",
  },
  {
    id: "smp-majelis-musyawarah",
    name: "Majelis Musyawarah",
    description: "Tempat pertemuan para pemimpin muda untuk berdiskusi dan memutuskan.",
    difficulty: "smp",
    categoryFocus: ["moral", "kreativitas"],
    themeColor: "#E91E63",
    icon: "🏛️",
    stageRange: [121, 240],
    bossStages: [180, 240],
    completionReward: "🎤 Podium Pemimpin",
    worldIntroText: "Di Majelis Musyawarah, kata-katamu bisa mengubah dunia. Bicaralah dengan bijak!",
    worldCompleteText: "Majelis Musyawarah mengakui kebijaksanaanmu! Kamu pemimpin sejati. 🏛️",
  },
  {
    id: "smp-laboratorium-sistem",
    name: "Laboratorium Sistem",
    description: "Laboratorium canggih untuk menganalisis dan merancang sistem kompleks.",
    difficulty: "smp",
    categoryFocus: ["systems", "literasi-numerasi"],
    themeColor: "#2196F3",
    icon: "🔬",
    stageRange: [241, 350],
    bossStages: [300, 350],
    completionReward: "⚗️ Lab Master",
    worldIntroText: "Laboratorium Sistem penuh eksperimen. Analisis, rancang, dan temukan solusinya!",
    worldCompleteText: "Laboratorium Sistem selesai! Kamu ilmuwan sistem yang handal. 🔬",
  },
  {
    id: "smp-pasar-amanah",
    name: "Pasar Amanah",
    description: "Pasar ramai tempat kejujuran dan etika bisnis diuji setiap transaksi.",
    difficulty: "smp",
    categoryFocus: ["moral", "literasi-numerasi"],
    themeColor: "#FF9800",
    icon: "🏪",
    stageRange: [351, 450],
    bossStages: [400, 450],
    completionReward: "⚖️ Neraca Amanah",
    worldIntroText: "Di Pasar Amanah, kejujuran lebih berharga dari emas. Berdaganglah dengan adil!",
    worldCompleteText: "Pasar Amanah selesai! Pedagang jujur dan adil seperti kamu sangat dibutuhkan. 🏪",
  },
  {
    id: "smp-menara-strategi",
    name: "Menara Strategi",
    description: "Menara tertinggi tempat strategi dan perencanaan jangka panjang diuji.",
    difficulty: "smp",
    categoryFocus: ["penalaran", "pola"],
    themeColor: "#9C27B0",
    icon: "🗼",
    stageRange: [451, 500],
    bossStages: [470, 500],
    completionReward: "♟️ Catur Strategi",
    worldIntroText: "Menara Strategi menguji kemampuanmu merencanakan langkah demi langkah.",
    worldCompleteText: "Puncak Menara Strategi berhasil kamu capai! Kamu ahli strategi. 🗼",
  },
];

// ══════════════════════════════════════════════
// SMA — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SMA_WORLDS: WorldDefinition[] = [
  {
    id: "sma-kota-kepemimpinan",
    name: "Kota Kepemimpinan",
    description: "Kota modern tempat kemampuan memimpin dan mengambil keputusan diuji.",
    difficulty: "sma",
    categoryFocus: ["moral", "systems"],
    themeColor: "#E91E63",
    icon: "🌆",
    stageRange: [1, 130],
    bossStages: [50, 100, 130],
    completionReward: "👑 Mahkota Pemimpin",
    worldIntroText: "Kota Kepemimpinan butuh walikota yang bijak. Pimpin dengan hati dan logika!",
    worldCompleteText: "Kota Kepemimpinan makmur di bawah kepemimpinanmu! 👑",
  },
  {
    id: "sma-dewan-musyawarah",
    name: "Dewan Musyawarah",
    description: "Forum tertinggi untuk debat, negosiasi, dan pengambilan keputusan kolektif.",
    difficulty: "sma",
    categoryFocus: ["kreativitas", "moral"],
    themeColor: "#FF5722",
    icon: "🏛️",
    stageRange: [131, 250],
    bossStages: [190, 250],
    completionReward: "🎙️ Mimbar Musyawarah",
    worldIntroText: "Dewan Musyawarah adalah tempat kata-kata menjadi kebijakan. Siap berdebat?",
    worldCompleteText: "Dewan Musyawarah mengakui kefasihan dan kebijaksanaanmu! 🏛️",
  },
  {
    id: "sma-sistem-peradaban",
    name: "Sistem Peradaban",
    description: "Simulasi peradaban tempat kamu merancang sistem sosial, ekonomi, dan politik.",
    difficulty: "sma",
    categoryFocus: ["systems", "penalaran"],
    themeColor: "#2196F3",
    icon: "🏗️",
    stageRange: [251, 370],
    bossStages: [310, 370],
    completionReward: "🏗️ Arsitek Peradaban",
    worldIntroText: "Bangun peradaban dari nol! Setiap keputusanmu membentuk dunia.",
    worldCompleteText: "Peradabanmu berdiri kokoh! Kamu arsitek peradaban sejati. 🏗️",
  },
  {
    id: "sma-arena-argumen",
    name: "Arena Argumen",
    description: "Arena tempat argumen terkuat bertahan dan yang lemah gugur.",
    difficulty: "sma",
    categoryFocus: ["kreativitas", "penalaran"],
    themeColor: "#F44336",
    icon: "🏟️",
    stageRange: [371, 460],
    bossStages: [420, 460],
    completionReward: "⚔️ Pedang Argumen",
    worldIntroText: "Di Arena Argumen, hanya logika dan bukti yang bisa menyelamatkanmu!",
    worldCompleteText: "Arena Argumen sudah kamu menangkan! Argumenmu tak terbantahkan. 🏟️",
  },
  {
    id: "sma-gerbang-mastermind",
    name: "Gerbang Mastermind",
    description: "Gerbang terakhir menuju level tertinggi. Gabungkan semua kemampuanmu!",
    difficulty: "sma",
    categoryFocus: ["pola", "systems", "moral"],
    themeColor: "#FFD700",
    icon: "🚪",
    stageRange: [461, 500],
    bossStages: [480, 500],
    completionReward: "🔑 Kunci Mastermind",
    worldIntroText: "Gerbang Mastermind hanya terbuka untuk yang menguasai semua disiplin ilmu.",
    worldCompleteText: "Gerbang Mastermind terbuka! Kamu siap melangkah ke level Universitas. 🚪",
  },
];

// ══════════════════════════════════════════════
// Universitas — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const UNIVERSITAS_WORLDS: WorldDefinition[] = [
  {
    id: "univ-akademi-analisis",
    name: "Akademi Analisis",
    description: "Akademi bergengsi untuk mengasah kemampuan analisis tingkat lanjut.",
    difficulty: "universitas",
    categoryFocus: ["advanced-reasoning", "quantitative-logic"],
    themeColor: "#3F51B5",
    icon: "🏫",
    stageRange: [1, 130],
    bossStages: [50, 100, 130],
    completionReward: "🎓 Gelar Analis",
    worldIntroText: "Selamat datang di Akademi Analisis. Di sini, berpikir tajam adalah keharusan.",
    worldCompleteText: "Akademi Analisis selesai! Gelar Analis sudah di tanganmu. 🎓",
  },
  {
    id: "univ-dewan-etika",
    name: "Dewan Etika",
    description: "Dewan tertinggi yang membahas dilema etika dan kepemimpinan moral.",
    difficulty: "universitas",
    categoryFocus: ["ethical-leadership", "argument-evaluation"],
    themeColor: "#E91E63",
    icon: "⚖️",
    stageRange: [131, 250],
    bossStages: [190, 250],
    completionReward: "🛡️ Gelar Etika",
    worldIntroText: "Dewan Etika menguji integritasmu. Keputusan sulit menanti di setiap sudut.",
    worldCompleteText: "Dewan Etika terkesan dengan integritasmu! 🛡️",
  },
  {
    id: "univ-lab-sistem-kompleks",
    name: "Laboratorium Sistem Kompleks",
    description: "Laboratorium riset untuk memodelkan dan memecahkan masalah sistem berskala besar.",
    difficulty: "universitas",
    categoryFocus: ["systems-kompleks", "strategic-decision"],
    themeColor: "#009688",
    icon: "🔬",
    stageRange: [251, 370],
    bossStages: [310, 370],
    completionReward: "🔬 Gelar Peneliti",
    worldIntroText: "Sistem kompleks dunia nyata menunggumu di laboratorium ini.",
    worldCompleteText: "Laboratorium Sistem Kompleks sudah kamu selesaikan! Kamu peneliti handal. 🔬",
  },
  {
    id: "univ-forum-kepemimpinan",
    name: "Forum Kepemimpinan",
    description: "Forum elit tempat calon pemimpin diuji dalam skenario nyata.",
    difficulty: "universitas",
    categoryFocus: ["strategic-decision", "ethical-leadership"],
    themeColor: "#FF9800",
    icon: "🏛️",
    stageRange: [371, 460],
    bossStages: [420, 460],
    completionReward: "👑 Gelar Pemimpin",
    worldIntroText: "Forum Kepemimpinan mensimulasikan krisis nyata. Pimpin dengan bijak!",
    worldCompleteText: "Forum Kepemimpinan mengukuhkanmu sebagai pemimpin visioner. 👑",
  },
  {
    id: "univ-puncak-mastermind",
    name: "Puncak Mastermind",
    description: "Puncak tertinggi — ujian akhir yang menggabungkan semua disiplin ilmu.",
    difficulty: "universitas",
    categoryFocus: ["problem-solving", "advanced-reasoning"],
    themeColor: "#FFD700",
    icon: "🏔️",
    stageRange: [461, 500],
    bossStages: [480, 500],
    completionReward: "🏆 Grand Mastermind",
    worldIntroText: "Puncak Mastermind. Hanya yang terbaik yang bisa mencapai sini.",
    worldCompleteText: "PUNCAK MASTERMIND! Kamu adalah Grand Mastermind sejati! 🏆",
  },
];

// ══════════════════════════════════════════════
// Master Map
// ══════════════════════════════════════════════

export const ALL_WORLDS: WorldDefinition[] = [
  ...TK_WORLDS,
  ...SD_KECIL_WORLDS,
  ...SD_MUDA_WORLDS,
  ...SMP_WORLDS,
  ...SMA_WORLDS,
  ...UNIVERSITAS_WORLDS,
];

export const WORLDS_BY_DIFFICULTY: Record<string, WorldDefinition[]> = {
  tk: TK_WORLDS,
  "sd-bawah": SD_KECIL_WORLDS,
  "sd-atas": SD_MUDA_WORLDS,
  smp: SMP_WORLDS,
  sma: SMA_WORLDS,
  universitas: UNIVERSITAS_WORLDS,
};

export const WORLD_MAP: Record<string, WorldDefinition> = Object.fromEntries(
  ALL_WORLDS.map((w) => [w.id, w]),
);

// ══════════════════════════════════════════════
// Stage Distribution (target counts per category per difficulty)
// ══════════════════════════════════════════════

export interface StageDistribution {
  category: string;
  count: number;
  worldId: string;
}

export const STAGE_DISTRIBUTIONS: Record<string, StageDistribution[]> = {
  tk: [
    { category: "tk-adab", count: 120, worldId: "tk-taman-adab" },
    { category: "tk-pra-literasi", count: 100, worldId: "tk-kebun-angka" },
    { category: "tk-visual", count: 90, worldId: "tk-pulau-bentuk" },
    { category: "tk-pola", count: 90, worldId: "tk-rumah-pola" },
    { category: "tk-kreativitas", count: 70, worldId: "tk-galeri-warna" },
    { category: "tk-adab", count: 30, worldId: "tk-taman-adab" }, // review/boss
  ],
  "sd-bawah": [
    { category: "moral", count: 120, worldId: "sdk-taman-adab" },
    { category: "literasi-numerasi", count: 100, worldId: "sdk-kota-angka" },
    { category: "pola", count: 80, worldId: "sdk-jembatan-pola" },
    { category: "spasial", count: 50, worldId: "sdk-rumah-ingatan" },
    { category: "systems", count: 40, worldId: "sdk-rumah-ingatan" },
    { category: "moral", count: 40, worldId: "sdk-lapangan-kebaikan" },
    { category: "kreativitas", count: 40, worldId: "sdk-jembatan-pola" },
    { category: "penalaran", count: 30, worldId: "sdk-kota-angka" },
  ],
  "sd-atas": [
    { category: "literasi-numerasi", count: 90, worldId: "sdm-kota-numerasi" },
    { category: "pola", count: 75, worldId: "sdm-menara-pola" },
    { category: "spasial", count: 70, worldId: "sdm-gua-ingatan" },
    { category: "systems", count: 70, worldId: "sdm-lembah-logika" },
    { category: "moral", count: 80, worldId: "sdm-kampung-amanah" },
    { category: "kreativitas", count: 70, worldId: "sdm-menara-pola" },
    { category: "penalaran", count: 45, worldId: "sdm-lembah-logika" },
  ],
  smp: [
    { category: "systems", count: 85, worldId: "smp-benteng-logika" },
    { category: "penalaran", count: 50, worldId: "smp-benteng-logika" },
    { category: "moral", count: 85, worldId: "smp-majelis-musyawarah" },
    { category: "literasi-numerasi", count: 70, worldId: "smp-laboratorium-sistem" },
    { category: "systems", count: 45, worldId: "smp-laboratorium-sistem" },
    { category: "moral", count: 30, worldId: "smp-pasar-amanah" },
    { category: "literasi-numerasi", count: 30, worldId: "smp-pasar-amanah" },
    { category: "pola", count: 50, worldId: "smp-menara-strategi" },
    { category: "kreativitas", count: 30, worldId: "smp-majelis-musyawarah" },
    { category: "spasial", count: 25, worldId: "smp-laboratorium-sistem" },
  ],
  sma: [
    { category: "moral", count: 95, worldId: "sma-kota-kepemimpinan" },
    { category: "systems", count: 80, worldId: "sma-kota-kepemimpinan" },
    { category: "systems", count: 40, worldId: "sma-sistem-peradaban" },
    { category: "kreativitas", count: 70, worldId: "sma-dewan-musyawarah" },
    { category: "penalaran", count: 55, worldId: "sma-sistem-peradaban" },
    { category: "literasi-numerasi", count: 60, worldId: "sma-sistem-peradaban" },
    { category: "spasial", count: 30, worldId: "sma-sistem-peradaban" },
    { category: "pola", count: 40, worldId: "sma-arena-argumen" },
    { category: "spasial", count: 30, worldId: "sma-arena-argumen" },
  ],
  universitas: [
    { category: "advanced-reasoning", count: 80, worldId: "univ-akademi-analisis" },
    { category: "quantitative-logic", count: 60, worldId: "univ-akademi-analisis" },
    { category: "ethical-leadership", count: 90, worldId: "univ-dewan-etika" },
    { category: "argument-evaluation", count: 80, worldId: "univ-dewan-etika" },
    { category: "systems-kompleks", count: 90, worldId: "univ-lab-sistem-kompleks" },
    { category: "strategic-decision", count: 70, worldId: "univ-forum-kepemimpinan" },
    { category: "problem-solving", count: 30, worldId: "univ-puncak-mastermind" },
  ],
};
