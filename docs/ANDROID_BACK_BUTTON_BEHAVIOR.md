# Android Back Button Behavior — EduGame

**Implementasi:** `src/hooks/useAndroidBackButton.ts`

## Flow Back Button

### Prioritas 1: Tutup Modal/Popup
Jika ada popup, modal, atau overlay yang terbuka:
- Mission Popup di MapScreen → tutup popup, kembali ke map
- ParentGate modal → tutup gate, kembali ke home
- ScreenTimeReminder → tutup reminder

### Prioritas 2: Navigasi Internal

| Screen Saat Ini | Aksi Back Button |
|----------------|-----------------|
| PlayScreen (misi sedang dimainkan) | Tampilkan konfirmasi: "Keluar dari misi?" → kembali ke map |
| ResultScreen | Kembali ke map |
| BadgesScreen | Kembali ke home |
| StatsScreen | Kembali ke home |
| SettingsScreen | Kembali ke home |
| PrivacyScreen | Kembali ke settings |
| ParentScreen | Kembali ke home |
| MapScreen | Kembali ke home |
| ProfileSelectScreen | Kembali ke onboarding (jika relevan) |

### Prioritas 3: Home Screen
- Tekan back sekali: Tidak ada aksi (dicegah)
- Tekan back lagi dalam 2 detik: Keluar aplikasi

### Prioritas 4: Web Fallback
Jika Capacitor tidak tersedia (web browser):
- Gunakan `window.history.pushState` + `popstate` event
- Mencegah navigasi mundur browser ke halaman sebelumnya
- Double-press exit di home tidak tersedia di web

## Integrasi Capacitor

```typescript
// Menggunakan Capacitor App plugin
const capApp = (window as any).Capacitor?.App;
capApp.addListener("backButton", handler);
```

## Catatan Penting

1. Listener dibersihkan saat komponen unmount
2. Tidak ada double register listener
3. Tidak ada memory leak
4. Back button tidak menyebabkan layar blank
5. Semua navigasi internal diproses sebelum back button Android
