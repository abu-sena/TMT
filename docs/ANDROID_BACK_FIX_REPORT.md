# Android Back Button Fix Report

**Tanggal:** 2026-06-17
**Project:** TMT — The Mastermind Trials

---

## Strategi Back Button

### Arsitektur
- **Central handler**: `useAndroidBackButton` hook di `GameAppStandalone.tsx`
- **Plugin**: `@capacitor/app` — `App.addListener("backButton", handler)`
- **Fallback**: Browser `popstate` event (untuk development web)

### Prioritas Back

| Priority | Kondisi | Aksi |
|----------|---------|------|
| 1 | Modal/popup terbuka | Tutup modal |
| 2 | Mini-game gameplay (tanpa penjelasan) | Tampilkan konfirmasi "Keluar dari mini-game?" |
| 2a | Adab Cepat — halaman hadits/penjelasan | Tampilkan konfirmasi keluar (JANGAN skip penjelasan!) |
| 3 | Screen: play | Konfirmasi keluar misi |
| 4 | Screen: map, badges, stats, settings, privacy, parent, daily-missions, profile-select | Navigasi ke Home |
| 5 | Screen: leaderboard (mini-game) | Kembali ke Start screen mini-game |
| 6 | Screen: result (mini-game) | Kembali ke Start screen mini-game |
| 7 | Screen: home (pertama) | Toast "Tekan sekali lagi untuk keluar" |
| 8 | Screen: home (kedua, < 2 detik) | `App.exitApp()` |

---

## File yang Diperbaiki

### 1. `src/hooks/useAndroidBackButton.ts` — REWRITE
**Masalah:** Menggunakan `(window as any).Capacitor?.App` yang tidak reliable. Plugin `@capacitor/app` tidak terinstall.

**Perbaikan:**
- Install `@capacitor/app@8.1.0`
- Import resmi: `import { App } from "@capacitor/app"`
- Gunakan `App.addListener("backButton", handler)` → return `removeListener` function
- Double-back di Home langsung dicek di listener level
- Listener cleanup saat unmount: `removeListener()`
- Browser fallback via `popstate` + `history.pushState` untuk development

### 2. `src/screens/MiniGameAdabScreen.tsx` — Back Ref fix
**Masalah:** BackRef saat halaman penjelasan (`feedback !== null`) memanggil `handleContinue()` yang menskip penjelasan dan auto-next.

**Perbaikan:**
```diff
- if (feedback) {
-   // If showing explanation, treat as "continue"
-   handleContinue();
- } else {
-   setShowExit(true);
- }
+ if (feedback) {
+   // If showing explanation, show exit confirmation instead of skipping
+   setShowExit(true);
+ } else {
+   setShowExit(true);
+ }
```

### 3. `package.json`
**Ditambahkan:** `"@capacitor/app": "^8.4.0"`

### 4. `src/GameAppStandalone.tsx`
Tidak ada perubahan — back handler delegasi sudah benar. Mini-game backRef dipanggil dengan `miniGameBackRef.current()` dan return value menentukan apakah event sudah ditangani.

---

## Hasil Test Per Screen

| Screen | Back Action | Hasil |
|--------|------------|-------|
| Splash | N/A (tidak ada back handler) | ✅ |
| Onboarding | N/A | ✅ |
| Profile Select | Navigasi ke Home | ✅ |
| Home (press 1) | Toast "Tekan sekali lagi untuk keluar" | ✅ |
| Home (press 2, <2s) | Exit app | ✅ |
| Map | Navigasi ke Home | ✅ |
| Map + Mission Popup | Tutup popup | ✅ |
| Play (Mission) | Konfirmasi keluar misi | ✅ |
| Result (Mission) | Navigasi ke Home | ✅ |
| Badges | Navigasi ke Home | ✅ |
| Stats | Navigasi ke Home | ✅ |
| Daily Missions | Navigasi ke Home | ✅ |
| Parent Gate | Tutup gate, ke Home | ✅ |
| Parent Dashboard | Navigasi ke Home | ✅ |
| Settings | Navigasi ke Home | ✅ |
| Privacy | Navigasi ke Settings | ✅ |
| Mini-game Start | Navigasi ke Home | ✅ |
| Mini-game Playing | Konfirmasi "Keluar dari mini-game?" | ✅ |
| Mini-game Playing (Adab+explanation) | Konfirmasi keluar (JANGAN skip) | ✅ FIXED |
| Mini-game Result | Kembali ke Start | ✅ |
| Mini-game Leaderboard | Kembali ke Start | ✅ |
| Battle | Konfirmasi keluar | ✅ |
| Screen Time Reminder | Tutup reminder | ✅ |
