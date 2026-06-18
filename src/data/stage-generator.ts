/**
 * Stage Generator — produces 500 valid, playable stages per difficulty
 *
 * Uses parametrized templates that are randomized at generation time
 * but produce deterministic, validatable output.
 *
 * Total: 3000 stages (500 × 6 difficulties)
 */

import type { Stage, MissionOption, CategoryId, DifficultyId, MissionType, StageType } from "@/types";
import { STAGE_DISTRIBUTIONS, WORLDS_BY_DIFFICULTY } from "./worlds";

// ════════════════════════════════════════════════════════
// Template Types
// ════════════════════════════════════════════════════════

interface StageTemplate {
  titleTemplate: string;
  storyTemplate: string;
  instructionTemplate: string;
  choices: string[];
  correctIdx: number;
  acceptableIdx?: number;
  explanationTemplate: string;
  hints: string[];
  basePoint: number;
  xpReward: number;
  estimatedTime: number;
  tags: string[];
  missionType: MissionType;
  adabFeedbackTemplate?: string;
}

// ════════════════════════════════════════════════════════
// Parameter Generator Utilities
// ════════════════════════════════════════════════════════

function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ════════════════════════════════════════════════════════
// Template Banks per Category
// ════════════════════════════════════════════════════════

const NAMES = ["Ali", "Budi", "Cici", "Dewi", "Eko", "Fira", "Gilang", "Hana", "Ida", "Joko", "Kiki", "Lia", "Maya", "Nino", "Oki", "Putri", "Qori", "Rani", "Sita", "Tomi", "Umi", "Vino", "Wati", "Yudi"];

const FRUITS = ["apel", "jeruk", "mangga", "pisang", "anggur", "semangka", "melon", "pepaya", "nanas", "stroberi"];
const ANIMALS = ["kucing", "kelinci", "burung", "ikan", "ayam", "bebek", "kambing", "sapi", "kuda", "domba"];

