import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ path: ".env.local" });
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "15mb" })); // Support large base64 avatar images

// Initialize Google GenAI
const geminiApiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "").trim();

if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
  console.warn(
    "[IronPath] GEMINI_API_KEY is missing. Add it to .env.local — get one at https://aistudio.google.com/apikey"
  );
} else if (!geminiApiKey.startsWith("AIza") && !geminiApiKey.startsWith("AQ.")) {
  console.warn(
    "[IronPath] GEMINI_API_KEY format looks unusual. Standard keys from AI Studio start with AIza."
  );
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const AVATAR_IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
] as const;

function formatGeminiError(error: unknown, feature: string): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  let parsed: { error?: { code?: number; message?: string; status?: string } } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* not JSON */
  }

  const code = parsed.error?.code;
  const apiMessage = parsed.error?.message || raw;

  if (code === 429 || /quota|rate.?limit|resource exhausted/i.test(apiMessage)) {
    return {
      status: 429,
      message:
        "Gemini image quota exceeded. Check usage at https://ai.dev/rate-limit or enable billing in Google AI Studio, then try again later.",
    };
  }

  if (code === 401 || code === 403 || /api key|permission|unauthorized/i.test(apiMessage)) {
    return {
      status: 401,
      message:
        "Invalid Gemini API key. Open .env.local and set GEMINI_API_KEY from https://aistudio.google.com/apikey then restart npm run dev.",
    };
  }

  if (/model.*not found|invalid model/i.test(apiMessage)) {
    return {
      status: 502,
      message: `${feature} model unavailable. Update the server model list or try again shortly.`,
    };
  }

  return {
    status: 500,
    message: apiMessage.slice(0, 280) || `${feature} request failed.`,
  };
}

async function generateAvatarImage(contents: unknown) {
  let lastError: unknown;
  for (const model of AVATAR_IMAGE_MODELS) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K",
          },
        },
      });
    } catch (error) {
      lastError = error;
      console.warn(`Avatar model ${model} failed:`, error instanceof Error ? error.message.slice(0, 120) : error);
    }
  }
  throw lastError;
}

