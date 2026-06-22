/**
 * Story Generator — creates AdventureStory for every stage
 *
 * Uses templates per challenge type, difficulty, and world theme.
 * All stories are generated deterministically from stage parameters.
 */

import type { DifficultyId, Stage } from "@/types";
import type { AdventureStageStory } from "@/data/adventure-story";
import { getCompanionForChallenge, WORLD_IMPROVEMENTS } from "@/data/adventure-story";

// ── Seeded random ──
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

// ── Difficulty user titles ──
const USER_TITLES: Record<DifficultyId, string> = {
  tk: "Penjelajah Kecil",
  "sd-bawah": "Sahabat Ceria",
  "sd-atas": "Penjaga Amanah",
  smp: "Pemecah Masalah",
  sma: "Calon Pemimpin",
  universitas: "Calon Mastermind",
};

const WORLD_NAME = "Negeri Cahaya Ilmu";

// ════════════════════════════════════════════════════════
// Story Intro Templates per Challenge Type
// Each has multiple variants that are chosen deterministically
// ════════════════════════════════════════════════════════

interface StoryTemplateSet {
  intros: string[];
  challengeContexts: string[];
  successPhrases: string[];
  failurePhrases: string[];
  worldImpacts: string[];
}

const CHALLENGE_STORY_TEMPLATES: Record<string, StoryTemplateSet> = {
  // ─── Cocokkan Bayangan ───
  "match-shadow": {
    intros: [
      "Di sudut ruangan, kamu menemukan pintu yang terkunci oleh siluet misterius.",
      "Dinding gua menampilkan bayangan-bayangan aneh yang menari-nari.",
      "Sebuah peti harta terkunci dan hanya bayangan yang bisa membukanya.",
      "Di depanmu ada cermin ajaib yang menampilkan bentuk-bentuk berbeda.",
    ],
    challengeContexts: [
      "Bantulah menemukan bayangan yang cocok agar pintu terbuka!",
      "Pilih bayangan yang sesuai untuk membuka jalan.",
      "Temukan siluet yang tepat untuk melanjutkan perjalanan.",
      "Cocokkan bentuk bayangan agar peti terbuka.",
    ],
    successPhrases: [
      "Bagus! Pintu terbuka dan jalan di depan menjadi terang.",
      "Kamu hebat! Siluet yang tepat membuka rahasia gua.",
      "Tepat sekali! Bayangan yang cocok membuka peti harta.",
      "Keren! Kamu berhasil membaca bentuk dengan cermat.",
    ],
    failurePhrases: [
      "Belum tepat. Tidak apa-apa, coba perhatikan bentuknya lagi.",
      "Hampir benar! Lihat lagi sudut-sudut bayangannya.",
      "Jangan menyerah. Penjelajah hebat terus mencoba.",
      "Belum cocok. Ingat, perhatikan bentuknya, bukan warnanya.",
    ],
    worldImpacts: [
      "Cahaya kecil mulai berpendar di dinding gua.",
      "Pintu gua berkilau lembut dan udara terasa lebih hangat.",
      "Dinding batu menampilkan pola bercahaya yang indah.",
      "Ruang gua perlahan menjadi lebih terang.",
    ],
  },

  // ─── Ubah Posisi ───
  "change-position": {
    intros: [
      "Apel ajaib di taman bergerak mengikuti arah panah misterius.",
      "Benda-benda di meja laboratorium tiba-tiba berpindah posisi.",
      "Sebuah puzzle arah muncul di lantai ruangan.",
      "Kotak-kotak mainan bergerak sendiri mengikuti pola tertentu.",
    ],
    challengeContexts: [
      "Ikuti gerakannya dan tentukan di mana benda itu berhenti.",
      "Lacak perpindahannya dengan cermat untuk menemukan posisi akhir.",
      "Bantulah melacak langkah demi langkah pergerakannya.",
      "Tentukan posisi terakhir setelah semua perpindahan.",
    ],
    successPhrases: [
      "Tepat! Kamu berhasil melacak semua pergerakan dengan akurat.",
      "Bagus! Posisi akhirnya sudah kamu temukan.",
      "Kamu jenius! Semua langkah terlacak dengan benar.",
      "Hebat! Arah dan posisi sudah kamu kuasai.",
    ],
    failurePhrases: [
      "Belum tepat. Coba lacak langkahnya satu per satu.",
      "Hampir benar! Ulangi dari awal, bayangkan gerakannya.",
      "Tidak apa-apa. Gerakan ini memang rumit, kamu pasti bisa.",
      "Coba lagi. Ikuti panahnya pelan-pelan.",
    ],
    worldImpacts: [
      "Puzzle di lantai mulai menyala dan membentuk jalur baru.",
      "Benda-benda di ruangan kembali ke tempatnya dengan rapi.",
      "Pola cahaya terbentuk mengikuti arah yang benar.",
      "Meja laboratorium bergetar pelan dan menampilkan peta arah.",
    ],
  },

  // ─── Jalur Tercepat ───
  "fastest-path": {
    intros: [
      "Seekor monyet kecil ingin mencapai pisang sebelum waktu habis.",
      "Seorang pembawa pesan harus mengantarkan surat ke desa seberang.",
      "Air dari mata air harus mengalir ke ladang yang kering.",
      "Seorang anak harus menyeberangi hutan untuk menemui gurunya.",
    ],
    challengeContexts: [
      "Pilih jalur tercepat tanpa melewati rintangan!",
      "Temukan rute paling pendek menuju tujuan.",
      "Bantulah memilih jalan yang paling efisien.",
      "Cari jalur terbaik agar sampai tepat waktu.",
    ],
    successPhrases: [
      "Bagus! Jalur tercepat berhasil kamu temukan!",
      "Hebat! Monyet mendapat pisangnya tepat waktu.",
      "Kamu hebat! Rute terpendek sudah kamu pilih.",
      "Tepat! Jalan terbaik sudah ditemukan.",
    ],
    failurePhrases: [
      "Jalur ini agak panjang. Coba cari yang lebih pendek.",
      "Belum yang tercepat. Ada jalan lain yang lebih dekat.",
      "Tidak apa-apa. Lihat lagi petanya dengan teliti.",
      "Coba cari rute yang lebih lurus menuju tujuan.",
    ],
    worldImpacts: [
      "Jalan setapak mulai terlihat lebih jelas dan bersih.",
      "Pohon-pohon di sekitar jalur mulai berbuah.",
      "Jembatan kayu tampak lebih kokoh dan lebar.",
      "Batu-batu di jalan tersingkir dan jalur menjadi mulus.",
    ],
  },

  // ─── Kode Warna ───
  "color-code": {
    intros: [
      "Pintu menara terkunci dengan kode bentuk dan warna misterius.",
      "Sebuah peti harta memiliki kombinasi kunci berdasarkan nilai warna.",
      "Di dinding gua terpampang tabel kode yang harus dipecahkan.",
      "Kotak rahasia di laboratorium memerlukan kode warna untuk dibuka.",
    ],
    challengeContexts: [
      "Hitung nilai setiap bentuk untuk membuka kuncinya!",
      "Pecahkan kode warna untuk membuka pintu.",
      "Temukan kombinasi angka yang tepat dari kode bentuk.",
      "Hitung dengan teliti setiap simbol untuk mendapatkan kode.",
    ],
    successPhrases: [
      "Kode terpecahkan! Pintu menara terbuka perlahan.",
      "Kamu jenius! Kombinasi kuncinya tepat.",
      "Bagus! Kode berhasil kamu hitung dengan benar.",
      "Hebat! Peti harta terbuka dengan kode yang tepat.",
    ],
    failurePhrases: [
      "Kodenya belum tepat. Coba hitung lagi nilai tiap bentuk.",
      "Hampir benar! Perhatikan baik-baik nilai setiap simbol.",
      "Jangan menyerah. Kode ini butuh ketelitian.",
      "Coba lagi. Hitung ulang dari awal dengan hati-hati.",
    ],
    worldImpacts: [
      "Pintu menara bersinar dengan cahaya keemasan.",
      "Simbol-simbol di dinding mulai berpendar terang.",
      "Kotak rahasia mengeluarkan cahaya hangat.",
      "Lonceng di puncak menara berdentang pelan.",
    ],
  },

  // ─── Pilih Sikap Terbaik ───
  "moral-choice": {
    intros: [
      "Kamu melihat seorang teman yang membutuhkan bantuan di jalan.",
      "Di pasar, seorang pedagang menjatuhkan dagangannya.",
      "Seorang adik kecil tersesat dan terlihat kebingungan.",
      "Temanmu terlihat sedih karena mainannya rusak.",
    ],
    challengeContexts: [
      "Pilih sikap terbaik yang akan kamu lakukan!",
      "Apa tindakan paling baik dalam situasi ini?",
      "Tentukan pilihan sikap yang paling mulia.",
      "Pilih perbuatan yang akan membuat hati tenang.",
    ],
    successPhrases: [
      "Pilihan yang sangat baik! Hatimu mulia.",
      "Kamu hebat! Sikap terbaik sudah kamu pilih.",
      "Bagus sekali! Itulah sikap seorang muslim yang baik.",
      "Tepat! Allah menyukai hamba-Nya yang berbuat baik.",
    ],
    failurePhrases: [
      "Coba pikirkan lagi. Apa yang akan membuat Allah tersenyum?",
      "Ada pilihan yang lebih baik. Ingat, berbuat baik itu indah.",
      "Belum yang terbaik. Tanyakan dalam hati: apa yang Rasulullah lakukan?",
      "Pertimbangkan lagi. Sikap baik selalu membawa kebaikan.",
    ],
    worldImpacts: [
      "Orang-orang di sekitar mulai tersenyum.",
      "Bunga-bunga di taman mekar lebih indah.",
      "Udara terasa lebih sejuk dan nyaman.",
      "Suasana di sekitar menjadi lebih damai.",
    ],
  },

  // ─── Nasihat Lembut ───
  "gentle-advice": {
    intros: [
      "Temanmu melakukan kesalahan kecil, tapi ia perlu dinasihati dengan baik.",
      "Adikmu lupa mengerjakan tugas dan bingung harus bagaimana.",
      "Seorang anak di kelas berbuat kurang sopan tanpa sadar.",
      "Temanmu berkata kasar karena sedang kesal.",
    ],
    challengeContexts: [
      "Pilih kalimat nasihat yang paling lembut dan penuh kasih.",
      "Kata-kata mana yang paling baik untuk menasihati?",
      "Sampaikan nasihat dengan cara yang paling indah.",
      "Pilih ungkapan yang akan menyentuh hati, bukan menyakiti.",
    ],
    successPhrases: [
      "Nasihat yang indah! Kata-katamu pasti menyejukkan hati.",
      "Itulah cara menasihati yang dicintai Allah.",
      "Bagus! Nasihat lembut lebih didengar daripada bentakan.",
      "Kamu bijak! Lisan yang baik membawa keberkahan.",
    ],
    failurePhrases: [
      "Kata-kata ini agak kasar. Coba yang lebih lembut.",
      "Ingat, nasihat yang baik disampaikan dengan kasih sayang.",
      "Coba pilih kalimat yang tidak menyakiti perasaan.",
      "Belum tepat. Nasihat terbaik selalu disampaikan dengan lembut.",
    ],
    worldImpacts: [
      "Wajah temanmu mulai tersenyum dan mengangguk.",
      "Suasana kelas menjadi lebih hangat dan akrab.",
      "Burung-burung di luar jendela ikut berkicau riang.",
      "Hati semua orang di ruangan terasa lebih tenang.",
    ],
  },

  // ─── Detektif Petunjuk ───
  "detective-clues": {
    intros: [
      "Kamu menemukan beberapa petunjuk misterius di jalan setapak.",
      "Sejumlah barang aneh tertinggal di lokasi kejadian.",
      "Beberapa catatan kecil tersebar di meja perpustakaan.",
      "Jejak-jejak aneh terlihat di sepanjang koridor.",
    ],
    challengeContexts: [
      "Gabungkan semua petunjuk untuk menemukan jawabannya!",
      "Jadilah detektif cilik dan pecahkan misterinya.",
      "Baca semua petunjuk dengan teliti lalu pilih kesimpulan.",
      "Susun petunjuk satu per satu untuk mengungkap rahasia.",
    ],
    successPhrases: [
      "Misteri terpecahkan! Kamu detektif yang hebat.",
      "Semua petunjuk tersusun rapi dan jawabannya jelas.",
      "Kamu jenius! Petunjuknya berhasil kamu gabungkan.",
      "Tepat! Tidak ada yang lolos dari pengamatanmu.",
    ],
    failurePhrases: [
      "Ada petunjuk yang terlewat. Baca lagi semuanya.",
      "Hampir benar! Perhatikan petunjuknya satu per satu.",
      "Jangan terburu-buru. Detektif yang baik selalu teliti.",
      "Coba baca ulang petunjuknya dengan lebih hati-hati.",
    ],
    worldImpacts: [
      "Jalan setapak mulai terlihat lebih jelas.",
      "Barang-barang yang hilang kembali ke tempatnya.",
      "Buku-buku di perpustakaan tersusun rapi kembali.",
      "Koridor gelap perlahan diterangi cahaya lembut.",
    ],
  },

  // ─── Pilih Kesimpulan ───
  "pick-conclusion": {
    intros: [
      "Penduduk desa memberikan beberapa informasi berbeda.",
      "Beberapa saksi menceritakan kejadian dari sudut pandang masing-masing.",
      "Kamu mendengar tiga versi cerita tentang peristiwa yang sama.",
      "Beberapa orang di kota memberikan pendapat mereka.",
    ],
    challengeContexts: [
      "Pilih kesimpulan yang paling tepat dari semua informasi!",
      "Analisis semua cerita lalu simpulkan dengan bijak.",
      "Gabungkan informasi untuk mendapatkan kesimpulan terbaik.",
      "Mana kesimpulan yang paling masuk akal?",
    ],
    successPhrases: [
      "Kesimpulan yang sangat tepat! Kamu berpikir jernih.",
      "Bagus! Kamu bisa melihat benang merah dari semua cerita.",
      "Tepat sekali! Penalaranmu luar biasa.",
      "Kamu hebat! Kesimpulanmu sesuai dengan fakta.",
    ],
    failurePhrases: [
      "Kesimpulan ini kurang tepat. Coba baca lagi informasinya.",
      "Ada yang terlewat. Pertimbangkan semua sudut pandang.",
      "Belum tepat. Pikirkan: mana yang paling didukung bukti?",
      "Coba lagi. Jangan terburu-buru menyimpulkan.",
    ],
    worldImpacts: [
      "Penduduk desa mulai berdiskusi dengan lebih rukun.",
      "Koran desa menulis berita yang benar dan jelas.",
      "Papan pengumuman di kota menampilkan informasi akurat.",
      "Orang-orang mulai saling percaya dan bekerja sama.",
    ],
  },

  // ─── Benar atau Salah ───
  "true-or-false": {
    intros: [
      "Sebuah pernyataan menantang muncul di papan tulis ajaib.",
      "Kamu mendengar klaim yang perlu diverifikasi kebenarannya.",
      "Seseorang menyampaikan informasi yang meragukan.",
      "Di dinding muncul tulisan yang kebenarannya harus diuji.",
    ],
    challengeContexts: [
      "Tentukan apakah pernyataan itu benar, salah, atau belum cukup bukti.",
      "Uji kebenaran klaim ini dengan nalarmu.",
      "Apakah informasi ini bisa dipercaya? Tentukan!",
      "Jadilah hakim yang adil: benar atau salah?",
    ],
    successPhrases: [
      "Kamu tepat! Kebenaran sudah kamu tegakkan.",
      "Bagus! Kamu tidak mudah tertipu informasi.",
      "Tepat! Nalarmu tajam dan kritis.",
      "Kamu hebat! Kebenaran selalu di pihak yang teliti.",
    ],
    failurePhrases: [
      "Coba pikirkan lagi. Apakah ada bukti yang cukup?",
      "Hampir benar. Uji setiap pernyataan dengan logika.",
      "Jangan terburu-buru. Hakim yang baik memeriksa dulu.",
      "Belum tepat. Ingat: tidak semua yang terdengar benar itu benar.",
    ],
    worldImpacts: [
      "Papan tulis bersinar dan menampilkan fakta yang benar.",
      "Informasi palsu lenyap dan diganti kebenaran.",
      "Timbangan keadilan di alun-alun mulai seimbang.",
      "Lonceng kebenaran berdentang di atas menara.",
    ],
  },

  // ─── Boss Mission ───
  "boss": {
    intros: [
      "Sebuah ujian besar terbentang di hadapanmu. Udara terasa berbeda.",
      "Kamu tiba di titik penting perjalanan. Tantangan besar menanti.",
      "Gerbang besar berdiri kokoh. Untuk melewatinya, kamu harus diuji.",
      "Para tetua berkumpul. Mereka akan menguji kemampuanmu.",
    ],
    challengeContexts: [
      "Hadapi tantangan ini dengan seluruh ilmu dan adabmu!",
      "Buktikan dirimu layak melangkah ke tingkat berikutnya.",
      "Kerahkan semua kemampuan terbaikmu!",
      "Ini ujian sesungguhnya. Tunjukkan siapa dirimu!",
    ],
    successPhrases: [
      "LUAR BIASA! Kamu membuktikan diri sebagai Mastermind sejati!",
      "Kamu berhasil! Para tetua tersenyum bangga.",
      "Gerbang terbuka lebar! Kamu layak melangkah.",
      "Tantangan besar berhasil kamu taklukkan! Dunia bergetar kagum.",
    ],
    failurePhrases: [
      "Ujian ini memang berat. Kumpulkan kekuatan dan coba lagi.",
      "Belum berhasil. Tapi setiap percobaan membuatmu lebih kuat.",
      "Jangan patah semangat. Mastermind sejati bangkit lagi.",
      "Kamu sudah berjuang hebat. Latih lagi dan kembali lebih kuat.",
    ],
    worldImpacts: [
      "Cahaya terang menyelimuti seluruh area.",
      "Patung Mastermind kuno mulai bercahaya.",
      "Langit dipenuhi bintang-bintang yang bersinar terang.",
      "Semua penduduk bersorak dan merayakan keberhasilanmu.",
    ],
  },
};

