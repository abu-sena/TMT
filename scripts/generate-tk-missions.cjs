/**
 * Mission Generator — generates remaining mission data
 * Run: node scripts/generate-missions.js
 */
const fs = require('fs');
const path = require('path');

function gen(cfg) {
  const {prefix, num, title, category, missionType, story, instruction, options, correctIdx, explanation, hints, basePoint, adabBonus, adabFeedback, isBoss, patternType, secondaryCat} = cfg;
  
  const diffMap = {tk:'tk', sdk:'sd-kecil', sdm:'sd-muda', smp:'smp', sma:'sma'};
  const gradeMap = {tk:'TK', sdk:'SD 1-3', sdm:'SD 4-6', smp:'SMP', sma:'SMA'};
  
  const opts = options.map((o,i) => {
    const id = String.fromCharCode(97+i);
    const entry = {id, label: o};
    if (i === correctIdx) {
      if (['numeracy_story','tk_counting'].includes(missionType) || isBoss) {
        entry.feedback = 'Tepat!';
      }
      if (['moral_decision','tk_adab_basic'].includes(missionType)) {
        entry.isBestChoice = true;
      }
    }
    return entry;
  });
  
  const out = {
    id: `${prefix}-${num}`, number: num, title,
    difficulty: diffMap[prefix], gradeRange: gradeMap[prefix],
    category, missionType,
    story, instruction,
    options: opts,
    correctAnswer: String.fromCharCode(97+correctIdx),
    explanation, hintLevels: hints, basePoint
  };
  if (adabBonus) out.adabBonus = adabBonus;
  if (adabFeedback) out.adabFeedback = adabFeedback;
  if (isBoss) out.isBossMission = true;
  if (patternType) out.patternType = patternType;
  if (secondaryCat) out.secondaryCategory = secondaryCat;
  return out;
}

// ─── TEMPLATE DATA ───

