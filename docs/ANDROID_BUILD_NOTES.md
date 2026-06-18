# Android Build Notes — Adab Quest

## Stack Project

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Build | Vite (SPA mode via `vite.spa.config.ts`) |
| Routing | Screen-based state machine (no router dependency) |
| Styling | Tailwind CSS 4 |
| Persistence | localStorage via StorageService abstraction |
| Android wrapper | Capacitor 7 |
| Android build | Gradle 8.14.3 (via wrapper) |

## Package Identity

| Field | Value |
|-------|-------|
| App Name | Adab Quest |
| Package ID | `id.adabquest.game` |
| Version | 1.0.0 |
| Version Code | 1 |
| Min Android | API 23 (Android 6.0) |
| Target | Android 14+ |

## Build APK

### Prerequisites
- **Java 17+** (JDK 17 or newer) — required by Gradle 8.x
- **Android SDK** (API 34+)
- **ANDROID_HOME** environment variable set
- Node.js 18+

### Steps

```bash
# 1. Build the web app for Capacitor
npm run build:spa

# 2. Sync with Capacitor (copies web assets to android/)
npx cap sync

# 3. Build the APK
cd android
./gradlew assembleDebug

# 4. Output
# android/app/build/outputs/apk/debug/app-debug.apk
```

### NPM Scripts
Add these to package.json:
```json
{
  "build:spa": "vite build --config vite.spa.config.ts",
  "cap:sync": "npx cap sync",
  "cap:open": "npx cap open android",
  "apk:debug": "npm run build:spa && npx cap sync && cd android && ./gradlew assembleDebug"
}
```

## File Locations

| File | Path |
|------|------|
| SPA entry | `index.html` |
| SPA bootstrap | `src/capacitor-main.tsx` |
| Standalone App | `src/GameAppStandalone.tsx` |
| Vite SPA config | `vite.spa.config.ts` |
| Capacitor config | `capacitor.config.json` |
| Android project | `android/` |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Web assets (built) | `dist-spa/` |

## Offline-First Architecture

- All game logic runs in WebView — no server dependency
- localStorage via StorageService for 100% of game state
- No API calls for core gameplay
- Google Connect is mock-only, entirely optional
- `INTERNET` permission in manifest exists but is not used for gameplay

## Key Files for Capacitor

- `capacitor.config.json` — webDir: `dist-spa`
- `src/capacitor-main.tsx` — Client-only React bootstrap
- `src/GameAppStandalone.tsx` — Full game app (no SSR/router dependency)
- `vite.spa.config.ts` — Standalone Vite build producing `dist-spa/`
