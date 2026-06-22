# IronPath on Expo (iOS / Android)

This folder is an **Expo mobile shell** that loads the existing Vite web app inside a `WebView`. It is the fastest practical way to run IronPath on a phone without rewriting Tailwind, Recharts, Motion, and other web-only UI.

## What you get today

- `npx expo start` in `mobile/` (or `npm run expo` from the repo root)
- Safe-area aware native chrome (toolbar, reload, server settings)
- **AsyncStorage** for the dev server URL (not for athlete profile data — that still uses WebView `localStorage`)
- Full web app features inside the WebView: workouts, profile vault, AI coach, avatar, charts

## What is *not* ported yet

This is **not** a native React Native rewrite. Future work would replace the WebView with RN screens and shared TypeScript modules (`types`, `data`, `schedule`, metrics).

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on your phone (easiest), or Xcode / Android Studio for simulators
- Repo root dependencies installed (`npm install`)
- `GEMINI_API_KEY` in `.env.local` at the repo root (for AI endpoints)

## Quick start

### 1. Start the backend + web app

From the **repo root**:

```bash
npm install
npm run dev
```

The Express server listens on `http://0.0.0.0:3000` and serves the Vite app plus `/api/ai/*` routes.

### 2. Start Expo

In a second terminal:

```bash
cd mobile
npm install
npx expo start
```

Or from the repo root:

```bash
npm run expo
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### 3. Pick the right server URL

| Environment | Default URL |
|-------------|-------------|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical device | `http://<YOUR_LAN_IP>:3000` |

On a real phone, **localhost points at the phone**, not your computer. Find your machine IP:

```bash
# macOS
ipconfig getifaddr en0
```

Then tap **Server** in the app toolbar and set e.g. `http://192.168.1.42:3000`. The URL is saved in AsyncStorage.

Optional: set `EXPO_PUBLIC_DEV_SERVER_URL` before starting Expo (see `mobile/.env.example`).

## Scripts

| Command | Where | Purpose |
|---------|-------|---------|
| `npm run dev` | root | Backend + Vite web app |
| `npm run expo` | root | `cd mobile && npx expo start` |
| `npm run lint` | mobile | Typecheck mobile shell |
| `npx expo start` | mobile | Expo dev server |
| `npx expo start --ios` | mobile | Open iOS simulator |
| `npx expo start --android` | mobile | Open Android emulator |

## Architecture

```
┌─────────────────────────────────────┐
│  Expo shell (React Native)          │
│  - Safe area, toolbar, settings     │
│  - AsyncStorage → dev server URL    │
│  ┌───────────────────────────────┐  │
│  │ WebView → Vite app @ :3000    │  │
│  │ - localStorage profile vault  │  │
│  │ - fetch /api/ai/* (same host) │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Express + Vite (repo root, :3000)  │
│  /api/ai/coach, /avatar, /tips      │
└─────────────────────────────────────┘
```

## Troubleshooting

**Blank screen / connection error**

- Confirm `npm run dev` is running on the host machine.
- On a physical device, use your LAN IP, not `localhost`.
- Phone and computer must be on the same Wi‑Fi.
- macOS firewall: allow incoming connections for Node.

**AI features fail**

- Check `GEMINI_API_KEY` in root `.env.local` and restart `npm run dev`.

**Android cleartext HTTP**

- Enabled in `app.config.ts` (`usesCleartextTraffic: true`) for local dev only.

## Files

- `mobile/App.tsx` — entry, safe area provider
- `mobile/app.config.ts` — Expo config, ATS / cleartext for dev
- `mobile/src/components/WebAppShell.tsx` — WebView host
- `mobile/src/components/SettingsPanel.tsx` — server URL editor
- `mobile/src/config.ts` — platform default URLs
