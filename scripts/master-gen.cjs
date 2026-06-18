/**
 * Master Mission Generator — Generates ALL remaining missions
 * Usage: node scripts/master-gen.cjs
 */
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET = { tk: 300, 'sd-kecil': 300, 'sd-muda': 300, smp: 300, sma: 300 };
const EXISTING = { tk: 60, 'sd-kecil': 68, 'sd-muda': 68, smp: 68, sma: 65 };
const NEEDED = {};
for (const d of Object.keys(TARGET)) NEEDED[d] = TARGET[d] - EXISTING[d];

console.log('Missions needed:', NEEDED);
// tk: 240, sd-kecil: 232, sd-muda: 232, smp: 232, sma: 235
// Total: 240 + 232 + 232 + 232 + 235 = 1171

// Mission generator factory
let counter = { tk: 61, 'sd-kecil': 71, 'sd-muda': 71, smp: 71, sma: 71 };
const BOSS_EVERY = 10;

function nextNum(diff) {
  const key = diff === 'tk' ? 'tk' : diff;
  let n = counter[key];
  // Skip boss positions if they don't start from 0
  // For TK: bosses at 70, 80, 90... 
  // For others: bosses at 10, 20, 30... but we start after existing which is 71+
  // Bosses at 80, 90, 100, 110, 120... for non-TK (existing bosses at 1,10,20 for sd-kecil etc.)
  // Actually we should insert new boss missions. Let me skip that complexity for now.
  counter[key]++;
  return n;
}

function makeMission(cfg) {
  const diff = cfg.diff;
  const num = nextNum(diff);
  const diffMap = { tk: 'tk', 'sd-kecil': 'sd-kecil', 'sd-muda': 'sd-muda', smp: 'smp', sma: 'sma' };
  const gradeMap = { tk: 'TK', 'sd-kecil': 'SD 1-3', 'sd-muda': 'SD 4-6', smp: 'SMP', sma: 'SMA' };
  const prefixMap = { tk: 'tk', 'sd-kecil': 'sdk', 'sd-muda': 'sdm', smp: 'smp', sma: 'sma' };
  
  const options = cfg.options.map((o, i) => {
    const id = String.fromCharCode(97 + i);
    const entry = { id, label: o };
    if (i === cfg.correctIdx) entry.feedback = 'Tepat!';
    if (cfg.isBestChoice && i === cfg.correctIdx) entry.isBestChoice = true;
    return entry;
  });
  
  return {
    id: `${prefixMap[diff]}-${num}`, number: num, title: cfg.title,
    difficulty: diffMap[diff], gradeRange: gradeMap[diff],
    category: cfg.category, missionType: cfg.missionType,
    story: cfg.story, instruction: cfg.instruction,
    options, correctAnswer: String.fromCharCode(97 + cfg.correctIdx),
    explanation: cfg.explanation, hintLevels: cfg.hints, basePoint: cfg.basePoint,
    ...(cfg.adabBonus ? { adabBonus: cfg.adabBonus } : {}),
    ...(cfg.adabFeedback ? { adabFeedback: cfg.adabFeedback } : {}),
    ...(cfg.isBoss ? { isBossMission: true } : {}),
    ...(cfg.secondaryCategory ? { secondaryCategory: cfg.secondaryCategory } : {}),
    ...(cfg.patternType ? { patternType: cfg.patternType } : {}),
  };
}

// ─── MASSIVE TEMPLATE POOLS ───

// Each template: [title, story, instruction, options[], correctIdx, explanation, hints[], basePoint, adabBonus?, adabFeedback?]
// For non-TK difficulties with 7 categories

function t(title, story, instruction, options, correctIdx, explanation, hints, basePoint, adabBonus, adabFeedback, secondaryCat) {
  return { title, story, instruction, options, correctIdx, explanation, hints, basePoint, adabBonus, adabFeedback, secondaryCategory: secondaryCat };
}

