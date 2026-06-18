// ALL-IN-ONE MISSION GENERATOR
// Generates ALL 1,500 missions as TypeScript
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'data', 'allGeneratedMissions.ts');

// Track counts
const counts = { tk: 0, 'sd-kecil': 0, 'sd-muda': 0, smp: 0, sma: 0 };
const missions = { tk: [], 'sd-kecil': [], 'sd-muda': [], smp: [], sma: [] };
const prefixes = { tk: 'tk', 'sd-kecil': 'sdk', 'sd-muda': 'sdm', smp: 'smp', sma: 'sma' };
const grades = { tk: 'TK', 'sd-kecil': 'SD 1-3', 'sd-muda': 'SD 4-6', smp: 'SMP', sma: 'SMA' };

// Mission creation
function add(diff, num, title, cat, type, story, instruction, opts, correctIdx, explanation, hints, basePoint, extras = {}) {
  const prefix = prefixes[diff];
  const options = opts.map((o, i) => {
    const id = String.fromCharCode(97 + i);
    const entry = { id, label: o };
    if (i === correctIdx && !extras.isBest) entry.feedback = 'Tepat!';
    if (extras.isBest && i === correctIdx) entry.isBestChoice = true;
    return entry;
  });

  const parts = [
    `{id:"${prefix}-${num}",number:${num},title:"${title}"`,
    `difficulty:"${diff}",gradeRange:"${grades[diff]}"`,
    `category:"${cat}",missionType:"${type}"`,
    `story:${JSON.stringify(story)},instruction:${JSON.stringify(instruction)}`,
    `options:${JSON.stringify(options)}`,
    `correctAnswer:"${String.fromCharCode(97 + correctIdx)}"`,
    `explanation:${JSON.stringify(explanation)},hintLevels:${JSON.stringify(hints)}`,
    `basePoint:${basePoint}`
  ];
  if (extras.adabBonus) parts.push(`adabBonus:${extras.adabBonus}`);
  if (extras.adabFeedback) parts.push(`adabFeedback:${JSON.stringify(extras.adabFeedback)}`);
  if (extras.isBoss) parts.push(`isBossMission:true`);
  if (extras.secondaryCategory) parts.push(`secondaryCategory:"${extras.secondaryCategory}"`);

  missions[diff].push(parts.join(',') + '}');
  counts[diff]++;
}

// ─── GENERATE ALL MISSIONS ───

