# Laporan Pembuatan Mini-Game: Kode Warna

## 1. Ringkasan
Mini-game "Kode Warna" telah berhasil diimplementasikan dan ditambahkan ke dalam **Paket Logika**. Game ini menantang anak-anak untuk mengaitkan bentuk-bentuk geometris dengan angka tertentu, lalu melakukan operasi hitungan matematika berdasarkan bentuk yang ditampilkan dalam persamaan.

## 2. Lokasi di Mini Game Center
- **Paket:** Logika
- **ID:** `kode-warna`
- **Route:** `/mini-games/play/kode-warna`
- **Tampilan:** GameCard akan muncul di daftar mini-game Paket Logika.

## 3. Sistem Shape & Kode (CodeSystem)
Permainan secara dinamis menggunakan 9 jenis bentuk SVG murni:
- Square (merah)
- Star (kuning)
- Circle (oranye)
- Triangle (hijau)
- Diamond (biru)
- Pentagon (ungu)
- Heart (merah muda)
- Rectangle (biru muda)
- Hexagon (ungu/coklat)

Bentuk ini dirender melalui komponen `CodeShape.tsx`, yang lebih ringan dan konsisten dibanding gambar eksternal.

## 4. Difficulty Scaling
Tingkat kesulitan diatur sesuai standar aplikasi:
- **TK:** 4 bentuk, angka 1-4, operasi tambah sederhana (`A + B`). Waktu: 15 detik.
- **SD Bawah:** 6 bentuk, angka 1-6, operasi tambah (`A + B`). Waktu: 12 detik.
- **SD Atas:** 9 bentuk, angka acak 1-9, tambah/kurang 2-3 bentuk (`A + B - C`). Waktu: 10 detik.
- **SMP:** Operasi campuran dengan perkalian (`A + B x C`). Waktu: 8 detik.
- **SMA:** Operasi dengan tanda kurung (`(A + B) x C`). Waktu: 7 detik.
- **Universitas:** Manipulasi aljabar / tebak angka yang hilang (`A + ? = B`). Waktu: 7 detik.

## 5. Random Choices & Validator
- Opsi jawaban berjumlah 3 (untuk TK) hingga 6 (untuk menengah ke atas).
- Distractor (jawaban salah) dikalkulasi mendekati jawaban asli (+/- margin kecil) agar mengecoh.
- Semua jawaban di-*shuffle* menggunakan `Fisher-Yates`, memastikan indeks jawaban benar selalu berubah.
- Validator membandingkan nilai *integer* murni (`selectedAnswer === correctAnswer`), mencegah eksploitasi indeks.

## 6. Scoring & Timer
- **Skor Dasar:** +100 per jawaban benar.
- **Penalti Salah:** -20 per jawaban salah (min 0).
- **Speed Bonus:** Maksimal +50, dikalkulasikan secara proporsional dari sisa waktu.
- **Difficulty Bonus:** TK (+0), SD Bawah (+10), SD Atas (+20), SMP (+30), SMA (+40), Universitas (+50).

## 7. Integrasi Statistik
Statistik dimuat melalui `useGameStore` dan direkam ke `addMiniGameSession`, yang mana akan secara otomatis menyinkronkan data *correctCount*, *averageResponseTime*, dan *XP* ke **Status Window** (di HomeScreen) dan klasemen lokal.

## 8. Hasil QA
- **Mini Game Center:** Muncul, bisa diklik, route aktif.
- **Gameplay:** Legend tabel tampil rapi, soal tampil, pilihan bisa ditekan, *feedback* dinamis muncul dengan *explanation*.
- **Validation Script:** Dijalankan dan lulus dengan `0 errors`.

Semua batasan telah dipenuhi, implementasi selesai, dan siap untuk di-build menjadi APK.
