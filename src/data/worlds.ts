/**
 * World Definitions for TMT — The Mastermind Trials
 *
 * 5 worlds per difficulty × 6 difficulties = 30 total worlds.
 * Each world is a VISUAL ADVENTURE SEGMENT (background decor only).
 * Categories are MIXED within each segment — background does NOT indicate content type.
 *
 * Stage range: [startStage, endStage] within that difficulty.
 * Boss stages: list of stage numbers that are boss battles within this world.
 *
 * IMPORTANT: backgroundTheme is purely for map decoration. Each segment
 * contains MIXED categories (adab, numerasi, logika, spasial, pola, etc.)
 */

import type { WorldDefinition, StageType } from "@/types";

// ══════════════════════════════════════════════
// TK — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const TK_WORLDS: WorldDefinition[] = [
  {
    id: "tk-hutan-ceria",
    name: "Hutan Ceria",
    description: "Jelajahi hutan ajaib dengan pohon-pohon senyum, bunga-bunga menari, dan kupu-kupu warna-warni!",
    difficulty: "tk",
    backgroundTheme: "forest",
    themeColor: "#FF6B8A",
    icon: "🌸",
    stageRange: [1, 120],
    bossStages: [30, 60, 90, 120],
    completionReward: "🏅 Mahkota Petualang Ceria",
    worldIntroText: "Selamat datang di Hutan Ceria! Pohon-pohon tersenyum, bunga melambai. Ayo jelajahi setiap sudutnya!",
    worldCompleteText: "Kamu sudah menyelesaikan Hutan Ceria! Petualanganmu semakin seru. 🌸",
  },
  {
    id: "tk-padang-rumput",
    name: "Padang Rumput",
    description: "Padang luas penuh hewan lucu bermain, angin sepoi-sepoi, dan pelangi di kejauhan.",
    difficulty: "tk",
    backgroundTheme: "grassland",
    themeColor: "#4CAF50",
    icon: "🍎",
    stageRange: [121, 220],
    bossStages: [160, 220],
    completionReward: "🌟 Bintang Penjelajah",
    worldIntroText: "Padang Rumput luas membentang! Angin sepoi membawa aroma segar. Ikuti jejak hewan-hewan lucu.",
    worldCompleteText: "Padang Rumput sudah kamu jelajahi! Kamu penjelajah sejati. 🍎",
  },
  {
    id: "tk-pantai-cahaya",
    name: "Pantai Cahaya",
    description: "Pantai berpasir putih dengan ombak kecil berkilau, kerang lucu, dan kapal di kejauhan.",
    difficulty: "tk",
    backgroundTheme: "beach",
    themeColor: "#2196F3",
    icon: "🔷",
    stageRange: [221, 310],
    bossStages: [270, 310],
    completionReward: "🎨 Palet Pelangi",
    worldIntroText: "Pantai Cahaya berkilau di bawah mentari! Ombak kecil menyapa kakimu. Ayo kumpulkan kerang!",
    worldCompleteText: "Pantai Cahaya sudah kamu taklukkan! Kamu semakin cerdas dan ceria. 🔷",
  },
  {
    id: "tk-rumah-misteri",
    name: "Rumah Misteri",
    description: "Rumah besar penuh ruangan ajaib dengan pintu rahasia, lampu kristal, dan tangga berputar.",
    difficulty: "tk",
    backgroundTheme: "cave",
    themeColor: "#9C27B0",
    icon: "🏠",
    stageRange: [311, 400],
    bossStages: [360, 400],
    completionReward: "🧩 Puzzle Ajaib",
    worldIntroText: "Rumah Misteri penuh kejutan di setiap ruangan! Pintu rahasia menantimu. Berani masuk?",
    worldCompleteText: "Rumah Misteri sudah selesai! Kamu pemecah misteri yang hebat. 🏠",
  },
  {
    id: "tk-lembah-pelangi",
    name: "Lembah Pelangi",
    description: "Lembah indah dengan air terjun permen, jembatan pelangi, dan balon udara warna-warni.",
    difficulty: "tk",
    backgroundTheme: "valley",
    themeColor: "#FF9800",
    icon: "🎨",
    stageRange: [401, 500],
    bossStages: [450, 500],
    completionReward: "🖼️ Lukisan Keajaiban",
    worldIntroText: "Lembah Pelangi paling indah sedunia! Air terjun permen, balon udara menari. Siap bermain?",
    worldCompleteText: "Lembah Pelangi sudah kamu jelajahi! Imajinasimu bersinar terang. 🎨",
  },
];