// Helper: create many similar missions quickly
function generateTKMissions() {
  // TK Adab Dasar (80 missions) - need 80 total, 60 exist → 20 more
  const adab = [
    [61,'Berkata Jujur',"Adik memecahkan gelas.",'Apa yang dilakukan?',['Diam','Jujur bilang ke Ibu','Sembunyikan'],1,'Jujur lebih baik.',['Allah Maha Melihat.'],40,{adabBonus:10,adabFeedback:'Jujur menyelamatkan. 🤲'}],
    [62,'Hormat yang Tua',"Nenek di bus berdiri.",'Apa yang dilakukan?',['Pura-pura tidur','Berikan tempat duduk','Lanjut duduk'],1,'Hormati yang tua.',['Nenek butuh duduk.'],40,{adabBonus:10,adabFeedback:'Hormat pada yang tua. 👴'}],
    [63,'Tidak Mengejek',"Teman jatuh, ada yang tertawa.",'Apa yang dilakukan?',['Ikut tertawa','Tolong dan hibur','Diam'],1,'Tolong teman yang jatuh.',['Kalau kamu yang jatuh?'],40,{adabBonus:10,adabFeedback:'Jangan mengejek. 🤗'}],
    [64,'Bicara Sopan',"Marah karena mainan diambil.",'Apa yang dikatakan?',['Kata kasar','Tolong kembalikan ya','Pukul'],1,'Bicara baik-baik.',['Kata sopan lebih baik.'],40,{adabBonus:10,adabFeedback:'Jaga lisan. 💬'}],
    [65,'Minta Izin',"Ingin pinjam pensil teman.",'Apa yang dilakukan?',['Ambil langsung','Minta izin dulu','Pinjam diam-diam'],1,'Minta izin dulu.',['Sebelum pinjam, minta...'],40,{adabBonus:10,adabFeedback:'Meminta izin itu sopan. 🤝'}],
    [66,'Bereskan Tempat Tidur',"Bangun tidur, berantakan.",'Apa yang dilakukan?',['Biarkan','Rapikan sendiri','Minta Ibu'],1,'Mandiri merapikan.',['Setelah bangun, ...'],40,{adabBonus:10,adabFeedback:'Kemandirian itu hebat. 🛏️'}],
    [67,'Sayang Adik',"Adik kecil menangis.",'Apa yang dilakukan?',['Biarkan','Hibur dan temani','Suruh diam'],1,'Sayangi adik.',['Kakak baik itu...'],40,{adabBonus:10,adabFeedback:'Menyayangi itu mulia. 💕'}],
    [68,'Dengar Nasihat',"Ibu menasihati tentang jajan.",'Apa yang dilakukan?',['Abaikan','Dengarkan dan turuti','Melawan'],1,'Dengar nasihat Ibu.',['Ibu sayang kamu.'],40,{adabBonus:10,adabFeedback:'Nasihat Ibu adalah kasih. 👂'}],
    [69,'Buang Sampah',"Bungkus permen di tangan.",'Apa yang dilakukan?',['Buang sembarangan','Buang ke tempat sampah','Simpan'],1,'Buang pada tempatnya.',['Sampah dibuang ke...'],40,{adabBonus:10,adabFeedback:'Kebersihan itu iman. 🗑️'}],
    [70,'Tenang di Masjid',"Di masjid, ada yang shalat.",'Apa yang dilakukan?',['Berlari','Duduk tenang','Bicara keras'],1,'Tenang di masjid.',['Masjid tempat ibadah.'],40,{adabBonus:10,adabFeedback:'Tenang di masjid. 🕌'}],
    [71,'Ucap Alhamdulillah',"Dapat hadiah dari Ayah.",'Apa yang diucapkan?',['Ah jelek','Alhamdulillah','Biasa saja'],1,'Bersyukur kepada Allah.',['Dapat hadiah, ucapkan...'],40,{adabBonus:10,adabFeedback:'Syukur menambah nikmat. 🌟'}],
    [72,'Jaga Buku Teman',"Pinjam buku cerita teman.",'Bagaimana menjaganya?',['Dilipat','Dijaga dengan baik','Dibiarkan basah'],1,'Amanah harus dijaga.',['Barang pinjaman = ...'],40,{adabBonus:10,adabFeedback:'Amanah itu penting. 📖'}],
    [73,'Bantu Ayah',"Ayah menyiram tanaman.",'Apa yang dilakukan?',['Main saja','Bantu Ayah menyiram','Tonton TV'],1,'Bantu Ayah berkebun.',['Ayah bekerja, bantu...'],40,{adabBonus:10,adabFeedback:'Berbakti kepada ayah. 🌻'}],
    [74,'Sabar Menunggu',"Ingin es krim sekarang.",'Apa yang dilakukan?',['Menangis','Sabar menunggu','Ambil paksa'],1,'Sabar itu indah.',['Allah sayang yang sabar.'],40,{adabBonus:10,adabFeedback:'Sabar itu mulia. 😌'}],
    [75,'Jujur Tumpah',"Tidak sengaja menumpahkan susu.",'Apa yang dilakukan?',['Bilang bukan','Jujur bilang ke Ibu','Diam'],1,'Jujur pada Ibu.',['Allah suka yang jujur.'],40,{adabBonus:10,adabFeedback:'Jujur menyelamatkan. 🤲'}],
    [76,'Baca Bismillah',"Mau mulai menggambar.",'Apa yang diucapkan?',['Diam','Bismillah','Halo'],1,'Bismillah = dengan nama Allah.',['Sebelum mulai, baca...'],40,{adabBonus:10,adabFeedback:'Bismillah pembawa berkah. ✨'}],
    [77,'Rajin Shalat',"Azan Maghrib berkumandang.",'Apa yang dilakukan?',['Lanjut main','Segera shalat','Tunda'],1,'Shalat tepat waktu.',['Allah memanggil...'],40,{adabBonus:10,adabFeedback:'Shalat tepat waktu. 🕌'}],
    [78,'Baca Al-Quran',"Al-Quran di meja belajar.",'Apa yang dilakukan?',['Abaikan','Baca walau sedikit','Simpan'],1,'Baca Al-Quran walau satu ayat.',['Cinta Al-Quran sejak dini.'],40,{adabBonus:10,adabFeedback:'Cinta Al-Quran. 📖'}],
    [79,'Doa Sebelum Tidur',"Malam, waktunya tidur.",'Apa yang dilakukan?',['Langsung tidur','Baca doa tidur','Main lagi'],1,'Baca doa sebelum tidur.',['Bismika Allahumma...'],40,{adabBonus:10,adabFeedback:'Tidur dalam lindungan Allah. 🌙'}],
    [80,'Ucapkan Salam',"Sampai di sekolah ketemu guru.",'Apa yang dikatakan?',['Diam','Assalamualaikum','Halo'],1,'Beri salam ke guru.',['Salam = doa.'],40,{adabBonus:10,adabFeedback:'Salam adalah doa. 🤲'}],
    // Boss at 80
    [81,'🌟 Misi Ceria: Adab Mulia',"Pilih sikap anak sholeh!",'Mana yang paling mulia?',['Marah ke teman','Berkata baik dan membantu','Diam saja'],1,'Tiga kebaikan sekaligus!',['Cari yang paling banyak baiknya.'],50,{isBoss:true,adabBonus:15,adabFeedback:'Kebaikan berlipat ganda. 🌟'}],
  ];
  adab.forEach(([n,t,s,i,o,ci,e,h,pt,ex]) => add('tk',n,t,'tk-adab','tk_adab_basic',s,i,o,ci,e,h,pt,ex));
}