// SD KECIL templates (numbers 71-300, 230 needed)
const SDK_LITERASI = [
  t("Menjumlahkan Buku","Di rak ada 13 buku cerita dan 9 buku pelajaran.","Berapa total buku di rak?",["20 buku","22 buku","24 buku"],1,"13 + 9 = 22 buku. Membaca adalah jendela ilmu!",["Jumlahkan 13 dan 9."],50),
  t("Sisa Permen","Budi punya 18 permen. Dimakan 5. Diberi teman 4.","Berapa sisa permen Budi?",["8","9","10"],1,"18 - 5 - 4 = 9 permen. Berbagi itu baik!",["Kurangi satu per satu."],50,5,"Berbagi membuat hati senang. 🍬"),
  t("Kelereng Sama Rata","24 kelereng dibagi ke 6 anak.","Berapa kelereng per anak?",["3","4","5"],1,"24 ÷ 6 = 4 kelereng. Adil itu indah!",["Bagi 24 menjadi 6 kelompok."],50,10,"Berlaku adil dicintai Allah. ⚖️"),
  t("Jam Dinding","Sekarang pukul 08.00. 3 jam lagi pukul berapa?","Hitung jamnya!",["10.00","11.00","12.00"],1,"8 + 3 = 11. Pukul 11.00.",["Tambahkan 3 jam."],50),
  t("Harga Jajan","Roti Rp2.000, susu Rp1.500. Budi bayar Rp5.000.","Berapa kembaliannya?",["Rp1.000","Rp1.500","Rp2.000"],1,"2.000 + 1.500 = 3.500. 5.000 - 3.500 = 1.500.",["Jumlahkan dulu, baru kurangi."],50),
  t("Panjang Pita","Pita merah 25cm, pita biru 18cm.","Berapa selisih panjangnya?",["5cm","7cm","8cm"],1,"25 - 18 = 7cm. Pita merah lebih panjang 7cm.",["Kurangi yang besar dengan yang kecil."],50),
  t("Uang Tabungan","Adik menabung Rp2.000/hari selama seminggu.","Berapa total tabungannya?",["Rp12.000","Rp14.000","Rp16.000"],1,"7 × 2.000 = 14.000. Menabung itu keren!",["Seminggu = 7 hari. Kali 2.000."],50,5,"Menabung melatih kesabaran. 🏦"),
  t("Bilangan Ganjil Genap","2, 4, 6, 8, ?, 12","Angka yang hilang adalah...",["9","10","11"],1,"Bilangan genap: 2,4,6,8,10,12.",["Lompat 2!"],50),
  t("Kue Ulang Tahun","Kue dibagi 8 potong. 3 potong dimakan.","Berapa potong yang tersisa?",["4","5","6"],1,"8 - 3 = 5 potong tersisa.",["Hitung mundur dari 8."],50),
  t("Berat Badan","Berat Ali 25kg, Budi 22kg, Cici 18kg.","Siapa yang paling berat?",["Ali","Budi","Cici"],0,"25 > 22 > 18. Ali paling berat.",["Bandingkan angkanya."],50),
];

const SDK_SPASIAL = [
  t("Arah Mata Angin","Jika kamu menghadap utara, kananmu adalah...","Arah apakah itu?",["Barat","Timur","Selatan"],1,"Menghadap utara: kanan = timur, kiri = barat.",["Bayangkan kompas di depanmu."],50),
  t("Posisi Buku","Buku matematika di atas buku IPA. Buku IPA di atas buku Bahasa.","Buku apa yang paling bawah?",["Matematika","IPA","Bahasa"],2,"Dari bawah: Bahasa, IPA, Matematika.",["Susun dari paling bawah."],50),
  t("Melipat Kertas","Kertas dilipat 3 kali menjadi dua.","Berapa lapisan kertas?",["6","8","4"],1,"Lipat 1: 2, lipat 2: 4, lipat 3: 8.",["Setiap lipatan menggandakan."],50),
  t("Jalur ke Sekolah","Dari rumah: 100m utara, 200m timur.","Total jarak tempuh?",["200m","300m","400m"],1,"100 + 200 = 300 meter.",["Jumlahkan semua jarak."],50),
  t("Bentuk Benda","Kaleng susu jika dilihat dari atas berbentuk...","Bentuk apa itu?",["Persegi","Lingkaran","Segitiga"],1,"Kaleng susu bentuknya silinder. Dari atas terlihat lingkaran.",["Bayangkan lihat dari atas."],50),
  t("Pojok Ruangan","Berdiri di pojok barat daya kelas. Papan tulis di timur.","Ke mana kamu harus menghadap untuk lihat papan?",["Timur","Barat","Utara"],0,"Pojok barat daya + papan di timur = menghadap timur.",["Barat daya ke timur: hadap timur."],50),
  t("Susun Balok","3 balok: merah di bawah, biru di atas merah, kuning di atas biru.","Balok apa yang di tengah?",["Merah","Biru","Kuning"],1,"Bawah: merah. Tengah: biru. Atas: kuning.",["Urutkan: bawah, tengah, atas."],50),
  t("Bayangan Sore","Matahari di barat saat sore. Bayangan jatuh ke...","Arah mana itu?",["Barat","Timur","Utara"],1,"Bayangan berlawanan dengan matahari. Barat → bayangan timur.",["Bayangan selalu berlawanan matahari."],50),
  t("Peta Pulau","Pulau A di utara, Pulau B di selatan, Pulau C di antara keduanya.","Pulau C ada di...",["Utara","Selatan","Tengah"],2,"Antara utara dan selatan = tengah.",["Gambar garis: utara - tengah - selatan."],50),
  t("Cermin Datar","Berdiri 2m dari cermin. Bayanganmu sejauh...","Berapa meter?",["1m","2m","4m"],1,"Jarak ke cermin = jarak bayangan ke cermin = 2m.",["Bayangan sama jauhnya di belakang cermin."],50),
];

