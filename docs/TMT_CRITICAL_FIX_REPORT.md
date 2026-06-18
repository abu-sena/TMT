# TMT — The Mastermind Trials — Critical Fix Report

**Tanggal:** 2026-06-17
**Version:** 1.0.3 (versionCode: 3)
**APK:** release/EduGame.apk (7.5 MB)

---

## 1. STATUS ICON APLIKASI — ✅ FIXED

### Penyebab icon sebelumnya tidak berubah:
1. File `ic_launcher_foreground.png` di setiap folder `mipmap-*` menggunakan versi lama (Jun 2)
2. Background icon tidak disesuaikan dengan tema aplikasi (biru tua, bukan TMT branding)
3. Per-density foreground icons belum diregenerasi dari `icon.png` yang benar

### File yang diperbarui:
- `mipmap-mdpi/ic_launcher.png` & `ic_launcher_round.png` & `ic_launcher_foreground.png`
- `mipmap-hdpi/ic_launcher.png` & `ic_launcher_round.png` & `ic_launcher_foreground.png`
- `mipmap-xhdpi/ic_launcher.png` & `ic_launcher_round.png` & `ic_launcher_foreground.png`
- `mipmap-xxhdpi/ic_launcher.png` & `ic_launcher_round.png` & `ic_launcher_foreground.png`
- `mipmap-xxxhdpi/ic_launcher.png` & `ic_launcher_round.png` & `ic_launcher_foreground.png`
- `drawable/ic_launcher_foreground.png` (432×432 — adaptive icon)
- `drawable/ic_launcher_background.png` (432×432 — deep blue #185E9F)
- `mipmap-anydpi-v26/ic_launcher.xml` & `ic_launcher_round.xml`
- `values/strings.xml`: `app_name = "TMT"`, `title_activity_main = "TMT"`

### Version update:
- `versionCode`: 2 → **3**
- `versionName`: "1.0.2" → **"1.0.3"**

### Generator script:
- `scripts/generate-icons.cjs` menggunakan `sharp` untuk menghasilkan semua ukuran ikon dari `src/components/icon.png`

---

## 2. STATUS BUTTON OVERFLOW — ✅ FIXED

### File yang diperbaiki:

#### a. `src/components/ui/GameButton.tsx` (Global)
- Menambahkan `box-border whitespace-normal break-words` ke className button
- Button dengan `full` prop sudah menggunakan `w-full` + `max-w-full`
- Semua button sekarang aman dari overflow horizontal

#### b. `src/screens/DailyMissionsScreen.tsx`
- Card misi diubah layout jadi `flex-col sm:flex-row` agar button "Mulai" tidak melampaui lebar card
- Button "Mulai" dibungkus dalam wrapper `shrink-0` dengan `w-full` pada mobile, `w-auto` pada tablet
- Reward card ditambahkan `overflow-hidden` dan margin aman
- Halaman menggunakan `overflow-y-auto` untuk scroll aman

#### c. Semua Mini-Game Screen (4 file)
- Button group pada Start screen: `flex gap-3` → `flex flex-col sm:flex-row gap-3`
- Button group pada Result screen: `flex gap-3` → `flex flex-col sm:flex-row gap-3`
- Button group pada Exit modal: `flex gap-3` → `flex flex-col sm:flex-row gap-3`
- Adab Cepat options grid: `grid-cols-1 sm:grid-cols-2` → `grid-cols-1` (teks panjang lebih aman 1 kolom)
- Semua button option ditambahkan `box-border` dan `overflow-hidden`

#### d. `src/styles.css` (Global CSS)
- `*, *::before, *::after { box-sizing: border-box; }`
- Utility `btn-safe-text` untuk word-break dan overflow-wrap
- Utility `flex-min-0` untuk flex children yang bisa shrink

---

## 3. STATUS ANDROID BACK BUTTON — ✅ FIXED

### Strategi back button:
1. Jika modal/popup terbuka → tutup modal
2. Jika di mini-game gameplay → tampilkan konfirmasi keluar
3. Jika di Adab Cepat halaman hadits/penjelasan → tampilkan konfirmasi keluar (bukan skip penjelasan!)
4. Jika di Home → toast "Tekan sekali lagi untuk keluar" → exit di tekan kedua
5. Screen lain → navigate back ke Home/screen sebelumnya

### File yang diperbaiki:

#### a. `src/hooks/useAndroidBackButton.ts` — REWRITE
- **Sebelum:** Menggunakan `(window as any).Capacitor?.App` yang tidak reliable
- **Sekarang:** Import resmi `import { App } from "@capacitor/app"` dengan `App.addListener("backButton", ...)`
- Double-press di Home: listener menangkap press kedua langsung (jika `homeToastActive` true atau dalam 2 detik)
- Listener dibersihkan saat komponen unmount
- Browser fallback tetap ada untuk development web

#### b. `src/screens/MiniGameAdabScreen.tsx`
- **Sebelum:** Back button saat halaman hadits/penjelasan langsung memanggil `handleContinue()` → skip penjelasan
- **Sekarang:** Back button saat penjelasan menampilkan konfirmasi keluar (`setShowExit(true)`) — user bisa baca penjelasan

#### c. `package.json` — Added dependency
- `@capacitor/app@^8.4.0` — untuk App API (back button, exitApp, etc.)

---

## 4. STATUS ADAB CEPAT MANUAL NEXT — ✅ ALREADY WORKING + FIXED

### Flow Adab Cepat (sudah benar):
1. Tampilkan situasi → ✅
2. User pilih jawaban → ✅
3. Feedback benar/salah/acceptable → ✅
4. Tampilkan **Pelajaran Adab / Hikmah** dalam card khusus → ✅
5. Tombol manual: **"Lanjut Tantangan"** (benar) / **"Lihat Hasil"** (salah) → ✅
6. Timer dijeda (`timerPaused = true`) selama penjelasan → ✅
7. Happy face emoji dan icon lembut → ✅

### Perbaikan:
- Android back button saat membaca penjelasan tidak lagi menskip penjelasan (sebelumnya langsung `handleContinue()`)
- Header menampilkan badge "⏸ Pause" saat timer dijeda
- Footer menampilkan: "⏸ Timer dijeda — baca pelajarannya dulu!"
- Tombol "Lanjut" / "Lihat Hasil" menggunakan `GameButton` dengan ukuran proporsional

---

## 5. STATUS RANDOM PILIHAN MINI-GAME — ✅ ALREADY WORKING

### Verifikasi per mini-game:

#### Hitung Kilat (`MiniGameHitungScreen.tsx`)
- Fisher-Yates shuffle di `generateQuestion()` — pilihan diacak
- Distractors dihasilkan dekat jawaban benar, lalu dishuffle
- Validasi menggunakan value number (`ans === question.ans`) bukan index → ✅

#### Pola Kilat (`MiniGamePolaScreen.tsx`)
- Fisher-Yates shuffle di `generatePattern()` — pilihan diacak
- Distractors dari pool emoji/shapes/numbers, lalu dishuffle
- Validasi menggunakan value string (`ans === question.answer`) → ✅

#### Ingatan Cepat (`MiniGameIngatanScreen.tsx`)
- Fisher-Yates shuffle di `startLevel()` — options diacak dari sequence items
- Opsi hanya berisi item yang ada di sequence (model memori)
- Validasi menggunakan posisi urutan (`playerInput[index] === sequence[index]`) → ✅

#### Adab Cepat (`MiniGameAdabScreen.tsx`)
- Fisher-Yates shuffle di `nextQuestion()` dan `startGame()` — pilihan diacak
- Setiap soal baru diacak ulang
- Validasi menggunakan index asli (`originalIdx === question.bestIndex`) → ✅
- Acceptable answer juga divalidasi (`originalIdx === question.acceptableIndex`) → ✅

### Catatan teknis:
- Semua mini-game menggunakan algoritma Fisher-Yates (bukan `sort(() => Math.random() - 0.5)`)
- Timer tick tidak mengubah urutan pilihan (state disimpan di `shuffledOptions` / `question.options`)
- Tidak ada duplikat pilihan karena menggunakan `Set` untuk mengumpulkan distractors

---

## 6. STATUS QA

| Test Item | Status |
|-----------|--------|
| Icon launcher berubah | ✅ (regenerated all densities) |
| App label "TMT" | ✅ (AndroidManifest + strings.xml) |
| Button Misi Harian tidak overflow | ✅ (flex layout, shrink-0 wrapper) |
| Tidak ada horizontal overflow | ✅ (global box-sizing, max-w-full) |
| Android back: Home double-back | ✅ (toast + exitApp di press ke-2) |
| Android back: Mini-game konfirmasi | ✅ (showExit modal) |
| Android back: Adab penjelasan | ✅ (konfirmasi keluar, bukan skip) |
| Adab Cepat: manual next | ✅ (tombol Lanjut/Lihat Hasil) |
| Timer pause saat hadits/hikmah | ✅ (timerPaused state) |
| Pilihan jawaban random | ✅ (Fisher-Yates di semua mini-game) |
| Tidak ada duplikat pilihan | ✅ (Set-based dedup) |
| Mini-game valid setelah shuffle | ✅ (validasi by value/id bukan index) |

---

## 7. LOKASI APK FINAL

```
release/EduGame.apk                           ← Final APK (disalin)
android/app/build/outputs/apk/debug/app-debug.apk  ← Original debug APK
```

Ukuran: **7.5 MB**

---

## 8. VERSION INFO

| Property | Old | New |
|----------|-----|-----|
| versionCode | 2 | **3** |
| versionName | 1.0.2 | **1.0.3** |
| appId | id.adabquest.game | id.adabquest.game (unchanged) |
| appName (Capacitor) | TMT | TMT (unchanged) |
| app_label (Android) | TMT | TMT (unchanged) |
| @capacitor/app | not installed | **8.1.0** |

---

## 9. KNOWN ISSUES

1. **Icon cache Android**: Beberapa launcher Android menyimpan cache icon. Jika icon belum berubah setelah install ulang, restart HP atau gunakan "clear launcher cache".
2. **Leaderboard**: Saat ini leaderboard bersifat lokal (per-device). Belum ada backend server.
3. **Offline mode**: Semua fitur berjalan offline. Data disimpan di localStorage Capacitor WebView.

---

## 10. CHECKLIST FINAL

- [x] Icon launcher sudah diregenerasi di semua density
- [x] App label TMT di AndroidManifest dan strings.xml
- [x] Button Misi Harian tidak melebihi layar
- [x] Tidak ada horizontal overflow di semua screen
- [x] Android back tidak langsung keluar app
- [x] Home hanya keluar dengan double-back
- [x] Adab Cepat manual next berfungsi
- [x] Timer pause saat hadits/hikmah tampil
- [x] Pilihan jawaban mini-game random
- [x] Tidak ada duplikat pilihan
- [x] Mini-game tetap valid setelah shuffle
- [x] APK baru berhasil dibuat
- [x] EduGame.apk tersedia di release/
- [x] VersionCode dinaikkan (2 → 3)
- [x] VersionName dinaikkan (1.0.2 → 1.0.3)
