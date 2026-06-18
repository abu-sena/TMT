# TMT — Home, Icon & Reward Fix Report

**Tanggal:** 2026-06-17  
**Versi APK:** 1.0.4 (versionCode 4)  
**Lokasi APK:** `release/EduGame.apk`

---

## 1. PERBAIKAN ROUNDED BUTTON/CARD

### Masalah Sebelumnya
Button dan card di Home terlalu rounded/oval hingga berbentuk kapsul besar, tidak proporsional di HP dan tablet.

### Solusi
Update design token radius dan komponen UI:

#### CSS Design Tokens (`src/styles.css`)
| Token | Sebelum | Sesudah | Keterangan |
|-------|---------|---------|------------|
| --radius-sm | 12px | 12px | Tetap, untuk badge/chip |
| --radius-md | 16px | 18px | Small button |
| --radius-lg | 24px | 26px | Card, medium button |
| --radius-xl | 32px | 34px | Large card, main button |
| --radius-2xl | 40px | 40px | Panel, profile card |
| --radius-3xl | 56px | 40px | Cap — tidak ada lagi oval ekstrem |

#### Komponen yang Diperbaiki
1. **HomeScreen BigTile**: `rounded-3xl` → `rounded-[26px]`, padding dan ukuran teks proporsional
2. **GameButton**: Semua size diperbarui — sm: rounded-[16px], md: rounded-[20px], lg: rounded-[28px], xl: rounded-[32px]
3. **GameCard**: Semua tone dari `rounded-2xl`/`rounded-3xl` → `rounded-[26px]`
4. **surface-panel** CSS: border-radius dari `var(--radius-2xl)` → `28px`
5. **surface-wood** CSS: border-radius dari `var(--radius-xl)` → `28px`
6. **ParentScreen**: Semua card `rounded-3xl` → `rounded-[28px]`, stat tiles `rounded-2xl` → `rounded-[18px]`
7. **StatsScreen, SettingsScreen, DailyMissionsScreen**: Semua `rounded-3xl` → `rounded-[28px]`, `rounded-2xl` → `rounded-[18px]`
8. **BadgesScreen, MapScreen, ResultScreen, PlayScreen, ProfileSelectScreen**: idem
9. **MissionPopup, ParentGate, ConfirmResetModal**: idem

---

## 2. STATUS ICON APK

### Masalah Sebelumnya
Icon aplikasi setelah install muncul sebagai icon hitam/default Android.

### Penyebab
1. Adaptive icon XML (`mipmap-anydpi-v26/ic_launcher.xml`) menunjuk ke `drawable/ic_launcher_foreground`
2. `drawable-v24/ic_launcher_foreground.xml` adalah vector drawable default Android (ikon android hijau dengan wajah) yang mengambil alih untuk perangkat API 24+
3. PNG foreground/background tidak di-generate dengan benar

### Perbaikan
1. **Sumber icon**: `src/components/icon.png` (1254×1254 PNG)
2. **Copy ke**: `public/assets/icon.png`
3. **Generate ulang semua resource**:
   - `mipmap-mdpi/ic_launcher.png` (48×48)
   - `mipmap-hdpi/ic_launcher.png` (72×72)
   - `mipmap-xhdpi/ic_launcher.png` (96×96)
   - `mipmap-xxhdpi/ic_launcher.png` (144×144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192×192)