// ── Default story set untuk challenge types yang belum spesifik ──
const DEFAULT_STORY: StoryTemplateSet = {
  intros: [
    "Di perjalananmu, kamu menemukan sesuatu yang menarik.",
    "Sebuah kejutan menanti di depan.",
    "Perjalananmu sampai di titik yang menantang.",
    "Ada hal yang perlu kamu selesaikan di sini.",
  ],
  challengeContexts: [
    "Bantulah menyelesaikan tantangan ini!",
    "Gunakan pengetahuanmu untuk melewati ini.",
    "Apa yang akan kamu lakukan?",
    "Tunjukkan kemampuan terbaikmu!",
  ],
  successPhrases: [
    "Bagus! Satu langkah lebih dekat ke tujuan.",
    "Berhasil! Kamu semakin hebat.",
    "Tepat! Perjalananmu semakin bersinar.",
    "Kamu keren! Teruslah melangkah.",
  ],
  failurePhrases: [
    "Belum tepat. Tidak apa-apa, coba lagi!",
    "Jangan menyerah. Kamu pasti bisa.",
    "Latihan membuat sempurna. Ayo coba lagi.",
    "Setiap percobaan adalah pelajaran berharga.",
  ],
  worldImpacts: [
    "Cahaya lembut menyinari jalan di depan.",
    "Udara sekitar terasa lebih segar.",
    "Bunga kecil bermekaran di pinggir jalan.",
    "Langit terlihat sedikit lebih cerah.",
  ],
};

