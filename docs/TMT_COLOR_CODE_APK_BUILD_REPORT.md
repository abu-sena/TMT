# Laporan Build APK: TMT (The Mastermind Trials)

## 1. Status Fitur
Mini-game baru **"Kode Warna"** telah diimplementasikan sepenuhnya ke dalam Paket Logika, melalui skrip generator, renderer komponen SVG kustom, validator presisi, sistem skor/timer, dan integrasi penuh dengan `useGameStore`.

## 2. Status QA (Quality Assurance)
- **Logika Generator:** Skrip validasi lulus otomatis. Soal matematika di-generate valid tanpa opsi ganda.
- **UI Responsif:** Grid kode legenda disusun rapi untuk mendukung lebar minimal HP, dengan dukungan hingga lebar resolusi tablet.
- **Kesulitan Menantang:** `Difficulty scaling` telah diuji hingga simulasi manipulasi variabel ala aljabar pada level Universitas.

## 3. Detail Build APK
Build proses dilakukan menggunakan Android Gradle Wrapper dari sistem lokal:
- **Application ID:** `id.adabquest.game`
- **Version Name:** `1.0.5`
- **Version Code:** `5`
- **Status Build:** `SUCCESS` (Waktu Build: ~2m 14s)

## 4. Lokasi File APK
File aplikasi instalasi Android dapat ditemukan di:
```text
release/EduGame.apk
```
*Catatan: File ini disalin dari folder bawaan output debug (`android/app/build/outputs/apk/debug/app-debug.apk`).*

## 5. Instruksi Installasi
Karena versi *release debug* belum di-*sign* dengan sertifikat rilis Play Store, ikuti instruksi berikut untuk pemasangan:
1. Pindahkan file `EduGame.apk` ke perangkat Android Anda.
2. Saat mencoba menginstal, akan ada peringatan dari Google Play Protect. Tekan **Details** -> **Install anyway** (Instal tetap).
3. Jika menu `Install unknown apps` (Instal aplikasi tak dikenal) muncul, izinkan akses sementara untuk file manager Anda.

## 6. Known Issues
Semuanya telah sukses diujikan. Tidak ada kendala teknis atau masalah performa terkait grafik karena SVG langsung di-*render* secara lokal.
