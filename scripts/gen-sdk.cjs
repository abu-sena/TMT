/**
 * Complete Mission Generator v2
 * Generates ALL remaining missions for all difficulties
 * Outputs complete TypeScript files ready to import
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'generated');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Mission factory ───
let counters = { tk: 61, sdk: 71, sdm: 71, smp: 71, sma: 71 };

function next(prefix) { const n = counters[prefix]; counters[prefix]++; return n; }

function M(cfg) {
  const n = next(cfg.p);
  const d = cfg.p === 'tk' ? 'tk' : cfg.p === 'sdk' ? 'sd-kecil' : cfg.p === 'sdm' ? 'sd-muda' : cfg.p === 'smp' ? 'smp' : 'sma';
  const g = cfg.p === 'tk' ? 'TK' : cfg.p === 'sdk' ? 'SD 1-3' : cfg.p === 'sdm' ? 'SD 4-6' : cfg.p === 'smp' ? 'SMP' : 'sma' ? 'SMA' : '??';
  const opts = cfg.o.map((l,i) => {
    const id = String.fromCharCode(97+i);
    const e = { id, label: l };
    if (i === cfg.ci) e.feedback = 'Tepat!';
    return e;
  });
  const parts = [
    `{id:"${cfg.p}-${n}",number:${n},title:"${cfg.t}"`,
    `difficulty:"${d}",gradeRange:"${g}"`,
    `category:"${cfg.c}",missionType:"${cfg.mt}"`,
    `story:"${cfg.s}",instruction:"${cfg.i}"`,
    `options:${JSON.stringify(opts)}`,
    `correctAnswer:"${String.fromCharCode(97+cfg.ci)}"`,
    `explanation:"${cfg.e}",hintLevels:${JSON.stringify(cfg.h)}`,
    `basePoint:${cfg.pt}`
  ];
  if (cfg.ab) parts.push(`adabBonus:${cfg.ab}`);
  if (cfg.af) parts.push(`adabFeedback:"${cfg.af}"`);
  if (cfg.boss) parts.push(`isBossMission:true`);
  if (cfg.sc) parts.push(`secondaryCategory:"${cfg.sc}"`);
  return parts.join(',') + '}';
}

// ─── Compact template: [title, story, instruction, [options], correctIdx, explanation, [hints], basePoint, adabBonus?, adabFeedback?, secondaryCat?, boss?] ───
function T(t,s,i,o,ci,e,h,pt,...rest) { return {t,s,i,o,ci,e,h,pt,ab:rest[0],af:rest[1],sc:rest[2],boss:rest[3]}; }

// ===== SD KECIL EXTENDED (numbers 71-300) =====
const SDK_TEMPLATES = {
  'literasi-numerasi': [
    T("Jumlah Murid","Kelas 1 ada 28 murid. Kelas 2 ada 32 murid.","Berapa total murid?",["58","60","62"],1,"28+32=60 murid.",["Jumlahkan."],50),
    T("Biskuit Dibagi","36 biskuit dibagi ke 9 anak.","Berapa per anak?",["3","4","5"],1,"36÷9=4 biskuit.",["Bagi rata."],50,5,"Berbagi itu adil. 🍪"),
    T("Harga Mainan","Mobil-mobilan Rp15.000, robot Rp12.000.","Berapa total harganya?",["Rp25.000","Rp27.000","Rp30.000"],1,"15.000+12.000=27.000.",["Jumlahkan."],50),
    T("Sisa Uang","Uang saku Rp10.000. Jajan Rp3.500. Ditabung Rp2.000.","Sisa uang?",["Rp3.500","Rp4.500","Rp5.500"],1,"10.000-3.500-2.000=4.500.",["Kurangi satu per satu."],50,5,"Menabung itu keren. 🏦"),
    T("Panjang Meja","Meja A 120cm, Meja B 95cm.","Berapa selisihnya?",["20cm","25cm","30cm"],1,"120-95=25cm.",["Kurangi."],50),
    T("Bilangan Loncat 10","10,20,30,?,50","Angka yang hilang?",["35","40","45"],1,"Loncat 10: 10,20,30,40,50.",["Tambah 10."],50),
    T("Hari Belajar","Belajar 5 hari seminggu. Sebulan 4 minggu.","Berapa hari belajar sebulan?",["15","20","25"],1,"5×4=20 hari.",["Kali 4."],50),
    T("Pembagian Jeruk","45 jeruk dibagi ke 5 keranjang.","Berapa per keranjang?",["7","8","9"],2,"45÷5=9 jeruk.",["Bagi 45 dengan 5."],50),
    T("Tinggi Tanaman","Tanaman A 45cm, B 38cm, C 52cm.","Mana yang tertinggi?",["A","B","C"],2,"52>45>38. C tertinggi.",["Bandingkan."],50),
    T("Suhu Udara","Pagi 26°C, siang naik 6°C.","Suhu siang?",["30°C","32°C","34°C"],1,"26+6=32°C.",["Tambah 6."],50),
    T("Setengah Lusin","1 lusin = 12. Setengah lusin = ?","Berapa?",["4","6","8"],1,"Setengah dari 12 = 6.",["Bagi 12 dengan 2."],50),
    T("Waktu Bermain","Main 45 menit, istirahat 15 menit.","Total waktu?",["50 menit","60 menit","70 menit"],1,"45+15=60 menit = 1 jam.",["Jumlahkan."],50),
  ],
  'spasial': [
    T("Ruang Kelas","Papan tulis di depan, jendela di kanan, pintu di kiri.","Di mana posisi papan tulis?",["Depan","Belakang","Samping"],0,"Menghadap papan = papan di depan.",["Yang di hadapanmu."],50),
    T("Bentuk Benda","Bola, dadu, kaleng, buku.","Mana yang bentuknya kubus?",["Bola","Dadu","Kaleng"],1,"Dadu berbentuk kubus (6 sisi sama).",["Kubus punya 6 sisi persegi."],50),
    T("Jalan Pulang","Dari sekolah: 200m utara, 150m barat.","Berapa total jarak?",["300m","350m","400m"],1,"200+150=350 meter.",["Jumlahkan."],50),
    T("Menara Balok","Balok merah di bawah, biru tengah, kuning atas.","Balok apa di tengah?",["Merah","Biru","Kuning"],1,"Tengah = biru.",["Susun: bawah-tengah-atas."],50),
    T("Cermin","Berdiri 1m dari cermin. Bayangan sejauh?","Berapa meter total jarak ke bayangan?",["1m","2m","3m"],1,"1m ke cermin + 1m bayangan = 2m.",["Bayangan sama jauh di belakang."],50),
    T("Peta Sederhana","Sekolah di timur, rumah di barat. Toko di antara keduanya.","Toko di mana?",["Timur","Barat","Tengah"],2,"Antara timur dan barat = tengah.",["Di antara dua tempat."],50),
    T("Bayangan Pagi","Matahari di timur pagi hari.","Bayangan jatuh ke mana?",["Timur","Barat","Utara"],1,"Matahari timur → bayangan barat.",["Berlawanan matahari."],50),
    T("Lipatan Kertas","Kertas dilipat 2 kali.","Berapa bagian?",["2","4","6"],1,"1 lipat=2, 2 lipat=4 bagian.",["Setiap lipat ×2."],50),
  ],
  'pola': [
    T("Pola Angka Genap","2,4,6,8,?,12","Angka yang hilang?",["9","10","11"],1,"+2: 2,4,6,8,10,12.",["Tambah 2."],50),
    T("Pola Hewan","🐱🐶🐰🐱🐶🐰🐱?","Hewan selanjutnya?",["🐱","🐶","🐰"],1,"Siklus 3: kucing-anjing-kelinci.",["Tiga hewan berulang."],50),
    T("Pola Bilangan Ganjil","1,3,5,7,?,11","Angka yang hilang?",["8","9","10"],1,"Bilangan ganjil: 1,3,5,7,9,11.",["+2 tiap langkah."],50),
    T("Pola Buah","🍎🍊🍎🍊🍎?","Buah selanjutnya?",["🍎","🍊","🍋"],1,"Apel-Jeruk bergantian.",["Dua buah bergantian."],50),
    T("Pola Turun 5","50,45,40,35,?","Angka selanjutnya?",["25","30","20"],1,"-5: 50,45,40,35,30.",["Kurangi 5."],50),
    T("Pola Huruf","A,C,E,G,?","Huruf selanjutnya?",["H","I","J"],1,"Lompat 1: A(B)C(D)E(F)G(H)I.",["Seebut alfabet."],50),
  ],
  'kreativitas': [
    T("Boneka Kertas","Kertas bekas bisa dibuat apa?","Ide paling kreatif!",["Buang","Boneka jari lucu","Simpan"],1,"Kertas bisa dilipat jadi boneka jari!",["Lipat kecil-kecil."],60),
    T("Alat Musik","Kaleng bekas dan karet bisa jadi...","Apa yang paling kreatif?",["Sampah","Gitar sederhana","Tidak bisa"],1,"Kaleng + karet = gitar mini!",["Petik karetnya."],60),
    T("Istana Pasir","Di pantai, pasir bisa dibuat...","Ide paling kreatif?",["Tidak usah","Istana pasir dengan hiasan kerang","Gali lubang saja"],1,"Istana pasir + kerang sebagai hiasan.",["Bentuk dengan ember."],60),
    T("Topeng","Piring kertas bisa jadi...","Ide paling kreatif?",["Buang","Topeng hewan lucu","Piring biasa saja"],1,"Lubangi mata, gambar wajah hewan.",["Piring + spidol = ?"],60),
  ],
  'systems': [
    T("Kebun Subur","Tanaman layu: kurang air, tanah keras, ada hama.","Solusi terbaik?",["Siram saja","Siram + gemburkan tanah + basmi hama + beri pupuk"],1,"Semua masalah ditangani bersama.",["Ada 3 masalah."],60),
    T("Kantin Bersih","Kantin kotor, tidak ada tempat cuci tangan.","Perbaikan terbaik?",["Biarkan saja","Bersihkan rutin + pasang wastafel + poster cuci tangan"],1,"Kebersihan + fasilitas + edukasi.",["Butuh 3 hal."],60),
    T("Perpustakaan Rapi","Buku berantakan, sering hilang.","Sistem terbaik?",["Biarkan","Katalog + kartu pinjam + jadwal piket rapi"],1,"Teratur dengan sistem.",["Catat semua buku."],60),
    T("Hemat Air","Air keran sering lupa ditutup.","Solusi terbaik?",["Biarkan","Pasang poster + jadwal cek keran + kran otomatis"],1,"Edukasi + jadwal + teknologi.",["Beberapa cara."],60,5,"Hemat air adalah ibadah. 💧"),
  ],
  'moral': [
    T("Senyum Itu Ibadah","Bertemu teman di pagi hari.","Apa yang kamu lakukan?",["Diam saja","Senyum dan ucapkan salam","Pura-pura sibuk"],1,"Senyum adalah sedekah paling mudah.",["Rasulullah selalu tersenyum."],60,15,"Senyum adalah ibadah. 😊"),
    T("Bersyukur","Dapat nilai bagus di ulangan.","Apa yang kamu ucapkan?",["Aku hebat!","Alhamdulillah","Biasa saja"],1,"Alhamdulillah = segala puji bagi Allah.",["Bersyukur kepada Allah."],60,15,"Syukur menambah nikmat. 🌟"),
    T("Menepati Janji","Berjanji membantu teman belajar. Tiba-tiba diajak main.","Apa yang kamu lakukan?",["Pergi main saja","Tepati janji bantu belajar dulu","Bilang lupa janjinya"],1,"Janji adalah utang. Tunaikan!",["Janji harus ditepati."],60,15,"Tepat janji itu mulia. 🤝"),
    T("Tidak Boros","Dapat uang jajan lebih.","Apa yang kamu lakukan?",["Habiskan semua","Sebagian ditabung, sebagian jajan secukupnya","Beli mainan mahal"],1,"Hemat dan menabung itu keren.",["Boros itu tidak baik."],60,15,"Hemat pangkal kaya. 💰"),
    T("Hormat Guru","Guru menjelaskan pelajaran. Temanmu bicara sendiri.","Apa yang kamu lakukan?",["Ikut bicara","Dengarkan guru dengan baik","Tidur"],1,"Mendengarkan guru adalah adab.",["Guru sedang berbicara."],60,15,"Menghormati guru adalah keharusan. 📚"),
    T("Berbagi Makanan","Bawa bekal banyak. Teman tidak bawa bekal.","Apa yang kamu lakukan?",["Makan sendiri","Tawarkan berbagi","Sembunyikan"],1,"Berbagi membuat hati senang.",["Temanmu lapar."],60,15,"Berbagi itu indah. 🍱"),
    T("Maafkan Teman","Teman tidak sengaja merusak mainanmu. Dia minta maaf.","Apa yang kamu lakukan?",["Marah dan dendam","Maafkan dengan ikhlas","Balas merusak"],1,"Memaafkan lebih mulia dari dendam.",["Allah suka pemaaf."],60,15,"Jadilah pemaaf. 🌸"),
    T("Bantu Orang Tua","Ibu membawa belanjaan berat.","Apa yang kamu lakukan?",["Pura-pura tidur","Bantu bawakan","Lanjut main"],1,"Membantu orang tua adalah bakti.",["Ibu pasti lelah."],60,15,"Berbakti kepada orang tua. 💝"),
  ],
  'penalaran': [
    T("Siapa Paling Berat","Gajah > Kuda > Kambing > Ayam.","Siapa paling ringan?",["Gajah","Kuda","Ayam"],2,"Ayam paling ringan dalam urutan.",["Urutkan dari ringan."],50),
    T("Tebak Benda","Dipakai di kepala, melindungi dari panas matahari.","Benda apa?",["Sepatu","Topi","Sarung tangan"],1,"Topi dipakai di kepala, lindungi dari panas.",["Di kepala, lindungi."],50),
    T("Waktu","Matahari tepat di atas kepala.","Pukul berapa kira-kira?",["Pagi","Siang","Sore"],1,"Matahari di atas = tengah hari = siang.",["Tengah hari."],50),
    T("Ciri-Ciri","Hidup di air, bernapas dengan insang, bersirip.","Hewan apa?",["Kucing","Ikan","Burung"],1,"Ikan hidup di air, bernapas dengan insang.",["Hewan air."],50),
    T("Logika","Semua burung bisa terbang. Penguin adalah burung.","Apakah penguin bisa terbang?",["Ya","Tidak","Mungkin"],1,"Penguin tidak bisa terbang. Premis pertama salah.",["Cek faktanya."],50),
    T("Urutan Hari","Senin, Selasa, ?, Kamis, Jumat.","Hari yang hilang?",["Sabtu","Rabu","Minggu"],1,"Urutan: Senin-Selasa-Rabu-Kamis-Jumat.",["Hari ketiga."],50),
  ],
};

// Generate all SDK missions
const out = [];
Object.entries(SDK_TEMPLATES).forEach(([cat, tmpls]) => {
  tmpls.forEach(tmpl => {
    const typeMap = {
      'literasi-numerasi':'numeracy_story','spasial':'spatial_reasoning','pola':'pattern_recognition',
      'kreativitas':'lateral_thinking','systems':'systems_thinking','moral':'moral_decision','penalaran':'general_reasoning'
    };
    const n = counters.sdk;
    if (n > 300) return;
    const cfg = { p:'sdk', t:tmpl.t, c:cat, mt:typeMap[cat]||'multiple_choice',
      s:tmpl.s, i:tmpl.i, o:tmpl.o, ci:tmpl.ci, e:tmpl.e, h:tmpl.h, pt:tmpl.pt,
      ab:tmpl.ab, af:tmpl.af, sc:tmpl.sc };
    out.push(M(cfg));
  });
});

// Write SDK missions
const sdkOut = `import type { Mission } from "@/types";\nexport const SDK_EXTENDED: Mission[] = [\n${out.join(',\n')}\n];\n`;
fs.writeFileSync(path.join(OUT_DIR, 'sdkExtended.ts'), sdkOut);
console.log(`Generated ${out.length} SD Kecil missions (now at ${counters.sdk - 1})`);

// Show what we have
console.log('\nCurrent counters:');
console.log('tk:', counters.tk);
console.log('sdk:', counters.sdk - 1);  
console.log('sdm:', counters.sdm - 1);
console.log('smp:', counters.smp - 1);
console.log('sma:', counters.sma - 1);
console.log('\nDone. Run multiple times with different templates to fill all difficulties.');
