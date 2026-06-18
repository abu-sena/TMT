Jalankan berurutan agar tidak kacau: Prompt 1 untuk struktur & UI umum, Prompt 2 untuk peta, level, misi, dan daily real-world checklist, Prompt 3 untuk mini-game, lencana, QA, dan validasi akhir.

PROMPT 1 — REKONSTRUKSI UMUM TMT: PROFIL, LEVEL KESULITAN, HOME UI, NAVIGASI, DAN RANDOM CHOICE GLOBAL

Saya ingin melakukan revisi besar pada game:

TMT — The Mastermind Trials

Fokus tahap ini:

Tambahkan gender di pembuatan/edit profil.
Rekonstruksi level kesulitan menjadi 6 tingkat:
TK
SD Bawah
SD Atas
SMP
SMA
Universitas
Semua pilihan ganda di seluruh game wajib random urutannya.
Perbaiki Home UI sesuai revisi.
Ganti teks TMT di Home menjadi logo TMT.
Sederhanakan akses Mini-Game.
Ubah Mastermind Duel menjadi Battle.
Pindahkan Orang Tua dan Pengaturan ke section paling bawah.
Dashboard Orang Tua bisa memilih semua anak dengan dropdown.
Ganti profil bisa dilakukan di Home dengan klik icon switch.
Jangan build APK dulu. Fokus implementasi dan QA.

==================================================

TAMBAHKAN GENDER DI PROFIL
==================================================

Tambahkan field gender pada pembuatan dan edit profil.

Field:

gender: "male" | "female" | "unspecified"

UI:

tampilkan pilihan:
Laki-laki
Perempuan
Tidak ditentukan
default boleh “Tidak ditentukan”
gunakan card/radio button cute, bukan input default HTML
tetap responsive HP dan tablet

Data profil:

id
name
avatar
gender
currentDifficulty
unlockedDifficulties
level
xp
points
createdAt
updatedAt

Pastikan migrasi data lama aman:

jika profil lama belum punya gender, isi "unspecified"
jangan menghapus progress lama

Ganti struktur difficulty menjadi:

TK
SD Bawah
SD Atas
SMP
SMA
Universitas

Hapus/ubah mapping lama:

SD Kecil → SD Bawah
SD Muda → SD Atas
Universitas tetap sebagai level tertinggi

Pastikan semua sistem support 6 difficulty:

profile creation
profile edit
Home
Adventure Map
Daily Mission
Statistics / Status Window
Mini-game
Battle
Parent Dashboard
mission generator
mission validator
progression upgrade

Level difficulty tidak boleh tercampur.

Setiap tingkat kesulitan memiliki stage/misi dari mudah ke sulit.

Contoh:

TK stage awal sangat sederhana, stage akhir lebih menantang tapi tetap sesuai TK.
Universitas stage 1 relatif mudah untuk level Universitas, tetapi stage akhir jauh lebih analitis dan kompleks.

Tambahkan helper:
getStageDifficultyRank(difficulty, stageNumber)

Contoh progression internal:

1–20% awal: easy within difficulty
21–50%: normal
51–80%: hard
81–100%: expert/boss/review

Gunakan ini untuk:

generate soal
map node
reward
scoring
boss/final mission

Semua pilihan jawaban di seluruh game wajib diacak urutannya.

Berlaku untuk:

misi peta petualangan
misi harian jika ada pilihan
mini-game
battle
boss mission
adab
logika
spasial
TK visual choice
semua multiple choice

Aturan:

Pakai Fisher-Yates shuffle.
Jangan pakai array.sort(() => Math.random() - 0.5).
Shuffle hanya saat soal dibuat.
Jangan shuffle ulang saat re-render/timer berjalan.
Simpan ke shuffledChoices.
Validator berdasarkan choice.id atau choice.value, bukan index.
Tidak boleh ada pilihan duplikat.
CorrectAnswer wajib ada dalam choices.
Posisi jawaban benar harus bervariasi.

Buat utility:

shuffleArray()
createShuffledChoices()
validateChoiceIntegrity()

