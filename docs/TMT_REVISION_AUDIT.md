# TMT Revision Audit Report

**Date:** 2026-06-17  
**Project:** TMT (The Mastermind Trials)  
**Target:** Android EduGame APK  

---

## 1. Status Rebranding

| Area | Status | Notes |
|------|--------|-------|
| `index.html` title | ✅ TMT | Already updated |
| `capacitor.config.json` appName | ✅ TMT | Already updated |
| `package.json` name | ✅ tmt_game | Already updated |
| HomeScreen header | ✅ TMT | Already updated |
| OnboardingScreen | ✅ TMT | Already updated |
| SplashScreen | ✅ TMT | Already updated but needs logo.png |
| SettingsScreen footer | ✅ TMT v1.0 | Already updated |
| **Android strings.xml** | ❌ | Still "Adab Quest" |
| **Android build.gradle** | ❌ | namespace "id.adabquest.game" |
| **Export filenames** | ❌ | Still "adab-quest-*.json" |
| **Storage export** | ✅ TMT | Already updated |
| Capacitor appId | ⚠️ | "id.adabquest.game" — risky to change, keeping |

## 2. Status Statistk

| Feature | Status | Notes |
|---------|--------|-------|
| Basic stats display | ✅ | Working with real data |
| Category progress | ✅ | Working |
| Empty state | ✅ | "Belum ada statistik" |
| Mini-game stats | ⚠️ | Basic — needs expansion |
| Scroll | ✅ | Scrollable |
| Accuracy | ✅ | Calculated |
| Average time | ✅ | Working |
| Strongest/weakest category | ✅ | Working |
| Leaderboard integration | ❌ | Not yet |

## 3. Status Misi Harian

| Feature | Status | Notes |
|---------|--------|-------|
| Daily generation | ✅ | Offline, date-based |
| 3 mission slots | ✅ | Main, weak, moral |
| Progress tracking | ✅ | Working |
| Reward claim | ✅ | XP + points |
| Streak | ✅ | Working |
| Empty state | ✅ | Loading state |
| TK-specific | ⚠️ | Needs shorter missions |
| Fallback | ⚠️ | Basic, needs improvement |
| Scroll | ✅ | Scrollable |

## 4. Status Halaman Orang Tua

| Feature | Status | Notes |
|---------|--------|-------|
| Password gate | ✅ | SHA-256 hashing |
| Password creation | ✅ | Working |
| Password validation | ✅ | Working |
| Recovery | ✅ | Reset key |
| Profile summary | ✅ | Working |
| Category progress | ✅ | Working |
| Insights | ✅ | Working |
| Export | ✅ | Working |
| Screen time | ⚠️ | Basic |
| Mini-game leaderboard | ❌ | Not integrated |
| Scroll | ✅ | Scrollable |

## 5. Status Mini-Games

| Game | Start Screen | Gameplay | Result | Leaderboard | TK Mode |
|------|-------------|----------|--------|-------------|---------|
| Hitung Kilat | ✅ Basic | ⚠️ Simple | ✅ Basic | ❌ | ❌ |
| Pola Kilat | ✅ Basic | ⚠️ Simple | ✅ Basic | ❌ | ❌ |
| Ingatan Cepat | ✅ Basic | ⚠️ Simple | ✅ Basic | ❌ | ❌ |
| Adab Cepat | ✅ Basic | ⚠️ Simple | ✅ Basic | ❌ | ❌ |

## 6. Issues

### Critical
- ❌ Android app_name still "Adab Quest" in strings.xml
- ❌ Export filenames still reference "adab-quest"
- ❌ Splash screen doesn't use logo.png asset
- ❌ App icon still default Capacitor icon

### High
- ⚠️ Mini-game per-question timer missing (using global timer)
- ⚠️ No 6-option grid for Hitung Kilat
- ⚠️ No difficulty-based adjustments for mini-games
- ⚠️ No leaderboard system
- ⚠️ No exit confirmation during mini-game play

### Medium
- ⚠️ Mini-game scoring formula too simple
- ⚠️ No stage system in mini-games
- ⚠️ TK-specific mini-game modes missing
- ⚠️ Parent page doesn't show mini-game stats

## 7. Renacana Perbaikan

### Prompt 1 — Rebranding & Core Features
1. Fix Android strings.xml app_name → "TMT"
2. Fix export filenames → "tmt-game"
3. Update SplashScreen with logo.png
4. Generate app icon from icon.png

### Prompt 2 — Mini-Games Enhancement
1. Rebuild Hitung Kilat with stages, 6 options, per-question timer
2. Rebuild Pola Kilat with stages
3. Rebuild Ingatan Cepat with improvements
4. Rebuild Adab Cepat with moral scenarios
5. Add leaderboard system (top 10 per game)
6. Add difficulty-based adjustments
7. Add exit confirmation dialog
8. Integrate mini-game stats into Stats page
9. Integrate mini-game data into Parent page

### Prompt 3 — Final Polish & APK Build
1. Generate app icon for all densities
2. Final splash screen with logo.png
3. QA all features
4. Build EduGame.apk
