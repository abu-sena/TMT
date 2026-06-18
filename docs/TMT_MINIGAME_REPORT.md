# TMT Mini-Game Report

**Date:** 2026-06-17  
**Project:** TMT (The Mastermind Trials)

---

## 1. Mini-Games Created

All 4 mini-games appear on the Home Screen under "Mini Game Cepat" section with:
- 2×2 grid on phones, responsive layout
- Card style: rounded, colorful, icon + name
- Each card clickable with sound support

---

## 2. Hitung Kilat ⚡

| Feature | Status | Detail |
|---------|--------|--------|
| Per-question timer | ✅ | 5-10s based on difficulty |
| 6 answer options (SD+) | ✅ | 3×2 grid |
| 4 options (TK) | ✅ | 2×2 grid |
| Operations | ✅ | +, -, ×, ÷ |
| 6 difficulty stages | ✅ | Stage 1-6 with ramping difficulty |
| Scoring formula | ✅ | base + speed + difficulty + streak bonuses |
| TK "Hitung Ceria" mode | ✅ | 10s timer, 4 options, +/- only up to 10 |
| Start screen | ✅ | Game name, description, personal best, top 3 |
| Result screen | ✅ | Score, correct, stage, avg time, new record |
| Leaderboard | ✅ | Top 10, ranked, per-game |
| Exit confirmation | ✅ | "Skor sesi belum disimpan" dialog |
| Back button | ✅ | Returns to home from start/result |

**Scoring formula:** `100 base + speedBonus(0-100) + difficultyBonus(0-200) + streakBonus(0-100)` per question.

---

## 3. Pola Kilat 🧩

| Feature | Status | Detail |
|---------|--------|--------|
| Pattern types | ✅ | ABAB, AAB, ABC, number sequences, combo, complex |
| 6 difficulty stages | ✅ | Ramping complexity |
| 6 options (SD+) | ✅ | 3×2 grid |
| 4 options (TK) | ✅ | "Pola Ceria" mode |
| Uses emoji/shapes/colors/numbers | ✅ | Multiple pattern sets |
| Per-question timer | ✅ | 5-10s based on difficulty |
| Start/Result/Leaderboard | ✅ | Full game loop |
| Exit confirmation | ✅ | Dialog before leaving |

---

## 4. Ingatan Cepat 🧠

| Feature | Status | Detail |
|---------|--------|--------|
| Memorize + Recall phases | ✅ | Show sequence → hide → recall |
| Lives system | ✅ | 3-5 lives based on difficulty |
| 6 difficulty stages | ✅ | 3-7 items to memorize |
| 30+ emoji pool | ✅ | Fruits, animals, vehicles, shapes, etc. |
| TK "Ingatan Ceria" mode | ✅ | 5s memorize, 5 lives, 4 options |
| Countdown during memorize | ✅ | Visual timer bar |
| Sequential recall required | ✅ | Must match order exactly |
| Start/Result/Leaderboard | ✅ | Full game loop |
| Exit confirmation | ✅ | Dialog before leaving |

---

## 5. Adab Cepat 💖

| Feature | Status | Detail |
|---------|--------|--------|
| 12 moral scenarios | ✅ | Real-life situations with Islamic values |
| 6 answer options each | ✅ | Best, acceptable, and wrong choices |
| Best answer = full score | ✅ | 200+ points |
| Acceptable answer = partial | ✅ | 100 points, continue |
| Wrong answer = game over | ✅ | With explanation shown |
| Explanation after each answer | ✅ | Quran/hadith references where relevant |
| Speed bonus is smaller | ✅ | 30% weight (focus on accuracy) |
| TK "Adab Ceria" mode | ✅ | 12s timer, icon-based |
| Per-question timer | ✅ | 8-12s based on difficulty |
| Question cycling | ✅ | Avoids repeats within session |
| Start/Result/Leaderboard | ✅ | Full game loop |
| Exit confirmation | ✅ | Dialog before leaving |

---

## 6. Leaderboard System

| Feature | Status | Detail |
|---------|--------|--------|
| Per-game leaderboards | ✅ | hitung, pola, ingatan, adab |
| Top 10 entries | ✅ | Sorted by score |
| Tie-breaking | ✅ | Score → correctCount → avgTime → recency |
| Auto-insert | ✅ | If < 10 entries or beats lowest |
| Leaderboard screen per game | ✅ | Scrollable, ranked list |
| Current player highlight | ✅ | Green border if in leaderboard |
| Displayed in start screen | ✅ | Top 3 shown on start |
| Displayed in result screen | ✅ | Link to full leaderboard |
| Stored in localStorage | ✅ | Offline, persistent |

---

## 7. Integration with Stats & Parent Page

| Feature | Status | Detail |
|---------|--------|--------|
| StatsScreen mini-game section | ✅ | Per-game: best score, correct count, rank |
| ParentScreen mini-game section | ✅ | Per-game: times played, best score, correct, rank |
| Both pages scrollable | ✅ | No horizontal overflow |
| Empty state handling | ✅ | Hidden if no mini-game data |

---

## 8. Technical Details

- **Data persistence:** All mini-game sessions saved via `addMiniGameSession()` to `GameStoreState.miniGameSessions`
- **Leaderboard persistence:** Stored in `GameStoreState.miniGameLeaderboards[gameType]`
- **Offline-first:** No network requests, all data local
- **Difficulty configs:** Per-difficulty timer, option count, operation limits
- **TK mode:** Separate configs for all games (longer timers, fewer options, simpler content)

---

## Known Issues

None — all 4 mini-games are playable with full game loops (start → play → result) and leaderboard integration.