Buat script:
scripts/validate-random-choices.ts

Script mengecek:

tidak ada duplikat
correct answer ada
choices valid
multiple render tidak mengubah urutan
posisi jawaban benar bervariasi dalam 100 generate soal

Perbaiki Home Screen sesuai struktur baru.

A. Ganti tulisan TMT di bagian atas menjadi logo TMT.

Gunakan logo TMT yang sudah ada di project.
Jangan tampilkan tulisan plain “TMT” besar.
Logo harus proporsional.
HP: logo tidak terlalu besar dan tidak terpotong.
Tablet: logo centered dan rapi.

B. Tambahkan keterangan text kecil di icon atas game.
Icon seperti hati, diamond, coin, XP, bintang, dll harus punya label kecil agar user tahu angka apa.

Contoh:

Hati: “Energi”
Diamond: “Permata”
Coin: “Koin”
XP: “XP”
Bintang: “Bintang”

UI:

label kecil di bawah/di samping icon
jangan terlalu ramai
tetap readable
responsive HP/tablet

C. Mini-game cukup 1 button:
Ganti semua mini-game card di Home menjadi satu button saja:

“Mini-Game”

Ketika diklik, masuk ke Mini Game Center yang berisi semua mini-game.

D. Ganti tulisan “Mastermind Duel” menjadi:
“Battle”

E. Button Mini-Game dan Battle harus menjadi 1 baris.

Di HP normal: 2 kolom satu baris.
Jika layar sangat kecil, boleh stack tapi prioritaskan satu baris.
Button harus proporsional, tidak oval berlebihan, tidak keluar layar.

F. Ubah nama button:

“Badge” atau “Koleksi Badge” → “Koleksi Lencana”
“Statistik” → “Status Window”

G. Pindahkan:

Orang Tua
Pengaturan

Menjadi 1 section paling bawah.

Section bawah:
“Kontrol & Pengaturan”

Orang Tua
Pengaturan

H. Warna button dibuat warna-warni lucu.
Contoh:

Peta Petualangan: hijau/biru
Misi Harian: kuning/oranye
Koleksi Lencana: ungu/pink
Status Window: biru/cyan
Mini-Game: orange/merah muda
Battle: merah/ungu
Orang Tua: teal
Pengaturan: abu-biru

Tetap:

rounded rectangle proporsional
jangan oval ekstrem
tidak menggunakan default button HTML
shadow playful
icon besar tapi tidak berlebihan

Di Dashboard Orang Tua, tambahkan dropdown untuk memilih profil anak.

Dropdown:

Semua Anak
Nama anak 1
Nama anak 2
dst

Jika pilih “Semua Anak”:

tampilkan ringkasan gabungan semua anak
total misi selesai
rata-rata progress
anak paling aktif
anak yang perlu latihan
battle/mini-game summary
misi harian real-world checklist summary

Jika pilih 1 anak:

tampilkan detail anak tersebut

Pastikan:

parent password tetap aktif
data kosong tidak error
halaman bisa scroll
tidak ada undefined/NaN

Di Home, tambahkan icon switch profil dekat avatar/nama anak.

Ketika icon switch ditekan:

buka modal “Ganti Profil”
tampilkan semua profil anak
user memilih profil aktif
update activeProfile
Home, map, stats, mini-game, battle ikut profil baru

Modal:

card profil
avatar
nama
difficulty
level
tombol pilih
tombol tambah profil jika perlu

Back Android:

jika modal switch terbuka, back menutup modal
jangan keluar app

Test:

Buat profil baru dengan gender.
Edit gender profil lama.
Data profil lama tidak rusak.
Difficulty hanya 6:
TK
SD Bawah
SD Atas
SMP
SMA
Universitas
Home menampilkan logo TMT, bukan tulisan TMT.
Icon hati/diamond/dll punya label kecil.
Mini-Game dan Battle satu baris.
Badge sudah menjadi Koleksi Lencana.
Statistik sudah menjadi Status Window.
Orang Tua dan Pengaturan ada di section bawah.
Button warna-warni lucu dan tidak oval ekstrem.
Parent Dashboard bisa dropdown semua anak.
Switch profil dari Home bekerja.
Semua multiple choice random.
Tidak ada horizontal overflow.
Back Android aman.
Offline tetap jalan.

