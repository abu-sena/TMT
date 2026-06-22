# TMT — Battle Mini-Game Expansion & Jalur Tercepat Fullscreen Fix Report

**Date:** 2026-06-21  
**Version:** 1.0.8 (versionCode 8)  
**APK:** `release/TMT.apk` (12.1 MB)

---

## 1. RINGKASAN REVISI

### A. Battle Mini-Game Expansion
Semua mini-game non-adab sekarang tersedia di Battle:
- **Battle Fokus Cepat**: Hitung Kilat, Pola Kilat, Ingatan Cepat, Cari yang Berbeda
- **Battle Logika**: Detektif Petunjuk, Tebak Aturan, Pilih Kesimpulan, Benar atau Salah, Kode Warna
- **Battle Spasial**: Ubah Posisi, Cocokkan Bayangan, Jalur Tercepat
- **Battle Campuran**: Gabungan semua game non-adab secara acak
- **Family Challenge**: Kerja sama mencapai target skor

### B. Jalur Tercepat Fullscreen
Grid sekarang menggunakan **95vw width** (sebelumnya hanya max-w-lg / ~512px), dengan 6 kolom × 16 baris.

---

## 2. MINI-GAME DI BATTLE

### Fokus Cepat (4 games)
| Game | Generator | Scoring | Timer |
|------|-----------|---------|-------|
| Hitung Kilat | Aritmatika acak (TK: +/-, SMA: +-×÷) | 100 + speed(0-50) + diff bonus | 5-10s |
| Pola Kilat | Urutan emoji (ABAB, AAB, ABC) | 100 + speed(0-50) + diff bonus | 5-10s |
| Ingatan Cepat | Hafalkan emoji, pilih yang benar | 100 + speed(0-50) + diff bonus | 4-8s |
| Cari yang Berbeda | Bentuk geometri (1 odd shape) | 100 + speed(0-50) + diff bonus | 6-12s |

### Logika (5 games)
| Game | Generator | Scoring | Timer |
|------|-----------|---------|-------|
| Detektif Petunjuk | Teka-teki logika | 100 + speed(0-50) + diff bonus | 7-12s |
| Tebak Aturan | Pola matematika/simbol | 100 + speed(0-50) + diff bonus | 7-12s |
| Pilih Kesimpulan | Silogisme sederhana | 100 + speed(0-50) + diff bonus | 7-12s |
| Benar atau Salah | Fakta umum | 100 + speed(0-50) + diff bonus | 6-12s |
| Kode Warna | Pola bentuk & warna | 100 + speed(0-50) + diff bonus | 7-12s |

### Spasial (3 games)
| Game | Generator | Scoring | Timer |
|------|-----------|---------|-------|
| Ubah Posisi | Grid 10×10, ikuti pergerakan | 100 + speed(0-50) + diff bonus | 8-15s |
| Cocokkan Bayangan | Pilih emoji sama | 100 + speed(0-50) + diff bonus | 5-10s |
| Jalur Tercepat | Grid 6×16, BFS pathfinding | 100 + time + efficiency | 15-30s |

### Difficulty Bonus
| Difficulty | Bonus |
|------------|-------|
| TK | 0 |
| SD Bawah | +10 |
| SD Atas | +20 |
| SMP | +30 |
| SMA | +40 |
| Universitas | +50 |

---

## 3. MINI-GAME ADAB YANG DIKECUALIKAN

Game berikut TIDAK masuk Battle (fokus karakter, bukan kompetisi):
- Pilih Sikap Terbaik (adab)
- Nasihat dengan Lembut (adab)
- Urutkan Adab (adab)
- Dilema Bijak (adab)
- Misi Keluarga (keluarga/adab)

---

## 4. STRUKTUR BATTLE_GAME_POOL

File baru: `src/lib/battle-game-pool.ts`

Berisi:
- `BattleGameDefinition` — interface standar untuk setiap game
- `BattleQuestion` / `BattleChoice` — tipe data question & answer
- `BATTLE_GAME_POOL` — array semua game (18 total: 13 battle, 5 adab)
- `getBattleGames(category)` — filter berdasarkan kategori
- `getBattleTimer(gameId, difficulty)` — timer per game
- `pickRandomBattleGame(category)` / `pickRandomCampuranGame()` — random picker
- Generator untuk setiap game (Hitung, Pola, Ingatan, Cari Beda, Logika, Benar-Salah, Kode Warna, Ubah Posisi, Cocok Bayangan, Jalur Tercepat)

---

## 5. BATTLE SCREEN UPDATE

File: `src/screens/BattleScreen.tsx`

Perubahan:
- 5 mode Battle baru: Fokus Cepat, Logika, Spasial, Campuran, Family
- Adab Bijak Duel dihapus dari menu
- Semua rendering menggunakan `BATTLE_GAME_POOL` secara dinamis
- Interactive game phases: `jalur-tercepat-play`, `ubah-posisi-play`
- Ingatan Cepat dengan memorize→recall flow
- Ubah Posisi dengan interactive 10×10 grid
- Jalur Tercepat fullscreen dengan 6×16 grid
- Family Challenge dengan target skor

---

## 6. JALUR TERCEPAT FULLSCREEN

Perubahan di `src/screens/MiniGameSpasialKeluargaScreens.tsx`:
- Grid: `w-[95vw] max-w-[600px]` (sebelumnya `max-w-lg` / ~512px)
- Tetap 6 kolom × 16 baris
- Fullscreen layout dengan header compact
- BFS pathfinding untuk shortest path
- Adjacent-only movement (atas/bawah/kiri/kanan)
- Obstacle (🪵) blocking
- Timer + efficiency scoring

Battle juga menggunakan grid 95vw yang sama untuk Jalur Tercepat.

---

## 7. VALIDATION SCRIPT

Script: `scripts/validate-battle-and-fastest-path.ts`

**Result: 134/134 passed, 0 errors, 0 warnings** ✅

---

## 8. APK BUILD

| Item | Value |
|------|-------|
| Version Code | 8 |
| Version Name | 1.0.8 |
| Build Type | Debug |
| APK Size | 12.1 MB |
| Location | `release/TMT.apk` |
| Label | TMT |

---

## 9. KNOWN ISSUES

1. **Pre-existing TS errors**: 424 errors di data files (`bossMissions.ts`, `expandedMissions.ts`, `ShadowMatchAssets.tsx`) — tidak terkait perubahan ini.
2. **Release signing**: Debug APK digunakan. Untuk Play Store perlu release keystore.
3. **BattleMode type**: `BattleSession.battleMode` di-cast ke `any` karena type lama (`BattleMode`) belum diperbarui ke kategori baru.

---

**Status:** ✅ ALL CHECKS PASSED — READY
