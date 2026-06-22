# TMT — APK Build Report

**Date:** 2026-06-21  
**Build:** 1.0.7 (versionCode 7)

---

## 1. PERBAIKAN YANG SUDAH SELESAI

### A. Splash Screen — Hanya Logo TMT
- ✅ `index.html` preloader diganti dengan TMT splash (dark gradient + logo + loading dots)
- ✅ `routes/index.tsx` hydration fallback menggunakan `<SplashScreen />` (bukan 📜)
- ✅ Android native splash background di-set ke `#0A1628` (TMT dark theme)
- ✅ Semua Android drawable splash (port/land, semua density) berisi TMT logo (580KB)
- ✅ `ic_launcher_background` diganti dari putih ke TMT dark `#0A1628`

### B. Replay Reward 1/4
- ✅ `MissionProgress` ditambahkan field `completedCount` dan `firstCompletedAt`
- ✅ First completion: reward penuh (multiplier 1.0)
- ✅ Replay: reward 1/4 (multiplier 0.25), dengan `Math.floor()`
- ✅ Berlaku untuk: poin, XP, koin
- ✅ Reward box stage hanya muncul untuk first completion

### C. Stage 500 — Unlock Difficulty
- ✅ Stage 500 → trigger difficulty completion
- ✅ DifficultyCompletionBox muncul setelah result screen
- ✅ 6 difficulty completion rewards (TK 1K → Universitas 5K EXP)
- ✅ Lencana completion untuk semua difficulty
- ✅ DifficultyUnlockModal dengan pilihan "Naik Sekarang" / "Nanti Dulu"
- ✅ MasteryCompleteModal untuk Universitas (final difficulty)
- ✅ HomeScreen: card "Hadiah Akhir Level Menunggu" + "Naik Tingkat"
- ✅ Data migration v6: backward-compatible dengan data lama

### D. Anti-Double Reward
- ✅ claimedStageRewardIds mencegah double claim stage reward
- ✅ claimedFinalRewardsByDifficulty mencegah double claim completion reward
- ✅ Tap berkali-kali aman
- ✅ Close/reopen app tidak menggandakan

---

## 2. QA YANG LULUS

### Splash Screen
- ✅ Fresh install: splash pertama yang terlihat adalah TMT logo
- ✅ Tidak ada layar putih/hitam/default sebelum splash TMT
- ✅ Tidak ada Home/Onboarding sekilas sebelum splash
- ✅ Tutup paksa lalu buka: tetap splash TMT yang pertama

### Replay Reward
- ✅ First completion: reward penuh
- ✅ Replay: reward 1/4
- ✅ Replay lagi: tetap 1/4
- ✅ Reward box hanya sekali
- ✅ EXP/poin tidak double

### Stage 500 / Difficulty Progression
- ✅ Stage 500 TK → box hadiah → 1,000 EXP → SD Bawah terbuka
- ✅ Stage 500 SMP → box hadiah → 2,500 EXP → SMA terbuka
- ✅ Stage 500 Universitas → box hadiah → 5,000 EXP → Mastery Complete

### Validation Script
- ✅ 70/70 checks passed, 0 errors, 0 warnings

---

## 3. VERSION INFO

| Field | Value |
|-------|-------|
| Version Code | 7 |
| Version Name | 1.0.7 |
| Package ID | id.adabquest.game |
| App Label | TMT |
| Build Type | Debug |
| Target SDK | Android 7.0+ |

---

## 4. APK LOCATION

```
release/EduGame.apk
```

**Size:** 12.1 MB  
**Build timestamp:** 2026-06-21

Source build output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 5. INSTALL NOTES

1. **Uninstall versi lama dulu** — icon/splash cache bisa bertahan dari versi lama
2. **Install** `release/EduGame.apk`
3. **Allow install from unknown sources** jika diminta
4. Buka aplikasi — splash TMT logo harus langsung terlihat

### Jika splash lama masih muncul:
- Clear app cache di Settings → Apps → TMT → Storage → Clear Cache
- Restart device
- Uninstall → reinstall

---

## 6. KNOWN ISSUES

1. **Debug signing**: APK menggunakan debug keystore. Untuk Play Store, perlu release signing.
2. **Pre-existing TS errors**: `bossMissions.ts` dan `expandedMissions.ts` memiliki missing `challengeType` — tidak mempengaruhi runtime.
3. **Chunk size warning**: Vite warning tentang chunk >500KB — tidak mempengaruhi fungsionalitas.

---

## 7. BUILD COMMANDS

```bash
# Build SPA
npm run build:spa

# Sync web assets to Android
npx cap sync android

# Clean & build APK
cd android
./gradlew clean
./gradlew assembleDebug

# Copy to release folder
cp app/build/outputs/apk/debug/app-debug.apk ../release/EduGame.apk
```

---

**Status:** ✅ BUILD SUCCESSFUL — APK READY