// ══════════════════════════════════════════════
// SD Bawah — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SD_KECIL_WORLDS: WorldDefinition[] = [
  {
    id: "sdk-taman-pelangi",
    name: "Taman Pelangi",
    description: "Taman indah dengan bunga raksasa, jamur bercahaya, dan kupu-kupu peri yang menari di udara.",
    difficulty: "sd-bawah",
    backgroundTheme: "grassland",
    themeColor: "#E91E63",
    icon: "🌟",
    stageRange: [1, 120],
    bossStages: [30, 70, 120],
    completionReward: "👑 Mahkota Pelangi",
    worldIntroText: "Taman Pelangi begitu luas dan indah! Bunga-bunga raksasa, jamur bercahaya. Ayo jelajahi!",
    worldCompleteText: "Taman Pelangi berhasil kamu selesaikan! Petualanganmu semakin berwarna. 🌟",
  },
  {
    id: "sdk-kota-penjelajah",
    name: "Kota Penjelajah",
    description: "Kota kecil yang ramai dengan toko-toko lucu, jalan berliku, dan balon udara di langit.",
    difficulty: "sd-bawah",
    backgroundTheme: "city",
    themeColor: "#4CAF50",
    icon: "🏙️",
    stageRange: [121, 250],
    bossStages: [170, 220, 250],
    completionReward: "🔢 Lencana Penjelajah",
    worldIntroText: "Kota Penjelajah ramai sekali! Toko-toko warna-warni, balon di langit. Siap berpetualang?",
    worldCompleteText: "Kota Penjelajah sudah kamu selamatkan! Kamu penjelajah kota yang hebat. 🏙️",
  },
  {
    id: "sdk-jembatan-petualang",
    name: "Jembatan Tantangan",
    description: "Jembatan megah membentang di atas sungai berkilau, menghubungkan dua tebing curam yang menakjubkan.",
    difficulty: "sd-bawah",
    backgroundTheme: "river_bridge",
    themeColor: "#9C27B0",
    icon: "🌉",
    stageRange: [251, 360],
    bossStages: [310, 360],
    completionReward: "🔍 Lensa Petualang",
    worldIntroText: "Jembatan Tantangan membentang megah! Sungai di bawah berkilau indah. Seberangi dengan berani!",
    worldCompleteText: "Jembatan Tantangan berhasil kamu lewati! Keberanianmu luar biasa. 🌉",
  },
  {
    id: "sdk-rumah-tekateki",
    name: "Rumah Teka-teki",
    description: "Rumah bertingkat aneh dengan jendela berbentuk aneh, pintu rahasia, dan lorong berliku.",
    difficulty: "sd-bawah",
    backgroundTheme: "cave",
    themeColor: "#2196F3",
    icon: "🏡",
    stageRange: [361, 450],
    bossStages: [410, 450],
    completionReward: "🧠 Piala Kejeniusan",
    worldIntroText: "Rumah Teka-teki penuh misteri! Setiap pintu membuka kejutan baru. Siapkah kamu?",
    worldCompleteText: "Rumah Teka-teki sudah kamu taklukkan! Kamu jenius sejati. 🏡",
  },
  {
    id: "sdk-lembah-fokus",
    name: "Lembah Fokus",
    description: "Lembah tenang dikelilingi pegunungan ungu, dengan sungai jernih dan pepohonan rindang.",
    difficulty: "sd-bawah",
    backgroundTheme: "valley",
    themeColor: "#FF9800",
    icon: "☀️",
    stageRange: [451, 500],
    bossStages: [470, 500],
    completionReward: "🕊️ Sayap Keberanian",
    worldIntroText: "Lembah Fokus begitu tenang dan damai. Gunung ungu menjulang di kejauhan. Fokuskan pikiranmu!",
    worldCompleteText: "Lembah Fokus selesai! Ketenangan dan fokusmu luar biasa. ☀️",
  },
];