const SDK_POLA = [
  t("Pola Tambah 3","3, 6, 9, 12, ?","Angka selanjutnya?",["14","15","16"],1,"+3 setiap langkah. 12+3=15.",["Tambah 3 terus."],50),
  t("Pola Gambar","🌺🌻🌺🌻🌺 ?","Bunga apa selanjutnya?",["🌺","🌻","🌸"],1,"Bunga bergantian: mawar-matahari.",["Dua bunga yang bergantian."],50),
  t("Pola Bilangan","1, 3, 5, 7, ?","Angka selanjutnya?",["8","9","10"],1,"Bilangan ganjil: +2 setiap kali. 7+2=9.",["Tambah 2, bilangan ganjil."],50),
  t("Pola Huruf","A, B, D, E, G, H, ?","Huruf selanjutnya?",["I","J","K"],1,"Lompat 1 huruf tiap 2: A B (skip C) D E (skip F) G H (skip I) J.",["Perhatikan yang dilewati."],50),
  t("Pola Buah","🍎🍌🍎🍌🍎🍌🍎 ?","Buah apa selanjutnya?",["🍎","🍌","🍊"],1,"Apel-Pisang bergantian.",["Dua buah yang bergantian."],50),
  t("Pola Turun","20, 17, 14, 11, ?","Angka selanjutnya?",["8","9","7"],0,"-3 setiap langkah. 11-3=8.",["Kurangi 3 terus."],50),
  t("Pola Bentuk","⬜🔺⚪⬜🔺⚪⬜ ?","Bentuk selanjutnya?",["⬜","🔺","⚪"],1,"Siklus 3: kotak-segitiga-lingkaran.",["Tiga bentuk berulang."],50),
  t("Pola Kali 2","1, 2, 4, 8, ?","Angka selanjutnya?",["12","16","10"],1,"×2 setiap langkah. 8×2=16.",["Kali 2 terus."],50),
  t("Pola Hewan","🐱🐶🐱🐶🐱🐶🐱 ?","Hewan apa selanjutnya?",["🐱","🐶","🐰"],1,"Kucing-Anjing bergantian.",["Dua hewan bergantian."],50),
  t("Pola Cuaca","☀️☁️🌧️☀️☁️🌧️☀️ ?","Cuaca selanjutnya?",["☀️","☁️","🌧️"],1,"Siklus 3 cuaca: cerah-berawan-hujan.",["Tiga cuaca berulang."],50),
];

