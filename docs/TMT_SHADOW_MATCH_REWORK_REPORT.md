# Laporan Revisi Mini-Game "Cocokkan Bayangan"

## 1. Ringkasan Revisi
Mini-game "Cocokkan Bayangan" telah direvisi sepenuhnya untuk menjadi game visual matching yang sesuai dengan referensi. Kini, permainan menampilkan gambar/objek utama yang berwarna cerah di bagian atas layar dan memberikan beberapa pilihan siluet/bayangan hitam datar di bagian bawah untuk dipilih oleh pengguna.

## 2. Perubahan UI
- **Header:** Menampilkan judul "Cocokkan Bayangan", tombol keluar yang jelas, serta progress soal (contoh: 1/10).
- **Area Objek Utama:** Card di bagian atas dengan background berwarna cream cerah, menampilkan teks instruksi "PILIH BAYANGAN YANG COCOK" serta objek utama dengan resolusi besar dan filter drop-shadow untuk kesan ceria dan menarik (cute game style).
- **Area Pilihan Bayangan:** Ditampilkan dalam grid responsif (2 kolom pada HP kecil, 3 kolom pada tablet/layar lebih lebar). Setiap pilihan adalah card dengan background putih, berisi siluet flat black.
- **Indikator Pilihan (Radio Circle):** Setiap card bayangan memiliki lingkaran kecil bergaya radio button di bagian bawah. Ketika pengguna memilih sebuah card, lingkaran tersebut akan ditandai dengan centang dan background berwarna.
- **Feedback Langsung:** Ketika sebuah bayangan dipilih, permainan akan segera mengunci jawaban, memberikan warna indikasi (Hijau jika Benar, Merah jika Salah), dan jika salah, jawaban yang benar akan diberikan highlight khusus agar anak bisa mempelajarinya. Tombol "Lanjut" atau "Selesai" akan muncul untuk melanjutkan soal.

## 3. Struktur Soal
- Generator baru, `generateShadowMatchQuestion`, telah ditambahkan ke dalam sistem (`src/lib/shadow-match-generator.ts`).
- Generator tidak lagi bergantung pada hardcoded indices untuk validasi. Sistem menggunakan `ObjectId` (seperti `h-jerapah`, `b-apel`) dan setiap pilihan diberikan `choice-id` yang unik.
- Fisher-Yates Shuffle selalu dipanggil secara khusus untuk mengacak posisi opsi bayangan sebelum soal diberikan ke UI. UI kemudian hanya menampilkan `shuffledChoices`. Hal ini mencegah render ulang mengubah urutan jawaban atau merusak state.

## 4. Sistem Object dan Silhouette
Objek-objek telah dikelompokkan ke dalam 5 kategori:
1. Hewan (Jerapah, Singa, Monyet, dsb.)
2. Buah (Apel, Pisang, Semangka, dsb.)
3. Benda (Sepatu, Tas, Buku, dsb.)
4. Kendaraan (Mobil, Pesawat, Kapal, dsb.)
5. Bentuk Sederhana (Bintang, Hati, Persegi, dsb.)

**Visual Rendering (CSS Trick):**
Objek asli yang berwarna ditampilkan apa adanya. Namun, untuk menjaga permainan dapat berfungsi sepenuhnya secara offline dan menghemat bandwidth aset raster/vektor yang harus dibuat manual, bayangan di-render dengan memanfaatkan CSS Filter murni (`filter: brightness(0) drop-shadow(1px 1px 0px rgba(0,0,0,0.5))`). Ini mengubah objek berwarna menjadi siluet hitam pekat (flat black silhouette), yang bebas warna-warni seperti permintaan referensi.

## 5. Difficulty Scaling
Soal di-scale secara otomatis melalui parameter `DifficultyId`:
- **TK:** 3 Pilihan. Distractor diambil dari kategori yang benar-benar berbeda agar siluet sangat mudah dibedakan.
- **SD Bawah & SD Atas:** 4 Pilihan. SD Bawah mengambil distractor dari kategori lain jika memungkinkan, sedangkan SD Atas sedikit lebih acak.
- **SMP:** 5 Pilihan. Prioritas distractor berada dalam satu kategori yang sama (e.g. semua hewan) untuk membuat siluetnya sedikit menantang.
- **SMA & Universitas:** 6 Pilihan. Seluruh opsi diambil dari kategori yang sama dengan tambahan putaran/rotasi yang menipu secara visual pada distractor, mengharuskan observasi tingkat tinggi.

## 6. Random Choices
- Diatur secara internal di dalam service generator menggunakan implementasi Fisher-Yates yang ada di `shuffleArray`.
- Validasi dilakukan dengan `validateShadowMatchAnswer(question, selectedChoiceId)`, di mana sistem akan memeriksa string `selectedChoice.id` alih-alih `index`, menjadikannya sangat tahan bug terhadap render acak.

## 7. Integrasi Mini Game Center & Peta Petualangan
- Routing pada `src/routes/index.tsx` serta standalone fallback pada `src/GameAppStandalone.tsx` telah disinkronisasikan.
- Permainan dijamin ter-map secara akurat ke game route `CocokBayanganGame`. Tidak akan membuka permainan lama ("Putar Bentuk", dsb).

## 8. QA Hasil
- **Tampilan:** Resolusi HP kecil dan tablet terdukung penuh melalui CSS Grid (`grid-cols-2`, `sm:grid-cols-3`). Card tidak akan tumpah secara horizontal.
- **Integrasi Peta:** Komponen mendukung standard `backRef` yang mencegah user menekan tombol "Back" Android lalu crash atau keluar aplikasi secara mendadak. Modalnya akan ditangani elegan oleh Peta Petualangan.
- **Soal dan Difficulty:** Skrip penguji `validate-shadow-match.ts` diluncurkan dengan sukses, melewati pengujian integritas duplikat maupun absennya properti `correctShadow`.

## 9. Known Issues
- Karena bayangan menggunakan trik CSS filter dari color asset, edge details sangat mengandalkan render native OS font emojis/svg internal. Ini sangat cukup memadai untuk tingkat offline, namun desainer 2D khusus disarankan mereplace mapping di `SHADOW_OBJECTS` jika ada ilustrasi raster custom.

*Report dibuat otomatis oleh Antigravity.*