const TK_ADAB_EXTRA = [
  {title:"Berkata Jujur",story:"Adik memecahkan gelas. Tidak ada yang melihat.",instruction:"Apa yang Adik lakukan?",options:["Diam saja","Bilang jujur ke Ibu","Sembunyikan pecahan"],correctIdx:1,explanation:"Jujur itu hebat! Ibu akan bangga Adik berkata jujur.",hints:["Allah melihat semua yang kita lakukan."],basePoint:40,adabBonus:10,adabFeedback:"Kejujuran adalah pangkal kebaikan. 🤲"},
  {title:"Hormati yang Tua",story:"Adik naik bus. Ada nenek berdiri.",instruction:"Apa yang Adik lakukan?",options:["Pura-pura tidur","Berikan tempat duduk ke nenek","Lanjut duduk"],correctIdx:1,explanation:"Memberi tempat duduk ke yang lebih tua adalah adab mulia.",hints:["Nenek lebih tua, dia butuh..."],basePoint:40,adabBonus:10,adabFeedback:"Menghormati yang tua adalah akhlak mulia. 👴"},
  {title:"Tidak Mengejek",story:"Teman terjatuh. Teman lain menertawakan.",instruction:"Apa yang Adik lakukan?",options:["Ikut tertawa","Tolong berdiri dan hibur","Diam saja"],correctIdx:1,explanation:"Menolong teman yang jatuh itu baik. Jangan mengejek!",hints:["Kalau Adik yang jatuh, Adik ingin...?"],basePoint:40,adabBonus:10,adabFeedback:"Tidak mengejek adalah akhlak terpuji. 🤗"},
  {title:"Jaga Lisan",story:"Adik marah karena mainan diambil teman.",instruction:"Apa yang Adik katakan?",options:["Kata-kata kasar","'Tolong kembalikan ya, itu punyaku'","Langsung pukul"],correctIdx:1,explanation:"Bicara baik-baik lebih baik daripada marah.",hints:["Kata-kata yang sopan lebih baik."],basePoint:40,adabBonus:10,adabFeedback:"Menjaga lisan adalah tanda iman. 💬"},
  {title:"Minta Izin",story:"Adik ingin pinjam pensil teman.",instruction:"Apa yang Adik lakukan?",options:["Ambil langsung","Minta izin dulu","Pinjam diam-diam"],correctIdx:1,explanation:"Minta izin sebelum pinjam itu sopan.",hints:["Sebelum pinjam, kita harus..."],basePoint:40,adabBonus:10,adabFeedback:"Meminta izin adalah adab yang baik. 🤝"},
  {title:"Bersihkan Tempat Tidur",story:"Bangun pagi, tempat tidur masih berantakan.",instruction:"Apa yang Adik lakukan?",options:["Biarkan berantakan","Rapikan selimut dan bantal","Minta Ibu yang rapikan"],correctIdx:1,explanation:"Merapikan tempat tidur sendiri melatih kemandirian.",hints:["Setelah bangun tidur, kita..."],basePoint:40,adabBonus:10,adabFeedback:"Kemandirian adalah tanda anak hebat. 🛏️"},
  {title:"Sayang Adik",story:"Adik kecil menangis minta ditemani.",instruction:"Apa yang Adik lakukan?",options:["Biarkan menangis","Temani dan hibur adik","Suruh diam"],correctIdx:1,explanation:"Menyayangi adik adalah perbuatan mulia.",hints:["Kakak yang baik itu... adiknya."],basePoint:40,adabBonus:10,adabFeedback:"Menyayangi sesama adalah akhlak mulia. 💕"},
  {title:"Dengar Nasihat",story:"Ibu menasihati Adik untuk tidak jajan sembarangan.",instruction:"Apa yang Adik lakukan?",options:["Tidak peduli","Dengarkan dan turuti nasihat Ibu","Melawan"],correctIdx:1,explanation:"Mendengar nasihat orang tua adalah bakti anak.",hints:["Ibu memberi nasihat karena..."],basePoint:40,adabBonus:10,adabFeedback:"Mendengar nasihat orang tua membawa berkah. 👂"},
  {title:"Buang Sampah",story:"Adik habis makan permen. Bungkusnya di tangan.",instruction:"Apa yang Adik lakukan?",options:["Buang sembarangan","Buang ke tempat sampah","Simpan di saku"],correctIdx:1,explanation:"Buang sampah pada tempatnya menjaga kebersihan.",hints:["Sampah dibuang ke..."],basePoint:40,adabBonus:10,adabFeedback:"Kebersihan sebagian dari iman. 🗑️"},
  {title:"Tidak Berisik",story:"Adik di masjid. Ada orang shalat.",instruction:"Apa yang Adik lakukan?",options:["Berlari dan teriak","Duduk tenang","Main HP keras-keras"],correctIdx:1,explanation:"Di masjid kita harus tenang. Hormati yang sedang shalat.",hints:["Masjid tempat ibadah, kita harus..."],basePoint:40,adabBonus:10,adabFeedback:"Tenang di masjid adalah adab yang baik. 🕌"},
  {title:"Ucap Alhamdulillah",story:"Adik dapat hadiah dari Ayah.",instruction:"Apa yang Adik ucapkan?",options:["Ah, jelek","Alhamdulillah","Kurang bagus"],correctIdx:1,explanation:"Alhamdulillah artinya segala puji bagi Allah. Tanda bersyukur!",hints:["Dapat hadiah, ucapkan..."],basePoint:40,adabBonus:10,adabFeedback:"Bersyukur menambah nikmat. 🌟"},
  {title:"Jaga Buku Teman",story:"Adik pinjam buku cerita dari teman.",instruction:"Bagaimana Adik menjaga bukunya?",options:["Dilipat-lipat","Dijaga dengan hati-hati","Dibiarkan basah"],correctIdx:1,explanation:"Barang pinjaman harus dijaga seperti milik sendiri. Itu amanah!",hints:["Barang pinjaman harus..."],basePoint:40,adabBonus:10,adabFeedback:"Amanah membuat orang percaya. 📖"},
  {title:"Bantu Ayah",story:"Ayah sedang menyiram tanaman.",instruction:"Apa yang Adik lakukan?",options:["Main saja","Bantu Ayah menyiram","Tonton TV"],correctIdx:1,explanation:"Membantu Ayah adalah bakti anak yang mulia.",hints:["Ayah bekerja, Adik bisa..."],basePoint:40,adabBonus:10,adabFeedback:"Berbakti kepada ayah adalah kehormatan. 🌻"},
  {title:"Sabar Menunggu",story:"Adik ingin es krim sekarang.",instruction:"Apa yang Adik lakukan?",options:["Menangis keras","Sabar menunggu giliran","Ambil paksa"],correctIdx:1,explanation:"Sabar itu keren! Allah sayang orang yang sabar.",hints:["Tunggu dengan tenang..."],basePoint:40,adabBonus:10,adabFeedback:"Sabar adalah akhlak mulia. 😌"},
  {title:"Jujur Tumpah Susu",story:"Adik tidak sengaja menumpahkan susu.",instruction:"Apa yang Adik lakukan?",options:["Bilang bukan Adik","Jujur bilang ke Ibu","Diam saja"],correctIdx:1,explanation:"Jujur lebih baik daripada bohong. Ibu pasti memaafkan.",hints:["Allah suka anak yang..."],basePoint:40,adabBonus:10,adabFeedback:"Jujur menyelamatkan. 🤲"},
  {title:"Baca Bismillah",story:"Adik mau mulai mengerjakan PR.",instruction:"Apa yang Adik ucapkan?",options:["Diam saja","Bismillah","Halo"],correctIdx:1,explanation:"Bismillah artinya 'dengan nama Allah'. Pekerjaan jadi berkah!",hints:["Sebelum mulai, ucapkan..."],basePoint:40,adabBonus:10,adabFeedback:"Bismillah mendatangkan berkah. ✨"},
  {title:"Rajin Shalat",story:"Azan Maghrib berkumandang.",instruction:"Apa yang Adik lakukan?",options:["Lanjutkan bermain","Segera ambil wudhu dan shalat","Tunda nanti saja"],correctIdx:1,explanation:"Shalat tepat waktu adalah amal yang paling dicintai Allah.",hints:["Azan adalah panggilan..."],basePoint:40,adabBonus:10,adabFeedback:"Shalat tepat waktu dicintai Allah. 🕌"},
  {title:"Baca Al-Quran",story:"Ada Al-Quran kecil di meja belajar.",instruction:"Apa yang Adik lakukan?",options:["Abaikan","Baca pelan-pelan sedikit","Simpan di bawah meja"],correctIdx:1,explanation:"Membaca Al-Quran walau satu ayat berpahala besar.",hints:["Al-Quran adalah kitab suci..."],basePoint:40,adabBonus:10,adabFeedback:"Cinta Al-Quran sejak kecil. 📖"},
  {title:"Doa Masuk Rumah",story:"Adik pulang dari bermain.",instruction:"Apa yang diucapkan saat masuk rumah?",options:["Diam saja","Assalamu'alaikum","Halo"],correctIdx:1,explanation:"Assalamu'alaikum adalah doa keselamatan untuk penghuni rumah.",hints:["Masuk rumah ucapkan..."],basePoint:40,adabBonus:10,adabFeedback:"Salam adalah doa. 🏠"},
  {title:"Berpakaian Rapi",story:"Mau pergi ke sekolah.",instruction:"Bagaimana Adik berpakaian?",options:["Asal-asalan","Rapi dan bersih","Pakai baju kotor"],correctIdx:1,explanation:"Berpakaian rapi dan bersih adalah adab Islam. Allah itu indah dan suka keindahan.",hints:["Allah suka yang bersih dan..."],basePoint:40,adabBonus:10,adabFeedback:"Kerapian adalah cermin kepribadian. 👔"},
];

