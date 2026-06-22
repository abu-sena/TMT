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
  { titleTemplate: "Bayangan Pohon", storyTemplate: "Matahari di timur pagi hari. {name} melihat pohon besar.", instructionTemplate: "Ke arah mana bayangan pohon jatuh?", choices: ["Timur", "Barat", "Utara"], correctIdx: 1, explanationTemplate: "Matahari di timur → bayangan jatuh ke barat. Cahaya datang dari timur, bayangan ke arah berlawanan.", hints: ["Bayangan berlawanan arah cahaya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["bayangan"], missionType: "spatial_reasoning" },
  { titleTemplate: "Posisi Relatif", storyTemplate: "{name} berdiri. Bola di depan, kotak di belakang, buku di kanan.", instructionTemplate: "Apa yang ada di kiri {name}?", choices: ["Bola", "Kotak", "Tidak ada"], correctIdx: 2, explanationTemplate: "Depan: bola, belakang: kotak, kanan: buku. Kiri tidak disebutkan → tidak ada.", hints: ["Sebutkan satu per satu posisinya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["posisi"], missionType: "spatial_reasoning" },
  { titleTemplate: "Putar Balok", storyTemplate: "Balok warna merah di depan, biru di kanan. Diputar 180°.", instructionTemplate: "Warna apa sekarang di depan?", choices: ["Merah", "Biru", "Tidak tahu"], correctIdx: 0, explanationTemplate: "Putar 180°: depan jadi belakang, belakang jadi depan. Tapi balok hanya punya info depan & kanan. Merah tetap? Pikir baik-baik: setelah 180°, sisi depan semula sekarang di belakang, sisi belakang semula di depan. Karena belakang semula tidak diketahui, kita perlu info lebih. Tapi jika hanya 2 sisi diketahui, jawabannya merah? Tunggu — putaran 180° vertikal: depan↔belakang. Karena kita tidak tahu warna belakang, jawaban bisa jadi 'tidak tahu'. Untuk soal anak, jawab: sisi yang tadinya DI DEPAN sekarang di BELAKANG, jadi yang di depan adalah sisi yang tadinya di belakang. Karena tidak tahu warna belakang → tidak tahu.", hints: ["Bayangkan balok diputar setengah lingkaran."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["rotasi"], missionType: "spatial_reasoning" },
  { titleTemplate: "Jalur Pendek", storyTemplate: "{name} di titik A. Ke B lurus 5 langkah. Bisa juga lewat C: A→C 3 langkah, C→B 5 langkah.", instructionTemplate: "Jalur mana yang lebih pendek?", choices: ["Langsung A→B", "Lewat C", "Sama"], correctIdx: 0, explanationTemplate: "Langsung 5 langkah vs lewat C 3+5=8 langkah. Langsung lebih pendek!", hints: ["Hitung total langkah tiap jalur."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["jalur"], missionType: "spatial_reasoning" },
  { titleTemplate: "Tampak Atas", storyTemplate: "Gelas dilihat dari atas. Bentuknya...", instructionTemplate: "Terlihat seperti apa dari atas?", choices: ["Segitiga", "Lingkaran", "Persegi"], correctIdx: 1, explanationTemplate: "Gelas berbentuk silinder. Dari atas terlihat LINGKARAN.", hints: ["Bayangkan kamu terbang di atasnya."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["tampak-atas"], missionType: "spatial_reasoning" },
  { titleTemplate: "Pola Spasial", storyTemplate: "⬜⬛⬜⬛⬜ ?", instructionTemplate: "Kotak warna apa selanjutnya?", choices: ["⬜ Putih", "⬛ Hitam", "🟫 Coklat"], correctIdx: 1, explanationTemplate: "Putih-Hitam bergantian. Setelah putih terakhir → hitam.", hints: ["Lihat dua warna bergantian."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["pola-visual"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cari Beda Bentuk", storyTemplate: "🔴🔵🔴🔵🟢🔴🔵 — mana yang berbeda dari pola?", instructionTemplate: "Mana yang tidak cocok dengan pola AB?", choices: ["🔴 pertama", "🟢", "🔵 terakhir"], correctIdx: 1, explanationTemplate: "Polanya merah-biru bergantian. Hijau tidak cocok! Harusnya biru.", hints: ["Lihat warna yang tidak muncul di pola."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["cari-beda"], missionType: "spatial_reasoning" },
  { titleTemplate: "Arah Belok", storyTemplate: "{name} jalan lurus, belok kiri, belok kiri lagi.", instructionTemplate: "Sekarang menghadap ke mana relatif dari arah awal?", choices: ["Belakang (berlawanan)", "Kanan", "Kiri"], correctIdx: 0, explanationTemplate: "Belok kiri 2 kali = berbalik arah (180°). Menghadap ke belakang dari arah awal.", hints: ["Dua kali kiri = berputar setengah."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["belok"], missionType: "spatial_reasoning" },
  { titleTemplate: "Bentuk Dalam Bentuk", storyTemplate: "Persegi di dalam lingkaran. Lingkaran di dalam segitiga.", instructionTemplate: "Bentuk apa yang paling luar?", choices: ["Persegi", "Lingkaran", "Segitiga"], correctIdx: 2, explanationTemplate: "Segitiga paling luar, di dalamnya lingkaran, di dalamnya persegi.", hints: ["Baca dari luar ke dalam."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["susunan"], missionType: "spatial_reasoning" },
  { titleTemplate: "Simetri Lipat", storyTemplate: "Huruf 'A' dilipat vertikal di tengah.", instructionTemplate: "Apakah sisi kiri dan kanan sama?", choices: ["Ya, sama (simetris)", "Tidak", "Hanya sebagian"], correctIdx: 0, explanationTemplate: "Huruf A simetris vertikal! Sisi kiri dan kanan sama persis.", hints: ["Bayangkan lipat kertas di tengah A."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["simetri"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cocokkan Bayangan", storyTemplate: "🐘 Gajah menghadap kanan. Di bawahnya ada 3 bayangan.", instructionTemplate: "Bayangan mana yang cocok?", choices: ["🐘 menghadap kanan", "🐘 menghadap kiri", "🐘 terbalik"], correctIdx: 0, explanationTemplate: "Bayangan mengikuti bentuk aslinya. Gajah kanan → bayangan juga menghadap kanan (bentuk sama).", hints: ["Bayangan = bentuk sama persis."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["bayangan"], missionType: "spatial_reasoning" },
  { titleTemplate: "Susun Tangga", storyTemplate: "Anak A di tangga 1, B di tangga 3, C di tangga 5.", instructionTemplate: "Siapa yang paling tinggi posisinya?", choices: ["A", "B", "C"], correctIdx: 2, explanationTemplate: "Tangga 5 paling tinggi. C di posisi tertinggi.", hints: ["Angka tangga paling besar."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["posisi"], missionType: "spatial_reasoning" },
  { titleTemplate: "Jarak Terdekat", storyTemplate: "Dari rumah ke sekolah: lewat pasar 2 km, lewat taman 1,5 km, lewat jembatan 3 km.", instructionTemplate: "Jalur terdekat?", choices: ["Pasar", "Taman", "Jembatan"], correctIdx: 1, explanationTemplate: "1,5 km paling pendek! Pilih jalur terdekat.", hints: ["Cari angka paling kecil."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["jarak"], missionType: "spatial_reasoning" },
  { titleTemplate: "Peta Sederhana", storyTemplate: "Di peta: 🏠 di kiri, 🏫 di kanan, 🕌 di tengah.", instructionTemplate: "Mana yang paling kanan?", choices: ["🏠 Rumah", "🏫 Sekolah", "🕌 Masjid"], correctIdx: 1, explanationTemplate: "Sekolah di kanan, masjid di tengah, rumah di kiri.", hints: ["Lihat posisi paling kanan."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["peta"], missionType: "spatial_reasoning" },
];

// ════════════════════════════════════════════════════════
// SPASIAL EXPANDED — dedicated challenge types
// (shadow_match, position_shift, fastest_path, shape_odd_one,
//  visual_pattern, spatial_position)
// ════════════════════════════════════════════════════════

const SPASIAL_EXPANDED_TEMPLATES: StageTemplate[] = [
  // ── SHADOW MATCH ──
  { titleTemplate: "Cocok Bayangan Bola", storyTemplate: "Bola di atas meja. Cahaya dari atas. Ada 3 bayangan: bulat, lonjong, kotak.", instructionTemplate: "Bayangan mana yang benar?", choices: ["Bulat", "Lonjong", "Kotak"], correctIdx: 0, explanationTemplate: "Bola bulat + cahaya dari atas → bayangan bulat. Bentuk benda menentukan bayangan.", hints: ["Bayangan mengikuti bentuk benda."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["shadow-match"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cocok Bayangan Hewan", storyTemplate: "🐱 Kucing duduk. 3 bayangan: kucing berdiri, kucing duduk, kucing tidur.", instructionTemplate: "Bayangan yang cocok?", choices: ["Kucing berdiri", "Kucing duduk", "Kucing tidur"], correctIdx: 1, explanationTemplate: "Bayangan harus sama persis dengan posisi aslinya. Kucing duduk → bayangan duduk.", hints: ["Samakan posisinya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["shadow-match"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cocok Bayangan Pohon", storyTemplate: "🌳 Pohon rindang di siang hari. Bayangan mana yang tepat?", instructionTemplate: "Pilih bayangan yang benar.", choices: ["Bayangan pendek di bawah", "Bayangan panjang ke barat", "Tidak ada bayangan"], correctIdx: 0, explanationTemplate: "Siang hari matahari di atas → bayangan pendek tepat di bawah pohon.", hints: ["Matahari di atas jam 12 siang."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["shadow-match"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cocok Bayangan Bangun", storyTemplate: "🔺 Segitiga, ⬜ Persegi, ⚪ Lingkaran. Mana pasangan benda-bayangan yang benar?", instructionTemplate: "Pilih pasangan yang cocok.", choices: ["🔺 → bayangan segitiga", "⬜ → bayangan lingkaran", "⚪ → bayangan segitiga"], correctIdx: 0, explanationTemplate: "Benda segitiga menghasilkan bayangan segitiga. Bentuk harus sama!", hints: ["Bentuk benda = bentuk bayangan."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["shadow-match"], missionType: "spatial_reasoning" },
  // ── POSITION SHIFT ──
  { titleTemplate: "Ubah Posisi 1", storyTemplate: "Buku di atas meja. {name} memindahkan buku ke bawah meja.", instructionTemplate: "Posisi buku sekarang?", choices: ["Atas meja", "Bawah meja", "Samping meja"], correctIdx: 1, explanationTemplate: "Dipindah ke bawah meja → posisi sekarang di bawah meja.", hints: ["Ikuti arah pemindahan."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["position-shift"], missionType: "spatial_reasoning" },
  { titleTemplate: "Ubah Posisi 2", storyTemplate: "{name} di depan pintu, lalu mundur 3 langkah, lalu geser kanan 2 langkah.", instructionTemplate: "Posisi {name} sekarang relatif ke pintu?", choices: ["Depan pintu", "Belakang-kanan pintu", "Samping kiri pintu"], correctIdx: 1, explanationTemplate: "Mundur 3 → di belakang pintu. Geser kanan 2 → belakang-kanan pintu.", hints: ["Lacak langkah demi langkah."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["position-shift"], missionType: "spatial_reasoning" },
  { titleTemplate: "Ubah Posisi 3", storyTemplate: "Kotak di pojok kiri bawah. Geser atas 2, geser kanan 3.", instructionTemplate: "Posisi kotak sekarang?", choices: ["Kiri atas", "Kanan atas", "Tengah"], correctIdx: 1, explanationTemplate: "Dari kiri bawah: atas 2 → kiri atas. Kanan 3 → kanan atas.", hints: ["Gambar grid di pikiran."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["position-shift"], missionType: "spatial_reasoning" },
  { titleTemplate: "Ubah Posisi 4", storyTemplate: "Pensil di antara buku dan penghapus. Buku dipindah ke kiri jauh.", instructionTemplate: "Pensil sekarang di mana relatif ke buku?", choices: ["Di kanan buku", "Di kiri buku", "Tetap di antaranya"], correctIdx: 0, explanationTemplate: "Buku ke kiri → pensil ada di kanan buku. Posisi relatif berubah.", hints: ["Bayangkan pergeserannya."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["position-shift"], missionType: "spatial_reasoning" },
  // ── FASTEST PATH ──
  { titleTemplate: "Jalur Tercepat 1", storyTemplate: "{name} mau ke masjid. Jalur A: lurus 200m. Jalur B: belok kiri 100m + kanan 150m.", instructionTemplate: "Jalur tercepat?", choices: ["Jalur A (200m)", "Jalur B (250m)", "Sama"], correctIdx: 0, explanationTemplate: "200m < 250m. Jalur A lebih pendek = lebih cepat!", hints: ["Bandingkan total jarak."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["fastest-path"], missionType: "spatial_reasoning" },
  { titleTemplate: "Jalur Tercepat 2", storyTemplate: "Dari A ke D. Opsi 1: A→B 3, B→D 4. Opsi 2: A→C 2, C→D 6. Opsi 3: A→D langsung 8.", instructionTemplate: "Jalur mana yang paling cepat?", choices: ["Opsi 1 (7)", "Opsi 2 (8)", "Opsi 3 (8)"], correctIdx: 0, explanationTemplate: "Opsi 1: 3+4=7. Opsi 2: 2+6=8. Opsi 3: 8. Jadi opsi 1 tercepat!", hints: ["Jumlahkan setiap rute."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["fastest-path"], missionType: "spatial_reasoning" },
  { titleTemplate: "Jalur Tercepat 3", storyTemplate: "JalurX: 5 blok lurus. JalurY: 3 blok + 2 blok. JalurZ: 2+2+3 blok.", instructionTemplate: "Mana paling pendek?", choices: ["JalurX (5)", "JalurY (5)", "JalurZ (7)"], correctIdx: 0, explanationTemplate: "X=5, Y=5, Z=7. X dan Y sama pendek. Tapi X lebih lurus → biasanya lebih cepat.", hints: ["Hitung blok tiap jalur."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["fastest-path"], missionType: "spatial_reasoning" },
  { titleTemplate: "Jalur Halang", storyTemplate: "Ke sekolah ada 2 jalur. Jalur A: 500m tapi banyak lampu merah. Jalur B: 700m lancar.", instructionTemplate: "Mana yang mungkin lebih cepat?", choices: ["Jalur A (lebih pendek)", "Jalur B (lancar)", "Pasti sama"], correctIdx: 1, explanationTemplate: "Lebih pendek ≠ selalu lebih cepat. Hambatan seperti lampu merah bisa bikin lebih lama.", hints: ["Pertimbangkan hambatan."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["fastest-path"], missionType: "spatial_reasoning" },
  // ── SHAPE ODD ONE ──
  { titleTemplate: "Cari Beda 1", storyTemplate: "🔴 🔵 🔴 🔵 🟢 — mana yang tidak ikut pola?", instructionTemplate: "Mana yang berbeda?", choices: ["🔴", "🟢", "🔵"], correctIdx: 1, explanationTemplate: "Polanya merah-biru. Hijau tidak masuk dalam pola dua warna itu.", hints: ["Lihat warna yang hanya muncul sekali."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["shape-odd-one"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cari Beda 2", storyTemplate: "⬜ ⬜ ⬜ 🔺 ⬜ — mana yang berbeda bentuk?", instructionTemplate: "Mana yang bukan persegi?", choices: ["⬜ pertama", "🔺", "⬜ terakhir"], correctIdx: 1, explanationTemplate: "Semua persegi kecuali segitiga. Segitiga berbeda bentuk!", hints: ["Cari bentuk yang tidak sama."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["shape-odd-one"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cari Beda 3", storyTemplate: "🐱 🐶 🐱 🐰 🐱 — mana hewan yang berbeda?", instructionTemplate: "Cari hewan yang tidak ikut pola.", choices: ["🐱", "🐶", "🐰"], correctIdx: 2, explanationTemplate: "Polanya kucing-anjing. Kelinci tidak masuk pola.", hints: ["Hewan mana yang muncul hanya sekali?"], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["shape-odd-one"], missionType: "spatial_reasoning" },
  { titleTemplate: "Cari Beda 4", storyTemplate: "🟡🟡🟡🔵🟡🟡 — yang beda warna?", instructionTemplate: "Mana yang berbeda?", choices: ["🟡", "🔵", "Tidak ada"], correctIdx: 1, explanationTemplate: "Semua kuning kecuali satu biru. Biru yang berbeda!", hints: ["Cari warna yang berbeda."], basePoint: 45, xpReward: 20, estimatedTime: 70, tags: ["shape-odd-one"], missionType: "spatial_reasoning" },
  // ── VISUAL PATTERN ──
  { titleTemplate: "Pola Visual 1", storyTemplate: "🔺🔺⬜🔺🔺⬜🔺 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🔺", "⬜", "⚪"], correctIdx: 0, explanationTemplate: "Pola: 2 segitiga, 1 kotak, berulang. Setelah kotak → 2 segitiga lagi. Jawab: segitiga pertama.", hints: ["Kelompokkan per 3."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["visual-pattern"], missionType: "spatial_reasoning" },
  { titleTemplate: "Pola Visual 2", storyTemplate: "🌟🌙🌟🌙☀️🌟🌙🌟🌙 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🌟", "🌙", "☀️"], correctIdx: 2, explanationTemplate: "Pola: bintang-bulan-bintang-bulan-matahari — lalu berulang. Setelah bulan terakhir → matahari.", hints: ["Lihat siklus 5."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["visual-pattern"], missionType: "spatial_reasoning" },
  { titleTemplate: "Pola Visual 3", storyTemplate: "🟥🟦🟥🟦🟩 — pola ini rusak di mana?", instructionTemplate: "Mana yang merusak pola?", choices: ["🟥 ke-1", "🟩", "🟦 terakhir"], correctIdx: 1, explanationTemplate: "Polanya merah-biru bergantian. Harusnya biru, bukan hijau!", hints: ["Lihat warna yang tidak sesuai AB."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["visual-pattern"], missionType: "spatial_reasoning" },
  { titleTemplate: "Pola Visual 4", storyTemplate: "🌸🌻🌸🌻🌻🌸🌻🌸 ?", instructionTemplate: "Apa selanjutnya?", choices: ["🌸", "🌻", "🌹"], correctIdx: 1, explanationTemplate: "Pola: pink-kuning-kuning berulang (ABB). Setelah pink → kuning.", hints: ["Perhatikan pengulangan ganda."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["visual-pattern"], missionType: "spatial_reasoning" },
  // ── SPATIAL POSITION ──
  { titleTemplate: "Posisi Relatif 1", storyTemplate: "{name} di baris ke-2 dari depan. Ada 4 baris.", instructionTemplate: "{name} di baris ke berapa dari belakang?", choices: ["Ke-1", "Ke-3", "Ke-2"], correctIdx: 1, explanationTemplate: "Total 4 baris. Dari depan ke-2 → dari belakang ke-3 (4-2+1=3).", hints: ["Hitung dari belakang."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["spatial-position"], missionType: "spatial_reasoning" },
  { titleTemplate: "Posisi Relatif 2", storyTemplate: "Apel di antara jeruk dan mangga. Jeruk di kiri apel.", instructionTemplate: "Di mana mangga?", choices: ["Kiri apel", "Kanan apel", "Atas apel"], correctIdx: 1, explanationTemplate: "Jeruk - Apel - Mangga. Mangga di kanan apel.", hints: ["Susun posisinya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["spatial-position"], missionType: "spatial_reasoning" },
  { titleTemplate: "Posisi Relatif 3", storyTemplate: "{name} lebih tinggi dari Budi, lebih pendek dari Cici.", instructionTemplate: "Siapa yang paling tinggi?", choices: ["{name}", "Budi", "Cici"], correctIdx: 2, explanationTemplate: "Cici > {name} > Budi. Cici paling tinggi.", hints: ["Urutkan dari yang terpendek."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["spatial-position"], missionType: "spatial_reasoning" },
  { titleTemplate: "Posisi Grid", storyTemplate: "Grid 3×3. Bintang di (1,1). Hati di (3,3).", instructionTemplate: "Mana yang di pojok kiri atas?", choices: ["Bintang", "Hati", "Tengah"], correctIdx: 0, explanationTemplate: "Pojok kiri atas = baris 1, kolom 1 = posisi Bintang ⭐.", hints: ["(1,1) = pojok kiri atas."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["spatial-position"], missionType: "spatial_reasoning" },
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
  { titleTemplate: "Bicara Baik", storyTemplate: "{name} melihat temannya berbuat salah kecil.", instructionTemplate: "Apa yang sebaiknya dikatakan?", choices: ["Mengejek di depan umum", "Menasihati dengan lembut secara pribadi", "Diam saja"], correctIdx: 1, explanationTemplate: "Nasihat yang baik disampaikan dengan lembut dan empat mata. Menjaga aib saudara adalah ibadah.", hints: ["Jangan mempermalukan."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["nasihat"], missionType: "moral_decision", adabFeedbackTemplate: "Nasihat dengan lembut menyentuh hati. 💬" },
  { titleTemplate: "Memaafkan", storyTemplate: "Sahabat {name} berbuat salah dan meminta maaf sambil menangis.", instructionTemplate: "Sikap terbaik?", choices: ["Diam dan mendendam", "Maafkan dengan tulus", "Memo honor kesalahannya terus"], correctIdx: 1, explanationTemplate: "Memaafkan adalah sifat mulia. Allah Maha Pemaaf dan menyukai hamba-Nya yang pemaaf.", hints: ["Allah menyukai pemaaf."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["maaf"], missionType: "moral_decision", adabFeedbackTemplate: "Memaafkan membebaskan hati. 🕊️" },
  { titleTemplate: "Menolong", storyTemplate: "Orang tua kesusahan menyeberang jalan yang ramai.", instructionTemplate: "Apa yang {name} lakukan?", choices: ["Lanjut jalan saja", "Tawarkan bantuan untuk menyeberangkan", "Tonton dari jauh"], correctIdx: 1, explanationTemplate: "Menolong yang membutuhkan adalah akhlak mulia. Sekecil apapun bantuan, Allah melihatnya.", hints: ["Mereka butuh bantuanmu."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["tolong"], missionType: "moral_decision", adabFeedbackTemplate: "Menolong sesama adalah ibadah. 🤝" },
  { titleTemplate: "Disiplin Waktu", storyTemplate: "{name} punya janji jam 3. Sekarang jam 2:50. Perjalanan 15 menit.", instructionTemplate: "Apa yang sebaiknya dilakukan?", choices: ["Santai dulu, telat dikit tidak apa", "Segera berangkat agar tepat waktu", "Batalkan saja"], correctIdx: 1, explanationTemplate: "Tepat waktu adalah akhlak mulia. Menghargai waktu sendiri dan orang lain.", hints: ["Jangan sampai terlambat."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["disiplin"], missionType: "moral_decision", adabFeedbackTemplate: "Disiplin waktu adalah akhlak. ⏰" },
  { titleTemplate: "Dilema Teman", storyTemplate: "Dua sahabat {name} bertengkar. Keduanya minta {name} memihak.", instructionTemplate: "Sikap paling bijaksana?", choices: ["Pilih yang lebih dekat", "Dengarkan keduanya, bantu damai tanpa memihak", "Jauhi keduanya"], correctIdx: 1, explanationTemplate: "Mendamaikan tanpa memihak adalah kebijaksanaan. Rasulullah ﷺ selalu mendamaikan dengan adil.", hints: ["Jangan menambah perpecahan."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["dilema"], missionType: "moral_decision", adabFeedbackTemplate: "Pendamai diberkahi Allah. ☮️" },
  { titleTemplate: "Bersyukur Atas Nikmat", storyTemplate: "{name} punya rumah sederhana. Temannya punya rumah besar.", instructionTemplate: "Sikap terbaik?", choices: ["Mengeluh ingin rumah besar", "Alhamdulillah, syukuri apa yang ada", "Jauhi teman itu"], correctIdx: 1, explanationTemplate: "Lihatlah yang di bawah dalam hal dunia. Allah menyukai hamba yang qana'ah (merasa cukup).", hints: ["Banyak yang tidak punya rumah."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["syukur"], missionType: "moral_decision", adabFeedbackTemplate: "Qana'ah adalah kekayaan sejati. 🌟" },
];

// ─── PENALARAN ───
const PENALARAN_TEMPLATES: StageTemplate[] = [
  { titleTemplate: "Logika Sederhana", storyTemplate: "Semua {animal} berkaki 4. Si Manis adalah {animal}.", instructionTemplate: "Si Manis berkaki berapa?", choices: ["2", "4", "Tidak tahu"], correctIdx: 1, explanationTemplate: "Karena semua {animal} berkaki 4, maka Si Manis juga berkaki 4.", hints: ["Gunakan premisnya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["silogisme"], missionType: "general_reasoning" },
  { titleTemplate: "Urutan Umur", storyTemplate: "{a} lebih tua dari {b}. {b} lebih tua dari {c}.", instructionTemplate: "Siapa yang paling muda?", choices: ["{a}", "{b}", "{c}"], correctIdx: 2, explanationTemplate: "Urutan dari tua ke muda: {a} > {b} > {c}. {c} paling muda.", hints: ["Urutkan."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["urutan"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Profesi", storyTemplate: "Orang ini pakai seragam, bawa tas surat, naik motor.", instructionTemplate: "Profesi apa?", choices: ["Dokter", "Pak Pos", "Guru"], correctIdx: 1, explanationTemplate: "Pak Pos tugasnya mengantar surat dan paket.", hints: ["Yang suka mengantar."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["deduksi"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Benda", storyTemplate: "Terbuat dari kaca, tembus pandang, ada di rumah.", instructionTemplate: "Benda apa?", choices: ["Pintu kayu", "Jendela kaca", "Tembok bata"], correctIdx: 1, explanationTemplate: "Jendela terbuat dari kaca dan tembus pandang.", hints: ["Yang tembus pandang."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["deduksi"], missionType: "general_reasoning" },
  { titleTemplate: "Logika Jika-Maka", storyTemplate: "Jika hujan, {name} bawa payung. Sekarang hujan.", instructionTemplate: "Apa yang terjadi?", choices: ["{name} tidak bawa payung", "{name} bawa payung", "Tidak bisa disimpulkan"], correctIdx: 1, explanationTemplate: "Karena jika hujan → bawa payung, dan sekarang hujan, maka {name} bawa payung.", hints: ["Ikuti logikanya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["implikasi"], missionType: "general_reasoning" },
  { titleTemplate: "Paradoks", storyTemplate: "{name} bilang 'Aku selalu berbohong'.", instructionTemplate: "Apakah {name} jujur?", choices: ["Ya, dia jujur", "Tidak mungkin, ini kontradiksi", "Mungkin saja"], correctIdx: 1, explanationTemplate: "Ini paradoks: kalau dia jujur berarti dia berbohong, dan sebaliknya!", hints: ["Pikirkan bolak-balik."], basePoint: 65, xpReward: 40, estimatedTime: 100, tags: ["paradoks"], missionType: "general_reasoning" },
  { titleTemplate: "Silogisme Negatif", storyTemplate: "Tidak ada burung yang bisa berenang. Penguin adalah burung.", instructionTemplate: "Apakah penguin bisa berenang?", choices: ["Tidak bisa", "Bisa", "Tidak tahu"], correctIdx: 0, explanationTemplate: "Premis: tidak ada burung bisa berenang. Penguin burung → penguin tidak bisa berenang. (Ini logika deduktif — meski di alam nyata penguin bisa berenang, secara logika formal mengikuti premis.)", hints: ["Ikuti premisnya, bukan fakta alam."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["silogisme"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Tempat", storyTemplate: "Tempat ini punya banyak buku, sunyi, orang datang untuk membaca.", instructionTemplate: "Tempat apa ini?", choices: ["Pasar", "Perpustakaan", "Taman"], correctIdx: 1, explanationTemplate: "Perpustakaan: banyak buku, sunyi, tempat membaca.", hints: ["Banyak buku."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["deduksi"], missionType: "general_reasoning" },
  { titleTemplate: "Logika Atau", storyTemplate: "{name} bisa memilih: bermain bola ATAU membaca buku. {name} tidak membaca buku.", instructionTemplate: "Apa yang dilakukan {name}?", choices: ["Bermain bola", "Membaca buku", "Tidur"], correctIdx: 0, explanationTemplate: "Pilihan hanya 2: bola atau buku. Tidak baca buku → pasti bermain bola.", hints: ["Hanya ada dua pilihan."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["logika-atau"], missionType: "general_reasoning" },
  { titleTemplate: "Kesimpulan Terbaik", storyTemplate: "Hari ini mendung tebal. Jalanan mulai basah.", instructionTemplate: "Kesimpulan paling masuk akal?", choices: ["Pasti hujan", "Kemungkinan besar hujan", "Jalanan basah karena disiram"], correctIdx: 1, explanationTemplate: "Mendung + jalan basah → kemungkinan besar hujan. Tapi tidak pasti 100% (bisa saja disiram).", hints: ["Cari yang paling mungkin, bukan yang pasti."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["kesimpulan"], missionType: "general_reasoning" },
];

// ════════════════════════════════════════════════════════
// LOGIKA EXPANDED — dedicated challenge types
// (detective_clues, guess_rule, choose_conclusion, true_false,
//  color_code, logic_pattern, cause_effect, constraint_reasoning)
// ════════════════════════════════════════════════════════

const LOGIKA_EXPANDED_TEMPLATES: StageTemplate[] = [
  // ── DETECTIVE CLUES ──
  { titleTemplate: "Detektif 1", storyTemplate: "Kue hilang dari meja. Petunjuk: ada remah di dekat kandang anjing. Piring jatuh di lantai.", instructionTemplate: "Siapa yang paling mungkin mengambil kue?", choices: ["{name}", "Anjing peliharaan", "Tikus"], correctIdx: 1, explanationTemplate: "Remah dekat kandang anjing + piring jatuh (anjing tidak bisa letakkan pelan) → anjing peliharaan.", hints: ["Ikuti petunjuk remah."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["detective-clues"], missionType: "general_reasoning" },
  { titleTemplate: "Detektif 2", storyTemplate: "Pintu terbuka. Jejak kaki kecil dan basah menuju dapur. Ada bekas tangan di kulkas.", instructionTemplate: "Apa yang terjadi?", choices: ["Pencuri masuk", "Adik kecil ambil minum", "Angin membuka pintu"], correctIdx: 1, explanationTemplate: "Jejak kaki kecil + basah (baru main hujan?) + bekas tangan di kulkas → adik kecil ambil minum setelah main luar.", hints: ["Jejak kaki kecil = orang kecil."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["detective-clues"], missionType: "general_reasoning" },
  { titleTemplate: "Detektif 3", storyTemplate: "Tanaman layu. Tanah kering. Ada kalender penyiraman yang dicoret-coret.", instructionTemplate: "Kenapa tanaman layu?", choices: ["Kena hama", "Lupa disiram", "Terlalu banyak air"], correctIdx: 1, explanationTemplate: "Tanah kering + kalender dicoret = jadwal penyiraman tidak diikuti → lupa disiram.", hints: ["Lihat kondisi tanah."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["detective-clues"], missionType: "general_reasoning" },
  { titleTemplate: "Detektif 4", storyTemplate: "Lampu kamar menyala jam 2 pagi. Ada buku di atas kasur. {name} bangun terlambat.", instructionTemplate: "Apa yang terjadi tadi malam?", choices: ["{name} begadang baca buku", "Listrik mati nyala", "Hantu"], correctIdx: 0, explanationTemplate: "Lampu menyala + buku di kasur + bangun terlambat → begadang membaca.", hints: ["Apa yang dilakukan dengan buku dan lampu?"], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["detective-clues"], missionType: "general_reasoning" },
  { titleTemplate: "Detektif 5", storyTemplate: "3 tersangka pencuri koin. A: 'Aku di taman'. B: 'Aku di kamar'. C: 'Aku di dapur'. Koin ditemukan di taman.", instructionTemplate: "Siapa yang paling mencurigakan?", choices: ["A (di taman)", "B (di kamar)", "C (di dapur)"], correctIdx: 0, explanationTemplate: "Koin ditemukan di taman, A mengaku di taman → A punya kesempatan paling besar.", hints: ["Cocokkan lokasi koin dengan alibi."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["detective-clues"], missionType: "general_reasoning" },
  // ── GUESS RULE ──
  { titleTemplate: "Tebak Aturan 1", storyTemplate: "Masukan 2 → keluar 4. Masukan 3 → keluar 6. Masukan 5 → keluar 10.", instructionTemplate: "Aturannya apa?", choices: ["Ditambah 2", "Dikali 2", "Dikurangi 1"], correctIdx: 1, explanationTemplate: "2→4 (×2), 3→6 (×2), 5→10 (×2). Aturan: dikali 2.", hints: ["Coba operasi matematika."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["guess-rule"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Aturan 2", storyTemplate: "🔴→🟢, 🔵→🟣, 🟡→🟠. Aturan: warna berubah jadi...?", instructionTemplate: "Apa aturannya?", choices: ["Lebih gelap", "Lebih terang", "Campur dengan merah"], correctIdx: 2, explanationTemplate: "Merah+hijau=campur merah? Bukan. Lihat: merah→hijau (bukan campuran). Biru→ungu (biru+merah=ungu). Kuning→oranye (kuning+merah=oranye). Aturan: dicampur merah!", hints: ["Warna baru = warna lama + ?"], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["guess-rule"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Aturan 3", storyTemplate: "KATA → TAKA. BUKU → KUBU. KAMU → ?", instructionTemplate: "Kata selanjutnya?", choices: ["KUMA", "UMAK", "MAKU"], correctIdx: 1, explanationTemplate: "Aturan: balik urutan huruf. KATA→TAKA, BUKU→KUBU, KAMU→UMAK.", hints: ["Lihat posisi huruf."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["guess-rule"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Aturan 4", storyTemplate: "1+2=3, 3+4=7, 5+6=11. Tapi 2+3=5, 4+5=9. Aturannya?", instructionTemplate: "Apa aturan deret ini?", choices: ["Angka berurutan dijumlahkan", "Dua angka ganjil", "Semua angka kecil"], correctIdx: 0, explanationTemplate: "Setiap pasangan adalah dua angka berurutan yang dijumlahkan.", hints: ["Lihat pola pasangannya."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["guess-rule"], missionType: "general_reasoning" },
  { titleTemplate: "Tebak Aturan 5", storyTemplate: "🐱🐶 → 2, 🐱🐶🐰 → 3, 🐱🐶🐰🐼 → 4.", instructionTemplate: "Aturannya?", choices: ["Jumlah hewan", "Jenis hewan", "Warna hewan"], correctIdx: 0, explanationTemplate: "Output = jumlah hewan. Sederhana! Tapi jangan tertipu.", hints: ["Hitung jumlahnya."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["guess-rule"], missionType: "general_reasoning" },
  // ── CHOOSE CONCLUSION ──
  { titleTemplate: "Kesimpulan 1", storyTemplate: "Semua guru sabar. Bu Ani adalah guru.", instructionTemplate: "Kesimpulan yang tepat?", choices: ["Bu Ani sabar", "Semua orang sabar", "Tidak bisa disimpulkan"], correctIdx: 0, explanationTemplate: "Silogisme klasik: Semua A = B. C adalah A. Maka C = B.", hints: ["Gunakan logika A=B, C=A → C=B."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["choose-conclusion"], missionType: "general_reasoning" },
  { titleTemplate: "Kesimpulan 2", storyTemplate: "Beberapa kucing suka ikan. Si Manis adalah kucing.", instructionTemplate: "Kesimpulan?", choices: ["Si Manis pasti suka ikan", "Si Manis mungkin suka ikan", "Si Manis tidak suka ikan"], correctIdx: 1, explanationTemplate: "'Beberapa' bukan 'semua'. Si Manis mungkin suka, mungkin juga tidak.", hints: ["'Beberapa' ≠ 'semua'."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["choose-conclusion"], missionType: "general_reasoning" },
  { titleTemplate: "Kesimpulan 3", storyTemplate: "Setiap kali {name} belajar, nilainya bagus. Hari ini {name} belajar.", instructionTemplate: "Kesimpulan terbaik?", choices: ["Nilainya pasti bagus", "Nilainya mungkin bagus", "Tidak ada hubungan"], correctIdx: 0, explanationTemplate: "Dari pola: belajar → nilai bagus. Hari ini belajar → nilai bagus (modus ponens).", hints: ["Jika A maka B. A terjadi → ?"], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["choose-conclusion"], missionType: "general_reasoning" },
  { titleTemplate: "Kesimpulan 4", storyTemplate: "Jika tidak hujan, {name} pergi ke taman. {name} tidak pergi ke taman.", instructionTemplate: "Kesimpulan?", choices: ["Pasti hujan", "Mungkin hujan", "Pasti tidak hujan"], correctIdx: 0, explanationTemplate: "Modus tollens: Jika tidak hujan → ke taman. Tidak ke taman → hujan.", hints: ["Jika tidak A maka B. Tidak B → ?"], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["choose-conclusion"], missionType: "general_reasoning" },
  // ── TRUE FALSE ──
  { titleTemplate: "Benar Salah 1", storyTemplate: "Pernyataan: 'Semua burung bisa terbang.'", instructionTemplate: "Benar atau salah?", choices: ["Benar", "Salah", "Tergantung"], correctIdx: 1, explanationTemplate: "Salah! Penguin dan burung unta adalah burung yang tidak bisa terbang.", hints: ["Pikirkan burung yang tidak terbang."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["true-false"], missionType: "general_reasoning" },
  { titleTemplate: "Benar Salah 2", storyTemplate: "{name} berkata: '2+2=5'. Budi berkata: 'Bumi bulat'.", instructionTemplate: "Siapa yang benar?", choices: ["{name}", "Budi", "Keduanya"], correctIdx: 1, explanationTemplate: "2+2=4, bukan 5. Bumi memang bulat. Budi benar.", hints: ["Cek faktanya."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["true-false"], missionType: "general_reasoning" },
  { titleTemplate: "Benar Salah 3", storyTemplate: "Pernyataan: 'Jika semua A adalah B, maka semua B adalah A.'", instructionTemplate: "Pernyataan ini benar?", choices: ["Benar", "Salah", "Tergantung"], correctIdx: 1, explanationTemplate: "Salah! Contoh: semua kucing (A) adalah hewan (B), tapi tidak semua hewan (B) adalah kucing (A).", hints: ["Coba contoh kucing dan hewan."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["true-false"], missionType: "general_reasoning" },
  { titleTemplate: "Benar Salah 4", storyTemplate: "Ada 3 kotak. Kotak 1: 'Hadiah di sini'. Kotak 2: 'Hadiah tidak di sini'. Kotak 3: 'Hadiah tidak di kotak 1'. Hanya satu yang benar.", instructionTemplate: "Di mana hadiahnya?", choices: ["Kotak 1", "Kotak 2", "Kotak 3"], correctIdx: 1, explanationTemplate: "Uji: Jika hadiah di kotak 2 → pernyataan 1 salah, pernyataan 2 salah, pernyataan 3 benar → hanya satu benar. Cocok! Di kotak 2.", hints: ["Uji satu per satu."], basePoint: 70, xpReward: 45, estimatedTime: 120, tags: ["true-false"], missionType: "general_reasoning" },
  // ── COLOR CODE ──
  { titleTemplate: "Kode Warna 1", storyTemplate: "🟥=1, 🟦=2, 🟥🟦 = ?", instructionTemplate: "Berapa nilai 🟥🟦?", choices: ["12", "3", "21"], correctIdx: 0, explanationTemplate: "Merah=1, Biru=2. Urutan: merah lalu biru = 12. Ini kode posisi!", hints: ["Baca urut, bukan jumlah."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["color-code"], missionType: "general_reasoning" },
  { titleTemplate: "Kode Warna 2", storyTemplate: "🟢=A, 🟡=B, 🟣=C. 🟢🟣🟡 artinya?", instructionTemplate: "Apa kata yang terbentuk?", choices: ["ACB", "ABC", "CAB"], correctIdx: 0, explanationTemplate: "Hijau=A, Ungu=C, Kuning=B → A C B.", hints: ["Terjemahkan satu per satu."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["color-code"], missionType: "general_reasoning" },
  { titleTemplate: "Kode Warna 3", storyTemplate: "🔴+🔵=🟣. 🔴+🟡=🟠. 🔵+🟡=🟢.", instructionTemplate: "🔴+🔵+🟡 menjadi warna apa?", choices: ["Coklat", "Hitam", "Putih"], correctIdx: 0, explanationTemplate: "Campuran merah+biru+kuning = coklat (warna lumpur).", hints: ["Campur semua warna primer."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["color-code"], missionType: "general_reasoning" },
  { titleTemplate: "Kode Warna Pola", storyTemplate: "🔴🔵🔴🔵🟡 — kode rusak! Harusnya 🔴🔵🔴🔵?", instructionTemplate: "Warna apa yang harus menggantikan 🟡?", choices: ["🔴", "🔵", "🟢"], correctIdx: 0, explanationTemplate: "Polanya AB AB: merah-biru-merah-biru. Setelah biru → merah.", hints: ["Lihat pola warnanya."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["color-code"], missionType: "general_reasoning" },
  // ── LOGIC PATTERN ──
  { titleTemplate: "Pola Logika 1", storyTemplate: "A, B, D, G, K, ?", instructionTemplate: "Huruf selanjutnya?", choices: ["L", "P", "M"], correctIdx: 1, explanationTemplate: "Jarak: A→B(+1), B→D(+2), D→G(+3), G→K(+4), K→P(+5).", hints: ["Hitung lompatan huruf."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["logic-pattern"], missionType: "general_reasoning" },
  { titleTemplate: "Pola Logika 2", storyTemplate: "2, 6, 12, 20, 30, ?", instructionTemplate: "Angka selanjutnya?", choices: ["40", "42", "36"], correctIdx: 1, explanationTemplate: "Selisih: +4, +6, +8, +10, +12. 30+12=42.", hints: ["Lihat selisih antar angka."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["logic-pattern"], missionType: "general_reasoning" },
  { titleTemplate: "Pola Logika 3", storyTemplate: "3, 3, 6, 18, 72, ?", instructionTemplate: "Angka selanjutnya?", choices: ["144", "360", "288"], correctIdx: 1, explanationTemplate: "×1, ×2, ×3, ×4, ×5. 72×5=360.", hints: ["Lihat pengali: ×1, ×2, ×3, ..."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["logic-pattern"], missionType: "general_reasoning" },
  { titleTemplate: "Pola Logika 4", storyTemplate: "🔴🔵🟢🔴🔵🟢🔴?", instructionTemplate: "Apa selanjutnya?", choices: ["🔵", "🟢", "🔴"], correctIdx: 0, explanationTemplate: "Siklus 3: merah-biru-hijau. Setelah merah → biru.", hints: ["Siklus 3 warna."], basePoint: 50, xpReward: 25, estimatedTime: 80, tags: ["logic-pattern"], missionType: "general_reasoning" },
  // ── CAUSE EFFECT ──
  { titleTemplate: "Sebab Akibat 1", storyTemplate: "Setiap kali {name} makan es krim terlalu cepat, kepalanya pusing.", instructionTemplate: "Apa penyebab pusing?", choices: ["Es krim", "Makan terlalu cepat", "Tidak tahu"], correctIdx: 1, explanationTemplate: "Es krim sendiri tidak sebabkan pusing (dimakan pelan pun tetap dingin). Tapi MAKAN CEPAT yang menyebabkan brain freeze.", hints: ["Perhatikan kata 'terlalu cepat'."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["cause-effect"], missionType: "general_reasoning" },
  { titleTemplate: "Sebab Akibat 2", storyTemplate: "Tanaman di pot A subur, pot B layu. Pot A disiram tiap pagi.", instructionTemplate: "Kenapa pot B layu?", choices: ["Kurang air", "Terlalu banyak matahari", "Tidak tahu pasti"], correctIdx: 2, explanationTemplate: "Kita hanya tahu pot A disiram. Tidak ada info tentang pot B. Bisa kurang air, bisa kena hama, bisa lainnya.", hints: ["Jangan berasumsi tanpa data."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["cause-effect"], missionType: "general_reasoning" },
  { titleTemplate: "Sebab Akibat 3", storyTemplate: "Nilai ujian {name} turun setelah mulai sering main game. Sebelumnya nilainya bagus.", instructionTemplate: "Kesimpulan paling mungkin?", choices: ["Game sebabkan nilai turun", "Kebetulan saja", "Gurunya galak"], correctIdx: 0, explanationTemplate: "Korelasi kuat: sebelum game → bagus, setelah game → turun. Kemungkinan besar game penyebabnya (mengurangi waktu belajar).", hints: ["Lihat apa yang berubah."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["cause-effect"], missionType: "general_reasoning" },
  // ── CONSTRAINT REASONING ──
  { titleTemplate: "Batasan 1", storyTemplate: "{name} harus membagi 5 permen ke 3 teman. Setiap teman minimal dapat 1.", instructionTemplate: "Mana pembagian yang mungkin?", choices: ["2,2,1", "3,3,0", "5,0,0"], correctIdx: 0, explanationTemplate: "Total 5, masing-masing minimal 1. 2+2+1=5 ✓. Yang lain ada yang dapat 0 → melanggar.", hints: ["Semua harus dapat minimal 1."], basePoint: 55, xpReward: 30, estimatedTime: 90, tags: ["constraint"], missionType: "general_reasoning" },
  { titleTemplate: "Batasan 2", storyTemplate: "Jadwal: A tidak bisa Senin. B harus sebelum C. C hanya bisa Rabu & Kamis.", instructionTemplate: "Kapan B bisa?", choices: ["Senin atau Selasa", "Selasa atau Rabu", "Kamis saja"], correctIdx: 0, explanationTemplate: "C hanya Rabu/Kamis. B harus sebelum C → B bisa Senin/Selasa (sebelum Rabu) atau Selasa/Rabu (tapi Rabu sudah C). Jadi B: Senin atau Selasa.", hints: ["B harus lebih dulu dari C."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["constraint"], missionType: "general_reasoning" },
  { titleTemplate: "Batasan 3", storyTemplate: "3 orang antri: X tidak boleh paling depan. Y harus di belakang Z.", instructionTemplate: "Siapa yang mungkin paling depan?", choices: ["X", "Z", "Y"], correctIdx: 1, explanationTemplate: "X tidak boleh depan. Y harus di belakang Z → Z harus di depan Y. Z bisa paling depan.", hints: ["Eliminasi yang tidak mungkin."], basePoint: 60, xpReward: 35, estimatedTime: 100, tags: ["constraint"], missionType: "general_reasoning" },
  { titleTemplate: "Batasan 4", storyTemplate: "4 kursi berjejer. A tidak mau di ujung. B harus di samping A.", instructionTemplate: "Di mana A duduk?", choices: ["Kursi 1 atau 4", "Kursi 2 atau 3", "Tidak bisa ditentukan"], correctIdx: 1, explanationTemplate: "4 kursi (1-2-3-4). A tidak ujung → hanya 2 atau 3. B di samping A → bisa di 1-2 atau 3-4. A di 2 atau 3.", hints: ["Ujung = kursi 1 dan 4."], basePoint: 65, xpReward: 40, estimatedTime: 110, tags: ["constraint"], missionType: "general_reasoning" },
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
    "tk-visual": [...TK_VISUAL_TEMPLATES, ...SPASIAL_EXPANDED_TEMPLATES.filter(t => ["shadow-match","shape-odd-one","visual-pattern","spatial-position"].some(tag => t.tags.includes(tag)))],
    "tk-pola": [...TK_POLA_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES.filter(t => ["guess-rule","logic-pattern","true-false","color-code"].some(tag => t.tags.includes(tag)))],
    "tk-kreativitas": TK_KREATIVITAS_TEMPLATES,
  },
  "sd-bawah": {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": [...SPASIAL_TEMPLATES, ...SPASIAL_EXPANDED_TEMPLATES],
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": [...PENALARAN_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
  },
  "sd-atas": {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": [...SPASIAL_TEMPLATES, ...SPASIAL_EXPANDED_TEMPLATES],
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": [...PENALARAN_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
  },
  smp: {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": [...SPASIAL_TEMPLATES, ...SPASIAL_EXPANDED_TEMPLATES],
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": [...PENALARAN_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
  },
  sma: {
    "literasi-numerasi": LITERASI_NUMERASI_TEMPLATES,
    "spasial": [...SPASIAL_TEMPLATES, ...SPASIAL_EXPANDED_TEMPLATES],
    "pola": POLA_TEMPLATES,
    "systems": SYSTEMS_TEMPLATES,
    "moral": MORAL_TEMPLATES,
    "kreativitas": KREATIVITAS_TEMPLATES,
    "penalaran": [...PENALARAN_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
  },
  universitas: {
    "advanced-reasoning": [...ADVANCED_REASONING_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
    "systems-kompleks": [...ADVANCED_REASONING_TEMPLATES, ...SYSTEMS_TEMPLATES],
    "ethical-leadership": [...ADVANCED_REASONING_TEMPLATES, ...MORAL_TEMPLATES],
    "argument-evaluation": [...ADVANCED_REASONING_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
    "quantitative-logic": [...ADVANCED_REASONING_TEMPLATES, ...LITERASI_NUMERASI_TEMPLATES],
    "strategic-decision": [...ADVANCED_REASONING_TEMPLATES, ...SPASIAL_EXPANDED_TEMPLATES],
    "problem-solving": [...ADVANCED_REASONING_TEMPLATES, ...LOGIKA_EXPANDED_TEMPLATES],
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
  mapSegmentId: string,
  backgroundTheme: string,
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

  // Derive challengeType from tags (kebab-case → snake_case mapping)
  const TAG_TO_CHALLENGE: Record<string, string> = {
    "shadow-match": "shadow_match",
    "position-shift": "position_shift",
    "fastest-path": "fastest_path",
    "shape-odd-one": "shape_odd_one",
    "visual-pattern": "visual_pattern",
    "spatial-position": "spatial_position",
    "detective-clues": "detective_clues",
    "guess-rule": "guess_rule",
    "choose-conclusion": "choose_conclusion",
    "true-false": "true_false",
    "color-code": "color_code",
    "logic-pattern": "logic_pattern",
    "cause-effect": "cause_effect",
    "constraint": "constraint_reasoning",
    "arithmetic": "numeracy_basic",
    "dilema": "dilemma_wisdom",
    "nasihat": "gentle_advice",
    "pemimpin": "best_attitude",
    "adil": "best_attitude",
    "maaf": "best_attitude",
    "tolong": "best_attitude",
    "disiplin": "best_attitude",
    "syukur": "best_attitude",
    "jujur": "best_attitude",
    "sabar": "best_attitude",
    "toleransi": "best_attitude",
    "amanah": "best_attitude",
    "rendah-hati": "best_attitude",
  };
  let challengeType: string = tpl.missionType;
  for (const tag of tpl.tags) {
    if (TAG_TO_CHALLENGE[tag]) {
      challengeType = TAG_TO_CHALLENGE[tag];
      break;
    }
  }

  return {
    id: `${difficulty}-${stageNumber}`,
    stageNumber,
    difficulty,
    mapSegmentId,
    backgroundTheme,
    category,
    stageType,
    challengeType: challengeType as any,
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
    worldArea: mapSegmentId,
    isBossMission: isBoss,
  };
}

// ════════════════════════════════════════════════════════
// Main Generator: Produce 500 stages per difficulty
// ════════════════════════════════════════════════════════

export function generateStagesForDifficulty(difficulty: DifficultyId): Stage[] {
  const worlds = WORLDS_BY_DIFFICULTY[difficulty];
  if (!worlds) return [];

  const templates = TEMPLATE_BANK[difficulty];
  if (!templates) return [];

  const availableCategories = Object.keys(templates) as CategoryId[];
  const rand = rng(difficulty.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 12345);

  const stages: Stage[] = [];
  const seenIds = new Set<string>();

  let globalStageNum = 0;
  let lastAdabStage = 0;
  const recentCategories: CategoryId[] = [];
  const recentMissionTypes: string[] = [];

  for (const world of worlds) {
    const worldStageCount = world.stageRange[1] - world.stageRange[0] + 1;
    for (let i = 0; i < worldStageCount; i++) {
      globalStageNum++;
      const stageNum = globalStageNum;
      const isBoss = world.bossStages.includes(stageNum);
      const stageType: StageType = isBoss ? "boss" : (i + 1 === worldStageCount && worldStageCount > 10 ? "review" : "mission");

      // Adab mixing: force adab/moral/ethical every 4-6 stages
      let categoryChoice: CategoryId;
      const adabCategories = availableCategories.filter(c => c.includes("adab") || c === "moral" || c === "ethical-leadership");
      const shouldForceAdab = adabCategories.length > 0 && (stageNum - lastAdabStage >= randInt(4, 6, rand));

      if (shouldForceAdab) {
        categoryChoice = pick(adabCategories, rand);
        lastAdabStage = stageNum;
      } else {
        let validCats = availableCategories.filter(c => !adabCategories.includes(c));
        if (validCats.length === 0) validCats = [...availableCategories];

        // No 3 consecutive same categories
        const len = recentCategories.length;
        if (len >= 2 && recentCategories[len - 1] === recentCategories[len - 2]) {
          validCats = validCats.filter(c => c !== recentCategories[len - 1]);
          if (validCats.length === 0) validCats = availableCategories.filter(c => !adabCategories.includes(c));
        }

        // Prevent numerasi domination: reduce weight if numerasi appeared recently
        const numerasiCats = ["literasi-numerasi", "tk-pra-literasi", "tk_counting"];
        const recentNumerasi = recentCategories.filter(c => numerasiCats.includes(c)).length;
        if (recentNumerasi >= 2 && recentCategories.length >= 4) {
          validCats = validCats.filter(c => !numerasiCats.includes(c));
          if (validCats.length <= 1) {
            // Too restrictive, allow one numerasi back
            validCats = availableCategories.filter(c => !adabCategories.includes(c));
          }
        }

        // Natural alternation: bias towards categories NOT seen in last 2
        const last2 = recentCategories.slice(-2);
        const freshCats = validCats.filter(c => !last2.includes(c));
        if (freshCats.length >= 2) {
          // 70% chance to pick from fresh categories
          if (rand() < 0.7) {
            validCats = freshCats;
          }
        }

        if (validCats.length === 0) validCats = [...availableCategories];
        categoryChoice = pick(validCats, rand);
      }

      const catTemplates = templates[categoryChoice];
      let validTpls = catTemplates;
      
      // No 3 consecutive same challengeTypes
      const lenMt = recentMissionTypes.length;
      if (lenMt >= 2 && recentMissionTypes[lenMt - 1] === recentMissionTypes[lenMt - 2]) {
        validTpls = catTemplates.filter(t => t.missionType !== recentMissionTypes[lenMt - 1]);
        if (validTpls.length === 0) validTpls = catTemplates;
      }

      const tpl = pick(validTpls, rand);

      recentCategories.push(categoryChoice);
      if (recentCategories.length > 8) recentCategories.shift();
      recentMissionTypes.push(tpl.missionType);
      if (recentMissionTypes.length > 3) recentMissionTypes.shift();

      const stage = generateParametrizedStage(
        tpl,
        difficulty,
        stageNum,
        world.id,
        world.backgroundTheme,
        categoryChoice,
        stageType,
        rand,
        isBoss
      );

      // Progressive difficulty scaling for stages 301-500
      if (stageNum >= 401) {
        // Expert: +40% points, +15% xp
        stage.basePoint = Math.round(stage.basePoint * 1.4);
        stage.xpReward = Math.round(stage.xpReward * 1.15);
        stage.tags.push("expert");
      } else if (stageNum >= 301) {
        // Hard: +25% points, +10% xp
        stage.basePoint = Math.round(stage.basePoint * 1.25);
        stage.xpReward = Math.round(stage.xpReward * 1.1);
        stage.tags.push("hard");
      } else if (stageNum >= 201) {
        // Medium: +12% points, +5% xp
        stage.basePoint = Math.round(stage.basePoint * 1.12);
        stage.xpReward = Math.round(stage.xpReward * 1.05);
        stage.tags.push("medium");
      } else if (stageNum >= 101) {
        // Normal: base values (no scaling)
        stage.tags.push("normal");
      } else {
        // Easy: base values
        stage.tags.push("easy");
      }

      if (seenIds.has(stage.id)) {
        stage.id = `${difficulty}-${stageNum}-${i}`;
      }
      seenIds.add(stage.id);
      stages.push(stage);
    }
  }

  stages.sort((a, b) => a.stageNumber - b.stageNumber);
  return stages;
}
export function generateAllStages(): Stage[] {
  const allStages: Stage[] = [];
  for (const difficulty of ["tk", "sd-bawah", "sd-atas", "smp", "sma", "universitas"] as DifficultyId[]) {
    const stages = generateStagesForDifficulty(difficulty);
    allStages.push(...stages);
  }
  return allStages;
}

/**
 * generateMixedAdventureStages — create mixed-category adventure stages for a difficulty.
 *
 * Produces an ordered sequence of stages where:
 * - Categories are MIXED (no long runs of same category)
 * - Difficulty scales from easy to hard
 * - Boss/review stages at designated intervals
 * - Gift/reward stages sprinkled in
 * - Adab/moral appears every 4-6 stages
 * - No 3 consecutive same category
 * - No 3 consecutive same challengeType
 * - Numerasi doesn't dominate
 * - Spasial and logika alternate naturally
 */
export function generateMixedAdventureStages(difficulty: DifficultyId, totalStages?: number): Stage[] {
  return generateStagesForDifficulty(difficulty);
}

/**
 * Convert a Stage to the legacy Mission format used by the current play system.
 */
export function stageToMission(stage: Stage): import("@/types").Mission {
  // Generate story from inline mini-generator (avoid circular deps)
  const storyData = generateInlineStory(stage);
  
  const mission: any = {
    id: stage.id,
    number: stage.stageNumber,
    title: stage.title,
    difficulty: stage.difficulty,
    gradeRange: getGradeRange(stage.difficulty),
    category: stage.category,
    secondaryCategory: stage.secondaryCategory,
    missionType: stage.missionType,
    worldArea: stage.mapSegmentId,
    mapSegmentId: stage.mapSegmentId,
    backgroundTheme: stage.backgroundTheme,
    challengeType: stage.challengeType,
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
    // Story Adventure fields
    storyTitle: storyData.storyTitle,
    introText: storyData.introText,
    userRoleText: storyData.userRoleText,
    challengeContext: storyData.challengeContext,
    successText: storyData.successText,
    failureText: storyData.failureText,
    worldImpactText: storyData.worldImpactText,
    companionId: storyData.companionId || undefined,
    companionHint: storyData.companionHint,
    ...(stage.adabFeedback ? { adabFeedback: stage.adabFeedback } : {}),
    ...(stage.adabBonus ? { adabBonus: stage.adabBonus } : {}),
  };
  return mission as import("@/types").Mission;
}

// ── Inline Story Generator (avoid circular deps with lib/story-generator) ──
function generateInlineStory(stage: Stage): any {
  const s = stage;
  const n = s.stageNumber;
  const isBoss = s.isBossStage;
  const isFinal = n === 500;
  const ct = (s.challengeType || s.missionType || "").toLowerCase();
  
  // Companion mapping
  let companionId: string | null = null;
  let companionHint = "Kamu pasti bisa! 💪";
  if (ct.includes("moral") || ct.includes("adab") || ct.includes("sikap") || ct.includes("nasihat") || ct.includes("dilema") || ct.includes("urutkan")) {
    companionId = "nara";
    companionHint = "Pilih yang baik ya! ✨";
  } else if (ct.includes("detektif") || ct.includes("tebak") || ct.includes("kesimpulan") || ct.includes("benar") || ct.includes("salah") || ct.includes("warna") || ct.includes("kode") || ct.includes("reasoning") || ct.includes("argument") || ct.includes("strategi") || ct.includes("quantitative")) {
    companionId = "qiro";
    companionHint = "Lihat baik-baik! Perhatikan setiap petunjuk. 🔍";
  } else if (ct.includes("bayangan") || ct.includes("posisi") || ct.includes("jalur") || ct.includes("cari") || ct.includes("berbeda") || ct.includes("spasial") || ct.includes("visual") || ct.includes("pola")) {
    companionId = "luma";
    companionHint = "Perhatikan bentuk dan posisinya dengan teliti. 👁️";
  } else if (ct.includes("boss") || ct.includes("systems") || ct.includes("leadership") || ct.includes("ethical") || ct.includes("case") || ct.includes("problem") || ct.includes("decision")) {
    companionId = "aman";
    companionHint = "Pilih keputusan yang terbaik untuk semua. 🛡️";
  }
  
  // Difficulty-based user title
  const titles: Record<string, string> = { tk: "Penjelajah Kecil", "sd-bawah": "Sahabat Ceria", "sd-atas": "Penjaga Amanah", smp: "Pemecah Masalah", sma: "Calon Pemimpin", universitas: "Calon Mastermind" };
  const userTitle = titles[s.difficulty] || "Calon Mastermind";
  
  // Story title
  const titlePrefix = isFinal ? "🏆 " : isBoss ? "⚔️ " : "";
  const titleBase = isFinal ? `Gerbang Kenaikan — ${({"tk":"TK","sd-bawah":"SD Bawah","sd-atas":"SD Atas",smp:"SMP",sma:"SMA",universitas:"Universitas"})[s.difficulty] || s.difficulty}` : s.title || `Misi ${n}`;
  
  // Intro
  const intros = [
    "Di perjalananmu, kamu menemukan tantangan baru yang menarik.",
    "Petualanganmu sampai di titik yang membutuhkan perhatian.",
    "Sebuah kejutan menanti di depan! Apa yang akan kamu lakukan?",
    "Udara terasa berbeda. Ada sesuatu yang perlu kamu selesaikan.",
  ];
  const introIdx = (n * 7 + s.difficulty.charCodeAt(0)) % intros.length;
  
  // Success
  const successTexts = ["Bagus! Kamu hebat!", "Berhasil! Perjalananmu semakin bersinar.", "Tepat! Satu langkah lebih dekat.", "Kamu keren! Terus melangkah!"];
  const succIdx = (n * 13) % successTexts.length;
  
  // Failure
  const failTexts = ["Belum tepat. Tidak apa-apa, coba lagi!", "Jangan menyerah. Kamu pasti bisa.", "Latihan membuat sempurna. Ayo coba lagi.", "Setiap percobaan adalah pelajaran berharga."];
  const failIdx = (n * 17) % failTexts.length;
  
  // World impact
  const impacts = [
    "Cahaya lembut menyinari jalan di depan.",
    "Bunga kecil bermekaran di pinggir jalan.",
    "Udara sekitar terasa lebih segar.",
    "Langit terlihat sedikit lebih cerah.",
    "Jalan setapak mulai terlihat lebih jelas.",
    "Pohon-pohon di sekitar mulai berdaun kembali.",
  ];
  const impactIdx = (n * 19) % impacts.length;
  
  
  return {
    storyTitle: `${titlePrefix}${titleBase}`,
    introText: intros[introIdx],
    userRoleText: `Sebagai ${userTitle}, ${[`kamu bertekad menyelesaikan tantangan ini!`,`waktunya menunjukkan kemampuanmu!`,`langkahmu semakin dekat ke tujuan!`,`ilmu dan adabmu akan diuji di sini!`][n % 4]}`,
    challengeContext: `${s.instruction || `Selesaikan tantangan pada stage ${n}!`}`,
    successText: isFinal ? `Kamu berhasil melewati Gerbang Kenaikan! Seluruh ${userTitle} di Negeri Cahaya Ilmu merayakan keberhasilanmu.` : successTexts[succIdx],
    failureText: failTexts[failIdx],
    worldImpactText: isFinal ? `Cahaya keemasan menyelimuti seluruh Negeri Cahaya Ilmu. Perjalananmu di tingkat ini membawa perubahan besar!` : impacts[impactIdx],
    companionId,
    companionHint,
  };
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
