<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c02ae183-a92e-41b0-a1f4-45df173746a0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run on mobile (Expo)

IronPath can run on iOS/Android via an Expo shell that loads the web app in a WebView. See **[MOBILE.md](MOBILE.md)** for setup, LAN IP configuration, and limitations.

```bash
npm run dev          # terminal 1 — backend + web
npm run expo         # terminal 2 — Expo dev server
```