Buat laporan:
docs/TMT_GENERAL_RECONSTRUCTION_REPORT.md

Jangan build APK dulu.

PROMPT 2 — REKONSTRUKSI PETA PETUALANGAN, MISI, DAILY REAL-WORLD CHECKLIST, DAN LENCANA

Lanjutkan revisi TMT.

Fokus tahap ini:

Peta Petualangan dikembalikan ke style awal seperti map petualangan, bukan daftar tugas/kategori.
Background peta dibuat bervariasi: gua, gunung, pantai, hutan, lembah, dll.
Jenis tantangan dicampur, tidak diurut berdasarkan kategori.
Buat ulang soal di peta sesuai 6 tingkat kesulitan.
Perkaya jenis tantangan di peta dengan game baru.
Setelah misi terakhir di tiap difficulty selesai, difficulty berikutnya terbuka.
Misi Harian diubah menjadi checklist adab dunia nyata.
Badge diganti menjadi Lencana.
Perkaya lencana minimal 50.

==================================================

PETA PETUALANGAN KEMBALI KE SETTING AWAL
==================================================

Masalah:
Peta petualangan saat ini menjadi seperti daftar tugas/kategori. Saya ingin peta kembali seperti setting awal: map petualangan dengan jalur node, bukan daftar kategori.

Target:
Adventure Map berbentuk jalur petualangan berliku dengan node stage.

Ciri:

ada jalur/path
ada node misi
ada node terkunci
ada node selesai
ada bintang/stars
ada box kado
ada boss/final node
ada variasi background
bukan daftar tugas vertikal seperti checklist kategori

Gunakan style:

cute fantasy adventure
map game anak
warna cerah
background berubah sesuai area
node playable terlihat jelas
scroll vertical smooth di HP
tablet lebih luas tapi tetap centered

Peta tidak boleh hanya padang rumput.

Buat variasi area/background:

Hutan
Padang rumput
Pantai
Gua
Naik gunung
Turun gunung
Sungai
Gurun ringan
Kota kecil
Langit/awan
Jembatan
Lembah
Perpustakaan ajaib
Laboratorium logika
Majelis musyawarah

Background bisa berganti per segment stage.

Contoh:
Stage 1–50: hutan/padang rumput
Stage 51–100: sungai/jembatan
Stage 101–150: gua
Stage 151–200: naik gunung
Stage 201–250: pantai
Stage 251–300: kota kecil
Stage 301–400: laboratorium/perpustakaan
Stage 401–500: gerbang mastermind/boss area

Jika tiap difficulty punya 500 stage, gunakan segment background agar map terasa berubah.

Jangan urutkan berdasarkan kategori seperti:

semua adab dulu
semua numerasi dulu
semua pola dulu

Campur jenis tantangan sepanjang map.

Contoh urutan:

Numerasi
Adab
Pola
Spasial
Logika
Ingatan
Kesimpulan
Adab
Cocokkan Bayangan
Boss Mini

Tujuan:

anak tidak bosan
peta terasa seperti adventure
variasi kognitif dan moral seimbang

Buat function:
generateMixedChallengeSequence(difficulty, totalStages)

Dengan aturan:

tidak boleh 3 misi kategori sama berturut-turut
adab muncul berkala
logika/spasial/numerasi seimbang
boss setiap interval tertentu
reward box di stage tertentu

Difficulty:

TK
SD Bawah
SD Atas
SMP
SMA
Universitas

Setiap difficulty memiliki total 500 stage.

Buat konten peta sesuai tingkat.

TK:

visual
audio/teks pendek
2–4 pilihan
adab dasar
pola sederhana
hitung kecil
cocokkan bentuk
cari yang berbeda sederhana

SD Bawah:

tambah/kurang dasar
pola sederhana
adab harian
visual/spasial ringan
logika sangat sederhana

SD Atas:

operasi campuran dasar
pola lebih menantang
kesimpulan ringan
systems thinking sederhana
adab sosial

SMP:

logika petunjuk
systems thinking
moral reasoning
pola angka
kesimpulan
nasihat dengan lembut

SMA:

analisis lebih matang
argumentasi
leadership
dilema bijak
strategic decision
systems thinking

Universitas:

advanced reasoning
argument evaluation
ethical leadership
quantitative logic
systems thinking kompleks
case analysis

Tambahkan variasi tantangan peta dari mini-game baru:

Cocokkan Bayangan
Pilih Kesimpulan
Logika / Detektif Petunjuk
Tebak Aturan
Benar atau Salah
Cari yang Berbeda
Ubah Posisi
Jalur Tercepat
Pilih Sikap Terbaik
Nasihat dengan Lembut
Urutkan Adab
Dilema Bijak

Semua tantangan peta wajib:

punya jawaban
punya validator
punya feedback/explanation
choices random jika pilihan
tidak placeholder

Setelah menyelesaikan misi terakhir di tiap difficulty, difficulty berikutnya terbuka.

Flow:

selesai stage 500 TK → SD Bawah terbuka
selesai stage 500 SD Bawah → SD Atas terbuka
selesai stage 500 SD Atas → SMP terbuka
selesai stage 500 SMP → SMA terbuka
selesai stage 500 SMA → Universitas terbuka
selesai stage 500 Universitas → tampil “Mastery Complete” atau “Mode Review”

Modal:
“Selamat! Kamu telah menyelesaikan semua stage TK. Sekarang SD Bawah terbuka!”

Tombol:

Naik Sekarang
Nanti Dulu

Jika “Naik Sekarang”:

currentDifficulty berubah
peta difficulty baru aktif
progress lama tetap tersimpan

Jika “Nanti Dulu”:

tetap di difficulty lama
tombol “Naik Tingkat” muncul di Home atau Map

Misi Harian bukan lagi soal/game biasa.

Ubah menjadi checklist adab anak di dunia nyata.

Nama:
Misi Harian Adab

Contoh checklist:

Membantu ibu/ayah
Mengucapkan salam
Merapikan tempat tidur
Membantu teman/adik
Mengucapkan terima kasih
Meminta maaf jika salah
Membaca buku 10 menit
Menjaga lisan
Berbagi dengan saudara
Menaruh barang pada tempatnya

Flow:

Anak melihat checklist harian.
Anak centang jika sudah melakukan.
Untuk item tertentu, status menjadi “Menunggu Konfirmasi Orang Tua”.
Orang tua bisa verifikasi di Dashboard Orang Tua.
Jika diverifikasi, anak mendapat XP kecil/lencana progress.
Jika tidak diverifikasi, tetap tersimpan sebagai latihan tapi tidak penuh reward.

Data:
DailyAdabChecklist:

id
profileId
date
items[]
completedCount
verifiedCount
rewardClaimed
streak

ChecklistItem:

id
title
description
requiresParentVerification
isChecked
isVerified
checkedAt
verifiedAt

Aturan:

berjalan offline
berubah setiap hari
bisa memilih item berdasarkan difficulty/usia
tidak terlalu banyak: 3–5 item per hari
parent bisa mengatur checklist custom nanti jika perlu

Ubah semua istilah:

Badge → Lencana
Koleksi Badge → Koleksi Lencana
Badge unlock → Lencana Terbuka
BadgeCard → boleh tetap nama kode jika sulit, tapi UI harus Lencana

Perkaya lencana minimal 50.

Kategori lencana:

Kognitif
Adab
Mini-game
Battle
Misi Harian Adab
Peta Petualangan
Konsistensi/Streak
Difficulty Completion

Contoh lencana:

