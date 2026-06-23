import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiApiKey, setGeminiApiKey } from '../config/env';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getGeminiApiKey();
      if (stored) setApiKey(stored);
      else setApiKey("");
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    setGeminiApiKey(apiKey || null);
    setApiKey(getGeminiApiKey());
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black/50">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-900 p-2 rounded-xl text-zinc-400">
                    <Settings size={20} />
                  </div>
                  <h2 className="text-white font-black font-sans uppercase tracking-tight text-xl">System Setup</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white p-2"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Key size={18} className="text-amber-500 mt-1" />
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">Custom API Key</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                        Save your local Gemini API key here. By pasting it, you bypass the .env file and unlock all features like AI Coach and Avatar Forge.
                      </p>
                    </div>
                  </div>

                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g., AIza..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-amber-500 font-mono tracking-widest focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none"
                  />
                  
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-zinc-900/50 p-3 rounded-xl">
                    <Shield size={12} className="text-amber-500/50" />
                    <p>Keys are saved locally to your browser via localStorage. They are sent securely over HTTPS headers.</p>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-[0_4px_20px_0_rgba(245,158,11,0.2)]"
                >
                  {saved ? (
                    <>
                      <CheckCircle size={18} />
                      Saved & Active
                    </>
                  ) : "Save Local Key"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