function generateTKPreLit() {
  const prelit = [
    [82,'Nama Buah',"Kuning, panjang, monyet suka.",'Buah apa?',['Apel','Pisang','Jeruk'],1,'Pisang kuning panjang.',['Buah kuning kesukaan monyet.'],40],
    [83,'Hitung Burung',"🐦🐦🐦🐦",'Ada berapa?',['3','4','5'],1,'Empat burung.',['Hitung satu-satu.'],40],
    [84,'Anggota Tubuh',"Untuk mendengar, pakai apa?",'Pilih anggota tubuh!',['Mata','Telinga','Hidung'],1,'Telinga untuk mendengar.',['Yang di samping kepala.'],40],
    [85,'Suara Hewan',"'Meong meong' itu suara...",'Hewan apa?',['Anjing','Kucing','Ayam'],1,'Kucing bersuara meong.',['Hewan lucu berbulu.'],40],
    [86,'Warna Merah',"Cari yang merah!",'Mana yang merah?',['🍎','🥒','🍌'],0,'Apel warnanya merah.',['Warna apel.'],40],
    [87,'Nama Hari',"Setelah Minggu adalah...",'Hari apa?',['Sabtu','Senin','Selasa'],1,'Senin setelah Minggu.',['Awal pekan.'],40],
    [88,'Benda Makan',"Untuk mengambil makanan ke mulut.",'Benda apa?',['Pisau','Sendok','Gelas'],1,'Sendok untuk makan.',['Bentuknya cekung.'],40],
    [89,'Tempat Ibadah',"Umat Islam shalat di...",'Tempat apa?',['Gereja','Masjid','Pura'],1,'Masjid rumah Allah.',['Tempat sujud.'],40],
    [90,'Akan Hujan',"Langit gelap, ada petir.",'Apa yang terjadi?',['Panas','Hujan','Salju'],1,'Tanda mau hujan.',['Gelap + petir = ...'],40],
    [91,'Kendaraan',"Roda 4, bawa keluarga.",'Apa itu?',['Sepeda','Mobil','Motor'],1,'Mobil roda 4.',['Kendaraan keluarga.'],40],
    [92,'Minuman Sehat',"Putih, dari sapi, bikin kuat.",'Minuman apa?',['Sirup','Susu','Kopi'],1,'Susu dari sapi.',['Minuman putih sehat.'],40],
    [93,'Alat Tulis',"Dari kayu, untuk menulis.",'Benda apa?',['Spidol','Pensil','Penggaris'],1,'Pensil dari kayu.',['Alat tulis.'],40],
    [94,'Hewan Air',"Hidup di air, bersirip.",'Hewan apa?',['Kucing','Ikan','Burung'],1,'Ikan hidup di air.',['Berenang di air.'],40],
    [95,'Cuaca',"Air turun dari langit.",'Namanya apa?',['Angin','Hujan','Panas'],1,'Air dari langit = hujan.',['Yang bikin basah.'],40],
    [96,'Makanan Pokok',"Putih, dari beras.",'Makanan apa?',['Roti','Nasi','Mie'],1,'Nasi dari beras.',['Makan setiap hari.'],40],
    [97,'Bagian Pohon',"Hijau, tempat fotosintesis.",'Bagian apa?',['Akar','Daun','Batang'],1,'Daun yang hijau.',['Yang hijau di pohon.'],40],
    [98,'Waktu Makan',"Sarapan dimakan saat...",'Kapan?',['Malam','Pagi','Siang'],1,'Sarapan pagi hari.',['Sebelum berangkat.'],40],
    [99,'Musim Hujan',"Sering turun air, jalanan basah.",'Musim apa?',['Kemarau','Hujan','Panas'],1,'Musim hujan basah.',['Air dari langit.'],40],
    [100,'🌟 Misi Ceria: Ayo Mengenal',"Tebak semua benda hari ini!",'Mana yang untuk minum?',['Sendok','Gelas','Piring'],1,'Gelas untuk minum.',['Alat minum.'],50,{isBoss:true,adabFeedback:'Belajar mengenal benda. 🧠'}],
    [101,'Hitung Kelereng',"🟢🟢🟢🟢🟢",'Ada berapa?',['4','5','6'],1,'Lima kelereng.',['Hitung satu-satu.'],40],
    [102,'Hitung Bunga',"🌸🌸🌸🌸🌸🌸",'Ada berapa?',['5','6','7'],1,'Enam bunga.',['Hitung pelan-pelan.'],40],
    [103,'Hitung Bintang',"⭐⭐⭐⭐⭐⭐⭐",'Ada berapa?',['6','7','8'],1,'Tujuh bintang.',['Hitung berkilau.'],40],
    [104,'Lebih Banyak',"🍎🍎🍎 vs 🍌🍌🍌🍌🍌",'Mana lebih banyak?',['Apel','Pisang','Sama'],1,'5 > 3. Pisang lebih banyak.',['Bandingkan jumlahnya.'],40],
    [105,'Lebih Sedikit',"🐱🐱 vs 🐶🐶🐶🐶",'Mana lebih sedikit?',['Kucing','Anjing','Sama'],0,'2 < 4. Kucing lebih sedikit.',['Bandingkan jumlahnya.'],40],
    [106,'Jumlah Semua',"🍪🍪 + 🍪🍪🍪 = ?",'Total berapa?',['4','5','6'],1,'2+3=5 kue.',['Jumlahkan.'],40],
    [107,'Sisa Buah',"🍎🍎🍎🍎🍎 dimakan 2",'Sisa berapa?',['2','3','4'],1,'5-2=3 apel.',['Kurangi.'],40],
    [108,'Nama Sayur',"Oranye, panjang, kelinci suka.",'Sayur apa?',['Bayam','Wortel','Tomat'],1,'Wortel oranye panjang.',['Kesukaan kelinci.'],40],
    [109,'Bagian Wajah',"Untuk mencium bau.",'Anggota tubuh apa?',['Mata','Hidung','Mulut'],1,'Hidung untuk mencium.',['Yang di tengah wajah.'],40],
    [110,'Bentuk Bulat',"Cari yang bulat!",'Mana yang bulat?',['📦 Kotak','⚽ Bola','📕 Buku'],1,'Bola itu bulat.',['Tidak punya sudut.'],40],
  ];
  prelit.forEach(([n,t,s,i,o,ci,e,h,pt,ex]) => add('tk',n,t,'tk-pra-literasi','tk_pre_literacy',s,i,o,ci,e,h,pt,ex||{}));
}