// Helper function to return beautiful Dojo-style tactical tips when off the grid / quota exhausted
function getFallbackDojoCues(exerciseName: string, category: string): string {
  const normalized = (exerciseName || "").toLowerCase();
  let points: string[] = [];

  if (normalized.includes("bench") || normalized.includes("push-up") || normalized.includes("press") || normalized.includes("dip") || normalized.includes("chest") || normalized.includes("skull")) {
    points = [
      "Retract & Depress Scapulae: Glue your shoulder blades together and down before initiating the movement. NEVER press with flat shoulders, as it puts maximum strain on your rotator cuffs.",
      "Power Torques & Foot Drive: Drive your heels into the floor as if trying to push the ground away from you. This creates absolute kinetic chain stability and transfers power directly to your chest/shoulders.",
      "Controlled Path Focus: Keep wrists straight and perfectly stacked above your elbows. Lower the weight under absolute 3-second tension, touch lightly at the pectoral line, and ascend explosively."
    ];
  } else if (normalized.includes("row") || normalized.includes("pull") || normalized.includes("bicep") || normalized.includes("curl") || normalized.includes("lat") || normalized.includes("hang") || normalized.includes("grip")) {
    points = [
      "Incorporate Pre-Draft Activation: Engage your shoulder blades and drive your elbows down first. Never pull solely using biceps. Think of your hands as hooks; pull directly through the elbows.",
      "Anti-Sway Core Protocol: Brace your transverse abdominis with 360-degree expansion to anchor your spine. Do not sway, swing, or use momentum to carry heavy pulling loads.",
      "Iron Crush Grip: Squeeze the handles or bar with maximum neural power. A crushing grip releases motor neuron recruitment, stabilizing your wrists and safety factors instantly."
    ];
  } else if (normalized.includes("squat") || normalized.includes("leg") || normalized.includes("calf") || normalized.includes("lunge") || normalized.includes("quad") || normalized.includes("glute")) {
    points = [
      "Floor Screw Activation: Torque your feet into the floor/ground (screw right foot clockwise, left foot counter-clockwise). This instantly fires up glute stabilizers and fixes knee alignment under heavy compression.",
      "Pelvic Trunk Balance: Control pelvic tilt. Push hips back while descending but maintain a braced vertical spine. Minimize 'butt wink' at lowest transition points.",
      "Ascending Quadriceps Torque: Drive strictly through your mid-foot and heels during the concentric climb. Push your knees slightly outward to keep the posterior chain locked and engaged."
    ];
  } else if (normalized.includes("plank") || normalized.includes("raise") || normalized.includes("mountain") || normalized.includes("crawl") || normalized.includes("core") || normalized.includes("flag") || normalized.includes("burpee")) {
    points = [
      "Maximal Hollow Body Hold: Flex your glutes, tilt your pelvis back, and hollow your lower abdominal wall. This locks in the anterior core and prevents saggy lumbar fatigue.",
      "Active Shoulder Support: Protract your shoulder blades by driving your elbows or palms hard into the floor. Think of pushing your spine toward the ceiling.",
      "Constant Respiratory Control: Breathe under tension. Practice short, sharp diaphragmatic breathes rather than holding your breath, maintaining absolute structural firmness."
    ];
  } else {
    points = [
      "Controlled eccentric strain: Apply a 3-second lowering tempo to emphasize high mechanical tension and structural discipline.",
      "Kinetic Stack Lineup: Ensure your joints are stacked appropriately. Keep wrists, elbows, and shoulders aligned in the movement path to prevent shear force.",
      "Trunk Integrity Hold: Tighten your belly, plant your feet, and direct your line of sight forward. A rigid core creates a secure foundation for any physical exercise."
    ];
  }

  return `[OFF-GRID RESILIENT DOJO LINKS ROUTED]

Dojo Master Tactical Cues for: **${exerciseName.toUpperCase()}** (${(category || "CONDITIONING").toUpperCase()})

- ${points[0]}
- ${points[1]}
- ${points[2]}

*Tactical Blueprint: Retain perfect kinetic alignment to survive extreme conditioning loads.*`;
}

// API endpoint for tactical tips / search grounding
app.post("/api/ai/tips", async (req, res: any) => {
  const { exerciseName, category } = req.body;
  if (!exerciseName) {
    return res.status(400).json({ error: "Exercise name is required" });
  }

  const prompt = `Give me 3 precise combat-focused tactical cues and performance tips for the exercise "${exerciseName}" (category: ${category}). Provide it in a clear, check-list-ready brief Dojo style. Structure the tips with short bullet points. Include relevant up-to-date competitive training or posture insights from the web. Maintain a high-intensity, structured Dojo coaching tone. Keep the answer extremely concise (under 120 words).`;

  try {
    // Attempt 1: Search-grounded generation for up-to-date real-time tactical intel
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite combat conditioning Dojo Master. Your tone is disciplined, highly focused, tactical, and motivational.",
        tools: [{ googleSearch: {} }],
      }
    });

    return res.json({ tips: response.text });
  } catch (error: any) {
    console.warn("Grounded Gemini tips failed (possible quota limit or 429). Attempting standard Gemini API...", error.message || error);
    
    try {
      // Attempt 2: Standard Gemini model generation (no search tool, much lighter quota footprint)
      const standardResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite combat conditioning Dojo Master. Your tone is disciplined, highly focused, tactical, and motivational.",
        }
      });
      return res.json({ tips: standardResponse.text });
    } catch (innerError: any) {
      console.error("All Gemini API routes depleted or quota exhausted. Deploying handcrafted offline master cues:", innerError.message || innerError);
      
      // Attempt 3: Guaranteed instant localized offline response custom to the exercise
      const fallbackTips = getFallbackDojoCues(exerciseName, category);
      return res.json({ tips: fallbackTips });
    }
  }
});