// ════════════════════════════════════════════════════════
// Main Generator
// ════════════════════════════════════════════════════════

export function generateAdventureStageStory(stage: Stage): AdventureStageStory {
  const rand = rng(stage.stageNumber * 7919 + stage.difficulty.charCodeAt(0) * 1009);
  const diff = stage.difficulty as DifficultyId;
  const challengeType = stage.challengeType || stage.missionType || "general";
  const isBoss = stage.isBossStage;
  const isFinal = stage.stageNumber === 500;
  const userTitle = USER_TITLES[diff] || "Calon Mastermind";
  
  // Get template set for this challenge type
  const typeKey = challengeType.toLowerCase().replace(/[_-]/g, "-");
  let templates = CHALLENGE_STORY_TEMPLATES[typeKey];
  
  // Try partial matches
  if (!templates) {
    for (const key of Object.keys(CHALLENGE_STORY_TEMPLATES)) {
      if (typeKey.includes(key) || key.includes(typeKey)) {
        templates = CHALLENGE_STORY_TEMPLATES[key];
        break;
      }
    }
  }
  
  // Fallback for boss missions
  if (!templates && isBoss) {
    templates = CHALLENGE_STORY_TEMPLATES["boss"];
  }
  
  if (!templates) {
    templates = DEFAULT_STORY;
  }

  // Generate story elements
  const intro = pick(templates.intros, rand);
  const challenge = pick(templates.challengeContexts, rand);
  const success = pick(templates.successPhrases, rand);
  const failure = pick(templates.failurePhrases, rand);
  const worldImpact = isFinal
    ? `Cahaya keemasan menyelimuti seluruh ${WORLD_NAME}. Perjalananmu di tingkat ini telah membawa perubahan besar!`
    : pick(templates.worldImpacts, rand);

  // Get companion
  const companion = getCompanionForChallenge(challengeType);
  const companionId = companion?.id || null;
  const companionHint = getCompanionHint(companionId, challengeType, diff);

  // Story title
  const titlePrefix = isBoss ? "⚔️ " : isFinal ? "🏆 " : "";
  const titleBase = isFinal
    ? `Gerbang Kenaikan — ${getDifficultyLabel(diff)}`
    : stage.title || `Misi ${stage.stageNumber}`;
  const storyTitle = `${titlePrefix}${titleBase}`;

  // Difficulty-appropriate language
  const difficultyAdjusted = adjustForDifficulty({ intro, challenge, success, failure }, diff);

  return {
    stageId: stage.id,
    stageNumber: stage.stageNumber,
    difficulty: diff,
    storyTitle,
    introText: difficultyAdjusted.intro,
    userRoleText: `Sebagai ${userTitle} dari ${WORLD_NAME}, ${difficultyAdjusted.challenge.toLowerCase()}`,
    challengeContext: difficultyAdjusted.challenge,
    successText: difficultyAdjusted.success,
    failureText: difficultyAdjusted.failure,
    worldImpactText: worldImpact,
    companionId,
    companionHint,
  };
}