// ══════════════════════════════════════════════
// SD Atas — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SD_MUDA_WORLDS: WorldDefinition[] = [
  {
    id: "sdm-kota-pintar",
    name: "Kota Pintar",
    description: "Kota futuristik dengan gedung kaca berkilau, taman gantung, dan kendaraan terbang di langit.",
    difficulty: "sd-atas",
    backgroundTheme: "city",
    themeColor: "#4CAF50",
    icon: "🏢",
    stageRange: [1, 120],
    bossStages: [40, 80, 120],
    completionReward: "🏆 Piala Inovator",
    worldIntroText: "Kota Pintar begitu modern! Gedung kaca menjulang, mobil terbang melintas. Jelajahi kota masa depan!",
    worldCompleteText: "Kota Pintar sudah kamu kuasai! Kamu inovator masa depan. 🏢",
  },
  {
    id: "sdm-menara-puncak",
    name: "Menara Puncak",
    description: "Menara raksasa menjulang ke awan dengan lantai-lantai penuh misteri dan pemandangan menakjubkan.",
    difficulty: "sd-atas",
    backgroundTheme: "mountain",
    themeColor: "#9C27B0",
    icon: "🗼",
    stageRange: [121, 225],
    bossStages: [180, 225],
    completionReward: "🔮 Bola Kristal Puncak",
    worldIntroText: "Menara Puncak menjulang tinggi ke langit! Setiap lantai penuh kejutan. Naik terus sampai puncak!",
    worldCompleteText: "Puncak Menara Puncak berhasil kamu capai! Pemandangan dari sini luar biasa. 🗼",
  },
  {
    id: "sdm-gua-misteri",
    name: "Gua Misteri",
    description: "Gua gelap dengan kristal bercahaya, lorong bawah tanah, dan sungai bawah tanah yang berkilau.",
    difficulty: "sd-atas",
    backgroundTheme: "cave",
    themeColor: "#607D8B",
    icon: "🕳️",
    stageRange: [226, 330],
    bossStages: [280, 330],
    completionReward: "💎 Kristal Cahaya",
    worldIntroText: "Gua Misteri berkilau dengan kristal ajaib! Setiap sudut menyimpan rahasia. Berani masuk?",
    worldCompleteText: "Gua Misteri berhasil kamu taklukkan! Kamu penakluk kegelapan. 🕳️",
  },
  {
    id: "sdm-lembah-awan",
    name: "Lembah Awan",
    description: "Lembah di atas awan dengan jembatan mengambang, air terjun langit, dan burung raksasa.",
    difficulty: "sd-atas",
    backgroundTheme: "valley",
    themeColor: "#8BC34A",
    icon: "🌄",
    stageRange: [331, 430],
    bossStages: [380, 430],
    completionReward: "⚖️ Timbangan Awan",
    worldIntroText: "Lembah Awan mengambang di atas langit! Jembatan awan, air terjun dari langit. Siap terbang?",
    worldCompleteText: "Lembah Awan selesai! Kamu menjelajah sampai ke langit. 🌄",
  },
  {
    id: "sdm-kampung-damai",
    name: "Kampung Damai",
    description: "Kampung tenang di tepi danau dengan rumah-rumah kayu, perahu kecil, dan pepohonan rindang.",
    difficulty: "sd-atas",
    backgroundTheme: "beach",
    themeColor: "#FF5722",
    icon: "🏘️",
    stageRange: [431, 500],
    bossStages: [460, 500],
    completionReward: "🛡️ Perisai Damai",
    worldIntroText: "Kampung Damai di tepi danau begitu tenang. Perahu kecil mengapung, burung bernyanyi. Damai sekali!",
    worldCompleteText: "Kampung Damai bangga padamu! Kedamaian selalu bersamamu. 🏘️",
  },
];

