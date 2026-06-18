# TMT MINIGAME ARCHITECTURE REPORT

**Date**: 2026-06-17
**Status**: ✅ Complete
**TypeScript**: ✅ Clean

---

## 1. Mini Game Center Structure

### Architecture
```
HomeScreen
  └── "🎮 Lihat Semua Mini Game →"
       └── MiniGameCenter (5 packages)
            └── MiniGamePackageScreen (games per package)
                 └── Individual Mini-Game Screen
                      └── MiniGameResultScreen (reusable)
```

### Screens Created
| Screen | File | Purpose |
|--------|------|---------|
| MiniGameCenter | `screens/MiniGameCenter.tsx` | Hub showing all 5 packages with stats |
| MiniGamePackageScreen | `screens/MiniGamePackageScreen.tsx` | Lists all mini-games in selected package |
| MiniGameResultScreen | `screens/MiniGameResultScreen.tsx` | Reusable result screen for all mini-games |
| MiniGamePlaceholders | `screens/MiniGamePlaceholders.tsx` | "Coming soon" friendly screens for new games |

---

## 2. Package Structure

### 5 Packages

| # | Package ID | Title | Icon | Games | Status |
|---|-----------|-------|------|-------|--------|
| 1 | `fokus-cepat` | Fokus Cepat | ⚡ | 4 | ✅ Active |
| 2 | `adab` | Adab | 💖 | 4 | ✅ Active |
| 3 | `logika` | Logika | 🧠 | 4 | ✅ Active |
| 4 | `spasial` | Spasial | 🔷 | 4 | ✅ Active |
| 5 | `keluarga` | Keluarga | 👨‍👩‍👧 | 4 | ✅ Active |
| **Total** | | | | **20** | |

### Paket Fokus Cepat (4 games)
1. ⚡ Hitung Kilat — ✅ Fully playable (existing)
2. 🧩 Pola Kilat — ✅ Fully playable (existing)
3. 🧠 Ingatan Cepat — ✅ Fully playable (existing)
4. 🔍 Cari yang Berbeda — 🔧 Coming soon (placeholder)

### Paket Adab (4 games)
1. 🌟 Pilih Sikap Terbaik — ✅ Fully playable (existing Adab Cepat)
2. 💬 Nasihat dengan Lembut — 🔧 Coming soon (placeholder)
3. 📋 Urutkan Adab — 🔧 Coming soon (placeholder)
4. ⚖️ Dilema Bijak — 🔧 Coming soon (placeholder)

### Paket Logika (4 games)
1. 🕵️ Detektif Petunjuk — 🔧 Coming soon (placeholder)
2. 📐 Tebak Aturan — 🔧 Coming soon (placeholder)
3. 💡 Pilih Kesimpulan — 🔧 Coming soon (placeholder)
4. ✅ Benar atau Salah — 🔧 Coming soon (placeholder)

### Paket Spasial (4 games)
1. 🔄 Putar Bentuk — 🔧 Coming soon (placeholder)
2. 👤 Cocokkan Bayangan — 🔧 Coming soon (placeholder)
3. 🗺️ Jalur Aman — 🔧 Coming soon (placeholder)
4. 🧩 Susun Puzzle — 🔧 Coming soon (placeholder)

### Paket Keluarga (4 games)
1. 🏡 Misi Keluarga — 🔧 Coming soon (placeholder)
2. ⚔️ Family Challenge — ✅ (links to Battle Screen)
3. 📓 Jurnal Kebaikan — 🔧 Coming soon (placeholder)
4. 🎁 Hadiah Dunia Nyata — ✅ (links to MyRewards)

---

## 3. Data Model

### Types Added (`src/types/index.ts`)

```typescript
MiniGamePackageId      // "fokus-cepat" | "adab" | "logika" | "spasial" | "keluarga"
MiniGamePackage        // Package metadata (title, icon, theme, etc.)
MiniGameDefinition     // Game definition (id, type, supported difficulties, etc.)
MiniGameType           // 19 game types
MiniGameAttempt        // Per-question attempt record
FamilyMission          // Family mission tracking
GoodnessJournalEntry   // Goodness journal entry
```

### MiniGameSession (enhanced)
Added optional fields for backward compatibility:
- `gameId`, `packageId`, `wrongCount`, `totalQuestions`
- `startedAt`, `finishedAt`, `resultStatus`