// ════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════

function getDifficultyLabel(diff: DifficultyId): string {
  const map: Record<DifficultyId, string> = {
    tk: "TK",
    "sd-bawah": "SD Bawah",
    "sd-atas": "SD Atas",
    smp: "SMP",
    sma: "SMA",
    universitas: "Universitas",
  };
  return map[diff] || diff;
}

function getCompanionHint(companionId: string | null, challengeType: string, diff: DifficultyId): string {
  const hints: Record<string, string> = {
    nara: "Ingat, pilihlah sikap terbaik! ✨",
    qiro: "Perhatikan petunjuknya satu per satu. Jangan terburu-buru! 🔍",
    luma: "Lihat bentuk dan posisinya dengan teliti. 👁️",
    aman: "Keputusan yang baik memikirkan akibatnya untuk semua. 🛡️",
  };
  
  if (!companionId || !hints[companionId]) {
    return "Kamu pasti bisa! 💪";
  }
  
  let hint = hints[companionId];
  
  // Simplify for TK
  if (diff === "tk") {
    if (companionId === "nara") hint = "Pilih yang baik ya! ✨";
    if (companionId === "qiro") hint = "Lihat baik-baik! 🔍";
    if (companionId === "luma") hint = "Perhatikan bentuknya! 👁️";
    if (companionId === "aman") hint = "Pilih yang terbaik! 🛡️";
  }
  
  return hint;
}

function adjustForDifficulty(
  texts: { intro: string; challenge: string; success: string; failure: string },
  diff: DifficultyId
): { intro: string; challenge: string; success: string; failure: string } {
  // For TK: shorten sentences
  if (diff === "tk") {
    return {
      intro: shortenText(texts.intro),
      challenge: shortenText(texts.challenge),
      success: shortenText(texts.success),
      failure: shortenText(texts.failure),
    };
  }
  return texts;
}

function shortenText(text: string): string {
  // Keep it simple for TK
  if (text.length > 40) {
    const sentences = text.split(". ");
    return sentences.slice(0, 2).join(". ") + ".";
  }
  return text;
}
