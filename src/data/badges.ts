import type { BadgeDef } from "@/types";

export const BADGES: BadgeDef[] = [
  // ═══ Kognitif (10) ═══
  { id: "penjelajah-pemula", name: "Penjelajah Pemula", description: "Menyelesaikan 5 misi pertama.", emoji: "🌱", color: "leaf", unlockHint: "Selesaikan 5 misi apa saja." },
  { id: "pemecah-pola", name: "Pemecah Pola", description: "Menyelesaikan 10 misi pengenalan pola.", emoji: "🔍", color: "grape", unlockHint: "Selesaikan 10 misi pola." },
  { id: "ahli-numerasi", name: "Master Angka", description: "Menyelesaikan 15 misi literasi & numerasi.", emoji: "🔢", color: "leaf-dark", unlockHint: "Selesaikan 15 misi numerasi." },
  { id: "pahlawan-ingatan", name: "Pahlawan Ingatan", description: "Menyelesaikan 10 misi spasial/ingatan.", emoji: "🧠", color: "sky", unlockHint: "Selesaikan 10 misi spasial." },
  { id: "detektif-cilik", name: "Detektif Cilik", description: "Menyelesaikan 10 misi systems thinking/logika.", emoji: "🕵️", color: "wood", unlockHint: "Selesaikan 10 misi logika." },
  { id: "pencari-kesimpulan", name: "Pencari Kesimpulan", description: "Menyelesaikan 10 misi penalaran.", emoji: "💡", color: "sun", unlockHint: "Selesaikan 10 misi penalaran." },
  { id: "juara-hitung-kilat", name: "Juara Hitung Kilat", description: "Skor 500+ di Hitung Kilat.", emoji: "⚡", color: "blue", unlockHint: "Skor 500+ di Hitung Kilat." },
  { id: "ahli-pola-kilat", name: "Ahli Pola Kilat", description: "Skor 400+ di Pola Kilat.", emoji: "🧩", color: "grape", unlockHint: "Skor 400+ di Pola Kilat." },
  { id: "mata-tajam", name: "Mata Tajam", description: "Skor 300+ di Cari yang Berbeda.", emoji: "👁️", color: "sky", unlockHint: "Skor 300+ di Cari yang Berbeda." },
  { id: "pembaca-petunjuk", name: "Pembaca Petunjuk", description: "Selesaikan semua soal Detektif Petunjuk.", emoji: "📋", color: "leaf", unlockHint: "Selesaikan paket Detektif Petunjuk." },

  // ═══ Adab (10) ═══
  { id: "sahabat-amanah", name: "Sahabat Amanah", description: "Menyelesaikan 10 misi adab dengan pilihan terbaik.", emoji: "🤝", color: "berry", unlockHint: "Selesaikan 10 misi adab." },
  { id: "penjaga-lisan", name: "Penjaga Lisan", description: "Mempertahankan 7 hari streak adab.", emoji: "🕌", color: "berry", unlockHint: "Streak adab 7 hari berturut-turut." },
  { id: "anak-suka-menolong", name: "Anak Suka Menolong", description: "Selesaikan 5 misi adab tolong-menolong.", emoji: "🤗", color: "sun", unlockHint: "Selesaikan misi adab tolong-menolong." },
  { id: "ahli-salam", name: "Ahli Salam", description: "Selesaikan 3 misi adab tentang salam.", emoji: "👋", color: "leaf", unlockHint: "Selesaikan misi tentang salam." },
  { id: "teliti-membaca", name: "Teliti Membaca", description: "Selalu pilih jawaban terbaik di 20 misi.", emoji: "📖", color: "sky", unlockHint: "20x pilih jawaban terbaik." },
  { id: "paling-bijak", name: "Paling Bijak", description: "Selesaikan 10 Dilema Bijak.", emoji: "⚖️", color: "sun", unlockHint: "Selesaikan 10 Dilema Bijak." },
  { id: "nasihat-lembut", name: "Nasihat Lembut", description: "Pilih kata-kata terbaik di 10 Nasihat Lembut.", emoji: "💬", color: "berry", unlockHint: "10x Nasihat Lembut tepat." },
  { id: "anak-sabar", name: "Anak Sabar", description: "Selesaikan 5 misi tentang kesabaran.", emoji: "🧘", color: "leaf", unlockHint: "Selesaikan misi kesabaran." },
  { id: "jujur-itu-hebat", name: "Jujur Itu Hebat", description: "Selesaikan 5 misi tentang kejujuran.", emoji: "⭐", color: "sun", unlockHint: "Selesaikan misi kejujuran." },
  { id: "rendah-hati", name: "Rendah Hati", description: "Selesaikan 5 misi tentang kerendahan hati.", emoji: "🌸", color: "berry", unlockHint: "Selesaikan misi kerendahan hati." },

  // ═══ Mini-Game (10) ═══
  { id: "ahli-bayangan", name: "Ahli Bayangan", description: "Skor 200+ di Cocokkan Bayangan.", emoji: "👤", color: "grape", unlockHint: "Skor 200+ di Cocokkan Bayangan." },
  { id: "ahli-ubah-posisi", name: "Ahli Ubah Posisi", description: "Selesaikan 10 soal Ubah Posisi.", emoji: "🔄", color: "sky", unlockHint: "10 soal Ubah Posisi." },
  { id: "jalur-tercepat-pro", name: "Jalur Tercepat Pro", description: "Selesaikan 5 jalur dengan waktu terbaik.", emoji: "🐒", color: "leaf", unlockHint: "5x Jalur Tercepat optimal." },
  { id: "ahli-benar-salah", name: "Ahli Benar Salah", description: "Skor 300+ di Benar atau Salah.", emoji: "✅", color: "blue", unlockHint: "Skor 300+ di Benar atau Salah." },
  { id: "tebak-aturan-master", name: "Tebak Aturan Master", description: "Selesaikan semua soal Tebak Aturan.", emoji: "📐", color: "grape", unlockHint: "Semua Tebak Aturan." },
  { id: "paling-teliti", name: "Paling Teliti", description: "Akurasi 90%+ di semua mini-game.", emoji: "🎯", color: "sun", unlockHint: "Akurasi 90%+ di mini-game." },
  { id: "paling-semangat", name: "Paling Semangat", description: "Mainkan 50 sesi mini-game.", emoji: "🔥", color: "orange", unlockHint: "50 sesi mini-game." },
  { id: "hafal-jalan", name: "Hafal Jalan", description: "Selesaikan 3 Jalur Tercepat berturut-turut.", emoji: "🗺️", color: "leaf", unlockHint: "3x Jalur Tercepat." },
  { id: "urutkan-adab-pro", name: "Urutkan Adab Pro", description: "Selesaikan 10 soal Urutkan Adab.", emoji: "📋", color: "berry", unlockHint: "10 soal Urutkan Adab." },
  { id: "comeback-terbaik", name: "Comeback Terbaik", description: "Menang battle setelah kalah 3 ronde.", emoji: "🔄", color: "sun", unlockHint: "Comeback di battle." },

  // ═══ Battle (5) ═══
  { id: "battle-pertama", name: "Battle Pertama", description: "Menyelesaikan 1 sesi battle.", emoji: "⚔️", color: "wood", unlockHint: "Mainkan battle." },
  { id: "pemenang-battle", name: "Pemenang Battle", description: "Menang 5 battle.", emoji: "🏆", color: "sun", unlockHint: "5 kemenangan battle." },
  { id: "pemimpin-bijak", name: "Pemimpin Bijak", description: "Menyelesaikan 5 misi boss kepemimpinan.", emoji: "👑", color: "sun", unlockHint: "Selesaikan 5 misi boss." },
  { id: "musyawarah-muda", name: "Musyawarah Muda", description: "Selesaikan 5 misi musyawarah.", emoji: "🏛️", color: "berry", unlockHint: "5 misi musyawarah." },
  { id: "rajin-battle", name: "Rajin Battle", description: "Mainkan 20 sesi battle.", emoji: "💪", color: "grape", unlockHint: "20 sesi battle." },

  // ═══ Misi Harian Adab (5) ═══
  { id: "streak-3-hari", name: "Streak 3 Hari", description: "3 hari berturut-turut Misi Harian.", emoji: "🔥", color: "sun", unlockHint: "Misi Harian 3 hari." },
  { id: "streak-7-hari", name: "Streak 7 Hari", description: "7 hari berturut-turut Misi Harian.", emoji: "🌟", color: "sun", unlockHint: "Misi Harian 7 hari." },
  { id: "streak-30-hari", name: "Streak 30 Hari", description: "30 hari berturut-turut Misi Harian.", emoji: "👑", color: "sun", unlockHint: "Misi Harian 30 hari." },
  { id: "misi-harian-rajin", name: "Misi Harian Rajin", description: "Verifikasi orang tua 10x.", emoji: "✅", color: "leaf", unlockHint: "10 verifikasi orang tua." },
  { id: "membantu-orang-tua", name: "Membantu Orang Tua", description: "Selesaikan 10 checklist membantu.", emoji: "🤲", color: "berry", unlockHint: "10 checklist membantu." },

  // ═══ Peta Petualangan (5) ═══
  { id: "penjelajah-gua", name: "Penjelajah Gua", description: "Selesaikan dunia bertema gua.", emoji: "🕳️", color: "wood", unlockHint: "Selesaikan dunia gua." },
  { id: "pendaki-gunung", name: "Pendaki Gunung", description: "Selesaikan dunia bertema gunung.", emoji: "⛰️", color: "sky", unlockHint: "Selesaikan dunia gunung." },
  { id: "sahabat-pantai", name: "Sahabat Pantai", description: "Selesaikan dunia bertema pantai.", emoji: "🏖️", color: "blue", unlockHint: "Selesaikan dunia pantai." },
  { id: "pembuka-kado", name: "Pembuka Kado", description: "Buka 10 box hadiah di peta.", emoji: "🎁", color: "sun", unlockHint: "10 box hadiah." },
  { id: "penjelajah-ilmu", name: "Penjelajah Ilmu", description: "Selesaikan 100 misi di peta.", emoji: "🗺️", color: "sky", unlockHint: "100 misi peta." },

  // ═══ Difficulty Completion (6) ═══
  { id: "tk-complete", name: "TK Complete", description: "Selesaikan semua stage TK.", emoji: "🌸", color: "berry", unlockHint: "Tamatkan TK." },
  { id: "sd-bawah-complete", name: "SD Bawah Complete", description: "Selesaikan semua stage SD Bawah.", emoji: "🌱", color: "leaf", unlockHint: "Tamatkan SD Bawah." },
  { id: "sd-atas-complete", name: "SD Atas Complete", description: "Selesaikan semua stage SD Atas.", emoji: "🌿", color: "leaf", unlockHint: "Tamatkan SD Atas." },
  { id: "smp-complete", name: "SMP Complete", description: "Selesaikan semua stage SMP.", emoji: "🌳", color: "wood", unlockHint: "Tamatkan SMP." },
  { id: "sma-complete", name: "SMA Complete", description: "Selesaikan semua stage SMA.", emoji: "🏔️", color: "sky", unlockHint: "Tamatkan SMA." },
  { id: "universitas-complete", name: "Universitas Complete", description: "Selesaikan semua stage Universitas.", emoji: "🎓", color: "grape", unlockHint: "Tamatkan Universitas." },

  // ═══ Konsistensi + Special (5) ═══
  { id: "mastermind-muda", name: "Mastermind Muda", description: "Kumpulkan 30 lencana.", emoji: "🧩", color: "sun", unlockHint: "30 lencana." },
  { id: "the-true-mastermind", name: "The True Mastermind", description: "Kumpulkan semua lencana & tamatkan.", emoji: "🏆", color: "sun", unlockHint: "Semua lencana + tamat." },
  { id: "suka-berterima-kasih", name: "Suka Berterima Kasih", description: "Selesaikan 5 misi terima kasih.", emoji: "🙏", color: "berry", unlockHint: "5 misi terima kasih." },
  { id: "berani-minta-maaf", name: "Berani Minta Maaf", description: "Selesaikan 5 misi meminta maaf.", emoji: "💝", color: "berry", unlockHint: "5 misi maaf." },
  { id: "adab-streak-30", name: "Penjaga Adab Sejati", description: "30 hari streak adab.", emoji: "🕌", color: "berry", unlockHint: "Streak adab 30 hari." },
];
