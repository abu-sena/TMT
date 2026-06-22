# TMT FLAT MINIGAME & BATTLE LIST — IMPLEMENTATION REPORT

**Date:** 2026-06-21  
**Project:** TMT — The Mastermind Trials  
**Feature:** Mini-Game & Battle Flat List — No Category Menu

---

## 1. Ringkasan Perubahan

Navigasi Mini-Game dan Battle diubah dari **kategori bertingkat** menjadi **list game langsung**.

| Sebelum | Sesudah |
|---|---|
| MiniGameCenter → 5 kategori → game | MiniGameCenter → 16 game langsung |
| Battle → 5 kategori → game | Battle → Pilih Game → List 12+1 game |
| Kategori sebagai menu utama | Kategori sebagai tag kecil + filter chip |

---

## 2. Mini-Game List Final (16 Games)

1. ⚡ **Hitung Kilat** — Jawab soal matematika secepat mungkin. (Cepat)
2. 🧩 **Pola Kilat** — Temukan pola selanjutnya dari urutan. (Cepat)
3. 🧠 **Ingatan Cepat** — Hafalkan urutan gambar, pilih kembali. (Cepat)
4. 🔍 **Cari yang Berbeda** — Temukan objek berbeda dari yang mirip. (Cepat)
5. 🧩 **Kode Warna** — Pecahkan kode bentuk dan hitung hasilnya. (Logika)
6. 👤 **Cocokkan Bayangan** — Temukan bayangan hitam yang cocok. (Spasial)
7. 🔄 **Ubah Posisi** — Ikuti instruksi gerakan di grid. (Spasial)
8. 🐒 **Jalur Tercepat** — Bantu monyet ke pisang di grid. (Spasial)
9. 🕵️ **Detektif Petunjuk** — Gunakan petunjuk pecahkan misteri. (Logika)
10. 📐 **Tebak Aturan** — Temukan aturan tersembunyi. (Logika)
11. 💡 **Pilih Kesimpulan** — Baca fakta, pilih kesimpulan. (Logika)
12. ✅ **Benar atau Salah** — Tentukan benar atau salah. (Logika)
13. 🌟 **Pilih Sikap Terbaik** — Pilih sikap terbaik. (Adab)
14. 💬 **Nasihat dengan Lembut** — Pilih kata-kata terbaik. (Adab)
15. 📋 **Urutkan Adab** — Susun langkah adab dengan benar. (Adab)
16. ⚖️ **Dilema Bijak** — Hadapi dilema moral. (Adab, SMP+)

### Features:
- **Lanjutkan Terakhir** — card besar untuk game terakhir dimainkan
- **Rekomendasi Hari Ini** — 3 game diverse categories
- **Acak Game** — memilih game random sesuai difficulty
- **Filter Chip** — Semua / Cepat / Logika / Spasial / Adab
- **Locked State** — Dilema Bijak terkunci untuk TK/SD Bawah

---

## 3. Battle List Final (12 Games + Campuran)

**Battle Campuran** (selalu di atas):
🎲 Ronde acak dari semua game non-adab.

1. ⚡ Hitung Kilat
2. 🧩 Pola Kilat
3. 🧠 Ingatan Cepat
4. 🔍 Cari yang Berbeda
5. 🧩 Kode Warna
6. 👤 Cocokkan Bayangan
7. 🔄 Ubah Posisi
8. 🐒 Jalur Tercepat
9. 🕵️ Detektif Petunjuk
10. 📐 Tebak Aturan
11. 💡 Pilih Kesimpulan
12. ✅ Benar atau Salah

### Dikecualikan dari Battle:
- Pilih Sikap Terbaik
- Nasihat dengan Lembut
- Urutkan Adab
- Dilema Bijak

Alasan: Game adab cocok untuk refleksi, bukan kompetisi cepat.

---

## 4. Data Structure

### Flat Game Entry (`src/data/minigame-definitions.ts`)

```typescript
interface FlatGameEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  categoryTag: string;       // "Cepat" | "Logika" | "Spasial" | "Adab"
  categoryEmoji: string;
  isAdabGame: boolean;
  isMiniGameEnabled: boolean;
  isBattleEnabled: boolean;
  supportedDifficulties: DifficultyId[];
  minDifficulty?: DifficultyId;
  estimatedDuration?: string;
  screenId?: string;
  battleAdapterKey?: string;
  order: number;
}
```

### Exports:
- `MINI_GAME_FLAT_LIST` — all 16 entries
- `getFlatMiniGames()` — filtered for mini-game display
- `getFlatBattleGames()` — filtered for battle (non-adab, battle-enabled)
- `isGamePlayable(game, difficulty)` — difficulty lock check
- `getRandomPlayableGame(difficulty)` — random playable game

---

## 5. Routing

| Screen | Route |
|---|---|
| Mini-Game Center | `screen: "minigame-center"` |
| Individual games | `screen: "minigame-{id}"` |
| Battle | `screen: "battle"` |

Route `minigame-package` dihapus dari flow utama. `MiniGamePackageScreen` masih tersedia sebagai komponen (backward compat).

---

## 6. Files Changed

| File | Changes |
|---|---|
| **`src/data/minigame-definitions.ts`** | Added `FlatGameEntry` interface + `MINI_GAME_FLAT_LIST` (16 entries) + helpers. Legacy package structure preserved. |
| **`src/screens/MiniGameCenter.tsx`** | Complete rewrite — flat game list with sections (Last Played, Recommendations, Random, Filter Chips, All Games). Locked game states. |
| **`src/screens/BattleScreen.tsx`** | Replaced `select-mode` (category) phase with `select-game` phase showing flat game list + Battle Campuran. |
| **`src/GameAppStandalone.tsx`** | Removed `minigame-package` routing, `MiniGamePackageScreen` import, `activeMiniGamePackage` state. Updated `MiniGameCenter` props. |
| **`src/routes/index.tsx`** | Same changes as GameAppStandalone. |

### Files Created:
| File | Description |
|---|---|
| **`scripts/validate-flat-minigame-battle-list.ts`** | 100 validation tests — all passing |

---

## 7. Validation Results

✅ **100 tests passed, 0 failed**

Cakupan:
1. ✅ All 16 final games present
2. ✅ Correct order verified
3. ✅ No removed/old games (Putar Bentuk, Jalur Aman, etc.)
4. ✅ Battle excludes all adab games
5. ✅ Battle Campuran uses only non-adab
6. ✅ All battle games have adapter keys
7. ✅ Difficulty locks work (Dilema: TK/SD Bawah locked)
8. ✅ All isMiniGameEnabled = true
9. ✅ Category tags exist (Cepat, Logika, Spasial, Adab)
10. ✅ Category distribution correct (4 Cepat, 5 Logika, 3 Spasial, 4 Adab)

---

## 8. Known Issues

1. **Battle Campuran** — game selection uses legacy `BATTLE_GAME_POOL` adapaters. Individual game selection maps to the correct legacy category.
2. **Family Challenge** — removed from battle list. Still accessible via Home → Battle if needed via legacy adapter.
3. **Misi Keluarga** — not in mini-game flat list (real-world activity, not a minigame).

---

## 9. QA Checklist

- [x] Mini-Game shows 16 games directly
- [x] No category menu step
- [x] Filter chips work (Semua/Cepat/Logika/Spasial/Adab)
- [x] Random game button works
- [x] Dilema Bijak locked for TK/SD Bawah
- [x] Battle shows flat game list
- [x] Battle Campuran at top
- [x] No adab games in battle list
- [x] All cards navigate to correct game
- [x] Build succeeds
- [x] Validation passes