// ══════════════════════════════════════════════
// SMP — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SMP_WORLDS: WorldDefinition[] = [
  {
    id: "smp-benteng-kokoh",
    name: "Benteng Kokoh",
    description: "Benteng batu raksasa dengan menara penjaga, parit dalam, dan jembatan angkat yang megah.",
    difficulty: "smp",
    backgroundTheme: "mountain",
    themeColor: "#607D8B",
    icon: "🏰",
    stageRange: [1, 120],
    bossStages: [50, 100, 120],
    completionReward: "🗝️ Kunci Benteng",
    worldIntroText: "Benteng Kokoh berdiri megah di atas bukit! Menara tinggi, parit dalam. Masuki gerbangnya!",
    worldCompleteText: "Benteng Kokoh berhasil kamu taklukkan! Kamu ksatria pemberani. 🏰",
  },
  {
    id: "smp-markas-strategi",
    name: "Markas Strategi",
    description: "Markas rahasia di balik air terjun dengan ruang pertemuan hologram dan peta digital.",
    difficulty: "smp",
    backgroundTheme: "river_bridge",
    themeColor: "#E91E63",
    icon: "🏛️",
    stageRange: [121, 240],
    bossStages: [180, 240],
    completionReward: "🎤 Podium Visioner",
    worldIntroText: "Markas Strategi tersembunyi di balik air terjun! Hologram menyala, peta berputar. Siap memimpin?",
    worldCompleteText: "Markas Strategi mengakui kebijaksanaanmu! Kamu visioner sejati. 🏛️",
  },
  {
    id: "smp-lab-sains",
    name: "Lab Sains",
    description: "Laboratorium futuristik dengan tabung reaksi bercahaya, robot pembantu, dan layar hologram.",
    difficulty: "smp",
    backgroundTheme: "city",
    themeColor: "#2196F3",
    icon: "🔬",
    stageRange: [241, 350],
    bossStages: [300, 350],
    completionReward: "⚗️ Lab Master",
    worldIntroText: "Lab Sains penuh teknologi canggih! Robot melayang, formula menari di udara. Saatnya eksperimen!",
    worldCompleteText: "Lab Sains selesai! Kamu ilmuwan masa depan. 🔬",
  },
  {
    id: "smp-pasar-ramai",
    name: "Pasar Ramai",
    description: "Pasar tradisional ramai dengan pedagang dari seluruh negeri, tenda warna-warni, dan musik riang.",
    difficulty: "smp",
    backgroundTheme: "grassland",
    themeColor: "#FF9800",
    icon: "🏪",
    stageRange: [351, 450],
    bossStages: [400, 450],
    completionReward: "⚖️ Neraca Amanah",
    worldIntroText: "Pasar Ramai penuh warna! Pedagang dari seluruh negeri, musik dan tawa. Mari berdagang!",
    worldCompleteText: "Pasar Ramai selesai! Kamu pedagang terpercaya seantero negeri. 🏪",
  },
  {
    id: "smp-menara-petualang",
    name: "Menara Petualang",
    description: "Menara tertinggi di dunia dengan tangga spiral tak berujung dan pemandangan seluruh kerajaan.",
    difficulty: "smp",
    backgroundTheme: "mountain",
    themeColor: "#9C27B0",
    icon: "🗼",
    stageRange: [451, 500],
    bossStages: [470, 500],
    completionReward: "♟️ Catur Petualang",
    worldIntroText: "Menara Petualang menjulang sampai langit ketujuh! Tangga spiral tak berujung. Berani ke puncak?",
    worldCompleteText: "Puncak Menara Petualang berhasil kamu capai! Seluruh dunia di bawah kakimu. 🗼",
  },
];

// ══════════════════════════════════════════════
// SMA — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const SMA_WORLDS: WorldDefinition[] = [
  {
    id: "sma-kota-modern",
    name: "Kota Modern",
    description: "Metropolis canggih dengan kereta terbang, taman di atap gedung, dan lampu neon sepanjang jalan.",
    difficulty: "sma",
    backgroundTheme: "city",
    themeColor: "#E91E63",
    icon: "🌆",
    stageRange: [1, 130],
    bossStages: [50, 100, 130],
    completionReward: "👑 Mahkota Visioner",
    worldIntroText: "Kota Modern tidak pernah tidur! Kereta terbang melintas, lampu neon menari. Pimpin kota ini!",
    worldCompleteText: "Kota Modern makmur di bawah visimu. Kamu pemimpin masa depan! 👑",
  },
  {
    id: "sma-dewan-pertemuan",
    name: "Dewan Pertemuan",
    description: "Aula marmer megah dengan pilar raksasa, lampu kristal, dan meja bundar tempat para pemikir berkumpul.",
    difficulty: "sma",
    backgroundTheme: "valley",
    themeColor: "#FF5722",
    icon: "🏛️",
    stageRange: [131, 250],
    bossStages: [190, 250],
    completionReward: "🎙️ Mimbar Kebijaksanaan",
    worldIntroText: "Dewan Pertemuan begitu megah! Pilar marmer, lampu kristal. Suaramu bisa mengubah dunia.",
    worldCompleteText: "Dewan Pertemuan mengakui kebijaksanaanmu! Kata-katamu menginspirasi. 🏛️",
  },
  {
    id: "sma-sistem-kota",
    name: "Sistem Kota",
    description: "Kota simulasi raksasa dengan distrik-distrik unik, jaringan transportasi, dan ekosistem digital.",
    difficulty: "sma",
    backgroundTheme: "city",
    themeColor: "#2196F3",
    icon: "🏗️",
    stageRange: [251, 370],
    bossStages: [310, 370],
    completionReward: "🏗️ Arsitek Kota",
    worldIntroText: "Bangun kota impianmu! Setiap distrik, jembatan, dan taman adalah karyamu.",
    worldCompleteText: "Kotamu berdiri kokoh! Kamu arsitek peradaban yang brilian. 🏗️",
  },
  {
    id: "sma-arena-pengetahuan",
    name: "Arena Pengetahuan",
    description: "Arena kolosal dengan penonton dari seluruh dunia, panggung debat, dan layar raksasa.",
    difficulty: "sma",
    backgroundTheme: "mountain",
    themeColor: "#F44336",
    icon: "🏟️",
    stageRange: [371, 460],
    bossStages: [420, 460],
    completionReward: "⚔️ Pedang Kebenaran",
    worldIntroText: "Arena Pengetahuan bergemuruh! Penonton bersorak. Buktikan argumenmu di sini!",
    worldCompleteText: "Arena Pengetahuan sudah kamu menangkan! Kamu juara debat sejati. 🏟️",
  },
  {
    id: "sma-gerbang-utama",
    name: "Gerbang Utama",
    description: "Gerbang emas raksasa di puncak gunung tertinggi, dijaga dua patung singa bersayap.",
    difficulty: "sma",
    backgroundTheme: "mountain",
    themeColor: "#FFD700",
    icon: "🚪",
    stageRange: [461, 500],
    bossStages: [480, 500],
    completionReward: "🔑 Kunci Mastermind",
    worldIntroText: "Gerbang Utama berkilau emas di puncak! Singa bersayap menjaganya. Buktikan dirimu layak!",
    worldCompleteText: "Gerbang Utama terbuka!Level Universitas menantimu. 🚪",
  },
];