const TK_PRELIT_EXTRA = [
  {title:"Nama Hari",story:"Setelah hari Minggu adalah hari...",instruction:"Hari apakah itu?",options:["Sabtu","Senin","Selasa"],correctIdx:1,explanation:"Hari Senin datang setelah Minggu. Awal pekan yang baru!",hints:["Setelah Minggu, besoknya hari..."],basePoint:40},
  {title:"Hitung Bunga",story:"🌸🌸🌸🌸",instruction:"Ada berapa bunga?",options:["3","4","5"],correctIdx:1,explanation:"Empat bunga cantik bermekaran. Allah ciptakan bunga yang indah!",hints:["Hitung satu-satu."],basePoint:40},
  {title:"Anggota Badan",story:"Untuk melihat, Adik pakai apa?",instruction:"Pilih anggota badan untuk melihat!",options:["Telinga","Mata","Hidung"],correctIdx:1,explanation:"Mata untuk melihat. Allah memberi kita mata yang sehat!",hints:["Yang ada di wajah, untuk melihat."],basePoint:40},
  {title:"Suara Jangkrik",story:"Suara 'kriuk kriuk' di malam hari.",instruction:"Suara hewan apa itu?",options:["Jangkrik","Kucing","Anjing"],correctIdx:0,explanation:"Jangkrik berbunyi 'kriuk kriuk' di malam hari.",hints:["Hewan kecil yang berbunyi di malam hari."],basePoint:40},
  {title:"Warna Pelangi",story:"Pelangi punya banyak warna.",instruction:"Apa warna pertama pelangi?",options:["Biru","Merah","Hijau"],correctIdx:1,explanation:"Merah adalah warna pertama pelangi. Mejikuhibiniu!",hints:["ME-rah, JIngga, KUning..."],basePoint:40},
  {title:"Makanan Pokok",story:"Makanan warna putih, dari beras, dimakan setiap hari.",instruction:"Makanan apakah ini?",options:["Nasi","Roti","Mie"],correctIdx:0,explanation:"Nasi makanan pokok kita. Sumber energi untuk bermain!",hints:["Dari beras, warnanya putih."],basePoint:40},
  {title:"Alat Makan",story:"Benda ini untuk mengambil makanan ke mulut.",instruction:"Benda apakah ini?",options:["Pisau","Sendok","Gelas"],correctIdx:1,explanation:"Sendok untuk mengambil makanan. Makan pakai sendok lebih rapi!",hints:["Bentuknya cekung, untuk menyendok."],basePoint:40},
  {title:"Tempat Ibadah",story:"Umat Islam shalat di...",instruction:"Tempat apakah itu?",options:["Gereja","Masjid","Pura"],correctIdx:1,explanation:"Masjid adalah tempat shalat umat Islam. Rumah Allah!",hints:["Tempat shalat umat Islam."],basePoint:40},
  {title:"Akan Hujan",story:"Langit gelap, ada petir.",instruction:"Apa yang akan terjadi?",options:["Panas","Hujan","Salju"],correctIdx:1,explanation:"Kalau langit gelap dan ada petir, tandanya mau hujan.",hints:["Langit gelap + petir = mau apa?"],basePoint:40},
  {title:"Kendaraan Keluarga",story:"Kendaraan roda 4, bisa bawa banyak orang.",instruction:"Kendaraan apakah ini?",options:["Sepeda","Mobil","Motor"],correctIdx:1,explanation:"Mobil punya 4 roda dan bisa bawa keluarga jalan-jalan.",hints:["Roda 4, untuk keluarga."],basePoint:40},
  {title:"Buah Manis",story:"Buah bulat kecil, warnanya ungu, rasanya manis.",instruction:"Buah apakah ini?",options:["Mangga","Anggur","Kelapa"],correctIdx:1,explanation:"Anggur bulat kecil, ungu, manis. Buah yang menyegarkan!",hints:["Bulat kecil, ungu, manis."],basePoint:40},
  {title:"Hitung Awan",story:"☁️☁️☁️☁️☁️",instruction:"Ada berapa awan?",options:["4","5","6"],correctIdx:1,explanation:"Lima awan putih di langit biru. Indah!",hints:["Hitung satu per satu."],basePoint:40},
  {title:"Benda Terbang",story:"Benda ini bisa terbang di langit. Punya sayap.",instruction:"Benda apakah ini?",options:["Ikan","Burung","Ular"],correctIdx:1,explanation:"Burung bisa terbang dengan sayapnya. Allah ciptakan sangat indah!",hints:["Punya sayap, bisa terbang."],basePoint:40},
  {title:"Musim Hujan",story:"Sering turun air dari langit. Jalanan basah.",instruction:"Musim apakah ini?",options:["Kemarau","Hujan","Panas"],correctIdx:1,explanation:"Musim hujan banyak air dari langit. Tanaman jadi subur!",hints:["Air dari langit = musim...?"],basePoint:40},
  {title:"Minuman Sehat",story:"Minuman putih, dari sapi. Bikin tubuh kuat.",instruction:"Minuman apakah ini?",options:["Sirup","Susu","Kopi"],correctIdx:1,explanation:"Susu dari sapi. Bikin tulang kuat dan sehat!",hints:["Putih, dari sapi, bikin kuat."],basePoint:40},
  {title:"Hitung Kupu-Kupu",story:"🦋🦋🦋",instruction:"Ada berapa kupu-kupu?",options:["2","3","4"],correctIdx:1,explanation:"Tiga kupu-kupu cantik terbang di taman.",hints:["Hitung satu satu."],basePoint:40},
  {title:"Alat Tulis",story:"Benda ini untuk menulis di buku. Terbuat dari kayu.",instruction:"Benda apakah ini?",options:["Spidol","Pensil","Penggaris"],correctIdx:1,explanation:"Pensil untuk menulis. Alat belajar yang penting!",hints:["Dari kayu, untuk menulis."],basePoint:40},
  {title:"Hewan Air",story:"Hewan ini hidup di air. Bernapas dengan insang.",instruction:"Hewan apakah ini?",options:["Kucing","Ikan","Burung"],correctIdx:1,explanation:"Ikan hidup di air dan bernapas dengan insang.",hints:["Hidup di air, berenang."],basePoint:40},
  {title:"Bagian Pohon",story:"Bagian pohon yang hijau dan untuk fotosintesis.",instruction:"Bagian apakah itu?",options:["Akar","Daun","Batang"],correctIdx:1,explanation:"Daun yang hijau membuat makanan untuk pohon.",hints:["Yang hijau di pohon."],basePoint:40},
  {title:"Waktu Makan",story:"Sarapan itu dimakan pada waktu...",instruction:"Kapan kita sarapan?",options:["Malam","Pagi","Siang"],correctIdx:1,explanation:"Sarapan dimakan pagi hari. Memberi energi untuk beraktivitas!",hints:["Sebelum berangkat sekolah."],basePoint:40},
];

