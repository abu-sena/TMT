# Laporan Perbaikan Paket Spasial (Mini Game Center)

## 1. Ringkasan Masalah
Pada Mini Game Center, pengguna melaporkan bahwa dalam "Paket Spasial", hanya game "Cocokkan Bayangan" yang muncul atau dapat dimainkan. Game spasial lainnya yang telah di-finalisasi tidak tampil.

## 2. Analisis Root Cause
1. **Routing Bug di `index.tsx`**: Komponen router utama memiliki hardcoded value `packageId={"fokus-cepat"}` ketika merender `MiniGamePackageScreen`. Hal ini menyebabkan paket apapun yang diklik oleh pengguna akan merender state dari "Fokus Cepat", bukan paket yang dipilih (contohnya "Paket Spasial").
2. **Filtering Logik di `MiniGamePackageScreen`**: Screen membuang (filter-out) game-game yang belum didukung oleh tingkat kesulitan (difficulty) profil anak secara diam-diam. Hal ini membuat game seolah-olah "menghilang", menyebabkan kebingungan.
3. **Grid Render Bug di `JalurTercepatGame`**: Definisi matriks sebelumnya tertukar antara baris dan kolom.

## 3. Perbaikan yang Dilakukan

### A. Perbaikan Routing Paket
- **File Modifikasi**: `src/routes/index.tsx`
- **Tindakan**:
  - Menambahkan state `activeMiniGamePackage` untuk melacak ID paket yang diklik dari `MiniGameCenter`.
  - Mengubah callback `onOpenPackage` untuk menyetel state tersebut (`setActiveMiniGamePackage(pkgId)`).
  - Melempar value `activeMiniGamePackage` secara dinamis ke prop `packageId` di `MiniGamePackageScreen`.

### B. Perbaikan Visibilitas Game (Locked Mode)
- **File Modifikasi**: `src/screens/MiniGamePackageScreen.tsx`
- **Tindakan**:
  - Menghapus filter yang menyembunyikan game tidak didukung secara penuh.
  - Memodifikasi rendering map: Jika game belum didukung oleh level profil (misal: "TK" memainkan "Jalur Tercepat"), card game tersebut **tetap ditampilkan**.
  - Card yang belum didukung akan di-render dalam mode "Terkunci" (Grayscale icon, opacity direndahkan, label "🔒 Terkunci", serta keterangan "Tersedia mulai SD Bawah").
  - Menghapus crash potential ketika isi package kosong (memberikan fallback "Belum Tersedia").

### C. Penyesuaian Komponen Game Spasial Lainnya
- **File Modifikasi**: `src/screens/MiniGameSpasialKeluargaScreens.tsx`
- **Tindakan**:
  - Mengoreksi orientasi matriks `JalurTercepatGame` menjadi 20 baris dan 6 kolom (`rows = 20, cols = 6`) agar sesuai dengan persyaratan *portrait* layout.
  - Memastikan ID dan navigasi kembalinya berjalan lancar ke dalam Mini Game Center.

## 4. Validasi dan QA
- **Skrip Validasi**: `scripts/validate-spatial-minigames.ts` dibuat untuk memeriksa bahwa `MINI_GAME_DEFINITIONS` mendaftarkan tepat 3 game spasial ("ubah-posisi", "cocok-bayangan", "jalur-tercepat").
- **Hasil QA**: 
  - Paket Spasial kini menampung ketiga game.
  - Skrip penguji melewati semua test suite integritas (Semua game punya screenId valid, dan tidak ada sisa-sisa game usang seperti "putar-bentuk" atau "susun-puzzle").

*Report dibuat otomatis oleh Antigravity.*