// ─── TK ADAB ───
const TK_ADAB_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Berkata Jujur", storyTemplate: "{name} tidak sengaja memecahkan gelas. Tidak ada yang melihat.", instructionTemplate: "Apa yang sebaiknya dilakukan {name}?", choices: ["Diam saja, tidak ada yang tahu", "Jujur bilang ke Ibu", "Sembunyikan pecahannya"], correctIdx: 1, explanationTemplate: "Jujur itu hebat! Meskipun tidak ada yang melihat, Allah Maha Melihat. Ibu pasti bangga.", hints: ["Allah Maha Melihat."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "jujur"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Jujur menyelamatkan. 🤲" },
  { titleTemplate: "Hormat Orang Tua", storyTemplate: "Ibu {name} pulang membawa belanjaan yang berat.", instructionTemplate: "Apa yang sebaiknya dilakukan {name}?", choices: ["Pura-pura tidur", "Bantu bawakan belanjaan", "Lanjut bermain saja"], correctIdx: 1, explanationTemplate: "Membantu orang tua adalah perbuatan mulia. Surga di telapak kaki Ibu.", hints: ["Ibu pasti lelah."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "hormat"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Hormati orang tuamu. 💝" },
  { titleTemplate: "Berbagi Itu Indah", storyTemplate: "{name} punya {count} permen. Temannya tidak bawa bekal.", instructionTemplate: "Apa yang sebaiknya dilakukan?", choices: ["Makan sendiri semua", "Tawarkan berbagi dengan teman", "Sembunyikan permennya"], correctIdx: 1, explanationTemplate: "Berbagi membuat hati senang dan teman jadi bahagia.", hints: ["Temanmu lapar."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "berbagi"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Berbagi itu indah. 🍬" },
  { titleTemplate: "Maaf dan Memaafkan", storyTemplate: "Teman {name} tidak sengaja menyenggolnya saat bermain.", instructionTemplate: "Apa yang diucapkan {name}?", choices: ["Marah dan mendorong balik", "Berkata 'Tidak apa-apa, maafkan ya'", "Diam saja dan pergi"], correctIdx: 1, explanationTemplate: "Memaafkan itu mulia. Allah menyukai orang yang pemaaf.", hints: ["Allah suka pemaaf."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "maaf"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Jadilah pemaaf. 🌸" },
  { titleTemplate: "Baca Doa", storyTemplate: "{name} mau mulai belajar.", instructionTemplate: "Apa yang sebaiknya dibaca?", choices: ["Langsung saja", "Bismillah", "Tidak usah baca apa-apa"], correctIdx: 1, explanationTemplate: "Bismillah sebelum mulai, berkah! Setiap kebaikan dimulai dengan nama Allah.", hints: ["Dengan nama Allah."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "doa"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Bismillah pembawa berkah. ✨" },
  { titleTemplate: "Bersih Itu Iman", storyTemplate: "Kamar {name} berantakan setelah bermain.", instructionTemplate: "Apa yang sebaiknya dilakukan?", choices: ["Biarkan saja", "Rapikan kembali mainannya", "Minta orang lain merapikan"], correctIdx: 1, explanationTemplate: "Kebersihan sebagian dari iman. Allah menyukai kebersihan.", hints: ["Mainan harus dirapikan."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "bersih"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Kebersihan itu iman. 🧹" },
  { titleTemplate: "Senyum Itu Sedekah", storyTemplate: "{name} bertemu temannya di pagi hari.", instructionTemplate: "Apa yang sebaiknya dilakukan?", choices: ["Diam saja", "Senyum dan menyapa", "Pura-pura sibuk"], correctIdx: 1, explanationTemplate: "Senyum adalah sedekah paling ringan. Membuat orang lain bahagia.", hints: ["Rasulullah selalu tersenyum."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "senyum"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Senyummu sedekah. 😊" },
  { titleTemplate: "Terima Kasih", storyTemplate: "Teman memberi {name} hadiah kecil.", instructionTemplate: "Apa yang diucapkan {name}?", choices: ["Diam saja", "Terima kasih!", "Hadiahnya kurang bagus"], correctIdx: 1, explanationTemplate: "Mengucapkan terima kasih adalah tanda syukur dan sopan santun.", hints: ["Ucapan yang sopan."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "sopan"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Terima kasih itu sopan. 🙏" },
  { titleTemplate: "Antri", storyTemplate: "Di depan {name} ada antrian cuci tangan.", instructionTemplate: "Apa yang sebaiknya dilakukan?", choices: ["Menyerobot ke depan", "Antri dengan sabar di belakang", "Tidak jadi cuci tangan"], correctIdx: 1, explanationTemplate: "Mengantri adalah sikap disiplin. Allah menyukai kedisiplinan.", hints: ["Tunggu giliranmu."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "disiplin"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Antri itu disiplin. ✨" },
  { titleTemplate: "Mendoakan", storyTemplate: "Teman {name} sedang sakit.", instructionTemplate: "Apa yang bisa dilakukan?", choices: ["Diam saja", "Mendoakan 'Syafakillah, semoga cepat sembuh'", "Menjauh karena takut ketularan"], correctIdx: 1, explanationTemplate: "Mendoakan orang sakit adalah sunnah. Sesama muslim saling mendoakan.", hints: ["Doa untuk yang sakit."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["adab", "doa"], missionType: "tk_adab_basic", adabFeedbackTemplate: "Doa adalah obat. 🤲" },
];

// ─── TK Pra-Literasi ───
const TK_PRELIT_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Hitung {object}", storyTemplate: "{emoji}".repeat(5), instructionTemplate: "Ada berapa {object}?", choices: ["4", "5", "6"], correctIdx: 1, explanationTemplate: "Ada 5 {object}. Hitung satu per satu ya!", hints: ["Hitung satu-satu."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["berhitung"], missionType: "tk_counting" },
  { titleTemplate: "Nama {object}", storyTemplate: "Hewan berkaki 4, suaranya meong.", instructionTemplate: "Ini hewan apa?", choices: ["Anjing", "Kucing", "Ayam"], correctIdx: 1, explanationTemplate: "Kucing berkaki 4 dan bersuara meong.", hints: ["Hewan berbulu lucu."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["mengenal"], missionType: "tk_pre_literacy" },
  { titleTemplate: "Warna Buah", storyTemplate: "Buah warna {color}, bulat, manis.", instructionTemplate: "Buah apa?", choices: ["Jeruk", "Apel", "Pisang"], correctIdx: 1, explanationTemplate: "Apel berwarna merah, bulat, dan manis.", hints: ["Buah merah di pohon."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["mengenal"], missionType: "tk_pre_literacy" },
  { titleTemplate: "Hitung Mainan", storyTemplate: "🧸🧸🧸🧸", instructionTemplate: "{name} punya berapa boneka?", choices: ["3", "4", "5"], correctIdx: 1, explanationTemplate: "Ada 4 boneka beruang. Ayo hitung lagi!", hints: ["Hitung gambarnya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["berhitung"], missionType: "tk_counting" },
  { titleTemplate: "Besar atau Kecil", storyTemplate: "🐘 dan 🐭", instructionTemplate: "Mana yang lebih kecil?", choices: ["Gajah", "Tikus", "Sama besar"], correctIdx: 1, explanationTemplate: "Tikus lebih kecil dibandingkan gajah.", hints: ["Yang badannya kecil."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["membandingkan"], missionType: "tk_pre_literacy" },
  { titleTemplate: "Suara Hewan", storyTemplate: "Hewan bersuara 'kukuruyuk' di pagi hari.", instructionTemplate: "Hewan apa?", choices: ["Bebek", "Ayam", "Burung"], correctIdx: 1, explanationTemplate: "Ayam jantan berkokok 'kukuruyuk' di pagi hari.", hints: ["Hewan yang berkokok."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["mengenal"], missionType: "tk_pre_literacy" },
  { titleTemplate: "Hitung {object}", storyTemplate: "🍎🍎🍎", instructionTemplate: "Ada berapa apel?", choices: ["2", "3", "4"], correctIdx: 1, explanationTemplate: "Ada 3 apel. Bagus!", hints: ["Hitung satu-satu."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["berhitung"], missionType: "tk_counting" },
  { titleTemplate: "Anggota Badan", storyTemplate: "Kita menggunakan ini untuk melihat.", instructionTemplate: "Anggota tubuh apa?", choices: ["Telinga", "Mata", "Hidung"], correctIdx: 1, explanationTemplate: "Mata digunakan untuk melihat dunia yang indah.", hints: ["Yang ada di wajah."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["mengenal"], missionType: "tk_pre_literacy" },
  { titleTemplate: "Alat Makan", storyTemplate: "{name} mau makan sup.", instructionTemplate: "Alat apa yang digunakan?", choices: ["Garpu", "Sendok", "Pisau"], correctIdx: 1, explanationTemplate: "Sendok cocok untuk makan sup karena bentuknya cekung.", hints: ["Bentuknya cekung."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["mengenal"], missionType: "tk_pre_literacy" },
  { titleTemplate: "Hitung Hewan", storyTemplate: "🐱🐱🐱🐱🐱", instructionTemplate: "{name} lihat berapa kucing?", choices: ["4", "5", "6"], correctIdx: 1, explanationTemplate: "Ada 5 kucing. Pintar!", hints: ["Hitung kucingnya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["berhitung"], missionType: "tk_counting" },
];

// ─── TK Visual ───
const TK_VISUAL_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Besar Kecil", storyTemplate: "🐘 Gajah dan 🐭 Tikus", instructionTemplate: "Mana yang lebih besar?", choices: ["🐘 Gajah", "🐭 Tikus", "Sama besar"], correctIdx: 0, explanationTemplate: "Gajah lebih besar. Bandingkan ukurannya!", hints: ["Yang badannya besar."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["membandingkan"], missionType: "tk_visual_match" },
  { titleTemplate: "Panjang Pendek", storyTemplate: "📏 Penggaris dan ✏️ Pensil", instructionTemplate: "Mana yang lebih panjang?", choices: ["📏 Penggaris", "✏️ Pensil", "Sama panjang"], correctIdx: 0, explanationTemplate: "Penggaris lebih panjang dari pensil.", hints: ["Bandingkan panjangnya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["membandingkan"], missionType: "tk_visual_match" },
  { titleTemplate: "Atas Bawah", storyTemplate: "🐦 Burung di langit, 🐟 Ikan di air.", instructionTemplate: "Siapa yang di atas?", choices: ["🐦 Burung", "🐟 Ikan", "Keduanya"], correctIdx: 0, explanationTemplate: "Burung terbang di atas (langit), ikan berenang di bawah (air).", hints: ["Yang bisa terbang."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["posisi"], missionType: "tk_visual_match" },
  { titleTemplate: "Warna Sama", storyTemplate: "🔴🍎🟢🥒🔴", instructionTemplate: "Mana yang warnanya sama dengan apel?", choices: ["🟢", "🔴", "🔵"], correctIdx: 1, explanationTemplate: "Apel dan lingkaran merah sama-sama berwarna merah.", hints: ["Cari warna merah."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["warna"], missionType: "tk_visual_match" },
  { titleTemplate: "Bentuk Bangun", storyTemplate: "⬜ Persegi, ⚪ Bulat, 🔺 Segitiga", instructionTemplate: "Mana yang berbentuk segitiga?", choices: ["⬜", "⚪", "🔺"], correctIdx: 2, explanationTemplate: "🔺 adalah segitiga, punya 3 sisi.", hints: ["Punya 3 sisi."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["bentuk"], missionType: "tk_visual_match" },
  { titleTemplate: "Banyak atau Sedikit", storyTemplate: "🌸🌸 vs 🌸🌸🌸🌸🌸", instructionTemplate: "Mana yang lebih banyak?", choices: ["Kiri (2)", "Kanan (5)", "Sama"], correctIdx: 1, explanationTemplate: "5 bunga lebih banyak dari 2 bunga.", hints: ["Hitung jumlahnya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["membandingkan"], missionType: "tk_visual_match" },
  { titleTemplate: "Dalam Luar", storyTemplate: "📦 Kotak dengan 🧸 boneka di dalamnya.", instructionTemplate: "Di mana bonekanya?", choices: ["Di luar kotak", "Di dalam kotak", "Di samping kotak"], correctIdx: 1, explanationTemplate: "Boneka ada di dalam kotak 📦.", hints: ["Lihat posisinya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["posisi"], missionType: "tk_visual_match" },
  { titleTemplate: "Tinggi Rendah", storyTemplate: "🦒 Jerapah dan 🐧 Penguin", instructionTemplate: "Mana yang lebih tinggi?", choices: ["🦒 Jerapah", "🐧 Penguin", "Sama tinggi"], correctIdx: 0, explanationTemplate: "Jerapah lebih tinggi dari penguin.", hints: ["Yang lehernya panjang."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["membandingkan"], missionType: "tk_visual_match" },
  { titleTemplate: "Bayangan", storyTemplate: "🌳 Pohon di siang hari.", instructionTemplate: "Di mana bayangannya?", choices: ["Di atas pohon", "Di bawah pohon", "Tidak ada bayangan"], correctIdx: 1, explanationTemplate: "Bayangan jatuh di tanah, di bawah pohon.", hints: ["Cahaya dari atas."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["posisi"], missionType: "tk_visual_match" },
  { titleTemplate: "Pola Warna", storyTemplate: "🔴🟢🔴🟢🔴 ?", instructionTemplate: "Warna apa selanjutnya?", choices: ["🔴", "🟢", "🔵"], correctIdx: 1, explanationTemplate: "Polanya merah-hijau bergantian. Setelah merah, hijau.", hints: ["Dua warna bergantian."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola"], missionType: "tk_visual_match" },
];

// ─── TK Pola ───
const TK_POLA_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Pola Warna", storyTemplate: "🔴🟡🔴🟡🔴 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🔴", "🟡", "🟢"], correctIdx: 1, explanationTemplate: "Merah-Kuning bergantian. Setelah merah, kuning.", hints: ["Lihat polanya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-warna"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Bentuk", storyTemplate: "⬜🔺⬜🔺⬜ ?", instructionTemplate: "Apa selanjutnya?", choices: ["⬜", "🔺", "⚪"], correctIdx: 1, explanationTemplate: "Kotak-Segitiga bergantian. Setelah kotak, segitiga.", hints: ["Dua bentuk."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-bentuk"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Hewan", storyTemplate: "🐱🐶🐱🐶🐱 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🐱", "🐶", "🐰"], correctIdx: 1, explanationTemplate: "Kucing-Anjing bergantian. Setelah kucing, anjing.", hints: ["Dua hewan."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-hewan"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola ABC", storyTemplate: "🔴🔵🟢🔴🔵🟢🔴 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🔴", "🔵", "🟢"], correctIdx: 1, explanationTemplate: "Siklus 3 warna: Merah-Biru-Hijau. Setelah merah, biru.", hints: ["Tiga berulang."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-abc"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Buah", storyTemplate: "🍎🍌🍎🍌🍎 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🍎", "🍌", "🍇"], correctIdx: 1, explanationTemplate: "Apel-Pisang bergantian. Setelah apel, pisang.", hints: ["Dua buah."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-buah"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Musim", storyTemplate: "☀️🌧️☀️🌧️☀️ ?", instructionTemplate: "Apa selanjutnya?", choices: ["☀️", "🌧️", "❄️"], correctIdx: 1, explanationTemplate: "Cerah-Hujan bergantian. Setelah cerah, hujan.", hints: ["Dua musim."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-musim"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola ABB", storyTemplate: "⭐🌈🌈⭐🌈🌈⭐ ?", instructionTemplate: "Apa selanjutnya?", choices: ["⭐", "🌈", "☀️"], correctIdx: 1, explanationTemplate: "Pola: bintang-pelangi-pelangi. Setelah bintang, pelangi.", hints: ["Lihat pengulangannya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-abb"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Angka", storyTemplate: "1️⃣2️⃣1️⃣2️⃣1️⃣ ?", instructionTemplate: "Apa selanjutnya?", choices: ["1️⃣", "2️⃣", "3️⃣"], correctIdx: 1, explanationTemplate: "1-2 bergantian. Setelah 1, pasti 2.", hints: ["Dua angka."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-angka"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Bunga", storyTemplate: "🌸🌻🌸🌻🌸 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🌸", "🌻", "🌹"], correctIdx: 1, explanationTemplate: "Bunga pink-kuning bergantian. Setelah pink, kuning.", hints: ["Dua bunga."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-bunga"], missionType: "tk_pattern_simple" },
  { titleTemplate: "Pola Kendaraan", storyTemplate: "🚗🚌🚗🚌🚗 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🚗", "🚌", "✈️"], correctIdx: 1, explanationTemplate: "Mobil-Bus bergantian. Setelah mobil, bus.", hints: ["Dua kendaraan."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["pola-kendaraan"], missionType: "tk_pattern_simple" },
];

// ─── TK Kreativitas ───
const TK_KREATIVITAS_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Kotak Pensil", storyTemplate: "Kaleng bekas susu yang sudah dicuci.", instructionTemplate: "Bisa dijadikan apa?", choices: ["Tempat pensil yang dihias", "Dibuang saja", "Disimpan di gudang"], correctIdx: 0, explanationTemplate: "Hias kaleng dengan kertas warna-warni, jadi tempat pensil cantik!", hints: ["Warnai dan hias."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["kreatif"], missionType: "tk_creativity_simple" },
  { titleTemplate: "Boneka Tangan", storyTemplate: "Kaus kaki bekas yang sudah dicuci bersih.", instructionTemplate: "Bisa dijadikan apa?", choices: ["Boneka tangan lucu", "Dibuang", "Disimpan saja"], correctIdx: 0, explanationTemplate: "Gambar mata dan mulut di kaus kaki, jadi boneka tangan!", hints: ["Kaus kaki + spidol."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["kreatif"], missionType: "tk_creativity_simple" },
  { titleTemplate: "Topeng Hewan", storyTemplate: "Piring kertas bekas.", instructionTemplate: "Bisa dijadikan apa?", choices: ["Topeng hewan", "Dibuang", "Piring biasa saja"], correctIdx: 0, explanationTemplate: "Lubangi mata, gambar wajah hewan, beri karet — jadi topeng!", hints: ["Lubangi + gambar."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["kreatif"], missionType: "tk_creativity_simple" },
  { titleTemplate: "Gambar Awan", storyTemplate: "{name} melihat awan berbentuk unik.", instructionTemplate: "Awan itu mirip apa?", choices: ["Bentuk domba tidur", "Tidak mirip apa-apa", "Hanya awan biasa"], correctIdx: 0, explanationTemplate: "Imajinasi kita bisa melihat bentuk-bentuk lucu di awan!", hints: ["Bayangkan bentuknya."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["imajinasi"], missionType: "tk_creativity_simple" },
  { titleTemplate: "Kerajinan Daun", storyTemplate: "Daun kering berwarna-warni di halaman.", instructionTemplate: "Bisa dijadikan apa?", choices: ["Kolase gambar hewan", "Dibuang saja", "Dibiarkan berserakan"], correctIdx: 0, explanationTemplate: "Tempelkan daun kering di kertas membentuk gambar hewan!", hints: ["Tempel dan susun."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["kreatif"], missionType: "tk_creativity_simple" },
  { titleTemplate: "Botol Musik", storyTemplate: "Botol plastik kosong.", instructionTemplate: "Bisa dijadikan apa?", choices: ["Alat musik Marakas", "Dibuang", "Disimpan tanpa guna"], correctIdx: 0, explanationTemplate: "Isi botol dengan beras atau kacang, jadi marakas yang seru!", hints: ["Isi dengan sesuatu."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["kreatif"], missionType: "tk_creativity_simple" },
  { titleTemplate: "Cerita Gambar", storyTemplate: "{name} punya 3 gambar: 🌞, 🏠, 👨‍👩‍👧.", instructionTemplate: "Ini cerita tentang?", choices: ["Keluarga di rumah saat siang", "Tidak ada ceritanya", "Hanya gambar biasa"], correctIdx: 0, explanationTemplate: "Gambar bisa bercerita: keluarga bahagia di rumah saat siang hari.", hints: ["Lihat semua gambar."], basePoint: 40, xpReward: 20, estimatedTime: 60, tags: ["imajinasi"], missionType: "tk_creativity_simple" },
];

// ─── LITERASI NUMERASI ───
const LITERASI_NUMERASI_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Jumlah Benda", storyTemplate: "Di kelas {name}, ada {a} meja dan {b} kursi.", instructionTemplate: "Total meja dan kursi?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "{a} + {b} = {right}. Tinggal jumlahkan!", hints: ["Jumlahkan kedua angka."], basePoint: 50, xpReward: 30, estimatedTime: 90, tags: ["tambah"], missionType: "multiple_choice" },
  { titleTemplate: "Pembagian Kue", storyTemplate: "{name} punya {a} kue dibagikan ke {b} teman.", instructionTemplate: "Berapa kue per anak?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "{a} ÷ {b} = {right} kue per anak. Berbagi itu indah!", hints: ["Bagi rata."], basePoint: 50, xpReward: 30, estimatedTime: 90, tags: ["bagi"], missionType: "multiple_choice" },
  { titleTemplate: "Selisih Jarak", storyTemplate: "{name} berjalan {a} meter, lalu kembali {b} meter.", instructionTemplate: "Sisa jarak dari titik awal?", choices: ["{wrong1} m", "{right} m", "{wrong2} m"], correctIdx: 1, explanationTemplate: "{a} - {b} = {right} meter dari titik awal.", hints: ["Kurangi."], basePoint: 50, xpReward: 30, estimatedTime: 90, tags: ["kurang"], missionType: "multiple_choice" },
  { titleTemplate: "Perkalian Buku", storyTemplate: "{name} membeli {a} pak buku. Setiap pak isi {b} buku.", instructionTemplate: "Berapa total buku?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "{a} × {b} = {right} buku total.", hints: ["Kalikan."], basePoint: 50, xpReward: 30, estimatedTime: 90, tags: ["kali"], missionType: "multiple_choice" },
  { titleTemplate: "Belanja Total", storyTemplate: "{name} beli buku Rp{a}.000 dan pensil Rp{b}.000.", instructionTemplate: "Total belanja?", choices: ["Rp{wrong1}.000", "Rp{right}.000", "Rp{wrong2}.000"], correctIdx: 1, explanationTemplate: "{a}.000 + {b}.000 = Rp{right}.000. Hitung dengan teliti!", hints: ["Jumlahkan harga."], basePoint: 50, xpReward: 30, estimatedTime: 90, tags: ["tambah"], missionType: "multiple_choice" },
  { titleTemplate: "Sisa Uang", storyTemplate: "{name} punya uang Rp{a}.000. Beli jajan Rp{b}.000.", instructionTemplate: "Sisa uang?", choices: ["Rp{wrong1}.000", "Rp{right}.000", "Rp{wrong2}.000"], correctIdx: 1, explanationTemplate: "{a}.000 - {b}.000 = Rp{right}.000. Hemat pangkal kaya!", hints: ["Kurangi."], basePoint: 50, xpReward: 30, estimatedTime: 90, tags: ["kurang"], missionType: "multiple_choice" },
  { titleTemplate: "Rata-rata Nilai", storyTemplate: "{name} dapat nilai {a}, {b}, {c} di tiga ulangan.", instructionTemplate: "Rata-rata nilainya?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "({a}+{b}+{c})÷3 = {right}. Rata-rata yang bagus!", hints: ["Jumlahkan, bagi 3."], basePoint: 70, xpReward: 40, estimatedTime: 120, tags: ["rata-rata"], missionType: "multiple_choice" },
  { titleTemplate: "Pola Bilangan", storyTemplate: "{a}, {b}, {c}, ?, {e}", instructionTemplate: "Angka yang hilang?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "Setiap angka bertambah {step}. {c} + {step} = {right}.", hints: ["Cari selisihnya."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["pola-bilangan"], missionType: "multiple_choice" },
  { titleTemplate: "Konversi Waktu", storyTemplate: "{name} belajar selama {a} menit.", instructionTemplate: "Berapa jam?", choices: ["{wrong1} jam", "{right} jam", "{wrong2} jam"], correctIdx: 1, explanationTemplate: "{a} menit = {right} jam. (1 jam = 60 menit)", hints: ["Bagi 60."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["waktu"], missionType: "multiple_choice" },
];

// ─── SPASIAL ───
const SPASIAL_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Arah Mata Angin", storyTemplate: "{name} menghadap utara. Di kanannya adalah...", instructionTemplate: "Arah apakah itu?", choices: ["Barat", "Timur", "Selatan"], correctIdx: 1, explanationTemplate: "Jika menghadap utara: kanan = timur, kiri = barat, belakang = selatan.", hints: ["Bayangkan kompas."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["arah"], missionType: "spatial_reasoning" },
  { titleTemplate: "Susunan Benda", storyTemplate: "Buku A di atas B. B di atas C. C paling...", instructionTemplate: "Buku apa yang paling bawah?", choices: ["A", "B", "C"], correctIdx: 2, explanationTemplate: "C di paling bawah, B di tengah, A di paling atas.", hints: ["Susun dari bawah."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["susunan"], missionType: "spatial_reasoning" },
  { titleTemplate: "Lipatan Kertas", storyTemplate: "Kertas dilipat {a} kali sama besar.", instructionTemplate: "Berapa lapisan kertas?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "2^{a} = {right} lapisan. Setiap lipatan menggandakan.", hints: ["Pangkat dua."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["lipat"], missionType: "spatial_reasoning" },
  { titleTemplate: "Refleksi Cermin", storyTemplate: "Huruf 'P' dilihat di cermin.", instructionTemplate: "Terlihat seperti apa?", choices: ["Tetap P", "Terbalik seperti q", "Hilang"], correctIdx: 1, explanationTemplate: "Cermin membalik kiri-kanan. P di cermin terlihat terbalik.", hints: ["Bayangkan bercermin."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["refleksi"], missionType: "spatial_reasoning" },
  { titleTemplate: "Jaring Kubus", storyTemplate: "Jaring-jaring kubus yang dilipat.", instructionTemplate: "Sisi mana yang berhadapan dengan sisi atas?", choices: ["Sisi samping", "Sisi bawah", "Sisi depan"], correctIdx: 1, explanationTemplate: "Pada kubus, sisi atas selalu berhadapan dengan sisi bawah.", hints: ["Bayangkan kubusnya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["kubus"], missionType: "spatial_reasoning" },
];

// ─── POLA ───
const POLA_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Deret Aritmatika", storyTemplate: "{start}, {a}, {b}, {c}, ?", instructionTemplate: "Angka selanjutnya?", choices: ["{wrong1}", "{right}", "{wrong2}"], correctIdx: 1, explanationTemplate: "Setiap angka bertambah {step}. {c} + {step} = {right}.", hints: ["Cari bedanya."], basePoint: 55, xpReward: 30, estimatedTime: 100, tags: ["deret"], missionType: "pattern_recognition" },
  { titleTemplate: "Deret Geometri", storyTemplate: "1, 2, 4, 8, 16, ?", instructionTemplate: "Angka selanjutnya?", choices: ["24", "32", "20"], correctIdx: 1, explanationTemplate: "Setiap angka dikali 2. 16 × 2 = 32.", hints: ["Kali 2."], basePoint: 55, xpReward: 30, estimatedTime: 100, tags: ["deret"], missionType: "pattern_recognition" },
  { titleTemplate: "Pola Huruf", storyTemplate: "A, C, E, G, ?", instructionTemplate: "Huruf selanjutnya?", choices: ["H", "I", "J"], correctIdx: 1, explanationTemplate: "Lompat 1 huruf: A(B)C(D)E(F)G(H)I.", hints: ["Sebut alfabet."], basePoint: 55, xpReward: 30, estimatedTime: 100, tags: ["huruf"], missionType: "pattern_recognition" },
  { titleTemplate: "Pola Fibonacci", storyTemplate: "1, 1, 2, 3, 5, ?", instructionTemplate: "Angka selanjutnya?", choices: ["6", "8", "7"], correctIdx: 1, explanationTemplate: "Fibonacci: setiap angka = jumlah 2 sebelumnya. 3+5 = 8.", hints: ["Jumlahkan dua sebelumnya."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["fibonacci"], missionType: "pattern_recognition" },
  { titleTemplate: "Pola Gambar", storyTemplate: "🌙☀️⭐🌙☀️⭐🌙 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🌙", "☀️", "⭐"], correctIdx: 1, explanationTemplate: "Siklus 3: Bulan-Matahari-Bintang. Setelah Bulan, Matahari.", hints: ["Tiga bergantian."], basePoint: 50, xpReward: 25, estimatedTime: 90, tags: ["pola-gambar"], missionType: "pattern_recognition" },
];

// ─── SYSTEMS ───
const SYSTEMS_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Sistem Sekolah", storyTemplate: "Sekolah {name} kotor, siswa sering sakit.", instructionTemplate: "Solusi terbaik?", choices: ["Biarkan saja", "Jadwal piket + wastafel + edukasi kebersihan", "Tutup sekolah saja"], correctIdx: 1, explanationTemplate: "Masalah sistem butuh solusi multi-aspek: jadwal, fasilitas, edukasi.", hints: ["Perlu beberapa perubahan."], basePoint: 65, xpReward: 40, estimatedTime: 120, tags: ["sistem"], missionType: "systems_thinking" },
  { titleTemplate: "Rantai Makanan", storyTemplate: "Jika ular di sawah punah, tikus berkembang biak.", instructionTemplate: "Apa dampaknya ke padi?", choices: ["Padi tetap aman", "Padi dimakan tikus, panen gagal", "Padi tumbuh lebih subur"], correctIdx: 1, explanationTemplate: "Ular predator tikus. Tanpa ular, tikus tak terkendali.", hints: ["Siapa yang dimakan ular?"], basePoint: 65, xpReward: 40, estimatedTime: 120, tags: ["ekosistem"], missionType: "systems_thinking" },
  { titleTemplate: "Hemat Energi", storyTemplate: "Di rumah {name}, lampu sering lupa dimatikan.", instructionTemplate: "Solusi terbaik?", choices: ["Biarkan saja", "Stiker pengingat + sensor otomatis + edukasi", "Matikan listrik total"], correctIdx: 1, explanationTemplate: "Kombinasi pengingat, teknologi, dan edukasi paling efektif.", hints: ["Beberapa cara sekaligus."], basePoint: 65, xpReward: 40, estimatedTime: 120, tags: ["energi"], missionType: "systems_thinking" },
  { titleTemplate: "Sistem Transportasi", storyTemplate: "Jalan di kota {name} selalu macet pagi hari.", instructionTemplate: "Solusi sistemik?", choices: ["Perlebar semua jalan", "Angkutan umum + jam fleksibel + jalur sepeda", "Larang mobil pribadi"], correctIdx: 1, explanationTemplate: "Solusi sistem: transportasi publik, atur jam, fasilitas alternatif.", hints: ["Bukan hanya satu cara."], basePoint: 65, xpReward: 40, estimatedTime: 120, tags: ["transportasi"], missionType: "systems_thinking" },
  { titleTemplate: "Daur Ulang", storyTemplate: "Sampah di lingkungan {name} menumpuk.", instructionTemplate: "Sistem pengelolaan terbaik?", choices: ["Buang ke sungai", "Pilah sampah + bank sampah + kompos", "Bakar semua"], correctIdx: 1, explanationTemplate: "Pilah, daur ulang, dan kompos — sistem berkelanjutan.", hints: ["Olah dengan benar."], basePoint: 65, xpReward: 40, estimatedTime: 120, tags: ["lingkungan"], missionType: "systems_thinking" },
];

// ─── MORAL ───
const MORAL_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Kejujuran", storyTemplate: "{name} menemukan dompet di jalan berisi uang.", instructionTemplate: "Apa yang dilakukan?", choices: ["Ambil uangnya", "Cari pemiliknya", "Buang lagi"], correctIdx: 1, explanationTemplate: "Kejujuran adalah pangkal kebaikan. Mengembalikan amanah itu wajib.", hints: ["Itu bukan milikmu."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["jujur"], missionType: "moral_decision", adabFeedbackTemplate: "Jujur itu mulia. 🤲" },
  { titleTemplate: "Kepemimpinan", storyTemplate: "{name} jadi ketua kelompok. Ada anggota yang malas.", instructionTemplate: "Sikap terbaik?", choices: ["Marahi dia di depan umum", "Ajak bicara baik-baik, cari solusi bersama", "Keluarkan dari kelompok"], correctIdx: 1, explanationTemplate: "Pemimpin bijak merangkul, bukan menghukum. Komunikasi adalah kunci.", hints: ["Pemimpin itu melayani."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["pemimpin"], missionType: "moral_decision", adabFeedbackTemplate: "Pemimpin bijak merangkul semua. 👑" },
  { titleTemplate: "Amanah", storyTemplate: "{name} dititipi rahasia oleh sahabatnya.", instructionTemplate: "Apa yang dilakukan?", choices: ["Ceritakan ke orang lain", "Simpan rahasia itu baik-baik", "Gunakan untuk keuntungan sendiri"], correctIdx: 1, explanationTemplate: "Menjaga rahasia adalah amanah. Khianat adalah tanda munafik.", hints: ["Itu kepercayaan."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["amanah"], missionType: "moral_decision", adabFeedbackTemplate: "Jaga amanah dengan baik. 🛡️" },
  { titleTemplate: "Toleransi", storyTemplate: "Teman {name} berbeda keyakinan dan sedang beribadah.", instructionTemplate: "Sikap terbaik?", choices: ["Ganggu ibadahnya", "Hormati dan jaga ketenangan", "Paksa dia ikut cara kita"], correctIdx: 1, explanationTemplate: "Islam mengajarkan toleransi. Bagimu agamamu, bagiku agamaku.", hints: ["Hormati perbedaan."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["toleransi"], missionType: "moral_decision", adabFeedbackTemplate: "Toleransi itu indah. 🤝" },
  { titleTemplate: "Syukur", storyTemplate: "{name} dapat hadiah kecil, temannya dapat hadiah besar.", instructionTemplate: "Sikap terbaik?", choices: ["Iri dan mengeluh", "Alhamdulillah, bersyukur", "Meminta tukar hadiah"], correctIdx: 1, explanationTemplate: "Syukur atas nikmat sekecil apapun. Allah akan menambah nikmat bagi yang bersyukur.", hints: ["Lihat yang di bawah."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["syukur"], missionType: "moral_decision", adabFeedbackTemplate: "Syukur menambah nikmat. 🌟" },
  { titleTemplate: "Adil", storyTemplate: "{name} diminta membagi kue untuk 3 adik.", instructionTemplate: "Cara terbaik?", choices: ["Ambil bagian terbesar untuk diri sendiri", "Bagi sama rata dengan adil", "Sembunyikan kuenya"], correctIdx: 1, explanationTemplate: "Berlaku adil meskipun kepada diri sendiri. Allah mencintai orang yang adil.", hints: ["Semua harus sama."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["adil"], missionType: "moral_decision", adabFeedbackTemplate: "Adil itu wajib. ⚖️" },
  { titleTemplate: "Sabar", storyTemplate: "Proyek {name} gagal setelah bekerja keras.", instructionTemplate: "Sikap terbaik?", choices: ["Marah dan menyerah", "Sabar, evaluasi, dan coba lagi", "Salahkan orang lain"], correctIdx: 1, explanationTemplate: "Kesabaran adalah kunci keberhasilan. Allah bersama orang sabar.", hints: ["Jangan menyerah."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["sabar"], missionType: "moral_decision", adabFeedbackTemplate: "Sabar itu indah. 🌸" },
  { titleTemplate: "Rendah Hati", storyTemplate: "{name} menjadi juara kelas.", instructionTemplate: "Sikap terbaik?", choices: ["Pamer ke semua teman", "Rendah hati dan bantu teman yang kesulitan", "Merendahkan teman yang nilainya rendah"], correctIdx: 1, explanationTemplate: "Kepandaian adalah titipan Allah. Tawadhu' (rendah hati) adalah akhlak mulia.", hints: ["Jangan sombong."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["rendah-hati"], missionType: "moral_decision", adabFeedbackTemplate: "Rendah hati meninggikan derajat. 🌿" },
];

// ─── PENALARAN ───
const PENALARAN_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Logika Sederhana", storyTemplate: "Semua {animal} berkaki 4. Si Manis adalah {animal}.", instructionTemplate: "Si Manis berkaki berapa?", choices: ["2", "4", "Tidak tahu"], correctIdx: 1, explanationTemplate: "Karena semua {animal} berkaki 4, maka Si Manis juga berkaki 4.", hints: ["Gunakan premisnya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["silogisme"], missionType: "general_reasoning" },
  { titleTemplate: "Urutan Umur", storyTemplate: "{a} lebih tua dari {b}. {b} lebih tua dari {c}.", instructionTemplate: "Siapa yang paling muda?", choices: ["{a}", "{b}", "{c}"], correctIdx: 2, explanationTemplate: "Urutan dari tua ke muda: {a} > {b} > {c}. {c} paling muda.", hints: ["Urutkan."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["urutan"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Profesi", storyTemplate: "Orang ini pakai seragam, bawa tas surat, naik motor.", instructionTemplate: "Profesi apa?", choices: ["Dokter", "Pak Pos", "Guru"], correctIdx: 1, explanationTemplate: "Pak Pos tugasnya mengantar surat dan paket.", hints: ["Yang suka mengantar."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["deduksi"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Benda", storyTemplate: "Terbuat dari kaca, tembus pandang, ada di rumah.", instructionTemplate: "Benda apa?", choices: ["Pintu kayu", "Jendela kaca", "Tembok bata"], correctIdx: 1, explanationTemplate: "Jendela terbuat dari kaca dan tembus pandang.", hints: ["Yang tembus pandang."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["deduksi"], missionType: "general_reasoning" },
  { titleTemplate: "Logika Jika-Maka", storyTemplate: "Jika hujan, {name} bawa payung. Sekarang hujan.", instructionTemplate: "Apa yang terjadi?", choices: ["{name} tidak bawa payung", "{name} bawa payung", "Tidak bisa disimpulkan"], correctIdx: 1, explanationTemplate: "Karena jika hujan → bawa payung, dan sekarang hujan, maka {name} bawa payung.", hints: ["Ikuti logikanya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["implikasi"], missionType: "general_reasoning" },
  { titleTemplate: "Paradoks", storyTemplate: "{name} bilang 'Aku selalu berbohong'.", instructionTemplate: "Apakah {name} jujur?", choices: ["Ya, dia jujur", "Tidak mungkin, ini kontradiksi", "Mungkin saja"], correctIdx: 1, explanationTemplate: "Ini paradoks: kalau dia jujur berarti dia berbohong, dan sebaliknya!", hints: ["Pikirkan bolak-balik."], basePoint: 65, xpReward: 40, estimatedTime: 100, tags: ["paradoks"], missionType: "general_reasoning" },
];

// ─── KREATIVITAS ───
const KREATIVITAS_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Ide Inovatif", storyTemplate: "Masalah: sampah plastik berserakan.", instructionTemplate: "Ide paling kreatif?", choices: ["Bakar semua plastik", "Daur ulang jadi ecobrick/pot tanaman", "Timbun di tanah"], correctIdx: 1, explanationTemplate: "Ecobrick adalah solusi kreatif: plastik jadi bata bangunan.", hints: ["Ubah jadi berguna."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["inovasi"], missionType: "lateral_thinking" },
  { titleTemplate: "Berpikir Lateral", storyTemplate: "Seorang pria tinggal di lantai 20. Setiap pagi turun ke lantai 1. Pulang hanya naik ke lantai 15, lalu jalan kaki.", instructionTemplate: "Kenapa?", choices: ["Dia pendek, hanya bisa tekan tombol 15", "Dia malas", "Liftnya rusak"], correctIdx: 0, explanationTemplate: "Dia pendek! Hanya bisa menjangkau tombol lantai 15. Lucu kan?", hints: ["Pikirkan di luar kebiasaan."], basePoint: 70, xpReward: 40, estimatedTime: 120, tags: ["lateral"], missionType: "lateral_thinking" },
  { titleTemplate: "Brainstorming", storyTemplate: "Desa butuh sumber air bersih. Tidak ada sungai dekat.", instructionTemplate: "Ide paling kreatif?", choices: ["Pindah desa", "Tampung air hujan + sumur resapan", "Tunggu bantuan saja"], correctIdx: 1, explanationTemplate: "Kombinasi penampungan hujan dan sumur resapan adalah solusi mandiri.", hints: ["Manfaatkan alam."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["brainstorm"], missionType: "lateral_thinking" },
  { titleTemplate: "Desain Ulang", storyTemplate: "Taman kota sepi pengunjung.", instructionTemplate: "Solusi kreatif?", choices: ["Tambah lebih banyak bangku", "Taman tematik + wifi gratis + panggung seni", "Tutup saja tamannya"], correctIdx: 1, explanationTemplate: "Taman tematik dengan fasilitas modern menarik lebih banyak pengunjung.", hints: ["Buat lebih menarik."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["desain"], missionType: "lateral_thinking" },
  { titleTemplate: "Pemecahan Masalah", storyTemplate: "Traffic light rusak, jalanan kacau.", instructionTemplate: "Solusi darurat terbaik?", choices: ["Biarkan saja", "Polisi mengatur + warga bergantian", "Tutup jalan"], correctIdx: 1, explanationTemplate: "Gotong royong: polisi dan warga bersama mengatur lalu lintas.", hints: ["Kerja sama."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["problem-solving"], missionType: "lateral_thinking" },
];

// ─── UNIVERSITAS TEMPLATES ───

const ADVANCED_REASONING_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Analisis Argumen", storyTemplate: "Seorang ekonom berkata: 'Kenaikan upah minimum selalu menyebabkan pengangguran karena perusahaan mengurangi karyawan.'", instructionTemplate: "Kelemahan argumen ini?", choices: ["Tidak ada kelemahan", "Mengabaikan kemungkinan peningkatan produktivitas yang mengimbangi biaya", "Upah minimum tidak pernah naik"], correctIdx: 1, explanationTemplate: "Argumen ini oversimplifikasi. Produktivitas bisa meningkat sehingga perusahaan tetap bisa mempertahankan karyawan.", hints: ["Pikirkan faktor lain."], basePoint: 80, xpReward: 50, estimatedTime: 150, tags: ["analisis-argumen"], missionType: "argument_evaluation" },
  { titleTemplate: "Bias Kognitif", storyTemplate: "Setelah membaca berita kecelakaan pesawat, {name} jadi takut naik pesawat padahal statistik menunjukkan pesawat jauh lebih aman dari mobil.", instructionTemplate: "Bias apa yang terjadi?", choices: ["Bias konfirmasi", "Availability heuristic (ketersediaan)", "Bias optimisme"], correctIdx: 1, explanationTemplate: "Availability heuristic: orang menilai risiko berdasarkan seberapa mudah contoh muncul di pikiran, bukan data objektif.", hints: ["Karena baru saja membaca."], basePoint: 80, xpReward: 50, estimatedTime: 150, tags: ["bias"], missionType: "argument_evaluation" },
  { titleTemplate: "Dilema Etis", storyTemplate: "Perusahaan farmasi menemukan obat langka. Biaya produksi Rp10.000/dosis tapi mereka menjual Rp10.000.000/dosis.", instructionTemplate: "Argumen ETIS yang PALING TEPAT:", choices: ["Itu hak mereka, bebas pasar", "Ada kewajiban moral menyeimbangkan keuntungan dengan akses pasien", "Pemerintah harus menutup perusahaan"], correctIdx: 1, explanationTemplate: "Dalam etika bisnis, ada keseimbangan antara profit dan tanggung jawab sosial, terutama untuk obat yang menyelamatkan nyawa.", hints: ["Pikirkan etika + bisnis."], basePoint: 85, xpReward: 55, estimatedTime: 160, tags: ["etika"], missionType: "ethical_leadership" },
  { titleTemplate: "Sistem Kompleks", storyTemplate: "Kebijakan subsidi BBM dicabut. Harga naik 30%.", instructionTemplate: "Analisis paling komprehensif:", choices: ["Ini kebijakan buruk karena rakyat menderita", "Efek jangka pendek: inflasi. Jangka panjang: anggaran dialihkan ke pendidikan/kesehatan, ekonomi lebih efisien", "Tidak ada dampak signifikan"], correctIdx: 1, explanationTemplate: "Analisis sistem harus melihat jangka pendek DAN panjang, serta efek di berbagai sektor.", hints: ["Lihat short-term dan long-term."], basePoint: 85, xpReward: 55, estimatedTime: 160, tags: ["sistem"], missionType: "university_case_analysis" },
  { titleTemplate: "Keputusan Strategis", storyTemplate: "Startup teknologi harus memilih: fokus pada produk yang sudah ada (profit sekarang) atau investasi besar di riset (growth nanti).", instructionTemplate: "Keputusan paling strategis:", choices: ["Fokus profit sekarang, riset terlalu berisiko", "Portfolio seimbang: 70% produk existing, 30% riset", "Semua di riset"], correctIdx: 1, explanationTemplate: "Strategi portfolio menyeimbangkan stabilitas jangka pendek dengan inovasi jangka panjang.", hints: ["Jangan all-in di satu sisi."], basePoint: 85, xpReward: 55, estimatedTime: 160, tags: ["strategi"], missionType: "university_case_analysis" },
  { titleTemplate: "Evaluasi Kebijakan", storyTemplate: "Kota A melarang kendaraan pribadi di pusat kota. Polusi turun 40% tapi pendapatan toko ritel turun 25%.", instructionTemplate: "Evaluasi paling objektif:", choices: ["Kebijakan gagal karena toko rugi", "Kebijakan berhasil karena polusi turun", "Trade-off: lingkungan membaik, tapi perlu program dukungan ekonomi untuk toko"], correctIdx: 2, explanationTemplate: "Kebijakan publik hampir selalu punya trade-off. Evaluasi objektif melihat semua sisi.", hints: ["Ada yang untung, ada yang rugi."], basePoint: 85, xpReward: 55, estimatedTime: 160, tags: ["evaluasi"], missionType: "argument_evaluation" },
  { titleTemplate: "Dilema Kepemimpinan", storyTemplate: "CEO harus PHK 10% karyawan atau perusahaan bangkrut dan semua kehilangan pekerjaan.", instructionTemplate: "Keputusan paling etis:", choices: ["Jangan PHK, biarkan semua kena", "PHK 10% dengan pesangon layak + bantuan cari kerja baru", "PHK tanpa pesangon"], correctIdx: 1, explanationTemplate: "Meminimalkan dampak buruk (least harm principle) sambil menjaga martabat yang terkena dampak.", hints: ["Pilih yang paling sedikit korbannya."], basePoint: 85, xpReward: 55, estimatedTime: 160, tags: ["dilema"], missionType: "ethical_leadership" },
  { titleTemplate: "Pemecahan Kompleks", storyTemplate: "Negara X: inflasi 15%, pengangguran 10%, pertumbuhan -2%.", instructionTemplate: "Strategi paling tepat:", choices: ["Naikkan suku bunga setinggi mungkin", "Paket kebijakan: stimulus fiskal selektif + kebijakan moneter hati-hati + reformasi struktural", "Cetak uang lebih banyak"], correctIdx: 1, explanationTemplate: "Masalah kompleks butuh solusi multi-dimensi. Tidak ada satu kebijakan tunggal yang cukup.", hints: ["Butuh beberapa kebijakan."], basePoint: 90, xpReward: 60, estimatedTime: 180, tags: ["kompleks"], missionType: "university_case_analysis" },
  { titleTemplate: "Logika Kuantitatif", storyTemplate: "Survei: 1000 responden. 60% setuju kebijakan A. Margin of error 3%.", instructionTemplate: "Interpretasi paling tepat:", choices: ["Pasti 60% rakyat setuju", "Kita yakin 95% bahwa antara 57%-63% populasi setuju", "Survei tidak valid"], correctIdx: 1, explanationTemplate: "Margin of error memberi rentang kepercayaan, bukan angka pasti.", hints: ["Ingat margin of error."], basePoint: 80, xpReward: 50, estimatedTime: 150, tags: ["statistik"], missionType: "argument_evaluation" },
  { titleTemplate: "Game Theory", storyTemplate: "Dua perusahaan bersaing. Jika keduanya menurunkan harga, keduanya rugi. Jika satu turunkan harga, yang turunkan untung besar.", instructionTemplate: "Strategi optimal jangka panjang?", choices: ["Turunkan harga terus-menerus", "Kolaborasi diam-diam mempertahankan harga (Nash equilibrium)", "Keluar dari pasar"], correctIdx: 1, explanationTemplate: "Dalam dilema tahanan berulang, keseimbangan Nash adalah mempertahankan harga.", hints: ["Pikirkan jangka panjang."], basePoint: 85, xpReward: 55, estimatedTime: 160, tags: ["game-theory"], missionType: "university_case_analysis" },
];

// ════════════════════════════════════════════════════════
// Template Bank: difficulty → templates
// ════════════════════════════════════════════════════════

const TEMPLATE_BANK: Record<string, Record<string, StageTemplate[]>> = {
  tk: {
    "tk-adab": TK_ADAB_TEMPLATES,
    "tk-pra-literasi": TK_PRELIT_TEMPLATES,
    "tk-visual": TK_VISUAL_TEMPLATES,
    "tk-pola": TK_POLA_TEMPLATES,
    "tk-kreativitas": TK_KREATIVITAS_TEMPLATES,
  },
  "sd-bawah": {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": SPASIAL_TEMPLATES,
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": PENALARAN_TEMPLATES,
  },
  "sd-atas": {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": SPASIAL_TEMPLATES,
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": PENALARAN_TEMPLATES,
  },
  smp: {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": SPASIAL_TEMPLATES,
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": PENALARAN_TEMPLATES,
  },
  sma: {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": SPASIAL_TEMPLATES,
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": PENALARAN_TEMPLATES,
  },
  universitas: {
    "advanced-reasoning": ADVANCED_REASONING_TEMPLATES,
    "systems-kompleks": ADVANCED_REASONING_TEMPLATES,
    "ethical-leadership": ADVANCED_REASONING_TEMPLATES,
    "argument-evaluation": ADVANCED_REASONING_TEMPLATES,
    "quantitative-logic": ADVANCED_REASONING_TEMPLATES,
    "strategic-decision": ADVANCED_REASONING_TEMPLATES,
    "problem-solving": ADVANCED_REASONING_TEMPLATES,
  },
};

// ════════════════════════════════════════════════════════
// Template Parametrization
// ════════════════════════════════════════════════════════

function fillTemplate(tmpl: string, params: Record<string, string | number>): string {
  let result = tmpl;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
  }
  return result;
}

function generateParametrizedStage(
  tpl: StageTemplate,
  difficulty: DifficultyId,
  stageNumber: number,
  worldId: string,
  worldName: string,
  category: CategoryId,
  stageType: StageType,
  rand: () => number,
  isBoss: boolean,
): Stage {
  const name = pick(NAMES, rand);
  const params: Record<string, string | number> = { name };

  // Generate random numbers for parametrized templates
  if (tpl.choices.some(c => c.includes("{right}") || c.includes("{wrong"))) {
    if (category === "literasi-numerasi" || category === "tk-pra-literasi") {
      let a = randInt(10, 50, rand);
      let b = randInt(2, Math.min(20, a - 1), rand);
      let right: number, wrong1: number, wrong2: number;

      if (tpl.titleTemplate.includes("Jumlah") || tpl.titleTemplate.includes("Total")) {
        right = a + b;
        wrong1 = right + randInt(1, 5, rand);
        wrong2 = Math.max(0, right - randInt(1, 5, rand));
      } else if (tpl.titleTemplate.includes("Bagi") || tpl.titleTemplate.includes("bagi")) {
        b = randInt(2, 6, rand);
        a = b * randInt(3, 10, rand);
        right = a / b;
        wrong1 = right + randInt(1, 3, rand);
        wrong2 = Math.max(1, right - randInt(1, 2, rand));
      } else if (tpl.titleTemplate.includes("Kali") || tpl.titleTemplate.includes("Perkalian")) {
        right = a * b;
        wrong1 = right + a;
        wrong2 = Math.max(0, right - b);
      } else if (tpl.titleTemplate.includes("Selisih") || tpl.titleTemplate.includes("Sisa")) {
        right = a - b;
        wrong1 = a + b;
        wrong2 = Math.max(0, right - randInt(1, 5, rand));
      } else if (tpl.titleTemplate.includes("Rata")) {
        const c = randInt(10, 30, rand);
        right = Math.round((a + b + c) / 3);
        wrong1 = right + randInt(1, 5, rand);
        wrong2 = Math.max(0, right - randInt(1, 5, rand));
      } else if (tpl.titleTemplate.includes("Pola Bilangan")) {
        const start = randInt(2, 10, rand);
        const step = randInt(2, 5, rand);
        a = start;
        b = start + step;
        wrong1 = start + step * 2;
        right = start + step * 3;
        wrong2 = right + step;
      } else {
        right = a + b;
        wrong1 = right + randInt(1, 5, rand);
        wrong2 = Math.max(0, right - randInt(1, 5, rand));
      }
      params.a = a; params.b = b; params.right = right;
      params.wrong1 = wrong1; params.wrong2 = wrong2;
      params.step = right - (wrong1 < right ? wrong1 : wrong2);
      params.start = Math.min(a, b);
    } else if (tpl.titleTemplate.includes("Lipatan")) {
      const folds = randInt(2, 4, rand);
      params.a = folds;
      params.right = Math.pow(2, folds);
      params.wrong1 = folds * 2;
      params.wrong2 = folds * 4;
    } else {
      // Generic fill
      params.a = randInt(5, 30, rand);
      params.b = randInt(2, 15, rand);
      params.right = params.a + params.b;
      params.wrong1 = Number(params.right) + randInt(1, 5, rand);
      params.wrong2 = Math.max(0, Number(params.right) - randInt(1, 5, rand));
    }
  }

  // Fill templates
  const title = fillTemplate(tpl.titleTemplate, params);
  const story = fillTemplate(tpl.storyTemplate, params);
  const instruction = fillTemplate(tpl.instructionTemplate, params);
  const explanation = fillTemplate(tpl.explanationTemplate, params);
  const adabFeedback = tpl.adabFeedbackTemplate ? fillTemplate(tpl.adabFeedbackTemplate, params) : undefined;

  const choices: MissionOption[] = tpl.choices.map((label, i) => {
    const filled = fillTemplate(label, params);
    const id = String.fromCharCode(97 + i);
    const opt: MissionOption = { id, label: filled };
    if (i === tpl.correctIdx && !["moral_decision", "tk_adab_basic", "ethical_leadership"].includes(tpl.missionType)) {
      opt.feedback = "Tepat!";
    }
    if (["moral_decision", "tk_adab_basic", "ethical_leadership"].includes(tpl.missionType) && i === tpl.correctIdx) {
      opt.isBestChoice = true;
    }
    return opt;
  });

  const correctAnswer = String.fromCharCode(97 + tpl.correctIdx);

  // Determine secondary category for boss/review
  let secondaryCategory: CategoryId | undefined;
  if (difficulty === "sd-bawah" && category === "moral") secondaryCategory = "penalaran";
  else if (difficulty === "sd-atas" && category === "systems") secondaryCategory = "spasial";

  return {
    id: `${difficulty}-${stageNumber}`,
    stageNumber,
    difficulty,
    worldId,
    worldName,
    category,
    stageType,
    missionType: tpl.missionType,
    title,
    story,
    instruction,
    choices,
    correctAnswer,
    explanation,
    hintLevels: tpl.hints,
    basePoint: tpl.basePoint + (isBoss ? 30 : 0),
    xpReward: tpl.xpReward + (isBoss ? 20 : 0),
    estimatedTime: tpl.estimatedTime,
    tags: [...tpl.tags, isBoss ? "boss" : "regular"],
    contentVersion: 1,
    isBossStage: isBoss,
    isRewardStage: stageType === "reward",
    isReviewStage: stageType === "review",
    unlockRequirement: stageNumber > 1 ? [`${difficulty}-${stageNumber - 1}`] : undefined,
    ...(adabFeedback ? { adabFeedback } : {}),
    ...(secondaryCategory ? { secondaryCategory } : {}),
    // Legacy compat fields
    options: choices,
    worldArea: worldId,
    isBossMission: isBoss,
  };
}

// ════════════════════════════════════════════════════════
// Main Generator: Produce 500 stages per difficulty
// ════════════════════════════════════════════════════════

export function generateStagesForDifficulty(difficulty: DifficultyId): Stage[] {
  const distribution = STAGE_DISTRIBUTIONS[difficulty];
  if (!distribution) {
    console.warn(`No distribution for difficulty: ${difficulty}`);
    return [];
  }

  const worlds = WORLDS_BY_DIFFICULTY[difficulty];
  if (!worlds) {
    console.warn(`No worlds for difficulty: ${difficulty}`);
    return [];
  }

  const templates = TEMPLATE_BANK[difficulty];
  if (!templates) {
    console.warn(`No templates for difficulty: ${difficulty}`);
    return [];
  }

  // Create world index for quick lookup
  const worldMap = new Map(worlds.map(w => [w.id, w]));
  const rand = rng(
    difficulty
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) * 12345,
  );

  const stages: Stage[] = [];
  const seenIds = new Set<string>();

  // Global stage counter 1-500 for this difficulty
  let globalStageNum = 0;

  // Process distribution entries
  for (const dist of distribution) {
    const world = worldMap.get(dist.worldId);
    if (!world) {
      console.warn(`World not found: ${dist.worldId} for difficulty ${difficulty}`);
      continue;
    }

    const catTemplates = templates[dist.category];
    if (!catTemplates || catTemplates.length === 0) {
      console.warn(`No templates for category: ${dist.category} in difficulty ${difficulty}`);
      continue;
    }

    for (let i = 0; i < dist.count; i++) {
      globalStageNum++;
      const stageNum = globalStageNum;
      const tpl = catTemplates[i % catTemplates.length];
      const isBoss = world.bossStages.includes(stageNum);

      const stageType: StageType = isBoss ? "boss" :
        (i + 1 === dist.count && dist.count > 10) ? "review" : "mission";

      const stage = generateParametrizedStage(
        tpl,
        difficulty,
        stageNum,
        dist.worldId,
        world.name,
        dist.category as CategoryId,
        stageType,
        rand,
        isBoss,
      );

      // Ensure unique IDs
      if (seenIds.has(stage.id)) {
        stage.id = `${difficulty}-${stageNum}-${i}`;
      }
      seenIds.add(stage.id);

      stages.push(stage);
    }
  }

  // Sort by stage number
  stages.sort((a, b) => a.stageNumber - b.stageNumber);

  return stages;
}

/**
 * Generate ALL 3000 stages across all difficulties.
 */
export function generateAllStages(): Stage[] {
  const allStages: Stage[] = [];
  for (const difficulty of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as DifficultyId[]) {
    const stages = generateStagesForDifficulty(difficulty);
    allStages.push(...stages);
  }
  return allStages;
}

/**
 * Convert a Stage to the legacy Mission format used by the current play system.
 */
export function stageToMission(stage: Stage): import("@/types").Mission {
  const mission: any = {
    id: stage.id,
    number: stage.stageNumber,
    title: stage.title,
    difficulty: stage.difficulty,
    gradeRange: getGradeRange(stage.difficulty),
    category: stage.category,
    secondaryCategory: stage.secondaryCategory,
    missionType: stage.missionType,
    worldArea: stage.worldId,
    story: stage.story,
    instruction: stage.instruction,
    explanation: stage.explanation,
    hintLevels: stage.hintLevels,
    basePoint: stage.basePoint,
    estimatedTime: stage.estimatedTime,
    unlockRequirement: stage.unlockRequirement,
    isBossMission: stage.isBossStage,
    options: stage.choices,
    correctAnswer: stage.correctAnswer,
    ...(stage.adabFeedback ? { adabFeedback: stage.adabFeedback } : {}),
    ...(stage.adabBonus ? { adabBonus: stage.adabBonus } : {}),
  };
  return mission as import("@/types").Mission;
}

function getGradeRange(difficulty: DifficultyId): string {
  const map: Record<string, string> = {
    tk: "TK",
    "sd-bawah": "SD 1-3",
    "sd-atas": "SD 4-6",
    smp: "SMP",
    sma: "SMA",
    universitas: "Universitas",
  };
  return map[difficulty] || "";
}
