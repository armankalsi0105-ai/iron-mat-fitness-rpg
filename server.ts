import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

// Initialize Express
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json({ limit: "15mb" })); // Support large base64 avatar images

function isMissingApiKey(customKey?: string): boolean {
  const key = customKey || process.env.GEMINI_API_KEY;
  return !key || key === "your_gemini_api_key_here";
}

function getAI(customKey?: string): GoogleGenAI {
  let key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  key = key.replace(/['"\s]+/g, '');
  return new GoogleGenAI({
    apiKey: key
  });
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
  
Dojo Master Tactical Cues for: **${exerciseName.toUpperCase()}** (${(category || "CONDITIONING").toUpperCase()}):

• ${points[0]}

• ${points[1]}

• ${points[2]}

*Tactical Blueprint: Retain perfect kinetic alignment to survive extreme conditioning loads.*`;
}

// API endpoint for tactical tips / search grounding
app.post("/api/ai/tips", async (req, res: any) => {
  const customKey = req.headers["x-gemini-key"] as string | undefined;
  const { exerciseName, category } = req.body;
  if (!exerciseName) {
    return res.status(400).json({ error: "Exercise name is required" });
  }

  if (isMissingApiKey(customKey)) {
    const fallbackTips = getFallbackDojoCues(exerciseName, category);
    return res.json({ tips: fallbackTips });
  }

  const prompt = `Give me 3 precise combat-focused tactical cues and performance tips for the exercise "${exerciseName}" (category: ${category}). Provide it in a clear, check-list-ready brief Dojo style. Structure the tips with short bullet points. Include relevant up-to-date competitive training or posture insights from the web. Maintain a high-intensity, structured Dojo coaching tone. Keep the answer extremely concise (under 120 words).`;

  try {
    // Attempt 1: Search-grounded generation for up-to-date real-time tactical intel
      const response = await getAI(customKey).models.generateContent({
        model: "gemini-2.5-flash",
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
      const standardResponse = await getAI(customKey).models.generateContent({
        model: "gemini-2.5-flash",
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

// API endpoint for image generation / editing using gemini-2.5-flash-image
app.post("/api/ai/avatar", async (req, res: any) => {
  const customKey = req.headers["x-gemini-key"] as string | undefined;
  if (!customKey && isMissingApiKey()) {
    return res.status(503).json({ 
      error: "Avatar forge is offline. Please configure your API key in the .env file.",
      code: "MISSING_API_KEY"
    });
  }

  try {
    const { prompt, currentImage, isEdit } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
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

    const response = await getAI(customKey).models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

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
    
    // Check for auth/quota errors
    const errStr = String(error?.message || "") + JSON.stringify(error);
    if (error?.status === 401 || error?.status === 403 || errStr.includes("authentication") || errStr.includes("API_KEY_INVALID") || errStr.includes("API key not valid") || errStr.includes("UNAUTHENTICATED") || errStr.includes("UNSUPPORTED")) {
      return res.status(503).json({ 
        error: "Avatar forge is offline. The API Key provided is invalid or missing.",
        code: "MISSING_API_KEY",
        details: error?.message || "Invalid credentials" 
      });
    }

    res.status(500).json({ error: error?.message || "An unexpected error occurred during image generation." });
  }
});

// API endpoint for AI Athlete Coach
app.post("/api/ai/coach", async (req, res: any) => {
  const customKey = req.headers["x-gemini-key"] as string | undefined;
  if (!customKey && isMissingApiKey()) {
    return res.status(503).json({ 
      error: "AI Coach is not configured yet. Please add your GEMINI_API_KEY to the .env file.",
      code: "MISSING_API_KEY"
    });
  }

  const { message, history, athleteProfile } = req.body;
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

    const response = await getAI(customKey).models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error("AI Coach model generation error:", error.message || error);
    
    // Check for auth/quota errors
    const errStr = String(error?.message || "") + JSON.stringify(error);
    if (error?.status === 401 || error?.status === 403 || errStr.includes("authentication") || errStr.includes("API_KEY_INVALID") || errStr.includes("API key not valid") || errStr.includes("UNAUTHENTICATED") || errStr.includes("UNSUPPORTED")) {
      return res.status(503).json({ 
        error: "AI Coach setup is incomplete. The API Key provided is invalid or missing.",
        code: "MISSING_API_KEY",
        details: error?.message || "Invalid credentials"
      });
    }

    return res.status(500).json({ error: "AI Coach is currently recovering from heavy sets. Ask again shortly!", details: error?.message || String(error) });
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