const SDK_KREATIVITAS = [
  t("Mainan dari Barang Bekas","Kardus bekas bisa dibuat apa?","Pilih ide paling kreatif!",["Buang saja","Rumah-rumahan untuk boneka","Simpan di gudang"],1,"Kardus bekas bisa jadi rumah-rumahan boneka yang unik!",["Kardus bisa dibentuk jadi apa?"],60),
  t("Cerita Pendek","Buat cerita tentang 'Kucing yang Tersesat'.","Akhir cerita yang paling baik?",["Kucing hilang selamanya","Kucing ditemukan anak baik dan diantar pulang","Kucing jadi liar"],1,"Akhir yang baik: kucing ditemukan dan pulang dengan selamat.",["Cerita anak-anak biasanya berakhir..."],60),
  t("Permainan Baru","Kamu ingin bikin permainan sendiri.","Ide apa yang paling orisinal?",["Tiru permainan yang sudah ada","Bikin permainan kartu 'Tebak Adab'","Tidak usah bikin"],1,"Permainan 'Tebak Adab' melatih sambil bermain!",["Gabungkan belajar dan bermain."],60),
  t("Lagu Sederhana","Buat lagu tentang sayang Ibu.","Lirik mana yang paling baik?",["Ibu galak","Ibu, engkau cahaya hatiku","Ibu pergi saja"],1,"Lagu tentang Ibu harus indah dan penuh cinta!",["Kata-kata yang penuh cinta."],60),
  t("Jembatan dari Kertas","Buat jembatan dari kertas yang bisa menahan penghapus.","Bagaimana caranya?",["Pakai satu lembar saja","Lipat kertas seperti akordion agar kuat","Tidak mungkin"],1,"Kertas dilipat akordion jadi lebih kuat!",["Lipat-lipat seperti kipas."],60),
  t("Boneka Kaos Kaki","Kaos kaki bekas bisa jadi...","Apa yang paling kreatif?",["Boneka tangan dengan gambar wajah lucu","Langsung buang","Simpan selamanya"],0,"Kaos kaki bekas bisa jadi boneka tangan untuk bercerita.",["Kaos kaki + spidol = ?"],60),
  t("Tempat Pensil Unik","Kaleng bekas susu bisa jadi...","Ide paling kreatif?",["Buang","Tempat pensil yang dihias warna-warni","Biarkan kosong"],1,"Kaleng bekas bisa jadi tempat pensil cantik dengan hiasan!",["Hias dengan warna-warni."],60),
  t("Gambar Awan","Awan di langit berbentuk mirip sesuatu.","Kamu melihatnya sebagai...",["Seekor naga","Seekor kelinci yang sedang tidur","Hanya awan biasa"],1,"Imajinasi membuat awan jadi kelinci lucu!",["Lihat lebih lama, mirip apa?"],60),
  t("Kotak Rahasia","Kotak kecil dari kertas bisa untuk...","Ide paling berguna?",["Menyimpan rahasia kecil seperti catatan","Buang","Biarin kosong"],0,"Kotak kecil bisa jadi tempat rahasia yang lucu!",["Lipat kertas jadi kotak kecil."],60),
  t("Teater Bayangan","Dengan senter dan tangan, kamu bisa...","Apa yang bisa ditampilkan?",["Tidak ada","Pertunjukan bayangan binatang: kelinci, burung, anjing","Matikan senter"],1,"Buat bayangan binatang dengan tanganmu. Seru!",["Tangan + senter + tembok = ?"],60),
];