const TK_POLA_EXTRA = [
  {title:"Pola ABC",story:"🔴🔵🟢🔴🔵🟢🔴 ?",instruction:"Apa selanjutnya?",options:["🔴","🔵","🟢"],correctIdx:1,explanation:"Tiga warna berulang: Merah-Biru-Hijau. Setelah Merah pasti Biru!",hints:["Siklus 3 warna yang berulang."],basePoint:40},
  {title:"Pola Binatang",story:"🐱🐶🐰🐱🐶🐰🐱 ?",instruction:"Binatang apa selanjutnya?",options:["🐱","🐶","🐰"],correctIdx:1,explanation:"Tiga binatang berulang. Setelah kucing pasti anjing!",hints:["Siklus 3 binatang."],basePoint:40},
  {title:"Pola Angka Lompat 2",story:"2, 4, 6, 8, ?",instruction:"Angka selanjutnya?",options:["9","10","7"],correctIdx:1,explanation:"Ditambah 2 setiap langkah. 8+2=10!",hints:["Tambah 2 setiap kali."],basePoint:40},
  {title:"Pola Cuaca",story:"☀️🌧️☀️🌧️☀️ ?",instruction:"Cuaca selanjutnya?",options:["☀️","🌧️","🌈"],correctIdx:1,explanation:"Panas-Hujan bergantian. Setelah panas pasti hujan!",hints:["Dua cuaca yang bergantian."],basePoint:40},
  {title:"Pola Bentuk",story:"⬜⚪⬜⚪⬜ ?",instruction:"Bentuk selanjutnya?",options:["⬜","⚪","🔺"],correctIdx:1,explanation:"Kotak-Lingkaran bergantian. Setelah kotak pasti lingkaran!",hints:["Dua bentuk bergantian."],basePoint:40},
  {title:"Pola Emosi",story:"😊😢😊😢😊 ?",instruction:"Emosi selanjutnya?",options:["😊","😢","😡"],correctIdx:1,explanation:"Senang-Sedih bergantian. Setelah senang pasti sedih!",hints:["Dua ekspresi bergantian."],basePoint:40},
  {title:"Pola Makanan",story:"🍕🍔🍕🍔🍕 ?",instruction:"Makanan selanjutnya?",options:["🍕","🍔","🍟"],correctIdx:1,explanation:"Pizza-Burger bergantian. Setelah pizza pasti burger!",hints:["Dua makanan bergantian."],basePoint:40},
  {title:"Pola Musim",story:"🌸☀️🍂❄️🌸☀️🍂 ?",instruction:"Musim selanjutnya?",options:["🌸","☀️","❄️"],correctIdx:2,explanation:"Empat musim berulang. Setelah gugur pasti dingin!",hints:["Siklus 4 musim."],basePoint:40},
  {title:"Lengkapi Pola",story:"🔺🔺⬜🔺🔺⬜🔺 ?",instruction:"Apa selanjutnya?",options:["🔺","⬜","🔵"],correctIdx:0,explanation:"Dua segitiga, satu kotak, berulang. Setelah kotak, mulai dua segitiga lagi!",hints:["Perhatikan kelompok 3."],basePoint:40},
  {title:"Pola Angka Turun",story:"10, 8, 6, 4, ?",instruction:"Angka selanjutnya?",options:["2","3","5"],correctIdx:0,explanation:"Dikurangi 2 setiap langkah. 4-2=2!",hints:["Kurangi 2 setiap kali."],basePoint:40},
  {title:"Pola ALat",story:"✏️📏✏️📏✏️ ?",instruction:"Alat selanjutnya?",options:["✏️","📏","📎"],correctIdx:1,explanation:"Pensil-Penggaris bergantian. Setelah pensil pasti penggaris!",hints:["Dua alat tulis bergantian."],basePoint:40},
  {title:"Pola Transportasi",story:"🚗✈️🚗✈️🚗 ?",instruction:"Kendaraan selanjutnya?",options:["🚗","✈️","🚢"],correctIdx:1,explanation:"Mobil-Pesawat bergantian. Setelah mobil pasti pesawat!",hints:["Dua kendaraan bergantian."],basePoint:40},
  {title:"Pola Olahraga",story:"⚽🏀⚽🏀⚽ ?",instruction:"Bola apa selanjutnya?",options:["⚽","🏀","🎾"],correctIdx:1,explanation:"Sepakbola-Basket bergantian. Setelah sepakbola pasti basket!",hints:["Dua olahraga bergantian."],basePoint:40},
  {title:"Pola Minuman",story:"🥛🧃🥛🧃🥛 ?",instruction:"Minuman selanjutnya?",options:["🥛","🧃","🥤"],correctIdx:1,explanation:"Susu-Jus bergantian. Setelah susu pasti jus!",hints:["Dua minuman bergantian."],basePoint:40},
  {title:"Pola Profesi",story:"👨‍🏫👨‍🚒👨‍🏫👨‍🚒👨‍🏫 ?",instruction:"Profesi selanjutnya?",options:["👨‍🏫","👨‍🚒","👨‍🍳"],correctIdx:1,explanation:"Guru-Pemadam bergantian!",hints:["Dua profesi bergantian."],basePoint:40},
  {title:"Pola Benda Langit",story:"⭐☁️⭐☁️⭐ ?",instruction:"Benda langit selanjutnya?",options:["⭐","☁️","🌙"],correctIdx:1,explanation:"Bintang-Awan bergantian!",hints:["Dua benda langit bergantian."],basePoint:40},
  {title:"Pola Sayuran",story:"🥕🥒🥕🥒🥕 ?",instruction:"Sayur apa selanjutnya?",options:["🥕","🥒","🍅"],correctIdx:1,explanation:"Wortel-Timun bergantian!",hints:["Dua sayuran bergantian."],basePoint:40},
  {title:"Pola Peralatan",story:"✂️🖍️✂️🖍️✂️ ?",instruction:"Alat selanjutnya?",options:["✂️","🖍️","📌"],correctIdx:1,explanation:"Gunting-Krayon bergantian!",hints:["Dua alat bergantian."],basePoint:40},
  {title:"Pola Pakaian",story:"👕👖👕👖👕 ?",instruction:"Pakaian selanjutnya?",options:["👕","👖","🧥"],correctIdx:1,explanation:"Baju-Celana bergantian!",hints:["Dua pakaian bergantian."],basePoint:40},
  {title:"Pola AABBCC",story:"🔴🔴🔵🔵🟢🟢🔴 ?",instruction:"Apa selanjutnya?",options:["🔴","🔵","🟢"],correctIdx:0,explanation:"Dua merah, dua biru, dua hijau, ulangi! Setelah hijau, kembali ke merah.",hints:["Kelompok warna dalam 2."],basePoint:40},
];