// ══════════════════════════════════════════════
// Universitas — 5 Worlds, 500 stages total
// ══════════════════════════════════════════════

export const UNIVERSITAS_WORLDS: WorldDefinition[] = [
  {
    id: "univ-akademi-puncak",
    name: "Akademi Puncak",
    description: "Akademi megah di atas awan dengan perpustakaan tak terbatas dan ruang kuliah holografik.",
    difficulty: "universitas",
    backgroundTheme: "valley",
    themeColor: "#3F51B5",
    icon: "🏫",
    stageRange: [1, 130],
    bossStages: [50, 100, 130],
    completionReward: "🎓 Gelar Analis",
    worldIntroText: "Akademi Puncak melayang di atas awan! Perpustakaan seluas samudera menantimu.",
    worldCompleteText: "Akademi Puncak selesai! Gelar Analis sudah di tanganmu. 🎓",
  },
  {
    id: "univ-dewan-cendekia",
    name: "Dewan Cendekia",
    description: "Ruang dewan melingkar dengan 12 kursi bijak, dinding kaca menghadap galaksi, dan obor kebijaksanaan.",
    difficulty: "universitas",
    backgroundTheme: "river_bridge",
    themeColor: "#E91E63",
    icon: "⚖️",
    stageRange: [131, 250],
    bossStages: [190, 250],
    completionReward: "🛡️ Gelar Etika",
    worldIntroText: "Dewan Cendekia mengelilingi obor kebijaksanaan. 12 kursi bijak menunggumu.",
    worldCompleteText: "Dewan Cendekia terkesan dengan integritasmu! Kamu bijak di antara para bijak. 🛡️",
  },
  {
    id: "univ-pusat-riset",
    name: "Lab Sains Kompleks",
    description: "Laboratorium raksasa dengan akselerator partikel mini, superkomputer kuantum, dan taman botani alien.",
    difficulty: "universitas",
    backgroundTheme: "city",
    themeColor: "#009688",
    icon: "🔬",
    stageRange: [251, 370],
    bossStages: [310, 370],
    completionReward: "🔬 Gelar Peneliti",
    worldIntroText: "Lab Sains Kompleks adalah jantung inovasi! Teknologi masa depan ada di sini.",
    worldCompleteText: "Lab Sains Kompleks sudah kamu selesaikan! Kamu peneliti kelas dunia. 🔬",
  },
  {
    id: "univ-forum-elit",
    name: "Forum Elit",
    description: "Forum eksklusif di puncak menara kaca dengan pemimpin dunia hadir sebagai hologram.",
    difficulty: "universitas",
    backgroundTheme: "mountain",
    themeColor: "#FF9800",
    icon: "🏛️",
    stageRange: [371, 460],
    bossStages: [420, 460],
    completionReward: "👑 Gelar Pemimpin",
    worldIntroText: "Forum Elit di puncak menara kaca! Pemimpin dunia hadir sebagai hologram. Pimpin mereka!",
    worldCompleteText: "Forum Elit mengukuhkanmu sebagai pemimpin visioner yang diakui dunia. 👑",
  },
  {
    id: "univ-puncak-mastermind",
    name: "Puncak Mastermind",
    description: "Puncak tertinggi alam semesta — singgasana kristal di atas bintang, dikelilingi nebula berwarna.",
    difficulty: "universitas",
    backgroundTheme: "mountain",
    themeColor: "#FFD700",
    icon: "🏔️",
    stageRange: [461, 500],
    bossStages: [480, 500],
    completionReward: "🏆 Grand Mastermind",
    worldIntroText: "Puncak Mastermind di atas bintang! Singgasana kristal menunggumu. Ini ujian terakhir!",
    worldCompleteText: "PUNCAK MASTERMIND! Kamu adalah Grand Mastermind sejati! Alam semesta mengakuimu! 🏆",
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
  count: number;
  worldId: string;
}

export const STAGE_DISTRIBUTIONS: Record<string, StageDistribution[]> = {
  tk: [
    { count: 120, worldId: "tk-hutan-ceria" },
    { count: 100, worldId: "tk-padang-rumput" },
    { count: 90, worldId: "tk-pantai-cahaya" },
    { count: 90, worldId: "tk-rumah-misteri" },
    { count: 70, worldId: "tk-lembah-pelangi" },
    { count: 30, worldId: "tk-hutan-ceria" }, // review/boss
  ],
  "sd-bawah": [
    { count: 120, worldId: "sdk-taman-pelangi" },
    { count: 100, worldId: "sdk-kota-penjelajah" },
    { count: 80, worldId: "sdk-jembatan-petualang" },
    { count: 50, worldId: "sdk-rumah-tekateki" },
    { count: 40, worldId: "sdk-rumah-tekateki" },
    { count: 40, worldId: "sdk-lembah-fokus" },
    { count: 40, worldId: "sdk-jembatan-petualang" },
    { count: 30, worldId: "sdk-kota-penjelajah" },
  ],
  "sd-atas": [
    { count: 90, worldId: "sdm-kota-pintar" },
    { count: 75, worldId: "sdm-menara-puncak" },
    { count: 70, worldId: "sdm-gua-misteri" },
    { count: 70, worldId: "sdm-lembah-awan" },
    { count: 80, worldId: "sdm-kampung-damai" },
    { count: 70, worldId: "sdm-menara-puncak" },
    { count: 45, worldId: "sdm-lembah-awan" },
  ],
  smp: [
    { count: 85, worldId: "smp-benteng-kokoh" },
    { count: 50, worldId: "smp-benteng-kokoh" },
    { count: 85, worldId: "smp-markas-strategi" },
    { count: 70, worldId: "smp-lab-sains" },
    { count: 45, worldId: "smp-lab-sains" },
    { count: 30, worldId: "smp-pasar-ramai" },
    { count: 30, worldId: "smp-pasar-ramai" },
    { count: 50, worldId: "smp-menara-petualang" },
    { count: 30, worldId: "smp-markas-strategi" },
    { count: 25, worldId: "smp-lab-sains" },
  ],
  sma: [
    { count: 95, worldId: "sma-kota-modern" },
    { count: 80, worldId: "sma-kota-modern" },
    { count: 40, worldId: "sma-sistem-kota" },
    { count: 70, worldId: "sma-dewan-pertemuan" },
    { count: 55, worldId: "sma-sistem-kota" },
    { count: 60, worldId: "sma-sistem-kota" },
    { count: 30, worldId: "sma-sistem-kota" },
    { count: 40, worldId: "sma-arena-pengetahuan" },
    { count: 30, worldId: "sma-arena-pengetahuan" },
  ],
  universitas: [
    { count: 80, worldId: "univ-akademi-puncak" },
    { count: 60, worldId: "univ-akademi-puncak" },
    { count: 90, worldId: "univ-dewan-cendekia" },
    { count: 80, worldId: "univ-dewan-cendekia" },
    { count: 90, worldId: "univ-pusat-riset" },
    { count: 70, worldId: "univ-forum-elit" },
    { count: 30, worldId: "univ-puncak-mastermind" },
  ],
};