function generateTKPola() {
  const pola = [
    [111,'Pola AB',"🔴🔵🔴🔵🔴 ?",'Apa selanjutnya?',['🔴','🔵','🟡'],1,'Merah-Biru bergantian.',['Dua warna bergantian.'],40],
    [112,'Pola Binatang',"🐱🐶🐱🐶🐱 ?",'Apa selanjutnya?',['🐱','🐶','🐰'],1,'Kucing-Anjing bergantian.',['Dua binatang.'],40],
    [113,'Pola Bentuk',"⬜⚪⬜⚪⬜ ?",'Apa selanjutnya?',['⬜','⚪','🔺'],1,'Kotak-Lingkaran bergantian.',['Dua bentuk.'],40],
    [114,'Pola Cuaca',"☀️🌧️☀️🌧️☀️ ?",'Apa selanjutnya?',['☀️','🌧️','🌈'],1,'Cerah-Hujan bergantian.',['Dua cuaca.'],40],
    [115,'Pola Buah',"🍎🍊🍎🍊🍎 ?",'Apa selanjutnya?',['🍎','🍊','🍋'],1,'Apel-Jeruk bergantian.',['Dua buah.'],40],
    [116,'Pola Emosi',"😊😢😊😢😊 ?",'Apa selanjutnya?',['😊','😢','😡'],1,'Senang-Sedih bergantian.',['Dua ekspresi.'],40],
    [117,'Pola ABC',"🔴🔵🟢🔴🔵🟢🔴 ?",'Apa selanjutnya?',['🔴','🔵','🟢'],1,'Siklus 3 warna.',['Tiga warna berulang.'],40],
    [118,'Pola AABB',"🔴🔴🔵🔵🔴🔴 ?",'Apa selanjutnya?',['🔴','🔵','🟢'],1,'Dua-dua bergantian.',['Dua merah, dua biru.'],40],
    [119,'Lengkapi Pola',"⭐🌙☀️⭐🌙☀️⭐ ?",'Apa selanjutnya?',['⭐','🌙','☀️'],1,'Siklus 3 benda langit.',['Tiga benda berulang.'],40],
    [120,'🌟 Misi Ceria: Pola Ria',"Selesaikan semua pola!",'🔺🔺⬜🔺🔺⬜🔺 ?',['🔺','⬜','🔵'],0,'Dua segitiga, satu kotak.',['Kelompok tiga.'],50,{isBoss:true,adabFeedback:'Mengenal pola melatih otak! 🧠'}],
  ];
  pola.forEach(([n,t,s,i,o,ci,e,h,pt,ex]) => add('tk',n,t,'tk-pola','tk_pattern_simple',s,i,o,ci,e,h,pt,ex||{}));
}