const TK_VISUAL_EXTRA = [
  {title:"Mana Lebih Panjang",story:"📏 dan ✏️",instruction:"Mana yang lebih panjang?",options:["📏 Penggaris","✏️ Pensil","Sama panjang"],correctIdx:0,explanation:"Penggaris lebih panjang dari pensil. Ukur dengan mata!",hints:["Lihat mana yang lebih panjang."],basePoint:40},
  {title:"Mana Lebih Berat",story:"🐘 dan 🐭",instruction:"Mana yang lebih berat?",options:["🐘 Gajah","🐭 Tikus","Sama berat"],correctIdx:0,explanation:"Gajah jauh lebih berat dari tikus. Gajah hewan darat terbesar!",hints:["Hewan besar itu..."],basePoint:40},
  {title:"Depan Belakang",story:"Adik berdiri. Meja di depan Adik. Kursi di belakang Adik.",instruction:"Apa yang di depan Adik?",options:["Kursi","Meja","Tidak ada"],correctIdx:1,explanation:"Meja di depan Adik. Kursi di belakang Adik.",hints:["Yang di depan itu..."],basePoint:40},
  {title:"Dekat Jauh",story:"Bulan di langit dan bola di tangan.",instruction:"Mana yang lebih dekat?",options:["🌙 Bulan","⚽ Bola","Sama dekat"],correctIdx:1,explanation:"Bola di tangan lebih dekat. Bulan jauh di langit!",hints:["Yang bisa dipegang itu lebih..."],basePoint:40},
  {title:"Tebal Tipis",story:"📕 Buku tebal dan 📄 kertas.",instruction:"Mana yang lebih tipis?",options:["📕 Buku","📄 Kertas","Sama"],correctIdx:1,explanation:"Kertas lebih tipis dari buku tebal.",hints:["Buku punya banyak halaman, kertas cuma..."],basePoint:40},
  {title:"Penuh Kosong",story:"🍶 Gelas penuh air dan 🥛 gelas kosong.",instruction:"Mana yang kosong?",options:["🍶 Gelas penuh","🥛 Gelas kosong","Dua-duanya"],correctIdx:1,explanation:"Gelas kosong tidak ada isinya. Gelas penuh ada airnya.",hints:["Yang tidak ada isinya = ..."],basePoint:40},
  {title:"Tinggi Rendah",story:"🦒 Jerapah dan 🐧 Pinguin.",instruction:"Mana yang lebih tinggi?",options:["🦒 Jerapah","🐧 Pinguin","Sama tinggi"],correctIdx:0,explanation:"Jerapah paling tinggi di dunia hewan. Pinguin lebih pendek.",hints:["Hewan berleher panjang itu..."],basePoint:40},
  {title:"Cepat Lambat",story:"🐆 Cheetah dan 🐢 Kura-kura.",instruction:"Mana yang lebih cepat?",options:["🐆 Cheetah","🐢 Kura-kura","Sama cepat"],correctIdx:0,explanation:"Cheetah hewan tercepat di darat. Kura-kura jalannya lambat.",hints:["Hewan cepat bertotol itu..."],basePoint:40},
  {title:"Banyak Sedikit",story:"🍎🍎🍎🍎🍎 dan 🍊🍊",instruction:"Mana yang lebih sedikit?",options:["🍎 Apel","🍊 Jeruk","Sama"],correctIdx:1,explanation:"2 jeruk lebih sedikit dari 5 apel.",hints:["Hitung masing-masing."],basePoint:40},
  {title:"Terang Gelap",story:"💡 Lampu menyala dan 🕯️ lilin kecil.",instruction:"Mana yang lebih terang?",options:["💡 Lampu","🕯️ Lilin","Sama terang"],correctIdx:0,explanation:"Lampu listrik lebih terang dari lilin kecil.",hints:["Yang pakai listrik lebih..."],basePoint:40},
  {title:"Bentuk Setengah",story:"Cari benda yang setengah lingkaran!",instruction:"Mana yang setengah lingkaran?",options:["🍕 Pizza","📖 Buku","⬜ Kotak"],correctIdx:0,explanation:"Pizza bentuknya setengah lingkaran atau lingkaran utuh!",hints:["Bentuk makanan yang dipotong segitiga."],basePoint:40},
  {title:"Lurus Bengkok",story:"Jalan raya dan jalan setapak di bukit.",instruction:"Mana yang lebih lurus?",options:["🛣️ Jalan raya","🐾 Jalan setapak","Sama"],correctIdx:0,explanation:"Jalan raya biasanya lurus. Jalan setapak berliku-liku.",hints:["Yang untuk mobil itu biasanya..."],basePoint:40},
  {title:"Basah Kering",story:"💧 Air dan 🏜️ Pasir.",instruction:"Mana yang basah?",options:["💧 Air","🏜️ Pasir","Dua-duanya"],correctIdx:0,explanation:"Air itu basah. Pasir di gurun itu kering.",hints:["Kalau kena air jadi..."],basePoint:40},
  {title:"Keras Lunak",story:"🪨 Batu dan 🧸 Boneka.",instruction:"Mana yang lebih lunak?",options:["🪨 Batu","🧸 Boneka","Sama"],correctIdx:1,explanation:"Boneka terasa lunak. Batu terasa keras.",hints:["Yang empuk untuk dipeluk itu..."],basePoint:40},
  {title:"Bentuk Hati",story:"Cari yang bentuknya hati!",instruction:"Mana yang bentuk hati?",options:["❤️ Hati","⭐ Bintang","🔴 Lingkaran"],correctIdx:0,explanation:"Hati (love) bentuknya seperti ini ❤️. Simbol cinta!",hints:["Bentuk simbol cinta."],basePoint:40},
  {title:"Lebar Sempit",story:"🌊 Laut dan 🏞️ Sungai kecil.",instruction:"Mana yang lebih lebar?",options:["🌊 Laut","🏞️ Sungai","Sama"],correctIdx:0,explanation:"Laut jauh lebih lebar dari sungai. Laut sangat luas!",hints:["Yang biru luas sekali itu..."],basePoint:40},
  {title:"Atas Bawah 2",story:"🐦 Burung di atas pohon. 🍄 Jamur di bawah pohon.",instruction:"Siapa yang di bawah?",options:["🐦 Burung","🍄 Jamur","Keduanya"],correctIdx:1,explanation:"Jamur tumbuh di bawah pohon. Burung hinggap di atas.",hints:["Yang di tanah dekat pohon."],basePoint:40},
  {title:"Bentuk Silang",story:"Cari yang bentuknya silang/tambah!",instruction:"Mana yang bentuk silang?",options:["➕ Tanda tambah","⚪ Lingkaran","⬜ Persegi"],correctIdx:0,explanation:"Tanda tambah (+) bentuknya silang. Dua garis yang berpotongan.",hints:["Dua garis yang bertemu di tengah."],basePoint:40},
  {title:"Arah Kanan",story:"Anak panah → menunjuk ke...",instruction:"Ke arah mana panah itu?",options:["Kiri","Kanan","Atas"],correctIdx:1,explanation:"Panah → menunjuk ke kanan. Kanan adalah arah jam 3.",hints:["Arah jam 3 itu..."],basePoint:40},
  {title:"Posisi Tengah",story:"Apel di kiri, jeruk di kanan, pisang di antara keduanya.",instruction:"Buah apa yang di tengah?",options:["Apel","Pisang","Jeruk"],correctIdx:1,explanation:"Pisang di tengah karena diapit apel dan jeruk.",hints:["Yang di antara dua buah."],basePoint:40},
];