### Data File
`src/data/minigame-definitions.ts`:
- `MINI_GAME_PACKAGES` — 5 package definitions
- `MINI_GAMES` — 20 game definitions
- Helper functions for lookups

---

## 4. MiniGameEngine

### Location
`src/lib/minigame-engine.ts`

### Capabilities
- Session lifecycle: `startGame()` → `recordAttempt()` → `endGame()`
- Scoring: standard mode + tiered mode (adab)
- Per-question attempt tracking
- Personal best detection
- Leaderboard integration ready

### Scoring System

**Standard (cognitive games):**
- Base: 100 points
- Speed bonus: up to 50 (faster = more)
- Difficulty bonus: 10
- Streak bonus: 5/streak
- Wisdom bonus: 30

**Tiered (adab games):**
- Best answer: 150 (100 + 50 wisdom)
- Acceptable: 75
- Weak: 30
- Wrong: 0
- Speed bonus reduced to 20 max

**Family mode:**
- Progress/completion focused
- Cooperative scoring
- Family bonus: 20

---

## 5. Random Choices System

All mini-game choices use Fisher-Yates shuffle via `src/lib/utils.ts`:
- `shuffleArray()` — proper random permutation
- `createShuffledChoices()` — wrapper for mission options
- `validateChoices()` — integrity check
- `ensureUniqueChoices()` — dedup

Rules enforced:
- Shuffle only on question generation
- No re-shuffle on re-render/timer
- ID-based validation (not position)
- No duplicate choices
- Correct answer always present

---

## 6. Result Screen (Reusable)

`src/screens/MiniGameResultScreen.tsx`

Shows:
- Game title, icon, difficulty
- Score, correct count, accuracy
- Average response time, max stage
- Leaderboard rank (if applicable)
- New personal best badge
- Play again / leaderboard / back buttons

---

## 7. Integration

### HomeScreen
- Quick-access tiles for 4 core mini-games
- "🎮 Lihat Semua Mini Game →" button → MiniGameCenter

### Statistics
- Per-package mini-game stats
- Sessions count, best scores
- Unique games played

### Parent Dashboard
- Mini-game history viewable
- Recommendations ready
- Family missions tracking

### Android Back Button
- MiniGameCenter → Home
- MiniGamePackage → MiniGameCenter
- Gameplay → confirm exit
- Feedback → don't exit immediately
- Result → package or play again

---

## 8. Placeholder Strategy

All 16 new mini-games have:
- Proper type definitions
- Screen routes wired in GameAppStandalone
- Friendly "coming soon" placeholder screens
- No crash, no broken UI, no error
- Ready to receive gameplay renderers

---

## 9. Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | Added MiniGamePackageId, MiniGamePackage, MiniGameDefinition, MiniGameType, MiniGameAttempt, FamilyMission, GoodnessJournalEntry. Extended ScreenId with 16 new routes. Enhanced MiniGameSession. |
| `src/data/minigame-definitions.ts` | **NEW**: 5 packages + 20 game definitions |
| `src/lib/minigame-engine.ts` | **NEW**: Reusable engine with scoring |
| `src/screens/MiniGameCenter.tsx` | **NEW**: Hub screen with 5 packages |
| `src/screens/MiniGamePackageScreen.tsx` | **NEW**: Game list per package |
| `src/screens/MiniGameResultScreen.tsx` | **NEW**: Reusable result screen |
| `src/screens/MiniGamePlaceholders.tsx` | **NEW**: 16 "coming soon" friendly screens |
| `src/screens/HomeScreen.tsx` | Added "Lihat Semua" button |
| `src/GameAppStandalone.tsx` | Wired all new routes |

---

## 10. Known Issues

- **16 new mini-games** are placeholders — gameplay renderers to be built in future stage.
- **Family missions** require parent interface which exists but needs connection to this new package structure.
- **Jurnal Kebaikan** needs text input support (not yet built).
- **MiniGameEngine** is not yet integrated into existing mini-game screens (Hitung, Pola, Ingatan, Adab) — they use their own session creation logic. This can be refactored incrementally.

---

## 11. Recommendation

The architecture is now scalable:
- New mini-games can be added by: (1) adding to `MINI_GAMES` array, (2) creating a renderer screen, (3) wiring in `GameAppStandalone.tsx`
- The engine provides common session/score/leaderboard logic
- The result screen is reusable across all games
- The placeholder system ensures no game shows broken UI

**Ready for gameplay implementation of individual mini-games in next stage.**