function generateTKVisual() {
  const visual = [
    [121,'Mana Lebih Panjang',"📏 dan ✏️",'Mana lebih panjang?',['📏 Penggaris','✏️ Pensil','Sama'],0,'Penggaris lebih panjang.',['Lihat ukurannya.'],40],
    [122,'Mana Lebih Berat',"🐘 dan 🐭",'Mana lebih berat?',['🐘 Gajah','🐭 Tikus','Sama'],0,'Gajah lebih berat.',['Hewan besar.'],40],
    [123,'Depan Belakang',"Meja di depan, kursi di belakang.",'Apa di depan?',['Kursi','Meja','Tidak ada'],1,'Meja di depan Adik.',['Yang di hadapan.'],40],
    [124,'Dekat Jauh',"🌙 Bulan dan ⚽ Bola",'Mana lebih dekat?',['🌙 Bulan','⚽ Bola','Sama'],1,'Bola di tangan lebih dekat.',['Yang bisa dipegang.'],40],
    [125,'Tebal Tipis',"📕 Buku dan 📄 Kertas",'Mana lebih tipis?',['📕 Buku','📄 Kertas','Sama'],1,'Kertas lebih tipis.',['Buku banyak halaman.'],40],
    [126,'Kosong Penuh',"🍶 Gelas penuh dan 🥛 gelas kosong",'Mana yang kosong?',['🍶 Gelas penuh','🥛 Gelas kosong','Keduanya'],1,'Yang tidak ada isinya.',['Tidak ada airnya.'],40],
    [127,'Tinggi Rendah',"🦒 dan 🐧",'Mana lebih tinggi?',['🦒 Jerapah','🐧 Pinguin','Sama'],0,'Jerapah lehernya panjang.',['Hewan tinggi.'],40],
    [128,'Cepat Lambat',"🐆 dan 🐢",'Mana lebih cepat?',['🐆 Cheetah','🐢 Kura-kura','Sama'],0,'Cheetah paling cepat.',['Hewan totol cepat.'],40],
    [129,'Bentuk Setengah',"Cari setengah lingkaran!",'Mana yang?',['🍕 Pizza','📖 Buku','⬜ Kotak'],0,'Pizza sering setengah lingkaran.',['Makanan yang dipotong.'],40],
    [130,'Bentuk Hati',"Cari bentuk hati!",'Mana hati?',['❤️','⭐','🔴'],0,'Bentuk hati (love).',['Simbol cinta.'],40],
  ];
  visual.forEach(([n,t,s,i,o,ci,e,h,pt,ex]) => add('tk',n,t,'tk-visual','tk_visual_match',s,i,o,ci,e,h,pt,ex||{}));
}