// API endpoint for image generation / editing using gemini-3.1-flash-image
app.post("/api/ai/avatar", async (req, res: any) => {
  try {
    if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
      return res.status(401).json({
        error:
          "Gemini API key not configured. Add GEMINI_API_KEY to .env.local (https://aistudio.google.com/apikey) and restart the server.",
      });
    }

    const { prompt, currentImage, isEdit } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (String(prompt).length > 1200) {
      return res.status(400).json({ error: "Prompt is too long. Keep it under 1200 characters." });
    }

    let contents: any;
    if (isEdit && currentImage) {
      const match = currentImage.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid currentImage format. Should be data URL." });
      }
      const mimeType = match[1];
      const base64Data = match[2];

      contents = {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      };
    } else {
      contents = {
        parts: [
          {
            text: prompt,
          },
        ],
      };
    }

    const response = await generateAvatarImage(contents);

    let imageBase64 = "";
    let statusText = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
      } else if (part.text) {
        statusText += part.text;
      }
    }

    if (!imageBase64) {
      return res.status(500).json({ error: "Failed to generate image. No image data returned.", details: statusText });
    }

    res.json({ imageUrl: `data:image/png;base64,${imageBase64}` });
  } catch (error: any) {
    console.error("Image generation error:", error);
    const { status, message } = formatGeminiError(error, "Avatar generation");
    res.status(status).json({ error: message });
  }
});

// API endpoint for AI Athlete Coach
app.post("/api/ai/coach", async (req, res: any) => {
  const { message, history, athleteProfile: athleteProfileBody, profile } = req.body;
  const athleteProfile = athleteProfileBody || profile;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const profileContext = athleteProfile ? `
ATHLETE PROFILE CONTEXT:
- Name: ${athleteProfile.name || 'Unnamed Athlete'}
- Age: ${athleteProfile.age || 'High School Age'}
- Height: ${athleteProfile.height || 'Not set'}
- Weight: ${athleteProfile.weight ? athleteProfile.weight + ' lbs' : 'Not set'}
- Sport Focus: ${athleteProfile.sport || 'Wrestling'}
- Level: ${athleteProfile.level || 1} (${athleteProfile.xp || 0} XP)
- Lifts Info (PB): Squat: ${athleteProfile.personalBests?.Squat || 0} lbs, Bench Press: ${athleteProfile.personalBests?.['Bench Press'] || 0} lbs, Deadlift: ${athleteProfile.personalBests?.Deadlift || 0} lbs
- Total Workout Repetitions logged: ${athleteProfile.totalReps || 0} reps` : "";

  const systemInstruction = `You are "IronPath Coach", the ultimate safety-first AI athletic advisor and conditioning master for high school student athletes (ages 14-18) specializing in wrestling, football, track, and strength athletics.

Your coaching mission:
1. Provide actionable, science-based, and strictly safe training advice.
2. Forcefully warning against dangerous practices: Warn against overtraining, bad ego-lifting style (rounded backs on deadlifts, bouncing bar off chest on bench), and any performance-enhancing drugs (PEDs, steroids, SARM cycles). Educate them on safe, natural alternatives: protein synthesis, healthy caloric brackets, consistency, mobility, and deep sleep.
3. For wrestling focus: Emphasize core containment, grip power, shoulder longevity, explosive leg drive (for doublelegs/takedowns), high metabolic conditioning, and active recovery.
4. Keep answers positive, clear, and highly readable on mobile (using bold headings, short paragraphs, and bullet points). Do not write monolithic walls of text.
5. Under no circumstances should you recommend dangerous adult fat burners, crash calorie cuts, or excessive water shedding dehydration methods. Give healthy sport weight-class management strategies instead.

${profileContext}`;

  try {
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((item: any) => {
        contents.push({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.content || item.text || "" }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error("AI Coach model generation error:", error.message || error);
    return res.status(500).json({ error: "AI Coach is currently recovering from heavy sets. Ask again shortly!", details: error.message });
  }
});

// Setup Vite or static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