const TK_KREATIVITAS_EXTRA = [
  {title:"Suara Hujan",story:"Adik ingin membuat suara seperti hujan.",instruction:"Bagaimana caranya?",options:["Tepuk tangan keras","Kocok beras dalam botol pelan-pelan","Diam saja"],correctIdx:1,explanation:"Kocok beras atau kacang hijau dalam botol, bunyinya mirip rintik hujan!",hints:["Benda kecil dalam wadah dikocok."],basePoint:40},
  {title:"Boneka Kaus Kaki",story:"Adik punya kaus kaki bekas yang bersih.",instruction:"Apa yang bisa dibuat?",options:["Buang saja","Bikin boneka dengan gambar wajah","Simpan terus"],correctIdx:1,explanation:"Kaus kaki bekas bisa jadi boneka lucu! Tambah mata dan mulut.",hints:["Kaus kaki bisa jadi mainan..."],basePoint:40},
  {title:"Gambar dari Cap",story:"Adik punya kentang dan cat warna.",instruction:"Bisa bikin apa?",options:["Makan kentangnya","Potong kentang jadi cap, celup cat, cap di kertas","Buang kentang"],correctIdx:1,explanation:"Kentang bisa dijadikan cap (stempel) untuk mencetak pola di kertas.",hints:["Kentang + cat = alat..."],basePoint:40},
  {title:"Gelas Musik",story:"Ada beberapa gelas kaca dan air.",instruction:"Bisa bikin apa?",options:["Minum semua","Isi air dengan ketinggian berbeda, ketuk untuk nada berbeda","Pecahkan"],correctIdx:1,explanation:"Gelas berisi air dengan ketinggian berbeda menghasilkan nada berbeda saat diketuk!",hints:["Gelas + air = alat..."],basePoint:40},
  {title:"Bayangan Tangan",story:"Ruangan gelap, ada senter menyala.",instruction:"Apa yang bisa dimainkan?",options:["Tidur saja","Buat bayangan tangan di tembok: kelinci, burung, anjing","Matikan senter"],correctIdx:1,explanation:"Dengan senter, kamu bisa membuat bayangan binatang dengan tanganmu!",hints:["Senter + tangan = bayangan..."],basePoint:40},
  {title:"Kotak Harta Karun",story:"Adik punya kotak sepatu bekas.",instruction:"Bisa dijadikan apa?",options:["Buang saja","Dihias jadi kotak harta karun untuk menyimpan mainan kecil","Biarkan kosong"],correctIdx:1,explanation:"Kotak sepatu bisa dihias jadi tempat penyimpanan yang cantik!",hints:["Kotak + hiasan = tempat..."],basePoint:40},
  {title:"Mahkota Raja",story:"Adik ingin jadi raja. Ada kertas karton.",instruction:"Apa yang bisa dibuat?",options:["Lipat jadi pesawat","Potong dan hias jadi mahkota","Robek-robek"],correctIdx:1,explanation:"Karton bisa dipotong dan dihias menjadi mahkota raja yang keren!",hints:["Yang dipakai di kepala raja..."],basePoint:40},
  {title:"Bunga Kertas",story:"Ada kertas warna-warni dan lem.",instruction:"Bisa dibuat apa?",options:["Sobek-sobek","Lipat dan tempel jadi bunga 3D","Simpan saja"],correctIdx:1,explanation:"Kertas warna-warni bisa dilipat dan ditempel menjadi bunga yang cantik!",hints:["Kertas + lipat + tempel = ..."],basePoint:40},
  {title:"Teropong Kardus",story:"Adik punya gulungan tisu bekas.",instruction:"Bisa dijadikan apa?",options:["Buang","Hias jadi teropong untuk main penjelajah","Simpan saja"],correctIdx:1,explanation:"Gulungan tisu bisa dihias jadi teropong. Ayo jadi penjelajah!",hints:["Gulungan tisu bisa jadi alat untuk..."],basePoint:40},
  {title:"Topeng Hewan",story:"Ada piring kertas bekas.",instruction:"Bisa dibuat apa?",options:["Buang","Gambar wajah hewan, lubangi mata, jadi topeng","Tumpuk saja"],correctIdx:1,explanation:"Piring kertas bisa jadi topeng binatang yang lucu!",hints:["Piring kertas + gambar + lubang = ..."],basePoint:40},
  {title:"Mobil Botol",story:"Adik punya botol plastik dan tutup botol.",instruction:"Bisa dibuat apa?",options:["Buang","Bikin mobil-mobilan dengan tutup sebagai roda","Simpan"],correctIdx:1,explanation:"Botol bisa jadi badan mobil, tutup botol jadi rodanya!",hints:["Botol + tutup = mainan..."],basePoint:40},
  {title:"Kalung Makaroni",story:"Ada makaroni dan benang.",instruction:"Bisa dibuat apa?",options:["Masak makaroni","Rangkai makaroni jadi kalung","Buang"],correctIdx:1,explanation:"Makaroni bisa dirangkai dengan benang jadi kalung yang unik!",hints:["Makaroni + benang = ..."],basePoint:40},
  {title:"Bingkai Stik",story:"Adik punya stik es krim bekas.",instruction:"Bisa dibuat apa?",options:["Buang","Tempel jadi bingkai foto kecil","Patahkan"],correctIdx:1,explanation:"Stik es krim bisa ditempel menjadi bingkai foto yang cantik!",hints:["Stik + tempel = bingkai..."],basePoint:40},
  {title:"Gitar Karet",story:"Ada kotak tisu dan karet gelang.",instruction:"Bisa dibuat apa?",options:["Buang","Rentangkan karet di kotak, petik untuk bunyi seperti gitar","Simpan"],correctIdx:1,explanation:"Karet gelang direntangkan di kotak bisa berbunyi seperti gitar!",hints:["Kotak + karet = alat musik..."],basePoint:40},
  {title:"Wayang Kardus",story:"Ada kardus bekas dan stik es krim.",instruction:"Bisa dibuat apa?",options:["Buang","Gunting kardus bentuk tokoh, tempel ke stik jadi wayang","Robek"],correctIdx:1,explanation:"Kardus bisa dibuat wayang sederhana untuk bercerita!",hints:["Kardus + stik = boneka..."],basePoint:40},
  {title:"Pelangi Kapas",story:"Ada kapas dan cat air.",instruction:"Bisa dibuat apa?",options:["Buang","Warnai kapas warna-warni susun jadi pelangi di kertas","Simpan"],correctIdx:1,explanation:"Kapas berwarna-warni bisa disusun jadi pelangi yang indah!",hints:["Kapas + warna-warni = ..."],basePoint:40},
  {title:"Kincir Angin",story:"Ada kertas lipat dan sedotan.",instruction:"Bisa dibuat apa?",options:["Buang","Lipat kertas jadi kincir, tusuk sedotan sebagai pegangan","Minum sedotan"],correctIdx:1,explanation:"Kertas lipat bisa jadi kincir angin! Tiup atau bawa berlari!",hints:["Kertas + sedotan = ..."],basePoint:40},
  {title:"Ular Kertas",story:"Adik punya kertas panjang dan spidol.",instruction:"Bisa dibuat apa?",options:["Buang","Lipat seperti akordion, gambar mata, jadi ular","Robek"],correctIdx:1,explanation:"Kertas dilipat bolak-balik jadi ular yang bisa bergerak!",hints:["Lipat-lipat + gambar = ..."],basePoint:40},
  {title:"Telepon Kaleng",story:"Ada 2 kaleng bekas dan tali.",instruction:"Bisa dibuat apa?",options:["Buang","Lubangi, sambung dengan tali jadi telepon-teleponan","Simpan"],correctIdx:1,explanation:"Kaleng yang disambung tali bisa jadi telepon sederhana. Suara merambat lewat tali!",hints:["Kaleng + tali = alat..."],basePoint:40},
  {title:"Robot Kotak",story:"Ada beberapa kotak kecil bekas.",instruction:"Bisa dibuat apa?",options:["Buang","Susun dan tempel jadi robot-robotan lucu","Simpan saja"],correctIdx:1,explanation:"Kotak-kotak bekas bisa disusun menjadi robot yang keren!",hints:["Kotak + susun = mainan..."],basePoint:40},
];

