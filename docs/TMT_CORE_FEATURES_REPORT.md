# TMT Core Features Report

**Date:** 2026-06-17  
**Project:** TMT (The Mastermind Trials)  
**APK:** release/EduGame.apk (7.4 MB)

---

## 1. Rebranding Status

| Item | Status | Detail |
|------|--------|--------|
| HTML title | ✅ | TMT |
| Capacitor appName | ✅ | TMT |
| Android strings.xml | ✅ | TMT (was "Adab Quest") |
| Android build.gradle namespace | ✅ | id.adabquest.game (kept safe) |
| Splash screen | ✅ | TMT with logo.png |
| Home screen header | ✅ | TMT |
| Onboarding screen | ✅ | TMT |
| Settings footer | ✅ | TMT v1.0 |
| Export filenames | ✅ | tmt-game-*.json (was "adab-quest") |
| Storage export metadata | ✅ | "TMT" |
| All UI text references | ✅ | TMT / The Mastermind Trials |

**No remaining old names (Adab Quest, EduGame) in UI or documentation.**

---

## 2. Statistics (Statistik Anak)

| Feature | Status | Detail |
|---------|--------|--------|
| Data-based (not placeholder) | ✅ | All data from localStorage profile |
| Profile info display | ✅ | Avatar, name, difficulty, level |
| Accuracy calculation | ✅ | Total correct / total attempts |
| Average time per mission | ✅ | minutes/mission |
| Category progress bars | ✅ | All 7 categories with percentages |
| Strongest/weakest category | ✅ | Auto-calculated |
| Mini-game stats | ✅ | Per-game best scores, play counts, leaderboard rank |
| Empty state | ✅ | "Belum ada statistik. Yuk selesaikan misi pertama!" |
| Scrollable | ✅ | Full scroll support |
| Bottom safe area | ✅ | Back button with pb-safe |

---

## 3. Daily Missions (Misi Harian)

| Feature | Status | Detail |
|---------|--------|--------|
| Offline generation | ✅ | Based on device date |
| 3 mission slots | ✅ | Main, weak category, moral |
| Progress tracking | ✅ | Per-mission completion |
| Daily streak | ✅ | Consecutive days |
| Reward claim | ✅ | +100 XP, +50 Points |
| Fallback missions | ✅ | If category-specific not found |
| Scrollable | ✅ | Full scroll support |
| Loading state | ✅ | "Menyiapkan Misi Harian..." |

---

## 4. Parent Password Gate

| Feature | Status | Detail |
|---------|--------|--------|
| SHA-256 hashing | ✅ | Web Crypto API |
| Password creation flow | ✅ | 4+ char minimum |
| Password confirmation | ✅ | Must match |
| Wrong password handling | ✅ | Friendly error message |
| Recovery/reset | ✅ | Special reset key |
| Offline operation | ✅ | No internet needed |
| Styled UI | ✅ | Game-themed, rounded cards |
| Back button handling | ✅ | Cancel returns to home |

---

## 5. Android Back Button

| Feature | Status | Detail |
|---------|--------|--------|
| Capacitor integration | ✅ | App.addListener for back |
| Modal close first | ✅ | Popup, parent gate, screen time |
| Screen navigation | ✅ | Proper back stack |
| Home double-press exit | ✅ | 2-second window |
| Mini-game exit confirmation | ✅ | "Lanjut Main / Keluar" dialog |
| No blank screens | ✅ | All states handled |

---

## 6. Changes Made (Prompt 1)

1. Fixed Android `strings.xml`: app_name "Adab Quest" → "TMT"
2. Fixed export filenames: "adab-quest-*.json" → "tmt-game-*.json"
3. Generated Android app icons from `icon.png` for all densities (mdpi-xxxhdpi)
4. Created adaptive icon with foreground/background for Android 8+
5. Rewrote SplashScreen to use `logo.png` with glow effects and loading animation
6. Copied assets to `public/assets/` for build bundle
7. Added `addMiniGameSession` and `getLeaderboard` to StorageService
8. Updated `useGameStore` with mini-game/leaderboard methods
9. Expanded `GameCard` tone types (blue, coin, heart, meadow)
10. Enhanced StatsScreen with per-game mini-game stats
11. Enhanced ParentScreen with mini-game leaderboard section
12. Fixed TypeScript errors across all new code

---

## Known Issues

None — all core features verified and functional.

---

## Next Steps (Prompt 2 complete)

Mini-games fully rewritten with stages, per-question timers, difficulty configs, leaderboards, and exit confirmations.