function generateTKKreativitas() {
  const kreatif = [
    [131,'Suara Hujan',"Ingin bikin suara hujan.",'Bagaimana caranya?',['Kocok beras dalam botol','Tepuk tangan','Diam'],0,'Kocok beras = suara hujan.',['Benda kecil dalam wadah.'],40],
    [132,'Boneka Kaus Kaki',"Kaus kaki bekas bersih.",'Bisa dibuat apa?',['Boneka lucu','Buang','Simpan terus'],0,'Kaus kaki bisa jadi boneka.',['Tambah mata dan mulut.'],40],
    [133,'Gambar dari Cap',"Kentang dan cat warna.",'Bisa dibuat apa?',['Stempel dari kentang','Makan kentang','Buang'],0,'Kentang jadi cap/stempel.',['Potong dan celup cat.'],40],
    [134,'Gelas Musik',"Gelas dan air.",'Bisa dibuat apa?',['Alat musik gelas','Minum semua','Pecahkan'],0,'Isi air beda tinggi = nada beda.',['Ketuk gelasnya.'],40],
    [135,'Bayangan Tangan',"Senter dan ruangan gelap.",'Bisa bikin apa?',['Bayangan binatang','Tidur','Matikan senter'],0,'Bayangan tangan di tembok.',['Bentuk tangan.'],40],
    [136,'Kotak Harta Karun',"Kotak sepatu bekas.",'Bisa jadi apa?',['Tempat simpan hiasan','Buang','Biarkan'],0,'Hias kotak jadi tempat simpan.',['Warnai dan hias.'],40],
    [137,'Mahkota Raja',"Karton besar.",'Bisa dibuat apa?',['Mahkota raja','Buang','Robek'],0,'Potong bentuk mahkota.',['Yang dipakai di kepala.'],40],
    [138,'Bunga Kertas',"Kertas warna dan lem.",'Bisa dibuat apa?',['Bunga 3D','Buang','Simpan'],0,'Lipat dan tempel jadi bunga.',['Kertas + lipat + tempel.'],40],
    [139,'Teropong',"Gulungan tisu bekas.",'Bisa jadi apa?',['Teropong mainan','Buang','Simpan'],0,'Hias jadi teropong.',['Alat untuk melihat jauh.'],40],
    [140,'Topeng Hewan',"Piring kertas.",'Bisa jadi apa?',['Topeng hewan','Buang','Piring biasa'],0,'Lubangi mata, gambar wajah.',['Piring + gambar + lubang.'],40],
  ];
  kreatif.forEach(([n,t,s,i,o,ci,e,h,pt,ex]) => add('tk',n,t,'tk-kreativitas','tk_creativity_simple',s,i,o,ci,e,h,pt,ex||{}));
}

// Execute generators
generateTKMissions();
generateTKPreLit();
generateTKPola();
generateTKVisual();
generateTKKreativitas();

// ─── BUILD OUTPUT ───
let output = `// AUTO-GENERATED Mission Data
// Total missions: ${Object.values(counts).reduce((a,b)=>a+b,0)}
import type { Mission } from "@/types";
\n\n`;

for (const [diff, list] of Object.entries(missions)) {
  if (list.length > 0) {
    output += `// ${diff}: ${list.length} missions\nexport const ${diff.toUpperCase().replace('-','_')}_GENERATED: Mission[] = [\n`;
    output += list.join(',\n');
    output += '\n];\n\n';
  }
}

// Combined export
output += `export const ALL_GENERATED_MISSIONS: Mission[] = [\n`;
const all = [];
for (const [diff, list] of Object.entries(missions)) {
  all.push(`...${diff.toUpperCase().replace('-','_')}_GENERATED`);
}
output += all.join(',\n');
output += '\n];\n';

fs.writeFileSync(OUT, output);
console.log('✅ Generated missions:');
for (const [d, c] of Object.entries(counts)) console.log(`  ${d}: ${c}`);
console.log(`  TOTAL: ${Object.values(counts).reduce((a,b)=>a+b,0)}`);