// Generate all missions
const allMissions = [];
let tkNum = 61;

function addMissions(templates, prefix, cat, type) {
  templates.forEach(t => {
    if (tkNum % 10 === 0) tkNum++; // skip boss positions
    if (tkNum > 300) return;
    const m = gen({
      prefix, num: tkNum, title: t.title, category: cat, missionType: type,
      story: t.story, instruction: t.instruction,
      options: t.options, correctIdx: t.correctIdx,
      explanation: t.explanation, hints: t.hints, basePoint: t.basePoint,
      adabBonus: t.adabBonus, adabFeedback: t.adabFeedback
    });
    allMissions.push(m);
    tkNum++;
  });
}

// Add Adab missions (from 61 to fill remaining adab slots)
addMissions(TK_ADAB_EXTRA, 'tk', 'tk-adab', 'tk_adab_basic');
addMissions(TK_PRELIT_EXTRA, 'tk', 'tk-pra-literasi', 'tk_pre_literacy');
addMissions(TK_POLA_EXTRA, 'tk', 'tk-pola', 'tk_pattern_simple');
addMissions(TK_VISUAL_EXTRA, 'tk', 'tk-visual', 'tk_visual_match');
addMissions(TK_KREATIVITAS_EXTRA, 'tk', 'tk-kreativitas', 'tk_creativity_simple');

// Write output
const outPath = path.join(__dirname, '..', 'src', 'data', 'tkMissionsRemaining.json');
fs.writeFileSync(outPath, JSON.stringify(allMissions, null, 2));
console.log(`Generated ${allMissions.length} missions to ${outPath}`);
console.log(`Last tk number: ${tkNum}`);