4. **Generate adaptive icon**:
   - `drawable/ic_launcher_foreground.png` (432×432, icon centered dengan padding 30%)
   - `drawable/ic_launcher_background.png` (432×432, solid #2A8DE8 - TMT blue)
5. **Hapus** `drawable-v24/ic_launcher_foreground.xml` (vector default yang override PNG)
6. **Adaptive XML** (`mipmap-anydpi-v26/`) tetap menunjuk ke `@drawable/ic_launcher_foreground` dan `@drawable/ic_launcher_background` — sekarang menggunakan PNG yang benar
7. **AndroidManifest** tetap: `android:icon="@mipmap/ic_launcher"`, `android:roundIcon="@mipmap/ic_launcher_round"`, `android:label="@string/app_name"`
8. **strings.xml**: `app_name` = "TMT", `title_activity_main` = "TMT"

### Version Bump
| | Sebelum | Sesudah |
|---|---------|---------|
| versionCode | 3 | 4 |
| versionName | 1.0.3 | 1.0.4 |

### Catatan Install
- **Uninstall APK lama** sebelum install APK baru jika icon masih menampilkan cache lama
- Android launcher cache mungkin masih menyimpan icon lama selama beberapa saat setelah install

---

## 3. STATUS FITUR HADIAH OFFLINE

### Data Model (`src/types/index.ts`)
```typescript
interface RewardMilestone {
  id: string;
  profileId: string;
  targetLevel: number;
  rewardTitle: string;
  rewardDescription?: string;
  rewardIcon: string;       // emoji
  rewardColor?: string;
  isActive: boolean;
  isUnlocked: boolean;
  unlockedAt?: number;
  isClaimed: boolean;
  claimedAt?: number;
  createdAt: number;
  updatedAt: number;
}
```

Disimpan di `GameStoreState.rewardMilestones` (localStorage, offline).

### Flow Orang Tua Membuat Hadiah
1. Buka Halaman Orang Tua → masukkan password
2. Klik card "Pengaturan Hadiah Dunia Nyata"
3. Klik "Atur Hadiah" → masuk ke **RewardSetupScreen**
4. Pilih profil anak
5. Klik "Tambah Hadiah Baru"
6. Isi form:
   - Profil anak
   - Target level (angka minimal 1)
   - Nama hadiah (maksimal 40 karakter)
   - Deskripsi (opsional, maksimal 120 karakter)
   - Icon hadiah (10 pilihan emoji)
   - Warna tema (10 pilihan warna)
   - Aktif/nonaktif
7. Submit → hadiah tersimpan

### Fitur Pengelolaan Hadiah
- **Edit**: ubah semua field hadiah
- **Hapus**: dengan konfirmasi
- **Nonaktifkan/Aktifkan**: toggle status
- **Tandai Sudah Diberikan**: saat orang tua memberikan hadiah di dunia nyata

### Flow Anak Melihat Hadiah
1. **Home Screen**: Card "Hadiah Berikutnya" muncul jika ada hadiah aktif
   - Menampilkan: nama hadiah, target level, progress level, "Kurang X level lagi"
   - Jika hadiah sudah terbuka: "Hadiah Sudah Terbuka!"
2. Klik card → **MyRewardsScreen** (Hadiahku)
   - Hadiah berikutnya dengan progress bar
   - Hadiah yang sudah terbuka (siap diberikan)
   - Hadiah mendatang (timeline)
   - Hadiah yang sudah diterima (riwayat)

### Flow Hadiah Terbuka (Celebration)
1. **Trigger**: Setelah menyelesaikan misi dan level-up, atau saat app dibuka ulang
2. Cek apakah ada `rewardMilestones` yang `targetLevel <= currentLevel` dan `isUnlocked === false`
3. Jika ada → tampilkan **RewardCelebration modal**
   - Animasi confetti stars
   - Icon hadiah besar dengan glow
   - Teks: "MasyaAllah! Kamu mencapai Level X..."
   - Teks: "Tunjukkan ini kepada orang tua..."
   - Tombol: "Hore!" / "Lihat Hadiah"
4. Jika beberapa hadiah terbuka → tampilkan berurutan (Next button)
5. Tidak auto-hilang, harus manual close

---

## 4. STATUS ANDROID BACK BUTTON

| Screen | Back Behavior |
|--------|--------------|
| Home | Double-press → toast "Tekan sekali lagi untuk keluar" → exit |
| Map, Badges, Stats, Settings, Privacy, Daily-Missions | Back → Home |
| Play | Back → Map |
| Result | Back → Map |
| Mini-game screens | Back → Home |
| Battle | Back → Home |
| Parent | Back → Home |
| Reward Setup | Back → Parent Dashboard |
| My Rewards | Back → Home |
| Celebration Modal | Back → close modal |
| Parent Gate | Back → Home |

---

## 5. FILE YANG DIBUAT / DIUBAH

### File Baru
- `src/screens/RewardSetupScreen.tsx` — Halaman pengaturan hadiah (parent)
- `src/screens/MyRewardsScreen.tsx` — Halaman hadiahku (anak)
- `src/components/rewards/RewardCelebration.tsx` — Modal celebration hadiah terbuka
- `scripts/generate-icons.cjs` — Script generate Android icon
- `docs/TMT_HOME_ICON_REWARD_FIX_REPORT.md` — Laporan ini

### File Diubah
- `src/styles.css` — Radius tokens, surface-panel, surface-wood
- `src/types/index.ts` — RewardMilestone, REWARD_ICONS, ScreenId tambahan
- `src/components/ui/GameButton.tsx` — Size radius
- `src/components/ui/GameCard.tsx` — Tone radius
- `src/screens/HomeScreen.tsx` — BigTile radius, Hadiah Berikutnya card
- `src/screens/ParentScreen.tsx` — Card radius, reward section, onManageRewards
- `src/screens/StatsScreen.tsx` — Card radius
- `src/screens/SettingsScreen.tsx` — Card radius
- `src/screens/DailyMissionsScreen.tsx` — Card radius
- `src/screens/BadgesScreen.tsx` — Card radius
- `src/screens/MapScreen.tsx` — Card radius
- `src/screens/ResultScreen.tsx` — Card radius
- `src/screens/PlayScreen.tsx` — Card radius
- `src/screens/ProfileSelectScreen.tsx` — Card radius
- `src/components/missions/MissionPopup.tsx` — Card radius
- `src/components/safety/ParentGate.tsx` — Card radius
- `src/components/safety/ConfirmResetModal.tsx` — Card radius
- `src/components/ui/GameInput.tsx` — Card radius
- `src/components/ui/DifficultyCard.tsx` — Card radius
- `src/lib/storage.ts` — Reward methods di React hook
- `src/lib/storage/service.ts` — Reward CRUD di storage service
- `src/GameAppStandalone.tsx` — Integrasi reward screens, celebration, reward checking
- `src/routes/index.tsx` — Reward screens (SSR version)
- `android/app/build.gradle` — versionCode 4, versionName 1.0.4
- `android/app/src/main/res/drawable/ic_launcher_foreground.png` — Icon foreground baru
- `android/app/src/main/res/drawable/ic_launcher_background.png` — Icon background baru
- `android/app/src/main/res/mipmap-*/ic_launcher.png` — Icon launcher semua density

### File Dihapus
- `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml` — Vector default yang override

---

## 6. CHECKLIST FINAL

- [x] Home card tidak oval ekstrem
- [x] Button tidak keluar layar
- [x] Icon APK sudah diperbarui (PNG + adaptive)
- [x] App label TMT
- [x] Hadiah offline tersedia di Halaman Orang Tua
- [x] Orang tua bisa tambah/edit/hapus/nonaktifkan hadiah
- [x] Anak bisa melihat hadiah berikutnya di Home
- [x] Celebration hadiah terbuka tampil wow (confetti, glow, animasi)
- [x] Data hadiah tersimpan offline (localStorage)
- [x] Back Android tidak langsung keluar
- [x] Back dari Reward Setup → Parent Dashboard
- [x] Back dari MyRewards → Home
- [x] Back dari Celebration → tutup modal
- [x] APK baru berhasil dibuat: `release/EduGame.apk`

---

## 7. KNOWN ISSUES

1. **Icon launcher cache**: Android launcher bisa menyimpan cache icon lama. Uninstall APK lama sebelum install baru.
2. **jdk-17 portable tidak lengkap**: Script build-apk.bat menggunakan jdk-17 yang hanya berisi `lib/` tanpa `bin/`. Build manual menggunakan jdk-21.
3. **TypeScript warning**: `useAndroidBackButton.ts` memiliki error tipe pada Capacitor listener (pre-existing, bukan dari perubahan ini).