Penjelajah Pemula
Sahabat Amanah
Penjaga Lisan
Anak Suka Menolong
Ahli Salam
Teliti Membaca
Pemecah Pola
Master Angka
Pahlawan Ingatan
Detektif Cilik
Pencari Kesimpulan
Penjelajah Gua
Pendaki Gunung
Sahabat Pantai
Pembuka Kado
Juara Hitung Kilat
Ahli Pola Kilat
Mata Tajam
Paling Bijak
Nasihat Lembut
Anak Sabar
Jujur Itu Hebat
Rendah Hati
Musyawarah Muda
Pemimpin Bijak
Battle Pertama
Pemenang Battle
Paling Teliti
Paling Semangat
Comeback Terbaik
TK Complete
SD Bawah Complete
SD Atas Complete
SMP Complete
SMA Complete
Universitas Complete
Streak 3 Hari
Streak 7 Hari
Streak 30 Hari
Misi Harian Rajin
Membantu Orang Tua
Suka Berterima Kasih
Berani Minta Maaf
Hafal Jalan Aman
Ahli Bayangan
Ahli Ubah Posisi
Pembaca Petunjuk
Ahli Benar Salah
Mastermind Muda
The True Mastermind

Setiap lencana punya:

id
title
description
icon
category
unlockCondition
rarity
unlockedAt

Test:

Peta bukan daftar tugas.
Peta punya jalur node seperti setting awal.
Background bervariasi.
Tantangan dicampur, bukan per kategori.
Peta punya 500 stage per difficulty.
Difficulty support 6 level.
Stage awal mudah, stage akhir sulit di tiap difficulty.
Stage 500 unlock difficulty berikutnya.
Misi Harian menjadi checklist adab dunia nyata.
Parent bisa melihat/verifikasi checklist.
Kata Badge hilang dari UI, diganti Lencana.
Minimal 50 lencana tersedia.
Semua pilihan random.
Box kado tetap bisa dibuka.
Semua halaman scroll aman.
Tidak ada placeholder playable.

Buat laporan:
docs/TMT_MAP_DAILY_BADGE_REWORK_REPORT.md

Jangan build APK dulu.

PROMPT 3 — REVISI MINI-GAME, HAPUS FITUR TERTENTU, QA FINAL, DAN DOKUMENTASI

Lanjutkan revisi mini-game TMT.

Fokus tahap ini:

Revisi Cari yang Berbeda.
Revisi Pilih Sikap Terbaik agar pilihan random.
Ubah Putar Bentuk menjadi Ubah Posisi dengan matrix 10x10.
Revisi Cocokkan Bayangan agar memakai flat color hitam.
Ubah Jalur Aman menjadi Jalur Tercepat dengan matrix 6x20.
Hapus mini-game Susun Puzzle, Jurnal Kebaikan, dan Hadiah Dunia Nyata.
Pastikan semua mini-game valid, random, playable, dan tidak placeholder.
Jangan build APK dulu.

==================================================

MINI-GAME CARI YANG BERBEDA
==================================================

Revisi:
Mini-game “Cari yang Berbeda” jangan gunakan emoticon berwarna.

Gunakan:

flat color warna-warni
bentuk sederhana
yang dijadikan pilihan adalah bentuknya, bukan warnanya

Artinya:

warna boleh berbeda-beda dan lucu
tetapi jawaban yang benar ditentukan oleh bentuk yang berbeda
jangan membuat warna menjadi clue utama

Gunakan setidaknya 20 object per soal.

Contoh:

19 bentuk lingkaran dengan warna berbeda-beda
1 bentuk segitiga
user harus memilih segitiga

Bentuk:

lingkaran
segitiga
persegi
bintang
hati
pentagon
diamond
oval
hexagon

Aturan:

grid minimal 4x5 untuk 20 object
posisi jawaban random
warna object random
bentuk target mayoritas dan odd shape random
jangan ada clue dari warna
validator berdasarkan shapeId, bukan color

Difficulty:
TK:

12–16 object boleh jika 20 terlalu padat, tapi target utama 20 jika layar memungkinkan
SD ke atas:
minimal 20 object

UI:

object besar cukup untuk disentuh
responsive HP/tablet
tidak horizontal overflow
timer optional sesuai difficulty

