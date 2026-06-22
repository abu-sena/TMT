# TMT — Splash, Replay Reward, & Difficulty Progression Fix Report

**Date:** 2026-06-21  
**Version:** 1.0.7 (versionCode 7)  
**APK:** `release/EduGame.apk` (12.1 MB)

---

## 1. SPLASH SCREEN — HANYA LOGO TMT

### Masalah
Saat aplikasi dibuka, splash screen pertama yang terlihat adalah 📜 (plain text fallback) sebelum splash logo TMT muncul. Ini terjadi di dua tempat:
- `index.html` menampilkan `📜` + "TMT" sebagai preloader sebelum JS/React boot
- `src/routes/index.tsx` menampilkan `📜` saat storage belum hydrated

### Perbaikan
1. **`index.html`** — Diganti total: sekarang menampilkan TMT dark gradient background (#0A1628), logo.png TMT, subtitle "Petualangan Ilmu & Akhlak", dan loading dots dengan animasi pulsing yang stylish.
2. **`src/routes/index.tsx`** — Fallback hydration (`!hydrated`) sekarang menampilkan `<SplashScreen />` component penuh, bukan lagi div `📜`.
3. **`src/GameAppStandalone.tsx`** — Sudah benar sejak awal: `isBooting` state menampilkan `<SplashScreen />` sampai storage hydrated dan min splash time terpenuhi.
4. **Android `styles.xml`** — Background splash di-set ke `#0A1628` (TMT dark blue), memakai `Theme.SplashScreen` API (Android 12+).
5. **Android `drawable/splash.png`** — Semua varian (port/land, semua density) sekarang berisi TMT logo (580KB), menggantikan splash 4KB lama.
6. **`ic_launcher_background.xml`** — Background color diganti dari putih `#FFFFFF` ke TMT dark `#0A1628`.

### Hasil QA
✅ Fresh install: splash pertama yang terlihat adalah TMT logo  
✅ Tidak ada layar putih/hitam/default sebelumnya  
✅ Tidak ada Home/Onboarding muncul sekilas sebelum splash  
✅ Tutup paksa lalu buka lagi: tetap splash TMT yang pertama  
✅ Background gelap (#0A1628) konsisten dari native splash → HTML preloader → React splash  

---

## 2. POIN/EXP MISI REPLAY HANYA 1/4

### Masalah
Sistem reward tidak membedakan antara first completion dan replay. User bisa replay misi yang sama berkali-kali dan mendapat reward penuh.

### Perbaikan
1. **`MissionProgress` type** — Ditambahkan field:
   - `completedCount: number` — berapa kali misi ini diselesaikan (stars > 0)
   - `firstCompletedAt: number` — timestamp penyelesaian pertama

2. **`src/routes/index.tsx`** (SSR entry) — `handleFinishMission`:
   - Deteksi `completedCount === 0` → **first completion** (multiplier 1.0)
   - Deteksi `completedCount >= 1` → **replay** (multiplier 0.25)
   - Poin: `Math.floor(score.finalPoint * rewardMultiplier)`
   - XP: `Math.floor(score.xpGain * rewardMultiplier)` (minimal 1 jika result.isCorrect)
   - Koin: `Math.floor(baseCoins * rewardMultiplier)`

3. **`src/GameAppStandalone.tsx`** (Capacitor entry) — Logika sama seperti di atas.

4. **Reward box stage** — Hanya muncul untuk first completion (`isFirstCompletion && !claimedStageRewardIds.includes(id)`).

5. **`completedCount`** dan `firstCompletedAt` disimpan ke `missionProgress` setiap kali misi selesai.

### Contoh
| Misi | First (Poin/XP) | Replay (Poin/XP) |
|------|-----------------|-------------------|
| Stage 1 | 40 poin, 20 XP | 10 poin, 5 XP |
| Stage 50 | 80 poin, 40 XP | 20 poin, 10 XP |
| Boss | 120 poin, 60 XP | 30 poin, 15 XP |

---

## 3. STAGE 500 — UNLOCK DIFFICULTY

### Mekanisme
Saat user menyelesaikan stage ke-500 pada difficulty aktif:
1. **Deteksi** — `isFinalStage(activeMission.number)` dipanggil setelah misi selesai
2. **Pending reward** — `markFinalRewardPending()` menandai reward belum diklaim
3. **Box hadiah** — `DifficultyCompletionBox` muncul di result screen
4. **User tap box** → reward diklaim → difficulty berikutnya terbuka
5. **Modal** — User pilih **Naik Sekarang** atau **Nanti Dulu**

### Difficulty Order
| Level | Reward EXP | Lencana | Next |
|-------|-----------|---------|------|
| TK | 1.000 | TK Complete | SD Bawah |
| SD Bawah | 1.500 | SD Bawah Complete | SD Atas |
| SD Atas | 2.000 | SD Atas Complete | SMP |
| SMP | 2.500 | SMP Complete | SMA |
| SMA | 3.000 | SMA Complete | Universitas |
| Universitas | 5.000 | Universitas Complete + The True Mastermind | — (Final) |

### Perbaikan Kode
- **`src/routes/index.tsx`** — Full Stage 500 flow ditambahkan:
  - Import semua komponen: `DifficultyCompletionBox`, `DifficultyUnlockModal`, `MasteryCompleteModal`
  - Semua handler: `handleCompletionBoxClaim`, `handleUnlockNow`, `handleUnlockLater`, `handleMasteryViewBadges`, `handleMasteryBackToMap`
  - State management: `completionBoxOpen`, `unlockModalOpen`, `masteryModalOpen`, `pendingCompletion`
  - HomeScreen pass: `onOpenPendingBox`, `onHomeUpgrade`

- **`src/GameAppStandalone.tsx`** — Sudah memiliki full flow (dari commit sebelumnya), ditambahkan replay reward 1/4

- **`src/lib/progress.ts`** — Semua helper sudah ada:
  - `isFinalStage()`, `getNextDifficulty()`, `getDifficultyCompletionRewardDef()`
  - `hasClaimedDifficultyCompletionReward()`, `markFinalRewardPending()`
  - `claimDifficultyCompletionReward()`, `unlockNextDifficulty()`
  - `hasAnyPendingFinalRewards()`, `getPendingFinalRewardDifficulty()`

---

## 4. ANTI-DOUBLE REWARD

### Mekanisme Anti-Double
- **Reward stage biasa**: Key = `profileId + difficulty + stageId`. `claimedStageRewardIds[]` array mencegah klaim ulang.
- **Reward completion difficulty**: Key = `profileId + difficulty + "completion-500"`. `claimedFinalRewardsByDifficulty` record mencegah klaim ulang.
- Reward box tidak bisa dibuka lagi setelah diklaim.
- Tap berkali-kali aman: `hasClaimedDiff...` check di awal handler.
- Close/reopen app tidak menggandakan: state tersimpan di localStorage.

---

## 5. HOME SCREEN INTEGRATION

### Card yang muncul:
1. **Pending Reward Box** — Jika `pendingFinalRewardDifficulty !== null`: tampilkan card "Hadiah Akhir Level Menunggu" + tombol "Buka Hadiah"
2. **Difficulty Upgrade** — Jika `difficultyUpgradeAvailable === true`: tampilkan card "Level Baru Terbuka" + tombol "Naik Tingkat"

---

## 6. DATA MIGRATION

### Migration v6
- Menambahkan `completedCount` dan `firstCompletedAt` ke semua `missionProgress` entries
- Default: jika stars > 0 → completedCount = 1, firstCompletedAt = completedAt
- Jika stars = 0 → completedCount = 0, firstCompletedAt = 0
- Safe migration: backup diambil sebelum migration

---

## 7. VALIDATION SCRIPT

Script: `scripts/validate-splash-reward-progression.ts`

**Result: 70/70 checks passed, 0 errors, 0 warnings** ✅

Cakupan validasi:
- Splash screen (14 checks)
- Replay reward (14 checks)
- Difficulty progression (22 checks)
- Migration (5 checks)
- APK build (3 checks)
- Bonus misc (12 checks)

---

## 8. APK BUILD

| Item | Value |
|------|-------|
| Version Code | 7 |
| Version Name | 1.0.7 |
| Build Type | Debug |
| APK Size | 12.1 MB |
| Location | `release/EduGame.apk` |
| Build Command | `npm run build:spa && npx cap sync android && cd android && ./gradlew clean assembleDebug` |

---

## 9. KNOWN ISSUES

1. **Pre-existing TypeScript errors**: `bossMissions.ts` dan `expandedMissions.ts` memiliki missing `challengeType` property — ini pre-existing, tidak terkait dengan perubahan ini.
2. **Release signing**: Menggunakan debug APK karena release signing belum dikonfigurasi. Debug APK tetap bisa diinstall di device.
3. **Splash icon cache**: Jika user sudah pernah install versi lama, icon/splash lama mungkin masih tercache. Uninstall dulu versi lama sebelum install baru untuk melihat perubahan splash.

---

## 10. INSTALLATION NOTES

1. Uninstall versi TMT sebelumnya dari device
2. Install `release/EduGame.apk`
3. Buka aplikasi — splash TMT logo harus langsung terlihat
4. Mainkan misi baru, catat reward penuh
5. Replay misi yang sama — reward harus 1/4
6. Simulasikan stage 500 untuk menguji difficulty progression

---

**Status:** ✅ ALL CHECKS PASSED — READY FOR QA
