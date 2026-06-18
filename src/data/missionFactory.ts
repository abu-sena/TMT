// Mission Factory — generates missions from templates
import type { Mission, CategoryId, MissionType, DifficultyId } from "@/types";

export interface MissionTemplate {
  title: string;
  story: string;
  instruction: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  hints: string[];
  basePoint: number;
  adabBonus?: number;
  adabFeedback?: string;
  isBoss?: boolean;
  secondaryCategory?: CategoryId;
}

function makeMission(
  prefix: string,
  num: number,
  difficulty: DifficultyId,
  gradeRange: string,
  category: CategoryId,
  missionType: MissionType,
  tpl: MissionTemplate
): Mission {
  const options = tpl.options.map((label, i) => {
    const id = String.fromCharCode(97 + i);
    const entry: any = { id, label };
    if (i === tpl.correctIdx && !['moral_decision', 'tk_adab_basic'].includes(missionType)) {
      entry.feedback = 'Tepat!';
    }
    if (['moral_decision', 'tk_adab_basic'].includes(missionType) && i === tpl.correctIdx) {
      entry.isBestChoice = true;
    }
    return entry;
  });

  const result: any = {
    id: `${prefix}-${num}`,
    number: num,
    title: tpl.title,
    difficulty,
    gradeRange,
    category,
    missionType,
    story: tpl.story,
    instruction: tpl.instruction,
    options,
    correctAnswer: String.fromCharCode(97 + tpl.correctIdx),
    explanation: tpl.explanation,
    hintLevels: tpl.hints,
    basePoint: tpl.basePoint,
    ...(tpl.adabBonus ? { adabBonus: tpl.adabBonus } : {}),
    ...(tpl.adabFeedback ? { adabFeedback: tpl.adabFeedback } : {}),
    ...(tpl.isBoss ? { isBossMission: true } : {}),
    ...(tpl.secondaryCategory ? { secondaryCategory: tpl.secondaryCategory } : {}),
  };
  return result as Mission;
}

export function createMissions(
  prefix: string,
  difficulty: DifficultyId,
  gradeRange: string,
  category: CategoryId,
  missionType: MissionType,
  templates: MissionTemplate[],
  startNum: number,
  count: number
): Mission[] {
  const result: Mission[] = [];
  for (let i = 0; i < count; i++) {
    const tpl = templates[i % templates.length];
    result.push(makeMission(prefix, startNum + i, difficulty, gradeRange, category, missionType, tpl));
  }
  return result;
}

// ─── TEMPLATE DATA ───