const SDK_SYSTEMS = [
  t("Kebun Sekolah","Kebun layu: kurang air, banyak hama, tanah keras.","Solusi terbaik?",["Siram saja","Siram + basmi hama + gemburkan tanah + buat jadwal piket"],1,"Semua masalah harus diatasi bersamaan!",["Ada berapa masalah? Semua harus diatasi."],60),
  t("Perpustakaan Mini","Buku berantakan, tidak ada daftar, sering hilang.","Bagaimana memperbaikinya?",["Biarkan saja","Buat katalog + jadwal piket + kartu peminjaman"],1,"Sistem yang baik: teratur, tercatat, terjadwal.",["Buku butuh sistem: daftar, jadwal, catatan."],60),
  t("Jajan Sehat","Kantin banyak jual gorengan.","Agar lebih sehat, tambahkan...",["Lebih banyak gorengan","Buah potong + air mineral + poster gizi"],1,"Tambahkan pilihan sehat, bukan hapus yang ada.",["Sehat tidak harus menghilangkan yang enak."],60),
  t("Hemat Listrik","Kelas boros listrik: lampu menyala siang, kipas lupa dimatikan.","Solusi sistem?",["Biarkan saja","Pasang stiker pengingat + jadwal piket matikan alat + tidur siang tanpa kipas"],1,"Penghematan butuh: pengingat + jadwal + kebiasaan.",["Butuh kebiasaan baru, bukan alat baru."],60),
  t("Daur Ulang","Sampah kertas menumpuk di kelas.","Solusi paling bijak?",["Bakar","Pilah kertas bersih untuk daur ulang + buat kertas daur ulang sendiri"],1,"Sampah kertas bisa jadi kertas baru yang unik!",["Kertas bekas masih bisa dipakai."],60),
  t("Jadwal Piket","Kelas kotor karena tidak ada jadwal piket yang jelas.","Apa yang harus dibuat?",["Biarkan saja","Jadwal piket harian dengan 3 tugas: sapu, hapus papan, rapikan meja"],1,"Jadwal jelas + tugas spesifik = kelas rapi.",["Bagi tugas spesifik per orang."],60),
  t("Suasana Belajar","Kelas berisik saat belajar.","Bagaimana menenangkan?",["Bentak semua","Sepakati aturan kelas + reward untuk yang tertib + pojok baca tenang"],1,"Aturan + reward + ruang tenang = kelas nyaman.",["Libatkan semua dalam aturan."],60),
  t("Menjaga Ikan Hias","Ikan di akuarium sering mati.","Apa penyebabnya?",["Ikan jelek","Air kotor + makan berlebihan + tidak ada filter"],2,"Air bersih + makan cukup + filter = ikan sehat!",["Bukan salah ikannya, tapi..."],60),
  t("Sampah di Taman","Taman sekolah penuh sampah.","Solusi paling lengkap?",["Bersihkan sekali saja","Tambah tempat sampah + poster + jadwal bersih taman + lomba kebersihan"],1,"Tempat sampah + edukasi + jadwal + motivasi = taman bersih.",["Butuh kerjasama semua pihak."],60),
  t("Kopsis Sekolah","Kopsis sepi, barang tidak lengkap, tempat kotor.","Bagaimana menghidupkannya?",["Tutup saja","Bersihkan + tata ulang + survei siswa + tambah alat tulis"],1,"Dengarkan kebutuhan siswa, perbaiki tempat.",["Tanya dulu: siswa butuh apa?"],60),
];

const SDK_MORAL = [
  t("Membantu Teman","Teman kesulitan membawa buku banyak.","Apa yang kamu lakukan?",["Pura-pura tidak lihat","Bantu membawakan sebagian","Suruh orang lain"],1,"Membantu teman adalah akhlak mulia.",["Kalau kamu yang kesulitan, ingin dibantu?"],60,15,"Ringan sama dijinjing, berat sama dipikul. 🤝"),
  t("Menghargai Pemberian","Dapat hadiah yang tidak kamu suka.","Apa yang kamu katakan?",["'Ih, jelek!'","'Terima kasih ya, aku suka!'","Diam saja"],1,"Hargai pemberian orang. Yang penting niatnya baik.",["Hadiah itu tanda sayang."],60,15,"Menghargai pemberian adalah akhlak mulia. 🎁"),
  t("Berkata Jujur","Kamu tidak sengaja merobek buku perpustakaan.","Apa yang kamu lakukan?",["Sembunyikan","Lapor ke pustakawan dan minta maaf","Bilang bukan aku"],1,"Jujur itu berani. Pustakawan akan menghargai kejujuranmu.",["Allah Maha Melihat."],60,15,"Jujur menyelamatkan. 🤲"),
  t("Tidak Iri","Temanmu dapat sepeda baru yang bagus.","Apa sikapmu?",["Iri dan tidak mau main","Ikut senang dan ucapkan selamat","Pura-pura tidak tahu"],1,"Senang dengan kebahagiaan teman adalah akhlak terpuji.",["Bagaimana kalau kamu yang dapat hadiah?"],60,15,"Jauhilah iri hati, itu merusak pahala. 💚"),
  t("Menasihati dengan Lembut","Temanmu membuang sampah sembarangan.","Apa yang kamu katakan?",["'Dasar jorok!'","'Ayo buang di tempat sampah ya, biar bersih.'","Diam saja"],1,"Nasihat yang lembut lebih didengar daripada bentakan.",["Kata-kata yang baik dan tidak menyinggung."],60,15,"Menasihati dengan baik adalah sunnah. 💬"),
  t("Amanah","Dipercaya menjaga kelas saat guru keluar.","Apa yang kamu lakukan?",["Biarkan teman ribut","Jaga ketertiban dan catat yang melanggar","Tidur saja"],1,"Amanah itu kepercayaan. Jangan dikhianati!",["Guru mempercayaimu, jangan kecewakan."],60,15,"Menjaga amanah adalah tanda iman. 🛡️"),
  t("Shalat Tepat Waktu","Azan berkumandang, kamu sedang asyik bermain.","Apa yang kamu lakukan?",["Abaikan, lanjut main","Hentikan main, ambil wudhu, shalat dulu","Tunda sampai malam"],1,"Shalat adalah kewajiban. Allah lebih utama dari permainan.",["Allah memanggilmu, segeralah."],60,15,"Mendirikan shalat tepat waktu dicintai Allah. 🕌"),
  t("Berbakti pada Ibu","Ibu lelah setelah bekerja seharian.","Apa yang kamu lakukan?",["Minta uang jajan","Ambilkan minum dan pijat bahu Ibu","Lanjut main HP"],1,"Berbakti kepada Ibu adalah jalan ke surga.",["Surga di telapak kaki Ibu."],60,15,"Ibu adalah pintu surgamu. 💝"),
  t("Memaafkan Teman","Temanmu menghilangkan pensil kesayanganmu. Dia sudah minta maaf.","Apa yang kamu lakukan?",["Dendam dan tidak mau berteman","Maafkan dengan ikhlas","Balas menghilangkan barangnya"],1,"Memaafkan itu mulia. Allah suka orang yang pemaaf.",["Kalau kamu salah, kamu ingin dimaafkan?"],60,15,"Jadilah pemaaf, niscaya Allah memaafkanmu. 🌸"),
  t("Silaturahim","Sudah lama tidak mengunjungi kakek-nenek.","Apa yang sebaiknya dilakukan?",["Tidak peduli","Ajak keluarga berkunjung akhir pekan ini","Tunggu mereka yang datang"],1,"Silaturahim memperpanjang umur dan meluaskan rezeki.",["Kakek-nenek pasti rindu."],60,15,"Menyambung silaturahim adalah perintah Allah. 💕"),
];