Mini-game “Pilih Sikap Terbaik” wajib random urutan pilihan.

Aturan:

setiap soal pilihan diacak
jangan berdasarkan index
validator berdasarkan choice.id/value
feedback tetap sesuai jawaban
best answer tetap dikenali
acceptable/partial answer tetap dikenali
tidak shuffle ulang saat re-render
hikmah manual next
timer pause saat feedback/hikmah

Test 20 soal:

best answer muncul di posisi berbeda-beda
tidak ada duplikat
tidak ada feedback salah karena index berubah

Hapus/rename mini-game:
“Putar Bentuk”

Menjadi:
“Ubah Posisi”

Konsep:
Gunakan matrix/grid 10x10.

Objek:

buah apel sebagai posisi awal
tampilkan instruksi gerakan
user menentukan posisi akhir apel

Contoh soal:
Apel mulai di posisi tertentu.
Instruksi:
3➡️ - 2⬅️ - 5⬆️ - 2⬇️

Pertanyaan:
“Dimana posisinya sekarang?”

Catatan:

Gunakan grid 10x10.
Tentukan posisi awal apel secara random.
Gerakan tidak boleh membuat apel keluar grid.
Jika gerakan keluar grid, generator harus memilih ulang posisi/instruksi.
User menjawab dengan klik cell posisi akhir.
Validator membandingkan cell akhir benar.

Data soal:

gridSize: 10
startPosition: { row, col }
moves: [
{ direction: "right", steps: 3 },
{ direction: "left", steps: 2 },
{ direction: "up", steps: 5 },
{ direction: "down", steps: 2 }
]
correctPosition: { row, col }

Difficulty:
TK:

jangan tampilkan game ini atau buat versi sangat sederhana 1–2 gerakan
SD Bawah:
2 gerakan
SD Atas:
3 gerakan
SMP:
4 gerakan
SMA:
5 gerakan
Universitas:
6+ gerakan atau include distractor memory

UI:

grid 10x10 harus muat di HP
cell cukup bisa ditekan
gunakan zoom/scale responsive
jangan horizontal overflow
posisi awal apel jelas
instruksi gerakan jelas
tombol reset/ulang soal jika perlu

Mini-game “Cocokkan Bayangan” harus memakai objek bayangan flat color hitam, bukan warna-warni.

Revisi:

objek utama boleh warna-warni atau satu warna sederhana
pilihan bayangan harus hitam/gelap flat
user memilih bayangan yang cocok dengan bentuk objek
jangan gunakan warna sebagai clue
validator berdasarkan shapeId

Aturan:

minimal 4 pilihan untuk TK/SD bawah
6 pilihan untuk SD Atas ke atas
pilihan random
jawaban benar posisi random
bentuk tidak terlalu mirip untuk TK
bentuk lebih mirip untuk level tinggi

Rename:
“Jalur Aman” → “Jalur Tercepat”

Konsep:
Matrix 6x20.

Emoji/object:

🐒 = posisi awal
🍌 = posisi akhir
🐾 = bisa dilalui
🪵 = tidak bisa dilalui

User harus klik urutan jalan dari monyet menuju pisang.

Aturan:

Grid ukuran 6 baris x 20 kolom.
Hanya cell 🐾 yang bisa dilalui.
🪵 tidak bisa dilalui.
User hanya boleh klik cell yang bersebelahan langsung dari posisi saat ini:
atas
bawah
kiri
kanan
Tidak boleh klik diagonal.
Jika klik cell yang tidak terdekat/invalid, beri feedback lembut.
Tujuan adalah mencapai 🍌.
Ada timer.
Skor berdasarkan:
berhasil/tidak
waktu
jumlah langkah
apakah jalurnya mendekati tercepat
Generator harus memastikan ada jalur valid dari 🐒 ke 🍌.
Idealnya hitung shortest path sebagai pembanding.

Data:

rows: 6
cols: 20
start
goal
walkableCells
blockedCells
shortestPathLength
userPath
timerLimit