export const ALL_TEMPLATES = {
  TK_ADAB_TEMPLATES: [
    {title:"Berkata Jujur",story:"Adik memecahkan gelas. Tidak ada yang melihat.",instruction:"Apa yang dilakukan?",options:["Diam saja","Bilang jujur ke Ibu","Sembunyikan pecahan"],correctIdx:1,explanation:"Jujur itu hebat! Ibu bangga Adik jujur.",hints:["Allah Maha Melihat."],basePoint:40,adabBonus:10,adabFeedback:"Jujur menyelamatkan. 🤲"},
    {title:"Hormat Orang Tua",story:"Nenek berjalan membawa barang.",instruction:"Apa yang dilakukan?",options:["Pura-pura tidak lihat","Bantu bawakan","Lanjut main"],correctIdx:1,explanation:"Membantu yang lebih tua adalah adab mulia.",hints:["Nenek butuh bantuan."],basePoint:40,adabBonus:10,adabFeedback:"Hormati yang lebih tua. 👴"},
    {title:"Bersih Itu Iman",story:"Kamar berantakan setelah bermain.",instruction:"Apa yang dilakukan?",options:["Biarkan saja","Rapikan kembali","Tutup pintu kamar"],correctIdx:1,explanation:"Kebersihan sebagian dari iman.",hints:["Mainan harus dirapikan."],basePoint:40,adabBonus:10,adabFeedback:"Kebersihan itu iman. 🧹"},
    {title:"Maaf dan Memaafkan",story:"Adik tidak sengaja menyenggol teman.",instruction:"Apa yang diucapkan?",options:["Diam saja","Maaf ya","Salah sendiri"],correctIdx:1,explanation:"Minta maaf itu berani dan mulia.",hints:["Kalau salah, kita minta..."],basePoint:40,adabBonus:10,adabFeedback:"Pemaaf dicintai Allah. 🌸"},
    {title:"Baca Doa",story:"Mau mulai belajar.",instruction:"Apa yang dibaca?",options:["Diam saja","Bismillah","Halo"],correctIdx:1,explanation:"Bismillah sebelum mulai, berkah!",hints:["Dengan nama Allah."],basePoint:40,adabBonus:10,adabFeedback:"Bismillah pembawa berkah. ✨"},
  ] as MissionTemplate[],

  TK_PRELIT_TEMPLATES: [
    {title:"Hitung Bunga",story:"🌸🌸🌸🌸🌸",instruction:"Ada berapa bunga?",options:["4","5","6"],correctIdx:1,explanation:"Lima bunga bermekaran.",hints:["Hitung satu-satu."],basePoint:40},
    {title:"Nama Hewan",story:"Hewan berkaki 4, suaranya meong.",instruction:"Hewan apa?",options:["Anjing","Kucing","Ayam"],correctIdx:1,explanation:"Kucing bersuara meong.",hints:["Hewan berbulu lucu."],basePoint:40},
    {title:"Warna Buah",story:"Buah warna merah, bulat, manis.",instruction:"Buah apa?",options:["Jeruk","Apel","Pisang"],correctIdx:1,explanation:"Apel merah, bulat, manis.",hints:["Buah merah di pohon."],basePoint:40},
    {title:"Anggota Badan",story:"Untuk berjalan, kita pakai...",instruction:"Anggota tubuh apa?",options:["Tangan","Kaki","Kepala"],correctIdx:1,explanation:"Kaki untuk berjalan.",hints:["Yang di bawah."],basePoint:40},
    {title:"Alat Makan",story:"Untuk makan sup, kita pakai...",instruction:"Alat apa?",options:["Garpu","Sendok","Pisau"],correctIdx:1,explanation:"Sendok untuk makan sup.",hints:["Bentuknya cekung."],basePoint:40},
  ] as MissionTemplate[],

  TK_POLA_TEMPLATES: [
    {title:"Pola Warna",story:"🔴🟡🔴🟡🔴 ?",instruction:"Apa selanjutnya?",options:["🔴","🟡","🟢"],correctIdx:1,explanation:"Merah-Kuning bergantian.",hints:["Dua warna bergantian."],basePoint:40},
    {title:"Pola Bentuk",story:"⬜🔺⬜🔺⬜ ?",instruction:"Apa selanjutnya?",options:["⬜","🔺","⚪"],correctIdx:1,explanation:"Kotak-Segitiga bergantian.",hints:["Dua bentuk bergantian."],basePoint:40},
    {title:"Pola Hewan",story:"🐱🐶🐱🐶🐱 ?",instruction:"Apa selanjutnya?",options:["🐱","🐶","🐰"],correctIdx:1,explanation:"Kucing-Anjing bergantian.",hints:["Dua hewan."],basePoint:40},
    {title:"Pola ABC",story:"🔴🔵🟢🔴🔵🟢🔴 ?",instruction:"Apa selanjutnya?",options:["🔴","🔵","🟢"],correctIdx:1,explanation:"Siklus 3 warna.",hints:["Tiga berulang."],basePoint:40},
  ] as MissionTemplate[],

  TK_VISUAL_TEMPLATES: [
    {title:"Besar Kecil",story:"🐘 dan 🐭",instruction:"Mana lebih kecil?",options:["🐘 Gajah","🐭 Tikus","Sama"],correctIdx:1,explanation:"Tikus lebih kecil.",hints:["Hewan kecil."],basePoint:40},
    {title:"Panjang Pendek",story:"📏 dan ✏️",instruction:"Mana lebih panjang?",options:["📏 Penggaris","✏️ Pensil","Sama"],correctIdx:0,explanation:"Penggaris lebih panjang.",hints:["Bandingkan."],basePoint:40},
    {title:"Atas Bawah",story:"🐦 di atas, 🐟 di bawah.",instruction:"Siapa di atas?",options:["🐦 Burung","🐟 Ikan","Keduanya"],correctIdx:0,explanation:"Burung di atas (langit).",hints:["Yang terbang."],basePoint:40},
  ] as MissionTemplate[],

  TK_KREATIVITAS_TEMPLATES: [
    {title:"Kotak Pensil",story:"Kaleng bekas susu.",instruction:"Bisa jadi apa?",options:["Tempat pensil hias","Buang","Simpan saja"],correctIdx:0,explanation:"Hias kaleng jadi tempat pensil!",hints:["Warnai dan hias."],basePoint:40},
    {title:"Boneka Tangan",story:"Kaus kaki bekas bersih.",instruction:"Bisa jadi apa?",options:["Boneka lucu","Buang","Simpan"],correctIdx:0,explanation:"Tambah mata mulut, jadi boneka!",hints:["Kaus kaki + spidol."],basePoint:40},
    {title:"Topeng",story:"Piring kertas.",instruction:"Bisa jadi apa?",options:["Topeng hewan","Buang","Piring biasa"],correctIdx:0,explanation:"Lubangi, gambar wajah hewan!",hints:["Piring + lubang + gambar."],basePoint:40},
  ] as MissionTemplate[],

  LITERASI_NUMERASI_TEMPLATES: [
    {title:"Jumlah Siswa",story:"Kelas A: 28 siswa. Kelas B: 32 siswa.",instruction:"Berapa total?",options:["58","60","62"],correctIdx:1,explanation:"28+32=60 siswa.",hints:["Jumlahkan."],basePoint:50},
    {title:"Bagi Kue",story:"36 kue dibagi 9 anak.",instruction:"Berapa per anak?",options:["3","4","5"],correctIdx:1,explanation:"36÷9=4 kue.",hints:["Bagi rata."],basePoint:50},
    {title:"Harga Total",story:"Buku Rp5.000, pensil Rp2.000.",instruction:"Total harga?",options:["Rp6.000","Rp7.000","Rp8.000"],correctIdx:1,explanation:"5.000+2.000=7.000.",hints:["Jumlahkan."],basePoint:50},
    {title:"Sisa Uang",story:"Uang Rp10.000, jajan Rp3.500.",instruction:"Sisa uang?",options:["Rp5.500","Rp6.500","Rp7.500"],correctIdx:1,explanation:"10.000-3.500=6.500.",hints:["Kurangi."],basePoint:50},
    {title:"Selisih Tinggi",story:"A:145cm, B:128cm.",instruction:"Selisih?",options:["15cm","17cm","19cm"],correctIdx:1,explanation:"145-128=17cm.",hints:["Kurangi."],basePoint:50},
    {title:"Panjang Pita",story:"Pita 120cm dipotong 45cm.",instruction:"Sisa?",options:["65cm","75cm","85cm"],correctIdx:1,explanation:"120-45=75cm.",hints:["Kurangi."],basePoint:50},
    {title:"Bilangan Loncat",story:"10,20,30,?,50",instruction:"Angka yang hilang?",options:["35","40","45"],correctIdx:1,explanation:"Loncat 10: 10,20,30,40,50.",hints:["Tambah 10."],basePoint:50},
    {title:"Perkalian",story:"6 x 7 = ?",instruction:"Hasilnya?",options:["36","42","48"],correctIdx:1,explanation:"6x7=42.",hints:["Hitung 6 kali 7."],basePoint:50},
    {title:"Rata-Rata",story:"Nilai:70,80,90.",instruction:"Rata-rata?",options:["75","80","85"],correctIdx:1,explanation:"(70+80+90)÷3=80.",hints:["Jumlahkan, bagi 3."],basePoint:70},
    {title:"Suhu",story:"Pagi 24C, siang naik 8C.",instruction:"Suhu siang?",options:["30C","32C","34C"],correctIdx:1,explanation:"24+8=32C.",hints:["Tambah 8."],basePoint:50},
  ] as MissionTemplate[],

  SPASIAL_TEMPLATES: [
    {title:"Arah Mata Angin",story:"Menghadap utara, kananmu ke...",instruction:"Arah apa?",options:["Barat","Timur","Selatan"],correctIdx:1,explanation:"Utara: kanan=timur, kiri=barat.",hints:["Bayangkan kompas."],basePoint:50},
    {title:"Posisi Buku",story:"Buku A di atas B, B di atas C.",instruction:"Buku apa paling bawah?",options:["A","B","C"],correctIdx:2,explanation:"C paling bawah.",hints:["Susun dari bawah."],basePoint:50},
    {title:"Lipatan Kertas",story:"Dilipat 3 kali jadi dua.",instruction:"Berapa lapisan?",options:["6","8","4"],correctIdx:1,explanation:"2^3=8 lapisan.",hints:["2x2x2."],basePoint:50},
    {title:"Jarak",story:"200m utara, 150m timur.",instruction:"Total jarak?",options:["300m","350m","400m"],correctIdx:1,explanation:"200+150=350m.",hints:["Jumlahkan."],basePoint:50},
    {title:"Bentuk Benda",story:"Kaleng susu dilihat dari atas.",instruction:"Bentuk apa?",options:["Persegi","Lingkaran","Segitiga"],correctIdx:1,explanation:"Silinder dari atas = lingkaran.",hints:["Bayangkan lihat dari atas."],basePoint:50},
  ] as MissionTemplate[],

  POLA_TEMPLATES: [
    {title:"Pola Tambah",story:"3,6,9,12,?",instruction:"Angka selanjutnya?",options:["14","15","16"],correctIdx:1,explanation:"+3: 12+3=15.",hints:["Tambah 3."],basePoint:50},
    {title:"Pola Kali",story:"1,2,4,8,?",instruction:"Angka selanjutnya?",options:["12","16","10"],correctIdx:1,explanation:"x2: 8x2=16.",hints:["Kali 2."],basePoint:50},
    {title:"Pola Ganjil",story:"1,3,5,7,?",instruction:"Angka selanjutnya?",options:["8","9","10"],correctIdx:1,explanation:"Bilangan ganjil: 9.",hints:["Tambah 2."],basePoint:50},
    {title:"Pola Huruf",story:"A,C,E,G,?",instruction:"Huruf selanjutnya?",options:["H","I","J"],correctIdx:1,explanation:"Lompat 1: A(B)C... G(H)I.",hints:["Sebut alfabet."],basePoint:50},
    {title:"Pola Turun",story:"20,17,14,11,?",instruction:"Angka selanjutnya?",options:["8","9","7"],correctIdx:0,explanation:"-3: 11-3=8.",hints:["Kurangi 3."],basePoint:50},
  ] as MissionTemplate[],

  KREATIVITAS_TEMPLATES: [
    {title:"Mainan Kardus",story:"Kardus bekas besar.",instruction:"Bisa jadi apa?",options:["Rumah boneka","Buang","Simpan"],correctIdx:0,explanation:"Kardus bisa jadi rumah-rumahan!",hints:["Bentuk dan hias."],basePoint:60},
    {title:"Boneka Kaos Kaki",story:"Kaos kaki bekas.",instruction:"Bisa jadi apa?",options:["Boneka tangan","Buang","Simpan saja"],correctIdx:0,explanation:"Tambah mata, jadi boneka lucu!",hints:["Kaus kaki + spidol."],basePoint:60},
    {title:"Alat Musik",story:"Kaleng dan karet.",instruction:"Bisa jadi apa?",options:["Gitar mini","Buang","Tidak bisa"],correctIdx:0,explanation:"Karet di kaleng = gitar!",hints:["Petik karetnya."],basePoint:60},
    {title:"Gambar Awan",story:"Awan di langit berbentuk.",instruction:"Melihatnya sebagai?",options:["Domba tidur","Tidak ada","Hanya awan"],correctIdx:0,explanation:"Imajinasi: awan jadi domba!",hints:["Bayangkan bentuknya."],basePoint:60},
  ] as MissionTemplate[],

  SYSTEMS_TEMPLATES: [
    {title:"Kebun Sekolah",story:"Tanaman layu: kurang air, hama.",instruction:"Solusi terbaik?",options:["Siram saja","Siram+basmi hama+jadwal","Biarkan"],correctIdx:1,explanation:"Semua masalah ditangani.",hints:["Ada 2 masalah."],basePoint:60},
    {title:"Kantin Bersih",story:"Kantin kotor, tidak ada wastafel.",instruction:"Perbaikan terbaik?",options:["Biarkan","Bersihkan+wastafel+poster","Tutup"],correctIdx:1,explanation:"Kebersihan+fasilitas+edukasi.",hints:["Butuh beberapa hal."],basePoint:60},
    {title:"Perpustakaan",story:"Buku berantakan, hilang.",instruction:"Sistem terbaik?",options:["Biarkan","Katalog+kartu pinjam+jadwal","Pindahkan"],correctIdx:1,explanation:"Teratur dengan sistem.",hints:["Catat semua buku."],basePoint:60},
    {title:"Hemat Air",story:"Kran sering lupa ditutup.",instruction:"Solusi terbaik?",options:["Biarkan","Poster+jadwal cek+kran otomatis","Tutup permanen"],correctIdx:1,explanation:"Edukasi+jadwal+teknologi.",hints:["Beberapa cara."],basePoint:60,adabBonus:5,adabFeedback:"Hemat air ibadah. 💧"},
  ] as MissionTemplate[],

  MORAL_TEMPLATES: [
    {title:"Jujur",story:"Memecahkan pot bunga. Tidak ada yang lihat.",instruction:"Apa yang dilakukan?",options:["Diam","Jujur bilang ke Ibu","Sembunyikan"],correctIdx:1,explanation:"Jujur lebih mulia.",hints:["Allah Maha Melihat."],basePoint:60,adabBonus:15,adabFeedback:"Jujur menyelamatkan. 🤲"},
    {title:"Senyum",story:"Bertemu teman pagi hari.",instruction:"Apa yang dilakukan?",options:["Diam saja","Senyum dan sapa","Pura-pura sibuk"],correctIdx:1,explanation:"Senyum adalah sedekah.",hints:["Rasulullah selalu tersenyum."],basePoint:60,adabBonus:15,adabFeedback:"Senyum itu ibadah. 😊"},
    {title:"Berbagi",story:"Punya kue banyak. Teman tidak bawa bekal.",instruction:"Apa yang dilakukan?",options:["Makan sendiri","Tawarkan berbagi","Sembunyikan"],correctIdx:1,explanation:"Berbagi membuat hati senang.",hints:["Temanmu lapar."],basePoint:60,adabBonus:15,adabFeedback:"Berbagi itu indah. 🍪"},
    {title:"Syukur",story:"Dapat nilai bagus di ujian.",instruction:"Apa yang diucapkan?",options:["Aku hebat!","Alhamdulillah","Biasa saja"],correctIdx:1,explanation:"Alhamdulillah = segala puji bagi Allah.",hints:["Bersyukur kepada Allah."],basePoint:60,adabBonus:15,adabFeedback:"Syukur menambah nikmat. 🌟"},
    {title:"Memaafkan",story:"Teman merusak mainanmu. Dia minta maaf.",instruction:"Apa yang dilakukan?",options:["Marah dan dendam","Maafkan dengan ikhlas","Balas merusak"],correctIdx:1,explanation:"Memaafkan itu mulia.",hints:["Allah suka pemaaf."],basePoint:60,adabBonus:15,adabFeedback:"Jadilah pemaaf. 🌸"},
    {title:"Bantu Orang Tua",story:"Ibu membawa belanjaan berat.",instruction:"Apa yang dilakukan?",options:["Pura-pura tidur","Bantu bawakan","Lanjut main"],correctIdx:1,explanation:"Berbakti kepada orang tua.",hints:["Surga di telapak kaki Ibu."],basePoint:60,adabBonus:15,adabFeedback:"Berbakti pada orang tua. 💝"},
  ] as MissionTemplate[],

  PENALARAN_TEMPLATES: [
    {title:"Siapa Tertua",story:"Andi > Budi > Cici.",instruction:"Siapa termuda?",options:["Andi","Budi","Cici"],correctIdx:2,explanation:"Cici paling muda.",hints:["Urutkan."],basePoint:50},
    {title:"Tebak Benda",story:"Terbuat dari kaca, tembus pandang.",instruction:"Benda apa?",options:["Kayu","Jendela","Besi"],correctIdx:1,explanation:"Jendela kaca tembus pandang.",hints:["Yang tembus pandang."],basePoint:50},
    {title:"Tebak Profesi",story:"Pakai seragam, bawa surat, naik motor.",instruction:"Profesi apa?",options:["Dokter","Pak Pos","Guru"],correctIdx:1,explanation:"Pak Pos mengantar surat.",hints:["Pengantar surat."],basePoint:50},
    {title:"Logika",story:"Semua kucing berkaki 4. Si Manis kucing.",instruction:"Si Manis berkaki?",options:["2","4","Tidak tahu"],correctIdx:1,explanation:"Kucing selalu berkaki 4.",hints:["Semua kucing..."],basePoint:50},
    {title:"Musim",story:"Daun berguguran, udara sejuk.",instruction:"Musim apa?",options:["Panas","Gugur","Salju"],correctIdx:1,explanation:"Gugur: daun rontok.",hints:["Daun jatuh."],basePoint:50},
  ] as MissionTemplate[],
};