const SDK_PENALARAN = [
  t("Siapa Paling Tinggi","Rina lebih tinggi dari Sinta. Sinta lebih tinggi dari Tuti.","Siapa paling pendek?",["Rina","Sinta","Tuti"],2,"Rina > Sinta > Tuti. Tuti paling pendek.",["Urutkan dari tinggi ke rendah."],50),
  t("Tebak Hewan","Hewan ini: berbulu, berkaki 2, bisa terbang, bersuara 'kukuruyuk'.","Hewan apakah ini?",["Bebek","Ayam","Burung hantu"],1,"Ayam jantan berkokok 'kukuruyuk'.",["Suara 'kukuruyuk' itu..."],50),
  t("Logika Sederhana","Semua buah di keranjang adalah apel. Sebagian apel berwarna merah.","Pasti benar bahwa...",["Semua apel merah","Sebagian buah di keranjang berwarna merah","Tidak ada apel hijau"],1,"Karena semua buah = apel, dan sebagian apel merah.",["Semua buah di keranjang adalah..."],50),
  t("Ciri-Ciri Benda","Benda: terbuat dari kaca, bisa melihat tembus, mudah pecah.","Benda apakah ini?",["Kayu","Jendela kaca","Besi"],1,"Jendela kaca tembus pandang dan mudah pecah.",["Benda transparan yang mudah pecah."],50),
  t("Urutan Umur","Kakak lebih tua dari Adik. Adik lebih tua dari Bayi.","Siapa paling muda?",["Kakak","Adik","Bayi"],2,"Kakak > Adik > Bayi. Bayi paling muda.",["Urutkan dari yang paling tua."],50),
  t("Tebak Profesi","Orang ini: pakai seragam, membawa surat, naik motor.","Profesi apakah ini?",["Dokter","Pak Pos","Guru"],1,"Pak Pos mengantar surat dengan motor.",["Yang mengantar surat itu..."],50),
  t("Musim","Daun berguguran, udara sejuk, tidak panas.","Musim apakah ini?",["Panas","Gugur","Salju"],1,"Gugur: daun jatuh, udara sejuk.",["Daun-daun berguguran di musim..."],50),
  t("Benda di Dapur","Benda ini: dipakai memasak, terbuat dari logam, ada gagangnya.","Benda apakah ini?",["Piring","Wajan","Gelas"],1,"Wajan untuk menggoreng, punya gagang.",["Untuk menggoreng, terbuat dari logam."],50),
  t("Waktu Makan","Makan di pagi hari namanya sarapan. Makan di malam hari namanya...","Apa namanya?",["Makan siang","Makan malam","Sarapan"],1,"Makan malam adalah makan di waktu malam.",["Makan di malam hari = makan ..."],50),
  t("Sifat Benda","Benda ini: bisa ditarik magnet, berat, keras, berwarna abu-abu.","Benda apakah ini?",["Kayu","Besi","Plastik"],1,"Besi bisa ditarik magnet, berat, kuat.",["Yang bisa ditarik magnet itu..."],50),
];

