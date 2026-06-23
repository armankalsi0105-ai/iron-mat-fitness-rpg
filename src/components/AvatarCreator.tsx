import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Image as ImageIcon, Wand2, Paintbrush, X, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { geminiRequestHeaders } from '../config/env';

interface AvatarCreatorProps {
  currentAvatarUrl: string;
  onAvatarGenerated: (newUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CREATIVE_PROMPTS = [
  "A powerful Muay Thai fighter with glowing golden hand wraps, neon-lit underground dojo background, anime style",
  "A cyber-punk female judo champion with robotic shoulder armor and intense yellow eyes, close-up portrait",
  "An old rugged martial arts sensei with a glowing scar on his eye, mystical aura, cinematic lighting",
  "A high-tech bionic boxer with red hydraulic gauntlets, raining neon alley, hyper-detailed render",
  "A master ninja shrouded in darkness, glowing purple eyes, holding tactical grip swords"
];

export default function AvatarCreator({ currentAvatarUrl, onAvatarGenerated, isOpen, onClose }: AvatarCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please supply a visual synthesis instruction prompt first.");
      return;
    }
    setGenerating(true);
    setError("");

    // Start a stage loop for the custom epic loaders
    let interval = setInterval(() => {
      setStage(prev => (prev + 1) % 4);
    }, 1800);

    try {
      // If we are in edit mode, pass current image.
      // Wait, current image must be a base64 data URL. If it's a website URL, we can fetch it but it might fail due to CORS.
      // So if it's a data url starting with data: we pass it. If not, we just generate fresh!
      let currentImageBase64 = null;
      let shouldEdit = isEditMode;
      
      if (isEditMode) {
        if (currentAvatarUrl && currentAvatarUrl.startsWith('data:')) {
          currentImageBase64 = currentAvatarUrl;
        } else {
          // If it's an Unsplash URL, let's try to convert it on the client or warn.
          // To be safe, if we can't get a base64, we will fall back to standard generation and note it.
          shouldEdit = false;
        }
      }

      const response = await fetch("/api/ai/avatar", {
        method: "POST",
        headers: geminiRequestHeaders(),
        body: JSON.stringify({
          prompt: prompt,
          currentImage: currentImageBase64,
          isEdit: shouldEdit
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "MISSING_API_KEY") {
           throw new Error("Avatar builder requires API Key. Open the settings menu to configure it.");
        }
        throw new Error(data.error || "Neural Imaging core went offline. Try a shorter prompt key.");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onAvatarGenerated(data.imageUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to finalize visual synthesis.");
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const getLoadingMessage = () => {
    const list = [
      "SYNTHESIZING COMBATANT DNA MATRIX...",
      "STABILIZING NEON FORCEFIELDS & PIXELS...",
      "INFUSING FIGHTING SPIRIT INTO METRICS...",
      "POLISHING MASTERWORK SHADERS & MAT FIXTURES..."
    ];
    return list[stage];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Design header lines */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-rose-500" />

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-amber-500 uppercase flex items-center gap-1">
                    <Sparkles size={11} className="fill-amber-500" /> Neural Forge
                  </p>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                    <Wand2 size={20} className="text-amber-500" /> Customize Combatant Avatar
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Generator core */}
              <div className="space-y-4">
                {/* Current vs Next design */}
                <div className="flex gap-4 items-center">
                  <div className="relative group">
                    <img
                      src={currentAvatarUrl}
                      alt="Current fighter avatar"
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-zinc-700/80 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded-md text-[8px] font-bold text-zinc-400 uppercase font-mono">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Synthesis Method</label>
                    <div className="flex gap-2 mt-1.5">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border ${
                          !isEditMode
                            ? "bg-amber-500 text-black border-transparent shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <ImageIcon size={14} /> Fresh Forge
                      </button>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border ${
                          isEditMode
                            ? "bg-amber-400 text-black border-transparent shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                        title={currentAvatarUrl.startsWith("data:") ? "Adjust active avatar image" : "Requires previously forged avatar"}
                        disabled={!currentAvatarUrl.startsWith("data:")}
                        style={{ opacity: currentAvatarUrl.startsWith("data:") ? 1 : 0.5 }}
                      >
                        <Paintbrush size={14} /> Edit Active
                      </button>
                    </div>
                    {!currentAvatarUrl.startsWith("data:") && isEditMode && (
                      <p className="text-[9px] text-amber-500 font-semibold mt-1">
                        * Forge a Fresh Avatar first to unlock 'Edit Active' parameter.
                      </p>
                    )}
                  </div>
                </div>

                {/* Prompts Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                    <span>Visual Core Prompt</span>
                    <span className="text-[10px] text-zinc-500 font-mono italic">Gemini Image Engine</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how your ultimate combat avatar looks (e.g. A musclebound ninja wearing gold headbands, brutal cyberpunk dojo, anime graphic style)..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none font-sans"
                    disabled={generating}
                  />
                </div>

                {/* Quick suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Dojo Inspirations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CREATIVE_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPrompt(p)}
                        className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg hover:border-amber-500/40 hover:text-white transition-all text-left truncate max-w-[280px]"
                        disabled={generating}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action compartment */}
              <div className="space-y-4 pt-2">
                {generating ? (
                  <div className="space-y-3 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                      <p className="text-xs font-black text-white font-mono tracking-wider">{getLoadingMessage()}</p>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="px-5 py-3 border border-zinc-800 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-black uppercase hover:text-white transition-all"
                    >
                      Hold Off
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-black py-3 px-5 rounded-xl text-xs font-black uppercase shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} className="animate-spin" />
                      {isEditMode ? "Tinker & Modify Visual" : "Synthesize Matrix Profile"}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
                    <ShieldAlert size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