Difficulty:
TK:

tidak perlu tampilkan, atau versi 4x8 sangat sederhana jika dibutuhkan
SD Bawah:
grid lebih mudah, sedikit rintangan
SD Atas:
rintangan sedang
SMP:
rintangan lebih banyak
SMA:
jalur bercabang
Universitas:
jalur kompleks, timer lebih menantang

UI:

grid 6x20 harus responsive di HP
gunakan horizontal fit, bukan horizontal scroll jika memungkinkan
cell tetap bisa disentuh
🐒 dan 🍌 jelas
path yang sudah dipilih diberi highlight
tombol undo satu langkah jika perlu
timer terlihat
jangan terlalu kecil di HP

Hapus dari UI dan route playable:

Susun Puzzle
Jurnal Kebaikan
Hadiah Dunia Nyata

Catatan:

Hadiah Dunia Nyata sebelumnya mungkin ada di Parent Dashboard. Sekarang hilangkan dari mini-game/paket keluarga sesuai instruksi.
Jika masih ada data lama, jangan membuat app crash.
Data lama boleh tetap di storage tapi tidak tampil.
Jangan menghapus data user secara agresif tanpa migrasi aman.

Update Mini Game Center:
Paket Keluarga sekarang hanya berisi:

Misi Keluarga
Family Challenge

Jika paket keluarga terlihat terlalu kosong, tetap boleh tampil dengan 2 fitur.

Pastikan:

tidak ada button Susun Puzzle
tidak ada Jurnal Kebaikan
tidak ada Hadiah Dunia Nyata
tidak ada route broken
tidak ada link mati

Mini Game Center menampilkan:

Paket Fokus Cepat:

Hitung Kilat
Pola Kilat
Ingatan Cepat
Cari yang Berbeda

Paket Adab:

Pilih Sikap Terbaik
Nasihat dengan Lembut
Urutkan Adab
Dilema Bijak

Paket Logika:

Detektif Petunjuk
Tebak Aturan
Pilih Kesimpulan
Benar atau Salah

Paket Spasial:

Ubah Posisi
Cocokkan Bayangan
Jalur Tercepat

Paket Keluarga:

Misi Keluarga
Family Challenge

Tidak ada:

Susun Puzzle
Jurnal Kebaikan
Hadiah Dunia Nyata

Update script:
scripts/validate-minigames.ts

Cek:

Semua mini-game aktif punya renderer.
Semua punya validator.
Semua choices random jika pilihan ganda.
CorrectAnswer ada.
Tidak ada duplicate choices.
Tidak ada mini-game terhapus yang masih tampil.
Ubah Posisi punya correctPosition.
Jalur Tercepat punya valid path.
Cocokkan Bayangan memakai shadow hitam/flat.
Cari yang Berbeda memakai shape sebagai jawaban, bukan warna.
Pilih Sikap Terbaik random.
Tidak ada placeholder playable.

Test:

Mini Game Center hanya menampilkan mini-game yang benar.
Cari yang Berbeda memakai flat color shape, minimal 20 object jika layar memungkinkan.
Jawaban Cari yang Berbeda berdasarkan bentuk.
Pilih Sikap Terbaik choices random.
Ubah Posisi grid 10x10 playable.
Ubah Posisi gerakan valid dan tidak keluar grid.
Cocokkan Bayangan pilihan bayangan hitam.
Jalur Tercepat grid 6x20 playable.
User hanya bisa klik cell terdekat.
Jalur Tercepat punya timer.
Jalur Tercepat bisa mencapai pisang.
Susun Puzzle hilang.
Jurnal Kebaikan hilang.
Hadiah Dunia Nyata hilang.
Statistik tidak error setelah perubahan.
Parent Dashboard tidak error setelah fitur dihapus.
Semua halaman scroll aman.
Back Android aman.
Offline tetap jalan.

Buat laporan:
docs/TMT_MINIGAME_REWORK_REPORT.md

Jangan build APK dulu.

Setelah tiga prompt ini stabil, melakukan regression QA + build APK