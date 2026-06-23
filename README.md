# IronPath Athlete System

IronPath is an elite, high-performance training HUD and planner built for competitive high school athletes, tracking body weight, repetitions, and daily exercise routines. 

## Self-Configuring Architecture

The project leverages a modern setup built on Node.js and React with a custom Express backend. It handles AI Coach communication without exposing any sensitive API keys to the browser context. We have a robust `src/config/env.ts` system on the frontend and `process.env` resolution on the server to prevent generic crash errors and provide graceful degradation in the event of missing access keys.

## API Setup

To enable the AI Coach features, you must follow these step-by-step instructions.

1. Locate the `.env.example` file in the root of the project.
2. Create a new file named `.env` in the root of the project.
3. Add the following lines to your `.env` file containing your real Gemini API key:

```env
# Required for AI Coach, Avatar Forge, and tactical tips
GEMINI_API_KEY=your_gemini_api_key_here
```

You can also save a key per-browser via **Settings** (sliders icon in the header) without editing `.env`.

**Where to get the keys:**
- **Gemini API:** Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a new key.

**How to test them:**
Restart the development server if it's currently running. Open the app and navigate to the **Coach** tab. Send a message to the AI. If your API key is correctly configured and valid, the coach will respond. If it is invalid, you will seamlessly receive a fallback warning in the UI letting you know it's missing or misconfigured.

## Safari (macOS & iPhone)

- **macOS Safari:** Open [http://localhost:3000](http://localhost:3000) after `npm run dev`.
- **iPhone Safari:** Use the same Wi‑Fi as your Mac, find your Mac's LAN IP (`ipconfig getifaddr en0`), then open `http://<that-ip>:3000` in Safari. The dev server binds to all interfaces (`0.0.0.0`).