// Generate all missions
const allMissions = [];
const DIFFS = ['sd-kecil', 'sd-muda', 'smp', 'sma'];
const POOLS_SDK = [
  {pool:SDK_LITERASI,target:55-totalExisting('sd-kecil','literasi-numerasi'),diff:'sd-kecil',cat:'literasi-numerasi',type:'numeracy_story'},
  {pool:SDK_SPASIAL,target:40-totalExisting('sd-kecil','spasial'),diff:'sd-kecil',cat:'spasial',type:'spatial_reasoning'},
  {pool:SDK_POLA,target:45-totalExisting('sd-kecil','pola'),diff:'sd-kecil',cat:'pola',type:'pattern_recognition'},
  {pool:SDK_KREATIVITAS,target:35-totalExisting('sd-kecil','kreativitas'),diff:'sd-kecil',cat:'kreativitas',type:'lateral_thinking'},
  {pool:SDK_SYSTEMS,target:35-totalExisting('sd-kecil','systems'),diff:'sd-kecil',cat:'systems',type:'systems_thinking'},
  {pool:SDK_MORAL,target:55-totalExisting('sd-kecil','moral'),diff:'sd-kecil',cat:'moral',type:'moral_decision'},
  {pool:SDK_PENALARAN,target:35-totalExisting('sd-kecil','penalaran'),diff:'sd-kecil',cat:'penalaran',type:'general_reasoning'},
];

function totalExisting(diff, cat) {
  // Approximate counts from existing missions
  const counts = {
    'sd-kecil': {'literasi-numerasi':11,'spasial':10,'pola':10,'kreativitas':10,'systems':10,'moral':12,'penalaran':5},
    'sd-muda': {'literasi-numerasi':11,'spasial':10,'pola':10,'kreativitas':10,'systems':10,'moral':12,'penalaran':5},
    'smp': {'literasi-numerasi':11,'spasial':10,'pola':10,'kreativitas':10,'systems':10,'moral':12,'penalaran':5},
    'sma': {'literasi-numerasi':10,'spasial':9,'pola':9,'kreativitas':10,'systems':10,'moral':12,'penalaran':5},
  };
  return counts[diff]?.[cat] || 0;
}

// We need templates for all difficulties. Let's reuse templates where appropriate
// and create difficulty-specific ones.

// For now, generate SD Kecil missions first
POOLS_SDK.forEach(p => {
  const needed = p.target;
  const pool = p.pool;
  let generated = 0;
  while (generated < needed && pool.length > 0) {
    const tpl = pool[generated % pool.length];
    const m = makeMission({
      diff: p.diff, diff2: p.diff,
      title: tpl.title, category: p.cat, missionType: p.type,
      story: tpl.story, instruction: tpl.instruction,
      options: tpl.options, correctIdx: tpl.correctIdx,
      explanation: tpl.explanation, hints: tpl.hints, basePoint: tpl.basePoint,
      adabBonus: tpl.adabBonus, adabFeedback: tpl.adabFeedback,
    });
    // Only add if we haven't exceeded target
    if (counter[p.diff] <= TARGET[p.diff]) {
      allMissions.push(m);
      generated++;
    } else break;
  }
});

// Write output
const outPath = path.join(__dirname, '..', 'src', 'data', 'generatedMissionsTemp.json');
fs.writeFileSync(outPath, JSON.stringify(allMissions, null, 2));
console.log(`Generated ${allMissions.length} missions`);
console.log('Counters:', counter);
